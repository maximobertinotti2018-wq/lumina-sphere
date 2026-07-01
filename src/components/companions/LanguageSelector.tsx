'use client';

import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils/cn';

/**
 * ========================================
 * LANGUAGE SELECTOR
 * ========================================
 * Selector de idioma para Header.
 * 
 * Features:
 * - English/Spanish toggle
 * - Smooth animation
 * - Glassmorphism design
 * 
 * @example
 * <LanguageSelector />
 */
export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en' as const, label: 'EN', flag: '🇺🇸' },
    { code: 'es' as const, label: 'ES', flag: '🇦🇷' },
  ];

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
      <Globe className="w-4 h-4 text-white/60" />
      
      <div className="flex gap-1">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-2 py-1 rounded-lg text-sm font-medium transition-all',
              language === lang.code
                ? 'bg-white/20 text-white'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
