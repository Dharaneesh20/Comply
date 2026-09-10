import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2,
  ShieldCheck, 
  FileText, 
  GitBranch, 
  AlertTriangle
} from 'lucide-react';
import { ConnectionState, HealthStatusResponse } from '../../types';
import { HealthBadge } from '../HealthBadge';

interface SidebarProps {
  healthState: ConnectionState;
  healthData: HealthStatusResponse | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ healthState, healthData }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">A</div>
        <div>
          <span className="sidebar-logo-text">ALIGN</span>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            COMPLIANCE ENGINE
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/organizations" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <Building2 size={18} />
          <span>Organizations</span>
        </NavLink>

        <div style={{ margin: '1.5rem 0 0.5rem 0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
          COMPLIANCE MODULES
        </div>

        <NavLink 
          to="/regulations" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <ShieldCheck size={18} />
          <span>Regulations</span>
        </NavLink>

        <NavLink 
          to="/sops" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Policies & SOPs</span>
        </NavLink>

        <div className="sidebar-item" style={{ opacity: 0.4, cursor: 'not-allowed' }}>
          <GitBranch size={18} />
          <span>Workflows</span>
        </div>

        <NavLink 
          to="/findings" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <AlertTriangle size={18} />
          <span>Findings</span>
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
          PLATFORM STATUS
        </div>
        <HealthBadge state={healthState} healthData={healthData} />
      </div>
    </aside>
  );
};
