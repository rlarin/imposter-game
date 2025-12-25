import { esWordCategories } from './es';
import { enWordCategories } from './en';
import { nlWordCategories } from './nl';
import { Locale } from '@/i18n/config';
import { WordCategory } from '../types';

const wordsByLocale: Record<Locale, WordCategory[]> = {
  es: esWordCategories,
  en: enWordCategories,
  nl: nlWordCategories
};

export function getWordCategories(locale: Locale = 'en'): WordCategory[] {
  return wordsByLocale[locale] || wordsByLocale.en;
}

export function getRandomWord(locale: Locale, categoryId: string): string | null {
  const categories = wordsByLocale[locale] || wordsByLocale.en;
  const category = categories.find(c => c.id === categoryId);
  if (!category) return null;
  return category.words[Math.floor(Math.random() * category.words.length)];
}

export function getCategoryById(locale: Locale, categoryId: string): WordCategory | undefined {
  const categories = wordsByLocale[locale] || wordsByLocale.es;
  return categories.find(c => c.id === categoryId);
}

export function getAllCategoryIds(): string[] {
  return esWordCategories.map(c => c.id);
}

// Re-export for backwards compatibility
export { esWordCategories as wordCategories };
