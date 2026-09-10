import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFindings, evaluateRiskScan, getFindingMetrics } from '../api/findings';
import { FindingResponse, FindingSeverity, FindingStatus, FindingMetricsResponse } from '../types/finding';
import {
  AlertTriangle,
  Search,
  Play,
  ShieldCheck,
  FileText,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';


function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const map: Record<FindingSeverity, { cls: string; label: string }> = {
    CRITICAL: { cls: 'badge-critical', label: 'Critical' },
    HIGH:     { cls: 'badge-high',     label: 'High'     },
    MEDIUM:   { cls: 'badge-medium',   label: 'Medium'   },
    LOW:      { cls: 'badge-low',      label: 'Low'      },
  };
  const cfg = map[severity] ?? { cls: 'badge-neutral', label: severity };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

function StatusBadge({ status }: { status: FindingStatus }) {
  const map: Record<string, { cls: string; label: string }> = {
    OPEN:         { cls: 'badge-warning', label: 'Open'          },
    UNDER_REVIEW: { cls: 'badge-info',    label: 'Under Review'  },
    ACCEPTED:     { cls: 'badge-neutral', label: 'Accepted Risk' },
    RESOLVED:     { cls: 'badge-success', label: 'Resolved'      },
    DISMISSED:    { cls: 'badge-neutral', label: 'Dismissed'     },
  };
  const cfg = map[status] ?? { cls: 'badge-neutral', label: status };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

const SeverityMetric: React.FC<{ label: string; value: number; colorVar: string }> = ({ label, value, colorVar }) => (
  <div className="card card-padding-sm" style={{ flex: '1', minWidth: 120 }}>
    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: colorVar, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>
      {label}
    </div>
    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: colorVar, lineHeight: 1 }}>
      {value}
    </div>
  </div>
);

const SkeletonRow: React.FC = () => (
  <tr>
    {[1,2,3,4,5,6,7].map(i => (
      <td key={i} style={{ padding: 'var(--space-4)' }}>
        <div className="skeleton skeleton-text" style={{ width: i === 1 ? '70%' : '50%' }} />
      </td>
    ))}
  </tr>
);

export const FindingsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  const [findings, setFindings]           = useState<FindingResponse[]>([]);
  const [metrics, setMetrics]             = useState<FindingMetricsResponse | null>(null);
  const [loading, setLoading]             = useState(true);
  const [scanning, setScanning]           = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedSeverity, setSelectedSeverity]   = useState('ALL');
  const [selectedStatus, setSelectedStatus]       = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  const fetchFindings = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError(null);
      const [res, metricsData] = await Promise.all([
        getFindings(
          currentOrganization.id,
          searchTerm.trim() || undefined,
          selectedSeverity   !== 'ALL' ? selectedSeverity   : undefined,
          selectedStatus     !== 'ALL' ? selectedStatus     : undefined,
          selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
          undefined, undefined, page, 10,
        ),
        getFindingMetrics(currentOrganization.id),
      ]);
      setFindings(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
      setMetrics(metricsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load findings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFindings(); }, [currentOrganization, page, selectedSeverity, selectedStatus, selectedDepartment]);

  const handleRunScan = async () => {
    if (!currentOrganization) return;
    try {
      setScanning(true);
      setError(null);
      await evaluateRiskScan(currentOrganization.id);
      setPage(0);
      await fetchFindings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Risk scan failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <h2 className="page-title">Compliance Findings</h2>
            <p className="page-subtitle">
              Evaluate procedural gaps, unmapped regulations, and missing controls.
            </p>
          </div>
          <div className="page-header-actions">
            <button
              className="btn btn-primary"
              onClick={handleRunScan}
              disabled={scanning}
              id="run-risk-scan-btn"
            >
              {scanning
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Scanning…</>
                : <><Play size={14} />Run risk scan</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Severity metrics */}
      {metrics && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          <SeverityMetric label="Critical" value={metrics.criticalCount ?? 0} colorVar="var(--sev-critical-text)" />
          <SeverityMetric label="High"     value={metrics.highCount    ?? 0} colorVar="var(--sev-high-text)"     />
          <SeverityMetric label="Medium"   value={metrics.mediumCount  ?? 0} colorVar="var(--sev-medium-text)"   />
          <SeverityMetric label="Low"      value={metrics.lowCount     ?? 0} colorVar="var(--sev-low-text)"      />
          <SeverityMetric label="Resolved" value={metrics.totalResolved ?? 0} colorVar="var(--color-success-text)" />
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <div className="search-wrap" style={{ flex: '1', minWidth: 240 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search findings…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search findings"
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={selectedSeverity}
          onChange={e => { setSelectedSeverity(e.target.value); setPage(0); }}
          aria-label="Filter by severity"
        >
          <option value="ALL">All severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={selectedStatus}
          onChange={e => { setSelectedStatus(e.target.value); setPage(0); }}
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ACCEPTED">Accepted Risk</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 150 }}
          value={selectedDepartment}
          onChange={e => { setSelectedDepartment(e.target.value); setPage(0); }}
          aria-label="Filter by department"
        >
          <option value="ALL">All departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Operations">Operations</option>
          <option value="Security">Security</option>
          <option value="Compliance">Compliance & Legal</option>
          <option value="Human Resources">Human Resources</option>
        </select>
        {!loading && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {totalElements} {totalElements === 1 ? 'finding' : 'findings'}
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
      {!loading && findings.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <AlertTriangle size={36} className="empty-state-icon" />
            <h3 className="empty-state-title">No findings detected</h3>
            <p className="empty-state-description">
              {searchTerm || selectedSeverity !== 'ALL' || selectedStatus !== 'ALL' || selectedDepartment !== 'ALL'
                ? 'No findings match your current filters.'
                : 'Run a risk assessment scan to evaluate compliance gaps across your mapped requirements and SOPs.'}
            </p>
            <button className="btn btn-primary" onClick={handleRunScan} disabled={scanning}>
              <Play size={14} />
              Run risk scan
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="align-table">
              <thead>
                <tr>
                  <th>Finding</th>
                  <th>Severity</th>
                  <th>Risk score</th>
                  <th>Regulation</th>
                  <th>SOP</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                  : findings.map(f => (
                    <tr key={f.id}>
                      <td>
                        <div onClick={() => navigate(`/findings/${f.id}`)} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                            <AlertTriangle
                              size={14}
                              color={f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'var(--sev-critical-text)' : 'var(--sev-medium-text)'}
                              style={{ flexShrink: 0 }}
                            />
                            {f.title}
                          </div>
                          <div className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginTop: 2, maxWidth: 340, marginLeft: 22 }}>
                            {f.description}
                          </div>
                        </div>
                      </td>
                      <td><SeverityBadge severity={f.severity} /></td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--weight-semibold)',
                          color: f.riskScore >= 70 ? 'var(--sev-critical-text)' : f.riskScore >= 40 ? 'var(--sev-high-text)' : 'var(--color-success-text)',
                          background: 'var(--bg-surface-raised)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border)',
                        }}>
                          {f.riskScore.toFixed(0)}/100
                        </span>
                      </td>
                      <td>
                        <div>
                          {f.sectionReference && (
                            <div>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '1px 5px', borderRadius: 'var(--radius-xs)', display: 'inline-block', marginBottom: 2 }}>
                                {f.sectionReference}
                              </span>
                            </div>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                            <ShieldCheck size={11} color="var(--text-muted)" />
                            {f.regulationTitle || 'Regulation'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {f.sopTitle ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                            <FileText size={13} color="var(--text-muted)" />
                            {f.sopTitle}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontStyle: 'italic' }}>Unmapped</span>
                        )}
                      </td>
                      <td><StatusBadge status={f.status} /></td>
                      <td className="text-right">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/findings/${f.id}`)}
                          aria-label={`View finding: ${f.title}`}
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
                <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={15} /> Previous
                </button>
                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
