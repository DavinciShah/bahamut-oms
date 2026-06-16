import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * FreeTierBanner – shown to free-plan users.
 * Displays current monthly order usage and an upgrade call-to-action.
 *
 * Props:
 *   ordersUsed  {number} – orders placed this calendar month
 *   orderLimit  {number} – monthly cap (20 for free tier)
 */
function FreeTierBanner({ ordersUsed = 0, orderLimit = 20 }) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('freeBannerDismissed') === '1'
  );

  if (dismissed) return null;

  const remaining = Math.max(0, orderLimit - ordersUsed);
  const pct = Math.min(100, Math.round((ordersUsed / orderLimit) * 100));
  const nearLimit = remaining <= 3;

  const handleDismiss = () => {
    sessionStorage.setItem('freeBannerDismissed', '1');
    setDismissed(true);
  };

  return (
    <div
      role="banner"
      style={{
        background: nearLimit ? '#fff7ed' : '#eff6ff',
        border: `1px solid ${nearLimit ? '#fb923c' : '#93c5fd'}`,
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: 22, flexShrink: 0 }}>{nearLimit ? '⚠️' : '🎯'}</span>

      {/* Usage text + progress */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: nearLimit ? '#9a3412' : '#1e40af', marginBottom: 4 }}>
          Free Plan — {ordersUsed}/{orderLimit} orders used this month
          {remaining === 0 && ' (limit reached)'}
        </div>
        <div
          style={{
            height: 6,
            background: '#e2e8f0',
            borderRadius: 4,
            overflow: 'hidden',
            maxWidth: 260,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: nearLimit ? '#f97316' : '#3b82f6',
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
          {remaining > 0
            ? `${remaining} order${remaining !== 1 ? 's' : ''} remaining — upgrade for unlimited access`
            : 'Upgrade to place more orders'}
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/billing"
        style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 18px',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          textDecoration: 'none',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        Upgrade Plan →
      </Link>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          fontSize: 18,
          padding: '0 4px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default FreeTierBanner;
