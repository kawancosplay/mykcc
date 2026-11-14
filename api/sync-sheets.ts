import firebaseConfig from '../firebase-applet-config.json';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET' || req.method === 'POST') {
    try {
      const { projectId, apiKey, firestoreDatabaseId } = firebaseConfig as Record<string, string>;
      const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/system/sheetsSync?key=${apiKey}`;

      const now = Date.now();
      const state = {
        autoSyncEnabled: true,
        pollIntervalMs: 300000,
        lastAttemptAt: now,
        status: 'active',
      };

      // Read current state via Firestore REST API
      try {
        const readRes = await fetch(docUrl);
        if (readRes.ok) {
          const docData = await readRes.json();
          if (docData && docData.fields) {
            state.autoSyncEnabled = docData.fields.autoSyncEnabled?.booleanValue ?? true;
            state.pollIntervalMs = Number(docData.fields.pollIntervalMs?.integerValue ?? 300000);
          }
        }
      } catch (readErr) {
        console.warn('Could not read existing sheetsSync doc via REST:', readErr);
      }

      // Update state via Firestore REST API (patch)
      const patchBody = {
        fields: {
          autoSyncEnabled: { booleanValue: state.autoSyncEnabled },
          pollIntervalMs: { integerValue: String(state.pollIntervalMs) },
          lastAttemptAt: { integerValue: String(now) },
          status: { stringValue: 'active' },
          updatedAt: { timestampValue: new Date(now).toISOString() },
        },
      };

      try {
        await fetch(docUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchBody),
        });
      } catch (writeErr) {
        console.warn('Could not update sheetsSync doc via REST:', writeErr);
      }

      return res.status(200).json({
        ok: true,
        service: 'MyKCC Autonomous Sheets Sync',
        mode: 'rest-heartbeat',
        timestamp: now,
        state,
      });
    } catch (err: unknown) {
      console.error('Autonomous sync error in /api/sync-sheets:', err);
      return res.status(500).json({
        ok: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
