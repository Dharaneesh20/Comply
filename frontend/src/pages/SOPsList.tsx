import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSOPs } from '../api/sops';
import { SOP, SOPStatus } from '../types/sop';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  ArrowRight, 
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive
} from 'lucide-react';

export const SOPsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchSOPsList = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);
      const statusParam = selectedStatus !== 'ALL' ? selectedStatus : undefined;
      const deptParam = selectedDepartment !== 'ALL' ? selectedDepartment : undefined;
      const data = await getSOPs(currentOrganization.id, statusParam, deptParam);
      setSops(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch SOPs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOPsList();
  }, [currentOrganization, selectedDepartment, selectedStatus]);

  // Client side search filtering
  const filteredSops = sops.filter((sop) => {
    const matchesSearch = 
      sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sop.description && sop.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sop.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Extract unique departments for dropdown filter
  const uniqueDepartments = Array.from(new Set(sops.map((s) => s.department))).filter(Boolean);

  const getStatusBadge = (status: SOPStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="status-badge published">
            <CheckCircle2 size={12} /> Published
          </span>
        );
      case 'DRAFT':
        return (
          <span className="status-badge draft">
            <Clock size={12} /> Draft
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="status-badge archived">
            <Archive size={12} /> Archived
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Standard Operating Procedures
            </h2>
            <span style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
              {sops.length} SOPs
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage, version, and review operational policy documentation for {currentOrganization?.name || 'your workspace'}.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/sops/new')}>
          <Plus size={18} />
          <span>Create New SOP</span>
        </button>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search SOP title, description, department..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '160px' }}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '140px' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fb7185', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
        </div>
      ) : filteredSops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No SOP Documents Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            {searchTerm || selectedDepartment !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No SOPs match your active search filters.'
              : 'Create your first Standard Operating Procedure document to begin tracking compliance.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/sops/new')}>
            <Plus size={18} />
            <span>Create First SOP</span>
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>SOP Document Details</th>
                <th>Department</th>
                <th>Version</th>
                <th>Status</th>
                <th>Next Review Date</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSops.map((sop) => (
                <tr key={sop.id}>
                  <td>
                    <div>
                      <div 
                        onClick={() => navigate(`/sops/${sop.id}`)}
                        style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FileText size={16} color="var(--accent-cyan)" />
                        <span>{sop.title}</span>
                      </div>
                      {sop.description && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sop.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                      <Building2 size={14} color="var(--accent-blue)" />
                      {sop.department}
                    </span>
                  </td>
                  <td>
                    <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '0.2rem 0.5rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
                      v{sop.currentVersion || 1}
                    </span>
                  </td>
                  <td>{getStatusBadge(sop.status)}</td>
                  <td>
                    {sop.nextReviewAt ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} color="var(--accent-amber)" />
                        {new Date(sop.nextReviewAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not scheduled</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(sop.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                      onClick={() => navigate(`/sops/${sop.id}`)}
                    >
                      <span>View SOP</span>
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
