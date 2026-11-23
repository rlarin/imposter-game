# Imposter

Multiplayer word game: everyone gets the secret word except the imposter, who has to blend in.

## Architecture

| Part | Code | Hosted on |
| --- | --- | --- |
| Web app + API routes (Next.js) | `app/`, `components/`, `lib/` | Vercel |
| Realtime game server ([PartyServer](https://github.com/cloudflare/partykit/tree/main/packages/partyserver), one Durable Object per room) | `party/index.ts`, `wrangler.jsonc` | Cloudflare Workers (Free plan) |
| Stats + likes (Redis) | `lib/kv.ts` | Upstash |

Browsers connect with `partysocket` to `wss://<NEXT_PUBLIC_PARTYKIT_HOST>/parties/main/<ROOM_CODE>`. Room state lives in the Durable Object's memory; Upstash only stores stats and is optional for gameplay.

> The hosted PartyKit platform shut down on 23 Oct 2026. The game server now runs on your own Cloudflare account; the client and URL format are unchanged.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` (Next.js):

   ```bash
   NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
   KV_REST_API_URL=https://<your-db>.upstash.io   # optional
   KV_REST_API_TOKEN=<upstash-rest-token>         # optional
   ADMIN_PASSWORD=<admin-page-password>           # optional, enables /admin
   ```

3. Create `.dev.vars` (game server, optional; same Upstash values):

   ```bash
   KV_REST_API_URL=https://<your-db>.upstash.io
   KV_REST_API_TOKEN=<upstash-rest-token>
   ```

4. Start both servers:

   ```bash
   npm run dev:all   # Next.js on :3000, wrangler dev on :1999
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Both env files are git-ignored.

## Deploy

### 1. Game server → Cloudflare

One-time setup:

```bash
npx wrangler login
npx wrangler secret put KV_REST_API_URL     # paste the Upstash REST URL
npx wrangler secret put KV_REST_API_TOKEN   # paste the matching REST token
```

The account needs a `workers.dev` subdomain. If the first deploy fails with error `10063`, open **Workers & Pages** in the Cloudflare dashboard once to create it.

Deploy (from `main`):

```bash
npm run deploy:party
```

This prints the host, e.g. `https://imposter-game.<subdomain>.workers.dev`. Production currently uses `imposter-game.rlarinf.workers.dev`.

### 2. Web app → Vercel

Vercel deploys automatically from `main`. Set these in **Project → Settings → Environment Variables**:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_PARTYKIT_HOST` | Worker host **without** `https://`, e.g. `imposter-game.rlarinf.workers.dev` |
| `KV_REST_API_URL` | Upstash REST URL (same database as the worker) |
| `KV_REST_API_TOKEN` | Upstash REST token (same database as the worker) |
| `ADMIN_USERNAME` | Admin login (default `admin`) |
| `ADMIN_PASSWORD` | Admin password; `/admin` is locked without it |

`NEXT_PUBLIC_*` values are baked in at build time: redeploy after changing them.

## Troubleshooting

Stream the game server's logs:

```bash
npx wrangler tail imposter-game --format pretty
```

| Symptom | Cause | Fix |
| --- | --- | --- |
| Rooms never connect; WebSocket goes to `localhost:1999` | `NEXT_PUBLIC_PARTYKIT_HOST` missing on Vercel | Set it, then redeploy |
| `[KV] SET failed ... error code: 1016` | Worker's `KV_REST_API_URL` points to a deleted database | `wrangler secret put KV_REST_API_URL` |
| `[KV] SET failed ... WRONGPASS` | Token doesn't match the database | `wrangler secret put KV_REST_API_TOKEN` |
| Likes always `0` | Vercel's Upstash vars wrong or not redeployed | Fix the vars, redeploy |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run dev:party` | Game server locally (`wrangler dev`, port 1999) |
| `npm run dev:all` | Both of the above |
| `npm run deploy:party` | Deploy the game server to Cloudflare |
| `npm run typecheck:party` | Type-check the game server |
| `npm run lint` / `npm run format` | ESLint / Prettier |
