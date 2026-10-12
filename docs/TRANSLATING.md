# Translating MyKCC (task for the Gemini agent — sprint 2, phase C2)

Owner-approved split: **Gemini translates** (this file), **Claude** works on the design/performance phase in parallel.
Read `AGENTS.md` first (git rules, project facts).

## When to start
Start after the commit **`feat(sprint2-C1)`** is on branch `claude/sprint-2` (Claude pushes it when the i18n
infrastructure and the English + Indonesian source strings are done). Check with `git log origin/claude/sprint-2`.

## Branch & PR
1. `git fetch origin` → `git checkout -b gemini/translations origin/claude/sprint-2`
2. Commit per language or per few languages (small commits).
3. Open a pull request **into `claude/sprint-2`** (NOT into `main`).
4. You only edit files under `src/i18n/locales/<code>/` for the 18 languages below (+ section 8 of `AGENTS.md`).
   Claude is editing components and CSS at the same time — touching only these files means no conflicts.

## What to translate
Source of truth: **English** in `src/i18n/locales/en/<namespace>.ts` (Indonesian in `src/i18n/locales/id/` is a
second reference — it is the community's main language, so use it to understand intent and tone).

Namespaces: `common, auth, card, registration, profile, gallery, stats, siteEditor, admin, demo, sheets, errors`
(check `src/i18n/locales/en/index.ts` for the final list).

Languages (code → language):

| Code | Language | Notes |
|---|---|---|
| `ms` | Malay (Bahasa Melayu, Malaysia) | |
| `zh-Hans` | Chinese, Simplified | |
| `zh-Hant` | Chinese, Traditional (Taiwan/HK usage) | not a mechanical conversion of zh-Hans: use Traditional vocabulary |
| `ja` | Japanese | polite です/ます form |
| `ko` | Korean | polite 해요체 form |
| `ar` | Arabic (Modern Standard) | RTL is handled by the app; do not add direction marks |
| `ta` | Tamil | |
| `fr` | French | |
| `es` | Spanish (neutral) | |
| `pt` | Portuguese (neutral; Brazil-friendly) | |
| `de` | German | informal "du" fits a community site |
| `tl` | Filipino / Tagalog | |
| `th` | Thai | |
| `vi` | Vietnamese | |
| `jv` | Javanese, Latin script | polite register (krama) for instructions, friendly tone |
| `jv-Jawa` | Javanese, Aksara Jawa (Hanacaraka, Unicode U+A980–U+A9DF) | transliterate your `jv` text into Aksara Jawa |
| `su` | Sundanese, Latin script | polite register (lemes) |
| `su-Sund` | Sundanese, Aksara Sunda (Unicode U+1B80–U+1BBF, U+1CC0–U+1CCF) | transliterate your `su` text into Aksara Sunda |

For `jv-Jawa` and `su-Sund`: keep brand names, numbers, URLs, emails, emoji and `{placeholders}` in Latin script.

## Rules (important)
- **Every key** of the English namespace must exist in every language file. Keep key names exactly.
- Keep `{placeholders}` **exactly** (same name, same braces) — e.g. `"Menggabungkan {done}/{total} grup…"`.
- Keep brand / product names as-is: MyKCC, KawanCosplay, KCC, KCC ID, WhatsApp, Discord, Google, Google Sheets,
  Firebase, Instagram. Community terms usually stay in English: cosplay, cosplayer, cosname, fandom, wota, SFW,
  gathering — unless the language has a common native word.
- Keep emoji, `\n` line breaks, punctuation style of the source, and leading/trailing spaces.
- Keep it short where the English is short (buttons, tabs, badges) — mobile screens are narrow.
- Tone: friendly, welcoming, respectful (a hobby community with members of all ages, many under 18).
- Legal / privacy wording (e.g. personal data, consent, parent/guardian) must stay accurate — do not soften it.
- Do NOT edit `en/` or `id/`. If an English source string looks wrong or unclear, mention it in the PR description.
- Do NOT translate anything outside `src/i18n/locales/` (stored database values, role values, enums stay as they are).

## Make the types strict when a language is complete
Each non-English/Indonesian file currently uses a partial type so the build passes before translation:
```ts
const common: Partial<LocaleNamespace<'common'>> = { ... };
```
When a namespace is fully translated, change it to the strict type, so TypeScript reports any missing key:
```ts
const common: LocaleNamespace<'common'> = { ... };
```
and in that language's `index.ts` change `PartialLocaleDictionary` to `LocaleDictionary`.
**Every one of the 18 languages must end strict.**

## Verify before every push
```
npm install --legacy-peer-deps
npx tsc --noEmit
npx vite build
```
Both must pass. Then open the site locally (`npm run dev`), switch languages in the navbar, and spot-check the
registration form, KCC ID lookup, gallery and member card in a few languages (incl. `ar` for RTL and `jv-Jawa`
/ `su-Sund` for script rendering).

## When done
- Update section 8 of `AGENTS.md` (mark "translations: done" with the date and any caveats).
- In the PR description list: languages done, any source strings that looked wrong, anything you were unsure about
  (especially Javanese/Sundanese scripts) so a native speaker can review.
