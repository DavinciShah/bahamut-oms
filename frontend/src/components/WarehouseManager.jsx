import { useState, useEffect } from 'react';
import warehouseService from '../services/warehouseService';

export default function WarehouseManager() {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ name: '', address: '', capacity: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = () => {
    warehouseService.getAll()
      .then(res => setWarehouses(res.data || []))
      .catch(err => setError(err.message));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await warehouseService.update(editing, form);
        setEditing(null);
      } else {
        await warehouseService.create(form);
      }
      setForm({ name: '', address: '', capacity: '' });
      loadWarehouses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this warehouse?')) return;
    try {
      await warehouseService.delete(id);
      loadWarehouses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (warehouse) => {
    setEditing(warehouse.id);
    setForm({ name: warehouse.name, address: warehouse.address || '', capacity: warehouse.capacity || '' });
  };

  return (
    <div>
      <h3>Warehouses</h3>
      {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Name" required value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <input
          placeholder="Address" value={form.address}
          onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <input
          type="number" placeholder="Capacity" value={form.capacity}
          onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', width: 100 }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {editing ? 'Update' : 'Add Warehouse'}
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setForm({ name: '', address: '', capacity: '' }); }}
            style={{ padding: '8px 16px', background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </form>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {warehouses.map(w => (
          <div key={w.id} style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 600 }}>{w.name}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{w.address || 'No address'}</div>
            {w.capacity && <div style={{ fontSize: 13, color: '#64748b' }}>Capacity: {w.capacity}</div>}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => handleEdit(w)} style={{ padding: '4px 12px', background: '#e2e8f0', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Edit</button>
              <button onClick={() => handleDelete(w.id)} style={{ padding: '4px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Delete</button>
            </div>
          </div>
        ))}
        {warehouses.length === 0 && <div style={{ color: '#64748b' }}>No warehouses found.</div>}
      </div>
    </div>
  );
}
