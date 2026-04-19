import { useState } from 'react';
import { validateLoginForm } from '../../utils/validators';

function LoginForm({ onSubmit, loading }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          className={`form-control${errors.email ? ' is-invalid' : ''}`}
          value={values.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className={`form-control${errors.password ? ' is-invalid' : ''}`}
          value={values.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {errors.password && <span className="form-error">{errors.password}</span>}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
        style={{ marginTop: '0.5rem' }}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

export default LoginForm;
