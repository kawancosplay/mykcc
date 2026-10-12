import React, { useState, useMemo, useCallback, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  Heart,
  Search,
  Filter,
  Sparkles,
  Calendar,
  User as UserIcon,
  Plus,
  Eye,
  X,
  Share2,
  Tag,
  Download,
} from 'lucide-react';
import { Photo, Member } from '../types';
import { toggleLikePhoto } from '../lib/galleryService';
import { format16DigitUserId } from '../lib/idGenerator';
import { User as FirebaseUser } from 'firebase/auth';
import { useI18n } from '../i18n';
import type { LanguageCode } from '../i18n';
import { OTHER_EVENT_VALUE, PHOTO_EVENT_OPTIONS, useSheetScrollLock } from './UploadPhotoModal';

interface PhotoGalleryProps {
  photos: Photo[];
  currentMember: Member | null;
  user: FirebaseUser | null;
  onOpenUpload: () => void;
  onRequireLogin: () => void;
  /** Kept for existing callers; the language comes from useI18n(). */
  currentLang: LanguageCode;
}

/** Renders a translated template with its "{placeholder}" replaced by a React node (e.g. a <strong>). */
function renderWithNode(template: string, placeholder: string, node: React.ReactNode): React.ReactNode {
  const token = `{${placeholder}}`;
  const index = template.indexOf(token);
  if (index === -1) return template;
  return (
    <>
      {template.slice(0, index)}
      {node}
      {template.slice(index + token.length)}
    </>
  );
}

/** Fades a gallery image in once it has loaded (or failed), see `.img-reveal` in index.css. */
const revealImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.dataset.loaded = 'true';
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  currentMember,
  user,
  onOpenUpload,
  onRequireLogin,
}) => {
  const { t, formatNumber, formatDate, intlLocale } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [activePhotoModal, setActivePhotoModal] = useState<Photo | null>(null);
  const photoTitleId = useId();
  useSheetScrollLock(activePhotoModal !== null);

  // The photo viewer is read-only: Escape closes it
  useEffect(() => {
    if (!activePhotoModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePhotoModal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePhotoModal]);

  const pluralRules = useMemo(() => {
    try {
      return new Intl.PluralRules(intlLocale);
    } catch {
      return null;
    }
  }, [intlLocale]);
  const isOne = (count: number) => (pluralRules ? pluralRules.select(count) === 'one' : count === 1);

  // Preset events are saved with their English text (or the "Other" value): show the localized label.
  // Events members typed themselves are shown as they are.
  const eventLabel = useCallback(
    (value: string): string => {
      if (value === OTHER_EVENT_VALUE) return t('gallery.eventOtherShort');
      const preset = PHOTO_EVENT_OPTIONS.find((option) => option.value === value);
      return preset?.labelKey ? t(preset.labelKey) : value;
    },
    [t]
  );

  // Extract unique characters & events for filter dropdowns
  const availableCharacters = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.character) set.add(p.character);
    });
    return Array.from(set).sort();
  }, [photos]);

  const availableEvents = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.event) set.add(p.event);
    });
    return Array.from(set).sort((a, b) => eventLabel(a).localeCompare(eventLabel(b), intlLocale));
  }, [photos, eventLabel, intlLocale]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.character.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        p.event.toLowerCase().includes(q) ||
        eventLabel(p.event).toLowerCase().includes(q);

      const matchChar = selectedCharacter === 'ALL' || p.character === selectedCharacter;
      const matchEvt = selectedEvent === 'ALL' || p.event === selectedEvent;

      return matchSearch && matchChar && matchEvt;
    });
  }, [photos, searchQuery, selectedCharacter, selectedEvent, eventLabel]);

  const handleLike = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    toggleLikePhoto(photo.id).catch((err) => console.warn('Like failed:', err));
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const cleanTitle = (photo.title || photo.character || 'cosplay_photo')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);
      const filename = `KawanCosplay_${cleanTitle}.jpg`;

      // If data URL, download directly without fetching
      if (photo.photoUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = photo.photoUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Fetch blob
      const response = await fetch(photo.photoUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn('Direct fetch download failed, fallback to direct anchor:', error);
      const link = document.createElement('a');
      link.href = photo.photoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `KawanCosplay_${photo.character || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="glass-chip font-bold bg-pink-500/20 text-pink-300 border-pink-500/30">
              <Camera className="w-3.5 h-3.5 text-pink-400" />
              <span>{t('gallery.title')}</span>
            </span>
            <span className="text-xs text-slate-400">
              {t(isOne(photos.length) ? 'gallery.photosAvailableOne' : 'gallery.photosAvailableOther', {
                count: formatNumber(photos.length),
              })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {t('gallery.showcaseHeading')}
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mt-1">
            {t('gallery.description')}
          </p>
        </div>

        {/* Upload Action (photo uploads require a signed-in account) */}
        <button
          onClick={() => {
            if (user) {
              onOpenUpload();
            } else {
              onRequireLogin();
            }
          }}
          className="liquid-glass-button px-4 py-2 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('gallery.uploadPhoto')}</span>
        </button>
      </div>

      {/* Filter and Categorization Controls */}
      <div className="glass-card rounded-2xl p-4 mb-8 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('gallery.searchPlaceholder')}
              aria-label={t('gallery.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-10 pr-4 text-base sm:text-sm"
            />
          </div>

          {/* Categorize by Character */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              aria-label={t('gallery.allCharacters')}
              className="w-full glass-input text-base sm:text-sm text-slate-200"
            >
              <option value="ALL">
                {t('gallery.filterOptionWithCount', {
                  label: t('gallery.allCharacters'),
                  count: formatNumber(availableCharacters.length),
                })}
              </option>
              {availableCharacters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Categorize by Event */}
          <div className="w-full sm:w-56">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              aria-label={t('gallery.allEvents')}
              className="w-full glass-input text-base sm:text-sm text-slate-200"
            >
              <option value="ALL">
                {t('gallery.filterOptionWithCount', {
                  label: t('gallery.allEvents'),
                  count: formatNumber(availableEvents.length),
                })}
              </option>
              {availableEvents.map((evt) => (
                <option key={evt} value={evt}>
                  {eventLabel(evt)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/10">
          <span>
            {renderWithNode(
              t(isOne(filteredPhotos.length) ? 'gallery.showingCountOne' : 'gallery.showingCountOther'),
              'count',
              <strong className="text-white">{formatNumber(filteredPhotos.length)}</strong>
            )}
          </span>
          {(searchQuery || selectedCharacter !== 'ALL' || selectedEvent !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCharacter('ALL');
                setSelectedEvent('ALL');
              }}
              className="touch-target text-rose-400 hover:underline"
            >
              {t('admin.resetFilter')}
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="glass-card text-center py-16 px-4 rounded-3xl">
          <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">{t('gallery.emptyTitle')}</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-4">
            {t('gallery.emptyDesc')}
          </p>
          <button
            onClick={() => {
              if (user) onOpenUpload();
              else onRequireLogin();
            }}
            className="btn-primary pressable text-xs"
          >
            {t('gallery.uploadNow')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhotoModal(photo)}
              className="group glass-card glass-card-interactive pressable-soft cv-auto hover:border-rose-500/50 rounded-3xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo Image container */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-950">
                  <img
                    src={photo.photoUrl}
                    alt={photo.title}
                    loading="lazy"
                    decoding="async"
                    onLoad={revealImage}
                    onError={revealImage}
                    className="img-reveal w-full h-full object-cover group-hover:scale-105 transition-[opacity,scale] duration-700 ease-out-soft"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none"></div>

                  {/* Character Badge Top */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="glass-chip min-h-6 px-2.5 py-1 text-[10px] font-bold bg-rose-600/90 border-rose-400/40 text-white">
                      {photo.character}
                    </span>
                    <span className="glass-chip min-h-6 px-2.5 py-1 text-[10px] text-slate-300">
                      {photo.series}
                    </span>
                  </div>

                  {/* Top right quick actions */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
                    <button
                      type="button"
                      title={t('gallery.downloadPhoto')}
                      aria-label={t('gallery.downloadPhoto')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(photo);
                      }}
                      className="glass-icon-button w-9 h-9"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleLike(e, photo)}
                      aria-label={t('gallery.likeWithCount', { count: formatNumber(photo.likesCount || 0) })}
                      className="glass-icon-button w-auto h-9 px-3 gap-1 hover:bg-rose-600 hover:text-white"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
                      <span className="text-[11px] font-bold">{formatNumber(photo.likesCount || 0)}</span>
                    </button>
                  </div>

                  {/* Title & Author at bottom of photo */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-rose-300 transition-colors">
                      {photo.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-300">
                      <span>
                        {renderWithNode(
                          t('gallery.byAuthor'),
                          'name',
                          <strong className="text-rose-400">{photo.authorName}</strong>
                        )}
                      </span>
                      {photo.userId16 && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {t('common.idValue', { id: photo.userId16.slice(-4) })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Meta footer */}
                <div className="p-4 text-xs space-y-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{eventLabel(photo.event)}</span>
                    </span>
                    {photo.photographer && (
                      <span className="text-[11px] text-pink-300 font-mono truncate max-w-[120px]">
                        📸 {photo.photographer}
                      </span>
                    )}
                  </div>

                  {photo.caption && (
                    <p className="text-slate-400 text-[11px] line-clamp-2 italic">
                      "{photo.caption}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL PHOTO DETAILS: bottom sheet on phones, centered dialog from 640px. Portaled to <body> so the
          animated / z-indexed <main> around the gallery can neither trap nor cover it. */}
      {activePhotoModal &&
        createPortal(
          <>
            <div
              className="glass-overlay animate-fade-in touch-none"
              aria-hidden="true"
              onClick={() => setActivePhotoModal(null)}
            />
            <div className="sheet-viewport">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={photoTitleId}
                className="glass-sheet sm:max-w-4xl animate-sheet-up sm:animate-scale-in"
              >
                <button
                  type="button"
                  onClick={() => setActivePhotoModal(null)}
                  aria-label={t('common.close')}
                  title={t('common.close')}
                  className="glass-icon-button absolute top-3 right-3 z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="glass-scroll md:flex md:flex-row md:overflow-hidden">
                  {/* Photo view */}
                  <div className="md:w-3/5 bg-slate-950/70 flex items-center justify-center p-2 md:overflow-hidden">
                    <img
                      src={activePhotoModal.photoUrl}
                      alt={activePhotoModal.title}
                      decoding="async"
                      className="max-h-[60vh] md:max-h-[70vh] w-full object-contain rounded-2xl"
                    />
                  </div>

                  {/* Photo metadata */}
                  <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between md:overflow-y-auto md:overscroll-contain">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3 pr-10 md:pr-8">
                        <span className="glass-chip font-bold bg-rose-600 border-rose-400/40 text-white">
                          {activePhotoModal.character}
                        </span>
                        <span className="glass-chip text-slate-300">{activePhotoModal.series}</span>
                      </div>

                      <h2 id={photoTitleId} className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
                        {activePhotoModal.title}
                      </h2>

                      <div className="glass-well p-3 rounded-2xl mb-4 space-y-1.5 text-xs">
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">{t('gallery.detailCosplayer')}</span>
                          <span className="font-bold text-rose-400 text-right">{activePhotoModal.authorName}</span>
                        </div>
                        {activePhotoModal.userId16 && (
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">{t('gallery.detailKccId')}</span>
                            <span className="font-mono text-slate-300 text-right">
                              {format16DigitUserId(activePhotoModal.userId16)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">{t('gallery.detailEvent')}</span>
                          <span className="font-semibold text-slate-200 text-right">
                            {eventLabel(activePhotoModal.event)}
                          </span>
                        </div>
                        {activePhotoModal.photographer && (
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">{t('gallery.detailPhotographer')}</span>
                            <span className="font-mono text-pink-300 text-right">{activePhotoModal.photographer}</span>
                          </div>
                        )}
                      </div>

                      {activePhotoModal.caption && (
                        <div className="mb-6">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            {t('gallery.shootNotes')}
                          </h4>
                          <p className="glass-well text-xs text-slate-300 leading-relaxed p-3 rounded-xl">
                            {activePhotoModal.caption}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action row */}
                    <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleLike(e, activePhotoModal)}
                          className="glass-button pressable text-xs font-bold bg-rose-600/20 border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white"
                        >
                          <Heart className="w-4 h-4 fill-current text-rose-400" />
                          <span>
                            {t('gallery.likeWithCount', { count: formatNumber(activePhotoModal.likesCount || 0) })}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDownload(activePhotoModal)}
                          className="glass-button pressable text-xs font-bold"
                        >
                          <Download className="w-4 h-4" />
                          <span>{t('gallery.download')}</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono">
                        {formatDate(activePhotoModal.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};
