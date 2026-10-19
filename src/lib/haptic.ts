/**
 * Haptic feedback through the Vibration API (Android Chrome / Firefox). iOS Safari has no
 * `navigator.vibrate`, so every call there is a silent no-op. Calls are also skipped when the user
 * prefers reduced motion, and before the first user gesture (Chrome blocks those and logs a warning).
 */

export type HapticKind = 'selection' | 'light' | 'medium' | 'success' | 'error';

/** Vibration patterns in ms: [vibrate, pause, vibrate, ...]. */
export const HAPTIC_PATTERNS: Record<HapticKind, number | number[]> = {
  selection: 6, // segmented control / picker tick
  light: 10, // tab change, toggle (the previous default)
  medium: 20, // sheet dismissed, important tap
  success: [12, 60, 24], // two rising taps
  error: [24, 50, 24, 50, 32], // three firm taps
};

let reducedMotionQuery: MediaQueryList | null | undefined;

function prefersReducedMotion(): boolean {
  if (reducedMotionQuery === undefined) {
    reducedMotionQuery =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
  }
  return reducedMotionQuery ? reducedMotionQuery.matches : false;
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  if (prefersReducedMotion()) return;
  const nav: Navigator & { userActivation?: { hasBeenActive?: boolean } } = navigator;
  if (nav.userActivation && nav.userActivation.hasBeenActive === false) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Blocked by a permissions policy (e.g. inside an iframe): no feedback, no error.
  }
}

/** `haptic('success')` after a save, `haptic('error')` on a failed submit, `haptic()` for a light tap. */
export function haptic(kind: HapticKind = 'light'): void {
  vibrate(HAPTIC_PATTERNS[kind]);
}

/** Older call style: a named kind or a raw pattern in ms (`triggerHaptic(15)`). */
export const triggerHaptic = (pattern: HapticKind | number | number[] = 'light'): void => {
  vibrate(typeof pattern === 'string' ? HAPTIC_PATTERNS[pattern] : pattern);
};
