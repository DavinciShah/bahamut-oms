import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../src/components/Auth/ProtectedRoute';
import { useAuth } from '../../src/hooks/useAuth';

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

const renderProtected = (requiredRole) => {
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while auth state is loading', () => {
    useAuth.mockReturnValue({
      loading: true,
      isAuthenticated: false,
      isAdmin: false
    });

    renderProtected();

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login page', () => {
    useAuth.mockReturnValue({
      loading: false,
      isAuthenticated: false,
      isAdmin: false
    });

    renderProtected();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects non-admin users when admin role is required', () => {
    useAuth.mockReturnValue({
      loading: false,
      isAuthenticated: true,
      isAdmin: false
    });

    renderProtected('admin');

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });

  it('renders child content for authorized users', () => {
    useAuth.mockReturnValue({
      loading: false,
      isAuthenticated: true,
      isAdmin: true
    });

    renderProtected('admin');

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
