import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ShieldCheck, AlertTriangle, CheckSquare, X, Loader2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getSOPs } from '../api/sops';
import { getRegulations } from '../api/regulations';
import { getFindings } from '../api/findings';
import { getRemediations } from '../api/remediations';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface ResultItem {
  id: string;
  type: 'sop' | 'regulation' | 'finding' | 'remediation';
  title: string;
  subtitle?: string;
  url: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  sop:         <FileText    size={15} />,
  regulation:  <ShieldCheck size={15} />,
  finding:     <AlertTriangle size={15} />,
  remediation: <CheckSquare  size={15} />,
};

const TYPE_LABELS: Record<string, string> = {
  sop: 'SOP', regulation: 'Regulation', finding: 'Finding', remediation: 'Remediation',
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim() || !currentOrganization) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => search(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query, currentOrganization]);

  const search = async (q: string) => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const [sopsData, regsData, findingsData, remediationsData] = await Promise.allSettled([
        getSOPs(currentOrganization.id, undefined, undefined),
        getRegulations(currentOrganization.id, q, undefined, undefined, undefined, 0, 5),
        getFindings(currentOrganization.id, q, undefined, undefined, undefined, undefined, undefined, 0, 5),
        getRemediations(),
      ]);

      const items: ResultItem[] = [];

      if (sopsData.status === 'fulfilled') {
        sopsData.value
          .filter(s => s.title.toLowerCase().includes(q.toLowerCase()) || s.department?.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 4)
          .forEach(s => items.push({ id: s.id, type: 'sop', title: s.title, subtitle: s.department, url: `/sops/${s.id}` }));
      }
      if (regsData.status === 'fulfilled') {
        (regsData.value.content || []).slice(0, 4).forEach(r =>
          items.push({ id: r.id, type: 'regulation', title: r.title, subtitle: r.authority, url: `/regulations/${r.id}` }));
      }
      if (findingsData.status === 'fulfilled') {
        (findingsData.value.content || []).slice(0, 3).forEach(f =>
          items.push({ id: f.id, type: 'finding', title: f.title, subtitle: f.severity, url: `/findings/${f.id}` }));
      }
      if (remediationsData.status === 'fulfilled') {
        remediationsData.value
          .filter(t => t.title.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 3)
          .forEach(t => items.push({ id: t.id, type: 'remediation', title: t.title, subtitle: t.status, url: `/remediations` }));
      }

      setResults(items);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback((item: ResultItem) => {
    navigate(item.url);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) { handleSelect(results[selected]); }
    if (e.key === 'Escape') { onClose(); }
  };

  if (!open) return null;

  return (
    <div className="command-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="command-card" onClick={e => e.stopPropagation()}>
        <div className="command-input-wrap">
          {loading
            ? <Loader2 size={18} color="var(--text-muted)" className="animate-spin" />
            : <Search size={18} color="var(--text-muted)" />
          }
          <input
            ref={inputRef}
            className="command-input"
            placeholder="Search SOPs, regulations, findings…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="header-icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="command-results">
          {!currentOrganization && (
            <div className="command-empty">Select an organization first to search</div>
          )}
          {currentOrganization && !query && (
            <div className="command-empty" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              Start typing to search across your workspace
            </div>
          )}
          {currentOrganization && query && results.length === 0 && !loading && (
            <div className="command-empty">No results for "{query}"</div>
          )}
          {results.length > 0 && (() => {
            const grouped = results.reduce<Record<string, ResultItem[]>>((acc, item) => {
              (acc[item.type] ??= []).push(item);
              return acc;
            }, {});
            return Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className="command-section-label">{TYPE_LABELS[type]}s</div>
                {items.map((item) => {
                  const globalIdx = results.indexOf(item);
                  return (
                    <div
                      key={item.id}
                      className={`command-item${globalIdx === selected ? ' selected' : ''}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelected(globalIdx)}
                    >
                      <span className="command-item-icon">{TYPE_ICONS[item.type]}</span>
                      <div className="command-item-text">
                        <div className="command-item-title">{item.title}</div>
                        {item.subtitle && <div className="command-item-sub">{item.subtitle}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};
