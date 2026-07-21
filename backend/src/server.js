import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkDbConnection } from './db.js';
import { verifyAuth } from './middleware/auth.js';
import documentsRouter from './routes/documents.js';
import ragRouter from './routes/rag.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

app.get('/health', async (req, res) => {
  const db = await checkDbConnection();
  res.json({
    status: 'ok',
    database: db,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    requireAuth: process.env.REQUIRE_AUTH !== 'false',
  });
});

app.use('/documents', verifyAuth, documentsRouter);
app.use('/rag', verifyAuth, ragRouter);

// Centralized error handler — anything that throws synchronously in a
// route lands here instead of crashing the process.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ATLAS backend running on http://localhost:${PORT}`);
  console.log(`REQUIRE_AUTH=${process.env.REQUIRE_AUTH !== 'false'}`);
});