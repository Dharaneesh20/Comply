import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFindings, evaluateRiskScan, getFindingMetrics } from '../api/findings';
import { FindingResponse, FindingSeverity, FindingStatus, FindingMetricsResponse } from '../types/finding';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Play, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Building2
} from 'lucide-react';

export const FindingsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  const [findings, setFindings] = useState<FindingResponse[]>([]);
  const [metrics, setMetrics] = useState<FindingMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  const fetchFindingsList = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);

      const sevParam = selectedSeverity !== 'ALL' ? selectedSeverity : undefined;
      const statusParam = selectedStatus !== 'ALL' ? selectedStatus : undefined;
      const deptParam = selectedDepartment !== 'ALL' ? selectedDepartment : undefined;
      const searchParam = searchTerm.trim() ? searchTerm.trim() : undefined;

      const [res, metricsData] = await Promise.all([
        getFindings(currentOrganization.id, searchParam, sevParam, statusParam, deptParam, undefined, undefined, page, 10),
        getFindingMetrics(currentOrganization.id),
      ]);

      setFindings(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
      setMetrics(metricsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch compliance findings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindingsList();
  }, [currentOrganization, page, selectedSeverity, selectedStatus, selectedDepartment]);

  const handleRunScan = async () => {
    if (!currentOrganization) return;
    try {
      setScanning(true);
      setError(null);
      await evaluateRiskScan(currentOrganization.id);
      setPage(0);
      await fetchFindingsList();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to execute Risk Assessment Engine scan.');
    } finally {
      setScanning(false);
    }
  };

  const getSeverityBadge = (sev: FindingSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="status-badge offline" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>CRITICAL</span>;
      case 'HIGH':
        return <span className="status-badge offline">HIGH</span>;
      case 'MEDIUM':
        return <span className="status-badge draft">MEDIUM</span>;
      case 'LOW':
        return <span className="status-badge published">LOW</span>;
      default:
        return <span className="status-badge">{sev}</span>;
    }
  };

  const getStatusBadge = (st: FindingStatus) => {
    switch (st) {
      case 'OPEN':
        return <span className="status-badge draft">Open</span>;
      case 'UNDER_REVIEW':
        return <span className="status-badge draft" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>Under Review</span>;
      case 'ACCEPTED':
        return <span className="status-badge archived">Accepted Risk</span>;
      case 'RESOLVED':
        return <span className="status-badge published">Resolved</span>;
      case 'DISMISSED':
        return <span className="status-badge archived">Dismissed</span>;
      default:
        return <span className="status-badge">{st}</span>;
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Compliance Findings & Risk Assessment
            </h2>
            <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
              {totalElements} Active Findings
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Evaluate procedural compliance gaps, unmapped regulations, outdated SOPs, and missing security controls.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleRunScan} disabled={scanning}>
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play size={16} />}
          <span>{scanning ? 'Evaluating Risk Rules...' : 'Run Risk Assessment Scan'}</span>
        </button>
      </div>

      {/* Real Metrics Cards Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            CRITICAL SEVERITY
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>
            {metrics?.criticalCount ?? 0}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            HIGH SEVERITY
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f43f5e' }}>
            {metrics?.highCount ?? 0}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            MEDIUM SEVERITY
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>
            {metrics?.mediumCount ?? 0}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            LOW SEVERITY
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
            {metrics?.lowCount ?? 0}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            TOTAL RESOLVED
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {metrics?.totalResolved ?? 0}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search finding title, clause, description..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Severity Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '140px' }}
                value={selectedSeverity}
                onChange={(e) => { setSelectedSeverity(e.target.value); setPage(0); }}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '140px' }}
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACCEPTED">Accepted Risk</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>

            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '150px' }}
                value={selectedDepartment}
                onChange={(e) => { setSelectedDepartment(e.target.value); setPage(0); }}
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Security">InfoSec & Security</option>
                <option value="Compliance">Compliance & Legal</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fb7185', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Findings Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
        </div>
      ) : findings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <AlertTriangle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Compliance Findings Detected</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
            {searchTerm || selectedSeverity !== 'ALL' || selectedStatus !== 'ALL' || selectedDepartment !== 'ALL'
              ? 'No compliance findings match your active search filters.'
              : 'Click "Run Risk Assessment Scan" to execute deterministic risk engine rule evaluations across mapped requirements and SOPs.'}
          </p>
          <button className="btn btn-primary" onClick={handleRunScan} disabled={scanning}>
            <Play size={16} />
            <span>Run Risk Assessment Scan</span>
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Compliance Finding</th>
                  <th>Severity</th>
                  <th>Risk Score</th>
                  <th>Regulation & Clause</th>
                  <th>Mapped SOP</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div>
                        <div 
                          onClick={() => navigate(`/findings/${f.id}`)}
                          style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <AlertTriangle size={16} color={f.severity === 'CRITICAL' || f.severity === 'HIGH' ? '#f43f5e' : 'var(--accent-amber)'} />
                          <span>{f.title}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.description}
                        </div>
                      </div>
                    </td>
                    <td>{getSeverityBadge(f.severity)}</td>
                    <td>
                      <span style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: f.riskScore >= 70 ? '#ef4444' : f.riskScore >= 40 ? '#f59e0b' : '#10b981' }}>
                        {f.riskScore.toFixed(0)} / 100
                      </span>
                    </td>
                    <td>
                      <div>
                        {f.sectionReference && (
                          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'var(--font-mono)', display: 'inline-block', marginBottom: '0.2rem' }}>
                            {f.sectionReference}
                          </span>
                        )}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShieldCheck size={12} color="var(--accent-blue)" />
                          {f.regulationTitle || 'Regulation Entry'}
                        </div>
                      </div>
                    </td>
                    <td>
                      {f.sopTitle ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          <FileText size={14} color="var(--accent-cyan)" />
                          {f.sopTitle}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Unmapped / Missing SOP</span>
                      )}
                    </td>
                    <td>{getStatusBadge(f.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                        onClick={() => navigate(`/findings/${f.id}`)}
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
                Showing page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total findings)
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
