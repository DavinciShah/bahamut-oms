import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';
import ProductsList from '../components/Inventory/ProductsList';
import Pagination from '../components/Common/Pagination';
import ErrorAlert from '../components/Common/ErrorAlert';
import { useFetch } from '../hooks/useFetch';
import { productsService } from '../services/productsService';
import { useAuth } from '../hooks/useAuth';
import { ITEMS_PER_PAGE } from '../utils/constants';

function InventoryPage() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchProducts = useCallback(
    () => productsService.getProducts({ page, limit: ITEMS_PER_PAGE, search, category }),
    [page, search, category]
  );

  const { data, loading, error, refetch } = useFetch(fetchProducts, [page, search, category]);

  const products = data?.products || data || [];
  const total = data?.total || products.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Inventory</h2>
            {isAdmin && (
              <Link to="/inventory/create" className="btn btn-primary">+ Add Product</Link>
            )}
          </div>

          {error && <ErrorAlert message={error} />}

          <ProductsList
            products={products}
            loading={loading}
            onSearch={(q) => { setSearch(q); setPage(1); }}
          />

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

export default InventoryPage;
