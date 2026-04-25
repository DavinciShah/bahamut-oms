import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 32, maxWidth: 480, textAlign: 'center' }}>
            <h2 style={{ color: '#dc2626', marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                style={{ padding: '8px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}
              >
                Logout & Reset
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
