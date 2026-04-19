const colors = {
  active: { bg: '#dcfce7', text: '#16a34a' },
  inactive: { bg: '#f1f5f9', text: '#64748b' },
  pending: { bg: '#fef9c3', text: '#ca8a04' },
  success: { bg: '#dcfce7', text: '#16a34a' },
  danger: { bg: '#fee2e2', text: '#dc2626' },
  warning: { bg: '#fef3c7', text: '#d97706' },
  info: { bg: '#dbeafe', text: '#2563eb' },
};
export default function Badge({ label, variant = 'info' }) {
  const c = colors[variant] || colors.info;
  return (
    <span style={{ background: c.bg, color: c.text, padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{label}</span>
  );
}
