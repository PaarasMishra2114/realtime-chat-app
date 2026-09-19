import React from 'react';
import { Activity, MessageSquare, BookOpen, CreditCard, Volume2, VolumeX } from 'lucide-react';
import { ConnectionStatus } from '../types.js';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  connectionStatus?: ConnectionStatus;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  connectionStatus,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.875rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand / Logo */}
      <div 
        onClick={() => onNavigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
        }}>
          <Activity size={22} color="#0a0d14" strokeWidth={2.5} />
        </div>
        <div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)'
          }}>
            Pulse<span className="text-gradient">Chat</span>
          </span>
          <span style={{
            display: 'block',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            fontWeight: 600
          }}>
            REAL-TIME WEBSOCKET
          </span>
        </div>
      </div>

      {/* Navigation Links with Active State */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          onClick={() => onNavigate('/')}
          style={{
            color: currentRoute === '/' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: currentRoute === '/' ? 600 : 500,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          Home
        </button>
        <button
          onClick={() => onNavigate('/app')}
          style={{
            color: currentRoute === '/app' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: currentRoute === '/app' ? 600 : 500,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <MessageSquare size={16} /> Live App
        </button>
        <button
          onClick={() => onNavigate('/pricing')}
          style={{
            color: currentRoute === '/pricing' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: currentRoute === '/pricing' ? 600 : 500,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <CreditCard size={16} /> Pricing
        </button>
        <button
          onClick={() => onNavigate('/docs')}
          style={{
            color: currentRoute === '/docs' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: currentRoute === '/docs' ? 600 : 500,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <BookOpen size={16} /> Docs
        </button>
      </nav>

      {/* Status & Sound Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Disable Audio Chimes' : 'Enable Audio Chimes'}
          style={{
            color: soundEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {connectionStatus && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            fontWeight: 500
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor:
                connectionStatus === 'connected' ? 'var(--accent-emerald)' :
                connectionStatus === 'connecting' ? 'var(--accent-amber)' : 'var(--accent-rose)',
              boxShadow: connectionStatus === 'connected' ? '0 0 8px var(--accent-emerald)' : 'none'
            }} />
            <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
              {connectionStatus}
            </span>
          </div>
        )}

        <button
          onClick={() => onNavigate('/app')}
          style={{
            background: 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)',
            color: '#0a0d14',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '0.5rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)'
          }}
        >
          Open Chat
        </button>
      </div>
    </header>
  );
};
