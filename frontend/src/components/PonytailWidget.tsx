import React, { useState, useEffect } from 'react';
import { Sparkles, Send, CheckCircle2, Zap } from 'lucide-react';

interface PonytailWidgetProps {
  onInsertSnippet: (text: string) => void;
  activeRoom: string;
}

export const PonytailWidget: React.FC<PonytailWidgetProps> = ({ onInsertSnippet, activeRoom }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const quickSnippets = [
    { label: 'Ship It', text: 'LGTM! 🚀 Tested and ready to merge into main.' },
    { label: 'Investigating', text: '🔍 Reproducing on staging right now. Checking logs.' },
    { label: 'Hotfix Deployed', text: '⚡ Hotfix deployed to production cluster. Latency nominal.' },
    { label: 'Sync Up', text: 'Let’s jump on a quick 5-min huddle to align on the architecture.' },
    { label: 'Benchmark', text: 'Benchmark completed: < 15ms p99 WebSocket round-trip! 📈' }
  ];

  useEffect(() => {
    // Listen for extension events from Ponytail browser extension
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.source === 'ponytail-extension-trigger') {
        if (e.data.action === 'INSERT_SNIPPET' && e.data.text) {
          onInsertSnippet(e.data.text);
        } else if (e.data.action === 'TOGGLE_PANEL') {
          setIsOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onInsertSnippet]);

  const handleSelectSnippet = (text: string, index: number) => {
    onInsertSnippet(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: isOpen ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: '1px solid',
          borderColor: isOpen ? 'var(--accent-cyan)' : 'var(--border-subtle)',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          color: isOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}
        title="Ponytail Extension & Quick Snippets Hub"
      >
        <Sparkles size={14} color="var(--accent-cyan)" />
        <span>Ponytail Actions</span>
      </button>

      {/* Dropdown Menu / Companion Drawer */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          right: 0,
          width: '320px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          boxShadow: 'var(--shadow-card), 0 0 20px rgba(0, 229, 255, 0.15)',
          zIndex: 100,
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={12} color="#0a0d14" />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Ponytail Extension Suite
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              Side-Panel Active
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            1-Click canned responses and developer telemetry for #{activeRoom}:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {quickSnippets.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSnippet(item.text, idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  textAlign: 'left'
                }}
                className="glass-card"
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', display: 'block', fontSize: '0.75rem' }}>
                    {item.label}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {item.text.slice(0, 32)}...
                  </span>
                </div>
                {copiedIndex === idx ? (
                  <CheckCircle2 size={14} color="var(--accent-emerald)" />
                ) : (
                  <Send size={13} color="var(--text-muted)" />
                )}
              </button>
            ))}
          </div>

          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Ponytail Extension Bridge v2.6</span>
            <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer' }}>Documentation</span>
          </div>
        </div>
      )}
    </div>
  );
};
