# MyKCC sprint 3: UI spec (spec-ui.md)

Status: COMPLETE (2026-10-13). Planning only: no repo files edited, no git state changed.

## 0. Sources and ground rules

Inputs: `requirements.md` (owner decisions 2026-10-13), repo `AGENTS.md`, `spec-data.md` (data contracts, the
DATA group implements them; UI groups code against them exactly), `perf-plan.md` (perf fixes, folded into §3),
the Lighthouse runs `lh-*.json`, and the current components on `claude/sprint-3` (`4adcd63`).

Facts that shape this spec:
- Production (`mykcc.vercel.app`) already serves the `claude/sprint-3` build `4adcd63` (sprint 2 + D3 + all
  translations), promoted by hand in Vercel; `main` (`2d180f0`) is NOT what users see. Every deploy of this sprint
  therefore replaces code that already runs on the 2026-10-11 rules; the deploy-order plan in `spec-data.md` decides
  when rules are published.
- Phone lag (Lighthouse mobile, simulated throttling): score ~60, FCP 3-6 s, LCP 5-8.5 s (LCP = a registration
  header paragraph rendered only after all JS), CLS up to 0.285, ~950 KB transfer, of which ~320 KB is the Firestore
  `photos` listen started by `App` on every page load. Runtime jank (not in Lighthouse): 23 `backdrop-filter`
  declarations, sticky glass header, framer-motion transitions.

Rules every group follows (from AGENTS.md / requirements):
- All UI text via `t('<ns>.<key>')`; new keys in `en` AND `id` only. The 18 other locales get them in the
  translation stage; until then `npx tsc --noEmit` reports missing keys ONLY under `src/i18n/locales/<other>/`.
  Never "fix" that with `Partial<>` types.
- `-webkit-backdrop-filter` before `backdrop-filter`; glass classes in `@layer components`; no `translateZ(0)` /
  `will-change` on glass; button labels may wrap (no global `nowrap`, no `shrink-0` on long-label buttons).
- Motion only from `framer-motion` + `src/lib/motion.ts`; reduced motion (and lite mode, §3) = fades only.
- Admin writes: batches of at most 15 ops (`ADMIN_BATCH_SIZE`); destructive/rewriting actions need
  `window.confirm`, and a preview when many docs are rewritten.
- Never swallow write errors: every mutating UI action shows a success state only after the promise resolves, and
  shows the mapped error (`errors.*`) otherwise.
- Members' personal data never appears in public UI or in `memberCards`.
- No edits to `package.json` / `bun.lock`.

## 1. Component contracts

Conventions for every component below:
- "calls X" = the data-layer function of `spec-data.md` with exactly that signature; UI never re-implements data
  logic (no direct Firestore calls in components, except the existing ones that stay as they are).
- Errors are shown with the existing helpers: `describeFirestoreError(e)` for Firestore/data-layer errors (the
  data layer already throws translated `errors.*` messages; show `e.message` when `e instanceof Error` and it is
  not a Firestore error), `describeSheetsError` for Sheets errors. A failed action never shows a success state.
- Confirmations: `window.confirm(t(...))` (AGENTS.md); bulk rewrites always preview first.
- Haptics: `haptic('success' | 'error' | 'selection')` on completion / tab change, as today.
- Mobile = < 640 px (`sm`), tablet 640-1023, desktop >= 1024. Every new screen: 16 px side gutter, no horizontal
  page scroll (wide tables live in their own `overflow-x-auto` box), 44 px touch targets
  (`touch-target` / `pointer-coarse:min-h-11`), inputs `text-base` (16 px, no iOS zoom).
- Modals/dialogs: the existing sheet pattern (bottom sheet on phones, centered dialog from `sm`), i.e.
  `usePresenceMotion('sheet')` + `useScrollLock` + `useSheetDrag` from `src/lib/motion.ts`, like `MemberCardModal`.
  Admin components only import these existing exports (see §2, motion API freeze).
- New admin surfaces use solid or translucent cards (`glass-card`, `glass-well`), never a NEW `backdrop-filter`
  on in-flow cards (§3 perf rule: blur only on fixed surfaces).
- Placeholders in copy use `{name}` and are filled with `t(key, vars)`; numbers via `formatNumber`, dates via
  `formatDate`.

### 1.A Admin

#### 1.A.0 AdminDashboard shell (`src/components/AdminDashboard.tsx`, ADMIN-UI)

Props: UNCHANGED (`AdminDashboardProps` as today). App does not need to change for any admin feature.

Tabs (segmented control, scrolls sideways on phones, order = slide direction):
`type AdminTab = 'members' | 'gallery' | 'tools' | 'sync' | 'admins' | 'log' | 'analytics'`
| Tab | Label key | Renders |
|---|---|---|
| members | `admin.tabMembers` (existing, `{count}`) | filters + `MemberTable` (1.A.8) |
| gallery | `admin.tabGallery` | `AdminGalleryTab` (1.A.2) |
| tools | `admin.tabTools` | `IdToolsTab` (1.A.6): run-order guide, duplicate merge (moved), KCC ID repair + reserved holders (moved), 8-digit switch, counter health |
| sync | `admin.tabSync` (existing) | `GoogleSheetsSync` (+ `RegistrationDateFixPanel`, 1.A.7) |
| admins | `admin.tabAdmins` | `AdminsPanel` (1.A.1) + (main account only) `DashboardPasswordCard` (1.A.4) |
| log | `admin.tabLog` | `AuditLogTab` (1.A.5) |
| analytics | `admin.tabStats` (existing) | `StatsOverview` (unchanged except `stats.citiesDesc` copy) |

The repair, reserved-holder and duplicate panels move OUT of the members tab into `tools` (the members tab then
renders only the stats strip, filters and the list: faster first paint on phones, and the ID tools sit next to the
8-digit switch in run order). Their logic/state moves with them into `IdToolsTab` (or sub-components); behaviour
unchanged except the 8-digit adjustments in 1.A.6.

New shell state (AdminDashboard):
```ts
type AdminBusyTask = 'migration' | 'dateFix' | 'repair' | 'bulkMerge' | 'import' | 'purge' | 'reassign';
const [busyTask, setBusyTask] = useState<AdminBusyTask | null>(null);
const [kccCounter, setKccCounter] = useState<KccCounter | null | undefined>(undefined); // undefined = loading
const [admins, setAdmins] = useState<AdminEntry[] | null>(null);  // loaded by AdminsPanel / support modal
```
- `kccCounter`: `getKccCounter()` once after the dashboard is unlocked, again after a migration/advance finishes
  (`refreshCounter()` passed down). `null` = pre-switch, object = 8-digit era. Read errors: keep `undefined`
  and show nothing ID-era specific (no crash).
- `busyTask`: long tasks report `onBusyChange(task | null)`. While non-null: (a) other tabs are `aria-disabled`
  and clicking one shows the inline note `admin.busyTabLocked`; (b) "Lock now" is disabled; (c) the idle lock
  is suspended (1.A.3); (d) a `beforeunload` handler asks before closing the page; (e) every other ID-writing
  button (repair, reassign, merge, import, migration, date fix, purge) is disabled. This also prevents a tab
  switch from unmounting a running migration.
- Header actions (existing WhatsApp + Sign out) gain "Lock now" (`admin.lockNow`, `Lock` icon), shown only when a
  lock record exists (state from `DashboardLockGate`, 1.A.3).
- `RESERVED_ID_RANGE_LABEL` becomes format-aware: `'0000 0000 – 0000 0100'` when `kccCounter` is an object,
  else the current 16-digit label (constant strings, not translated).
- Admin set for badges: `admins` (uids) is loaded by `AdminsPanel` and by `MemberSupportModal` on demand
  (`listAdmins()`); the shell caches the last result and passes `admins` + `reloadAdmins()` down so the members
  list can show an "Admin" chip for members whose `authUid` is in the set (`admin.adminChip`). Loaded lazily the
  first time the admins tab or a support modal opens (no extra read on dashboard open).

Mobile layout: header card stacks (title, chips, buttons wrap); the quick-stats strip stays 2 columns; the tab
control scrolls sideways (existing `glass-segmented-scroll`, labels `whitespace-nowrap` as today).

#### 1.A.1 Admins panel (`src/components/admin/AdminsPanel.tsx`, rendered by AdminDashboard tab `admins`)

```ts
interface AdminsPanelProps {
  user: User;                          // signed-in admin
  members: Member[];                   // for the "add admin" picker
  admins: AdminEntry[] | null;         // cached list from the shell (null = not loaded yet)
  onAdminsChange: (next: AdminEntry[]) => void;  // shell cache update
}
```
State: `status: 'loading' | 'ready' | 'error'`, `error: string | null`, `rulesMissing: boolean`,
`removingUid: string | null`, `pickerQuery: string`, `addingMemberId: string | null`,
`notice: { kind: 'success' | 'error'; text: string } | null`.
Behaviour:
- Mount: `listAdmins()` (server). permission-denied → `rulesMissing` → card with `admin.adminsRulesMissing`
  (sprint-2 rules still published) and no actions. Other errors → `admin.adminsLoadFailed` + Retry button.
- List: first row is FIXED and not removable: crown icon, `admin.mainAccountRow` ("Main account"),
  `cosplaysehat@gmail.com`, chip `admin.permanentChip`. Then one row per `AdminEntry` (oldest first): name
  (`entry.name` or `admin.unknownName`), email (or `—`), "Added by" `addedByEmail || shortUid(addedBy)` or
  `admin.addedInConsole` when `legacy`, "When" `formatDate(addedAt)` or `—`, chip `admin.youChip` on the own row.
- Remove: button `admin.removeAdmin` → `window.confirm(t('admin.removeAdminConfirm', { name }))`; own row → a
  second confirm `admin.removeSelfConfirm` and `removeAdmin(entry, { allowSelf: true })`. Success → row removed,
  `notice` `admin.adminRemoved`; error → `notice` with the mapped error. Per-row spinner while removing; other
  remove buttons disabled meanwhile.
- Add: search box (`admin.addAdminSearchPlaceholder`) filters `members` by cosname/name/email/KCC ID (digits
  ignore spaces), max 8 results; each result shows name, formatted KCC ID and either a "Make admin" button
  (`admin.makeAdmin`) or a disabled reason: `admin.makeAdminNeedsSignIn` (no `authUid`), `admin.alreadyAdmin`,
  `admin.isMainAccount`. Confirm `admin.makeAdminConfirm` → `addAdmin(member)` → append to the list, `notice`
  `admin.adminAdded` + the hint `admin.adminTakesEffectHint` (the new admin must reload / sign in again).
- Footer note `admin.adminsInfo`: any admin can add/remove admins; the main account is permanent; removed admins
  lose database access immediately even if their screen still shows the dashboard until reload.
UX states: loading (3 skeleton rows), empty (only the main row + `admin.noOtherAdmins`), error, rules-missing,
per-action busy. Mobile: rows become stacked cards (name + chips on top, email / added-by / date as small lines,
Remove as a full-width secondary button); the picker results stack the same way.

#### 1.A.2 Gallery moderation tab (`src/components/admin/AdminGalleryTab.tsx`, tab `gallery`)

```ts
interface AdminGalleryTabProps { busy: boolean }   // busyTask !== null (disables delete while an ID task runs)
```
State: `photos: Photo[]`, `cursor: PhotoPageCursor | null`, `hasMore: boolean`,
`status: 'loading' | 'ready' | 'loadingMore' | 'error'`, `error: string | null`, `query: string`,
`deletingId: string | null`, `notice`.
Behaviour:
- Mount: `fetchPhotosPage({ pageSize: ADMIN_GALLERY_PAGE_SIZE, source: 'server' })`; "Load more"
  (`admin.loadMore`) appends the next page with the returned cursor; button hidden when `!hasMore`.
  Refresh button (`admin.refresh`) resets to the first page.
- Search (`admin.gallerySearchPlaceholder`): client-side over LOADED items only (title, character, series, event,
  authorName/authorCosname, KCC ID digits); the counter line says `admin.galleryLoadedCount` ("{shown} of {loaded}
  loaded") so admins know older photos need "Load more".
- Item: thumbnail (`<img loading="lazy" decoding="async">` in a fixed `aspect-square` box, `object-cover`, no
  layout shift), title (fallback `admin.galleryUntitled`), character · series, event,
  uploader (authorCosname || authorName) + formatted `userId16` when present, date `formatDate(createdAt)`,
  likes (`admin.galleryLikes`, `{count}`), delete button `admin.galleryDelete`.
- Delete: `window.confirm(t('admin.galleryDeleteConfirm', { title, uploader }))` → `deletePhotoAsAdmin(photo)` →
  remove from `photos`, `notice` `admin.galleryDeleted`; error → `notice` with the mapped error (photo stays).
  Tapping the thumbnail opens the full image in a simple lightbox sheet (same data URL; no extra read).
UX states: loading (skeleton grid of 8), empty (`admin.galleryEmpty`), error (`admin.galleryLoadFailed` + Retry),
no search results (`admin.galleryNoResults`), loading more (spinner in the button), deleting (spinner on the card,
card dimmed). Data note under the header: `admin.galleryDataNote` (each photo downloads its full image; use Wi-Fi
for long sessions).
Mobile: 2-column grid, text below the image (2 lines, truncated), delete as an icon button with label in
`aria-label`; tablet 3 columns; desktop 4 columns.

#### 1.A.3 Dashboard lock gate (`src/components/admin/DashboardLockGate.tsx`, wraps the authorized dashboard)

AdminDashboard renders `<DashboardLockGate user={user} busy={busyTask !== null} onLockState={...}>` around
everything below the access check (the not-authorized screen stays outside the gate).
```ts
interface DashboardLockGateProps {
  user: User;
  onLogout: () => void;                            // existing AdminDashboard prop, for the locked screen
  busy: boolean;                                   // suspends the idle lock
  onLockState: (s: { hasLock: boolean; lockNow: () => void; isMain: boolean;
                     lockState: 'none' | 'set' | 'rules-missing' | 'unknown' }) => void;
  children: React.ReactNode;
}
type GateState =
  | { kind: 'checking' }
  | { kind: 'error'; message: string }                       // offline etc: stays LOCKED
  | { kind: 'open'; lock: 'none' | 'rules-missing' }
  | { kind: 'locked'; record: DashboardLockRecord }
  | { kind: 'unlocked'; record: DashboardLockRecord };
```
Behaviour:
- Mount (and `visibilitychange` → visible, and every 5 min while unlocked): `getDashboardLock()`.
  `none` / `rules-missing` → `open` (children render as today). `set` → `isDashboardUnlocked(user.uid, record)` ?
  `unlocked` : `locked`. A changed `record.updatedAt` relocks automatically (data layer compares the stamp).
  Error → `error` (lock screen with `admin.lockCheckFailed` + Retry); never renders children in this state.
- Locked screen (replaces the dashboard content; header with title stays): lock icon, `admin.lockTitle`,
  `admin.lockDesc`, password input (`type="password"`, `autoComplete="current-password"`, `text-base`), button
  `admin.unlock`. Submit → busy label `admin.unlocking` (PBKDF2 takes up to ~1 s; the button shows a spinner and
  the input is disabled) → `verifyDashboardPassword(pw, record)` → true: `markDashboardUnlocked(uid, record)`,
  state `unlocked`, clear the input; false: `errors.lockWrongPassword` under the input, `haptic('error')`, input
  cleared and focused; after 5 wrong attempts in this tab wait 30 s before the next try (`admin.lockTooManyTries`,
  countdown). Main account also gets "Forgot password?" (`admin.lockForgot`) → 1.A.4 forgot flow. Others get
  `admin.lockAskMain`. Always: Sign out button (existing `onLogout` passed through) and the note
  `admin.lockConvenienceNote` ("convenience lock for unattended devices; database rules remain the real
  protection").
- Unlocked: renders children; listens to `pointerdown`, `keydown`, `wheel`, `touchstart` (passive) →
  `touchDashboardActivity()` (throttled inside). A 30 s interval (and `visibilitychange`) re-checks
  `isDashboardUnlocked`; false → `locked`, UNLESS `busy` (then it calls `touchDashboardActivity()` instead, so
  a running migration is never interrupted; long tasks also touch activity from their progress callbacks).
- `lockNow()` (exposed through `onLockState` for the header button): `lockDashboardNow()` → `locked`. Disabled
  while busy.
- `open` with `lock === 'none'` and main account: banner card at the top of the dashboard `admin.lockNotSetTitle`
  + `admin.lockNotSetDesc` + button `admin.lockSetButton` (opens `DashboardPasswordDialog` mode `set`).
  `rules-missing` and main account: info banner `admin.lockRulesMissing`. Non-main admins see no banner.
Mobile: the locked screen is a single centered card (max-w-md), input and button full width.

#### 1.A.4 Dashboard password set/change/remove/forgot (`src/components/admin/DashboardPasswordDialog.tsx` +
`DashboardPasswordCard.tsx`; MAIN ACCOUNT ONLY)

`DashboardPasswordCard` (in the `admins` tab, rendered only when `isMainAdminUser(user)`): shows the lock status
(`admin.lockStatusOn` with "last changed {date}" from `record.updatedAt`, or `admin.lockStatusOff`), buttons
`admin.lockSetButton` (no record) or `admin.lockChangeButton` + `admin.lockRemoveButton` (record), and the
convenience-lock note. Non-main admins see a read-only line `admin.lockManagedByMain`.
```ts
interface DashboardPasswordDialogProps {
  mode: 'set' | 'change' | 'remove' | 'forgot';
  open: boolean;
  onClose: () => void;
  onDone: () => void;               // gate re-fetches getDashboardLock()
}
```
- `set`: new password + confirm. Client checks: length >= `DASHBOARD_LOCK_MIN_LENGTH` (`admin.lockTooShort`),
  both equal (`admin.lockMismatch`). → `setDashboardPassword(pw)`.
- `change`: current + new + confirm → `setDashboardPassword(pw, { currentPassword })`;
  `errors.lockWrongPassword` shown under "current".
- `remove`: current password + confirm (`admin.lockRemoveConfirm`) → `clearDashboardPassword({ currentPassword })`.
- `forgot`: step 1 explanation `admin.lockForgotDesc` + button `admin.lockReauthButton` →
  `reauthenticateMainAccount()` (Google popup; `errors.lockReauthWrongAccount` shown inline; popup closed =
  silent return to step 1); step 2 = new password + confirm → `setDashboardPassword(pw, { reauthenticated: true })`.
  Also offered from the locked screen (main account) — after success the gate marks the session unlocked with the
  new record (re-fetch, then `markDashboardUnlocked`).
- Busy: all inputs disabled, button label `admin.lockSaving` (hashing ~1 s). Success → `haptic('success')`,
  dialog closes, card shows `admin.lockSaved` (or `admin.lockRemoved`). Inputs never keep values after close.
- Copy in every mode: `admin.lockConvenienceNote`. Password fields `autoComplete="new-password"` except current.
Mobile: bottom sheet, fields stacked, primary button full width at the bottom (sheet scrolls; keyboard-safe:
`padding-bottom: env(safe-area-inset-bottom)`).

#### 1.A.5 Audit log (`src/components/admin/AuditLogTab.tsx`, tab `log`)

State: `entries: AdminLogEntry[]`, `cursor: AdminLogCursor | null`, `hasMore`, `status: 'loading' | 'ready' |
'loadingMore' | 'error'`, `rulesMissing`, `actionFilter: AdminLogAction | 'all'`.
- Mount: `listAdminLogs({ pageSize: 50 })`; "Load more" (`admin.loadMore`) with the cursor; Refresh.
- Row: time `formatDate(at, DATE_TIME_OPTIONS)` (or `admin.logPending` when `at` is null), actor
  (`actorEmail || shortUid(actorUid)`), action label `t(LOG_ACTION_KEYS[action])` (map below; unknown action →
  raw string), target (`targetLabel || targetId`), count (`admin.logCount`, when present), details (plain text,
  `break-words`, max 3 lines with "more" toggle).
- Filter select (`admin.logFilterAll` + one option per action) filters LOADED entries.
- Header note `admin.logInfo` ("Written by the acting admin's device; an accountability aid, not tamper-proof").
- `LOG_ACTION_KEYS: Record<AdminLogAction, TranslationKey>` = `admin.logActionAdminAdded`, `...AdminRemoved`,
  `...PhotoDeleted`, `...MemberDeleted`, `...MemberEdited`, `...MemberUnlinked`, `...MemberStatusChanged`,
  `...PasswordResetSent`, `...KccIdMigration`, `...KccIdRepair`, `...RegistrationDatesFixed`,
  `...DuplicatesMerged`, `...SheetsImport`, `...DashboardLockSet`, `...DashboardLockCleared`.
UX states: loading (skeleton list), empty (`admin.logEmpty`), error (`admin.logLoadFailed` + Retry),
rules-missing (`admin.logRulesMissing`). Mobile: each entry a stacked card (action + time on top, actor and target
below); desktop: a 5-column table (time, actor, action, target, details).

#### 1.A.6 KCC ID tools tab (`src/components/admin/IdToolsTab.tsx`) + 8-digit switch
(`src/components/admin/KccIdMigrationPanel.tsx`) + counter health (`src/components/admin/KccCounterCard.tsx`)

```ts
interface IdToolsTabProps {
  user: User;
  members: Member[];
  kccCounter: KccCounter | null | undefined;
  refreshCounter: () => Promise<void>;
  busyTask: AdminBusyTask | null;
  onBusyChange: (task: AdminBusyTask | null) => void;
  onOpenSync: () => void;            // selectAdminTab('sync') for step 2
}
```
Layout top to bottom:
1. **Run order card** (`admin.runOrderTitle`, `admin.runOrderDesc`): three numbered steps with status chips:
   (1) `admin.runOrderStep1` merge duplicates (chip: last scan result or `admin.runOrderNotScanned`),
   (2) `admin.runOrderStep2` fix registration dates (button `admin.openSheetsSync` (existing key) → `onOpenSync`),
   (3) `admin.runOrderStep3` switch to 8-digit IDs (chip `admin.idEraLegacy` / `admin.idEraKcc8` from
   `kccCounter`). Steps are guidance only (not enforced).
2. **Duplicate registrations** (moved from the members tab, unchanged behaviour; `onBusyChange('bulkMerge')`).
3. **8-digit switch** (`KccIdMigrationPanel`, below).
4. **Counter health** (`KccCounterCard`, only when `kccCounter` is an object).
5. **KCC ID repair** + **reserved holders** (moved; `onBusyChange('repair' | 'reassign')`; after the switch the
   data layer claims counter numbers — UI unchanged except formatted 8-digit IDs and the range label).

`KccIdMigrationPanel` props: `{ kccCounter, refreshCounter, busyTask, onBusyChange }`.
State: `phase: 'idle' | 'previewing' | 'preview' | 'applying' | 'done' | 'error'`,
`plan: KccIdMigrationPlan | null`, `csvSaved: boolean`, `rewritePhotos: boolean` (default true),
`progress: { done; total; phase } | null`, `report: KccIdMigrationReport | null`, `error: string | null`,
`previewPage: number` (50 rows per page), `abortRef: AbortController | null`.
- Header: `admin.migrationTitle`, `admin.migrationDesc` (what happens: chronological renumbering, aliases keep old
  IDs working, cards rebuilt, cannot be undone automatically). Status line: `admin.migrationStatusNotStarted`
  (counter null) / `admin.migrationStatusInProgress` (counter exists and last preview pending > 0) /
  `admin.migrationStatusDone` (counter exists, pending 0).
- Preview (`admin.migrationPreview`; while running `admin.migrationPreviewing`) → `previewKccIdMigration()`.
  Summary chips: total rows, `admin.migrationPending` `{count}`, `admin.migrationDone` `{count}`, main/admin rows,
  `admin.migrationPlanEnd` `{id}` (formatted `kccIdFromNumber(planEnd)`), next public number
  (`planEnd + 1`). Warnings list (`plan.warnings`, shown as given + `admin.migrationWarningsHint` "fix duplicates /
  dates first, then preview again").
- Preview table (own `overflow-x-auto` box, paged 50 rows, page controls as 1.A.8): columns old ID
  (formatted, or `admin.migrationNoOldId`), new ID (formatted, bold; `late_claim` rows show `admin.migrationProvisional`),
  name, registered (`formatDate(createdAt)`), kind chip (`admin.migrationKindMain/Admin/Member/Done`), note chip
  (`admin.migrationNote*` keys: `DuplicateOldId`, `MissingOldId`, `UnparsableCreatedAt`, `ReservedConflict`,
  `LateClaim`). Filter toggle "only rows with notes" (`admin.migrationOnlyNotes`).
- CSV: `admin.migrationDownloadCsv` → `kccIdMigrationCsv(plan)` → Blob (`text/csv;charset=utf-8`) download
  `kcc-id-migration-YYYY-MM-DD.csv`; sets `csvSaved`. Apply stays disabled until `csvSaved` OR the checkbox
  `admin.migrationSkipCsv` ("I already have the CSV") is ticked.
- Options: checkbox `admin.migrationRewritePhotos` (default on) + hint `admin.migrationRewritePhotosHint` (reads
  every photo once — Wi-Fi).
- Apply (`admin.migrationApply`, danger style) → `window.confirm(t('admin.migrationApplyConfirm', { pending,
  first, planEnd }))` → `onBusyChange('migration')` → `applyKccIdMigration(plan, onProgress, { rewritePhotos,
  signal })`; `onProgress` updates the bar AND calls `touchDashboardActivity()`.
  Progress: bar + `admin.migrationProgress` `{done}/{total}` + phase label (`admin.migrationPhaseCounter`,
  `...Members`, `...Late`, `...Photos`) + banner `admin.keepTabOpen`. Cancel (`admin.migrationCancel`) aborts
  after the current batch; the report then says it can be resumed.
- Report: stats grid (migrated, aliases written, cards written, old cards deleted, late claimed, photos updated),
  errors list (first 5 + `admin.bulkMoreErrors`), `complete` → success banner `admin.migrationComplete`; not
  complete → `admin.migrationIncomplete` + button `admin.migrationResume` (= Preview again). Always
  `refreshCounter()` afterwards and `onBusyChange(null)` in `finally`.
- Errors: `errors.migrationPlanChanged` / `errors.migrationAlreadyStarted` → message + button `admin.migrationRepreview`.
- Mobile: summary chips wrap; the preview table keeps its own horizontal scroll (min-width 640) inside the card;
  buttons stack full width; the progress banner is sticky at the bottom of the card (not `position: fixed`).

`KccCounterCard` props `{ kccCounter: KccCounter; refreshCounter; busy: boolean }`:
shows `admin.counterLast` (formatted `lastId`), `admin.counterNext` (next number), button `admin.counterCheck` →
`checkKccCounter()` → `blockedIds.length === 0` ? `admin.counterHealthy` : `admin.counterBlocked` `{ids}` + button
`admin.counterAdvance` → confirm `admin.counterAdvanceConfirm` → `advanceKccCounterTo(max(blockedIds))` →
re-check + `refreshCounter()`.

#### 1.A.7 Registration date fix (`src/components/admin/RegistrationDateFixPanel.tsx`, rendered by
`GoogleSheetsSync` below step 2 "column mapping", only after a spreadsheet was inspected)

```ts
interface RegistrationDateFixPanelProps {
  accessToken: string | null;
  spreadsheetId: string;               // inspected sheet
  tabTitle: string;
  mapping: ColumnMapping;              // current mapping (timestamp column required)
  context: SheetTimeContext;           // sheetTimeContext(meta) stored at inspect time
  busy: boolean;                       // busyTask !== null && busyTask !== 'dateFix'
  onBusyChange: (task: AdminBusyTask | null) => void;
}
```
State: `phase: 'idle' | 'loading' | 'preview' | 'applying' | 'done' | 'error'`, `plan`, `rows`
(local copy with `selected` toggles), `progress`, `report`, `error`, `filter: 'all' | 'selected' | 'weak' |
'ambiguous'`, `page` (50 rows per page).
- Disabled with `admin.dateFixNeedsTimestamp` when `mapping.timestamp < 0`.
- Preview (`admin.dateFixPreview`): `fetchSheetValues(token, id, sheetRange(tab, 'A1:Z2000'))` +
  `fetchTimestampColumn(token, id, tab, mapping.timestamp, rows.length)` →
  `previewRegistrationDateFix({ rows, mapping, timestamps, context })`.
- Summary: `admin.dateFixSummary` (`{changes}`, `{unchanged}`, `{unmatched}`, `{unparsable}`) and the sheet
  context line `admin.dateFixContext` (`{timeZone}`, `{locale}`) + spot-check hint `admin.dateFixSpotCheck`.
- Table: checkbox, name, KCC ID (formatted), current date, sheet date — both shown with
  `formatDate(value, { ...DATE_TIME_OPTIONS, timeZone: context.timeZone })` so they read like the spreadsheet —,
  delta (`formatDelta(deltaMs)`: signed, largest two units, e.g. "−29 d 3 h", "+14 s"), matched-by chip
  (`admin.dateFixMatchPhone/Email/Discord/Social/Name`), `admin.dateFixAmbiguous` chip, source.
  Bulk buttons: `admin.dateFixSelectDefault` (restore `plan` defaults), `admin.dateFixSelectNone`.
- Apply (`admin.dateFixApply` `{count}` selected) → confirm `admin.dateFixApplyConfirm` → `onBusyChange('dateFix')`
  → `applyRegistrationDateFix(selectedRows, onProgress)` (progress touches dashboard activity) → report
  `admin.dateFixDone` (`{updated}`, `{cards}`) + errors list. `finally onBusyChange(null)`.
- Empty plan: `admin.dateFixNothing`. Sheets errors via `describeSheetsError`.
Mobile: rows become cards (checkbox + name on top, "current → sheet" dates stacked, chips below); summary wraps.

`GoogleSheetsSync.tsx` changes (ADMIN-UI): new props `busyTask`, `onBusyChange` (import reports `'import'`; the
import button is disabled while another task runs); store `sheetContext = sheetTimeContext(meta)` at inspect;
manual import and poller: when `mapping.timestamp >= 0` also `fetchTimestampColumn(...)` and pass
`{ context, timestamps }` to the parser (`parseSheetRows` for the manual import so `unparsableRows` can be shown as
`sheets.importUnparsableRows` `{count}` `{rows}` — first 10 row numbers; the poller keeps `parseRowsToMembers`);
the import result shows `sheets.importIssuedIds` (`{count}`, `{first}`, `{last}` formatted) when
`issuedIds?.length`; drop the `existingCount` argument (ignored by the parser now). Render
`RegistrationDateFixPanel` after the import action block.

#### 1.A.8 Member list: table, pagination, fixed column order (`src/components/admin/MemberTable.tsx` +
`src/components/admin/Pagination.tsx`, rendered by AdminDashboard tab `members`)

```ts
interface MemberTableProps {
  members: Member[];                   // already filtered + sorted by AdminDashboard
  totalMembers: number;                // unfiltered count (empty-state wording)
  sortMode: SortMode; onToggleSort: (field: SortField) => void;
  adminUids: ReadonlySet<string>;      // for the Admin chip (empty until admins are loaded)
  onViewCard: (m: Member) => void;     // = onSelectMember (App opens MemberCardModal)
  onManage: (m: Member) => void;       // opens MemberSupportModal
  onDelete: (m: Member) => void;       // existing confirm + deleteMember
  onStatusChange: (m: Member, s: MemberStatus) => void;
  onOpenSync: () => void;
}
interface PaginationProps {
  page: number; pageCount: number; from: number; to: number; total: number;
  pageSize: 25 | 50 | 100 | 'all'; onPage: (p: number) => void; onPageSize: (s: 25 | 50 | 100 | 'all') => void;
}
```
- Column order is defined ONCE: `const MEMBER_COLUMNS = ['member', 'kccId', 'contact', 'discord', 'role', 'age',
  'location', 'status', 'registered', 'actions'] as const;` header cells and body cells are both rendered by
  mapping over it (a `switch(column)` per row), so header and cells cannot drift again. Fixes the bug: Status
  (select) now sits under "Status" and the date under "Registered". Empty-state `colSpan={MEMBER_COLUMNS.length}`.
- CSV export (stays in AdminDashboard): order already matches its headers (… Status, Registration Date); changes:
  KCC ID written FORMATTED (`formatKccId`, so Excel keeps leading zeros of 8-digit IDs), new column
  `admin.csvOldKccId` (legacyUserId16, formatted) right after it, values starting with `= + - @` prefixed with `'`
  (CSV injection), download through a `Blob` (not a `data:` URI — `#` in data breaks it), BOM prefix for Excel.
- Pagination (AdminDashboard state): `pageSize` from `localStorage['kcc_admin_page_size']` (try/catch; default
  25; saved on change), `page` (1-based). `page` resets to 1 when search, any filter, sort or page size change;
  it is clamped when the filtered list shrinks (e.g. after a delete). "All" = one page. `from–to of total` text
  `admin.paginationRange` (`{from}`, `{to}`, `{total}`), controls `admin.pageFirst/pagePrev/pageNext/pageLast`
  (icon buttons with aria-labels), `admin.pageOf` (`{page}`, `{pages}`), page-size select `admin.pageSize` with
  options 25/50/100/`admin.pageSizeAll`. Shown above AND below the list when `pageCount > 1`. Changing the page
  scrolls the list top into view (`behavior: 'smooth'`, `'auto'` with reduced motion / lite mode).
- Status sort chips: `admin.sortStatusAsc` = "▲ Verified first", `admin.sortStatusDesc` = "▼ Pending first"
  (asc order is verified → active → pending, unchanged).
- KCC ID cell: `formatKccId(m.userId16)` (placeholder `---- ----` when empty), under it the old ID
  `admin.oldIdValue` (`{id}` = formatted `legacyUserId16`) when present; badge: `isMainAccountKccId` → main,
  `isAdminRangeKccId` → admin (`adminIdBadge` with `kccNumber`/digits), 8-digit member → `admin.memberIdBadge`,
  16-digit member → existing `admin.timestampIdBadge`. Admin chip (`admin.adminChip`) when
  `adminUids.has(m.authUid)`.
- Search also matches digits typed with spaces/dashes (strip non-digits from the query for the ID comparison) and
  `legacyUserId16`.
- Actions cell: View card (existing), Manage (`admin.manageMember`, opens 1.A.9), Delete (existing).
- Mobile (< 768 px): the table is replaced by a card list rendered from the same data: avatar + name + Admin chip,
  formatted KCC ID + badge, status select (full width), "Registered {date}" line, primary phone, buttons View card
  / Manage (delete lives in the support modal on phones). >= 768 px: the table (own horizontal scroll).
- Rows/cards render only the current page (25 default) — with 760+ members this alone removes most of the
  admin list's render cost on phones.

#### 1.A.9 Member support + edit (`src/components/admin/MemberSupportModal.tsx` +
`src/components/admin/MemberEditForm.tsx`, opened from the member list "Manage")

```ts
interface MemberSupportModalProps {
  member: Member | null;               // null = closed; re-resolved from the live `members` by id on every render
  open: boolean;
  onClose: () => void;
  user: User;                          // acting admin
  admins: AdminEntry[] | null; reloadAdmins: () => Promise<AdminEntry[]>;
  onViewCard: (m: Member) => void;
  onDelete: (m: Member) => Promise<void>;   // shell's confirm + deleteMember; closes the modal on success
}
```
State: `view: 'support' | 'edit'`, `busyAction: null | 'reset' | 'unlink' | 'admin' | 'save' | 'delete'`,
`notice: { kind; text } | null`, `copied: 'id' | 'link' | null`.
Sections (support view):
1. Header: avatar, name, formatted KCC ID (+ `admin.oldIdValue`), status chip, source, login state:
   `admin.loginLinked` (has `authUid`) / `admin.loginNotLinked`, Admin chip / main-account chip.
2. Quick actions:
   - Copy KCC ID (`admin.copyKccId`, copies the formatted ID) and Copy card link (`admin.copyCardLink`, copies
     `https://mykcc.vercel.app/?kcc=<digits>`; contract with App in 1.B.4). `navigator.clipboard.writeText`
     with a textarea fallback; "Copied" state `admin.copied` for 2 s.
   - WhatsApp: one button per number (`phone`, `phone2`, `additionalPhones`), label `admin.whatsappChat`
     `{phone}`; link `https://wa.me/<digits>?text=<encodeURIComponent(t('admin.whatsappTemplate', { name, id }))>`
     where digits = non-digits stripped, leading `0` → `62`, leading `8` → `628…`; opened with
     `target="_blank" rel="noopener noreferrer"`. No numbers → `admin.noPhone`.
   - Password reset (`admin.sendPasswordReset`): disabled with `admin.passwordResetNoEmail` when the member has no
     email. Confirm `admin.passwordResetConfirm` (`{email}`) → `sendMemberPasswordReset(member)` → success notice
     `admin.passwordResetSent` (the neutral "if this email has a password login…" + Google-only explanation);
     errors mapped.
   - Unlink login (`admin.unlinkLogin`): shown when `authUid`; disabled with `admin.unlinkSignInProfile` when
     `member.id === member.authUid`. Confirm `admin.unlinkConfirm` → `unlinkMemberLogin(member)` → notice
     `admin.unlinked` + `admin.unlinkHint` (re-links through the verified email; change the stored email first to
     link a different login).
   - Make admin (`admin.makeAdmin`): same rules/messages as the AdminsPanel picker (1.A.1); uses `admins` (calls
     `reloadAdmins()` once if null) to show `admin.alreadyAdmin`.
   - Out-of-scope note `admin.supportAdminSdkNote` (changing a login email or deleting a login account needs the
     Firebase console).
3. Edit details (button `admin.editDetails` → `view: 'edit'`), Danger zone: Delete member (`admin.deleteMemberTitle`).
`MemberEditForm` props: `{ member: Member; onCancel: () => void; onSaved: (m: Member) => void }`.
- Fields (all `MEMBER_ADMIN_EDITABLE_FIELDS`): cosname (`name`, required), legal name, email, primary WhatsApp,
  backup WhatsApp (`phone2`), extra numbers (`additionalPhones`, up to 3 rows with remove buttons + "Add number"
  `admin.addExtraPhone`), Discord, social media, portfolio URL, country / province / city (plain text inputs —
  no geo loader in admin), age category (same stored values as the filter select), age/birthday, primary role,
  fandom, experience, reason (textarea), status (select). Avatar is NOT editable here (members change their own).
  Inputs carry `maxLength` = `MEMBER_FIELD_LIMITS[field]` (phones 30).
- Save (`admin.saveChanges`): no changes → `admin.noChanges`; else `adminUpdateMember(member, changedFields)` →
  `onSaved(updated)`, notice `admin.memberSaved`; errors under the form. Cancel discards. The live `members`
  snapshot will also update the list.
- Note under email: `admin.emailChangeNote` (changes the stored email only, not the login email).
UX states: per-action spinners; actions disabled while another runs; notice banner at the top of the sheet.
Mobile: full-height bottom sheet (drag-to-dismiss disabled while the edit form is dirty — confirm
`admin.discardChanges`), quick actions as a 2-column grid of buttons, WhatsApp buttons full width.
### 1.B Public (PUBLIC-UI+PERF)

#### 1.B.1 Registration without the extra phone field (`src/components/RegistrationForm.tsx`)
- Remove: the "+ add backup WhatsApp number" button (`registration.addBackupPhone`), the phone2 block (label,
  remove button, notice, input), `showPhone2` state, `formData.phone2`, the `'phone2'` member of `ErrorField`,
  the `backupPhoneTooShortError` validation, and `phone2` in the submit payload, in the sandbox
  `findDuplicateMember` call and in every reset object (lines ~171, 195, 305, 355-358, 405-408, 420, 449, 646,
  834-870 today). The WhatsApp confirmation message keeps `whatsappMessagePhone2` only if
  `submittedMember.phone2` exists (a re-submission merged into an older record may carry one) — leave that line.
- Add under the primary WhatsApp input a one-line hint `registration.extraPhonesInProfileHint` ("You can add more
  WhatsApp numbers later in your profile").
- Keys that become unused (`registration.addBackupPhone`, `backupPhoneLabel`, `removeBackupPhone`,
  `backupPhoneNotice`, `backupPhonePlaceholder`, `backupPhoneTooShortError`): DO NOT delete in this sprint (would
  touch all 20 locales; the translation stage removes them together — listed in §4.3 as "deferred removals").
- KCC ID on the success screen: `formatKccId(submittedMember.userId16)` (8 digits after the switch, 16 before);
  the "16-Digit Single KCC ID" comment/heading uses `registration.singleAccountIdTitle` (changed, §4.2). The
  sandbox (admin demo) path no longer calls `generate16DigitUserId`: it uses `userId16: ''` (shows the placeholder
  `---- ----` + the existing demo label) so the demo never fakes a real-looking number.
- The registration header paragraph is the LCP element: see §3 (render the static hero without waiting for
  Firebase).
- UX states unchanged (submitting, error banner, success card). Mobile unchanged.

#### 1.B.2 Profile: extra WhatsApp numbers (`src/components/UserProfile.tsx`)
```ts
// formData gains: extraPhones: string[]   // [phone2, ...additionalPhones], max 4 entries (1 + MAX_ADDITIONAL_PHONES)
```
- Replace the single "Second / Backup WhatsApp" input with an "Extra WhatsApp numbers" list:
  label `profile.extraPhonesLabel` + hint `profile.extraPhonesHint`; one `type="tel"` input per entry
  (`maxLength={MEMBER_FIELD_LIMITS.phone}`, placeholder `profile.backupPhonePlaceholder`), each with a remove icon
  button (`aria-label` `profile.removeExtraPhone`); "Add number" button `profile.addExtraPhone` while fewer than 4
  entries (new empty input gets focus). Initial list = `[member.phone2, ...member.additionalPhones]` non-empty.
- Save: trim, drop empty entries and entries equal to the primary number or to an earlier entry (compare digits
  only); `phone2 = list[0] ?? ''`, `additionalPhones = list.slice(1)` (always sent, so removing every extra number
  writes `phone2: ''` and `additionalPhones: []`; `sanitizeMemberProfileUpdate` keeps both). Validation: an entry
  with fewer than `MIN_PHONE_DIGITS` digits → inline error `profile.extraPhoneTooShort` (`{minDigits}`) under that
  input; save blocked.
- `profile.kccIdLabel` changed (§4.2); ID shown with `formatKccId(member.userId16)`; "Copy KCC ID" copies the
  formatted ID. When `member.legacyUserId16` exists show a small line `profile.oldKccId` (`{id}` formatted) under it.
- Avatar upload: `compressImage(file, 256, 256, 0.75)` (was 600/0.8) — see §3 (WebP when supported).
- Mobile: list inputs full width, remove buttons 44 px, "Add number" full-width secondary button.

#### 1.B.3 Navbar: one profile button (`src/components/Navbar.tsx`)
- Remove the `profile` entry from `desktopTabs` (and `showProfileTab` if it becomes unused). The avatar button stays
  the single desktop entry: `aria-label={t('common.navProfile')}`, `title` = same, `aria-current="page"` when
  `activeTab === 'profile'`, and a visible active ring (`ring-2 ring-rose-400`) in that state. Signed-out users keep
  the existing sign-in button.
- Mobile menu: keeps its single Profile row (unchanged); the avatar in the mobile header row also opens the profile
  (as today) — that is the same entry point, not a second tab.
- Props unchanged. Logo URL: switch to the self-hosted asset from §3 (both `desktopLogoUrl` and `mobileLogoUrl`).

#### 1.B.4 KCC ID lookup + display for 8 digits (`src/App.tsx` card tab, `MemberCardModal.tsx`, `PhotoGallery.tsx`)
App lookup (`handleLookupCard`):
```ts
const parsed = parseKccIdInput(lookupQuery);          // idGenerator
if (parsed.kind === 'invalid') → setLookupError(t('common.lookupInvalidId'))   // "8 digits (or an old 16-digit ID)"
const res = await lookupMemberCard(lookupQuery);      // firestoreService, 2.4
res === null → t('common.lookupNotFound');
else { setLookupResult(memberCardToMember(res.card)); setLookupResolvedFrom(res.resolvedFrom); }
```
- New state `lookupResolvedFrom: KccLookupSource | null`; when not `'kcc8'`, the result card shows
  `common.lookupOldIdNotice` (`{id}` = `formatKccId(res.card.userId16)`): "This is an old ID. The member's KCC ID
  is now {id}." Permission-denied keeps `common.lookupPermissionDenied`.
- Input: `maxLength={24}` stays (16 digits + spaces), `inputMode="numeric"`, placeholder `common.lookupPlaceholder`
  (changed: 8-digit example `0000 0101`). Live formatting is not required.
- Deep link (contract with ADMIN-UI 1.A.9 "Copy card link"): on first load App reads
  `new URLSearchParams(location.search).get('kcc')`; if it parses (8 or 16 digits) → switch to the `card` tab,
  prefill `lookupQuery`, run the lookup once, and on success open the card modal directly; then remove the
  parameter with `history.replaceState` (keep the hash). Invalid value → ignore silently. The param name `kcc`
  and value = digits only are the whole contract.
- Main-account display override: replace `MAIN_ACCOUNT_UID` in `handleOpenCard`, `handleAuthSuccess`,
  `onUpdateMember` and `uploadFallbackMember` with state `mainKccId` resolved once per main-account sign-in via
  `mainAccountKccId()` (default `MAIN_ACCOUNT_UID` until it resolves; errors keep the default). The
  `onUpdateMember` check `currentMember?.userId16 === MAIN_ACCOUNT_UID` becomes `isMainAccountKccId(...)`.
- Every `format16DigitUserId(id, email)` call in App, MemberCardModal, PhotoGallery, RegistrationForm, UserProfile
  becomes `formatKccId(id)` (the email argument was display-only and is dropped; the main account is handled by
  the override above).
MemberCardModal:
- ID `formatKccId(member.userId16)` (8 digits render larger: `text-2xl` vs the 16-digit `text-lg`; use a
  `isKccId8` check). Share: `navigator.share({ title, text, url: cardLink })` where
  `cardLink = 'https://mykcc.vercel.app/?kcc=' + digits` (fallback copies `text + ' ' + cardLink`); the
  `card.shareText` key is unchanged.
- QR stamp (if it encodes the ID): encode the card link instead of the raw ID.
PhotoGallery: detail viewer shows `gallery.detailKccId` (changed) + `formatKccId(photo.userId16)`; the grid keeps
the last-4 digits chip (works for both formats).

#### 1.B.5 Public gallery: paged, opened on demand (`src/components/PhotoGallery.tsx`, `src/App.tsx`,
`src/components/UploadPhotoModal.tsx`)
```ts
interface PhotoGalleryProps {           // `photos` prop REMOVED
  currentMember: Member | null;
  user: FirebaseUser | null;
  onOpenUpload: () => void;
  onRequireLogin: () => void;
  currentLang: LanguageCode;            // kept for callers
  addedPhoto: Photo | null;             // last photo uploaded in this session (App passes it; prepended once by id)
}
```
- App: delete the app-start `subscribeToPhotos` effect and the `photos` state (this removes the ~320 KB Firestore
  listen on EVERY page load). `UploadPhotoModal.onPhotoAdded(photo)` → App `setAddedPhoto(photo)` and switches to
  the gallery tab as today.
- PhotoGallery owns: `photos`, `cursor`, `hasMore`, `status: 'loading' | 'ready' | 'loadingMore' | 'error'`.
  On mount: `fetchPhotosPage({ pageSize: PUBLIC_GALLERY_PAGE_SIZE })`; "Load more" button
  (`gallery.loadMore`, spinner `gallery.loadingMore`) appends the next page; hidden when `!hasMore`. The loaded
  list is kept in a module-level cache (`let galleryCache: { photos; cursor; hasMore } | null`) so switching tabs
  and back does not refetch; a Refresh control (`gallery.refresh`) clears it. `addedPhoto` is prepended once
  (dedupe by id).
- Counts: the header chip `gallery.photosAvailableOne/Other` now counts LOADED photos; when `hasMore` append
  `gallery.morePhotosHint` ("+ more") — no total count query.
- Filters (search, character, event) work on loaded photos; with `hasMore` and an empty filter result show
  `gallery.filterLoadMoreHint` with a Load more button.
- Likes: optimistic `likesCount + 1` on the loaded item (`toggleLikePhoto` unchanged); on failure revert and
  `console.warn`.
- Images: `loading="lazy" decoding="async"` on every card, inside a fixed aspect box (no CLS); `cv-auto` stays on
  the cards.
- UX states: loading (skeleton grid of 6 cards with fixed aspect), empty (existing empty card), error
  (`gallery.loadFailed` + Retry), loading more, end of list (nothing). Mobile: unchanged 1-2 column grid.
- UploadPhotoModal: compress to `compressImage(file, 1600, 1600, 0.75)` (long side 1600) — §3 for WebP; props
  unchanged.

## 2. File ownership (three parallel groups, no shared files)

Every repo file has exactly ONE owner group; a group never edits a file it does not own. Cross-group needs go
through the contracts in `spec-data.md` and §1 (signatures fixed before work starts). Repo root:
`C:\Users\Sato\Projects\mykcc`.

### 2.1 DATA
| Files | Notes |
|---|---|
| `src/lib/firestoreService.ts`, `galleryService.ts`, `sheetsService.ts`, `idGenerator.ts`, `authService.ts`, `googleAuth.ts`, `firebase.ts` | spec-data §2 |
| NEW `src/lib/adminService.ts`, `src/lib/dashboardLock.ts`, `src/lib/adminLogService.ts` | spec-data 2.8-2.10 |
| `src/types/index.ts` | spec-data 2.1 |
| `src/i18n/locales/en/errors.ts`, `src/i18n/locales/id/errors.ts` | new + changed `errors.*` keys (§4) |
| `firestore.rules`, `security_spec.md`, `firebase.json` | already written by the data architect; DATA keeps them in sync if code review finds a mismatch |
| `AGENTS.md` | §4 table, §5 KCC ID, never-do list, §8 status (spec-data §6 item 16); the integrator may append the final status line |
| `api/*`, `server.ts` | untouched this sprint (listed so nobody else edits them) |

DATA extra tasks that come from `perf-plan.md` (not in spec-data, but in DATA files):
- **F2 lib part:** `firebase.ts`: `initializeAuth(app, { persistence: [indexedDBLocalPersistence,
  browserLocalPersistence, browserSessionPersistence] })` without `popupRedirectResolver` (try/catch → `getAuth(app)`
  on "already initialized"); pass `browserPopupRedirectResolver` as 3rd argument at every popup call
  (`authService.ts` Google/Apple/Microsoft, `googleAuth.ts` `signInWithPopup` + `reauthenticateWithPopup`, and the
  new `reauthenticateMainAccount`). NEW export (contract for both UI groups):
  ```ts
  /** Loads the popup resolver (auth iframe + gapi) ahead of a sign-in tap; safe to call repeatedly. */
  export function warmAuthPopup(): void;   // src/lib/firebase.ts: void getRedirectResult(auth, browserPopupRedirectResolver).catch(() => {})
  ```
- `galleryService.subscribeToPhotos` stays exported (deprecated) until PUBLIC removes the last caller; DATA does
  not delete it this sprint (avoids a cross-group ordering dependency; the integrator may delete it at the end).

### 2.2 ADMIN-UI
| Files | Notes |
|---|---|
| `src/components/AdminDashboard.tsx` | shell, tabs, filters, pagination state, CSV, busy/lock wiring (1.A.0, 1.A.8) |
| NEW `src/components/admin/*` | `AdminsPanel.tsx`, `AdminGalleryTab.tsx`, `DashboardLockGate.tsx`, `DashboardPasswordDialog.tsx`, `DashboardPasswordCard.tsx`, `AuditLogTab.tsx`, `IdToolsTab.tsx`, `KccIdMigrationPanel.tsx`, `KccCounterCard.tsx`, `RegistrationDateFixPanel.tsx`, `MemberTable.tsx`, `Pagination.tsx`, `MemberSupportModal.tsx`, `MemberEditForm.tsx`, `adminUi.tsx` (shared admin helpers: `renderRich`, `downloadCsv`, `waLink`, `formatDelta`, `shortUid`, `DATE_TIME_OPTIONS`, `LOG_ACTION_KEYS`, the `AdminBusyTask` type). Sub-split freely inside this folder. |
| `src/components/GoogleSheetsSync.tsx` | 1.A.7 changes |
| `src/components/StatsOverview.tsx` | only if needed (the `stats.citiesDesc` change is copy-only) |
| `src/components/DemoFormTester.tsx` | owner of the `demo` namespace; props/export unchanged (RegistrationForm imports it) — only 16→8 digit wording/presets |
| `src/i18n/locales/en/{admin,sheets,stats,demo}.ts`, `src/i18n/locales/id/{admin,sheets,stats,demo}.ts` | new/changed keys (§4) |
| `src/i18n/locales/<18 other langs>/admin.ts` | ONLY to delete `loginPrompt` (§4.3); no other edits in the other languages |

ADMIN-UI uses (read-only imports): `src/lib/motion.ts` (`usePresenceMotion`, `useScrollLock`, `useSheetDrag`,
`useThumbTransition`, `useReducedMotion`, `LAYOUT_IDS`, `MotionTransition`, `SPRING`, `TWEEN`), `src/lib/haptic.ts`,
`warmAuthPopup` (call it on `DashboardPasswordDialog` mode `forgot` mount and on `GoogleSheetsSync` mount).

### 2.3 PUBLIC-UI+PERF
| Files | Notes |
|---|---|
| `src/App.tsx`, `src/main.tsx`, `src/index.css`, `index.html`, `vite.config.ts` | 1.B + §3 |
| `src/components/Navbar.tsx`, `RegistrationForm.tsx`, `UserProfile.tsx`, `MemberCardModal.tsx`, `PhotoGallery.tsx`, `UploadPhotoModal.tsx`, `AuthModal.tsx`, `OfficialGovBanner.tsx`, `SiteEditorModal.tsx`, `KawanCosplayLogo.tsx`, `PWAInstallButton.tsx` | |
| NEW `src/components/StickyHeader.tsx` (F8), NEW `src/components/PerfModeControl.tsx` (F7 toggle) | |
| UI libs in `src/lib`: `imageUtils.ts`, `motion.ts`, `haptic.ts`, `themeContext.tsx`, `worldLocations.ts`, NEW `src/lib/perfMode.ts` | decision: DATA owns `src/lib/*` EXCEPT these six, which are UI/perf helpers with no data contracts |
| `src/hooks/*` | |
| `src/i18n/I18nProvider.tsx`, `runtime.ts`, `index.ts`, `languages.ts`, `types.ts` | F3 (static `id`, locale before first render), F11 font preconnect; the key TYPES (`types.ts`) must keep their shape |
| `src/i18n/locales/en/{common,registration,profile,card,gallery,auth,siteEditor}.ts` + the same seven in `id/` | new/changed keys (§4) |
| `public/*` (NEW `public/brand/kcc-logo-96.webp`, `kcc-logo-160.webp`), `public/geo/*` untouched | F4 |

motion API freeze (PUBLIC promises, ADMIN-UI relies on it): every export listed in 2.2 keeps its name and
signature. `useReducedMotion` keeps its name but becomes framer's `useReducedMotionConfig()` result (`?? false`) so
lite mode (`MotionConfig reducedMotion="always"`) reaches every component without edits in admin files.

### 2.4 Nobody edits (this sprint)
`package.json`, `bun.lock`, `src/i18n/locales/<18 other langs>/*` except the `admin.ts` deletion above,
`src/i18n/locales/{en,id}/index.ts` (no new namespace: perf/lite keys go into `common`), `scripts/*`, `public/geo/*`,
`docs/TRANSLATING.md`.

### 2.5 Cross-group contracts (summary)
| From → to | Contract |
|---|---|
| DATA → both UIs | every signature in spec-data §2 (exact names); `warmAuthPopup()`; thrown errors are already translated |
| ADMIN-UI → PUBLIC | card link `https://mykcc.vercel.app/?kcc=<8 or 16 digits>`; PUBLIC's App opens the card for it (1.B.4) |
| PUBLIC → ADMIN-UI | `motion.ts` API freeze; `MemberCardModal` keeps `{ member, onClose }`; App keeps passing the same `AdminDashboardProps`; `RegistrationForm` keeps importing `DemoFormTester` with today's props |
| PUBLIC → DATA | `subscribeToPhotos` caller removed (DATA may then mark it deprecated); App stops importing `MAIN_ACCOUNT_UID` for display (uses `mainAccountKccId()`) |

## 3. PUBLIC-UI+PERF task list (perf-plan.md folded in)

`perf-plan.md` exists (complete, 2026-10-13); its fixes F1-F12 are folded in below (F13 is NOT in scope; only if
the budget is still missed after measuring). Work top to bottom; commit/save after each item. Budgets to verify
(perf-plan §7): score >= 85, FCP <= 2.3 s, LCP <= 3.0 s, CLS < 0.05 in every run, landing transfer <= 420 KB,
<= 3 origins, Firestore bytes on landing <= 5 KB.

| # | Task | Files | Source |
|---|---|---|---|
| P1 | **Gallery on demand, paged** — remove the app-start `subscribeToPhotos` effect + `photos` state; PhotoGallery owns paging (`fetchPhotosPage`, 12, Load more, module cache, optimistic likes, `addedPhoto` prepend). Lite mode / lowData: page size 8. No live listener. | `App.tsx`, `PhotoGallery.tsx` | F1, 1.B.5 |
| P2 | **Auth popup warm-up** — call `warmAuthPopup()` in `AuthModal` on mount (and on pointerdown of the navbar sign-in button). Popup-blocked messages say "tap again" (`auth`/`common` copy, §4). Depends on DATA's F2 lib part. | `AuthModal.tsx`, `Navbar.tsx` | F2 |
| P3 | **First frame = final frame** — `<AnimatePresence mode="wait" initial={false}>` on the main column; import the `id` dictionary statically next to `en`; `main.tsx` awaits `loadLocale(getInitialLanguage())` (cap 1.5 s) before `createRoot().render()`; the I18nProvider starts with the loaded dictionary (no en→id re-render). | `App.tsx`, `main.tsx`, `src/i18n/runtime.ts`, `I18nProvider.tsx` | F3 |
| P4 | **Logo** — `public/brand/kcc-logo-96.webp` + `kcc-logo-160.webp` (from the current 800 px PNG, made once with any tool, committed; no new dependency); `KawanCosplayLogo` gets `width/height={44}`, `srcSet`, `sizes`, `fetchPriority="high"`, `decoding="async"`, keeps the `onError` emblem fallback; Navbar uses the local files; `index.html` preloads the 96 px file (`imagesrcset`/`imagesizes`). | `public/brand/*`, `KawanCosplayLogo.tsx`, `Navbar.tsx`, `index.html` | F4 |
| P5 | **Theme cache** — `themeContext` starts from `localStorage['kcc_theme_v1']` (try/catch, validated), skips identical snapshots, memoized value; optional inline script copies the cached gradient to `--app-bg`; start the theme snapshot after first paint (`requestIdleCallback`, 2 s timeout). | `themeContext.tsx`, `App.tsx`, `index.html` | F5 |
| P6 | **Blur only on fixed surfaces on phones** — in `@layer components`, `@media (max-width: 767px)`: `.glass-chip`, `.glass-icon-button` → `-webkit-backdrop-filter: none; backdrop-filter: none;` + slightly stronger fill; header/tabbar `blur(14px) saturate(140%)`, sheets/menus `blur(18px) saturate(150%)` on phones; remove the unused `.glass-card-frosted` / `.glass-elevated` blur rules if still unused (grep). `-webkit-` first, no `will-change`/`translateZ`. | `index.css` | F6 |
| P7 | **Lite / low-power mode** — `src/lib/perfMode.ts` (`'auto' \| 'lite' \| 'full'` in `localStorage['kcc_perf_mode']`, signals: deviceMemory <= 4, hardwareConcurrency <= 4 except Apple touch devices, Save-Data, effectiveType 2g/slow-2g (3g = lowData only), prefers-reduced-transparency; `usePerfMode()` via `useSyncExternalStore`, `setPerfMode()`); inline `<head>` script sets `html[data-perf="lite"]` / `data-lowdata` before CSS (no flash); CSS: lite repeats the reduced-transparency selector list (no backdrop-filter, solid fills), hides `.ambient-layer`, transitions <= 120 ms, static skeleton shimmer, instant header hide/show; `MotionConfig reducedMotion={lite ? 'always' : 'user'}` at both App roots; `motion.ts` `useReducedMotion` → `useReducedMotionConfig() ?? false` (same export name); no idle prefetch in lite/lowData. Toggle `PerfModeControl` (3-option `.glass-segmented` radiogroup, keys `common.perfMode*`) in the Navbar mobile menu under the language selector, in the desktop language popover, and as a footer text button; one-time toast `common.perfLiteNotice` when auto turns lite on (`kcc_perf_notice_seen`, try/catch). | NEW `src/lib/perfMode.ts`, NEW `PerfModeControl.tsx`, `index.html`, `index.css`, `motion.ts`, `App.tsx`, `Navbar.tsx` | F7, req. 11-13 |
| P8 | **Scroll without App re-render** — `StickyHeader` component owns the scroll listener + `isVisible` and renders the sticky wrapper (OfficialGovBanner + Navbar); hide/show `duration-300`, transform only; `React.memo(RegistrationForm)` with stable callbacks (`useCallback`, memoized empty `existingMembers`). | NEW `StickyHeader.tsx`, `App.tsx`, `RegistrationForm.tsx` | F8 |
| P9 | **Cheaper transitions** — `TWEEN.pageIn = { duration: 0.2, ease: [0.22, 1, 0.36, 1] }` for `pageVariants`/`tabVariants` animate, exit ~0.1-0.12 s opacity; sheets keep `SPRING.sheet`. (Admin tabs use `tabVariants` and benefit automatically.) | `motion.ts` | F9 |
| P10 | **content-visibility** — `cv-auto` + `[contain-intrinsic-size:auto_420px]` on registration sections from the third card on; not on sections with sticky/popovers; verify error scroll-to-field + focus. | `RegistrationForm.tsx`, `index.css` | F10 |
| P11 | **Startup trims** — drop the Google Fonts preconnects (`ensureLanguageFont` adds its own preconnect + `display=swap` for script languages); preconnect `https://firestore.googleapis.com`; inline `<style>html,body{background:#05020a}</style>`; `VitePWA({ injectRegister: 'script-defer' })`; skip idle prefetch on lite / Save-Data / 2g-3g; load `/geo/*.json` when the address section nears the viewport or the country select is focused. | `index.html`, `vite.config.ts`, `App.tsx`, `RegistrationForm.tsx`, `worldLocations.ts`, `src/i18n/runtime.ts` | F11 |
| P12 | **Upload compression** — `compressImage(file, { maxSide, quality = 0.75, type = 'image/webp', maxChars })`: `createImageBitmap` (EXIF orientation) with `<img>` fallback, no FileReader for Files, never upscale, `toBlob` + check `blob.type` (fallback JPEG), size guard (photos 900,000 chars, avatars 120,000; retry quality −0.1 to 0.5, then side ×0.8), release bitmap/canvas. Call sites: photo `{ maxSide: 1600 }`, avatars `{ maxSide: 256 }` (registration + profile). Keep a positional-args overload for any untouched caller, or update all callers (all are PUBLIC files). Thumbnail split (`photoFiles`) is OUT of scope (needs a rules change not in spec-data) → follow-up. | `imageUtils.ts`, `UploadPhotoModal.tsx`, `RegistrationForm.tsx`, `UserProfile.tsx` | F12 |
| P13 | Registration without extra phone field | `RegistrationForm.tsx` | 1.B.1 |
| P14 | Profile extra numbers | `UserProfile.tsx` | 1.B.2 |
| P15 | Navbar single profile button | `Navbar.tsx` | 1.B.3 |
| P16 | KCC ID 8 digits: lookup (`lookupMemberCard`), old-ID notice, `?kcc=` deep link, `formatKccId` everywhere, main-account override via `mainAccountKccId()`, share link | `App.tsx`, `MemberCardModal.tsx`, `PhotoGallery.tsx`, `RegistrationForm.tsx`, `UserProfile.tsx` | 1.B.4 |
| P17 | i18n en + id for the PUBLIC namespaces (§4) | `src/i18n/locales/{en,id}/{common,registration,profile,card,gallery,auth,siteEditor}.ts` | §4 |
| P18 | Measure: 3 Lighthouse mobile runs on `vite preview` (localhost:4173) after P1-P5 + P11, compare medians with the saved `lh-local-*`; real-phone check of P6-P9 (perf-plan §7) | — | perf-plan §7 |

Banner defensiveness (perf-plan §5): give the `OfficialGovBanner` row a fixed `min-h` on phones (2 lines reserved) so a
language with longer copy cannot shift the main column.

## 4. i18n keys

Rules: add to `en` (typed source) AND `id`, same `{placeholders}` in both. Generic buttons reuse existing keys:
Retry = `common.tryAgain`, Close = `common.close`, "(Optional)" = `common.optional`. Admin edit-form field labels
reuse the existing `admin.csv*` keys (cosname, legal name, email, primary/backup WhatsApp, Discord, age category,
age, country, province, city, primary role, fandom, experience) and `admin.colStatus`; only the missing labels are
new. Wording below is the proposal; implementers may polish it but must keep the key names and placeholders.

### 4.1 New keys

#### 4.1.1 ADMIN-UI — `admin` namespace (`src/i18n/locales/{en,id}/admin.ts`)
| Key | English | Indonesian |
|---|---|---|
| tabGallery | Gallery | Galeri |
| tabTools | KCC ID Tools | Alat KCC ID |
| tabAdmins | Admins | Admin |
| tabLog | Audit Log | Log Aktivitas |
| busyTabLocked | A task is still running. Wait until it finishes (or stop it) before switching tabs. | Masih ada proses yang berjalan. Tunggu sampai selesai (atau hentikan) sebelum pindah tab. |
| keepTabOpen | Keep this tab open until it finishes. | Biarkan tab ini tetap terbuka sampai selesai. |
| lockNow | Lock now | Kunci sekarang |
| refresh | Refresh | Muat ulang |
| loadMore | Load more | Muat lebih banyak |
| cancel | Cancel | Batal |
| showMore | More | Selengkapnya |
| showLess | Less | Ringkas |
| adminChip | Admin | Admin |
| memberIdBadge | Member | Anggota |
| oldIdValue | Old ID: {id} | ID lama: {id} |
| manageMember | Manage | Kelola |
| csvOldKccId | Old KCC ID (16 digits) | KCC ID Lama (16 Digit) |
| paginationRange | {from}–{to} of {total} | {from}–{to} dari {total} |
| pageOf | Page {page} of {pages} | Halaman {page} dari {pages} |
| pageFirst | First page | Halaman pertama |
| pagePrev | Previous page | Halaman sebelumnya |
| pageNext | Next page | Halaman berikutnya |
| pageLast | Last page | Halaman terakhir |
| pageSize | Rows per page | Baris per halaman |
| pageSizeAll | All | Semua |
| mainAccountRow | Main account | Akun utama |
| permanentChip | Permanent | Permanen |
| youChip | You | Anda |
| unknownName | (no name) | (tanpa nama) |
| adminsColName | Name | Nama |
| adminsColEmail | Email | Email |
| adminsColAddedBy | Added by | Ditambahkan oleh |
| adminsColAddedAt | Added on | Ditambahkan pada |
| addedInConsole | Added in the Firebase console | Ditambahkan lewat Firebase console |
| removeAdmin | Remove admin | Hapus admin |
| removeAdminConfirm | Remove "{name}" as admin? They lose access to the dashboard and member data immediately. | Hapus "{name}" dari admin? Aksesnya ke dasbor dan data anggota langsung dicabut. |
| removeSelfConfirm | This is YOUR OWN admin access. After removing it you can no longer open this dashboard. Continue? | Ini akses admin ANDA SENDIRI. Setelah dihapus, Anda tidak bisa membuka dasbor ini lagi. Lanjutkan? |
| adminRemoved | {name} is no longer an admin. | {name} bukan admin lagi. |
| addAdminTitle | Add an admin | Tambah admin |
| addAdminSearchPlaceholder | Search a member by name, email or KCC ID | Cari anggota berdasarkan nama, email, atau KCC ID |
| makeAdmin | Make admin | Jadikan admin |
| makeAdminNeedsSignIn | Has never signed in — they must sign in to MyKCC once first. | Belum pernah login — anggota harus login ke MyKCC sekali dulu. |
| alreadyAdmin | Already an admin | Sudah menjadi admin |
| isMainAccount | Main account (always admin) | Akun utama (selalu admin) |
| makeAdminConfirm | Make "{name}" ({id}) an admin? Admins can see all member data and can add or remove other admins. | Jadikan "{name}" ({id}) admin? Admin dapat melihat semua data anggota dan dapat menambah atau menghapus admin lain. |
| adminAdded | {name} is now an admin. | {name} sekarang menjadi admin. |
| adminTakesEffectHint | It takes effect after they reload MyKCC or sign in again. | Berlaku setelah mereka memuat ulang MyKCC atau login ulang. |
| adminsInfo | Any admin can add or remove admins. The main account ({email}) is always an admin and cannot be removed. A removed admin loses database access immediately, even if their screen still shows the dashboard until they reload. | Setiap admin dapat menambah atau menghapus admin. Akun utama ({email}) selalu admin dan tidak bisa dihapus. Admin yang dihapus langsung kehilangan akses database, walaupun layarnya masih menampilkan dasbor sampai dimuat ulang. |
| noOtherAdmins | No other admins yet. | Belum ada admin lain. |
| adminsLoadFailed | Could not load the admin list. | Daftar admin tidak dapat dimuat. |
| adminsRulesMissing | The admin list needs the sprint-3 database rules. Ask the owner to publish the latest firestore.rules, then reload. | Daftar admin membutuhkan aturan database sprint 3. Minta pemilik memublikasikan firestore.rules terbaru, lalu muat ulang. |
| galleryTitle | Gallery Moderation | Moderasi Galeri |
| galleryDesc | All member photos, newest first. Deleting removes a photo permanently. | Semua foto anggota, terbaru dulu. Menghapus berarti foto hilang permanen. |
| gallerySearchPlaceholder | Search loaded photos (title, character, series, event, uploader) | Cari foto yang sudah dimuat (judul, karakter, seri, acara, pengunggah) |
| galleryLoadedCount | Showing {shown} of {loaded} loaded photos | Menampilkan {shown} dari {loaded} foto yang dimuat |
| galleryUntitled | Untitled photo | Foto tanpa judul |
| galleryUploader | By {name} | Oleh {name} |
| galleryLikes | {count} likes | {count} suka |
| galleryDelete | Delete photo | Hapus foto |
| galleryDeleteConfirm | Permanently delete the photo "{title}" by {uploader}? This cannot be undone. | Hapus permanen foto "{title}" dari {uploader}? Tindakan ini tidak dapat dibatalkan. |
| galleryDeleted | Photo deleted. | Foto dihapus. |
| galleryEmpty | No photos in the gallery yet. | Belum ada foto di galeri. |
| galleryNoResults | No loaded photo matches. Load more to search older photos. | Tidak ada foto dimuat yang cocok. Muat lebih banyak untuk mencari foto lama. |
| galleryLoadFailed | Could not load the photos. | Foto tidak dapat dimuat. |
| galleryDataNote | Each photo downloads its full image. Use Wi-Fi for long moderation sessions. | Setiap foto mengunduh gambar penuh. Gunakan Wi-Fi untuk moderasi yang lama. |
| lockTitle | Dashboard locked | Dasbor terkunci |
| lockDesc | Enter the dashboard password to continue. | Masukkan kata sandi dasbor untuk melanjutkan. |
| lockPasswordLabel | Dashboard password | Kata sandi dasbor |
| unlock | Unlock | Buka kunci |
| unlocking | Checking… | Memeriksa… |
| lockTooManyTries | Too many wrong attempts. Try again in {seconds} s. | Terlalu banyak percobaan salah. Coba lagi dalam {seconds} detik. |
| lockForgot | Forgot password? | Lupa kata sandi? |
| lockAskMain | Forgot the password? Ask the main account ({email}). | Lupa kata sandi? Tanyakan ke akun utama ({email}). |
| lockConvenienceNote | This lock protects an unattended device. It is a convenience lock: the database rules remain the real protection of member data. | Kunci ini melindungi perangkat yang sedang ditinggal. Ini hanya kunci praktis: aturan database tetap menjadi perlindungan utama data anggota. |
| lockCheckFailed | Could not check the dashboard lock (no connection?). The dashboard stays locked. | Kunci dasbor tidak dapat diperiksa (tidak ada koneksi?). Dasbor tetap terkunci. |
| lockNotSetTitle | Set a dashboard password | Atur kata sandi dasbor |
| lockNotSetDesc | Asks for a password when the dashboard is opened, after 15 minutes without activity, and after "Lock now". One shared password for all admins; only the main account can set or change it. | Meminta kata sandi saat dasbor dibuka, setelah 15 menit tanpa aktivitas, dan setelah "Kunci sekarang". Satu kata sandi bersama untuk semua admin; hanya akun utama yang dapat mengatur atau menggantinya. |
| lockRulesMissing | The dashboard lock needs the sprint-3 database rules. Publish the latest firestore.rules to enable it. | Kunci dasbor membutuhkan aturan database sprint 3. Publikasikan firestore.rules terbaru untuk mengaktifkannya. |
| lockSetButton | Set password | Atur kata sandi |
| lockChangeButton | Change password | Ganti kata sandi |
| lockRemoveButton | Remove lock | Hapus kunci |
| lockStatusOn | Dashboard lock is on (last changed {date}). | Kunci dasbor aktif (terakhir diubah {date}). |
| lockStatusOff | Dashboard lock is off. | Kunci dasbor tidak aktif. |
| lockManagedByMain | The dashboard password is managed by the main account. | Kata sandi dasbor dikelola oleh akun utama. |
| lockDialogSetTitle | Set dashboard password | Atur kata sandi dasbor |
| lockDialogChangeTitle | Change dashboard password | Ganti kata sandi dasbor |
| lockDialogRemoveTitle | Remove dashboard lock | Hapus kunci dasbor |
| lockDialogForgotTitle | Reset dashboard password | Atur ulang kata sandi dasbor |
| lockCurrentPassword | Current password | Kata sandi saat ini |
| lockNewPassword | New password | Kata sandi baru |
| lockConfirmPassword | Repeat new password | Ulangi kata sandi baru |
| lockTooShort | Use at least {min} characters. | Gunakan minimal {min} karakter. |
| lockMismatch | The passwords do not match. | Kata sandi tidak sama. |
| lockRemoveConfirm | Remove the dashboard lock for all admins? | Hapus kunci dasbor untuk semua admin? |
| lockForgotDesc | Confirm with the main Google account ({email}) to set a new dashboard password. | Konfirmasi dengan akun Google utama ({email}) untuk mengatur kata sandi dasbor baru. |
| lockReauthButton | Confirm with Google | Konfirmasi dengan Google |
| lockSaving | Saving… | Menyimpan… |
| lockSaved | Dashboard password saved. Every admin must enter the new password. | Kata sandi dasbor disimpan. Setiap admin harus memasukkan kata sandi baru. |
| lockRemoved | Dashboard lock removed. | Kunci dasbor dihapus. |
| logTitle | Audit log | Log aktivitas admin |
| logInfo | Who did what in the dashboard. Entries are written by the acting admin's device: an accountability aid, not tamper-proof. | Siapa melakukan apa di dasbor. Catatan ditulis oleh perangkat admin yang bertindak: alat bantu akuntabilitas, bukan catatan anti-manipulasi. |
| logFilterAll | All actions | Semua aksi |
| logPending | just now | baru saja |
| logCount | {count} records | {count} data |
| logEmpty | No admin activity recorded yet. | Belum ada aktivitas admin yang tercatat. |
| logLoadFailed | Could not load the audit log. | Log aktivitas tidak dapat dimuat. |
| logRulesMissing | The audit log needs the sprint-3 database rules. | Log aktivitas membutuhkan aturan database sprint 3. |
| logColTime | Time | Waktu |
| logColActor | Admin | Admin |
| logColAction | Action | Aksi |
| logColTarget | Target | Sasaran |
| logColDetails | Details | Rincian |
| logActionAdminAdded | Admin added | Admin ditambahkan |
| logActionAdminRemoved | Admin removed | Admin dihapus |
| logActionPhotoDeleted | Photo deleted | Foto dihapus |
| logActionMemberDeleted | Member deleted | Anggota dihapus |
| logActionMemberEdited | Member edited | Data anggota diubah |
| logActionMemberUnlinked | Login unlinked | Login dilepas |
| logActionMemberStatusChanged | Status changed | Status diubah |
| logActionPasswordResetSent | Password reset sent | Reset kata sandi dikirim |
| logActionKccIdMigration | Switch to 8-digit IDs | Peralihan ke ID 8 digit |
| logActionKccIdRepair | KCC ID repair | Perbaikan KCC ID |
| logActionRegistrationDatesFixed | Registration dates fixed | Tanggal pendaftaran diperbaiki |
| logActionDuplicatesMerged | Duplicates merged | Data ganda digabung |
| logActionSheetsImport | Sheets import | Impor Sheets |
| logActionDashboardLockSet | Dashboard password set | Kata sandi dasbor diatur |
| logActionDashboardLockCleared | Dashboard lock removed | Kunci dasbor dihapus |
| runOrderTitle | Recommended order after the update | Urutan yang disarankan setelah pembaruan |
| runOrderDesc | Run these once, in this order, on one device with stable Wi-Fi. | Jalankan sekali, sesuai urutan ini, di satu perangkat dengan Wi-Fi stabil. |
| runOrderStep1 | 1. Merge duplicate registrations | 1. Gabungkan pendaftaran ganda |
| runOrderStep2 | 2. Fix registration dates from the spreadsheet | 2. Perbaiki tanggal pendaftaran dari spreadsheet |
| runOrderStep3 | 3. Switch to 8-digit KCC IDs | 3. Beralih ke KCC ID 8 digit |
| runOrderNotScanned | Not scanned yet | Belum dipindai |
| runOrderScanResult | {count} duplicate groups | {count} grup ganda |
| idEraLegacy | 16-digit IDs (before the switch) | ID 16 digit (sebelum peralihan) |
| idEraKcc8 | 8-digit IDs active | ID 8 digit aktif |
| migrationTitle | Switch to 8-digit KCC IDs | Beralih ke KCC ID 8 Digit |
| migrationDesc | Renumbers every member in order of registration: main account 0000 0000, admin-range holders keep 0000 0001–0000 0100, members start at 0000 0101. Old 16-digit IDs keep working in the card lookup, and every card is rebuilt. There is no automatic undo — download the CSV first. | Menomori ulang semua anggota sesuai urutan pendaftaran: akun utama 0000 0000, pemegang rentang admin tetap 0000 0001–0000 0100, anggota mulai dari 0000 0101. ID lama 16 digit tetap bisa dipakai di pencarian kartu, dan semua kartu dibangun ulang. Tidak ada pembatalan otomatis — unduh CSV terlebih dahulu. |
| migrationStatusNotStarted | Not started — members still have 16-digit IDs. | Belum dimulai — anggota masih memakai ID 16 digit. |
| migrationStatusInProgress | Started but not finished — preview again to resume. | Sudah dimulai tetapi belum selesai — buat pratinjau lagi untuk melanjutkan. |
| migrationStatusDone | Done — every member has an 8-digit KCC ID. | Selesai — semua anggota memiliki KCC ID 8 digit. |
| migrationPreview | Preview | Pratinjau |
| migrationPreviewing | Building preview… | Menyusun pratinjau… |
| migrationRows | {count} members | {count} anggota |
| migrationPending | {count} to change | {count} akan diubah |
| migrationDone | {count} already done | {count} sudah selesai |
| migrationReservedRows | {count} main/admin IDs | {count} ID akun utama/admin |
| migrationPlanEnd | Members up to {id} | Anggota sampai {id} |
| migrationNextPublic | Next registration: {id} | Pendaftaran berikutnya: {id} |
| migrationWarningsHint | Fix duplicates or unreadable dates first (merge duplicates, fix dates), then preview again. | Perbaiki data ganda atau tanggal yang tidak terbaca terlebih dahulu (gabungkan data ganda, perbaiki tanggal), lalu buat pratinjau lagi. |
| migrationColOld | Old ID | ID lama |
| migrationColNew | New ID | ID baru |
| migrationColName | Name | Nama |
| migrationColRegistered | Registered | Terdaftar |
| migrationColKind | Type | Jenis |
| migrationColNote | Note | Catatan |
| migrationNoOldId | (none) | (tidak ada) |
| migrationProvisional | {id} (provisional) | {id} (sementara) |
| migrationKindMain | Main account | Akun utama |
| migrationKindAdmin | Admin range | Rentang admin |
| migrationKindMember | Member | Anggota |
| migrationKindDone | Done | Selesai |
| migrationNoteDuplicateOldId | Same old ID as another member | ID lama sama dengan anggota lain |
| migrationNoteMissingOldId | No old ID | Tidak punya ID lama |
| migrationNoteUnparsableCreatedAt | Registration date unreadable (sorted last) | Tanggal daftar tidak terbaca (diurutkan paling akhir) |
| migrationNoteReservedConflict | Reserved ID also held by another record — gets a member number | ID khusus juga dipakai data lain — mendapat nomor anggota |
| migrationNoteLateClaim | Registered after the switch started — number given when applying | Mendaftar setelah peralihan dimulai — nomor diberikan saat diterapkan |
| migrationOnlyNotes | Only rows with notes | Hanya baris dengan catatan |
| migrationDownloadCsv | Download CSV (old → new) | Unduh CSV (lama → baru) |
| migrationSkipCsv | I already downloaded and kept the CSV | Saya sudah mengunduh dan menyimpan CSV |
| migrationRewritePhotos | Also update the KCC ID on gallery photos | Perbarui juga KCC ID di foto galeri |
| migrationRewritePhotosHint | Reads every photo once (full images) — use Wi-Fi. | Membaca setiap foto sekali (gambar penuh) — gunakan Wi-Fi. |
| migrationApply | Switch now | Alihkan sekarang |
| migrationApplyConfirm | Switch {pending} members to 8-digit KCC IDs (first member {first}, block ends at {planEnd})?\n\nOld IDs keep working through the lookup. This cannot be undone automatically. Keep this tab open until it finishes. Continue? | Alihkan {pending} anggota ke KCC ID 8 digit (anggota pertama {first}, blok berakhir di {planEnd})?\n\nID lama tetap bisa dipakai lewat pencarian. Tindakan ini tidak dapat dibatalkan otomatis. Biarkan tab ini terbuka sampai selesai. Lanjutkan? |
| migrationProgress | Switching {done}/{total}… | Mengalihkan {done}/{total}… |
| migrationPhaseCounter | Reserving numbers | Memesan nomor |
| migrationPhaseMembers | Renumbering members | Menomori ulang anggota |
| migrationPhaseLate | Late registrations | Pendaftaran susulan |
| migrationPhasePhotos | Updating photos | Memperbarui foto |
| migrationCancel | Stop after this batch | Berhenti setelah batch ini |
| migrationStatMigrated | Members switched | Anggota dialihkan |
| migrationStatAliases | Old-ID aliases | Alias ID lama |
| migrationStatCards | Cards written | Kartu ditulis |
| migrationStatOldCards | Old cards deleted | Kartu lama dihapus |
| migrationStatLate | Late registrations | Pendaftaran susulan |
| migrationStatPhotos | Photos updated | Foto diperbarui |
| migrationComplete | Switch complete: every member has an 8-digit KCC ID. | Peralihan selesai: semua anggota memiliki KCC ID 8 digit. |
| migrationIncomplete | Not finished yet. Preview again to resume where it stopped. | Belum selesai. Buat pratinjau lagi untuk melanjutkan dari titik terakhir. |
| migrationResume | Preview again & resume | Pratinjau ulang & lanjutkan |
| migrationRepreview | Preview again | Pratinjau ulang |
| counterTitle | KCC ID counter | Penghitung KCC ID |
| counterLast | Last issued: {id} | Terakhir diberikan: {id} |
| counterNext | Next: {id} | Berikutnya: {id} |
| counterCheck | Check counter | Periksa penghitung |
| counterHealthy | Counter OK — new registrations can get numbers. | Penghitung normal — pendaftaran baru bisa mendapat nomor. |
| counterBlocked | Blocked: cards already exist for {ids}. New registrations fail until the counter moves past them. | Terblokir: kartu untuk {ids} sudah ada. Pendaftaran baru gagal sampai penghitung dimajukan melewatinya. |
| counterAdvance | Move counter forward | Majukan penghitung |
| counterAdvanceConfirm | Move the counter to {id}? Numbers are never reused. | Majukan penghitung ke {id}? Nomor tidak pernah dipakai ulang. |
| dateFixTitle | Fix registration dates from the spreadsheet | Perbaiki tanggal pendaftaran dari spreadsheet |
| dateFixDesc | Sets "Registered" to the Google Form timestamp for members matched to a sheet row. Preview first, then apply. | Mengubah "Terdaftar" menjadi timestamp Google Form untuk anggota yang cocok dengan baris sheet. Buat pratinjau dulu, lalu terapkan. |
| dateFixNeedsTimestamp | Map the timestamp column first (step 2). | Petakan kolom timestamp terlebih dahulu (langkah 2). |
| dateFixPreview | Preview date fix | Pratinjau perbaikan tanggal |
| dateFixLoading | Reading the spreadsheet… | Membaca spreadsheet… |
| dateFixSummary | {changes} dates to change • {unchanged} already correct • {unmatched} sheet rows without a member • {unparsable} rows with an unreadable timestamp | {changes} tanggal akan diubah • {unchanged} sudah benar • {unmatched} baris sheet tanpa anggota • {unparsable} baris dengan timestamp tidak terbaca |
| dateFixContext | Sheet time zone: {timeZone} • locale: {locale} | Zona waktu sheet: {timeZone} • lokal: {locale} |
| dateFixSpotCheck | Spot-check: a row "11/10/2026 01.44.06" must show 11 Oct 2026 01:44, not 10 Nov. | Cek acak: baris "11/10/2026 01.44.06" harus tampil 11 Okt 2026 01:44, bukan 10 Nov. |
| dateFixColCurrent | Current | Saat ini |
| dateFixColSheet | Spreadsheet | Spreadsheet |
| dateFixColDelta | Difference | Selisih |
| dateFixColMatch | Matched by | Cocok lewat |
| dateFixMatchPhone | WhatsApp | WhatsApp |
| dateFixMatchEmail | Email | Email |
| dateFixMatchDiscord | Discord | Discord |
| dateFixMatchSocial | Social media | Media sosial |
| dateFixMatchName | Name only (weak) | Nama saja (lemah) |
| dateFixAmbiguous | Ambiguous | Ambigu |
| dateFixFilterAll | All | Semua |
| dateFixFilterSelected | Selected | Terpilih |
| dateFixFilterWeak | Weak matches | Kecocokan lemah |
| dateFixSelectDefault | Default selection | Pilihan bawaan |
| dateFixSelectNone | Select none | Kosongkan pilihan |
| dateFixApply | Apply to {count} selected | Terapkan ke {count} terpilih |
| dateFixApplyConfirm | Change the registration date of {count} members to the spreadsheet timestamp? | Ubah tanggal pendaftaran {count} anggota menjadi timestamp spreadsheet? |
| dateFixProgress | Updating {done}/{total}… | Memperbarui {done}/{total}… |
| dateFixDone | Done: {updated} members updated, {cards} cards refreshed. | Selesai: {updated} anggota diperbarui, {cards} kartu disegarkan. |
| dateFixNothing | Every matched member already has the spreadsheet date. | Semua anggota yang cocok sudah memakai tanggal spreadsheet. |
| supportTitle | Member support | Bantuan anggota |
| loginLinked | Login linked | Login terhubung |
| loginNotLinked | No login linked (never signed in) | Belum terhubung ke login (belum pernah login) |
| copyKccId | Copy KCC ID | Salin KCC ID |
| copyCardLink | Copy card link | Salin tautan kartu |
| copied | Copied! | Tersalin! |
| whatsappChat | WhatsApp {phone} | WhatsApp {phone} |
| whatsappTemplate | Hi {name}, this is the KawanCosplay admin team about your KCC ID {id}. | Halo {name}, ini tim admin KawanCosplay terkait KCC ID kamu {id}. |
| noPhone | No WhatsApp number saved. | Belum ada nomor WhatsApp. |
| sendPasswordReset | Send password-reset email | Kirim email reset kata sandi |
| passwordResetNoEmail | No email saved for this member. | Anggota ini belum menyimpan email. |
| passwordResetConfirm | Send a password-reset email to {email}? | Kirim email reset kata sandi ke {email}? |
| passwordResetSent | If this email has a password login, a reset email was sent. Members who use "Continue with Google" have no password — tell them to sign in with Google. | Jika email ini punya login dengan kata sandi, email reset sudah dikirim. Anggota yang memakai "Lanjutkan dengan Google" tidak punya kata sandi — minta mereka login dengan Google. |
| unlinkLogin | Unlink login | Lepas login |
| unlinkSignInProfile | This record is the sign-in profile itself; merge or delete it instead. | Data ini adalah profil login itu sendiri; gabungkan atau hapus data ini. |
| unlinkConfirm | Unlink the login from "{name}"? They can link again by signing in with the stored email. | Lepas login dari "{name}"? Anggota dapat terhubung lagi dengan login memakai email yang tersimpan. |
| unlinked | Login unlinked. | Login dilepas. |
| unlinkHint | The next sign-in with the member's stored email links again. To link a different login, change the stored email first. | Login berikutnya dengan email yang tersimpan akan terhubung lagi. Untuk menghubungkan login lain, ubah email yang tersimpan terlebih dahulu. |
| supportAdminSdkNote | Changing a login email or deleting a login account is not possible here (it needs the Firebase console). | Mengubah email login atau menghapus akun login tidak bisa dilakukan di sini (perlu Firebase console). |
| editDetails | Edit details | Ubah data |
| dangerZone | Danger zone | Zona berbahaya |
| extraPhonesLabel | Extra WhatsApp numbers | Nomor WhatsApp tambahan |
| addExtraPhone | Add number | Tambah nomor |
| removeExtraPhone | Remove number | Hapus nomor |
| fieldSocialMedia | Social media | Media sosial |
| fieldPortfolio | Portfolio URL | URL portofolio |
| fieldReason | Reason for joining | Alasan bergabung |
| saveChanges | Save changes | Simpan perubahan |
| noChanges | Nothing changed. | Tidak ada perubahan. |
| memberSaved | Member details saved. | Data anggota disimpan. |
| emailChangeNote | Changes the stored email only, not the email the member signs in with. | Hanya mengubah email yang tersimpan, bukan email yang dipakai anggota untuk login. |
| discardChanges | Discard your changes? | Buang perubahan Anda? |

Spec-text aliases resolved: `admin.migrationKindMain/Admin/Member/Done`, `admin.migrationNote*`,
`admin.migrationPhase*`, `admin.dateFixMatch*`, `admin.pageFirst/Prev/Next/Last` = the rows above. Retry buttons
use `common.tryAgain`; the run-order step 2 button uses the existing `admin.openSheetsSync`.

#### 4.1.2 ADMIN-UI — `sheets` namespace
| Key | English | Indonesian |
|---|---|---|
| importUnparsableRows | {count} rows have an unreadable timestamp and were imported with today's date (rows {rows}). Correct the sheet, then use "Fix registration dates". | {count} baris memiliki timestamp yang tidak terbaca dan diimpor dengan tanggal hari ini (baris {rows}). Perbaiki sheet, lalu gunakan "Perbaiki tanggal pendaftaran". |
| importIssuedIds | New KCC IDs issued: {count} ({first} – {last}) | KCC ID baru diberikan: {count} ({first} – {last}) |

#### 4.1.3 PUBLIC-UI+PERF
| Key | English | Indonesian |
|---|---|---|
| common.lookupOldIdNotice | This is an old ID. The member's KCC ID is now {id}. | Ini ID lama. KCC ID anggota ini sekarang {id}. |
| common.perfModeTitle | Display mode | Mode tampilan |
| common.perfModeAuto | Auto | Otomatis |
| common.perfModeLite | Lite | Ringan |
| common.perfModeFull | Full | Penuh |
| common.perfModeAutoLiteHint | Auto: Lite is on for this device | Otomatis: mode Ringan aktif di perangkat ini |
| common.perfModeAutoFullHint | Auto: full effects on this device | Otomatis: efek penuh di perangkat ini |
| common.perfModeFooter | Display mode: {mode} | Mode tampilan: {mode} |
| common.perfLiteNotice | Lite mode is on for smoother scrolling on this device. You can change it in the menu. | Mode Ringan aktif agar scroll lebih lancar di perangkat ini. Anda bisa mengubahnya di menu. |
| common.perfLiteNoticeAction | Change | Ubah |
| auth.popupBlockedTapAgain | The browser blocked the sign-in window. Tap the button again. | Browser memblokir jendela login. Ketuk tombolnya sekali lagi. |
| registration.extraPhonesInProfileHint | You can add more WhatsApp numbers later in your profile. | Nomor WhatsApp tambahan bisa ditambahkan nanti di profil Anda. |
| profile.extraPhonesLabel | Extra WhatsApp numbers | Nomor WhatsApp tambahan |
| profile.extraPhonesHint | Optional, up to 4 numbers. Admins can reach you on any of them. | Opsional, maksimal 4 nomor. Admin dapat menghubungi Anda di nomor mana pun. |
| profile.addExtraPhone | Add number | Tambah nomor |
| profile.removeExtraPhone | Remove this number | Hapus nomor ini |
| profile.extraPhoneTooShort | A WhatsApp number needs at least {minDigits} digits. | Nomor WhatsApp minimal {minDigits} digit. |
| profile.oldKccId | Old ID: {id} | ID lama: {id} |
| gallery.loadMore | Load more photos | Muat foto lainnya |
| gallery.loadingMore | Loading… | Memuat… |
| gallery.refresh | Refresh | Muat ulang |
| gallery.loadFailed | Could not load the gallery. Check your connection and try again. | Galeri tidak dapat dimuat. Periksa koneksi lalu coba lagi. |
| gallery.morePhotosHint | + more | + lainnya |
| gallery.filterLoadMoreHint | No loaded photo matches. Load more to search older photos. | Tidak ada foto dimuat yang cocok. Muat lebih banyak untuk mencari foto lama. |

`auth.popupBlockedTapAgain` is shown by AuthModal when `isPopupBlockedError(err)` (instead of the generic
`auth.googleLoginFailed`).

#### 4.1.4 DATA — `errors` namespace (names from spec-data; wording proposal)
| Key | English | Indonesian |
|---|---|---|
| adminOnly | Only admins can do this. | Hanya admin yang dapat melakukan ini. |
| adminNeedsSignIn | This member has never signed in to MyKCC, so they cannot be made an admin yet. | Anggota ini belum pernah login ke MyKCC, jadi belum bisa dijadikan admin. |
| adminIsMainAccount | The main account is always an admin. | Akun utama selalu menjadi admin. |
| adminAlreadyAdmin | This member is already an admin. | Anggota ini sudah menjadi admin. |
| kccCounterBlocked | The KCC ID counter is blocked. Please try again later or contact a KCC admin. | Penghitung KCC ID sedang terblokir. Coba lagi nanti atau hubungi admin KCC. |
| kccIdsExhausted | No more KCC IDs are available. | KCC ID sudah habis. |
| migrationPlanChanged | Members changed since the preview (new registration or edit). Preview again before applying. | Data anggota berubah sejak pratinjau (ada pendaftaran atau perubahan baru). Buat pratinjau lagi sebelum menerapkan. |
| migrationAlreadyStarted | Another admin already started the switch. Preview again to resume it. | Admin lain sudah memulai peralihan. Buat pratinjau lagi untuk melanjutkannya. |
| lockMainOnly | Only the main account can change the dashboard password. | Hanya akun utama yang dapat mengubah kata sandi dasbor. |
| lockWrongPassword | Wrong dashboard password. | Kata sandi dasbor salah. |
| lockReauthWrongAccount | Please confirm with the main Google account. | Mohon konfirmasi dengan akun Google utama. |
| memberHasNoEmail | This member has no email address saved. | Anggota ini belum menyimpan alamat email. |
| memberNotLinked | This member is not linked to a login. | Anggota ini belum terhubung ke login. |
| cannotUnlinkSignInProfile | This record is a sign-in profile; merge or delete it instead of unlinking. | Data ini adalah profil login; gabungkan atau hapus, jangan dilepas. |
| authInvalidEmail | The stored email address is not valid. | Alamat email yang tersimpan tidak valid. |
| authTooManyRequests | Too many requests. Please wait a few minutes and try again. | Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi. |
| authNetworkFailed | Network error. Check your connection and try again. | Gangguan jaringan. Periksa koneksi lalu coba lagi. |

`adminOnly` is the generic `errors.*AdminOnly` of spec-data §2 (the existing `mergeAdminOnly` / `repairAdminOnly`
stay). The last three may be renamed by DATA; the UI never references them directly (they arrive inside thrown
errors). The UI DOES reference `errors.lockWrongPassword` (locked screen + change dialog): that name is fixed.
### 4.2 Changed keys (en + id now; the other 18 languages re-translate them in the translation stage — the locale
checker cannot detect a stale translation, so the translation stage must take this list as input)

#### 4.2.1 16 digits → 8 digits / neutral "KCC ID"
Neutral wording (no digit count) where the text is a label, because 16-digit IDs exist until the admin runs the
switch and keep working afterwards through aliases.
| Key | Owner | New English | New Indonesian |
|---|---|---|---|
| admin.csvKccId | ADMIN-UI | KCC ID | KCC ID |
| admin.colKccId | ADMIN-UI | KCC ID | KCC ID |
| demo.description | ADMIN-UI | 1-click preset auto-fill to test KCC ID generation (running 8-digit number, admin range 0000 0001–0000 0100, main account 0000 0000). | Klik 1-tombol untuk auto-fill data demo dan menguji pembuatan KCC ID (nomor urut 8 digit, rentang admin 0000 0001–0000 0100, akun utama 0000 0000). |
| demo.ruleTimestamp | ADMIN-UI | Members: running number in order of registration | Anggota: nomor urut sesuai urutan pendaftaran |
| demo.presetCosplayerName | ADMIN-UI | Demo Cosplayer (running number) | Demo Cosplayer (nomor urut) |
| demo.presetCosplayerBadge | ADMIN-UI | Running number | Nomor urut |
| demo.presetCosplayerDesc | ADMIN-UI | Next 8-digit KCC ID in order of registration (members start at 0000 0101) | KCC ID 8 digit berikutnya sesuai urutan pendaftaran (anggota mulai dari 0000 0101) |
| demo.presetAdminDesc | ADMIN-UI | ID 0000 0001 to 0000 0100 for KCC admins | ID 0000 0001 s/d 0000 0100 khusus admin KCC |
| demo.presetMainAccountDesc | ADMIN-UI | ID 0000 0000 strictly for the main account cosplaysehat@gmail.com | ID 0000 0000 khusus akun utama cosplaysehat@gmail.com |
| demo.presetPropMakerBadge | ADMIN-UI | Crafter (running number) | Crafter (nomor urut) |
| demo.presetPropMakerDesc | ADMIN-UI | Prop & armor artisan with a running-number KCC ID | Pengrajin kostum / prop dengan KCC ID nomor urut |
| demo.presetPhotographerDesc | ADMIN-UI | Photographer & videographer with a running-number KCC ID | Fotografer & videografer dengan KCC ID nomor urut |
| common.cardPageDesc | PUBLIC | To protect the privacy of all members, the complete member list is restricted to the admin portal. Enter your 8-digit KCC ID (e.g. 0000 0101) to display your official digital pass. Old 16-digit IDs still work. | Demi menjaga privasi seluruh anggota, daftar lengkap anggota hanya dapat diakses oleh Admin di portal terpisah. Masukkan KCC ID 8 digit Anda (contoh: 0000 0101) untuk menampilkan kartu identitas digital resmi Anda. ID lama 16 digit tetap bisa dipakai. |
| common.lookupPlaceholder | PUBLIC | KCC ID, e.g. 0000 0101 | KCC ID, contoh: 0000 0101 |
| common.lookupInvalidId | PUBLIC | Please enter your 8-digit KCC ID (or an old 16-digit ID): digits only, spaces allowed. | Mohon masukkan KCC ID 8 digit Anda (atau ID lama 16 digit): angka saja, spasi boleh. |
| common.lookupNotFound | PUBLIC | No Member ID Card found for that KCC ID. Please double-check the digits. | Kartu anggota dengan KCC ID tersebut tidak ditemukan. Periksa kembali angka KCC ID Anda. |
| common.privacyShieldActive | PUBLIC | KCC ID Identity & Privacy Shield System Active | Sistem Identitas KCC ID & Perisai Privasi Aktif |
| auth.portalSubtitle | PUBLIC | Official MyKCC Community Portal (KCC ID) | Portal Komunitas Resmi MyKCC (KCC ID) |
| auth.signUpSubmit | PUBLIC | Create Account & Get Your KCC ID | Buat Akun & Dapatkan KCC ID |
| gallery.detailKccId | PUBLIC | KCC ID: | KCC ID: |
| profile.kccIdLabel | PUBLIC | KCC ID | KCC ID |
| registration.singleAccountIdTitle | PUBLIC | Your Single KCC ID Account | Akun Tunggal KCC ID Anda |
| errors.badgeMember | DATA | Member | Anggota |
Non-i18n 16-digit strings in code: `RESERVED_ID_RANGE_LABEL` (AdminDashboard, ADMIN-UI, 1.A.0), the
`DemoFormTester` preset IDs if they hard-code 16-digit values (ADMIN-UI: use 8-digit examples), comments such as
"16-Digit Single KCC ID Account highlight" (PUBLIC, RegistrationForm). `admin.timestampIdBadge` stays (still true
for legacy 16-digit IDs).

#### 4.2.2 Other changed keys
| Key | Owner | New English | New Indonesian |
|---|---|---|---|
| stats.citiesDesc | ADMIN-UI | Cities around the world | Kota di seluruh dunia |
| admin.sortStatusAsc | ADMIN-UI | ▲ Verified first | ▲ Terverifikasi dulu |
| admin.sortStatusDesc | ADMIN-UI | ▼ Pending first | ▼ Tertunda dulu |

### 4.3 Removed keys
| Key | Who | Where | Notes |
|---|---|---|---|
| `admin.loginPrompt` | ADMIN-UI | ALL 20 languages: `src/i18n/locales/*/admin.ts` (en, id, ar, de, es, fr, ja, jv, jv-Jawa, ko, ms, pt, su, su-Sund, ta, th, tl, vi, zh-Hans, zh-Hant) | Dead (mentions the removed passkey; no code reference — `grep -rn loginPrompt src` must return only locale lines before, nothing after). Remove in one commit so en and every locale stay in sync (an extra key in a locale would be an excess-property error once `en` drops it). This is the ONLY edit ADMIN-UI makes in the 18 other locale folders. |

Deferred removals (dead after this sprint, NOT removed now because removing them touches all 20 languages while
three groups work in parallel; the translation stage removes them in all languages and updates the checker
baseline): `registration.addBackupPhone`, `registration.backupPhoneLabel`, `registration.removeBackupPhone`,
`registration.backupPhoneNotice`, `registration.backupPhonePlaceholder`, `registration.backupPhoneTooShortError`
(1.B.1), `profile.backupPhoneLabel` (replaced by `profile.extraPhonesLabel`, 1.B.2). PUBLIC verifies with grep
that they are unused at the end and lists them in its report.

## 5. Integration checklist (integrator)

Run from `C:\Users\Sato\Projects\mykcc` with `export PATH="/c/Users/Sato/Projects/tools/node:$PATH"` (Bash).

**A. Ownership + scope audit**
1. Per group: `git diff --name-only <base>..<group-branch>`; every path must be in that group's table in §2; the
   three lists must not intersect. Any overlap → stop, ask the owning group to take the change.
2. `git diff --name-only <base>..HEAD | grep -E '^(package\.json|bun\.lock)$'` → empty.
3. Other-locale edits: `git diff --name-only <base>..HEAD -- src/i18n/locales | grep -vE '/(en|id)/'` → only the
   18 `*/admin.ts` files, each diff = exactly one removed `loginPrompt` entry.

**B. Type-check** — `npx tsc --noEmit`
4. Expected (and ONLY expected) errors: "missing properties" (TS2739 / TS2740 / TS2741) in
   `src/i18n/locales/<ar|de|es|fr|ja|jv|jv-Jawa|ko|ms|pt|su|su-Sund|ta|th|tl|vi|zh-Hans|zh-Hant>/` for the
   namespaces that gained keys: `admin`, `sheets`, `common`, `auth`, `registration`, `profile`, `gallery`, `errors`
   (at most 8 files × 18 languages = 144 errors; `stats`, `demo`, `card`, `siteEditor` must have NONE). Check:
   ```bash
   npx tsc --noEmit 2>&1 | grep -E 'error TS' | grep -vE 'src/i18n/locales/(ar|de|es|fr|ja|jv|jv-Jawa|ko|ms|pt|su|su-Sund|ta|th|tl|vi|zh-Hans|zh-Hant)/' # → empty
   npx tsc --noEmit 2>&1 | grep -E 'error TS' | grep -vE 'TS27(39|40|41)'   # → empty (TS2353 = a removed key such as loginPrompt is still present somewhere)
   ```
   Report the remaining count to the lead; do NOT add `Partial<>` or `as` casts to silence them.
5. Any error in `src/components`, `src/lib`, `src/types`, `src/App.tsx`, `src/i18n/locales/{en,id}` is a contract
   mismatch → fix in the owning group (§2), never by changing a contract unilaterally.

**C. Build** — `npx vite build` must pass (it does not type-check; B covers that).
6. Chunks: `src/components/admin/*`, `adminService`, `dashboardLock`, `adminLogService` must NOT be in the entry
   chunk (`dist/assets/index-*.js`): `grep -l "dashboardLock\|kcc_dash_unlock" dist/assets/index-*.js` → none.
   Entry grows by roughly the `id` dictionary (~16 KB gz, P3) only. Record the gz sizes of index / react-vendor /
   firebase / motion / admin chunks vs 4adcd63.
7. CSS: in `dist/assets/*.css` every rule with `backdrop-filter` also has `-webkit-backdrop-filter`
   (Lightning CSS keeps the last of the pair; source order must be `-webkit-` first).

**D. Contract greps** (each must return nothing outside `src/lib`)
8. `grep -rn "format16DigitUserId\|isValidUserId16\|generate16DigitUserId\|MAIN_ACCOUNT_UID" src/components src/App.tsx`
9. `grep -rn "subscribeToPhotos" src --include=*.tsx`
10. `grep -rn "loginPrompt" src` (also nothing in `src/lib`)
11. `grep -rn "admin\.\|common\.\|errors\." src/components/admin` keys all exist in `en` (tsc enforces via
    `TranslationKey`; also run the locale checker below).
12. `src/lib/motion.ts` still exports `useReducedMotion`, `usePresenceMotion`, `useScrollLock`, `useSheetDrag`,
    `useThumbTransition`, `LAYOUT_IDS`, `SPRING`, `TWEEN`, `MotionTransition` (2.3 API freeze).
13. Data signatures used by the UIs exist with spec-data's exact names: `listAdmins`, `addAdmin`, `removeAdmin`,
    `getDashboardLock`, `verifyDashboardPassword`, `setDashboardPassword`, `clearDashboardPassword`,
    `reauthenticateMainAccount`, `isDashboardUnlocked`, `markDashboardUnlocked`, `touchDashboardActivity`,
    `lockDashboardNow`, `listAdminLogs`, `fetchPhotosPage`, `deletePhotoAsAdmin`, `previewKccIdMigration`,
    `kccIdMigrationCsv`, `applyKccIdMigration`, `getKccCounter`, `checkKccCounter`, `advanceKccCounterTo`,
    `mainAccountKccId`, `lookupMemberCard`, `fetchTimestampColumn`, `sheetTimeContext`, `parseSheetRows`,
    `previewRegistrationDateFix`, `applyRegistrationDateFix`, `sendMemberPasswordReset`, `unlinkMemberLogin`,
    `adminUpdateMember`, `MEMBER_ADMIN_EDITABLE_FIELDS`, `formatKccId`, `parseKccIdInput`, `isKccId8`,
    `isMainAccountKccId`, `isAdminRangeKccId`, `kccNumber`, `kccIdFromNumber`, `warmAuthPopup`,
    `ADMIN_GALLERY_PAGE_SIZE`, `PUBLIC_GALLERY_PAGE_SIZE`, `DASHBOARD_LOCK_MIN_LENGTH`.

**E. Translations**
14. `node C:/Users/Sato/Projects/tools/check-locale.mjs id` → no missing / extra keys, placeholders equal to en.
15. The other 18 languages: the checker reports exactly the new keys of §4.1 as missing (and nothing extra). Hand the
    translation stage: §4.1 new keys, §4.2 changed keys (stale translations the checker cannot see), §4.3 deferred
    removals.

**F. Smoke test on `vite preview` (http://localhost:4173, serves `dist/` — rebuild first)**
CAUTION: the preview talks to the PRODUCTION Firestore. Read-only checks plus a throw-away test registration
("ZZ Test S3", deleted afterwards) only. Never run the 8-digit switch, the date fix, purge, merges or deletes of
real data from a test session; until the owner publishes the sprint-3 rules the admin features show their
"rules missing" states — check that they render instead of crashing.
16. Landing (DevTools Network, slow 4G): no Firestore `Listen/channel` response > 5 KB, no `__/auth/iframe`,
    `iframe.js`, `apis.google.com`, `getProjectConfig`; logo from `/brand/`; first frame already Indonesian for
    an `id` browser; no white flash.
17. Registration: no backup-phone button/field; hint about profile; a test registration succeeds (16-digit ID
    while no counter exists) and its card lookup works by the 16-digit ID.
18. Card tab: lookup by 8 digits (after the switch) / 16 digits (now); invalid input message; `/?kcc=<id>` opens
    the card and the parameter disappears from the URL.
19. Profile (test account): add 2 extra numbers, save, reload → kept; remove all → saved as empty.
20. Navbar desktop: no "Profile" text tab; avatar opens the profile with an active ring; mobile menu has one Profile row.
21. Gallery: 12 cards, Load more, like count updates, upload of a test photo appears at the top (then delete it as
    its author). Lite toggle in the mobile menu flips `html[data-perf]` immediately; header loses its blur in lite.
22. Admin (main account): tabs Members / Gallery / KCC ID Tools / Sync / Admins / Audit Log / Stats render; member
    list: Status column shows the select, Registered shows the date; pagination 25/50/100/All persists after reload,
    resets to page 1 on search; CSV opens in Excel with leading zeros intact. Before the rules are published:
    Admins / Audit log show "rules missing", the lock shows the main-account notice, the migration preview may run
    (read-only) but Apply must not be pressed.
23. Phone width (375 px): no horizontal page scroll on any screen above, sheets drag-dismiss, member cards instead
    of the table.

**G. Measure + document**
24. 3 Lighthouse mobile runs (P18) → medians vs §3 budgets; attach numbers to the PR.
25. AGENTS.md updated by DATA (collections, 8-digit KCC ID, counter, aliases, never-do additions); integrator
    appends the sprint-3 status (what is merged, rules publish pending/done, run order for the owner = spec-data §4.2).
26. PR description: deploy order from spec-data §4.1 — **publish rules → verify → promote sprint 3 → verify → merge
    duplicates → fix dates → 8-digit switch**; never promote this build while the 2026-10-11 rules are live
    (spec-data §4.4).
