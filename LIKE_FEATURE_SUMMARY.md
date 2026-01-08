# Like Button Feature Implementation Summary

## Overview

A complete like button feature has been implemented with Redis storage, allowing users to like the game with a maximum
of 1 like per player. The like count is displayed with compact formatting (1, 1k, 1m) and visible throughout the
application.

## Files Created

### API Routes

1. **app/api/likes/get/route.ts** - GET endpoint to retrieve total likes count
2. **app/api/likes/add/route.ts** - POST endpoint to add a like (one per player)
3. **app/api/likes/check/route.ts** - POST endpoint to check if a player already liked

### UI Components

4. **components/ui/LikeButton.tsx** - Like button component with:
    - Persistent player ID in localStorage
    - Shows total like count with compact formatting (1, 1k, 1m)
    - Visual feedback when user has already liked
    - Hover and disabled states
    - Animated heart emoji when liked
    - i18n support with translations

## Files Modified

### Core Utilities

1. **lib/utils.ts**
    - Added `formatLikeCount()` function for compact number formatting (1, 1k, 1m)

2. **lib/kv.ts**
    - Added `getTotalLikes()` function to retrieve total likes from Redis
    - Updated `AdminStats` interface to include `totalLikes` field
    - Updated `getActiveRooms()` to fetch and return total likes

### UI Components

3. **components/ui/index.ts**
    - Exported `LikeButton` component

### Page Components

4. **app/page.tsx** (Home/Main Page)
    - Imported `LikeButton` component
    - Added like button to footer section with centered layout
    - Placed above "How to Play" button

5. **app/game/[roomCode]/page.tsx** (Game Page)
    - Imported `LikeButton` component
    - Added like button to header next to player count
    - Visible during all game phases

6. **app/admin/page.tsx** (Admin Dashboard)
    - Updated `AdminStats` interface to include `totalLikes`
    - Added new stats card displaying total likes with heart emoji
    - Displayed in 4-column grid (responsive to 2 columns on mobile)

### API Routes

7. **app/api/admin/stats/route.ts**
    - No changes needed (automatically includes likes via updated getActiveRooms)

### Internationalization

8. **i18n/messages/en.json**
    - Added `like` section with translations:
        - `clickToLike` - "Click to like this game"
        - `alreadyLiked` - "You already liked this game!"

9. **i18n/messages/es.json**
    - Added `like` section with Spanish translations:
        - `clickToLike` - "¡Haz clic para darle un like a este juego!"
        - `alreadyLiked` - "¡Ya le diste un like a este juego!"

10. **i18n/messages/nl.json**
    - Added `like` section with Dutch translations:
        - `clickToLike` - "Klik om dit spel een like te geven"
        - `alreadyLiked` - "Je hebt dit spel al een like gegeven!"

## Key Features

✅ **One Like Per Player**

- Uses player ID stored in localStorage
- Checks if player has already liked before allowing another like
- Returns 409 (Conflict) status if player attempts to like twice

✅ **Persistent Storage**

- Uses Redis (Upstash) for data persistence
- Stores total likes count under `likes:total` key
- Stores individual player likes under `likes:player:{playerId}` with 1-year expiration

✅ **Compact Number Formatting**

- Numbers < 1,000: displayed as-is (e.g., 123)
- Numbers < 1,000,000: formatted as k (e.g., 1.2k, 50k)
- Numbers ≥ 1,000,000: formatted as m (e.g., 1.5m, 100m)

✅ **Visible in All Pages**

- Home page: in footer section
- Game page: in header next to player count
- Admin dashboard: as a stats card showing total likes

✅ **UI/UX Polish**

- Red heart emoji (❤️) with pulse animation when liked
- Disabled state prevents re-clicking
- Hover effects show the button is interactive
- Responsive design for mobile and desktop
- Full i18n support for 3 languages (English, Spanish, Dutch)

## Data Flow

### Adding a Like:

1. User clicks LikeButton on any page
2. Component sends POST to `/api/likes/add` with playerId
3. API checks if player has already liked
4. If not, increments total count and marks player as having liked
5. Returns updated like count
6. Button updates state to show "already liked"

### Checking Likes:

1. On component mount, LikeButton fetches total count from `/api/likes/get`
2. Simultaneously checks if current player has liked via `/api/likes/check`
3. Updates local state with total count and like status
4. Continues polling on interval if needed

### Admin Dashboard:

1. Admin page fetches stats from `/api/admin/stats`
2. Stats include total likes count via updated `getActiveRooms()`
3. Likes displayed in 4-card grid alongside other metrics

## Redis Keys

- `likes:total` - Total count of all likes (incremented each like)
- `likes:player:{playerId}` - Marker that player has liked (set to true, expires in 1 year)

## Tech Stack

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Redis (Upstash)
- **i18n**: next-intl
- **State Management**: React hooks (useState, useEffect)
- **Storage**: Browser localStorage for player ID persistence

## Browser Compatibility

- Works in all modern browsers with localStorage support
- Player ID persists across browser sessions
- Gracefully handles localStorage unavailability

## Notes

- Player ID is generated once per browser and stored in localStorage
- Like limit is per player ID, not per device/account
- No backend authentication required for likes (based on player ID only)
- Admin authentication still required for admin dashboard

