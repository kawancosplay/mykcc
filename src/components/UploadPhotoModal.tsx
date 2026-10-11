import React, { useState } from 'react';
import { X, Upload, Camera, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Member, Photo } from '../types';
import { addPhotoToFirestore, PHOTO_FIELD_LIMITS } from '../lib/galleryService';
import { describeFirestoreError } from '../lib/firebase';
import { compressImage } from '../lib/imageUtils';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

const MAX_PHOTO_MB = 15;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-slate-100">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          title={t('common.close')}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-block mb-2">
            {t('gallery.uploadBadge')}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">{t('gallery.uploadTitle')}</h3>
          <p className="text-xs text-slate-400 mt-1">{t('gallery.uploadDesc')}</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
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
              <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-slate-950 border border-rose-500/40 mb-2 group">
                <img src={photoUrl} alt={t('gallery.previewAlt')} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-3 right-3 p-2 bg-slate-950/80 text-white rounded-xl text-xs hover:bg-rose-600 transition-colors"
                >
                  {t('gallery.changePhoto')}
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-700 hover:border-rose-500/60 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors">
                <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-semibold mb-2">{t('gallery.chooseFileHint')}</p>
                <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors border border-slate-700">
                  <Upload className="w-4 h-4 text-rose-400" />
                  <span>{t('gallery.chooseFileButton')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Judul Foto */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('gallery.photoTitleLabel')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('gallery.photoTitlePlaceholder')}
                maxLength={PHOTO_FIELD_LIMITS.title}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Nama Karakter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('gallery.characterLabel')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('gallery.characterPlaceholder')}
                maxLength={PHOTO_FIELD_LIMITS.character}
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Serial / Series */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('gallery.seriesLabel')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('gallery.seriesPlaceholder')}
                maxLength={PHOTO_FIELD_LIMITS.series}
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Event */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('gallery.eventLabel')}
              </label>
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              >
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
                  className="mt-2 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                />
              )}
            </div>
          </div>

          {/* Fotografer Credit */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {t('gallery.photographerLabel')}
            </label>
            <input
              type="text"
              placeholder={t('gallery.photographerPlaceholder')}
              maxLength={PHOTO_FIELD_LIMITS.photographer}
              value={photographer}
              onChange={(e) => setPhotographer(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Keterangan / Caption */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {t('gallery.captionLabel')}
            </label>
            <textarea
              rows={2}
              placeholder={t('gallery.captionPlaceholder')}
              maxLength={PHOTO_FIELD_LIMITS.caption}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500 resize-none"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              {t('gallery.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label={t('gallery.submitUpload')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
  );
};
