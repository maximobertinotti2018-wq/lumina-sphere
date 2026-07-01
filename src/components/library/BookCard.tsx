'use client';

import { motion } from 'framer-motion';
import { Heart, BookOpen, MoreVertical, Star } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils/cn';
import type { UserBook } from '@/types';

interface BookCardProps {
  book: UserBook;
  layout?: 'grid' | 'list';
  onRead?: (bookId: string) => void;
  onToggleFavorite?: (bookId: string) => void;
  onOptions?: (bookId: string) => void;
  className?: string;
}

/**
 * ========================================
 * BOOK CARD COMPONENT
 * ========================================
 * Tarjeta de libro premium con glassmorphism.
 * 
 * Features:
 * - Hover elegante con elevación
 * - Progress bar animado
 * - Favorite toggle
 * - Reading status badge
 * - Grid/List layouts
 * - Cover image optimization
 * 
 * @example
 * <BookCard 
 *   book={book} 
 *   layout="grid"
 *   onRead={handleRead}
 * />
 */
export function BookCard({
  book,
  layout = 'grid',
  onRead,
  onToggleFavorite,
  onOptions,
  className,
}: BookCardProps) {
  const progress = book.readingProgress || 0;
  const isFavorite = book.userRating && book.userRating >= 4;
  const isPending = (book as any).isPending;

  // Status colors
  const statusColors: Record<string, string> = {
    'want-to-read': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'reading': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'finished': 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  if (layout === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn(className, isPending && "opacity-50 grayscale pointer-events-none")}
      >
        <GlassPanel variant="default" hover className="p-4">
          <div className="flex gap-4">
            {/* Cover */}
            <div 
              className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"
              style={{
                backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!book.coverUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white/40" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate mb-1">
                {book.title}
              </h3>
              <p className="text-white/60 text-sm truncate mb-2">
                {book.author}
              </p>

              {/* Progress */}
              {progress > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Rating */}
              {book.rating && (
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{book.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onToggleFavorite?.(book.id)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Heart
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-white/40'
                  )}
                />
              </button>
              <button
                onClick={() => onOptions?.(book.id)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-white/40" />
              </button>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    );
  }

  // Grid layout
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(className, isPending && "opacity-50 grayscale pointer-events-none")}
    >
      <GlassPanel 
        variant="default" 
        hover 
        className="p-4 h-full cursor-pointer group"
        onClick={() => onRead?.(book.id)}
      >
        {/* Cover Image */}
        <div className="relative mb-4">
          <div 
            className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative"
            style={{
              backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!book.coverUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white/40" />
              </div>
            )}

            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(book.id);
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors',
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-white/80'
                )}
              />
            </button>

            {/* Status badge */}
            {book.readingProgress !== undefined && (
              <div className="absolute bottom-2 left-2 right-2">
                <div className={cn(
                  'text-xs px-2 py-1 rounded-md border backdrop-blur-sm',
                  statusColors[book.status || 'want-to-read']
                )}>
                  {book.status === 'reading' && 'Reading'}
                  {book.status === 'finished' && 'Finished'}
                  {book.status === 'want-to-read' && 'Want to Read'}
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-base line-clamp-2 group-hover:text-purple-400 transition-colors">
            {book.title}
          </h3>
          
          <p className="text-white/60 text-sm line-clamp-1">
            {book.author}
          </p>

          {/* Rating */}
          {book.rating && (
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>{book.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Mood tag */}
          {book.mood && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-md bg-white/10 text-white/60">
                {book.mood.replace('-', ' ')}
              </span>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
