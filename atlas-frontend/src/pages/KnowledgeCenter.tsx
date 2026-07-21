import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import { DocumentUploader } from '../components/knowledge/DocumentUploader';
import { DocumentList } from '../components/knowledge/DocumentList';
import { AskPanel } from '../components/knowledge/AskPanel';
import {
  checkBackendHealth,
  listDocuments,
  deleteDocument,
  type DocumentMeta,
  API_BASE_URL,
} from '../lib/api/backendClient';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export default function KnowledgeCenter() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [geminiReady, setGeminiReady] = useState(false);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [docsError, setDocsError] = useState<string | null>(null);

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      setDocsError(null);
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : 'Failed to load documents');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const health = await checkBackendHealth();
      if (cancelled) return;
      setBackendOnline(health.ok);
      setDbReady(Boolean(health.database));
      setGeminiReady(Boolean(health.gemini));
      if (health.ok && health.database) refreshDocuments();
    }
    check();
    const handle = setInterval(check, 6000);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [refreshDocuments]);

  async function handleDelete(id: string) {
    try {
      await deleteDocument(id);
      refreshDocuments();
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  }

  const ready = backendOnline && dbReady;

  return (
    <AppShell
      title="Knowledge Center"
      description="Upload documents, ask questions, get cited answers"
    >
      <div className="mb-4 flex items-center gap-2 text-xs">
        {backendOnline === null ? (
          <span className="text-[var(--atlas-text-tertiary)]">Checking backend…</span>
        ) : backendOnline ? (
          <span className="flex items-center gap-1.5 text-[var(--atlas-safe)]">
            <Wifi size={14} /> Backend connected — {API_BASE_URL}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[var(--atlas-danger)]">
            <WifiOff size={14} /> Backend offline
          </span>
        )}
      </div>

      {!ready && (
        <GlassPanel className="mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--atlas-warn)]" />
            <div>
              <p className="text-sm font-medium">
                {backendOnline === false ? "Can't reach the backend" : 'Backend needs configuring'}
              </p>
              <p className="mt-1 text-xs text-[var(--atlas-text-secondary)]">
                {backendOnline === false
                  ? 'Start it in a separate terminal from the backend folder:'
                  : !dbReady
                    ? 'The backend is running but DATABASE_URL is not configured yet — see backend/README.md.'
                    : ''}
              </p>
              {backendOnline === false && (
                <pre className="mono-data mt-2 rounded-lg border border-white/10 bg-black/30 p-2.5 text-xs text-[var(--atlas-text-primary)]">
{`cd backend
npm run dev`}
                </pre>
              )}
              {backendOnline && !geminiReady && (
                <p className="mt-2 text-xs text-[var(--atlas-warn)]">
                  Note: GEMINI_API_KEY also isn't set — uploads will fail at the embedding step until it is.
                </p>
              )}
            </div>
          </div>
        </GlassPanel>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <GlassPanel>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
              Upload a Document
            </p>
            <DocumentUploader onUploaded={refreshDocuments} />
          </GlassPanel>

          <GlassPanel>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
              Documents
            </p>
            {docsError && <p className="mb-2 text-xs text-[var(--atlas-danger)]">{docsError}</p>}
            <DocumentList documents={documents} onDelete={handleDelete} />
          </GlassPanel>
        </div>

        <AskPanel />
      </div>
    </AppShell>
  );
}