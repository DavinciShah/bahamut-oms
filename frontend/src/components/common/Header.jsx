import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME } from '../../utils/constants';

function Header() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-height)',
        backgroundColor: 'white',
        borderBottom: '1px solid var(--gray-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 200,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <Link
        to="/dashboard"
        style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: 'var(--primary-color)',
          textDecoration: 'none',
        }}
      >
        {APP_NAME}
      </Link>

      <div className="header-nav d-flex align-items-center gap-4">
        {user && (
          <>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
              {user.name || user.email}
            </span>
            {isAdmin && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.1rem 0.5rem',
                  borderRadius: 'var(--border-radius-full)',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Admin
              </span>
            )}
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
