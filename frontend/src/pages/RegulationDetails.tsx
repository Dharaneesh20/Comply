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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/regulations')} style={{ padding: '0.4rem 0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Regulations</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleAnalyzeChange}>
            <GitBranch size={16} color="var(--accent-cyan)" />
            <span>Analyze Version Change Impact</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setShowVersionModal(true)}>
            <Plus size={16} />
            <span>Add Version</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setShowReqModal(true)}>
            <Plus size={16} />
            <span>Add Requirement Clause</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowMappingModal(true)} disabled={requirements.length === 0 || availableSops.length === 0}>
            <Link2 size={16} />
            <span>Map Requirement to SOP</span>
          </button>
        </div>
      </div>

      {/* Main Banner Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className={`status-badge ${regulation.status.toLowerCase()}`}>
                {regulation.status}
              </span>
              <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                {regulation.category}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {regulation.title}
            </h1>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              JURISDICTION
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Globe2 size={15} color="var(--accent-cyan)" />
              {regulation.jurisdiction}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              GOVERNING AUTHORITY
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Building size={15} color="var(--accent-purple)" />
              {regulation.authority}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              PUBLICATION DATE
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {regulation.publicationDate ? new Date(regulation.publicationDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
              ENFORCEMENT / EFFECTIVE DATE
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--accent-amber)' }}>
              <Calendar size={14} />
              {regulation.effectiveDate ? new Date(regulation.effectiveDate).toLocaleDateString() : 'Immediate'}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', color: '#fcd34d' }}>
        <Info size={20} style={{ flexShrink: 0 }} />
        <span>
          <strong>Legal Disclaimer:</strong> Extracted requirements and clause references stored within the Align Compliance Knowledge Base serve operational alignment and audit gap analysis only, and are not legally authoritative.
        </span>
      </div>

      {/* Active Mapped SOPs & Operational Coverage Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="card-title" style={{ margin: 0 }}>
            <Link2 size={20} color="var(--accent-emerald)" />
            <span>Mapped Standard Operating Procedures ({mappedSops.length})</span>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => setShowMappingModal(true)}
            disabled={requirements.length === 0 || availableSops.length === 0}
          >
            <Plus size={14} />
            <span>Create New Mapping</span>
          </button>
        </div>

        {mappedSops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <Link2 size={36} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No SOPs Mapped Yet</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Explicitly map regulatory requirement clauses to operational SOPs to establish compliance lineage.
            </p>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowMappingModal(true)}
              disabled={requirements.length === 0 || availableSops.length === 0}
            >
              <Plus size={16} />
              <span>Map First Requirement</span>
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Section Clause</th>
                  <th>Mapped SOP Document</th>
                  <th>Department</th>
                  <th>Mapping Type</th>
                  <th>Confidence</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappedSops.map((item) => (
                  <tr key={item.mappingId}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        {item.sectionReference}
                      </span>
                    </td>
                    <td>
                      <div 
                        onClick={() => navigate(`/sops/${item.sopId}`)}
                        style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FileText size={15} color="var(--accent-cyan)" />
                        <span>{item.sopTitle || 'SOP Document'}</span>
                        <ExternalLink size={12} style={{ opacity: 0.6 }} />
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {item.department || 'N/A'} (v{item.currentVersion || 1})
                      </span>
                    </td>
                    <td>{getMappingTypeBadge(item.mappingType)}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {item.notes || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteMapping(item.mappingId)}
                        style={{ color: 'var(--accent-rose)', padding: '0.35rem', borderRadius: '4px' }}
                        title="Delete mapping"
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

      {/* Main Grid: Requirements Section & Versions Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        
        {/* Left Column: Regulatory Requirements */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div className="card-title" style={{ margin: 0 }}>
                <ListChecks size={20} color="var(--accent-cyan)" />
                <span>Extracted Requirements ({requirements.length})</span>
              </div>
              <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setShowReqModal(true)}>
                <Plus size={14} />
                <span>Add Requirement</span>
              </button>
            </div>

            {requirements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                <ListChecks size={36} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No Requirements Extracted Yet</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add specific section clauses and compliance rules for this regulation.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requirements.map((req) => (
                  <div key={req.id} style={{ padding: '1rem 1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                        {req.sectionReference}
                      </span>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedReqId(req.id);
                          setShowMappingModal(true);
                        }}
                      >
                        <Link2 size={12} />
                        <span>Map to SOP</span>
                      </button>
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                      {req.requirementText}
                    </p>

                    {req.sourceReference && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                        Source Ref: <span style={{ color: 'var(--text-secondary)' }}>{req.sourceReference}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Version History Log */}
        <div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>
              <History size={18} color="var(--accent-purple)" />
              <span>Regulation Versions ({versions.length})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {versions.map((ver) => (
                <div key={ver.id} style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Version {ver.versionNumber}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(ver.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
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
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link2 size={20} color="var(--accent-cyan)" />
                <span>Map Requirement Clause to SOP</span>
              </h3>
              <button onClick={() => setShowMappingModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {mappingError && (
              <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fb7185', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {mappingError}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMappingModal(false)} disabled={savingMapping}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingMapping || !selectedReqId || !selectedSopId}>
                  {savingMapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>Save Compliance Mapping</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Version Modal */}
      {showVersionModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--accent-cyan)" />
                <span>Add Regulation Version</span>
              </h3>
              <button onClick={() => setShowVersionModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowVersionModal(false)} disabled={savingVersion}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingVersion || !versionDocRef.trim()}>
                  {savingVersion ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>Add Version</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Requirement Modal */}
      {showReqModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListChecks size={20} color="var(--accent-cyan)" />
                <span>Add Regulatory Requirement Clause</span>
              </h3>
              <button onClick={() => setShowReqModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReqModal(false)} disabled={savingReq}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingReq || !reqText.trim() || !sectionRef.trim()}>
                  {savingReq ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
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
