# Design System & UI/UX Guidelines

## Project: PulseChat — Real-Time WebSocket Messaging App

---

## 1. Design Philosophy: Cyber-Luxe Dark Glassmorphism
PulseChat utilizes a deep, modern aesthetic tailored for high-focus communication. It avoids generic flat colors in favor of layered translucency, subtle neon accents, soft glows, and crisp typography.

---

## 2. Color Palette & Tokens

### 2.1 Backgrounds & Surfaces
- `--bg-primary`: `#0a0d14` (Deep space obsidian)
- `--bg-secondary`: `#111622` (Dark slate container)
- `--bg-tertiary`: `#182030` (Interactive card surface)
- `--bg-glass`: `rgba(17, 24, 39, 0.75)` (Glassmorphic panels with `backdrop-filter: blur(16px)`)
- `--bg-glass-card`: `rgba(255, 255, 255, 0.03)` (Card hover surface)

### 2.2 Accents & Gradients
- `--accent-cyan`: `#00e5ff` (Primary electric pulse)
- `--accent-violet`: `#8b5cf6` (Secondary vibrant purple)
- `--accent-emerald`: `#10b981` (Online presence & active status)
- `--accent-rose`: `#f43f5e` (Alerts, disconnects & notifications)
- `--gradient-brand`: `linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)`
- `--gradient-glow`: `radial-gradient(circle at 50% 0%, rgba(0, 229, 255, 0.15), transparent 70%)`

### 2.3 Borders & Shadows
- `--border-subtle`: `rgba(255, 255, 255, 0.08)`
- `--border-glow`: `rgba(0, 229, 255, 0.3)`
- `--shadow-glass`: `0 8px 32px 0 rgba(0, 0, 0, 0.37)`
- `--shadow-neon`: `0 0 20px rgba(0, 229, 255, 0.25)`

---

## 3. Typography
- **Headings & Display**: `Outfit`, system-ui, sans-serif (Weights: 600, 700, 800)
- **Body & Chat Text**: `Inter`, system-ui, sans-serif (Weights: 400, 500, 600)
- **Code & Snippets**: `JetBrains Mono`, monospace

---

## 4. Component Hierarchy

### 4.1 Room Navigation & Sidebar
- Vertical room list with unread count badges (`#general`, `#dev`, `#design`, `#announcements`).
- Direct Message (DM) list showing active presence indicators (green pulsing dot for online).
- User profile footer with audio mute toggle, connection health status, and Ponytail quick-dock button.

### 4.2 Chat View
- **Header**: Active room name, topic, member count, and search filter.
- **Message List**: Virtualized scroll container with message grouping by sender and timestamp.
  - User avatar with fallback initials.
  - Hover action bar: emoji reactions (👍, ❤️, 🔥, 🚀, 💡), quick reply, copy text.
  - Active reaction badges with counter increment animations.
- **Typing Indicator Bar**: Subtle waving animation (`Alex is typing...`).
- **Input Bar**: Rich input container with file upload trigger, emoji picker, send button, and Ponytail quick snippets dropdown.

### 4.3 Ponytail Extension Widget
- Floating or side-docked companion panel.
- Quick canned snippets (e.g. "On it!", "PR reviewed", "LGTM 🚀", "Let's sync up").
- One-click insertion directly into active chat composer.

---

## 5. Micro-Animations & Audio Feedback
- **Smooth Room Transitions**: 150ms ease-out opacity/transform.
- **Message Send Spring**: Subtle 2px translate-y on new message bubble arrival.
- **Audio Chimes**: Soft synthesized Web Audio chime on incoming message when tab is inactive (toggleable via UI).
