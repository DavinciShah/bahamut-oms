import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import ticketService from '../services/ticketService';

export default function LiveChat({ agentId }) {
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = async () => {
    try {
      const res = await ticketService.startChat(agentId);
      const { roomId: rid } = res.data;
      setRoomId(rid);

      const token = localStorage.getItem('token');
      socketService.connect(token);
      socketService.emit('join_room', { roomId: rid });

      socketService.on('new_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socketService.on('chat_ended', () => {
        setConnected(false);
        setMessages(prev => [...prev, { id: Date.now(), senderId: 'system', message: 'Chat ended', timestamp: new Date() }]);
      });

      setConnected(true);
      setMessages([{ id: 'start', senderId: 'system', message: 'Chat started. An agent will be with you shortly.', timestamp: new Date() }]);
    } catch (err) {
      alert('Failed to start chat: ' + err.message);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !roomId) return;
    socketService.emit('send_message', { roomId, message: input });
    setMessages(prev => [...prev, { id: Date.now(), senderId: 'me', message: input, timestamp: new Date() }]);
    setInput('');
  };

  const endChat = () => {
    if (roomId) socketService.emit('end_chat', { roomId });
    setConnected(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', width: 360, display: 'flex', flexDirection: 'column', height: 480 }}>
      <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>Live Support</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#22c55e' : '#64748b' }} />
          <span style={{ color: '#94a3b8', fontSize: 12 }}>{connected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!connected && !roomId && (
          <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Start a live chat with our support team</div>
            <button onClick={startChat} style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Start Chat
            </button>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.senderId === 'me' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '8px 12px', borderRadius: msg.senderId === 'me' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.senderId === 'me' ? '#3b82f6' : msg.senderId === 'system' ? '#f1f5f9' : '#e2e8f0',
              color: msg.senderId === 'me' ? '#fff' : '#1e293b',
              fontSize: 14
            }}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {connected && (
        <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Send
          </button>
          <button type="button" onClick={endChat} style={{ padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
            End
          </button>
        </form>
      )}
    </div>
  );
}
