import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import DottedBg2 from '../components/ui/DottedBg2';

export const Register: React.FC = () => {
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuthData, refreshOrganizations } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await registerUser({ fullName, email, password });
      setAuthData(response.token, response.user);
      await refreshOrganizations();
      navigate('/organizations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left branding panel with Chromatic Waves WebGL Shader */}
      <div className="auth-left">
        <div className="auth-bg-canvas">
          <DottedBg2
            frequency={1.2}
            speed={1.0}
            cellSize={4}
            gamma={4}
            paletteBias={-4}
            colors={[
              "#007AFF",
              "#0066D6",
              "#34C759",
              "#5AC8FA",
              "#5856D6",
              "#AF52DE",
              "#0A84FF",
            ]}
          />
        </div>

        <div className="auth-left-content">
          <div>
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', letterSpacing: 'var(--tracking-tight)', lineHeight: 1.1 }}>
                Align.
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', marginTop: 4 }}>
                Statutory & SOP Workspace
              </div>
            </div>

            <h2 style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-tight)',
              lineHeight: 'var(--leading-tight)',
              marginBottom: 'var(--space-4)',
            }}>
              Get started<br />in minutes.
            </h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', maxWidth: 420 }}>
              Create your account, set up your organization, and start mapping your compliance requirements right away.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              'No credit card required',
              'Works with your existing SOPs and regulations',
              'Team collaboration built in',
              'Enterprise-grade security from day one',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                <ShieldCheck size={16} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-tight)',
              marginBottom: 'var(--space-1)',
            }}>
              Create account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Join Align — Regulatory Compliance Intelligence
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                className="form-input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-email">Work email</label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@organization.com"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <button
              id="register-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', marginTop: 'var(--space-2)' }}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
              {!isSubmitting && <ArrowRight size={15} />}
            </button>
          </form>

          <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--text-link)', fontWeight: 'var(--weight-medium)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
