import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegulatoryChanges } from '../api/regulatoryChanges';
import { RegulatoryChange } from '../types/regulatoryChange';
import { 
  GitBranch, 
  Search, 
  ArrowRight, 
  Loader2, 
  AlertTriangle
} from 'lucide-react';

export const RegulatoryChangesList: React.FC = () => {
  const { currentOrganization } = useAuth();
  const navigate = useNavigate();

  const [changes, setChanges] = useState<RegulatoryChange[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchChanges = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getRegulatoryChanges();
      setChanges(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setError('Failed to fetch regulatory change history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, [currentOrganization]);

  const filteredChanges = changes.filter(c => 
    c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.regulationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChangeBadge = (type: string) => {
    switch (type) {
      case 'CRITICAL':
      case 'REMOVED':
        return <span className="status-badge offline">REMOVED / CRITICAL</span>;
      case 'ADDED':
        return <span className="status-badge published">ADDED</span>;
      case 'MODIFIED':
        return <span className="status-badge draft">MODIFIED</span>;
      default:
        return <span className="status-badge">{type}</span>;
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
              <GitBranch size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Regulatory Change Impact Log</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track regulatory version changes, clause diffs, and downstream SOP impact assessments.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search regulatory change summary or regulation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#fb7185' }}>
          <AlertTriangle size={36} style={{ marginBottom: '0.5rem' }} />
          <p>{error}</p>
        </div>
      ) : filteredChanges.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <GitBranch size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Regulatory Changes Analyzed</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            Navigate to any Regulation details page and run "Analyze Version Change Impact" when a regulation is updated.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Regulation ID</th>
                  <th>Versions</th>
                  <th>Change Type</th>
                  <th>Summary</th>
                  <th>Changed Clauses</th>
                  <th>Detected At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChanges.map((item) => (
                  <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/regulatory-changes/${item.id}`)}>
                    <td>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{item.regulationId.substring(0, 12)}...</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>v{item.oldVersionNumber} → v{item.newVersionNumber}</span>
                    </td>
                    <td>{getChangeBadge(item.changeType)}</td>
                    <td style={{ maxWidth: '360px', color: 'var(--text-primary)' }}>
                      {item.summary}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                        {item.changedRequirements?.length || 0} Clauses Changed
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(item.detectedAt).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <Link to={`/regulatory-changes/${item.id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        <span>View Impact Report</span>
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
