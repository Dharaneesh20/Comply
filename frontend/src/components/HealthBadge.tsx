import React from 'react';
import { ConnectionState, HealthStatusResponse } from '../types';
import { Server, WifiOff, Loader2, Database } from 'lucide-react';

interface HealthBadgeProps {
  state: ConnectionState;
  healthData?: HealthStatusResponse | null;
  showDetails?: boolean;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({ state, healthData, showDetails = false }) => {
  if (state === 'checking') {
    return (
      <div className="health-badge checking" data-testid="health-badge">
        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
        <span className="status-dot amber" />
        <span>Checking…</span>
      </div>
    );
  }

  if (state === 'offline') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div className="health-badge offline" data-testid="health-badge">
          <WifiOff size={12} />
          <span className="status-dot red" />
          <span>Offline</span>
        </div>
        {showDetails && (
          <div className="health-badge offline" data-testid="mongo-badge-offline">
            <Database size={12} />
            <span>DB: Disconnected</span>
          </div>
        )}
      </div>
    );
  }

  const isMongoConnected = healthData?.database === 'UP';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div className="health-badge online" data-testid="health-badge">
        <Server size={12} />
        <span className="status-dot green" />
        <span>Online</span>
      </div>
      {showDetails && (
        <div
          className={`health-badge ${isMongoConnected ? 'online' : 'offline'}`}
          data-testid="mongo-badge"
        >
          <Database size={12} />
          <span className={`status-dot ${isMongoConnected ? 'green' : 'red'}`} />
          <span>DB: {isMongoConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      )}
    </div>
  );
};
