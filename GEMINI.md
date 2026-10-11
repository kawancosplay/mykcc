# MyKCC — Gemini context

@./AGENTS.md

The full guide is `AGENTS.md` (imported above). Read it before doing anything. The non-negotiables:

1. **Branches, not `main`.** Work on a `gemini/<topic>` branch and merge via pull request after
   `npx tsc --noEmit` and `npx vite build` pass. Another agent (Claude) also works on this repo; parallel
   pushes to `main` have already caused an 11-file merge conflict.
2. **Firestore is the named database** `ai-studio-kawancosplaymemb-f672c087-2a65-4410-827e-a10092d7e040`
   (project `gen-lang-client-0922635128`). Keep `firestoreDatabaseId` in `firebase-applet-config.json`.
3. **`firestore.rules` in the repo is the only rules source.** Publish exactly that file to the named DB.
   Never make `members` publicly listable/readable and never allow anonymous member update/delete —
   public lookups use `memberCards` (no personal data).
4. **No client-side admin passkey, no anonymous writes on page load, no KCC IDs derived from client-side
   member lists, never main/admin-range IDs from public form input.**
5. **CSS:** `-webkit-backdrop-filter` must come before `backdrop-filter` (production minifier drops the blur otherwise).
6. Never commit secrets; use Vercel environment variables. Update section 8 of `AGENTS.md` when you finish a task.

Your main area (Google side): Firebase console, Google Cloud APIs (Drive, Sheets), OAuth consent screen,
service accounts, quotas/billing, and testing the Google Sheets sync with real accounts.
