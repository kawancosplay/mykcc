import React, { useEffect, useId, useState } from 'react';
import { X, Upload, Camera, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Member, Photo } from '../types';
import { addPhotoToFirestore, PHOTO_FIELD_LIMITS } from '../lib/galleryService';
import { describeFirestoreError } from '../lib/firebase';
import { compressImage } from '../lib/imageUtils';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

const MAX_PHOTO_MB = 15;

// Glass text field: 16px on phones (no iOS focus zoom), compact on larger screens
const FIELD_CLASS = 'w-full glass-input text-base sm:text-sm';
const LABEL_CLASS = 'block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5';

/** Event value saved when the member picks "Other" (compared in code and stored as is; never translated). */
export const OTHER_EVENT_VALUE = 'Lainnya (Tulis Sendiri)';

/**
 * Event presets. `value` is what gets saved to Firestore and must not change; only `labelKey` is localized
 * (also used by PhotoGallery to label saved events). Proper event names have no key and are shown as is.
 */
export const PHOTO_EVENT_OPTIONS: ReadonlyArray<{ value: string; labelKey?: TranslationKey }> = [
  { value: 'Comic Frontier (Comifuro)' },
  { value: 'Anime Festival Asia (AFA ID)' },
  { value: 'Indonesia Comic Con (ICC)' },
  { value: 'Jakarta Cosplay Parade Monas' },
  { value: 'KawanCosplay Monthly Gathering', labelKey: 'gallery.eventMonthlyGathering' },
  { value: 'Outdoor Nature Photoshoot', labelKey: 'gallery.eventOutdoorShoot' },
  { value: 'Indoor Studio Session', labelKey: 'gallery.eventIndoorStudio' },
  { value: 'Japanese Matsuri / Culture Fest', labelKey: 'gallery.eventMatsuri' },
  { value: OTHER_EVENT_VALUE, labelKey: 'gallery.eventOther' },
];

/**
 * Freezes the page behind an open sheet (`html.scroll-locked` in index.css), so a drag on a non-scrolling
 * part of the sheet cannot scroll the gallery underneath. Counted on <html data-scroll-locks> so stacked
 * sheets unlock only when the last one closes. Replace with `useScrollLock` from src/lib/motion.ts once
 * that module exists.
 */
export function useSheetScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.dataset.scrollLocks = String(Number(root.dataset.scrollLocks || 0) + 1);
    root.classList.add('scroll-locked');
    return () => {
      const remaining = Math.max(0, Number(root.dataset.scrollLocks || 1) - 1);
      if (remaining === 0) {
        delete root.dataset.scrollLocks;
        root.classList.remove('scroll-locked');
      } else {
        root.dataset.scrollLocks = String(remaining);
      }
    };
  }, [active]);
}

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: Member;
  onPhotoAdded: (photo: Photo) => void;
}

export const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  onPhotoAdded,
}) => {
  const { t } = useI18n();
  const [photoUrl, setPhotoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [character, setCharacter] = useState('');
  const [series, setSeries] = useState('');
  const [event, setEvent] = useState(PHOTO_EVENT_OPTIONS[0].value);
  const [customEvent, setCustomEvent] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const titleId = useId();
  useSheetScrollLock(isOpen);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      alert(t('gallery.photoTooLarge', { maxMb: MAX_PHOTO_MB }));
      return;
    }

    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      setPhotoUrl(compressed);
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert(t('gallery.imageProcessFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!photoUrl) {
      setErrorMsg(t('gallery.photoRequired'));
      return;
    }

    if (!character.trim() || !series.trim() || !title.trim()) {
      setErrorMsg(t('gallery.requiredFieldsMissing'));
      return;
    }

    setIsSubmitting(true);

    try {
      // All text is clamped to the Firestore rule limits (PHOTO_FIELD_LIMITS) before writing
      const finalEvent = (
        event === OTHER_EVENT_VALUE && customEvent.trim() ? customEvent.trim() : event
      ).slice(0, PHOTO_FIELD_LIMITS.event);
      const authorAlias = (currentMember.name || currentMember.cosplayName || '').trim();

      const authorName =
        (currentMember.name || currentMember.cosplayName || currentMember.fullName || 'Member')
          .trim()
          .slice(0, PHOTO_FIELD_LIMITS.authorName) || 'Member';

      // Only the required keys go in the literal; optional keys are added below only when they have a
      // value, so the payload never carries `undefined` fields (Firestore rejects them).
      const newPhotoPayload: Omit<Photo, 'id'> = {
        authorName,
        photoUrl,
        title: title.trim().slice(0, PHOTO_FIELD_LIMITS.title),
        character: character.trim().slice(0, PHOTO_FIELD_LIMITS.character),
        series: series.trim().slice(0, PHOTO_FIELD_LIMITS.series),
        event: finalEvent,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      };

      if (currentMember.id) newPhotoPayload.memberId = currentMember.id;
      if (currentMember.userId16) newPhotoPayload.userId16 = currentMember.userId16;
      if (authorAlias) {
        newPhotoPayload.authorCosname = authorAlias.slice(0, PHOTO_FIELD_LIMITS.authorCosname);
        newPhotoPayload.authorNameAlias = authorAlias.slice(0, PHOTO_FIELD_LIMITS.authorNameAlias);
      }
      // Large inline (data URL) avatars exceed the rules limit and are left out instead of failing the upload
      if (currentMember.avatarUrl && currentMember.avatarUrl.length <= PHOTO_FIELD_LIMITS.authorAvatar) {
        newPhotoPayload.authorAvatar = currentMember.avatarUrl;
      }
      const finalPhotographer = photographer.trim().slice(0, PHOTO_FIELD_LIMITS.photographer);
      if (finalPhotographer) newPhotoPayload.photographer = finalPhotographer;
      const finalCaption = caption.trim().slice(0, PHOTO_FIELD_LIMITS.caption);
      if (finalCaption) newPhotoPayload.caption = finalCaption;

      const docId = await addPhotoToFirestore(newPhotoPayload);
      const created: Photo = {
        id: docId,
        ...newPhotoPayload,
      };

      onPhotoAdded(created);
      onClose();
    } catch (err: unknown) {
      console.error('Upload photo error:', err);
      setErrorMsg(describeFirestoreError(err, true));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bottom sheet on phones, centered dialog from 640px (.sheet-viewport / .glass-sheet). The overlay is a
  // sibling of the panel and does not close it (a stray tap must not throw away a half-filled form).
  return (
    <>
      <div className="glass-overlay animate-fade-in touch-none" aria-hidden="true" />
      <div className="sheet-viewport">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="glass-sheet sm:max-w-2xl animate-sheet-up sm:animate-scale-in"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            title={t('common.close')}
            className="glass-icon-button absolute top-4 right-4 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="glass-scroll p-6 sm:p-8">
            <div className="mb-6 pr-12">
              <span className="glass-chip font-bold bg-rose-500/20 text-rose-300 border-rose-500/30 mb-2">
                {t('gallery.uploadBadge')}
              </span>
              <h3 id={titleId} className="text-xl sm:text-2xl font-black text-white">
                {t('gallery.uploadTitle')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t('gallery.uploadDesc')}</p>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Preview & File Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {t('gallery.photoFileLabel')} <span className="text-rose-400">*</span>
                </label>

                {photoUrl ? (
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden glass-well border-rose-500/40 mb-2">
                    <img
                      src={photoUrl}
                      alt={t('gallery.previewAlt')}
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="glass-chip absolute top-3 right-3 hover:bg-rose-600 hover:text-white"
                    >
                      {t('gallery.changePhoto')}
                    </button>
                  </div>
                ) : (
                  <div className="glass-well rounded-2xl border-2 border-dashed border-white/15 hover:border-rose-500/60 p-6 text-center transition-colors">
                    <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-semibold mb-2">{t('gallery.chooseFileHint')}</p>
                    <label className="glass-button pressable text-xs font-bold">
                      <Upload className="w-4 h-4 text-rose-400" />
                      <span>{t('gallery.chooseFileButton')}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Judul Foto */}
                <div>
                  <label className={LABEL_CLASS}>
                    {t('gallery.photoTitleLabel')} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('gallery.photoTitlePlaceholder')}
                    maxLength={PHOTO_FIELD_LIMITS.title}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>

                {/* Nama Karakter */}
                <div>
                  <label className={LABEL_CLASS}>
                    {t('gallery.characterLabel')} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('gallery.characterPlaceholder')}
                    maxLength={PHOTO_FIELD_LIMITS.character}
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>

                {/* Serial / Series */}
                <div>
                  <label className={LABEL_CLASS}>
                    {t('gallery.seriesLabel')} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('gallery.seriesPlaceholder')}
                    maxLength={PHOTO_FIELD_LIMITS.series}
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>

                {/* Event */}
                <div>
                  <label className={LABEL_CLASS}>{t('gallery.eventLabel')}</label>
                  <select value={event} onChange={(e) => setEvent(e.target.value)} className={FIELD_CLASS}>
                    {PHOTO_EVENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.labelKey ? t(option.labelKey) : option.value}
                      </option>
                    ))}
                  </select>

                  {event === OTHER_EVENT_VALUE && (
                    <input
                      type="text"
                      placeholder={t('gallery.customEventPlaceholder')}
                      maxLength={PHOTO_FIELD_LIMITS.event}
                      value={customEvent}
                      onChange={(e) => setCustomEvent(e.target.value)}
                      className={`mt-2 ${FIELD_CLASS}`}
                    />
                  )}
                </div>
              </div>

              {/* Fotografer Credit */}
              <div>
                <label className={LABEL_CLASS}>{t('gallery.photographerLabel')}</label>
                <input
                  type="text"
                  placeholder={t('gallery.photographerPlaceholder')}
                  maxLength={PHOTO_FIELD_LIMITS.photographer}
                  value={photographer}
                  onChange={(e) => setPhotographer(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>

              {/* Keterangan / Caption */}
              <div>
                <label className={LABEL_CLASS}>{t('gallery.captionLabel')}</label>
                <textarea
                  rows={2}
                  placeholder={t('gallery.captionPlaceholder')}
                  maxLength={PHOTO_FIELD_LIMITS.caption}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className={`${FIELD_CLASS} resize-none`}
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="glass-button pressable text-xs">
                  {t('gallery.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label={t('gallery.submitUpload')}
                  className="btn-primary pressable px-6 text-xs"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t('gallery.submitUpload')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
