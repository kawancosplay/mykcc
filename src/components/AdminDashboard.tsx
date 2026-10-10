import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  Users,
  Download,
  Trash2,
  CheckCircle,
  ExternalLink,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  AlertTriangle,
  Database,
  BarChart3,
  Layers,
  FileSpreadsheet,
  ArrowUpDown,
  RefreshCw,
  Crown,
  Shield,
  Clock,
  LogOut,
  Wrench,
} from 'lucide-react';
import type { Member, SyncLog, MemberRepairReport, SubscriptionErrorKind } from '../types';
import {
  format16DigitUserId,
  isMainAccountUserId,
  isAdminUserId,
} from '../lib/idGenerator';
import {
  updateMemberStatus,
  deleteMember,
  purgeAllMembersFromFirestore,
  listReservedIdHolders,
  reassignMemberUserId16,
  repairMemberIdsAndCards,
} from '../lib/firestoreService';
import { isMainAdminUser, describeFirestoreError } from '../lib/firebase';
import { GoogleSheetsSync } from './GoogleSheetsSync';
import { StatsOverview } from './StatsOverview';
import { LanguageCode, TRANSLATIONS } from '../lib/i18n';
import type { User } from 'firebase/auth';

interface AdminDashboardProps {
  user: User | null;
  isAdmin: boolean; // App-resolved (checkIsAdminUser for the CURRENT uid)
  isAdminChecking: boolean; // true while App resolves admin status
  accessToken: string | null; // Sheets token from googleSignIn only
  members: Member[];
  membersLoaded: boolean; // true after first successful members snapshot
  membersError: SubscriptionErrorKind | null;
  syncLogs: SyncLog[];
  syncLogsError: SubscriptionErrorKind | null;
  currentLang: LanguageCode;
  onSelectMember: (member: Member) => void;
  onOpenAuth: () => void; // opens AuthModal (Google sign-in)
  onConnectSheets: () => void; // scoped googleSignIn (Drive + Sheets)
  sheetsConnectError: string | null;
  onLogout: () => void;
}

// Display only. Admin access is decided by Firebase Auth + Firestore rules (isAdmin prop).
const OFFICIAL_ADMIN_EMAIL = 'cosplaysehat@gmail.com';
const NAMED_DATABASE_ID = 'ai-studio-kawancosplaymemb-f672c087-2a65-4410-827e-a10092d7e040';

// Labels for MemberIdReassignment.reason in the repair report
const REPAIR_REASON_LABELS: Record<string, string> = {
  duplicate: 'ID ganda / duplicate',
  missing: 'ID belum tersimpan / missing',
  main_account: 'ID Main Account dipakai anggota lain / main account ID',
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  isAdmin,
  isAdminChecking,
  accessToken,
  members,
  membersLoaded,
  membersError,
  syncLogs,
  syncLogsError,
  currentLang,
  onSelectMember,
  onOpenAuth,
  onConnectSheets,
  sheetsConnectError,
  onLogout,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isId = currentLang === 'id';

  // Sub-tabs in Admin Dashboard
  const [adminTab, setAdminTab] = useState<'members' | 'sync' | 'analytics'>('members');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedAgeCategory, setSelectedAgeCategory] = useState('ALL');
  const [sortMode, setSortMode] = useState<
    | 'timestamp_desc'
    | 'timestamp_asc'
    | 'name_asc'
    | 'name_desc'
    | 'age_asc'
    | 'age_desc'
    | 'location_asc'
    | 'location_desc'
    | 'status_asc'
    | 'status_desc'
    | 'uid_asc'
  >('timestamp_desc');

  const handleToggleSort = (field: 'timestamp' | 'name' | 'age' | 'location' | 'status' | 'uid') => {
    if (field === 'timestamp') {
      setSortMode((prev) => (prev === 'timestamp_desc' ? 'timestamp_asc' : 'timestamp_desc'));
    } else if (field === 'name') {
      setSortMode((prev) => (prev === 'name_asc' ? 'name_desc' : 'name_asc'));
    } else if (field === 'age') {
      setSortMode((prev) => (prev === 'age_asc' ? 'age_desc' : 'age_asc'));
    } else if (field === 'location') {
      setSortMode((prev) => (prev === 'location_asc' ? 'location_desc' : 'location_asc'));
    } else if (field === 'status') {
      setSortMode((prev) => (prev === 'status_asc' ? 'status_desc' : 'status_asc'));
    } else if (field === 'uid') {
      setSortMode((prev) => (prev === 'uid_asc' ? 'timestamp_desc' : 'uid_asc'));
    }
  };

  // Loading states for actions
  const [isPurging, setIsPurging] = useState(false);

  // KCC ID & public card repair states
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairProgress, setRepairProgress] = useState<{ done: number; total: number } | null>(null);
  const [repairReport, setRepairReport] = useState<MemberRepairReport | null>(null);
  const [repairError, setRepairError] = useState<string | null>(null);
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [reassignResult, setReassignResult] = useState<{ isError: boolean; message: string } | null>(null);

  // Members holding reserved IDs (0000 0000 0000 0000 – 0000 0000 0000 0100), always computed live.
  // The signed-in main account's own doc is excluded.
  const mainAdminUid = user && isMainAdminUser(user) ? user.uid : null;
  const reservedHolders = useMemo(
    () => listReservedIdHolders(members, mainAdminUid),
    [members, mainAdminUid]
  );

  // Authorization: real Firebase identity resolved by App (verified cosplaysehat@gmail.com or admins/{uid}).
  const isAuthorized = isAdmin;

  const handleStatusChange = async (
    memberId: string,
    newStatus: 'pending' | 'verified' | 'active',
    userId16?: string
  ) => {
    try {
      await updateMemberStatus(memberId, newStatus, userId16);
    } catch (e) {
      alert('Gagal memperbarui status member: ' + describeFirestoreError(e, isId));
    }
  };

  const handleDeleteMember = async (member: Member) => {
    const confirmDelete = window.confirm(
      `Hapus data member "${member.name || member.cosplayName}" (KCC ID: ${format16DigitUserId(member.userId16)}) dari database Firestore?`
    );
    if (!confirmDelete) return;

    try {
      await deleteMember(member.id, member.userId16);
    } catch (e) {
      alert('Gagal menghapus member: ' + describeFirestoreError(e, isId));
    }
  };

  const handleRunRepair = async () => {
    if (isRepairing) return;
    const confirmRepair = window.confirm(
      'Jalankan perbaikan KCC ID & kartu publik untuk seluruh anggota?\n\n' +
        '- Anggota dengan KCC ID ganda akan mendapat ID baru (yang terdaftar paling awal tetap memakai ID lama).\n' +
        '- KCC ID yang belum tersimpan akan disimpan.\n' +
        '- Koleksi publik memberCards dibangun ulang.\n\nAman dijalankan berulang kali. Lanjutkan?'
    );
    if (!confirmRepair) return;

    setIsRepairing(true);
    setRepairError(null);
    setRepairReport(null);
    setRepairProgress({ done: 0, total: 0 });
    try {
      const report = await repairMemberIdsAndCards((done, total) => setRepairProgress({ done, total }));
      setRepairReport(report);
    } catch (e) {
      console.error('Repair error:', e);
      setRepairError(describeFirestoreError(e, isId));
    } finally {
      setIsRepairing(false);
    }
  };

  const handleReassignReservedId = async (member: Member) => {
    if (reassigningId) return;
    const displayName = member.name || member.cosplayName || member.id;
    const confirmReassign = window.confirm(
      `Tetapkan KCC ID baru untuk "${displayName}" (saat ini ${format16DigitUserId(member.userId16)})?` +
        (isMainAccountUserId(member.userId16)
          ? '\n\nPERHATIAN: ini adalah ID Main Account. Jangan lanjutkan jika anggota ini adalah akun resmi ' +
            OFFICIAL_ADMIN_EMAIL +
            '.'
          : '')
    );
    if (!confirmReassign) return;

    setReassigningId(member.id);
    setReassignResult(null);
    try {
      const newId = await reassignMemberUserId16(member, members);
      setReassignResult({
        isError: false,
        message: `${displayName}: ${format16DigitUserId(member.userId16)} → ${format16DigitUserId(newId)}`,
      });
    } catch (e) {
      console.error('Reassign KCC ID error:', e);
      setReassignResult({
        isError: true,
        message: `${displayName}: ${describeFirestoreError(e, isId)}`,
      });
    } finally {
      setReassigningId(null);
    }
  };

  const handlePurgeAll = async () => {
    const confirmCode = window.prompt(
      "PERINGATAN KERAS: Tindakan ini akan MENGHAPUS SEMUA DATA ANGGOTA dari database Firestore secara permanen.\n\nKetik 'PURGE' (huruf besar) untuk konfirmasi pembersihan database:"
    );
    if (confirmCode !== 'PURGE') {
      if (confirmCode !== null) {
        alert("Konfirmasi dibatalkan (kata kunci tidak sesuai).");
      }
      return;
    }

    setIsPurging(true);
    try {
      const deletedCount = await purgeAllMembersFromFirestore();
      alert(`Pembersihan Berhasil: ${deletedCount} data anggota telah dihapus dari database.`);
    } catch (e) {
      alert('Gagal menghapus data anggota: ' + describeFirestoreError(e, isId));
    } finally {
      setIsPurging(false);
    }
  };

  const exportToCsv = () => {
    if (filteredMembers.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = [
      'KCC ID (16 Digit)',
      'Cosname / Alias',
      'Nama Legal',
      'WhatsApp',
      'Username Discord',
      'Email',
      'Kategori Usia',
      'Usia/Lahir',
      'Negara',
      'Provinsi',
      'Kota',
      'Peran Utama',
      'Fandom',
      'Pengalaman',
      'Status',
      'Tanggal Daftar',
    ];

    const rows = filteredMembers.map((m) => [
      `"${m.userId16 || ''}"`,
      `"${(m.cosplayName || '').replace(/"/g, '""')}"`,
      `"${(m.fullName || '').replace(/"/g, '""')}"`,
      `"${m.phone || ''}"`,
      `"${(m.discordUsername || '').replace(/"/g, '""')}"`,
      `"${m.email || ''}"`,
      `"${m.ageCategory || ''}"`,
      `"${m.age || ''}"`,
      `"${m.country || ''}"`,
      `"${m.province || ''}"`,
      `"${m.city || ''}"`,
      `"${m.primaryRole || ''}"`,
      `"${(m.fandom || '').replace(/"/g, '""')}"`,
      `"${m.experience || ''}"`,
      `"${m.status || ''}"`,
      `"${m.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kawancosplay_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.primaryRole) set.add(m.primaryRole);
    });
    return Array.from(set).sort();
  }, [members]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.city) set.add(m.city);
    });
    return Array.from(set).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    const filtered = members.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (m.cosplayName && m.cosplayName.toLowerCase().includes(q)) ||
        (m.fullName && m.fullName.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.userId16 && m.userId16.includes(q)) ||
        (m.phone && m.phone.includes(q)) ||
        (m.discordUsername && m.discordUsername.toLowerCase().includes(q)) ||
        (m.fandom && m.fandom.toLowerCase().includes(q)) ||
        (m.city && m.city.toLowerCase().includes(q));

      const matchRole = selectedRole === 'ALL' || m.primaryRole === selectedRole;
      const matchCity = selectedCity === 'ALL' || m.city === selectedCity;
      const matchAge = selectedAgeCategory === 'ALL' || m.ageCategory === selectedAgeCategory;

      return matchQuery && matchRole && matchCity && matchAge;
    });

    return filtered.sort((a, b) => {
      // 1. Timestamp (Submission Date & Time)
      if (sortMode === 'timestamp_asc') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortMode === 'timestamp_desc') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }

      // 2. Alphabet of the name (Cosname or Full Name)
      if (sortMode === 'name_asc') {
        const nameA = (a.cosplayName || a.fullName || '').toLowerCase().trim();
        const nameB = (b.cosplayName || b.fullName || '').toLowerCase().trim();
        return nameA.localeCompare(nameB);
      }
      if (sortMode === 'name_desc') {
        const nameA = (a.cosplayName || a.fullName || '').toLowerCase().trim();
        const nameB = (b.cosplayName || b.fullName || '').toLowerCase().trim();
        return nameB.localeCompare(nameA);
      }

      // 3. Age (Numeric age with ageCategory fallback)
      if (sortMode === 'age_asc' || sortMode === 'age_desc') {
        const getAgeNum = (m: Member): number => {
          if (m.age) {
            const parsed = parseInt(m.age.replace(/\D/g, ''), 10);
            if (!isNaN(parsed) && parsed > 0 && parsed < 120) return parsed;
          }
          if (m.ageCategory?.toLowerCase().includes('minor')) return 16;
          if (m.ageCategory?.toLowerCase().includes('legal') || m.ageCategory?.toLowerCase().includes('dewasa')) return 22;
          return 20;
        };
        const valA = getAgeNum(a);
        const valB = getAgeNum(b);
        return sortMode === 'age_asc' ? valA - valB : valB - valA;
      }

      // 4. Location (City, Province, Country)
      if (sortMode === 'location_asc') {
        const locA = `${a.city || ''}, ${a.country || ''}`.toLowerCase().trim();
        const locB = `${b.city || ''}, ${b.country || ''}`.toLowerCase().trim();
        return locA.localeCompare(locB);
      }
      if (sortMode === 'location_desc') {
        const locA = `${a.city || ''}, ${a.country || ''}`.toLowerCase().trim();
        const locB = `${b.city || ''}, ${b.country || ''}`.toLowerCase().trim();
        return locB.localeCompare(locA);
      }

      // 5. Status (Verified -> Active -> Pending)
      if (sortMode === 'status_asc' || sortMode === 'status_desc') {
        const statusWeight: Record<string, number> = {
          verified: 1,
          active: 2,
          pending: 3,
        };
        const stA = statusWeight[a.status || 'verified'] || 99;
        const stB = statusWeight[b.status || 'verified'] || 99;
        return sortMode === 'status_asc' ? stA - stB : stB - stA;
      }

      // 6. KCC ID (0000 -> Admins -> Members)
      if (sortMode === 'uid_asc') {
        const aId = (a.userId16 || '').replace(/\D/g, '');
        const bId = (b.userId16 || '').replace(/\D/g, '');
        return aId.localeCompare(bId, undefined, { numeric: true });
      }

      // Default: Timestamp newest first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [members, searchQuery, selectedRole, selectedCity, selectedAgeCategory, sortMode]);

  // If NOT authorized, show privacy lock screen (Google sign-in only, no passkey)
  if (!isAuthorized) {
    const signedInLabel = user ? user.email || user.uid : '';
    const isUnverifiedAdminEmail =
      !!user &&
      !!user.email &&
      user.email.toLowerCase().trim() === OFFICIAL_ADMIN_EMAIL &&
      !user.emailVerified;

    return (
      <div className="max-w-md mx-auto py-16 px-4 animate-fade-in text-slate-100">
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">{t.adminTitle}</h2>

          {isAdminChecking ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs sm:text-sm text-slate-300">Memeriksa akses admin... / Checking admin access...</p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                {t.privacyRestrictedNotice}
              </p>

              {user && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs text-left space-y-1.5">
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      Anda masuk sebagai <strong className="text-white break-all">{signedInLabel}</strong> — akun ini
                      bukan admin KCC. / Signed in as <strong className="text-white break-all">{signedInLabel}</strong> —
                      this account is not a KCC admin.
                    </span>
                  </p>
                  {isUnverifiedAdminEmail && (
                    <p className="pl-6 text-amber-300 font-semibold">
                      Email belum terverifikasi — gunakan Login Google. / Email not verified — use Google sign-in.
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={onOpenAuth}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Masuk dengan Akun Google Admin ({OFFICIAL_ADMIN_EMAIL})</span>
              </button>

              {user && (
                <button
                  onClick={onLogout}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Keluar dari akun ini / Sign out</span>
                </button>
              )}
            </>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            <a
              href="https://wa.me/6285711032782"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Bantuan Admin via WhatsApp: +62 857-1103-2782</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If AUTHORIZED, show the full Admin Dashboard
  return (
    <div className="w-full mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-fade-in text-slate-100">
      {/* Top Admin Banner */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>KawanCosplay Management Portal</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Akses Terverifikasi
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">{t.adminTitle}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              {t.adminDesc} Privasi anggota dijaga ketat: hanya admin terdaftar yang dapat melihat daftar nama & kontak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://wa.me/6285711032782"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 transition-all inline-flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hotline WA: +62 857-1103-2782</span>
            </a>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Keluar Akun Admin</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Summary ('—' until the first successful members snapshot) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400">Total Anggota</p>
              <p className="text-2xl font-black text-white">{membersLoaded ? members.length : '—'}</p>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400">Status Verified</p>
              <p className="text-2xl font-black text-emerald-400">
                {membersLoaded ? members.filter((m) => m.status === 'verified').length : '—'}
              </p>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400">Status Active</p>
              <p className="text-2xl font-black text-indigo-400">
                {membersLoaded ? members.filter((m) => m.status === 'active').length : '—'}
              </p>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400">Status Pending</p>
              <p className="text-2xl font-black text-amber-400">
                {membersLoaded ? members.filter((m) => m.status === 'pending').length : '—'}
              </p>
           </div>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setAdminTab('members')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 ${
              adminTab === 'members'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Anggota & Roster ({membersLoaded ? members.length : '—'})</span>
          </button>

          <button
            onClick={() => setAdminTab('sync')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 ${
              adminTab === 'sync'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets & Form Sync</span>
          </button>

          <button
            onClick={() => setAdminTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 ${
              adminTab === 'analytics'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistik Komunitas</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: MEMBER LIST & ROSTER */}
      {/* (a) Members subscription rejected by Firestore rules */}
      {adminTab === 'members' && membersError === 'permission-denied' && (
        <div className="liquid-glass-card rounded-3xl p-8 shadow-xl text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Akses Ditolak (Permission Denied)</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
            Database menolak akses daftar anggota untuk akun ini. Masuk dengan akun Google admin ({OFFICIAL_ADMIN_EMAIL})
            atau akun yang terdaftar di koleksi admins, lalu muat ulang halaman. Pastikan juga Firestore Rules terbaru
            sudah dipublikasikan ke database{' '}
            <span className="font-mono text-amber-300 break-all">{NAMED_DATABASE_ID}</span>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk dengan Akun Google Admin</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        </div>
      )}

      {/* (b) Any other subscription error (offline, unavailable, ...) */}
      {adminTab === 'members' && membersError && membersError !== 'permission-denied' && (
        <div className="liquid-glass-card rounded-3xl p-8 shadow-xl text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Gagal Memuat Daftar Anggota</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
            Gagal memuat daftar anggota. Periksa koneksi lalu muat ulang halaman. / Could not load the member list.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang Halaman</span>
          </button>
        </div>
      )}

      {/* (c) Waiting for the first members snapshot */}
      {adminTab === 'members' && !membersError && !membersLoaded && (
        <div className="liquid-glass-card rounded-3xl p-10 shadow-xl flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm text-slate-300">Memuat data anggota...</p>
        </div>
      )}

      {/* (d) Members loaded */}
      {adminTab === 'members' && !membersError && membersLoaded && (
        <div className="space-y-6">
          {/* KCC ID & PUBLIC CARD REPAIR (admin only, idempotent) */}
          <div className="liquid-glass-card rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Perbaikan KCC ID & Kartu Publik (Repair)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-3xl">
                    Memberi KCC ID unik untuk anggota yang ID-nya ganda (yang terdaftar paling awal tetap memakai ID
                    lama), menyimpan KCC ID yang belum tersimpan, dan membangun ulang koleksi publik memberCards untuk
                    pencarian kartu. Aman dijalankan berulang kali.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunRepair}
                disabled={isRepairing}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRepairing ? 'animate-spin' : ''}`} />
                <span>
                  {isRepairing
                    ? `Memproses Perbaikan${
                        repairProgress && repairProgress.total > 0
                          ? ` (${repairProgress.done}/${repairProgress.total})`
                          : ''
                      }...`
                    : 'Jalankan Perbaikan'}
                </span>
              </button>
            </div>

            {repairError && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Perbaikan gagal: {repairError}</span>
              </div>
            )}

            {repairReport && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-slate-200 space-y-3">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Perbaikan selesai.</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Anggota dipindai', value: repairReport.scanned },
                    { label: 'Grup ID ganda', value: repairReport.duplicateGroups },
                    { label: 'Kartu ditulis', value: repairReport.cardsWritten },
                    { label: 'Kartu dihapus', value: repairReport.cardsDeleted },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
                      <p className="text-lg font-black text-white">{s.value}</p>
                    </div>
                  ))}
                </div>

                {repairReport.reassigned.length > 0 ? (
                  <div>
                    <p className="font-semibold text-white mb-1.5">
                      KCC ID yang diubah / disimpan ({repairReport.reassigned.length}):
                    </p>
                    <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {repairReport.reassigned.map((r) => (
                        <li key={`${r.memberId}_${r.toUserId16}`} className="font-mono text-[11px] text-slate-300">
                          <span className="font-sans font-semibold text-white">{r.name}</span>:{' '}
                          {format16DigitUserId(r.fromUserId16 || undefined)} → {format16DigitUserId(r.toUserId16)}{' '}
                          <span className="font-sans text-slate-400">({REPAIR_REASON_LABELS[r.reason] || r.reason})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-slate-400">Tidak ada KCC ID yang perlu diubah.</p>
                )}

                {repairReport.errors.length > 0 && (
                  <div>
                    <p className="font-semibold text-rose-300 mb-1">Kendala ({repairReport.errors.length}):</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-rose-200 max-h-32 overflow-y-auto">
                      {repairReport.errors.map((errText, i) => (
                        <li key={i}>{errText}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Members holding reserved admin / main-account IDs */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <h4 className="text-sm font-bold text-white flex items-start gap-2">
                <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>KCC ID Khusus Admin / Main Account (0000 0000 0000 0000 – 0000 0000 0000 0100)</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                ID di rentang ini hanya untuk akun utama & admin KCC. Anggota di bawah ini mendapatkannya dari isian
                peran/email pada formulir publik (sistem lama). Tekan "Tetapkan ID Baru" untuk memberi KCC ID kronologis
                yang unik.
              </p>

              {reservedHolders.length === 0 ? (
                <p className="mt-3 text-xs text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Tidak ada anggota yang memegang KCC ID khusus admin.</span>
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {reservedHolders.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{m.name || m.cosplayName}</p>
                        <p className="text-[11px] font-mono font-bold text-amber-300">
                          {format16DigitUserId(m.userId16)}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Sumber: {m.source} • Peran: {m.primaryRole}
                        </p>
                      </div>
                      <button
                        onClick={() => handleReassignReservedId(m)}
                        disabled={reassigningId !== null}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${reassigningId === m.id ? 'animate-spin' : ''}`} />
                        <span>{reassigningId === m.id ? 'Memproses...' : 'Tetapkan ID Baru'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {reassignResult && (
                <p
                  className={`mt-3 text-xs font-mono ${
                    reassignResult.isError ? 'text-rose-300' : 'text-emerald-300'
                  }`}
                >
                  {reassignResult.isError ? 'Gagal: ' : 'Berhasil: '}
                  {reassignResult.message}
                </p>
              )}
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="liquid-glass-card rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 liquid-glass-input rounded-2xl text-white text-sm sm:text-base"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 liquid-glass-input rounded-xl text-xs text-slate-300"
                >
                  <option value="ALL">Semua Peran ({members.length})</option>
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-2 liquid-glass-input rounded-xl text-xs text-slate-300"
                >
                  <option value="ALL">Semua Domisili</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedAgeCategory}
                  onChange={(e) => setSelectedAgeCategory(e.target.value)}
                  className="px-3 py-2 liquid-glass-input rounded-xl text-xs text-slate-300"
                >
                  <option value="ALL">Semua Usia</option>
                  <option value="Legal Age / Dewasa (18+)">Legal Age (18+)</option>
                  <option value="Minor / Di Bawah Umur (<18)">Minor (&lt;18)</option>
                  <option value="Memilih untuk tidak menyebutkan">Tidak menyebutkan</option>
                </select>
                
                {/* Sort Order Selector (Simplified) */}
                <div className="flex items-center gap-1.5 liquid-glass-input rounded-xl px-2.5 py-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as any)}
                    className="bg-transparent text-xs text-slate-200 focus:outline-none pr-1 cursor-pointer"
                  >
                    <option value="timestamp_desc">🕒 Waktu: Terbaru</option>
                    <option value="name_asc">🔤 Nama: A → Z</option>
                  </select>
                </div>
                
                <button
                  onClick={exportToCsv}
                  className="px-3.5 py-2 liquid-glass-button rounded-xl text-xs font-bold text-slate-900 inline-flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportCsv}</span>
                </button>
                <button
                  onClick={handlePurgeAll}
                  disabled={isPurging}
                  title="Purge / Hapus seluruh data anggota di Firestore"
                  className="px-3.5 py-2 liquid-glass-button rounded-xl text-xs font-bold text-rose-900 inline-flex items-center gap-1.5 shadow-md"
                >
                  <Trash2 className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
                  <span>{isPurging ? 'Memproses Purge...' : 'Purge Data Member'}</span>
                </button>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
              <span>
                Menampilkan <strong>{filteredMembers.length}</strong> dari {members.length} anggota
              </span>
              {(selectedRole !== 'ALL' || selectedCity !== 'ALL' || selectedAgeCategory !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedRole('ALL');
                    setSelectedCity('ALL');
                    setSelectedAgeCategory('ALL');
                    setSearchQuery('');
                  }}
                  className="text-rose-400 hover:underline"
                >
                  {t.resetFilter}
                </button>
              )}
            </div>
          </div>

          {/* Members Table */}
          <div className="liquid-glass-card rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('name')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>Member / Cosname</span>
                        {sortMode.startsWith('name') && (
                          <span className="text-rose-400 font-bold">{sortMode === 'name_asc' ? '▲ A-Z' : '▼ Z-A'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('uid')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>16-Digit KCC ID</span>
                        {sortMode === 'uid_asc' && (
                          <span className="text-rose-400 font-bold">▲ ID</span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4">WhatsApp & Kontak</th>
                    <th className="py-4 px-4">Username Discord</th>
                    <th className="py-4 px-4">Peran & Minat</th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('age')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>Usia</span>
                        {sortMode.startsWith('age') && (
                          <span className="text-rose-400 font-bold">{sortMode === 'age_asc' ? '▲ Muda' : '▼ Tua'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('location')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>Domisili</span>
                        {sortMode.startsWith('location') && (
                          <span className="text-rose-400 font-bold">{sortMode === 'location_asc' ? '▲ A-Z' : '▼ Z-A'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('status')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>Status</span>
                        {sortMode.startsWith('status') && (
                          <span className="text-rose-400 font-bold">{sortMode === 'status_asc' ? '▲ Ver' : '▼ Pen'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleToggleSort('timestamp')}>
                      <div className="inline-flex items-center gap-1.5">
                        <span>Waktu Daftar</span>
                        {sortMode.startsWith('timestamp') && (
                          <span className="text-rose-400 font-bold">{sortMode === 'timestamp_desc' ? '▼ Baru' : '▲ Lama'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-right">Aksi / Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                              {m.avatarUrl ? (
                                <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">
                                  {(m.name || m.cosplayName || 'KC').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{m.name || m.cosplayName}</p>
                              {m.fullName && m.fullName !== (m.name || m.cosplayName) && (
                                <p className="text-[11px] text-slate-400">Legal: {m.fullName}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-white tracking-wider text-xs font-mono font-bold">
                              {format16DigitUserId(m.userId16)}
                            </span>
                            {isMainAccountUserId(m.userId16) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans">
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>KCC Main Account</span>
                              </span>
                            ) : isAdminUserId(m.userId16) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-sans">
                                <Shield className="w-3 h-3 text-rose-400" />
                                <span>KCC Admin #{parseInt((m.userId16 || '').replace(/\D/g, '') || '1').toString().padStart(4, '0')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-sans">
                                <Clock className="w-3 h-3 text-indigo-400" />
                                <span>Timestamp ID</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {m.phone ? (
                            <p className="text-emerald-400 font-mono font-bold text-xs">{m.phone}</p>
                          ) : (
                            <p className="text-slate-500 italic text-xs">—</p>
                          )}
                          {m.email && <p className="text-[11px] text-slate-400">{m.email}</p>}
                        </td>

                        <td className="py-4 px-4">
                          {m.discordUsername ? (
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-semibold">
                              {m.discordUsername}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-xs">—</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/20 font-semibold mb-1">
                            {m.primaryRole}
                          </span>
                          <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{m.fandom}</p>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-slate-300 font-medium">
                            {m.ageCategory || (m.age ? `${m.age}` : '-')}
                          </span>
                          {m.age && m.ageCategory && (
                            <p className="text-[10px] text-slate-400">{m.age}</p>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-300">
                          {m.city}, {m.country}
                        </td>

                        <td className="py-4 px-4 text-slate-400 text-xs">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-'}
                        </td>

                        <td className="py-4 px-4">
                          <select
                            value={m.status || 'verified'}
                            onChange={(e) =>
                              handleStatusChange(m.id, e.target.value as 'pending' | 'verified' | 'active', m.userId16)
                            }
                            className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                              m.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : m.status === 'verified'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            <option value="verified" className="bg-slate-900 text-white">
                              Verified
                            </option>
                            <option value="active" className="bg-slate-900 text-white">
                              Active
                            </option>
                            <option value="pending" className="bg-slate-900 text-white">
                              Pending
                            </option>
                          </select>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => onSelectMember(m)}
                              title="View KCC ID"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteMember(m)}
                              title="Hapus Member"
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-16 text-center">
                        <div className="max-w-md mx-auto space-y-4 px-4">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                              {members.length === 0 ? 'Database Anggota Kosong' : 'Tidak Ada Hasil'}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {members.length === 0
                                ? 'Belum ada data anggota di database. Impor dari spreadsheet Google Form atau tunggu pendaftaran baru.'
                                : 'Tidak ada data anggota yang cocok dengan kata kunci pencarian atau filter yang dipilih.'}
                            </p>
                          </div>
                          {members.length === 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                              <button
                                onClick={() => setAdminTab('sync')}
                                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
                              >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>Buka Google Sheets & Form Sync</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: GOOGLE SHEETS SYNC */}
      {adminTab === 'sync' && (
        <GoogleSheetsSync
          user={user}
          accessToken={accessToken}
          onLogin={onConnectSheets}
          connectError={sheetsConnectError}
          syncLogs={syncLogs}
          syncLogsError={syncLogsError}
          totalMembersInFirestore={members.length}
        />
      )}

      {/* TAB CONTENT 3: STATS OVERVIEW */}
      {adminTab === 'analytics' && <StatsOverview members={members} />}
    </div>
  );
};
