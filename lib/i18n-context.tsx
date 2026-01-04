'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, locales } from '@/i18n/config';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoaded: boolean;
}

interface I18nState {
  locale: Locale;
  isLoaded: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Helper to get initial locale (runs only on client)
function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  // Try localStorage first
  const saved = localStorage.getItem('locale') as Locale;
  if (saved && locales.includes(saved)) {
    return saved;
  }

  // Detect from browser
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (locales.includes(browserLang)) {
    localStorage.setItem('locale', browserLang);
    return browserLang;
  }

  return defaultLocale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<I18nState>({
    locale: defaultLocale,
    isLoaded: false,
  });

  // Initialize locale on mount (client-side only) - single setState call
  useEffect(() => {
    setState({
      locale: getInitialLocale(),
      isLoaded: true,
    });
  }, []);

  const setLocale = (newLocale: Locale) => {
    setState((prev) => ({ ...prev, locale: newLocale }));
    localStorage.setItem('locale', newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale: state.locale, setLocale, isLoaded: state.isLoaded }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useLocale must be used within I18nProvider');
  return context;
}
