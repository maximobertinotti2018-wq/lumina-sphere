'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Book, UserBook } from '@/types';
import { STARTER_BOOK_LIMIT } from '@/lib/constants';

/**
 * ========================================
 * BOOK ACTIONS
 * ========================================
 * Server actions para manejar libros con Prisma.
 *
 * SEGURIDAD: el userId y el tier SIEMPRE salen de la sesión del servidor
 * (auth()), nunca de argumentos del cliente. Así un usuario no puede operar
 * sobre la biblioteca de otro ni saltarse el paywall pasando userTier='premium'.
 */

// ==========================================
// TYPES
// ==========================================

interface AddBookInput {
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  mood: string;
  isbn?: string;
}

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  requiresUpgrade?: boolean;
}

type SessionUser = { id: string; tier: string };

// ==========================================
// HELPERS
// ==========================================

/** Devuelve el usuario autenticado o null. Única fuente de verdad de identidad. */
async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    tier: (session.user as { subscriptionTier?: string }).subscriptionTier || 'starter',
  };
}

/** ¿Puede el usuario agregar más libros según su tier? */
async function canAddBook(userId: string, userTier: string): Promise<boolean> {
  if (userTier === 'pro' || userTier === 'premium') return true;
  const bookCount = await prisma.userBook.count({ where: { userId } });
  return bookCount < STARTER_BOOK_LIMIT;
}

// ==========================================
// ACTIONS
// ==========================================

/** Agrega un libro nuevo (manual) a la biblioteca del usuario autenticado. */
export async function addBook(input: AddBookInput): Promise<ActionResult<Book>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    if (!input.title?.trim()) return { success: false, error: 'Title is required' };
    if (!input.author?.trim()) return { success: false, error: 'Author is required' };

    const canAdd = await canAddBook(user.id, user.tier);
    if (!canAdd) {
      const count = await prisma.userBook.count({ where: { userId: user.id } });
      return {
        success: false,
        error: `You've reached your ${count}-book limit. Upgrade to Pro for unlimited books.`,
        requiresUpgrade: true,
      };
    }

    const book = await prisma.book.create({
      data: {
        title: input.title.trim(),
        author: input.author.trim(),
        coverUrl: input.coverUrl?.trim() || null,
        description: input.description?.trim() || null,
        mood: input.mood,
        isbn: input.isbn?.trim() || null,
        source: 'manual',
        language: 'en',
      },
    });

    await prisma.userBook.create({
      data: {
        userId: user.id,
        bookId: book.id,
        status: 'want-to-read',
        readingProgress: 0,
        currentPage: 0,
        currentChapter: 0,
      },
    });

    revalidatePath('/library');
    return { success: true, data: book as unknown as Book };
  } catch (error) {
    console.error('Error adding book:', error);
    return { success: false, error: 'Failed to add book. Please try again.' };
  }
}

/** Lista los libros del usuario autenticado, con filtro opcional por estado. */
export async function getUserBooks(
  filter?: 'all' | 'reading' | 'finished' | 'want-to-read'
): Promise<ActionResult<UserBook[]>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const where: { userId: string; status?: string } = { userId: user.id };
    if (filter && filter !== 'all') where.status = filter;

    const userBooks = await prisma.userBook.findMany({
      where,
      include: { book: true },
      orderBy: { updatedAt: 'desc' },
    });

    const books: UserBook[] = userBooks.map((ub) => ({
      ...ub.book,
      userId: ub.userId,
      status: ub.status as 'want-to-read' | 'reading' | 'finished',
      readingProgress: ub.readingProgress,
      currentPage: ub.currentPage,
      currentChapter: ub.currentChapter,
      userRating: ub.userRating || undefined,
      isFavorite: ub.isFavorite,
      fontSize: ub.fontSize,
      fontFamily: ub.fontFamily as 'serif' | 'sans-serif',
      theme: ub.theme as 'light' | 'dark' | 'sepia',
      startedAt: ub.startedAt || undefined,
      finishedAt: ub.finishedAt || undefined,
      genres: ub.book.genres ? JSON.parse(ub.book.genres) : undefined,
      subjects: ub.book.subjects ? JSON.parse(ub.book.subjects) : undefined,
    })) as UserBook[];

    return { success: true, data: books };
  } catch (error) {
    console.error('Error fetching books:', error);
    return { success: false, error: 'Failed to fetch books' };
  }
}

/** Marca/desmarca un libro como favorito (solo del usuario autenticado). */
export async function toggleFavorite(bookId: string): Promise<ActionResult<boolean>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const userBook = await prisma.userBook.findUnique({
      where: { userId_bookId: { userId: user.id, bookId } },
    });
    if (!userBook) return { success: false, error: 'Book not found in your library' };

    await prisma.userBook.update({
      where: { userId_bookId: { userId: user.id, bookId } },
      data: { isFavorite: !userBook.isFavorite },
    });

    revalidatePath('/library');
    return { success: true, data: !userBook.isFavorite };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, error: 'Failed to update favorite status' };
  }
}

/** Actualiza el progreso de lectura del usuario autenticado. */
export async function updateProgress(
  bookId: string,
  progress: number,
  currentPage: number
): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const clampedProgress = Math.max(0, Math.min(100, progress));

    await prisma.userBook.update({
      where: { userId_bookId: { userId: user.id, bookId } },
      data: {
        readingProgress: clampedProgress,
        currentPage,
        status: clampedProgress === 100 ? 'finished' : 'reading',
        finishedAt: clampedProgress === 100 ? new Date() : null,
      },
    });

    revalidatePath('/library');
    revalidatePath(`/reader/${bookId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}

/** Quita un libro de la biblioteca del usuario; borra el Book si nadie más lo tiene. */
export async function deleteBook(bookId: string): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    await prisma.userBook.delete({
      where: { userId_bookId: { userId: user.id, bookId } },
    });

    const otherUsers = await prisma.userBook.count({ where: { bookId } });
    if (otherUsers === 0) {
      await prisma.book.delete({ where: { id: bookId } });
    }

    revalidatePath('/library');
    return { success: true };
  } catch (error) {
    console.error('Error deleting book:', error);
    return { success: false, error: 'Failed to delete book' };
  }
}

/** Estadísticas de lectura del usuario autenticado. */
export async function getUserStats(): Promise<ActionResult<{
  totalBooks: number;
  booksRead: number;
  currentlyReading: number;
  canAddMore: boolean;
  remainingBooks?: number;
}>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const [totalBooks, booksRead, currentlyReading] = await Promise.all([
      prisma.userBook.count({ where: { userId: user.id } }),
      prisma.userBook.count({ where: { userId: user.id, status: 'finished' } }),
      prisma.userBook.count({ where: { userId: user.id, status: 'reading' } }),
    ]);

    const unlimited = user.tier === 'pro' || user.tier === 'premium';
    const canAddMore = unlimited || totalBooks < STARTER_BOOK_LIMIT;
    const remainingBooks = unlimited
      ? undefined
      : Math.max(0, STARTER_BOOK_LIMIT - totalBooks);

    return {
      success: true,
      data: { totalBooks, booksRead, currentlyReading, canAddMore, remainingBooks },
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, error: 'Failed to fetch stats' };
  }
}

/** Devuelve un libro por id (requiere sesión). */
export async function getBookById(bookId: string): Promise<ActionResult<Book>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return { success: false, error: 'Not found' };
    return { success: true, data: book as unknown as Book };
  } catch (e) {
    return { success: false, error: 'Not found' };
  }
}
