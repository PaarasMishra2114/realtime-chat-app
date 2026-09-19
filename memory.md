# Project Memory & Knowledge Base

## PulseChat — Persistent Project Context

---

## 1. Core Architectural Decisions

### Decision 1: Dual-Mode Persistence (PostgreSQL + SQLite Fallback)
- **Rationale**: In production, PostgreSQL provides ACID durability, foreign key integrity, and connection pooling. In local developer environments or environments without an active Docker daemon/Postgres instance, having SQLite auto-initialize ensures tests, UI verification, and rapid development succeed without blocking configuration hurdles.
- **Implementation**: `database.ts` inspects `DATABASE_URL`. If undefined or connection fails, it initializes an embedded SQLite database with the identical relational schema.

### Decision 2: Dual-Mode Pub/Sub (Redis + EventEmitter Fallback)
- **Rationale**: Multi-instance deployments require Redis Pub/Sub so that a client connected to Node Instance A can message a client connected to Node Instance B. For single-instance testing or staging, an in-memory event bus provides zero-overhead fallback.
- **Implementation**: `pubsub.ts` tests Redis connection with timeout; falls back cleanly to an EventEmitter instance with identical publish/subscribe interfaces.

### Decision 3: Zero-Leak Production Bundles
- **Rationale**: Vite by default generates source maps if misconfigured, exposing source code to browser DevTools in production.
- **Rule**: `vite.config.ts` explicitly sets `sourcemap: false`, strips `console.debug`, and defines `rollupOptions.output.manualChunks` for vendor splitting (`react`, `react-dom`, `lucide-react`).

### Decision 4: Ponytail Extension Protocol
- **Rationale**: Users who utilize the Ponytail browser extension need a standardized way to dock the chat in a side-panel, inject canned responses, and listen to real-time events via `window.postMessage` or WebSocket port bridge.

---

## 2. Environment Variables Map

| Variable | Purpose | Default / Fallback |
|---|---|---|
| `PORT` | Backend HTTP & WS port | `3001` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | SQLite `./pulsechat.sqlite` |
| `REDIS_URL` | Redis Pub/Sub connection string | In-memory bus |
| `VITE_API_URL` | Backend REST & WS URL for client | `http://localhost:3001` |
| `VITE_WS_URL` | Backend WebSocket URL for client | `ws://localhost:3001` |
