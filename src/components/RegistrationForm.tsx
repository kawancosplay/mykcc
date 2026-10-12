import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { MEMBER_FIELD_LIMITS } from '../lib/firestoreService';
import { submitRegistration } from '../lib/authService';
import { compressImage } from '../lib/imageUtils';
import {
  format16DigitUserId,
  generate16DigitUserId,
  findDuplicateMember,
  mergeMemberPhones,
} from '../lib/idGenerator';
import { describeFirestoreError } from '../lib/firebase';
import {
  getAllCountriesList,
  getStatesOfCountryByName,
  getCitiesOfStateByName,
  useWorldLocations,
  CountryOption,
} from '../lib/worldLocations';
import { useI18n } from '../i18n';
import type { LanguageCode, TranslationKey } from '../i18n';
import { DURATION, EASE, SPRING, TWEEN, usePresenceMotion, useReducedMotion } from '../lib/motion';
import { haptic } from '../lib/haptic';
import { DemoFormTester } from './DemoFormTester';

interface RegistrationFormProps {
  memberCount?: number | null; // null = unknown (public visitors); never rendered as 0
  existingMembers?: Member[]; // Only used by the admin DemoFormTester
  onRegistered: (newMember: Member) => void;
  onOpenCardModal: (member: Member) => void;
  currentLang: LanguageCode; // Kept for App; the component reads the language from useI18n()
  isAdmin?: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&q=80',
];

// Option values are what gets saved to Firestore and are never translated; only labelKey is shown
interface LabeledOption {
  val: string;
  labelKey: TranslationKey;
}

const COMMUNITY_ROLES: LabeledOption[] = [
  { val: 'Cosplayer / Crossplayer', labelKey: 'registration.roleCosplayer' },
  { val: 'Idol Fan / Wota (J-Pop, K-Pop, 48 Group, Chika Idol, VTuber)', labelKey: 'registration.roleIdolFan' },
  { val: 'Anime, Manga & Gaming Otaku (Penikmat anime, game & pop culture)', labelKey: 'registration.roleOtaku' },
  {
    val: 'Sahabat Umum / General Enthusiast (Penikmat umum, teman pendukung & penonton gathering)',
    labelKey: 'registration.roleGeneralEnthusiast',
  },
  { val: 'Prop Maker / Crafter / Pembuat Aksesori', labelKey: 'registration.rolePropMaker' },
  { val: 'Fotografer / Videografer Cosplay', labelKey: 'registration.rolePhotographer' },
  { val: 'Costume Maker / Seamstress / Wig Stylist', labelKey: 'registration.roleCostumeMaker' },
  { val: 'Event Crew, Stage Staff & Volunteer', labelKey: 'registration.roleEventCrew' },
  { val: 'Kreator Konten / Streamer', labelKey: 'registration.roleContentCreator' },
  { val: 'Lainnya / Others', labelKey: 'registration.roleOthers' },
];

const EXPERIENCE_LEVELS: LabeledOption[] = [
  { val: 'Pemula (< 1 tahun)', labelKey: 'registration.experienceBeginner' },
  { val: '1 - 3 tahun', labelKey: 'registration.experienceOneToThreeYears' },
  { val: '> 3 tahun', labelKey: 'registration.experienceVeteran' },
  { val: 'Penikmat Santai / Casual', labelKey: 'registration.experienceCasual' },
];

const FANDOMS: LabeledOption[] = [
  { val: 'HoYoverse (Genshin Impact, Honkai: Star Rail, ZZZ)', labelKey: 'registration.fandomHoyoverse' },
  {
    val: 'Anime & Manga Shonen / Seinen (JJK, Demon Slayer, Chainsaw Man, One Piece)',
    labelKey: 'registration.fandomShonenSeinen',
  },
  { val: 'Idol & Music (Love Live!, 48 Group, Bang Dream, Idolmaster, K-Pop)', labelKey: 'registration.fandomIdolMusic' },
  { val: 'Isekai & Fantasy (Frieren, Slime, Re:Zero, DanMachi)', labelKey: 'registration.fandomIsekaiFantasy' },
  { val: 'Gaming & Esports (Valorant, League of Legends, MLBB, Elden Ring)', labelKey: 'registration.fandomGamingEsports' },
  { val: 'VTuber (Hololive, Nijisanji, Indie VTubers)', labelKey: 'registration.fandomVtuber' },
  { val: 'Tokusatsu & Mecha (Kamen Rider, Super Sentai, Gundam)', labelKey: 'registration.fandomTokusatsuMecha' },
  { val: 'Western Pop Culture (Marvel, DC, Star Wars, Disney)', labelKey: 'registration.fandomWesternPopCulture' },
  { val: 'Original Character (OC) & Creative Fantasy', labelKey: 'registration.fandomOriginalCharacter' },
];
const OTHER_FANDOM_OPTION = 'Lainnya / Multigenre';

const AGE_CATEGORIES: LabeledOption[] = [
  { val: 'Legal Age / Dewasa (18+ tahun)', labelKey: 'registration.legalAge' },
  { val: 'Minor / Di Bawah Umur (<18 tahun)', labelKey: 'registration.minorAge' },
  { val: 'Memilih untuk tidak menyebutkan', labelKey: 'registration.preferNotToSay' },
];

// Minimum digits of a WhatsApp number (primary and backup)
const MIN_PHONE_DIGITS = 8;

// Select values that switch to a free-text province / city input; the typed text is saved instead
const CUSTOM_PROVINCE_OPTION = 'Kustom / Wilayah Lainnya';
const CUSTOM_CITY_OPTION = 'Kustom / Kota Lainnya';
const LEGACY_CUSTOM_CITY_OPTION = 'Other City / County';
const isCustomCityValue = (city: string) => city === CUSTOM_CITY_OPTION || city === LEGACY_CUSTOM_CITY_OPTION;

// Field a validation error points at: it gets aria-invalid (the red .glass-input border) until the next submit
type ErrorField = 'name' | 'email' | 'phone' | 'phone2' | 'customCity' | 'codeOfConduct';

// Radio / checkbox rows: soft press feedback plus a faint pressed tint. The negative margin keeps the
// control where it was while giving the tint some room.
const CHOICE_ROW_CLASS =
  'pressable-soft flex gap-3 -mx-2 px-2 rounded-xl cursor-pointer active:bg-white/[0.06]';

// The file input is visually hidden (sr-only, still focusable), so its label shows the focus ring
const FILE_PICKER_FOCUS_RING =
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[rgba(83,255,192,0.85)]';

/**
 * One-shot highlight behind an error message: a rose tint that fades out (no shake, no movement). `pulse`
 * changes on every failed attempt, which remounts the flash so it plays again. The parent needs
 * `relative isolate` and a border radius. Also used by UserProfile's save bar.
 */
export const ErrorFlash: React.FC<{ pulse: number }> = ({ pulse }) => {
  const reduced = useReducedMotion() === true;
  return (
    <motion.span
      key={pulse}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-rose-500/30"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: reduced ? DURATION.base : 0.7, ease: EASE.outSoft }}
    />
  );
};

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  memberCount,
  existingMembers = [],
  onRegistered,
  onOpenCardModal,
  isAdmin = false,
}) => {
  const { t, lang, intlLocale, countryName } = useI18n();
  // DemoFormTester and describeFirestoreError still take an "Indonesian?" flag
  const isId = lang === 'id';

  const [formData, setFormData] = useState({
    name: '', // Primary required identity
    fullName: '', // Strictly optional for privacy
    email: '', // Strictly optional
    phone: '', // Mandatory WhatsApp mobile number
    phone2: '', // Optional secondary / additional WhatsApp number
    discordUsername: '', // Discord Username column
    ageCategory: 'Legal Age / Dewasa (18+ tahun)',
    age: '', // Optional exact age or birthdate
    country: 'Indonesia',
    province: 'DKI Jakarta',
    city: 'Kota Administrasi Jakarta Selatan',
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
  const [showPhone2, setShowPhone2] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<ErrorField | null>(null);
  const [errorPulse, setErrorPulse] = useState(0);
  const [showAgeExplainer, setShowAgeExplainer] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDemoSubmission, setIsDemoSubmission] = useState(false);

  // Form <-> success card cross-transition, plain fades for the error messages (both turn into quick
  // opacity-only fades with reduced motion)
  const pageMotion = usePresenceMotion('page');
  const fadeMotion = usePresenceMotion('overlay');
  const reducedMotion = useReducedMotion() === true;

  // A failed submit: the message, the field it points at (red border through aria-invalid), a one-shot
  // highlight behind the message (no shake) and an error haptic
  const showError = (message: string, field: ErrorField | null = null) => {
    setErrorMsg(message);
    setErrorField(field);
    setErrorPulse((n) => n + 1);
    haptic('error');
  };

  // Native `required` validation stops the submit before handleSubmit runs: give it the same error haptic.
  // The browser fires `invalid` once per invalid field (it does not bubble, hence the capture listener),
  // so only the first one of an attempt vibrates. React 19 calls the returned cleanup on unmount.
  const attachInvalidHaptic = useCallback((form: HTMLFormElement | null) => {
    if (!form) return undefined;
    let lastAt = 0;
    const onInvalid = () => {
      const now = Date.now();
      if (now - lastAt > 500) haptic('error');
      lastAt = now;
    };
    form.addEventListener('invalid', onInvalid, true);
    return () => form.removeEventListener('invalid', onInvalid, true);
  }, []);

  // All 250 countries worldwide (Indonesia prioritized at top); locations load on demand per country
  const geoVersion = useWorldLocations(formData.country);
  const allCountries = useMemo(() => getAllCountriesList(), [geoVersion]);
  // Country names in the selected language, sorted for that language (Indonesia stays first); the saved
  // value stays the English name
  const countryOptions = useMemo(() => {
    const collator = new Intl.Collator(intlLocale);
    return allCountries
      .map((c) => ({ ...c, label: countryName(c.isoCode, c.name) }))
      .sort((a, b) => (a.isoCode === 'ID' ? -1 : b.isoCode === 'ID' ? 1 : collator.compare(a.label, b.label)));
  }, [allCountries, countryName, intlLocale]);
  // ~250 <option> elements: built once per language / list change, so React skips them on every keystroke
  const countryOptionElements = useMemo(
    () =>
      countryOptions.map((c) => (
        <option key={c.isoCode} value={c.name}>
          {c.flag} {c.label} ({c.isoCode})
        </option>
      )),
    [countryOptions]
  );
  const availableProvinces = useMemo(
    () => getStatesOfCountryByName(formData.country),
    [formData.country, geoVersion]
  );
  // A custom province has no city list: the city is typed as well
  const availableCities = useMemo(
    () =>
      formData.province === CUSTOM_PROVINCE_OPTION ? [] : getCitiesOfStateByName(formData.country, formData.province),
    [formData.country, formData.province, geoVersion]
  );

  // Once a country's locations arrive (or after a country change made before they loaded), keep the
  // province / city selections pointing at real list entries
  useEffect(() => {
    if (formData.province === CUSTOM_PROVINCE_OPTION) return;
    if (availableProvinces.length > 0 && !availableProvinces.some((p) => p.name === formData.province)) {
      const firstProv = availableProvinces[0].name;
      const cities = getCitiesOfStateByName(formData.country, firstProv);
      setFormData((prev) => ({ ...prev, province: firstProv, city: cities[0] || '' }));
      return;
    }
    if (!isCustomCityValue(formData.city) && availableCities.length > 0 && !availableCities.includes(formData.city)) {
      setFormData((prev) => ({ ...prev, city: availableCities[0] }));
    }
  }, [availableProvinces, availableCities, formData.country, formData.province, formData.city]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert(t('registration.avatarTooLarge', { maxMb: 15 }));
      return;
    }

    try {
      const compressed = await compressImage(file, 800, 800, 0.82);
      setFormData((prev) => ({ ...prev, avatarUrl: compressed }));
    } catch (err) {
      console.error('Failed to compress avatar:', err);
      alert(t('registration.photoProcessFailed'));
    }
  };

  const handleClearForm = () => {
    if (window.confirm(t('registration.clearFormConfirm'))) {
      setFormData({
        name: '',
        fullName: '',
        email: '',
        phone: '',
        phone2: '',
        discordUsername: '',
        ageCategory: 'Legal Age / Dewasa (18+ tahun)',
        age: '',
        country: 'Indonesia',
        province: 'DKI Jakarta',
        city: 'Kota Administrasi Jakarta Selatan',
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
      setShowPhone2(false);
      setIsDemoMode(false);
      setIsDemoSubmission(false);
      setErrorMsg(null);
      setErrorField(null);
    }
  };

  const submitData = async (dataToSubmit: typeof formData, isSandbox: boolean = isDemoMode) => {
    setErrorMsg(null);
    setErrorField(null);
    setIsDuplicateShared(false);

    // PRIVACY ENFORCEMENT: Name, Email, and WhatsApp Mobile Number are required (community is WhatsApp-based)
    if (!dataToSubmit.name.trim()) {
      showError(t('registration.nameRequiredError'), 'name');
      return;
    }

    if (!dataToSubmit.email.trim()) {
      showError(t('registration.emailRequiredError'), 'email');
      return;
    }

    const phoneDigits = dataToSubmit.phone.replace(/\D/g, '');
    if (!dataToSubmit.phone.trim() || phoneDigits.length < MIN_PHONE_DIGITS) {
      showError(t('registration.whatsappRequiredError', { minDigits: MIN_PHONE_DIGITS }), 'phone');
      return;
    }

    const phone2Raw = (dataToSubmit.phone2 || '').trim();
    if (phone2Raw && phone2Raw.replace(/\D/g, '').length < MIN_PHONE_DIGITS) {
      showError(t('registration.backupPhoneTooShortError', { minDigits: MIN_PHONE_DIGITS }), 'phone2');
      return;
    }

    if (isCustomCityValue(dataToSubmit.city) && !(dataToSubmit.customCity || '').trim()) {
      showError(
        t('registration.customCityRequiredError', { option: t('registration.customCityOption') }),
        'customCity'
      );
      return;
    }

    if (!dataToSubmit.acceptedCodeOfConduct) {
      showError(t('registration.codeOfConductRequiredError'), 'codeOfConduct');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCountry =
        dataToSubmit.country === 'Other International / Worldwide' && dataToSubmit.customCountry
          ? dataToSubmit.customCountry.trim()
          : dataToSubmit.country;

      // Custom province / city: the typed text is saved, never the select's placeholder value (an empty
      // custom province is simply left out; an empty custom city was rejected above)
      const finalProvince =
        dataToSubmit.province === CUSTOM_PROVINCE_OPTION
          ? (dataToSubmit.customProvince || '').trim().slice(0, MEMBER_FIELD_LIMITS.province)
          : dataToSubmit.province;

      const finalCity = isCustomCityValue(dataToSubmit.city)
        ? (dataToSubmit.customCity || '').trim().slice(0, MEMBER_FIELD_LIMITS.city)
        : dataToSubmit.city;

      // Resolve role: If 'Lainnya / Others' was selected, append custom role if typed (capped so the
      // stored role stays within the database primaryRole limit):
      const resolvedRole =
        dataToSubmit.primaryRole === 'Lainnya / Others'
          ? dataToSubmit.customRole?.trim()
            ? `Lainnya / Others (${dataToSubmit.customRole.trim().slice(0, MEMBER_FIELD_LIMITS.customRole)})`
            : 'Lainnya / Others'
          : dataToSubmit.primaryRole;

      // If legal name is left blank to respect privacy, use name
      const resolvedFullName = dataToSubmit.fullName.trim() || dataToSubmit.name.trim();

      // Members may hold more than one WhatsApp number (primary + optional backup number).
      const primaryPhone = dataToSubmit.phone.trim().slice(0, MEMBER_FIELD_LIMITS.phone);
      const secondaryPhone =
        (dataToSubmit.phone2 || '').trim().slice(0, MEMBER_FIELD_LIMITS.phone2) || undefined;

      // KCC ID is NOT derived from form input or the client-side member list: registerMember assigns a
      // chronological ID (main account ID only for the authenticated KCC main account). Re-submissions by
      // the same person are de-duplicated and merged in the data layer (submitRegistration), never by
      // scanning other members' data in the browser.
      const newMemberPayload: Omit<Member, 'id' | 'userId16'> = {
        name: dataToSubmit.name.trim(),
        cosplayName: dataToSubmit.name.trim(),
        fullName: resolvedFullName,
        email: dataToSubmit.email.trim().toLowerCase(), // Empty string if omitted, as legacy form never asked for email
        phone: primaryPhone,
        phone2: secondaryPhone,
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
        const demoId = `demo_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        // Admin-only sandbox: the duplicate check runs against the admin's already-loaded member list
        // and only simulates the merge in memory.
        const matched =
          isAdmin && existingMembers.length > 0
            ? findDuplicateMember(existingMembers, {
                email: newMemberPayload.email,
                phone: primaryPhone,
                phone2: secondaryPhone,
                discordUsername: newMemberPayload.discordUsername,
                name: newMemberPayload.name,
                socialMedia: newMemberPayload.socialMedia,
              })
            : null;

        const createdMember: Member = matched
          ? {
              ...matched,
              ...newMemberPayload,
              ...mergeMemberPhones(matched, newMemberPayload),
              id: demoId,
              userId16: matched.userId16,
              createdAt: matched.createdAt,
            }
          : {
              id: demoId,
              userId16: generate16DigitUserId(new Date()),
              ...newMemberPayload,
            };

        setIsDuplicateShared(!!matched);
        setIsDemoSubmission(true);
        setSubmittedMember(createdMember);
        haptic('success');
        onRegistered(createdMember);
        return;
      }

      // Live registration path: creates the private member doc + its public memberCards entry, or (for a
      // signed-in owner / admin whose submission matches an existing record) updates that record and keeps
      // its KCC ID. Errors (e.g. permission denied) are rethrown so a failed save never shows a success card.
      const { member: createdMember, reusedExisting } = await submitRegistration(newMemberPayload, {
        adminExistingMembers: isAdmin ? existingMembers : undefined,
      });

      setIsDuplicateShared(reusedExisting);
      setIsDemoSubmission(false);
      setSubmittedMember(createdMember);
      haptic('success');
      onRegistered(createdMember);
    } catch (err: unknown) {
      console.error('Submit error:', err);
      showError(describeFirestoreError(err, isId));
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
    // Demo presets name the person `cosplayName`; the form field is `name` (no stray cosplayName key)
    const { cosplayName: demoCosplayName, ...demoFields } = demoData || {};
    const updated: typeof formData = {
      ...formData,
      ...demoFields,
      name: demoFields.name || demoCosplayName || formData.name,
    };
    setFormData(updated);

    if (autoSubmit) {
      submitData(updated, true); // sandbox = true
    }
  };

  // SUCCESS SCREEN: Google Form style response confirmation. Form and success card are swapped inside
  // <AnimatePresence mode="wait"> (see the return below): the form fades out, then the card rises in.
  let successView: React.ReactNode = null;
  if (submittedMember) {
    const memberName = submittedMember.name || submittedMember.cosplayName || '';
    // Prefilled WhatsApp message to the admins; the backup number / Discord lines are left out when empty
    const whatsappMessage = [
      t('registration.whatsappMessageIntro'),
      t('registration.whatsappMessageName', { name: memberName }),
      t('registration.whatsappMessageKccId', { id: format16DigitUserId(submittedMember.userId16) }),
      t('registration.whatsappMessagePhone', { phone: submittedMember.phone || '-' }),
      submittedMember.phone2 ? t('registration.whatsappMessagePhone2', { phone: submittedMember.phone2 }) : null,
      submittedMember.discordUsername
        ? t('registration.discordValue', { username: submittedMember.discordUsername })
        : null,
      t('registration.whatsappMessageRequest'),
    ]
      .filter(Boolean)
      .join('\n');

    successView = (
      <motion.div key="success" {...pageMotion} className="max-w-2xl mx-auto py-12 px-4 text-slate-100">
        <div className="glass-card glass-raised border-emerald-500/30 rounded-3xl overflow-hidden">
          {/* Top Google Form Purple/Accent bar */}
          <div className="h-3 bg-gradient-to-r from-purple-600 via-rose-500 to-indigo-600"></div>

          <div className="p-6 sm:p-10 text-center">
            {/* The check pops in on a spring just after the card (reduced motion: fade only) */}
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reducedMotion ? TWEEN.reducedIn : { ...SPRING.press, delay: 0.08 }}
              className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>

            {isDemoSubmission && (
              <div className="glass-well mb-4 p-3 rounded-2xl border-amber-500/40 bg-amber-950/60 text-amber-200 text-xs flex items-center justify-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">{t('registration.sandboxSubmissionNotice')}</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              KawanCosplay Community
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-6">
              {t('registration.responseRecorded')}
            </p>

            {/* 16-Digit Single KCC ID Account highlight */}
            <div className="glass-well border-rose-500/30 rounded-2xl p-5 mb-5 max-w-md mx-auto text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                {t('registration.singleAccountIdTitle')}
              </span>
              <span className="font-mono font-black text-xl sm:text-2xl text-rose-400 tracking-wider">
                {format16DigitUserId(submittedMember.userId16)}
              </span>
              {isDuplicateShared ? (
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                  {t('registration.duplicateMergedNotice')}
                </p>
              ) : (
                <p className="text-[11px] text-slate-300 mt-1.5">
                  {t('registration.verifiedMemberLabel')} <strong className="text-white">{memberName}</strong>
                  {submittedMember.discordUsername && (
                    <span className="ml-2 text-indigo-300">
                      • {t('registration.discordValue', { username: submittedMember.discordUsername })}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* UNLOCKED WHATSAPP COMMUNITY GROUP INVITE LINK */}
            <div className="glass-well border-emerald-500/40 bg-emerald-950/60 rounded-2xl p-5 mb-6 max-w-md mx-auto text-center">
              <div className="glass-chip mb-2 font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('registration.whatsappUnlockedBadge')}</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white mb-1">
                {t('registration.whatsappUnlockedTitle')}
              </h3>
              <p className="text-xs text-emerald-200/90 mb-4 leading-relaxed">
                {t('registration.whatsappUnlockedDesc')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <a
                  href={`https://wa.me/6285711032782?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable w-full sm:w-auto min-h-11 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('registration.joinWhatsappButton')}</span>
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenCardModal(submittedMember)}
                className="btn-primary pressable px-5"
              >
                <Eye className="w-4 h-4" />
                <span>{t('registration.viewMyKccId')}</span>
              </button>

              <button
                onClick={() => {
                  // New person, same location / role / fandom presets: every personal field is cleared
                  setSubmittedMember(null);
                  setShowPhone2(false);
                  setIsDuplicateShared(false);
                  setErrorMsg(null);
                  setErrorField(null);
                  setFormData((prev) => ({
                    ...prev,
                    name: '',
                    fullName: '',
                    email: '',
                    phone: '',
                    phone2: '',
                    discordUsername: '',
                    age: '',
                    customRole: '',
                    socialMedia: '',
                    portfolioUrl: '',
                    avatarUrl: '',
                    reason: '',
                    acceptedCodeOfConduct: false,
                  }));
                }}
                className="glass-button pressable px-5"
              >
                {t('registration.submitAnother')}
              </button>
            </div>

            {/* Hotline footer */}
            <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>{t('registration.needHelpHotline')}</span>
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
      </motion.div>
    );
  }

  const formView = (
    <motion.div key="form" {...pageMotion} className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 text-slate-100">
      {/* GOOGLE FORM HEADER CARD */}
      <div className="glass-card glass-raised rounded-3xl overflow-hidden mb-6">
        {/* Top Google Form Purple/Accent Header Band */}
        <div className="h-3 bg-gradient-to-r from-purple-600 via-rose-500 to-indigo-600"></div>

        <div className="p-5 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="glass-chip font-bold bg-rose-500/20 text-rose-300 border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('registration.officialFormTag')}</span>
            </span>
            <span className="glass-chip bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              {t('registration.safeCommunityTag')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            {t('registration.formTitle')}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
            {t('registration.formDesc')}
          </p>

          {/* Inclusive Notice */}
          <div className="glass-well p-3.5 border-indigo-500/30 bg-indigo-950/40 rounded-2xl flex items-start gap-3 text-xs text-indigo-200 mb-4">
            <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <strong>{t('registration.inclusiveWelcome')}</strong>
            </div>
          </div>

          {/* WhatsApp Hotline Callout */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-white/10 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('registration.officialHotlineLabel')}</span>
              <a
                href="https://wa.me/6285711032782"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-400 hover:underline"
              >
                +62 857-1103-2782
              </a>
            </div>

            <span className="text-rose-400 font-semibold">{t('registration.requiredIndicator')}</span>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {errorMsg && (
          <motion.div
            key="error"
            {...fadeMotion}
            className="glass-well relative isolate mb-6 p-4 rounded-2xl border-rose-500/50 bg-rose-950/60 text-rose-200 text-sm flex items-center gap-2"
          >
            <ErrorFlash pulse={errorPulse} />
            <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></div>
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="glass-well mb-5 p-3.5 rounded-2xl border-amber-500/40 bg-amber-950/60 text-amber-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t('registration.sandboxActiveNotice')}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsDemoMode(false);
              handleClearForm();
            }}
            className="glass-button pressable shrink-0 min-h-11 px-3 bg-amber-800/80 hover:bg-amber-700 border-amber-500/40 text-white font-bold text-xs"
          >
            {t('registration.exitSandbox')}
          </button>
        </div>
      )}

      {/* FORM BODY - GOOGLE FORM STYLE QUESTION CARDS. Fields keep a bottom scroll margin so a field
          scrolled into view on focus is not hidden behind the sticky submit bar. */}
      <form
        ref={attachInvalidHaptic}
        onSubmit={handleSubmit}
        className="space-y-5 [&_input]:scroll-mb-28 [&_select]:scroll-mb-28 [&_textarea]:scroll-mb-28"
      >
        {/* QUESTION 1: NAME (JUST ASK NAME) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.nameLabel')} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-rose-300/90 mb-4 flex items-start space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{t('registration.namePrivacyNotice')}</span>
          </p>

          <input
            type="text"
            required
            aria-invalid={errorField === 'name' || undefined}
            placeholder={t('registration.namePlaceholder')}
            maxLength={MEMBER_FIELD_LIMITS.name}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="glass-input w-full text-base sm:text-sm font-medium"
          />
        </div>

        {/* QUESTION 2: WHATSAPP MOBILE NUMBER (MANDATORY - COMMUNITY IS WHATSAPP BASED) & OPTIONAL SECONDARY NUMBER */}
        <div className="glass-card rounded-3xl p-5 sm:p-8 border border-emerald-500/25 space-y-4">
          <div>
            <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
              {t('registration.whatsappLabel')}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-emerald-300/90 mb-3 flex items-start space-x-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('registration.whatsappNotice')}</span>
            </p>

            <input
              type="tel"
              required
              aria-invalid={errorField === 'phone' || undefined}
              placeholder={t('registration.whatsappPlaceholder')}
              maxLength={MEMBER_FIELD_LIMITS.phone}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="glass-input w-full text-base sm:text-sm font-mono"
            />
          </div>

          {/* Opsi memiliki lebih dari 1 nomor WhatsApp */}
          <div className="pt-2 border-t border-white/10">
            {!showPhone2 && !formData.phone2 ? (
              <button
                type="button"
                onClick={() => setShowPhone2(true)}
                className="pressable min-h-11 text-left text-sm text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('registration.addBackupPhone')}</span>
              </button>
            ) : (
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-bold text-slate-200">
                    {t('registration.backupPhoneLabel')}{' '}
                    <span className="text-slate-400 font-normal">{t('registration.optionalTag')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, phone2: '' });
                      setShowPhone2(false);
                    }}
                    className="touch-target pressable shrink-0 text-xs text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    {t('registration.removeBackupPhone')}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('registration.backupPhoneNotice')}
                </p>
                <input
                  type="tel"
                  aria-invalid={errorField === 'phone2' || undefined}
                  placeholder={t('registration.backupPhonePlaceholder')}
                  maxLength={MEMBER_FIELD_LIMITS.phone2}
                  value={formData.phone2}
                  onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                  className="glass-input w-full text-base sm:text-sm font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* QUESTION 3: DISCORD USERNAME COLUMN */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.discordLabel')}{' '}
            <span className="text-xs text-slate-400 font-normal">{t('registration.optionalTag')}</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.discordDesc')}
          </p>

          <input
            type="text"
            placeholder={t('registration.discordPlaceholder')}
            maxLength={MEMBER_FIELD_LIMITS.discordUsername}
            value={formData.discordUsername}
            onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
            className="glass-input w-full text-base sm:text-sm font-mono"
          />
        </div>

        {/* QUESTION 4: EMAIL (REQUIRED) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.emailLabel')} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.emailRequiredNotice')}
          </p>

          <input
            type="email"
            required
            aria-invalid={errorField === 'email' || undefined}
            placeholder={t('registration.emailPlaceholder')}
            maxLength={MEMBER_FIELD_LIMITS.email}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="glass-input w-full text-base sm:text-sm"
          />
        </div>

        {/* QUESTION 4: AGE CATEGORY (MINOR VS LEGAL AGE) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-1.5">
            <label className="block text-sm sm:text-base font-bold text-white">
              {t('registration.ageCategoryLabel')} <span className="text-rose-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => setShowAgeExplainer(!showAgeExplainer)}
              aria-expanded={showAgeExplainer}
              className="touch-target pressable min-w-0 text-left text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 underline"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{t('registration.ageExplanationTitle')}</span>
            </button>
          </div>

          {showAgeExplainer && (
            <div className="glass-well p-3.5 border-rose-500/30 rounded-2xl text-xs text-slate-300 mb-4 leading-relaxed animate-fade-in">
              <strong className="text-rose-300 block mb-1">{t('registration.ageExplanationTitle')}</strong>
              <p>{t('registration.ageExplanationDesc')}</p>
            </div>
          )}

          <div className="space-y-1 mt-2">
            {AGE_CATEGORIES.map((opt) => (
              <label key={opt.val} className={`${CHOICE_ROW_CLASS} items-center min-h-11 py-1 group`}>
                <input
                  type="radio"
                  name="ageCategory"
                  value={opt.val}
                  checked={formData.ageCategory === opt.val}
                  onChange={(e) => {
                    setFormData({ ...formData, ageCategory: e.target.value });
                    haptic('selection');
                  }}
                  className="w-5 h-5 shrink-0 cursor-pointer"
                />
                <span className="text-sm text-slate-200 group-hover:text-white">
                  {t(opt.labelKey)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* QUESTION 5: EXACT AGE OR BIRTHDAY (OPTIONAL) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.exactAgeOptional')}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.ageDesc')}
          </p>

          <input
            type="text"
            placeholder={t('registration.agePlaceholder')}
            maxLength={MEMBER_FIELD_LIMITS.age}
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="glass-input w-full text-base sm:text-sm"
          />
        </div>

        {/* QUESTION 6: LOCATION / DOMICILE (COUNTRY, PROVINCE, CITY) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.locationTitle')} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.locationNotice')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                {t('registration.countryLabel')}
              </label>
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
                className="glass-input w-full text-base sm:text-sm"
              >
                {countryOptionElements}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                {t('registration.provinceLabel')}
              </label>
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
                className="glass-input w-full text-base sm:text-sm"
              >
                {availableProvinces.map((p) => (
                  <option key={p.isoCode || p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value={CUSTOM_PROVINCE_OPTION}>{t('registration.customProvinceOption')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                {t('registration.cityLabel')}
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="glass-input w-full text-base sm:text-sm"
              >
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                <option value={CUSTOM_CITY_OPTION}>{t('registration.customCityOption')}</option>
              </select>
            </div>
          </div>

          {formData.province === CUSTOM_PROVINCE_OPTION && (
            <input
              type="text"
              placeholder={t('registration.customProvincePlaceholder')}
              maxLength={MEMBER_FIELD_LIMITS.province}
              value={formData.customProvince}
              onChange={(e) => setFormData({ ...formData, customProvince: e.target.value })}
              className="glass-input mt-3 w-full text-base sm:text-sm"
            />
          )}

          {isCustomCityValue(formData.city) && (
            <input
              type="text"
              aria-invalid={errorField === 'customCity' || undefined}
              placeholder={t('registration.customCityPlaceholder')}
              maxLength={MEMBER_FIELD_LIMITS.city}
              value={formData.customCity}
              onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
              className="glass-input mt-3 w-full text-base sm:text-sm"
            />
          )}
        </div>

        {/* QUESTION 7: PRIMARY ROLE / INTEREST (INCLUSIVE) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.roleTitle')} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.roleDesc')}
          </p>

          <div className="space-y-1">
            {COMMUNITY_ROLES.map((role) => (
              <div key={role.val}>
                <label className={`${CHOICE_ROW_CLASS} items-center min-h-11 py-1 group`}>
                  <input
                    type="radio"
                    name="primaryRole"
                    value={role.val}
                    checked={formData.primaryRole === role.val}
                    onChange={(e) => {
                      setFormData({ ...formData, primaryRole: e.target.value });
                      haptic('selection');
                    }}
                    className="w-5 h-5 shrink-0 cursor-pointer"
                  />
                  <span className="text-sm text-slate-200 group-hover:text-white">
                    {t(role.labelKey)}
                  </span>
                </label>

                {role.val === 'Lainnya / Others' && formData.primaryRole === 'Lainnya / Others' && (
                  <div className="mt-1.5 mb-2 ms-8">
                    <input
                      type="text"
                      placeholder={t('registration.roleOthersPlaceholder')}
                      maxLength={MEMBER_FIELD_LIMITS.customRole}
                      value={formData.customRole}
                      onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                      className="glass-input w-full text-base sm:text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* QUESTION 8: FAVORITE FANDOM / IDOL GROUP / SERIES */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.fandomTitle')} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.fandomDesc')}
          </p>

          <select
            value={formData.fandom}
            onChange={(e) => setFormData({ ...formData, fandom: e.target.value })}
            className="glass-input w-full text-base sm:text-sm"
          >
            {FANDOMS.map((f) => (
              <option key={f.val} value={f.val}>
                {t(f.labelKey)}
              </option>
            ))}
            <option value={OTHER_FANDOM_OPTION}>{t('registration.fandomOther')}</option>
          </select>
        </div>

        {/* QUESTION 9: EXPERIENCE (OPTIONAL) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.experienceTitle')}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.experienceDesc')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXPERIENCE_LEVELS.map((exp) => (
              <button
                type="button"
                key={exp.val}
                aria-pressed={formData.experience === exp.val}
                onClick={() => {
                  setFormData({ ...formData, experience: exp.val });
                  haptic('selection');
                }}
                className="glass-chip pressable justify-center text-center whitespace-normal leading-tight rounded-xl min-h-11 px-3 py-2 text-xs sm:text-sm"
              >
                {t(exp.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* QUESTION 10: SOCIAL MEDIA (OPTIONAL) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.socialMediaTitle')}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.socialMediaDesc')}
          </p>

          <input
            type="text"
            placeholder={t('registration.socialMediaPlaceholder')}
            maxLength={MEMBER_FIELD_LIMITS.socialMedia}
            value={formData.socialMedia}
            onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
            className="glass-input w-full text-base sm:text-sm"
          />
        </div>

        {/* QUESTION 11: PORTFOLIO / DRIVE LINK (OPTIONAL) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.portfolioTitle')}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.portfolioDesc')}
          </p>

          <input
            type="url"
            placeholder={t('registration.portfolioPlaceholder')}
            maxLength={MEMBER_FIELD_LIMITS.portfolioUrl}
            value={formData.portfolioUrl}
            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
            className="glass-input w-full text-base sm:text-sm"
          />
        </div>

        {/* QUESTION 12: AVATAR / PROFILE PHOTO (OPTIONAL) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.avatarTitle')}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.avatarDesc')}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="glass-well w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={t('registration.avatarPreviewAlt')}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-slate-600" />
              )}
            </div>

            <label className={`glass-button pressable relative cursor-pointer min-h-11 px-4 text-sm ${FILE_PICKER_FOCUS_RING}`}>
              <Upload className="w-4 h-4 text-purple-400" />
              <span>{t('registration.uploadButton')}</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" />
            </label>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">{t('registration.presetAvatarLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={t('registration.presetAvatarAria', { number: i + 1 })}
                  aria-pressed={formData.avatarUrl === url}
                  onClick={() => {
                    setFormData({ ...formData, avatarUrl: url });
                    haptic('selection');
                  }}
                  className={`pressable w-11 h-11 shrink-0 rounded-xl overflow-hidden border-2 bg-black/30 ${
                    formData.avatarUrl === url ? 'border-purple-500' : 'border-white/10 opacity-60'
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* QUESTION 13: REASON & EXPECTATIONS (OPTIONAL) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-1.5">
            {t('registration.reasonTitle')}
          </label>
          <p className="text-xs text-slate-400 mb-4">
            {t('registration.reasonDesc')}
          </p>

          <textarea
            rows={3}
            placeholder={t('registration.reasonPlaceholder')}
            maxLength={MEMBER_FIELD_LIMITS.reason}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="glass-input w-full text-base sm:text-sm resize-none"
          />
        </div>

        {/* QUESTION 14: CODE OF CONDUCT (REQUIRED CHECKBOX) */}
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <label className="block text-sm sm:text-base font-bold text-white mb-3">
            {t('registration.codeOfConductTitle')} <span className="text-rose-500">*</span>
          </label>

          <label className={`${CHOICE_ROW_CLASS} items-start py-1`}>
            <input
              type="checkbox"
              required
              aria-invalid={errorField === 'codeOfConduct' || undefined}
              checked={formData.acceptedCodeOfConduct}
              onChange={(e) => {
                setFormData({ ...formData, acceptedCodeOfConduct: e.target.checked });
                haptic('selection');
              }}
              className="mt-0.5 w-5 h-5 shrink-0 rounded cursor-pointer"
            />
            <span className="text-sm text-slate-200 leading-relaxed">
              {t('registration.codeOfConductAgreement')}
            </span>
          </label>
        </div>

        {/* ACTION BUTTONS: a floating glass bar that stays above the bottom edge (and the iPhone home
            indicator) while the form is on screen. Sticky, not fixed: it settles into place after the
            last question. The wrapper ignores taps so only the glass bar itself is interactive. */}
        <div className="sticky bottom-0 z-20 pt-2 pb-[calc(0.75rem_+_var(--safe-bottom))] pointer-events-none">
          <div className="glass-pill pointer-events-auto rounded-[1.375rem] p-2 flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {errorMsg && (
                <motion.div
                  key="error"
                  role="alert"
                  {...fadeMotion}
                  className="relative isolate flex items-start gap-2 rounded-xl px-2 py-1 text-sm text-rose-200"
                >
                  <ErrorFlash pulse={errorPulse} />
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary pressable w-full min-h-12 px-6 text-base sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('registration.submittingText')}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('registration.submitButton')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleClearForm}
            className="pressable min-h-11 px-4 rounded-xl text-sm text-rose-300 hover:text-white hover:bg-rose-500/15 inline-flex items-center justify-center gap-1.5 font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('registration.clearForm')}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );

  // Both wrappers end at transform: none (opacity 1, y 0), and neither contains position: fixed children
  // (the sticky submit bar is sticky, the card modal lives in App)
  return (
    <AnimatePresence mode="wait" initial={false}>
      {submittedMember ? successView : formView}
    </AnimatePresence>
  );
};
