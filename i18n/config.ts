export const locales = ['es', 'en', 'nl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  nl: 'Nederlands'
};

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  nl: '🇳🇱'
};
