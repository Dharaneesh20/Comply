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
        {showDetails && (
          <span className="ml-2 flex items-center gap-1 text-xs opacity-80" data-testid="mongo-badge-offline">
            <Database size={12} />
            <span>MongoDB: Disconnected</span>
          </span>
        )}
      </div>
    );
  }

  const isMongoConnected = healthData?.database === 'UP';

  return (
    <div className="flex items-center gap-2">
      <div className="health-badge online" data-testid="health-badge">
        <Server size={14} />
        <span className="pulse-dot green"></span>
        <span>Backend: Online</span>
      </div>
      {showDetails && (
        <div
          className={`health-badge ${isMongoConnected ? 'online' : 'offline'}`}
          data-testid="mongo-badge"
        >
          <Database size={14} />
          <span className={`pulse-dot ${isMongoConnected ? 'green' : 'red'}`}></span>
          <span>MongoDB: {isMongoConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      )}
    </div>
  );
};
