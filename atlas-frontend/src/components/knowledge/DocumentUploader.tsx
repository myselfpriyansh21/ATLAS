import { useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { uploadDocument } from '../../lib/api/backendClient';

interface DocumentUploaderProps {
  onUploaded: () => void;
}

export function DocumentUploader({ onUploaded }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      await uploadDocument(file);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        isDragging ? 'border-[var(--atlas-accent)] bg-[var(--atlas-accent-dim)]' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      {uploading ? (
        <Loader2 size={22} className="animate-spin text-[var(--atlas-accent)]" />
      ) : (
        <UploadCloud size={22} className="text-[var(--atlas-text-tertiary)]" />
      )}
      <p className="mt-2 text-sm text-[var(--atlas-text-secondary)]">
        {uploading ? 'Uploading and embedding…' : 'Drop a file here, or click to browse'}
      </p>
      <p className="mt-1 text-xs text-[var(--atlas-text-tertiary)]">.txt, .md, .pdf</p>
      {error && <p className="mt-2 text-xs text-[var(--atlas-danger)]">{error}</p>}
    </div>
  );
}