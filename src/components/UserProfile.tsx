import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User,
  Sparkles,
  IdCard,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  Save,
  Camera,
  Upload,
  Globe,
  ExternalLink,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import { Member } from '../types';
import { MAX_ADDITIONAL_PHONES, formatKccId, isLegacyKccId16 } from '../lib/idGenerator';
import { updateMemberProfileData } from '../lib/authService';
import { MEMBER_FIELD_LIMITS } from '../lib/firestoreService';
import { describeFirestoreError } from '../lib/firebase';
import { AVATAR_COMPRESS, compressImage } from '../lib/imageUtils';
import {
  getAllCountriesList,
  getStatesOfCountryByName,
  getCitiesOfStateByName,
  isCountryLoaded,
  resolveStateName,
  useWorldLocations,
} from '../lib/worldLocations';
import { useI18n } from '../i18n';
import type { LanguageCode, TranslationKey } from '../i18n';
import { SPRING, TWEEN, usePresenceMotion, useReducedMotion } from '../lib/motion';
import { haptic } from '../lib/haptic';
import { ErrorFlash } from './RegistrationForm';

// The avatar file input is visually hidden (sr-only, still focusable), so its label shows the focus ring
const FILE_PICKER_FOCUS_RING =
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[rgba(83,255,192,0.85)]';

// Select values that switch to a free-text province / city input (same values as RegistrationForm)
const CUSTOM_PROVINCE_OPTION = 'Kustom / Wilayah Lainnya';
const CUSTOM_CITY_OPTION = 'Kustom / Kota Lainnya';

// Option values are what gets saved to Firestore and are never translated; only labelKey is shown
interface LabeledOption {
  val: string;
  labelKey: TranslationKey;
}

// Same stored values as the RegistrationForm roles, with short labels for this dropdown
const OTHER_ROLE = 'Lainnya / Others';
const CUSTOM_ROLE_PATTERN = /^Lainnya \/ Others \((.*)\)$/;
const ROLE_OPTIONS: LabeledOption[] = [
  { val: 'Cosplayer / Crossplayer', labelKey: 'registration.roleCosplayer' },
  { val: 'Idol Fan / Wota (J-Pop, K-Pop, 48 Group, Chika Idol, VTuber)', labelKey: 'profile.roleIdolFan' },
  { val: 'Anime, Manga & Gaming Otaku (Penikmat anime, game & pop culture)', labelKey: 'profile.roleOtaku' },
  {
    val: 'Sahabat Umum / General Enthusiast (Penikmat umum, teman pendukung & penonton gathering)',
    labelKey: 'profile.roleGeneralEnthusiast',
  },
  { val: 'Prop Maker / Crafter / Pembuat Aksesori', labelKey: 'profile.rolePropMaker' },
  { val: 'Fotografer / Videografer Cosplay', labelKey: 'registration.rolePhotographer' },
  { val: 'Costume Maker / Seamstress / Wig Stylist', labelKey: 'profile.roleCostumeMaker' },
  { val: 'Event Crew, Stage Staff & Volunteer', labelKey: 'profile.roleEventCrew' },
  { val: 'Kreator Konten / Streamer', labelKey: 'registration.roleContentCreator' },
  { val: OTHER_ROLE, labelKey: 'registration.roleOthers' },
];

const AGE_CATEGORY_OPTIONS: LabeledOption[] = [
  { val: 'Legal Age / Dewasa (18+ tahun)', labelKey: 'registration.legalAge' },
  { val: 'Minor / Di Bawah Umur (<18 tahun)', labelKey: 'registration.minorAge' },
  { val: 'Memilih untuk tidak menyebutkan', labelKey: 'registration.preferNotToSay' },
];

// Extra WhatsApp numbers: phone2 + additionalPhones, edited as one list
const MAX_EXTRA_PHONES = 1 + MAX_ADDITIONAL_PHONES;
// Same minimum as the registration form's WhatsApp number
const MIN_PHONE_DIGITS = 8;

const phoneDigits = (value: string) => value.replace(/\D/g, '');

/** [phone2, ...additionalPhones] without empty entries (at most MAX_EXTRA_PHONES). */
function extraPhonesOf(member: Member): string[] {
  return [member.phone2, ...(member.additionalPhones || [])]
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .slice(0, MAX_EXTRA_PHONES);
}

interface UserProfileProps {
  member: Member;
  onUpdateMember: (updated: Member) => void;
  onOpenCardModal: (member: Member) => void;
  currentLang: LanguageCode; // Kept for App; the component reads the language from useI18n()
}

export const UserProfile: React.FC<UserProfileProps> = ({
  member,
  onUpdateMember,
  onOpenCardModal,
}) => {
  const { t, lang, intlLocale, countryName } = useI18n();

  const initialName = member.name || member.cosplayName || '';

  const [formData, setFormData] = useState({
    fullName: member.fullName || '',
    cosplayName: initialName,
    phone: member.phone || '',
    extraPhones: extraPhonesOf(member),
    discordUsername: member.discordUsername || '',
    ageCategory: member.ageCategory || 'Legal Age / Dewasa (18+ tahun)',
    age: member.age || '',
    country: member.country || 'Indonesia',
    province: member.province || 'DKI Jakarta',
    city: member.city || 'Jakarta Selatan',
    primaryRole: member.primaryRole || 'Cosplayer / Crossplayer',
    fandom: member.fandom || 'Anime & Games',
    experience: member.experience || '1 - 3 tahun',
    socialMedia: member.socialMedia || '',
    portfolioUrl: member.portfolioUrl || '',
    avatarUrl: member.avatarUrl || '',
    reason: member.reason || '',
  });

  const [copiedId, setCopiedId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Bumped on every failed save so the highlight behind the error replays (no shake)
  const [errorPulse, setErrorPulse] = useState(0);
  // Extra WhatsApp numbers: index -> inline error of that entry (too few digits); blocks the save
  const [extraPhoneErrors, setExtraPhoneErrors] = useState<Record<number, string>>({});

  // "Saved" chip: scale + fade pop; error line: plain fade (both opacity-only with reduced motion)
  const popMotion = usePresenceMotion('dialog');
  const fadeMotion = usePresenceMotion('overlay');
  const reducedMotion = useReducedMotion() === true;

  // Native `required` validation (name, WhatsApp) stops the save before handleSave runs: same error haptic
  // as a failed save, once per attempt (`invalid` fires per field and does not bubble, hence capture)
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

  // Sync state if member changes externally
  useEffect(() => {
    const currentName = member.name || member.cosplayName || '';
    setFormData({
      fullName: member.fullName || '',
      cosplayName: currentName,
      phone: member.phone || '',
      extraPhones: extraPhonesOf(member),
      discordUsername: member.discordUsername || '',
      ageCategory: member.ageCategory || 'Legal Age / Dewasa (18+ tahun)',
      age: member.age || '',
      country: member.country || 'Indonesia',
      province: member.province || 'DKI Jakarta',
      city: member.city || 'Jakarta Selatan',
      primaryRole: member.primaryRole || 'Cosplayer / Crossplayer',
      fandom: member.fandom || 'Anime & Games',
      experience: member.experience || '1 - 3 tahun',
      socialMedia: member.socialMedia || '',
      portfolioUrl: member.portfolioUrl || '',
      avatarUrl: member.avatarUrl || '',
      reason: member.reason || '',
    });
    setExtraPhoneErrors({});
  }, [member]);

  // ---- Extra WhatsApp numbers (list editor) ----
  const extraPhoneInputs = useRef<Array<HTMLInputElement | null>>([]);
  const focusExtraPhoneRef = useRef<number | null>(null);

  useEffect(() => {
    const index = focusExtraPhoneRef.current;
    if (index === null) return;
    focusExtraPhoneRef.current = null;
    extraPhoneInputs.current[index]?.focus();
  });

  const addExtraPhone = () => {
    if (formData.extraPhones.length >= MAX_EXTRA_PHONES) return;
    focusExtraPhoneRef.current = formData.extraPhones.length;
    setFormData((prev) => ({ ...prev, extraPhones: [...prev.extraPhones, ''] }));
    haptic('selection');
  };

  const updateExtraPhone = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      extraPhones: prev.extraPhones.map((p, i) => (i === index ? value : p)),
    }));
    if (extraPhoneErrors[index]) {
      setExtraPhoneErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const removeExtraPhone = (index: number) => {
    setFormData((prev) => ({ ...prev, extraPhones: prev.extraPhones.filter((_, i) => i !== index) }));
    // Entries after the removed one move up: re-index their errors
    setExtraPhoneErrors((prev) => {
      const next: Record<number, string> = {};
      for (const [key, message] of Object.entries(prev)) {
        const i = Number(key);
        if (i < index) next[i] = message;
        else if (i > index) next[i - 1] = message;
      }
      return next;
    });
    haptic('selection');
  };

  // Complete list of all 250 countries and dynamic state/cities (loaded on demand per country)
  const geoVersion = useWorldLocations(formData.country);
  const countryReady = isCountryLoaded(formData.country);
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
  const availableCities = useMemo(
    () => getCitiesOfStateByName(formData.country, formData.province),
    [formData.country, formData.province, geoVersion]
  );

  // "Kustom" modes are tracked apart from the value, so the free-text inputs stay visible while typing
  // (before, the input vanished after the first keystroke because the value stopped matching the option).
  const [isCustomProvince, setIsCustomProvince] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);
  // Once the member's country is loaded: a legacy province spelling is mapped to the official name
  // (e.g. "Jakarta" -> "DKI Jakarta"), and a saved province / city that is not in the lists (typed earlier)
  // opens in custom mode. Runs once per member.
  const customModeMemberRef = useRef<string | null>(null);
  useEffect(() => {
    if (!countryReady || customModeMemberRef.current === member.id) return;
    customModeMemberRef.current = member.id;
    const canonicalProvince = formData.province ? resolveStateName(formData.country, formData.province) : null;
    if (canonicalProvince && canonicalProvince !== formData.province) {
      setFormData((prev) => ({ ...prev, province: canonicalProvince }));
    }
    const customProvince = !!formData.province && !canonicalProvince;
    const cities = customProvince ? [] : getCitiesOfStateByName(formData.country, canonicalProvince || formData.province);
    setIsCustomProvince(customProvince);
    setIsCustomCity(customProvince || (!!formData.city && !cities.includes(formData.city)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id, countryReady]);

  // After a country change made before its locations loaded, pick the first province / city once they arrive
  useEffect(() => {
    if (isCustomProvince || !countryReady) return;
    if (!formData.province && availableProvinces.length > 0) {
      const firstProv = availableProvinces[0].name;
      const cities = getCitiesOfStateByName(formData.country, firstProv);
      setFormData((prev) => ({ ...prev, province: firstProv, city: cities[0] || '' }));
    } else if (!isCustomCity && !formData.city && availableCities.length > 0) {
      setFormData((prev) => ({ ...prev, city: availableCities[0] }));
    }
  }, [countryReady, availableProvinces, availableCities, isCustomProvince, isCustomCity, formData.country, formData.province, formData.city]);

  const handleCopyUserId = () => {
    if (!member.userId16) return;
    // The formatted ID ('0000 0101'), as it is shown and typed in the lookup
    navigator.clipboard
      .writeText(formatKccId(member.userId16))
      .then(() => {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      })
      .catch((err) => console.warn('Copy failed:', err));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert(t('registration.avatarTooLarge', { maxMb: 10 }));
      return;
    }
    try {
      // 256 px WebP/JPEG ~0.75 (~10-15 KB): every public card lookup downloads this avatar
      const compressed = await compressImage(file, AVATAR_COMPRESS);
      setFormData((prev) => ({ ...prev, avatarUrl: compressed }));
    } catch (err) {
      console.error('Failed to compress avatar:', err);
      alert(t('registration.photoProcessFailed'));
    }
  };

  // Role badge: the label of a known role, the typed text of a custom role, else the stored value as is
  const knownRole = ROLE_OPTIONS.find((r) => r.val === formData.primaryRole);
  const roleBadge = knownRole
    ? t(knownRole.labelKey)
    : formData.primaryRole.replace(CUSTOM_ROLE_PATTERN, '$1');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Extra numbers: trimmed; empty entries dropped; too short -> inline error (save blocked); duplicates of
    // the primary number or of an earlier entry dropped (digits compared).
    const tooShort: Record<number, string> = {};
    formData.extraPhones.forEach((raw, index) => {
      const value = raw.trim();
      if (value && phoneDigits(value).length < MIN_PHONE_DIGITS) {
        tooShort[index] = t('profile.extraPhoneTooShort', { minDigits: MIN_PHONE_DIGITS });
      }
    });
    setExtraPhoneErrors(tooShort);
    const firstInvalid = Object.keys(tooShort).map(Number).sort((a, b) => a - b)[0];
    if (firstInvalid !== undefined) {
      extraPhoneInputs.current[firstInvalid]?.focus();
      haptic('error');
      return;
    }
    const seenDigits = new Set<string>([phoneDigits(formData.phone)]);
    const extraPhones: string[] = [];
    for (const raw of formData.extraPhones) {
      const value = raw.trim().slice(0, MEMBER_FIELD_LIMITS.phone);
      const digits = phoneDigits(value);
      if (!value || seenDigits.has(digits)) continue;
      seenDigits.add(digits);
      extraPhones.push(value);
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      const { extraPhones: _list, ...fields } = formData;
      // Always sent, so removing every extra number saves phone2 '' and additionalPhones []
      const dataToSave: Partial<Member> = {
        ...fields,
        name: formData.cosplayName,
        cosplayName: formData.cosplayName,
        phone2: extraPhones[0] ?? '',
        additionalPhones: extraPhones.slice(1),
      };
      const updated = await updateMemberProfileData(member, dataToSave);
      onUpdateMember(updated);
      setSaveSuccess(true);
      haptic('success');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Update profile error:', err);
      setErrorMsg(describeFirestoreError(err, lang === 'id'));
      setErrorPulse((n) => n + 1);
      haptic('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-fade-in text-slate-100">
      {/* Top Profile Hero */}
      <div className="glass-card glass-raised rounded-3xl p-5 sm:p-8 mb-8 relative overflow-hidden">
        {/* Soft rose glow: a radial gradient instead of a blur filter (no offscreen blur pass) */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[radial-gradient(closest-side,rgba(244,63,94,0.14),rgba(244,63,94,0))] pointer-events-none"></div>

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with edit badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-slate-950 border-2 border-rose-500/50 shadow-xl">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.cosplayName}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-rose-900 to-slate-900 text-rose-300 font-black text-3xl">
                  {formData.cosplayName[0]?.toUpperCase() || 'KC'}
                </div>
              )}
            </div>

            <label
              title={t('profile.changeAvatar')}
              className={`glass-icon-button pressable absolute -bottom-2 -right-2 bg-rose-600 hover:bg-rose-500 border-rose-300/40 text-white ${FILE_PICKER_FOCUS_RING}`}
            >
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                aria-label={t('profile.changeAvatar')}
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Member Identity & KCC ID */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="glass-chip max-w-full whitespace-normal leading-tight font-bold bg-rose-500/20 text-rose-300 border-rose-500/30">
                {roleBadge}
              </span>
              <span className="glass-chip bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('profile.verifiedActive')}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formData.cosplayName}
            </h1>
            {member.email && <p className="text-xs text-slate-500 mt-0.5">{member.email}</p>}

            {/* KCC ID BOX (8 digits; 16 before the 8-digit switch) */}
            <div className="glass-well mt-4 inline-flex items-center gap-3 border-rose-500/30 rounded-2xl ps-4 pe-2 py-2">
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  {t('profile.kccIdLabel')}
                </span>
                <span className="font-mono font-black text-sm sm:text-base text-rose-400 tracking-wider">
                  {formatKccId(member.userId16)}
                </span>
                {isLegacyKccId16(member.legacyUserId16) && member.legacyUserId16 !== member.userId16 && (
                  <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                    {t('profile.oldKccId', { id: formatKccId(member.legacyUserId16) })}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyUserId}
                className="glass-icon-button pressable text-slate-300"
                title={t('profile.copyKccId')}
                aria-label={t('profile.copyKccId')}
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick action button to view KTA */}
          <div className="shrink-0 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onOpenCardModal(member)}
              className="btn-primary pressable px-4"
            >
              <IdCard className="w-4 h-4" />
              <span>{t('profile.viewIdCard')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form (Real-Time Editable). Fields keep a bottom scroll margin so a field scrolled into
          view on focus is not hidden behind the sticky save bar. */}
      <form
        ref={attachInvalidHaptic}
        onSubmit={handleSave}
        className="space-y-6 [&_input]:scroll-mb-28 [&_select]:scroll-mb-28 [&_textarea]:scroll-mb-28"
      >
        <div className="glass-card rounded-3xl p-5 sm:p-8">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 mb-6">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white">{t('profile.infoTitle')}</h2>
              <p className="text-xs text-slate-400">
                {t('profile.infoDesc')}
              </p>
            </div>

            <AnimatePresence initial={false}>
              {saveSuccess && (
                <motion.span
                  key="saved"
                  {...popMotion}
                  className="glass-chip shrink-0 font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('profile.savedRealtime')}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nama (Name / Cosname / Alias) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('registration.nameLabel')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={MEMBER_FIELD_LIMITS.cosplayName}
                value={formData.cosplayName}
                onChange={(e) => setFormData({ ...formData, cosplayName: e.target.value })}
                className="glass-input w-full text-base sm:text-sm font-semibold"
              />
            </div>

            {/* Kategori Usia */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('profile.ageCategoryLabel')}
              </label>
              <select
                value={formData.ageCategory}
                onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value })}
                className="glass-input w-full text-base sm:text-sm"
              >
                {AGE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.val} value={opt.val}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Usia Pasti */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('profile.ageLabel')}
              </label>
              <input
                type="text"
                placeholder={t('profile.agePlaceholder')}
                maxLength={MEMBER_FIELD_LIMITS.age}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="glass-input w-full text-base sm:text-sm"
              />
            </div>

            {/* WhatsApp (Wajib) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('profile.whatsappLabel')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+62 812..."
                maxLength={MEMBER_FIELD_LIMITS.phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="glass-input w-full text-base sm:text-sm font-mono"
              />
            </div>

            {/* Extra WhatsApp numbers (optional, up to 4): saved as phone2 + additionalPhones */}
            <fieldset className="md:col-span-2 min-w-0">
              <legend className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                {t('profile.extraPhonesLabel')}{' '}
                <span className="text-slate-500 font-normal normal-case">{t('registration.optionalTag')}</span>
              </legend>
              <p className="text-[11px] text-slate-400 mb-2">{t('profile.extraPhonesHint')}</p>
              <div className="space-y-2">
                {formData.extraPhones.map((value, index) => {
                  const error = extraPhoneErrors[index];
                  const errorId = `extra-phone-error-${index}`;
                  return (
                    <div key={index}>
                      <div className="flex items-center gap-2">
                        <input
                          ref={(el) => {
                            extraPhoneInputs.current[index] = el;
                          }}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder={t('profile.backupPhonePlaceholder')}
                          aria-label={`${t('profile.extraPhonesLabel')} ${index + 1}`}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={error ? errorId : undefined}
                          maxLength={MEMBER_FIELD_LIMITS.phone}
                          value={value}
                          onChange={(e) => updateExtraPhone(index, e.target.value)}
                          className="glass-input flex-1 min-w-0 text-base sm:text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => removeExtraPhone(index)}
                          title={t('profile.removeExtraPhone')}
                          aria-label={t('profile.removeExtraPhone')}
                          className="glass-icon-button pressable shrink-0 w-11 h-11 text-slate-300 hover:text-rose-300"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      {error && (
                        <p id={errorId} className="text-xs text-rose-400 mt-1 px-1" role="alert">
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {formData.extraPhones.length < MAX_EXTRA_PHONES && (
                <button
                  type="button"
                  onClick={addExtraPhone}
                  className="glass-button pressable w-full sm:w-auto min-h-11 mt-2 px-4 rounded-xl text-sm text-emerald-300"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>{t('profile.addExtraPhone')}</span>
                </button>
              )}
            </fieldset>

            {/* Username Discord */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('registration.discordLabel')}
              </label>
              <input
                type="text"
                placeholder={t('profile.discordPlaceholder')}
                maxLength={MEMBER_FIELD_LIMITS.discordUsername}
                value={formData.discordUsername}
                onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
                className="glass-input w-full text-base sm:text-sm font-mono"
              />
            </div>

            {/* Peran Utama */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('profile.roleLabel')}
              </label>
              <select
                value={formData.primaryRole}
                onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })}
                className="glass-input w-full text-base sm:text-sm"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.val} value={role.val}>
                    {t(role.labelKey)}
                  </option>
                ))}
              </select>
              {formData.primaryRole.includes('Lainnya') && (
                <input
                  type="text"
                  placeholder={t('profile.customRolePlaceholder')}
                  maxLength={MEMBER_FIELD_LIMITS.customRole}
                  value={formData.primaryRole === OTHER_ROLE ? '' : formData.primaryRole.replace(CUSTOM_ROLE_PATTERN, '$1')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryRole: e.target.value.trim()
                        ? `${OTHER_ROLE} (${e.target.value.trim()})`
                        : OTHER_ROLE,
                    })
                  }
                  className="glass-input mt-2 w-full text-base sm:text-sm"
                />
              )}
            </div>

            {/* Negera (Country) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('registration.countryLabel')}
              </label>
              <select
                value={formData.country}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  const provs = getStatesOfCountryByName(newCountry);
                  const firstProv = provs[0]?.name || '';
                  const cities = getCitiesOfStateByName(newCountry, firstProv);
                  setIsCustomProvince(false);
                  setIsCustomCity(false);
                  setFormData({
                    ...formData,
                    country: newCountry,
                    province: firstProv,
                    city: cities[0] || '',
                  });
                }}
                className="glass-input w-full text-base sm:text-sm"
              >
                {countryOptionElements}
              </select>
            </div>

            {/* Provinsi / State */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('registration.provinceLabel')}
              </label>
              <div className="space-y-1.5">
                <select
                  value={isCustomProvince ? CUSTOM_PROVINCE_OPTION : formData.province}
                  onChange={(e) => {
                    const newProv = e.target.value;
                    if (newProv === CUSTOM_PROVINCE_OPTION) {
                      // A typed province has no city list: the city is typed as well
                      setIsCustomProvince(true);
                      setIsCustomCity(true);
                      setFormData({ ...formData, province: '', city: '' });
                      return;
                    }
                    const cities = getCitiesOfStateByName(formData.country, newProv);
                    setIsCustomProvince(false);
                    setIsCustomCity(false);
                    setFormData({
                      ...formData,
                      province: newProv,
                      city: cities[0] || '',
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

                {isCustomProvince && (
                  <input
                    type="text"
                    placeholder={t('registration.customProvincePlaceholder')}
                    maxLength={MEMBER_FIELD_LIMITS.province}
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="glass-input w-full text-base sm:text-sm"
                  />
                )}
              </div>
            </div>

            {/* Kota / Kabupaten / City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('registration.cityLabel')}
              </label>
              <div className="space-y-1.5">
                {!isCustomProvince && (
                  <select
                    value={isCustomCity ? CUSTOM_CITY_OPTION : formData.city}
                    onChange={(e) => {
                      if (e.target.value === CUSTOM_CITY_OPTION) {
                        setIsCustomCity(true);
                        setFormData({ ...formData, city: '' });
                        return;
                      }
                      setIsCustomCity(false);
                      setFormData({ ...formData, city: e.target.value });
                    }}
                    className="glass-input w-full text-base sm:text-sm"
                  >
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value={CUSTOM_CITY_OPTION}>{t('registration.customCityOption')}</option>
                  </select>
                )}

                {(isCustomCity || isCustomProvince) && (
                  <input
                    type="text"
                    placeholder={t('registration.customCityPlaceholder')}
                    maxLength={MEMBER_FIELD_LIMITS.city}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="glass-input w-full text-base sm:text-sm"
                  />
                )}
              </div>
            </div>

            {/* Fandom */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('registration.fandomTitle')}
              </label>
              <input
                type="text"
                maxLength={MEMBER_FIELD_LIMITS.fandom}
                value={formData.fandom}
                onChange={(e) => setFormData({ ...formData, fandom: e.target.value })}
                className="glass-input w-full text-base sm:text-sm"
              />
            </div>

            {/* Media Sosial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('registration.socialMediaTitle')}
              </label>
              <input
                type="text"
                placeholder={t('profile.socialMediaPlaceholder')}
                maxLength={MEMBER_FIELD_LIMITS.socialMedia}
                value={formData.socialMedia}
                onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                className="glass-input w-full text-base sm:text-sm"
              />
            </div>

            {/* Link Portofolio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('registration.portfolioTitle')}
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                maxLength={MEMBER_FIELD_LIMITS.portfolioUrl}
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="glass-input w-full text-base sm:text-sm"
              />
            </div>
          </div>

          {/* Bio / Reason */}
          <div className="mt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {t('profile.reasonLabel')}
            </label>
            <textarea
              rows={3}
              maxLength={MEMBER_FIELD_LIMITS.reason}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="glass-input w-full text-base sm:text-sm resize-none"
            ></textarea>
          </div>

          {/* Save bar: floats above the bottom edge (and the iPhone home indicator) while the card is on
              screen, so the profile can be saved from any field. Sticky, not fixed: it settles under the
              last field. The wrapper ignores taps so only the glass bar itself is interactive. */}
          <div className="sticky bottom-0 z-20 mt-6 pt-2 pb-[calc(0.75rem_+_var(--safe-bottom))] pointer-events-none sm:flex sm:justify-end">
            <div className="glass-pill pointer-events-auto rounded-[1.375rem] p-2 flex flex-col gap-2 sm:max-w-md">
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
                disabled={isSaving}
                className="btn-primary pressable w-full min-h-12 px-6 text-base sm:min-h-11 sm:w-auto sm:self-end sm:text-sm"
              >
                {/* The label stays while saving (only the icon swaps), so the button never changes width.
                    Each swap remounts the 16px icon box: the spinner / check pop in, the idle icon fades
                    back (reduced motion: fades only). */}
                <motion.span
                  key={isSaving ? 'saving' : saveSuccess ? 'saved' : 'idle'}
                  className="inline-flex shrink-0"
                  initial={reducedMotion || (!isSaving && !saveSuccess) ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={reducedMotion ? TWEEN.reducedIn : SPRING.press}
                >
                  {isSaving ? (
                    <span className="block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </motion.span>
                <span>{t('profile.updateProfile')}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
