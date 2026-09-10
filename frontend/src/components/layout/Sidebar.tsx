import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  FileText, 
  GitBranch, 
  AlertTriangle, 
  LogIn, 
  Settings
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
          to="/regulations" 
          className="sidebar-item" 
          style={{ opacity: 0.5, pointerEvents: 'none' }}
        >
          <ShieldCheck size={18} />
          <span>Regulations (Phase 1)</span>
        </NavLink>

        <NavLink 
          to="/policies" 
          className="sidebar-item" 
          style={{ opacity: 0.5, pointerEvents: 'none' }}
        >
          <FileText size={18} />
          <span>Policies & SOPs</span>
        </NavLink>

        <NavLink 
          to="/workflows" 
          className="sidebar-item" 
          style={{ opacity: 0.5, pointerEvents: 'none' }}
        >
          <GitBranch size={18} />
          <span>Workflows</span>
        </NavLink>

        <NavLink 
          to="/findings" 
          className="sidebar-item" 
          style={{ opacity: 0.5, pointerEvents: 'none' }}
        >
          <AlertTriangle size={18} />
          <span>Findings</span>
        </NavLink>

        <div style={{ margin: '1.5rem 0 0.5rem 0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
          SYSTEM & AUTH
        </div>

        <NavLink 
          to="/login" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <LogIn size={18} />
          <span>Login (Placeholder)</span>
        </NavLink>

        <NavLink 
          to="/settings" 
          className="sidebar-item" 
          style={{ opacity: 0.5, pointerEvents: 'none' }}
        >
          <Settings size={18} />
          <span>Settings</span>
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
