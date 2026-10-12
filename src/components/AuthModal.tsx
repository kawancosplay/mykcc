import React, { useEffect, useId, useRef, useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Member } from '../types';
import {
  signUpWithEmail,
  loginWithEmail,
  loginWithGoogleOAuth,
  resetPassword,
} from '../lib/authService';
import { useI18n } from '../i18n';
import type { LanguageCode } from '../i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, member: Member | null, token?: string) => void;
  /** Kept for existing callers; the text follows the I18nProvider language. */
  currentLang: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cosplayName, setCosplayName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const idPrefix = useId();
  const titleId = `${idPrefix}-title`;
  const nameId = `${idPrefix}-name`;
  const emailId = `${idPrefix}-email`;
  const passwordId = `${idPrefix}-password`;
  const dialogRef = useRef<HTMLDivElement>(null);

  // Latest onClose without re-running the open effect on every parent render (that would steal focus
  // from the field being typed in).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Open: focus the sheet itself (no keyboard pops up on iOS), Escape closes, focus returns afterwards.
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) throw new Error(t('auth.emailRequired'));
        await resetPassword(email);
        alert(t('auth.resetEmailSent'));
        setMode('login');
      } else if (mode === 'signup') {
        if (!email.trim() || !password || password.length < 6) {
          throw new Error(t('auth.signUpRequirements'));
        }
        const { user, member } = await signUpWithEmail(email, password, fullName, cosplayName);
        onAuthSuccess(user, member);
        onClose();
      } else if (mode === 'login') {
        if (!email.trim()) throw new Error(t('auth.emailRequired'));

        const { user, member } = await loginWithEmail(email, password);
        onAuthSuccess(user, member);
        onClose();
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      setErrorMsg(err instanceof Error ? err.message : t('auth.authFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const { user, member } = await loginWithGoogleOAuth();
      onAuthSuccess(user, member);
      onClose();
    } catch (err: unknown) {
      console.warn('Google sign in note:', err);
      setErrorMsg(t('auth.googleLoginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Shared field styling: glass input, 16px text on phones (no iOS focus zoom), 14px from `sm`.
  const inputClass = 'glass-input w-full ps-9 pe-3 text-base sm:text-sm text-white';
  const iconClass = 'absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none';

  // Overlay and sheet are siblings (index.css: a dimmed/blurred parent would cut the sheet's own blur).
  // Phones: bottom sheet with grabber + safe-area padding; >= 640px: centered dialog (.glass-sheet).
  return (
    <>
      <div className="glass-overlay animate-fade-in" aria-hidden="true" />
      <div className="sheet-viewport">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="glass-sheet sm:max-w-md animate-sheet-up sm:animate-scale-in text-slate-100 outline-none"
        >
          <div className="sheet-grabber" aria-hidden="true" />

          <button
            type="button"
            onClick={onClose}
            className="glass-icon-button absolute top-3 end-3 z-10 sm:top-4 sm:end-4"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="glass-scroll px-6 pt-3 pb-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center font-black text-white text-xl mx-auto mb-3 shadow-lg shadow-rose-500/25">
                KC
              </div>
              <h3 id={titleId} className="text-xl sm:text-2xl font-black text-white">
                {mode === 'signup'
                  ? t('auth.signUpTitle')
                  : mode === 'forgot'
                  ? t('auth.forgotPasswordTitle')
                  : t('auth.loginTitle')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('auth.portalSubtitle')}
              </p>
            </div>

            {mode !== 'forgot' && (
              <div className="glass-segmented glass-segmented-block mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  aria-pressed={mode === 'login'}
                  className={`glass-segment ${mode === 'login' ? 'is-active' : ''}`}
                >
                  {t('auth.loginTab')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  aria-pressed={mode === 'signup'}
                  className={`glass-segment ${mode === 'signup' ? 'is-active' : ''}`}
                >
                  {t('auth.signUpTab')}
                </button>
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label htmlFor={nameId} className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    {t('auth.nameLabel')} <span className="text-slate-400 font-normal">{t('common.optional')}</span>
                  </label>
                  <div className="relative">
                    <Sparkles className={`${iconClass} text-rose-400`} aria-hidden="true" />
                    <input
                      id={nameId}
                      type="text"
                      autoComplete="nickname"
                      placeholder={t('auth.namePlaceholder')}
                      maxLength={80}
                      value={cosplayName}
                      onChange={(e) => setCosplayName(e.target.value)}
                      className={`${inputClass} font-semibold`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {t('auth.nameHint')}
                  </p>
                </div>
              )}

              <>
                <div>
                  <label htmlFor={emailId} className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    {t('auth.emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className={`${iconClass} text-slate-500`} aria-hidden="true" />
                    <input
                      id={emailId}
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor={passwordId} className="block text-[11px] font-bold text-slate-300 uppercase">
                        {t('auth.passwordLabel')}
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="touch-target text-[10px] text-rose-400 hover:underline"
                        >
                          {t('auth.forgotPasswordLink')}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className={`${iconClass} text-slate-500`} aria-hidden="true" />
                      <input
                        id={passwordId}
                        type="password"
                        required
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full min-h-11 py-3 rounded-xl text-xs sm:text-sm pressable"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {mode === 'signup'
                        ? t('auth.signUpSubmit')
                        : mode === 'forgot'
                        ? t('auth.sendResetEmail')
                        : t('auth.loginTitle')}
                    </span>
                    <ArrowRight className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" />
                  </>
                )}
              </button>
              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full min-h-11 text-center text-xs text-slate-400 hover:text-white"
                >
                  {t('auth.backToLogin')}
                </button>
              )}
            </form>

            {mode !== 'forgot' && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="h-px flex-1 bg-white/10" aria-hidden="true"></div>
                  <span className="text-[10px] uppercase text-slate-400">{t('auth.orContinueWith')}</span>
                  <div className="h-px flex-1 bg-white/10" aria-hidden="true"></div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full min-h-11 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 shadow-sm pressable"
                  >
                    <span>{t('auth.continueWithGoogle')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
