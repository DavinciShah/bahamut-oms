import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';
import LiveChat from '../components/LiveChat';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([ticketService.getTicket(id), ticketService.getMessages(id)])
      .then(([tRes, mRes]) => { setTicket(tRes.data); setMessages(mRes.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await ticketService.addMessage(id, { message: newMessage });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    try {
      const res = await ticketService.updateTicket(id, { status: 'closed' });
      setTicket(res.data);
    } catch (err) {
      alert('Failed to close ticket: ' + err.message);
    }
  };

  const priorityColor = { high: '#fee2e2', medium: '#fef9c3', low: '#dcfce7' };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!ticket) return <div style={{ padding: 24 }}>Ticket not found</div>;

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <button onClick={() => navigate('/support')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginBottom: 16, fontSize: 14 }}>← Back to tickets</button>

      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ marginBottom: 8 }}>{ticket.subject}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: ticket.status === 'open' ? '#dbeafe' : '#f1f5f9', color: ticket.status === 'open' ? '#1d4ed8' : '#64748b' }}>{ticket.status}</span>
              <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: priorityColor[ticket.priority] }}>{ticket.priority} priority</span>
              {ticket.category && <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: '#f3e8ff' }}>{ticket.category}</span>}
            </div>
          </div>
          {ticket.status === 'open' && (
            <button onClick={handleClose} style={{ padding: '6px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Close Ticket</button>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
          Created {new Date(ticket.created_at).toLocaleString()}
          {ticket.customer_name && ` · Customer: ${ticket.customer_name}`}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Messages</h3>
        {messages.length === 0 && <div style={{ color: '#64748b', fontSize: 14 }}>No messages yet.</div>}
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: 13 }}>{msg.sender_name || 'Unknown'}</strong>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(msg.created_at).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.message}</div>
          </div>
        ))}
        {ticket.status === 'open' && (
          <form onSubmit={handleSend} style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', resize: 'vertical' }}
            />
            <button type="submit" disabled={sending} style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', alignSelf: 'flex-end' }}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
