import type { IncomingMessage, ServerResponse } from 'http';

// Vercel entry point: serves the Express API from server/src as one serverless
// function. vercel.json rewrites every /api/* request here and keeps the
// original URL, so the Express routes match unchanged.

type RequestHandler = (req: IncomingMessage, res: ServerResponse) => void;

let expressApp: RequestHandler | undefined;
let ensureDb: (() => Promise<void>) | undefined;

function sendJson(res: ServerResponse, status: number, body: object): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    if (!expressApp) {
      // Imported lazily: config throws when a required env var (e.g. JWT_SECRET) is missing.
      const [{ default: app }, db] = await Promise.all([
        import('../server/src/app'),
        import('../server/src/config/db'),
      ]);
      expressApp = app as unknown as RequestHandler;
      ensureDb = db.ensureDBConnection;
    }
  } catch (err) {
    console.error('API failed to start:', err);
    sendJson(res, 503, { message: err instanceof Error ? err.message : 'API failed to start' });
    return;
  }

  const path = (req.url || '').split('?')[0];
  if (path !== '/api/health') {
    if (!process.env.MONGO_URI) {
      sendJson(res, 503, { message: 'Missing required environment variable: MONGO_URI' });
      return;
    }
    try {
      await ensureDb!();
    } catch (err) {
      console.error('MongoDB connection error:', err);
      sendJson(res, 503, { message: 'Database connection failed' });
      return;
    }
  }

  expressApp(req, res);
}
