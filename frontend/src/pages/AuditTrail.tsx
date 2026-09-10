import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuditEvents } from '../api/audit';
import { AuditEvent } from '../types/audit';
import { 
  ShieldAlert, 
  Filter, 
  User, 
  Clock, 
  Loader2, 
  AlertCircle, 
  Database, 
  ChevronLeft, 
  ChevronRight,
  Info
} from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { currentOrganization } = useAuth();

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchAuditTrail = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditEvents(currentOrganization.id, actionFilter, page, 15);
      setEvents(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch organization audit log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditTrail();
  }, [currentOrganization, actionFilter, page]);

  const getActionBadge = (act: string) => {
    if (act.includes('LOGIN')) return <span className="status-badge published">USER LOGIN</span>;
    if (act.includes('APPROVED') || act.includes('COMPLETED')) return <span className="status-badge published">{act}</span>;
    if (act.includes('CREATED') || act.includes('UPDATED')) return <span className="status-badge draft">{act}</span>;
    return <span className="status-badge archived">{act}</span>;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <ShieldAlert size={28} color="var(--accent-cyan)" />
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Immutable Audit Trail & Governance Log</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Complete, tamper-evident record of all critical compliance actions, authentication events, and procedure modifications.
        </p>
      </div>

      {/* Security Privacy Notice */}
      <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', color: '#93c5fd' }}>
        <Info size={20} style={{ flexShrink: 0 }} />
        <span>
          <strong>Privacy Guardrail Policy:</strong> Align audit logging strictly records metadata, action identifiers, and timestamps. Raw document contents and unencrypted credentials are never recorded in audit streams.
        </span>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Filter size={18} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Filter Action Type:</span>
            <select
              className="form-input"
              style={{ width: '220px', padding: '0.4rem 0.75rem' }}
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            >
              <option value="ALL">All Event Types</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="SOP_CREATED">SOP_CREATED</option>
              <option value="SOP_APPROVED">SOP_APPROVED</option>
              <option value="REGULATION_CREATED">REGULATION_CREATED</option>
              <option value="MAPPING_CREATED">MAPPING_CREATED</option>
              <option value="FINDING_CREATED">FINDING_CREATED</option>
              <option value="REMEDIATION_CREATED">REMEDIATION_CREATED</option>
              <option value="REMEDIATION_COMPLETED">REMEDIATION_COMPLETED</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{events.length}</strong> of <strong>{totalElements}</strong> recorded events
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--accent-rose)' }}>
            <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
            <p>{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
            <Database size={40} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600 }}>No audit events found for this filter query.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Actor / User</th>
                  <th>Target Resource</th>
                  <th>IP Address</th>
                  <th>Event Metadata</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.825rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} color="var(--accent-cyan)" />
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td>{getActionBadge(evt.action)}</td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <User size={14} color="var(--accent-indigo)" />
                        <span>{evt.actorEmail || evt.actorId}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        {evt.resourceType} : {evt.resourceId ? evt.resourceId.substring(0, 10) + '...' : 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {evt.ipAddress || '0.0.0.0'}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {evt.metadata ? JSON.stringify(evt.metadata) : '{}'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              className="btn btn-secondary"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{ padding: '0.4rem 0.85rem' }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              style={{ padding: '0.4rem 0.85rem' }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
