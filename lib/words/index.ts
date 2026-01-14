import { esWordCategories } from './es';
import { enWordCategories } from './en';
import { deWordCategories } from './de';
import { nlWordCategories } from './nl';
import { esWordHints } from './es-hints';
import { enWordHints } from './en-hints';
import { deWordHints } from './de-hints';
import { nlWordHints } from './nl-hints';
import { Locale } from '@/i18n/config';
import { WordCategory, WordHintsMap } from '../types';

const wordsByLocale: Record<Locale, WordCategory[]> = {
  es: esWordCategories,
  en: enWordCategories,
  de: deWordCategories,
  nl: nlWordCategories,
};

const hintsByLocale: Record<Locale, WordHintsMap> = {
  es: esWordHints,
  en: enWordHints,
  de: deWordHints,
  nl: nlWordHints,
};

// Category names for "all" category in each locale
const allCategoryNames: Record<Locale, string> = {
  es: 'Todas',
  en: 'All',
  de: 'Alle',
  nl: 'Alle',
};

export function getWordCategories(locale: Locale = 'en'): WordCategory[] {
  const categories = wordsByLocale[locale] || wordsByLocale.en;

  // Add the "all" category at the beginning
  const allCategory: WordCategory = {
    id: 'all',
    name: allCategoryNames[locale] || allCategoryNames.en,
    emoji: '🎲',
    words: [], // Words are selected dynamically from all categories
  };

  return [allCategory, ...categories];
}

export function getRandomWord(locale: Locale, categoryId: string): string | null {
  const categories = wordsByLocale[locale] || wordsByLocale.en;

  // Handle "all" category - pick a random word from any category
  if (categoryId === 'all') {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return randomCategory.words[Math.floor(Math.random() * randomCategory.words.length)];
  }

  const category = categories.find((c) => c.id === categoryId);
  if (!category) return null;
  return category.words[Math.floor(Math.random() * category.words.length)];
}

export function getCategoryById(locale: Locale, categoryId: string): WordCategory | undefined {
  const categories = wordsByLocale[locale] || wordsByLocale.es;
  return categories.find((c) => c.id === categoryId);
}

export function getAllCategoryIds(): string[] {
  return esWordCategories.map((c) => c.id);
}

/**
 * Get a curated hint for the imposter following Three-Filter Rule:
 * 1. Related but not defining
 * 2. Specific in intent but vague in interpretation
 * 3. Never directly reveal the secret word
 *
 * Hints are experiences, emotions, or abstract concepts - NOT synonyms,
 * translations, direct categories, or physical components.
 *
 * Example: For "airport" -> valid hints: "waiting", "stressful", "early morning"
 *          Invalid: "plane", "terminal", "ticket"
 */
export function getHintWord(locale: Locale, categoryId: string, secretWord: string): string | null {
  const hints = hintsByLocale[locale] || hintsByLocale.en;
  const wordKey = secretWord.toLowerCase();

  // Get curated hints for this word
  const wordHints = hints[wordKey];

  if (!wordHints || wordHints.length === 0) {
    // Fallback: try to find hints in English if locale doesn't have them
    const fallbackHints = hintsByLocale.en[wordKey];
    if (fallbackHints && fallbackHints.length > 0) {
      return fallbackHints[Math.floor(Math.random() * fallbackHints.length)];
    }
    return null;
  }

  // Return a random hint from the curated list
  return wordHints[Math.floor(Math.random() * wordHints.length)];
}

// Re-export for backwards compatibility
export { esWordCategories as wordCategories };
