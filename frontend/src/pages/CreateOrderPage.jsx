import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';
import OrderForm from '../components/Orders/OrderForm';
import ErrorAlert from '../components/Common/ErrorAlert';
import { ordersService } from '../services/ordersService';

function CreateOrderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (orderData) => {
    setLoading(true);
    setError('');
    try {
      const result = await ordersService.createOrder(orderData);
      const orderId = result.order?.id || result.id;
      navigate(orderId ? `/orders/${orderId}` : '/orders');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Create Order</h2>
          </div>

          <div className="card" style={{ maxWidth: 720 }}>
            <div className="card-body">
              <ErrorAlert message={error} />
              <OrderForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default CreateOrderPage;
