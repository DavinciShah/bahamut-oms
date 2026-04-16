import { useState } from 'react';

export default function TenantBranding({ settings, onUpdate, onSave, saving }) {
  const inputStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' };
  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 560 }}>
      <h3 style={{ marginBottom: 20 }}>Branding</h3>

      <div style={{ marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Preview</div>
        <div style={{
          background: settings.primary_color || '#3b82f6',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 6,
          display: 'inline-block',
          fontFamily: settings.font_family || 'system-ui',
          fontSize: 14
        }}>
          {settings.company_name || 'Your Company'} OMS
        </div>
      </div>

      <Field label="Company Name">
        <input style={inputStyle} value={settings.company_name || ''} placeholder="Your Company"
          onChange={e => onUpdate(p => ({ ...p, company_name: e.target.value }))} />
      </Field>
      <Field label="Logo URL">
        <input style={inputStyle} value={settings.logo_url || ''} placeholder="https://yourcdn.com/logo.png"
          onChange={e => onUpdate(p => ({ ...p, logo_url: e.target.value }))} />
        {settings.logo_url && <img src={settings.logo_url} alt="Logo preview" style={{ marginTop: 8, maxHeight: 48, objectFit: 'contain' }} />}
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Primary Color">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={settings.primary_color || '#3b82f6'}
              onChange={e => onUpdate(p => ({ ...p, primary_color: e.target.value }))}
              style={{ width: 48, height: 36, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }} />
            <input style={{ flex: 1, ...inputStyle }} value={settings.primary_color || '#3b82f6'}
              onChange={e => onUpdate(p => ({ ...p, primary_color: e.target.value }))} />
          </div>
        </Field>
        <Field label="Secondary Color">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={settings.secondary_color || '#64748b'}
              onChange={e => onUpdate(p => ({ ...p, secondary_color: e.target.value }))}
              style={{ width: 48, height: 36, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }} />
            <input style={{ flex: 1, ...inputStyle }} value={settings.secondary_color || '#64748b'}
              onChange={e => onUpdate(p => ({ ...p, secondary_color: e.target.value }))} />
          </div>
        </Field>
      </div>
      <Field label="Font Family">
        <select style={inputStyle} value={settings.font_family || 'system-ui'}
          onChange={e => onUpdate(p => ({ ...p, font_family: e.target.value }))}>
          <option value="system-ui">System UI</option>
          <option value="Inter, sans-serif">Inter</option>
          <option value="Roboto, sans-serif">Roboto</option>
          <option value="'Open Sans', sans-serif">Open Sans</option>
          <option value="Georgia, serif">Georgia (Serif)</option>
        </select>
      </Field>
      <button onClick={onSave} disabled={saving} style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        {saving ? 'Saving...' : 'Save Branding'}
      </button>
    </div>
  );
}
