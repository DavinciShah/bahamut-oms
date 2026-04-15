import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RegisterForm from '../../src/components/Auth/RegisterForm';

describe('RegisterForm', () => {
  it('renders all form fields', () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={false} />);
    expect(screen.getByLabelText(/full name/i)).toBeTruthy();
    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(screen.getByLabelText(/^password$/i)).toBeTruthy();
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy();
  });

  it('renders the submit button', () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={false} />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeTruthy();
  });

  it('shows loading state', () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByRole('button').textContent).toMatch(/creating account/i);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('validates required fields', async () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={false} />);
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeTruthy();
    });
  });

  it('validates password mismatch', async () => {
    render(<RegisterForm onSubmit={vi.fn()} loading={false} />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass456' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
    });
  });

  it('calls onSubmit with valid data', async () => {
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} loading={false} />);
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe', email: 'jane@example.com', password: 'secret123' })
      );
    });
  });
});
