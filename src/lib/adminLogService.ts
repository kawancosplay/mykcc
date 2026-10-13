import {
  collection,
  doc,
  getDocsFromServer,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  type DocumentReference,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { auth, db, getCachedTokenEmail, getTokenEmail, requireAdminUser } from './firebase';
import type {
  AdminLogAction,
  AdminLogCursor,
  AdminLogEntry,
  AdminLogInput,
  AdminLogTargetType,
} from '../types';
import { translate } from '../i18n';

export type { AdminLogCursor } from '../types';

// Admin audit log: append-only, admin read (firestore.rules /adminLogs). Written by the acting admin's
// client, so it is an accountability aid, not tamper-proof auditing (that would need a server).
// Privacy: targetLabel = cosname / photo title only, details = field NAMES or counts. Never phone,
// email, birthday or other personal values of members (every admin reads the log).
export const ADMIN_LOGS_COLLECTION = 'adminLogs';

const ADMIN_LOG_ACTIONS: readonly AdminLogAction[] = [
  'admin_added',
  'admin_removed',
  'photo_deleted',
  'member_deleted',
  'member_edited',
  'member_unlinked',
  'member_status_changed',
  'password_reset_sent',
  'kcc_id_migration',
  'kcc_id_repair',
  'registration_dates_fixed',
  'duplicates_merged',
  'sheets_import',
  'dashboard_lock_set',
  'dashboard_lock_cleared',
];
const ADMIN_LOG_TARGET_TYPES: readonly AdminLogTargetType[] = ['member', 'admin', 'photo', 'settings', 'bulk'];
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

function clip(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

/**
 * For batches: a new adminLogs ref + rules-valid data (firestore.rules isValidAdminLog). The id is
 * `log_<ms>_<rand6>`. actorEmail = the ID token's email claim cached by requireAdminUser / getTokenEmail
 * (the rules compare it byte for byte; a mismatch would reject the whole batch), omitted when unknown.
 * Throws when nobody is signed in.
 */
export function buildAdminLog(input: AdminLogInput): { ref: DocumentReference; data: Record<string, unknown> } {
  const user = auth.currentUser;
  if (!user) throw new Error(translate('errors.signInRequired'));

  const ref = doc(
    db,
    ADMIN_LOGS_COLLECTION,
    `log_${Date.now()}_${Math.random().toString(36).slice(2, 8).padEnd(6, '0')}`
  );
  const data: Record<string, unknown> = {
    action: input.action,
    actorUid: user.uid,
    at: serverTimestamp(),
  };

  const actorEmail = getCachedTokenEmail(user.uid);
  if (actorEmail) data.actorEmail = actorEmail;
  if (input.targetType && ADMIN_LOG_TARGET_TYPES.includes(input.targetType)) data.targetType = input.targetType;
  const targetId = clip(input.targetId, 128);
  if (targetId) data.targetId = targetId;
  const targetLabel = clip(input.targetLabel, 120);
  if (targetLabel) data.targetLabel = targetLabel;
  const details = clip(input.details, 1000);
  if (details) data.details = details;
  if (typeof input.count === 'number' && Number.isFinite(input.count)) {
    data.count = Math.max(0, Math.floor(input.count));
  }

  return { ref, data };
}

/** Standalone best-effort log write: returns false (and console.warns) on failure, never throws. */
export async function writeAdminLog(input: AdminLogInput): Promise<boolean> {
  try {
    await getTokenEmail(auth.currentUser);
    const { ref, data } = buildAdminLog(input);
    await setDoc(ref, data);
    return true;
  } catch (error) {
    console.warn(`Admin log "${input.action}" could not be written:`, error);
    return false;
  }
}

function timestampToIso(value: unknown): string | null {
  if (value && typeof value === 'object' && typeof (value as { toDate?: unknown }).toDate === 'function') {
    try {
      const date = (value as { toDate: () => Date }).toDate();
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  }
  if (typeof value === 'string' && value) return value;
  return null;
}

function toAdminLogEntry(snap: QueryDocumentSnapshot): AdminLogEntry {
  const data = snap.data() as Record<string, unknown>;
  const entry: AdminLogEntry = {
    id: snap.id,
    action: (typeof data.action === 'string' ? data.action : '') as AdminLogAction,
    actorUid: typeof data.actorUid === 'string' ? data.actorUid : '',
    at: timestampToIso(data.at),
  };
  if (typeof data.actorEmail === 'string' && data.actorEmail) entry.actorEmail = data.actorEmail;
  if (typeof data.targetType === 'string' && ADMIN_LOG_TARGET_TYPES.includes(data.targetType as AdminLogTargetType)) {
    entry.targetType = data.targetType as AdminLogTargetType;
  }
  if (typeof data.targetId === 'string' && data.targetId) entry.targetId = data.targetId;
  if (typeof data.targetLabel === 'string' && data.targetLabel) entry.targetLabel = data.targetLabel;
  if (typeof data.details === 'string' && data.details) entry.details = data.details;
  if (typeof data.count === 'number' && Number.isFinite(data.count)) entry.count = data.count;
  return entry;
}

/** True for the actions the rules accept (the UI shows unknown actions as raw strings). */
export function isKnownAdminLogAction(action: string): action is AdminLogAction {
  return (ADMIN_LOG_ACTIONS as readonly string[]).includes(action);
}

/**
 * Admin: audit log entries, newest first (orderBy('at','desc'), limit(pageSize + 1) + startAfter(cursor)),
 * read from the server. Throws on read errors (permission-denied = the sprint-3 rules are not published yet).
 */
export async function listAdminLogs(options?: {
  pageSize?: number;
  cursor?: AdminLogCursor | null;
}): Promise<{ entries: AdminLogEntry[]; cursor: AdminLogCursor | null; hasMore: boolean }> {
  await requireAdminUser();
  const pageSize = Math.max(1, Math.min(MAX_PAGE_SIZE, Math.floor(options?.pageSize || DEFAULT_PAGE_SIZE)));
  const cursorSnap = (options?.cursor ?? null) as unknown as QueryDocumentSnapshot | null;

  const q = cursorSnap
    ? query(collection(db, ADMIN_LOGS_COLLECTION), orderBy('at', 'desc'), startAfter(cursorSnap), limit(pageSize + 1))
    : query(collection(db, ADMIN_LOGS_COLLECTION), orderBy('at', 'desc'), limit(pageSize + 1));
  const snap = await getDocsFromServer(q);

  const docs = snap.docs.slice(0, pageSize);
  const last = docs.length > 0 ? docs[docs.length - 1] : null;
  return {
    entries: docs.map(toAdminLogEntry),
    cursor: last ? (last as unknown as AdminLogCursor) : (options?.cursor ?? null),
    hasMore: snap.docs.length > pageSize,
  };
}
