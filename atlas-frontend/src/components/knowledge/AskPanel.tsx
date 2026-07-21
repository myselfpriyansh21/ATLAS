import { useState } from 'react';
import { Send, Loader2, FileSearch } from 'lucide-react';
import { askQuestion, type RagResponse } from '../../lib/api/backendClient';
import { GlassPanel } from '../ui/GlassPanel';

interface QaEntry {
  question: string;
  response: RagResponse;
}

export function AskPanel() {
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QaEntry[]>([]);

  async function handleAsk() {
    const trimmed = question.trim();
    if (trimmed.length < 3 || asking) return;

    setAsking(true);
    setError(null);
    try {
      const response = await askQuestion(trimmed);
      setHistory((h) => [{ question: trimmed, response }, ...h]);
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="space-y-4">
      <GlassPanel>
        <div className="flex items-end gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask about your uploaded documents — e.g. 'Can Boiler-2 operate above 850°C?'"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-white/10 bg-[var(--atlas-panel)] px-3 py-2 text-sm text-[var(--atlas-text-primary)] outline-none placeholder:text-[var(--atlas-text-tertiary)] focus:border-[var(--atlas-accent)]"
          />
          <button
            onClick={handleAsk}
            disabled={asking || question.trim().length < 3}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--atlas-accent-dim)] text-[var(--atlas-accent)] transition-colors hover:bg-[var(--atlas-accent)]/25 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Ask"
          >
            {asking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-[var(--atlas-danger)]">{error}</p>}
      </GlassPanel>

      {history.length === 0 && !asking && (
        <p className="flex items-center gap-2 text-xs text-[var(--atlas-text-tertiary)]">
          <FileSearch size={14} />
          Ask a question above — answers are grounded only in what you've uploaded, with citations.
        </p>
      )}

      {history.map((entry, i) => (
        <GlassPanel key={i}>
          <p className="mb-2 text-sm font-medium text-[var(--atlas-text-primary)]">{entry.question}</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--atlas-text-secondary)]">
            {entry.response.answer}
          </p>
          {entry.response.sources.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
                Sources
              </p>
              {entry.response.sources.map((s, j) => (
                <div key={j} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[var(--atlas-accent)]">{s.filename}</p>
                    <span className="mono-data text-[10px] text-[var(--atlas-text-tertiary)]">
                      {Math.round(s.similarity * 100)}% match
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--atlas-text-tertiary)]">{s.excerpt}</p>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      ))}
    </div>
  );
}