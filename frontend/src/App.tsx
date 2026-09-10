import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { fetchHealthStatus } from './api/health';
import { ConnectionState, HealthStatusResponse } from './types';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OrganizationsPage } from './pages/Organizations';
import { SOPsList } from './pages/SOPsList';
import { CreateSOP } from './pages/CreateSOP';
import { SOPDetails } from './pages/SOPDetails';
import { RegulationsList } from './pages/RegulationsList';
import { CreateRegulation } from './pages/CreateRegulation';
import { RegulationDetails } from './pages/RegulationDetails';
import { FindingsList } from './pages/FindingsList';
import { FindingDetails } from './pages/FindingDetails';
import { RegulatoryChangesList } from './pages/RegulatoryChangesList';
import { RegulatoryChangeDetails } from './pages/RegulatoryChangeDetails';
import { RemediationsList } from './pages/RemediationsList';
import { AuditTrail } from './pages/AuditTrail';
import { SecuritySettings } from './pages/SecuritySettings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { Loader2 } from 'lucide-react';


// ── Spinner shown while auth initialises ──────────────────────────────────
const AuthLoadingScreen: React.FC = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-page)',
  }}>
    <Loader2 size={28} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
  </div>
);

// ── Protected route wrapper ────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  if (isLoading) return <AuthLoadingScreen />;
  if (!token || !user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ── Main routes ────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const [healthState, setHealthState] = useState<ConnectionState>('checking');
  const [healthData,  setHealthData]  = useState<HealthStatusResponse | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const data = await fetchHealthStatus();
      setHealthData(data);
      setHealthState('online');
    } catch {
      setHealthData(null);
      setHealthState('offline');
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10_000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Shared layout wrapper
  const withLayout = (children: React.ReactNode) => (
    <ProtectedRoute>
      <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route path="/dashboard"                element={withLayout(<Dashboard healthState={healthState} healthData={healthData} lastChecked={lastChecked} />)} />
      <Route path="/organizations"            element={withLayout(<OrganizationsPage />)} />
      <Route path="/sops"                     element={withLayout(<SOPsList />)} />
      <Route path="/sops/new"                 element={withLayout(<CreateSOP />)} />
      <Route path="/sops/:id"                 element={withLayout(<SOPDetails />)} />
      <Route path="/regulations"              element={withLayout(<RegulationsList />)} />
      <Route path="/regulations/new"          element={withLayout(<CreateRegulation />)} />
      <Route path="/regulations/:id"          element={withLayout(<RegulationDetails />)} />
      <Route path="/findings"                 element={withLayout(<FindingsList />)} />
      <Route path="/findings/:id"             element={withLayout(<FindingDetails />)} />
      <Route path="/regulatory-changes"       element={withLayout(<RegulatoryChangesList />)} />
      <Route path="/regulatory-changes/:id"  element={withLayout(<RegulatoryChangeDetails />)} />
      <Route path="/remediations"             element={withLayout(<RemediationsList />)} />
      <Route path="/audit"                    element={withLayout(<AuditTrail />)} />
      <Route path="/settings/security"        element={withLayout(<SecuritySettings />)} />

      {/* Fallbacks */}
      <Route path="/"   element={<Navigate to="/dashboard" replace />} />
      <Route path="*"   element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

