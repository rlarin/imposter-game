// Site-wide SEO constants (English, used for search engines and AI agents).

/**
 * Canonical site URL. Set NEXT_PUBLIC_SITE_URL (e.g. https://your-domain.com) in production.
 * Falls back to Vercel's production domain, then to localhost for development.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
).replace(/\/$/, '');

export const SITE_NAME = 'El Impostor';
export const SITE_ALT_NAME = 'The Imposter';

export const SITE_TITLE = 'El Impostor (The Imposter) – Free Online Word Game for Groups';

export const SITE_DESCRIPTION =
  'El Impostor (The Imposter) is a free multiplayer social deduction word game for 3 to 15 ' +
  'players. Everyone gets the same secret word except the imposter: give one-word clues, ' +
  'vote out the imposter, and play in person or over the built-in video call. No sign-up, ' +
  'works in any browser on mobile and desktop.';

export const SITE_KEYWORDS = [
  'imposter game',
  'impostor game',
  'el impostor',
  'the imposter',
  'word game',
  'party game',
  'social deduction game',
  'online party game',
  'multiplayer word game',
  'secret word game',
  'game for groups',
  'free browser game',
  'game night',
  'juego del impostor',
];

export const SUPPORTED_LANGUAGES = ['es', 'en', 'de', 'nl'] as const;
