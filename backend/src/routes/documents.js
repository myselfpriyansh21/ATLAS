import { Router } from 'express';
import multer from 'multer';
import { getPool, toVectorLiteral } from '../db.js';
import { extractText } from '../services/textExtraction.js';
import { chunkText } from '../services/chunking.js';
import { embedDocumentChunk } from '../services/embeddings.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function requireDb(req, res, next) {
  const pool = getPool();
  if (!pool) {
    return res.status(503).json({
      error: 'DATABASE_URL not configured on the backend. See backend/README.md to set up Supabase.',
    });
  }
  req.pool = pool;
  next();
}

// POST /documents/upload — extract text, chunk, embed each chunk, store
router.post('/upload', requireDb, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded (expected form field name "file")' });
  }

  const { originalname, mimetype, buffer } = req.file;

  try {
    const text = await extractText(buffer, mimetype, originalname);
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      return res.status(400).json({ error: 'No extractable text found in this document.' });
    }

    const client = await req.pool.connect();
    try {
      await client.query('BEGIN');

      const docResult = await client.query(
        `INSERT INTO documents (filename, uploaded_by, chunk_count)
         VALUES ($1, $2, $3)
         RETURNING id, filename, uploaded_at, chunk_count`,
        [originalname, req.user?.email ?? 'unknown', chunks.length]
      );
      const document = docResult.rows[0];

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await embedDocumentChunk(chunks[i]);
        await client.query(
          `INSERT INTO document_chunks (document_id, chunk_index, content, embedding)
           VALUES ($1, $2, $3, $4::vector)`,
          [document.id, i, chunks[i], toVectorLiteral(embedding)]
        );
      }

      await client.query('COMMIT');
      res.json({ document });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /documents — list all uploaded documents
router.get('/', requireDb, async (req, res) => {
  try {
    const result = await req.pool.query(
      `SELECT id, filename, uploaded_at, chunk_count FROM documents ORDER BY uploaded_at DESC`
    );
    res.json({ documents: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /documents/:id — removes document and its chunks (cascade)
router.delete('/:id', requireDb, async (req, res) => {
  try {
    await req.pool.query(`DELETE FROM documents WHERE id = $1`, [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;