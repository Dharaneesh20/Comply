import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuditEvents } from '../api/audit';
import { AuditEvent } from '../types/audit';
import {
  ScrollText,
  Clock,
  User,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  LogIn,
  FilePlus,
  CheckCircle2,
  Link2,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

function getActionConfig(action: string): { icon: React.ReactNode; cls: string; label: string } {
  if (action.includes('LOGIN'))                return { icon: <LogIn size={13} />,        cls: 'badge-success', label: action };
  if (action.includes('CREATED'))              return { icon: <FilePlus size={13} />,     cls: 'badge-accent',  label: action };
  if (action.includes('APPROVED') || action.includes('COMPLETED')) return { icon: <CheckCircle2 size={13} />, cls: 'badge-success', label: action };
  if (action.includes('MAPPING'))              return { icon: <Link2 size={13} />,         cls: 'badge-info',    label: action };
  if (action.includes('FINDING'))              return { icon: <ShieldAlert size={13} />,  cls: 'badge-warning', label: action };
  if (action.includes('REMEDIATION'))          return { icon: <Wrench size={13} />,       cls: 'badge-neutral', label: action };
  return { icon: null, cls: 'badge-neutral', label: action };
}

function formatEventDate(timestamp: string): { date: string; time: string } {
  const d = new Date(timestamp);
  return {
    date: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

function groupEventsByDate(events: AuditEvent[]): Record<string, AuditEvent[]> {
  return events.reduce<Record<string, AuditEvent[]>>((acc, evt) => {
    const date = new Date(evt.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    (acc[date] ??= []).push(evt);
    return acc;
  }, {});
}

const SkeletonRow: React.FC = () => (
  <div style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--border)' }}>
    <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 'var(--radius-xs)', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div className="skeleton skeleton-text" style={{ width: '40%' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
    </div>
  </div>
);

export const AuditTrail: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [events, setEvents]           = useState<AuditEvent[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchAudit = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditEvents(currentOrganization.id, actionFilter, page, 15);
      setEvents(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudit(); }, [currentOrganization, actionFilter, page]);

  const grouped = groupEventsByDate(events);

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <h2 className="page-title">Audit Log</h2>
            <p className="page-subtitle">
              Tamper-evident record of all critical compliance actions, authentication events, and modifications.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="alert alert-neutral" style={{ marginBottom: 'var(--space-6)' }}>
        <Info size={15} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 'var(--text-sm)' }}>
          <strong>Privacy policy:</strong> Align records only metadata, action identifiers, and timestamps. Raw document content and credentials are never stored in audit streams.
        </span>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 220 }}
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(0); }}
          aria-label="Filter by action type"
        >
          <option value="ALL">All event types</option>
          <option value="USER_LOGIN">User login</option>
          <option value="SOP_CREATED">SOP created</option>
          <option value="SOP_APPROVED">SOP approved</option>
          <option value="REGULATION_CREATED">Regulation created</option>
          <option value="MAPPING_CREATED">Mapping created</option>
          <option value="FINDING_CREATED">Finding created</option>
          <option value="REMEDIATION_CREATED">Remediation created</option>
          <option value="REMEDIATION_COMPLETED">Remediation completed</option>
        </select>
        {!loading && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {totalElements.toLocaleString()} total events
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Timeline */}
      <div className="card card-padding">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[1,2,3,4,5,6,7,8].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <ScrollText size={36} className="empty-state-icon" />
            <h3 className="empty-state-title">No audit events</h3>
            <p className="empty-state-description">No events match your current filter.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dayEvents]) => (
            <div key={date} style={{ marginBottom: 'var(--space-6)' }}>
              {/* Date label */}
              <div style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text-muted)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-3)',
                paddingBottom: 'var(--space-2)',
                borderBottom: '1px solid var(--border)',
              }}>
                {date}
              </div>

              {/* Events for this day */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {dayEvents.map(evt => {
                  const cfg = getActionConfig(evt.action);
                  const { time } = formatEventDate(evt.timestamp);
                  return (
                    <div key={evt.id} style={{
                      display: 'flex',
                      gap: 'var(--space-4)',
                      alignItems: 'flex-start',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'background var(--duration-fast) var(--ease-default)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Time */}
                      <div style={{
                        width: 64,
                        flexShrink: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-muted)',
                        paddingTop: 2,
                      }}>
                        <Clock size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                        {time}
                      </div>

                      {/* Event body */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
                          <span className={`badge ${cfg.cls}`} style={{ gap: 4 }}>
                            {cfg.icon}
                            {cfg.label.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          {(evt.actorEmail || evt.actorId) && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <User size={11} color="var(--text-muted)" />
                              {evt.actorEmail || evt.actorId}
                            </span>
                          )}
                          {evt.resourceType && (
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {evt.resourceType}{evt.resourceId ? ` · ${evt.resourceId.slice(0, 8)}…` : ''}
                            </span>
                          )}
                          {evt.ipAddress && evt.ipAddress !== '0.0.0.0' && (
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {evt.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ borderTop: '1px solid var(--border)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
            <span className="pagination-info">Page {page + 1} of {totalPages}</span>
            <div className="pagination-controls">
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={15} /> Previous
              </button>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
