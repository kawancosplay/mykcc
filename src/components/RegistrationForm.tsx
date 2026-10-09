import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  User,
  Mail,
  Phone,
  Globe,
  Camera,
  Upload,
  CheckCircle2,
  Heart,
  Eye,
  Info,
  Calendar,
  ShieldCheck,
  RotateCcw,
  Send,
  MessageCircle,
  FlaskConical,
  AlertTriangle,
} from 'lucide-react';
import { Member } from '../types';
import { addMemberToFirestore } from '../lib/firestoreService';
import {
  resolveMemberUserId16,
  format16DigitUserId,
  findDuplicateMember,
  getNextMemberSequenceNumber,
} from '../lib/idGenerator';
import {
  getAllCountriesList,
  getStatesOfCountryByName,
  getCitiesOfStateByName,
  CountryOption,
} from '../lib/worldLocations';
import { LanguageCode, TRANSLATIONS, getFormTranslation, FormSpecificTranslations } from '../lib/i18n';
import { DemoFormTester } from './DemoFormTester';

interface RegistrationFormProps {
  memberCount: number;
  existingMembers?: Member[];
  onRegistered: (newMember: Member) => void;
  onOpenCardModal: (member: Member) => void;
  currentLang: LanguageCode;
  isAdmin?: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&q=80',
];

const getCommunityRoles = (isId: boolean, ft?: FormSpecificTranslations) => [
  { val: 'Cosplayer / Crossplayer', label: 'Cosplayer / Crossplayer' },
  {
    val: 'Idol Fan / Wota (J-Pop, K-Pop, 48 Group, Chika Idol, VTuber)',
    label: isId
      ? 'Idol Fan / Wota (J-Pop, K-Pop, 48 Group, Chika Idol, VTuber)'
      : 'Idol Fan / Wota (J-Pop, K-Pop, 48 Group, Chika Idol, VTuber)',
  },
  {
    val: 'Anime, Manga & Gaming Otaku (Penikmat anime, game & pop culture)',
    label: isId
      ? 'Anime, Manga & Gaming Otaku (Penikmat anime, game & pop culture)'
      : 'Anime, Manga & Gaming Otaku (Anime, games & pop-culture enthusiast)',
  },
  {
    val: 'Sahabat Umum / General Enthusiast (Penikmat umum, teman pendukung & penonton gathering)',
    label: isId
      ? 'Sahabat Umum / Penikmat Acara (Teman pendukung, pengunjung & penikmat gathering)'
      : 'General Enthusiast / Supporter (General friend, supporter & meetup attendee)',
  },
  {
    val: 'Prop Maker / Crafter / Pembuat Aksesori',
    label: isId ? 'Prop Maker / Crafter / Pembuat Aksesori' : 'Prop Maker / Crafter (Weapons, armor & accessory creator)',
  },
  {
    val: 'Fotografer / Videografer Cosplay',
    label: isId ? 'Fotografer / Videografer Cosplay' : 'Cosplay Photographer / Videographer',
  },
  {
    val: 'Costume Maker / Seamstress / Wig Stylist',
    label: isId ? 'Costume Maker / Seamstress / Wig Stylist' : 'Costume Maker / Seamstress / Wig Stylist',
  },
  {
    val: 'Event Crew, Stage Staff & Volunteer',
    label: isId ? 'Event Crew, Stage Staff & Volunteer' : 'Event Crew, Stage Staff & Volunteer',
  },
  {
    val: 'Kreator Konten / Streamer',
    label: isId ? 'Kreator Konten / Streamer' : 'Content Creator / Streamer',
  },
  {
    val: 'Lainnya / Others',
    label: ft?.roleOthers || (isId ? 'Lainnya / Others (Peran Lainnya)' : 'Others / Custom Role'),
  },
];

const getExperienceLevels = (isId: boolean) => [
  { val: 'Pemula (< 1 tahun)', label: isId ? 'Pemula (< 1 tahun)' : 'Beginner (< 1 year)' },
  { val: '1 - 3 tahun', label: isId ? '1 - 3 tahun' : '1 - 3 years' },
  { val: '> 3 tahun', label: isId ? '> 3 tahun' : 'Veteran (> 3 years)' },
  { val: 'Penikmat Santai / Casual', label: isId ? 'Penikmat Santai / Casual' : 'Casual / Enthusiast' },
];

const FANDOMS = [
  'HoYoverse (Genshin Impact, Honkai: Star Rail, ZZZ)',
  'Anime & Manga Shonen / Seinen (JJK, Demon Slayer, Chainsaw Man, One Piece)',
  'Idol & Music (Love Live!, 48 Group, Bang Dream, Idolmaster, K-Pop)',
  'Isekai & Fantasy (Frieren, Slime, Re:Zero, DanMachi)',
  'Gaming & Esports (Valorant, League of Legends, MLBB, Elden Ring)',
  'VTuber (Hololive, Nijisanji, Indie VTubers)',
  'Tokusatsu & Mecha (Kamen Rider, Super Sentai, Gundam)',
  'Western Pop Culture (Marvel, DC, Star Wars, Disney)',
  'Original Character (OC) & Creative Fantasy',
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  memberCount,
  existingMembers = [],
  onRegistered,
  onOpenCardModal,
  currentLang,
  isAdmin = false,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const ft = getFormTranslation(currentLang);
  const isId = currentLang === 'id';

  const [formData, setFormData] = useState({
    name: '', // Primary required identity
    fullName: '', // Strictly optional for privacy
    email: '', // Strictly optional
    phone: '', // Mandatory WhatsApp mobile number
    discordUsername: '', // Discord Username column
    ageCategory: 'Legal Age / Dewasa (18+ tahun)',
    age: '', // Optional exact age or birthdate
    country: 'Indonesia',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    customCity: '',
    customProvince: '',
    customCountry: '',
    primaryRole: 'Cosplayer / Crossplayer',
    customRole: '', // Specialty / custom role when 'Lainnya / Others' is selected
    fandom: 'HoYoverse (Genshin Impact, Honkai: Star Rail, ZZZ)',
    experience: 'Pemula (< 1 tahun)',
    socialMedia: '',
    portfolioUrl: '',
    avatarUrl: '',
    reason: '',
    acceptedCodeOfConduct: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMember, setSubmittedMember] = useState<Member | null>(null);
  const [isDuplicateShared, setIsDuplicateShared] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAgeExplainer, setShowAgeExplainer] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDemoSubmission, setIsDemoSubmission] = useState(false);

  // All 250 countries worldwide (Indonesia prioritized at top)
  const allCountries = useMemo(() => getAllCountriesList(), []);
  const availableProvinces = useMemo(
    () => getStatesOfCountryByName(formData.country),
    [formData.country]
  );
  const availableCities = useMemo(
    () => getCitiesOfStateByName(formData.country, formData.province),
    [formData.country, formData.province]
  );

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(isId ? 'Ukuran foto maksimal 2MB untuk avatar profil.' : 'Max file size is 2MB for avatar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearForm = () => {
    const confirmText = isId ? 'Kosongkan semua isian formulir?' : 'Clear all form inputs?';
    if (window.confirm(confirmText)) {
      setFormData({
        name: '',
        fullName: '',
        email: '',
        phone: '',
        discordUsername: '',
        ageCategory: 'Legal Age / Dewasa (18+ tahun)',
        age: '',
        country: 'Indonesia',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        customCity: '',
        customProvince: '',
        customCountry: '',
        primaryRole: 'Cosplayer / Crossplayer',
        customRole: '',
        fandom: 'HoYoverse (Genshin Impact, Honkai: Star Rail, ZZZ)',
        experience: 'Pemula (< 1 tahun)',
        socialMedia: '',
        portfolioUrl: '',
        avatarUrl: '',
        reason: '',
        acceptedCodeOfConduct: false,
      });
      setIsDemoMode(false);
      setIsDemoSubmission(false);
      setErrorMsg(null);
    }
  };

  const submitData = async (dataToSubmit: typeof formData, isSandbox: boolean = isDemoMode) => {
    setErrorMsg(null);
    setIsDuplicateShared(false);

    // PRIVACY ENFORCEMENT: Name, Email, and WhatsApp Mobile Number are required (community is WhatsApp-based)
    if (!dataToSubmit.name.trim()) {
      setErrorMsg(
        isId
          ? 'Mohon isi Nama Panggung / Cosname / Nama Samaran Anda.'
          : 'Please provide your Cosplay Name / Alias / Stage Name.'
      );
      return;
    }

    if (!dataToSubmit.email.trim()) {
      setErrorMsg(
        isId
          ? 'Mohon isi alamat email aktif Anda.'
          : 'Email address is required.'
      );
      return;
    }

    const phoneDigits = dataToSubmit.phone.replace(/\D/g, '');
    if (!dataToSubmit.phone.trim() || phoneDigits.length < 8) {
      setErrorMsg(
        isId
          ? 'Nomor WhatsApp wajib diisi (minimal 8 digit) karena komunitas KawanCosplay berbasis grup WhatsApp.'
          : 'A valid WhatsApp mobile number is required (minimum 8 digits) as KawanCosplay is a WhatsApp-based community.'
      );
      return;
    }

    if (!dataToSubmit.acceptedCodeOfConduct) {
      setErrorMsg(
        isId
          ? 'Mohon centang persetujuan Kode Etik Komunitas KawanCosplay.'
          : 'Please check the agreement to the KawanCosplay Community Code of Conduct.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCountry =
        dataToSubmit.country === 'Other International / Worldwide' && dataToSubmit.customCountry
          ? dataToSubmit.customCountry.trim()
          : dataToSubmit.country;

      const finalProvince =
        dataToSubmit.province === 'Worldwide State / Province' && dataToSubmit.customProvince
          ? dataToSubmit.customProvince.trim()
          : dataToSubmit.province;

      const finalCity =
        (dataToSubmit.city === 'Other City / County' || dataToSubmit.city === 'Kustom / Kota Lainnya') && dataToSubmit.customCity
          ? dataToSubmit.customCity.trim()
          : dataToSubmit.city;

      // Resolve role: If 'Lainnya / Others' was selected, append custom role if typed:
      const resolvedRole =
        dataToSubmit.primaryRole === 'Lainnya / Others'
          ? dataToSubmit.customRole?.trim()
            ? `Lainnya / Others (${dataToSubmit.customRole.trim()})`
            : 'Lainnya / Others'
          : dataToSubmit.primaryRole;

      // Check if duplicate / double filled form with same or similar data (Each member has a single KCC ID account):
      const matched = findDuplicateMember(existingMembers, {
        phone: dataToSubmit.phone,
        discordUsername: dataToSubmit.discordUsername,
        email: dataToSubmit.email,
        name: dataToSubmit.name,
        socialMedia: dataToSubmit.socialMedia,
      });

      let userId16: string;
      if (dataToSubmit.email.trim().toLowerCase() === 'cosplaysehat@gmail.com') {
        userId16 = '0000000000000000';
      } else if (matched) {
        // "Each member has a single KCC ID account"
        userId16 = matched.userId16;
        setIsDuplicateShared(true);
      } else {
        // User ID arranged based on sequence. UID 0000 0000 0000 0000 is assigned for KCC main account, UID 0000 0000 0000 0001 to 0000 0000 0000 0100 is assigned to KCC admin
        const nextSeq = getNextMemberSequenceNumber(existingMembers);
        userId16 = resolveMemberUserId16({
          email: dataToSubmit.email,
          role: resolvedRole,
          sequenceNumber: nextSeq,
          existingMembers,
        });
      }

      // If legal name is left blank to respect privacy, use name
      const resolvedFullName = dataToSubmit.fullName.trim() || dataToSubmit.name.trim();

      const newMemberPayload: Omit<Member, 'id'> = {
        userId16,
        name: dataToSubmit.name.trim(),
        cosplayName: dataToSubmit.name.trim(),
        fullName: resolvedFullName,
        email: dataToSubmit.email.trim().toLowerCase(), // Empty string if omitted, as legacy form never asked for email
        phone: dataToSubmit.phone.trim(),
        discordUsername: dataToSubmit.discordUsername.trim() || undefined,
        country: finalCountry,
        province: finalProvince,
        city: finalCity,
        ageCategory: dataToSubmit.ageCategory,
        age: dataToSubmit.age.trim() || undefined,
        primaryRole: resolvedRole,
        fandom: dataToSubmit.fandom,
        experience: dataToSubmit.experience,
        socialMedia: dataToSubmit.socialMedia.trim() || undefined,
        portfolioUrl: dataToSubmit.portfolioUrl.trim() || undefined,
        avatarUrl: dataToSubmit.avatarUrl || undefined,
        reason: dataToSubmit.reason.trim() || undefined,
        source: 'web_form',
        status: 'verified',
        createdAt: new Date().toISOString(),
      };

      // SANDBOX ISOLATION: When in demo mode or sandbox flag is true, DO NOT save to database!
      if (isSandbox) {
        const createdMember: Member = {
          id: `demo_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...newMemberPayload,
        };

        setIsDemoSubmission(true);
        setSubmittedMember(createdMember);
        onRegistered(createdMember);
        return;
      }

      // Live registration path: Write to Firestore
      const docId = await addMemberToFirestore(newMemberPayload, matched ? matched.id : undefined);
      const createdMember: Member = {
        id: docId,
        ...newMemberPayload,
      };

      setIsDemoSubmission(false);
      setSubmittedMember(createdMember);
      onRegistered(createdMember);
    } catch (err: unknown) {
      console.error('Submit error:', err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isId
          ? 'Terjadi kendala saat menyimpan pendaftaran.'
          : 'An error occurred while saving your registration.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitData(formData, isDemoMode);
  };

  const handleFillDemo = (demoData: any, autoSubmit: boolean = false) => {
    setIsDemoMode(true);
    const updated = {
      ...formData,
      ...demoData,
    };
    setFormData(updated);

    if (autoSubmit) {
      submitData(updated, true); // sandbox = true
    }
  };

  // SUCCESS SCREEN: Google Form style response confirmation
  if (submittedMember) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in text-slate-100">
        <div className="liquid-glass-elevated border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl">
          {/* Top Google Form Purple/Accent bar */}
          <div className="h-3 bg-gradient-to-r from-purple-600 via-rose-500 to-indigo-600"></div>

          <div className="p-8 sm:p-10 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            {isDemoSubmission && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">
                  {isId
                    ? '🧪 Mode Sandbox Demo: Pengujian ini berjalan di memori lokal dan TIDAK disimpan ke database Firestore.'
                    : '🧪 Sandboxed Demo Test: This test ran in local memory and was NOT saved to the database.'}
                </span>
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              KawanCosplay Community
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-6">
              {t.responseRecorded}
            </p>

            {/* 16-Digit Single KCC ID Account highlight */}
            <div className="liquid-glass border-rose-500/30 rounded-2xl p-5 mb-5 max-w-md mx-auto text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                {ft.singleAccountIdTitle}
              </span>
              <span className="font-mono font-black text-xl sm:text-2xl text-rose-400 tracking-wider">
                {format16DigitUserId(submittedMember.userId16, submittedMember.email)}
              </span>
              {isDuplicateShared ? (
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                  {isId
                    ? '✓ Nomor WhatsApp / akun Anda sudah terdaftar sebelumnya. Setiap anggota hanya memiliki 1 akun KCC ID tunggal dan data profil Anda telah diperbarui!'
                    : '✓ Your WhatsApp number / profile matches an existing registration. Each member holds a single KCC ID account, and your profile has been synced!'}
                </p>
              ) : (
                <p className="text-[11px] text-slate-300 mt-1.5">
                  {isId ? 'Anggota Terverifikasi: ' : 'Verified Member: '}
                  <strong className="text-white">{submittedMember.name || submittedMember.cosplayName}</strong>
                  {submittedMember.discordUsername && (
                    <span className="ml-2 text-indigo-300">• Discord: {submittedMember.discordUsername}</span>
                  )}
                </p>
              )}
            </div>

            {/* UNLOCKED WHATSAPP COMMUNITY GROUP INVITE LINK */}
            <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-2xl p-5 mb-6 max-w-md mx-auto text-center shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ft.whatsappUnlockedBadge}</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mb-1">
                {ft.whatsappUnlockedTitle}
              </h3>
              <p className="text-xs text-emerald-200/90 mb-4 leading-relaxed">
                {ft.whatsappUnlockedDesc}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <a
                  href={`https://wa.me/6285711032782?text=${encodeURIComponent(
                    `Halo Admin KawanCosplay! Saya sudah mengisi form pendaftaran anggota.\nNama: ${submittedMember.name || submittedMember.cosplayName}\nKCC ID: ${format16DigitUserId(
                      submittedMember.userId16,
                      submittedMember.email
                    )}\nNo. WA: ${submittedMember.phone || '-'}${
                      submittedMember.discordUsername ? `\nDiscord: ${submittedMember.discordUsername}` : ''
                    }\nMohon tautan undangan masuk ke Grup WhatsApp Komunitas KawanCosplay. Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 inline-flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{ft.joinWhatsappButton}</span>
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => onOpenCardModal(submittedMember)}
                className="px-5 py-2.5 rounded-xl liquid-glass-button text-white font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>{t.viewMyKccId || t.viewMyKta}</span>
              </button>

              <button
                onClick={() => {
                  setSubmittedMember(null);
                  setFormData((prev) => ({
                    ...prev,
                    cosplayName: '',
                    fullName: '',
                    email: '',
                    phone: '',
                    discordUsername: '',
                    age: '',
                    socialMedia: '',
                    portfolioUrl: '',
                    avatarUrl: '',
                    reason: '',
                    acceptedCodeOfConduct: false,
                  }));
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
              >
                {t.submitAnother}
              </button>
            </div>

            {/* Hotline footer */}
            <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-center space-x-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>{isId ? 'Butuh bantuan? WhatsApp Hotline:' : 'Need assistance? WhatsApp Hotline:'}</span>
              <a
                href="https://wa.me/6285711032782"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 font-bold hover:underline"
              >
                +62 857-1103-2782
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const communityRoles = getCommunityRoles(isId, ft);
  const experienceLevels = getExperienceLevels(isId);

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 text-slate-100">
      {/* GOOGLE FORM HEADER CARD */}
      <div className="liquid-glass-elevated rounded-3xl overflow-hidden shadow-2xl mb-6">
        {/* Top Google Form Purple/Accent Header Band */}
        <div className="h-3 bg-gradient-to-r from-purple-600 via-rose-500 to-indigo-600"></div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>{ft.officialFormTag}</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {ft.safeCommunityTag}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            {t.formTitle}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
            {t.formDesc}
          </p>

          {/* Inclusive Notice */}
          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-start space-x-3 text-xs text-indigo-200 mb-4">
            <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <strong>{t.inclusiveWelcome}</strong>
            </div>
          </div>

          {/* WhatsApp Hotline Callout */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isId ? 'WhatsApp Hotline Pengurus:' : 'Official WhatsApp Hotline:'}</span>
              <a
                href="https://wa.me/6285711032782"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-400 hover:underline"
              >
                +62 857-1103-2782
              </a>
            </div>

            <span className="text-rose-400 font-semibold">{t.requiredIndicator}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></div>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* DEMO FORM TESTING SANDBOX (RESTRICTED TO ADMINS) */}
      {isAdmin && (
        <DemoFormTester
          onFillDemo={handleFillDemo}
          existingMembers={existingMembers || []}
          isId={isId}
        />
      )}

      {/* Sandbox Active Banner when filling demo */}
      {isDemoMode && (
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isId
                ? 'Mode Sandbox Aktif: Data demo ini terisolasi dan TIDAK akan disimpan ke database Firestore.'
                : 'Sandbox Mode Active: This demo test is isolated and will NOT be saved to Firestore database.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsDemoMode(false);
              handleClearForm();
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-800/80 hover:bg-amber-700 text-white font-bold text-[10px] shrink-0 transition-colors"
          >
            {isId ? 'Kembali ke Form Asli' : 'Exit Sandbox'}
          </button>
        </div>
      )}

      {/* FORM BODY - GOOGLE FORM STYLE QUESTION CARDS */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* QUESTION 1: NAME (JUST ASK NAME) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.nameLabel} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-rose-300/90 mb-4 flex items-start space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{ft.namePrivacyNotice}</span>
          </p>

          <input
            type="text"
            required
            placeholder={ft.namePlaceholder}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-sm font-medium"
          />
        </div>

        {/* QUESTION 2: WHATSAPP MOBILE NUMBER (MANDATORY - COMMUNITY IS WHATSAPP BASED) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/25">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.whatsappLabel}{' '}
            <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-emerald-300/90 mb-4 flex items-start space-x-1.5">
            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{ft.whatsappNotice}</span>
          </p>

          <input
            type="tel"
            required
            placeholder={ft.whatsappPlaceholder}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-sm font-mono"
          />
        </div>

        {/* QUESTION 3: DISCORD USERNAME COLUMN */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.discordLabel}{' '}
            <span className="text-xs text-slate-400 font-normal">({isId ? 'Opsional' : 'Optional'})</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.discordDesc}
          </p>

          <input
            type="text"
            placeholder={ft.discordPlaceholder}
            value={formData.discordUsername}
            onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
            className="w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-sm font-mono"
          />
        </div>

        {/* QUESTION 4: EMAIL (REQUIRED) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.emailLabel} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.emailRequiredNotice || 'Email is required for registration.'}
          </p>

          <input
            type="email"
            required
            placeholder={ft.emailPlaceholder}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
          />
        </div>

        {/* QUESTION 4: AGE CATEGORY (MINOR VS LEGAL AGE) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm sm:text-base font-bold text-white">
              {t.ageCategoryLabel} <span className="text-rose-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => setShowAgeExplainer(!showAgeExplainer)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 underline"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{t.ageExplanationTitle}</span>
            </button>
          </div>

          {showAgeExplainer && (
            <div className="p-3.5 bg-slate-950 border border-rose-500/30 rounded-2xl text-xs text-slate-300 mb-4 leading-relaxed animate-fade-in">
              <strong className="text-rose-300 block mb-1">{t.ageExplanationTitle}</strong>
              <p>{t.ageExplanationDesc}</p>
            </div>
          )}

          <div className="space-y-3 mt-3">
            {[
              { val: 'Legal Age / Dewasa (18+ tahun)', label: t.legalAge },
              { val: 'Minor / Di Bawah Umur (<18 tahun)', label: t.minorAge },
              { val: 'Memilih untuk tidak menyebutkan', label: t.preferNotToSay },
            ].map((opt) => (
              <label key={opt.val} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="ageCategory"
                  value={opt.val}
                  checked={formData.ageCategory === opt.val}
                  onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value })}
                  className="w-4 h-4 text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <span className="text-xs sm:text-sm text-slate-200 group-hover:text-white">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* QUESTION 5: EXACT AGE OR BIRTHDAY (OPTIONAL) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t.exactAgeOptional}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.ageDesc}
          </p>

          <input
            type="text"
            placeholder={ft.agePlaceholder}
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
          />
        </div>

        {/* QUESTION 6: LOCATION / DOMICILE (COUNTRY, PROVINCE, CITY) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.locationTitle} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.locationNotice}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">{t.country}</label>
              <select
                value={formData.country}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  const provs = getStatesOfCountryByName(newCountry);
                  const firstProv = provs[0]?.name || '';
                  const cities = getCitiesOfStateByName(newCountry, firstProv);
                  setFormData({
                    ...formData,
                    country: newCountry,
                    province: firstProv,
                    city: cities[0] || '',
                    customCity: '',
                    customProvince: '',
                  });
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {allCountries.map((c) => (
                  <option key={c.isoCode} value={c.name}>
                    {c.flag} {c.name} ({c.isoCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">{t.province}</label>
              <select
                value={formData.province}
                onChange={(e) => {
                  const newProv = e.target.value;
                  const cities = getCitiesOfStateByName(formData.country, newProv);
                  setFormData({
                    ...formData,
                    province: newProv,
                    city: cities[0] || '',
                    customCity: '',
                  });
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {availableProvinces.map((p) => (
                  <option key={p.isoCode || p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value="Kustom / Wilayah Lainnya">{isId ? 'Kustom / Wilayah Lainnya' : 'Custom / Other Region'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">{t.city}</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                <option value="Kustom / Kota Lainnya">{isId ? 'Kustom / Kota Lainnya' : 'Custom / Other City'}</option>
              </select>
            </div>
          </div>

          {formData.province === 'Kustom / Wilayah Lainnya' && (
            <input
              type="text"
              placeholder={isId ? 'Ketik nama provinsi / wilayah / negara bagian Anda...' : 'Enter your state / province / region...'}
              value={formData.customProvince}
              onChange={(e) => setFormData({ ...formData, customProvince: e.target.value })}
              className="mt-3 w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-xs"
            />
          )}

          {(formData.city === 'Other City / County' || formData.city === 'Kustom / Kota Lainnya') && (
            <input
              type="text"
              placeholder={ft.customCityPlaceholder}
              value={formData.customCity}
              onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
              className="mt-3 w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-xs"
            />
          )}
        </div>

        {/* QUESTION 7: PRIMARY ROLE / INTEREST (INCLUSIVE) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.roleTitle} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.roleDesc}
          </p>

          <div className="space-y-3">
            {communityRoles.map((role) => (
              <div key={role.val}>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="primaryRole"
                    value={role.val}
                    checked={formData.primaryRole === role.val}
                    onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })}
                    className="w-4 h-4 text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs sm:text-sm text-slate-200 group-hover:text-white">
                    {role.label}
                  </span>
                </label>

                {role.val === 'Lainnya / Others' && formData.primaryRole === 'Lainnya / Others' && (
                  <div className="mt-2.5 ml-7">
                    <input
                      type="text"
                      placeholder={ft.roleOthersPlaceholder}
                      value={formData.customRole}
                      onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                      className="w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-xs"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* QUESTION 8: FAVORITE FANDOM / IDOL GROUP / SERIES */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.fandomTitle} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.fandomDesc}
          </p>

          <select
            value={formData.fandom}
            onChange={(e) => setFormData({ ...formData, fandom: e.target.value })}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
          >
            {FANDOMS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
            <option value="Lainnya / Multigenre">{ft.fandomOther}</option>
          </select>
        </div>

        {/* QUESTION 9: EXPERIENCE (OPTIONAL) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.experienceTitle}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.experienceDesc}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {experienceLevels.map((exp) => (
              <button
                type="button"
                key={exp.val}
                onClick={() => setFormData({ ...formData, experience: exp.val })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  formData.experience === exp.val
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {exp.label}
              </button>
            ))}
          </div>
        </div>

        {/* QUESTION 10: SOCIAL MEDIA (OPTIONAL) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.socialMediaTitle}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.socialMediaDesc}
          </p>

          <input
            type="text"
            placeholder={ft.socialMediaPlaceholder}
            value={formData.socialMedia}
            onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
            className="w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
          />
        </div>

        {/* QUESTION 11: PORTFOLIO / DRIVE LINK (OPTIONAL) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.portfolioTitle}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.portfolioDesc}
          </p>

          <input
            type="url"
            placeholder={ft.portfolioPlaceholder}
            value={formData.portfolioUrl}
            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
            className="w-full p-3 liquid-glass-input rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-sm"
          />
        </div>

        {/* QUESTION 12: AVATAR / PROFILE PHOTO (OPTIONAL) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.avatarTitle}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.avatarDesc}
          </p>

          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-slate-600" />
              )}
            </div>

            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>{ft.uploadButton}</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">{ft.presetAvatarLabel}</p>
            <div className="flex space-x-2">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarUrl: url })}
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                    formData.avatarUrl === url ? 'border-purple-500 scale-105' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* QUESTION 13: REASON & EXPECTATIONS (OPTIONAL) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {ft.reasonTitle}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {ft.reasonDesc}
          </p>

          <textarea
            rows={3}
            placeholder={ft.reasonPlaceholder}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs sm:text-sm resize-none"
          />
        </div>

        {/* QUESTION 14: CODE OF CONDUCT (REQUIRED CHECKBOX) */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <label className="block text-sm sm:text-base font-bold text-white mb-3">
            {ft.codeOfConductTitle} <span className="text-rose-500">*</span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={formData.acceptedCodeOfConduct}
              onChange={(e) => setFormData({ ...formData, acceptedCodeOfConduct: e.target.checked })}
              className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
            />
            <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {t.codeOfConduct}
            </span>
          </label>
        </div>

        {/* ACTION BUTTONS (GOOGLE FORM STYLE) */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl liquid-glass-button text-white font-bold text-xs sm:text-sm shadow-lg transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{ft.submittingText}</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{t.submitButton}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClearForm}
            className="px-3 py-1.5 rounded-lg text-xs text-rose-300 hover:text-white hover:bg-rose-500/15 transition-colors inline-flex items-center justify-center gap-1.5 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearForm}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
