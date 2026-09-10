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
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const [healthState, setHealthState] = useState<ConnectionState>('checking');
  const [healthData, setHealthData] = useState<HealthStatusResponse | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const data = await fetchHealthStatus();
      setHealthData(data);
      setHealthState('online');
      setLastChecked(new Date());
    } catch (err) {
      setHealthData(null);
      setHealthState('offline');
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <Dashboard healthState={healthState} healthData={healthData} lastChecked={lastChecked} />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/organizations" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <OrganizationsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/sops" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <SOPsList />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/sops/new" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <CreateSOP />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/sops/:id" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <SOPDetails />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/regulations" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <RegulationsList />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/regulations/new" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <CreateRegulation />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/regulations/:id" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <RegulationDetails />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/findings" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <FindingsList />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/findings/:id" 
        element={
          <ProtectedRoute>
            <MainLayout healthState={healthState} healthData={healthData} onRefreshHealth={checkHealth}>
              <FindingDetails />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};
