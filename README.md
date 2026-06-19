# OpenRewards

**Pay real users real money for honestly viewing ads — with anti-fraud math that can't be gamed client-side.**

OpenRewards is an open-source, opt-in "Rewards Program" you can drop into any
app that already shows ads during a wait state (search results loading, a
report generating, a page rendering). Users opt in, watch an ad they were
already going to see, and earn a small cash reward — verified honestly,
server-side, every time.

It's extracted from a production implementation, generalized so it doesn't
depend on any particular app's ad inventory, auth system, or database schema.

## The core idea

The hard part of "pay people for watching ads" is that a client can lie about
how long it watched. OpenRewards never trusts the client's claim on its own —
it only ever lets the claim *reduce* the reward below what real server-measured
elapsed time would allow, never inflate it:

```js
const elapsedMs = Date.now() - session.createdAt;        // real wall-clock time
const claimedVisibleMs = Math.max(0, visibleMs);          // client's claim
const verifiedVisibleMs = Math.min(claimedVisibleMs, elapsedMs); // never trust beyond real time
```

A tampered client can claim it watched for an hour in one second — but the
server caps the credited time to the second that actually elapsed. There's no
client-side number that can earn a reward faster than honestly watching the
ad would.

The flow:
1. An ad becomes visible (real `IntersectionObserver`, ratio ≥ 0.5, tab in
   foreground) → client opens a server-tracked **impression session**.
2. The client locally accumulates cumulative visible time (pausing whenever
   the ad scrolls off-screen or the tab loses focus).
3. Once that local accumulation crosses the configured threshold, the client
   calls `/earn` with its claimed visible time and the session id.
4. The server clamps the claim to real elapsed time since the session opened,
   checks it against the minimum threshold, and only then credits the reward
   — once, per session.

Money is tracked in integer cents everywhere to avoid float drift.

## What's actually here

| Path | What it is |
|---|---|
| `server/src/services/RewardsService.js` | Core business logic: opt-in/out, balances, the daily rewarded-impression cap, ledger, payout requests. |
| `server/src/routes/rewards.js` | The Express API, including the impression-session anti-fraud mechanism. |
| `server/migrations/002_rewards_program.sql` | The schema: `reward_impressions`, `reward_ledger`, `reward_payout_requests`, plus reward columns on `users`. |
| `client/src/context/RewardsContext.jsx` | React context wrapping the API — opt in/out, balance, `startImpressionSession`/`earn`. |
| `client/src/components/RewardAdSlot.jsx` | The actual ad wrapper: `IntersectionObserver`-based visibility tracking wired to the context. |
| `client/src/pages/RewardsDashboard.jsx` | A `/rewards` page: opt-in toggle, balance, activity ledger, payout request form. |

`server/src/routes/auth.js`, `server/migrations/001_init_users.sql`, and
`client/src/context/AuthContext.jsx` are a minimal email/password auth layer
included **only** so this repo runs standalone as a demo. If you're
integrating into an app that already has auth and a `users` table, delete
those and point `server/src/middleware/auth.js`'s `authenticate` at your own
middleware — the only contract `routes/rewards.js` needs is that it sets
`req.user.userId`.

## Quickstart

```bash
# 1. Start Postgres (or point DATABASE_URL at one you already have)
docker compose up -d

# 2. Backend
cd server
cp .env.example .env
npm install
npm run migrate
npm run dev          # listens on :4000

# 3. Frontend (new terminal)
cd client
npm install
npm run dev           # listens on :5173
```

Open `http://localhost:5173`, register an account, opt into Rewards from the
`/rewards` page, then click "Simulate a search" on the home page and watch the
ad for a few seconds — a reward should land.

## API reference

All endpoints are mounted under `/api/rewards`. Authenticated ones expect
`Authorization: Bearer <jwt>`.

| Method & path | Auth | Purpose |
|---|---|---|
| `GET /config` | No | Public program economics (cents/impression, min payout, daily cap, min visible time). |
| `GET /status` | Yes | Current user's opt-in state and balances. |
| `POST /opt-in` / `POST /opt-out` | Yes | Toggle program participation. |
| `POST /impression-session` | Yes | Open a server-tracked session when an ad becomes visible. Body: `{ adId, zone }`. |
| `POST /earn` | Yes | Claim the reward for a session. Body: `{ sessionId, visibleMs }`. |
| `GET /ledger` | Yes | Paginated history of every balance-affecting event. |
| `GET /payouts` | Yes | This user's payout requests and their status. |
| `POST /payout-request` | Yes | Queue a cash-out. Body: `{ method, destination }`. |

## Configuration

All program economics are env vars on the server (see `server/.env.example`):
`CENTS_PER_IMPRESSION`, `MIN_PAYOUT_CENTS`, `MAX_REWARDED_IMPRESSIONS_PER_DAY`,
`MIN_VISIBLE_MS`.

## What this is *not*

- **Not a payment processor.** `payoutsAutomated` is `false` by default —
  payout requests queue in `reward_payout_requests` for you to process
  manually (or wire up Stripe Connect / PayPal Payouts / etc. yourself).
  OpenRewards never pretends a transfer happened that didn't.
- **Not an ad network.** It doesn't serve, bid on, or broker ads — `AdSlot.jsx`
  is a placeholder for whatever ad inventory you already have. OpenRewards
  only handles the "honestly measure and pay for views" part.
- **Not legal advice.** If you run this for real, you almost certainly need
  your own Privacy Policy / Terms of Service disclosure covering what you
  measure (ad-view duration), what you store (balance/ledger/payout
  destination), and your anti-abuse policy. Write your own — don't ship
  without one.

## License

MIT — see [LICENSE](./LICENSE).
