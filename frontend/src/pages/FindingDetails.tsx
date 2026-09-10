import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFindingById, updateFindingStatus } from '../api/findings';
import { FindingResponse, FindingStatus, FindingSeverity } from '../types/finding';
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  User, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  Info,
  Check,
  XCircle
} from 'lucide-react';

export const FindingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  const [finding, setFinding] = useState<FindingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const fetchFindingDetail = async () => {
    if (!currentOrganization || !id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getFindingById(currentOrganization.id, id);
      setFinding(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load finding details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindingDetail();
  }, [currentOrganization, id]);

  const handleStatusChange = async (newStatus: FindingStatus) => {
    if (!currentOrganization || !id) return;
    try {
      setUpdatingStatus(true);
      const updated = await updateFindingStatus(currentOrganization.id, id, {
        status: newStatus,
        notes: `Status changed to ${newStatus}`,
      });
      setFinding(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update finding status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getSeverityBadge = (sev: FindingSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="status-badge offline" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>CRITICAL SEVERITY</span>;
      case 'HIGH':
        return <span className="status-badge offline">HIGH SEVERITY</span>;
      case 'MEDIUM':
        return <span className="status-badge draft">MEDIUM SEVERITY</span>;
      case 'LOW':
        return <span className="status-badge published">LOW SEVERITY</span>;
      default:
        return <span className="status-badge">{sev}</span>;
    }
  };

  const getStatusBadge = (st: FindingStatus) => {
    switch (st) {
      case 'OPEN':
        return <span className="status-badge draft">Open</span>;
      case 'UNDER_REVIEW':
        return <span className="status-badge draft" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>Under Review</span>;
      case 'ACCEPTED':
        return <span className="status-badge archived">Accepted Risk</span>;
      case 'RESOLVED':
        return <span className="status-badge published">Resolved</span>;
      case 'DISMISSED':
        return <span className="status-badge archived">Dismissed</span>;
      default:
        return <span className="status-badge">{st}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  if (error || !finding) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Error Loading Finding</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error || 'Finding record not found.'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/findings')}>
          <ArrowLeft size={16} />
          <span>Return to Findings Library</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/findings')} style={{ padding: '0.4rem 0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Compliance Findings</span>
        </button>

        {/* Status Transition Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {finding.status === 'OPEN' && (
            <button
              className="btn btn-secondary"
              onClick={() => handleStatusChange('UNDER_REVIEW')}
              disabled={updatingStatus}
            >
              <Clock size={16} color="var(--accent-cyan)" />
              <span>Mark Under Review</span>
            </button>
          )}

          {finding.status !== 'RESOLVED' && (
            <button
              className="btn btn-primary"
              onClick={() => handleStatusChange('RESOLVED')}
              disabled={updatingStatus}
            >
              <CheckCircle2 size={16} />
              <span>Mark Resolved</span>
            </button>
          )}

          {finding.status !== 'DISMISSED' && finding.status !== 'RESOLVED' && (
            <button
              className="btn btn-secondary"
              onClick={() => handleStatusChange('DISMISSED')}
              disabled={updatingStatus}
              style={{ color: 'var(--text-muted)' }}
            >
              <XCircle size={16} />
              <span>Dismiss</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Banner Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {getSeverityBadge(finding.severity)}
              {getStatusBadge(finding.status)}
              <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                {finding.findingType}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {finding.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '850px' }}>
              {finding.description}
            </p>
          </div>

          {/* Risk Score Gauge Display */}
          <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              DETERMINISTIC RISK SCORE
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: finding.riskScore >= 70 ? '#ef4444' : finding.riskScore >= 40 ? '#f59e0b' : '#10b981' }}>
              {finding.riskScore.toFixed(0)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ 100</span>
            </div>
          </div>
        </div>

        {/* Details Footer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              ASSIGNED REVIEWER
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              <User size={14} color="var(--accent-cyan)" />
              {finding.assignedTo || 'Unassigned'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              DETECTED DATE
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {new Date(finding.createdAt).toLocaleString()}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              LAST UPDATED
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {new Date(finding.updatedAt).toLocaleString()}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              RESOLVED TIMESTAMP
            </span>
            <span style={{ fontSize: '0.85rem', color: finding.resolvedAt ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
              {finding.resolvedAt ? new Date(finding.resolvedAt).toLocaleString() : 'Open / In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Cautionary Language Banner */}
      <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', color: '#93c5fd' }}>
        <Info size={20} style={{ flexShrink: 0 }} />
        <span>
          <strong>Cautionary Policy Notice:</strong> Align Compliance Findings represent rule-based procedural risk indicators and potential compliance gaps. The system does not issue legal violation determinations.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        
        {/* Left Column: Evidence & Recommended Actions */}
        <div>
          {/* Recommended Next Action Card */}
          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div className="card-title">
              <Check size={20} color="var(--accent-cyan)" />
              <span>Recommended Next Action</span>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '0.5rem' }}>
              {finding.recommendedAction || 'Review mapped procedures and assign remediation reviewer.'}
            </p>
          </div>

          {/* Evidence & Technical Rationale Card */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '0.75rem' }}>
              <Info size={20} color="var(--accent-amber)" />
              <span>Finding Evidence & Technical Context</span>
            </div>

            <div style={{ padding: '1rem', background: '#050811', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', lineHeight: 1.5, overflowX: 'auto' }}>
              {finding.evidence || 'Deterministic risk rule evaluation generated this finding.'}
            </div>
          </div>
        </div>

        {/* Right Column: Cross-Referenced Entities */}
        <div>
          {/* Mapped Regulation Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title">
              <ShieldCheck size={18} color="var(--accent-blue)" />
              <span>Regulatory Standard</span>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <div 
                onClick={() => finding.regulationId && navigate(`/regulations/${finding.regulationId}`)}
                style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}
              >
                <span>{finding.regulationTitle || 'Regulation Entry'}</span>
                <ExternalLink size={14} style={{ opacity: 0.6 }} />
              </div>

              {finding.sectionReference && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                    Clause: {finding.sectionReference}
                  </span>
                </div>
              )}

              {finding.requirementText && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.4, background: 'rgba(255, 255, 255, 0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                  "{finding.requirementText}"
                </p>
              )}
            </div>
          </div>

          {/* Mapped SOP Card */}
          <div className="card">
            <div className="card-title">
              <FileText size={18} color="var(--accent-cyan)" />
              <span>Mapped SOP Document</span>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              {finding.sopTitle ? (
                <>
                  <div 
                    onClick={() => finding.sopId && navigate(`/sops/${finding.sopId}`)}
                    style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}
                  >
                    <span>{finding.sopTitle}</span>
                    <ExternalLink size={14} style={{ opacity: 0.6 }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Department: <strong>{finding.department || 'Operations'}</strong>
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No SOP currently mapped to this requirement.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
