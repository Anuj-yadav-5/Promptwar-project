import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0e27', color: '#00d4ff', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ System Error</h1>
          <p style={{ color: '#94a3b8' }}>Something went wrong. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '0.75rem', color: '#00d4ff', cursor: 'pointer', fontSize: '1rem' }}>
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
