'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { Note } from '@/types';

interface NoteSectionProps {
  notes: Note[];
  currentPage: number;
  bookTitle: string;
  onAddNote: (content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onClose: () => void;
}

/**
 * ========================================
 * NOTE SECTION COMPONENT
 * ========================================
 * Sidebar derecha colapsable para notas.
 * 
 * Features:
 * - Add/Edit/Delete notes
 * - Color coding (opcional)
 * - Per-page notes
 * - Glassmorphism premium
 * - Smooth animations
 * 
 * @example
 * <NoteSection
 *   notes={notes}
 *   currentPage={5}
 *   onAddNote={handleAdd}
 * />
 */
export function NoteSection({
  notes,
  currentPage,
  
  onAddNote,
  onDeleteNote,
  onUpdateNote,
  onClose,
}: NoteSectionProps) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote(newNoteContent.trim());
      setNewNoteContent('');
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editContent.trim()) {
      onUpdateNote(editingNoteId, editContent.trim());
      setEditingNoteId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-80 z-40"
    >
      <GlassPanel 
        variant="strong" 
        className="h-full flex flex-col rounded-none border-r-0 border-t-0 border-b-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-white font-semibold text-lg">Notas</h3>
            <p className="text-white/60 text-sm">
              Página {currentPage}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-white/60 text-sm">
                Aún no hay notas en esta página.
                <br />
                ¡Agregá tu primera nota abajo!
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassPanel variant="default" className="p-4">
                  {editingNoteId === note.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={cn(
                          'w-full px-3 py-2 rounded-lg resize-none',
                          'bg-white/5 border border-white/10',
                          'text-white placeholder:text-white/40 text-sm',
                          'focus:bg-white/10 focus:border-white/30',
                          'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                          'transition-all'
                        )}
                        rows={4}
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-sm font-medium"
                        >
                          <Check className="w-4 h-4 inline mr-1" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-all text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <p className="text-white/80 text-sm mb-3 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(note)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            title="Editar nota"
                          >
                            <Edit2 className="w-4 h-4 text-white/60" />
                          </button>
                          <button
                            onClick={() => onDeleteNote(note.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                            title="Eliminar nota"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </GlassPanel>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Note Form */}
        <div className="p-4 border-t border-white/10">
          <div className="space-y-3">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
              placeholder="Agregá una nota... (Ctrl+Enter para guardar)"
              className={cn(
                'w-full px-4 py-3 rounded-xl resize-none',
                'bg-white/5 backdrop-blur-md',
                'border border-white/10',
                'text-white placeholder:text-white/40 text-sm',
                'focus:bg-white/10 focus:border-white/30',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                'transition-all'
              )}
              rows={3}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
              className="w-full"
            >
              <Plus className="w-4 h-4" />
              Agregar nota
            </Button>
          </div>

          <p className="text-white/40 text-xs text-center mt-3">
            Las notas se guardan en la página {currentPage}
          </p>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

