# Like Button Feature - Architecture & Data Flow

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    El Impostor Game App                     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐  ┌──▼─────────┐  ┌▼──────────┐
        │ Home Page    │  │ Game Page  │  │ Admin Pg  │
        │     (/)      │  │(game/[id]) │  │  (/admin) │
        └───────┬──────┘  └──┬────────┘   └┬─────────┘
                │            │             │
                └────────────┼─────────────┘
                             │
                        ┌────▼─────┐
                        │ LikeBtn   │
                        │Component  │
                        └────┬──────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼──────┐        ┌───▼────┐         ┌────▼──────┐
   │ GET Likes │        │Add Like│         │Check Like │
   │/api/likes │        │/api/   │         │ /api/     │
   │ /get      │        │likes   │         │ likes/    │
   └────┬──────┘        │ /add   │         │ check     │
        │               └───┬────┘         └────┬──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                      ┌─────▼─────┐
                      │   Redis   │
                      │ (Upstash) │
                      │           │
                      │ Keys:     │
                      │ - likes:  │
                      │   total   │
                      │ - likes:  │
                      │   player:*│
                      └───────────┘
```

## 📊 Data Flow - User Likes

```
User Clicks Like Button
        │
        ▼
LikeButton Component
        │
        ├─ Check localStorage for playerId
        │  └─ If not exist → Generate new ID
        │
        ├─ Fetch /api/likes/check
        │  └─ Verify not already liked
        │
        ├─ POST /api/likes/add
        │  │
        │  └─ Server:
        │     ├─ Validate playerId
        │     ├─ Check Redis if player already liked
        │     ├─ If not: INCR likes:total
        │     ├─ If not: SET likes:player:{id}=true
        │     └─ Return updated count
        │
        ├─ Update local state
        │  ├─ setLikes(newCount)
        │  └─ setHasLiked(true)
        │
        └─ Display "Already Liked" state
           └─ Disable button
```

## 🔄 Admin Dashboard Flow

```
Admin Opens /admin
        │
        ├─ Basic Auth required
        │
        ├─ Fetch /api/admin/stats
        │  │
        │  └─ Server:
        │     ├─ Call getActiveRooms()
        │     ├─ For each active room:
        │     │  └─ Fetch room metrics
        │     ├─ Call getTotalLikes()
        │     │  └─ GET likes:total from Redis
        │     └─ Return {
        │        totalRooms: 5,
        │        totalPlayers: 23,
        │        totalRoomsCreated: 125,
        │        totalLikes: 1234,  ← NEW
        │        rooms: [...]
        │     }
        │
        ├─ Render stats cards
        │  ├─ Active Rooms: 5
        │  ├─ Total Players: 23
        │  ├─ Rooms Created: 125
        │  └─ Total Likes: 1234 ❤️  ← NEW CARD
        │
        └─ Auto-refresh every 10 seconds
```

## 📱 Component Hierarchy

```
App
├── Layout
│   └── IntlProvider
│       └── I18nProvider
│           ├── Page (/)
│           │   └── LikeButton ✓
│           │
│           ├── GamePage (/game/[roomCode])
│           │   └── Header
│           │       └── LikeButton ✓
│           │
│           └── AdminPage (/admin)
│               └── StatsGrid
│                   ├── Card (Rooms)
│                   ├── Card (Players)
│                   ├── Card (Created)
│                   └── Card (Likes) ✓ NEW
```

## 🔌 API Endpoints

### GET /api/likes/get

```
Request:  GET /api/likes/get
Response: { likes: 1234 }

Flow:
  Client → GET /api/likes/get
         → Server fetches likes:total from Redis
         → Returns JSON with count
         → Client renders count
```

### POST /api/likes/add

```
Request:  POST /api/likes/add
          { playerId: "player_123" }

Response: { likes: 1235, success: true }
       OR { error: "Player already liked", 
            alreadyLiked: true, 
            likes: 1234 }

Flow:
  Client → Check local hasLiked state
        → POST playerId to /api/likes/add
        → Server validates playerId
        → Server checks Redis likes:player:{id}
        → If exists → 409 Conflict
        → If not → INCR likes:total, SET player flag
        → Return updated count
        → Client updates state & UI
```

### POST /api/likes/check

```
Request:  POST /api/likes/check
          { playerId: "player_123" }

Response: { hasLiked: true }
       OR { hasLiked: false }

Flow:
  Client → POST playerId to /api/likes/check
        → Server checks Redis likes:player:{id}
        → Returns boolean if exists
        → Client updates UI state
```

## 🗄️ Redis Data Model

```
┌──────────────────────────────────────────┐
│          Redis Database                  │
├──────────────────────────────────────────┤
│                                          │
│  Key: "likes:total"                      │
│  Type: Integer (Counter)                 │
│  Value: 1234                             │
│  TTL: None (permanent)                   │
│  Operations: GET, INCR                   │
│                                          │
│  Key: "likes:player:player_123_abc"      │
│  Type: String (boolean)                  │
│  Value: "1"                              │
│  TTL: 31,536,000 seconds (1 year)        │
│  Operations: GET, SET, DEL               │
│                                          │
│  Key: "likes:player:player_456_def"      │
│  Type: String (boolean)                  │
│  Value: "1"                              │
│  TTL: 31,535,999 seconds (1 year - 1s)  │
│  Operations: GET, SET, DEL               │
│                                          │
│  ... more player keys ...                │
│                                          │
└──────────────────────────────────────────┘
```

## 🎯 State Management - LikeButton Component

```
State Variables:
┌─────────────────────────────────────┐
│ likes: number (0-∞)                 │
│ ├─ Current total like count        │
│ └─ Updated from API                │
│                                     │
│ hasLiked: boolean (false|true)      │
│ ├─ Whether player already liked     │
│ └─ Disables button if true          │
│                                     │
│ loading: boolean (false|true)       │
│ ├─ API call in progress             │
│ └─ Prevents double-click            │
│                                     │
│ playerId: string|null               │
│ ├─ Unique player identifier         │
│ ├─ Stored in localStorage           │
│ └─ Generated if not exists          │
└─────────────────────────────────────┘

Lifecycle:
useEffect #1: Initialize playerId
  └─ On mount: Get/Generate player ID from localStorage

useEffect #2: Fetch initial data
  └─ When playerId set: Fetch count + check status

Event Handler: handleLike()
  ├─ Validate state (not already liked, not loading)
  ├─ Set loading = true
  ├─ POST /api/likes/add
  ├─ Update likes count
  ├─ Update hasLiked = true
  ├─ Set loading = false
  └─ Button now disabled
```

## 🎨 UI State Transitions

```
Initial State (Component Mount)
    │
    ├─ Fetch count: "0" (if new app)
    ├─ Fetch hasLiked: false
    │
    └─ Render: Gray button with "0"
         │
         │
    User Clicks Button (loading=true)
         │
         └─ Render: Opacity reduced, disabled
              │
              │
    API Response Success (loading=false)
         │
         ├─ likes: 1
         ├─ hasLiked: true
         │
         └─ Render: Red button with "1", disabled, pulse animation
              │
              │
    User Refreshes Page
         │
         ├─ localStorage: "playerId_123"
         ├─ Fetch: hasLiked still true
         │
         └─ Render: Red button with "1", disabled
```

## 🌐 Internationalization (i18n) Flow

```
LikeButton Component
    │
    ├─ useTranslations()
    │  └─ Gets current locale from i18n context
    │
    ├─ t('like.clickToLike')
    │  ├─ en.json → "Click to like this game"
    │  ├─ es.json → "¡Haz clic para darle un like a este juego!"
    │  └─ nl.json → "Klik om dit spel een like te geven"
    │
    └─ t('like.alreadyLiked')
       ├─ en.json → "You already liked this game!"
       ├─ es.json → "¡Ya le diste un like a este juego!"
       └─ nl.json → "Je hebt dit spel al een like gegeven!"

Locale Switching
    │
    └─ i18n/config.ts → Detects browser locale
       └─ Changes all labels in real-time
          └─ LikeButton re-renders with new translations
```

## 📈 Number Formatting (formatLikeCount)

```
Input: number
    │
    ├─ If < 0: Return "0"
    │
    ├─ If < 1000
    │  └─ Return as string: "123"
    │
    ├─ If < 1,000,000
    │  ├─ Divide by 1000: 1500 / 1000 = 1.5
    │  └─ Return with 'k': "1.5k"
    │
    └─ If ≥ 1,000,000
       ├─ Divide by 1,000,000: 2500000 / 1000000 = 2.5
       └─ Return with 'm': "2.5m"

Examples:
  0 → "0"
  1 → "1"
  999 → "999"
  1000 → "1k"
  1234 → "1.2k"
  10000 → "10k"
  100000 → "100k"
  999999 → "1000k"
  1000000 → "1m"
  2500000 → "2.5m"
  123456789 → "123.5m"
```

## 🔒 Security & Authorization

```
Home Page & Game Page - Like Button
    │
    └─ No authentication required
       ├─ Uses localStorage player ID
       ├─ One per browser/device
       └─ Graceful if Redis unavailable

Admin Page
    │
    ├─ Basic Auth required
    │  └─ Username/Password
    │
    ├─ Shows like statistics
    │
    └─ Accesses /api/admin/stats
       └─ Auth check in middleware
```

## ⚡ Performance Characteristics

```
Operation               Time       Complexity
─────────────────────────────────────────────
GET likes count         ~50ms      O(1)
POST add like           ~100ms     O(1)
POST check like         ~50ms      O(1)
Format number           <1ms       O(1)
Button render           ~50ms      -
Admin dashboard load    +10ms      O(1)
Redis INCR             ~2ms       O(1)
Redis SET              ~2ms       O(1)
Redis GET              ~2ms       O(1)
```

## 🔄 Synchronization

```
Multiple Browsers/Tabs:
┌─────────────────┐     ┌─────────────────┐
│  Browser Tab 1  │     │  Browser Tab 2  │
│  Player ID: A   │     │  Player ID: B   │
│  Likes: 1000    │     │  Likes: 1000    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ├─ Click Like ────┐     │
         │                 │     │
         │                 ▼     │
         │            Redis: 1001
         │                 │     │
         │                 ├─────┤
         │                 │     │
         │                 ▼     │
         │            Auto-refresh
         │                 │     │
         ▼                 ▼     ▼
       Updated         Updated  Tab 2
       1001            1001    Reflects
                              latest
```

---

*This diagram suite provides a complete visual understanding of the like button feature architecture, data flow, and
component interactions.*

