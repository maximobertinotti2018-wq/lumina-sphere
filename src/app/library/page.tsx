'use client';

import { useState, useEffect, useOptimistic, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookGrid } from '@/components/library/BookGrid';
import { AddBookModal, type AddBookData } from '@/components/library/AddBookModal';
import { UpgradeModal } from '@/components/library/UpgradeModal';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useSession } from 'next-auth/react';
import { STARTER_BOOK_LIMIT } from '@/lib/constants';
import { addBook, getUserBooks, toggleFavorite } from '@/lib/actions/bookActions';
import type { UserBook } from '@/types';

export default function LibraryPage() {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const userTier = (session?.user as any)?.subscriptionTier || 'starter';

  const [optimisticBooks, addOptimisticBook] = useOptimistic<UserBook[], UserBook>(
    books,
    (state, newBook) => [newBook, ...state]
  );

  useEffect(() => {
    if (userId) {
      fetchBooks();
    }
  }, [userId]);

  const fetchBooks = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const result = await getUserBooks();
      if (result.success && result.data) {
        setBooks(result.data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBookClick = () => {
    if (userTier === 'starter' && books.length >= STARTER_BOOK_LIMIT) {
      setIsUpgradeModalOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleAddBook = async (bookData: AddBookData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticBook: UserBook = {
      id: tempId,
      userId: userId as string,
      title: bookData.title,
      author: bookData.author,
      coverUrl: bookData.coverUrl || undefined,
      description: bookData.description || undefined,
      mood: bookData.mood,
      isbn: bookData.isbn || undefined,
      source: 'manual',
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'want-to-read',
      readingProgress: 0,
      currentPage: 0,
      currentChapter: 0,
      isFavorite: false,
      fontSize: 18,
      fontFamily: 'serif',
      theme: 'dark',
      // @ts-ignore custom property for UI
      isPending: true,
    };

    startTransition(() => {
      addOptimisticBook(optimisticBook);
    });

    const result = await addBook(bookData);

    if (result.success) {
      await fetchBooks();
      return;
    }

    if (result.requiresUpgrade) {
      setIsAddModalOpen(false);
      setIsUpgradeModalOpen(true);
      return;
    }

    throw new Error(result.error || 'Failed to add book');
  };
  
  const handleUploadStart = (title: string, author: string, mood: string) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticBook: UserBook = {
      id: tempId,
      userId: userId as string,
      title: title || 'Uploading...',
      author: author || 'Unknown',
      coverUrl: undefined,
      description: undefined,
      mood: mood as any,
      isbn: undefined,
      source: 'upload' as any,
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'want-to-read',
      readingProgress: 0,
      currentPage: 0,
      currentChapter: 0,
      isFavorite: false,
      fontSize: 18,
      fontFamily: 'serif',
      theme: 'dark',
      // @ts-ignore custom property for UI
      isPending: true,
    };

    startTransition(() => {
      addOptimisticBook(optimisticBook);
    });
  };

  const handleUpgrade = (_tier: 'pro' | 'premium') => {
    setIsUpgradeModalOpen(false);
    setIsAddModalOpen(true);
  };

  const handleReadBook = (bookId: string) => {
    router.push(`/reader/${bookId}`);
  };

  const handleToggleFavorite = async (bookId: string) => {
    const result = await toggleFavorite(bookId);
    if (result.success) {
      setBooks(books.map(book => 
        book.id === bookId 
          ? { ...book, isFavorite: result.data as boolean }
          : book
      ));
    }
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <MainLayout
      mood="classic"
      onUpgrade={() => setIsUpgradeModalOpen(true)}
    >
      <div className="max-w-7xl mx-auto">
        <BookGrid
          books={optimisticBooks}
          userTier={userTier}
          isLoading={isLoading}
          onAddBook={handleAddBookClick}
          onReadBook={handleReadBook}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBook={handleAddBook}
        onUploadStart={handleUploadStart}
        onUploadSuccess={fetchBooks}
        userTier={userTier}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleUpgrade}
        currentBooks={books.length}
        maxBooks={STARTER_BOOK_LIMIT}
      />
    </MainLayout>
  );
}
