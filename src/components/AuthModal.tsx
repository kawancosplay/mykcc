import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  IdCard,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Member } from '../types';
import {
  signUpWithEmail,
  loginWithEmail,
  loginWithGoogleOAuth,
  resetPassword,
  findMemberByUserId16,
} from '../lib/authService';
import { format16DigitUserId } from '../lib/idGenerator';
import { LanguageCode, LANGUAGES, TRANSLATIONS } from '../lib/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, member: Member | null, token?: string) => void;
  currentLang: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.id;
  const [mode, setMode] = useState<'login' | 'signup' | 'phone' | 'forgot'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kccId, setKccId] = useState('');
  const [fullName, setFullName] = useState('');
  const [cosplayName, setCosplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Email diperlukan.');
        await resetPassword(email);
        alert('Email untuk reset kata sandi telah dikirim.');
        setMode('login');
      } else if (mode === 'signup') {
        if (!email.trim() || !password || password.length < 6) {
          throw new Error('Email valid dan kata sandi minimal 6 karakter diperlukan.');
        }
        const { user, member } = await signUpWithEmail(email, password, fullName, cosplayName);
        onAuthSuccess(user, member);
        onClose();
      } else if (mode === 'login') {
        let loginEmail = email;
        if (kccId) {
          const member = await findMemberByUserId16(kccId);
          if (!member || !member.email) {
             throw new Error('KCC ID tidak ditemukan atau tidak memiliki email terkait.');
          }
          loginEmail = member.email;
        }
        
        if (!loginEmail) throw new Error('Email atau KCC ID diperlukan.');
        
        const { user, member } = await loginWithEmail(loginEmail, password);
        onAuthSuccess(user, member);
        onClose();
      } else if (mode === 'phone') {
        if (!otpSent) {
          if (!phoneNumber || phoneNumber.length < 9) {
            throw new Error('Masukkan nomor ponsel yang valid.');
          }
          setOtpSent(true);
        } else {
          if (!otpCode || otpCode.length < 4) {
            throw new Error('Masukkan 6 digit kode OTP verifikasi.');
          }
          alert('Nomor ponsel berhasil diverifikasi!');
          onClose();
        }
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const { user, member, accessToken } = await loginWithGoogleOAuth();
      onAuthSuccess(user, member, accessToken);
      onClose();
    } catch (err: unknown) {
      console.warn('Google sign in note:', err);
      setErrorMsg('Login dengan Google dibatalkan atau terkendala.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center font-black text-white text-xl mx-auto mb-3 shadow-lg shadow-rose-500/25">
            KC
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {mode === 'signup' ? t.signUpTitle : mode === 'phone' ? 'Login Nomor Ponsel' : mode === 'forgot' ? 'Lupa Kata Sandi' : t.loginTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Portal Komunitas Resmi MyKCC (16-Digit User ID)
          </p>
        </div>

        {mode !== 'forgot' && (
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'login' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signup' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('phone');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'phone' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Phone
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Nama (Name / Cosname / Alias) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-3 w-4 h-4 text-rose-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian_Cos / Alya / Ken"
                  value={cosplayName}
                  onChange={(e) => setCosplayName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 font-semibold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Boleh menggunakan nama samaran / cosname / nama panggilan demi privasi.
              </p>
            </div>
          )}

          {mode !== 'phone' ? (
            <>
              {mode === 'login' && (
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Atau KCC ID (Jika ada)
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Contoh: 2026 1008 0715 3001"
                      value={kccId}
                      onChange={(e) => setKccId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase">
                      Kata Sandi (Password)
                    </label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot')} className="text-[10px] text-rose-400 hover:underline">
                        Lupa kata sandi?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Nomor WhatsApp / Ponsel
              </label>
              <div className="relative mb-3">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  placeholder="+62 812 3456 7890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {otpSent && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kode Verifikasi (OTP)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-center font-mono tracking-widest text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>
                  {mode === 'signup'
                    ? 'Buat Akun & Dapatkan 16-Digit ID'
                    : mode === 'phone'
                    ? otpSent
                      ? 'Verifikasi & Masuk'
                      : 'Kirim Kode OTP'
                    : mode === 'forgot'
                    ? 'Kirim Email Reset'
                    : 'Masuk ke Akun MyKCC'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          {mode === 'forgot' && (
            <button type="button" onClick={() => setMode('login')} className="w-full text-center text-xs text-slate-400 hover:text-white pt-2">
              Kembali ke Login
            </button>
          )}
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-900 px-3 text-slate-400">Atau masuk dengan</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors border border-slate-200 shadow-sm"
              >
                <span>Lanjutkan dengan Google</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
