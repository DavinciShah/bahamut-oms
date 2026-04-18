import { useState } from 'react';
import biService from '../services/biService';

export default function DataExplorer() {
  const [dimension, setDimension] = useState('date');
  const [metric, setMetric] = useState('revenue');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [etlLoading, setEtlLoading] = useState(false);
  const [etlResult, setEtlResult] = useState(null);

  const handleQuery = async () => {
    setLoading(true);
    try {
      const res = await biService.getFactSales({ dimension, metric });
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunETL = async () => {
    setEtlLoading(true);
    try {
      const res = await biService.runETL({});
      setEtlResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEtlLoading(false);
    }
  };

  const selectStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' };

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Data Explorer</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Dimension</label>
            <select style={selectStyle} value={dimension} onChange={e => setDimension(e.target.value)}>
              <option value="date">Date</option>
              <option value="product">Product</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Metric</label>
            <select style={selectStyle} value={metric} onChange={e => setMetric(e.target.value)}>
              <option value="revenue">Revenue</option>
              <option value="profit">Profit</option>
              <option value="cost">Cost</option>
              <option value="quantity">Quantity</option>
              <option value="orders">Orders</option>
            </select>
          </div>
          <button onClick={handleQuery} disabled={loading}
            style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {loading ? 'Running...' : 'Run Query'}
          </button>
          <button onClick={handleRunETL} disabled={etlLoading}
            style={{ padding: '8px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {etlLoading ? 'Running ETL...' : '▶ Run ETL'}
          </button>
        </div>
        {etlResult && (
          <div style={{ marginTop: 12, padding: 12, background: '#f0fdf4', borderRadius: 6, fontSize: 13 }}>
            ETL Complete: Extracted {etlResult.extracted}, Loaded {etlResult.loaded} records
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {Object.keys(data[0]).map(k => (
                  <th key={k} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {Object.values(row).map((val, j) => (
                    <td key={j} style={{ padding: '10px 14px', fontSize: 14 }}>
                      {typeof val === 'number' ? val.toLocaleString() : String(val || '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
