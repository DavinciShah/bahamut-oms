import { Component } from 'react';
export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>Something went wrong</h2>
          <p style={{ color: '#64748b' }}>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}
