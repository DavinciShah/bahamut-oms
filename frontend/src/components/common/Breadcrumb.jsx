import { Link } from 'react-router-dom';
export default function Breadcrumb({ items }) {
  return (
    <nav style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#64748b', marginBottom: 16 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span>/</span>}
          {item.path ? <Link to={item.path} style={{ color: '#3b82f6', textDecoration: 'none' }}>{item.label}</Link> : <span style={{ color: '#1e293b' }}>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
