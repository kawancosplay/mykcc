import type { IncomingMessage, ServerResponse } from 'node:http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { processSyncPayload } from './sync-form';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const dbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId;

let db: Firestore;
try {
  db = initializeFirestore(app, { ignoreUndefinedProperties: true }, dbId);
} catch {
  db = getFirestore(app, dbId);
}

export interface SheetsSyncState {
  autoSyncEnabled: boolean;
  pollIntervalMs: number;
  lastAttemptAt?: number;
  lastSyncedAt?: number;
  lastSyncResult?: {
    success: boolean;
    processed: number;
    created: number;
    updated: number;
    message?: string;
  };
  spreadsheetId?: string;
  sheetTab?: string;
}

export default async function handler(req: any, res: any) {
  const syncDocRef = doc(db, 'system', 'sheetsSync');

  if (req.method === 'GET' || req.method === 'POST') {
    try {
      const snap = await getDoc(syncDocRef);
      const state: SheetsSyncState = snap.exists()
        ? (snap.data() as SheetsSyncState)
        : {
            autoSyncEnabled: true,
            pollIntervalMs: 300000, // 5 minutes
            lastAttemptAt: Date.now(),
          };

      // Check if sync payload was passed directly via POST
      let syncResult = {
        success: true,
        processed: 0,
        created: 0,
        updated: 0,
        message: 'No payload provided; background heartbeat active.',
      };

      if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
        const payloadRes = await processSyncPayload(req.body);
        syncResult = {
          success: payloadRes.success,
          processed: payloadRes.processed,
          created: payloadRes.created,
          updated: payloadRes.updated,
          message: payloadRes.message,
        };
      }

      // Record sync attempt in Firestore
      const updatedState: SheetsSyncState = {
        ...state,
        lastAttemptAt: Date.now(),
        lastSyncResult: syncResult,
        ...(syncResult.created > 0 || syncResult.updated > 0 ? { lastSyncedAt: Date.now() } : {}),
      };

      await setDoc(syncDocRef, updatedState, { merge: true });

      return res.status(200).json({
        ok: true,
        service: 'MyKCC Autonomous Sheets Sync',
        cronSchedule: '*/5 * * * *',
        state: updatedState,
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
