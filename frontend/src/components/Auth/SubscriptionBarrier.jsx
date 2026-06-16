import React from 'react';

export default function SubscriptionBarrier() {
  const handleManage = () => {
    if (window.desktopApp?.manageSubscription) {
      window.desktopApp.manageSubscription();
    } else {
      window.open('https://account.microsoft.com/services', '_blank');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      minHeight: '60vh',
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 32,
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          fontSize: 48,
          marginBottom: 16,
          display: 'inline-block',
          background: '#fee2e2',
          padding: 16,
          borderRadius: '50%',
          width: 50,
          height: 50,
          lineHeight: '50px',
          textAlign: 'center'
        }}>
          🔒
        </div>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 12px 0'
        }}>
          Premium Feature Locked
        </h3>
        <p style={{
          fontSize: 14,
          color: '#64748b',
          lineHeight: 1.6,
          margin: '0 0 24px 0'
        }}>
          This feature requires an active monthly subscription. Unlock advanced metrics, AI engine insights, and complete build log integrations.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleManage}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            Manage Subscription in Store
          </button>
          
          <a
            href="#/dashboard"
            style={{
              fontSize: 13,
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            Return to Command Deck
          </a>
        </div>
      </div>
    </div>
  );
}
