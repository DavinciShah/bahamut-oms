import { useState, useRef } from 'react';

export default function BarcodeScanner({ onScan }) {
  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');
  const fileRef = useRef(null);

  const handleManual = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      setResult(manualInput.trim());
      if (onScan) onScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    const reader = new FileReader();
    reader.onload = () => {
      const mockBarcode = `BARCODE_${Date.now()}`;
      setResult(mockBarcode);
      setScanning(false);
      if (onScan) onScan(mockBarcode);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 400 }}>
      <h3 style={{ marginBottom: 16 }}>Barcode Scanner</h3>

      <div style={{ marginBottom: 16 }}>
        <div style={{
          border: '2px dashed #cbd5e1', borderRadius: 8, padding: 24, textAlign: 'center',
          background: '#f8fafc', cursor: 'pointer'
        }} onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>
            {scanning ? 'Processing...' : 'Click to scan barcode image'}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Supports JPEG, PNG</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} capture="environment" />
      </div>

      <div style={{ marginBottom: 12, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>— or enter manually —</div>

      <form onSubmit={handleManual} style={{ display: 'flex', gap: 8 }}>
        <input
          value={manualInput}
          onChange={e => setManualInput(e.target.value)}
          placeholder="Enter barcode or SKU"
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Submit
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: '#dcfce7', borderRadius: 6, fontSize: 14, color: '#16a34a' }}>
          Scanned: <strong>{result}</strong>
        </div>
      )}
    </div>
  );
}
