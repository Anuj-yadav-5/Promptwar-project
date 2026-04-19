import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import { CrowdProvider } from './context/CrowdContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Standard loading component for lazy routes
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center p-12 min-h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-neon-cyan/20 border-t-neon-cyan animate-spin shadow-[0_0_15px_rgba(0,212,255,0.5)]" />
      <p className="text-neon-cyan text-sm font-semibold tracking-widest uppercase animate-pulse">Loading Sector...</p>
    </div>
  </div>
);

// Lazy Loaded Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CrowdMap = lazy(() => import('./pages/CrowdMap'));
const QueueSystem = lazy(() => import('./pages/QueueSystem'));
const Navigation = lazy(() => import('./pages/Navigation'));
const Alerts = lazy(() => import('./pages/Alerts'));
const AiAssistant = lazy(() => import('./pages/AiAssistant'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <AuthProvider>
      <CrowdProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/stadium"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="map" element={<CrowdMap />} />
                <Route path="queues" element={<QueueSystem />} />
                <Route path="navigate" element={<Navigation />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="assistant" element={<AiAssistant />} />
                <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              </Route>
              
              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </CrowdProvider>
    </AuthProvider>
  );
}

export default App;
