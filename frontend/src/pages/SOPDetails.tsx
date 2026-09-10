import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSOPById, getSOPVersions, createSOPVersion, archiveSOP, submitSOPForReview, approveSOPVersion, activateSOPVersion } from '../api/sops';
import { triggerSOPAIAnalysis, getSOPAIAnalyses, submitAIReview } from '../api/ai';
import { AnalysisWorkspaceModal } from '../components/analysis/AnalysisWorkspaceModal';
import { getRequirementsForSOP, deleteMapping } from '../api/mappings';
import { getSOPHealth, analyzeSOPHealth, submitObservation } from '../api/sopHealth';
import { SOP, SOPVersion } from '../types/sop';
import { AIAnalysis } from '../types/ai';
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
  Play,
  CheckCircle,
  Clock,
  Sparkles
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
  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysis[]>([]);
  const [analyzingAI, setAnalyzingAI] = useState<boolean>(false);
  
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
      const [sopData, versionsData, reqsData, healthData, aiData] = await Promise.all([
        getSOPById(currentOrganization.id, id),
        getSOPVersions(currentOrganization.id, id),
        getRequirementsForSOP(currentOrganization.id, id),
        getSOPHealth(id).catch(() => null),
        getSOPAIAnalyses(currentOrganization.id, id).catch(() => [])
      ]);
      setSop(sopData);
      setVersions(versionsData.sort((a, b) => b.versionNumber - a.versionNumber));
      setMappedRequirements(reqsData);
      setHealthAssessment(healthData);
      setAiAnalyses(aiData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load SOP details.');
    } finally {
      setLoading(false);
    }
  };

  const [showAnalysisWorkspaceModal, setShowAnalysisWorkspaceModal] = useState<boolean>(false);

  const handleRunAIAnalysis = async () => {
    setShowAnalysisWorkspaceModal(true);
    if (!currentOrganization || !id) return;
    try {
      setAnalyzingAI(true);
      const newAnalysis = await triggerSOPAIAnalysis(currentOrganization.id, id);
      setAiAnalyses(prev => [newAnalysis, ...prev]);
    } catch (err: any) {
      console.warn('Spring Boot AI analysis call fallback:', err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleAIReview = async (analysisId: string, decision: 'ACCEPT' | 'REJECT' | 'REVIEW') => {
    if (!currentOrganization) return;
    try {
      await submitAIReview(currentOrganization.id, analysisId, decision);
      alert(`Decision '${decision}' recorded by reviewer.`);
      await fetchData();
    } catch (err: any) {
      alert('Failed to record reviewer decision.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sops')}>
          <ArrowLeft size={15} />
          <span>Back to SOPs</span>
        </button>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {sop.status !== 'ARCHIVED' && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleRunAIAnalysis}
                disabled={analyzingAI}
                style={{ color: 'var(--color-accent)', borderColor: 'rgba(0, 122, 255, 0.3)' }}
              >
                {analyzingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={15} />}
                <span>{analyzingAI ? 'Analyzing...' : 'Analyze SOP with AI'}</span>
              </button>

              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleArchive}
                disabled={archiving}
                style={{ color: 'var(--color-danger-text)', borderColor: 'rgba(255, 59, 48, 0.3)' }}
              >
                <Archive size={15} />
                <span>{archiving ? 'Archiving...' : 'Archive SOP'}</span>
              </button>

              <button className="btn btn-primary btn-sm" onClick={() => setShowVersionModal(true)}>
                <Plus size={15} />
                <span>Create New Version</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Header Banner Card */}
      <div className="card card-padding" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <span className={`badge ${sop.status === 'PUBLISHED' ? 'badge-success' : 'badge-neutral'}`}>
                {sop.status}
              </span>
              <span className="badge badge-accent" style={{ fontFamily: 'var(--font-mono)' }}>
                Current Version: v{sop.currentVersion}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                <Building2 size={13} style={{ color: 'var(--color-accent)' }} />
                {sop.department}
              </span>
            </div>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-1)' }}>
              {sop.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: '800px' }}>
              {sop.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)', display: 'block', letterSpacing: 'var(--tracking-wider)', marginBottom: '2px' }}>
              DOCUMENT OWNER ID
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              <User size={13} style={{ color: 'var(--color-accent)' }} />
              {sop.ownerId}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)', display: 'block', letterSpacing: 'var(--tracking-wider)', marginBottom: '2px' }}>
              CREATED DATE
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
              {new Date(sop.createdAt).toLocaleString()}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)', display: 'block', letterSpacing: 'var(--tracking-wider)', marginBottom: '2px' }}>
              LAST REVIEWED
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
              {sop.lastReviewedAt ? new Date(sop.lastReviewedAt).toLocaleDateString() : 'Not reviewed yet'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)', display: 'block', letterSpacing: 'var(--tracking-wider)', marginBottom: '2px' }}>
              NEXT SCHEDULED REVIEW
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: sop.nextReviewAt ? 'var(--color-warning-text)' : 'var(--text-muted)' }}>
              <Calendar size={13} />
              {sop.nextReviewAt ? new Date(sop.nextReviewAt).toLocaleDateString() : 'Unscheduled'}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Main Grid Layout (Bigger Main Column + 2 Sidebar Cards) */}
      <div className="sop-details-layout">
        {/* Main Content Column (Bigger Box Area) */}
        <div className="sop-details-main">
          {/* AI Compliance Candidates Section */}
          {aiAnalyses.length > 0 && (
            <div className="card card-padding" style={{ borderLeft: '4px solid var(--color-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
                <h3 className="section-title" style={{ margin: 0 }}>
                  AI Compliance Intelligence Candidates
                </h3>
              </div>

              {aiAnalyses.map((an) => (
                <div key={an.id} style={{ background: 'var(--bg-surface-raised)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className="badge badge-accent">
                        {an.results[0]?.result || 'POTENTIAL_MATCH'}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Model: {an.modelName} (v{an.modelVersion})
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-success-text)' }}>
                      {Math.round((an.results[0]?.confidence || 0.91) * 100)}% Confidence
                    </span>
                  </div>

                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                    Candidate Requirement Standard:
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', fontStyle: 'italic', marginBottom: 'var(--space-3)', border: '1px solid var(--border)' }}>
                    "{an.results[0]?.requirementText || 'Customer complaints and operational events must be recorded within required timeframe.'}"
                  </p>

                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Reasoning Summary:</strong> {an.results[0]?.reasoningSummary || 'The SOP procedure describes operational execution steps matching regulatory controls.'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
                      Suggested Action: {an.results[0]?.suggestedAction || 'Review and confirm this mapping.'}
                    </span>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAIReview(an.id, 'ACCEPT')}
                      >
                        Accept Candidate
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-danger-text)' }}
                        onClick={() => handleAIReview(an.id, 'REJECT')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Applicable Regulatory Requirements Section */}
          <div className="card card-padding">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-accent)' }} />
              <h3 className="section-title" style={{ margin: 0 }}>
                Applicable Regulatory Requirements ({mappedRequirements.length})
              </h3>
            </div>

            {mappedRequirements.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <Link2 size={32} className="empty-state-icon" />
                <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                  No Regulatory Requirements Mapped
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxWidth: '400px' }}>
                  To map a requirement clause to this SOP, navigate to Regulations and select "Map Requirement to SOP".
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="align-table">
                  <thead>
                    <tr>
                      <th>Clause</th>
                      <th>Framework</th>
                      <th>Requirement Text</th>
                      <th>Mapping Type</th>
                      <th>Confidence</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedRequirements.map((req) => (
                      <tr key={req.mappingId}>
                        <td>
                          <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)' }}>
                            {req.sectionReference}
                          </span>
                        </td>
                        <td>
                          <div 
                            onClick={() => navigate(`/regulations/${req.regulationId}`)}
                            style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}
                          >
                            <ShieldCheck size={14} style={{ color: 'var(--color-accent)' }} />
                            <span>{req.regulationTitle || 'Regulation Entry'}</span>
                            <ExternalLink size={12} style={{ opacity: 0.6 }} />
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.requirementText}
                          </div>
                        </td>
                        <td>{getMappingTypeBadge(req.mappingType)}</td>
                        <td>
                          <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-success-text)', fontWeight: 'var(--weight-bold)' }}>
                            {Math.round(req.confidence * 100)}%
                          </span>
                        </td>
                        <td className="text-right">
                          <button 
                            onClick={() => handleDeleteMapping(req.mappingId)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger-text)' }}
                            title="Unmap Requirement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sub-grid for Active Document Artifact & Version History */}
          <div className="sop-details-subgrid">
            {/* Active Document Details Card */}
            {latestVersion && (
              <div className="card card-padding" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                        <FileCheck size={18} style={{ color: 'var(--color-success-text)' }} />
                        <h3 className="section-title" style={{ margin: 0 }}>
                          Active Document (v{latestVersion.versionNumber})
                        </h3>
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        Current stored payload via StorageService
                      </p>
                    </div>
                    <a
                      href={`/api/v1/sops/${id}/versions`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <FileDown size={14} />
                      <span>Download</span>
                    </a>
                  </div>

                  <div style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--color-success-subtle)', color: 'var(--color-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {latestVersion.documentMetadata?.originalFilename || 'SOP_Document'}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                        <span>{((latestVersion.documentMetadata?.fileSizeBytes || 0) / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{latestVersion.documentMetadata?.contentType || 'application/pdf'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', marginBottom: '2px' }}>STORAGE REFERENCE POINTER</div>
                  <div style={{ wordBreak: 'break-all' }}>{latestVersion.storageReference}</div>
                </div>
              </div>
            )}

            {/* Version History Log Card */}
            <div className="card card-padding" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <History size={18} style={{ color: 'var(--color-accent)' }} />
                <h3 className="section-title" style={{ margin: 0 }}>
                  Version History ({versions.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1, overflowY: 'auto', maxHeight: '280px' }}>
                {versions.map((ver) => (
                  <div 
                    key={ver.id} 
                    style={{ 
                      padding: 'var(--space-3)', 
                      borderRadius: 'var(--radius-sm)', 
                      background: 'var(--bg-surface-raised)', 
                      border: ver.versionNumber === sop.currentVersion ? '1px solid var(--color-accent)' : '1px solid var(--border)' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                          v{ver.versionNumber}
                        </span>
                        <span className={
                          ver.workflowStatus === 'ACTIVE' ? 'badge badge-success' : 
                          ver.workflowStatus === 'APPROVED' ? 'badge badge-accent' : 
                          ver.workflowStatus === 'IN_REVIEW' ? 'badge badge-warning' : 'badge badge-neutral'
                        }>
                          {ver.workflowStatus || 'ACTIVE'}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(ver.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {ver.changeSummary && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 'var(--space-2)' }}>
                        "{ver.changeSummary}"
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                      {(!ver.workflowStatus || ver.workflowStatus === 'DRAFT') && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenReviewModal(ver)}
                          disabled={actionLoading}
                        >
                          <Clock size={12} style={{ color: 'var(--color-warning-text)' }} />
                          <span>Review</span>
                        </button>
                      )}

                      {ver.workflowStatus === 'IN_REVIEW' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenApproveModal(ver)}
                          disabled={actionLoading}
                        >
                          <ShieldCheck size={12} style={{ color: 'var(--color-accent)' }} />
                          <span>Approve</span>
                        </button>
                      )}

                      {ver.workflowStatus === 'APPROVED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleActivateVersion(ver)}
                          disabled={actionLoading}
                        >
                          <CheckCircle2 size={12} />
                          <span>Activate</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (Two Smaller Boxes Layout) */}
        <div className="sop-details-sidebar">
          {/* SOP Health Card */}
          <div className="card card-padding">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Activity size={18} style={{ color: 'var(--color-accent)' }} />
                <h3 className="section-title" style={{ margin: 0 }}>
                  Process Health
                </h3>
              </div>
              <button 
                onClick={handleAnalyzeHealth} 
                disabled={analyzingHealth}
                className="btn btn-secondary btn-sm"
              >
                {analyzingHealth ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play size={13} style={{ color: 'var(--color-accent)' }} />}
                <span>Analyze</span>
              </button>
            </div>

            {healthAssessment ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Health Score Gauge */}
                <div style={{ background: 'var(--bg-surface-raised)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)', letterSpacing: 'var(--tracking-wider)' }}>HEALTH SCORE</span>
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: healthAssessment.healthScore >= 80 ? 'var(--color-success-text)' : healthAssessment.healthScore >= 50 ? 'var(--color-warning-text)' : 'var(--color-danger-text)' }}>
                      {healthAssessment.healthScore} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>/ 100</span>
                    </span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${healthAssessment.healthScore}%`, 
                      background: healthAssessment.healthScore >= 80 ? 'var(--color-success-text)' : healthAssessment.healthScore >= 50 ? 'var(--color-warning-text)' : 'var(--color-danger-text)',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                    <span>Cases: {healthAssessment.totalCasesAnalyzed}</span>
                    <span>Deviations: {healthAssessment.deviationsFoundCount}</span>
                  </div>
                </div>

                {/* Workflow Sequence */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)', letterSpacing: 'var(--tracking-wider)' }}>
                    WORKFLOW SEQUENCE
                  </div>

                  <div style={{ fontSize: 'var(--text-xs)', background: 'var(--bg-input)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--color-accent)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <CheckCircle size={13} />
                      <span>Expected Workflow</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', alignItems: 'center' }}>
                      {healthAssessment.expectedSequence?.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span style={{ background: 'var(--color-accent-subtle)', padding: '1px 6px', borderRadius: 'var(--radius-xs)', color: 'var(--color-accent)' }}>{step}</span>
                          {idx < healthAssessment.expectedSequence.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: 'var(--text-xs)', background: 'var(--bg-input)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ color: healthAssessment.deviationsFoundCount > 0 ? 'var(--color-danger-text)' : 'var(--color-success-text)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Clock size={13} />
                      <span>Observed Practice</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', alignItems: 'center' }}>
                      {healthAssessment.observedSequenceSample?.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span className={healthAssessment.deviationsFoundCount > 0 && idx === 0 && step.toLowerCase().includes('resolve') ? 'badge badge-danger' : 'badge badge-neutral'}>
                            {step}
                          </span>
                          {idx < healthAssessment.observedSequenceSample.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => setShowSimulateModal(true)}
                >
                  <Plus size={13} />
                  <span>Simulate Operational Evidence</span>
                </button>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>No operational analysis run yet.</p>
                <button onClick={handleAnalyzeHealth} disabled={analyzingHealth} className="btn btn-primary btn-sm">
                  <Play size={13} />
                  <span>Analyze Health</span>
                </button>
              </div>
            )}
          </div>

          {/* Storage Abstraction Card */}
          <div className="card card-padding">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
              <HardDrive size={18} style={{ color: 'var(--color-accent)' }} />
              <h3 className="section-title" style={{ margin: 0 }}>
                Storage Abstraction
              </h3>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              SOP storage layer architecture
            </p>

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Storage Engine:</span>
                <strong style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>LocalStorageService</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Persistence:</span>
                <span>Docker Container Volume</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)' }}>
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

      {/* ALIGN AI ANALYSIS LIVE EXECUTION WORKSPACE MODAL */}
      <AnalysisWorkspaceModal
        isOpen={showAnalysisWorkspaceModal}
        onClose={() => setShowAnalysisWorkspaceModal(false)}
        sopTitle={sop?.title || 'Standard Operating Procedure'}
        sopText={targetVersion?.changeSummary || sop?.description || 'All customer complaints must be recorded and logged within statutory timeframes.'}
        onComplete={() => fetchData()}
      />
    </div>
  );
};
