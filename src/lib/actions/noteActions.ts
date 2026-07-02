'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * ========================================
 * NOTE ACTIONS
 * ========================================
 * Persistencia de notas del lector. Antes las notas vivían solo en el
 * estado de React y se perdían al cerrar el libro.
 *
 * Seguridad: el userId sale SIEMPRE de la sesión; borrar/editar exigen
 * que la nota pertenezca al usuario autenticado.
 */

interface NoteDTO {
  id: string;
  userId: string;
  bookId: string;
  content: string;
  color: string;
  pageNumber: number;
  chapter: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesResult {
  success: boolean;
  data?: NoteDTO[];
  error?: string;
}

interface NoteResult {
  success: boolean;
  data?: NoteDTO;
  error?: string;
}

/** Todas las notas del usuario para un libro. */
export async function getNotesForBook(bookId: string): Promise<NotesResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const notes = await prisma.note.findMany({
      where: { userId: session.user.id, bookId },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: notes };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return { success: false, error: 'No se pudieron cargar las notas' };
  }
}

/** Crea una nota en la página indicada. */
export async function createNote(
  bookId: string,
  content: string,
  pageNumber: number
): Promise<NoteResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const trimmed = content.trim();
  if (!trimmed) return { success: false, error: 'La nota está vacía' };
  if (trimmed.length > 2000) return { success: false, error: 'La nota es demasiado larga (máx. 2000 caracteres)' };

  try {
    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        bookId,
        content: trimmed,
        pageNumber: Math.max(1, Math.floor(pageNumber)),
      },
    });
    return { success: true, data: note };
  } catch (error) {
    console.error('Error creating note:', error);
    return { success: false, error: 'No se pudo guardar la nota' };
  }
}

/** Edita el contenido de una nota propia. */
export async function updateNote(noteId: string, content: string): Promise<NoteResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const trimmed = content.trim();
  if (!trimmed) return { success: false, error: 'La nota está vacía' };

  try {
    // updateMany con userId en el where evita editar notas ajenas.
    const result = await prisma.note.updateMany({
      where: { id: noteId, userId: session.user.id },
      data: { content: trimmed },
    });
    if (result.count === 0) return { success: false, error: 'Nota no encontrada' };
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    return { success: true, data: note ?? undefined };
  } catch (error) {
    console.error('Error updating note:', error);
    return { success: false, error: 'No se pudo actualizar la nota' };
  }
}

/** Borra una nota propia. */
export async function deleteNote(noteId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const result = await prisma.note.deleteMany({
      where: { id: noteId, userId: session.user.id },
    });
    if (result.count === 0) return { success: false, error: 'Nota no encontrada' };
    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, error: 'No se pudo borrar la nota' };
  }
}
