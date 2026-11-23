import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n-context';
import { IntlProvider } from '@/components/providers/IntlProvider';
import {
  SITE_ALT_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SUPPORTED_LANGUAGES,
} from '@/lib/site';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['500', '700'],
});

export const viewport: Viewport = {
  themeColor: '#0b0a14',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  category: 'games',
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'nl_NL'],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'El Impostor',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

// Structured data (schema.org) describing the site and the game, for search engines and AI agents.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: SITE_ALT_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: SUPPORTED_LANGUAGES,
    },
    {
      '@type': ['WebApplication', 'VideoGame'],
      '@id': `${SITE_URL}/#game`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: SITE_ALT_NAME,
      description: SITE_DESCRIPTION,
      applicationCategory: 'GameApplication',
      genre: ['Party game', 'Word game', 'Social deduction'],
      gamePlatform: ['Web browser', 'iOS', 'Android', 'Windows', 'macOS'],
      operatingSystem: 'Any (web browser)',
      playMode: 'MultiPlayer',
      numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 15 },
      inLanguage: SUPPORTED_LANGUAGES,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      image: `${SITE_URL}/icons/icon-512x512.png`,
      featureList: [
        'Free, no sign-up required',
        '3 to 15 players per room',
        'Join a room with a 6-character code, link or QR code',
        'Built-in group video call',
        'Optional hint for the imposter, timer and troll mode',
        'Available in Spanish, English, German and Dutch',
      ],
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
  ],
};

// Runs before first paint (JS-enabled browsers only). If the visitor's language differs from the
// server-rendered default ('es'), hide the page until the client applies their language, to avoid
// a flash of Spanish text. Crawlers that don't run JS still get the full server-rendered content.
const localeBootScript = `try{var l=localStorage.getItem('locale')||(navigator.language||'').split('-')[0];if(['en','de','nl'].indexOf(l)>-1){var d=document.documentElement;d.setAttribute('data-locale-pending','');setTimeout(function(){d.removeAttribute('data-locale-pending')},2500)}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeBootScript }} />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          // JSON.stringify output is safe here: the data is static and contains no "<".
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <I18nProvider>
          <IntlProvider>{children}</IntlProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
