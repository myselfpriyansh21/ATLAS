import { PDFParse } from 'pdf-parse';

const TEXT_MIME_TYPES = ['text/plain', 'text/markdown'];

/**
 * Extracts plain text from an uploaded file buffer based on its MIME
 * type / extension. Supports .txt, .md, and .pdf — covers the common
 * case for SOPs, manuals, and inspection reports without needing a
 * heavier document-conversion pipeline for a hackathon prototype.
 */
export async function extractText(buffer, mimetype, filename) {
  const isPdf = mimetype === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');
  const isText =
    TEXT_MIME_TYPES.includes(mimetype) ||
    filename.toLowerCase().endsWith('.txt') ||
    filename.toLowerCase().endsWith('.md');

  if (isPdf) {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      // Strip pdf-parse's "-- N of M --" page separator markers
      return result.text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, ' ');
    } finally {
      await parser.destroy();
    }
  }

  if (isText) {
    return buffer.toString('utf-8');
  }

  throw new Error(
    `Unsupported file type for "${filename}". Supported: .txt, .md, .pdf`
  );
}