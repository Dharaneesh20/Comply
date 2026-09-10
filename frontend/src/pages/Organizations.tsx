import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrganization } from '../api/organizations';
import { Building2, Plus, CheckCircle2, ArrowRight, AlertCircle, X } from 'lucide-react';

export const OrganizationsPage: React.FC = () => {
  const { organizations, currentOrganization, setCurrentOrganization, refreshOrganizations } = useAuth();
  const [name, setName]   = useState('');
  const [slug, setSlug]   = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { refreshOrganizations(); }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const newOrg = await createOrganization({ name, slug, domain: domain || undefined });
      await refreshOrganizations();
      setCurrentOrganization(newOrg);
      setShowModal(false);
      setName(''); setSlug(''); setDomain('');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (org: any) => {
    setCurrentOrganization(org);
    navigate('/dashboard');
  };

  const handleClose = () => {
    setShowModal(false);
    setError(null);
    setName(''); setSlug(''); setDomain('');
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-text">
            <h2 className="page-title">Organizations</h2>
            <p className="page-subtitle">
              Select or create an organization workspace to manage compliance workflows.
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setShowModal(true)} id="create-org-btn">
              <Plus size={15} />
              New organization
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {organizations.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Building2 size={36} className="empty-state-icon" />
            <h3 className="empty-state-title">No organizations</h3>
            <p className="empty-state-description">
              Create your first organization to begin your compliance journey. You'll be assigned as Admin.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={15} />
              Create first organization
            </button>
          </div>
        </div>
      ) : (
        /* Organization cards grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {organizations.map(org => {
            const isActive = currentOrganization?.id === org.id;
            return (
              <div
                key={org.id}
                className="card card-padding card-clickable"
                style={{
                  border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--border)'}`,
                  background: isActive ? 'var(--color-accent-subtle)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                }}
                onClick={() => handleSelect(org)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleSelect(org)}
                aria-label={`Select ${org.name}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--color-accent)' : 'var(--bg-surface-raised)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-md)' }}>
                        {org.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        /{org.slug}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <span style={{ color: 'var(--color-accent)', flexShrink: 0 }}>
                      <CheckCircle2 size={18} />
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--border)',
                  fontSize: 'var(--text-xs)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="badge badge-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                      {org.memberRole}
                    </span>
                    <span className={`badge ${org.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: 'var(--text-xs)' }}>
                      {org.status}
                    </span>
                  </div>
                  <ArrowRight size={14} color={isActive ? 'var(--color-accent)' : 'var(--text-muted)'} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Organization Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="create-org-title">
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <div>
                <h2 id="create-org-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', letterSpacing: 'var(--tracking-tight)' }}>
                  New organization
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                  You'll be assigned as Admin.
                </p>
              </div>
              <button className="header-icon-btn" onClick={handleClose} aria-label="Close dialog">
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label form-label-required" htmlFor="org-name">Organization name</label>
                <input
                  id="org-name"
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Acme Compliance Corp"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label form-label-required" htmlFor="org-slug">URL slug</label>
                <input
                  id="org-slug"
                  type="text"
                  required
                  pattern="^[a-z0-9-]+$"
                  className="form-input"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="acme-compliance"
                />
                <div className="form-description">Lowercase letters, numbers, and hyphens only.</div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="org-domain">Domain (optional)</label>
                <input
                  id="org-domain"
                  type="text"
                  className="form-input"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="acme.com"
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="create-org-submit">
                  {isSubmitting ? 'Creating…' : 'Create workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
