import type {
  ColumnMapping,
  KccCounter,
  KccIdMigrationKind,
  KccIdMigrationNote,
  KccIdMigrationPlan,
  KccIdMigrationRow,
  Member,
  RegistrationDateFixPlan,
  RegistrationDateFixRow,
  SheetTimeContext,
} from '../types';
import {
  FIRST_MEMBER_NUMBER,
  MAIN_ACCOUNT_KCC_ID,
  extractAllPhones,
  formatKccId,
  isKccId8,
  isLegacyKccId16,
  kccIdFromNumber,
  kccNumber,
  legacyReservedToKcc8,
  normalizeSocialHandle,
} from './idGenerator';
import {
  compareByCreatedAtThenId,
  createdAtMs,
  isFakePlaceholderEmail,
  memberDisplayName,
  timestampLikeToDate,
} from './memberRules';
import { resolveSheetRowDate } from './sheetsService';
import { translate } from '../i18n';

// Pure planners of the admin bulk tools (no Firebase imports, deterministic): the chronological
// 8-digit renumbering ("Switch to 8-digit KCC IDs") and the sheet-timestamp matcher ("Fix registration
// dates from the spreadsheet"). firestoreService reads the data, calls these and writes the result.

/** A raw member document as read from the server. */
export interface PlannerMemberRow {
  id: string;
  data: Partial<Omit<Member, 'id'>>;
}

/** Members per migration batch: 3 x (member update, new card, alias, old-card delete) = 12 ops <= 15. */
export const MIGRATION_ROWS_PER_BATCH = 3;

// A row has one note; the stronger one wins (warnings still count every category)
const NOTE_PRIORITY: Record<KccIdMigrationNote, number> = {
  late_claim: 5,
  reserved_conflict: 4,
  duplicate_old_id: 3,
  missing_old_id: 2,
  unparsable_created_at: 1,
};

function withNote(row: KccIdMigrationRow, note: KccIdMigrationNote): void {
  if (!row.note || NOTE_PRIORITY[note] > NOTE_PRIORITY[row.note]) row.note = note;
}

function storedCreatedAt(value: unknown): string {
  if (typeof value === 'string') return value;
  const date = timestampLikeToDate(value);
  return date ? date.toISOString() : '';
}

/** FNV-1a (32 bit) over the text, as 8 hex digits. */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Stable signature of the pending (memberId -> toId) pairs of a plan, to detect drift between preview and apply. */
export function migrationSignature(rows: KccIdMigrationRow[]): string {
  const pending = rows.filter((r) => r.kind !== 'done');
  return `${pending.length}-${fnv1a(pending.map((r) => `${r.memberId}:${r.toId}`).join('\n'))}`;
}

function numberOf(id: string): number {
  return kccNumber(id) ?? Number.MAX_SAFE_INTEGER;
}

function exhausted(): Error {
  return new Error(translate('errors.kccIdsExhausted'));
}

interface Candidate {
  source: PlannerMemberRow;
  fromId: string | null;
  note?: KccIdMigrationNote;
}

function makeRow(
  candidate: Candidate,
  toId: string,
  kind: KccIdMigrationKind,
  note?: KccIdMigrationNote
): KccIdMigrationRow {
  const row: KccIdMigrationRow = {
    memberId: candidate.source.id,
    name: memberDisplayName(candidate.source.data),
    createdAt: storedCreatedAt(candidate.source.data.createdAt),
    fromId: candidate.fromId,
    toId,
    kind,
    writesAlias: false,
    deletesOldCard: false,
  };
  if (candidate.note) row.note = candidate.note;
  if (note) withNote(row, note);
  return row;
}

/**
 * Plan of the 8-digit switch (spec-data 2.5), deterministic: same members + counter -> same plan.
 * - 8-digit holders are 'done'. Reserved 16-digit holders keep their slot (16 zeros -> 00000000,
 *   000000000000000N -> 0000000N); when two docs share a slot (or a done doc holds it) the main account's
 *   doc (authUid == mainUid, slot 00000000 only) or else the earliest keeps it, the others get a regular
 *   number ('reserved_conflict').
 * - Everyone else, ordered by createdAt then doc id, gets 00000101, 00000102, … (fresh start), or on resume
 *   (counter exists) the still-free numbers 101..planEnd above the highest number already migrated, in the
 *   same order (a number freed by a deleted / renumbered migrated member is never reused); candidates beyond
 *   those are 'late_claim' with a provisional number after counter.last.
 * - The first pending holder of an old 16-digit ID writes its alias (unless a done doc already carries it as
 *   legacyUserId16); the last pending holder deletes the old card.
 * `mainUid` = uid of the signed-in main account (or null).
 */
export function planKccIdMigration(
  memberRows: PlannerMemberRow[],
  counter: KccCounter | null,
  mainUid: string | null,
  now: Date = new Date()
): KccIdMigrationPlan {
  const doneRows: KccIdMigrationRow[] = [];
  const reservedBySlot = new Map<string, Candidate[]>();
  const candidates: Candidate[] = [];
  let missingCount = 0;

  for (const source of memberRows || []) {
    if (!source || !source.id) continue;
    const data = source.data || {};
    const stored = typeof data.userId16 === 'string' ? data.userId16 : '';
    if (isKccId8(stored)) {
      const legacy = isLegacyKccId16(data.legacyUserId16) ? (data.legacyUserId16 as string) : null;
      doneRows.push(makeRow({ source, fromId: legacy }, stored, 'done'));
      continue;
    }
    const slot = legacyReservedToKcc8(stored);
    if (slot !== null) {
      const list = reservedBySlot.get(slot) || [];
      list.push({ source, fromId: stored });
      reservedBySlot.set(slot, list);
      continue;
    }
    if (isLegacyKccId16(stored)) {
      candidates.push({ source, fromId: stored });
    } else {
      missingCount++;
      candidates.push({ source, fromId: null, note: 'missing_old_id' });
    }
  }

  const byCreatedAt = (a: Candidate, b: Candidate) =>
    compareByCreatedAtThenId(a.source.id, a.source.data.createdAt, b.source.id, b.source.data.createdAt);

  // Reserved slots: one keeper per slot, the rest become regular members
  const heldByDone = new Set(doneRows.map((r) => r.toId));
  const reservedRows: KccIdMigrationRow[] = [];
  let reservedConflicts = 0;
  for (const slot of Array.from(reservedBySlot.keys()).sort()) {
    const sorted = [...(reservedBySlot.get(slot) || [])].sort(byCreatedAt);
    let keeper: Candidate | null = null;
    if (!heldByDone.has(slot)) {
      const mainDoc =
        slot === MAIN_ACCOUNT_KCC_ID && mainUid ? sorted.find((c) => c.source.data.authUid === mainUid) : undefined;
      keeper = mainDoc || sorted[0] || null;
    }
    for (const candidate of sorted) {
      if (candidate === keeper) {
        reservedRows.push(makeRow(candidate, slot, slot === MAIN_ACCOUNT_KCC_ID ? 'main' : 'admin'));
      } else {
        reservedConflicts++;
        candidates.push({ ...candidate, note: 'reserved_conflict' });
      }
    }
  }

  candidates.sort(byCreatedAt);
  let unparsableCount = 0;
  candidates.forEach((c) => {
    if (createdAtMs(c.source.data.createdAt) === Number.MAX_SAFE_INTEGER) {
      unparsableCount++;
      if (!c.note) c.note = 'unparsable_created_at';
    }
  });

  // Numbers
  const memberRows2: KccIdMigrationRow[] = [];
  let planEnd: number;
  let lateCount = 0;
  let unusedNumbers = 0;
  // Numbers already held by 'done' docs are never given out again
  const held = new Set<number>();
  doneRows.forEach((r) => {
    const n = kccNumber(r.toId);
    if (n !== null) held.add(n);
  });
  try {
    if (!counter) {
      // 101, 102, … skipping numbers an admin already gave out as 8-digit IDs before the switch
      let next = FIRST_MEMBER_NUMBER;
      planEnd = FIRST_MEMBER_NUMBER - 1;
      candidates.forEach((c) => {
        while (held.has(next)) next++;
        memberRows2.push(makeRow(c, kccIdFromNumber(next), 'member'));
        planEnd = next;
        next++;
      });
    } else {
      planEnd =
        typeof counter.planEnd === 'number' && Number.isInteger(counter.planEnd)
          ? counter.planEnd
          : Math.min(counter.last, FIRST_MEMBER_NUMBER - 1);
      // Every number below the highest one the migration already gave out (done rows that carry their old
      // ID) was issued, because batches run in ascending order: a free number there belonged to a member
      // that was deleted or renumbered since, and its old ID's alias still points to it -> never reused.
      let maxMigrated = 0;
      doneRows.forEach((r) => {
        const n = kccNumber(r.toId);
        if (r.fromId && n !== null && n <= planEnd && n > maxMigrated) maxMigrated = n;
      });
      const free: number[] = [];
      for (let n = Math.max(FIRST_MEMBER_NUMBER, maxMigrated + 1); n <= planEnd; n++) {
        if (!held.has(n)) free.push(n);
      }
      candidates.forEach((c, i) => {
        if (i < free.length) {
          memberRows2.push(makeRow(c, kccIdFromNumber(free[i]), 'member'));
        } else {
          lateCount++;
          memberRows2.push(makeRow(c, kccIdFromNumber(counter.last + lateCount), 'member', 'late_claim'));
        }
      });
      unusedNumbers = Math.max(0, free.length - candidates.length);
    }
  } catch (error) {
    if (error instanceof RangeError) throw exhausted();
    throw error;
  }

  // Aliases + old-card deletes, in apply order (ascending new number)
  const pendingRows = [...reservedRows, ...memberRows2].sort(
    (a, b) => numberOf(a.toId) - numberOf(b.toId) || (a.memberId < b.memberId ? -1 : a.memberId > b.memberId ? 1 : 0)
  );
  const aliasedByDone = new Set(doneRows.map((r) => r.fromId).filter((id): id is string => !!id));
  const holders = new Map<string, KccIdMigrationRow[]>();
  pendingRows.forEach((row) => {
    if (!row.fromId) return;
    const list = holders.get(row.fromId) || [];
    list.push(row);
    holders.set(row.fromId, list);
  });
  let duplicateCount = 0;
  holders.forEach((list, oldId) => {
    list.forEach((row, index) => {
      row.writesAlias = index === 0 && !aliasedByDone.has(oldId);
      if (!row.writesAlias) {
        duplicateCount++;
        withNote(row, 'duplicate_old_id');
      }
      row.deletesOldCard = index === list.length - 1;
    });
  });

  const rows = [...doneRows, ...pendingRows].sort(
    (a, b) => numberOf(a.toId) - numberOf(b.toId) || (a.memberId < b.memberId ? -1 : a.memberId > b.memberId ? 1 : 0)
  );

  const warnings: string[] = [];
  if (duplicateCount > 0) warnings.push(translate('errors.migrationWarnDuplicateOldId', { count: duplicateCount }));
  if (missingCount > 0) warnings.push(translate('errors.migrationWarnMissingOldId', { count: missingCount }));
  if (unparsableCount > 0) warnings.push(translate('errors.migrationWarnUnparsableDates', { count: unparsableCount }));
  if (reservedConflicts > 0) warnings.push(translate('errors.migrationWarnReservedConflict', { count: reservedConflicts }));
  if (lateCount > 0) warnings.push(translate('errors.migrationWarnLateClaims', { count: lateCount }));
  if (unusedNumbers > 0) warnings.push(translate('errors.migrationWarnUnusedNumbers', { count: unusedNumbers }));

  return {
    computedAt: now.toISOString(),
    rows,
    planEnd,
    counter: counter ? { ...counter } : null,
    pending: pendingRows.length,
    signature: migrationSignature(rows),
    warnings,
  };
}

/** Pending, non-late rows of a plan in apply order, chunked into migration batches (3 rows each). */
export function buildMigrationBatches(
  plan: KccIdMigrationPlan,
  rowsPerBatch: number = MIGRATION_ROWS_PER_BATCH
): KccIdMigrationRow[][] {
  const size = Math.max(1, Math.floor(rowsPerBatch));
  const pending = plan.rows.filter((r) => r.kind !== 'done' && r.note !== 'late_claim');
  const batches: KccIdMigrationRow[][] = [];
  for (let i = 0; i < pending.length; i += size) batches.push(pending.slice(i, i + size));
  return batches;
}

function csvCell(value: string): string {
  let text = String(value ?? '');
  // CSV injection: a cell starting with = + - @ (or tab / CR) would run as a formula in Excel / Sheets
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * CSV of a migration plan (UTF-8 with BOM, comma, every value quoted): old_kcc_id, new_kcc_id,
 * member_doc_id, name, registered_at, kind, note. IDs are FORMATTED ('0000 0101', '2026 1011 1844 0601')
 * so Excel keeps leading zeros. No phone/email/other personal fields.
 */
export function kccIdMigrationCsv(plan: KccIdMigrationPlan): string {
  const header = ['old_kcc_id', 'new_kcc_id', 'member_doc_id', 'name', 'registered_at', 'kind', 'note'];
  const lines = [header.map(csvCell).join(',')];
  for (const row of plan.rows) {
    lines.push(
      [
        row.fromId ? formatKccId(row.fromId) : '',
        formatKccId(row.toId),
        row.memberId,
        row.name,
        row.createdAt,
        row.kind,
        row.note || '',
      ]
        .map(csvCell)
        .join(',')
    );
  }
  return `﻿${lines.join('\r\n')}\r\n`;
}

// ---------------------------------------------------------------------------------------------
// Fix registration dates from the spreadsheet
// ---------------------------------------------------------------------------------------------

/** One sheet row reduced to its registration time and match keys (all normalized). */
export interface SheetDateRow {
  sheetRow: number; // 1-based row number in the sheet
  date: Date | null; // null = timestamp not parsable
  phones: string[];
  email: string;
  discord: string;
  social: string;
  name: string;
}

const GENERIC_NAMES: ReadonlySet<string> = new Set([
  'member',
  'cosplayer',
  'cosplay',
  'guest',
  'kawan',
  'anonymous',
  'anon',
  'admin',
]);

function lowerText(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function discordKey(value: unknown): string {
  return lowerText(value).replace(/^@/, '');
}

function emailKey(value: unknown): string {
  const email = lowerText(value);
  return email.length > 3 && !isFakePlaceholderEmail(email) ? email : '';
}

function nameKey(value: unknown): string {
  const name = lowerText(value).normalize('NFKC').replace(/\s+/g, ' ');
  return name.length >= 3 && !GENERIC_NAMES.has(name) ? name : '';
}

function sheetCell(row: string[], index: number | undefined): string {
  if (index === undefined || index < 0 || !Array.isArray(row)) return '';
  const value = row[index];
  return typeof value === 'string' ? value.trim() : value === undefined || value === null ? '' : String(value).trim();
}

/**
 * Sheet rows (formatted values incl. header) + the unformatted timestamp column -> SheetDateRow per
 * non-blank data row. Blank rows are skipped; rows without a parsable date keep `date: null`.
 */
export function buildSheetDateRows(
  rows: string[][],
  mapping: ColumnMapping,
  timestamps: Array<number | string | null> | null | undefined,
  context: SheetTimeContext
): SheetDateRow[] {
  const result: SheetDateRow[] = [];
  if (!Array.isArray(rows) || rows.length <= 1) return result;
  const lowerHeaders = (rows[0] || []).map((h) => (h || '').toLowerCase().trim());
  const discordIdx =
    mapping.discordUsername >= 0 ? mapping.discordUsername : lowerHeaders.findIndex((h) => h.includes('discord'));
  const nameIdx =
    mapping.name >= 0 ? mapping.name : mapping.cosplayName !== undefined && mapping.cosplayName >= 0 ? mapping.cosplayName : -1;

  for (let r = 1; r < rows.length; r++) {
    const row = Array.isArray(rows[r]) ? rows[r] : [];
    const phone = sheetCell(row, mapping.phone);
    const phone2 = sheetCell(row, mapping.phone2);
    const email = sheetCell(row, mapping.email);
    const discord = sheetCell(row, discordIdx);
    const name = sheetCell(row, nameIdx) || sheetCell(row, mapping.fullName);
    if (!phone && !phone2 && !email && !discord && !name) continue;

    const date =
      mapping.timestamp >= 0
        ? resolveSheetRowDate(sheetCell(row, mapping.timestamp), timestamps ? timestamps[r] : undefined, context)
        : null;
    result.push({
      sheetRow: r + 1,
      date,
      phones: extractAllPhones({ phone, phone2 }),
      email: emailKey(email),
      discord: discordKey(discord).length >= 2 ? discordKey(discord) : '',
      social: (() => {
        const handle = normalizeSocialHandle(sheetCell(row, mapping.socialMedia));
        return handle.length >= 3 ? handle : '';
      })(),
      name: nameKey(name),
    });
  }
  return result;
}

type MatchClass = RegistrationDateFixRow['matchedBy'];
const MATCH_ORDER: readonly MatchClass[] = ['phone', 'email', 'discord', 'social', 'name'];

/**
 * Matches sheet rows to members (spec-data 2.6 preview, pure). Per member the strongest key class that
 * matches wins (phone > email > discord > social > name; name matches are rejected when both sides have
 * phones / Discord / emails that differ); among the rows of that class the EARLIEST timestamp wins.
 * `ambiguous` = the chosen row is also the best match of another member. Only members whose date would
 * change by more than 1 s are listed. Default `selected`: strong match (not name), not ambiguous, and either
 * not a site registration (`source !== 'web_form'`) or the sheet time is EARLIER than the stored one.
 */
export function matchSheetRowsToMembers(
  sheetRows: SheetDateRow[],
  members: Member[],
  context: SheetTimeContext
): RegistrationDateFixPlan {
  const parsable = (sheetRows || []).filter((r) => r.date && !isNaN(r.date.getTime()));
  const unparsableRows = (sheetRows || []).length - parsable.length;

  const index: Record<MatchClass, Map<string, SheetDateRow[]>> = {
    phone: new Map(),
    email: new Map(),
    discord: new Map(),
    social: new Map(),
    name: new Map(),
  };
  const add = (cls: MatchClass, key: string, row: SheetDateRow) => {
    if (!key) return;
    const list = index[cls].get(key) || [];
    list.push(row);
    index[cls].set(key, list);
  };
  for (const row of parsable) {
    row.phones.forEach((p) => add('phone', p, row));
    add('email', row.email, row);
    add('discord', row.discord, row);
    add('social', row.social, row);
    add('name', row.name, row);
  }

  const earliest = (list: SheetDateRow[]): SheetDateRow =>
    list.reduce((best, row) => {
      const diff = (row.date as Date).getTime() - (best.date as Date).getTime();
      return diff < 0 || (diff === 0 && row.sheetRow < best.sheetRow) ? row : best;
    });

  // phoneConflict: matched by email / Discord / social handle although both sides have WhatsApp numbers and
  // none is shared (e.g. a placeholder like "tidak ada" / "none" typed by many people) -> never ticked by default
  const matches: Array<{ member: Member; row: SheetDateRow; by: MatchClass; phoneConflict: boolean }> = [];
  for (const member of members || []) {
    if (!member) continue;
    const keys: Record<MatchClass, string[]> = {
      phone: extractAllPhones(member),
      email: [emailKey(member.email)],
      discord: [discordKey(member.discordUsername)].filter((k) => k.length >= 2),
      social: [normalizeSocialHandle(typeof member.socialMedia === 'string' ? member.socialMedia : '')].filter(
        (k) => k.length >= 3
      ),
      name: [nameKey(member.name || member.cosplayName)],
    };
    const memberPhones = keys.phone;
    const memberDiscord = keys.discord[0] || '';
    const memberEmail = keys.email[0] || '';

    for (const cls of MATCH_ORDER) {
      const seen = new Set<number>();
      let found: SheetDateRow[] = [];
      for (const key of keys[cls]) {
        if (!key) continue;
        for (const row of index[cls].get(key) || []) {
          if (seen.has(row.sheetRow)) continue;
          seen.add(row.sheetRow);
          found.push(row);
        }
      }
      if (cls === 'name') {
        found = found.filter(
          (row) =>
            !(row.phones.length > 0 && memberPhones.length > 0 && !row.phones.some((p) => memberPhones.includes(p))) &&
            !(row.discord && memberDiscord && row.discord !== memberDiscord) &&
            !(row.email && memberEmail && row.email !== memberEmail)
        );
      }
      if (found.length > 0) {
        const row = earliest(found);
        const phoneConflict =
          cls !== 'phone' &&
          row.phones.length > 0 &&
          memberPhones.length > 0 &&
          !row.phones.some((p) => memberPhones.includes(p));
        matches.push({ member, row, by: cls, phoneConflict });
        break;
      }
    }
  }

  const chosenCount = new Map<number, number>();
  matches.forEach((m) => chosenCount.set(m.row.sheetRow, (chosenCount.get(m.row.sheetRow) || 0) + 1));

  const rows: RegistrationDateFixRow[] = [];
  let unchanged = 0;
  for (const { member, row, by, phoneConflict } of matches) {
    const sheetMs = (row.date as Date).getTime();
    const currentMs = createdAtMs(member.createdAt);
    const currentKnown = currentMs !== Number.MAX_SAFE_INTEGER;
    const deltaMs = currentKnown ? sheetMs - currentMs : 0;
    if (currentKnown && Math.abs(deltaMs) <= 1000) {
      unchanged++;
      continue;
    }
    const ambiguous = (chosenCount.get(row.sheetRow) || 0) > 1;
    rows.push({
      memberId: member.id,
      name: memberDisplayName(member),
      kccId: typeof member.userId16 === 'string' ? member.userId16 : '',
      source: member.source,
      currentCreatedAt: typeof member.createdAt === 'string' ? member.createdAt : storedCreatedAt(member.createdAt),
      sheetCreatedAt: (row.date as Date).toISOString(),
      deltaMs,
      sheetRow: row.sheetRow,
      matchedBy: by,
      ambiguous,
      selected:
        by !== 'name' &&
        !ambiguous &&
        !phoneConflict &&
        (member.source !== 'web_form' || !currentKnown || sheetMs < currentMs),
    });
  }
  rows.sort((a, b) => (a.sheetCreatedAt < b.sheetCreatedAt ? -1 : a.sheetCreatedAt > b.sheetCreatedAt ? 1 : a.sheetRow - b.sheetRow));

  const matchedSheetRows = new Set(matches.map((m) => m.row.sheetRow));
  return {
    rows,
    unchanged,
    unmatchedRows: parsable.filter((r) => !matchedSheetRows.has(r.sheetRow)).length,
    unparsableRows,
    context,
  };
}
