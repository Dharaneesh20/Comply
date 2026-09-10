import React from 'react';
import { ConnectionState, HealthStatusResponse } from '../types';
import { Server, WifiOff, Loader2 } from 'lucide-react';

interface HealthBadgeProps {
  state: ConnectionState;
  healthData?: HealthStatusResponse | null;
  showDetails?: boolean;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({ state, healthData, showDetails = false }) => {
  if (state === 'checking') {
    return (
      <div className="health-badge checking" data-testid="health-badge">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="pulse-dot amber"></span>
        <span>Backend: Checking...</span>
      </div>
    );
  }

  if (state === 'offline') {
    return (
      <div className="health-badge offline" data-testid="health-badge">
        <WifiOff size={14} />
        <span className="pulse-dot red"></span>
        <span>Backend: Offline</span>
      </div>
    );
  }

  return (
    <div className="health-badge online" data-testid="health-badge">
      <Server size={14} />
      <span className="pulse-dot green"></span>
      <span>Backend: Online</span>
      {showDetails && healthData && (
        <span style={{ opacity: 0.8, fontSize: '0.75rem', marginLeft: '0.25rem' }}>
          ({healthData.database})
        </span>
      )}
    </div>
  );
};
