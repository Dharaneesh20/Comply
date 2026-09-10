import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadSOP } from '../api/sops';
import { 
  Upload, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  File, 
  X, 
  Loader2 
} from 'lucide-react';


export const CreateSOP: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState<string>('');
  const [department, setDepartment] = useState<string>('Engineering');
  const [description, setDescription] = useState<string>('');
  const [nextReviewAt, setNextReviewAt] = useState<string>('');

  // Selected File
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Loading & error
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const handleFileSelect = (file: File) => {
    setError(null);
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isExtensionValid = ['pdf', 'docx', 'txt'].includes(fileExt || '');

    if (!isExtensionValid && !allowedTypes.includes(file.type)) {
      setError('Invalid file format. Please select a PDF, DOCX, or TXT document.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 15MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;
    if (!title.trim()) {
      setError('SOP Title is required.');
      return;
    }
    if (!department.trim()) {
      setError('Department is required.');
      return;
    }
    if (!selectedFile) {
      setError('Please upload a initial SOP document (PDF, DOCX, or TXT).');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const reviewDateIso = nextReviewAt ? new Date(nextReviewAt).toISOString() : undefined;

      const created = await uploadSOP(
        currentOrganization.id,
        selectedFile,
        title,
        department,
        description || undefined,
        reviewDateIso
      );

      navigate(`/sops/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create SOP. Please check backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Back navigation */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/sops')}
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <ArrowLeft size={14} />
        Back to SOPs
      </button>

      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <h2 className="page-title">New Standard Operating Procedure</h2>
        <p className="page-subtitle">Upload your SOP document and configure its compliance metadata.</p>
      </div>

      <div className="card card-padding">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Metadata Section */}
          <div className="form-group">
            <label className="form-label">SOP Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Information Security Incident Response Protocol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="Engineering">Engineering</option>
                <option value="Compliance">Compliance & Legal</option>
                <option value="Operations">Operations</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Security">InfoSec & Security</option>
                <option value="Quality Assurance">Quality Assurance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Next Scheduled Review Date</label>
              <input
                type="date"
                className="form-input"
                value={nextReviewAt}
                onChange={(e) => setNextReviewAt(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">SOP Description / Scope</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Provide a brief summary of the standard operating procedures covered in this document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* File Upload Section */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Upload SOP Document (Initial Version v1) *</label>
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.txt"
              onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
            />

            {!selectedFile ? (
              <div
                className={`dropzone ${isDragOver ? 'active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="dropzone-icon">
                  <Upload size={28} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Drag & Drop SOP file here, or <span style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>browse</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Supported formats: PDF, DOCX, TXT (Maximum size: 15MB)
                </div>
              </div>
            ) : (
              <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-accent-subtle)', border: '1px solid rgba(0,122,255,0.3)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ padding: 'var(--space-2)', background: 'var(--color-accent-subtle)', color: 'var(--color-accent)', borderRadius: 'var(--radius-xs)' }}>
                    <File size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.type || 'Document'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="header-icon-btn"
                  onClick={() => setSelectedFile(null)}
                  aria-label="Remove file"
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-8)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/sops')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="create-sop-submit"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  Uploading…
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Save SOP & Upload v1
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
