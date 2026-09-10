import React from 'react';
import { ConnectionState, HealthStatusResponse } from '../../types';
import { HealthBadge } from '../HealthBadge';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, User, RefreshCw, LogOut } from 'lucide-react';

interface HeaderProps {
  healthState: ConnectionState;
  healthData: HealthStatusResponse | null;
  onRefreshHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ healthState, healthData, onRefreshHealth }) => {
  const { user, currentOrganization, organizations, setCurrentOrganization, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-title-group">
        <h1 className="header-title">Align Compliance Intelligence</h1>
        <span style={{ fontSize: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '0.2rem 0.6rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
          Phase 1 Engine
        </span>
      </div>

      <div className="header-actions">
        {/* Organization Selector */}
        {user && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
            <Building2 size={16} color="var(--accent-cyan)" />
            <select
              value={currentOrganization?.id || ''}
              onChange={(e) => {
                if (e.target.value === 'NEW') {
                  navigate('/organizations');
                } else {
                  const selected = organizations.find(o => o.id === e.target.value);
                  if (selected) setCurrentOrganization(selected);
                }
              }}
              style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                  {org.name}
                </option>
              ))}
              <option value="NEW" style={{ background: 'var(--bg-surface)', color: 'var(--accent-cyan)' }}>
                + Manage / Create Org
              </option>
            </select>
          </div>
        )}

        <button 
          onClick={onRefreshHealth}
          title="Refresh Backend Connection Status"
          style={{ padding: '0.4rem', color: 'var(--text-secondary)', borderRadius: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <RefreshCw size={16} />
        </button>

        <HealthBadge state={healthState} healthData={healthData} showDetails={true} />

        {/* User Avatar & Logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.fullName}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{ padding: '0.45rem', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="var(--text-secondary)" />
          </div>
        )}
      </div>
    </header>
  );
};
