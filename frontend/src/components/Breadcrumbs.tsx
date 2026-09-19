import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface Crumb {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
  onNavigate: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ crumbs, onNavigate }) => {
  // Generate JSON-LD BreadcrumbList Schema for Google rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.label,
      'item': `https://pulsechat.io${crumb.path}`
    }))
  };

  return (
    <nav 
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <button
        onClick={() => onNavigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          color: 'var(--text-secondary)'
        }}
        title="Home"
      >
        <Home size={14} />
      </button>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <React.Fragment key={crumb.path}>
            <ChevronRight size={14} color="var(--text-muted)" />
            {isLast ? (
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }} aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(crumb.path)}
                style={{ color: 'var(--text-secondary)' }}
              >
                {crumb.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
