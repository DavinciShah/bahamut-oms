import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import ErrorAlert from '../components/Common/ErrorAlert';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(email, password);
      const user = data.user || data;
      const tokens = data.tokens || data.token || data.access_token || data;
      login(user, tokens);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>Bahamut OMS</h1>
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '1.5rem', fontSize: 'var(--font-size-sm)' }}>
          Sign in to your account
        </p>
        <ErrorAlert message={error} />
        <LoginForm onSubmit={handleSubmit} loading={loading} />
        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
