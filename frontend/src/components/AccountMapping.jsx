import React from 'react';

export default function AccountMapping({ accounts = [], accountingSoftwareAccounts = [], onSave }) {
  const [mapping, setMapping] = React.useState({});

  const handleChange = (omsAccount, extAccount) => setMapping({ ...mapping, [omsAccount]: extAccount });

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 12 }}>Account Mapping</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>OMS Account</th>
            <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Accounting Software Account</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px 10px' }}>{acc.name} <span style={{ fontSize: 11, color: '#9ca3af' }}>({acc.type})</span></td>
              <td style={{ padding: '8px 10px' }}>
                <select value={mapping[acc.id] || ''} onChange={(e) => handleChange(acc.id, e.target.value)} style={{ border: '1px solid #d1d5db', borderRadius: 4, padding: '4px 8px', fontSize: 12, width: '100%' }}>
                  <option value="">— Select —</option>
                  {accountingSoftwareAccounts.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <button onClick={() => onSave && onSave(mapping)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}>Save Mapping</button>
      </div>
    </div>
  );
}
