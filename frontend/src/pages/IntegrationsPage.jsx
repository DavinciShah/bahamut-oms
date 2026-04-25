import { useCallback, useEffect, useMemo, useState } from 'react';
import SyncWizard from '../components/SyncWizard';
import IntegrationCard from '../components/IntegrationCard';
import {
  getIntegrations,
  connectIntegration,
  testIntegration,
  deleteIntegration,
} from '../services/integrationService';
import { syncProducts } from '../services/syncService';

function normalizeIntegration(item) {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    status: item.status || 'active',
    lastSyncAt: item.last_sync_at || item.lastSyncAt || null,
    recordsSynced: item.records_synced ?? item.recordsSynced ?? null,
  };
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  const loadIntegrations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getIntegrations();
      const list = Array.isArray(data?.integrations) ? data.integrations : [];
      setIntegrations(list.map(normalizeIntegration));
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load integrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const summary = useMemo(() => {
    const total = integrations.length;
    const active = integrations.filter((i) => i.status === 'active').length;
    return { total, active };
  }, [integrations]);

  const handleCreate = async (payload) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const created = await connectIntegration({
        type: payload.type,
        name: payload.name,
        config: {
          ...payload.credentials,
          syncSettings: payload.syncSettings,
        },
      });
      setShowWizard(false);
      await loadIntegrations();
      setMessage(`Integration connected: ${created?.integration?.name || payload.name}`);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to connect integration.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (id) => {
    setError('');
    setMessage('');
    try {
      const result = await testIntegration(id);
      setMessage(result?.message || 'Connection test successful.');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Connection test failed.');
    }
  };

  const handleSync = async (id) => {
    setError('');
    setMessage('');
    try {
      const result = await syncProducts({ integration_id: id });
      setMessage(result?.message || 'Sync initiated successfully.');
      await loadIntegrations();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to start sync.');
    }
  };

  const handleDisconnect = async (id) => {
    setError('');
    setMessage('');
    try {
      await deleteIntegration(id);
      setMessage('Integration disconnected successfully.');
      await loadIntegrations();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to disconnect integration.');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Marketplace & Accounting Integrations</h2>
        <button
          onClick={() => setShowWizard((v) => !v)}
          style={{ padding: '9px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
        >
          {showWizard ? 'Close Setup' : '+ Add Integration'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 13, color: '#475569' }}>
        <div style={{ padding: '6px 10px', background: '#e2e8f0', borderRadius: 999 }}>Total: {summary.total}</div>
        <div style={{ padding: '6px 10px', background: '#dcfce7', borderRadius: 999 }}>Active: {summary.active}</div>
      </div>

      {error && <div style={{ marginBottom: 12, padding: 10, borderRadius: 6, background: '#fef2f2', color: '#b91c1c' }}>{error}</div>}
      {message && <div style={{ marginBottom: 12, padding: 10, borderRadius: 6, background: '#ecfdf5', color: '#047857' }}>{message}</div>}

      {showWizard && (
        <div style={{ marginBottom: 20, opacity: saving ? 0.8 : 1, pointerEvents: saving ? 'none' : 'auto' }}>
          <SyncWizard
            onComplete={handleCreate}
            onCancel={() => setShowWizard(false)}
          />
        </div>
      )}

      {loading ? (
        <div>Loading integrations...</div>
      ) : integrations.length === 0 ? (
        <div style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff' }}>
          No integrations configured yet. Use Add Integration to connect Amazon, Shopify, WooCommerce, or accounting platforms.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onTest={handleTest}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
