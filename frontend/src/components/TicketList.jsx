import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ticketService from '../services/ticketService';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  useEffect(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    ticketService.getTickets(params)
      .then(res => setTickets(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const priorityColor = { high: '#fee2e2', urgent: '#fce7f3', medium: '#fef9c3', low: '#dcfce7' };
  const statusColor = { open: '#dbeafe', pending: '#fef9c3', closed: '#f1f5f9', resolved: '#dcfce7' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? <div>Loading tickets...</div> : (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Subject', 'Customer', 'Priority', 'Status', 'Created', 'Assigned To'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <Link to={`/support/tickets/${t.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
                      {t.subject}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{t.customer_name || t.customer_email || '-'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: priorityColor[t.priority] || '#f1f5f9' }}>{t.priority}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: statusColor[t.status] || '#f1f5f9' }}>{t.status}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{t.assigned_to_name || 'Unassigned'}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No tickets found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
