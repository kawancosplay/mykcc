# MyKCC — guide for AI agents (Gemini, Claude, AI Studio, …)

Canonical instructions for every AI agent working on this repo. `GEMINI.md` and `CLAUDE.md` point here.
Read this whole file before changing code, Firebase settings or Google Cloud settings.
Last updated: 2026-10-13.

## 1. Project

MyKCC is the member portal of KawanCosplay Community (KCC): public registration form, 16-digit KCC ID,
digital member card, cosplay photo gallery, admin dashboard with Google Sheets sync.

| Item | Value |
|---|---|
| Live site | https://mykcc.vercel.app (Vercel, auto-deploys every push to `main`) |
| Repo | https://github.com/kawancosplay/mykcc |
| Stack | Vite 8, React 19, TypeScript, Tailwind CSS v4, Firebase JS SDK 13, vite-plugin-pwa |
| Firebase / GCP project | `gen-lang-client-0922635128` |
| Firestore database | **named** DB `ai-studio-kawancosplaymemb-f672c087-2a65-4410-827e-a10092d7e040` (there is NO `(default)` DB) |
| Main / admin account | cosplaysehat@gmail.com |
| Package install on Vercel | bun (`bun.lock`). Locally use `npm install --legacy-peer-deps` (unused devDependency `esbuild ^0.25` conflicts with Vite 8) |

- `firebase-applet-config.json` MUST keep `"firestoreDatabaseId"`. Removing it makes the SDK use `(default)` →
  "Database '(default)' not found" and the whole site breaks (this happened once).
- `server.ts` (Express) only runs locally. On Vercel, `/api/health` and `/api/sync-form` are the serverless
  functions in `api/`. `vercel.json` rewrites every non-`/api` path to `index.html`.

## 2. Division of labour between agents

| Gemini / Google-side agent | Claude / code-side agent |
|---|---|
| Firebase console: publish rules, Auth providers, `admins/{uid}` docs, indexes, quota/billing | Code changes in this repo (UI, i18n, performance, data layer) |
| Google Cloud: APIs (Drive, Sheets), OAuth consent screen + test users, service accounts | Type-check + build before every push, merges, conflict resolution |
| Google Sheets / Drive integration testing with real accounts | Reviews, keeping `AGENTS.md` up to date |

Either agent may do the other's work when asked, but follow the rules below.

## 3. Git rules (important — parallel pushes already caused an 11-file merge conflict)

1. **Never push straight to `main` while another agent is working.** Work on your own branch
   (`gemini/<topic>`, `claude/<topic>`, …) and merge through a pull request.
2. `git fetch` + rebase/merge `origin/main` before opening the PR; resolve conflicts keeping BOTH sides' intent.
3. Never force-push `main`. Never rewrite published history.
4. Before merging: `npx tsc --noEmit` and `npx vite build` must both pass.
5. Small, focused commits with clear messages. Update section 8 of this file when you finish something.
6. Never commit secrets (service-account JSON, OAuth client secrets, tokens). Use Vercel environment variables.
   (The Firebase web config in `firebase-applet-config.json` is public by design and is fine.)

## 4. Security model (do not weaken)

`firestore.rules` in this repo is the **source of truth** and is what is published on the named DB
(published 2026-10-11). `firebase.json` targets the named DB, so `firebase deploy --only firestore:rules` works.
Console: Firestore → database dropdown → `ai-studio-kawancosplaymemb-…` → **Security / Rules** → Publish.
Always publish the repo file; if you change rules, change the file in a PR first, then publish exactly that file.

| Collection | Who can read | Who can write |
|---|---|---|
| `members/{id}` — personal data (phone, email, age, birthday, discord, reason) | admin; the member themself (`authUid == uid`, or verified email match) | public create of `kc_*` docs with a non-reserved KCC ID; owner may edit profile fields only; admin anything |
| `memberCards/{userId16}` — PUBLIC projection for the KCC ID lookup | anyone can **get** by exact ID; **list is denied** for everyone | created with the member; owner (`ownerUid`) may refresh; admin |
| `photos/{id}` | public get; list only with `limit <= 100` | create = signed-in + `authorUid == uid`; non-admins may only add exactly +1 like; delete = author or admin |
| `sync_logs`, `siteSettings` (write) | admin (`siteSettings` get is public) | admin |
| `admins/{uid}` | own doc only | console only |

Admin = Firebase user with **verified** email `cosplaysehat@gmail.com`, or an `admins/{uid}` document.

**Never do any of these** (each one has already happened once):
- `allow list: if true` (or `read: if true`) on `members`, or anonymous update/delete of members → leaks every
  member's phone/email/birthday. Public lookups go through `memberCards`, never through `members`.
- Put personal data (phone, email, age, birthday, discord, reason) into `memberCards`.
- A client-side admin passkey (one was hard-coded and shipped in the public JS bundle). Admin access must come
  from Firebase Auth + rules.
- Anonymous writes on page load (e.g. seeding demo photos/members into production).
- Derive KCC IDs from a client-side list of members (everyone got `0000 0000 0000 0101`), or assign the main
  (`0000…0000`) / admin range (`0000…0001`–`0000…0100`) IDs from anything typed into the public form.
- Swallow Firestore write errors and show "success" anyway.
- Publish rules to `(default)` — it has no effect on the live app.

Admin batch writes must stay ≤ 15 operations per batch (`ADMIN_BATCH_SIZE`): each op costs one `exists()`
call for the `admins/{uid}` check and rules allow max 20 per request.

## 5. KCC ID

16 digits, displayed as `XXXX XXXX XXXX XXXX`.
- `0000 0000 0000 0000` = KCC main account (only for the authenticated main admin).
- `0000 0000 0000 0001`–`0000 0000 0000 0100` = admin range (only assigned by an admin).
- Public registrations get a unique chronological ID (`generate16DigitUserId`), checked against `memberCards`.
- The admin dashboard "Perbaikan KCC ID & Kartu Publik" → **Jalankan Perbaikan** dedupes IDs and rebuilds
  `memberCards`; safe to re-run. "Pendaftaran Ganda" scans/merges duplicate registrations.

## 6. Frontend conventions

- **Liquid glass CSS:** always write `-webkit-backdrop-filter` **before** `backdrop-filter`. Lightning CSS (the
  production minifier) keeps only the last of the pair and then drops the prefix → the blur vanished on Vercel.
  Glass classes live in `@layer components` (so Tailwind utilities can override them). No `transform: translateZ(0)`
  / `will-change` hacks on glass (they trap `position: fixed` children). Elements that contain `fixed` children
  paint their glass on `::before` (see `.liquid-glass` in `src/index.css`).
- **Button text wraps** when it does not fit (`text-wrap: balance` in `src/index.css`), so long translations never
  push a phone screen sideways. Controls that must stay on one line say so themselves (`.glass-segment`,
  `.glass-chip`, `.glass-tabbar-item`, or `whitespace-nowrap` / `truncate`). Do not add a global `nowrap` again
  (sprint 2 had one: the registration form scrolled sideways on every phone). Never put `shrink-0` on a button
  with a long label inside a row that does not wrap.
- Admin actions use `window.confirm` — automated browsers usually auto-dismiss it; a human must click.
- **i18n:** all UI text goes through `useI18n().t('<namespace>.<key>')` (`src/i18n/`; `translate()` outside React).
  English (`src/i18n/locales/en/*.ts`) is the typed source, Indonesian is the second reference; other languages
  are lazy-loaded chunks. Add every new key to `en` and `id`; follow `docs/TRANSLATING.md` for the rest and check
  with the locale checker (missing/extra keys, `{placeholders}`, copies of English). Never translate stored
  values (roles, status enums, `'Kustom / …'` sentinels) — only their display labels.
- **Motion:** import from `framer-motion` only (never `motion/react`), use the presets/hooks in `src/lib/motion.ts`
  (`usePresenceMotion`, `useScrollLock`, `useSheetDrag`, `LAYOUT_IDS`) and `src/lib/haptic.ts`. Everything must
  fall back to plain fades with reduced motion. Variants end at `transform: none` so fixed children are not trapped.

## 7. Build & verify

```
npm install --legacy-peer-deps
npx tsc --noEmit
npx vite build
```
After a deploy, the PWA service worker may serve the previous build once; a reload picks up the new one.

## 8. Current state & open tasks (keep updated)

Done (2026-10-11): blur fix; `/api/*` Vercel functions + `vercel.json`; restored `firestoreDatabaseId`;
secure rules + `memberCards` + chronological KCC IDs + admin auth (commit `42ae55d`), merged with AI Studio's
phone2/additionalPhones, Sheets OAuth and upload fixes (`6694589`); rules published; repair run (762 members,
all IDs unique, `memberCards` built, public lookup verified).

Done (2026-10-11, live): bilingual privacy policy at `/privacy` (needed for the OAuth Branding page).

**Sprint 2 — branch `claude/sprint-2`, PR #1 into `main` (NOT merged / NOT live yet, 2026-10-13):**
- A `785f6f5`: admin Sheets scope = `spreadsheets.readonly` only, requested on demand for the signed-in admin
  (no Drive scope, no Drive file list — paste the sheet URL/ID, last ID remembered); member Google sign-in asks
  basic scopes only; bulk duplicate merge buttons; fixed: custom province not saved, "submit another" reset,
  UserProfile custom city input.
- B `18ac06e`: world regions for every country in `public/geo/` (250 countries, dr5hn v4.0-export.40, ODbL
  attribution) + official Indonesian list (38 provinces / 514 kab-kota), loaded per country on demand;
  regenerate with `scripts/build-geo.mjs`. `country-state-city` is no longer imported (kept in package.json only
  to avoid bun.lock drift). PWA precache 9.9 MB → 1.8 MB.
- C1 `74749bf` `674bab1`: i18n system in `src/i18n/` (742 keys, 13 namespaces), every UI string extracted.
- C2 batch 1 `66db3c9` `985cc2d`: complete + strict: en, id, ms, tl, jv, jv-Jawa, su, su-Sund.
- D1 `cf3b351` `f3f11fb`: one liquid-glass class set, sticky glass header, segmented nav, bottom-sheet modals on
  phones, 44 px touch targets, 16 px inputs, lazy-loaded screens. D2 `6941737` `984b90b`: `src/lib/motion.ts` +
  `haptic.ts`, page/tab transitions, animated segment thumbs, drag-to-dismiss sheets, scroll lock, haptics.
- D3 (2026-10-13): removed dead `DirectoryView.tsx`, old `src/lib/i18n.ts`, stale `firestore.rules.test.ts`;
  button text may wrap (fixes sideways scrolling on phones); vendor code split into `react-vendor`, `firebase`
  and `motion` chunks.

Open:
- **Before merging PR #1:** visual check on a phone-size and a desktop-size window (sheets, drag-to-dismiss,
  page transitions, admin tabs, language switch incl. `ar` RTL). The owner approves the merge.
- **C2 batches 2 + 3** (currently only partly translated; missing keys fall back to English): zh-Hans, zh-Hant,
  ja, ko, th, vi, then ar, ta, fr, es, pt, de. Each must pass the locale checker and end with strict types.
- **Duplicate registrations:** the scan finds 201 pairs (same cosname + same phone; duplicate ID = keeper ID + 346
  → the whole list was imported twice). Not merged yet. After PR #1 is live, the admin uses the bulk merge:
  "identical" = same cosname + same primary WhatsApp + created within 60 s, which covers all ~201 pairs (74 with
  the same timestamp + 127 import pairs 14 s apart); the owner approved the 74 so far and decides on the rest.
- **Backlog (code):** a signed-in member who also submits the public form gets two member docs (sign-in profile +
  `kc_` registration; repair does not merge them); a changed Sheets import can overwrite in-app profile edits with
  sheet values/defaults; fully safe public registration (no client-chosen IDs, no `kc_` doc carrying someone
  else's email) needs a server-side endpoint with the Admin SDK; package.json still lists unused `motion`,
  `country-state-city` and the conflicting `esbuild ^0.25` (remove together with a `bun.lock` update).
- **Google side (Gemini) — status reported by Gemini 2026-10-11, verified by Claude in the Cloud console:**
  - [x] Google Drive API + Google Sheets API enabled on `gen-lang-client-0922635128` (both listed under
    Enabled APIs & Services, with traffic).
  - [x] OAuth consent screen test user `cosplaysehat@gmail.com` added.
  - [ ] Firestore billing upgrade deferred (stays on "AI shared quota" for now).
  - [ ] Google Sheets sync end-to-end verification (ready to test: admin → "Hubungkan Google Sheets").
  - [ ] **OAuth app is in "Testing" (External).** Google: "While publishing status is set to 'Testing', only test
    users are able to access the app" (user cap shows 1 user lifetime). Firebase Google sign-in uses this project's
    OAuth client, so **members' "Lanjutkan dengan Google" sign-in is blocked for everyone except test users.**
    Fix (Google side): complete the Branding page (app name, support email, homepage https://mykcc.vercel.app,
    privacy policy URL https://mykcc.vercel.app/privacy (live), authorized domain `mykcc.vercel.app`) → **Publish
    app** (In production). Member sign-in only requests openid/email/profile (no verification needed). Status of
    the publish step not recorded yet.
  - Gemini (2026-10-11): Drive scope removed from the consent screen; Sheets sync verified on the KCC spreadsheet.
    The live `main` still asks the admin for `drive` + `spreadsheets`; PR #1 switches to `spreadsheets.readonly`.
