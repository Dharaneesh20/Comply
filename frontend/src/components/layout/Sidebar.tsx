import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  GitBranch,
  ScrollText,
  Building2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { ConnectionState, HealthStatusResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  healthState: ConnectionState;
  healthData: HealthStatusResponse | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: '',
    items: [
      { to: '/dashboard',   icon: <LayoutDashboard size={16} />, label: 'Overview' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/sops',         icon: <FileText       size={16} />, label: 'SOPs' },
      { to: '/regulations',  icon: <ShieldCheck    size={16} />, label: 'Regulations' },
      { to: '/findings',     icon: <AlertTriangle  size={16} />, label: 'Findings' },
      { to: '/remediations', icon: <CheckSquare    size={16} />, label: 'Remediation' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/regulatory-changes', icon: <GitBranch size={16} />, label: 'Regulatory Changes' },
      { to: '/organizations',      icon: <Building2 size={16} />, label: 'Organizations' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/audit',           icon: <ScrollText size={16} />, label: 'Audit Log' },
      { to: '/settings/security', icon: <Lock     size={16} />, label: 'Security' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ healthState, healthData, mobileOpen, onMobileClose }) => {
  const { currentOrganization } = useAuth();

  const navigate = useNavigate();

  const sidebarClass = [
    'app-sidebar',
    mobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 'calc(var(--z-sticky) - 1)', backdropFilter: 'blur(2px)',
          }}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClass} role="navigation" aria-label="Main navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" aria-hidden="true">A</div>
          <div>
            <div className="sidebar-brand-text">Align</div>
            <div className="sidebar-brand-sub">Compliance</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              {section.label && (
                <div className="sidebar-section-label">{section.label}</div>
              )}
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' active' : ''}`
                  }
                  onClick={onMobileClose}
                  aria-current={undefined}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* System status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              className={`health-badge ${healthState}`}
              style={{ flex: 1, fontSize: 'var(--text-xs)', justifyContent: 'flex-start' }}
              title={healthData ? `Backend: ${healthData.application}, DB: ${healthData.database}` : 'Checking…'}
            >
              <span className={`status-dot ${healthState === 'online' ? 'green' : healthState === 'offline' ? 'red' : 'amber'}`} />
              <span>
                {healthState === 'online'   ? 'Connected' :
                 healthState === 'offline'  ? 'Offline'   : 'Checking…'}
              </span>
            </div>
          </div>

          {/* Current org */}
          {currentOrganization && (
            <button
              onClick={() => navigate('/organizations')}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background var(--duration-fast) var(--ease-default)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover-strong)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            >
              <Building2 size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentOrganization.name}
              </span>
              <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
