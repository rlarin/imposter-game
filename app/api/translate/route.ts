import { NextRequest, NextResponse } from 'next/server';
import { Locale } from '@/i18n/config';

interface TranslateRequestBody {
  text: string;
  sourceLocale: Locale;
  targetLocale: Locale;
}

const LOCALE_TO_LANG_CODE: Record<Locale, string> = {
  es: 'es',
  en: 'en',
  de: 'de',
  nl: 'nl',
};

/**
 * Endpoint para traducir texto usando LibreTranslate API
 * POST /api/translate
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TranslateRequestBody;
    const { text, sourceLocale, targetLocale } = body;

    // Validar inputs
    if (!text || !sourceLocale || !targetLocale) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Llamar a LibreTranslate API desde el servidor
    // Esto evita problemas de CORS
    const libretranslateResponse = await fetch('https://api.libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source_language: sourceLangCode,
        target_language: targetLangCode,
      }),
      signal: AbortSignal.timeout(10000), // 10 segundo timeout
    });

    if (!libretranslateResponse.ok) {
      console.warn(
        `LibreTranslate API error: ${libretranslateResponse.status}`,
        await libretranslateResponse.text()
      );
      // Retornar el texto original como fallback
      return NextResponse.json({ translatedText: text });
    }

    const data = (await libretranslateResponse.json()) as {
      translatedText?: string;
    };

    return NextResponse.json({
      translatedText: data.translatedText || text,
    });
  } catch (error) {
    console.error('Translation API error:', error);

    // En caso de error, retornar el texto original
    const body = (await request.json().catch(() => ({}))) as Partial<TranslateRequestBody>;
    return NextResponse.json({
      translatedText: body.text || '',
    });
  }
}
