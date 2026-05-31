import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';

const WINDOWS_INSTALLER_URL =
  'https://github.com/DavinciShah/devibe-oms/releases/download/v1.0.0/De-Vibe-OMS-Setup-1.0.0.exe';

function DownloadPage() {
  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Download Desktop App</h2>
          </div>

          <div className="card" style={{ maxWidth: 520 }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>🖥️</span>
                <div>
                  <h3 style={{ margin: 0 }}>De Vibe OMS for Windows</h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)' }}>
                    Version 1.0.0 · Windows 10/11 (x64)
                  </p>
                </div>
              </div>

              <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                The native Windows desktop client gives you offline access to your orders,
                inventory, and reports — no browser required.
              </p>

              <a
                href={WINDOWS_INSTALLER_URL}
                className="btn btn-primary"
                style={{ width: 'fit-content', textDecoration: 'none' }}
                download
              >
                ⬇️ Download Installer (.exe)
              </a>

              <div
                style={{
                  background: 'var(--gray-50, #f8fafc)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '0.75rem 1rem',
                }}
              >
                <p style={{ margin: '0 0 0.4rem', fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                  Or install via <strong>winget</strong>:
                </p>
                <code style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                  winget install DavinciShah.DeVibeOMS
                </code>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default DownloadPage;
