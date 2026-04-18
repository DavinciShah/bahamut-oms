import { useState, useEffect } from 'react';
import ticketService from '../services/ticketService';
import TicketList from '../components/TicketList';
import TicketForm from '../components/TicketForm';
import KnowledgeBase from '../components/KnowledgeBase';

export default function SupportDashboard() {
  const [tab, setTab] = useState('tickets');
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const tabs = [
    { key: 'tickets', label: 'Tickets' },
    { key: 'kb', label: 'Knowledge Base' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Customer Support</h2>
        {tab === 'tickets' && (
          <button onClick={() => setShowForm(true)} style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            + New Ticket
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: 20 }}>
          <TicketForm onSuccess={() => { setShowForm(false); setRefresh(r => r + 1); }} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e2e8f0' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
              borderBottom: tab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
              color: tab === t.key ? '#3b82f6' : '#64748b', marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'tickets' && <TicketList key={refresh} />}
      {tab === 'kb' && <KnowledgeBase />}
    </div>
  );
}
