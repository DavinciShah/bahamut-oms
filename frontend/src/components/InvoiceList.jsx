import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getInvoices()
      .then(res => setInvoices(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading invoices...</div>;

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['Invoice #', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 14px', fontSize: 14, fontFamily: 'monospace' }}>{inv.invoice_number || inv.id?.slice(0, 8)}</td>
              <td style={{ padding: '10px 14px', fontSize: 14 }}>{new Date(inv.created_at || inv.date).toLocaleDateString()}</td>
              <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>${parseFloat(inv.amount || inv.total || 0).toFixed(2)}</td>
              <td style={{ padding: '10px 14px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 12, fontSize: 12,
                  background: inv.status === 'paid' ? '#dcfce7' : '#fef9c3',
                  color: inv.status === 'paid' ? '#16a34a' : '#ca8a04'
                }}>{inv.status}</span>
              </td>
              <td style={{ padding: '10px 14px' }}>
                {inv.pdf_url && (
                  <a href={inv.pdf_url} target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}>
                    Download PDF
                  </a>
                )}
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No invoices found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
