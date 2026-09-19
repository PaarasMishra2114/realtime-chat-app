# Product Requirements Document (PRD)

## Project Name: PulseChat — Real-Time WebSocket Messaging System
**Release**: 2026.1-PROD  
**Status**: Approved & In Implementation  
**Target Audience**: High-velocity teams, community platforms, customer support agents, and browser-extension power users.

---

## 1. Executive Summary
PulseChat is a production-grade, low-latency (<50ms) real-time messaging application engineered with Node.js, WebSockets, Redis Pub/Sub, PostgreSQL, and React.js. It features room-based communication, persistent chat history, typing telemetry, message reactions, real-time presence/online indicators, and dedicated browser extension hooks (including Ponytail extension integration).

---

## 2. User Personas

### 2.1 The Remote Collaborator (Alex)
- **Goal**: Collaborate instantly across channels and direct messages without page reloads or dropped connections.
- **Pain Points**: High latency, lost messages during brief disconnects, lack of clear typing/presence indicators.

### 2.2 The Power Browser / Extension User (Maya)
- **Goal**: Trigger quick snippets, send canned replies, and monitor channel activity directly from a side-panel extension (Ponytail) while browsing other tabs.
- **Pain Points**: Heavy web apps that cannot be embedded cleanly or lack postMessage/WebSocket extension APIs.

### 2.3 The Platform Operator & SEO Specialist (Devon)
- **Goal**: Maximize search engine visibility, achieve 95+ Lighthouse scores, prevent source code leaks in production, and ensure graceful scaling.
- **Pain Points**: Leaked source maps, poor open graph previews, duplicate content without canonical links, fragile database dependencies.

---

## 3. Core Functional Requirements

| ID | Feature | Specification | Acceptance Criteria |
|---|---|---|---|
| **FR-01** | Room-based Chat | Users can switch between public rooms (`#general`, `#dev`, `#design`, `#announcements`) and private 1-to-1 DMs. | Instant channel switching with automatic message history hydration. |
| **FR-02** | Real-Time WebSocket Transport | Bi-directional messaging using WebSocket protocol (`ws://` / `wss://`). | Latency < 50ms for message delivery across subscribed clients. |
| **FR-03** | Redis Pub/Sub Event Mesh | Distributed message broadcasting across server instances via Redis channels. | Seamless horizontal scaling; automatic in-memory fallback for local dev. |
| **FR-04** | Persistent Storage | Messages, rooms, reactions, and user profiles persisted in PostgreSQL. | Messages reloaded on room entry; automatic pagination/cursor support. |
| **FR-05** | Presence & Online Status | Heartbeat-based online/offline indicator for active room members. | Updates presence state within 3 seconds of client connect/disconnect. |
| **FR-06** | Typing Telemetry | Real-time "User is typing..." indicators with debouncing (2.5s expiry). | Displays typing state smoothly without flooding the socket connection. |
| **FR-07** | Message Reactions & Media | Emoji reactions and image/link rich previews. | Multi-user reaction counters update dynamically in real time. |
| **FR-08** | Ponytail Extension Hook | Embeddable quick-action bar and `postMessage` / WebSocket bridge for extension side-panels. | Enables 1-click canned responses, summaries, and quick channel switches. |

---

## 4. Technical SEO & Performance Requirements

1. **Performance & Cleanliness**:
   - Zero production source maps (`sourcemap: false`) to prevent source exposure.
   - Vite manual chunks configuration to separate `vendor`, `ui`, and `engine` bundles.
   - Zero console errors and warnings in production builds.
   - Lighthouse Performance & SEO scores ≥ 95.

2. **Technical SEO**:
   - Unique `<title>` and `<meta name="description">` per route.
   - Canonical links (`<link rel="canonical" href="...">`) to prevent duplicate indexing.
   - Semantic HTML5 heading hierarchy (single `<h1>` per view).
   - Alt text for all image assets and avatars.
   - Dedicated, branded custom `404 Not Found` page with automatic redirect options.
   - Semantic breadcrumbs with Schema.org `BreadcrumbList` microdata.

3. **Search Engine & AI Discovery Files**:
   - `sitemap.xml` with dynamic `lastmod` and route priority.
   - `robots.txt` granting search engine crawlers access while shielding internal socket endpoints.
   - `llms.txt` structured file describing the project capabilities for AI indexing agents.
   - JSON-LD Structured Data for `SoftwareApplication`, `WebSite`, and `Organization`.

4. **Branding & Social Sharing**:
   - Custom SVG vector favicon with dark/light mode responsiveness.
   - Open Graph (`og:image`, `og:title`, `og:description`) and Twitter Card (`summary_large_image`) meta tags.

---

## 5. Non-Functional Requirements
- **Availability**: 99.9% uptime SLA for WebSocket gateway.
- **Resilience**: Auto-reconnect with exponential backoff on socket drop.
- **Graceful Degradation**: When PostgreSQL or Redis is offline, backend auto-switches to embedded SQLite and memory Pub/Sub to allow local development and staging to run uninterrupted.
- **Security**: Strict payload validation via Zod, XSS escaping, CORS origin enforcement, and rate limiting (max 30 messages/minute per IP).
