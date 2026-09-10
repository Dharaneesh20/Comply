import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDock } from './MobileDock';
import { CommandPalette } from '../CommandPalette';
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
  const [searchOpen, setSearchOpen]   = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        healthState={healthState}
        healthData={healthData}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="app-main">
        <Header
          onRefreshHealth={onRefreshHealth}
          onSearchOpen={() => setSearchOpen(true)}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        <main className="page-body" id="main-content">
          {children}
        </main>
      </div>

      <MobileDock />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

