import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { fetchHealthStatus } from './api/health';
import { ConnectionState, HealthStatusResponse } from './types';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

export const App: React.FC = () => {
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
    <BrowserRouter>
      <MainLayout 
        healthState={healthState} 
        healthData={healthData} 
        onRefreshHealth={checkHealth}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                healthState={healthState} 
                healthData={healthData} 
                lastChecked={lastChecked} 
              />
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};
