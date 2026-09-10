import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSOPById, getSOPVersions, createSOPVersion, archiveSOP } from '../api/sops';
import { SOP, SOPVersion } from '../types/sop';
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
  FileDown 
} from 'lucide-react';

export const SOPDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const newVersionFileInputRef = useRef<HTMLInputElement>(null);

  const [sop, setSop] = useState<SOP | null>(null);
  const [versions, setVersions] = useState<SOPVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Version Modal state
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [changeSummary, setChangeSummary] = useState<string>('');
  const [uploadingVersion, setUploadingVersion] = useState<boolean>(false);
  const [versionError, setVersionError] = useState<string | null>(null);

  // Archive state
  const [archiving, setArchiving] = useState<boolean>(false);

  const fetchData = async () => {
    if (!currentOrganization || !id) return;
    try {
      setLoading(true);
      setError(null);
      const [sopData, versionsData] = await Promise.all([
        getSOPById(currentOrganization.id, id),
        getSOPVersions(currentOrganization.id, id),
      ]);
      setSop(sopData);
      setVersions(versionsData.sort((a, b) => b.versionNumber - a.versionNumber));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load SOP details.');
    } finally {
      setLoading(false);
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
      await fetchData(); // Refresh details & versions
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
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
                        {ver.versionNumber === sop.currentVersion && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                            CURRENT
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

        {/* Right Column: Storage Abstraction Info & Quick Actions */}
        <div>
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
    </div>
  );
};
