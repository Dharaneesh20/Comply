import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ConnectionState, HealthStatusResponse } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  healthState: ConnectionState;
  healthData: HealthStatusResponse | null;
  onRefreshHealth: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  healthState,
  healthData,
  onRefreshHealth,
}) => {
  return (
    <div className="app-container">
      <Sidebar healthState={healthState} healthData={healthData} />
      <div className="main-content">
        <Header 
          healthState={healthState} 
          healthData={healthData} 
          onRefreshHealth={onRefreshHealth} 
        />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};
