# Like Button Feature - Testing Guide

## Feature Summary

The like button feature allows users to like the game with one like per player. The feature includes:

- Redis-backed storage for persistence
- Compact number formatting (1, 1k, 1m)
- Player-specific like tracking via localStorage
- Multi-language support (English, Spanish, Dutch)
- Visible on home page, game page, and admin dashboard

## Components and API Routes

### Frontend Components

- **LikeButton** (`components/ui/LikeButton.tsx`)
    - Displays like count with heart emoji
    - Shows "already liked" state with visual feedback
    - Stores player ID in localStorage
    - Fetches initial like count on mount

### API Routes

- **GET /api/likes/get** - Returns total likes count
- **POST /api/likes/add** - Adds a like (one per player)
- **POST /api/likes/check** - Checks if player has already liked

### Backend Utilities

- **lib/utils.ts** - `formatLikeCount()` function
- **lib/kv.ts** - `getTotalLikes()` and updated `getActiveRooms()`

## Testing Checklist

### 1. Home Page Like Button

- [ ] Like button is visible in footer below "How to Play" button
- [ ] Shows current like count
- [ ] Heart emoji displays with proper styling
- [ ] Click adds a like and updates count immediately
- [ ] Button shows "already liked" state after clicking
- [ ] Button is disabled after clicking (cannot like twice)
- [ ] Tooltip shows correct message on hover

### 2. Game Page Like Button

- [ ] Like button is visible in header next to player count
- [ ] Shows current like count from server
- [ ] Works during all game phases (lobby, clue, voting, etc.)
- [ ] Same functionality as home page button
- [ ] Does not interfere with game mechanics

### 3. Admin Dashboard

- [ ] New "Total Likes" stat card displays in dashboard
- [ ] Shows heart emoji with like count
- [ ] Updates in real-time or on refresh
- [ ] Located in 4-column grid on desktop, 2-column on mobile
- [ ] Properly formatted with other stat cards

### 4. Like Count Formatting

- [ ] 0 likes: displays as "0"
- [ ] 1-999 likes: displays as numbers (e.g., 123)
- [ ] 1,000-999,999 likes: displays with "k" (e.g., 1k, 1.2k, 50k)
- [ ] 1,000,000+ likes: displays with "m" (e.g., 1m, 1.5m, 100m)

### 5. One Like Per Player

- [ ] First like succeeds (user sees button change state)
- [ ] Second like attempt from same browser fails silently
- [ ] Different browsers can each like once
- [ ] Player ID persists in localStorage across page reloads
- [ ] Same player ID used for all likes in that browser

### 6. Multi-Language Support

- [ ] English: Check translations display correctly
    - Click to like: "Click to like this game"
    - Already liked: "You already liked this game!"
- [ ] Spanish: Check translations display correctly
    - Click to like: "¡Haz clic para darle un like a este juego!"
    - Already liked: "¡Ya le diste un like a este juego!"
- [ ] Dutch: Check translations display correctly
    - Click to like: "Klik om dit spel een like te geven"
    - Already liked: "Je hebt dit spel al een like gegeven!"

### 7. Redis Data Persistence

- [ ] Like count survives application restart
- [ ] Player like status survives application restart
- [ ] Data correctly stored in Redis with proper keys:
    - `likes:total` - integer count
    - `likes:player:{playerId}` - boolean flag

### 8. UI/UX Feedback

- [ ] Loading state works correctly during API call
- [ ] Error handling works (graceful degradation if Redis unavailable)
- [ ] Visual feedback when hovering over button
- [ ] Active/pressed state shows proper animation
- [ ] Heart emoji pulses after successful like
- [ ] Disabled state prevents interaction

### 9. Responsive Design

- [ ] Home page: Button centered in footer on mobile/desktop
- [ ] Game page: Button fits in header with player count
- [ ] Admin page: Stat card stacks properly on mobile
- [ ] Text sizing appropriate for all screen sizes
- [ ] Touch targets large enough for mobile interaction

### 10. Browser Compatibility

- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] localStorage properly saves/retrieves player ID
- [ ] Gracefully handles private/incognito mode

## Manual Testing Steps

### Test 1: Basic Like Functionality

1. Open home page in fresh browser
2. Notice like button in footer
3. Click like button
4. Count should increase by 1
5. Button should show "already liked" state
6. Refresh page
7. Button should still show "already liked"

### Test 2: Different Browsers

1. Open home page in Chrome
2. Click like button (count: +1)
3. Open home page in Firefox
4. Click like button (count: +2)
5. Verify both browsers show different like states

### Test 3: Admin Dashboard

1. Navigate to admin page (/admin)
2. Enter admin credentials
3. Check "Total Likes" card displays count
4. Click like on home page
5. Refresh admin page
6. Count should update

### Test 4: Game Page Integration

1. Create a new game
2. Like button visible in header
3. Click like button
4. Continue through game phases
5. Button should maintain state throughout game

### Test 5: Number Formatting

1. Query Redis to set likes to various numbers
2. Verify formatting:
    - 0 → "0"
    - 999 → "999"
    - 1000 → "1k"
    - 1500 → "1.5k"
    - 999999 → "1000k" (or should be "1m"? check logic)
    - 1000000 → "1m"

## Expected Behavior Summary

| Scenario            | Expected Result                         |
|---------------------|-----------------------------------------|
| First like          | Count increases, button disabled        |
| Second like attempt | Error silently handled, count unchanged |
| Page refresh        | Button state persists                   |
| Different browser   | Can like again (new player ID)          |
| Admin dashboard     | Shows updated total                     |
| Game in progress    | Button works normally                   |
| Offline/no Redis    | Graceful degradation, shows 0 likes     |

## Known Limitations

- One like per browser, not per account (uses localStorage player ID)
- No user authentication required for liking
- Admin authentication still required for admin dashboard
- Player can't unlike (permanent once liked)
- No like history or timestamps stored

## Debugging Tips

### Check if Redis is working

```bash
# In your environment, verify:
echo $KV_REST_API_URL
echo $KV_REST_API_TOKEN
```

### View Redis data

```bash
# Use Upstash console or cli:
redis-cli get likes:total
redis-cli get likes:player:{somePlayerId}
```

### Check browser localStorage

```javascript
// In browser console:
localStorage.getItem('playerId')
```

### Monitor API calls

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click like button
4. Check requests to:
    - `/api/likes/get`
    - `/api/likes/check`
    - `/api/likes/add`

## Deployment Notes

1. Ensure `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set in production
2. No database migrations needed (Redis keys created on first use)
3. Like count starts at 0 if database is fresh
4. Player IDs are device-specific (not account-specific)
5. Monitor Redis usage/costs as like count grows

## Future Enhancements

- Add ability to unlike
- Track like history with timestamps
- Leaderboard of most-liked games
- Like animations (confetti, etc.)
- Like notifications
- Integrate with user accounts (if auth added)
- Rate limiting to prevent abuse
- Trending games based on likes


