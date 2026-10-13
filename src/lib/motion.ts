/**
 * Motion foundation: spring presets, easing tokens, shared variants, scroll lock and sheet drag.
 *
 * Import path: every motion component/hook in this app comes from 'framer-motion' (the copy the
 * components already use). Never import from 'motion/react': that would bundle a second, older copy.
 *
 * Reduced motion: every helper here switches to quick opacity-only fades (no movement, no springs)
 * when the user prefers reduced motion OR lite mode is on (src/lib/perfMode.ts). Both reach the
 * helpers through framer's <MotionConfig reducedMotion>: App wraps both roots in
 * <MotionConfig {...getMotionConfig(lite)}> ('always' in lite, else 'user' = the OS setting), and
 * `useReducedMotion()` below reads that config, so every component follows without its own check.
 *
 * Transforms and `position: fixed`: a non-`none` transform traps fixed children (AGENTS.md section 6).
 * All variants here end on x/y = 0 and scale = 1, where framer-motion writes `transform: none`, so a
 * page/tab wrapper is transform-free at rest. Remove the CSS keyframe classes (`animate-sheet-up`,
 * `animate-scale-in`, `animate-fade-in`) from an element when it switches to these variants.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useDragControls, useReducedMotionConfig } from 'framer-motion';
import type { PanInfo, Variants } from 'framer-motion';

/**
 * True when motion should be reduced: the OS "reduce motion" setting, or lite mode (App passes
 * `reducedMotion="always"` to <MotionConfig> then). Same name and call style as framer's hook, so
 * `useReducedMotion() === true` keeps working everywhere.
 */
export function useReducedMotion(): boolean {
  return useReducedMotionConfig() ?? false;
}

// ---------------------------------------------------------------------------
// Easing + duration tokens (mirror the CSS custom properties in src/index.css)
// ---------------------------------------------------------------------------

/** Cubic-bezier control points, in the form framer-motion's `ease` accepts. */
export type CubicBezier = [number, number, number, number];

export interface SpringPreset {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass: number;
}

export interface TweenPreset {
  type?: 'tween';
  duration: number;
  ease?: CubicBezier | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export type MotionTransition = SpringPreset | TweenPreset;

export const EASE: Record<'ios' | 'outSoft' | 'spring' | 'press', CubicBezier> = {
  ios: [0.32, 0.72, 0, 1], // --ease-ios
  outSoft: [0.22, 1, 0.36, 1], // --ease-out-soft
  spring: [0.34, 1.36, 0.64, 1], // --ease-spring (cubic fallback; SPRING.press is the real spring)
  press: [0.2, 0, 0, 1], // .pressable:active press-in curve
};

/** Seconds (framer-motion units). The CSS tokens are in ms: --dur-press 90ms, --dur-release 420ms, ... */
export const DURATION = {
  press: 0.09, // --dur-press
  release: 0.42, // --dur-release
  fast: 0.16, // --dur-fast
  base: 0.24, // --dur-base
  fadeIn: 0.2, // --animate-fade-in
  fadeOut: 0.16, // --animate-fade-out
  dialog: 0.28, // --animate-scale-in
  slide: 0.32, // --animate-slide-up
  reduced: 0.12, // reduced-motion cross-fades
} as const;

/**
 * Springs. Damping ratio = damping / (2 * sqrt(stiffness * mass)).
 * - sheet: ~0.97, no visible overshoot (iOS sheet presentation / drag snap-back).
 * - press: ~0.78, the ~1.7% overshoot of --ease-spring (button release).
 * - thumb: ~0.85, segmented-control / tab-bar indicator (`layoutId`).
 * - page: ~0.98, page and tab content enter.
 */
export const SPRING: Record<'sheet' | 'press' | 'thumb' | 'page', SpringPreset> = {
  sheet: { type: 'spring', stiffness: 380, damping: 38, mass: 1 },
  press: { type: 'spring', stiffness: 500, damping: 35, mass: 1 },
  thumb: { type: 'spring', stiffness: 450, damping: 36, mass: 1 },
  page: { type: 'spring', stiffness: 340, damping: 36, mass: 1 },
};

export const TWEEN: Record<
  'fadeIn' | 'fadeOut' | 'reducedIn' | 'reducedOut' | 'dialog' | 'sheetExit' | 'press' | 'instant' | 'pageIn' | 'pageOut',
  TweenPreset
> = {
  fadeIn: { duration: DURATION.fadeIn, ease: 'easeOut' },
  fadeOut: { duration: DURATION.fadeOut, ease: 'easeIn' },
  // Page / tab content: a short tween instead of a spring that needs ~0.5 s to settle. With
  // AnimatePresence mode="wait" a screen change is then <= ~0.32 s (exit 0.11 + enter 0.2).
  pageIn: { duration: 0.2, ease: EASE.outSoft },
  pageOut: { duration: 0.11, ease: 'easeIn' },
  reducedIn: { duration: DURATION.reduced, ease: 'easeOut' },
  reducedOut: { duration: DURATION.reduced, ease: 'easeIn' },
  dialog: { duration: DURATION.dialog, ease: EASE.ios },
  sheetExit: { duration: DURATION.dialog, ease: EASE.ios },
  press: { duration: DURATION.press, ease: EASE.press },
  instant: { duration: 0 },
};

/** Spread into <MotionConfig> at the app root: framer-motion then honours the OS reduced-motion setting. */
export const MOTION_CONFIG = { reducedMotion: 'user' } as const;

const LITE_MOTION_CONFIG = { reducedMotion: 'always' } as const;

/** <MotionConfig {...getMotionConfig(lite)}>: lite mode forces the reduced (fade-only) path everywhere. */
export function getMotionConfig(lite: boolean): { reducedMotion: 'always' | 'user' } {
  return lite ? LITE_MOTION_CONFIG : MOTION_CONFIG;
}

/** Media query where `.glass-sheet` turns from a bottom sheet into a centered dialog (index.css). */
export const SHEET_DIALOG_QUERY = '(min-width: 640px)';

/** Shared-layout ids for sliding indicators (`.glass-segment-thumb`). One id per control on screen. */
export const LAYOUT_IDS = {
  navTabs: 'kcc-nav-tabs-thumb',
  tabBar: 'kcc-tabbar-thumb',
  adminTabs: 'kcc-admin-tabs-thumb',
  authMode: 'kcc-auth-mode-thumb',
  siteEditorTabs: 'kcc-site-editor-tabs-thumb',
} as const;

// ---------------------------------------------------------------------------
// Variants (labels: "initial" / "animate" / "exit"; exit needs <AnimatePresence>)
// ---------------------------------------------------------------------------

/** Reduced-motion fallback for every kind: a quick cross-fade, no movement. */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: TWEEN.reducedIn },
  exit: { opacity: 0, transition: TWEEN.reducedOut },
};

/** Screen / route change: fade + small upward slide. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: TWEEN.pageIn },
  exit: { opacity: 0, transition: TWEEN.pageOut },
};

const TAB_SHIFT = 16;

/**
 * Content under a tab bar / segmented control. Pass the direction of travel as `custom` on the motion
 * element AND on <AnimatePresence custom={direction}>: 1 = moved to a later tab, -1 = earlier tab,
 * 0 / omitted = fade + small vertical slide.
 */
export const tabVariants: Variants = {
  initial: (direction: number = 0) =>
    direction === 0 ? { opacity: 0, y: 6 } : { opacity: 0, x: Math.sign(direction) * TAB_SHIFT },
  animate: { opacity: 1, x: 0, y: 0, transition: TWEEN.pageIn },
  exit: (direction: number = 0) =>
    direction === 0
      ? { opacity: 0, transition: TWEEN.pageOut }
      : { opacity: 0, x: Math.sign(direction) * -TAB_SHIFT, transition: TWEEN.pageOut },
};

/** `.glass-sheet` below 640px: slides up from the bottom edge. */
export const sheetVariants: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: SPRING.sheet },
  exit: { y: '100%', transition: TWEEN.sheetExit },
};

/** `.glass-sheet` from 640px and `.glass-elevated` dialogs: scale + fade. */
export const dialogVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: TWEEN.dialog },
  exit: { opacity: 0, scale: 0.98, transition: TWEEN.fadeOut },
};

/** `.glass-overlay` backdrop. */
export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: TWEEN.fadeIn },
  exit: { opacity: 0, transition: TWEEN.fadeOut },
};

export type PresenceKind = 'page' | 'tab' | 'sheet' | 'dialog' | 'overlay';

export interface PresenceMotionProps {
  variants: Variants;
  initial: 'initial';
  animate: 'animate';
  exit: 'exit';
}

const presence = (variants: Variants): PresenceMotionProps => ({
  variants,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
});

const PRESENCE: Record<PresenceKind | 'fade', PresenceMotionProps> = {
  page: presence(pageVariants),
  tab: presence(tabVariants),
  sheet: presence(sheetVariants),
  dialog: presence(dialogVariants),
  overlay: presence(overlayVariants),
  fade: presence(fadeVariants),
};

/** Non-hook form of `usePresenceMotion` (stable objects, safe to spread on every render). */
export function getPresenceMotion(
  kind: PresenceKind,
  { reduced, desktop }: { reduced: boolean; desktop: boolean },
): PresenceMotionProps {
  if (reduced) return PRESENCE.fade;
  if (kind === 'sheet') return desktop ? PRESENCE.dialog : PRESENCE.sheet;
  return PRESENCE[kind];
}

/**
 * Props to spread on a motion element: `<motion.div {...usePresenceMotion('sheet')} />`.
 * 'sheet' picks the slide-up sheet below 640px and the scale-fade dialog from 640px.
 */
export function usePresenceMotion(kind: PresenceKind): PresenceMotionProps {
  const reduced = useReducedMotion() === true;
  const desktop = useMediaQuery(SHEET_DIALOG_QUERY);
  return getPresenceMotion(kind, { reduced, desktop });
}

// ---------------------------------------------------------------------------
// Press feedback (motion counterpart of `.pressable` / `.pressable-soft`)
// ---------------------------------------------------------------------------

export interface PressMotion {
  /** Press-in target (90 ms, like `.pressable:active`). */
  whileTap: { scale?: number; opacity?: number; transition: TweenPreset };
  /** Release back to rest. Spread it only when the element has no `transition` of its own. */
  transition: MotionTransition;
}

const PRESS: PressMotion = { whileTap: { scale: 0.97, transition: TWEEN.press }, transition: SPRING.press };
const PRESS_SOFT: PressMotion = { whileTap: { scale: 0.985, transition: TWEEN.press }, transition: SPRING.press };
const PRESS_REDUCED: PressMotion = { whileTap: { opacity: 0.8, transition: TWEEN.press }, transition: TWEEN.reducedIn };

/** `soft` = the subtler `.pressable-soft` scale for large cards. */
export function getPressMotion(reduced: boolean, soft = false): PressMotion {
  if (reduced) return PRESS_REDUCED;
  return soft ? PRESS_SOFT : PRESS;
}

/** `<motion.button {...usePressMotion()} />` */
export function usePressMotion(soft = false): PressMotion {
  return getPressMotion(useReducedMotion() === true, soft);
}

/** Transition for a `layoutId` indicator: spring, or an instant jump with reduced motion. */
export function getThumbTransition(reduced: boolean): MotionTransition {
  return reduced ? TWEEN.instant : SPRING.thumb;
}

/** `<motion.span layoutId={LAYOUT_IDS.navTabs} className="glass-segment-thumb" transition={useThumbTransition()} />` */
export function useThumbTransition(): MotionTransition {
  return getThumbTransition(useReducedMotion() === true);
}

// ---------------------------------------------------------------------------
// Media query
// ---------------------------------------------------------------------------

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const mediaQueryCache = new Map<string, MediaQueryList>();

function getMediaQueryList(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  let mql = mediaQueryCache.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    mediaQueryCache.set(query, mql);
  }
  return mql;
}

/** Live `matchMedia(query).matches` (false during SSR / without matchMedia). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = getMediaQueryList(query);
      if (!mql) return () => {};
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
      }
      // Safari < 14
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => getMediaQueryList(query)?.matches ?? false, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

// ---------------------------------------------------------------------------
// Scroll lock
// ---------------------------------------------------------------------------

/** Class on <html> that index.css uses to freeze the page (`html.scroll-locked`). */
export const SCROLL_LOCK_CLASS = 'scroll-locked';

/**
 * Touches starting inside these may always move (text selection / caret dragging, sliders). Add
 * `data-scroll-lock-allow` to any other element that needs raw touchmove while a sheet is open.
 */
const TOUCH_ALLOW_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-scroll-lock-allow]';

let ownLocks = 0;
let savedScroll: { x: number; y: number } | null = null;
let lastTouchX = 0;
let lastTouchY = 0;

// The count lives on <html data-scroll-locks>, shared with the older `useSheetScrollLock` in
// UploadPhotoModal.tsx, so mixed nested sheets unlock only when the last one closes.
function readLockCount(root: HTMLElement): number {
  const count = Number(root.dataset.scrollLocks);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

/** True when an ancestor of `start` (below <body>) can still scroll in the direction of the finger. */
function canScrollWithin(start: Element | null, dx: number, dy: number): boolean {
  const vertical = Math.abs(dy) >= Math.abs(dx);
  const delta = vertical ? dy : dx;
  for (let el = start; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    const style = window.getComputedStyle(el);
    const overflow = vertical ? style.overflowY : style.overflowX;
    if (overflow !== 'auto' && overflow !== 'scroll') continue;
    const size = vertical ? el.clientHeight : el.clientWidth;
    const scrollSize = vertical ? el.scrollHeight : el.scrollWidth;
    if (scrollSize <= size + 1) continue;
    // `overscroll-behavior: contain` (e.g. .glass-scroll): the browser keeps the scroll and its bounce
    // inside this element, nothing chains to the page.
    const overscroll = vertical ? style.overscrollBehaviorY : style.overscrollBehaviorX;
    if (overscroll === 'contain' || overscroll === 'none') return true;
    if (delta === 0) return true;
    // Distance from the scroll start (RTL scrollLeft is negative).
    const position = vertical ? el.scrollTop : Math.abs(el.scrollLeft);
    // Finger moving down / right reveals content towards the start (towards the end in RTL horizontally).
    const towardStart = !vertical && style.direction === 'rtl' ? delta < 0 : delta > 0;
    if (towardStart ? position > 0 : position + size < scrollSize - 1) return true;
  }
  return false;
}

function onGuardTouchStart(event: TouchEvent): void {
  if (event.touches.length !== 1) return;
  lastTouchX = event.touches[0].clientX;
  lastTouchY = event.touches[0].clientY;
}

// iOS Safari before 16 ignores `overflow: hidden` on the root for touch scrolling, and a drag on a
// non-scrolling part of a sheet (or a scroll area at its edge) chains to the page behind. Cancel those
// touchmoves; scroll areas that can still move keep working. Multi-touch (pinch zoom) is never blocked.
function onGuardTouchMove(event: TouchEvent): void {
  if (event.touches.length !== 1 || !event.cancelable) return;
  const touch = event.touches[0];
  const dx = touch.clientX - lastTouchX;
  const dy = touch.clientY - lastTouchY;
  lastTouchX = touch.clientX;
  lastTouchY = touch.clientY;
  const target = event.target instanceof Element ? event.target : null;
  if (target && target.closest(TOUCH_ALLOW_SELECTOR)) return;
  if (canScrollWithin(target, dx, dy)) return;
  event.preventDefault();
}

const TOUCH_MOVE_OPTIONS: AddEventListenerOptions = { passive: false };
const TOUCH_START_OPTIONS: AddEventListenerOptions = { passive: true };

/**
 * Imperative scroll lock: freezes the page and returns the release function (idempotent). Prefer the
 * `useScrollLock` hook in components.
 */
export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {};
  const root = document.documentElement;
  // While the page is already locked its scroll offset is frozen, so reading it now is still correct.
  if (savedScroll === null) savedScroll = { x: window.scrollX, y: window.scrollY };
  root.dataset.scrollLocks = String(readLockCount(root) + 1);
  root.classList.add(SCROLL_LOCK_CLASS);
  ownLocks += 1;
  if (ownLocks === 1) {
    document.addEventListener('touchstart', onGuardTouchStart, TOUCH_START_OPTIONS);
    document.addEventListener('touchmove', onGuardTouchMove, TOUCH_MOVE_OPTIONS);
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    ownLocks = Math.max(0, ownLocks - 1);
    if (ownLocks === 0) {
      document.removeEventListener('touchstart', onGuardTouchStart, TOUCH_START_OPTIONS);
      document.removeEventListener('touchmove', onGuardTouchMove, TOUCH_MOVE_OPTIONS);
    }
    const remaining = Math.max(0, readLockCount(root) - 1);
    if (remaining > 0) {
      root.dataset.scrollLocks = String(remaining);
      // Only a legacy lock is left; it ends the session without restoring, so forget the offset.
      if (ownLocks === 0) savedScroll = null;
      return;
    }
    delete root.dataset.scrollLocks;
    root.classList.remove(SCROLL_LOCK_CLASS);
    const restore = savedScroll;
    savedScroll = null;
    // iOS can move the layout viewport while locked (e.g. the keyboard opening for a field in the
    // sheet). Put the page back where it was; 'instant' bypasses `scroll-behavior: smooth` on <html>.
    if (restore && (Math.abs(window.scrollY - restore.y) > 1 || Math.abs(window.scrollX - restore.x) > 1)) {
      window.scrollTo({ left: restore.x, top: restore.y, behavior: 'instant' });
    }
  };
}

/**
 * Freezes the page behind an open sheet / modal while `active` is true (toggles `html.scroll-locked`,
 * keeps the scroll offset, blocks iOS touch scroll-through). Ref-counted: nested modals unlock only when
 * the last one closes.
 */
export function useScrollLock(active: boolean): void {
  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    return lockScroll();
  }, [active]);
}

// ---------------------------------------------------------------------------
// Sheet drag-to-dismiss
// ---------------------------------------------------------------------------

/** Dismiss when dragged further than this (px) ... */
export const SHEET_DISMISS_OFFSET = 120;
/** ... or flicked down faster than this (px/s). */
export const SHEET_DISMISS_VELOCITY = 600;

/** Pointer-downs on these never start a drag (their own click / text selection wins). */
const NO_SHEET_DRAG_SELECTOR =
  'button, a[href], input, select, textarea, label, [role="button"], [contenteditable=""], [contenteditable="true"], [data-no-sheet-drag]';

export interface SheetDragProps {
  drag: 'y' | false;
  dragListener: false;
  dragControls: ReturnType<typeof useDragControls>;
  dragConstraints: { top: number; bottom: number };
  dragElastic: { top: number; bottom: number };
  dragMomentum: false;
  dragTransition: { bounceStiffness: number; bounceDamping: number };
  onDragEnd: (event: unknown, info: PanInfo) => void;
}

export interface SheetHandleProps {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}

export interface SheetDrag {
  /** False from 640px (dialog layout), with reduced motion, or when `options.disabled`. */
  enabled: boolean;
  /** Spread on the `motion.div.glass-sheet`. */
  sheetProps: SheetDragProps;
  /** Spread on the `.sheet-handle` header (the part holding `.sheet-grabber`). */
  handleProps: SheetHandleProps;
}

/**
 * Drag-to-dismiss for a bottom sheet. Only the handle starts the drag (`dragListener: false`), so the
 * `.glass-scroll` body keeps native scrolling. The sheet follows the finger downward 1:1, cannot move
 * up, and springs back unless pulled past SHEET_DISMISS_OFFSET or flicked past SHEET_DISMISS_VELOCITY.
 *
 *   const drag = useSheetDrag(onClose);
 *   <motion.div className="glass-sheet" {...usePresenceMotion('sheet')} {...drag.sheetProps}>
 *     <div className="sheet-handle" {...drag.handleProps}><div className="sheet-grabber" /> ...</div>
 *     <div className="glass-scroll">...</div>
 *   </motion.div>
 */
export function useSheetDrag(onDismiss: () => void, options: { disabled?: boolean } = {}): SheetDrag {
  const dragControls = useDragControls();
  const reduced = useReducedMotion() === true;
  const desktop = useMediaQuery(SHEET_DIALOG_QUERY);
  const enabled = !options.disabled && !reduced && !desktop;

  const onDismissRef = useRef(onDismiss);
  useIsomorphicLayoutEffect(() => {
    onDismissRef.current = onDismiss;
  });

  const onDragEnd = useCallback((_event: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const pulledFar = offset.y > SHEET_DISMISS_OFFSET && velocity.y > -SHEET_DISMISS_VELOCITY;
    const flickedDown = offset.y > 0 && velocity.y > SHEET_DISMISS_VELOCITY;
    if (pulledFar || flickedDown) onDismissRef.current();
    // Otherwise the constraints below spring the sheet back to y = 0.
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || !event.isPrimary || event.button !== 0) return;
      const target = event.target;
      if (target instanceof Element && target.closest(NO_SHEET_DRAG_SELECTOR)) return;
      dragControls.start(event);
    },
    [enabled, dragControls],
  );

  return useMemo<SheetDrag>(
    () => ({
      enabled,
      sheetProps: {
        drag: enabled ? 'y' : false,
        dragListener: false,
        dragControls,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 1 },
        dragMomentum: false,
        dragTransition: { bounceStiffness: SPRING.sheet.stiffness, bounceDamping: SPRING.sheet.damping },
        onDragEnd,
      },
      handleProps: { onPointerDown },
    }),
    [enabled, dragControls, onDragEnd, onPointerDown],
  );
}
