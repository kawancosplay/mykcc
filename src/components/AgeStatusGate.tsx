/**
 * Required step for a signed-in member with a blank age status: every new sign-in profile starts blank, whichever
 * provider it came from, and the public form is the only other place that asks. It cannot be dismissed: the member
 * chooses, or signs out. Only the status is written, and a failed write stays on screen with the hotline.
 */
import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import type { Member } from '../types';
import { updateMemberProfileData } from '../lib/authService';
import { describeFirestoreError } from '../lib/firebase';
import { haptic } from '../lib/haptic';
import { usePresenceMotion, useScrollLock } from '../lib/motion';
import { useI18n } from '../i18n';
import { AgeCategoryRadios } from './RegistrationForm';

interface AgeStatusGateProps {
  member: Member;
  onSaved: (updated: Member) => void;
  onLogout: () => void;
}

export const AgeStatusGate: React.FC<AgeStatusGateProps> = ({ member, onSaved, onLogout }) => {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [ageCategory, setAgeCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sheetMotion = usePresenceMotion('sheet');
  const overlayMotion = usePresenceMotion('overlay');
  useScrollLock(true);

  // Focus the sheet itself (no keyboard pops up on iOS), as AuthModal does
  // shortcut: Tab can still reach the page behind, as in the other sheets; add a focus trap when they all get one
  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const updated = await updateMemberProfileData(member, { ageCategory });
      haptic('success');
      onSaved(updated);
    } catch (error) {
      console.error('Age status save failed:', error);
      haptic('error');
      setErrorMsg(describeFirestoreError(error));
      setIsSaving(false);
    }
  };

  // Overlay and sheet are siblings (index.css: a dimmed/blurred parent would cut the sheet's own blur)
  return (
    <>
      <motion.div {...overlayMotion} className="glass-overlay" aria-hidden="true" />
      <div className="sheet-viewport">
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="glass-sheet sm:max-w-md text-slate-100 outline-none"
          {...sheetMotion}
        >
          <form onSubmit={handleSubmit} className="glass-scroll p-6 sm:p-8 space-y-4">
            <div>
              <h2 id={titleId} className="text-lg font-bold text-white">
                {t('registration.ageCategoryLabel')} <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-rose-400 font-semibold mt-1">{t('registration.requiredIndicator')}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{t('registration.ageExplanationDesc')}</p>

            <AgeCategoryRadios value={ageCategory} onChange={setAgeCategory} />

            {errorMsg && (
              <div role="alert" className="text-xs text-rose-300 space-y-1">
                <p>{errorMsg}</p>
                <p>{t('common.whatsappHotline')}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary pressable w-full min-h-12 px-6 text-base sm:text-sm"
            >
              {isSaving && (
                <span
                  aria-hidden="true"
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                />
              )}
              <span>{t('admin.saveChanges')}</span>
            </button>

            {/* Stays enabled while saving: offline, the save only settles once the connection is back */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onLogout}
                className="pressable min-h-11 px-4 rounded-xl text-sm text-rose-300 hover:text-white hover:bg-rose-500/15 inline-flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('common.navLogout')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
};
