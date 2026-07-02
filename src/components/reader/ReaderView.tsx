'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReaderControls } from './ReaderControls';
import { NoteSection } from './NoteSection';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';
import { getNotesForBook, createNote, updateNote, deleteNote } from '@/lib/actions/noteActions';
import type { Book, Note } from '@/types';

interface ReaderViewProps {
  book: Book;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
}

/**
 * ========================================
 * READER VIEW COMPONENT
 * ========================================
 * Componente principal del lector inmersivo.
 * 
 * Features:
 * - PDF/EPUB rendering
 * - Page navigation
 * - Zoom controls
 * - Focus mode
 * - Notes sidebar
 * - Progress tracking
 * 
 * @example
 * <ReaderView 
 *   book={book}
 *   initialPage={5}
 *   onPageChange={handlePageChange}
 * />
 */
export function ReaderView({
  book,
  initialPage = 1,
  onPageChange,
  onClose,
}: ReaderViewProps) {
  // State
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(book.pageCount || 100);
  const [zoom, setZoom] = useState(100);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);

  // Refs
  const viewerRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mock PDF URL (en producción, esto vendría del book)
  const pdfUrl = book.coverUrl || '/sample.pdf';

  // Texto completo extraído al subir el libro (EPUB/PDF).
  const fullText = (book as any).fullText as string | undefined;

  // Paginamos el texto en bloques de ~320 palabras por página.
  const pages = useMemo(() => {
    if (!fullText || !fullText.trim()) return [] as string[];
    const words = fullText.replace(/\s+/g, ' ').trim().split(' ');
    const WORDS_PER_PAGE = 320;
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
      chunks.push(words.slice(i, i + WORDS_PER_PAGE).join(' '));
    }
    return chunks;
  }, [fullText]);

  // Si hay texto, configuramos el total de páginas y quitamos el loading.
  useEffect(() => {
    if (pages.length > 0) {
      setTotalPages(pages.length);
      setIsLoading(false);
      // Si la página guardada quedó fuera de rango (el libro se re-paginó),
      // la ajustamos para no mostrar una página vacía.
      setCurrentPage((page) => Math.min(page, pages.length));
    }
  }, [pages.length]);

  // Cargar las notas guardadas del libro al montar.
  useEffect(() => {
    let cancelled = false;
    getNotesForBook(book.id)
      .then((res) => {
        if (!cancelled && res.success && res.data) {
          setNotes(res.data as unknown as Note[]);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [book.id]);

  // Handle PDF load
  const handlePdfLoad = () => {
    setIsLoading(false);
    // TODO: Get actual page count from PDF
    setTotalPages(book.pageCount || 100);
  };

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    const clampedPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(clampedPage);
    onPageChange?.(clampedPage);

    // Navigate PDF
    if (viewerRef.current) {
      // TODO: Implement actual PDF page navigation
      // This depends on the PDF viewer library used
    }
  };

  // Handle zoom
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(50, Math.min(200, newZoom));
    setZoom(clampedZoom);

    // Apply zoom to viewer
    if (viewerRef.current) {
      viewerRef.current.style.transform = `scale(${clampedZoom / 100})`;
      viewerRef.current.style.transformOrigin = 'top center';
    }
  };

  // Toggle focus mode
  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!isFocusMode) {
      setIsNotesOpen(false); // Close notes in focus mode
    }
  };

  const { data: session } = useSession();

  // Notas: optimistas en la UI, persistidas vía server actions.
  const handleAddNote = async (content: string) => {
    const tempId = `temp-${Date.now()}`;
    const optimistic: Note = {
      id: tempId,
      userId: session?.user?.id || 'unknown',
      bookId: book.id,
      content,
      color: '#8b5cf6',
      pageNumber: currentPage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [...prev, optimistic]);

    const res = await createNote(book.id, content, currentPage);
    if (res.success && res.data) {
      const saved = res.data as unknown as Note;
      setNotes((prev) => prev.map((n) => (n.id === tempId ? saved : n)));
    } else {
      // Falló el guardado: sacamos la nota optimista para no mentir.
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const previous = notes;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    const res = await deleteNote(noteId);
    if (!res.success) setNotes(previous);
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    const previous = notes;
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, content, updatedAt: new Date() } : n))
    );
    const res = await updateNote(noteId, content);
    if (!res.success) setNotes(previous);
  };

  // Get notes for current page
  const currentPageNotes = notes.filter(n => n.pageNumber === currentPage);

  // Al cambiar de página, volvemos el scroll arriba.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentPage]);

  // Swipe horizontal para pasar página en touch. Solo dispara si el gesto
  // es claramente horizontal (no interfiere con el scroll vertical).
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    const t = e.changedTouches[0];
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) {
      handlePageChange(dx < 0 ? currentPage + 1 : currentPage - 1);
    }
  };

  // Navegación con las flechas del teclado (← →) y ESC para salir de focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') handlePageChange(currentPage + 1);
      else if (e.key === 'ArrowLeft') handlePageChange(currentPage - 1);
      else if (e.key === 'Escape' && isFocusMode) toggleFocusMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentPage, totalPages, isFocusMode]);

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50"
          >
            <FullPageSpinner />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex h-full">
        {/* PDF Viewer */}
        <div 
          className={cn(
            'flex-1 flex items-center justify-center overflow-auto',
            'transition-all duration-300',
            isNotesOpen && !isFocusMode ? 'mr-80' : 'mr-0'
          )}
        >
          <div className="relative w-full h-full">
            {pages.length > 0 ? (
              /* Lector de texto (EPUB/PDF ya extraído a texto) */
              <div
                ref={contentRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-full h-full overflow-y-auto bg-gradient-to-b from-[#1c1828] via-[#161320] to-[#0e0c14]"
              >
                <article
                  className="mx-auto max-w-[700px] w-full px-6 sm:px-8 pt-16 lg:pt-14 pb-40 text-white/[0.88] font-serif text-left sm:text-justify selection:bg-purple-500/40"
                  style={{
                    fontSize: `${(zoom / 100) * 1.05}rem`,
                    lineHeight: 1.75,
                    letterSpacing: '0.01em',
                  }}
                >
                  {pages[currentPage - 1] || ''}
                </article>
              </div>
            ) : (
              /* Fallback: archivo real servible (PDF) */
              <iframe
                ref={viewerRef}
                src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}`}
                className="w-full h-full border-0"
                onLoad={handlePdfLoad}
                title={book.title}
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.3s ease',
                }}
              />
            )}

            {/* Alternative: react-pdf implementation
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => {
                setTotalPages(numPages);
                setIsLoading(false);
              }}
            >
              <Page 
                pageNumber={currentPage}
                scale={zoom / 100}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
            */}
          </div>
        </div>

        {/* Notes Sidebar */}
        <AnimatePresence>
          {isNotesOpen && !isFocusMode && (
            <NoteSection
              notes={currentPageNotes}
              currentPage={currentPage}
              bookTitle={book.title}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onUpdateNote={handleUpdateNote}
              onClose={() => setIsNotesOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Reader Controls */}
      <AnimatePresence>
        {!isFocusMode && (
          <ReaderControls
            currentPage={currentPage}
            totalPages={totalPages}
            zoom={zoom}
            isFocusMode={isFocusMode}
            isNotesOpen={isNotesOpen}
            bookTitle={book.title}
            onPageChange={handlePageChange}
            onZoomChange={handleZoomChange}
            onToggleFocus={toggleFocusMode}
            onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
            onClose={onClose}
          />
        )}
      </AnimatePresence>

      {/* Focus Mode Hint */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
          >
            <button
              onClick={toggleFocusMode}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/60 text-sm hover:bg-white/20 transition-all"
            >
              Press ESC or click to exit Focus Mode
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts */}
      <div className="fixed bottom-0 left-0 opacity-0">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') handlePageChange(currentPage - 1);
            if (e.key === 'ArrowRight') handlePageChange(currentPage + 1);
            if (e.key === 'Escape') toggleFocusMode();
          }}
        />
      </div>
    </div>
  );
}
