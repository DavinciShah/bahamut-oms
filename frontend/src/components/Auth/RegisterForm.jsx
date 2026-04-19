import { useState } from 'react';
import { validateRegisterForm } from '../../utils/validators';

function RegisterForm({ onSubmit, loading }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
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

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
        style={{ marginTop: '0.5rem' }}
      >
        {loading ? 'Creating Account…' : 'Create Account'}
      </button>
    </form>
  );
}

export default RegisterForm;
