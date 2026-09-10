import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadSOP } from '../api/sops';
import { 
  FileText, 
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Navigation */}
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/sops')} 
        style={{ marginBottom: '1.5rem', padding: '0.4rem 0.85rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to SOPs</span>
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Create Standard Operating Procedure</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Upload your SOP document file and configure compliance metadata.
            </p>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fb7185', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
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
              <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--accent-cyan)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderRadius: '6px' }}>
                    <File size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  style={{ color: 'var(--text-muted)', padding: '0.25rem' }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
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
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Document...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Save SOP & Upload Version 1</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
