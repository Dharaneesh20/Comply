import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  Building2,
  Sparkles,
  Lock,
  GitBranch,
  ScrollText,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConnectionState, HealthStatusResponse } from '../../types';

interface SidebarProps {
  healthState: ConnectionState;
  healthData: HealthStatusResponse | null;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/sops',        label: 'SOPs',        icon: <FileText size={16} /> },
      { to: '/regulations', label: 'Regulations', icon: <ShieldCheck size={16} /> },
      { to: '/findings',    label: 'Findings',    icon: <AlertTriangle size={16} /> },
      { to: '/remediations',label: 'Remediation', icon: <CheckSquare size={16} /> },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/regulatory-changes', label: 'Regulatory Changes', icon: <GitBranch size={16} /> },
      { to: '/organizations',      label: 'Organizations',     icon: <Building2 size={16} /> },
      { to: '/organization-mode',  label: 'Organisation mode', icon: <Sparkles size={16} /> },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/audit',             label: 'Audit Log', icon: <ScrollText size={16} /> },
      { to: '/settings/security', label: 'Security',  icon: <Lock size={16} /> },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  healthState,
  healthData,
  mobileOpen,
  onMobileClose,
}) => {
  const { currentOrganization } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarClass = `app-sidebar${mobileOpen ? ' mobile-open' : ''}`;

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClass} role="navigation" aria-label="Main navigation">
        <div className="sidebar-brand">
          <div>
            <div className="sidebar-brand-text">Align.</div>
            <div className="sidebar-brand-sub">Statutory & SOP Workspace</div>
          </div>
        </div>

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
                    `sidebar-link${isActive || (item.to !== '/dashboard' && location.pathname.startsWith(item.to)) ? ' active' : ''}`
                  }
                  onClick={() => mobileOpen && onMobileClose()}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              className={`health-badge ${healthState}`}
              style={{ flex: 1, fontSize: 'var(--text-xs)', justifyContent: 'flex-start' }}
              title={healthData ? `Backend: ${healthData.application}, DB: ${healthData.database}` : 'Checking...'}
            >
              <span className={`status-dot ${healthState === 'online' ? 'green' : healthState === 'offline' ? 'red' : 'amber'}`} />
              <span>
                {healthState === 'online' ? 'Connected' : healthState === 'offline' ? 'Offline' : 'Checking...'}
              </span>
            </div>
          </div>

          {currentOrganization && (
            <button
              onClick={() => navigate('/organizations')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
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
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover-strong)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-surface-raised)',
                  flexShrink: 0,
                }}
              >
                {currentOrganization.logoUrl ? (
                  <img
                    src={currentOrganization.logoUrl}
                    alt={currentOrganization.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Building2 size={12} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
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
