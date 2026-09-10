import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRegulation } from '../api/regulations';
import { RegulationStatus } from '../types/regulation';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export const CreateRegulation: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [jurisdiction, setJurisdiction] = useState<string>('European Union');
  const [authority, setAuthority] = useState<string>('EU Parliament');
  const [category, setCategory] = useState<string>('Data Privacy & Protection');
  const [status, setStatus] = useState<RegulationStatus>('ACTIVE');
  const [publicationDate, setPublicationDate] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [initialDocumentReference, setInitialDocumentReference] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;
    if (!title.trim()) {
      setError('Regulation Title is required.');
      return;
    }
    if (!jurisdiction.trim()) {
      setError('Jurisdiction is required.');
      return;
    }
    if (!authority.trim()) {
      setError('Governing Authority is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const pubIso = publicationDate ? new Date(publicationDate).toISOString() : undefined;
      const effIso = effectiveDate ? new Date(effectiveDate).toISOString() : undefined;

      const created = await createRegulation(currentOrganization.id, {
        title,
        jurisdiction,
        authority,
        category,
        status,
        publicationDate: pubIso,
        effectiveDate: effIso,
        sourceId: sourceId || undefined,
        initialDocumentReference: initialDocumentReference || undefined,
      });

      navigate(`/regulations/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create regulation entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      {/* Back navigation */}
      <button 
        className="btn btn-ghost btn-sm" 
        onClick={() => navigate('/regulations')} 
        style={{ marginBottom: 'var(--space-5)' }}
      >
        <ArrowLeft size={14} />
        <span>Back to Regulations Library</span>
      </button>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <h2 className="page-title">New Regulatory Framework</h2>
        <p className="page-subtitle">Add a new statutory compliance standard or regulatory benchmark entry.</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Section 1: Overview & Primary Info */}
        <div className="card card-padding">
          <h3 style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-muted)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}>
            Framework Details
          </h3>

          <div className="form-group">
            <label className="form-label form-label-required">Regulation Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. EU General Data Protection Regulation (GDPR)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label form-label-required">Jurisdiction</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. European Union, Global"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label form-label-required">Governing Authority</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FDA, SEC, EU Parliament"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Classification & Status */}
        <div className="card card-padding">
          <h3 style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-muted)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}>
            Classification & Status
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label form-label-required">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="Data Privacy & Protection">Data Privacy & Protection</option>
                <option value="Cybersecurity & InfoSec">Cybersecurity & InfoSec</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Financial & Banking">Financial & Banking</option>
                <option value="Quality & Manufacturing">Quality & Manufacturing</option>
                <option value="Environmental & Safety">Environmental & Safety</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label form-label-required">Lifecycle Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as RegulationStatus)}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="SUPERSEDED">Superseded</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Dates & References */}
        <div className="card card-padding">
          <h3 style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-muted)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}>
            Dates & Identifiers
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Official Publication Date</label>
              <input
                type="date"
                className="form-input"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Enforcement / Effective Date</label>
              <input
                type="date"
                className="form-input"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Source Reference ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CELEX_32016R0679"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Initial Version Ref (v1)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Official Journal L 119/1"
                value={initialDocumentReference}
                onChange={(e) => setInitialDocumentReference(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/regulations')}
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
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Regulation…</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Save Framework</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
