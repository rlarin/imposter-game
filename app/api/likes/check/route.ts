import { Redis } from '@upstash/redis';

const PLAYER_LIKES_PREFIX = 'likes:player:';

function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }

  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const playerId = body.playerId;

    if (!playerId) {
      return Response.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) {
      return Response.json({ hasLiked: false });
    }

    const playerLikeKey = `${PLAYER_LIKES_PREFIX}${playerId}`;
    const hasLiked = await redis.get<boolean>(playerLikeKey);

    return Response.json({ hasLiked: hasLiked ?? false });
  } catch (error) {
    console.error('[Redis] Error checking like:', error);
    return Response.json({ hasLiked: false });
  }
}
