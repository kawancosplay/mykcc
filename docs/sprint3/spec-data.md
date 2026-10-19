# MyKCC sprint 3 — Data + Rules spec

Author: data/rules architect (subagent). Date: 2026-10-13.
Status: COMPLETE. Rules written to `C:\Users\Sato\Projects\mykcc\firestore.rules` and
`C:\Users\Sato\Projects\mykcc\security_spec.md` (not published, not committed).

## 0. Context and constraints

- Production (`mykcc.vercel.app`) currently serves `4adcd63` (sprint 2 + D3 + translations, promoted by hand), NOT
  `main` (`2d180f0`). The published rules are the 2026-10-11 file; `git diff 2d180f0 4adcd63 -- firestore.rules` is
  empty, so the repo file before this sprint == the published rules == what the live code was written against.
- The live code (`4adcd63`) is called "LIVE" below; the sprint-3 code is "S3". Rules must work for LIVE and S3 at the
  same time (the owner publishes rules by hand; LIVE keeps running until a S3 build is promoted).
- Rules limit: max 10 `exists()/get()/getAfter()` per operation and 20 per request (batch/transaction). The project
  counts every call (no dedupe assumed), hence `ADMIN_BATCH_SIZE = 15` (1 `exists(admins/uid)` per op for a
  non-main admin; the main account costs 0 because `isMainAccountUser()` short-circuits).
- Facts from the code that drive the design:
  - `isValidUserId16()` (`/^\d{16}$/`) is used by LIVE everywhere (payload builder, card upsert, repair). LIVE treats an
    8-digit ID as INVALID: its "Jalankan Perbaikan" repair would give every 8-digit member a NEW 16-digit ID
    (`reason: 'missing'`). → the 8-digit switch may only run when every admin device runs S3, and the new rules block
    new 16-digit IDs once the switch has happened (see 1.3).
  - LIVE generates public IDs as `YYYYMMDDHHmmss + seq` (`generate16DigitUserId`), i.e. never `00000000xxxxxxxx`.
  - `photos.userId16` is written at upload (display only: `PhotoGallery` shows it formatted / last 4 digits).
  - `normalizeMember()` invents a 16-digit ID for docs without one (display only, never stored).
  - Sheets: `fetchSheetValues` returns FORMATTED strings; `parseRowsToMembers` uses `Date.parse` (broken for
    `11/10/2026 01.44.06`, dd/MM read as MM/dd) and falls back to "now".
- Lite mode / performance work is NOT part of this spec (only the data-layer pieces of it: paged photo listing).

## 1. Decisions

### 1.1 KCC ID field naming — keep `userId16`
- The stored field stays `userId16` on `members`, `memberCards` (doc id == field) and `photos`. It holds the KCC ID:
  8 digits after the switch, 16 digits before (legacy). Renaming would need a full rewrite of every member, card and
  photo, would break LIVE during the transition (LIVE reads `userId16`), and buys nothing. Not unsafe: the rules
  validate the value (8 or 16 digits) wherever it is written.
- TypeScript: `type KccId = string` alias + comments; new helpers are named `...KccId...`. Old helper names
  (`isValidUserId16`, `format16DigitUserId`) stay as deprecated wrappers until all call sites are migrated, but
  `isValidUserId16` keeps its strict 16-digit meaning (it is now "is LEGACY id"); every "is this a KCC ID" check in S3
  must use `isValidKccId` (8 or 16).
- New optional member field `legacyUserId16` (16 digits, written ONLY by the admin migration): the member's old ID.
  Used for support ("old ID"), resumability checks, the photo rewrite pass and re-pointing aliases if a duplicate is
  merged after the switch. Not owner-editable, not allowed on public creates.
- AGENTS.md must document: "`userId16` holds the KCC ID — 8 digits after the 8-digit switch, 16 before; legacy
  16-digit IDs resolve through `memberCardAliases`."

### 1.2 KCC ID format and ranges
- 8 digits, display `XXXX XXXX`. `00000000` = main account; `00000001`–`00000100` = admin range (admin-assigned
  only); members `00000101`–`99999999`, issued by the counter, never reused.
- Legacy 16 digits, display `XXXX XXXX XXXX XXXX`. Reserved: `0000000000000000`–`0000000000000100`.
  NEW (rules): non-admins may never create a 16-digit ID starting with `00000000` (it would shadow the 8-digit ID
  `xxxxxxxx` in the lookup); LIVE never generates such IDs.
- Mapping of reserved holders in the switch: `0000000000000000` → `00000000`, `000000000000000N` (N ≤ 100) →
  last 8 digits. Members: chronological by `createdAt` (ties: doc id ascending) → `00000101`, `00000102`, …

### 1.3 The switch is marked by the counter document
- `counters/kccId` = `{ last: int, lastId: string(8), planEnd?: int, updatedAt?: string }`.
  `lastId` is `last` zero-padded to 8 digits (rules: `lastId.matches('^0*' + string(last) + '$')`, 8 digits — this
  avoids relying on `int()` accepting leading zeros; see 5.2 for the emulator check of both forms).
- Counter ABSENT = pre-switch: public registrations use the legacy 16-digit path (LIVE and S3 fallback).
  Counter PRESENT = post-switch: rules deny every NEW 16-digit ID (public AND admin: member create, member
  `userId16` change, card create); 8-digit public IDs must be claimed through the counter in the same write.
  This makes stale clients (cached PWA, a Vercel rollback) fail loudly instead of mixing 16-digit IDs into the
  8-digit era, and makes LIVE's repair a no-op after the switch (all its ID writes are denied → it writes nothing).
- The counter is created by the migration (admin) BEFORE the first member is renumbered, with
  `last = planEnd = 100 + <number of members in the plan>`; new public registrations immediately continue after the
  planned block (they are later in time, so chronological order holds). It can never be deleted from the client.
- Public claim (anonymous allowed), one transaction: `counters/kccId` +1 (non-admin: exactly +1, nothing else),
  `memberCards/{lastId}` created in the same write, `members/{kc_…|uid}` with `userId16 == lastId`. Rules bind both
  ways: counter → `!exists(card) && existsAfter(card)`; card/member → `getAfter(counter).lastId == id &&
  get(counter).lastId != id` (the counter moved to exactly this ID in this write).

### 1.4 Collections (new)
| Path | Read | Write | Schema |
|---|---|---|---|
| `counters/kccId` | public `get` (needed by the anonymous transaction; reveals only the member count), no list | create: admin; update: admin (monotonic) or the bound +1 claim; delete: nobody | `last` int 100..99999999, `lastId` 8 digits == pad(last), `planEnd?` int ≤ last, `updatedAt?` ≤ 40 |
| `memberCardAliases/{old16}` | public `get`, no list | admin create/update/delete | `{ kccId: 8 digits, createdAt: ≤40 }`, id = 16 digits |
| `admins/{uid}` | own doc, or any admin; list: admin | create: any admin (strict schema, bound to a member doc with that `authUid`); update: nobody; delete: any admin | `{ memberId, email?, name?, addedBy == auth.uid, addedByEmail? == token email, addedAt == request.time }` |
| `adminSettings/dashboardLock` | admin `get`, no list | main account only (create/update/delete) | `{ algorithm: 'PBKDF2-SHA256', hash, salt, iterations, updatedAt == request.time, updatedBy == auth.uid }` |
| `adminLogs/{logId}` | admin get/list | admin create (schema, `actorUid == auth.uid`, `at == request.time`); no update/delete | see 2.10 |

### 1.5 PBKDF2 parameters (dashboard lock)
- WebCrypto `PBKDF2` with `SHA-256`, 16-byte random salt (`crypto.getRandomValues`), 32-byte derived key,
  **310,000 iterations** (OWASP's former PBKDF2-SHA256 figure; ≈0.2–0.4 s on a mid phone, ≈0.6–0.9 s on a low-end
  one; OWASP's current 600,000 would exceed ~1 s on low-end phones). `iterations` is stored per record, so it can
  be raised later; rules accept 100,000–2,000,000. Base64 (standard) for `hash` (44 chars) and `salt` (24 chars).
  Verification compares in constant time. Nothing secret ships in the bundle; the hash is readable by every admin
  (offline guessing is possible for admins) — acceptable because the lock is a convenience lock; rules stay the
  real protection (UI copy must say so).

### 1.6 Batch / cost policy
- Rules: `isAdmin()` is evaluated FIRST in every create/update branch whose non-admin branch makes document calls
  (members create, memberCards create, counters update); otherwise an admin batch would pay the non-admin calls
  too (e.g. 15 card creates × 2 = 30 > 20). Non-admin branches without calls stay first where they already are.
- Client: every admin batch ≤ 15 ops (unchanged). Migration batch = 3 members × 4 ops = 12 ops; date fix = 7 members
  × 2 ops = 14; import claim = 1 counter + 7 × (member + card) = 15.
- Full cost table: section 3.3.

### 1.7 Things deliberately NOT changed
- Admin `update` on `members` stays schema-free (LIVE's repair/merge/auto-heal touch legacy docs that may not pass
  `isValidMember`); S3 clients sanitize admin edits to the rule limits instead. The only new admin restriction is the
  post-switch 16-digit block.
- Photos rules unchanged (paging works with `limit <= 100`; admin delete already allowed).
- `sync_logs`, `siteSettings` unchanged.
- No server-side code (Admin SDK) — changing a login email or deleting an Auth account stays out of scope.

## 2. Data-layer contracts

Conventions for every contract below: functions throw on failure (never swallow a write error and report
success); admin-only functions check `checkIsAdminUser(auth.currentUser)` first and throw a translated
`errors.*AdminOnly` error; every admin batch ≤ 15 ops (`ADMIN_BATCH_SIZE`); user-facing messages via `translate()`;
"logs" = `writeAdminLog` (2.10), best effort unless stated (a failed log write is `console.warn`ed and never undoes
or hides the action — except where the log is in the same batch as the action).

### 2.1 Types (src/types/index.ts)

```ts
/** KCC ID as stored in `userId16`: 8 digits (current) or 16 digits (legacy, before the 8-digit switch). */
export type KccId = string;

export interface Member {
  // ...all existing fields unchanged...
  userId16: KccId;          // the KCC ID (field name kept for compatibility, see AGENTS.md)
  legacyUserId16?: string;  // NEW: old 16-digit ID, written only by the 8-digit migration
}
export interface MemberCard { userId16: KccId; /* rest unchanged */ }
export interface Photo { userId16?: KccId; /* rest unchanged; rewritten by the migration photo pass */ }

export interface KccCounter { last: number; lastId: string; planEnd?: number; updatedAt?: string }
export interface MemberCardAlias { kccId: string; createdAt: string }

export interface AdminEntry {
  uid: string;
  memberId?: string;
  email?: string;
  name?: string;
  addedBy?: string;
  addedByEmail?: string;
  addedAt: string | null;   // ISO from the server Timestamp; null for console-created docs without it
  legacy: boolean;          // true when the doc does not have the sprint-3 schema (console-created)
}

export interface DashboardLockRecord {
  algorithm: 'PBKDF2-SHA256';
  hash: string;             // base64, 32 bytes
  salt: string;             // base64, 16 bytes
  iterations: number;
  updatedAt: string | null; // ISO
  updatedBy: string;        // uid
}

export type AdminLogAction =
  | 'admin_added' | 'admin_removed' | 'photo_deleted' | 'member_deleted' | 'member_edited'
  | 'member_unlinked' | 'member_status_changed' | 'password_reset_sent' | 'kcc_id_migration'
  | 'kcc_id_repair' | 'registration_dates_fixed' | 'duplicates_merged' | 'sheets_import'
  | 'dashboard_lock_set' | 'dashboard_lock_cleared';            // == firestore.rules adminLogActions()
export type AdminLogTargetType = 'member' | 'admin' | 'photo' | 'settings' | 'bulk';
export interface AdminLogEntry {
  id: string;
  action: AdminLogAction;
  actorUid: string;
  actorEmail?: string;
  at: string | null;        // ISO from the server Timestamp (null while pending)
  targetType?: AdminLogTargetType;
  targetId?: string;        // <= 128
  targetLabel?: string;     // <= 120 (name shown in the log; never phone/email of a member)
  details?: string;         // <= 1000
  count?: number;           // int >= 0 (bulk actions)
}
export type AdminLogInput = Omit<AdminLogEntry, 'id' | 'actorUid' | 'actorEmail' | 'at'>;

// 8-digit migration (2.5)
export type KccIdMigrationKind = 'main' | 'admin' | 'member' | 'done';
export interface KccIdMigrationRow {
  memberId: string;
  name: string;
  createdAt: string;        // as stored (after the date fix)
  fromId: string | null;    // stored userId16 (16 digits) or null when missing/invalid
  toId: string;             // 8 digits; for note 'late_claim' a PROVISIONAL number (claimed at apply time)
  kind: KccIdMigrationKind; // 'done' = already holds its 8-digit ID (resume / re-run)
  writesAlias: boolean;     // fromId gets memberCardAliases/{fromId} -> toId
  deletesOldCard: boolean;  // memberCards/{fromId} is deleted (false when another pending row still holds it)
  note?: 'duplicate_old_id' | 'missing_old_id' | 'unparsable_created_at' | 'reserved_conflict' | 'late_claim';
}
export interface KccIdMigrationPlan {
  computedAt: string;
  rows: KccIdMigrationRow[];  // ordered by toId
  planEnd: number;            // last number of the chronological block (100 + member rows)
  counter: KccCounter | null; // counter as read (null = switch not started)
  pending: number;            // rows with kind !== 'done'
  signature: string;          // stable hash of the (memberId -> toId) pairs, to detect drift
  warnings: string[];
}
export interface KccIdMigrationReport {
  migrated: number; aliasesWritten: number; cardsWritten: number; oldCardsDeleted: number;
  lateClaimed: number;      // 16-digit members found after the counter existed, given counter numbers
  photosUpdated: number;
  errors: string[];
  complete: boolean;        // no member holds a 16-digit or missing ID any more
}

// Registration dates (2.6)
export interface SheetTimeContext { timeZone: string; locale: string }
export interface RegistrationDateFixRow {
  memberId: string; name: string; kccId: string; source: Member['source'];
  currentCreatedAt: string; sheetCreatedAt: string; deltaMs: number;
  sheetRow: number;                                    // 1-based row number in the sheet
  matchedBy: 'phone' | 'email' | 'discord' | 'social' | 'name';
  ambiguous: boolean;                                  // the row matched more than one member
  selected: boolean;                                   // default tick in the preview
}
export interface RegistrationDateFixPlan {
  rows: RegistrationDateFixRow[];                      // only members whose date would change (> 1 s)
  unchanged: number; unmatchedRows: number; unparsableRows: number;
  context: SheetTimeContext;
}
export interface RegistrationDateFixReport { updated: number; cardsWritten: number; errors: string[] }

// Paged photos (2.13); the cursor is opaque to components
export type PhotoPageCursor = { readonly __brand: 'PhotoPageCursor' };
export interface PhotoPage { photos: Photo[]; cursor: PhotoPageCursor | null; hasMore: boolean }

// Bulk import result gains the issued numbers
export interface BulkImportResult { added: number; updated: number; unchanged: number; skipped: number;
  issuedIds?: string[] }   // NEW: KCC IDs given to new rows, in order
```

### 2.2 KCC ID helpers (src/lib/idGenerator.ts)

```ts
export const MAIN_ACCOUNT_KCC_ID = '00000000';
export const MAIN_ACCOUNT_UID = '0000000000000000';      // legacy 16-digit main ID (kept, used pre-switch)
export const ADMIN_UID_START = 1; export const ADMIN_UID_END = 100;
export const FIRST_MEMBER_NUMBER = 101;
export const MAX_KCC_NUMBER = 99_999_999;

export function isKccId8(id: unknown): id is string;          // /^\d{8}$/
export function isLegacyKccId16(id: unknown): id is string;   // /^\d{16}$/
export function isValidKccId(id: unknown): id is string;      // 8 or 16 digits (== rules isValidKccId)
export function isReservedKccId(id?: string | null): boolean; // 8: <= '00000100'; 16: <= '0000000000000100'
export function isMainAccountKccId(id?: string | null): boolean;  // '00000000' or '0000000000000000'
export function isAdminRangeKccId(id?: string | null): boolean;   // 1..100 in either format
export function kccNumber(id: string): number | null;         // 8 digits -> int, else null
export function kccIdFromNumber(n: number): string;           // int 0..99999999 -> 8 digits; RangeError otherwise
export function formatKccId(id?: string | null): string;      // 8 -> 'XXXX XXXX'; 16 -> 'XXXX XXXX XXXX XXXX';
                                                              // anything else -> '---- ----' (never pads)
export function parseKccIdInput(input: string):               // strips spaces/dashes etc.
  { kind: 'kcc8'; id: string } | { kind: 'legacy16'; id: string } | { kind: 'invalid' };
export function legacyReservedToKcc8(old16: string): string | null; // '0000000000000000' -> '00000000',
                                                              // '000000000000000N' (N<=100) -> last 8; else null
export function paddedLegacyToKcc8(old16: string): string | null;   // '00000000xxxxxxxx' -> 'xxxxxxxx'; else null
export function formatAdminSlotKccId(slot: number): string;   // 1..100 -> '000000NN' (8 digits)
```
Semantics / changes:
- `isValidUserId16` keeps its exact meaning (16 digits) and is renamed in use to `isLegacyKccId16`; S3 code must
  call `isValidKccId` wherever it asks "is this a stored KCC ID" (payload builder, card upsert, `getMemberCard`,
  `updateMemberProfileData`, `updateMemberStatus`, `deleteMember`, repair, merge, import, upload).
- `format16DigitUserId(id)` becomes a deprecated wrapper of `formatKccId` (the current version pads an 8-digit ID to
  16 → wrong card). `getUserIdBadgeInfo` uses `isMainAccountKccId` / `isAdminRangeKccId` (both formats).
- `normalizeMember()` must no longer invent a 16-digit ID for docs without `userId16`; it sets `userId16: ''`
  (UI shows `formatKccId('')` = placeholder; repair/migration assign real IDs).
- `generate16DigitUserId`, `generateChronologicalUserId16`, `generateUniqueChronologicalUserId16` stay ONLY for the
  pre-switch fallback (they never produce `00000000…`). Delete the unused `resolveMemberUserId16`,
  `generateSequentialUserId16`, `getNextMemberSequenceNumber` (client-list-derived IDs are on the never-do list).
- `getNextAvailableAdminSlot(existing, format: 8 | 16)`: first free admin-range number among `existing` in that
  format (8 after the switch); admin UI only.

### 2.3 Registration with counter (src/lib/firestoreService.ts)

```ts
export const COUNTERS_COLLECTION = 'counters';
export const KCC_COUNTER_ID = 'kccId';
export const MEMBER_CARD_ALIASES_COLLECTION = 'memberCardAliases';

/** counters/kccId from the server; null = the 8-digit switch has not started. Throws on read errors, EXCEPT
 *  permission-denied, which is treated as null (+ console.warn): that only happens while the sprint-2 rules are
 *  still published (no counter can exist then), and it keeps registration working if a S3 build is promoted
 *  before the rules (see 4.4). Inside the claim transaction the same mapping applies to tx.get(counter). */
export async function getKccCounter(): Promise<KccCounter | null>;

/** The main account's own ID in the current format: '00000000' when the counter exists, else 16 zeros. */
export async function mainAccountKccId(): Promise<string>;

/**
 * Public registration (anonymous allowed): members/{kc_...} + memberCards/{id}.
 * - Main account registering ITSELF (linkToCurrentUser) while its main card does not exist: main ID (admin batch).
 * - Counter exists: claim transaction (below).
 * - Counter missing: legacy 16-digit path (today's assignNewUserId16 + batch). If that batch is denied with
 *   permission-denied (the switch started in between), retry ONCE through the claim transaction.
 * Errors are rethrown. Transactions need the server: offline -> 'unavailable' error (no fake success).
 */
export async function registerMember(member: Omit<Member, 'id' | 'userId16'>,
  options?: { linkToCurrentUser?: boolean }): Promise<Member>;            // signature unchanged

/**
 * members/{docId} (+ card) only if absent (sign-in profile, docId = uid). Existing doc returned untouched.
 * `member.userId16` may only be given for the main account (main ID) or by an admin (reserved slot);
 * otherwise the ID is claimed (counter) or, without counter, generated on the legacy path inside the same
 * transaction as today.
 */
export async function createMemberIfAbsent(docId: string,
  member: Omit<Member, 'id' | 'userId16'> & { userId16?: string }): Promise<{ member: Member; created: boolean }>;

/** Admin add: keeps a valid RESERVED id the admin chose (admin slot); otherwise claims like registerMember. */
export async function addMemberToFirestore(member: Omit<Member, 'id'>, customId?: string): Promise<string>;

/** Legacy fallback only (pre-switch): today's assignNewUserId16, renamed. Never used when the counter exists. */
export async function assignLegacyUserId16(options?: { allowMainAccount?: boolean }): Promise<string>;
```
Claim transaction (internal `claimKccIdAndCreate(memberRef, buildPayloads, { onlyIfAbsent })`), reads before writes:
1. `tx.get(counters/kccId)`; missing → return `'no-counter'` (no writes; caller takes the legacy path).
2. `onlyIfAbsent`: `tx.get(memberRef)`; exists → return the existing member (no writes). Only for `members/{uid}`
   (anonymous visitors cannot read `kc_` docs).
3. `next = last + 1` (> 99,999,999 → throw), `id = kccIdFromNumber(next)`.
4. `tx.get(memberCards/{id})`; exists → throw `errors.kccCounterBlocked` (the counter is behind the cards; a
   non-admin cannot skip numbers). This must never happen if every admin write goes through the counter;
   `checkKccCounter()` below repairs it.
5. Writes: `tx.update(counter, { last: next, lastId: id, updatedAt: nowIso })` (ONLY these keys — `planEnd` stays),
   `tx.set(memberCards/{id}, cardPayload)`, `tx.set(memberRef, memberPayload)` with `userId16: id`. The member payload
   never contains `legacyUserId16`; `authUid` only when linked to the signed-in user.
6. The SDK retries on contention (two visitors at once): the loser re-reads the counter and takes the next number.

Counter health (admin):
```ts
/** Reads the counter and probes memberCards/{last+1..last+5}; returns the blocking IDs (should be []). */
export async function checkKccCounter(): Promise<{ counter: KccCounter | null; blockedIds: string[] }>;
/** Admin: moves the counter forward to cover `id` (never backwards). Logs 'kcc_id_repair'. */
export async function advanceKccCounterTo(id: string): Promise<KccCounter>;
```
`repairMemberIdsAndCards` / `reassignMemberUserId16` (existing admin repair): after the switch they must claim
counter numbers for duplicates/missing IDs (admin claim: counter + member update + card + old-card cleanup ≤ 5 ops)
and treat 8-digit IDs as valid; before the switch they behave as today. Logs `kcc_id_repair` with counts.

### 2.4 Lookup by 8 or 16 digits (aliases)

```ts
export type KccLookupSource = 'kcc8' | 'alias' | 'padded16' | 'legacy16';
/**
 * Public KCC ID lookup. Input: any text; non-digits are stripped. Returns null for "not found" and for input that
 * is neither 8 nor 16 digits (the UI checks parseKccIdInput first to show "enter 8 or 16 digits").
 * 8 digits  -> memberCards/{id}.
 * 16 digits -> (1) memberCardAliases/{id} -> memberCards/{alias.kccId}  (a dangling alias -> null, no fallthrough)
 *              (2) id starts with '00000000' -> memberCards/{last 8}
 *              (3) memberCards/{id} (legacy card, before the switch)
 * (1) and (3) may be fetched in parallel; precedence is (1) > (2) > (3). Network/permission errors are thrown,
 * except permission-denied on the ALIAS read, which counts as "no alias" (sprint-2 rules deny the collection).
 */
export async function lookupMemberCard(input: string):
  Promise<{ card: MemberCard; resolvedFrom: KccLookupSource; requestedId: string } | null>;

/** Exact get of memberCards/{id} for an 8- or 16-digit id (was 16 only). */
export async function getMemberCard(id: string): Promise<MemberCard | null>;
```
- `App.handleLookupCard` must call `lookupMemberCard` (today it rejects anything but 16 digits). When
  `resolvedFrom !== 'kcc8'`, the UI can say "This is an old ID; the member's KCC ID is now XXXX XXXX".
- Card link (suggestion for the UI stage): `https://mykcc.vercel.app/?kcc=<8 digits>`; on load the app runs
  `lookupMemberCard` on the parameter (a KCC ID is public data, so it may appear in a URL).
- No list query is ever needed: aliases and cards are read by exact id only.

### 2.5 Chronological renumbering migration ("Switch to 8-digit KCC IDs")

```ts
/** Admin, no writes: the plan from fresh server data (members + counter). */
export async function previewKccIdMigration(): Promise<KccIdMigrationPlan>;

/** CSV for the preview download (UTF-8 with BOM, comma, every value quoted):
 *  old_kcc_id, new_kcc_id, member_doc_id, name, registered_at, kind, note.
 *  IDs are written FORMATTED ('0000 0101', '2026 1011 1844 0601') so Excel keeps leading zeros; values starting
 *  with = + - @ are prefixed with ' (CSV injection). No phone/email/other personal fields. */
export function kccIdMigrationCsv(plan: KccIdMigrationPlan): string;

/** Admin: applies the plan; resumable and idempotent (re-running after completion changes nothing). */
export async function applyKccIdMigration(
  previewed: KccIdMigrationPlan,
  onProgress?: (done: number, total: number, phase: 'counter' | 'members' | 'late' | 'photos') => void,
  options?: { rewritePhotos?: boolean /* default true */; signal?: AbortSignal }
): Promise<KccIdMigrationReport>;
```

**Plan (deterministic, same input → same plan):**
1. Read every `members` doc from the server and `counters/kccId`.
2. Classify by the stored `userId16`:
   - 8 digits → `done` (already migrated, or registered through the counter after the switch).
   - 16-digit reserved (`legacyReservedToKcc8` ≠ null) → `main` / `admin`, `toId` = mapped number. If two docs map to
     the same reserved number, or a `done` doc already holds it: the main-account doc (`authUid` = the signed-in main
     account) or else the earliest keeps it; the others become `member` rows with note `reserved_conflict`.
   - any other 16-digit ID, or missing/invalid (`missing_old_id`) → `member` candidate.
3. Candidates sorted by `createdAtMs(createdAt)` then doc id (same comparator as today's repair; unparsable dates
   sort last, note `unparsable_created_at` — the date fix should be run first).
4. Numbers:
   - counter missing (fresh start): `101, 102, …` in order; `planEnd = 100 + candidates`.
   - counter exists (resume): free numbers = `101..counter.planEnd` minus numbers held by `done` docs, ascending, given
     to the candidates in order. Because batches are applied in ascending order, this reproduces the original plan
     exactly. Candidates beyond the free numbers (16-digit registrations that slipped in before the counter
     existed) get note `late_claim` and a provisional `toId` (`counter.last + k`); free numbers left over (a pending
     member was deleted) stay unused → warning.
5. Aliases: `writesAlias` for the first pending holder of each old 16-digit ID, unless a `done` doc already has
   `legacyUserId16 ==` that ID (an earlier run moved the first holder). Further holders: note `duplicate_old_id`
   (run "merge duplicates" first; the alias then points to the earliest holder). `deletesOldCard` only on the last
   pending holder of that old ID.
6. `signature` = FNV-1a (or similar) over `memberId:toId` of all non-`done` rows; `warnings` list duplicates,
   unparsable dates, reserved conflicts, gaps, late claims.

**Apply:**
0. Admin check; recompute the plan from the server. If the counter is missing and
   `recomputed.signature !== previewed.signature` → throw `errors.migrationPlanChanged` (someone registered or edited
   since the preview; the UI re-previews). With an existing counter (resume) the recomputed plan is used.
1. `counter` phase (fresh start only): transaction `tx.get(counter)`; if it exists → throw
   `errors.migrationAlreadyStarted` (another admin started; re-preview resumes); else
   `tx.set(counter, { last: planEnd, lastId: kccIdFromNumber(planEnd), planEnd, updatedAt })`. From this moment public
   registrations get `planEnd + 1, …` and the rules close the 16-digit path.
2. `members` phase: pending rows (not `late_claim`) in plan order, **3 rows per batch** (≤ 12 ops):
   `update(members/{id}, { userId16: toId, legacyUserId16: fromId /* only when fromId is 16 digits */ })`,
   `set(memberCards/{toId}, buildMemberCard({...serverData, userId16: toId}))` (ownerUid = authUid),
   `set(memberCardAliases/{fromId}, { kccId: toId, createdAt: nowIso })` if `writesAlias`,
   `delete(memberCards/{fromId})` if `deletesOldCard`.
   Stop at the first failed batch (report the member ids + error; re-running resumes). Check `signal` between batches.
3. `late` phase: re-read members; every member still holding a 16-digit/missing ID (chronological order) gets an
   admin claim transaction: reads `counter`, `members/{id}` (skip if it already holds 8 digits — protects against two
   admins running at once) and `memberCards/{next}`; writes counter `last+1`, member update, new card, alias (if no
   holder yet), old-card delete (5 ops).
4. `photos` phase (`rewritePhotos`): map `legacyUserId16 → userId16` from the members; page through `photos`
   (`orderBy('createdAt','desc')`, `limit(50)`, `startAfter`), `update(photos/{id}, { userId16: new })` for photos
   whose 16-digit `userId16` is in the map, ≤ 15 per batch. Photos without a match keep their value (the lookup still
   resolves old IDs through aliases). Note: this reads every photo once (image data included) — run on Wi-Fi.
5. `complete` = no member holds a non-8-digit ID. Log `kcc_id_migration` (`targetType: 'bulk'`, `count: migrated`,
   `details`: "migrated X, late Y, aliases Z, photos P, errors E").

Not possible / out of scope: orphan 16-digit cards without a member (cards cannot be listed) stay as they are and
keep resolving through lookup step (3); they hold only public card data.
Other admin ID actions (repair, merge, import, single reassign) are disabled in the UI while `apply` runs.

### 2.6 Sheet timestamps + fix registration dates

sheetsService.ts:
```ts
export interface SpreadsheetMetadata {
  properties?: { title?: string; timeZone?: string; locale?: string };   // NEW: timeZone, locale
  sheets?: /* unchanged */;
}
// fetchSpreadsheetMetadata: fields=properties(title,timeZone,locale),sheets.properties(sheetId,title,gridProperties)

export const DEFAULT_SHEET_TIME_CONTEXT: SheetTimeContext = { timeZone: 'Asia/Jakarta', locale: 'id_ID' };
export function sheetTimeContext(meta: SpreadsheetMetadata): SheetTimeContext;   // falls back to the default

export function columnLetter(index: number): string;                 // 0 -> 'A', 25 -> 'Z', 26 -> 'AA'

/** values.get of ONLY the timestamp column with valueRenderOption=UNFORMATTED_VALUE &
 *  dateTimeRenderOption=SERIAL_NUMBER ('<tab>'!X1:X<lastRow>). One entry per sheet row (index 0 = header):
 *  number = date cell (serial), string = text cell, null = empty. All other columns keep using the formatted
 *  fetchSheetValues (UNFORMATTED for every column would turn phone numbers into numbers). Throws SheetsApiError. */
export async function fetchTimestampColumn(accessToken: string, spreadsheetId: string, tabTitle: string,
  columnIndex: number, lastRow?: number /* default 2000 */): Promise<Array<number | string | null>>;

/** Sheets serial (days since 1899-12-30; the fraction is the wall-clock time IN THE SPREADSHEET'S TIME ZONE)
 *  -> UTC Date. Rounded to the second. null for non-finite or < 1. */
export function sheetSerialToDate(serial: number, timeZone: string): Date | null;

/** Wall-clock parts in an IANA zone -> UTC Date (Intl.DateTimeFormat offset, two passes, DST-safe). */
export function zonedTimeToUtc(p: { y: number; mo: number; d: number; h: number; mi: number; s: number },
  timeZone: string): Date;

/** Text timestamp -> Date in ctx.timeZone, or null (NEVER "now"). Accepts d/M/yyyy and M/d/yyyy with '/', '-' or
 *  '.' date separators, H.mm[.ss] (Indonesian) or H:mm[:ss], optional AM/PM; yyyy-MM-dd[ T]HH:mm[:ss]; ISO 8601 with
 *  an offset/Z (taken as is). Day/month order: a part > 12 decides; else month-first only for month-first locales
 *  (en_US, en_PH, es_US, fr_CA... — list in code), day-first otherwise (id_ID default). Rejects impossible dates
 *  (31/02) and years outside 2000..2100. */
export function parseSheetTimestamp(raw: string, ctx: SheetTimeContext): Date | null;

/** Row parser with dates: createdAt from `timestamps[i]` (serial -> sheetSerialToDate, string -> parse) or else
 *  from the formatted cell via parseSheetTimestamp. Rows whose date cannot be parsed get createdAt = now AND are
 *  reported in `unparsableRows` (1-based sheet rows). Does NOT assign userId16 any more ('' — IDs are assigned by
 *  bulkImportMembers). Clamps to MEMBER_FIELD_LIMITS (today's parser clamps name/city to 60, role to 50). */
export function parseSheetRows(rows: string[][], mapping: ColumnMapping, source: Member['source'],
  opts?: { context?: SheetTimeContext; timestamps?: Array<number | string | null> }):
  { members: Array<Omit<Member, 'id'> & { sheetRow: number; createdAtFromSheet: boolean }>; unparsableRows: number[] };
/** Kept as a thin wrapper for the auto-sync poller: parseSheetRows(...).members. */
export function parseRowsToMembers(rows: string[][], mapping: ColumnMapping, existingCount?: number,
  source?: 'google_form_sync' | 'spreadsheet_import', opts?: { context?: SheetTimeContext;
  timestamps?: Array<number | string | null> }): Omit<Member, 'id'>[];
```
Example: id_ID sheet, `11/10/2026 01.44.06`, zone Asia/Jakarta → `2026-10-10T18:44:06.000Z` (not 10 Nov).
Serial `46306.0723` in Asia/Jakarta → wall clock 2026-10-11 01:44:06 → same instant.

firestoreService.ts ("Fix registration dates from the spreadsheet"):
```ts
/** Admin, no writes. `rows` = formatted values incl. header (A1:Z2000), `timestamps` = fetchTimestampColumn. */
export async function previewRegistrationDateFix(input: { rows: string[][]; mapping: ColumnMapping;
  timestamps: Array<number | string | null>; context: SheetTimeContext }): Promise<RegistrationDateFixPlan>;

/** Admin: writes the selected rows. 7 members per batch (member update + card set = 14 ops). */
export async function applyRegistrationDateFix(rows: RegistrationDateFixRow[],
  onProgress?: (done: number, total: number) => void): Promise<RegistrationDateFixReport>;
```
Preview:
1. Parse every sheet row to `{ sheetRow, date | null, phones (extractAllPhones of phone + phone2 columns), email,
   discord, social, name }`; rows without a date → `unparsableRows`.
2. Read all members from the server. Index sheet rows by normalized phone / email / discord / social / name.
3. Per member, strongest key class that matches wins (`phone > email > discord > social > name`); name matches are
   rejected when both sides have phones (or Discord/email) that differ (same guard as `findDuplicateMember`).
   Among the rows of that class take the EARLIEST timestamp (first time they registered).
4. `ambiguous` when the chosen row is also the best match of another member.
5. Listed only when `|sheet − current| > 1 s` (`unchanged` counts the rest).
6. Default `selected`: strong match (not `name`), not ambiguous, and either `source !== 'web_form'` or the sheet time is
   EARLIER than the stored one (a site registration is only replaced by an earlier form submission).
Apply: re-read the selected members from the server; per member `update(members/{id}, { createdAt: iso })` and, when
`userId16` is a valid KCC ID, `set(memberCards/{id}, buildMemberCard({...fresh, createdAt: iso}))` (card and member
`createdAt` must stay byte-identical: the owner-refresh rule compares them). Errors per batch are collected,
remaining batches continue (each row is independent). Log `registration_dates_fixed` (`count`, `details`: sheet id).

### 2.7 Sheets import with running numbers

`bulkImportMembers(newMembers, onProgress?)` — signature unchanged, semantics:
1. Read existing members (server) as today; a failed read aborts.
2. Pass 1 (in memory, sheet order): each row is matched against existing members AND the new rows accepted so far
   (`findDuplicateMember`). Match with an existing member → an update as today (never `userId16`, `createdAt`,
   `source`, `status`, `authUid`). Match with an earlier NEW row → merged into it (phones via `mergeMemberPhones`,
   empty fields filled, earliest `createdAt` kept). Otherwise → a create.
3. Updates are written as today (member update + card refresh).
4. Creates are sorted by `createdAt` then sheet row and written in chunks of 7:
   - counter exists → admin claim transaction: `tx.get(counter)`, `tx.get(memberCards/{last+1..last+k})` (any exists →
     throw `errors.kccCounterBlocked`), writes `counter.last += k`, k × `members/{kc_…}`, k × `memberCards/{id}`
     (1 + 2k ≤ 15 ops). A failed chunk is counted in `skipped` and the import continues with the next chunk.
   - counter missing → today's legacy path (`generateUniqueChronologicalUserId16` + `addMemberToFirestore`).
5. Returns `{ added, updated, unchanged, skipped, issuedIds }`. Manual import logs `sheets_import` (count = added);
   the auto-sync poller does not log (it already writes `sync_logs`).
Note: rows imported after the switch get the next numbers even if their sheet timestamp is older than existing
members (running number = order of entry into MyKCC from then on).

### 2.8 Admins add/remove/list (new module `src/lib/adminService.ts`)

```ts
export const ADMINS_COLLECTION = 'admins';
/** Admin: every admins/{uid} doc (server), oldest first; console-created docs of any shape are normalized
 *  (string email/name kept, `legacy: true`). The main account is NOT in the list — the UI shows it as a fixed,
 *  non-removable first row ("Main account, cosplaysehat@gmail.com"). */
export async function listAdmins(): Promise<AdminEntry[]>;
/** Admin: makes the member's login an admin. */
export async function addAdmin(member: Member): Promise<AdminEntry>;
/** Admin: removes an admin entry. Removing yourself needs allowSelf (UI confirms). */
export async function removeAdmin(entry: AdminEntry, options?: { allowSelf?: boolean }): Promise<void>;
```
- `addAdmin`: throws `errors.adminNeedsSignIn` when `member.authUid` is empty (never signed in);
  `errors.adminIsMainAccount` when the member's email is the main account's; `errors.adminAlreadyAdmin` when
  `admins/{authUid}` exists (checked with `getDoc` first — `set` on an existing doc would be an update, which the
  rules deny). One batch (2 ops): `set(admins/{uid}, { memberId: member.id, email?: lowercased member email (only if
  non-empty, ≤ 120), name?: ≤ 80, addedBy: me.uid, addedByEmail?: auth.currentUser.email (exact token email, only if
  present), addedAt: serverTimestamp() })` + the `admin_added` log (`targetType 'admin'`, `targetId uid`,
  `targetLabel` name). The rules check that `members/{memberId}.authUid == uid`.
- The new admin's client only notices on its next admin check (sign out/in or reload); say so in the UI.
- `removeAdmin`: one batch: `delete(admins/{uid})` + `admin_removed` log (the log passes because `exists()` sees the
  state before the batch, also when removing yourself).
- Any admin can remove any other admin (owner decision); the main account cannot be removed (no doc).

### 2.9 Dashboard lock (new module `src/lib/dashboardLock.ts`)

```ts
export const DASHBOARD_LOCK_ITERATIONS = 310_000;
export const DASHBOARD_LOCK_IDLE_MS = 15 * 60 * 1000;
export const DASHBOARD_LOCK_MIN_LENGTH = 8;

/** Admin: adminSettings/dashboardLock from the server.
 *  'none'  = no password set (dashboard works as today; main account sees "Set a dashboard password");
 *  'set'   = record present -> ask for the password when isDashboardUnlocked() is false;
 *  'rules-missing' = permission-denied (sprint-2 rules still published: no record can exist) -> dashboard works,
 *            the main account sees "Publish the sprint-3 rules to enable the lock".
 *  Other errors (offline) are thrown; the UI keeps the dashboard LOCKED with a retry button. */
export async function getDashboardLock():
  Promise<{ state: 'none' } | { state: 'set'; record: DashboardLockRecord } | { state: 'rules-missing' }>;
/** PBKDF2-SHA256 via crypto.subtle.deriveBits; new 16-byte salt when none is given. */
export async function hashDashboardPassword(password: string, saltB64?: string, iterations?: number):
  Promise<{ hash: string; salt: string; iterations: number }>;
/** Recomputes with the record's salt + iterations; constant-time byte comparison. */
export async function verifyDashboardPassword(password: string, record: DashboardLockRecord): Promise<boolean>;
/** MAIN ACCOUNT only (isMainAdminUser, else errors.lockMainOnly). Set (no record yet) or change: when a record
 *  exists, `currentPassword` must verify (errors.lockWrongPassword) unless `reauthenticated` is true. */
export async function setDashboardPassword(newPassword: string,
  options?: { currentPassword?: string; reauthenticated?: boolean }): Promise<void>;
/** MAIN ACCOUNT only: removes the lock (same proof as a change). */
export async function clearDashboardPassword(options: { currentPassword?: string; reauthenticated?: boolean }):
  Promise<void>;
/** Forgot password: Google re-authentication of the main account (reauthenticateWithPopup with a basic-scope
 *  provider, login_hint = main email; auth/user-mismatch -> errors.lockReauthWrongAccount). In googleAuth.ts. */
export async function reauthenticateMainAccount(): Promise<void>;

// Session state (client only; nothing secret stored)
export function isDashboardUnlocked(uid: string, record: DashboardLockRecord | null): boolean;
export function markDashboardUnlocked(uid: string, record: DashboardLockRecord): void;
export function touchDashboardActivity(): void;   // throttled (≤ once / 30 s)
export function lockDashboardNow(): void;
```
- Write = one batch: `set(adminSettings/dashboardLock, { algorithm: 'PBKDF2-SHA256', hash, salt, iterations,
  updatedAt: serverTimestamp(), updatedBy: uid })` + `dashboard_lock_set` log; clear = `delete` + `dashboard_lock_cleared`.
  `newPassword` length ≥ 8 (client check only); the password never leaves the browser, only the hash is stored.
- Unlock state lives in `sessionStorage` (`kcc_dash_unlock` = `{ uid, recordStamp: record.updatedAt, lastActivity }`;
  try/catch around storage, missing storage = locked). Unlocked iff same uid, same `recordStamp` (a password change
  relocks every admin), and `now − lastActivity < 15 min`. `sessionStorage` is per tab: a new tab asks again.
- If no record exists: everyone passes; the main account sees "Set a dashboard password". Non-main admins can never
  write the lock (rules).
- UI copy must say: convenience lock for unattended devices; the database rules remain the real protection.

### 2.10 Audit log (new module `src/lib/adminLogService.ts`)

```ts
export const ADMIN_LOGS_COLLECTION = 'adminLogs';
/** For batches: a new log ref + rules-valid data ({ action, actorUid, actorEmail?, at: serverTimestamp(),
 *  targetType?, targetId? <=128, targetLabel? <=120, details? <=1000, count? int>=0 }); id `log_<ms>_<rand6>`.
 *  actorEmail = the ID token's `email` claim (getIdTokenResult(), cached per session) because the rules compare it
 *  with request.auth.token.email byte for byte; omitted when absent. Same for admins.addedByEmail (2.8). A mismatch
 *  would reject the WHOLE batch of a same-batch action, so never take it from form input or member data. */
export function buildAdminLog(input: AdminLogInput): { ref: DocumentReference; data: Record<string, unknown> };
/** Standalone best-effort write: returns false (and console.warns) on failure, never throws. */
export async function writeAdminLog(input: AdminLogInput): Promise<boolean>;
/** Admin: newest first, orderBy('at','desc'), limit(pageSize + 1) + startAfter. */
export async function listAdminLogs(options?: { pageSize?: number /* 50 */; cursor?: AdminLogCursor | null }):
  Promise<{ entries: AdminLogEntry[]; cursor: AdminLogCursor | null; hasMore: boolean }>;
export type AdminLogCursor = { readonly __brand: 'AdminLogCursor' };
```
- Same-batch (guaranteed with the action): admin add/remove, photo delete, member delete/edit/unlink, lock set/clear.
  Best effort after the action: password reset sent, migration, date fix, import, merges, repair, status change.
- Privacy: `targetLabel` = cosname / photo title only, `details` = field NAMES or counts — never phone, email,
  birthday or other personal values of members (all admins read the log).
- Limitation: the log is written by the acting admin's client; an admin using devtools can skip it. It is an
  accountability aid, not tamper-proof auditing (that needs a server).

### 2.11 Auth: password reset, unlink login

```ts
// authService.ts
/** Admin: Firebase password-reset email to the member's stored email. */
export async function sendMemberPasswordReset(member: Member): Promise<void>;
// firestoreService.ts
/** Admin: removes authUid from the member (and ownerUid from its card) so the person can re-link. */
export async function unlinkMemberLogin(member: Member): Promise<Member>;
```
- `sendMemberPasswordReset`: admin check; `email = member.email.trim().toLowerCase()`; empty →
  `errors.memberHasNoEmail`. Calls `sendPasswordResetEmail(auth, email)` WITHOUT actionCodeSettings (a continue URL
  would need an authorized domain). With email-enumeration protection Firebase reports success even when no password
  account exists, so the UI says "If this email has a password login, a reset email was sent. Members who use
  'Continue with Google' have no password — tell them to sign in with Google." Maps `auth/invalid-email`,
  `auth/too-many-requests`, `auth/network-request-failed` to translated errors. Does not touch the admin's own
  session. Logs `password_reset_sent` (targetLabel = name, never the email).
- `unlinkMemberLogin`: admin check; re-read the member from the server; no `authUid` → `errors.memberNotLinked`;
  `member.id === authUid` (a `members/{uid}` sign-in profile: the doc id IS the login) →
  `errors.cannotUnlinkSignInProfile` (merge or delete that doc instead). One batch (3 ops):
  `update(members/{id}, { authUid: deleteField() })`, `set(memberCards/{kccId}, buildMemberCard(memberWithoutAuthUid))`
  (drops `ownerUid`; only when the KCC ID is valid), `member_unlinked` log.
  After unlinking, the person's next sign-in links again through the verified-email path when the member's stored
  email equals their login email (change the stored email first via 2.12 to link a different login). If that login
  also owns a `members/{uid}` sign-in profile, sign-in keeps using it until it is merged/deleted (UI note).
- Out of scope (Admin SDK): changing a login email, deleting an Auth account, unlinking a provider of another user.

### 2.12 Admin member edit

```ts
/** Owner-editable fields + email + status. Never userId16, legacyUserId16, authUid, source, createdAt, memberNumber. */
export const MEMBER_ADMIN_EDITABLE_FIELDS: readonly string[];
/** Like sanitizeMemberProfileUpdate, plus: email (trim, lowercase, <= 120, placeholder emails -> ''), status (enum).
 *  name/cosname mirrored and required; city '' -> 'Worldwide'; phone/phone2 <= 30; additionalPhones <= 3 x 30,
 *  non-empty, trimmed. Throws translated errors for an empty name or an oversized avatar. */
export function sanitizeMemberAdminUpdate(fields: Partial<Member>): Record<string, unknown>;
/** Admin: writes only the CHANGED sanitized fields + refreshes the card, with the log, in one batch (3 ops). */
export async function adminUpdateMember(member: Member, fields: Partial<Member>): Promise<Member>;
```
- The admin rule does not validate the schema, but the member's own later edits run `isValidMember` on the whole doc,
  so admin edits MUST stay within the rule limits (hence the sanitizer) or the member could no longer save.
- Phones: the admin may set/clear `phone2` (`''`) and edit/remove extra numbers (`additionalPhones: []` clears);
  duplicates of `phone` are dropped (normalized digits, like `mergeMemberPhones`).
- Log `member_edited`, `details` = changed field NAMES only.
- A changed stored email does not change the member's login email (Auth) — only the verified-email link/lookup.
- Status changes keep using `updateMemberStatus` (now `isValidKccId` for the card) + best-effort `member_status_changed`.
- `deleteMember` becomes one batch `delete(members/{id})` + `member_deleted` log, then the best-effort card cleanup
  as today (query by `userId16`, works for 8 and 16 digits).

### 2.13 Paged photo listing (galleryService.ts)

```ts
export const PUBLIC_GALLERY_PAGE_SIZE = 12;
export const ADMIN_GALLERY_PAGE_SIZE = 24;
/** One-shot page, newest first: orderBy('createdAt','desc') [+ startAfter(cursor)] + limit(pageSize + 1).
 *  pageSize is clamped to 1..99 (rules: limit <= 100). hasMore = more than pageSize docs came back.
 *  source 'server' (admin) uses getDocsFromServer; default getDocs. */
export async function fetchPhotosPage(options: { pageSize: number; cursor?: PhotoPageCursor | null;
  source?: 'default' | 'server' }): Promise<PhotoPage>;
/** Admin: delete + photo_deleted log in one batch (targetId = photo id, targetLabel = title/character,
 *  details = uploader name). */
export async function deletePhotoAsAdmin(photo: Photo): Promise<void>;
```
- Replaces the app-start `subscribeToPhotos` listener (the ~320 KB Firestore `channel` on every page load): the
  public gallery calls `fetchPhotosPage` when it is opened (12 + "load more"), the admin Gallery tab with 24 per page.
  `subscribeToPhotos` stays exported (deprecated) until no caller remains. Wiring it into the UI is the
  performance/UI stage's job.
- Ties on `createdAt` are handled by `startAfter(docSnapshot)` (Firestore adds the document id to the order).
- Likes: `toggleLikePhoto` unchanged; the UI updates the loaded item optimistically.
- Upload: `addPhotoToFirestore` writes `userId16` = the uploader's current KCC ID (8 digits after the switch).
- Limitation: the web SDK cannot select fields, so every listed photo downloads its full `photoUrl` data (≤ 1 MB).
  Smaller pages + compressed uploads help; a real thumbnail needs a separate small field/doc (rules change, later).

## 3. Firestore rules design (summary of firestore.rules changes)

Written to `C:\Users\Sato\Projects\mykcc\firestore.rules` (not published; the owner publishes, see section 4).

### 3.1 Changes vs the published 2026-10-11 rules
| Area | Change | Weakening? |
|---|---|---|
| KCC ID helpers | `isValidUserId16`/`isReservedUserId16` → `isKccId8`, `isKccId16`, `isValidKccId`, `isReservedKccId` (both formats) | No: 8-digit IDs are accepted only through the counter claim (public) or by admins |
| members create | `isAdmin()` first. Admin: any schema-valid doc (+ `legacyUserId16`), but no NEW 16-digit ID after the switch. Public: same conditions as before PLUS `isPublicKccIdClaim` (8 digits bound to the counter, or 16 digits only before the switch and never `00000000…`) | No (stricter) |
| members update | Admin: unchanged except no NEW 16-digit `userId16` after the switch. Owner/link branches unchanged; `isValidMember` accepts 8-digit IDs and the admin-only `legacyUserId16` | No (stricter) |
| memberCards create | `isAdmin()` first; admin: no NEW 16-digit card after the switch. Public: as before + `isPublicKccIdClaim` | No (stricter) |
| memberCards update/delete | unchanged (`isValidMemberCard` accepts 8 digits) | No |
| memberCardAliases (new) | public get, no list, admin write, strict schema | — |
| counters (new) | public get of `kccId`, no list, admin create, admin monotonic update or bound +1 claim, no delete | — |
| admins | get: own doc OR any admin (was own only); list: admin (was none); create: any admin, strict schema, must point to a member whose `authUid == uid`; update: none; delete: any admin (was console only) | Intentional owner decision (any admin manages admins); main account stays admin by email |
| adminSettings (new) | admin get, no list, main-account write of `dashboardLock` only, strict schema | — |
| adminLogs (new) | admin get/list, admin create with schema (`actorUid == auth.uid`, `at == request.time`, action enum), no update/delete | — |
| photos, sync_logs, siteSettings | unchanged | — |

### 3.2 Why the new rules do not break LIVE (4adcd63) — checked flow by flow
- Anonymous registration (`registerMember`, batch member + card, 16-digit `2026…` ID): public branch, counter absent →
  allowed (1 `exists()` each, 2 total).
- Signed-in profile creation (`createMemberIfAbsent`, transaction) and signed-in registration: `isAdmin()` (1) +
  `exists(counter)` (1) per op → 4 total; allowed while the counter is absent.
- Owner profile edit + card refresh, account link (`authUid`), likes, photo upload/delete, sync logs: unchanged
  branches, unchanged costs.
- Admin: status change, auto-heal, merge (≤ 3 ops), member delete, purge (15 deletes), bulk import (member + card
  batches), repair (15-op batches): admin branches; the extra `exists(counter)` is only paid when a NEW 16-digit ID is
  written (repair of a changed/duplicate ID, card create for a new ID). Main account: ≤ 1 call/op → ≤ 15 per batch.
  A non-main admin running LIVE's repair with ≥ 11 NEW IDs in one batch would exceed 20 (2 calls/op) — in practice the
  DB is already repaired (changed rows ≈ 0); recommendation: during the transition only the main account runs the
  LIVE repair (or nobody).
- `admins/{uid}` own-doc get (client admin check): unchanged.
- LIVE never writes `counters`, aliases, `adminSettings`, `adminLogs`.
=> **The new rules are safe to publish BEFORE any S3 build is promoted.** After the switch (counter exists) LIVE's
registration/profile creation is denied (by design; visible error, nothing half-written because the member and card
are in one batch/transaction).

### 3.3 Document-access cost per request (limit 10/op, 20/request)
"A" = non-main admin (`exists(admins/uid)` = 1); main account = 0 for `isAdmin()`.
| Request | Ops | Calls (anonymous / signed-in non-admin / A) |
|---|---|---|
| S3 public claim (counter +1, card, member) | 3 | counter 2, card 2, member 2 → 6 / 9 / — |
| S3 fallback 16-digit registration (no counter) | 2 | 1 + 1 → 2 / 4 / 4 |
| Migration batch (3 × member update, card create, alias, old-card delete) | 12 | A: 12 (member update sets 8 digits → no counter call) |
| Migration counter create | 1 | A: 1 |
| Import claim (counter + 7 × (member + card), 8 digits) | 15 | A: 15 |
| Admin single claim (counter, member update, card, alias, old-card delete) | 5 | A: 5 |
| Date fix batch (7 × member update + card set) | 14 | A: 14 |
| Admin add (create `admins/{uid}`: isAdmin + get(member)) + log | 2 | A: 3 |
| Admin remove (delete) + log | 2 | A: 2 |
| Photo delete + log | 2 | A: 2 |
| Member edit (member update + card set) + log | 3 | A: 3 |
| Unlink (member update + card set) + log | 3 | A: 3 |
| Dashboard lock write | 1 | main account: 0 |
| Admin list query (`admins`, `adminLogs`) | query | A: 1 |
Rule of thumb for S3: any admin batch that also writes an `adminLogs` entry counts the log as one of its ≤ 15 ops.

## 4. Deploy order / owner runbook

### 4.1 Answer: rules first — yes, safe
The new `firestore.rules` can and MUST be published before any sprint-3 build reaches `mykcc.vercel.app`. Every flow
of the live build `4adcd63` keeps working (section 3.2): all changes are additions, or restrictions that only bite
after the 8-digit switch (counter exists), which only sprint-3 code can start. Order:
**publish rules → verify → promote/merge S3 → verify → admin runs: merge duplicates → fix dates → 8-digit switch.**

### 4.2 Steps for the owner (with checks)
0. **Prepare** (5 min): in the current admin dashboard download the member CSV export (backup of names/IDs);
   make sure nobody else is running admin tools. (Managed Firestore export needs the Blaze plan — not available on
   the current quota; the CSV + the migration CSV in step 5 are the record.)
1. **Publish the rules.** Firebase console → Firestore Database → database dropdown → `ai-studio-kawancosplaymemb-…`
   (NOT `(default)`) → Rules → paste the repo's `firestore.rules` from the sprint-3 PR → optionally test in the
   Rules Playground (cases in 5.2) → **Publish**. The editor refuses syntax errors; if it does, stop and report.
   Keep the previous version: the console's rules history (or `git show 4adcd63:firestore.rules`) is the rollback.
2. **Verify on the LIVE site (still sprint 2), ~10 min:**
   a. Private window, no sign-in: register a test member ("ZZ Test Rules") → success screen with a 16-digit ID →
      KCC ID lookup of that ID shows the card.
   b. Signed-in test member (email/password test account): profile opens, edit + save works.
   c. Main account → Admin: member list loads; change the test member's status; delete it.
   d. Gallery loads; a like works when signed in.
   Any failure → re-publish the previous rules (rollback) and report what failed.
3. **Promote sprint 3** (merge the PR into `main` → Vercel deploys it, or promote the reviewed preview in Vercel).
   ⚠ Never promote a sprint-3 build while the old rules are published — see 4.4.
4. **Verify sprint 3, ~15 min:** on EVERY admin device close all MyKCC tabs and reopen (twice if the old version
   shows; the PWA may serve the previous build once). Then:
   a. Private window: register "ZZ Test S3" → still a 16-digit ID (no counter yet) → lookup works.
   b. Admin: new tabs visible (Admins, Gallery, Audit log); Admins panel lists the main account (+ console admins);
      Audit log shows an entry after deleting the test member.
   c. Main account: set the dashboard password → reload → it asks; wrong password refused; "Lock now" works.
   d. Gallery (public + admin tab) loads 12 / 24 with "load more"; delete nothing yet.
   Turn OFF the Sheets auto-sync poller until step 5 is finished.
5. **Admin run order** (main account, one device, stable Wi-Fi, keep the tab open):
   1. **Merge duplicates** — "Pendaftaran Ganda": bulk merge "identical" (the 74 approved pairs; the owner decides
      on the other 127). Check: the scan shows fewer pairs; a merged keeper's card lookup works.
   2. **Fix registration dates from the spreadsheet** — connect Sheets, pick the KCC form sheet/tab, check the
      column mapping → Preview. Spot-check: a row `11/10/2026 01.44.06` must show 11 Oct 2026 01:44 (WIB), not
      10 Nov; weak (name-only) and ambiguous rows are unticked → Apply. Check: "Registered" in the member list now
      matches the form timestamps; a card lookup shows the same date.
   3. **Switch to 8-digit KCC IDs** — Preview → **download and keep the CSV** (old → new for everyone) → check:
      main account `0000 0000`, admin-range holders keep `0000 00NN`, the earliest registration is `0000 0101`, the
      number of rows = number of members, warnings list is understood (duplicates/unparsable dates → fix first) →
      Apply. If the page closes or errors mid-way: reopen, Preview again (it resumes), Apply again.
   Checks after the switch: report says complete, 0 errors; lookup of three new 8-digit IDs; lookup of three OLD
   16-digit IDs from the CSV → shows the member (with the new ID); private window registration → gets the next
   number after the block (`planEnd + 1`) and its card is found; a signed-in member sees an 8-digit ID and can still
   save their profile; Firestore console: `counters/kccId` exists (`last`, `lastId`, `planEnd`). Delete the test
   registration. Turn the Sheets auto-sync back on.
6. **Afterwards:** never roll production back to a pre-sprint-3 build (its registration is denied by the rules and
   it displays 8-digit IDs wrongly); never delete `counters/kccId` in the console (would reopen 16-digit IDs).
   Other admins must reload their devices before using admin tools (an old build's ID repair is blocked by the
   rules, so it cannot damage data, but it shows errors).

### 4.3 What cannot be undone
The 8-digit switch has no automatic undo. It is resumable and idempotent; every member keeps its old ID in
`legacyUserId16` and every old ID has an alias, so a reverse tool could be written later if ever needed.

### 4.4 Warning: sprint-3 code on the OLD rules
If a sprint-3 build is promoted before step 1:
- still working (fallbacks in 2.3/2.4/2.9): public registration and profile creation (legacy 16-digit path), KCC ID
  lookup, member list, status changes, merge, Sheets import (legacy IDs), owner profile edits;
- BROKEN: everything that writes an audit log in the same batch — **photo delete, member delete/edit/unlink, admin
  add/remove fail completely** (the log write is denied, so the whole batch is rejected); the Admins panel and the
  audit log do not load; the dashboard lock cannot be set ("publish the rules" notice); the 8-digit switch fails at
  its first step (counter create denied — nothing is changed).
Fix: publish the rules (step 1); no data repair needed.

## 5. Test plan

### 5.1 Data layer (pure functions)
The repo has no test runner (don't add one: package.json/bun.lock stay untouched). Keep the logic testable by
exporting the pure cores — `planKccIdMigration(memberRows, counter, mainUid)`, `matchSheetRowsToMembers(...)`,
`buildMigrationBatches(plan)` / `buildImportChunks(...)` — and run a throwaway script outside the repo:
`npx tsx C:/Users/Sato/Projects/tools/sprint3/tests/data-layer.test.ts` (node:assert). Cases:
- **KCC helpers:** `isKccId8('00000101')` T, `'0000 0101'` F (raw value), 7/9 digits F; `isValidKccId` 8+16 T;
  `isReservedKccId`: `00000000` T, `00000100` T, `00000101` F, `0000000000000100` T, `0000000000000101` F,
  `2026101118440601` F; `kccIdFromNumber(101) === '00000101'`, `(0)`, `(99999999)` ok, `(1e8)`, `(1.5)`, `(-1)` →
  RangeError; `formatKccId('00000101') === '0000 0101'`, 16 digits grouped by 4, `'abc'`/`''` → placeholder;
  `format16DigitUserId('00000101') === '0000 0101'` (no padding); `parseKccIdInput('0000 0101')` kcc8,
  `('0000-0000-0000-0101')` legacy16, `('12345')` invalid; `legacyReservedToKcc8`: 16 zeros → `00000000`,
  `0000000000000042` → `00000042`, `0000000000000101` → null; `paddedLegacyToKcc8('0000000000000123') ===
  '00000123'`, `('2026…')` null; `getUserIdBadgeInfo` main/admin/member for both formats.
- **Sheet time:** `parseSheetTimestamp('11/10/2026 01.44.06', {id_ID, Asia/Jakarta})` → `2026-10-10T18:44:06.000Z`;
  `'11/10/2026 01:44:06'` with en_US → 10 Nov (`2026-11-09T18:44:06.000Z` in Jakarta); `'25/10/2026 9.05.00'` with
  en_US → 25 Oct (part > 12 decides); `'31/02/2026 10.00.00'`, `''`, `'hello'`, year 1999 → null;
  `'2026-10-11 01:44:06'` → Jakarta wall clock; `'2026-10-11T01:44:06Z'` → as is.
  `sheetSerialToDate(46306.072291666664, 'Asia/Jakarta')` → `2026-10-10T18:44:06.000Z`; `Europe/London`
  2026-07-01 12:00 → `11:00Z`; a non-existent DST wall time (America/New_York 2026-03-08 02:30) → defined result
  (shifted forward), never NaN. `parseSheetRows`: unparsable row listed in `unparsableRows`; `userId16 === ''`.
- **Migration planner:** fresh plan of shuffled `createdAt` → numbers by time, ties by doc id; 16 zeros → `00000000`;
  `0000000000000005` → `00000005`; first member `00000101`; `planEnd = 100 + members`; alias for every 16-digit
  `fromId`; missing-ID member gets a number, no alias. Duplicate `fromId` → first writes alias, last deletes the
  card. **Resume:** apply rows 1–3 (set `userId16`, `legacyUserId16`), counter `{ last: planEnd + 2, planEnd }` → the
  remaining rows get exactly the originally planned numbers, rows 1–3 are `done`. Late 16-digit member after the
  counter → `late_claim`. Two docs with 16 zeros → the main account's doc keeps `00000000`, the other gets
  `reserved_conflict`. Unparsable date → last + note. Completed plan → `pending === 0`.
- **Date fix matcher:** phone match takes the earliest of duplicate rows; name-only → `selected: false`; one phone on
  two members → `ambiguous`; `web_form` member with a LATER sheet time → unselected, with an EARLIER one → selected;
  delta ≤ 1 s → `unchanged`.
- **Dashboard lock:** hash/verify round trip; wrong password false; output matches the rules (`hash` 44 chars ending
  `=`, `salt` 24 chars); log the time of 310,000 iterations (dev PC) and check on a low-end phone (< 1 s target).
- **Sanitizers:** `sanitizeMemberAdminUpdate` clamps to the rule limits, mirrors name/cosname, never emits
  `userId16`, `legacyUserId16`, `authUid`, `createdAt`, `source`, `memberNumber`.
- **Batch builders:** every batch ≤ 15 ops (migration 12, date fix 14, import 15, admin actions ≤ 3).
- Plus `npx tsc --noEmit` and `npx vite build` as always.

### 5.2 Rules matrix
No emulator is installed (firebase-tools/Java would be a download → ask first). Single-document cases can be run in
the console **Rules Playground** before publishing; multi-document cases (claim, batches, `getAfter`) need the
emulator (`@firebase/rules-unit-testing`) or the live checks of 4.2. Actors: ANON, USER (uid U, unverified), VUSER
(verified email), A2 (uid A with `admins/A`), MAIN (verified main email). State S0 = no counter; S1 = counter
`{ last: 700, lastId: '00000700', planEnd: 650 }`.

**Must pass**
| # | Actor / state | Request | Notes |
|---|---|---|---|
| P1 | ANON S0 | batch: `members/kc_x` + `memberCards/2026101312000001` (userId16 2026101312000001) | LIVE registration |
| P2 | USER S0 | transaction: `members/U` (authUid U) + card, 16 digits | LIVE sign-in profile |
| P3 | ANON S1 | transaction: counter → `{701,'00000701',updatedAt}` + `memberCards/00000701` + `members/kc_y` (00000701) | 6 calls |
| P4 | USER S1 | same as P3 with `members/U`, authUid U | 9 calls |
| P5 | MAIN S1 | create member `00000042` + card | admin range |
| P6 | A2 S1 | counter 700→707 + 7 members + 7 cards (15 ops) | 15 calls |
| P7 | A2 S1 | migration batch: 3 × (member update `userId16`→8 digits + `legacyUserId16`, card set, alias set, old card delete) | 12 calls |
| P8 | A2, no counter | create counter `{650,'00000650',planEnd 650}` | |
| P9 | owner S1 | update own 8-digit member profile fields; refresh own 8-digit card | |
| P10 | VUSER | set `authUid` = own uid on the member with the same email | link |
| P11 | ANON | get `counters/kccId`, `memberCardAliases/{16}`, `memberCards/00000701` | |
| P12 | A2 | create `admins/B` `{memberId m (authUid B), email, name, addedBy A, addedByEmail = token email, addedAt = serverTimestamp}`; list `admins`; get `admins/B`; delete `admins/B` | |
| P13 | MAIN | set valid `adminSettings/dashboardLock`; A2 get; MAIN delete | |
| P14 | A2 | create valid `adminLogs/log_1` (serverTimestamp); list | |
| P15 | A2 S1 | update member status (userId16 unchanged); update member `userId16` → `00000123` | no counter call |
| P16 | MAIN S0 | create 16-digit member + card; LIVE repair batch of 15 card sets | ≤ 15 calls |
| P17 | counter math | last 100/`00000100`, 701/`00000701`, 99999999/`99999999` valid | regex form |

**Must fail**
| # | Actor / state | Request |
|---|---|---|
| F1 | ANON S1 | member or card `00000777` without moving the counter to 777 in the same write |
| F2 | ANON S1 | counter 700→702; 700→701 without creating `memberCards/00000701`; 700→701 to an EXISTING card; changing `planEnd`; `lastId` `'0000701'` / `'00000702'`; any delete of the counter (also MAIN) |
| F3 | S1 | ANON 16-digit member; A2 16-digit member create; A2 16-digit card create; A2 update of a member's `userId16` to a new 16-digit value |
| F4 | ANON | `0000000000000777` (shadow) in S0; `0000000000000000` / `0000000000000100` in S0; `00000000` / `00000100` in S1 |
| F5 | ANON | member create containing `legacyUserId16` |
| F6 | owner | update of own `userId16`, `legacyUserId16`, `status`, `createdAt` |
| F7 | ANON/USER | alias create; ANY actor alias list; A2 alias with 16-digit `kccId` or an 8-digit alias id |
| F8 | USER/A2 | USER create `admins/U`; A2 create with `addedBy` ≠ A, client `addedAt`, extra key `role`, `memberId` whose `authUid` ≠ B, `addedByEmail` ≠ token; any update of `admins/*`; USER list admins; USER get `admins/B` (own doc passes) |
| F9 | A2/MAIN | A2 writes `dashboardLock`; MAIN with `iterations: 50000`, `hash: 'plain'`, extra key `password`, `updatedBy` ≠ uid, client `updatedAt`; MAIN writes `adminSettings/other`; USER get lock |
| F10 | A2/USER | update/delete of `adminLogs/*`; create with other `actorUid`, client `at`, action `'hack'`, other `actorEmail`; USER create/list |
| F11 | any | get `counters/other`; list `counters` |
| F12 | — | all 20 payloads of `security_spec.md` §2 (the original dirty dozen still fail) |

**Known accepted gap (document, not a test failure):** one anonymous write can create TWO member docs with the same
claimed ID (counter +1, one card, members `kc_a` and `kc_b` both `00000701`). Rules cannot count; impact = a duplicate
private record the admin repair fixes (same class as today's duplicate-registration spam).

**Function availability to confirm in the emulator/playground:** `string(int)` and regex concatenation in
`isValidKccCounter` (fallback if the console rejects it: `int(data.lastId) == data.last`, valid only if `int()`
accepts leading zeros — test `int('00000701') == 701` first); `list.concat()` in `memberKeys()` (fallback: write
the full list twice).

### 5.3 Manual end-to-end (in addition to the runbook checks)
- Two private windows register at the same moment after the switch → two consecutive numbers, both cards found.
- Interrupt the migration (close the tab after a few batches) → Preview shows `done` rows and identical numbers for
  the rest → Apply finishes; CSV of the second preview equals the first for the pending rows.
- Dashboard lock: 15 min idle → locked; main account changes the password → a second admin's open dashboard asks
  again on the next check; "forgot password" re-auth with another Google account is refused.
- Admin gallery: delete a photo → gone from the public gallery after reload; log entry present.
- Unlink: unlink a test member, sign in as that member → linked again via the verified email.

## 6. Open risks

1. **Rules not executed locally.** No emulator here; the console compiles on Publish. Behaviour of `string(int)` +
   regex concatenation (counter), `list.concat()`, and `== request.time` with `serverTimestamp()` inside batches must
   be confirmed (5.2; fallbacks listed). Multi-document cases are only covered by the emulator or the live checks.
2. **Enumerable public cards.** Running 8-digit numbers make every card reachable by counting `00000101…`; the counter
   (public get) reveals the member count. Cards hold only the public projection (cosname, role, city, country,
   status, registration date, avatar), but all avatars become trivially scrapable. Owner should know; mitigation if
   unwanted: drop `avatarUrl` from cards (rules + code change).
3. **Counter liveness.** If a card already exists at `last + 1` (an admin write outside the counter, a bug), every
   public registration fails until an admin runs `checkKccCounter` / `advanceKccCounterTo`. Put the health check in
   the admin dashboard and run it after the switch.
4. **Crafted duplicate claims** (known gap, 5.2): one anonymous write can create two member docs with the same new ID.
   Public registration content stays client-controlled (spam) until a server endpoint exists (existing backlog).
5. **Stale clients after the switch.** Cached sprint-2 PWAs: registration denied (visible error, reload fixes); old
   admin builds: ID repair blocked by the rules (data-safe) but 8-digit IDs display wrongly. All admins must reload
   before using admin tools; production must never be rolled back to a pre-sprint-3 build.
6. **Admin management by any admin** (owner decision): a compromised secondary admin can remove the other secondary
   admins and add new ones; only the main account is permanent. The audit log is written by the acting client and
   can be skipped with devtools (the S3 client writes it in the same batch for admin add/remove).
7. **Dashboard lock** is client-side: any admin can read the hash (offline guessing) and bypass the lock with
   devtools; `sessionStorage` is per tab. It protects unattended devices only — UI copy must say so.
8. **Irreversible switch.** No automatic undo (data to build one exists: `legacyUserId16` + aliases). Duplicate old
   IDs: the alias points to the earliest holder. An alias of an old reserved ID points to the reserved 8-digit slot;
   if that slot is later reassigned, the old 16-digit ID shows the new holder.
9. **Time zone of sheet serials.** Serials are wall-clock in the spreadsheet's CURRENT time-zone setting; if that
   setting was changed after responses were collected, old rows shift by the offset difference. The date-fix preview
   spot-check (4.2 step 5.2) catches it.
10. **Unparsable / missing `createdAt`** sorts last in the numbering (warning in the preview; run the date fix first).
11. **Quota/bandwidth.** The migration and the date fix read every member doc (avatars are data URLs up to 1 MB) and
    the photo pass reads every photo once; on the "AI shared quota" plan run them off-peak on Wi-Fi (both resumable).
12. **LIVE repair by a non-main admin** before the switch with ≥ 11 NEW IDs in one batch would exceed 20 calls
    (2 per op). The DB is already repaired, so practically no such batch exists; recommend that only the main account
    (or nobody) runs the old repair during the transition.
13. **Removed admins** keep seeing the dashboard UI until their client re-checks (reload); the rules deny their reads
    and writes immediately.
14. **Console-created `admins` docs** have an unknown shape; they keep granting admin and are listed as `legacy`. They
    can be removed from the app like any other entry.
15. **Photo payload size.** Paging reduces the startup cost, but every listed photo still downloads its full image
    data (no field projection in the web SDK); real thumbnails need a separate small field/doc (later, rules change).
16. **Docs to update by the code agent (not done here):** AGENTS.md §4 table (new collections, admins now app-managed),
    §5 KCC ID (8 digits, `userId16` holds 8 or 16, aliases, counter), never-do list (never delete `counters/kccId`,
    never roll back production after the switch, never write a KCC ID outside the counter).
