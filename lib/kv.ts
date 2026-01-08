import { Redis } from '@upstash/redis';
import { GamePhase } from './types';

// Room metrics stored in Redis
export interface RoomMetrics {
  roomCode: string;
  hostName: string;
  playerCount: number;
  connectedPlayers: number;
  phase: GamePhase;
  createdAt: number;
  lastHeartbeat: number;
}

// Admin stats response
export interface AdminStats {
  totalRooms: number;
  totalPlayers: number;
  totalRoomsCreated: number;
  totalLikes: number;
  rooms: RoomMetrics[];
}

const ROOMS_PREFIX = 'rooms:';
const ACTIVE_ROOMS_SET = 'active-rooms';
const TOTAL_ROOMS_CREATED = 'total-rooms-created';
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

// Check if Redis is configured
function isRedisConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Get Redis client (lazy initialization)
function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null;

  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// Increment total rooms created counter
export async function incrementTotalRoomsCreated(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.incr(TOTAL_ROOMS_CREATED);
  } catch (error) {
    console.error('[Redis] Error incrementing total rooms created:', error);
  }
}

// Get total rooms created
export async function getTotalRoomsCreated(): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;

  try {
    const count = await redis.get<number>(TOTAL_ROOMS_CREATED);
    return count ?? 0;
  } catch (error) {
    console.error('[Redis] Error getting total rooms created:', error);
    return 0;
  }
}

// Register or update a room in the registry
export async function registerRoom(metrics: RoomMetrics): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const key = `${ROOMS_PREFIX}${metrics.roomCode}`;
    const data: RoomMetrics = {
      ...metrics,
      lastHeartbeat: Date.now(),
    };

    await Promise.all([
      redis.set(key, JSON.stringify(data)),
      redis.sadd(ACTIVE_ROOMS_SET, metrics.roomCode),
    ]);
  } catch (error) {
    console.error('[Redis] Error registering room:', error);
  }
}

// Remove a room from the registry
export async function unregisterRoom(roomCode: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const key = `${ROOMS_PREFIX}${roomCode}`;
    await Promise.all([redis.del(key), redis.srem(ACTIVE_ROOMS_SET, roomCode)]);
  } catch (error) {
    console.error('[Redis] Error unregistering room:', error);
  }
}

// Get all active rooms with stats
export async function getActiveRooms(): Promise<AdminStats> {
  console.log('[Redis] Config check:', {
    url: process.env.KV_REST_API_URL ? 'set' : 'missing',
    token: process.env.KV_REST_API_TOKEN ? 'set' : 'missing',
  });

  const redis = getRedis();
  if (!redis) {
    console.log('[Redis] Redis client not initialized');
    return { totalRooms: 0, totalPlayers: 0, totalRoomsCreated: 0, totalLikes: 0, rooms: [] };
  }

  try {
    // Get all room codes from the set
    const roomCodes = await redis.smembers(ACTIVE_ROOMS_SET);
    console.log('[Redis] Room codes found:', roomCodes);

    if (!roomCodes || roomCodes.length === 0) {
      const totalRoomsCreated = await getTotalRoomsCreated();
      const totalLikes = await getTotalLikes();
      return { totalRooms: 0, totalPlayers: 0, totalRoomsCreated, totalLikes, rooms: [] };
    }

    // Fetch all room data
    const keys = roomCodes.map((code) => `${ROOMS_PREFIX}${code}`);
    const roomDataArray = await redis.mget<string[]>(...keys);

    const now = Date.now();
    const rooms: RoomMetrics[] = [];
    const staleRoomCodes: string[] = [];

    for (let i = 0; i < roomCodes.length; i++) {
      const data = roomDataArray[i];
      if (!data) {
        staleRoomCodes.push(roomCodes[i] as string);
        continue;
      }

      try {
        const room: RoomMetrics = typeof data === 'string' ? JSON.parse(data) : data;

        // Check if room is stale (no heartbeat in 5 minutes)
        if (now - room.lastHeartbeat > STALE_THRESHOLD_MS) {
          staleRoomCodes.push(room.roomCode);
          continue;
        }

        rooms.push(room);
      } catch {
        staleRoomCodes.push(roomCodes[i] as string);
      }
    }

    // Clean up stale rooms in background
    if (staleRoomCodes.length > 0) {
      cleanupStaleRooms(staleRoomCodes).catch(console.error);
    }

    // Calculate totals
    const totalPlayers = rooms.reduce((sum, room) => sum + room.playerCount, 0);
    const totalRoomsCreated = await getTotalRoomsCreated();
    const totalLikes = await getTotalLikes();

    return {
      totalRooms: rooms.length,
      totalPlayers,
      totalRoomsCreated,
      totalLikes,
      rooms: rooms.sort((a, b) => b.createdAt - a.createdAt),
    };
  } catch (error) {
    console.error('[Redis] Error getting active rooms:', error);
    return { totalRooms: 0, totalPlayers: 0, totalRoomsCreated: 0, totalLikes: 0, rooms: [] };
  }
}

// Clean up stale rooms
async function cleanupStaleRooms(roomCodes: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis || roomCodes.length === 0) return;

  try {
    const keysToDelete = roomCodes.map((code) => `${ROOMS_PREFIX}${code}`);
    await Promise.all([
      ...keysToDelete.map((key) => redis.del(key)),
      redis.srem(ACTIVE_ROOMS_SET, ...roomCodes),
    ]);
    console.log(`[Redis] Cleaned up ${roomCodes.length} stale rooms`);
  } catch (error) {
    console.error('[Redis] Error cleaning up stale rooms:', error);
  }
}

// Get total likes count
export async function getTotalLikes(): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;

  try {
    const likes = await redis.get<number>('likes:total');
    return likes ?? 0;
  } catch (error) {
    console.error('[Redis] Error getting total likes:', error);
    return 0;
  }
}
