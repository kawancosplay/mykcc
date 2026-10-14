import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { User } from 'firebase/auth';
// App shell + landing page (registration form) stay in the main bundle: they are the first paint.
import { StickyHeader } from './components/StickyHeader';
import { RegistrationForm } from './components/RegistrationForm';
import { PerfLiteNotice, PerfModeFooterButton } from './components/PerfModeControl';

// Heavy screens and modals load on demand. The loaders are kept separately so idle prefetch can warm them.
const loadMemberCardModal = () => import('./components/MemberCardModal');
const loadAuthModal = () => import('./components/AuthModal');
const loadPhotoGallery = () => import('./components/PhotoGallery');
const MemberCardModal = lazy(() => loadMemberCardModal().then(m => ({ default: m.MemberCardModal })));
const PhotoGallery = lazy(() => loadPhotoGallery().then(m => ({ default: m.PhotoGallery })));
const UploadPhotoModal = lazy(() => import('./components/UploadPhotoModal').then(m => ({ default: m.UploadPhotoModal })));
const AuthModal = lazy(() => loadAuthModal().then(m => ({ default: m.AuthModal })));
const UserProfile = lazy(() => import('./components/UserProfile').then(m => ({ default: m.UserProfile })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const SiteEditorModal = lazy(() => import('./components/SiteEditorModal').then(m => ({ default: m.SiteEditorModal })));

import type { Member, Photo, SyncLog, SubscriptionErrorKind } from './types';
import {
  initAuth,
  logout,
  googleSignIn,
  isPopupCancelledError,
  isPopupBlockedError,
  isUserMismatchError,
} from './lib/googleAuth';
import {
  subscribeToMembers,
  subscribeToSyncLogs,
  lookupMemberCard,
  mainAccountKccId,
  memberCardToMember,
} from './lib/firestoreService';
import type { KccLookupSource } from './lib/firestoreService';
import { ensureMemberForUser } from './lib/authService';
import {
  checkIsAdminUser,
  isMainAdminUser,
  classifyFirestoreError,
  describeFirestoreError,
  warmAuthPopup,
} from './lib/firebase';
import { MAIN_ACCOUNT_KCC_ID, formatKccId, isMainAccountKccId, parseKccIdInput } from './lib/idGenerator';
import { useI18n } from './i18n';
import { themeBackground, useSiteTheme } from './lib/themeContext';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { haptic } from './lib/haptic';
import { getMotionConfig, usePresenceMotion } from './lib/motion';
import { allowSpeculativeLoading, usePerfMode } from './lib/perfMode';
import { Palette, Lock, IdCard, Search, ShieldCheck, AlertCircle } from 'lucide-react';

type AppTab = 'form' | 'card' | 'gallery' | 'profile' | 'admin';

// The main account's display ID until mainAccountKccId() has answered: the legacy 16-digit main ID
// (0000…0000), i.e. what it is before the 8-digit switch. After the switch it resolves to '00000000'.
const LEGACY_MAIN_KCC_ID = MAIN_ACCOUNT_KCC_ID.padStart(16, '0');

// Stable empty list for the registration form (memoized form: a new [] each render would re-render it).
const NO_MEMBERS: Member[] = [];

// Mounts a lazy modal on its first open and then keeps it mounted, so its internal state (typed form
// fields, current mode) survives close/reopen exactly like before (the modals return null while closed).
function useOpenedOnce(open: boolean): boolean {
  const [opened, setOpened] = useState(open);
  if (open && !opened) setOpened(true);
  return opened || open;
}

// Cheap ambient light: radial gradients from index.css instead of huge `blur()` filters (hidden in lite mode).
const AmbientBackground: React.FC<{ blobs?: 2 | 3 }> = ({ blobs = 3 }) => (
  <div className="ambient-layer" aria-hidden="true">
    <div className="ambient-blob ambient-blob--1"></div>
    <div className="ambient-blob ambient-blob--2"></div>
    {blobs === 3 && <div className="ambient-blob ambient-blob--3"></div>}
  </div>
);

// Suspense fallback for a lazy screen: a glass card with shimmering placeholder rows.
const ScreenSkeleton: React.FC<{ label: string; wide?: boolean }> = ({ label, wide = false }) => (
  <div
    className={`${wide ? 'max-w-7xl' : 'max-w-3xl'} mx-auto py-10 px-4 sm:px-6 animate-fade-in`}
    role="status"
    aria-busy="true"
  >
    <span className="sr-only">{label}</span>
    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4" aria-hidden="true">
      <div className="glass-skeleton h-6 w-1/3"></div>
      <div className="glass-skeleton h-4 w-2/3"></div>
      <div className="glass-skeleton h-40 w-full rounded-2xl"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-skeleton h-24 rounded-2xl"></div>
        <div className="glass-skeleton h-24 rounded-2xl"></div>
      </div>
      <div className="glass-skeleton h-4 w-1/2"></div>
    </div>
  </div>
);

// Suspense fallback for a lazy modal. Shown only if the chunk takes longer than ~150 ms (modals are
// prefetched on idle), so a fast load never flashes a placeholder before the real sheet slides in.
const SheetSkeleton: React.FC<{ label: string }> = ({ label }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 150);
    return () => window.clearTimeout(id);
  }, []);
  if (!show) return null;
  return (
    <>
      <div className="glass-overlay animate-fade-in" aria-hidden="true"></div>
      <div className="sheet-viewport">
        <div className="glass-sheet sm:max-w-md animate-sheet-up sm:animate-scale-in" role="status" aria-busy="true">
          <span className="sr-only">{label}</span>
          <div className="sheet-grabber" aria-hidden="true"></div>
          <div className="space-y-4 px-6 pt-4 pb-8 sm:p-8" aria-hidden="true">
            <div className="glass-skeleton mx-auto h-12 w-12 rounded-2xl"></div>
            <div className="glass-skeleton mx-auto h-5 w-1/2"></div>
            <div className="glass-skeleton h-11 w-full"></div>
            <div className="glass-skeleton h-11 w-full"></div>
            <div className="glass-skeleton h-11 w-full rounded-2xl"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('form');
  // Language state lives in <I18nProvider> (persisted in localStorage 'kcc_lang'); currentLang is kept as an alias.
  const { lang: currentLang, setLang, t, dir } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  // Last photo uploaded in this session: the gallery (which loads its own pages) prepends it once.
  const [addedPhoto, setAddedPhoto] = useState<Photo | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  // Admin status is resolved from the real Firebase identity (verified main email or admins/{uid}).
  // It is stored per uid so a stale admin flag can never leak to another signed-in account.
  const [authReady, setAuthReady] = useState(false);
  const [verifiedAdminUid, setVerifiedAdminUid] = useState<string | null>(null);
  const [isAdminChecking, setIsAdminChecking] = useState(true);
  const isAdmin = !!user && verifiedAdminUid === user.uid;

  // Subscription / profile / Sheets connection status
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [membersError, setMembersError] = useState<SubscriptionErrorKind | null>(null);
  const [syncLogsError, setSyncLogsError] = useState<SubscriptionErrorKind | null>(null);
  const [memberLoadState, setMemberLoadState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [sheetsConnectError, setSheetsConnectError] = useState<string | null>(null);
  const authUidRef = useRef<string | null>(null);

  // Latest values for stable callbacks (the memoized header / registration form keep the same props).
  const userRef = useRef<User | null>(user);
  userRef.current = user;
  const activeTabRef = useRef<AppTab>(activeTab);
  activeTabRef.current = activeTab;

  // The verified main account's own KCC ID in the current format (display override): 16 zeros before
  // the 8-digit switch, '00000000' after it. Resolved once per main-account sign-in.
  const [mainKccId, setMainKccId] = useState<string>(LEGACY_MAIN_KCC_ID);
  const mainKccIdRef = useRef(mainKccId);
  mainKccIdRef.current = mainKccId;
  const withMainId = useCallback((member: Member): Member => ({ ...member, userId16: mainKccIdRef.current }), []);

  // Lite / low-power mode: framer-motion uses the reduced (fade-only) variants everywhere.
  const perf = usePerfMode();
  const motionConfig = getMotionConfig(perf.lite);

  // Every user-initiated screen change (navbar, mobile menu, footer links) goes through here: a light
  // tick only when the screen actually changes. Stable identity (memoized header).
  const handleTabChange = useCallback((tab: AppTab) => {
    if (tab !== activeTabRef.current) haptic('light');
    setActiveTab(tab);
  }, []);

  // Screen change: short fade + small rise (opacity-only with reduced motion / lite mode).
  const pageMotion = usePresenceMotion('page');

  const { theme, isEditorOpen, setIsEditorOpen } = useSiteTheme();

  // The theme background is painted by the fixed `body::before` layer (index.css reads --app-bg), so it
  // stays still while scrolling and never repaints the page. Layout effect: no flash of the default (the
  // inline script in index.html already applied the cached value before the CSS loaded).
  const appBackground = themeBackground(theme);
  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--app-bg', appBackground);
  }, [appBackground]);

  // Modals
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadPhotoModalOpen, setIsUploadPhotoModalOpen] = useState(false);
  const authModalMounted = useOpenedOnce(isAuthModalOpen);
  const uploadModalMounted = useOpenedOnce(isUploadPhotoModalOpen);
  const siteEditorMounted = useOpenedOnce(isEditorOpen);
  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);

  // Warm the chunks people usually open next once the landing page is idle, so the first tap on
  // "Sign in", a pass or the gallery opens instantly instead of waiting for the network. Skipped in lite
  // mode and on Save-Data / slow connections (no speculative downloads there).
  useEffect(() => {
    if (!allowSpeculativeLoading()) return;
    const warm = () => {
      if (!allowSpeculativeLoading()) return;
      loadAuthModal().catch(() => {});
      loadMemberCardModal().catch(() => {});
      loadPhotoGallery().catch(() => {});
    };
    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = window.setTimeout(warm, 2500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Member card lookup by KCC ID (8 digits, or an old 16-digit ID; public memberCards projection only)
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<Member | null>(null);
  const [lookupResolvedFrom, setLookupResolvedFrom] = useState<KccLookupSource | null>(null);
  const [lookupRequestedId, setLookupRequestedId] = useState<string>('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Listen for URL hash `#admin` for direct admin portal access
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setActiveTab('admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Main account: resolve its ID format once per sign-in (counter exists → 8 digits). Errors keep the default.
  useEffect(() => {
    if (!user || !isMainAdminUser(user)) return;
    let cancelled = false;
    mainAccountKccId()
      .then((id) => {
        if (!cancelled) setMainKccId(id);
      })
      .catch((err) => console.warn('Main account KCC ID check failed:', err));
    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.email, user?.emailVerified]);

  // Re-apply the override when the main ID format resolved after the profile was already shown.
  useEffect(() => {
    const u = userRef.current;
    if (!u || !isMainAdminUser(u)) return;
    setCurrentMember((prev) =>
      prev && isMainAccountKccId(prev.userId16) && prev.userId16 !== mainKccId ? { ...prev, userId16: mainKccId } : prev
    );
    setSelectedMemberForCard((prev) =>
      prev && prev.authUid === u.uid && isMainAccountKccId(prev.userId16) && prev.userId16 !== mainKccId
        ? { ...prev, userId16: mainKccId }
        : prev
    );
  }, [mainKccId]);

  // Load (or create, only when lookups definitively came back empty) the member profile of a signed-in user.
  // Results are ignored if the user signed out or switched accounts in the meantime.
  const loadMemberForUser = (u: User) => {
    setMemberLoadState('loading');
    ensureMemberForUser(u)
      .then((m) => {
        if (authUidRef.current !== u.uid) return;
        setCurrentMember(isMainAdminUser(u) ? withMainId(m) : m);
        setMemberLoadState('idle');
      })
      .catch((err) => {
        if (authUidRef.current !== u.uid) return;
        console.warn('Member profile load failed:', err);
        setMemberLoadState('error');
      });
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        if (authUidRef.current !== currentUser.uid) {
          // New or different account: never keep the previous account's profile or Sheets token
          authUidRef.current = currentUser.uid;
          setCurrentMember(null);
          setAccessToken(null);
        }
        setUser(currentUser);
        setAuthReady(true);
        // Only googleSignIn (read-only Sheets scope) fills this token. initAuth returns the
        // session-persisted, uid-scoped token, so Sheets stays connected after a page reload.
        if (token) setAccessToken(token);
        loadMemberForUser(currentUser);
      },
      () => {
        authUidRef.current = null;
        setUser(null);
        setCurrentMember(null);
        setAccessToken(null);
        setVerifiedAdminUid(null);
        setMemberLoadState('idle');
        setAuthReady(true);
        setMainKccId(LEGACY_MAIN_KCC_ID);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve admin status for the CURRENT Firebase identity (re-checked whenever the account changes)
  useEffect(() => {
    if (!user) {
      setVerifiedAdminUid(null);
      // Keep "checking" until Firebase has restored (or ruled out) a previous session
      setIsAdminChecking(!authReady);
      return;
    }

    let cancelled = false;
    const checkingUser = user;
    setIsAdminChecking(true);
    checkIsAdminUser(checkingUser)
      .then((ok) => {
        if (!cancelled) setVerifiedAdminUid(ok ? checkingUser.uid : null);
      })
      .catch((err) => {
        console.warn('Admin check failed:', err);
        if (!cancelled) setVerifiedAdminUid(null);
      })
      .finally(() => {
        if (!cancelled) setIsAdminChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.email, user?.emailVerified, authReady]);

  // Whenever user or members list loads, make sure currentMember is matched immediately
  useEffect(() => {
    if (user && !currentMember && members.length > 0) {
      const cleanEmail = user.email ? user.email.toLowerCase().trim() : '';
      const matched = members.find(
        (m) =>
          (m.authUid && m.authUid === user.uid) ||
          (cleanEmail && m.email && m.email.toLowerCase().trim() === cleanEmail)
      );
      if (matched) {
        // Copy instead of mutating the shared members list (the admin repair panel reads it)
        setCurrentMember(isMainAdminUser(user) ? withMainId(matched) : matched);
      }
    }
  }, [user, members, currentMember, withMainId]);

  // Members & sync logs hold private data: subscribe ONLY for a Firebase-authenticated admin,
  // and re-subscribe whenever the signed-in identity or its admin status changes.
  useEffect(() => {
    if (!user || !isAdmin) {
      setMembers([]);
      setSyncLogs([]);
      setMembersLoaded(false);
      setMembersError(null);
      setSyncLogsError(null);
      return;
    }

    const subscribedUser = user;

    const unsubMembers = subscribeToMembers(
      (updatedMembers) => {
        setMembers(updatedMembers);
        setMembersLoaded(true);
        setMembersError(null);
        setCurrentMember((prev) => {
          if (prev) {
            // Same document first, so a second doc linked to the same account never replaces the profile
            const fresh =
              updatedMembers.find((m) => m.id === prev.id) ||
              updatedMembers.find(
                (m) =>
                  (prev.authUid && m.authUid === prev.authUid) ||
                  (prev.email && m.email && m.email.toLowerCase() === prev.email.toLowerCase())
              );
            if (!fresh) return prev;
            if (
              isMainAdminUser(subscribedUser) &&
              (fresh.authUid === subscribedUser.uid || isMainAccountKccId(prev.userId16))
            ) {
              return withMainId(fresh);
            }
            return fresh;
          }
          return null;
        });
      },
      (err) => {
        console.warn('Members subscribe note:', err);
        const kind = classifyFirestoreError(err);
        setMembersError(kind);
        setMembersLoaded(false);
        if (kind === 'permission-denied') {
          // Admin access removed meanwhile (admins/{uid} deleted by another admin): leave admin mode, which
          // also drops the member data held in this page, instead of showing the "rules" error screen
          checkIsAdminUser(subscribedUser)
            .then((ok) => {
              if (!ok && authUidRef.current === subscribedUser.uid) setVerifiedAdminUid(null);
            })
            .catch(() => undefined);
        }
      }
    );

    const unsubLogs = subscribeToSyncLogs(
      (updatedLogs) => {
        setSyncLogs(updatedLogs);
        setSyncLogsError(null);
      },
      (err) => {
        console.warn('Logs subscribe note:', err);
        setSyncLogsError(classifyFirestoreError(err));
      }
    );

    return () => {
      unsubMembers();
      unsubLogs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.email, isAdmin]);

  // Photos are NOT loaded here any more: the gallery fetches its own pages when it is opened (perf F1).

  // Fallback author profile for photo uploads while the member profile is not loaded yet.
  // Never fakes a reserved/admin KCC ID: only the verified main account gets its main ID.
  const uploadFallbackMember = useMemo<Member | null>(() => {
    if (!user) return null;
    return {
      id: user.uid,
      userId16: isMainAdminUser(user) ? mainKccId : '',
      name: user.displayName || user.email?.split('@')[0] || 'Cosplayer',
      cosplayName: user.displayName || user.email?.split('@')[0] || 'Cosplayer',
      fullName: user.displayName || 'Member',
      email: user.email || '',
      avatarUrl: user.photoURL || undefined,
      city: 'Worldwide',
      country: 'Indonesia',
      primaryRole: 'Cosplayer',
      fandom: 'Anime & Games',
      source: 'web_form',
      status: 'verified',
      createdAt: new Date().toISOString(),
    };
  }, [user, mainKccId]);
  const uploadMember = currentMember || uploadFallbackMember;

  const handleLogout = useCallback(async () => {
    await logout();
    authUidRef.current = null;
    setUser(null);
    setCurrentMember(null);
    setAccessToken(null);
    setVerifiedAdminUid(null);
    setSheetsConnectError(null);
    setMemberLoadState('idle');
    setMainKccId(LEGACY_MAIN_KCC_ID);
    setActiveTab((tab) => (tab === 'profile' ? 'form' : tab));
  }, []);

  // The Google token from AuthModal has basic scopes only, so it is NOT used for Sheets.
  const handleAuthSuccess = (authUser: User, memberProfile: Member | null, _token?: string) => {
    setUser(authUser);
    if (memberProfile) {
      setCurrentMember(isMainAdminUser(authUser) ? withMainId(memberProfile) : memberProfile);
    }
  };

  // Admin "Connect Google Sheets": on-demand read-only Sheets scope for the signed-in admin account.
  // This is the ONLY Sheets authorization flow; GoogleSheetsSync calls it through onLogin.
  const handleConnectSheets = async () => {
    setSheetsConnectError(null);
    try {
      const r = await googleSignIn();
      if (r) {
        setUser(r.user);
        setAccessToken(r.accessToken);
      }
    } catch (err) {
      if (isPopupCancelledError(err)) {
        setSheetsConnectError(t('common.sheetsPopupClosed'));
        return;
      }
      if (isUserMismatchError(err)) {
        setSheetsConnectError(t('common.sheetsWrongAccount'));
        return;
      }
      if (isPopupBlockedError(err)) {
        // GoogleSheetsSync warms the popup resolver on mount, so a second tap opens the window
        setSheetsConnectError(t('auth.popupBlockedTapAgain'));
        return;
      }
      console.warn('Sheets connect failed:', err);
      const detail = (err as { code?: string })?.code || (err instanceof Error ? err.message : '');
      const message = t('common.sheetsConnectFailed');
      setSheetsConnectError(detail ? t('common.errorWithDetail', { message, detail }) : message);
    }
  };

  const handleOpenCard = useCallback(
    (member: Member) => {
      // Display-only override on a copy (list items are never mutated; the admin repair panel reads them),
      // and only for the VERIFIED main account's own profile. An email typed into the public form never
      // turns a card into the main account.
      const u = userRef.current;
      if (u && isMainAdminUser(u) && member.authUid === u.uid) {
        setSelectedMemberForCard(withMainId(member));
        return;
      }
      setSelectedMemberForCard(member);
    },
    [withMainId]
  );

  // Only the signed-in person's OWN registration becomes their profile. An admin who registers or
  // merges someone else must not turn into that member (photo attribution).
  const handleRegistered = useCallback((newMember: Member) => {
    const u = userRef.current;
    if (u && newMember.authUid === u.uid) setCurrentMember(newMember);
    setSelectedMemberForCard(newMember);
  }, []);

  const runLookup = useCallback(
    async (query: string, openOnSuccess = false) => {
      setLookupError(null);
      setLookupResult(null);
      setLookupResolvedFrom(null);

      const parsed = parseKccIdInput(query);
      if (parsed.kind === 'invalid') {
        setLookupError(t('common.lookupInvalidId'));
        return;
      }

      setIsLookingUp(true);
      try {
        const res = await lookupMemberCard(parsed.id);
        if (!res) {
          setLookupError(t('common.lookupNotFound'));
          return;
        }
        const found = memberCardToMember(res.card);
        setLookupResult(found);
        setLookupResolvedFrom(res.resolvedFrom);
        setLookupRequestedId(res.requestedId);
        if (openOnSuccess) handleOpenCard(found);
      } catch (err) {
        console.warn('KCC ID card lookup failed:', err);
        if (classifyFirestoreError(err) === 'permission-denied') {
          // describeFirestoreError's permission text is about saving; a lookup needs its own wording
          setLookupError(t('common.lookupPermissionDenied'));
        } else {
          setLookupError(describeFirestoreError(err));
        }
      } finally {
        setIsLookingUp(false);
      }
    },
    [t, handleOpenCard]
  );

  const handleLookupCard = (e: React.FormEvent) => {
    e.preventDefault();
    void runLookup(lookupQuery);
  };

  // Card link deep link (`/?kcc=<8 or 16 digits>`, made by the admin "Copy card link"): open the card tab,
  // prefill + run the lookup once and open the pass on success. The parameter is removed from the URL
  // right away (hash kept); an invalid value is ignored silently.
  const deepLinkHandledRef = useRef(false);
  useEffect(() => {
    if (deepLinkHandledRef.current) return;
    deepLinkHandledRef.current = true;
    let raw: string | null = null;
    try {
      raw = new URLSearchParams(window.location.search).get('kcc');
    } catch {
      raw = null;
    }
    if (raw === null) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('kcc');
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    } catch {
      // URL / history unavailable: keep the parameter, nothing else breaks
    }
    const parsed = parseKccIdInput(raw);
    if (parsed.kind === 'invalid') return;
    setActiveTab('card');
    setLookupQuery(formatKccId(parsed.id));
    void runLookup(parsed.id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A lookup by an old ID (alias / 00000000-padded 16 digits) that resolved to a different, current KCC ID.
  const showOldIdNotice =
    !!lookupResult &&
    !!lookupResolvedFrom &&
    lookupResolvedFrom !== 'kcc8' &&
    lookupResult.userId16 !== lookupRequestedId;

  const memberCount = isAdmin && membersLoaded ? members.length : null;

  // DEDICATED SEPARATE PAGE: ADMIN DASHBOARD (RESTRICTED: GOOGLE SIGN-IN AS A FIREBASE ADMIN)
  if (activeTab === 'admin') {
    return (
      <MotionConfig {...motionConfig}>
      <div
        dir={dir}
        className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative"
      >
        {/* Liquid Glass Background Caustics */}
        <AmbientBackground blobs={2} />

        {/* Dedicated Admin Page Top Bar */}
        <header className="sticky top-0 z-50 glass-bar border-amber-500/30 px-4 sm:px-8 pt-[calc(0.75rem+var(--safe-top))] pb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('form');
                if (window.location.hash === '#admin') window.location.hash = '';
              }}
              className="glass-button px-3 py-1.5 rounded-xl text-xs shrink-0"
            >
              <span aria-hidden="true">&larr;</span>
              <span>{t('common.backToPublicSite')}</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span className="font-extrabold text-white text-sm sm:text-base tracking-tight truncate">
                {t('common.adminPortalTitle')}
              </span>
              <span className="hidden sm:inline-flex glass-chip text-[10px] text-amber-300 bg-amber-500/20 border-amber-500/30">
                {t('common.googleSignInBadge')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="glass-button px-3 py-1.5 rounded-xl text-xs text-purple-200 bg-purple-950/50 border-purple-500/30"
                title={t('siteEditor.editorTitle')}
                aria-label={t('siteEditor.editorTitle')}
              >
                <Palette className="w-3.5 h-3.5 text-pink-300" />
                <span className="hidden sm:inline">{t('common.siteEditorShort')}</span>
              </button>
            )}
            <span className="hidden md:inline-block text-xs text-slate-300 font-mono">
              {user?.email || t('common.adminRestricted')}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('form');
                if (window.location.hash === '#admin') window.location.hash = '';
              }}
              className="glass-button px-3 py-1.5 rounded-xl text-xs text-rose-300 bg-rose-950/50 border-rose-500/30"
              title={t('common.lockAndExitAdminTitle')}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('common.lockExit')}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 pb-[calc(4rem+var(--safe-bottom))] relative">
          <Suspense fallback={<ScreenSkeleton label={t('common.loadingAdmin')} wide />}>
            <AdminDashboard
              user={user}
              isAdmin={isAdmin}
              isAdminChecking={isAdminChecking}
              accessToken={accessToken}
              members={members}
              membersLoaded={membersLoaded}
              membersError={membersError}
              syncLogs={syncLogs}
              syncLogsError={syncLogsError}
              currentLang={currentLang}
              onSelectMember={handleOpenCard}
              onOpenAuth={openAuthModal}
              onConnectSheets={handleConnectSheets}
              sheetsConnectError={sheetsConnectError}
              onLogout={handleLogout}
            />
          </Suspense>
        </main>

        {/* AnimatePresence keeps the closed card mounted until its sheet has slid out */}
        <AnimatePresence>
          {selectedMemberForCard && (
            <Suspense key="member-card" fallback={<SheetSkeleton label={t('common.loadingApp')} />}>
              <MemberCardModal
                member={selectedMemberForCard}
                onClose={() => setSelectedMemberForCard(null)}
              />
            </Suspense>
          )}
        </AnimatePresence>
        {authModalMounted && (
          <Suspense fallback={<SheetSkeleton label={t('common.loadingApp')} />}>
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              onAuthSuccess={handleAuthSuccess}
              currentLang={currentLang}
            />
          </Suspense>
        )}
        {siteEditorMounted && (
          <Suspense fallback={<SheetSkeleton label={t('common.loadingApp')} />}>
            <SiteEditorModal />
          </Suspense>
        )}
      </div>
      </MotionConfig>
    );
  }

  // PUBLIC SITE LAYOUT (ZERO ACCESS TO MEMBER LIST FOR ALL MEMBERS)
  return (
    <MotionConfig {...motionConfig}>
    <div
      dir={dir}
      className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative"
    >
      {/* Liquid Glass Background Caustics & Bright Purple-ish Fluent Ambient Light */}
      <AmbientBackground />

      {/* Sticky header (gov banner + navbar). It owns the scroll listener, so scrolling never
          re-renders App. */}
      <StickyHeader
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={user}
        currentMember={currentMember}
        onOpenAuth={openAuthModal}
        onLogout={handleLogout}
        memberCount={memberCount}
        isAdmin={isAdmin}
        currentLang={currentLang}
        onSelectLang={setLang}
      />

      {/* Main Content Area. mode="wait": the old screen fades out (opacity only), then the new one
          rises in with a short tween. initial={false}: the first screen is visible in the very first
          paint (no entrance animation on page load; LCP / CLS). The 8px rise is the only transform and
          ends at y = 0, where framer-motion writes `transform: none`, so at rest nothing traps the
          `position: fixed` lightboxes / sheets the tab screens render inside it. With reduced motion
          or lite mode it is a plain cross-fade. No z-index: as its own stacking context it would keep
          those sheets (z-60) underneath the sticky header (z-50). It still paints above the ambient
          layer (positioned, later in the DOM). */}
      <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={activeTab}
        {...pageMotion}
        className="flex-1 pb-[calc(4rem+var(--safe-bottom))] relative"
      >
        <Suspense fallback={<ScreenSkeleton label={t('common.loadingApp')} />}>
        {/* TAB 1: FORMULIR PENDAFTARAN (LEGACY GOOGLE FORM STYLE) */}
        {activeTab === 'form' && (
          <RegistrationForm
            memberCount={memberCount}
            existingMembers={isAdmin ? members : NO_MEMBERS}
            onRegistered={handleRegistered}
            onOpenCardModal={handleOpenCard}
            currentLang={currentLang}
            isAdmin={isAdmin}
          />
        )}

        {/* TAB 2: DIGITAL PASS GENERATOR & PRIVACY-SAFE LOOKUP */}
        {activeTab === 'card' && (
          <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 text-center">
            <div className="glass-card glass-raised rounded-3xl p-8 sm:p-12">
              <span className="glass-chip text-rose-300 bg-rose-500/20 border-rose-500/30 mb-3">
                {t('common.cardPageBadge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                {t('common.cardPageTitle')}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                {t('common.cardPageDesc')}
              </p>

              {/* If user has a current active profile */}
              {currentMember && (
                <div className="mb-8 p-5 glass-well rounded-2xl max-w-md mx-auto text-start flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] text-purple-300 uppercase font-mono tracking-wider block">
                      {t('common.connectedProfile')}
                    </span>
                    <h4 className="font-bold text-white text-base truncate">{currentMember.cosplayName}</h4>
                    <p className="text-xs font-mono text-purple-300">
                      {t('common.kccIdValue', { id: formatKccId(currentMember.userId16) })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenCard(currentMember)}
                    className="px-3.5 py-2 min-h-11 liquid-glass-button text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    <span>{t('common.openPass')}</span>
                  </button>
                </div>
              )}

              {/* Lookup Card Form */}
              <form onSubmit={handleLookupCard} className="max-w-md mx-auto space-y-3 mb-6">
                <div className="relative">
                  <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    enterKeyHint="search"
                    maxLength={24}
                    placeholder={t('common.lookupPlaceholder')}
                    aria-label={t('common.lookupPlaceholder')}
                    aria-invalid={lookupError ? true : undefined}
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="w-full ps-10 pe-4 py-2.5 glass-input rounded-xl text-white text-base sm:text-sm"
                  />
                </div>

                {lookupError && (
                  <p className="text-xs text-rose-400 text-start px-1" role="alert">{lookupError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLookingUp}
                  className="w-full py-2.5 px-5 min-h-11 rounded-xl liquid-glass-button text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{isLookingUp ? t('common.searching') : t('common.lookupSubmit')}</span>
                </button>
              </form>

              {/* Lookup result display */}
              {lookupResult && (
                <div className="mt-6 p-4 rounded-2xl glass-well border-emerald-500/40 text-start max-w-md mx-auto animate-fade-in">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                        {t('common.passFound')}
                      </span>
                      <h4 className="font-bold text-white text-sm truncate">{lookupResult.cosplayName}</h4>
                      <p className="text-xs font-mono text-slate-400">
                        {t('common.idValue', { id: formatKccId(lookupResult.userId16) })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenCard(lookupResult)}
                      className="px-4 py-2 min-h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md pressable shrink-0"
                    >
                      {t('common.openPass')}
                    </button>
                  </div>
                  {showOldIdNotice && (
                    <p className="mt-3 text-xs text-amber-200/90 leading-relaxed" role="note">
                      {t('common.lookupOldIdNotice', { id: formatKccId(lookupResult.userId16) })}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>{t('common.notRegisteredYet')}</span>
                <button
                  type="button"
                  onClick={() => handleTabChange('form')}
                  className="touch-target text-rose-400 font-bold hover:underline"
                >
                  {t('common.fillRegistrationForm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHOTO GALLERY (loads its own pages when opened) */}
        {activeTab === 'gallery' && (
          <PhotoGallery
            currentMember={currentMember}
            user={user}
            onOpenUpload={() => setIsUploadPhotoModalOpen(true)}
            onRequireLogin={openAuthModal}
            currentLang={currentLang}
            addedPhoto={addedPhoto}
          />
        )}

        {activeTab === 'profile' && (
          currentMember ? (
            <UserProfile
              member={currentMember}
              onUpdateMember={(updated) => {
                const isOwnMainProfile =
                  isMainAdminUser(user) &&
                  (updated.authUid === user?.uid || isMainAccountKccId(currentMember?.userId16));
                setCurrentMember(isOwnMainProfile ? withMainId(updated) : updated);
              }}
              onOpenCardModal={handleOpenCard}
              currentLang={currentLang}
            />
          ) : user && memberLoadState === 'error' ? (
            <div className="max-w-md mx-auto py-20 text-center animate-fade-in text-slate-400 px-4">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
              <p className="text-base font-bold text-white mb-2">
                {t('common.profileLoadFailed')}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                {t('common.checkConnectionRetry')}
              </p>
              <button
                type="button"
                onClick={() => loadMemberForUser(user)}
                className="px-4 py-2 min-h-11 rounded-xl liquid-glass-button text-white font-bold text-xs"
              >
                {t('common.tryAgain')}
              </button>
            </div>
          ) : user ? (
            <div className="max-w-md mx-auto py-20 text-center animate-fade-in text-slate-400 px-4">
              <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-base font-bold text-white mb-2">
                {t('common.preparingProfile')}
              </p>
              <p className="text-xs text-slate-400">
                {t('common.preparingProfileDesc')}
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto py-20 text-center animate-fade-in text-slate-400">
               <p className="text-lg font-bold text-white mb-2">{t('common.pleaseSignIn')}</p>
               <button
                 type="button"
                 onClick={openAuthModal}
                 onPointerDown={warmAuthPopup}
                 className="touch-target text-rose-400 font-bold hover:underline"
               >
                 {t('common.clickToSignIn')}
               </button>
            </div>
          )
        )}
        </Suspense>
      </motion.main>
      </AnimatePresence>

      {/* Member Card Modal (lazy: mounted while a member is selected; AnimatePresence keeps it mounted
          until its sheet has slid out after closing) */}
      <AnimatePresence>
        {selectedMemberForCard && (
          <Suspense key="member-card" fallback={<SheetSkeleton label={t('common.loadingApp')} />}>
            <MemberCardModal
              member={selectedMemberForCard}
              onClose={() => setSelectedMemberForCard(null)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Authentication Modal (lazy: mounted on first open, then kept) */}
      {authModalMounted && (
        <Suspense fallback={<SheetSkeleton label={t('common.loadingApp')} />}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
            currentLang={currentLang}
          />
        </Suspense>
      )}

      {/* Upload Photo Modal (photo create requires a signed-in Firebase user) */}
      {user && uploadMember && uploadModalMounted && (
        <Suspense fallback={<SheetSkeleton label={t('common.loadingApp')} />}>
          <UploadPhotoModal
            isOpen={isUploadPhotoModalOpen}
            onClose={() => setIsUploadPhotoModalOpen(false)}
            currentMember={uploadMember}
            onPhotoAdded={(newPhoto) => {
              setAddedPhoto(newPhoto);
              setActiveTab('gallery');
            }}
          />
        </Suspense>
      )}

      {/* Site Editor Modal (lazy: mounted on first open, then kept) */}
      {siteEditorMounted && (
        <Suspense fallback={<SheetSkeleton label={t('common.loadingApp')} />}>
          <SiteEditorModal />
        </Suspense>
      )}

      {/* One-time notice when Auto turned Lite mode on for this device */}
      <PerfLiteNotice />

      {/* Global Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[var(--glass-fill-bar)] pt-10 pb-[calc(2.5rem+var(--safe-bottom))] px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
              KC
            </div>
            <div>
              <p className="font-bold text-white text-sm">MyKCC • KawanCosplay Community</p>
              <p className="text-slate-500 text-[11px]">
                {t('common.tagline')} • {t('common.footerPlatform')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-slate-400">
            <button type="button" onClick={() => handleTabChange('form')} className="touch-target pressable hover:text-white">
              {t('common.navForm')}
            </button>
            <button type="button" onClick={() => handleTabChange('card')} className="touch-target pressable hover:text-white">
              {t('common.navCard')}
            </button>
            <button type="button" onClick={() => handleTabChange('gallery')} className="touch-target pressable hover:text-pink-400">
              {t('common.navGallery')}
            </button>
            {/* Discreet Admin Portal Link for Managers */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                window.location.hash = 'admin';
              }}
              className="touch-target pressable text-slate-500 hover:text-amber-400 flex items-center gap-1"
              title={t('common.adminPortalLinkTitle')}
            >
              <Lock className="w-3 h-3 text-amber-500/80" />
              <span>{t('common.adminPortal')}</span>
            </button>
            <a
              href="https://wa.me/6285711032782"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1"
            >
              <span>{t('common.whatsappContact')}</span>
            </a>
            <a
              href="mailto:cosplaysehat@gmail.com"
              className="touch-target hover:text-rose-400 transition-colors"
            >
              cosplaysehat@gmail.com
            </a>
          </div>

          <div className="text-center md:text-end text-slate-500 flex flex-col items-center md:items-end gap-1">
            <p>{t('common.copyright')}</p>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">
              ● {t('common.privacyShieldActive')}
            </p>
            {/* Display mode (lite / low-power): reachable from every screen */}
            <PerfModeFooterButton className="mt-1" />
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
