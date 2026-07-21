/**
 * Splits text into overlapping chunks suitable for embedding + retrieval.
 * Tries to break on sentence boundaries so chunks read naturally rather
 * than cutting mid-sentence.
 */
export function chunkText(text, { chunkSize = 900, overlap = 150 } = {}) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);

    if (end < clean.length) {
      const lastPeriod = clean.lastIndexOf('. ', end);
      if (lastPeriod > start + chunkSize * 0.5) {
        end = lastPeriod + 1;
      }
    }

    const chunk = clean.slice(start, end).trim();
    if (chunk.length > 20) chunks.push(chunk);

    if (end >= clean.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}