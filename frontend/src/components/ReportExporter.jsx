import analyticsService from '../services/analyticsService';

export default function ReportExporter({ reportId, reportName }) {
  const handleExport = async (format) => {
    try {
      const res = await analyticsService.exportReport(reportId, format);
      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName || 'report'}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={() => handleExport('csv')}
        style={{ padding: '4px 12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
      >
        CSV
      </button>
      <button
        onClick={() => handleExport('pdf')}
        style={{ padding: '4px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
      >
        PDF
      </button>
    </div>
  );
}
