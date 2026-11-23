import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Private/ephemeral areas: API routes, the admin dashboard and individual game rooms.
const PRIVATE_PATHS = ['/api/', '/admin', '/game/'];

// AI crawlers and AI search/assistant agents, explicitly welcomed so the game can be
// discovered and cited by ChatGPT, Claude, Perplexity, Gemini, etc.
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: AI_AGENTS, allow: '/', disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
