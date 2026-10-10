// Vercel serverless version of the `/api/sync-form` route in server.ts.
// (server.ts only runs locally / on Node hosts; Vercel serves `dist` statically.)
export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    console.log('Received Google Form transition submission:', JSON.stringify(req.body));
    res.status(200).json({
      success: true,
      message: 'KawanCosplay sync hook received payload successfully',
      receivedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
