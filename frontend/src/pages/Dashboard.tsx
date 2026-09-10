import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectionState, HealthStatusResponse } from '../types';

import { useAuth } from '../context/AuthContext';
import { getSOPMetrics } from '../api/sops';
import { getRegulationMetrics } from '../api/regulations';
import { getFindingMetrics } from '../api/findings';
import { SOPMetricsResponse } from '../types/sop';
import { RegulationMetricsResponse } from '../types/regulation';
import { FindingMetricsResponse } from '../types/finding';
import {
  FileText,
  ShieldCheck,
  ListChecks,
  AlertTriangle,
  Plus,
  ArrowRight,
  Server,
  Database,
} from 'lucide-react';

interface DashboardProps {
  healthState: ConnectionState;
  healthData: HealthStatusResponse | null;
  lastChecked: Date | null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const MetricCard: React.FC<{
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  iconColor: string;
  onClick?: () => void;
}> = ({ label, value, sub, icon, iconColor, onClick }) => (
  <div
    className="metric-card"
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
    aria-label={`${label}: ${value}`}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="metric-label">{label}</span>
      <span style={{ color: iconColor, opacity: 0.8 }}>{icon}</span>
    </div>
    <div className="metric-value">{value}</div>
    {sub && (
      <div className="metric-sub">
        <span>{sub}</span>
        {onClick && <ArrowRight size={12} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />}
      </div>
    )}
  </div>
);

const SkeletonMetric: React.FC = () => (
  <div className="metric-card" style={{ gap: 'var(--space-3)' }}>
    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
    <div className="skeleton" style={{ height: 36, width: '60%', borderRadius: 'var(--radius-xs)' }} />
    <div className="skeleton skeleton-text" style={{ width: '70%' }} />
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ healthData, lastChecked }) => {

  const { currentOrganization, user } = useAuth();
  const navigate = useNavigate();
  const isMongoConnected = healthData?.database === 'UP';

  const [sopMetrics, setSopMetrics]       = useState<SOPMetricsResponse | null>(null);
  const [regMetrics, setRegMetrics]       = useState<RegulationMetricsResponse | null>(null);
  const [findingMetrics, setFindingMetrics] = useState<FindingMetricsResponse | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (!currentOrganization) { setLoadingMetrics(false); return; }
    setLoadingMetrics(true);
    Promise.all([
      getSOPMetrics(currentOrganization.id),
      getRegulationMetrics(currentOrganization.id),
      getFindingMetrics(currentOrganization.id),
    ])
      .then(([sopData, regData, findData]) => {
        setSopMetrics(sopData);
        setRegMetrics(regData);
        setFindingMetrics(findData);
      })
      .catch(() => {
        setSopMetrics(null);
        setRegMetrics(null);
        setFindingMetrics(null);
      })
      .finally(() => setLoadingMetrics(false));
  }, [currentOrganization]);

  const openFindings    = findingMetrics?.totalOpen    ?? 0;
  const criticalFindings = findingMetrics?.criticalCount ?? 0;
  const highFindings    = findingMetrics?.highCount    ?? 0;
  const urgentCount     = criticalFindings + highFindings;

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-tight)',
              marginBottom: 'var(--space-1)',
            }}>
              {getGreeting()}{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>
              {currentOrganization
                ? `${currentOrganization.name} — compliance overview`
                : 'Select an organization to view your compliance workspace.'}
            </p>
          </div>

          {currentOrganization && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sops/new')}>
                <Plus size={14} />
                New SOP
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/regulations/new')}>
                <Plus size={14} />
                Add Regulation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Needs attention banner ── */}
      {!loadingMetrics && urgentCount > 0 && (
        <div
          className="alert alert-warning"
          style={{ marginBottom: 'var(--space-6)', cursor: 'pointer' }}
          onClick={() => navigate('/findings')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate('/findings')}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <div>
            <strong>Attention required — </strong>
            {urgentCount} high-priority finding{urgentCount !== 1 ? 's' : ''} need{urgentCount === 1 ? 's' : ''} review
            ({criticalFindings > 0 ? `${criticalFindings} critical` : ''}{criticalFindings > 0 && highFindings > 0 ? ', ' : ''}{highFindings > 0 ? `${highFindings} high` : ''}).
          </div>
          <ArrowRight size={14} style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </div>
      )}

      {/* ── Metrics grid ── */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          Compliance overview
        </h3>
        <div className="grid-metrics">
          {loadingMetrics ? (
            [1,2,3,4].map(i => <SkeletonMetric key={i} />)
          ) : (
            <>
              <MetricCard
                label="SOPs"
                value={sopMetrics?.totalSops ?? 0}
                sub="Standard operating procedures"
                icon={<FileText size={18} />}
                iconColor="var(--color-accent)"
                onClick={() => navigate('/sops')}
              />
              <MetricCard
                label="Regulations"
                value={regMetrics?.totalRegulations ?? 0}
                sub="Regulatory frameworks tracked"
                icon={<ShieldCheck size={18} />}
                iconColor="var(--color-success)"
                onClick={() => navigate('/regulations')}
              />
              <MetricCard
                label="Requirements"
                value={regMetrics?.totalRequirements ?? 0}
                sub="Extracted clauses and sections"
                icon={<ListChecks size={18} />}
                iconColor="var(--color-info)"
                onClick={() => navigate('/regulations')}
              />
              <MetricCard
                label="Open Findings"
                value={openFindings}
                sub={urgentCount > 0 ? `${urgentCount} critical or high` : 'No urgent items'}
                icon={<AlertTriangle size={18} />}
                iconColor={urgentCount > 0 ? 'var(--color-danger)' : 'var(--color-warning)'}
                onClick={() => navigate('/findings')}
              />
            </>
          )}
        </div>
      </section>

      {/* ── System status + workspace ── */}
      <section>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
          System status
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Backend status */}
          <div className="card card-padding">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <Server size={16} color="var(--text-secondary)" />
              <span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Backend
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>API Server</span>
                <span style={{ color: healthData?.application === 'UP' ? 'var(--color-success-text)' : 'var(--color-danger-text)', fontWeight: 'var(--weight-medium)' }}>
                  {healthData ? (healthData.application === 'UP' ? 'Operational' : 'Degraded') : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Database</span>
                <span style={{ color: isMongoConnected ? 'var(--color-success-text)' : 'var(--color-danger-text)', fontWeight: 'var(--weight-medium)' }}>
                  {healthData ? (isMongoConnected ? 'Connected' : 'Disconnected') : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last checked</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                  {lastChecked ? lastChecked.toLocaleTimeString() : '—'}
                </span>
              </div>
              {user && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Session</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-xs)' }}>
                    {user.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Workspace */}
          <div className="card card-padding">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <Database size={16} color="var(--text-secondary)" />
              <span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Active workspace
              </span>
            </div>

            {currentOrganization ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Organization</span>
                  <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                    {currentOrganization.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Slug</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                    /{currentOrganization.slug}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Your role</span>
                  <span className="badge badge-accent" style={{ fontSize: 'var(--text-xs)' }}>
                    {currentOrganization.memberRole}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span className={`badge ${currentOrganization.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: 'var(--text-xs)' }}>
                    {currentOrganization.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  No organization selected.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/organizations')}>
                  <Plus size={14} />
                  Create organization
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
