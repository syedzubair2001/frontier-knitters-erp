import React from 'react';
import FrontierLogo from './FrontierLogo';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, msg: '' };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, msg: err.message };
  }

  componentDidCatch(err) {
    console.error('APP ERROR:', err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#0b2a5b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, maxWidth: 420, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><FrontierLogo height={40} /></div>
            <h2 style={{ color: '#0b2a5b', margin: '8px 0' }}>Something went wrong</h2>
            <p style={{ color: '#c0392b', fontSize: 13 }}>{this.state.msg}</p>
            <p style={{ color: '#627d98', fontSize: 13 }}>This is usually caused by old saved data in the browser. Clear it and restart.</p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              style={{ background: 'linear-gradient(90deg, #164b9e, #1e6fe0)', color: '#fff', border: 0, padding: '11px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              🧹 RESET APP & LOGIN AGAIN
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}