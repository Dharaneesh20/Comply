import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegulations } from '../api/regulations';
import { Regulation, RegulationStatus } from '../types/regulation';
import {
  ShieldCheck,
  Plus,
  Search,
  Globe2,
  Building,
  ArrowRight,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function StatusBadge({ status }: { status: RegulationStatus }) {
  const map: Record<string, { cls: string; label: string }> = {
    ACTIVE:     { cls: 'badge-success', label: 'Active'     },
    DRAFT:      { cls: 'badge-warning', label: 'Draft'      },
    SUPERSEDED: { cls: 'badge-warning', label: 'Superseded' },
    ARCHIVED:   { cls: 'badge-neutral', label: 'Archived'   },
  };
  const cfg = map[status] ?? { cls: 'badge-neutral', label: status };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

const SkeletonRow: React.FC = () => (
  <tr>
    {[1,2,3,4,5,6].map(i => (
      <td key={i} style={{ padding: 'var(--space-4)' }}>
        <div className="skeleton skeleton-text" style={{ width: i === 1 ? '65%' : '50%' }} />
      </td>
    ))}
  </tr>
);

export const RegulationsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  const [regulations, setRegulations]         = useState<Regulation[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [page, setPage]                       = useState(0);
  const [totalPages, setTotalPages]           = useState(1);
  const [totalElements, setTotalElements]     = useState(0);
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('ALL');
  const [selectedAuthority, setSelectedAuthority]       = useState('ALL');
  const [selectedStatus, setSelectedStatus]             = useState('ALL');

  const fetchRegulations = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getRegulations(
        currentOrganization.id,
        searchTerm.trim() || undefined,
        selectedJurisdiction !== 'ALL' ? selectedJurisdiction : undefined,
        selectedAuthority    !== 'ALL' ? selectedAuthority    : undefined,
        selectedStatus       !== 'ALL' ? selectedStatus       : undefined,
        page, 10,
      );
      setRegulations(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load regulations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegulations(); }, [currentOrganization, page, selectedJurisdiction, selectedAuthority, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchRegulations();
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <h2 className="page-title">Regulatory Library</h2>
            <p className="page-subtitle">
              Browse and manage regulatory standards, jurisdictions, and compliance requirements.
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/regulations/new')} id="add-regulation-btn">
              <Plus size={15} />
              Add regulation
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <div className="search-wrap" style={{ flex: '1', minWidth: 240 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search regulations…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search regulations"
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={selectedJurisdiction}
          onChange={e => { setSelectedJurisdiction(e.target.value); setPage(0); }}
          aria-label="Filter by jurisdiction"
        >
          <option value="ALL">All jurisdictions</option>
          <option value="European Union">European Union</option>
          <option value="United States">United States</option>
          <option value="Global">Global / International</option>
          <option value="California">California</option>
          <option value="United Kingdom">United Kingdom</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={selectedAuthority}
          onChange={e => { setSelectedAuthority(e.target.value); setPage(0); }}
          aria-label="Filter by authority"
        >
          <option value="ALL">All authorities</option>
          <option value="FDA">FDA</option>
          <option value="SEC">SEC</option>
          <option value="EU Parliament">EU Parliament</option>
          <option value="HHS / HIPAA">HHS / HIPAA</option>
          <option value="ISO">ISO</option>
          <option value="NIST">NIST</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 130 }}
          value={selectedStatus}
          onChange={e => { setSelectedStatus(e.target.value); setPage(0); }}
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="SUPERSEDED">Superseded</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {!loading && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {totalElements} {totalElements === 1 ? 'regulation' : 'regulations'}
          </span>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {!loading && regulations.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ShieldCheck size={36} className="empty-state-icon" />
            <h3 className="empty-state-title">No regulations found</h3>
            <p className="empty-state-description">
              {searchTerm || selectedJurisdiction !== 'ALL' || selectedAuthority !== 'ALL' || selectedStatus !== 'ALL'
                ? 'No regulations match your current filters.'
                : 'Add your first regulatory framework to start establishing compliance requirements.'}
            </p>
            {!searchTerm && (
              <button className="btn btn-primary" onClick={() => navigate('/regulations/new')}>
                <Plus size={15} />
                Add first regulation
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="align-table">
              <thead>
                <tr>
                  <th>Regulation</th>
                  <th>Jurisdiction</th>
                  <th>Authority</th>
                  <th>Status</th>
                  <th>Effective date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                  : regulations.map(reg => (
                    <tr key={reg.id}>
                      <td>
                        <div
                          onClick={() => navigate(`/regulations/${reg.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                            <ShieldCheck size={14} color="var(--color-success)" style={{ flexShrink: 0 }} />
                            {reg.title}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: 2, marginLeft: 22 }}>
                            {reg.category}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                          <Globe2 size={13} color="var(--text-muted)" />
                          {reg.jurisdiction}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-sm)' }}>
                          <Building size={13} color="var(--text-muted)" />
                          {reg.authority}
                        </span>
                      </td>
                      <td><StatusBadge status={reg.status} /></td>
                      <td>
                        {reg.effectiveDate ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            <Calendar size={13} color="var(--text-muted)" />
                            {new Date(reg.effectiveDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>—</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/regulations/${reg.id}`)}
                          aria-label={`View ${reg.title}`}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Page {page + 1} of {totalPages} — {totalElements} total
              </span>
              <div className="pagination-controls">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
