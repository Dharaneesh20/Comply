import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegulatoryChanges } from '../api/regulatoryChanges';
import { RegulatoryChange } from '../types/regulatoryChange';
import { GitBranch, Search, ArrowRight, AlertCircle } from 'lucide-react';

function ChangeBadge({ type }: { type: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    ADDED:    { cls: 'badge-success', label: 'Added'    },
    MODIFIED: { cls: 'badge-warning', label: 'Modified' },
    REMOVED:  { cls: 'badge-danger',  label: 'Removed'  },
    CRITICAL: { cls: 'badge-critical', label: 'Critical' },
  };
  const cfg = map[type] ?? { cls: 'badge-neutral', label: type };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

const SkeletonRow: React.FC = () => (
  <tr>
    {[1,2,3,4,5,6,7].map(i => (
      <td key={i} style={{ padding: 'var(--space-4)' }}>
        <div className="skeleton skeleton-text" style={{ width: i === 4 ? '75%' : '50%' }} />
      </td>
    ))}
  </tr>
);

export const RegulatoryChangesList: React.FC = () => {
  const { currentOrganization } = useAuth();
  const navigate = useNavigate();

  const [changes, setChanges]         = useState<RegulatoryChange[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError]             = useState<string | null>(null);

  const fetchChanges = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getRegulatoryChanges();
      setChanges(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError('Failed to fetch regulatory change history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChanges(); }, [currentOrganization]);

  const filteredChanges = changes.filter(c =>
    c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.regulationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <h2 className="page-title">Regulatory Change Impact Log</h2>
            <p className="page-subtitle">
              Track regulatory version changes, clause diffs, and downstream SOP impact assessments.
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div className="search-wrap" style={{ maxWidth: 480 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search change summary or regulation ID…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search regulatory changes"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {!loading && filteredChanges.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <GitBranch size={36} className="empty-state-icon" />
            <h3 className="empty-state-title">No regulatory changes recorded</h3>
            <p className="empty-state-description">
              {searchQuery
                ? 'No changes match your search.'
                : 'Navigate to a regulation details page and run "Analyze Version Change Impact" when a regulation is updated.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="align-table">
            <thead>
              <tr>
                <th>Regulation</th>
                <th>Versions</th>
                <th>Change type</th>
                <th>Summary</th>
                <th>Clauses changed</th>
                <th>Detected</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                : filteredChanges.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/regulatory-changes/${item.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', display: 'inline-block' }}>
                        {item.regulationId.substring(0, 12)}…
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                        v{item.oldVersionNumber} → v{item.newVersionNumber}
                      </span>
                    </td>
                    <td><ChangeBadge type={item.changeType} /></td>
                    <td>
                      <div className="truncate" style={{ maxWidth: 320, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                        {item.summary}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: 'var(--text-xs)' }}>
                        {item.changedRequirements?.length || 0} clauses
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {new Date(item.detectedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="text-right" onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/regulatory-changes/${item.id}`)}
                        aria-label={`View impact report for ${item.summary}`}
                      >
                        Impact report
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
