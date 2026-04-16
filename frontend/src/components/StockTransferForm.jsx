import { useState, useEffect } from 'react';
import inventoryService from '../services/inventoryService';
import warehouseService from '../services/warehouseService';

export default function StockTransferForm({ onSuccess }) {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ from_warehouse_id: '', to_warehouse_id: '', product_id: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([warehouseService.getAll(), inventoryService.getLevels()])
      .then(([wRes, iRes]) => {
        setWarehouses(wRes.data || []);
        setProducts(iRes.data || []);
      })
      .catch(err => setError(err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await inventoryService.transfer({
        from_warehouse_id: form.from_warehouse_id,
        to_warehouse_id: form.to_warehouse_id,
        product_id: form.product_id,
        quantity: parseInt(form.quantity)
      });
      setSuccess('Stock transfer completed successfully');
      setForm({ from_warehouse_id: '', to_warehouse_id: '', product_id: '', quantity: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );

  const selectStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', width: '100%' };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 480 }}>
      <h3 style={{ marginBottom: 16 }}>Transfer Stock</h3>
      {error && <div style={{ color: '#dc2626', marginBottom: 8, fontSize: 14 }}>{error}</div>}
      {success && <div style={{ color: '#16a34a', marginBottom: 8, fontSize: 14 }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <Field label="From Warehouse">
          <select value={form.from_warehouse_id} onChange={e => setForm(p => ({ ...p, from_warehouse_id: e.target.value }))} required style={selectStyle}>
            <option value="">Select warehouse</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </Field>
        <Field label="To Warehouse">
          <select value={form.to_warehouse_id} onChange={e => setForm(p => ({ ...p, to_warehouse_id: e.target.value }))} required style={selectStyle}>
            <option value="">Select warehouse</option>
            {warehouses.filter(w => w.id !== form.from_warehouse_id).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </Field>
        <Field label="Product">
          <select value={form.product_id} onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))} required style={selectStyle}>
            <option value="">Select product</option>
            {[...new Map(products.map(p => [p.product_id, p])).values()].map(p => (
              <option key={p.product_id} value={p.product_id}>{p.product_name || p.product_id}</option>
            ))}
          </select>
        </Field>
        <Field label="Quantity">
          <input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required style={selectStyle} />
        </Field>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', width: '100%' }}>
          {loading ? 'Transferring...' : 'Transfer Stock'}
        </button>
      </form>
    </div>
  );
}
