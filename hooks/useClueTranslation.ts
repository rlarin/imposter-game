'use client';

import { useEffect, useState } from 'react';
import { Clue } from '@/lib/types';
import { Locale } from '@/i18n/config';
import { translateText } from '@/lib/translation-service';

/**
 * Hook que obtiene la traducción de una pista al idioma especificado
 * Usa el caché de la clue si está disponible, sino hace una traducción dinámica
 */
export function useClueTranslation(clue: Clue, targetLocale: Locale) {
  const [translatedWord, setTranslatedWord] = useState<string>(clue.word);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Si el idioma es el mismo, usar la palabra original
    if (clue.originalLocale === targetLocale) {
      setTranslatedWord(clue.word);
      return;
    }

    // Si ya hay una traducción en caché, usarla
    if (clue.translations?.[targetLocale]) {
      setTranslatedWord(clue.translations[targetLocale]);
      return;
    }

    // Si no hay caché, traducir en tiempo real (sin esperar, mostrar original primero)
    setIsLoading(true);
    translateText(clue.word, targetLocale, clue.originalLocale)
      .then((translated) => {
        setTranslatedWord(translated);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clue, targetLocale]);

  return { translatedWord, isLoading };
}
