import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getRegulationById, 
  getRegulationVersions, 
  getRequirements, 
  createRegulationVersion, 
  addRequirement 
} from '../api/regulations';
import { getSOPs } from '../api/sops';
import { createMapping, getMappedSOPsForRegulation, deleteMapping } from '../api/mappings';
import { Regulation, RegulationVersion, RegulatoryRequirement } from '../types/regulation';
import { SOP } from '../types/sop';
import { MappedSOPDetailResponse, MappingType } from '../types/mapping';
import { analyzeRegulationChange } from '../api/regulatoryChanges';
import { 
  ArrowLeft, 
  Plus, 
  History, 
  ListChecks, 
  Calendar, 
  Globe2, 
  Building, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  X, 
  Info,
  Link2,
  FileText,
  Trash2,
  ExternalLink,
  GitBranch
} from 'lucide-react';

export const RegulationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const [versions, setVersions] = useState<RegulationVersion[]>([]);
  const [requirements, setRequirements] = useState<RegulatoryRequirement[]>([]);
  const [mappedSops, setMappedSops] = useState<MappedSOPDetailResponse[]>([]);
  const [availableSops, setAvailableSops] = useState<SOP[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Version Modal
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [versionDocRef, setVersionDocRef] = useState<string>('');
  const [versionEffDate, setVersionEffDate] = useState<string>('');
  const [savingVersion, setSavingVersion] = useState<boolean>(false);

  // New Requirement Modal
  const [showReqModal, setShowReqModal] = useState<boolean>(false);
  const [reqText, setReqText] = useState<string>('');
  const [sectionRef, setSectionRef] = useState<string>('');
  const [applicability, setApplicability] = useState<string>('');
  const [sourceRef, setSourceRef] = useState<string>('');
  const [savingReq, setSavingReq] = useState<boolean>(false);

  // New Mapping Modal
  const [showMappingModal, setShowMappingModal] = useState<boolean>(false);
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [selectedSopId, setSelectedSopId] = useState<string>('');
  const [selectedMappingType, setSelectedMappingType] = useState<MappingType>('FULL');
  const [mappingNotes, setMappingNotes] = useState<string>('');
  const [savingMapping, setSavingMapping] = useState<boolean>(false);
  const [mappingError, setMappingError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!currentOrganization || !id) return;
    try {
      setLoading(true);
      setError(null);
      const [regData, versionsData, reqsData, mappedSopsData, sopsData] = await Promise.all([
        getRegulationById(currentOrganization.id, id),
        getRegulationVersions(currentOrganization.id, id),
        getRequirements(currentOrganization.id, id),
        getMappedSOPsForRegulation(currentOrganization.id, id),
        getSOPs(currentOrganization.id),
      ]);
      setRegulation(regData);
      setVersions(versionsData.sort((a, b) => b.versionNumber - a.versionNumber));
      setRequirements(reqsData);
      setMappedSops(mappedSopsData);
      setAvailableSops(sopsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load regulation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentOrganization, id]);

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !id || !versionDocRef.trim()) return;

    try {
      setSavingVersion(true);
      const effIso = versionEffDate ? new Date(versionEffDate).toISOString() : undefined;
      await createRegulationVersion(currentOrganization.id, id, {
        documentReference: versionDocRef,
        effectiveDate: effIso,
      });
      setShowVersionModal(false);
      setVersionDocRef('');
      setVersionEffDate('');
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create regulation version.');
    } finally {
      setSavingVersion(false);
    }
  };

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !id || !reqText.trim() || !sectionRef.trim()) return;

    try {
      setSavingReq(true);
      await addRequirement(currentOrganization.id, id, {
        requirementText: reqText,
        sectionReference: sectionRef,
        applicability: applicability || undefined,
        sourceReference: sourceRef || undefined,
      });
      setShowReqModal(false);
      setReqText('');
      setSectionRef('');
      setApplicability('');
      setSourceRef('');
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add requirement clause.');
    } finally {
      setSavingReq(false);
    }
  };

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !id || !selectedReqId || !selectedSopId) return;

    try {
      setSavingMapping(true);
      setMappingError(null);
      await createMapping(currentOrganization.id, {
        regulationId: id,
        requirementId: selectedReqId,
        sopId: selectedSopId,
        mappingType: selectedMappingType,
        confidence: 1.0,
        notes: mappingNotes || undefined,
      });
      setShowMappingModal(false);
      setSelectedReqId('');
      setSelectedSopId('');
      setMappingNotes('');
      await fetchData();
    } catch (err: any) {
      setMappingError(err.response?.data?.message || 'Failed to map requirement to SOP.');
    } finally {
      setSavingMapping(false);
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!currentOrganization) return;
    if (!window.confirm('Are you sure you want to delete this mapping relationship?')) return;

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

  if (error || !regulation) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Error Loading Regulation</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error || 'Regulation entry not found.'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/regulations')}>
          <ArrowLeft size={16} />
          <span>Return to Regulations Library</span>
        </button>
      </div>
    );
  }

  const handleAnalyzeChange = async () => {
    if (!id) return;
    try {
      const change = await analyzeRegulationChange(id);
      navigate(`/regulatory-changes/${change.id}`);
    } catch (err: any) {
      alert('Failed to analyze regulatory change impact.');
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/regulations')}>
          <ArrowLeft size={15} />
          <span>Back to Regulations</span>
        </button>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleAnalyzeChange}>
            <GitBranch size={15} style={{ color: 'var(--color-accent)' }} />
            <span>Analyze Version Change Impact</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowVersionModal(true)}>
            <Plus size={15} />
            <span>Add Version</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowReqModal(true)}>
            <Plus size={15} />
            <span>Add Requirement Clause</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowMappingModal(true)} disabled={requirements.length === 0 || availableSops.length === 0}>
            <Link2 size={15} />
            <span>Map Requirement to SOP</span>
          </button>
        </div>
      </div>

      {/* Main Banner Card */}
      <div className="card card-padding" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span className={`badge ${regulation.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                {regulation.status}
              </span>
              <span className="badge badge-accent">
                {regulation.category}
              </span>
            </div>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-1)' }}>
              {regulation.title}
            </h1>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)', display: 'block', letterSpacing: 'var(--tracking-wider)', marginBottom: '2px' }}>
              JURISDICTION
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
              <Globe2 size={13} style={{ color: 'var(--color-accent)' }} />
              {regulation.jurisdiction}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)', display: 'block', letterSpacing: 'var(--tracking-wider)', marginBottom: '2px' }}>
              GOVERNING AUTHORITY
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
              <Building size={13} style={{ color: 'var(--color-accent)' }} />
              {regulation.authority}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)', display: 'block', letterSpacing: 'var(--tracking-wider)', marginBottom: '2px' }}>
              PUBLICATION DATE
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {regulation.publicationDate ? new Date(regulation.publicationDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)', display: 'block', letterSpacing: 'var(--tracking-wider)', marginBottom: '2px' }}>
              ENFORCEMENT / EFFECTIVE DATE
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-warning-text)' }}>
              <Calendar size={13} />
              {regulation.effectiveDate ? new Date(regulation.effectiveDate).toLocaleDateString() : 'Immediate'}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-warning-subtle)', border: '1px solid rgba(255, 159, 10, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-warning-text)' }}>
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Legal Disclaimer:</strong> Extracted requirements and clause references stored within the Align Compliance Knowledge Base serve operational alignment and audit gap analysis only, and are not legally authoritative.
        </span>
      </div>

      {/* Dashboard Main Grid Layout (Bigger Main Box + Sidebar Box) */}
      <div className="sop-details-layout">
        {/* Main Content Column (Bigger Box Area) */}
        <div className="sop-details-main">
          {/* Active Mapped SOPs & Operational Coverage Card */}
          <div className="card card-padding">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Link2 size={18} style={{ color: 'var(--color-accent)' }} />
                <h3 className="section-title" style={{ margin: 0 }}>
                  Mapped Standard Operating Procedures ({mappedSops.length})
                </h3>
              </div>

              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => setShowMappingModal(true)}
                disabled={requirements.length === 0 || availableSops.length === 0}
              >
                <Plus size={14} />
                <span>Create New Mapping</span>
              </button>
            </div>

            {mappedSops.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <Link2 size={32} className="empty-state-icon" />
                <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                  No SOPs Mapped Yet
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: 'var(--space-4)' }}>
                  Explicitly map regulatory requirement clauses to operational SOPs to establish compliance lineage.
                </p>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowMappingModal(true)}
                  disabled={requirements.length === 0 || availableSops.length === 0}
                >
                  <Plus size={14} />
                  <span>Map First Requirement</span>
                </button>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="align-table">
                  <thead>
                    <tr>
                      <th>Clause</th>
                      <th>Mapped SOP</th>
                      <th>Department</th>
                      <th>Mapping Type</th>
                      <th>Confidence</th>
                      <th>Notes</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedSops.map((item) => (
                      <tr key={item.mappingId}>
                        <td>
                          <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)' }}>
                            {item.sectionReference}
                          </span>
                        </td>
                        <td>
                          <div 
                            onClick={() => navigate(`/sops/${item.sopId}`)}
                            style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}
                          >
                            <FileText size={14} style={{ color: 'var(--color-accent)' }} />
                            <span>{item.sopTitle || 'SOP Document'}</span>
                            <ExternalLink size={12} style={{ opacity: 0.6 }} />
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                            {item.department || 'N/A'} (v{item.currentVersion || 1})
                          </span>
                        </td>
                        <td>{getMappingTypeBadge(item.mappingType)}</td>
                        <td>
                          <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-success-text)', fontWeight: 'var(--weight-bold)' }}>
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            {item.notes || '—'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button 
                            onClick={() => handleDeleteMapping(item.mappingId)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger-text)' }}
                            title="Delete mapping"
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

          {/* Extracted Requirements Section */}
          <div className="card card-padding">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ListChecks size={18} style={{ color: 'var(--color-accent)' }} />
                <h3 className="section-title" style={{ margin: 0 }}>
                  Extracted Requirements ({requirements.length})
                </h3>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowReqModal(true)}>
                <Plus size={14} />
                <span>Add Requirement</span>
              </button>
            </div>

            {requirements.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <ListChecks size={32} className="empty-state-icon" />
                <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                  No Requirements Extracted Yet
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Add specific section clauses and compliance rules for this regulation.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {requirements.map((req) => (
                  <div key={req.id} style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)' }}>
                        {req.sectionReference}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedReqId(req.id);
                          setShowMappingModal(true);
                        }}
                      >
                        <Link2 size={12} />
                        <span>Map to SOP</span>
                      </button>
                    </div>
                    
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 'var(--leading-normal)', marginBottom: 'var(--space-2)' }}>
                      {req.requirementText}
                    </p>

                    {req.sourceReference && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2)' }}>
                        Source Ref: <span style={{ color: 'var(--text-secondary)' }}>{req.sourceReference}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column (Two Smaller Boxes Layout) */}
        <div className="sop-details-sidebar">
          {/* Regulation Versions Card */}
          <div className="card card-padding">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <History size={18} style={{ color: 'var(--color-accent)' }} />
              <h3 className="section-title" style={{ margin: 0 }}>
                Versions ({versions.length})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {versions.map((ver) => (
                <div key={ver.id} style={{ padding: 'var(--space-3)', background: 'var(--bg-surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                    <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      Version {ver.versionNumber}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {new Date(ver.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', wordBreak: 'break-all' }}>
                    {ver.documentReference}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Requirement to SOP Modal */}
      {showMappingModal && (
        <div className="modal-overlay" onClick={() => setShowMappingModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Link2 size={18} style={{ color: 'var(--color-accent)' }} />
                <span>Map Requirement Clause to SOP</span>
              </h3>
              <button className="header-icon-btn" onClick={() => setShowMappingModal(false)}>
                <X size={16} />
              </button>
            </div>

            {mappingError && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{mappingError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMapping}>
              <div className="form-group">
                <label className="form-label">Select Requirement Clause *</label>
                <select
                  className="form-select"
                  value={selectedReqId}
                  onChange={(e) => setSelectedReqId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Requirement Clause --</option>
                  {requirements.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.sectionReference}] {r.requirementText.substring(0, 60)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Operational SOP Document *</label>
                <select
                  className="form-select"
                  value={selectedSopId}
                  onChange={(e) => setSelectedSopId(e.target.value)}
                  required
                >
                  <option value="">-- Choose SOP Document --</option>
                  {availableSops.map((sop) => (
                    <option key={sop.id} value={sop.id}>
                      {sop.title} ({sop.department} • v{sop.currentVersion})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mapping Coverage Type *</label>
                <select
                  className="form-select"
                  value={selectedMappingType}
                  onChange={(e) => setSelectedMappingType(e.target.value as MappingType)}
                  required
                >
                  <option value="FULL">FULL - Complete Implementation</option>
                  <option value="PARTIAL">PARTIAL - Partial Coverage</option>
                  <option value="NOT_IMPLEMENTED">NOT_IMPLEMENTED - Gap Identified</option>
                  <option value="NOT_APPLICABLE">NOT_APPLICABLE - Out of Scope</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mapping Rationale / Section Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. SOP Section 4.1 satisfies technical encryption requirements."
                  value={mappingNotes}
                  onChange={(e) => setMappingNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMappingModal(false)} disabled={savingMapping}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingMapping || !selectedReqId || !selectedSopId}>
                  {savingMapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={15} />}
                  <span>Save Compliance Mapping</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Version Modal */}
      {showVersionModal && (
        <div className="modal-overlay" onClick={() => setShowVersionModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Plus size={18} style={{ color: 'var(--color-accent)' }} />
                <span>Add Regulation Version</span>
              </h3>
              <button className="header-icon-btn" onClick={() => setShowVersionModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateVersion}>
              <div className="form-group">
                <label className="form-label">Document Reference / CELEX / Citation *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Official Gazette Revision 2026-B"
                  value={versionDocRef}
                  onChange={(e) => setVersionDocRef(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Effective Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={versionEffDate}
                  onChange={(e) => setVersionEffDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowVersionModal(false)} disabled={savingVersion}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingVersion || !versionDocRef.trim()}>
                  {savingVersion ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={15} />}
                  <span>Add Version</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Requirement Modal */}
      {showReqModal && (
        <div className="modal-overlay" onClick={() => setShowReqModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ListChecks size={18} style={{ color: 'var(--color-accent)' }} />
                <span>Add Regulatory Requirement Clause</span>
              </h3>
              <button className="header-icon-btn" onClick={() => setShowReqModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddRequirement}>
              <div className="form-group">
                <label className="form-label">Section / Article Reference *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Article 32(1)(b) or Section 164.312(a)(1)"
                  value={sectionRef}
                  onChange={(e) => setSectionRef(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirement Text / Clause *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="State the requirement text or statutory obligation..."
                  value={reqText}
                  onChange={(e) => setReqText(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Applicability / Scope</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. All Covered Entities & Business Associates"
                  value={applicability}
                  onChange={(e) => setApplicability(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Source Reference Citation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 45 CFR § 164.312"
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReqModal(false)} disabled={savingReq}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingReq || !reqText.trim() || !sectionRef.trim()}>
                  {savingReq ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={15} />}
                  <span>Save Requirement Clause</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
