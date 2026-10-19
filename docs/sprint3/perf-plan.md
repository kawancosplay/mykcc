# MyKCC sprint 3: phone performance plan (items 11-13)

Status: COMPLETE (2026-10-13). Planning only: no repo files were edited and no git state was changed. Lighthouse was not
re-run; all numbers come from the 10 saved `lh-*.json` runs plus code reading at `claude/sprint-3` `4adcd63`.

## 0. Scope, sources, and what "live" means

- Requirements: `requirements.md` items 11-13 ("fluid + fast on phones, low-spec devices and slow internet; keep the look").
- Code inspected: `C:\Users\Sato\Projects\mykcc` on branch `claude/sprint-3` at `4adcd63` (sprint 2 + D3 + all translations).
  No repo files were edited by this plan.
- **Live = the same code.** On 2026-10-13 the production domain mykcc.vercel.app serves the `claude/sprint-3` build
  (`4adcd63`), promoted by hand in Vercel, not `main` (`2d180f0`). The blob/precache fixes from sprint 2 are therefore
  already live, and the lag the owner sees on a phone comes from the current code. Live and local-preview numbers below
  agree within run-to-run noise. They are two samples of one build.
- Measurements: 10 saved Lighthouse 12.8.2 runs (mobile form factor, simulated throttling: 150 ms RTT, ~1.6 Mbps,
  4x CPU slowdown, moto g power UA, 412x823 @1.75x). `lh-live-*` = https://mykcc.vercel.app/, `lh-local-*` =
  http://localhost:4173/ (vite preview of `dist/`), `*-en-*` = English browser locale. Lighthouse was not re-run for
  this plan. Every run carries the warning "page loaded too slowly to finish within the time limit" because the Firestore
  WebChannel long-poll keeps the network busy, so the page never reaches network idle.
- Runtime jank (scrolling, opening sheets, page transitions on a real phone) does not show up in Lighthouse (TBT = 0 in
  8/10 runs). Those causes come from reading the code (section 2, causes C5-C8).

## 1. Measured numbers (saved Lighthouse runs)

### 1.1 Lab metrics per run (simulated mobile; "obs" = observed, unthrottled trace)

| Run | Score | FCP | LCP | SI | TBT | CLS | Transfer | obs FCP | obs LCP |
|---|---|---|---|---|---|---|---|---|---|
| live-1 | 69 | 2.82 s | 3.85 s | 2.95 s | 0 | **0.285** | 965 KB | 0.83 s | 1.09 s |
| live-2 | 74 | 2.86 s | 3.11 s | 2.86 s | 0 | **0.285** | 965 KB | 0.40 s | 0.54 s |
| live-3 | 62 | 5.17 s | 8.28 s | 5.46 s | 0 | 0 | 951 KB | 2.40 s | 2.41 s |
| live-4 | 62 | 5.22 s | 8.45 s | 5.54 s | 0 | 0 | 951 KB | 2.44 s | 2.45 s |
| live-en-1 | 62 | 5.19 s | 8.39 s | 5.49 s | 0 | 0 | 935 KB | 2.41 s | 2.46 s |
| local-1 | 59 | 5.35 s | 7.72 s | 5.35 s | 190 | 0.032 | 940 KB | 1.28 s | 2.39 s |
| local-2 | 60 | 3.04 s | 5.36 s | 3.04 s | 0 | **0.285** | 955 KB | 0.33 s | 0.61 s |
| local-3 | 60 | 6.31 s | 8.12 s | 6.31 s | 0 | 0 | 940 KB | 2.30 s | 2.33 s |
| local-4 | 62 | 5.47 s | 7.84 s | 5.65 s | 0 | 0 | 940 KB | 2.43 s | 2.43 s |
| local-en-1 | 55 | 2.97 s | 7.70 s | 3.57 s | 596 | 0 | 932 KB | 1.34 s | 1.91 s |

Medians: live score 62 (FCP 5.2 s, LCP 8.3 s), local score 60 (FCP 5.4 s, LCP 7.7 s). The runs fall into two groups:

- **Early paint, then a big shift** (live-1, live-2, local-2): background and header paint at 0.3-0.8 s (observed), the
  main column appears later and moves: one layout shift of **0.285** on `main.flex-1` ("Form Resmi KawanCosplay / 100%
  SFW ..."). Filmstrip live-1: 750 ms = gradient only, 1125 ms = header + "Official website" bar, main still empty.
- **Late paint, no shift** (live-3/4, live-en-1, local-3/4): the screen stays **blank white** until ~2.4 s (filmstrip
  live-3 at 1875 ms is pure white), then everything appears in one frame (obs FCP ≈ obs LCP). Under simulation, every
  byte requested before that paint (Firestore photos stream, Auth iframe, gapi, logo) is counted on the critical path,
  so simulated LCP becomes ~8 s.

DOM: 594 elements on first load, max depth 12, the largest node is the country `<select>` with 250 `<option>`s.
Main thread (live-3): 1.31 s total, of which script evaluation 0.52 s, style/layout 0.31 s, "other" 0.33 s, GC 0.10 s.
3 long tasks (109 ms document, 87 ms react-vendor, 54 ms unattributable). Bootup: react-vendor 282 ms, firebase 171 ms,
motion 87 ms, gapi 58 ms.

### 1.2 What is downloaded on first load (live-3, 29 requests, 951 KB transferred)

| Transfer | Raw | Request | Needed for first view? |
|---|---|---|---|
| **320 KB** | 439 KB | Firestore `Listen/channel` (photos snapshot) | No. The gallery is not open. |
| **171 KB** | 562 KB | `assets/firebase-*.js` (67 % unused at load per Lighthouse) | Partly (Firestore and Auth core) |
| **102 KB** | 102 KB | Logo PNG from `i.postimg.cc`, 800x800, shown at 44x44 | A ~3 KB version is enough |
| **93 KB** | 283 KB | `firebaseapp.com/__/auth/iframe.js` (popup resolver, cache TTL 30 min) | No. Only for Google sign-in. |
| 41 KB | 118 KB | `apis.google.com` gapi loader + `gapi_iframes` | No. Only for Google sign-in. |
| 68 KB | 214 KB | `react-vendor-*.js` (46 % unused) | Yes |
| 68 KB | 187 KB | `motion-*.js` x2 (49 % unused) | Partly |
| 36 KB | 130 KB | `index-*.js` (app entry) | Yes |
| 18 KB | 108 KB | `index-*.css` (render-blocking, 157-322 ms est.) | Yes, but large |
| 16 KB | 43 KB | `id-*.js` locale | Yes |
| 12 KB | 52 KB | `/geo/countries.json` + `/geo/ID.json` | Only when the address fields are shown |
| <2 KB | | document, manifest, registerSW.js (render-blocking), favicon | Yes |

Roughly 555 KB of the 951 KB (58 %: photos stream, Auth iframe and gapi, oversized logo) is not needed to show the
registration page. On a 1.6 Mbps link that is ~2.8 s of pure transfer time.
Lighthouse opportunities: unused JS 124 KB, image delivery 101 KB (logo), cache TTL on iframe.js 80 KB, preconnect
candidates `i.postimg.cc` (567 ms), `firestore.googleapis.com` (310 ms), `apis.google.com` (309 ms). The page
preconnects to `fonts.googleapis.com` and `fonts.gstatic.com`, but no font loads for Latin languages (numFonts = 0),
so those two early connections are wasted on a slow link.

## 2. Ranked causes with evidence

Ranked by how much they hurt a mid/low-end Android phone on a mobile connection. C1-C5 are load-time causes, visible in
Lighthouse. C6-C10 are runtime jank and do not show in Lighthouse.

**C1. Every visitor downloads the photo gallery on every page load. This is the biggest cause, and it keeps growing.**
- `src/App.tsx` ~L416-429: `subscribeToPhotos(...)` runs in an effect on mount (deps `[user?.uid]`), on every tab,
  including the registration landing page. The gallery tab only *renders* `photos`.
- `src/lib/galleryService.ts`: `query(collection('photos'), orderBy('createdAt','desc'), limit(100))`, live `onSnapshot`.
  `PHOTO_FIELD_LIMITS.photoUrl = 1000000`. Photos are stored **inline as base64 data URLs in the Firestore doc**
  (upload: `UploadPhotoModal.tsx` L97 `compressImage(file, 1200, 1200, 0.85)` returns a data URL).
- Network: one `Listen/channel` response of **320 KB transfer / 439 KB raw** at 0.58-0.64 s (observed), every run. It is
  the largest request on the page, and it competes for bandwidth with JS, the logo and the locale chunk.
- Scaling: the payload grows linearly with the gallery, up to 100 docs x up to ~1 MB each. At 100 typical 1200 px photos
  (~250-400 KB each as base64) that is **25-40 MB per visit**, for every visitor, before they open the gallery.
- Runtime: the strings stay in React state (and, when the gallery opens, again in `<img src>` attributes). Every like
  (`likesCount` update) on any photo pushes a new snapshot, then `setPhotos`, then a re-render of the whole `App` tree,
  including the 1,391-line `RegistrationForm`. `loading="lazy"` on the gallery `<img>` saves nothing, because the bytes
  are already downloaded inside the snapshot.

**C2. The Firebase Auth popup machinery loads at startup, although nobody has tapped "Sign in".**
- `src/lib/firebase.ts` L33: `export const auth = getAuth(app)`. In the browser build, `getAuth` = `initializeAuth` with
  `browserPopupRedirectResolver`, which loads the hidden auth iframe at startup.
- Network: `…firebaseapp.com/__/auth/iframe` (+ `iframe.js` **93 KB** transfer / 283 KB raw, cache TTL only 30 min, so
  Lighthouse flags 80 KB wasted), `apis.google.com/js/api.js` + `gapi_iframes` (**41 KB**, 58 ms bootup), plus a
  preflighted `identitytoolkit … getProjectConfig` XHR (ends at 1.09 s observed). That is 3 extra origins (DNS + TLS each
  ~0.3-0.6 s on 3G/4G), ~134 KB and ~70 ms main-thread time, all for the first paint of a public form.
- No code uses `signInWithRedirect` / `getRedirectResult` (grep), so the resolver is only needed by the 5 popup calls:
  `authService.ts` L226 (Google), L237 (Apple), L245 (Microsoft), `googleAuth.ts` L218 (`reauthenticateWithPopup`),
  L219 (`signInWithPopup`). Sprint-3 item 4 (re-auth for dashboard password reset) will add one more.

**C3. LCP is a client-rendered paragraph that waits for all JS, then for a first-load animation and a language swap.**
- LCP element (all 10 runs): `div.glass-card > div.p-5 > p.text-slate-300`, the welcome paragraph of the registration
  header. LCP phases (live-3): TTFB 7 %, load delay 0, **render delay 93 %**. Nothing is server-rendered: `index.html`
  has an empty `#root`.
- Startup JS before anything renders: `index` 36 + `react-vendor` 68 + `firebase` 171 + `motion` 43 + 25 + locale 16
  = **~360 KB gz / ~1.14 MB raw**. Lighthouse: 124 KB unused JS at load (firebase 67 % unused, react-vendor 46 %,
  motion 49 %). Bootup: react-vendor 282 ms, firebase 171 ms, motion 87 ms at 4x CPU slowdown.
- First-load entrance animation: `App.tsx` L716-720 `<AnimatePresence mode="wait"><motion.main key={activeTab}
  {...pageMotion}>`, without `initial={false}`. On the very first render the main column starts at `opacity: 0` (+8 px)
  and springs in (`SPRING.page`, stiffness 340 / damping 36, ~0.5 s to settle). Chrome does not count an opacity-0
  element for LCP, so the LCP waits for framer-motion to load, run and fade the column in. Filmstrip live-1: at 1125 ms the
  header is painted and the main column is still invisible.
- English first, then Indonesian: `I18nProvider.tsx` renders with the English dictionary and only *starts* loading the
  detected locale chunk in a `useEffect` after the first commit (`loadLocale(lang)`, then `setLoadedCount`). Filmstrip
  live-1: 1125 ms shows "Official website of KawanCosplay / Here's how you know" (English). By 1500 ms it is "Situs resmi
  KawanCosplay / Cara memastikan keaslian situs" (Indonesian, wrapping onto 2 lines). The whole tree renders twice, and
  every text block changes length.

**C4. The logo is an 800x800 PNG of 102 KB from a third-party host, without intrinsic size.**
- `Navbar.tsx` L207-208 hard-codes `https://i.postimg.cc/…/Logo-Kawan-Cosplay-Community-Redesigned-Alt.png` for desktop
  and mobile. It is displayed at 44x44 CSS px (`h-11 w-auto`), 77x77 device px at DPR 1.75. Lighthouse: 101 KB
  wasted. New origin: preconnect candidate worth 567 ms. Download window 0.22-1.32 s (observed).
- `KawanCosplayLogo.tsx` L60-67: `<img … className="h-11 sm:h-14 w-auto max-w-[210px]" loading="eager">`, with no
  `width`/`height` attributes. Its width is 0 until the image arrives, then the header re-lays out (local-1: 0.032 shift on
  the header, "Logo KawanCosplay"). Filmstrip live-1: the logo is still small/blank at 1500 ms and full size at 1875 ms.

**C5. CLS 0.285 comes from late-arriving header/main content (3 of 10 runs; the others paint after everything settled).**
- The shift is attributed to `main.flex-1` (final top 105 px, i.e. right under the sticky header). It occurs only in the
  early-paint runs, where the first frame is drawn before the locale chunk, the logo and the Firestore theme have
  arrived. In late-paint runs, CLS = 0. Contributors visible in code and filmstrip: (a) the English-to-Indonesian swap
  (C3) changes the header banner from 1 to 2 lines (`OfficialGovBanner.tsx` L57 `flex flex-wrap … justify-between`)
  and every text block in the form; (b) the logo without intrinsic size (C4); (c) `themeContext.tsx` starts with
  `DEFAULT_THEME` and replaces it when the `siteSettings/theme` snapshot arrives. In the public layout the theme only
  drives the background (`App.tsx` L193-218, then `--app-bg`), so this is a background flash plus a full extra re-render,
  not a geometry change. The exact source rects of the 0.285 shift are not in the saved JSON. Confirm them with the
  lead's `cls-probe.mjs` (scratchpad) after fixes F3/F4.
- The "late-paint" group (blank white until ~2.4 s while the main thread is idle from 0.28 s: DCL 195 ms, last long task
  ends at 276 ms, first paint 2,402 ms) is not explained by the page code. It is most likely a headless-Chrome frame
  scheduling artefact. Treat the early-paint runs as the realistic picture, and re-check on a real phone (section 7).

**C6. Backdrop blur on scrolling surfaces (runtime, the main cause of "laggy" scrolling on weak GPUs).**
- `src/index.css` has 9 blurred rules (18 declarations incl. `-webkit-`, 27 mentions with comments and fallbacks):
  `.glass-bar/.glass-pill/.glass-tabbar/.liquid-glass::before` blur 20 px + saturate 180 % (L360-373);
  `.glass-card-frosted` 16 px (L437-443, unused); `.glass-elevated` 28 px (L458-467, unused); `.glass-sheet` 28 px
  (~L503); `.glass-overlay` 8 px (desktop only, L579-582, good); `.glass-menu` 24 px (L587-597);
  **`.glass-chip` 12 px + saturate 160 % (L737-753, in-flow, ~23 uses)**; **`.glass-icon-button` 12 px (L889-903,
  in-flow, ~10 uses)**; `.glass-toast` 24 px (L924-939).
- The sticky header (`App.tsx` L683: `sticky top-0 z-50 glass-bar`) covers the top ~105 px. Its `::before` re-blurs and
  re-saturates whatever scrolls underneath on every scroll frame. The chips and icon buttons scroll *with* the content,
  so each one is an extra backdrop read per frame while moving. Sprint 2 already removed blur from in-flow `.glass-card`
  (L420-428 "In-flow cards: no backdrop blur"), and chips and icon buttons are the remaining in-flow exceptions.
- `saturate(180%)` doubles the filter work for a barely visible effect.

**C7. Scrolling re-renders the whole app.**
- `App.tsx` L148-178: the passive scroll listener (rAF-throttled, good) calls `setIsVisible(true/false)` in `App` when
  the scroll direction flips. That re-renders `App` and every non-memoized child: Navbar, RegistrationForm (~600 DOM
  nodes, 250-option country `<select>`), modals. On a phone that is a 30-80 ms React render in the middle of a
  scroll gesture, exactly when the user notices it. The header then animates `translate` over **500 ms**
  (`duration-500 ease-ios`) on a blurred layer.

**C8. Motion cost: springs, wait-mode page transitions, a second motion chunk.**
- Page/tab change: `AnimatePresence mode="wait"`, so the old screen fades out first, then the new one springs in.
  Perceived tab-switch latency is the exit plus ~0.5 s of spring settle. During the exit the new screen (often a lazy chunk)
  is not even mounted.
- framer-motion = 68 KB gz across 2 chunks at startup, 87 ms bootup. `OfficialGovBanner` animates `height` (layout
  every frame) when the disclosure opens. Navbar uses `layoutId` shared-layout thumbs (measure + animate).

**C9. Large landing DOM and render-blocking CSS.**
- 594 DOM nodes on the landing page, 250 `<option>`s in the country `<select>`, style/layout 0.31-0.38 s at load. The
  `cv-auto` utility exists (`index.css` ~L1356) but is used only on gallery cards (`PhotoGallery.tsx` L413). The long
  registration form sections (below the first ~2 screens) are laid out and painted up front.
- `index-*.css` is 108 KB raw / 18 KB gz, render-blocking (157-322 ms estimate). `registerSW.js` is a render-blocking
  `<script>` in `<head>` (tiny, but one more sequential request).

**C10. Small startup waste.**
- `index.html` preconnects to `fonts.googleapis.com` + `fonts.gstatic.com`, but Latin languages load no web font
  (numFonts = 0, `'DIN Next'` falls back to `sans-serif`). That is two wasted early connections. Script fonts are loaded on
  demand by `ensureLanguageFont` anyway.
- `/geo/countries.json` (37.6 KB raw) + `/geo/ID.json` (14.8 KB raw) are fetched at startup for the address pickers.
- The idle prefetch (`App.tsx` ~L231-244) pulls AuthModal, MemberCardModal, PhotoGallery and UploadPhotoModal chunks
  at ~2.15 s even on Save-Data / 2G connections.

## 3. Prioritized fix list (files, expected gain, risk)

Gains are estimates against the saved runs (simulated slow-4G, 4x CPU). "Bytes before paint" maps almost directly to
simulated FCP/LCP, at ~0.55 s per 100 KB on the Lighthouse link (1.47 Mbps down). None of the fixes changes the look in
normal mode. Lite mode (F7) is an opt-in/auto visual downgrade. No fix needs `package.json` / `bun.lock` changes.

| # | Prio | Fix | Main files | Expected gain | Risk |
|---|---|---|---|---|---|
| F1 | P0 | Photos only when the gallery is open, paged 12 + "load more" | `App.tsx`, `galleryService.ts`, `PhotoGallery.tsx` | **-320 KB / -439 KB raw per landing load (-34 %)**, about -1.7 s of transfer on slow 4G. No more App re-render on every like. The C1 growth risk (up to tens of MB) is gone. | Low-med (gallery filters cover loaded pages only) |
| F2 | P0 | Auth without the popup resolver at startup, passed per popup call, warmed on intent | `firebase.ts`, `authService.ts`, `googleAuth.ts`, `AuthModal.tsx` | **-134 KB, -3 origins, -1 preflighted XHR, ~-70 ms main thread** at startup | Med (popup blocking on iOS if not warmed, see details) |
| F3 | P0 | First frame final: no entrance animation on first load + locale ready before first render | `App.tsx` L716, `main.tsx`, `i18n/runtime.ts` | LCP render delay -0.3 to -0.6 s. One full render instead of two. **The CLS from the en-to-id swap disappears.** | Low |
| F4 | P0 | Logo: self-hosted 96/160 px WebP with `width`/`height` + preload | `public/`, `KawanCosplayLogo.tsx`, `Navbar.tsx`, `index.html` | **-98 KB, -1 origin (567 ms est.)**, header shift gone | Low |
| F5 | P1 | Theme from `localStorage` first, Firestore snapshot only updates on change | `themeContext.tsx`, `App.tsx` | No background flash, one less full re-render per load (~30-80 ms on a phone) | Low |
| F6 | P1 | Blur only on fixed surfaces on phones; lighter blur radius/saturate | `index.css` | Fewer backdrop passes per scroll frame, smoother scrolling on weak GPUs | Low (visual) |
| F7 | P1 | Lite / low-power mode (auto + manual toggle, persisted) | new `src/lib/perfMode.ts`, `index.css`, `motion.ts`, `Navbar.tsx`, `UserProfile.tsx`, `App.tsx`, `index.html`, i18n en+id | Low-end phones: no backdrop-filter, no ambient layer, near-zero motion, no idle prefetch | Low-med (detection heuristics) |
| F8 | P1 | Scroll no longer re-renders App; memoize the form | `App.tsx` (header component), `RegistrationForm.tsx` export | Removes a 30-80 ms React render in the middle of every scroll-direction change | Low |
| F9 | P1 | Cheaper page/tab transitions (short tween, opacity/transform only) | `motion.ts`, `App.tsx` | Tab switch ~0.8 s down to ~0.3 s perceived, fewer animated frames | Low |
| F10 | P2 | `content-visibility: auto` on the long off-screen form sections | `RegistrationForm.tsx`, `index.css` (`cv-auto` sizes) | Initial style/layout ~0.31 s down to ~0.15-0.2 s (4x CPU), cheaper first render | Low-med (scroll-anchoring jumps if the size estimate is poor) |
| F11 | P2 | Startup trims: drop Google Fonts preconnects, preconnect Firestore, defer `registerSW`, skip idle prefetch on slow/Save-Data, lazy geo lists, dark inline background | `index.html`, `vite.config.ts`, `App.tsx`, `RegistrationForm.tsx` | -2 wasted connections, -1 render-blocking request, -12 KB, no prefetch on 2G | Low |
| F12 | P2 | Upload compression (photos <= 1600 px long side, avatars <= 256 px, WebP/JPEG ~0.75) + grid thumbnails | `imageUtils.ts`, `UploadPhotoModal.tsx`, `RegistrationForm.tsx`, `UserProfile.tsx` | Avatars ~100 KB down to ~10-15 KB. Smaller photo docs at equal size. See section 6 for the 1600 px trade-off. | Low (thumbnails: rules change) |
| F13 | P3 | Optional: Firestore out of the startup bundle (dynamic import after first paint) / static HTML shell | `firebase.ts` + all importers, `index.html` | Up to -171 KB gz parse at startup. LCP no longer waits for Firebase eval. | High (large refactor). Do it only if F1-F11 miss the budget. |

Combined estimate (F1-F5 + F11): bytes before first paint ~951 KB down to **~390 KB**, origins at startup 7 down to 3. Simulated
mobile: FCP ~2.8-5.2 s down to **~1.8-2.3 s**, LCP 3.1-8.4 s down to **~2.3-3.0 s**, CLS 0.285 down to **< 0.05**, score 55-74 up to **~85-92**.
F6-F10 do not move Lighthouse much (TBT is already ~0). They are what makes scrolling and tab switches feel fluid on
the owner's phone.

### F1. Photos: subscribe only while the gallery is open, paged

- `App.tsx` L416-429: delete the mount-time `subscribeToPhotos` effect and the `photos` state (its only consumer is
  `<PhotoGallery photos={photos}>`, L850).
- `galleryService.ts`: add `fetchPhotosPage(after?: QueryDocumentSnapshot, pageSize = 12)` using
  `getDocs(query(collection(db,'photos'), orderBy('createdAt','desc'), ...(after ? [startAfter(after)] : []), limit(12)))`,
  which returns `{ photos, cursor, hasMore }`. Optional live freshness: `onSnapshot` on **page 1 only** (`limit(12)`) for new uploads
  and likes. Older pages are one-shot `getDocs`. Rules already allow it: `photos` list requires
  `request.query.limit <= 100` (`firestore.rules` L273). No rules change, safe for live and new code.
- `PhotoGallery.tsx`: owns the feed (`usePhotoFeed()` hook: load page 1 on mount, unsubscribe on unmount). "Load more"
  button (plus an optional `IntersectionObserver` sentinel 600 px before the end). Optimistic like (`likesCount + 1` locally,
  then `toggleLikePhoto`). Prepend the new photo after `UploadPhotoModal` succeeds. The character/event filters and search
  work on the loaded items. Show "x of y loaded, load more to search older photos". This matches item 2 (admin Gallery
  tab: paged, newest first, client-side search over loaded items), so build one shared `fetchPhotosPage` for both.
- Keep `loading="lazy" decoding="async"` and `cv-auto` on cards. With 12 per page the decode cost on open is bounded.

### F2. Firebase Auth: lazy popup resolver

- `firebase.ts` L33: replace `getAuth(app)` with
  `initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence] })`
  (same persistence order `getAuth` uses, **no `popupRedirectResolver`**). Wrap it in try/catch and fall back to `getAuth(app)` on
  "already initialized" (HMR), like `createFirestore()` does.
- Pass `browserPopupRedirectResolver` as the 3rd argument at all 5 popup call sites: `authService.ts` L226, L237, L245
  (`signInWithPopup(auth, provider, browserPopupRedirectResolver)`), `googleAuth.ts` L218
  (`reauthenticateWithPopup(user, provider, browserPopupRedirectResolver)`), L219. Do the same for the new sprint-3 re-auth
  (item 4). No code uses redirects, so nothing else changes.
- **Why "warm on intent" is required:** Firebase initializes the resolver proactively on mobile/Safari
  (`_shouldInitProactively`) because the popup must open inside the tap's user activation. If the iframe is first
  loaded at tap time, `signInWithPopup` awaits the iframe before `window.open`, and iOS Safari may block the popup.
  Fix: as soon as intent is shown, warm it with the public API
  `void getRedirectResult(auth, browserPopupRedirectResolver).catch(() => {})` (it initializes the resolver and returns
  `null`). Do this in `AuthModal` on mount (the user taps "Sign in", then a provider button about 1 s later), in
  `GoogleSheetsSync` on mount (Sheets connect), and in the dashboard-lock "forgot password" dialog. Optionally also add
  `<link rel=preconnect>` to the authDomain + `apis.google.com` at that moment.
- The `isPopupBlockedError` path already exists (`googleAuth.ts` L62). Make sure its message says "tap again", because
  the second tap always works once the resolver is warm.
- Test matrix: Android Chrome, iOS Safari, desktop Chrome/Firefox. Google, Apple and Microsoft sign-in, plus Sheets
  re-auth. A session restore on reload must still work (persistence is unchanged).

### F3. First frame = final frame

- `App.tsx` L716: `<AnimatePresence mode="wait" initial={false}>`. The landing column is visible in the first paint, and
  later tab changes still animate. `RegistrationForm` already does this (L1387).
- Locale before first render: Indonesian is the community's main language, so import the `id` dictionary statically next to
  `en` (+16 KB gz in the entry, saves a sequential request for most visitors). For the other 18 languages, `main.tsx` waits
  for `loadLocale(getInitialLanguage())` with a 1.5 s cap before `createRoot().render(...)`, so the first frame is in the
  final language. Fallback: English, as today.
- `index.html`: `<html lang="en">` is static. `I18nProvider` already sets `lang`/`dir`. Nothing else is needed.

### F4. Logo

- Create `public/brand/kcc-logo-96.webp` (96x96, for 44 CSS px up to DPR ~2.2) and `kcc-logo-160.webp` (160x160, for
  56 CSS px desktop / DPR 3 phones) from the current 800x800 PNG. Expect ~3-8 KB each. Make them once with any image tool
  and commit the files. No new dependency.
- `Navbar.tsx` L207-208: use the local files. `KawanCosplayLogo.tsx` L60-67: add `width={44} height={44}`,
  `srcSet="/brand/kcc-logo-96.webp 96w, /brand/kcc-logo-160.webp 160w"`, `sizes="(min-width: 640px) 56px, 44px"`,
  `fetchPriority="high"`, `decoding="async"`. The `h-11 sm:h-14 w-auto` classes keep working, and the attributes give the
  aspect ratio, so the box is reserved before the image loads.
- `index.html`: `<link rel="preload" as="image" href="/brand/kcc-logo-96.webp" imagesrcset="…" imagesizes="…">`, so
  the logo downloads in parallel with the JS instead of after React renders.
- Keep the `onError` emblem fallback. `theme.logo.customLogoUrl` (Site Editor) stays as is, because it is only used when no
  `logoSrc` is passed.

### F5. Theme cache

- `themeContext.tsx`: `useState(() => readCachedTheme() ?? DEFAULT_THEME)`, where `readCachedTheme` reads key `kcc_theme_v1`
  in try/catch, parses it, and accepts only known `background` values plus string `customBgGradient`. In `onSnapshot`: build the
  next theme, `if (JSON.stringify(next) === JSON.stringify(current)) return`, else `setTheme(next)` + write the cache.
  Wrap the provider `value` in `useMemo`.
- The `useLayoutEffect` in `App.tsx` L215-218 then paints the right `--app-bg` in the first frame. Optional: an
  inline 3-line script in `index.html` that copies the cached gradient into `--app-bg` before CSS paints.
- Optional: start the theme snapshot after first paint (`requestIdleCallback`, 2 s timeout). Together with F1 and F2, the
  Firestore WebChannel then no longer competes with first-paint requests at all.

### F6. Blur only where it is cheap and visible

- `index.css`, in `@layer components`, under `@media (max-width: 767px)` (or `(hover: none) and (pointer: coarse)`):
  `.glass-chip, .glass-icon-button { -webkit-backdrop-filter: none; backdrop-filter: none; }`, with a slightly
  stronger fill (`rgba(255,255,255,.10)` for chips, `rgba(20,14,40,.72)` for icon buttons). They sit on already-translucent
  cards, so the blur is barely visible but costs a backdrop pass while scrolling.
- On phones, keep blur only on surfaces that are fixed or overlay: `.glass-bar::before` (sticky header),
  `.glass-tabbar::before`, `.glass-sheet`, `.glass-menu` / `.liquid-glass-menu`, `.glass-toast`. Lower the phone radius
  and saturate: header/tabbar `blur(14px) saturate(140%)`, sheets/menus `blur(18px) saturate(150%)`. The cost grows with
  radius, and saturate is a second filter pass.
- Keep the `-webkit-` first ordering (AGENTS.md CSS rule) and no `will-change`/`translateZ` hacks on glass.

### F7. Lite / low-power mode

Full spec in section 4.

### F8. Scroll without re-rendering the app

- Move the scroll listener (`App.tsx` L144-178) and `isVisible` state into a `StickyHeader` component that renders the
  sticky wrapper (L681-707) with `OfficialGovBanner` + `Navbar`. Only the header re-renders when the direction flips.
  `App` passes `isMobileMenuOpen` down, or the header owns it too.
- Shorten the hide/show transition from `duration-500` to `duration-300`. It stays transform-only (`translate`).
- Wrap `RegistrationForm` in `React.memo` and stabilise its callbacks in `App` (`useCallback` for `onRegistered`,
  `onOpenCardModal`, and a memoized empty `existingMembers` array). Auth, theme, photo or header state changes then no longer
  re-render the 1,391-line form.

### F9. Cheaper transitions

- `motion.ts`: add `TWEEN.pageIn = { duration: 0.2, ease: [0.22, 1, 0.36, 1] }` and use it for `pageVariants.animate` /
  `tabVariants.animate` instead of `SPRING.page`. Keep the exit at a ~0.1-0.12 s opacity fade. That gives a tab switch of
  ≤ 0.32 s total in `mode="wait"`, instead of exit plus a ~0.5 s spring settle. Sheets keep their spring (drag
  physics), and `SPRING.sheet` is unchanged.
- Opacity/transform only (already true; `OfficialGovBanner` height animation is user-triggered and rare). In lite
  mode, everything uses the reduced variants (opacity, 0.12 s), the same path as `prefers-reduced-motion`.

### F10. content-visibility on long form sections

- `RegistrationForm.tsx`: the form has ~16 `glass-card` sections (L787-L1307). Leave the first two (header + first
  fields) as they are. Add a section class `cv-auto` from ~L878 on, with a per-section estimate:
  `[contain-intrinsic-size:auto_420px]` (the `auto` keyword remembers the real size after the first render, so later
  scroll estimates are exact).
- Must still work: `scrollIntoView` to the first invalid field, `focus()` on an invalid input, find-in-page, and
  autofill. All of these work with `content-visibility: auto` (the subtree is skipped for rendering, not removed). Test that
  the error-scroll lands on the field, since the estimated size can shift the target by one section on the first jump.
  Do not use it on sections containing `position: sticky` or open popovers.

### F11. Startup trims

- `index.html`: remove the `fonts.googleapis.com` / `fonts.gstatic.com` preconnects. `ensureLanguageFont`
  (`runtime.ts` L210) can add a preconnect next to the stylesheet it injects for script languages. Add
  `<link rel="preconnect" href="https://firestore.googleapis.com" crossorigin>` (310 ms est.). Add
  `<style>html,body{background:#05020a}</style>` so no white frame ever appears before CSS.
- `vite.config.ts`: `VitePWA({ injectRegister: 'script-defer', … })` makes `registerSW.js` non-blocking.
- `App.tsx` L231-244 idle prefetch: skip it when lite mode is active, `navigator.connection.saveData`, or
  `effectiveType` is `slow-2g`/`2g`/`3g`.
- `RegistrationForm.tsx` / `worldLocations.ts`: load `/geo/countries.json` + the country file when the address section
  approaches the viewport (or on first focus of the country select) instead of on mount.

### F12. Upload compression

Spec in section 6.

### F13. Only if the budget is still missed

- Load `firebase/firestore` with a dynamic import after first paint (a `getDb()` promise in `firebase.ts`, with all
  `firestoreService`/`galleryService`/`authService` call sites async). It removes most of the 171 KB gz chunk from the
  critical path, but touches nearly every data call. Alternatively, prerender the landing header (static HTML in `id`)
  so LCP no longer needs JS. Both are large changes. Measure after F1-F11 first.

## 4. Lite / low-power mode spec

Goal: low-end phones and slow or metered connections get the same layout and colours, with solid translucent surfaces
instead of live blur, no ambient light layer, near-zero motion and no speculative downloads. Normal phones keep the full
look.

### 4.1 Preference model (new `src/lib/perfMode.ts`)

- Stored choice: `localStorage['kcc_perf_mode']` = `'auto' | 'lite' | 'full'` (default `'auto'`). Every read and write is
  in try/catch (private mode or blocked storage falls back to `'auto'`). The choice is per device and never sent to
  the server.
- Effective state: `{ lite: boolean, lowData: boolean, reason: string[] }`.
  - `'lite'`: lite = true. `'full'`: lite = false. `'auto'`: lite = any power signal below.
  - `lowData` (Save-Data or slow connection) is tracked separately. It always switches off speculative downloads,
    even in `'full'`, because it is about the data plan rather than the GPU.
- OS accessibility preferences always win, whatever the choice: `prefers-reduced-motion: reduce` turns motion off (already
  done by `MotionConfig reducedMotion="user"` and the CSS block at the end of `index.css`).
  `prefers-reduced-transparency: reduce` turns blur off (already a CSS block, `index.css` ~L1063).

### 4.2 Auto-detection signals (all synchronous, evaluated before first paint)

| Signal | Rule | Notes |
|---|---|---|
| `navigator.deviceMemory` | `<= 4` → lite | Chromium only (undefined on Safari/Firefox, so ignored there). Values are rounded (0.25-8). |
| `navigator.hardwareConcurrency` | `<= 4` → lite | Ignore on Apple touch devices (`/iPhone|iPad/` or `MacIntel` with `maxTouchPoints > 1`). WebKit may report a clamped value, and iPhones handle blur well. Otherwise a false positive would downgrade every iPhone. |
| `navigator.connection.saveData` | `true` → lite + lowData | Chrome "Lite mode"/Data Saver users opted in to lighter pages. |
| `navigator.connection.effectiveType` | `slow-2g`, `2g` → lite + lowData; `3g` → lowData | Network-only signal. Re-evaluate on the `connection` `change` event, for lowData only. Never flip visuals mid-session. |
| `prefers-reduced-transparency: reduce` | → lite visuals | Already handled for blur by CSS. Lite also hides the ambient layer. |
| `prefers-reduced-motion: reduce` | → reduced motion | Already handled. Lite uses the same code path. |
| Optional: measured jank | rAF frame sampling during the first scroll (median frame > 34 ms over 60 frames) | **Suggest only**: a one-time toast with a "Switch to Lite" action. Never switches on its own. |

### 4.3 Applying it without a flash

- `index.html`: a ~15-line inline script in `<head>` (before the CSS link) reads `kcc_perf_mode` plus the signals above and
  sets `document.documentElement.dataset.perf = 'lite'` (and `data-lowdata`) synchronously. The first paint is then already
  correct, with no glass-to-solid swap. `perfMode.ts` contains the same logic for React (`usePerfMode()` via
  `useSyncExternalStore`, with `setPerfMode(pref)` updating storage, the attribute and the subscribers). Keep the two in
  sync with a comment, or have the inline script write `window.__KCC_PERF__`, which `perfMode.ts` reads.

### 4.4 What lite turns off

| Area | Lite behaviour | Where |
|---|---|---|
| Backdrop blur | `html[data-perf="lite"]` repeats the selector list of the existing `prefers-reduced-transparency` block (`index.css` ~L1063-1090): `backdrop-filter: none` (+ `-webkit-` first) and `background-color: var(--glass-fill-solid)` / the existing solid fallbacks. It covers header, tabbar, sheets, menus, chips, icon buttons, toast and overlay. | `index.css` `@layer components` |
| Ambient light | `.ambient-layer { display: none; }`. The `body::before` theme gradient stays, so the colours are unchanged. | `index.css` |
| CSS motion | Transitions ≤ 120 ms, `.glass-skeleton` shimmer static, header hide/show instant (`transition: none`). Spinners keep turning. | `index.css` |
| framer-motion | `MotionConfig reducedMotion={lite ? 'always' : 'user'}` at both roots (`App.tsx` L552, L672). In `motion.ts`, use framer's `useReducedMotionConfig()` instead of `useReducedMotion()` (~21 references in `motion.ts` + components, imports included). All presets then switch to the existing fade variants (opacity, 0.12 s) through one switch, which honours both the OS and lite. | `motion.ts`, `App.tsx` |
| Height animations | `OfficialGovBanner` / Navbar language disclosure: already have reduced variants (no height). Lite gets them through the same switch. | n/a |
| Speculative work | No idle chunk prefetch (`App.tsx` L231-244). Gallery page size 8 instead of 12. No auto "load more" sentinel (button only). | `App.tsx`, `PhotoGallery.tsx` |
| Images | Gallery thumbnails (when F12 thumbnails exist) only, full image on tap. Avatars at 256 px are already small. | `PhotoGallery.tsx` |

Lite does **not** change layout, spacing, colours, fonts, the sticky header, or any feature.

### 4.5 Manual toggle

- Control: a 3-option segmented control (`.glass-segmented`, a radiogroup) labelled "Display mode": **Auto · Lite · Full**.
  Under "Auto", a hint shows the current outcome ("Auto: Lite is on for this device"). The control must be reachable without
  signing in, because most visitors only register.
- Placement: (1) **Navbar mobile menu**, directly under the language selector (`Navbar.tsx`, mobile menu ~L489-520), the
  primary place on phones. (2) **Desktop language popover** (`Navbar.tsx` ~L277-300), a small section under the language
  list. (3) **Footer** (`App.tsx` L960-1020), a "Display mode: Auto" text button that opens the same control, so it can
  be found on every screen. Optional: the same control in `UserProfile` settings.
- One-time notice: when auto-detection enables lite for the first time, show a dismissible toast (`.glass-toast`, which is
  solid in lite): "Lite mode is on for smoother scrolling on this device. You can change it in the menu." Remember
  `kcc_perf_notice_seen=1` in try/catch.
- Switching takes effect immediately (attribute plus React subscribers), without a reload.
- i18n (en + id now, the other 18 in the translation stage): `perf.title` "Display mode" / "Mode tampilan",
  `perf.auto` "Auto" / "Otomatis", `perf.lite` "Lite" / "Ringan", `perf.full` "Full" / "Penuh",
  `perf.autoLiteHint` "Auto: Lite is on for this device" / "Otomatis: mode Ringan aktif di perangkat ini",
  `perf.autoFullHint`, `perf.liteNotice` (toast text), `perf.liteNoticeAction` "Change" / "Ubah".

## 5. CLS causes and fixes

Measured: CLS **0.285** in live-1, live-2 and local-2 (one shift, attributed to `main.flex-1`, final top 105 px), 0.032 in
local-1 (header, "Logo KawanCosplay"), 0 in the other 6 runs. Google's "good" threshold is 0.1, so the early-paint runs fail it.

| Cause | Evidence | Fix | Expected |
|---|---|---|---|
| English first frame, then Indonesian: header banner goes from 1 to 2 lines, all text re-flows | Filmstrip live-1 1125 ms (en) vs 1500 ms (id). `I18nProvider.tsx` loads the locale in `useEffect` after the first commit. `OfficialGovBanner.tsx` L57 `flex-wrap`. | F3: `id` bundled, other locales loaded before `render()` (1.5 s cap) | Main suspect for the 0.285. Expected ~0 after the fix. |
| Logo without intrinsic size (width 0 until loaded, then 44-56 px) | `KawanCosplayLogo.tsx` L60-67 has no `width`/`height`. Lighthouse `unsized-images` flags it. local-1 shift 0.032 on the header. | F4: `width={44} height={44}` + local WebP + preload | -0.03 |
| First-load entrance animation hides `main` (opacity 0, +8 px), so geometry is settled while invisible and revealed late | `App.tsx` L716 has no `initial={false}`. Main is not visible at 1125 ms in the live-1 filmstrip. | F3: `initial={false}` | LCP earlier. Removes the "invisible, then everything moves" window. |
| Theme replaced after the Firestore snapshot | `themeContext.tsx`: `DEFAULT_THEME`, then `setTheme(doc.data())`. Public layout uses only the background. | F5: cached theme + skip identical snapshots | No geometry change today, but it removes a full re-render and a background flash. It also future-proofs `layoutWidth` / `navbarStyle` if they ever affect the public layout. |
| Banner text that wraps differently per language (header height differs between languages) | `OfficialGovBanner.tsx` L57-72 | Give the banner row a fixed `min-h` (e.g. `min-h-[2.25rem]` on phones, 2 lines reserved) or `truncate` the second label on narrow screens. With F3 the height is final in the first frame anyway. | Defensive |
| Suspense fallback to real screen swap on lazy tabs (card, gallery, profile) | `ScreenSkeleton` (`App.tsx` ~L77-97) is a generic 5-row card, and its height differs from the real screen | Out of Lighthouse scope (user-initiated tab change, `hadRecentInput` excludes it within 500 ms). Optional: match the skeleton heights per screen. | n/a |

Verification: after F3 + F4, rerun the lead's `cls-probe.mjs` (in the scratchpad: records `layout-shift` entries with
source rects on a throttled mobile load) 3x on `id-ID` and `en-US`, plus 3 Lighthouse runs. Target: CLS < 0.05 in every
run.

## 6. Upload compression spec

Today (`src/lib/imageUtils.ts` `compressImage`: `new Image()` + FileReader data URL + canvas + `toDataURL('image/jpeg', q)`):

| Call site | Now | Target (requirement) |
|---|---|---|
| `UploadPhotoModal.tsx` L97 (gallery photo) | 1200x1200 box, JPEG 0.85 | long side **≤ 1600 px**, WebP 0.75 (JPEG 0.75 fallback) |
| `RegistrationForm.tsx` L290 (avatar at registration) | 800x800, JPEG 0.82 | **≤ 256 px**, WebP/JPEG 0.75 |
| `UserProfile.tsx` L246 (avatar in profile) | 600x600, JPEG 0.80 | **≤ 256 px**, WebP/JPEG 0.75 |

Storage context: photos and avatars are stored **inline as data URLs in Firestore** (rules: `members.avatarUrl` ≤ 1,000,000
chars L194, public `memberCards.avatarUrl` ≤ 400,000 L285, `photos.photoUrl` ≤ 1,000,000 via `PHOTO_FIELD_LIMITS`).
Every byte is re-downloaded by every reader: card lookups download the avatar, and the gallery downloads every photo.

Spec for `compressImage(file, { maxSide, quality = 0.75, type = 'image/webp', maxChars })`:
1. Decode with `createImageBitmap(file, { imageOrientation: 'from-image' })` where available. It is off the main thread on
   Chromium, and EXIF orientation is applied. Fall back to the current `<img>` path (Safari < 17). Skip the FileReader data
   URL step: a `File` goes straight to `createImageBitmap` / `URL.createObjectURL`, which avoids a ~33 % larger base64 copy
   of a 12 MP photo in memory.
2. Scale so that `max(w, h) <= maxSide`. Never upscale. For a ratio > 2x, downscale in halving steps (or set
   `ctx.imageSmoothingQuality = 'high'`) to avoid aliasing on avatars.
3. Encode with `canvas.toBlob(type, quality)`. **Check the result type.** Browsers that cannot encode WebP (older Safari)
   silently return PNG, which would be far larger. If `blob.type !== 'image/webp'`, re-encode as `image/jpeg` at the same
   quality. Then convert to a data URL (`FileReader.readAsDataURL(blob)`) only at the end, because storage is still inline.
4. Size guard: if the data URL length > `maxChars` (photos 900,000 to stay under the 1,000,000 rule with margin; avatars
   120,000), retry with quality - 0.1 (min 0.5), then with maxSide x 0.8. Never send a doc that the rules would reject.
5. Release `ImageBitmap.close()` and the canvas (`width = height = 0`) right away. Low-memory phones crash on repeated
   12 MP decodes.

Expected sizes (typical phone photo): avatar 256 px WebP 0.75 ≈ **8-15 KB** (now ~60-120 KB at 800 px, so -85-90 % for
every public card lookup). Gallery photo 1600 px WebP 0.75 ≈ 180-350 KB. Today's 1200 px JPEG 0.85 is ≈ 200-350 KB, so
WebP 0.75 roughly cancels the extra pixels.

**Trade-off to decide (owner):** with inline storage, raising photos from 1200 to 1600 px does not save bytes. It only
keeps them roughly flat thanks to WebP. That is fine once F1 is in (12 photos per page). For the grid itself, add a
**thumbnail**. The Firestore client SDK always downloads whole documents, so a thumbnail only helps if the full-size data
lives in a *different* document:
- `photos/{id}.photoUrl` = 480 px WebP 0.7 thumbnail (~20-40 KB) for new uploads, plus a new optional `hasFull: true`. Old
  code keeps working, because it simply shows the thumbnail.
- New collection `photoFiles/{id}` `{ data: <1600 px data URL>, authorUid }`: public `get`, **no `list`**. Create only
  by the author, together with the matching `photos/{id}` (`getAfter`). Delete by the author or an admin (the admin Gallery
  delete from item 2 must delete both docs).
- The grid shows `photoUrl`. The lightbox fetches `photoFiles/{id}` with one `getDoc` when `hasFull`. Grid pages become
  ~12 x 30 KB instead of 12 x 300 KB.
- Deploy order: (1) the owner publishes the additive rules (new collection + optional `hasFull` key; the live code never
  sends either, so it stays compatible); (2) deploy the code. An optional admin backfill moves existing full images to
  `photoFiles` and replaces `photoUrl` with a thumbnail (≤ 15 ops per batch, preview first).
- Moving originals to Firebase Storage would be the long-term fix, but it is out of scope for sprint 3. If the owner wants to
  keep sprint 3 smaller, ship F1 paging + compression now and the thumbnail split as a follow-up.

## 7. Verification plan and budgets

**Budgets (landing page, first visit, Lighthouse mobile simulated, median of 3 runs per target):**

| Metric | Now (median, range) | Budget after F1-F5 + F11 |
|---|---|---|
| Performance score | 62 (55-74) | ≥ 85 |
| FCP | 5.2 s (2.8-6.3) | ≤ 2.3 s |
| LCP | 7.8 s (3.1-8.5) | ≤ 3.0 s |
| CLS | 0 / 0.285 (3 of 10 runs) | < 0.05 in every run |
| TBT | 0 (0-596) | ≤ 150 ms |
| Transfer on landing | 951 KB, 29 requests, 7 origins | ≤ 420 KB, ≤ 20 requests, ≤ 3 origins |
| Firestore bytes on landing | 320 KB | ≤ 5 KB (theme doc only) |
| Startup JS (gz) | ~360 KB | ≤ 380 KB with `id` bundled (F13 would be needed to go well below) |

**Checks per fix (no Lighthouse needed for most):**
- F1: DevTools Network on `/`: no `Listen/channel` response > 5 KB before the gallery opens. Opening the gallery shows
  12 cards, and "Load more" fetches the next 12 (a `limit 12` query). Like/unlike updates the count. A new upload appears at the top.
- F2: Network on `/`: no `__/auth/iframe`, `iframe.js`, `apis.google.com`, `getProjectConfig`. Opening AuthModal loads
  them (warm-up). Google/Apple/Microsoft popups open on Android Chrome **and iOS Safari** without "popup blocked". Reload
  restores the session. Sheets re-auth works.
- F3/F4/F5: Performance panel (or filmstrip) with slow 4G + 4x CPU: the first frame shows Indonesian text, logo box reserved,
  correct background. `cls-probe.mjs` reports no shift > 0.01.
- F6/F7/F8: on a real low-end Android (or Chrome DevTools: 6x CPU slowdown + "Rendering → Frame rendering stats"):
  scroll the registration form top to bottom and open/close the mobile menu and a sheet. Target ≥ 50 fps, with no frame >
  50 ms during scroll. React Profiler: scrolling causes **no `App` commit**. Lite: `html[data-perf="lite"]`, and
  `getComputedStyle(header::before).backdropFilter === 'none'`.
- F9: tab switch (form → card → gallery) completes in ≤ 0.35 s (Performance panel). Reduced-motion and lite give fades only.
- F10: style/layout time at load (Performance panel, Summary) drops by about a third. "Submit with an empty required field"
  still scrolls to and focuses the field.
- F12: upload a 12 MP photo and a large avatar on a phone. Check the stored lengths (photo ≤ 900,000 chars, avatar ≤ 120,000),
  that the encoded type is WebP on Chrome/Android and JPEG where WebP encoding is unsupported, and that orientation is correct.

**Measurement hygiene:** the saved runs fall into two groups (early paint + 0.285 CLS vs blank-until-2.4 s), with
identical flags. Always run ≥ 3 runs per target and compare medians. Also check a real phone through remote debugging
(`chrome://inspect`) on mobile data, which is where the owner felt the lag. After deploy, use PageSpeed Insights for
field data (CrUX) once there is enough traffic.

**Rules / deploy order:** F1-F11 need **no Firestore rules change** (paged `photos` reads use `limit 12 <= 100`). Only the
optional F12 thumbnail split needs an additive rules publish **before** the code deploy (section 6).

## 8. Top fixes summary

1. **F1 Photos only when the gallery is open, paged 12 + load more** (`App.tsx` L416-429, `galleryService.ts`,
   `PhotoGallery.tsx`). -320 KB transfer / -439 KB raw on every landing load (34 % of all bytes, ~1.7 s on slow 4G).
   It also stops the per-visit download that grows with the gallery (base64 photos inline in Firestore, up to 100 docs)
   and the App-wide re-render on every like. No rules change.
2. **F2 Auth popup resolver off the startup path** (`firebase.ts` `initializeAuth` without resolver, the resolver passed at
   5 popup call sites, warmed with `getRedirectResult(auth, browserPopupRedirectResolver)` when AuthModal opens).
   -134 KB, -3 origins, -1 preflighted XHR. Must be tested on iOS Safari for popup blocking.
3. **F3 First frame = final frame** (`AnimatePresence initial={false}` at `App.tsx` L716; `id` locale bundled, others
   loaded before `render()`). LCP render delay -0.3 to -0.6 s, no en-to-id re-flow. It is the main fix for the CLS 0.285.
4. **F4 Logo as local 96/160 px WebP with width/height + preload** (`KawanCosplayLogo.tsx`, `Navbar.tsx`,
   `index.html`). -98 KB, -1 third-party origin (~0.57 s), header shift gone.
5. **F6 + F7 Blur only on fixed surfaces on phones + Lite mode** (`index.css`, new `perfMode.ts`, `motion.ts`
   `useReducedMotionConfig`, toggle in the Navbar mobile menu / desktop language popover / footer, persisted in
   `localStorage['kcc_perf_mode']`). This is the main cure for scroll jank on weak GPUs. Lighthouse cannot see it, so verify
   on a real phone.
6. **F8 Scroll without App re-render + memoized RegistrationForm**, and **F9 short tween page transitions**. Smooth
   scrolling and ~0.3 s tab switches.
7. **F5 cached theme, F10 content-visibility, F11 startup trims, F12 upload compression (avatars ≤ 256 px ≈ 10 KB,
   photos ≤ 1600 px WebP 0.75 with JPEG fallback)**.

Expected result after 1-4 + F5 + F11: ~390 KB before first paint (was 951 KB), simulated mobile FCP ≈ 1.8-2.3 s, LCP ≈
2.3-3.0 s, CLS < 0.05, score ≈ 85-92 (was 55-74).
