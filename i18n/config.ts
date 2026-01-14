export const locales = ['es', 'en', 'de', 'nl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
  nl: 'Nederlands',
};

// Using country codes as fallback for better cross-browser compatibility
export const localeFlags: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
  de: 'DE',
  nl: 'NL',
};
