import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';
import ProductForm from '../components/Inventory/ProductForm';
import ErrorAlert from '../components/Common/ErrorAlert';
import SuccessMessage from '../components/Common/SuccessMessage';
import { productsService } from '../services/productsService';

function CreateProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    try {
      await productsService.createProduct({
        ...values,
        price: Number(values.price),
        stock_quantity: Number(values.stock_quantity),
      });
      setSuccess('Product created successfully!');
      setTimeout(() => navigate('/inventory'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create product.');
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
            <h2 className="page-title">Add Product</h2>
            <Link to="/inventory" className="btn btn-secondary">← Back</Link>
          </div>

          <div className="card" style={{ maxWidth: 640 }}>
            <div className="card-body">
              <SuccessMessage message={success} />
              <ErrorAlert message={error} />
              <ProductForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Product" />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default CreateProductPage;
