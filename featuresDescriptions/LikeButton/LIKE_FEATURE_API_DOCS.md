# Like Button Feature - Implementation Examples

## How It Works End-to-End

### 1. User Flow

```
User Opens App
    ↓
LikeButton component mounts
    ├─ Generates/retrieves player ID from localStorage
    ├─ Fetches current like count from /api/likes/get
    └─ Checks if player already liked via /api/likes/check
         ↓
    Renders button with current count
         ↓
User Clicks Like Button
    ├─ Sends POST to /api/likes/add with playerId
    ├─ Server checks if player already liked
    ├─ If not: increments total, marks player as liked
    └─ Returns updated count
         ↓
    Button updates to "already liked" state
         ↓
Admin Views Dashboard
    ├─ Fetches stats from /api/admin/stats
    ├─ Receives total likes count
    └─ Displays in stats card
```

## Code Examples

### Using the LikeButton Component

```typescriptreact
import { LikeButton } from '@/components/ui';

export default function MyPage() {
  return (
    <div>
      {/* Like button will display like count and allow one like per player */}
      <LikeButton />
    </div>
  );
}
```

### Formatting Like Counts

```typescript
import {formatLikeCount} from '@/lib/utils';

// Usage examples:
formatLikeCount(0);        // "0"
formatLikeCount(42);       // "42"
formatLikeCount(1000);     // "1k"
formatLikeCount(1500);     // "1.5k"
formatLikeCount(50000);    // "50k"
formatLikeCount(1000000);  // "1m"
formatLikeCount(2500000);  // "2.5m"
```

### Fetching Like Data Programmatically

```typescript
// Get total likes
const response = await fetch('/api/likes/get');
const data = await response.json();
console.log(data.likes); // 1234

// Check if player already liked
const response = await fetch('/api/likes/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({playerId: 'player_123'}),
});
const data = await response.json();
console.log(data.hasLiked); // true or false

// Add a like
const response = await fetch('/api/likes/add', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({playerId: 'player_123'}),
});
const data = await response.json();
console.log(data.likes);    // 1235
console.log(data.success);  // true
```

## API Reference

### GET /api/likes/get

**Description**: Get the total number of likes

**Method**: GET

**Request**:

```
GET /api/likes/get
```

**Response (200 OK)**:

```json
{
  "likes": 1234
}
```

**Response (when Redis unavailable)**:

```json
{
  "likes": 0
}
```

---

### POST /api/likes/add

**Description**: Add a like from a player (one per player)

**Method**: POST

**Request**:

```
POST /api/likes/add
Content-Type: application/json

{
  "playerId": "player_123456"
}
```

**Response (200 OK - Like added)**:

```json
{
  "likes": 1235,
  "success": true
}
```

**Response (409 Conflict - Player already liked)**:

```json
{
  "error": "Player already liked",
  "alreadyLiked": true,
  "likes": 1234
}
```

**Response (400 Bad Request - Missing playerId)**:

```json
{
  "error": "Player ID is required"
}
```

**Response (500 Server Error - Redis not configured)**:

```json
{
  "error": "Redis not configured"
}
```

---

### POST /api/likes/check

**Description**: Check if a player has already liked

**Method**: POST

**Request**:

```
POST /api/likes/check
Content-Type: application/json

{
  "playerId": "player_123456"
}
```

**Response (200 OK)**:

```json
{
  "hasLiked": true
}
```

**Response (200 OK - Has not liked)**:

```json
{
  "hasLiked": false
}
```

**Response (400 Bad Request - Missing playerId)**:

```json
{
  "error": "Player ID is required"
}
```

---

## Redis Data Structure

### Storing Likes

The feature uses two types of Redis keys:

**1. Total Likes Counter**

```
Key: likes:total
Type: Integer
Value: 1234 (incremented with each new like)
TTL: None (permanent)
Example: redis> GET likes:total
         "1234"
```

**2. Player Like Status**

```
Key: likes:player:{playerId}
Type: Boolean (stored as "1")
Value: true (indicates player has liked)
TTL: 31,536,000 seconds (1 year)
Example: redis> GET likes:player:player_1234567_abc123
         "1"
```

### Sample Redis Data

```
> KEYS likes:*
1) "likes:total"
2) "likes:player:player_1609459200000_7a8b9c0d"
3) "likes:player:player_1609459300000_e5f6g7h8"
4) "likes:player:player_1609459400000_i9j0k1l2"
5) "likes:player:player_1609459500000_m3n4o5p6"

> GET likes:total
"5"

> TTL likes:player:player_1609459200000_7a8b9c0d
"31449600"  // About 364 days remaining
```

## Component States

### LikeButton States

```typescriptreact
// State 1: Not liked yet
<button className="bg-gray-100 hover:bg-red-100">
  <span>❤️</span>
  <span>1234</span>
</button>

// State 2: Already liked (disabled)
<button className="bg-red-100 cursor-default" disabled>
  <span className="animate-pulse">❤️</span>
  <span>1235</span>
</button>

// State 3: Loading (while API call in progress)
<button className="opacity-50" disabled>
  <span>❤️</span>
  <span>1234</span>
</button>
```

## Translations

### English

```json
{
  "like": {
    "clickToLike": "Click to like this game",
    "alreadyLiked": "You already liked this game!"
  }
}
```

### Spanish

```json
{
  "like": {
    "clickToLike": "¡Haz clic para darle un like a este juego!",
    "alreadyLiked": "¡Ya le diste un like a este juego!"
  }
}
```

### Dutch

```json
{
  "like": {
    "clickToLike": "Klik om dit spel een like te geven",
    "alreadyLiked": "Je hebt dit spel al een like gegeven!"
  }
}
```

## Admin Dashboard Integration

### Getting Likes in Admin Stats

```typescript
// In app/api/admin/stats/route.ts
const stats = await getActiveRooms();

// stats now includes:
{
    totalRooms: 5,
        totalPlayers
:
    23,
        totalRoomsCreated
:
    125,
        totalLikes
:
    1234,  // ← New field
        rooms
:
    [...]
}
```

### Displaying Likes in Admin Page

```typescriptreact
<Card className="text-center">
  <p className="text-sm text-gray-500 uppercase">Total Likes</p>
  <p className="text-4xl font-bold text-red-600">❤️ {stats?.totalLikes || 0}</p>
</Card>
```

## Error Handling

### Graceful Degradation

If Redis is not configured or unavailable:

1. **On home/game page**: Like button shows 0 likes, clicking fails silently
2. **On admin dashboard**: Shows 0 likes in stats card
3. **User experience**: No error messages, features continue working

```typescript
// Example: Redis unavailable
getRedis()
returns
null
→ Returns
Response.json({likes: 0})
→ LikeButton
displays
empty
state
→ No
user
disruption
```

### Error States

```typescript
// Scenario: Player tries to like twice
Response
Status: 409
Conflict
{
    "error"
:
    "Player already liked",
        "alreadyLiked"
:
    true,
        "likes"
:
    1234
}

// Frontend handles this by:
// 1. Ignoring the error (409 is expected)
// 2. Updating hasLiked state to true
// 3. Updating like count
// 4. Disabling button
```

## Performance Considerations

### Load Times

- **Like button mount**: ~200ms (parallel fetch for count + check)
- **Click to like**: ~150ms (POST request to Redis)
- **Admin dashboard**: +1 query (minimal overhead)

### Redis Operations

- GET (count): O(1)
- INCR (add like): O(1)
- SET (mark player): O(1)
- All operations are very fast

### Optimization Notes

- Uses `Promise.all()` for parallel API calls
- Implements loading state to prevent double-clicks
- Debounces updates in admin dashboard (10 second refresh)

## Security Considerations

### Current Implementation

- **No authentication required** for liking (based on player ID only)
- Player ID generated client-side and stored in localStorage
- One like per browser/device
- Cannot unlike (permanent)

### Potential Enhancements

- Add rate limiting per IP address
- Implement CAPTCHA for suspicious patterns
- Integrate with user accounts if auth added
- Track suspicious like patterns

## Environment Variables Required

```bash
# In your .env.local or deployed environment:
KV_REST_API_URL=https://your-redis-url.upstash.io
KV_REST_API_TOKEN=your-upstash-token
```

If not set:

- Feature gracefully falls back to showing 0 likes
- No errors are displayed to users
- Admin dashboard works without like count


