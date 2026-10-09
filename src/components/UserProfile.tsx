import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { Member } from '../types';
import { format16DigitUserId } from '../lib/idGenerator';
import { updateMemberProfileData } from '../lib/authService';
import {
  getAllCountriesList,
  getStatesOfCountryByName,
  getCitiesOfStateByName,
} from '../lib/worldLocations';
import { LanguageCode, TRANSLATIONS } from '../lib/i18n';

interface UserProfileProps {
  member: Member;
  onUpdateMember: (updated: Member) => void;
  onOpenCardModal: (member: Member) => void;
  currentLang: LanguageCode;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  member,
  onUpdateMember,
  onOpenCardModal,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.id;

  const initialName = member.name || member.cosplayName || '';

  const [formData, setFormData] = useState({
    fullName: member.fullName || '',
    cosplayName: initialName,
    phone: member.phone || '',
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

  // Sync state if member changes externally
  useEffect(() => {
    const currentName = member.name || member.cosplayName || '';
    setFormData({
      fullName: member.fullName || '',
      cosplayName: currentName,
      phone: member.phone || '',
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
  }, [member]);

  // Complete list of all 250 countries and dynamic state/cities
  const allCountries = useMemo(() => getAllCountriesList(), []);
  const availableProvinces = useMemo(
    () => getStatesOfCountryByName(formData.country),
    [formData.country]
  );
  const availableCities = useMemo(
    () => getCitiesOfStateByName(formData.country, formData.province),
    [formData.country, formData.province]
  );

  const handleCopyUserId = () => {
    if (member.userId16) {
      navigator.clipboard.writeText(member.userId16);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      const dataToSave = {
        ...formData,
        name: formData.cosplayName,
        cosplayName: formData.cosplayName,
      };
      await updateMemberProfileData(member.id, dataToSave);
      const updated: Member = {
        ...member,
        ...dataToSave,
      };
      onUpdateMember(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Update profile error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memperbarui data profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-fade-in text-slate-100">
      {/* Top Profile Hero */}
      <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with edit badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-slate-950 border-2 border-rose-500/50 shadow-xl">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.cosplayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-rose-900 to-slate-900 text-rose-300 font-black text-3xl">
                  {formData.cosplayName[0]?.toUpperCase() || 'KC'}
                </div>
              )}
            </div>

            <label className="absolute -bottom-2 -right-2 p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-110">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Member Identity & 16-Digit Card */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {formData.primaryRole}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terverifikasi Aktif</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formData.cosplayName}
            </h1>
            {member.email && <p className="text-xs text-slate-500 mt-0.5">{member.email}</p>}

            {/* KCC ID (16 DIGIT) BOX */}
            <div className="mt-4 inline-flex items-center space-x-3 bg-slate-950/90 border border-rose-500/30 rounded-2xl px-4 py-2.5 shadow-inner">
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  KCC ID (16 DIGIT)
                </span>
                <span className="font-mono font-black text-sm sm:text-base text-rose-400 tracking-wider">
                  {format16DigitUserId(member.userId16, member.email)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyUserId}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Salin KCC ID"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick action button to view KTA */}
          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => onOpenCardModal(member)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 inline-flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <IdCard className="w-3.5 h-3.5" />
              <span>View Member's ID Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form (Real-Time Editable) */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Informasi Profil Anggota</h2>
              <p className="text-xs text-slate-400">
                Data ini dapat kamu ubah kapan saja dan tersimpan secara real-time ke database MyKCC
              </p>
            </div>

            {saveSuccess && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/40 flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tersimpan Real-Time!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nama (Name / Cosname / Alias) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nama (Name / Cosname / Alias) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.cosplayName}
                onChange={(e) => setFormData({ ...formData, cosplayName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Kategori Usia */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Kategori Usia
              </label>
              <select
                value={formData.ageCategory}
                onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="Legal Age / Dewasa (18+ tahun)">Legal Age / Dewasa (18+ tahun)</option>
                <option value="Minor / Di Bawah Umur (<18 tahun)">Minor / Di Bawah Umur (&lt;18 tahun)</option>
                <option value="Memilih untuk tidak menyebutkan">Memilih untuk tidak menyebutkan</option>
              </select>
            </div>

            {/* Usia Pasti */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Usia / Tanggal Lahir (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 21 tahun atau 15 Mei"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* WhatsApp (Wajib) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+62 812..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Username Discord */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username Discord
              </label>
              <input
                type="text"
                placeholder="Contoh: alyachan_cos atau user#0001"
                value={formData.discordUsername}
                onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Peran Utama */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Peran Utama di Komunitas
              </label>
              <select
                value={formData.primaryRole}
                onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="Cosplayer / Crossplayer">Cosplayer / Crossplayer</option>
                <option value="Idol Fan / Wota (J-Pop, K-Pop, 48 Group, Chika Idol, VTuber)">Idol Fan / Wota</option>
                <option value="Anime, Manga & Gaming Otaku (Penikmat anime, game & pop culture)">Anime, Manga & Gaming Otaku</option>
                <option value="Sahabat Umum / General Enthusiast (Penikmat umum, teman pendukung & penonton gathering)">Sahabat Umum / General Enthusiast</option>
                <option value="Prop Maker / Crafter / Pembuat Aksesori">Prop Maker / Crafter</option>
                <option value="Fotografer / Videografer Cosplay">Fotografer / Videografer Cosplay</option>
                <option value="Costume Maker / Seamstress / Wig Stylist">Costume Maker / Seamstress</option>
                <option value="Event Crew, Stage Staff & Volunteer">Event Crew & Staff</option>
                <option value="Kreator Konten / Streamer">Kreator Konten / Streamer</option>
                <option value="Lainnya / Others">Lainnya / Others (Peran Lainnya)</option>
              </select>
              {formData.primaryRole.includes('Lainnya') && (
                <input
                  type="text"
                  placeholder="Ketik peran / spesialisasi Anda lainnya..."
                  value={formData.primaryRole === 'Lainnya / Others' ? '' : formData.primaryRole.replace(/^Lainnya \/ Others \((.*)\)$/, '$1')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryRole: e.target.value.trim()
                        ? `Lainnya / Others (${e.target.value.trim()})`
                        : 'Lainnya / Others',
                    })
                  }
                  className="mt-2 w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              )}
            </div>

            {/* Negera (Country) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Negara (Country)
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
                  });
                }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              >
                {allCountries.map((c) => (
                  <option key={c.isoCode} value={c.name}>
                    {c.flag} {c.name} ({c.isoCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Provinsi / State */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Provinsi / State / Prefecture
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
                  });
                }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              >
                {availableProvinces.map((p) => (
                  <option key={p.isoCode || p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value="Kustom / Wilayah Lainnya">Kustom / Wilayah Lainnya</option>
              </select>
            </div>

            {/* Kota / Kabupaten / City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Kota / Kabupaten / County
              </label>
              <div className="space-y-1.5">
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
                >
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                  <option value="Kustom / Kota Lainnya">Kustom / Kota Lainnya</option>
                </select>

                {formData.city === 'Kustom / Kota Lainnya' && (
                  <input
                    type="text"
                    placeholder="Ketik nama kota atau wilayah Anda"
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                )}
              </div>
            </div>

            {/* Fandom */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Fandom / Seri Anime & Game
              </label>
              <input
                type="text"
                value={formData.fandom}
                onChange={(e) => setFormData({ ...formData, fandom: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Media Sosial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Akun Media Sosial
              </label>
              <input
                type="text"
                placeholder="@username (Instagram / X / TikTok)"
                value={formData.socialMedia}
                onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Link Portofolio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Link Portofolio / Google Drive
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Bio / Reason */}
          <div className="mt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Alasan Bergabung & Catatan Profil
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
            ></textarea>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 inline-flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.updateProfile}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
