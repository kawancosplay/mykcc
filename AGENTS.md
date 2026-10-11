# MyKCC — guide for AI agents (Gemini, Claude, AI Studio, …)

Canonical instructions for every AI agent working on this repo. `GEMINI.md` and `CLAUDE.md` point here.
Read this whole file before changing code, Firebase settings or Google Cloud settings.
Last updated: 2026-10-11.

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
- Admin actions use `window.confirm` — automated browsers usually auto-dismiss it; a human must click.
- Bilingual UI copy (Indonesian/English) is common; 20 languages exist in `src/lib/i18n.ts` but many strings are
  still hard-coded (`currentLang === 'id' ? … : …`) — see open tasks.
- `src/components/DirectoryView.tsx` is unused (dead code).

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

Open:
- **Duplicate registrations:** the scan finds 201 pairs (same cosname + same phone; duplicate ID = keeper ID + 346
  → the whole list was imported twice). Not merged yet. Plan: a bulk "merge all exact duplicates" admin button
  with one confirm.
- **Google side (Gemini):** enable Google Drive API + Google Sheets API; OAuth consent screen test users
  (the `drive` scope is restricted); Firestore is on "AI shared quota" — consider pay-as-you-go.
- **Code side (Claude):** full localization of all UI text into all 20 languages (lazy-loaded per language);
  consistent liquid glass across the site; iOS-like fluid UI/UX; performance (the `worldLocations` chunk is
  8.7 MB because of `country-state-city`; PWA precaches ~9.9 MB); world regions for every country from
  dr5hn/countries-states-cities-database (ODbL, attribution required) + official Indonesian list (38 provinces,
  514 kabupaten/kota), served as per-country JSON on demand.
- Known small bugs: custom province value never saved in RegistrationForm; custom-city input in UserProfile
  disappears after the first keystroke.
