import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSecurityConfig } from '../api/audit';
import { SecurityConfigInfo } from '../types/audit';
import {
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';


const SettingRow: React.FC<{ label: string; value: React.ReactNode; description?: string }> = ({ label, value, description }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--border)',
  }}>
    <div>
      <div style={{ fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: description ? 2 : 0 }}>
        {label}
      </div>
      {description && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {description}
        </div>
      )}
    </div>
    <div style={{ flexShrink: 0, marginLeft: 'var(--space-4)' }}>
      {value}
    </div>
  </div>
);

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 'var(--space-6)' }}>
    <h3 style={{
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-muted)',
      letterSpacing: 'var(--tracking-wider)',
      textTransform: 'uppercase',
      marginBottom: 'var(--space-3)',
    }}>
      {title}
    </h3>
    <div className="card" style={{ overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);

export const SecuritySettings: React.FC = () => {
  const { currentOrganization, user } = useAuth();
  const [config, setConfig] = useState<SecurityConfigInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization) return;
    setLoading(true);
    getSecurityConfig(currentOrganization.id)
      .then(setConfig)
      .catch(err => console.error('Failed to load security config:', err))
      .finally(() => setLoading(false));
  }, [currentOrganization]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 size={24} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const rbacMatrix = [
    { role: 'OWNER',              cls: 'badge-danger',  audit: true,  sop: true,  approve: true, security: true },
    { role: 'ADMIN',              cls: 'badge-warning', audit: true,  sop: true,  approve: true, security: true },
    { role: 'COMPLIANCE_MANAGER', cls: 'badge-accent',  audit: true,  sop: true,  approve: true, security: false },
    { role: 'REVIEWER',           cls: 'badge-neutral', audit: true,  sop: true,  approve: false, security: false },
    { role: 'MEMBER',             cls: 'badge-neutral', audit: false, sop: false, approve: false, security: false },
  ];

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Security & Privacy</h2>
          <p className="page-subtitle">
            Infrastructure controls, access policies, and deployment architecture.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 'var(--space-6)' }}>
        {/* Left column */}
        <div>
          {/* Infrastructure */}
          <SettingsSection title="Infrastructure">
            <SettingRow
              label="Deployment topology"
              value={<span className="badge badge-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{config?.deploymentMode || 'VPC_HYBRID'}</span>}
              description="Supports private VPC and on-premise customer isolation"
            />
            <SettingRow
              label="AI privacy guardrail"
              value={
                <span className={`badge ${config?.externalAiEnabled ? 'badge-warning' : 'badge-success'}`}>
                  {config?.externalAiEnabled ? 'External AI enabled' : 'Local sandbox only'}
                </span>
              }
              description="Documents are never automatically sent to public AI models"
            />
            <SettingRow
              label="Data isolation boundary"
              value={<span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-success-text)' }}>{config?.dataIsolationPolicy || '—'}</span>}
            />
            <SettingRow
              label="At-rest encryption"
              value={<span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{config?.storageEncryption || '—'}</span>}
            />
          </SettingsSection>

          {/* RBAC Matrix */}
          <SettingsSection title="Role-Based Access Control">
            <div style={{ overflowX: 'auto' }}>
              <table className="align-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th style={{ textAlign: 'center' }}>Audit log</th>
                    <th style={{ textAlign: 'center' }}>SOP authoring</th>
                    <th style={{ textAlign: 'center' }}>SOP approval</th>
                    <th style={{ textAlign: 'center' }}>Security admin</th>
                  </tr>
                </thead>
                <tbody>
                  {rbacMatrix.map(row => (
                    <tr key={row.role}>
                      <td><span className={`badge ${row.cls}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{row.role}</span></td>
                      {[row.audit, row.sop, row.approve, row.security].map((perm, i) => (
                        <td key={i} style={{ textAlign: 'center' }}>
                          {perm
                            ? <CheckCircle2 size={16} color="var(--color-success)" />
                            : <X size={16} color="var(--text-muted)" />
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsSection>
        </div>

        {/* Right column */}
        <div>
          {/* Active session */}
          <SettingsSection title="Active session">
            <SettingRow
              label="Email"
              value={<span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{user?.email}</span>}
            />
            <SettingRow
              label="Enforced role"
              value={<span className="badge badge-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{config?.userRole || '—'}</span>}
            />
          </SettingsSection>

          {/* HTTP security headers */}
          <SettingsSection title="Security headers">
            {[
              { header: 'X-Frame-Options', value: 'DENY' },
              { header: 'X-XSS-Protection', value: '1; mode=block' },
              { header: 'Content-Security-Policy', value: "default-src 'self'" },
            ].map(h => (
              <div
                key={h.header}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>{h.header}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{h.value}</div>
              </div>
            ))}
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};
