import React, { useState, useEffect, lazy, Suspense } from 'react';
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

import { Member, Photo, SyncLog } from './types';
import { initAuth, logout } from './lib/googleAuth';
import {
  subscribeToMembers,
  subscribeToSyncLogs,
  checkAndSeedCommunityIfEmpty,
  repairFounderIdInFirestore,
} from './lib/firestoreService';
import {
  subscribeToPhotos,
  checkAndSeedPhotosIfEmpty,
} from './lib/galleryService';
import { findMemberByEmail, findMemberByUidOrEmail } from './lib/authService';
import { format16DigitUserId } from './lib/idGenerator';
import { LanguageCode, TRANSLATIONS, LANGUAGES } from './lib/i18n';
import { useSiteTheme } from './lib/themeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from './lib/haptic';
import { Palette, Lock, IdCard, Search, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'card' | 'gallery' | 'profile' | 'admin'>('form');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [user, setUser] = useState<User | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prevScrollYRef = React.useRef(0);

  // Optimized passive scroll listener with rAF throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
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

  // Lock body scroll cleanly while mobile menu is open to prevent page jumps
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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

  // KTA Lookup by ID or Email (Privacy-safe)
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<Member | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

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

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (currentUser, token) => {
        setUser(currentUser);
        if (token) setAccessToken(token);

        if (currentUser) {
          const matched = await findMemberByUidOrEmail(currentUser.uid, currentUser.email || '');
          if (matched) {
            if (currentUser.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com') {
              matched.userId16 = '0000000000000000';
            }
            setCurrentMember(matched);
          }
        }
      },
      () => {
        setUser(null);
        setCurrentMember(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

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
        if (cleanEmail === 'cosplaysehat@gmail.com') {
          matched.userId16 = '0000000000000000';
        }
        setCurrentMember(matched);
      }
    }
  }, [user, members, currentMember]);

  // Subscribe to real-time Firestore members, photos & sync logs
  useEffect(() => {
    checkAndSeedPhotosIfEmpty().catch(console.warn);

    const unsubMembers = subscribeToMembers(
      (updatedMembers) => {
        setMembers(updatedMembers);
        setCurrentMember((prev) => {
          if (prev) {
            const fresh = updatedMembers.find(
              (m) =>
                m.id === prev.id ||
                (prev.authUid && m.authUid === prev.authUid) ||
                (prev.email && m.email && m.email.toLowerCase() === prev.email.toLowerCase())
            );
            if (!fresh) return prev;
            if (prev.email && prev.email.toLowerCase().trim() === 'cosplaysehat@gmail.com') {
              fresh.userId16 = '0000000000000000';
            }
            return fresh;
          }
          return null;
        });
      },
      (err) => console.warn('Members subscribe note:', err)
    );

    const unsubPhotos = subscribeToPhotos(
      (updatedPhotos) => {
        setPhotos(updatedPhotos);
      },
      (err) => console.warn('Photos subscribe note:', err)
    );

    const unsubLogs = subscribeToSyncLogs(
      (updatedLogs) => {
        setSyncLogs(updatedLogs);
      },
      (err) => console.warn('Logs subscribe note:', err)
    );

    return () => {
      unsubMembers();
      unsubPhotos();
      unsubLogs();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setCurrentMember(null);
    setAccessToken(null);
    if (activeTab === 'profile') {
      setActiveTab('form');
    }
  };

  const handleAuthSuccess = (authUser: User, memberProfile: Member | null, token?: string) => {
    setUser(authUser);
    if (memberProfile) {
      if (authUser.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com') {
        memberProfile.userId16 = '0000000000000000';
      }
      setCurrentMember(memberProfile);
    }
    if (token) {
      setAccessToken(token);
    }
  };

  const handleOpenCard = (member: Member) => {
    if (member.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com') {
      member.userId16 = '0000000000000000';
    }
    setSelectedMemberForCard(member);
  };

  const handleLookupCard = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);

    const q = lookupQuery.trim().toLowerCase().replace(/\s|-/g, '');
    if (!q) {
      setLookupError(
        currentLang === 'id'
          ? 'Mohon masukkan KCC ID (16 Digit), Nama Cosplay, atau No. Telepon Anda.'
          : 'Please enter your 16-Digit KCC ID, Cosplay Name, or Phone Number.'
      );
      return;
    }

    const found = members.find((m) => {
      const idMatch = m.userId16 && m.userId16.replace(/\s|-/g, '').includes(q);
      const emailMatch = m.email && m.email.toLowerCase().trim() === lookupQuery.trim().toLowerCase();
      const nameMatch = m.cosplayName && m.cosplayName.toLowerCase().trim().includes(lookupQuery.trim().toLowerCase());
      const discordMatch = m.discordUsername && m.discordUsername.toLowerCase().trim().includes(lookupQuery.trim().toLowerCase());
      const phoneDigits = m.phone ? m.phone.replace(/\D/g, '') : '';
      const phoneMatch = phoneDigits && phoneDigits.includes(q);
      return idMatch || emailMatch || nameMatch || discordMatch || phoneMatch;
    });

    if (found) {
      if (found.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com') {
        found.userId16 = '0000000000000000';
      }
      setLookupResult(found);
    } else {
      setLookupError(
        currentLang === 'id'
          ? 'Data kartu anggota tidak ditemukan. Pastikan 16-digit KCC ID, nama cosplay, atau nomor kontak sudah sesuai.'
          : 'Member ID Card not found. Please verify your 16-Digit KCC ID, cosplay name, or contact number.'
      );
    }
  };

  // DEDICATED SEPARATE PAGE: ADMIN DASHBOARD (RESTRICTED & PASSWORD PROTECTED)
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
                Password Secured
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsEditorOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
              title="Editor Tampilan Situs"
            >
              <Palette className="w-3.5 h-3.5 text-pink-300" />
              <span className="hidden sm:inline">Editor Situs</span>
            </button>
            <span className="hidden md:inline-block text-xs text-slate-300 font-mono">
              {user?.email || 'Admin Restricted'}
            </span>
            <button
              onClick={() => {
                sessionStorage.removeItem('kcc_admin_authed_session');
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
            accessToken={accessToken}
            members={members}
            syncLogs={syncLogs}
            currentLang={currentLang}
            onSelectMember={handleOpenCard}
            onOpenAuth={() => setIsAuthModalOpen(true)}
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
      <div className={`sticky top-0 z-50 transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
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
          memberCount={members.length}
          currentLang={currentLang}
          onSelectLang={(lang) => setCurrentLang(lang)}
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
            memberCount={members.length}
            existingMembers={members}
            onRegistered={(newMember) => {
              setCurrentMember(newMember);
              setSelectedMemberForCard(newMember);
            }}
            onOpenCardModal={handleOpenCard}
            currentLang={currentLang}
            isAdmin={user?.email === 'cosplaysehat@gmail.com'}
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
                  ? 'Demi menjaga privasi seluruh anggota, daftar lengkap anggota dilindungi dan hanya dapat diakses oleh Admin di portal terpisah. Masukkan 16-Digit KCC ID, Nama Cosplay, atau No. Kontak Anda untuk menampilkan kartu identitas digital resmi Anda.'
                  : 'To protect the privacy of all members, the complete member list is restricted to the admin portal. Enter your 16-Digit KCC ID, Cosplay Name, or contact number to display your official digital pass.'}
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
                    placeholder={
                      currentLang === 'id'
                        ? 'KCC ID (16 Digit), Nama Cosplay, atau No. HP...'
                        : '16-Digit KCC ID, Cosplay Name, or Phone...'
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
                  className="w-full py-2.5 px-5 rounded-xl liquid-glass-button text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>
                    {currentLang === 'id' ? "Cari & Tampilkan Member's ID Card" : "Search & View Member's ID Card"}
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
                if (updated.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com') {
                  updated.userId16 = '0000000000000000';
                }
                setCurrentMember(updated);
              }}
              onOpenCardModal={handleOpenCard}
              currentLang={currentLang}
            />
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

      {/* Upload Photo Modal */}
      {(currentMember || (user ? {
        id: user.uid,
        userId16: user.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com' ? '0000000000000000' : '0000000000000001',
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
      } as Member : null)) && (
        <UploadPhotoModal
          isOpen={isUploadPhotoModalOpen}
          onClose={() => setIsUploadPhotoModalOpen(false)}
          currentMember={currentMember || {
            id: user!.uid,
            userId16: user!.email?.toLowerCase().trim() === 'cosplaysehat@gmail.com' ? '0000000000000000' : '0000000000000001',
            name: user!.displayName || user!.email?.split('@')[0] || 'Cosplayer',
            cosplayName: user!.displayName || user!.email?.split('@')[0] || 'Cosplayer',
            fullName: user!.displayName || 'Member',
            email: user!.email || '',
            avatarUrl: user!.photoURL || undefined,
            city: 'Worldwide',
            country: 'Indonesia',
            primaryRole: 'Cosplayer',
            fandom: 'Anime & Games',
            source: 'web_form',
            status: 'verified',
            createdAt: new Date().toISOString(),
          }}
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
              title="Portal Khusus Admin KCC (Dilindungi Password)"
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
