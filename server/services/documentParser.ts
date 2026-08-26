import path from 'path';
import mammoth from 'mammoth';

/**
 * Sanitizes original filename to prevent path traversal or null byte injection.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'document.txt';
  // Remove path traversal characters, directory separators, and control characters
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Extracts plain text from uploaded document buffer based on MIME / file extension.
 * Never fabricates data if parsing fails.
 */
export async function parseDocumentBuffer(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<{ text: string; pageCount?: number; detectedType: string; format: string; safeFilename: string }> {
  const safeFilename = sanitizeFilename(originalFilename);
  const ext = path.extname(safeFilename).toLowerCase();

  // Validate File Size (max 10MB)
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('File size exceeds maximum allowed limit of 10MB.');
  }

  if (buffer.length === 0) {
    throw new Error('Document buffer is empty (0 bytes).');
  }

  // Plain Text / Markdown / JSON
  if (ext === '.txt' || ext === '.md' || ext === '.json' || mimetype.includes('text/plain')) {
    const text = buffer.toString('utf-8');
    if (!text.trim()) {
      throw new Error('Document contains no readable text content.');
    }
    return {
      text,
      pageCount: 1,
      detectedType: 'Text/Markdown Document',
      format: 'txt',
      safeFilename,
    };
  }

  // PDF Ingestion
  if (ext === '.pdf' || mimetype.includes('application/pdf')) {
    try {
      const pdfParseModule: any = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text ? pdfData.text.trim() : '';

      if (!text || text.length < 10) {
        throw new Error('Extracted PDF content was empty or contains only non-selectable raster imagery.');
      }

      return {
        text,
        pageCount: pdfData.numpages || 1,
        detectedType: `PDF Document (${pdfData.numpages || 1} pages)`,
        format: 'pdf',
        safeFilename,
      };
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      throw new Error(`Failed to parse PDF document: ${err.message || 'Corrupted or password-protected PDF.'}`);
    }
  }

  // DOCX / Word Document using mammoth structured extraction
  if (ext === '.docx' || mimetype.includes('wordprocessingml') || mimetype.includes('vnd.openxmlformats-officedocument')) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value ? result.value.trim() : '';

      if (!text || text.length < 10) {
        throw new Error('Extracted DOCX document was empty or contains only unreadable embedded media.');
      }

      return {
        text,
        pageCount: 1,
        detectedType: 'DOCX Word Document',
        format: 'docx',
        safeFilename,
      };
    } catch (err: any) {
      console.error('DOCX parsing error:', err);
      throw new Error(`Failed to parse DOCX document: ${err.message || 'Invalid or corrupted DOCX archive.'}`);
    }
  }

  // Unsupported format
  throw new Error(`Unsupported document format '${ext || mimetype}'. Please provide .pdf, .docx, .txt, or .md.`);
}

