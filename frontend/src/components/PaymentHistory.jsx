import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getPaymentHistory()
      .then(res => setPayments(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading payment history...</div>;

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['Date', 'Description', 'Amount', 'Method', 'Status'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 14px', fontSize: 14 }}>{new Date(p.created_at || p.date).toLocaleDateString()}</td>
              <td style={{ padding: '10px 14px', fontSize: 14 }}>{p.description || p.plan_name || 'Payment'}</td>
              <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>${parseFloat(p.amount || 0).toFixed(2)}</td>
              <td style={{ padding: '10px 14px', fontSize: 13, color: '#64748b' }}>{p.payment_method || 'Card'}</td>
              <td style={{ padding: '10px 14px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 12, fontSize: 12,
                  background: p.status === 'succeeded' || p.status === 'paid' ? '#dcfce7' : '#fee2e2',
                  color: p.status === 'succeeded' || p.status === 'paid' ? '#16a34a' : '#dc2626'
                }}>{p.status}</span>
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No payment history</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
