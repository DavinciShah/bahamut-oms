import { useState } from 'react';
export default function ErrorAlert({ message, onClose }) {
  const [visible, setVisible] = useState(true);
  if (!visible || !message) return null;
  return (
    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <span style={{ color: '#dc2626', fontSize: 14 }}>{message}</span>
      <button onClick={() => { setVisible(false); onClose?.(); }} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18 }}>&times;</button>
    </div>
  );
}
