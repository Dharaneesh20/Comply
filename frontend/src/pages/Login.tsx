import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, UserCheck, ArrowRight } from 'lucide-react';
import DottedBg2 from '../components/ui/DottedBg2';

export const Login: React.FC = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuthData, refreshOrganizations } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await loginUser({ email: loginEmail.trim(), password: loginPass });
      setAuthData(response.token, response.user);
      await refreshOrganizations();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleFillDemo = () => {
    setEmail('admin@align.com');
    setPassword('password123');
    handleLogin('admin@align.com', 'password123');
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
              Compliance intelligence,<br />
              without the complexity.
            </h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', maxWidth: 420 }}>
              Map regulations to procedures, surface gaps before audits, and keep your team in sync — all in one workspace.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              'Automated SOP compliance mapping',
              'AI-assisted gap analysis',
              'Immutable audit trail',
              'Role-based access control',
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
              Sign in
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Welcome back to Align
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
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@organization.com"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              id="sign-in-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', marginTop: 'var(--space-2)' }}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              {!isSubmitting && <ArrowRight size={15} />}
            </button>
          </form>

          <div style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border)',
          }}>
            <button
              type="button"
              id="demo-login-btn"
              className="btn btn-secondary"
              onClick={handleFillDemo}
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              <UserCheck size={15} color="var(--color-accent)" />
              <span>Sign in with demo account</span>
            </button>
          </div>

          <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--text-link)', fontWeight: 'var(--weight-medium)' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
