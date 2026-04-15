import React, { useState } from 'react';

export default function ReportGenerator({ onGenerate, integrations = [] }) {
  const [form, setForm] = useState({ startDate: '', endDate: '', reportType: 'profit-loss', integrationId: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', padding: '12px 0' }}>
      <div>
        <label style={labelStyle}>From</label>
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>To</label>
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Report Type</label>
        <select name="reportType" value={form.reportType} onChange={handleChange} style={inputStyle}>
          <option value="profit-loss">Profit & Loss</option>
          <option value="balance-sheet">Balance Sheet</option>
          <option value="cash-flow">Cash Flow</option>
          <option value="trial-balance">Trial Balance</option>
          <option value="journal">Journal Entries</option>
          <option value="ledger">General Ledger</option>
        </select>
      </div>
      {integrations.length > 0 && (
        <div>
          <label style={labelStyle}>Integration</label>
          <select name="integrationId" value={form.integrationId} onChange={handleChange} style={inputStyle}>
            <option value="">All</option>
            {integrations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      )}
      <button onClick={() => onGenerate && onGenerate(form)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontWeight: 500 }}>
        Generate
      </button>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 3 };
const inputStyle = { border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none' };
