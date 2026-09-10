import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegulatoryChangeById, getChangeImpacts, updateImpactStatus } from '../api/regulatoryChanges';
import { RegulatoryChange, ChangeImpact } from '../types/regulatoryChange';
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';

export const RegulatoryChangeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  const [change, setChange] = useState<RegulatoryChange | null>(null);
  const [impacts, setImpacts] = useState<ChangeImpact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!currentOrganization || !id) return;
    try {
      setLoading(true);
      setError(null);
      const [changeData, impactsData] = await Promise.all([
        getRegulatoryChangeById(id),
        getChangeImpacts(id)
      ]);
      setChange(changeData);
      setImpacts(impactsData);
    } catch (err: any) {
      setError('Failed to load regulatory change impact report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentOrganization, id]);

  const handleStatusUpdate = async (impactId: string, newStatus: string) => {
    try {
      setUpdatingStatusId(impactId);
      const updated = await updateImpactStatus(impactId, newStatus);
      setImpacts(prev => prev.map(imp => imp.id === impactId ? updated : imp));
    } catch (err: any) {
      alert('Failed to update status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getImpactBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="status-badge offline">CRITICAL</span>;
      case 'HIGH':
        return <span className="status-badge draft" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>HIGH</span>;
      case 'MEDIUM':
        return <span className="status-badge published" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>MEDIUM</span>;
      default:
        return <span className="status-badge">{level}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  if (error || !change) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => navigate('/regulatory-changes')} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Regulatory Changes</span>
        </button>
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#fb7185' }}>
          <AlertTriangle size={36} style={{ marginBottom: '0.5rem' }} />
          <p>{error || 'Change report not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <button onClick={() => navigate('/regulatory-changes')} className="btn btn-secondary" style={{ marginBottom: '1.5rem', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} />
        <span>Back to Regulatory Changes</span>
      </button>

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '0.9rem' }}>
                Regulation Version {change.oldVersionNumber} → Version {change.newVersionNumber}
              </div>
              <span className="status-badge published">Change Detected</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {change.summary}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Regulation ID: <strong style={{ color: 'var(--text-secondary)' }}>{change.regulationId}</strong></span>
              <span>Detected: <strong style={{ color: 'var(--text-secondary)' }}>{new Date(change.detectedAt).toLocaleString()}</strong></span>
            </div>
          </div>

          <Link to={`/regulations/${change.regulationId}`} className="btn btn-secondary">
            <ShieldCheck size={16} color="var(--accent-cyan)" />
            <span>View Regulation</span>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Changed Requirements Diff Card */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>
            <FileText size={20} color="var(--accent-cyan)" />
            <span>Changed Requirements Clauses ({change.changedRequirements?.length || 0})</span>
          </div>

          {change.changedRequirements?.map((item, idx) => (
            <div key={idx} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
                  {item.sectionReference}
                </span>
                <span className="status-badge draft">{item.changeType}</span>
              </div>

              {item.oldText && (
                <div style={{ fontSize: '0.825rem', color: '#fb7185', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem', color: '#fda4af' }}>PREVIOUS VERSION (v{change.oldVersionNumber})</span>
                  "{item.oldText}"
                </div>
              )}

              {item.newText && (
                <div style={{ fontSize: '0.825rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem', color: 'var(--accent-emerald)' }}>NEW REVISED REQUIREMENT (v{change.newVersionNumber})</span>
                  "{item.newText}"
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Affected SOPs & Departments Card */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>
            <Building2 size={20} color="var(--accent-indigo)" />
            <span>Downstream SOP & Department Impacts ({impacts.length})</span>
          </div>

          {impacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No downstream SOP impacts recorded for this regulatory change.
            </div>
          ) : (
            impacts.map((imp) => (
              <div key={imp.id} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <Link to={`/sops/${imp.sopId}`} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={14} color="var(--accent-cyan)" />
                      <span>{imp.sopTitle}</span>
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      Department: <strong style={{ color: 'var(--accent-indigo)' }}>{imp.assignedDepartment}</strong>
                    </div>
                  </div>
                  {getImpactBadge(imp.impactLevel)}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  <strong>Impact Rationale:</strong> {imp.reason}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', marginBottom: '0.75rem', background: 'rgba(245, 158, 11, 0.08)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <strong>Required Action:</strong> {imp.requiredAction}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Review Status: <strong style={{ color: 'var(--text-primary)' }}>{imp.status}</strong>
                  </span>

                  {imp.status !== 'SOP_REVISED' && (
                    <button
                      onClick={() => handleStatusUpdate(imp.id, 'SOP_REVISED')}
                      disabled={updatingStatusId === imp.id}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      {updatingStatusId === imp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 size={12} color="var(--accent-emerald)" />}
                      <span>Mark SOP Revised</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
