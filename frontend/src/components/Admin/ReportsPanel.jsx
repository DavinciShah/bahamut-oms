import { useState } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';

function ReportsPanel() {
  const [reportType, setReportType] = useState('orders');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      let result;
      const params = { date_from: dateFrom, date_to: dateTo };
      if (reportType === 'orders') result = await adminService.getOrdersReport(params);
      else if (reportType === 'revenue') result = await adminService.getRevenueReport(params);
      else result = await adminService.getInventoryReport();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">Reports</div>
      <div className="card-body">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Report Type</label>
            <select
              className="form-control"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="orders">Orders</option>
              <option value="revenue">Revenue</option>
              <option value="inventory">Inventory</option>
            </select>
          </div>
          {reportType !== 'inventory' && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">From</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">To</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </>
          )}
          <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
            {loading ? 'Loading…' : 'Generate Report'}
          </button>
        </div>

        <ErrorAlert message={error} />

        {loading && <LoadingSpinner />}

        {data && !loading && (
          <div>
            <pre
              style={{
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1rem',
                overflow: 'auto',
                fontSize: 'var(--font-size-sm)',
                maxHeight: '400px',
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPanel;
