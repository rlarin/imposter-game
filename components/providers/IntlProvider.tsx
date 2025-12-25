'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useLocale } from '@/lib/i18n-context';
import { ReactNode } from 'react';

import esMessages from '@/i18n/messages/es.json';
import enMessages from '@/i18n/messages/en.json';
import nlMessages from '@/i18n/messages/nl.json';

const messages = {
  es: esMessages,
  en: enMessages,
  nl: nlMessages
};

export function IntlProvider({ children }: { children: ReactNode }) {
  const { locale, isLoaded } = useLocale();

  if (!isLoaded) {
    return null;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
