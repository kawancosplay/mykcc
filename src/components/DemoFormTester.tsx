import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  Shield,
  Crown,
  Wrench,
  Camera,
  CopyCheck,
  Dices,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Member } from '../types';

export interface DemoFormPreset {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  expectedUidType: string;
  icon: React.ReactNode;
  data: {
    cosplayName: string;
    fullName: string;
    email: string;
    phone: string;
    discordUsername: string;
    ageCategory: string;
    age: string;
    country: string;
    province: string;
    city: string;
    primaryRole: string;
    customRole?: string;
    fandom: string;
    experience: string;
    socialMedia: string;
    portfolioUrl: string;
    reason: string;
    acceptedCodeOfConduct: boolean;
  };
}

interface DemoFormTesterProps {
  onFillDemo: (data: DemoFormPreset['data'], autoSubmit?: boolean) => void;
  existingMembers: Member[];
  isId: boolean;
}

export const DemoFormTester: React.FC<DemoFormTesterProps> = ({
  onFillDemo,
  existingMembers,
  isId,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [lastFilledPreset, setLastFilledPreset] = useState<string | null>(null);

  const presets: DemoFormPreset[] = [
    {
      id: 'cosplayer_timestamp',
      name: isId ? 'Demo Cosplayer (Timestamp UID)' : 'Demo Cosplayer (Timestamp UID)',
      badge: 'Timestamp UID',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      expectedUidType: isId
        ? 'UID 16-digit diatur berdasar tanggal & jam submit (YYYYMMDDHHmmssSeq)'
        : '16-digit UID arranged by submission timestamp (YYYYMMDDHHmmssSeq)',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      data: {
        cosplayName: 'Yukari_Cos / Aoi',
        fullName: 'Aoi Yukari Pratama',
        email: 'yukari.test@gmail.com',
        phone: '081298765431',
        discordUsername: 'yukari_cos#1234',
        ageCategory: 'Legal Age / Dewasa (18+ tahun)',
        age: '22',
        country: 'Indonesia',
        province: 'Jawa Barat',
        city: 'Kota Bandung',
        primaryRole: 'Cosplayer / Crossplayer',
        fandom: 'HoYoverse (Genshin Impact, Honkai: Star Rail, ZZZ)',
        experience: '1 - 3 tahun',
        socialMedia: '@yukari.cosplay',
        portfolioUrl: 'https://instagram.com/yukari.cosplay',
        reason: 'Uji coba pendaftaran demo member reguler dengan User ID berbasis timestamp terurut.',
        acceptedCodeOfConduct: true,
      },
    },
    {
      id: 'kcc_admin',
      name: isId ? 'Demo KCC Admin (UID 0001-0100)' : 'Demo KCC Admin (UID 0001-0100)',
      badge: 'Admin UID Range',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      expectedUidType: isId
        ? 'UID 0000 0000 0000 0001 s/d 0000 0000 0000 0100 khusus KCC Admin'
        : 'UID 0000 0000 0000 0001 to 0000 0000 0000 0100 for KCC Admin',
      icon: <Shield className="w-4 h-4 text-rose-400" />,
      data: {
        cosplayName: 'Admin_KCC_Staff',
        fullName: 'Admin KawanCosplay Regional',
        email: 'admin.staff@kawancosplay.org',
        phone: '085711032782',
        discordUsername: 'kcc_admin_staff',
        ageCategory: 'Legal Age / Dewasa (18+ tahun)',
        age: '25',
        country: 'Indonesia',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        primaryRole: 'KCC Admin & Staff Komunitas',
        fandom: 'Anime, Pop Culture & Event Organizer',
        experience: '> 3 tahun',
        socialMedia: '@kawancosplay.staff',
        portfolioUrl: 'https://kawancosplay.org/staff',
        reason: 'Uji coba pendaftaran KCC Admin untuk slot UID terverifikasi 0000 0000 0000 0001 - 0100.',
        acceptedCodeOfConduct: true,
      },
    },
    {
      id: 'main_account',
      name: isId ? 'Demo KCC Main Account (UID 0000)' : 'Demo KCC Main Account (UID 0000)',
      badge: '0000 0000 0000 0000',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      expectedUidType: isId
        ? 'UID 0000 0000 0000 0000 khusus akun utama cosplaysehat@gmail.com'
        : 'UID 0000 0000 0000 0000 strictly for main account cosplaysehat@gmail.com',
      icon: <Crown className="w-4 h-4 text-amber-400" />,
      data: {
        cosplayName: 'KCC Leader / Ken',
        fullName: 'Rian Ken Pratama',
        email: 'cosplaysehat@gmail.com',
        phone: '081298765432',
        discordUsername: 'kcc_founder#0001',
        ageCategory: 'Legal Age / Dewasa (18+ tahun)',
        age: '24',
        country: 'Indonesia',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        primaryRole: 'KCC Main Account & Community Leader',
        fandom: 'Genshin Impact, VTuber & Tokusatsu',
        experience: '> 3 tahun',
        socialMedia: '@rian_cosplays',
        portfolioUrl: 'https://instagram.com/rian_cosplays',
        reason: 'Uji coba pendaftaran akun utama KCC ID 0000 0000 0000 0000.',
        acceptedCodeOfConduct: true,
      },
    },
    {
      id: 'prop_maker',
      name: isId ? 'Demo Prop Maker / Crafter' : 'Demo Prop Maker / Crafter',
      badge: 'Crafter (Timestamp)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      expectedUidType: isId
        ? 'Pengrajin kostum / prop dengan UID berbasis timestamp'
        : 'Prop & armor artisan with timestamp-based UID',
      icon: <Wrench className="w-4 h-4 text-emerald-400" />,
      data: {
        cosplayName: 'Vulcan Props Studio',
        fullName: 'Dimas Vulcan',
        email: 'vulcan.crafts@gmail.com',
        phone: '081399887766',
        discordUsername: 'vulcan_3dprops',
        ageCategory: 'Legal Age / Dewasa (18+ tahun)',
        age: '27',
        country: 'Indonesia',
        province: 'Jawa Timur',
        city: 'Kota Surabaya',
        primaryRole: 'Prop Maker / Crafter / Pembuat Aksesori',
        fandom: 'Monster Hunter, Elden Ring & Kamen Rider',
        experience: 'Veteran (> 3 tahun)',
        socialMedia: '@vulcan.crafts',
        portfolioUrl: 'https://artstation.com/vulcancrafts',
        reason: 'Berbagi ilmu crafting senjata EVA Foam 3D dan ikut gathering KCC.',
        acceptedCodeOfConduct: true,
      },
    },
    {
      id: 'photographer',
      name: isId ? 'Demo Fotografer Cosplay' : 'Demo Cosplay Photographer',
      badge: 'Photographer',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      expectedUidType: isId
        ? 'Fotografer & videografer dengan UID berbasis timestamp'
        : 'Photographer & videographer with timestamp-based UID',
      icon: <Camera className="w-4 h-4 text-pink-400" />,
      data: {
        cosplayName: 'ShutterLens_ID',
        fullName: 'Cindy Shutter',
        email: 'shutterlens.id@gmail.com',
        phone: '082155443322',
        discordUsername: 'shutterlens_id',
        ageCategory: 'Legal Age / Dewasa (18+ tahun)',
        age: '23',
        country: 'Indonesia',
        province: 'D.I. Yogyakarta',
        city: 'Kota Yogyakarta',
        primaryRole: 'Fotografer / Videografer Cosplay',
        fandom: 'Hololive, VTuber & Anime Romcom',
        experience: '1 - 3 tahun',
        socialMedia: '@shutterlens.art',
        portfolioUrl: 'https://drive.google.com/drive/folders/demo-shots',
        reason: 'Mencari partner cosplayer untuk photoshoot outdoor di gathering komunitas.',
        acceptedCodeOfConduct: true,
      },
    },
    {
      id: 'others_role',
      name: isId ? 'Demo Peran Lainnya / Others' : 'Demo Others / Custom Role',
      badge: 'Others Role',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      expectedUidType: isId
        ? 'Peran kustom "Lainnya / Others" dengan spesialisasi Makeup & Wig Stylist'
        : 'Custom role "Others" with specialized Cosplay Makeup & Wig Stylist',
      icon: <Sparkles className="w-4 h-4 text-violet-400" />,
      data: {
        cosplayName: 'Miyu_MakeArt',
        fullName: 'Miyu Artistry',
        email: 'miyu.makeup@gmail.com',
        phone: '081377889900',
        discordUsername: 'miyu_makeup#5678',
        ageCategory: 'Legal Age / Dewasa (18+ tahun)',
        age: '24',
        country: 'Indonesia',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        primaryRole: 'Lainnya / Others',
        customRole: 'Cosplay Makeup Artist & Wig Stylist',
        fandom: 'Genshin Impact, Honkai: Star Rail & V-Tuber',
        experience: '1 - 3 tahun',
        socialMedia: '@miyu.makeart',
        portfolioUrl: 'https://instagram.com/miyu.makeart',
        reason: 'Menawarkan jasa makeup & styling wig untuk cosplayer di gathering KCC.',
        acceptedCodeOfConduct: true,
      },
    },
  ];

  // If there are existing members, add a single KCC ID duplicate test
  const existingWithPhone = existingMembers.find((m) => m.phone);
  if (existingWithPhone) {
    presets.push({
      id: 'duplicate_test',
      name: isId
        ? `Uji Akun Tunggal (Duplikat: ${existingWithPhone.cosplayName})`
        : `Single KCC ID Test (Match: ${existingWithPhone.cosplayName})`,
      badge: 'Single KCC ID Check',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      expectedUidType: isId
        ? `Memverifikasi nomor WA sama mempertahankan KCC ID: ${existingWithPhone.userId16}`
        : `Verifies matching WhatsApp maintains KCC ID: ${existingWithPhone.userId16}`,
      icon: <CopyCheck className="w-4 h-4 text-cyan-400" />,
      data: {
        cosplayName: existingWithPhone.cosplayName,
        fullName: existingWithPhone.fullName || existingWithPhone.cosplayName,
        email: existingWithPhone.email || 'updated.email@gmail.com',
        phone: existingWithPhone.phone || '081234567890',
        discordUsername: existingWithPhone.discordUsername || 'updated_discord',
        ageCategory: existingWithPhone.ageCategory || 'Legal Age / Dewasa (18+ tahun)',
        age: existingWithPhone.age || '22',
        country: existingWithPhone.country || 'Indonesia',
        province: existingWithPhone.province || 'DKI Jakarta',
        city: existingWithPhone.city || 'Jakarta Selatan',
        primaryRole: existingWithPhone.primaryRole || 'Cosplayer / Crossplayer',
        fandom: existingWithPhone.fandom || 'Anime & Pop Culture',
        experience: existingWithPhone.experience || '1 - 3 tahun',
        socialMedia: existingWithPhone.socialMedia || '@cosplay_updated',
        portfolioUrl: existingWithPhone.portfolioUrl || '',
        reason: 'Mengisi form kedua kali untuk menguji sinkronisasi Single KCC ID akun tunggal.',
        acceptedCodeOfConduct: true,
      },
    });
  }

  const handleRandomize = () => {
    const roles = [
      'Cosplayer / Crossplayer',
      'Idol Fan / Wota (J-Pop, K-Pop, VTuber)',
      'Anime, Manga & Gaming Otaku',
      'Prop Maker / Crafter / Pembuat Aksesori',
      'Fotografer / Videografer Cosplay',
    ];
    const cities = ['Jakarta Selatan', 'Kota Bandung', 'Kota Surabaya', 'Kota Yogyakarta', 'Kota Semarang', 'Kota Medan'];
    const names = ['Kiyomi_Cos', 'Ren_Cross', 'Chiyo_Chan', 'Daisuke_Props', 'Akane_Photos', 'Hoshi_Wota'];
    const randomIdx = Math.floor(Math.random() * names.length);
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const randomData: DemoFormPreset['data'] = {
      cosplayName: `${names[randomIdx]}_${randomNum.toString().slice(-2)}`,
      fullName: `Tester Person ${randomNum}`,
      email: `tester${randomNum}@gmail.com`,
      phone: `08${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      discordUsername: `tester_user#${randomNum}`,
      ageCategory: 'Legal Age / Dewasa (18+ tahun)',
      age: `${20 + Math.floor(Math.random() * 10)}`,
      country: 'Indonesia',
      province: 'DKI Jakarta',
      city: cities[Math.floor(Math.random() * cities.length)],
      primaryRole: roles[Math.floor(Math.random() * roles.length)],
      fandom: 'HoYoverse (Genshin Impact, Honkai: Star Rail, ZZZ)',
      experience: '1 - 3 tahun',
      socialMedia: `@tester_${randomNum}`,
      portfolioUrl: '',
      reason: 'Testing randomized demo submission for timestamp UID generation.',
      acceptedCodeOfConduct: true,
    };

    setLastFilledPreset('random');
    onFillDemo(randomData, false);
  };

  const handleSelectPreset = (preset: DemoFormPreset, autoSubmit: boolean = false) => {
    setLastFilledPreset(preset.id);
    onFillDemo(preset.data, autoSubmit);
  };

  return (
    <div className="mb-6 rounded-3xl border border-purple-400/30 bg-purple-950/40 backdrop-blur-xl shadow-xl overflow-hidden animate-fade-in text-slate-100">
      {/* Top Header Toggle Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 bg-gradient-to-r from-purple-900/60 via-purple-950/80 to-slate-950/80 border-b border-purple-400/20 flex items-center justify-between cursor-pointer hover:bg-purple-900/70 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
                {isId ? 'Mode Pengujian Formulir Demo (Demo Form Testing)' : 'Demo Form Testing Sandbox'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Sandbox Mode
              </span>
            </div>
            <p className="text-[11px] text-purple-200/80 hidden sm:block">
              {isId
                ? 'Klik 1-tombol untuk auto-fill data demo dan menguji pembuatan KCC ID (Timestamp UID, Admin UID 0001-0100, Main Account 0000).'
                : '1-click preset auto-fill to test KCC ID generation (Timestamp UID, Admin UID 0001-0100, Main Account 0000).'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRandomize();
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-800/60 hover:bg-purple-700 text-purple-200 text-xs font-semibold inline-flex items-center gap-1 transition-all"
            title="Generate Random Persona"
          >
            <Dices className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">Acak Data</span>
          </button>

          <button
            type="button"
            className="p-1 rounded-lg text-purple-300 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preset Cards & Quick Fill Tools */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Information Pill */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-purple-500/20 flex items-start gap-2.5 text-xs text-purple-200/90">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                {isId ? 'Aturan Alokasi User ID KawanCosplay:' : 'KawanCosplay User ID Rules:'}
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-purple-300/80 mt-1 font-mono">
                <li>
                  <span className="text-amber-300 font-bold">0000 0000 0000 0000</span>:{' '}
                  {isId ? 'KCC Main Account (cosplaysehat@gmail.com)' : 'KCC Main Account'}
                </li>
                <li>
                  <span className="text-rose-300 font-bold">0000 0000 0000 0001 - 0100</span>:{' '}
                  {isId ? 'KCC Admin (Pengurus Inti)' : 'KCC Admin Range'}
                </li>
                <li>
                  <span className="text-indigo-300 font-bold">YYYY MMDD HHmm ssSS</span>:{' '}
                  {isId ? 'Member Reguler berdasar Timestamp pengisian' : 'Timestamp-arranged Member UID'}
                </li>
              </ul>
            </div>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {presets.map((preset) => {
              const isSelected = lastFilledPreset === preset.id;
              return (
                <div
                  key={preset.id}
                  className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-900/50 border-purple-400 shadow-md ring-1 ring-purple-400/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {preset.icon}
                        <h4 className="font-bold text-white text-xs leading-tight">
                          {preset.name}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border font-mono shrink-0 ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-300 mb-2 leading-tight">
                      {preset.expectedUidType}
                    </p>

                    <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 space-y-0.5 mb-2.5">
                      <div className="truncate">
                        <span className="text-slate-500">Nama:</span> <span className="text-slate-200">{preset.data.cosplayName}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-500">WA:</span> <span className="text-emerald-400">{preset.data.phone}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-500">DC:</span> <span className="text-indigo-300">{preset.data.discordUsername}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preset Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(preset, false)}
                      className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Isi Form</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectPreset(preset, true)}
                      className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:brightness-110 text-white text-[11px] font-bold shadow transition-all flex items-center justify-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>Kirim Tes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick random footer note */}
          <div className="flex items-center justify-between text-[11px] text-purple-300/70 pt-1 border-t border-purple-500/20">
            <span>
              {isId
                ? 'Tip: Tekan "Kirim Tes" untuk langsung mensimulasikan penyimpanan data & memeriksa kartu KTA serta unlock grup WA.'
                : 'Tip: Click "Kirim Tes" to instantly simulate submission and view the generated KTA card and WhatsApp unlock.'}
            </span>
            {lastFilledPreset && (
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Preset dimuat</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
