import { Link } from 'react-router-dom';

function NotFoundPage() {
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
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔍</div>
      <h1 style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--gray-300)', marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ marginBottom: '0.75rem', color: 'var(--gray-700)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', maxWidth: 360 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        ← Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
