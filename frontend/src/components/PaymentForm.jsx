import { useState } from 'react';
import paymentService from '../services/paymentService';

export default function PaymentForm({ amount, onSuccess, onError }) {
  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvc: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await paymentService.createPaymentIntent({ amount });
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' };
  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );

  const formatCard = (val) => val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (val) => val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 400 }}>
      <h3 style={{ marginBottom: 20 }}>Payment Details</h3>
      {amount && <div style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>Total: ${parseFloat(amount).toFixed(2)}</div>}
      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 14 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <Field label="Cardholder Name">
          <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Smith" required />
        </Field>
        <Field label="Card Number">
          <input style={inputStyle} value={form.cardNumber}
            onChange={e => setForm(p => ({ ...p, cardNumber: formatCard(e.target.value) }))}
            placeholder="1234 5678 9012 3456" required maxLength={19} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Expiry">
            <input style={inputStyle} value={form.expiry}
              onChange={e => setForm(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
              placeholder="MM/YY" required maxLength={5} />
          </Field>
          <Field label="CVC">
            <input style={inputStyle} value={form.cvc}
              onChange={e => setForm(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              placeholder="123" required maxLength={4} />
          </Field>
        </div>
        <button type="submit" disabled={loading} style={{
          padding: '12px', background: '#3b82f6', color: '#fff', border: 'none',
          borderRadius: 6, cursor: 'pointer', width: '100%', fontSize: 15, fontWeight: 600
        }}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}
