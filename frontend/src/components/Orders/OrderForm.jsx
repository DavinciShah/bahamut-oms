import { useState, useEffect } from 'react';
import { productsService } from '../../services/productsService';
import { formatCurrency } from '../../utils/formatters';
import { validateOrderForm } from '../../utils/validators';
import ErrorAlert from '../Common/ErrorAlert';

function OrderForm({ onSubmit, loading }) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    productsService.getProducts().then((data) => {
      setProducts(data.products || data || []);
    }).catch(() => setLoadError('Failed to load products.'));
  }, []);

  const addItem = () => setItems((prev) => [...prev, { productId: '', quantity: 1 }]);

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const updateItem = (index, field, value) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );

  const getProduct = (id) => products.find((p) => String(p.id) === String(id));

  const total = items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product?.price || 0) * (Number(item.quantity) || 0);
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    const formErrors = validateOrderForm({ items: validItems, shippingAddress });
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    onSubmit({
      items: validItems.map((i) => ({ product_id: i.productId, quantity: Number(i.quantity) })),
      shipping_address: shippingAddress,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {loadError && <ErrorAlert message={loadError} />}

      <div className="form-section">
        <h4 className="form-section-title">Order Items</h4>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 2, margin: 0 }}>
              {index === 0 && <label className="form-label">Product</label>}
              <select
                className="form-control"
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', e.target.value)}
              >
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.price)} (stock: {p.stock_quantity ?? p.stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              {index === 0 && <label className="form-label">Qty</label>}
              <input
                type="number"
                className="form-control"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              />
            </div>
            <div style={{ paddingBottom: '0.125rem' }}>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {errors.items && <span className="form-error">{errors.items}</span>}
        <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
          + Add Item
        </button>
      </div>

      <div
        style={{
          background: 'var(--gray-50)',
          borderRadius: 'var(--border-radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--gray-700)',
        }}
      >
        <strong>Estimated Total: {formatCurrency(total)}</strong>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="shippingAddress">Shipping Address</label>
        <textarea
          id="shippingAddress"
          className={`form-control${errors.shippingAddress ? ' is-invalid' : ''}`}
          rows={3}
          value={shippingAddress}
          onChange={(e) => {
            setShippingAddress(e.target.value);
            setErrors((prev) => ({ ...prev, shippingAddress: undefined }));
          }}
          placeholder="Street, City, State, ZIP"
        />
        {errors.shippingAddress && <span className="form-error">{errors.shippingAddress}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          className="form-control"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions…"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Placing Order…' : 'Place Order'}
        </button>
      </div>
    </form>
  );
}

export default OrderForm;
