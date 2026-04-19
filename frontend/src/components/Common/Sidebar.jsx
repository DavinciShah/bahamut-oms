import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { to: '/dashboard', label: '🏠 Dashboard' },
  { to: '/orders', label: '📦 Orders' },
  { to: '/inventory', label: '🗃️ Inventory' },
  { to: '/profile', label: '👤 Profile' },
];

const adminLinks = [
  { to: '/users', label: '👥 Users' },
  { to: '/admin', label: '⚙️ Admin Dashboard' },
];

const linkStyle = {
  display: 'block',
  padding: '0.625rem 1.25rem',
  color: 'var(--gray-300)',
  textDecoration: 'none',
  fontSize: 'var(--font-size-sm)',
  borderRadius: 'var(--border-radius-md)',
  margin: '0.125rem 0.5rem',
  transition: 'background-color 0.15s ease, color 0.15s ease',
};

function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <nav
      style={{
        paddingTop: '1rem',
        height: '100%',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              ...linkStyle,
              backgroundColor: isActive ? 'rgba(37,99,235,0.25)' : 'transparent',
              color: isActive ? 'white' : 'var(--gray-300)',
            })}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {isAdmin && (
        <div
          style={{
            borderTop: '1px solid var(--gray-700)',
            paddingTop: '1rem',
            marginTop: '0.5rem',
          }}
        >
          <p
            style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--gray-500)',
              padding: '0 1.25rem',
              marginBottom: '0.5rem',
            }}
          >
            Admin
          </p>
          {adminLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...linkStyle,
                backgroundColor: isActive ? 'rgba(37,99,235,0.25)' : 'transparent',
                color: isActive ? 'white' : 'var(--gray-300)',
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Sidebar;
