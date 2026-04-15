import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
import ErrorAlert from '../components/Common/ErrorAlert';
import SuccessMessage from '../components/Common/SuccessMessage';
import authService from '../services/authService';

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async ({ name, email, password }) => {
    setLoading(true);
    setError('');
    try {
      await authService.register(name, email, password);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>Bahamut OMS</h1>
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '1.5rem', fontSize: 'var(--font-size-sm)' }}>
          Create a new account
        </p>
        <SuccessMessage message={success} />
        <ErrorAlert message={error} />
        <RegisterForm onSubmit={handleSubmit} loading={loading} />
        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
