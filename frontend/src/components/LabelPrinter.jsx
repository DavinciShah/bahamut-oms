export default function LabelPrinter({ shipment }) {
  if (!shipment) return null;

  const handlePrint = () => {
    if (shipment.label_url) {
      window.open(shipment.label_url, '_blank');
    } else {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html><head><title>Shipping Label</title>
        <style>
          body { font-family: monospace; padding: 20px; }
          .label { border: 2px solid #000; padding: 20px; max-width: 400px; }
          .barcode { font-size: 32px; letter-spacing: 4px; margin: 16px 0; }
        </style></head>
        <body>
          <div class="label">
            <h2>${shipment.carrier?.toUpperCase()} Shipping Label</h2>
            <div><strong>Tracking:</strong> ${shipment.tracking_number || 'N/A'}</div>
            <div><strong>To:</strong> ${JSON.stringify(shipment.to_address || {})}</div>
            <div><strong>From:</strong> ${JSON.stringify(shipment.from_address || {})}</div>
            <div class="barcode">|||||||||||||||</div>
            <div>${shipment.tracking_number}</div>
          </div>
          <script>window.print();</script>
        </body></html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginBottom: 16 }}>Shipping Label</h3>
      <div style={{ border: '2px dashed #cbd5e1', borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Carrier</div>
            <div style={{ fontWeight: 600 }}>{shipment.carrier?.toUpperCase()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Tracking #</div>
            <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{shipment.tracking_number}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Status</div>
            <div style={{ fontWeight: 600 }}>{shipment.status}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Weight</div>
            <div>{shipment.weight} lbs</div>
          </div>
        </div>
      </div>
      <button onClick={handlePrint} style={{ padding: '8px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        🖨️ Print Label
      </button>
    </div>
  );
}
