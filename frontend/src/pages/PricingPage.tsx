import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (route: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = 'PulseChat — Pricing & High-Throughput Cluster Tiers | 2026';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Explore transparent pricing plans for PulseChat. From developer free tiers to high-throughput enterprise Redis & PostgreSQL clusters.');
    }
  }, []);

  const tiers = [
    {
      name: 'Developer Community',
      price: '$0',
      period: 'forever',
      description: 'Ideal for small open-source projects, indie hackathons, and local development.',
      features: [
        'Up to 1,000 Concurrent WebSocket Connections',
        'Redis Pub/Sub Local & Managed Mesh',
        'PostgreSQL Message Storage (7-day retention)',
        'Standard Typing & Presence Telemetry',
        'Community Discord & Forum Support'
      ],
      cta: 'Get Started Free',
      highlighted: false
    },
    {
      name: 'High-Velocity Team',
      price: '$49',
      period: 'per month',
      description: 'Engineered for growing SaaS platforms, customer support teams, and production communities.',
      features: [
        'Up to 50,000 Concurrent WebSocket Connections',
        'Multi-Region Distributed Redis Pub/Sub Mesh',
        'Unlimited PostgreSQL Message History & Search',
        'Ponytail Browser Extension Integration Suite',
        'Priority SLA & Zero-Downtime Migration Support',
        'Custom Webhook & Event Ingress APIs'
      ],
      cta: 'Deploy Team Cluster',
      highlighted: true
    },
    {
      name: 'Enterprise Scale',
      price: 'Custom',
      period: 'annual contract',
      description: 'Dedicated multi-tenant clusters, custom VPC peering, SOC2 compliance, and 99.99% uptime SLA.',
      features: [
        'Unlimited Concurrent WebSocket Connections',
        'Dedicated Kubernetes Pod Fleet & Redis Shards',
        'On-Premises or Private Cloud VPC Deployment',
        'Custom Data Retention & Encryption Key Control (BYOK)',
        '24/7 Dedicated Engineering SRE Team'
      ],
      cta: 'Contact Architecture Team',
      highlighted: false
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        {/* Unique <h1> */}
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 800, marginBottom: '1rem' }}>
          Transparent Pricing for <span className="text-gradient">Real-Time Scale</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
          No hidden fees. Scale effortlessly from single-node instances to global multi-region Redis WebSocket fleets.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem'
      }}>
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="glass-panel"
            style={{
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              borderColor: tier.highlighted ? 'var(--accent-cyan)' : 'var(--border-subtle)',
              boxShadow: tier.highlighted ? '0 0 30px rgba(0, 229, 255, 0.15)' : 'var(--shadow-card)'
            }}
          >
            {tier.highlighted && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)',
                color: '#0a0d14',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.25rem 1rem',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.05em'
              }}>
                MOST POPULAR
              </div>
            )}

            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>{tier.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', minHeight: '40px', marginBottom: '1.5rem' }}>
              {tier.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {tier.price}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                / {tier.period}
              </span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem', flex: 1 }}>
              {tier.features.map((feat) => (
                <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--accent-cyan)" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onNavigate('/app')}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.95rem',
                background: tier.highlighted ? 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)' : 'rgba(255, 255, 255, 0.05)',
                color: tier.highlighted ? '#0a0d14' : 'var(--text-primary)',
                border: '1px solid',
                borderColor: tier.highlighted ? 'transparent' : 'var(--border-subtle)',
                boxShadow: tier.highlighted ? '0 0 20px rgba(0, 229, 255, 0.3)' : 'none'
              }}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
