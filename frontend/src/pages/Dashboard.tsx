import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectionState, HealthStatusResponse } from '../types';
import { HealthBadge } from '../components/HealthBadge';
import { useAuth } from '../context/AuthContext';
import { getSOPMetrics } from '../api/sops';
import { getRegulationMetrics } from '../api/regulations';
import { SOPMetricsResponse } from '../types/sop';
import { RegulationMetricsResponse } from '../types/regulation';
import { 
  Server, 
  FileText, 
  ShieldCheck,
  ListChecks,
  Building2, 
  Plus, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  healthState: ConnectionState;
  healthData: HealthStatusResponse | null;
  lastChecked: Date | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ healthState, healthData, lastChecked }) => {
  const { currentOrganization, user } = useAuth();
  const navigate = useNavigate();
  const isMongoConnected = healthData?.database === 'UP';

  const [sopMetrics, setSopMetrics] = useState<SOPMetricsResponse | null>(null);
  const [regMetrics, setRegMetrics] = useState<RegulationMetricsResponse | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);

  useEffect(() => {
    if (currentOrganization) {
      setLoadingMetrics(true);
      Promise.all([
        getSOPMetrics(currentOrganization.id),
        getRegulationMetrics(currentOrganization.id),
      ])
        .then(([sopData, regData]) => {
          setSopMetrics(sopData);
          setRegMetrics(regData);
        })
        .catch(() => {
          setSopMetrics(null);
          setRegMetrics(null);
        })
        .finally(() => setLoadingMetrics(false));
    }
  }, [currentOrganization]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {currentOrganization ? `${currentOrganization.name} Workspace` : 'Compliance Dashboard'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {currentOrganization ? `Organization Workspace: /${currentOrganization.slug} (${currentOrganization.memberRole})` : 'Select or create an organization to get started.'}
          </p>
        </div>

        {currentOrganization && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/sops/new')}>
              <Plus size={16} />
              <span>Create SOP</span>
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/regulations/new')}>
              <Plus size={16} />
              <span>Add Regulation</span>
            </button>
          </div>
        )}
      </div>

      {/* Real MongoDB Compliance Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Total SOPs */}
        <div 
          className="card" 
          style={{ padding: '1.25rem', cursor: 'pointer' }}
          onClick={() => navigate('/sops')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SOPs</span>
            <FileText size={20} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {loadingMetrics ? '...' : sopMetrics?.totalSops ?? 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard Operating Procedures</span>
            <ArrowRight size={14} color="var(--accent-cyan)" />
          </div>
        </div>

        {/* Regulations */}
        <div 
          className="card" 
          style={{ padding: '1.25rem', cursor: 'pointer' }}
          onClick={() => navigate('/regulations')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Regulations</span>
            <ShieldCheck size={20} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
            {loadingMetrics ? '...' : regMetrics?.totalRegulations ?? 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Regulatory Frameworks</span>
            <ArrowRight size={14} color="var(--accent-blue)" />
          </div>
        </div>

        {/* Requirements */}
        <div 
          className="card" 
          style={{ padding: '1.25rem', cursor: 'pointer' }}
          onClick={() => navigate('/regulations')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Requirements</span>
            <ListChecks size={20} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
            {loadingMetrics ? '...' : regMetrics?.totalRequirements ?? 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extracted Section Clauses</span>
            <ArrowRight size={14} color="var(--accent-purple)" />
          </div>
        </div>

        {/* Published SOPs */}
        <div 
          className="card" 
          style={{ padding: '1.25rem', cursor: 'pointer' }}
          onClick={() => navigate('/sops')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Published SOPs</span>
            <CheckCircle2 size={20} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {loadingMetrics ? '...' : sopMetrics?.publishedSops ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Operational SOPs</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Real-time System Status Card */}
        <div className="card">
          <div className="card-title">
            <Server size={20} color="var(--accent-cyan)" />
            <span>Authenticated System Session</span>
          </div>
          <p className="card-subtitle">
            Authenticated as <code style={{ color: 'var(--accent-cyan)' }}>{user?.email}</code>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Real-time System Status:</span>
            <HealthBadge state={healthState} healthData={healthData} showDetails={true} />
          </div>

          {healthData && (
            <table className="info-table">
              <tbody>
                <tr>
                  <th>User ID</th>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{user?.id}</td>
                </tr>
                <tr>
                  <th>Backend Engine Status</th>
                  <td>
                    <span style={{ color: healthData.application === 'UP' ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>
                      Backend: {healthData.application === 'UP' ? 'Online' : 'Offline'} ({healthData.application})
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>MongoDB Database Link</th>
                  <td>
                    <span style={{ color: isMongoConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>
                      MongoDB: {isMongoConnected ? 'Connected' : 'Disconnected'} ({healthData.database})
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Last Polled</th>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {lastChecked ? lastChecked.toLocaleTimeString() : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Active Workspace Info Card */}
        <div className="card">
          <div className="card-title">
            <Building2 size={20} color="var(--accent-blue)" />
            <span>Active Workspace Details</span>
          </div>
          <p className="card-subtitle">
            Contextual Organization Workspace
          </p>

          {currentOrganization ? (
            <table className="info-table">
              <tbody>
                <tr>
                  <th>Organization Name</th>
                  <td style={{ fontWeight: 700 }}>{currentOrganization.name}</td>
                </tr>
                <tr>
                  <th>Organization ID</th>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{currentOrganization.id}</td>
                </tr>
                <tr>
                  <th>URL Slug</th>
                  <td style={{ color: 'var(--accent-cyan)' }}>/{currentOrganization.slug}</td>
                </tr>
                <tr>
                  <th>User Role</th>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
                      {currentOrganization.memberRole}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              No organization selected. Please create or select an organization in the top menu or Organizations tab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
