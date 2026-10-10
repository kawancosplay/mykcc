// Vercel serverless version of the `/api/health` route in server.ts.
export default function handler(_req: any, res: any) {
  res.status(200).json({ status: 'ok', app: 'KawanCosplay Member Portal', time: new Date().toISOString() });
}
