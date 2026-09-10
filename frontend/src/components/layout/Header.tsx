import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Search, Building2, LogOut, Menu, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


interface HeaderProps {
  onRefreshHealth: () => void;
  onSearchOpen: () => void;
  onMobileMenuOpen: () => void;
}


const ROUTE_TITLES: Record<string, string> = {
  '/dashboard':              'Overview',
  '/sops':                   'SOPs',
  '/sops/new':               'Create SOP',
  '/regulations':            'Regulations Library',
  '/regulations/new':        'Create Regulation',
  '/findings':               'Findings',
  '/regulatory-changes':     'Regulatory Changes',
  '/remediations':           'Remediation',
  '/audit':                  'Audit Log',
  '/settings/security':      'Security & Privacy',
  '/organizations':          'Organizations',
};

function getPageTitle(pathname: string): string {
  if (pathname.match(/^\/sops\/[^/]+$/))         return 'SOP Details';
  if (pathname.match(/^\/regulations\/[^/]+$/))  return 'Regulation Details';
  if (pathname.match(/^\/findings\/[^/]+$/))     return 'Finding Details';
  if (pathname.match(/^\/regulatory-changes\/[^/]+$/)) return 'Change Details';
  return ROUTE_TITLES[pathname] || 'Align';
}

function getUserInitials(fullName?: string, email?: string): string {
  if (fullName) {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : 'U';
}

export const Header: React.FC<HeaderProps> = ({
  onRefreshHealth,
  onSearchOpen,
  onMobileMenuOpen,
}) => {

  const { user, currentOrganization, organizations, setCurrentOrganization, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const searchHint = isMac ? '⌘K' : 'Ctrl K';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      {/* Left: mobile menu + page title */}
      <div className="header-left">
        <button
          className="header-icon-btn"
          onClick={onMobileMenuOpen}
          aria-label="Open menu"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          <Menu size={18} />
        </button>
        <h1 className="header-page-title">{pageTitle}</h1>
      </div>

      {/* Right: search, org, user */}
      <div className="header-right">

        {/* Search trigger */}
        <button
          className="header-search-trigger"
          onClick={onSearchOpen}
          aria-label="Open search"
          id="global-search-trigger"
        >
          <Search size={14} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Search…</span>
          <kbd className="header-kbd">{searchHint}</kbd>
        </button>

        {/* Refresh health */}
        <button
          className="header-icon-btn"
          onClick={onRefreshHealth}
          title="Refresh connection status"
          aria-label="Refresh backend status"
        >
          <RefreshCw size={14} />
        </button>

        <div className="header-divider" aria-hidden="true" />

        {/* Org selector with custom logo thumbnail */}
        {user && organizations.length > 0 && (
          <div className="org-selector" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-surface-raised)',
                flexShrink: 0,
              }}
            >
              {currentOrganization?.logoUrl ? (
                <img
                  src={currentOrganization.logoUrl}
                  alt={currentOrganization.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Building2 size={13} color="var(--text-muted)" aria-hidden="true" />
              )}
            </div>
            <select
              id="org-selector"
              value={currentOrganization?.id || ''}
              onChange={e => {
                if (e.target.value === '__NEW__') {
                  navigate('/organizations');
                } else {
                  const org = organizations.find(o => o.id === e.target.value);
                  if (org) setCurrentOrganization(org);
                }
              }}
              aria-label="Select organization"
            >
              {organizations.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
              <option value="__NEW__">+ Manage organizations</option>
            </select>
          </div>
        )}

        {/* User + logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              className="user-avatar"
              title={`${user.fullName} (${user.email})`}
              aria-label={`Logged in as ${user.fullName}`}
            >
              {getUserInitials(user.fullName, user.email)}
            </div>
            <button
              className="header-icon-btn"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              id="logout-btn"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
