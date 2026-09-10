import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSOPById, getSOPVersions, createSOPVersion, archiveSOP, submitSOPForReview, approveSOPVersion, activateSOPVersion } from '../api/sops';
import { getRequirementsForSOP, deleteMapping } from '../api/mappings';
import { getSOPHealth, analyzeSOPHealth, submitObservation } from '../api/sopHealth';
import { SOP, SOPVersion } from '../types/sop';
import { MappedRequirementDetailResponse, MappingType } from '../types/mapping';
import { SOPHealthAssessment } from '../types/sopHealth';
import { 
  FileText, 
  ArrowLeft, 
  Upload, 
  Archive, 
  History, 
  Calendar, 
  Building2, 
  User, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HardDrive, 
  Plus, 
  X, 
  FileDown,
  ShieldCheck,
  Link2,
  Trash2,
  ExternalLink,
  Activity,
  AlertTriangle,
  Play,
  CheckCircle,
  Clock
} from 'lucide-react';

export const SOPDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const newVersionFileInputRef = useRef<HTMLInputElement>(null);

  const [sop, setSop] = useState<SOP | null>(null);
  const [versions, setVersions] = useState<SOPVersion[]>([]);
  const [mappedRequirements, setMappedRequirements] = useState<MappedRequirementDetailResponse[]>([]);
  const [healthAssessment, setHealthAssessment] = useState<SOPHealthAssessment | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzingHealth, setAnalyzingHealth] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Operational Simulation Modal state
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [simCaseId, setSimCaseId] = useState<string>('CASE-SIM-' + Math.floor(Math.random() * 1000));
  const [simStepsText, setSimStepsText] = useState<string>("Resolve Issue -> Create Support Ticket -> Close Ticket");
  const [submittingSim, setSubmittingSim] = useState<boolean>(false);

  // New Version Modal state
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [changeSummary, setChangeSummary] = useState<string>('');
  const [uploadingVersion, setUploadingVersion] = useState<boolean>(false);
  const [versionError, setVersionError] = useState<string | null>(null);

  // Archive state
  const [archiving, setArchiving] = useState<boolean>(false);

  // Workflow State Modals & Actions
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [targetVersion, setTargetVersion] = useState<SOPVersion | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchData = async () => {
    if (!currentOrganization || !id) return;
    try {
      setLoading(true);
      setError(null);
      const [sopData, versionsData, reqsData, healthData] = await Promise.all([
        getSOPById(currentOrganization.id, id),
        getSOPVersions(currentOrganization.id, id),
        getRequirementsForSOP(currentOrganization.id, id),
        getSOPHealth(id).catch(() => null)
      ]);
      setSop(sopData);
      setVersions(versionsData.sort((a, b) => b.versionNumber - a.versionNumber));
      setMappedRequirements(reqsData);
      setHealthAssessment(healthData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load SOP details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeHealth = async () => {
    if (!id) return;
    try {
      setAnalyzingHealth(true);
      const updatedHealth = await analyzeSOPHealth(id);
      setHealthAssessment(updatedHealth);
    } catch (err: any) {
      alert('Failed to analyze SOP health.');
    } finally {
      setAnalyzingHealth(false);
    }
  };

  const handleSubmitSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmittingSim(true);
      const rawSteps = simStepsText.split('->').map(s => s.trim()).filter(Boolean);
      const stepsPayload = rawSteps.map(s => ({ eventType: s, source: 'SIMULATED_LOG' }));
      
      await submitObservation({
        sopId: id,
        caseId: simCaseId,
        steps: stepsPayload
      });

      setShowSimulateModal(false);
      await handleAnalyzeHealth();
    } catch (err: any) {
      alert('Failed to submit simulation.');
    } finally {
      setSubmittingSim(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentOrganization, id]);

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !id || !newVersionFile) return;

    try {
      setUploadingVersion(true);
      setVersionError(null);
      await createSOPVersion(
        currentOrganization.id,
        id,
        newVersionFile,
        changeSummary || undefined
      );
      setShowVersionModal(false);
      setNewVersionFile(null);
      setChangeSummary('');
      await fetchData();
    } catch (err: any) {
      setVersionError(err.response?.data?.message || 'Failed to upload new version.');
    } finally {
      setUploadingVersion(false);
    }
  };

  const handleArchive = async () => {
    if (!currentOrganization || !id) return;
    if (!window.confirm('Are you sure you want to archive this SOP document?')) return;

    try {
      setArchiving(true);
      const updated = await archiveSOP(currentOrganization.id, id);
      setSop(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to archive SOP.');
    } finally {
      setArchiving(false);
    }
  };

  const handleOpenReviewModal = (ver: SOPVersion) => {
    setTargetVersion(ver);
    setReviewNotes(`Submitting version ${ver.versionNumber} for compliance officer review.`);
    setShowReviewModal(true);
  };

  const handleOpenApproveModal = (ver: SOPVersion) => {
    setTargetVersion(ver);
    setApprovalNotes(`Approving version ${ver.versionNumber} for active operational deployment.`);
    setShowApproveModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !targetVersion) return;
    try {
      setActionLoading(true);
      await submitSOPForReview(id, targetVersion.versionNumber, reviewNotes);
      setShowReviewModal(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit SOP for review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !targetVersion) return;
    try {
      setActionLoading(true);
      await approveSOPVersion(id, targetVersion.versionNumber, approvalNotes);
      setShowApproveModal(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve SOP version.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateVersion = async (ver: SOPVersion) => {
    if (!id) return;
    if (!window.confirm(`Activate Version ${ver.versionNumber}? This will make it the active SOP version and resolve any associated findings.`)) return;

    try {
      setActionLoading(true);
      await activateSOPVersion(id, ver.versionNumber);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to activate SOP version.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!currentOrganization) return;
    if (!window.confirm('Are you sure you want to unmap this regulatory requirement?')) return;

    try {
      await deleteMapping(currentOrganization.id, mappingId);
      await fetchData();
    } catch (err: any) {
      alert('Failed to delete mapping.');
    }
  };

  const getMappingTypeBadge = (type: MappingType) => {
    switch (type) {
      case 'FULL':
        return <span className="status-badge published">Full Coverage</span>;
      case 'PARTIAL':
        return <span className="status-badge draft">Partial</span>;
      case 'NOT_IMPLEMENTED':
        return <span className="status-badge offline">Not Implemented</span>;
      case 'NOT_APPLICABLE':
        return <span className="status-badge archived">N/A</span>;
      default:
        return <span className="status-badge">{type}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  if (error || !sop) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Error Loading SOP</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error || 'SOP document not found.'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/sops')}>
          <ArrowLeft size={16} />
          <span>Return to SOPs List</span>
        </button>
      </div>
    );
  }

  const latestVersion = versions.length > 0 ? versions[0] : null;

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/sops')} style={{ padding: '0.4rem 0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to SOPs</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {sop.status !== 'ARCHIVED' && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleArchive}
                disabled={archiving}
                style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              >
                <Archive size={16} />
                <span>{archiving ? 'Archiving...' : 'Archive SOP'}</span>
              </button>

              <button className="btn btn-primary" onClick={() => setShowVersionModal(true)}>
                <Plus size={16} />
                <span>Create New Version</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Header Banner Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className={`status-badge ${sop.status.toLowerCase()}`}>
                {sop.status}
              </span>
              <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '0.2rem 0.6rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
                Current Version: v{sop.currentVersion}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Building2 size={14} color="var(--accent-blue)" />
                {sop.department}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {sop.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '800px' }}>
              {sop.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              DOCUMENT OWNER ID
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              <User size={14} color="var(--accent-cyan)" />
              {sop.ownerId}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              CREATED DATE
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {new Date(sop.createdAt).toLocaleString()}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              LAST REVIEWED
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {sop.lastReviewedAt ? new Date(sop.lastReviewedAt).toLocaleDateString() : 'Not reviewed yet'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              NEXT SCHEDULED REVIEW
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: sop.nextReviewAt ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
              <Calendar size={14} />
              {sop.nextReviewAt ? new Date(sop.nextReviewAt).toLocaleDateString() : 'Unscheduled'}
            </span>
          </div>
        </div>
      </div>

      {/* Applicable Regulatory Requirements Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title" style={{ marginBottom: '1rem' }}>
          <ShieldCheck size={20} color="var(--accent-indigo)" />
          <span>Applicable Regulatory Requirements ({mappedRequirements.length})</span>
        </div>

        {mappedRequirements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
            <Link2 size={36} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No Regulatory Requirements Mapped</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              To map a requirement clause to this SOP, navigate to the Regulations tab and select "Map Requirement to SOP".
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Section Clause</th>
                  <th>Regulatory Framework</th>
                  <th>Requirement Text</th>
                  <th>Mapping Type</th>
                  <th>Confidence</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappedRequirements.map((req) => (
                  <tr key={req.mappingId}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        {req.sectionReference}
                      </span>
                    </td>
                    <td>
                      <div 
                        onClick={() => navigate(`/regulations/${req.regulationId}`)}
                        style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <ShieldCheck size={15} color="var(--accent-blue)" />
                        <span>{req.regulationTitle || 'Regulation Entry'}</span>
                        <ExternalLink size={12} style={{ opacity: 0.6 }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.requirementText}
                      </div>
                    </td>
                    <td>{getMappingTypeBadge(req.mappingType)}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        {Math.round(req.confidence * 100)}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteMapping(req.mappingId)}
                        style={{ color: 'var(--accent-rose)', padding: '0.35rem', borderRadius: '4px' }}
                        title="Unmap Requirement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Left Column: Active Document Details & Version Timeline */}
        <div>
          {/* Active File Card */}
          {latestVersion && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-title">
                <FileCheck size={20} color="var(--accent-emerald)" />
                <span>Active Document Artifact (v{latestVersion.versionNumber})</span>
              </div>
              <p className="card-subtitle">
                Current stored payload managed via StorageService
              </p>

              <div style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {latestVersion.documentMetadata?.originalFilename || 'SOP_Document'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                      <span>{(latestVersion.documentMetadata?.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{latestVersion.documentMetadata?.contentType}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`/api/v1/sops/${id}/versions`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                >
                  <FileDown size={14} />
                  <span>Download</span>
                </a>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#050811', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>STORAGE REFERENCE POINTER</div>
                {latestVersion.storageReference}
              </div>
            </div>
          )}

          {/* Version History Vertical Timeline */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '1.5rem' }}>
              <History size={20} color="var(--accent-cyan)" />
              <span>Version History Log ({versions.length} versions)</span>
            </div>

            <div className="timeline">
              {versions.map((ver) => (
                <div key={ver.id} className="timeline-item">
                  <div className="timeline-node" style={{ borderColor: ver.versionNumber === sop.currentVersion ? 'var(--accent-cyan)' : 'var(--border-color)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ver.versionNumber === sop.currentVersion ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                  </div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          Version {ver.versionNumber}
                        </span>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '4px',
                          background: ver.workflowStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : ver.workflowStatus === 'APPROVED' ? 'rgba(99, 102, 241, 0.15)' : ver.workflowStatus === 'IN_REVIEW' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: ver.workflowStatus === 'ACTIVE' ? 'var(--accent-emerald)' : ver.workflowStatus === 'APPROVED' ? '#a5b4fc' : ver.workflowStatus === 'IN_REVIEW' ? 'var(--accent-amber)' : 'var(--text-muted)'
                        }}>
                          {ver.workflowStatus || 'ACTIVE'}
                        </span>
                        {ver.versionNumber === sop.currentVersion && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                            CURRENT ACTIVE
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(ver.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {ver.changeSummary && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic', background: 'rgba(255, 255, 255, 0.02)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                        "{ver.changeSummary}"
                      </div>
                    )}

                    {/* Version Workflow State Actions Stepper */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {(!ver.workflowStatus || ver.workflowStatus === 'DRAFT') && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', gap: '0.35rem' }}
                          onClick={() => handleOpenReviewModal(ver)}
                          disabled={actionLoading}
                        >
                          <Clock size={12} color="var(--accent-amber)" />
                          <span>Submit for Review</span>
                        </button>
                      )}

                      {ver.workflowStatus === 'IN_REVIEW' && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', gap: '0.35rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                          onClick={() => handleOpenApproveModal(ver)}
                          disabled={actionLoading}
                        >
                          <ShieldCheck size={12} color="#a5b4fc" />
                          <span>Approve Version</span>
                        </button>
                      )}

                      {ver.workflowStatus === 'APPROVED' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', gap: '0.35rem', background: 'var(--accent-emerald)' }}
                          onClick={() => handleActivateVersion(ver)}
                          disabled={actionLoading}
                        >
                          <CheckCircle2 size={12} />
                          <span>Activate Version</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                      <span>Filename: <strong style={{ color: 'var(--text-secondary)' }}>{ver.documentMetadata?.originalFilename}</strong></span>
                      <span>Size: <strong style={{ color: 'var(--text-secondary)' }}>{((ver.documentMetadata?.fileSizeBytes || 0) / 1024).toFixed(1)} KB</strong></span>
                      <span>Created By User ID: <strong style={{ color: 'var(--text-secondary)' }}>{ver.createdBy}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: SOP Health & Operational Drift & Storage Abstraction Info */}
        <div>
          {/* SOP Health & Operational Drift Card */}
          <div className="card" style={{ marginBottom: '1.5rem', borderColor: healthAssessment && healthAssessment.healthScore < 70 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="card-title" style={{ margin: 0 }}>
                <Activity size={20} color="var(--accent-cyan)" />
                <span>SOP Health & Process Drift</span>
              </div>
              <button 
                onClick={handleAnalyzeHealth} 
                disabled={analyzingHealth}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem' }}
              >
                {analyzingHealth ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play size={14} color="var(--accent-cyan)" />}
                <span>Run Analysis</span>
              </button>
            </div>

            {healthAssessment ? (
              <div>
                {/* Health Score Gauge */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>HEALTH SCORE</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: healthAssessment.healthScore >= 80 ? 'var(--accent-emerald)' : healthAssessment.healthScore >= 50 ? 'var(--accent-amber)' : '#fb7185' }}>
                      {healthAssessment.healthScore} / 100
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${healthAssessment.healthScore}%`, 
                      background: healthAssessment.healthScore >= 80 ? 'var(--accent-emerald)' : healthAssessment.healthScore >= 50 ? 'var(--accent-amber)' : '#fb7185',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <span>Cases Analyzed: {healthAssessment.totalCasesAnalyzed}</span>
                    <span>Deviations: {healthAssessment.deviationsFoundCount}</span>
                  </div>
                </div>

                {/* Expected vs Observed Steps Comparison */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    EXPECTED VS OBSERVED PROCESS SEQUENCE
                  </div>

                  <div style={{ fontSize: '0.8rem', background: '#050811', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle size={14} />
                      <span>Expected SOP Workflow:</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                      {healthAssessment.expectedSequence?.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--accent-cyan)' }}>{step}</span>
                          {idx < healthAssessment.expectedSequence.length - 1 && <span>→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', background: '#050811', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: healthAssessment.deviationsFoundCount > 0 ? '#fb7185' : 'var(--accent-emerald)', fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} />
                      <span>Observed Operational Practice:</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                      {healthAssessment.observedSequenceSample?.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span style={{ 
                            background: healthAssessment.deviationsFoundCount > 0 && idx === 0 && step.toLowerCase().includes('resolve') ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px', 
                            color: healthAssessment.deviationsFoundCount > 0 && idx === 0 && step.toLowerCase().includes('resolve') ? '#fb7185' : 'var(--text-primary)',
                            border: healthAssessment.deviationsFoundCount > 0 && idx === 0 && step.toLowerCase().includes('resolve') ? '1px solid rgba(244, 63, 94, 0.4)' : 'none'
                          }}>
                            {step}
                          </span>
                          {idx < healthAssessment.observedSequenceSample.length - 1 && <span>→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Process Deviations List */}
                {healthAssessment.deviations && healthAssessment.deviations.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertTriangle size={14} />
                      <span>DETECTED PROCESS DEVIATIONS ({healthAssessment.deviations.length})</span>
                    </div>

                    {healthAssessment.deviations.map((dev, i) => (
                      <div key={i} style={{ background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fb7185', marginBottom: '0.25rem' }}>
                          {dev.description}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Case ID: {dev.caseId} • Anomaly Type: {dev.deviationType}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action button to simulate operational evidence */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.825rem' }}
                  onClick={() => setShowSimulateModal(true)}
                >
                  <Plus size={14} />
                  <span>Simulate Operational Evidence Case</span>
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>No operational analysis run yet.</p>
                <button onClick={handleAnalyzeHealth} disabled={analyzingHealth} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  <Play size={14} />
                  <span>Analyze SOP Health</span>
                </button>
              </div>
            )}
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title">
              <HardDrive size={18} color="var(--accent-indigo)" />
              <span>Storage Abstraction</span>
            </div>
            <p className="card-subtitle">
              SOP file storage layer
            </p>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Storage Engine:</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>LocalStorageService</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Persistence:</span>
                <span>Docker Container Volume</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max File Size:</span>
                <span>15 MB Limit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Supported Types:</span>
                <span>PDF, DOCX, TXT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload New Version Modal */}
      {showVersionModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} color="var(--accent-cyan)" />
                <span>Upload SOP Version {sop.currentVersion + 1}</span>
              </h3>
              <button onClick={() => setShowVersionModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {versionError && (
              <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fb7185', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {versionError}
              </div>
            )}

            <form onSubmit={handleUploadVersion}>
              <div className="form-group">
                <label className="form-label">Change Summary / Version Notes *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Updated Section 4.2 to comply with revised 2026 ISO auditing guidelines."
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Updated File (PDF, DOCX, TXT) *</label>
                <input
                  type="file"
                  ref={newVersionFileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => e.target.files && setNewVersionFile(e.target.files[0])}
                />

                {!newVersionFile ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '1.5rem', borderStyle: 'dashed' }}
                    onClick={() => newVersionFileInputRef.current?.click()}
                  >
                    <Upload size={20} color="var(--accent-cyan)" />
                    <span>Click to select new document file</span>
                  </button>
                ) : (
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--accent-cyan)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{newVersionFile.name}</span>
                    <button type="button" onClick={() => setNewVersionFile(null)}>
                      <X size={16} color="var(--text-muted)" />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowVersionModal(false)}
                  disabled={uploadingVersion}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadingVersion || !newVersionFile}
                >
                  {uploadingVersion ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Commit Version {sop.currentVersion + 1}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Simulate Operational Evidence Modal */}
      {showSimulateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--accent-cyan)" />
                <span>Simulate Operational Evidence Case</span>
              </h3>
              <button onClick={() => setShowSimulateModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitSimulation}>
              <div className="form-group">
                <label className="form-label">Case Identifier *</label>
                <input
                  type="text"
                  className="form-input"
                  value={simCaseId}
                  onChange={(e) => setSimCaseId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Observed Event Sequence (Separated by -&gt;) *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={simStepsText}
                  onChange={(e) => setSimStepsText(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Example out-of-order sequence: <code>Resolve Issue -&gt; Create Support Ticket -&gt; Close Ticket</code>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSimulateModal(false)}
                  disabled={submittingSim}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingSim}
                >
                  {submittingSim ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Run Operational Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit for Review Modal */}
      {showReviewModal && targetVersion && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--accent-amber)" />
                <span>Submit SOP Version {targetVersion.versionNumber} for Review</span>
              </h3>
              <button onClick={() => setShowReviewModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label className="form-label">Review Submission Notes *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReviewModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit for Review</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve SOP Version Modal */}
      {showApproveModal && targetVersion && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#a5b4fc" />
                <span>Approve SOP Version {targetVersion.versionNumber}</span>
              </h3>
              <button onClick={() => setShowApproveModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApproveVersion}>
              <div className="form-group">
                <label className="form-label">Approval Decision & Governance Notes *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApproveModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#6366f1' }}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Approve SOP Version</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
