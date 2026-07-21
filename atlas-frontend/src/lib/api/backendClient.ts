import { auth } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface DocumentMeta {
  id: string;
  filename: string;
  uploaded_at: string;
  chunk_count: number;
}

export interface RagSource {
  filename: string;
  documentId: string;
  excerpt: string;
  similarity: number;
}

export interface RagResponse {
  answer: string;
  sources: RagSource[];
}

export interface BackendHealth {
  ok: boolean;
  database?: boolean;
  gemini?: boolean;
}

export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, database: data.database?.connected, gemini: data.geminiConfigured };
  } catch {
    return { ok: false };
  }
}

export async function uploadDocument(file: File): Promise<DocumentMeta> {
  const headers = await getAuthHeaders();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data.document;
}

export async function listDocuments(): Promise<DocumentMeta[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/documents`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Failed to list documents (${res.status})`);
  return data.documents;
}

export async function deleteDocument(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, { method: 'DELETE', headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to delete document (${res.status})`);
  }
}

export async function askQuestion(question: string): Promise<RagResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/rag/ask`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    signal: AbortSignal.timeout(30_000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Question failed (${res.status})`);
  return data;
}

export { API_BASE_URL };