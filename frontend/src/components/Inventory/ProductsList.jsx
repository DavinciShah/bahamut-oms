import ProductCard from './ProductCard';
import SearchBar from '../Common/SearchBar';
import LoadingSpinner from '../Common/LoadingSpinner';

function ProductsList({ products = [], loading, onSearch, onEdit, onDelete }) {
  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <SearchBar onSearch={onSearch} placeholder="Search products…" />
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Add products to the inventory to get started.</p>
        </div>
      ) : (
        <div
          className="products-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsList;
