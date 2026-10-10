import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Webhook endpoint for instant Google Form submissions via Apps Script
app.post('/api/sync-form', (req, res) => {
  try {
    const payload = req.body;
    console.log('Received Google Form transition submission:', JSON.stringify(payload));
    res.json({
      success: true,
      message: 'KawanCosplay sync hook received payload successfully',
      receivedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'KawanCosplay Member Portal', time: new Date().toISOString() });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`KawanCosplay Portal running on http://0.0.0.0:${port}`);
  });
}

startServer();
