import { useState } from 'react';
import { validateRegisterForm } from '../../utils/validators';

function RegisterForm({ onSubmit, loading }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    consent: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(values);
  };

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', autoComplete: 'name' },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
    { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {fields.map(({ id, label, type, placeholder, autoComplete }) => (
        <div className="form-group" key={id}>
          <label className="form-label" htmlFor={id}>{label}</label>
          <input
            id={id}
            name={id}
            type={type}
            className={`form-control${errors[id] ? ' is-invalid' : ''}`}
            value={values[id]}
            onChange={handleChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
          />
          {errors[id] && <span className="form-error">{errors[id]}</span>}
        </div>
      ))}

      <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '1rem' }}>
        <input
          id="consent"
          name="consent"
          type="checkbox"
          checked={values.consent}
          onChange={handleChange}
          style={{ marginTop: '4px', width: 'auto' }}
        />
        <label htmlFor="consent" style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.4', cursor: 'pointer' }}>
          I agree to the <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Privacy Policy</a> governed under the Digital Personal Data Protection (DPDP) Act, 2023 of India.
        </label>
      </div>
      {errors.consent && (
        <span className="form-error" style={{ display: 'block', fontSize: '12px', color: 'red', marginTop: '4px' }}>
          {errors.consent}
        </span>
      )}

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
        style={{ marginTop: '1rem' }}
      >
        {loading ? 'Creating Account…' : 'Create Account'}
      </button>
    </form>
  );
}

export default RegisterForm;
