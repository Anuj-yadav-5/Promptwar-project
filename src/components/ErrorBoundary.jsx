import React from 'react';

/**
 * React Error Boundary — catches unhandled runtime errors in the component tree
 * and renders a graceful fallback UI instead of a blank/crashed screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[PulseArena] Uncaught Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen bg-navy-900 flex flex-col items-center justify-center text-center p-8"
        >
          <div className="w-20 h-20 rounded-full bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-slate-400 mb-6 max-w-md">
            PulseArena encountered an unexpected error. Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan font-semibold rounded-xl hover:bg-neon-cyan/20 transition-colors"
          >
            Refresh Page
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 text-left text-xs text-red-400 bg-red-900/20 border border-red-800/30 p-4 rounded-xl max-w-2xl overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
