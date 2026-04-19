import { formatCurrency } from '../../utils/formatters';
import StockIndicator from './StockIndicator';

function ProductCard({ product, onEdit, onDelete }) {
  const stock = product.stock_quantity ?? product.stock ?? 0;

  return (
    <div className="product-card">
      <div className="product-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', margin: 0 }}>
            {product.name}
          </h4>
          <span
            style={{
              fontSize: '0.7rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--border-radius-full)',
              backgroundColor: 'var(--gray-100)',
              color: 'var(--gray-600)',
              whiteSpace: 'nowrap',
              marginLeft: '0.5rem',
            }}
          >
            {product.category || 'Uncategorized'}
          </span>
        </div>

        {product.sku && (
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
            SKU: {product.sku}
          </p>
        )}

        {product.description && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            {product.description.length > 80
              ? product.description.slice(0, 80) + '…'
              : product.description}
          </p>
        )}

        <StockIndicator quantity={stock} />
      </div>

      <div className="product-card-footer">
        <span style={{ fontWeight: '700', fontSize: 'var(--font-size-lg)', color: 'var(--gray-900)' }}>
          {formatCurrency(product.price)}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onEdit && (
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(product)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(product)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
