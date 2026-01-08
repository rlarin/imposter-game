import { Redis } from '@upstash/redis';

const LIKES_KEY = 'likes:total';
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
      return Response.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const playerLikeKey = `${PLAYER_LIKES_PREFIX}${playerId}`;

    // Check if player already liked
    const hasLiked = await redis.get<boolean>(playerLikeKey);

    if (hasLiked) {
      // Get current total to return
      const currentLikes = await redis.get<number>(LIKES_KEY);
      return Response.json(
        {
          error: 'Player already liked',
          alreadyLiked: true,
          likes: currentLikes ?? 0,
        },
        { status: 409 }
      );
    }

    // Add like
    await Promise.all([
      redis.incr(LIKES_KEY),
      redis.set(playerLikeKey, true, { ex: 86400 * 365 }), // Set for 1 year
    ]);

    const updatedLikes = await redis.get<number>(LIKES_KEY);
    return Response.json({ likes: updatedLikes ?? 1, success: true });
  } catch (error) {
    console.error('[Redis] Error adding like:', error);
    return Response.json({ error: 'Failed to add like' }, { status: 500 });
  }
}
