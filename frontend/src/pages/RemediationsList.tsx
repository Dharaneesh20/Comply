import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRemediations, updateRemediation } from '../api/remediations';
import { RemediationTask, RemediationPriority, RemediationStatus } from '../types/remediation';
import {
  CheckSquare,
  Search,
  AlertCircle,
  User,
  FileText,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

function PriorityBadge({ priority }: { priority: RemediationPriority }) {
  const map: Record<string, { cls: string; label: string }> = {
    CRITICAL: { cls: 'badge-critical', label: 'Critical' },
    HIGH:     { cls: 'badge-high',     label: 'High'     },
    MEDIUM:   { cls: 'badge-medium',   label: 'Medium'   },
    LOW:      { cls: 'badge-low',      label: 'Low'      },
  };
  const cfg = map[priority] ?? { cls: 'badge-neutral', label: priority };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

function StatusBadge({ status }: { status: RemediationStatus }) {
  const map: Record<string, { cls: string; label: string }> = {
    OPEN:        { cls: 'badge-neutral', label: 'Open'        },
    IN_PROGRESS: { cls: 'badge-info',    label: 'In Progress' },
    BLOCKED:     { cls: 'badge-danger',  label: 'Blocked'     },
    COMPLETED:   { cls: 'badge-success', label: 'Completed'   },
  };
  const cfg = map[status] ?? { cls: 'badge-neutral', label: status };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

const SkeletonRow: React.FC = () => (
  <tr>
    {[1,2,3,4,5,6,7].map(i => (
      <td key={i} style={{ padding: 'var(--space-4)' }}>
        <div className="skeleton skeleton-text" style={{ width: i === 1 ? '65%' : '50%' }} />
      </td>
    ))}
  </tr>
);

export const RemediationsList: React.FC = () => {
  const { currentOrganization } = useAuth();

  const [tasks, setTasks]             = useState<RemediationTask[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter]     = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [updatingId, setUpdatingId]   = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getRemediations();
      setTasks(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError('Failed to load remediation tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [currentOrganization]);

  const handleStatusChange = async (taskId: string, newStatus: RemediationStatus) => {
    try {
      setUpdatingId(taskId);
      const updated = await updateRemediation(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch {
      setError('Failed to update task status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus   = statusFilter   === 'ALL' || t.status   === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <h2 className="page-title">Remediation Tasks</h2>
            <p className="page-subtitle">
              Manage actionable remediation assignments and track owner execution.
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <div className="search-wrap" style={{ flex: '1', minWidth: 240 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search tasks, descriptions, assigned owners…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search remediation tasks"
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 150 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="BLOCKED">Blocked</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 150 }}
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="ALL">All priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        {!loading && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
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

      {/* Content */}
      {!loading && filteredTasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CheckSquare size={36} className="empty-state-icon" />
            <h3 className="empty-state-title">No remediation tasks</h3>
            <p className="empty-state-description">
              {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'No tasks match your current filters.'
                : 'Navigate to a compliance finding and create a remediation task to get started.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="align-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned to</th>
                <th>Links</th>
                <th>Created</th>
                <th className="text-right">Update status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                : filteredTasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                        {t.title}
                      </div>
                      {t.description && (
                        <div className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2, maxWidth: 300 }}>
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <StatusBadge status={t.status} />
                        {updatingId === t.id && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />}
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        <User size={13} color="var(--text-muted)" />
                        {t.assignedTo || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Unassigned</span>}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        {t.findingId && (
                          <Link to={`/findings/${t.findingId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-danger-text)' }}>
                            <ShieldCheck size={11} />
                            Finding
                          </Link>
                        )}
                        {t.sopId && (
                          <Link to={`/sops/${t.sopId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
                            <FileText size={11} />
                            SOP
                          </Link>
                        )}
                        {!t.findingId && !t.sopId && (
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="text-right">
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', width: 'auto', minWidth: 140 }}
                        value={t.status}
                        disabled={updatingId === t.id}
                        onChange={e => handleStatusChange(t.id, e.target.value as RemediationStatus)}
                        aria-label={`Update status for ${t.title}`}
                      >
                        <option value="OPEN">Mark Open</option>
                        <option value="IN_PROGRESS">Mark In Progress</option>
                        <option value="BLOCKED">Mark Blocked</option>
                        <option value="COMPLETED">Mark Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
