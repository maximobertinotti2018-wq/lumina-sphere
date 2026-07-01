'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionaries } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/getDictionary';

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Locale>('en');

  // Load from localStorage/cookie on mount
  useEffect(() => {
    // Try to get from cookie first
    const cookieMatch = document.cookie.match(/(?:^|; )lumina-locale=([^;]*)/);
    const saved = cookieMatch ? cookieMatch[1] as Locale : null;
    
    if (saved && (saved === 'en' || saved === 'es')) {
      setLanguageState(saved);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'es') {
        setLanguageState('es');
      }
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    localStorage.setItem('lumina-language', lang);
    document.cookie = `lumina-locale=${lang}; path=/; max-age=31536000`; // 1 year
    
    // update html lang attribute
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = dictionaries[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key} in ${language}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
