import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRegulation } from '../api/regulations';
import { RegulationStatus } from '../types/regulation';
import { 
  ShieldCheck, 
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
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Back Button */}
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/regulations')} 
        style={{ marginBottom: '1.5rem', padding: '0.4rem 0.85rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Regulations Library</span>
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Create Regulatory Framework</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Add a new regulatory standard or statutory compliance framework entry to MongoDB.
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
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Regulation Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. EU General Data Protection Regulation (GDPR)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Jurisdiction */}
            <div className="form-group">
              <label className="form-label">Jurisdiction *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. European Union, United States, Global"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                required
              />
            </div>

            {/* Authority */}
            <div className="form-group">
              <label className="form-label">Governing Authority *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FDA, SEC, EU Parliament, HHS"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
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

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status *</label>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Publication Date */}
            <div className="form-group">
              <label className="form-label">Official Publication Date</label>
              <input
                type="date"
                className="form-input"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
              />
            </div>

            {/* Effective Date */}
            <div className="form-group">
              <label className="form-label">Enforcement / Effective Date</label>
              <input
                type="date"
                className="form-input"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Source ID */}
            <div className="form-group">
              <label className="form-label">Source Reference Identifier</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CELEX_32016R0679 or 45 CFR Part 164"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              />
            </div>

            {/* Initial Version Document Reference */}
            <div className="form-group">
              <label className="form-label">Initial Version Reference (v1)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Official Journal L 119/1"
                value={initialDocumentReference}
                onChange={(e) => setInitialDocumentReference(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Regulation...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Save & Initialize Version 1</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
