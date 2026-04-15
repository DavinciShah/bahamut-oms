import { Link, useNavigate } from 'react-router-dom';

function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--gray-50)',
      }}
    >
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔒</div>
      <h1 style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--gray-300)', marginBottom: '0.5rem' }}>
        403
      </h1>
      <h2 style={{ marginBottom: '0.75rem', color: 'var(--gray-700)' }}>Access Denied</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', maxWidth: 360 }}>
        You don't have permission to access this page.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
        <Link to="/dashboard" className="btn btn-primary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
