# Sprint 2 handoff (Claude → Gemini), 2026-10-11

Claude stopped here because of usage limits. Read `AGENTS.md` first. Work on a `gemini/<topic>` branch made from
`origin/claude/sprint-2`; open pull requests **into `claude/sprint-2`** (not `main`). `npx tsc --noEmit` and
`npx vite build` must pass before every push (`npm install --legacy-peer-deps` first).

## Done on `claude/sprint-2`
- Phase A (`785f6f5`): Sheets OAuth = `spreadsheets.readonly` on demand, paste-URL instead of Drive list, bulk
  duplicate merge, form fixes.
- Phase B (`18ac06e`): world regions for all countries (`public/geo`, `scripts/build-geo.mjs`), loaded on demand.
- Phase C1 foundation (this commit): `src/i18n/` — `I18nProvider`/`useI18n()`/`translate()`, typed English
  namespaces (`src/i18n/locales/en/*.ts`), lazy per-language chunks, language auto-detect + saved choice,
  script fonts loaded on demand, existing translations migrated into all 20 languages. `App`/`main.tsx` wired.

## Remaining, in this order
1. **C1 extraction (do first).** Most components still contain hard-coded text
   (`currentLang === 'id' ? '…' : '…'`, `isId ? … : …`, plain JSX strings). For each component, replace every
   user-visible string (JSX text, placeholder, title, aria-label, alt, alert/confirm texts, errors) with
   `t('<namespace>.<key>')` from `useI18n()`, adding the English text to `src/i18n/locales/en/<ns>.ts` and the
   Indonesian text to `src/i18n/locales/id/<ns>.ts`. Namespace per file: App/Navbar/OfficialGovBanner/
   PWAInstallButton → `common`; AuthModal → `auth`; MemberCardModal → `card`; RegistrationForm →
   `registration`; UserProfile → `profile`; PhotoGallery/UploadPhotoModal → `gallery`; StatsOverview → `stats`;
   SiteEditorModal/themeContext → `siteEditor`; AdminDashboard → `admin`; DemoFormTester → `demo`;
   GoogleSheetsSync → `sheets`; user-facing messages in `src/lib/*` → `errors` (use `translate()` there and keep
   function signatures). **Never translate stored values** (role/option values saved to Firestore, status enums,
   `'Kustom / Kota Lainnya'` sentinels) — translate only their display labels. When nothing imports
   `src/lib/i18n.ts` anymore, delete it.
2. **C2 translations:** follow `docs/TRANSLATING.md` (18 languages, then switch types to strict).
3. **D design (optional, can be left for Claude):** consistent liquid glass + iOS-like feel + performance.
   `src/index.css` already contains a partial, unreviewed start from Claude (builds fine) — review it visually.
   Hard CSS rule: `-webkit-backdrop-filter` BEFORE `backdrop-filter`; glass in `@layer components`; no
   `transform`/`will-change` hacks on glass. Goals: one glass class set for all surfaces, mobile bottom-sheet
   modals, 44 px touch targets, inputs ≥ 16 px on mobile (stops iOS zoom), safe-area insets, press states,
   `prefers-reduced-motion`, lazy-load AdminDashboard/GoogleSheetsSync/modals.

Then update section 8 of `AGENTS.md`. The owner merges `claude/sprint-2` → `main` after review.
