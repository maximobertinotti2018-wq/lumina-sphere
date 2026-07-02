'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils/cn';

interface Character {
  id: number;
  name: string;
  role: string;
  avatar: string;
  color: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CompanionChatProps {
  character: Character;
  bookTitle: string;
  bookContext: string;
  onClose: () => void;
}

/**
 * ========================================
 * COMPANION CHAT COMPONENT
 * ========================================
 * Modal de chat con personaje del libro.
 * 
 * Features:
 * - Real-time chat with AI
 * - Character roleplay
 * - Conversation history
 * - Typing indicators
 * - Glassmorphism design
 * 
 * @example
 * <CompanionChat
 *   character={character}
 *   bookTitle="Neuromancer"
 *   bookContext="..."
 *   onClose={handleClose}
 * />
 */
export function CompanionChat({
  character,
  bookTitle,
  bookContext,
  onClose,
}: CompanionChatProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `¡Hola! Soy ${character.name}. ¿Qué te gustaría saber sobre "${bookTitle}"?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: character.name,
          characterRole: character.role,
          bookTitle,
          bookContext,
          userMessage: input.trim(),
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Estoy teniendo problemas para responder ahora mismo. Intentá de nuevo.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
      />

      {/* Chat Modal — el centrado va en un wrapper flex, NO en el motion.div:
          framer-motion pisa el transform de Tailwind (-translate-x-1/2) y el
          modal quedaba corrido fuera de la pantalla en mobile. */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="pointer-events-auto w-full max-w-md max-h-[75vh] flex flex-col"
      >
        <GlassPanel variant="strong" className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                character.color
              )}>
                {character.avatar}
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">
                  {character.name}
                </h2>
                <p className="text-white/60 text-sm">
                  {character.role} • {bookTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar chat"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-purple-500/20 border border-purple-500/30 text-white'
                      : 'bg-white/10 border border-white/20 text-white/90'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                    <p className="text-sm text-white/60">
                      {t('companions.thinking')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('companions.placeholder')}
                rows={2}
                disabled={isLoading}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl resize-none',
                  'bg-white/5 border border-white/10',
                  'text-white placeholder:text-white/40 text-sm',
                  'focus:bg-white/10 focus:border-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                  'transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                loading={isLoading}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-white/40 text-xs mt-2">
              Enter para enviar, Shift+Enter para salto de línea
            </p>
          </div>
        </GlassPanel>
      </motion.div>
      </div>
    </>
  );
}
