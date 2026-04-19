import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../../src/pages/DashboardPage';
import { AuthContext } from '../../src/context/AuthContext';

vi.mock('../../src/services/adminService', () => ({
  adminService: {
    getStats: vi.fn().mockResolvedValue({
      total_orders: 42,
      total_revenue: 9876.5,
      total_products: 15,
      total_users: 8,
    }),
  },
}));

vi.mock('../../src/services/ordersService', () => ({
  ordersService: {
    getOrders: vi.fn().mockResolvedValue({ orders: [], total: 0 }),
  },
}));

// Chart.js uses canvas which is unavailable in jsdom — mock the Charts component
vi.mock('../../src/components/Dashboard/Charts', () => ({
  default: ({ title }) => <div data-testid="chart">{title}</div>,
}));

const adminUser = { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' };

const renderDashboard = () => {
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          user: adminUser,
          isAdmin: true,
          isAuthenticated: true,
          token: 'tok',
          loading: false,
          login: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <DashboardPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('DashboardPage', () => {
  it('renders Dashboard title', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('renders stat labels after loading', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Total Orders')).toBeTruthy();
      expect(screen.getByText('Total Revenue')).toBeTruthy();
    });
  });

  it('renders Recent Orders section', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeTruthy();
    });
  });
});
