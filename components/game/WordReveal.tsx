'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui';
import { useLocale } from '@/lib/i18n-context';
import { translateText } from '@/lib/translation-service';
import { Locale } from '@/i18n/config';

interface WordRevealProps {
  secretWord: string | null;
  imposterHint: string | null;
  isImposter: boolean;
  category: string;
}

export default function WordReveal({
  secretWord,
  imposterHint,
  isImposter,
  category,
}: WordRevealProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [countdown, setCountdown] = useState(5);
  const [revealed, setRevealed] = useState(false);
  const [translatedWord, setTranslatedWord] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Efecto para traducir palabra secreta
  useEffect(() => {
    if (!secretWord || isImposter) return;

    const hostLocale: Locale = 'es';

    // Si es el mismo idioma, no traducir ni tocar estado
    if (locale === hostLocale) {
      return;
    }

    // Cancelar solicitud anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    let isMounted = true;

    // Realizar traducción de forma asincrónica
    (async () => {
      try {
        const translated = await translateText(secretWord, locale, hostLocale);
        if (isMounted && !abortControllerRef.current?.signal.aborted) {
          setTranslatedWord(translated);
        }
      } catch (error) {
        // Silently ignore; show original word
      }
    })();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [secretWord, locale, isImposter]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="flex min-h-[calc(100dvh-180px)] flex-col items-center justify-center gap-6 py-4 text-center lg:min-h-[640px] lg:rounded-3xl lg:border lg:border-line lg:bg-surface lg:p-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-bold lg:text-3xl">{t('ui.yourRole')}</h1>
        <p className="text-sm text-muted lg:text-[15px]">{t('ui.keepHidden')}</p>
      </div>

      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-label={revealed ? t('ui.hideRole') : t('ui.revealRole')}
        aria-pressed={revealed}
        className="h-[400px] w-[min(300px,100%)] perspective-distant lg:h-[440px] lg:w-[330px]"
      >
        <div
          className={`relative size-full transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] transform-3d ${
            revealed ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[28px] border border-accent-soft/30 bg-surface-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backface-hidden">
            <div className="flex size-20 items-center justify-center rounded-full bg-accent/18 text-accent-fg">
              <Icon name="eye" className="size-9" />
            </div>
            <span className="font-display text-xl font-semibold">{t('ui.tapToReveal')}</span>
            <span className="text-[13px] text-muted">{t('ui.tapToHide')}</span>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 flex rotate-y-180 flex-col items-center justify-center gap-4 rounded-[28px] border p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backface-hidden ${
              isImposter ? 'border-danger-fg/55 bg-[#2a1220]' : 'border-accent-soft/55 bg-[#22173d]'
            }`}
          >
            {isImposter ? (
              <>
                <div className="flex size-16 items-center justify-center rounded-full bg-danger/18 text-danger-fg">
                  <Icon name="eyeOff" className="size-8" />
                </div>
                <span className="font-display text-3xl font-bold text-danger-fg">
                  {t('game.youAreImposter')}
                </span>
                <span className="flex h-8 items-center rounded-full bg-white/8 px-3 text-[13px] text-fg-soft">
                  {t('game.category')}: {t(`categories.${category}`)}
                </span>
                {imposterHint && (
                  <span className="flex min-h-9 items-center rounded-full border border-hint/35 bg-hint/14 px-4 text-sm font-semibold uppercase text-hint">
                    {t('game.imposterHintLabel')} {imposterHint}
                  </span>
                )}
                <span className="max-w-60 text-[13px] leading-relaxed text-muted">
                  {t('game.imposterTip')}
                </span>
              </>
            ) : (
              <>
                <span className="text-[13px] font-semibold uppercase tracking-wider text-accent-fg">
                  {t('ui.yourSecretWord')}
                </span>
                <span className="break-words font-display text-[40px] font-bold uppercase leading-tight lg:text-5xl">
                  {translatedWord || secretWord}
                </span>
                <span className="flex h-8 items-center rounded-full bg-white/8 px-3 text-[13px] text-fg-soft">
                  {t(`categories.${category}`)}
                </span>
                <span className="max-w-60 text-[13px] leading-relaxed text-muted">
                  {t('game.dontSayIt')}
                </span>
              </>
            )}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-3 rounded-full border border-line bg-white/5 py-2 pl-4 pr-2">
        <span className="text-sm text-muted">{t('game.startsIn')}</span>
        <span className="flex size-9 items-center justify-center rounded-full bg-accent font-mono text-lg font-bold text-white tabular-nums">
          {countdown}
        </span>
      </div>
    </section>
  );
}
