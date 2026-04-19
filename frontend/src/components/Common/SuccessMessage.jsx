import { useState } from 'react';

function SuccessMessage({ message, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !message) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 'var(--border-radius-md)',
        color: '#166534',
        marginBottom: '1rem',
      }}
    >
      <span style={{ flexShrink: 0, fontSize: '1rem' }}>✅</span>
      <span style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>{message}</span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#166534',
          fontSize: '1rem',
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default SuccessMessage;
