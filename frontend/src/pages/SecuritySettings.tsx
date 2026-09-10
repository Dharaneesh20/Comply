import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSecurityConfig } from '../api/audit';
import { SecurityConfigInfo } from '../types/audit';
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Key, 
  CheckCircle2, 
  Globe, 
  Loader2
} from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const { currentOrganization, user } = useAuth();

  const [config, setConfig] = useState<SecurityConfigInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSecurityConfig = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      const data = await getSecurityConfig(currentOrganization.id);
      setConfig(data);
    } catch (err: any) {
      console.error(err.response?.data?.message || 'Failed to load security and privacy settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityConfig();
  }, [currentOrganization]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Lock size={28} color="var(--accent-cyan)" />
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Security, Privacy & Infrastructure Controls</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Enterprise isolation guardrails, Role-Based Access Control (RBAC) matrix, and deployment topology settings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Left Column: Security Policy Cards */}
        <div>
          {/* Privacy & Deployment Architecture Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title" style={{ marginBottom: '1rem' }}>
              <Server size={20} color="var(--accent-cyan)" />
              <span>Deployment & Data Privacy Architecture</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  DEPLOYMENT TOPOLOGY
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {config?.deploymentMode || 'VPC_HYBRID'}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'block' }}>
                  Supports Private VPC & On-Premise customer isolation
                </span>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  AI PRIVACY GUARDRAIL
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: config?.externalAiEnabled ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                  {config?.externalAiEnabled ? 'EXTERNAL AI ENABLED' : 'LOCAL SANDBOX ONLY'}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'block' }}>
                  Documents never sent to public AI models automatically
                </span>
              </div>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: '#050811', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Data Isolation Boundary:</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>{config?.dataIsolationPolicy}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>At-Rest Encryption:</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{config?.storageEncryption}</strong>
              </div>
            </div>
          </div>

          {/* Role-Based Access Control (RBAC) Matrix Card */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>
              <Key size={20} color="var(--accent-indigo)" />
              <span>Role-Based Access Control (RBAC) Matrix</span>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Role Identifier</th>
                    <th>Audit Log View</th>
                    <th>SOP Authoring</th>
                    <th>SOP Approval</th>
                    <th>Security Admin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong style={{ color: '#ec4899' }}>OWNER</strong></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: 'var(--accent-indigo)' }}>ADMIN</strong></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: 'var(--accent-cyan)' }}>COMPLIANCE_MANAGER</strong></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: 'var(--accent-amber)' }}>REVIEWER</strong></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><CheckCircle2 size={16} color="var(--accent-emerald)" /></td>
                    <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                    <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: 'var(--text-muted)' }}>MEMBER</strong></td>
                    <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                    <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                    <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                    <td><span style={{ color: 'var(--text-muted)' }}>—</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: User Role & Active Security Headers */}
        <div>
          {/* Active User Context Card */}
          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div className="card-title">
              <ShieldCheck size={18} color="var(--accent-cyan)" />
              <span>Active User Role Context</span>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>YOUR ENFORCED ROLE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
                {config?.userRole || 'ADMIN'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Authenticated Email: <strong>{user?.email}</strong>
              </div>
            </div>
          </div>

          {/* Active HTTP Security Headers Card */}
          <div className="card">
            <div className="card-title">
              <Globe size={18} color="var(--accent-emerald)" />
              <span>Active Security Headers</span>
            </div>
            <p className="card-subtitle">Enforced by Spring Security Filter</p>

            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
              <div style={{ background: '#050811', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--accent-cyan)', display: 'block' }}>X-Frame-Options:</span> DENY
              </div>
              <div style={{ background: '#050811', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--accent-cyan)', display: 'block' }}>Content-Security-Policy:</span> default-src 'self'
              </div>
              <div style={{ background: '#050811', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--accent-cyan)', display: 'block' }}>X-XSS-Protection:</span> 1; mode=block
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
