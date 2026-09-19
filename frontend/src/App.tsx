import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { Breadcrumbs } from './components/Breadcrumbs.js';
import { LandingPage } from './pages/LandingPage.js';
import { ChatApp } from './pages/ChatApp.js';
import { PricingPage } from './pages/PricingPage.js';
import { DocsPage } from './pages/DocsPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ConnectionStatus } from './types.js';
import { wsClient } from './services/websocket.js';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return ['/', '/app', '/pricing', '/docs'].includes(path) ? path : '/';
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Synchronize browser history and canonical tag on route change
  const navigate = useCallback((route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);

    // Update canonical link element dynamically for SEO
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://pulsechat.io${route === '/' ? '' : route}`;
  }, []);

  // Listen for browser forward/back buttons
  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // WebSocket status subscription
  useEffect(() => {
    const unsub = wsClient.onStatusChange(setConnectionStatus);
    return () => unsub();
  }, []);

  // Synthesized Web Audio chime on incoming chat message
  const playAudioChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Compute breadcrumbs
  const getBreadcrumbs = () => {
    switch (currentRoute) {
      case '/app':
        return [{ label: 'Real-Time Workspace', path: '/app' }];
      case '/pricing':
        return [{ label: 'Pricing & Tiers', path: '/pricing' }];
      case '/docs':
        return [{ label: 'Protocol Specs & Docs', path: '/docs' }];
      case '/':
        return [];
      default:
        return [{ label: '404 Lost in Orbit', path: currentRoute }];
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentRoute={currentRoute}
        onNavigate={navigate}
        connectionStatus={currentRoute === '/app' ? connectionStatus : undefined}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {currentRoute !== '/' && (
        <Breadcrumbs crumbs={getBreadcrumbs()} onNavigate={navigate} />
      )}

      <div style={{ flex: 1 }}>
        {currentRoute === '/' && <LandingPage onNavigate={navigate} />}
        {currentRoute === '/app' && <ChatApp soundEnabled={soundEnabled} onPlayChime={playAudioChime} />}
        {currentRoute === '/pricing' && <PricingPage onNavigate={navigate} />}
        {currentRoute === '/docs' && <DocsPage onNavigate={navigate} />}
        {!['/', '/app', '/pricing', '/docs'].includes(currentRoute) && (
          <NotFoundPage onNavigate={navigate} />
        )}
      </div>

      {currentRoute !== '/app' && <Footer onNavigate={navigate} />}
    </div>
  );
}
export default App;
