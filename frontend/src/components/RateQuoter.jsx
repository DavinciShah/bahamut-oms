import { useState } from 'react';
import shippingService from '../services/shippingService';

export default function RateQuoter() {
  const [from, setFrom] = useState({ city: '', postalCode: '', countryCode: 'US' });
  const [to, setTo] = useState({ city: '', postalCode: '', countryCode: 'US' });
  const [pkg, setPkg] = useState({ weight: '', length: '', width: '', height: '' });
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRates([]);
    try {
      const res = await shippingService.getRates({
        fromAddress: from,
        toAddress: to,
        packages: [{ weight: parseFloat(pkg.weight), dimensions: { length: parseFloat(pkg.length || 1), width: parseFloat(pkg.width || 1), height: parseFloat(pkg.height || 1) } }]
      });
      const allRates = (res.data || []).flatMap(carrier => carrier.rates || [carrier]).filter(r => r.rate != null);
      setRates(allRates.sort((a, b) => a.rate - b.rate));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' };
  const AddressFields = ({ label, addr, setAddr }) => (
    <div style={{ flex: 1 }}>
      <h4 style={{ marginBottom: 8 }}>{label}</h4>
      <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="City" value={addr.city} onChange={e => setAddr(p => ({ ...p, city: e.target.value }))} required />
      <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Postal Code" value={addr.postalCode} onChange={e => setAddr(p => ({ ...p, postalCode: e.target.value }))} required />
      <input style={inputStyle} placeholder="Country Code (US)" value={addr.countryCode} onChange={e => setAddr(p => ({ ...p, countryCode: e.target.value.toUpperCase() }))} maxLength={2} required />
    </div>
  );

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Get Shipping Rates</h3>
        {error && <div style={{ color: '#dc2626', marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            <AddressFields label="From" addr={from} setAddr={setFrom} />
            <AddressFields label="To" addr={to} setAddr={setTo} />
          </div>
          <div>
            <h4 style={{ marginBottom: 8 }}>Package</h4>
            <div style={{ display: 'flex', gap: 10 }}>
              {[['Weight (lbs)', 'weight'], ['Length (in)', 'length'], ['Width (in)', 'width'], ['Height (in)', 'height']].map(([label, key]) => (
                <div key={key} style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: '#64748b' }}>{label}</label>
                  <input type="number" min="0.1" step="0.1" style={inputStyle} value={pkg[key]}
                    onChange={e => setPkg(p => ({ ...p, [key]: e.target.value }))}
                    required={key === 'weight'} />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 16, padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {loading ? 'Getting Rates...' : 'Get Rates'}
          </button>
        </form>
      </div>

      {rates.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: 16 }}>Available Rates</h3>
          {rates.map((rate, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{rate.serviceName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{rate.carrier?.toUpperCase()} · {rate.estimatedDays ? `${rate.estimatedDays} days` : 'Est. delivery varies'}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>${parseFloat(rate.rate).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
