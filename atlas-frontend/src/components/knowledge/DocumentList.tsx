import { FileText, Trash2 } from 'lucide-react';
import type { DocumentMeta } from '../../lib/api/backendClient';

interface DocumentListProps {
  documents: DocumentMeta[];
  onDelete: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return <p className="text-sm text-[var(--atlas-text-tertiary)]">No documents uploaded yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
        >
          <FileText size={16} className="shrink-0 text-[var(--atlas-accent)]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{doc.filename}</p>
            <p className="text-xs text-[var(--atlas-text-tertiary)]">
              {doc.chunk_count} chunk{doc.chunk_count === 1 ? '' : 's'} ·{' '}
              {new Date(doc.uploaded_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => onDelete(doc.id)}
            className="shrink-0 text-[var(--atlas-text-tertiary)] transition-colors hover:text-[var(--atlas-danger)]"
            aria-label={`Delete ${doc.filename}`}
          >
            <Trash2 size={15} />
          </button>
        </li>
      ))}
    </ul>
  );
}