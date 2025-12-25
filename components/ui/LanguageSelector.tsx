'use client';

import { useLocale } from '@/lib/i18n-context';
import { locales, localeNames, localeFlags, Locale } from '@/i18n/config';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { locale, setLocale } = useLocale();

  if (variant === 'compact') {
    return (
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className={`bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white cursor-pointer hover:bg-white/20 transition-colors ${className}`}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="text-gray-900 bg-white">
            {localeFlags[loc]} {loc.toUpperCase()}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${locale === loc
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
          title={localeNames[loc]}
        >
          {localeFlags[loc]} {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
