'use client';

import { ReactNode } from 'react';
import { useLocale } from '@/lib/i18n-context';
import { Locale, localeNames, locales } from '@/i18n/config';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

// SVG flag icons for cross-browser compatibility
const FlagIcon = ({ locale, className = '' }: { locale: Locale; className?: string }) => {
  const flags: Record<Locale, ReactNode> = {
    es: (
      <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <path fill="#c60b1e" d="M0 0h640v480H0z" />
        <path fill="#ffc400" d="M0 120h640v240H0z" />
      </svg>
    ),
    en: (
      <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <path fill="#012169" d="M0 0h640v480H0z" />
        <path
          fill="#FFF"
          d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"
        />
        <path
          fill="#C8102E"
          d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"
        />
        <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
        <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
      </svg>
    ),
    de: (
      <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <path fill="#000" d="M0 0h640v160H0z" />
        <path fill="#D00" d="M0 160h640v160H0z" />
        <path fill="#FFCE00" d="M0 320h640v160H0z" />
      </svg>
    ),
    nl: (
      <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
        <path fill="#21468B" d="M0 0h640v480H0z" />
        <path fill="#FFF" d="M0 0h640v320H0z" />
        <path fill="#AE1C28" d="M0 0h640v160H0z" />
      </svg>
    ),
  };

  return flags[locale] || null;
};

export default function LanguageSelector({
  variant = 'default',
  className = '',
}: LanguageSelectorProps) {
  const { locale, setLocale } = useLocale();

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white cursor-pointer hover:bg-white/20 transition-colors font-medium appearance-none"
        >
          {locales.map((loc) => (
            <option key={loc} value={loc} className="text-gray-900 bg-white">
              {localeNames[loc]}
            </option>
          ))}
        </select>
        <FlagIcon
          locale={locale}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-4 rounded-sm pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all uppercase
            ${
              locale === loc
                ? 'bg-white text-indigo-600 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }
          `}
          title={localeNames[loc]}
        >
          <FlagIcon locale={loc} className="w-5 h-4 rounded-sm shadow-sm" />
          <span className="hidden sm:inline">{loc}</span>
        </button>
      ))}
    </div>
  );
}
