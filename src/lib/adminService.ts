import { collection, doc, getDocFromServer, getDocsFromServer, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db, getCachedTokenEmail, isMainAdminUser, requireAdminUser } from './firebase';
import { buildAdminLog } from './adminLogService';
import { MAIN_ACCOUNT_EMAIL } from './idGenerator';
import type { AdminEntry, Member } from '../types';
import { translate } from '../i18n';

// Admin registry (requirements #1): any admin may add or remove admins; the main account
// (verified cosplaysehat@gmail.com) is admin by email, has no doc and can never be removed.
// firestore.rules: create = strict schema bound to a member doc whose authUid is the new admin's uid,
// no update, delete by any admin, list/get for admins. The new admin's client notices on its next
// admin check (reload / sign in again); a removed admin loses database access immediately.
export const ADMINS_COLLECTION = 'admins';

const ADMIN_EMAIL_MAX = 120;
const ADMIN_NAME_MAX = 80;

function timestampToIso(value: unknown): string | null {
  if (value && typeof value === 'object' && typeof (value as { toDate?: unknown }).toDate === 'function') {
    try {
      const date = (value as { toDate: () => Date }).toDate();
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  }
  if (typeof value === 'string' && value && !isNaN(Date.parse(value))) return new Date(value).toISOString();
  return null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Normalizes an admins/{uid} doc of any shape (console-created docs are `legacy`). */
function toAdminEntry(uid: string, data: Record<string, unknown>): AdminEntry {
  const hasTimestamp =
    !!data.addedAt && typeof data.addedAt === 'object' && typeof (data.addedAt as { toDate?: unknown }).toDate === 'function';
  const entry: AdminEntry = {
    uid,
    addedAt: timestampToIso(data.addedAt),
    legacy: !(text(data.memberId) && text(data.addedBy) && hasTimestamp),
  };
  if (text(data.memberId)) entry.memberId = text(data.memberId);
  if (text(data.email)) entry.email = text(data.email);
  if (text(data.name)) entry.name = text(data.name);
  if (text(data.addedBy)) entry.addedBy = text(data.addedBy);
  if (text(data.addedByEmail)) entry.addedByEmail = text(data.addedByEmail);
  return entry;
}

function isMainAccountEmail(email: unknown): boolean {
  return text(email).toLowerCase() === MAIN_ACCOUNT_EMAIL;
}

/**
 * Admin: every admins/{uid} doc from the server, oldest first (docs without addedAt first, then by uid).
 * The main account is NOT in the list: the UI shows it as a fixed, non-removable first row.
 * Throws on read errors (permission-denied = the sprint-3 rules are not published yet).
 */
export async function listAdmins(): Promise<AdminEntry[]> {
  const me = await requireAdminUser();
  const snap = await getDocsFromServer(collection(db, ADMINS_COLLECTION));
  const mainUid = isMainAdminUser(me) ? me.uid : null;
  return snap.docs
    .map((d) => toAdminEntry(d.id, d.data() as Record<string, unknown>))
    .filter((entry) => entry.uid !== mainUid && !isMainAccountEmail(entry.email))
    .sort((a, b) => {
      const aAt = a.addedAt ? Date.parse(a.addedAt) : -Infinity;
      const bAt = b.addedAt ? Date.parse(b.addedAt) : -Infinity;
      if (aAt !== bAt) return aAt < bAt ? -1 : 1;
      return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
    });
}

/**
 * Admin: makes the member's login (member.authUid) an admin. One batch: admins/{uid} + admin_added log.
 * Throws errors.adminNeedsSignIn (never signed in), errors.adminIsMainAccount, errors.adminAlreadyAdmin.
 */
export async function addAdmin(member: Member): Promise<AdminEntry> {
  const me = await requireAdminUser();
  const uid = text(member?.authUid);
  if (!member || !uid) {
    throw new Error(translate('errors.adminNeedsSignIn'));
  }
  if (isMainAccountEmail(member.email) || (isMainAdminUser(me) && uid === me.uid)) {
    throw new Error(translate('errors.adminIsMainAccount'));
  }

  const adminRef = doc(db, ADMINS_COLLECTION, uid);
  // set() on an existing doc would be an update, which the rules deny: check first
  const existing = await getDocFromServer(adminRef);
  if (existing.exists()) {
    throw new Error(translate('errors.adminAlreadyAdmin'));
  }

  const email = text(member.email).toLowerCase().slice(0, ADMIN_EMAIL_MAX);
  const name = text(member.name || member.cosplayName).slice(0, ADMIN_NAME_MAX);
  const addedByEmail = getCachedTokenEmail(me.uid);
  const data: Record<string, unknown> = {
    memberId: member.id,
    addedBy: me.uid,
    addedAt: serverTimestamp(),
  };
  if (email) data.email = email;
  if (name) data.name = name;
  if (addedByEmail) data.addedByEmail = addedByEmail;

  const log = buildAdminLog({
    action: 'admin_added',
    targetType: 'admin',
    targetId: uid,
    targetLabel: name || undefined,
  });
  const batch = writeBatch(db);
  batch.set(adminRef, data);
  batch.set(log.ref, log.data);
  await batch.commit();

  const entry: AdminEntry = {
    uid,
    memberId: member.id,
    addedBy: me.uid,
    addedAt: new Date().toISOString(),
    legacy: false,
  };
  if (email) entry.email = email;
  if (name) entry.name = name;
  if (addedByEmail) entry.addedByEmail = addedByEmail;
  return entry;
}

/**
 * Admin: removes an admin entry (any admin may remove any other admin). Removing yourself needs
 * `allowSelf` (the UI confirms twice). One batch: delete + admin_removed log.
 */
export async function removeAdmin(entry: AdminEntry, options?: { allowSelf?: boolean }): Promise<void> {
  const me = await requireAdminUser();
  if (!entry || !entry.uid) return;
  if (entry.uid === me.uid && !options?.allowSelf) {
    throw new Error(translate('errors.adminRemoveSelfNeedsConfirm'));
  }
  const log = buildAdminLog({
    action: 'admin_removed',
    targetType: 'admin',
    targetId: entry.uid,
    targetLabel: entry.name || undefined,
    details: entry.legacy ? 'console-created entry' : undefined,
  });
  const batch = writeBatch(db);
  batch.delete(doc(db, ADMINS_COLLECTION, entry.uid));
  batch.set(log.ref, log.data);
  await batch.commit();
}

/** True when `uid` is the signed-in user's own uid (helper for "You" chips). */
export function isOwnAdminEntry(entry: AdminEntry): boolean {
  return !!auth.currentUser && entry.uid === auth.currentUser.uid;
}
