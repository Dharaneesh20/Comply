import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegulations } from '../api/regulations';
import { Regulation, RegulationStatus } from '../types/regulation';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Globe2, 
  Building, 
  ArrowRight, 
  Loader2, 
  Calendar, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const RegulationsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('ALL');
  const [selectedAuthority, setSelectedAuthority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchRegulationsList = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);

      const jurParam = selectedJurisdiction !== 'ALL' ? selectedJurisdiction : undefined;
      const authParam = selectedAuthority !== 'ALL' ? selectedAuthority : undefined;
      const statusParam = selectedStatus !== 'ALL' ? selectedStatus : undefined;
      const searchParam = searchTerm.trim() ? searchTerm.trim() : undefined;

      const res = await getRegulations(
        currentOrganization.id,
        searchParam,
        jurParam,
        authParam,
        statusParam,
        page,
        10
      );

      setRegulations(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch regulatory library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulationsList();
  }, [currentOrganization, page, selectedJurisdiction, selectedAuthority, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchRegulationsList();
  };

  const getStatusBadge = (status: RegulationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="status-badge published">Active</span>;
      case 'DRAFT':
        return <span className="status-badge draft">Draft</span>;
      case 'SUPERSEDED':
        return <span className="status-badge archived" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}>Superseded</span>;
      case 'ARCHIVED':
        return <span className="status-badge archived">Archived</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Regulatory Framework Library
            </h2>
            <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
              {totalElements} Regulations
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Browse and manage regulatory standards, jurisdictions, governing authorities, and compliance requirements.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/regulations/new')}>
          <Plus size={18} />
          <span>Add Regulation</span>
        </button>
      </div>

      {/* Legal Reference Banner */}
      <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#c7d2fe' }}>
        <ShieldCheck size={20} color="var(--accent-indigo)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Operational Knowledge Notice:</strong> Manually structured regulatory requirements in Align provide structured operational mapping and cross-references for compliance gap analysis.
        </span>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, authority, category, jurisdiction..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Jurisdiction Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe2 size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '150px' }}
                value={selectedJurisdiction}
                onChange={(e) => { setSelectedJurisdiction(e.target.value); setPage(0); }}
              >
                <option value="ALL">All Jurisdictions</option>
                <option value="European Union">European Union</option>
                <option value="United States">United States</option>
                <option value="Global">Global / International</option>
                <option value="California">California (CCPA/CPRA)</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>

            {/* Authority Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '140px' }}
                value={selectedAuthority}
                onChange={(e) => { setSelectedAuthority(e.target.value); setPage(0); }}
              >
                <option value="ALL">All Authorities</option>
                <option value="FDA">FDA</option>
                <option value="SEC">SEC</option>
                <option value="EU Parliament">EU Parliament</option>
                <option value="HHS / HIPAA">HHS / HIPAA</option>
                <option value="ISO">ISO Organization</option>
                <option value="NIST">NIST</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '130px' }}
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="SUPERSEDED">Superseded</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fb7185', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Content Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
        </div>
      ) : regulations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ShieldCheck size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Regulatory Frameworks Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            {searchTerm || selectedJurisdiction !== 'ALL' || selectedAuthority !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No regulations match your selected filter criteria.'
              : 'Add your first regulatory framework entry to start establishing compliance requirements.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/regulations/new')}>
            <Plus size={18} />
            <span>Create First Regulation</span>
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Regulation Title & Category</th>
                  <th>Jurisdiction</th>
                  <th>Governing Authority</th>
                  <th>Status</th>
                  <th>Effective Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {regulations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <div>
                        <div 
                          onClick={() => navigate(`/regulations/${reg.id}`)}
                          style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <ShieldCheck size={16} color="var(--accent-blue)" />
                          <span>{reg.title}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                          Category: <span style={{ color: 'var(--accent-cyan)' }}>{reg.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Globe2 size={14} color="var(--accent-cyan)" />
                        {reg.jurisdiction}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                        <Building size={14} color="var(--accent-purple)" />
                        {reg.authority}
                      </span>
                    </td>
                    <td>{getStatusBadge(reg.status)}</td>
                    <td>
                      {reg.effectiveDate ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={14} color="var(--accent-amber)" />
                          {new Date(reg.effectiveDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                        onClick={() => navigate(`/regulations/${reg.id}`)}
                      >
                        <span>View Details</span>
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total entries)
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
