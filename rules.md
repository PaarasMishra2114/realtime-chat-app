# Engineering Rules & Standards

## Project: PulseChat — WebSocket Real-Time Messaging App

---

## 1. Code Quality & Language Standards
- **TypeScript First**: All backend and frontend code must be strictly typed (`noImplicitAny: true`, strict null checks).
- **Zero Console Errors / Warnings**: No unhandled promise rejections, missing React keys, or deprecated lifecycle warnings in development or production.
- **Explicit Return Types**: All asynchronous functions and WebSocket dispatch handlers must declare explicit return types.
- **Fail Fast & Graceful Degradation**: Always catch network/socket disconnects and recover with exponential backoff. Never crash the Node.js event loop on socket drops.

---

## 2. Real-Time & WebSocket Rules
1. **Never Broadcast Plaintext Unsanitized Content**: Always sanitize user input before broadcasting and escape HTML entities.
2. **Heartbeat Protocol**: Every active socket connection must send or respond to a ping/pong heartbeat every 30 seconds. Dead connections must be purged to prevent memory leaks.
3. **Room Isolation**: A user must not receive messages or typing notifications for rooms they have not joined.
4. **Debounced Typing Indicators**: Frontend must debounce typing emissions to at most 1 event per 1.5 seconds. Typing status automatically expires after 3 seconds of inactivity.

---

## 3. SEO & Frontend Production Standards
1. **Unique Head Metadata**: Every routed page (`/`, `/app`, `/pricing`, `/docs`, `404`) must render unique `<title>`, `<meta name="description">`, and Open Graph tags.
2. **Strict Heading Hierarchy**: Exactly one `<h1>` per view, followed by semantic `<h2>`, `<h3>` elements.
3. **No Production Source Maps**: `sourcemap: false` is enforced in `vite.config.ts` to prevent intellectual property leaks and reverse engineering.
4. **Zero Placeholder Text**: No `Lorem Ipsum`, `TODO: text here`, or unstyled mock text in production pages.
5. **Image Optimization**: All images and icons must have descriptive `alt` attributes and explicit dimensions to avoid Cumulative Layout Shift (CLS).

---

## 4. Git & Commit Conventions
Follow Conventional Commits:
- `feat(ws)`: Add typing indicators and presence mesh
- `fix(pubsub)`: Handle Redis reconnection timeout gracefully
- `perf(bundle)`: Split vendor React packages from application bundle
- `docs(seo)`: Update sitemap.xml and Open Graph social cards
