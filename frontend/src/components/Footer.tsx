import React from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3rem 2rem 2rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Brand Col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={16} color="#0a0d14" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
              Pulse<span className="text-gradient">Chat</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
            Production-grade real-time messaging engine. Powered by Node.js, WebSockets, Redis Pub/Sub, and PostgreSQL.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              background: 'rgba(0, 229, 255, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <Zap size={12} /> &lt; 15ms Latency
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--accent-emerald)',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <ShieldCheck size={12} /> Zero Source Leak
            </span>
          </div>
        </div>

        {/* Navigation / Internal Links for SEO authority */}
        <div>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Application
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            <li>
              <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }} style={{ color: 'var(--text-secondary)' }}>
                Home & Overview
              </a>
            </li>
            <li>
              <a href="/app" onClick={(e) => { e.preventDefault(); onNavigate('/app'); }} style={{ color: 'var(--text-secondary)' }}>
                Launch Live Chat
              </a>
            </li>
            <li>
              <a href="/pricing" onClick={(e) => { e.preventDefault(); onNavigate('/pricing'); }} style={{ color: 'var(--text-secondary)' }}>
                Plans & Scaling Tiers
              </a>
            </li>
            <li>
              <a href="/docs" onClick={(e) => { e.preventDefault(); onNavigate('/docs'); }} style={{ color: 'var(--text-secondary)' }}>
                API & WebSocket Documentation
              </a>
            </li>
          </ul>
        </div>

        {/* Technical Architecture */}
        <div>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Architecture
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li>WebSocket Gateway (RFC 6455)</li>
            <li>Redis Pub/Sub Event Mesh</li>
            <li>PostgreSQL Relational Backlog</li>
            <li>Ponytail Extension Protocol</li>
            <li>Zero-Config Local Fallbacks</li>
          </ul>
        </div>

        {/* Resources & Crawlers */}
        <div>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Index & Transparency
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>Sitemap (XML)</a></li>
            <li><a href="/robots.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>Robots Protocol</a></li>
            <li><a href="/llms.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>LLMs Transparency File</a></li>
            <li><span style={{ color: 'var(--text-muted)' }}>Status: All Systems Operational</span></li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div>© 2026 PulseChat Systems. All rights reserved. Built with Vibe-Coding to Production standard.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security Audit</span>
        </div>
      </div>
    </footer>
  );
};
