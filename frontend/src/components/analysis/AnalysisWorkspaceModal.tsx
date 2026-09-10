import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Circle, Cpu, ShieldCheck, StopCircle, X } from 'lucide-react';
import { AnalysisStreamEvent, GapDetectionItem, ModelStatus, PipelineStage, PipelineStageConfig, SemanticMatchItem, StageStatus } from './types';
import './AnalysisWorkspaceModal.css';

interface Props { isOpen: boolean; onClose: () => void; sopTitle: string; sopText: string; loadDocumentText?: () => Promise<string>; requirementQuery?: string; onComplete?: (summary: any) => void }
const STAGES: PipelineStageConfig[] = [
  { id: 'DOCUMENT_RECEIVED', label: 'SOP loaded', description: 'Using the uploaded document', weightProgress: 10 },
  { id: 'TEXT_CHUNKING', label: 'Evidence retrieval', description: 'Finding relevant SOP passages', weightProgress: 25 },
  { id: 'REGULATORY_VERIFICATION', label: 'Local model check', description: 'Checking the LM Studio connection', weightProgress: 35 },
  { id: 'SEMANTIC_MATCHING', label: 'Semantic matching', description: 'Ranking evidence with the trained model', weightProgress: 55 },
  { id: 'GAP_DETECTION', label: 'Issue analysis', description: 'Identifying gaps and practical changes', weightProgress: 82 },
  { id: 'CONFLICT_DETECTION', label: 'Consistency analysis', description: 'Checking incompatible procedures', weightProgress: 92 },
  { id: 'COMPLETED', label: 'Findings ready', description: 'Review evidence and recommendations', weightProgress: 100 },
];
const initialStatuses = (): Record<PipelineStage, StageStatus> => ({ DOCUMENT_RECEIVED: 'RUNNING', TEXT_EXTRACTION: 'PENDING', TEXT_CHUNKING: 'PENDING', REGULATORY_SEARCH: 'PENDING', REGULATORY_VERIFICATION: 'PENDING', SEMANTIC_MATCHING: 'PENDING', GAP_DETECTION: 'PENDING', CONFLICT_DETECTION: 'PENDING', COMPLETED: 'PENDING', FAILED: 'PENDING' });

export const AnalysisWorkspaceModal: React.FC<Props> = ({ isOpen, onClose, sopTitle, sopText, loadDocumentText, requirementQuery = '', onComplete }) => {
  const [activeStage, setActiveStage] = useState<PipelineStage>('DOCUMENT_RECEIVED');
  const [statuses, setStatuses] = useState(initialStatuses);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Connecting to the local analysis service…');
  const [model, setModel] = useState<ModelStatus>({ model: 'LM Studio', available: false, is_loaded: false, status: 'UNAVAILABLE' });
  const [matches, setMatches] = useState<SemanticMatchItem[]>([]);
  const [findings, setFindings] = useState<GapDetectionItem[]>([]);
  const [summary, setSummary] = useState('');
  const cancelled = useRef(false); const started = useRef(false);

  useEffect(() => {
    if (!isOpen) { started.current = false; return; }
    if (started.current) return;
    started.current = true; cancelled.current = false; setStatuses(initialStatuses()); setFindings([]); setMatches([]); setSummary(''); void stream();
  }, [isOpen, sopTitle, sopText, requirementQuery]);

  const fail = (text: string) => { setActiveStage('FAILED'); setMessage(text); setStatuses(previous => ({ ...previous, [activeStage]: 'FAILED' })); };
  const stream = async () => {
    try {
      const documentText = loadDocumentText ? await loadDocumentText() : sopText;
      const response = await fetch('/ai-api/api/v1/analyze/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document_title: sopTitle, text: documentText, requirement_query: requirementQuery }) });
      if (!response.ok || !response.body) throw new Error(`service returned HTTP ${response.status}`);
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
      while (!cancelled.current) {
        const next = await reader.read(); if (next.done) break;
        buffer += decoder.decode(next.value, { stream: true }); const events = buffer.split('\n\n'); buffer = events.pop() || '';
        for (const raw of events) if (raw.startsWith('data: ')) handleEvent(JSON.parse(raw.slice(6)));
      }
      await reader.cancel();
    } catch (error: any) { fail(`The AI analysis service could not be reached (${error.message}). Start or rebuild the ai-service, then try again.`); }
  };
  const handleEvent = (event: AnalysisStreamEvent) => {
    if (cancelled.current) return;
    setActiveStage(event.stage); setProgress(event.progress); setMessage(event.message); setStatuses(previous => ({ ...previous, [event.stage]: event.status }));
    if (event.metadata?.modelInfo) setModel(event.metadata.modelInfo);
    if (event.metadata?.matches) setMatches(event.metadata.matches);
    if (event.metadata?.gaps) setFindings(event.metadata.gaps);
    const conflicts = event.metadata?.conflicts as GapDetectionItem[] | undefined;
    if (conflicts) setFindings(previous => [...previous, ...conflicts.map(f => ({ ...f, requirement: `Conflict: ${f.requirement}` }))]);
    if (event.metadata?.summary) { setSummary(event.metadata.summary.assessment || ''); onComplete?.(event.metadata.summary); }
  };
  const cancel = () => { cancelled.current = true; fail('Analysis cancelled. No incomplete findings were retained.'); };
  if (!isOpen) return null;

  return (
    <div className="align-workspace-overlay"><div className="align-workspace-container" aria-label="SOP analysis">
    <header className="align-workspace-header"><div className="align-workspace-title-group"><div className="align-workspace-icon-badge"><ShieldCheck size={20} /></div><div><div className="align-workspace-title">Analyzing SOP <span style={{ color: '#a5b4fc' }}>· {sopTitle}</span></div><div className="align-workspace-subtitle">Evidence-based analysis from your local models</div></div></div><div className="align-workspace-controls"><div className="align-model-badge"><Cpu size={14} />{model.status === 'READY' ? model.model : 'Checking local model'}</div><button onClick={cancel} className="align-cancel-btn"><StopCircle size={15} /> Stop</button><button onClick={onClose} className="align-close-btn" aria-label="Close"><X size={18} /></button></div></header>
    <div className="align-progress-track"><div className="align-progress-fill" style={{ width: `${progress}%` }} /></div>
    <div className="align-workspace-grid"><aside className="align-timeline-panel"><div className="align-timeline-heading">Analysis progress</div><div className="align-timeline-list">{STAGES.map((stage, index) => { const status = statuses[stage.id]; return <div className="align-timeline-item" key={stage.id}>{index < STAGES.length - 1 && <div className={`align-timeline-connector ${status === 'COMPLETED' ? 'completed' : ''}`} />}<div className={`align-timeline-node ${status === 'COMPLETED' ? 'completed' : status === 'RUNNING' ? 'running' : 'pending'}`}>{status === 'COMPLETED' ? <Check size={13} /> : <Circle size={8} />}</div><div className="align-timeline-content"><div className="align-timeline-label-row"><span className={`align-timeline-label ${status === 'RUNNING' ? 'active' : status === 'COMPLETED' ? 'done' : ''}`}>{stage.label}</span></div><div className="align-timeline-desc">{stage.description}</div></div></div>; })}</div></aside>
      <main className="align-activity-panel"><div className="align-current-step-card"><div className="align-step-meta"><span className="align-step-indicator"><span className="align-pulse-dot" />{activeStage === 'FAILED' ? 'Action needed' : 'Live analysis'}</span><span>{progress}%</span></div><div className="align-step-message">{message}</div></div>
        {summary && <section className="align-results-card"><div className="align-section-header"><span><ShieldCheck size={16} /> Assessment</span></div><p>{summary}</p></section>}
        {matches.length > 0 && <section className="align-results-card"><div className="align-section-header"><span><ShieldCheck size={16} /> Relevant SOP evidence</span><span>{matches.length} passages</span></div>{matches.map((m, i) => <article className="align-match-item" key={i}><strong>{m.status} · {Math.round(m.similarityScore * 100)}% similarity</strong><span>{m.sopSection}</span><p>{m.excerpt}</p></article>)}</section>}
        {findings.length > 0 && <section className="align-results-card"><div className="align-section-header"><span><AlertTriangle size={16} /> Issues and recommended SOP changes</span><span>{findings.length} findings</span></div>{findings.map((f, i) => <article className="align-gap-item" key={i}><strong>{f.requirement}</strong><p>{f.finding}</p>{(f as any).evidence && <small>Evidence: {(f as any).evidence}</small>}<p><b>Recommended change:</b> {f.recommendation}</p></article>)}</section>}
      </main></div>
    </div></div>
  );
};
