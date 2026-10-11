import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { User } from 'firebase/auth';
const Navbar = lazy(() => import('./components/Navbar').then(m => ({ default: m.Navbar })));
const RegistrationForm = lazy(() => import('./components/RegistrationForm').then(m => ({ default: m.RegistrationForm })));
const MemberCardModal = lazy(() => import('./components/MemberCardModal').then(m => ({ default: m.MemberCardModal })));
const PhotoGallery = lazy(() => import('./components/PhotoGallery').then(m => ({ default: m.PhotoGallery })));
const UploadPhotoModal = lazy(() => import('./components/UploadPhotoModal').then(m => ({ default: m.UploadPhotoModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const UserProfile = lazy(() => import('./components/UserProfile').then(m => ({ default: m.UserProfile })));
const OfficialGovBanner = lazy(() => import('./components/OfficialGovBanner').then(m => ({ default: m.OfficialGovBanner })));
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
  getMemberCard,
  memberCardToMember,
} from './lib/firestoreService';
import { subscribeToPhotos } from './lib/galleryService';
import { ensureMemberForUser } from './lib/authService';
import {
  checkIsAdminUser,
  isMainAdminUser,
  classifyFirestoreError,
  describeFirestoreError,
} from './lib/firebase';
import { format16DigitUserId, MAIN_ACCOUNT_UID } from './lib/idGenerator';
import { TRANSLATIONS, LANGUAGES } from './lib/i18n';
import { useI18n } from './i18n';
import { useSiteTheme } from './lib/themeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from './lib/haptic';
import { Palette, Lock, IdCard, Search, ShieldCheck, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'card' | 'gallery' | 'profile' | 'admin'>('form');
  // Language state lives in <I18nProvider> (persisted in localStorage 'kcc_lang'); currentLang is kept as an alias.
  const { lang: currentLang, setLang } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
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
  const authUidRef = React.useRef<string | null>(null);

  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prevScrollYRef = React.useRef(0);

  // Optimized passive scroll listener with rAF throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (isMobileMenuOpen) return;
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const prev = prevScrollYRef.current;

        // If mobile menu is open, or user is near top: ALWAYS keep navbar visible
        if (isMobileMenuOpen || currentScrollY <= 20) {
          setIsVisible(true);
        } else if (currentScrollY > prev + 15 && currentScrollY > 100) {
          // Significant scroll down
          setIsVisible(false);
        } else if (currentScrollY < prev - 10) {
          // Scroll up
          setIsVisible(true);
        }

        prevScrollYRef.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);


  const handleTabChange = (tab: 'form' | 'card' | 'gallery' | 'profile' | 'admin') => {
    triggerHaptic(15);
    setActiveTab(tab);
  };
  
  const { theme, setIsEditorOpen } = useSiteTheme();

  const getBgStyle = () => {
    if (theme.background === 'custom' && theme.customBgGradient) {
      return { background: theme.customBgGradient };
    }
    if (theme.background === 'cyber-purple') {
      return { background: 'linear-gradient(135deg, #18052e 0%, #3b0764 50%, #581c87 100%)' };
    }
    if (theme.background === 'cosmic-dark') {
      return { background: 'linear-gradient(135deg, #090614 0%, #170d2b 50%, #20133e 100%)' };
    }
    if (theme.background === 'fluent-lavender') {
      return { background: 'linear-gradient(135deg, #371b58 0%, #4c2a76 50%, #5c3b88 100%)' };
    }
    if (theme.background === 'dark-onyx') {
      return { background: 'linear-gradient(135deg, #0a0910 0%, #12101b 50%, #1a1727 100%)' };
    }
    return { background: 'linear-gradient(135deg, #2a1258 0%, #1b1442 45%, #11082a 100%)' };
  };

  // Modals
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadPhotoModalOpen, setIsUploadPhotoModalOpen] = useState(false);

  // KTA Lookup by 16-digit KCC ID only (public memberCards projection, privacy-safe)
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<Member | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isRtl = LANGUAGES.find((l) => l.code === currentLang)?.isRtl || false;

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

  // Load (or create, only when lookups definitively came back empty) the member profile of a signed-in user.
  // Results are ignored if the user signed out or switched accounts in the meantime.
  const loadMemberForUser = (u: User) => {
    setMemberLoadState('loading');
    ensureMemberForUser(u)
      .then((m) => {
        if (authUidRef.current !== u.uid) return;
        setCurrentMember(isMainAdminUser(u) ? { ...m, userId16: MAIN_ACCOUNT_UID } : m);
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
      }
    );

    return () => unsubscribe();
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
        setCurrentMember(isMainAdminUser(user) ? { ...matched, userId16: MAIN_ACCOUNT_UID } : matched);
      }
    }
  }, [user, members, currentMember]);

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
            if (isMainAdminUser(subscribedUser) && (fresh.authUid === subscribedUser.uid || prev.userId16 === MAIN_ACCOUNT_UID)) {
              return { ...fresh, userId16: MAIN_ACCOUNT_UID };
            }
            return fresh;
          }
          return null;
        });
      },
      (err) => {
        console.warn('Members subscribe note:', err);
        setMembersError(classifyFirestoreError(err));
        setMembersLoaded(false);
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
  }, [user?.uid, user?.email, isAdmin]);

  // Public photo gallery (no demo seeding from visitor page loads)
  useEffect(() => {
    const unsubPhotos = subscribeToPhotos(
      (updatedPhotos) => {
        setPhotos(updatedPhotos);
      },
      (err) => console.warn('Photos subscribe note:', err)
    );

    return () => {
      unsubPhotos();
    };
  }, [user?.uid]);

  // Fallback author profile for photo uploads while the member profile is not loaded yet.
  // Never fakes a reserved/admin KCC ID: only the verified main account gets 0000000000000000.
  const uploadFallbackMember = useMemo<Member | null>(() => {
    if (!user) return null;
    return {
      id: user.uid,
      userId16: isMainAdminUser(user) ? MAIN_ACCOUNT_UID : '',
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
  }, [user]);
  const uploadMember = currentMember || uploadFallbackMember;

  const handleLogout = async () => {
    await logout();
    authUidRef.current = null;
    setUser(null);
    setCurrentMember(null);
    setAccessToken(null);
    setVerifiedAdminUid(null);
    setSheetsConnectError(null);
    setMemberLoadState('idle');
    if (activeTab === 'profile') {
      setActiveTab('form');
    }
  };

  // The Google token from AuthModal has basic scopes only, so it is NOT used for Sheets.
  const handleAuthSuccess = (authUser: User, memberProfile: Member | null, _token?: string) => {
    setUser(authUser);
    if (memberProfile) {
      setCurrentMember(isMainAdminUser(authUser) ? { ...memberProfile, userId16: MAIN_ACCOUNT_UID } : memberProfile);
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
        setSheetsConnectError(
          currentLang === 'id'
            ? 'Jendela otorisasi Google ditutup sebelum selesai.'
            : 'The Google authorization window was closed before finishing.'
        );
        return;
      }
      if (isUserMismatchError(err)) {
        setSheetsConnectError(
          currentLang === 'id'
            ? 'Pilih akun Google yang sama dengan akun admin yang sedang masuk.'
            : 'Choose the same Google account as the signed-in admin account.'
        );
        return;
      }
      if (isPopupBlockedError(err)) {
        setSheetsConnectError(
          currentLang === 'id'
            ? 'Browser memblokir jendela login Google. Izinkan pop-up untuk situs ini, lalu coba lagi.'
            : 'The browser blocked the Google sign-in window. Allow pop-ups for this site and try again.'
        );
        return;
      }
      console.warn('Sheets connect failed:', err);
      const detail = (err as { code?: string })?.code || (err instanceof Error ? err.message : '');
      setSheetsConnectError(
        (currentLang === 'id'
          ? 'Gagal menghubungkan Google Sheets. Pastikan memilih akun admin (cosplaysehat@gmail.com) dan memberi izin baca Google Sheets.'
          : 'Could not connect Google Sheets. Choose the admin account (cosplaysehat@gmail.com) and allow read access to Google Sheets.') +
          (detail ? ` (${detail})` : '')
      );
    }
  };

  const handleOpenCard = (member: Member) => {
    // Display-only override on a copy (list items are never mutated; the admin repair panel reads them),
    // and only for the VERIFIED main account's own profile. An email typed into the public form never
    // turns a card into the main account.
    if (user && isMainAdminUser(user) && member.authUid === user.uid) {
      setSelectedMemberForCard({ ...member, userId16: MAIN_ACCOUNT_UID });
      return;
    }
    setSelectedMemberForCard(member);
  };

  const handleLookupCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);

    const digits = lookupQuery.replace(/\D/g, '');
    if (digits.length !== 16) {
      setLookupError(
        currentLang === 'id'
          ? 'Mohon masukkan 16 digit KCC ID Anda (angka saja, spasi boleh).'
          : 'Please enter your 16-digit KCC ID (digits only, spaces allowed).'
      );
      return;
    }

    setIsLookingUp(true);
    try {
      const card = await getMemberCard(digits);
      if (card) {
        setLookupResult(memberCardToMember(card));
      } else {
        setLookupError(
          currentLang === 'id'
            ? 'Kartu anggota dengan KCC ID tersebut tidak ditemukan. Periksa kembali 16 digit KCC ID Anda.'
            : 'No Member ID Card found for that KCC ID. Please double-check the 16 digits.'
        );
      }
    } catch (err) {
      console.warn('KCC ID card lookup failed:', err);
      if (classifyFirestoreError(err) === 'permission-denied') {
        // describeFirestoreError's permission text is about saving; a lookup needs its own wording
        setLookupError(
          currentLang === 'id'
            ? 'Pencarian kartu sedang tidak tersedia (akses database ditolak). Silakan coba lagi nanti atau hubungi Admin KCC.'
            : 'Card lookup is currently unavailable (database access denied). Please try again later or contact a KCC admin.'
        );
      } else {
        setLookupError(describeFirestoreError(err, currentLang === 'id'));
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  // DEDICATED SEPARATE PAGE: ADMIN DASHBOARD (RESTRICTED: GOOGLE SIGN-IN AS A FIREBASE ADMIN)
  if (activeTab === 'admin') {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-400">Loading Admin...</div>}>
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        style={getBgStyle()}
        className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative"
      >
        {/* Liquid Glass Background Caustics */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-500/25 via-fuchsia-500/20 to-transparent blur-[140px]"></div>
          <div className="absolute top-1/3 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-violet-500/25 via-indigo-500/20 to-transparent blur-[160px]"></div>
        </div>

        {/* Dedicated Admin Page Top Bar */}
        <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setActiveTab('form');
                if (window.location.hash === '#admin') window.location.hash = '';
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <span>&larr;</span>
              <span>{currentLang === 'id' ? 'Kembali ke Situs Utama' : 'Back to Public Site'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                KawanCosplay Admin Portal
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Google Sign-In
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {isAdmin && (
              <button
                onClick={() => setIsEditorOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                title="Editor Tampilan Situs"
              >
                <Palette className="w-3.5 h-3.5 text-pink-300" />
                <span className="hidden sm:inline">Editor Situs</span>
              </button>
            )}
            <span className="hidden md:inline-block text-xs text-slate-300 font-mono">
              {user?.email || 'Admin Restricted'}
            </span>
            <button
              onClick={() => {
                setActiveTab('form');
                if (window.location.hash === '#admin') window.location.hash = '';
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/70 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
              title="Kunci dan Keluar Portal Admin"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{currentLang === 'id' ? 'Kunci / Keluar' : 'Lock / Exit'}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 pb-16 relative z-10">
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
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onConnectSheets={handleConnectSheets}
            sheetsConnectError={sheetsConnectError}
            onLogout={handleLogout}
          />
        </main>

        <MemberCardModal
          member={selectedMemberForCard}
          onClose={() => setSelectedMemberForCard(null)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          currentLang={currentLang}
        />
        <SiteEditorModal />
      </div>
      </Suspense>
    );
  }

  // PUBLIC SITE LAYOUT (ZERO ACCESS TO MEMBER LIST FOR ALL MEMBERS)
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-400">Loading App...</div>}>
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={getBgStyle()}
      className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative"
    >
      {/* Liquid Glass Background Caustics & Bright Purple-ish Fluent Ambient Light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-500/30 via-fuchsia-500/25 to-transparent blur-[140px] animate-fluid-1"></div>
        <div className="absolute top-1/3 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-violet-500/30 via-indigo-500/25 to-transparent blur-[160px] animate-fluid-2"></div>
        <div className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-fuchsia-500/20 via-purple-600/20 to-transparent blur-[160px] animate-fluid-3"></div>
      </div>

      {/* Sticky Header Container */}
      <div className={`sticky top-0 z-50 transition-transform duration-500 ease-in-out ${!isMobileMenuOpen && !isVisible ? '-translate-y-full' : ''}`}>
        {/* Official Government-Style Verification Header */}
        <OfficialGovBanner currentLang={currentLang} />

        {/* Main Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          currentMember={currentMember}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          memberCount={isAdmin && membersLoaded ? members.length : null}
          isAdmin={isAdmin}
          currentLang={currentLang}
          onSelectLang={setLang}
          isVisible={isVisible}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={(open) => setIsMobileMenuOpen(open)}
        />
      </div>

      {/* Main Content Area */}
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        key={activeTab}
        className="flex-1 pb-16 relative z-10"
      >
        {/* TAB 1: FORMULIR PENDAFTARAN (LEGACY GOOGLE FORM STYLE) */}
        {activeTab === 'form' && (
          <RegistrationForm
            memberCount={isAdmin && membersLoaded ? members.length : null}
            existingMembers={isAdmin ? members : []}
            onRegistered={(newMember) => {
              // Only the signed-in person's OWN registration becomes their profile. An admin who
              // registers or merges someone else must not turn into that member (photo attribution).
              if (user && newMember.authUid === user.uid) setCurrentMember(newMember);
              setSelectedMemberForCard(newMember);
            }}
            onOpenCardModal={handleOpenCard}
            currentLang={currentLang}
            isAdmin={isAdmin}
          />
        )}

        {/* TAB 2: DIGITAL PASS GENERATOR & PRIVACY-SAFE LOOKUP */}
        {activeTab === 'card' && (
          <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 text-center animate-fade-in">
            <div className="liquid-glass-elevated rounded-3xl p-8 sm:p-12 shadow-2xl">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-3 inline-block">
                MyKCC Member's ID Card
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Member's ID Card & KCC ID
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                {currentLang === 'id'
                  ? 'Demi menjaga privasi seluruh anggota, daftar lengkap anggota hanya dapat diakses oleh Admin di portal terpisah. Masukkan 16-Digit KCC ID Anda (contoh: 2026 1008 0715 3001) untuk menampilkan kartu identitas digital resmi Anda.'
                  : 'To protect the privacy of all members, the complete member list is restricted to the admin portal. Enter your 16-Digit KCC ID (e.g. 2026 1008 0715 3001) to display your official digital pass.'}
              </p>

              {/* If user has a current active profile */}
              {currentMember && (
                <div className="mb-8 p-5 liquid-glass rounded-2xl max-w-md mx-auto text-left flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-purple-300 uppercase font-mono tracking-wider block">
                      {currentLang === 'id' ? 'Akun Anda Terhubung' : 'Connected Profile'}
                    </span>
                    <h4 className="font-bold text-white text-base">{currentMember.cosplayName}</h4>
                    <p className="text-xs font-mono text-purple-300">
                      KCC ID: {format16DigitUserId(currentMember.userId16, currentMember.email)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenCard(currentMember)}
                    className="px-3.5 py-2 liquid-glass-button text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    <span>{currentLang === 'id' ? 'Buka Kartu' : 'Open Pass'}</span>
                  </button>
                </div>
              )}

              {/* Lookup Card Form */}
              <form onSubmit={handleLookupCard} className="max-w-md mx-auto space-y-3 mb-6">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={24}
                    placeholder={
                      currentLang === 'id'
                        ? 'KCC ID 16 digit, contoh: 2026 1008 0715 3001'
                        : '16-Digit KCC ID, e.g. 2026 1008 0715 3001'
                    }
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 liquid-glass-input rounded-xl text-white text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                {lookupError && (
                  <p className="text-xs text-rose-400 text-left px-1">{lookupError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLookingUp}
                  className="w-full py-2.5 px-5 rounded-xl liquid-glass-button text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>
                    {isLookingUp
                      ? currentLang === 'id'
                        ? 'Mencari...'
                        : 'Searching...'
                      : currentLang === 'id'
                      ? "Cari & Tampilkan Member's ID Card"
                      : "Search & View Member's ID Card"}
                  </span>
                </button>
              </form>

              {/* Lookup result display */}
              {lookupResult && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-left max-w-md mx-auto flex items-center justify-between animate-fade-in">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      {currentLang === 'id' ? 'Data Ditemukan!' : 'Pass Found!'}
                    </span>
                    <h4 className="font-bold text-white text-sm">{lookupResult.cosplayName}</h4>
                    <p className="text-xs font-mono text-slate-400">
                      ID: {format16DigitUserId(lookupResult.userId16, lookupResult.email)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenCard(lookupResult)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {currentLang === 'id' ? 'Buka Kartu' : 'Open Pass'}
                  </button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>{currentLang === 'id' ? 'Belum terdaftar?' : 'Not registered yet?'}</span>
                <button
                  onClick={() => setActiveTab('form')}
                  className="text-rose-400 font-bold hover:underline"
                >
                  {currentLang === 'id' ? 'Isi Formulir Pendaftaran →' : 'Fill Registration Form →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHOTO GALLERY */}
        {activeTab === 'gallery' && (
          <PhotoGallery
            photos={photos}
            currentMember={currentMember}
            user={user}
            onOpenUpload={() => setIsUploadPhotoModalOpen(true)}
            onRequireLogin={() => setIsAuthModalOpen(true)}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'profile' && (
          currentMember ? (
            <UserProfile
              member={currentMember}
              onUpdateMember={(updated) => {
                const isOwnMainProfile =
                  isMainAdminUser(user) &&
                  (updated.authUid === user?.uid || currentMember?.userId16 === MAIN_ACCOUNT_UID);
                setCurrentMember(isOwnMainProfile ? { ...updated, userId16: MAIN_ACCOUNT_UID } : updated);
              }}
              onOpenCardModal={handleOpenCard}
              currentLang={currentLang}
            />
          ) : user && memberLoadState === 'error' ? (
            <div className="max-w-md mx-auto py-20 text-center animate-fade-in text-slate-400 px-4">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
              <p className="text-base font-bold text-white mb-2">
                {currentLang === 'id' ? 'Gagal memuat profil member.' : 'Could not load your member profile.'}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                {currentLang === 'id'
                  ? 'Periksa koneksi internet Anda, lalu coba lagi.'
                  : 'Check your internet connection, then try again.'}
              </p>
              <button
                type="button"
                onClick={() => loadMemberForUser(user)}
                className="px-4 py-2 rounded-xl liquid-glass-button text-white font-bold text-xs shadow-md transition-all"
              >
                {currentLang === 'id' ? 'Coba Lagi' : 'Try Again'}
              </button>
            </div>
          ) : user ? (
            <div className="max-w-md mx-auto py-20 text-center animate-fade-in text-slate-400 px-4">
              <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-base font-bold text-white mb-2">
                {currentLang === 'id' ? 'Menyiapkan Profil Member...' : 'Preparing Member Profile...'}
              </p>
              <p className="text-xs text-slate-400">
                {currentLang === 'id' ? 'Menghubungkan akun ke identitas digital KCC Anda.' : 'Connecting account to your digital KCC identity.'}
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto py-20 text-center animate-fade-in text-slate-400">
               <p className="text-lg font-bold text-white mb-2">Harap login</p>
               <button onClick={() => setIsAuthModalOpen(true)} className="text-rose-400 font-bold hover:underline">
                 Klik di sini untuk login
               </button>
            </div>
          )
        )}
      </motion.main>

      {/* Member Card Modal */}
      <MemberCardModal
        member={selectedMemberForCard}
        onClose={() => setSelectedMemberForCard(null)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        currentLang={currentLang}
      />

      {/* Upload Photo Modal (photo create requires a signed-in Firebase user) */}
      {user && uploadMember && (
        <UploadPhotoModal
          isOpen={isUploadPhotoModalOpen}
          onClose={() => setIsUploadPhotoModalOpen(false)}
          currentMember={uploadMember}
          onPhotoAdded={(newPhoto) => {
            setPhotos((prev) => [newPhoto, ...prev]);
            setActiveTab('gallery');
          }}
        />
      )}

      {/* Site Editor Modal */}
      <SiteEditorModal />

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
              KC
            </div>
            <div>
              <p className="font-bold text-white text-sm">MyKCC • KawanCosplay Community</p>
              <p className="text-slate-500 text-[11px]">
                {t.tagline} • 100% SFW International Pop-Culture Platform.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-slate-400">
            <button onClick={() => setActiveTab('form')} className="hover:text-white transition-colors">
              {t.navForm}
            </button>
            <button onClick={() => setActiveTab('card')} className="hover:text-white transition-colors">
              {t.navCard}
            </button>
            <button onClick={() => setActiveTab('gallery')} className="hover:text-pink-400 transition-colors">
              {t.navGallery}
            </button>
            {/* Discreet Admin Portal Link for Managers */}
            <button
              onClick={() => {
                setActiveTab('admin');
                window.location.hash = 'admin';
              }}
              className="text-slate-500 hover:text-amber-400 transition-colors flex items-center space-x-1"
              title="Portal Khusus Admin KCC (Login Google Admin)"
            >
              <Lock className="w-3 h-3 text-amber-500/80" />
              <span>{currentLang === 'id' ? 'Portal Admin' : 'Admin Portal'}</span>
            </button>
            <a
              href="https://wa.me/6285711032782"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center space-x-1"
            >
              <span>WhatsApp: +62 857-1103-2782</span>
            </a>
            <a
              href="mailto:cosplaysehat@gmail.com"
              className="hover:text-rose-400 transition-colors"
            >
              cosplaysehat@gmail.com
            </a>
          </div>

          <div className="text-center md:text-right text-slate-500">
            <p>&copy; 2026 MyKCC. All rights reserved.</p>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">
              ● 16-Digit Identity & Privacy Shield System Active
            </p>
          </div>
        </div>
      </footer>
    </div>
    </Suspense>
  );
}
