import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';
import OrdersList from '../components/Orders/OrdersList';
import SearchBar from '../components/Common/SearchBar';
import Pagination from '../components/Common/Pagination';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import { useFetch } from '../hooks/useFetch';
import { ordersService } from '../services/ordersService';
import { ORDER_STATUSES, ITEMS_PER_PAGE } from '../utils/constants';

function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(
    () => ordersService.getOrders({ page, limit: ITEMS_PER_PAGE, search, status: statusFilter }),
    [page, search, statusFilter]
  );

  const { data, loading, error } = useFetch(fetchOrders, [page, search, statusFilter]);

  const orders = data?.orders || data || [];
  const total = data?.total || orders.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Orders</h2>
            <Link to="/orders/create" className="btn btn-primary">+ New Order</Link>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <SearchBar
              onSearch={(q) => { setSearch(q); setPage(1); }}
              placeholder="Search orders…"
            />
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              {Object.values(ORDER_STATUSES).map((s) => (
                <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
              ))}
            </select>
          </div>

          {error && <ErrorAlert message={error} />}
          {loading ? <LoadingSpinner /> : <OrdersList orders={orders} />}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default OrdersPage;
