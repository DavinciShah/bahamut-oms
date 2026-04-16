import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import ReportExporter from '../components/ReportExporter';

export default function ReportBuilder() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'orders', from: '', to: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyticsService.getReports().then(res => setReports(res.data || [])).catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const report = await analyticsService.createReport({
        name: form.name,
        type: form.type,
        parameters: { from: form.from, to: form.to }
      });
      setReports(prev => [report.data, ...prev]);
      setForm({ name: '', type: 'orders', from: '', to: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (id) => {
    setLoading(true);
    try {
      const res = await analyticsService.runReport(id);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Report Builder</h2>
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Create Report</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Name</label>
            <input style={inputStyle} required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Report name" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Type</label>
            <select style={inputStyle} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {['orders', 'revenue', 'products', 'customers', 'dashboard'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>From</label>
            <input type="date" style={inputStyle} value={form.from} onChange={e => setForm(p => ({ ...p, from: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>To</label>
            <input type="date" style={inputStyle} value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Save Report
          </button>
        </form>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginBottom: 16 }}>Saved Reports</h3>
        {reports.length === 0 && <div style={{ color: '#64748b' }}>No saved reports yet.</div>}
        {reports.map(report => (
          <div key={report.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <strong>{report.name}</strong>
              <span style={{ marginLeft: 12, fontSize: 12, background: '#e2e8f0', padding: '2px 8px', borderRadius: 10 }}>{report.type}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleRun(report.id)} disabled={loading} style={{ padding: '4px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                Run
              </button>
              <ReportExporter reportId={report.id} reportName={report.name} />
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginTop: 24 }}>
          <h3>Report Results: {result.report?.name}</h3>
          <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 12, maxHeight: 400 }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
