import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AccountingMetrics({ metrics = {} }) {
  const { revenue = 0, expenses = 0, netProfit = 0, cashBalance = 0, monthlyData = [] } = metrics;

  const cards = [
    { label: 'Total Revenue', value: revenue, color: '#22c55e' },
    { label: 'Total Expenses', value: expenses, color: '#ef4444' },
    { label: 'Net Profit', value: netProfit, color: netProfit >= 0 ? '#3b82f6' : '#ef4444' },
    { label: 'Cash Balance', value: cashBalance, color: '#8b5cf6' },
  ];

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{fmt(c.value)}</div>
          </div>
        ))}
      </div>
      {monthlyData.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Monthly Revenue vs Expenses</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
