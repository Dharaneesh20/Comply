import React from 'react';
import { ConnectionState, HealthStatusResponse } from '../types';
import { HealthBadge } from '../components/HealthBadge';
import { Database, Server, CheckCircle2, Cpu } from 'lucide-react';

interface DashboardProps {
  healthState: ConnectionState;
  healthData: HealthStatusResponse | null;
  lastChecked: Date | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ healthState, healthData, lastChecked }) => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Phase 0 Engine Control Center
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Regulatory & SOP Compliance Intelligence Monorepo Foundation & Health Status
        </p>
      </div>

      <div className="grid-2">
        {/* Connection & API Health Card */}
        <div className="card">
          <div className="card-title">
            <Server size={20} color="var(--accent-cyan)" />
            <span>Backend API Connectivity</span>
          </div>
          <p className="card-subtitle">
            Consuming REST endpoint <code style={{ color: 'var(--accent-cyan)' }}>GET /api/v1/health</code>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Real-time Status:</span>
            <HealthBadge state={healthState} healthData={healthData} showDetails={true} />
          </div>

          {healthData && (
            <table className="info-table">
              <tbody>
                <tr>
                  <th>Service Name</th>
                  <td>{healthData.service}</td>
                </tr>
                <tr>
                  <th>Status Flag</th>
                  <td>
                    <span style={{ color: healthData.status === 'UP' ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>
                      {healthData.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Database Link</th>
                  <td>
                    <span style={{ color: healthData.database === 'CONNECTED' ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 600 }}>
                      {healthData.database}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Response Timestamp</th>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {healthData.timestamp}
                  </td>
                </tr>
                <tr>
                  <th>Last Polled</th>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {lastChecked ? lastChecked.toLocaleTimeString() : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Database Migration & Schema Card */}
        <div className="card">
          <div className="card-title">
            <Database size={20} color="var(--accent-blue)" />
            <span>Database Architecture (Flyway V1)</span>
          </div>
          <p className="card-subtitle">
            PostgreSQL Schema Migrations & Initial Data Model
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>users</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>id, email, password_hash, full_name, role, status</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>organizations</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>id, name, slug, domain, status</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>organization_members</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>id, organization_id, user_id, member_role, status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Monorepo Architecture Overview */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">
            <Cpu size={20} color="var(--accent-indigo)" />
            <span>Align Monorepo Stack Specification</span>
          </div>
          <p className="card-subtitle">
            Vertical Slice Scaffolding Verification
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700 }}>FRONTEND</div>
              <div style={{ fontWeight: 700, margin: '0.25rem 0' }}>React 18 + TypeScript</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vite, Axios, Router, Lucide Icons, Vitest</div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 700 }}>BACKEND</div>
              <div style={{ fontWeight: 700, margin: '0.25rem 0' }}>Java 21 + Spring Boot 3</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>REST, Global Exceptions, Structured Logging</div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--accent-indigo)', fontSize: '0.8rem', fontWeight: 700 }}>PERSISTENCE</div>
              <div style={{ fontWeight: 700, margin: '0.25rem 0' }}>PostgreSQL 16 + Flyway</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Auto DDL Migrations, JPA Repositories</div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700 }}>DOCS & TOOLS</div>
              <div style={{ fontWeight: 700, margin: '0.25rem 0' }}>OpenAPI 3.0 / Swagger</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Docker Compose, Global Architecture Specs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
