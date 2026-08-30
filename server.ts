import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api';
import { generalApiRateLimiter } from './server/middleware/rateLimit';
import { setupLiveVoiceServer } from './server/services/liveVoiceService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Initialize Gemini Live Voice WebSocket handler
  setupLiveVoiceServer(server);

  // Disable server identification header
  app.disable('x-powered-by');

  // Enterprise Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
    next();
  });

  // Global Body Parsers with strict size limits
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API Health Endpoint (Anonymous permitted for monitoring)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Rate Limiter & REST API Routes
  app.use('/api', generalApiRateLimiter, apiRouter);

  // Global Safe Error Handler for API routes
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Server Error]:', err.message || err);
    // Never expose stack traces or internal DB errors to client
    const status = typeof err.status === 'number' ? err.status : 500;
    const message = status === 400 || status === 401 || status === 403 || status === 404
      ? err.message
      : 'An unexpected server error occurred. Please try again later.';
    res.status(status).json({ error: message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Candidate Intelligence Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to boot Candidate Intelligence Server:', err);
});
