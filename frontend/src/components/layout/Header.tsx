import React from 'react';
import { ConnectionState, HealthStatusResponse } from '../../types';
import { HealthBadge } from '../HealthBadge';
import { Building2, User, RefreshCw } from 'lucide-react';

interface HeaderProps {
  healthState: ConnectionState;
  healthData: HealthStatusResponse | null;
  onRefreshHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ healthState, healthData, onRefreshHealth }) => {
  return (
    <header className="header">
      <div className="header-title-group">
        <h1 className="header-title">Align Compliance Intelligence</h1>
        <span style={{ fontSize: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '0.2rem 0.6rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
          Phase 0 Foundation
        </span>
      </div>

      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Building2 size={16} />
          <span>Default Org</span>
        </div>

        <button 
          onClick={onRefreshHealth}
          title="Refresh Backend Connection Status"
          style={{ padding: '0.4rem', color: 'var(--text-secondary)', borderRadius: '4px' }}
        >
          <RefreshCw size={16} />
        </button>

        <HealthBadge state={healthState} healthData={healthData} showDetails={true} />

        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={16} color="var(--text-secondary)" />
        </div>
      </div>
    </header>
  );
};
