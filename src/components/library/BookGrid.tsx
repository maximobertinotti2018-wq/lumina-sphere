'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Plus, Filter } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { BookCard } from './BookCard';
import { cn } from '@/lib/utils/cn';
import type { UserBook } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

type FilterCategory = 'all' | 'reading' | 'finished' | 'want-to-read' | 'favorites';
type LayoutType = 'grid' | 'list';

interface BookGridProps {
  books: UserBook[];
  userTier?: 'starter' | 'pro' | 'premium';
  isLoading?: boolean;
  onAddBook?: () => void;
  onReadBook?: (bookId: string) => void;
  onToggleFavorite?: (bookId: string) => void;
  className?: string;
}

/**
 * ========================================
 * BOOK GRID COMPONENT
 * ========================================
 * Grid de libros con filtros y sorting.
 * 
 * Features:
 * - Filtros por categoría
 * - Grid/List toggle
 * - Add book button
 * - Loading states
 * - Empty states
 * - Responsive design
 * 
 * @example
 * <BookGrid 
 *   books={books}
 *   userTier="pro"
 *   onAddBook={handleAddBook}
 * />
 */
export function BookGrid({
  books,
  userTier = 'starter',
  isLoading = false,
  onAddBook,
  onReadBook,
  onToggleFavorite,
  className,
}: BookGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [layout, setLayout] = useState<LayoutType>('grid');

  const { t } = useLanguage();

  // Filter books
  const filteredBooks = books.filter((book) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'favorites') return book.userRating && book.userRating >= 4;
    return book.status === activeFilter;
  });

  // Filter categories with counts
  const categories = [
    { 
      key: 'all' as FilterCategory, 
      label: t('library.filters.all'), 
      count: books.length 
    },
    { 
      key: 'reading' as FilterCategory, 
      label: t('library.filters.reading'), 
      count: books.filter(b => b.status === 'reading').length 
    },
    { 
      key: 'want-to-read' as FilterCategory, 
      label: t('library.filters.wantToRead'), 
      count: books.filter(b => b.status === 'want-to-read').length 
    },
    { 
      key: 'finished' as FilterCategory, 
      label: t('library.filters.finished'), 
      count: books.filter(b => b.status === 'finished').length 
    },
    { 
      key: 'favorites' as FilterCategory, 
      label: t('library.filters.favorites'), 
      count: books.filter(b => b.userRating && b.userRating >= 4).length 
    },
  ];

  // Paywall message for starter users
  const showPaywallMessage = userTier === 'starter' && books.length >= 5;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('library.title')}
          </h1>
          <p className="text-white/60">
            {books.length} {t('library.booksCount')}
            {userTier === 'starter' && (
              <span className="text-white/80 ml-2">
                ({t('library.bookLimit')} 5)
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Layout toggle */}
          <GlassPanel variant="default" className="flex p-1 gap-1">
            <button
              onClick={() => setLayout('grid')}
              className={cn(
                'p-2 rounded-lg transition-all',
                layout === 'grid' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/40 hover:text-white'
              )}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={cn(
                'p-2 rounded-lg transition-all',
                layout === 'list' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/40 hover:text-white'
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </GlassPanel>

          {/* Add book button */}
          <Button
            variant="primary"
            onClick={onAddBook}
            disabled={showPaywallMessage}
          >
            <Plus className="w-5 h-5" />
            {t('library.addBook')}
          </Button>
        </div>
      </div>

      {/* Paywall message */}
      {showPaywallMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassPanel variant="strong" className="p-4 border-white/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10">
                <Filter className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {t('library.paywall.title')}
                </p>
                <p className="text-white/60 text-sm">
                  {t('library.paywall.description')}
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={onAddBook}>
                {t('library.paywall.upgradeNow')}
              </Button>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <motion.button
            key={category.key}
            onClick={() => setActiveFilter(category.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-4 py-2 rounded-xl transition-all',
              'backdrop-blur-md border',
              activeFilter === category.key
                ? 'bg-white/20 border-white/30 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            )}
          >
            <span className="font-medium">{category.label}</span>
            {category.count > 0 && (
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                activeFilter === category.key
                  ? 'bg-white/20'
                  : 'bg-white/10'
              )}>
                {category.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Spinner className="w-12 h-12" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredBooks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-20"
        >
          <GlassPanel variant="default" className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <Filter className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {t('library.empty.title')}
              </h3>
              <p className="text-white/60">
                {activeFilter === 'all' 
                  ? t('library.empty.description')
                  : `No books in "${categories.find(c => c.key === activeFilter)?.label}" category.`
                }
              </p>
              {activeFilter === 'all' && (
                <Button
                  variant="primary"
                  onClick={onAddBook}
                  className="mt-4"
                >
                  <Plus className="w-5 h-5" />
                  {t('library.empty.addFirst')}
                </Button>
              )}
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* Books Grid/List */}
      {!isLoading && filteredBooks.length > 0 && (
        <motion.div
          layout
          className={cn(
            'gap-6',
            layout === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  layout: { duration: 0.3 }
                }}
              >
                <BookCard
                  book={book}
                  layout={layout}
                  onRead={onReadBook}
                  onToggleFavorite={onToggleFavorite}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
