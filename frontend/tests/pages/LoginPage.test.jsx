import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';
import { AuthContext } from '../../src/context/AuthContext';

vi.mock('../../src/services/authService', () => ({
  default: {
    login: vi.fn(),
  },
}));

const renderLoginPage = () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthContext.Provider
        value={{ login: vi.fn(), isAuthenticated: false, loading: false, user: null, token: null }}
      >
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('LoginPage', () => {
  it('renders the page heading', () => {
    renderLoginPage();
    expect(screen.getAllByText(/bahamut oms/i).length).toBeGreaterThan(0);
  });

  it('renders the sign in subheading', () => {
    renderLoginPage();
    expect(screen.getByText(/sign in to your account/i)).toBeTruthy();
  });

  it('renders the login form', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });

  it('renders the register link', () => {
    renderLoginPage();
    expect(screen.getByText(/create one/i)).toBeTruthy();
  });
});
