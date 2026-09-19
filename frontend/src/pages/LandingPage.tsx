import React, { useEffect } from 'react';
import { Activity, Zap, Shield, Database, Cpu, MessageSquare, ArrowRight, Sparkles, Terminal } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = 'PulseChat — Real-Time WebSocket Messaging Platform | 2026';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'PulseChat provides sub-15ms real-time messaging powered by Node.js, WebSockets, Redis Pub/Sub, and PostgreSQL. Built with zero bundle bloat.');
    }
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3rem 0 4rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(0, 229, 255, 0.08)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          color: 'var(--accent-cyan)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} />
          <span>PulseChat 2026 Production Release Active</span>
        </div>

        {/* Strictly Unique <h1> per page for Technical SEO */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
          fontWeight: 800,
          lineHeight: '1.1',
          marginBottom: '1.5rem',
          letterSpacing: '-0.03em'
        }}>
          Real-Time Messaging.<br />
          <span className="text-gradient">Engineered for Sub-15ms Velocity.</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '720px',
          margin: '0 auto 2.5rem',
          lineHeight: '1.6'
        }}>
          A hardened WebSocket messaging platform built with Node.js, Redis Pub/Sub event distribution, PostgreSQL durability, and modern React 19. Designed for power users and extension workflows.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('/app')}
            style={{
              background: 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)',
              color: '#0a0d14',
              fontWeight: 800,
              fontSize: '1rem',
              padding: '0.85rem 2rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 0 25px rgba(0, 229, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <MessageSquare size={18} /> Launch Live Chat <ArrowRight size={18} />
          </button>
          <button
            onClick={() => onNavigate('/docs')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '1rem',
              padding: '0.85rem 1.75rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            Explore WebSocket Protocol
          </button>
        </div>
      </section>

      {/* Key Metrics / Highlights */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        margin: '2rem 0 5rem'
      }}>
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}><Zap size={28} /></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>&lt; 15ms</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>P99 WebSocket message round-trip across distributed clients.</p>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ color: 'var(--accent-purple)', marginBottom: '0.75rem' }}><Cpu size={28} /></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Redis Mesh</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pub/Sub broadcasting topology with zero-latency channel fanout.</p>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ color: 'var(--accent-emerald)', marginBottom: '0.75rem' }}><Database size={28} /></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Dual Storage</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>PostgreSQL ACID durability with automatic SQLite local fallback.</p>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ color: 'var(--accent-rose)', marginBottom: '0.75rem' }}><Shield size={28} /></div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Zero-Leak</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Production Vite build with sourcemaps disabled and code-split chunks.</p>
        </div>
      </section>

      {/* Feature Matrix */}
      <section style={{ margin: '5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Built for Modern Real-Time Collaboration
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Everything needed to deploy a scalable chat system to production without prototype compromises.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={20} color="var(--accent-cyan)" /> Room-Based Channels
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Seamlessly switch between public discussion rooms and private direct messages with automatic backfill of persistent message history.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--accent-emerald)" /> Live Presence & Telemetry
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Heartbeat-driven online indicators, active participant lists, and smooth debounced "User is typing..." indicators.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--accent-purple)" /> Ponytail Extension Hooks
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Dedicated browser extension bridge supporting side-panel docking, 1-click canned snippets, and background event subscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* SEO FAQ Section for Rich Search Engine Snippets */}
      <section style={{ margin: '5rem 0 3rem', padding: '3rem 2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
              How does PulseChat scale across multiple servers?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              PulseChat uses Redis Pub/Sub channels to distribute events across instances. When an instance receives a WebSocket message, it pushes to Redis, which fans out to all server nodes holding active room subscribers.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
              Can I run PulseChat locally without Docker or running PostgreSQL?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Yes. The backend features automatic graceful fallback: if PostgreSQL or Redis are not reachable, it seamlessly activates an internal memory-backed event mesh and SQLite storage layer.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
              Are source maps exposed in production?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No. PulseChat enforces <code style={{ color: 'var(--accent-purple)' }}>sourcemap: false</code> in Vite configuration, eliminating DevTools source inspection leaks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
