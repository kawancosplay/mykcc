# MyKCC Sprint 3 — requirements (owner-approved decisions, 2026-10-13)

Repo: `C:\Users\Sato\Projects\mykcc`, branch `claude/sprint-3` (stacked on `claude/i18n-batch-2-3` → `claude/sprint-2`;
nothing of this is live yet; live `main` = `2d180f0`). Read `AGENTS.md` (project facts, security model, never-do list,
CSS rules, i18n + motion conventions) before anything else.

Tools: portable Node `C:\Users\Sato\Projects\tools\node` (Bash: `export PATH="/c/Users/Sato/Projects/tools/node:$PATH"`).
Checks: `npx tsc --noEmit`, `npx vite build` (run from the repo), translation checker
`node C:/Users/Sato/Projects/tools/check-locale.mjs <lang>`. Local preview of the built site: http://localhost:4173
(`vite preview`, already running; it serves `dist/`).

Firestore = NAMED database `ai-studio-kawancosplaymemb-f672c087-2a65-4410-827e-a10092d7e040`. Rules in the repo
(`firestore.rules`) are published by the OWNER in the Firebase console — every rules change needs a deploy-order plan.
The live site keeps running old code until the owner merges; rules must stay compatible with BOTH the live code and the
new code during the transition (or the plan must say exactly when to publish what).

## Features

1. **Assign admins.** ANY admin can make another user admin and remove admins. The main account
   (cosplaysehat@gmail.com, verified) is admin by email and can never be removed. Admins are `admins/{uid}` docs
   (today console-only). Make admin from the member list (member must have `authUid`, i.e. signed in at least once) and
   an "Admins" panel listing current admins (name, email, added by, when) with Remove. Rules must allow admin
   create/delete of `admins/{uid}` with a strict schema; list for admins. Mind the rules limit of 20 exists()/get()
   calls per request (ADMIN_BATCH_SIZE = 15 today).
2. **Gallery moderation = remove photos.** New admin dashboard tab "Gallery": all photos (paged, newest first,
   load more), thumbnail, title/character/series/event, uploader, date, likes; client-side search over loaded items;
   delete with confirmation (rules already allow admin delete). No approval queue.
3. **Member support** per member (from the member list): send password-reset email (`sendPasswordResetEmail`; only when
   the member has an email; explain Google-only accounts), edit member details (admin update; same field limits as
   the rules; phone2/additionalPhones too), unlink login (remove `authUid` so the member can re-link), copy KCC ID /
   card link, open WhatsApp chat with a prefilled message. Things that need the Admin SDK (change a login email,
   delete an Auth account) are out of scope — show a short note.
4. **Dashboard lock password.** ONE shared dashboard password, set and changed by the MAIN account only. Required when
   the dashboard is opened (first time per browser session), after 15 minutes without activity, and via "Lock now".
   Stored as a PBKDF2-SHA256 hash + salt + iterations (WebCrypto; pick iterations that stay < ~1 s on a low-end phone)
   in an admin-readable, main-account-writable doc (e.g. `adminSettings/dashboardLock`). If no password is set yet the
   dashboard works as today and the main account sees "Set a dashboard password". Main account can reset it after
   re-authenticating with Google (forgot password). This is a convenience lock for unattended devices; database rules
   stay the real protection — say so in the UI copy. Never put a password or hash in the JS bundle.
5. **Bug: member list columns.** Header order is … Location, Status, Registered, Actions but the cells are
   … Location, date, status select, Actions → swap the cells so they match (also check CSV export order).
6. **Registration date = real registration time.** "Registered" must be the time they registered: the Google Form
   timestamp (as in the spreadsheet) for imported members, or the time they submitted on the site. Bug: 
   `sheetsService.parseRowsToMembers` uses `Date.parse(timestampRaw)`, which fails on Indonesian timestamps like
   `11/10/2026 01.44.06` (dd/MM/yyyy HH.mm.ss) and misreads dd/MM as MM/dd → falls back to the import time. Fix the
   parser robustly (use the spreadsheet's locale + timeZone from the Sheets API metadata, or request
   `valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER` for the timestamp column and convert the
   serial in the sheet's time zone). Add an admin action "Fix registration dates from the spreadsheet": for members
   matched to sheet rows, set `createdAt` (and the memberCard `createdAt`) to the sheet timestamp; preview first, then
   apply; admin batch ≤ 15 ops.
7. **KCC ID = 8 digits, running number, arranged chronologically (NOT date-based).** Display `XXXX XXXX`.
   - `0000 0000` = main account; `0000 0001`–`0000 0100` = admin range (assigned by admins only); members start at
     `0000 0101`.
   - Existing members are RENUMBERED in order of their real registration time (`createdAt`, after the date fix):
     earliest member → `0000 0101`, next → `0000 0102`, … Ties: stable order (doc id). Current main-account and
     admin-range holders keep their reserved number (16-digit `0000000000000000` → `00000000`, `000000000000000N` →
     `0000000N`).
   - Admin migration action "Switch to 8-digit KCC IDs": preview table old → new (CSV download), then apply in
     batches; rebuild memberCards under the new IDs; delete the old 16-digit cards; write alias docs (e.g.
     `memberCardAliases/{old16}` → `{ kccId }`, public get, no list) so EVERY old 16-digit ID still works in the public
     KCC ID lookup; set the counter. Idempotent / resumable if interrupted.
   - New registrations get the next number atomically: counter doc (e.g. `counters/kccId` `{ last: int, lastId:
     string }`) claimed in a transaction together with the memberCard + member writes; rules enforce +1 and bind the
     counter to the card created in the same write (existsAfter/getAfter, `int()`). Anonymous visitors can register.
     If the counter does not exist yet (before the migration ran) fall back to today's 16-digit path so registration
     never breaks.
   - Lookup accepts 8 digits, and 16 digits (alias, or `00000000xxxxxxxx` → last 8).
   - Keep the stored field name `userId16` unless renaming is clearly safer (document the decision in AGENTS.md: the
     field holds the KCC ID — 8 digits after migration, 16 before). Sheets import assigns new running numbers
     (admin) for new rows. Every UI text that says "16-digit" must change (en + id, other languages in the
     translation stage).
   - Recommended admin run order after deploy: merge duplicates → fix registration dates → switch to 8-digit IDs.
8. **Registration form: no extra phone number field** (remove the "+ add backup WhatsApp number" option and phone2
   input from RegistrationForm). Members add extra numbers in their profile (UserProfile already has phone2 — make
   sure adding/removing extra numbers there works well).
9. **Navbar: one profile button.** Desktop shows a "Profile" text tab AND an avatar button that open the same page →
   keep one (the avatar button; mobile menu keeps one Profile entry).
10. **Member list pagination.** Page size 25 / 50 / 100 / All (remember the choice), page controls, reset to page 1
    when filters/search/sort change, show "x–y of z".
11–13. **Fluid + fast on phones, low-spec devices and slow internet.** The owner tried the LIVE site on a phone and it
    was very laggy (live still has three 600–700 px `blur-[140–160px]` blobs animating forever and a ~10 MB PWA
    precache; sprint 2 already fixed those). Measure (Lighthouse mobile with throttling on the local preview vs the
    live site, bundle sizes), then fix what matters, e.g.: a lite/low-power mode (auto when deviceMemory ≤ 4,
    hardwareConcurrency ≤ 4, Save-Data, slow effectiveType, prefers-reduced-transparency; manual toggle) that drops
    backdrop-filter for solid translucent surfaces, hides ambient blobs, shortens/disables motion; blur only on fixed
    surfaces (header, sheets) on phones, never on in-flow cards; gallery subscription only when the gallery is
    opened, paged (12 + load more), lazy images; compress uploads (photos ≤ 1600 px long side, avatars ≤ 256 px,
    JPEG/WebP ~0.75); `content-visibility: auto` for long off-screen sections; avoid layout thrash; keep page/tab
    transitions cheap (opacity/transform only, short); font loading (`font-display: swap`, only needed scripts);
    anything else measurable (e.g. defer Firestore/Firebase init if it can be done safely). Keep the look.
14. **etc. (small extras, approved):** admin audit log (`adminLogs`, admin read/create only: who did what — admin
    added/removed, photo deleted, member deleted/edited/unlinked, password reset sent, ID migration, date fix) shown in
    the dashboard; remove the dead i18n key `admin.loginPrompt` (mentions the removed passkey) from all languages;
    `stats.citiesDesc` "Cities across Indonesia" → worldwide wording; clearer `admin.sortStatusAsc/Desc` than
    "▲ Ver" / "▼ Pen".

## Constraints
- Security model in AGENTS.md §4 must not be weakened. No client-side secrets. Members' personal data never public.
- All UI text through `t()`; add keys to `en` AND `id` (Indonesian is the community's main language). The other 18
  languages are updated in a later translation stage — until then `npx tsc --noEmit` will report missing keys ONLY in
  `src/i18n/locales/<other langs>/`; that is expected during implementation (report it, don't "fix" it with Partial types).
- CSS rules: `-webkit-backdrop-filter` before `backdrop-filter`; glass in `@layer components`; button labels may wrap.
- Motion from `framer-motion` + `src/lib/motion.ts`; reduced motion → fades only.
- Admin batch writes ≤ 15 ops. Admin actions that delete or rewrite data: confirmation (window.confirm is fine) and a
  preview where the action rewrites many docs.
- Don't touch `package.json`/`bun.lock` unless unavoidable (Vercel uses bun).
- Interruption-safe work: write files as you finish them; never hold many finished files only in memory.
