import { useState, useEffect } from 'react';
import tenantService from '../services/tenantService';
import TenantBranding from '../components/TenantBranding';
import DomainSetup from '../components/DomainSetup';

export default function TenantSettings() {
  const [tenant, setTenant] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');

  useEffect(() => {
    Promise.all([tenantService.getCurrent(), tenantService.getSettings()])
      .then(([tRes, sRes]) => { setTenant(tRes.data); setSettings(sRes.data || {}); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await tenantService.updateSettings(settings);
      alert('Settings saved');
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'branding', label: 'Branding' },
    { key: 'domains', label: 'Domains' }
  ];

  const inputStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' };
  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Tenant Settings</h2>

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

      {tab === 'general' && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 560 }}>
          <Field label="Organization Name">
            <input style={inputStyle} value={tenant?.name || ''} readOnly style={{ ...inputStyle, background: '#f8fafc' }} />
          </Field>
          <Field label="Timezone">
            <select style={inputStyle} value={settings.timezone || 'UTC'}
              onChange={e => setSettings(p => ({ ...p, timezone: e.target.value }))}>
              {['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </Field>
          <Field label="Currency">
            <select style={inputStyle} value={settings.currency || 'USD'}
              onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))}>
              {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Notification Email">
            <input type="email" style={inputStyle} value={settings.notification_email || ''}
              onChange={e => setSettings(p => ({ ...p, notification_email: e.target.value }))}
              placeholder="alerts@yourcompany.com" />
          </Field>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {tab === 'branding' && <TenantBranding settings={settings} onUpdate={setSettings} onSave={handleSave} saving={saving} />}
      {tab === 'domains' && <DomainSetup />}
    </div>
  );
}
