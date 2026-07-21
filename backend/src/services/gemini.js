/**
 * Wraps Google's Gemini generation API (gemini-3.5-flash) to produce a
 * RAG answer grounded strictly in retrieved document chunks, with
 * citations back to source documents.
 */

const GENERATE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

function buildPrompt(question, sources) {
  const sourceBlocks = sources
    .map((s, i) => `[Source ${i + 1}: ${s.filename}]\n${s.content}`)
    .join('\n\n');

  return `You are ATLAS's Knowledge Center assistant for an industrial plant safety platform.

Answer the question using ONLY the information in the sources below. If the sources don't contain enough information to answer, say so directly rather than guessing.

Cite which source number(s) support each part of your answer, like "(Source 2)".

Sources:
${sourceBlocks}

Question: ${question}

Answer:`;
}

export async function generateRagAnswer(question, sources) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured on the backend');
  }

  const prompt = buildPrompt(question, sources);

  const res = await fetch(GENERATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini generation request failed (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned no answer text — the response may have been blocked by safety filters.');
  }
  return text;
}