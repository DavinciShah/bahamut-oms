import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import ErrorAlert from '../components/Common/ErrorAlert';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleGoogleSuccess,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
        setGoogleReady(true);
      }
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      
      const user = response.user;
      const token = response.token;
      
      if (!user || !token) {
        throw new Error('Invalid response from server');
      }
      
      login(user, token);
      // Navigation will happen via useEffect when isAuthenticated updates
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setError('');
    try {
      const credential = response.credential;
      const data = await authService.loginWithGoogle(credential);
      const user = data.user || data;
      const tokens = data.tokens || data.token || data.access_token || data;
      login(user, tokens);
    } catch (err) {
      setError(err?.response?.data?.message || 'Google sign-in failed. Please try again.');
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
        
        {googleReady && (
          <>
            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--gray-300)' }}></div>
              <span style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--gray-300)' }}></div>
            </div>
            <div id="google-signin-button" style={{ display: 'flex', justifyContent: 'center' }}></div>
          </>
        )}

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
