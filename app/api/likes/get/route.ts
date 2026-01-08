import { Redis } from '@upstash/redis';

const LIKES_KEY = 'likes:total';

function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }

  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return Response.json({ likes: 0 });
    }

    const likes = await redis.get<number>(LIKES_KEY);
    return Response.json({ likes: likes ?? 0 });
  } catch (error) {
    console.error('[Redis] Error getting likes:', error);
    return Response.json({ likes: 0 });
  }
}
