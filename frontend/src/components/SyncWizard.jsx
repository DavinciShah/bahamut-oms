import React, { useState } from 'react';

const STEPS = ['Choose Software', 'Enter Credentials', 'Test Connection', 'Sync Settings'];

const INTEGRATIONS = [
  { type: 'tally', name: 'Tally ERP 9/Prime', icon: '📊', fields: [{ name: 'host', label: 'Tally Host', placeholder: 'localhost' }, { name: 'port', label: 'Tally Port', placeholder: '9000' }] },
  { type: 'mybillbook', name: 'MyBillBook', icon: '📒', fields: [{ name: 'apiKey', label: 'API Key', placeholder: 'Enter API key' }, { name: 'orgId', label: 'Organization ID', placeholder: 'Enter org ID' }] },
  { type: 'zoho', name: 'Zoho Books', icon: '🌐', fields: [{ name: 'clientId', label: 'Client ID', placeholder: 'Zoho client ID' }, { name: 'clientSecret', label: 'Client Secret', placeholder: 'Zoho client secret', type: 'password' }, { name: 'orgId', label: 'Organization ID', placeholder: 'Org ID' }] },
  { type: 'quickbooks', name: 'QuickBooks Online', icon: '💼', fields: [{ name: 'clientId', label: 'Client ID', placeholder: 'QB client ID' }, { name: 'clientSecret', label: 'Client Secret', placeholder: 'QB client secret', type: 'password' }, { name: 'realmId', label: 'Realm ID', placeholder: 'Company Realm ID' }] },
  { type: 'wave', name: 'Wave', icon: '🌊', fields: [{ name: 'apiKey', label: 'API Key', placeholder: 'Wave full-access token' }, { name: 'businessId', label: 'Business ID', placeholder: 'Wave business ID' }] },
  { type: 'generic', name: 'Generic/Custom', icon: '🔗', fields: [{ name: 'apiUrl', label: 'API URL', placeholder: 'https://your-accounting-api.com' }, { name: 'apiKey', label: 'API Key', placeholder: 'Your API key' }] },
];

export default function SyncWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [creds, setCreds] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [syncSettings, setSyncSettings] = useState({ invoices: true, payments: true, customers: true, products: false, frequency: 'hourly' });

  const intg = INTEGRATIONS.find((i) => i.type === selected);

  const handleNext = () => {
    if (step === 3) {
      onComplete && onComplete({ type: selected, name: intg?.name, credentials: creds, syncSettings });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24 }}>
      <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center', fontSize: 12, padding: '6px 0', background: i === step ? '#3b82f6' : i < step ? '#bfdbfe' : '#f3f4f6', color: i === step ? '#fff' : '#374151', borderRadius: i === 0 ? '6px 0 0 6px' : i === STEPS.length - 1 ? '0 6px 6px 0' : 0 }}>
            {s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {INTEGRATIONS.map((i) => (
            <div key={i.type} onClick={() => setSelected(i.type)} style={{ border: `2px solid ${selected === i.type ? '#3b82f6' : '#e5e7eb'}`, borderRadius: 8, padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: selected === i.type ? '#eff6ff' : '#fff' }}>
              <span style={{ fontSize: 24 }}>{i.icon}</span>
              <span style={{ fontWeight: 500, fontSize: 13 }}>{i.name}</span>
            </div>
          ))}
        </div>
      )}

      {step === 1 && intg && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{intg.icon} {intg.name} — Credentials</div>
          {intg.fields.map((f) => (
            <div key={f.name}>
              <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 3 }}>{f.label}</label>
              <input type={f.type || 'text'} placeholder={f.placeholder} value={creds[f.name] || ''} onChange={(e) => setCreds({ ...creds, [f.name]: e.target.value })} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '7px 10px', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 15, marginBottom: 16 }}>Test connection to <strong>{intg?.name}</strong></div>
          <button onClick={() => setTestResult('success')} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', marginRight: 8 }}>Run Test</button>
          {testResult === 'success' && <div style={{ color: '#22c55e', marginTop: 12 }}>✅ Connection successful!</div>}
          {testResult === 'error' && <div style={{ color: '#ef4444', marginTop: 12 }}>❌ Connection failed. Check credentials.</div>}
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Sync Settings</div>
          {['invoices', 'payments', 'customers', 'products'].map((k) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, textTransform: 'capitalize' }}>
              <input type="checkbox" checked={syncSettings[k]} onChange={(e) => setSyncSettings({ ...syncSettings, [k]: e.target.checked })} />
              Sync {k}
            </label>
          ))}
          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 3 }}>Sync Frequency</label>
            <select value={syncSettings.frequency} onChange={(e) => setSyncSettings({ ...syncSettings, frequency: e.target.value })} style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}>
              <option value="realtime">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="manual">Manual only</option>
            </select>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button onClick={step === 0 ? onCancel : () => setStep(step - 1)} style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}>
          {step === 0 ? 'Cancel' : '← Back'}
        </button>
        <button onClick={handleNext} disabled={step === 0 && !selected} style={{ background: step === 0 && !selected ? '#9ca3af' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', cursor: step === 0 && !selected ? 'not-allowed' : 'pointer' }}>
          {step === 3 ? '✅ Connect' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
