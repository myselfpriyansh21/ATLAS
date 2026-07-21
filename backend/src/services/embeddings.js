/**
 * Wraps Google's Gemini embedding API (gemini-embedding-001).
 *
 * Uses task_type to get asymmetric embeddings — documents are embedded
 * as RETRIEVAL_DOCUMENT, queries as RETRIEVAL_QUERY. This is a real
 * quality improvement for RAG retrieval, not just a formality: the two
 * task types produce embeddings optimized for their respective roles in
 * a search/retrieval pair.
 *
 * output_dimensionality is set to 768 — Google's own docs note this
 * gives ~99.7% of the quality of the full 3072-dim embedding at a
 * quarter of the storage, which is why the Postgres schema uses
 * vector(768).
 */

const EMBED_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent';
const EMBED_DIMENSIONS = 768;

async function embed(text, taskType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured on the backend');
  }

  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: EMBED_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini embedding request failed (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  return data.embedding.values;
}

export function embedDocumentChunk(text) {
  return embed(text, 'RETRIEVAL_DOCUMENT');
}

export function embedQuery(text) {
  return embed(text, 'RETRIEVAL_QUERY');
}

export { EMBED_DIMENSIONS };