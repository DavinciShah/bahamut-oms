import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/orders', label: 'Orders' },
  { to: '/products', label: 'Products' },
  { to: '/users', label: 'Users' },
  { to: '/accounting', label: 'Accounting' },
];

export default function Sidebar() {
  return (
    <nav style={{ width: 220, background: '#0f172a', minHeight: '100vh', padding: '24px 0' }}>
      {links.map(({ to, label }) => (
        <NavLink key={to} to={to} style={({ isActive }) => ({ display: 'block', padding: '10px 24px', color: isActive ? '#60a5fa' : '#94a3b8', textDecoration: 'none', fontSize: 14, background: isActive ? 'rgba(96,165,250,0.1)' : 'transparent' })}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
