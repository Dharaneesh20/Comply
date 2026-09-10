import React, { useState } from 'react';
import { Building2, Loader2, MessageSquare, Send, Sparkles } from 'lucide-react';

type GuideResult = { answer: string; next_questions?: string[]; sop_outline?: string[] };

export const OrganizationMode: React.FC = () => {
  const [context, setContext] = useState({ organization_name: '', industry: '', size: '', locations: '', culture: '', process: '', existing_tools: '' });
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [result, setResult] = useState<GuideResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof typeof context, value: string) => setContext(old => ({ ...old, [key]: value }));
  const ask = async (preset?: string) => {
    const text = (preset || question).trim();
    if (!context.organization_name.trim()) return setError('Add your organisation name before starting the guide.');
    setLoading(true); setError(''); setMessages(old => [...old, { role: 'user', text: text || 'Help me identify the information needed for this SOP.' }]);
    try {
      const response = await fetch('http://localhost:8000/api/v1/organization/guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...context, question: text }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.detail || `HTTP ${response.status}`);
      setResult(data); setMessages(old => [...old, { role: 'assistant', text: data.answer }]); setQuestion('');
    } catch (e: any) { setError(`The local AI guide could not respond: ${e.message}`); }
    finally { setLoading(false); }
  };
  return <div style={{ maxWidth: 1180 }}><div className="page-header"><h2 className="page-title">Organisation mode</h2><p className="page-subtitle">Give the AI real operating context, then co-create an SOP that fits how your team works.</p></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, .9fr) minmax(420px, 1.2fr)', gap: 'var(--space-5)', alignItems: 'start' }}>
      <section className="card card-padding"><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><Building2 size={18} color="var(--color-accent)" /><h3 style={{ margin: 0 }}>Organisation context</h3></div>
        <div className="form-group"><label className="form-label">Organisation name *</label><input className="form-input" value={context.organization_name} onChange={e => update('organization_name', e.target.value)} placeholder="e.g. Acme Payments" /></div>
        <div className="form-group"><label className="form-label">Industry and regulatory area</label><input className="form-input" value={context.industry} onChange={e => update('industry', e.target.value)} placeholder="e.g. fintech, healthcare, e-commerce" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div className="form-group"><label className="form-label">Team size</label><input className="form-input" value={context.size} onChange={e => update('size', e.target.value)} placeholder="e.g. 40" /></div><div className="form-group"><label className="form-label">Locations</label><input className="form-input" value={context.locations} onChange={e => update('locations', e.target.value)} placeholder="e.g. India, remote" /></div></div>
        <div className="form-group"><label className="form-label">Work culture and decision style</label><textarea className="form-textarea" rows={3} value={context.culture} onChange={e => update('culture', e.target.value)} placeholder="Ownership, approvals, escalation preferences, meeting cadence…" /></div>
        <div className="form-group"><label className="form-label">Process to create an SOP for</label><textarea className="form-textarea" rows={3} value={context.process} onChange={e => update('process', e.target.value)} placeholder="What happens today, owners, triggers, outcomes…" /></div>
        <div className="form-group"><label className="form-label">Tools and systems</label><input className="form-input" value={context.existing_tools} onChange={e => update('existing_tools', e.target.value)} placeholder="e.g. Jira, HubSpot, Google Workspace" /></div>
      </section>
      <section className="card card-padding"><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><Sparkles size={18} color="var(--color-accent)" /><h3 style={{ margin: 0 }}>SOP design chat</h3></div><p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>The guide asks for missing details and proposes an SOP outline using your supplied context. It never substitutes demo data.</p>
        <div style={{ minHeight: 230, maxHeight: 380, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 'var(--space-3)', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)' }}>{messages.length === 0 && <div style={{ color: 'var(--text-muted)' }}><MessageSquare size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Start with “What information is missing?”</div>}{messages.map((m, i) => <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '10px 12px', borderRadius: 10, background: m.role === 'user' ? 'var(--color-accent)' : 'var(--bg-surface-raised)', color: m.role === 'user' ? '#fff' : 'var(--text-primary)' }}>{m.text}</div>)}</div>
        {result?.next_questions?.length ? <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{result.next_questions.map(q => <button className="btn btn-secondary btn-sm" key={q} onClick={() => ask(q)}>{q}</button>)}</div> : null}
        {result?.sop_outline?.length ? <div style={{ marginTop: 16 }}><strong>Suggested SOP outline</strong><ol style={{ marginTop: 8 }}>{result.sop_outline.map(part => <li key={part}>{part}</li>)}</ol></div> : null}
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><input className="form-input" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="Ask about this SOP…" /><button className="btn btn-primary" disabled={loading} onClick={() => ask()}>{loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Send</button></div>
      </section></div></div>;
};
