'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useLocale } from '@/lib/i18n-context';
import { ReactNode, useEffect } from 'react';

import esMessages from '@/i18n/messages/es.json';
import enMessages from '@/i18n/messages/en.json';
import deMessages from '@/i18n/messages/de.json';
import nlMessages from '@/i18n/messages/nl.json';

const messages = {
  es: esMessages,
  en: enMessages,
  de: deMessages,
  nl: nlMessages,
};

export function IntlProvider({ children }: { children: ReactNode }) {
  const { locale, isLoaded } = useLocale();

  // Content is always rendered (default locale on the server) so the HTML is crawlable.
  // Once the user's locale is applied, reveal the page (see the inline script in app/layout.tsx).
  useEffect(() => {
    if (!isLoaded) return;
    document.documentElement.lang = locale;
    document.documentElement.removeAttribute('data-locale-pending');
  }, [isLoaded, locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}
