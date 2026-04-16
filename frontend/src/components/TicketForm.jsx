import { useState } from 'react';
import ticketService from '../services/ticketService';

export default function TicketForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({ subject: '', priority: 'medium', category: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await ticketService.createTicket(form);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginBottom: 16 }}>Create Support Ticket</h3>
      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 14 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Subject</label>
          <input style={inputStyle} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required placeholder="Describe your issue..." />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Priority</label>
            <select style={inputStyle} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Category</label>
            <select style={inputStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="">General</option>
              <option value="billing">Billing</option>
              <option value="shipping">Shipping</option>
              <option value="order">Order Issue</option>
              <option value="technical">Technical</option>
              <option value="returns">Returns</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} style={{ padding: '8px 20px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
