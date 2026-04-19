import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../../src/components/Auth/LoginForm';

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm onSubmit={vi.fn()} loading={false} />);
    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });

  it('renders the submit button', () => {
    render(<LoginForm onSubmit={vi.fn()} loading={false} />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  it('shows loading state on submit button', () => {
    render(<LoginForm onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByRole('button').textContent).toMatch(/signing in/i);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows validation errors when fields are empty', async () => {
    render(<LoginForm onSubmit={vi.fn()} loading={false} />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeTruthy();
      expect(screen.getByText(/password is required/i)).toBeTruthy();
    });
  });

  it('shows error for invalid email format', async () => {
    render(<LoginForm onSubmit={vi.fn()} loading={false} />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });
  });

  it('calls onSubmit with email and password when valid', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} loading={false} />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});
