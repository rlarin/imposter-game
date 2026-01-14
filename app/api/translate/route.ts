import { NextRequest, NextResponse } from 'next/server';
import { Locale } from '@/i18n/config';

interface TranslateRequestBody {
  text: string;
  sourceLocale: Locale;
  targetLocale: Locale;
}

interface LibreTranslateResponse {
  translatedText?: string;
  detectedLanguage?: {
    confidence: number;
    language: string;
  };
}

const LOCALE_TO_LANG_CODE: Record<Locale, string> = {
  es: 'es',
  en: 'en',
  de: 'de',
  nl: 'nl',
};

/**
 * Traducir usando LibreTranslate API
 */
async function translateWithLibreTranslate(
  text: string,
  sourceLangCode: string,
  targetLangCode: string
): Promise<string | null> {
  try {
    const response = await fetch('https://api.libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source_language: sourceLangCode,
        target_language: targetLangCode,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(`LibreTranslate status: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as LibreTranslateResponse;
    return data.translatedText || null;
  } catch (error) {
    console.warn('LibreTranslate error:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Traducir usando MyMemory API (fallback)
 */
async function translateWithMyMemory(
  text: string,
  sourceLangCode: string,
  targetLangCode: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLangCode}|${targetLangCode}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return null;
  } catch (error) {
    console.warn('MyMemory error:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Endpoint para traducir texto
 * POST /api/translate
 * Intenta múltiples APIs con fallback automático
 */
export async function POST(request: NextRequest) {
  let body: Partial<TranslateRequestBody> = {};

  try {
    body = (await request.json()) as TranslateRequestBody;
    const { text, sourceLocale, targetLocale } = body;

    // Validar inputs
    if (!text || !text.trim()) {
      return NextResponse.json({ translatedText: '' });
    }

    if (!sourceLocale || !targetLocale) {
      return NextResponse.json({ translatedText: text });
    }

    // Si son el mismo idioma, no traducir
    if (sourceLocale === targetLocale) {
      return NextResponse.json({ translatedText: text });
    }

    const sourceLangCode = LOCALE_TO_LANG_CODE[sourceLocale];
    const targetLangCode = LOCALE_TO_LANG_CODE[targetLocale];

    if (!sourceLangCode || !targetLangCode) {
      console.warn(`Unsupported locale: ${sourceLocale} or ${targetLocale}`);
      return NextResponse.json({ translatedText: text });
    }

    // Intentar LibreTranslate primero
    let translated = await translateWithLibreTranslate(text, sourceLangCode, targetLangCode);

    // Si falla, intentar MyMemory
    if (!translated) {
      console.log('LibreTranslate failed, trying MyMemory...');
      translated = await translateWithMyMemory(text, sourceLangCode, targetLangCode);
    }

    // Si ambas fallan, retornar el original
    if (!translated) {
      console.warn(`Translation failed for: ${text}, using original`);
      return NextResponse.json({ translatedText: text });
    }

    return NextResponse.json({
      translatedText: translated,
    });
  } catch (error) {
    console.error('Translation API error:', error);
    // Fallback: retornar el texto original
    return NextResponse.json({
      translatedText: body.text || '',
    });
  }
}
