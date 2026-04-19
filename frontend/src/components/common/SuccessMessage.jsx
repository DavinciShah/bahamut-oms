import { useState, useEffect } from 'react';
export default function SuccessMessage({ message, autoDismiss = 3000 }) {
  const [visible, setVisible] = useState(!!message);
  useEffect(() => {
    if (message) { setVisible(true); if (autoDismiss) { const t = setTimeout(() => setVisible(false), autoDismiss); return () => clearTimeout(t); } }
  }, [message, autoDismiss]);
  if (!visible || !message) return null;
  return (
    <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 6, padding: '12px 16px', color: '#16a34a', fontSize: 14, marginBottom: 16 }}>
      {message}
    </div>
  );
}
