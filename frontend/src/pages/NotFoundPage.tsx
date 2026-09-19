import React, { useEffect } from 'react';
import { HelpCircle, Home, MessageSquare } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = '404 Page Not Found — PulseChat Systems | 2026';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'The page you requested could not be found on PulseChat. Return to home or jump into live chat rooms.');
    }
  }, []);

  return (
    <div style={{
      maxWidth: '650px',
      margin: '5rem auto',
      padding: '3rem 2rem',
      textAlign: 'center'
    }}>
      <div className="glass-panel" style={{ padding: '3.5rem 2rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'var(--accent-rose)'
        }}>
          <HelpCircle size={36} />
        </div>

        {/* Unique <h1> for 404 Route */}
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          404 <span className="text-gradient">Lost in Orbit</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          The channel or page you are trying to reach does not exist or has been relocated to another galaxy.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('/')}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Home size={16} /> Return Home
          </button>

          <button
            onClick={() => onNavigate('/app')}
            style={{
              background: 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)',
              color: '#0a0d14',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)'
            }}
          >
            <MessageSquare size={16} /> Join Live Chat
          </button>
        </div>
      </div>
    </div>
  );
};
