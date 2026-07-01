'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  StickyNote,
  X,
  BookOpen,
  Minus,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';

import { cn } from '@/lib/utils/cn';

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  isFocusMode: boolean;
  isNotesOpen: boolean;
  bookTitle: string;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onToggleFocus: () => void;
  onToggleNotes: () => void;
  onClose?: () => void;
}

/**
 * ========================================
 * READER CONTROLS COMPONENT
 * ========================================
 * Barra flotante de controles Apple-style.
 * 
 * Features:
 * - Page navigation
 * - Zoom controls
 * - Focus mode toggle
 * - Notes toggle
 * - Progress bar
 * - Glassmorphism premium
 * 
 * @example
 * <ReaderControls
 *   currentPage={5}
 *   totalPages={100}
 *   zoom={100}
 *   onPageChange={setPage}
 * />
 */
export function ReaderControls({
  currentPage,
  totalPages,
  zoom,
  isFocusMode,
  isNotesOpen,
  bookTitle,
  onPageChange,
  onZoomChange,
  onToggleFocus,
  onToggleNotes,
  onClose,
}: ReaderControlsProps) {
  const [collapsed, setCollapsed] = useState(false);
  const progress = (currentPage / totalPages) * 100;

  const handlePageInput = (value: string) => {
    const page = parseInt(value, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center pointer-events-none">
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="pointer-events-auto w-auto max-w-[calc(100vw-1.5rem)] touch-none"
    >
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-purple-600/30 backdrop-blur-md border border-white/20 text-white shadow-2xl hover:bg-purple-600/40 transition-all"
          title="Mostrar controles"
          aria-label="Mostrar controles"
        >
          <BookOpen className="w-5 h-5 text-purple-300" />
        </button>
      ) : (
      <GlassPanel variant="strong" className="px-2.5 py-2">
        <div className="flex items-center justify-center gap-1.5">
          {/* Book Info */}
          <div className="hidden lg:flex items-center gap-2 border-r border-white/10 pr-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div className="max-w-[120px]">
              <p className="text-white text-sm font-semibold truncate">
                {bookTitle}
              </p>
              <p className="text-white/40 text-xs">
                {currentPage} of {totalPages} pages
              </p>
            </div>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            {/* Previous page */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                'hover:bg-white/10',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            {/* Page input */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => handlePageInput(e.target.value)}
                className={cn(
                  'w-11 px-1.5 py-0.5 text-center rounded-lg',
                  'bg-white/10 border border-white/20',
                  'text-white text-xs font-medium',
                  'focus:bg-white/20 focus:border-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                  'transition-all'
                )}
              />
              <span className="text-white/40 text-xs">/ {totalPages}</span>
            </div>

            {/* Next page */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                'hover:bg-white/10',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-2.5">
            <button
              onClick={() => onZoomChange(zoom - 10)}
              disabled={zoom <= 50}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                'hover:bg-white/10',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <ZoomOut className="w-4 h-4 text-white" />
            </button>

            <span className="text-white text-xs font-medium w-9 text-center">
              {zoom}%
            </span>

            <button
              onClick={() => onZoomChange(zoom + 10)}
              disabled={zoom >= 200}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                'hover:bg-white/10',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Mode Toggles */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-2.5">
            {/* Focus Mode */}
            <button
              onClick={onToggleFocus}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                isFocusMode 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
              title="Focus Mode (ESC)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Notes Toggle */}
            <button
              onClick={onToggleNotes}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                isNotesOpen 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
              title="Toggle Notes"
            >
              <StickyNote className="w-4 h-4" />
            </button>
          </div>

          {/* Minimize */}
          <button
            onClick={() => setCollapsed(true)}
            title="Minimizar barra"
            aria-label="Minimizar barra"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all border-l border-white/10 pl-2.5"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all border-l border-white/10 pl-2.5"
              title="Close Reader"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </GlassPanel>
      )}
    </motion.div>
    </div>
  );
}

