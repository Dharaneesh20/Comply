import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSOPs } from '../api/sops';
import { SOP, SOPStatus } from '../types/sop';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
} from 'lucide-react';

function StatusBadge({ status }: { status: SOPStatus }) {
  const map: Record<SOPStatus, { cls: string; label: string; icon: React.ReactNode }> = {
    PUBLISHED: { cls: 'badge-success', label: 'Published',  icon: <CheckCircle2 size={11} /> },
    DRAFT:     { cls: 'badge-warning', label: 'Draft',      icon: <Clock        size={11} /> },
    ARCHIVED:  { cls: 'badge-neutral', label: 'Archived',   icon: <Archive      size={11} /> },
  };
  const cfg = map[status] ?? { cls: 'badge-neutral', label: status, icon: null };
  return <span className={`badge ${cfg.cls}`}>{cfg.icon}{cfg.label}</span>;
}

const SkeletonRow: React.FC = () => (
  <tr>
    {[1,2,3,4,5,6].map(i => (
      <td key={i} style={{ padding: 'var(--space-4)' }}>
        <div className="skeleton skeleton-text" style={{ width: i === 1 ? '70%' : '50%' }} />
      </td>
    ))}
  </tr>
);

export const SOPsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  const [sops, setSops]               = useState<SOP[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedDept, setSelectedDept]     = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchSOPs = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getSOPs(
        currentOrganization.id,
        selectedStatus !== 'ALL' ? selectedStatus : undefined,
        selectedDept   !== 'ALL' ? selectedDept   : undefined,
      );
      setSops(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load SOPs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSOPs(); }, [currentOrganization, selectedDept, selectedStatus]);

  const filteredSops = sops.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = Array.from(new Set(sops.map(s => s.department))).filter(Boolean);

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <h2 className="page-title">Standard Operating Procedures</h2>
            <p className="page-subtitle">
              Manage, version, and review operational policy documentation
              {currentOrganization ? ` for ${currentOrganization.name}` : ''}.
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/sops/new')} id="create-sop-btn">
              <Plus size={15} />
              New SOP
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        {/* Search */}
        <div className="search-wrap" style={{ flex: '1', minWidth: 240 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search SOPs…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search SOPs"
          />
        </div>

        {/* Department filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          aria-label="Filter by department"
        >
          <option value="ALL">All departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Status filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {!loading && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filteredSops.length} {filteredSops.length === 1 ? 'SOP' : 'SOPs'}
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
      {!loading && filteredSops.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText size={36} className="empty-state-icon" />
            <h3 className="empty-state-title">No SOPs found</h3>
            <p className="empty-state-description">
              {searchTerm || selectedDept !== 'ALL' || selectedStatus !== 'ALL'
                ? 'No SOPs match your current filters. Try adjusting your search.'
                : 'Create your first Standard Operating Procedure to begin tracking compliance.'}
            </p>
            {!searchTerm && (
              <button className="btn btn-primary" onClick={() => navigate('/sops/new')}>
                <Plus size={15} />
                Create first SOP
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="align-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Department</th>
                <th>Version</th>
                <th>Status</th>
                <th>Next review</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                : filteredSops.map(sop => (
                  <tr key={sop.id}>
                    <td>
                      <div
                        onClick={() => navigate(`/sops/${sop.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                          <FileText size={14} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                          {sop.title}
                        </div>
                        {sop.description && (
                          <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: 2, maxWidth: 360, marginLeft: 22 }}>
                            {sop.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        <Building2 size={13} color="var(--text-muted)" />
                        {sop.department}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', background: 'var(--bg-surface-raised)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
                        v{sop.currentVersion || 1}
                      </span>
                    </td>
                    <td><StatusBadge status={sop.status} /></td>
                    <td>
                      {sop.nextReviewAt ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          <Calendar size={13} color="var(--color-warning)" />
                          {new Date(sop.nextReviewAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Not scheduled</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {new Date(sop.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/sops/${sop.id}`)}
                        aria-label={`View ${sop.title}`}
                      >
                        View
                        <ArrowRight size={13} />
                      </button>
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
