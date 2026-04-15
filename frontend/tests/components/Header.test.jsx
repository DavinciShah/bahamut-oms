import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../src/components/Common/Header';
import { AuthContext } from '../../src/context/AuthContext';

const renderWithContext = (user, isAdmin = false) => {
  const logout = vi.fn();
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user, isAdmin, logout, isAuthenticated: Boolean(user), loading: false, token: 'tok' }}
      >
        <Header />
      </AuthContext.Provider>
    </MemoryRouter>
  );
  return { logout };
};

describe('Header', () => {
  it('renders the app name', () => {
    renderWithContext(null);
    expect(screen.getByText(/bahamut oms/i)).toBeTruthy();
  });

  it('shows user name when authenticated', () => {
    renderWithContext({ name: 'Alice', email: 'alice@test.com', role: 'user' });
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('shows Admin badge for admin user', () => {
    renderWithContext({ name: 'Bob', email: 'bob@test.com', role: 'admin' }, true);
    expect(screen.getByText(/admin/i)).toBeTruthy();
  });

  it('does not show Admin badge for regular user', () => {
    renderWithContext({ name: 'Charlie', email: 'charlie@test.com', role: 'user' }, false);
    const adminBadge = screen.queryByText(/^admin$/i);
    expect(adminBadge).toBeNull();
  });

  it('shows logout button when authenticated', () => {
    renderWithContext({ name: 'Alice', email: 'alice@test.com', role: 'user' });
    expect(screen.getByRole('button', { name: /logout/i })).toBeTruthy();
  });
});
