import { Router } from 'express';
import { getPool, toVectorLiteral } from '../db.js';
import { embedQuery } from '../services/embeddings.js';
import { generateRagAnswer } from '../services/gemini.js';

const router = Router();

// POST /rag/ask — embeds the question, retrieves the closest chunks by
// cosine similarity, then asks Gemini to answer using only those chunks.
router.post('/ask', async (req, res) => {
  const pool = getPool();
  if (!pool) {
    return res.status(503).json({
      error: 'DATABASE_URL not configured on the backend. See backend/README.md to set up Supabase.',
    });
  }

  const { question } = req.body ?? {};
  if (!question || typeof question !== 'string' || question.trim().length < 3) {
    return res.status(400).json({ error: 'Please provide a "question" string of at least 3 characters.' });
  }

  try {
    const queryEmbedding = await embedQuery(question);
    const vectorLiteral = toVectorLiteral(queryEmbedding);

    const result = await pool.query(
      `SELECT dc.content, dc.chunk_index, d.filename, d.id as document_id,
              1 - (dc.embedding <=> $1::vector) as similarity
       FROM document_chunks dc
       JOIN documents d ON d.id = dc.document_id
       ORDER BY dc.embedding <=> $1::vector
       LIMIT 5`,
      [vectorLiteral]
    );

    if (result.rows.length === 0) {
      return res.json({
        answer: "I don't have any documents to search yet — upload something in the Knowledge Center first.",
        sources: [],
      });
    }

    const sources = result.rows.map((row) => ({
      filename: row.filename,
      documentId: row.document_id,
      content: row.content,
      similarity: Math.round(row.similarity * 1000) / 1000,
    }));

    const answer = await generateRagAnswer(question, sources);

    res.json({
      answer,
      sources: sources.map((s) => ({
        filename: s.filename,
        documentId: s.documentId,
        excerpt: s.content.slice(0, 220) + (s.content.length > 220 ? '…' : ''),
        similarity: s.similarity,
      })),
    });
  } catch (err) {
    console.error('RAG error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;