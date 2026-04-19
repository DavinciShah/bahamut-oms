import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';
import OrderDetails from '../components/Orders/OrderDetails';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import { useFetch } from '../hooks/useFetch';
import { ordersService } from '../services/ordersService';

function OrderDetailsPage() {
  const { id } = useParams();

  const fetchOrder = useCallback(() => ordersService.getOrderById(id), [id]);
  const { data, loading, error, refetch } = useFetch(fetchOrder, [id]);

  const order = data?.order || data;

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Order Details</h2>
            <Link to="/orders" className="btn btn-secondary">← Back to Orders</Link>
          </div>

          {error && <ErrorAlert message={error} />}
          {loading ? <LoadingSpinner /> : <OrderDetails order={order} onUpdated={refetch} />}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default OrderDetailsPage;
