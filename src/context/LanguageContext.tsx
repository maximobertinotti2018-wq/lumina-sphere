'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  // La cookie `lumina-locale` es la ÚNICA fuente de verdad: la leen las
  // páginas server (serverT) y este contexto. Si no existe, detectamos el
  // idioma del navegador y ESCRIBIMOS la cookie, para que server y cliente
  // nunca queden desincronizados (antes la home salía en inglés y la
  // biblioteca en español en la misma sesión).
  useEffect(() => {
    const cookieMatch = document.cookie.match(/(?:^|; )lumina-locale=([^;]*)/);
    const saved = cookieMatch ? (cookieMatch[1] as Locale) : null;

    if (saved && (saved === 'en' || saved === 'es')) {
      setLanguageState(saved);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const detected: Locale = browserLang === 'es' ? 'es' : 'en';
      setLanguageState(detected);
      document.cookie = `lumina-locale=${detected}; path=/; max-age=31536000`;
      document.documentElement.lang = detected;
      // Re-renderizar los server components con el idioma detectado.
      if (detected !== 'en') router.refresh();
    }
  }, [router]);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    document.cookie = `lumina-locale=${lang}; path=/; max-age=31536000`; // 1 año
    document.documentElement.lang = lang;
    // Sin esto, las páginas server (Discover, Home) quedaban en el idioma viejo.
    router.refresh();
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
