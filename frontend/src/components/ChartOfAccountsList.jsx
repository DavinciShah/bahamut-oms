import React, { useState } from 'react';

const TYPES = ['', 'asset', 'liability', 'equity', 'revenue', 'expense'];

export default function ChartOfAccountsList({ accounts = [], onEdit, onDelete }) {
  const [filter, setFilter] = useState('');
  const filtered = filter ? accounts.filter((a) => a.accountType === filter) : accounts;

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 13, color: '#374151' }}>Filter by type:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '5px 10px', fontSize: 13 }}>
          {TYPES.map((t) => <option key={t} value={t}>{t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}</option>)}
        </select>
      </div>
      {!filtered.length ? (
        <div style={{ color: '#6b7280', padding: 12 }}>No accounts found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Code', 'Name', 'Type', 'Balance', 'Synced', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((acc) => (
              <tr key={acc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{acc.accountCode}</td>
                <td style={{ padding: '8px 12px' }}>{acc.accountName}</td>
                <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{acc.accountType}</td>
                <td style={{ padding: '8px 12px' }}>₹{Number(acc.balance || 0).toLocaleString('en-IN')}</td>
                <td style={{ padding: '8px 12px' }}>{acc.synced ? '✅' : '—'}</td>
                <td style={{ padding: '8px 12px', display: 'flex', gap: 6 }}>
                  {onEdit && <button onClick={() => onEdit(acc)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>Edit</button>}
                  {onDelete && <button onClick={() => onDelete(acc.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
