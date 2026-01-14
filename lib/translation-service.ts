import { Locale } from '@/i18n/config';

/**
 * Servicio de traducción usando API route de Next.js como intermediaria
 * Fallback automático si falla la traducción
 */

/**
 * Traduce un texto a un idioma específico
 * @param text - Texto a traducir
 * @param targetLocale - Idioma destino
 * @param sourceLocale - Idioma origen
 * @returns Texto traducido, o el original si falla
 */
export async function translateText(
  text: string,
  targetLocale: Locale,
  sourceLocale: Locale = 'en'
): Promise<string> {
  // Si source y target son iguales, no traducir
  if (sourceLocale === targetLocale) {
    return text;
  }

  // Si texto está vacío, retornar
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    // Llamar a ruta API de Next.js
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLocale,
        targetLocale,
      }),
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`Translation API returned ${response.status}, using fallback`);
      return text;
    }

    const data = (await response.json()) as { translatedText?: string };
    return data.translatedText || text;
  } catch (error) {
    // Log del error pero no bloquear UI
    if (error instanceof Error) {
      console.warn(`Translation service warning: ${error.message}`);
    }
    // Retornar texto original como fallback
    return text;
  }
}

/**
 * Traduce un texto a múltiples idiomas en paralelo
 * @param text - Texto a traducir
 * @param sourceLocale - Idioma origen
 * @param targetLocales - Array de idiomas destino
 * @returns Record con las traducciones (o texto original si falla)
 */
export async function translateToMultiple(
  text: string,
  sourceLocale: Locale,
  targetLocales: Locale[]
): Promise<Record<Locale, string>> {
  const results: Record<string, string> = {};

  // Traducir a todos los idiomas en paralelo
  const promises = targetLocales.map(async (targetLocale) => {
    const translated = await translateText(text, targetLocale, sourceLocale);
    results[targetLocale] = translated;
  });

  try {
    await Promise.all(promises);
  } catch (error) {
    console.warn('Batch translation error, returning originals:', error);
  }

  return results as Record<Locale, string>;
}
