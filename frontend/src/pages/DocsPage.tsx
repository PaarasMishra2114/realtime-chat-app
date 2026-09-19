import React, { useEffect } from 'react';
import { Terminal, Cpu, Sparkles, BookOpen } from 'lucide-react';

interface DocsPageProps {
  onNavigate?: (route: string) => void;
}

export const DocsPage: React.FC<DocsPageProps> = () => {
  useEffect(() => {
    document.title = 'PulseChat — Developer Documentation & WebSocket Protocol Specs | 2026';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Comprehensive technical reference for PulseChat WebSocket protocol, Redis pub/sub mesh broadcasting, PostgreSQL schemas, and Ponytail extension hooks.');
    }
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Unique <h1> for Technical SEO */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <BookOpen size={16} /> Technical Architecture Reference
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, marginBottom: '1rem' }}>
          WebSocket Protocol & <span className="text-gradient">Developer Specs</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Standardized JSON WebSocket framing, Redis Pub/Sub distribution semantics, and relational PostgreSQL persistence.
        </p>
      </div>

      {/* Section 1: WebSocket Handshake & Frames */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={20} color="var(--accent-cyan)" /> 1. WebSocket Protocol Frame Envelope
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Connect via standard WebSocket protocol to <code>ws://localhost:3001/ws</code> (or <code>wss://yourdomain.com/ws</code> in production). All frames follow this envelope:
        </p>
        <pre style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          color: '#38bdf8',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          overflowX: 'auto',
          lineHeight: '1.5'
        }}>
{`// Client -> Server Frame:
{
  "type": "SEND_MESSAGE",
  "payload": {
    "roomId": "dev",
    "text": "Deployment complete! Latency < 12ms."
  }
}

// Server -> Client Broadcast:
{
  "type": "NEW_MESSAGE",
  "payload": {
    "id": "msg-1726725839-abc",
    "roomId": "dev",
    "userId": "usr-104",
    "username": "Alex Vance",
    "avatar": "👨‍💻",
    "text": "Deployment complete! Latency < 12ms.",
    "reactions": {},
    "createdAt": "2026-09-19T06:30:00.000Z"
  }
}`}
        </pre>
      </section>

      {/* Section 2: Redis Pub/Sub Mesh */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={20} color="var(--accent-purple)" /> 2. Distributed Event Broadcasting (Redis Mesh)
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
          Server nodes subscribe to Redis channels partitioned by room: <code>room:&lt;roomId&gt;</code> and telemetry channel: <code>room:&lt;roomId&gt;:telemetry</code>. When any client sends a chat payload, it is stored in PostgreSQL and simultaneously published to the Redis channel, instantly notifying all distributed Node.js instances.
        </p>
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          💡 <strong>Local Development Resilience</strong>: If Redis is offline on your workstation, the server automatically routes broadcasts through an in-process EventEmitter with identical API mechanics.
        </div>
      </section>

      {/* Section 3: Ponytail Extension API */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--accent-emerald)" /> 3. Ponytail Extension Bridge & Side-Panel API
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
          PulseChat communicates with browser extensions using the HTML5 <code>postMessage</code> bridge. Ponytail extensions can listen to inbound messages and dispatch actions directly:
        </p>
        <pre style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          color: '#34d399',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          overflowX: 'auto',
          lineHeight: '1.5'
        }}>
{`// Dispatch a canned snippet from Ponytail Extension to PulseChat:
window.postMessage({
  source: 'ponytail-extension-trigger',
  action: 'INSERT_SNIPPET',
  text: 'LGTM! 🚀 Verified on staging.'
}, '*');`}
        </pre>
      </section>
    </div>
  );
};
