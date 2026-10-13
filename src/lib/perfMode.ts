/**
 * Lite / low-power mode ("Display mode": Auto · Lite · Full).
 *
 * Lite keeps the layout, colours and every feature, but swaps live backdrop blur for solid translucent
 * fills, hides the ambient light layer, shortens CSS transitions and makes framer-motion use the
 * reduced (fade-only) variants. `lowData` (Save-Data or a slow connection) is tracked separately: it only
 * switches off speculative downloads (idle chunk prefetch, bigger gallery pages), even in "Full".
 *
 * The startup decision is made by the inline script in index.html BEFORE the CSS loads (so the first
 * paint is already right: no glass-to-solid swap). It writes `window.__KCC_PERF__` and sets
 * `html[data-perf="lite"|"full"]` + `html[data-lowdata]`. This module reads that result and owns every
 * later change. Keep `detectSignals()` below and the inline script in sync.
 *
 * Storage: `localStorage['kcc_perf_mode']` = 'auto' | 'lite' | 'full' (per device, never sent anywhere).
 * Every storage access is wrapped in try/catch (private mode / blocked storage → 'auto').
 */
import { useSyncExternalStore } from 'react';

export type PerfPreference = 'auto' | 'lite' | 'full';

export interface PerfState {
  /** The stored choice. */
  preference: PerfPreference;
  /** Effective visuals: true = lite. */
  lite: boolean;
  /** Save-Data or a slow connection: no speculative downloads (independent of `lite`). */
  lowData: boolean;
  /** What "Auto" decides on this device (shown as a hint under the Auto option). */
  autoLite: boolean;
  /** Signals that triggered autoLite / lowData (debugging aid, e.g. 'deviceMemory'). */
  reasons: readonly string[];
}

export const PERF_STORAGE_KEY = 'kcc_perf_mode';
export const PERF_NOTICE_STORAGE_KEY = 'kcc_perf_notice_seen';

interface StartupResult {
  pref?: string;
  autoLite?: boolean;
  lowData?: boolean;
  reasons?: string[];
}

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: 'change', listener: () => void) => void;
}

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: NetworkInformationLike;
};

declare global {
  interface Window {
    __KCC_PERF__?: StartupResult;
  }
}

function isPreference(value: unknown): value is PerfPreference {
  return value === 'auto' || value === 'lite' || value === 'full';
}

function readStoredPreference(): PerfPreference {
  try {
    const stored = window.localStorage.getItem(PERF_STORAGE_KEY);
    return isPreference(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

function storePreference(pref: PerfPreference): void {
  try {
    if (pref === 'auto') window.localStorage.removeItem(PERF_STORAGE_KEY);
    else window.localStorage.setItem(PERF_STORAGE_KEY, pref);
  } catch {
    // Storage unavailable: the choice lasts for this visit only.
  }
}

function matches(query: string): boolean {
  try {
    return typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

function isAppleTouchDevice(nav: Navigator): boolean {
  const ua = nav.userAgent || '';
  return /iPhone|iPad|iPod/.test(ua) || (nav.platform === 'MacIntel' && (nav.maxTouchPoints || 0) > 1);
}

/** Network-only signal (re-evaluated on connection changes). */
function detectLowData(nav: NavigatorWithHints, reasons: string[]): boolean {
  const connection = nav.connection;
  if (!connection) return false;
  let low = false;
  if (connection.saveData === true) {
    reasons.push('saveData');
    low = true;
  }
  const type = connection.effectiveType;
  if (type === 'slow-2g' || type === '2g' || type === '3g') {
    reasons.push(`effectiveType:${type}`);
    low = true;
  }
  return low;
}

/** Same rules as the inline script in index.html (keep both in sync). */
function detectSignals(): { autoLite: boolean; lowData: boolean; reasons: string[] } {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { autoLite: false, lowData: false, reasons: [] };
  }
  const nav = navigator as NavigatorWithHints;
  const reasons: string[] = [];
  let autoLite = false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0 && nav.deviceMemory <= 4) {
    reasons.push('deviceMemory');
    autoLite = true;
  }
  if (
    typeof nav.hardwareConcurrency === 'number' &&
    nav.hardwareConcurrency > 0 &&
    nav.hardwareConcurrency <= 4 &&
    !isAppleTouchDevice(nav)
  ) {
    reasons.push('hardwareConcurrency');
    autoLite = true;
  }
  const connection = nav.connection;
  if (connection?.saveData === true) autoLite = true;
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') autoLite = true;
  if (matches('(prefers-reduced-transparency: reduce)')) {
    reasons.push('reducedTransparency');
    autoLite = true;
  }
  const lowData = detectLowData(nav, reasons);
  return { autoLite, lowData, reasons };
}

function initialState(): PerfState {
  const startup = typeof window !== 'undefined' ? window.__KCC_PERF__ : undefined;
  const detected =
    startup && typeof startup.autoLite === 'boolean'
      ? { autoLite: startup.autoLite, lowData: !!startup.lowData, reasons: startup.reasons ?? [] }
      : detectSignals();
  const preference = typeof window !== 'undefined' ? readStoredPreference() : 'auto';
  return compose(preference, detected.autoLite, detected.lowData, detected.reasons);
}

function compose(preference: PerfPreference, autoLite: boolean, lowData: boolean, reasons: readonly string[]): PerfState {
  const lite = preference === 'lite' ? true : preference === 'full' ? false : autoLite;
  return { preference, lite, lowData, autoLite, reasons };
}

let state: PerfState = initialState();
const listeners = new Set<() => void>();

function applyToDocument(next: PerfState): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.perf = next.lite ? 'lite' : 'full';
  if (next.lowData) root.dataset.lowdata = '1';
  else delete root.dataset.lowdata;
}

function setState(next: PerfState): void {
  if (
    next.preference === state.preference &&
    next.lite === state.lite &&
    next.lowData === state.lowData &&
    next.autoLite === state.autoLite
  ) {
    return;
  }
  state = next;
  applyToDocument(state);
  listeners.forEach((listener) => listener());
}

// Make sure the attribute matches the module state (e.g. when the inline script did not run).
applyToDocument(state);

// lowData follows the connection during the session; visuals (autoLite) never flip mid-session.
if (typeof navigator !== 'undefined') {
  const connection = (navigator as NavigatorWithHints).connection;
  try {
    connection?.addEventListener?.('change', () => {
      const reasons = state.reasons.filter((r) => r !== 'saveData' && !r.startsWith('effectiveType:'));
      const lowData = detectLowData(navigator as NavigatorWithHints, reasons);
      setState(compose(state.preference, state.autoLite, lowData, reasons));
    });
  } catch {
    // NetworkInformation without events: keep the startup value.
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PerfState {
  return state;
}

/** Current state (non-React callers). */
export function getPerfState(): PerfState {
  return state;
}

/** True when lite visuals are active. */
export function isLiteMode(): boolean {
  return state.lite;
}

/** False in lite mode and on Save-Data / slow connections: skip prefetching and other speculative work. */
export function allowSpeculativeLoading(): boolean {
  return !state.lite && !state.lowData;
}

/** Live perf state for React components. */
export function usePerfMode(): PerfState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Stores the choice and applies it immediately (attribute + subscribers), without a reload. */
export function setPerfMode(preference: PerfPreference): void {
  if (!isPreference(preference)) return;
  storePreference(preference);
  setState(compose(preference, state.autoLite, state.lowData, state.reasons));
}

/** One-time toast: Auto turned Lite on and the visitor has not seen the notice yet. */
export function shouldShowLiteNotice(): boolean {
  if (state.preference !== 'auto' || !state.autoLite) return false;
  try {
    return window.localStorage.getItem(PERF_NOTICE_STORAGE_KEY) !== '1';
  } catch {
    // No storage: never nag on every visit.
    return false;
  }
}

export function markLiteNoticeSeen(): void {
  try {
    window.localStorage.setItem(PERF_NOTICE_STORAGE_KEY, '1');
  } catch {
    // ignore
  }
}
