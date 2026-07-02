'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, X, Loader2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { CompanionChat } from './CompanionChat';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils/cn';

interface Character {
  id: number;
  name: string;
  role: string;
  avatar: string;
  color: string;
  isPrimary: boolean;
}

interface CompanionBarProps {
  bookTitle: string;
  bookContext: string;
  characters: Character[];
  open: boolean;
  loading?: boolean;
  onClose: () => void;
}

/**
 * Panel de personajes (controlado por el dock del lector).
 * Se muestra solo cuando `open` es true → nunca se pisa con otros paneles.
 */
export function CompanionBar({
  bookTitle,
  bookContext,
  characters,
  open,
  loading = false,
  onClose,
}: CompanionBarProps) {
  const { t } = useLanguage();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[60] max-lg:inset-x-3 max-lg:top-16 lg:left-20 lg:top-24 lg:w-[min(18rem,calc(100vw-6rem))]"
          >
            <GlassPanel variant="strong" className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {t('companions.title')}
                  </h3>
                  <p className="text-white/40 text-xs truncate">
                    {t('companions.subtitle')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-7 h-7 text-white/40 animate-spin" />
                  <p className="text-white/40 text-xs">Leyendo el libro...</p>
                </div>
              ) : characters.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-8">
                  No se pudieron cargar los personajes.
                </p>
              ) : (
                <div className="space-y-2">
                  {characters.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => { setSelectedCharacter(character); setIsChatOpen(true); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all border bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30 text-left"
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-lg relative shrink-0',
                        character.color
                      )}>
                        {character.avatar}
                        {character.isPrimary && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{character.name}</p>
                        <p className="text-white/40 text-xs truncate">{character.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de chat (independiente del panel) */}
      <AnimatePresence>
        {isChatOpen && selectedCharacter && (
          <CompanionChat
            character={selectedCharacter}
            bookTitle={bookTitle}
            bookContext={bookContext}
            onClose={() => { setIsChatOpen(false); setSelectedCharacter(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
