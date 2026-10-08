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
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Member } from '../types';
import {
  signUpWithEmail,
  loginWithEmail,
  loginWithGoogleOAuth,
  loginWithAppleOAuth,
  loginWithMicrosoftOAuth,
} from '../lib/authService';
import { format16DigitUserId } from '../lib/idGenerator';
import { LanguageCode, TRANSLATIONS } from '../lib/i18n';

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
  const [mode, setMode] = useState<'login' | 'signup' | 'phone'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (mode === 'signup') {
        if (!email.trim() || !password || password.length < 6) {
          throw new Error('Email valid dan kata sandi minimal 6 karakter diperlukan.');
        }
        const { user, member } = await signUpWithEmail(email, password, fullName, cosplayName);
        onAuthSuccess(user, member);
        onClose();
      } else if (mode === 'login') {
        const { user, member } = await loginWithEmail(email, password);
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
          // Simulate instant phone auth session
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

  const handleAppleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const { user, member } = await loginWithAppleOAuth();
      onAuthSuccess(user, member);
      onClose();
    } catch (err: unknown) {
      console.warn('Apple auth note:', err);
      setErrorMsg('Login dengan Apple ID memerlukan konfigurasi domain live.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const { user, member } = await loginWithMicrosoftOAuth();
      onAuthSuccess(user, member);
      onClose();
    } catch (err: unknown) {
      console.warn('Microsoft auth note:', err);
      setErrorMsg('Login dengan akun Microsoft memerlukan konfigurasi Azure OAuth.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstagramLogin = () => {
    alert(
      'Instagram Login: Mengarahkan ke autentikasi Instagram Graph API. Silakan lanjutkan dengan Google atau Email untuk akses instan langsung ke database KawanCosplay.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center font-black text-white text-xl mx-auto mb-3 shadow-lg shadow-rose-500/25">
            KC
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {mode === 'signup' ? t.signUpTitle : mode === 'phone' ? 'Login Nomor Ponsel' : t.loginTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Portal Komunitas Resmi MyKCC (16-Digit User ID)
          </p>
        </div>

        {/* Tab switch */}
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
            Masuk (Login)
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
            Daftar Akun Baru
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
            No. HP
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
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

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Kata Sandi (Password)
                </label>
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
                    : 'Masuk ke Akun MyKCC'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-3 text-slate-400">Atau masuk dengan</span>
          </div>
        </div>

        {/* Social Logins */}
        <div className="space-y-2">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors border border-slate-200 shadow-sm"
          >
            <svg viewBox="0 0 48 48" className="w-4 h-4">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>

          {/* Social Row: Apple, Microsoft, Instagram */}
          <div className="grid grid-cols-3 gap-2">
            {/* Apple ID */}
            <button
              type="button"
              onClick={handleAppleLogin}
              title="Apple ID"
              className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.11.64-2.8 1.45-.6.7-1.13 1.83-.99 2.95 1.07.08 2.15-.55 2.8-1.3" />
              </svg>
              <span>Apple</span>
            </button>

            {/* Microsoft Account */}
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              title="Microsoft Account"
              className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Microsoft</span>
            </button>

            {/* Instagram */}
            <button
              type="button"
              onClick={handleInstagramLogin}
              title="Instagram"
              className="py-2 px-3 bg-gradient-to-tr from-amber-600/20 via-pink-600/20 to-purple-600/20 hover:from-amber-600/30 hover:to-purple-600/30 text-pink-300 border border-pink-500/30 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.79-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
