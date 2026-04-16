import { useState, useEffect } from 'react';
import tenantService from '../services/tenantService';

export default function DomainSetup() {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    tenantService.getDomains()
      .then(res => setDomains(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await tenantService.addDomain(newDomain.trim());
      setDomains(prev => [...prev, res.data]);
      setNewDomain('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 560 }}>
      <h3 style={{ marginBottom: 8 }}>Custom Domains</h3>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
        Configure custom domains for your OMS portal. Point your DNS CNAME to <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>app.bahamutoms.com</code>
      </p>

      {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 14 }}>{error}</div>}

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={newDomain}
          onChange={e => setNewDomain(e.target.value)}
          placeholder="oms.yourcompany.com"
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
          pattern="^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
          title="Enter a valid domain name"
        />
        <button type="submit" disabled={adding}
          style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {adding ? 'Adding...' : 'Add Domain'}
        </button>
      </form>

      {loading ? <div>Loading domains...</div> : (
        <div>
          {domains.length === 0 && <div style={{ color: '#64748b', fontSize: 14 }}>No custom domains configured</div>}
          {domains.map(d => (
            <div key={d.id || d.domain} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 6, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 500 }}>{d.domain}</div>
                <div style={{ fontSize: 12, marginTop: 2 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11,
                    background: d.verified ? '#dcfce7' : '#fef9c3',
                    color: d.verified ? '#16a34a' : '#ca8a04' }}>
                    {d.verified ? '✓ Verified' : '⏳ Pending verification'}
                  </span>
                </div>
              </div>
              {!d.verified && (
                <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right' }}>
                  Add CNAME record:<br />
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>app.bahamutoms.com</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
