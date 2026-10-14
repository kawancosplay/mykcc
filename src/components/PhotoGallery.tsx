import React, { useState, useMemo, useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
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
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Photo, Member } from '../types';
import type { PhotoPageCursor } from '../types';
import { PUBLIC_GALLERY_PAGE_SIZE, fetchPhotosPage, toggleLikePhoto } from '../lib/galleryService';
import { formatKccId } from '../lib/idGenerator';
import { haptic } from '../lib/haptic';
import { getPerfState } from '../lib/perfMode';
import {
  SPRING,
  TWEEN,
  usePresenceMotion,
  useReducedMotion,
  useScrollLock,
  useSheetDrag,
} from '../lib/motion';
import type { SpringPreset } from '../lib/motion';
import { User as FirebaseUser } from 'firebase/auth';
import { useI18n } from '../i18n';
import type { LanguageCode } from '../i18n';
import { OTHER_EVENT_VALUE, PHOTO_EVENT_OPTIONS } from './UploadPhotoModal';

interface PhotoGalleryProps {
  currentMember: Member | null;
  user: FirebaseUser | null;
  onOpenUpload: () => void;
  onRequireLogin: () => void;
  /** Kept for existing callers; the language comes from useI18n(). */
  currentLang: LanguageCode;
  /** Last photo uploaded in this session (App passes it); prepended once (deduped by id). */
  addedPhoto: Photo | null;
}

// ---------------------------------------------------------------------------------------------
// Feed: the gallery loads its photos page by page only while it is open (no app-wide listener; perf F1).
// The loaded pages are kept for this visit, so switching tabs and back does not download them again;
// "Refresh" starts over from the newest photos.
// ---------------------------------------------------------------------------------------------

interface GalleryFeed {
  photos: Photo[];
  cursor: PhotoPageCursor | null;
  hasMore: boolean;
}

let galleryCache: GalleryFeed | null = null;
// Optimistic likes of this visit (photo id -> extra likes), shown on top of the loaded counts until a
// refresh brings the server numbers. Reverted when the write fails.
let likeBumpCache: Record<string, number> = {};

// Lite mode / Save-Data / slow connections: smaller pages (every photo is an inline image of up to ~1 MB).
function galleryPageSize(): number {
  const perf = getPerfState();
  return perf.lite || perf.lowData ? 8 : PUBLIC_GALLERY_PAGE_SIZE;
}

function appendUnique(existing: Photo[], incoming: Photo[]): Photo[] {
  const seen = new Set(existing.map((p) => p.id));
  return [...existing, ...incoming.filter((p) => !seen.has(p.id))];
}

/** Loading placeholder: fixed-size cards like the real grid (no layout shift when the photos arrive). */
const GallerySkeleton: React.FC<{ label: string; count?: number }> = ({ label, count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-busy="true">
    <span className="sr-only">{label}</span>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="glass-card rounded-3xl overflow-hidden" aria-hidden="true">
        <div className="glass-skeleton h-64 sm:h-72 w-full rounded-none"></div>
        <div className="p-4 space-y-2">
          <div className="glass-skeleton h-3 w-2/3"></div>
          <div className="glass-skeleton h-3 w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

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

// First appearance of the grid: the first cards rise in one after another. Cards added later (filters,
// new uploads) appear without it, and reduced motion skips it entirely. Cards past the limit are below
// the fold anyway and are not animated at all.
const GRID_STAGGER_LIMIT = 12;
const GRID_STAGGER_STEP = 0.04; // s between two cards
const gridItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...SPRING.page, delay: Math.min(index, GRID_STAGGER_LIMIT) * GRID_STAGGER_STEP },
  }),
};

/** Heart "pop" after a like: bouncier than SPRING.press on purpose (damping ratio ~0.34, one ~13% overshoot). */
const HEART_POP: SpringPreset = { ...SPRING.press, damping: 15 };

/**
 * Like icon. `pop` changes on every like tap; the new key remounts the icon so it springs in again.
 * With reduced motion it only fades back in (no scale).
 */
const LikeHeart: React.FC<{ pop: number; reduced: boolean; className: string }> = ({ pop, reduced, className }) => (
  <motion.span
    key={pop}
    aria-hidden="true"
    className="inline-flex shrink-0"
    initial={pop === 0 ? false : reduced ? { opacity: 0.4 } : { scale: 0.6 }}
    animate={reduced ? { opacity: 1 } : { scale: 1 }}
    transition={reduced ? TWEEN.reducedIn : HEART_POP}
  >
    <Heart className={className} />
  </motion.span>
);

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  currentMember,
  user,
  onOpenUpload,
  onRequireLogin,
  addedPhoto,
}) => {
  const { t, formatNumber, formatDate, intlLocale } = useI18n();

  // ---- Paged feed ----
  const [feed, setFeed] = useState<GalleryFeed>(() => galleryCache ?? { photos: [], cursor: null, hasMore: false });
  const [status, setStatus] = useState<'loading' | 'ready' | 'loadingMore' | 'error'>(() =>
    galleryCache ? 'ready' : 'loading'
  );
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);
  // A photo uploaded in this session shows at the top once (deduped: it may also arrive with a page).
  const photos = useMemo(
    () =>
      addedPhoto && !feed.photos.some((p) => p.id === addedPhoto.id) ? [addedPhoto, ...feed.photos] : feed.photos,
    [addedPhoto, feed.photos]
  );

  // Every feed change goes through here: the module cache survives the unmount (tab switch).
  const commitFeed = useCallback((update: (prev: GalleryFeed) => GalleryFeed) => {
    const base = galleryCache ?? { photos: [], cursor: null, hasMore: false };
    const next = update(base);
    galleryCache = next;
    if (mountedRef.current) setFeed(next);
  }, []);

  const loadFirstPage = useCallback(async () => {
    const request = ++requestRef.current;
    setStatus('loading');
    setLoadMoreFailed(false);
    try {
      const page = await fetchPhotosPage({ pageSize: galleryPageSize() });
      if (request !== requestRef.current) return;
      commitFeed(() => ({ photos: page.photos, cursor: page.cursor, hasMore: page.hasMore }));
      if (mountedRef.current) setStatus('ready');
    } catch (err) {
      if (request !== requestRef.current) return;
      console.warn('Gallery load failed:', err);
      if (mountedRef.current) setStatus('error');
    }
  }, [commitFeed]);

  const loadMore = useCallback(async () => {
    const current = galleryCache;
    if (!current || !current.hasMore || !current.cursor) return;
    const request = ++requestRef.current;
    setStatus('loadingMore');
    setLoadMoreFailed(false);
    try {
      const page = await fetchPhotosPage({ pageSize: galleryPageSize(), cursor: current.cursor });
      if (request !== requestRef.current) return;
      commitFeed((prev) => ({ photos: appendUnique(prev.photos, page.photos), cursor: page.cursor, hasMore: page.hasMore }));
    } catch (err) {
      if (request !== requestRef.current) return;
      console.warn('Gallery load more failed:', err);
      if (mountedRef.current) setLoadMoreFailed(true);
    } finally {
      if (request === requestRef.current && mountedRef.current) setStatus('ready');
    }
  }, [commitFeed]);

  const [likeBumps, setLikeBumps] = useState<Record<string, number>>(() => likeBumpCache);
  const bumpLike = useCallback((photoId: string, delta: number) => {
    likeBumpCache = { ...likeBumpCache, [photoId]: Math.max(0, (likeBumpCache[photoId] || 0) + delta) };
    if (mountedRef.current) setLikeBumps(likeBumpCache);
  }, []);
  const likesOf = (photo: Photo) => (photo.likesCount || 0) + (likeBumps[photo.id] || 0);

  const refresh = useCallback(() => {
    galleryCache = null;
    likeBumpCache = {};
    setLikeBumps(likeBumpCache);
    haptic('light');
    void loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    mountedRef.current = true;
    if (!galleryCache) void loadFirstPage();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [activePhotoModal, setActivePhotoModal] = useState<Photo | null>(null);
  const photoTitleId = useId();
  const reducedMotion = useReducedMotion() === true;

  // Photo viewer: page frozen while open, slide-up sheet (phones) / scale-in dialog (>= 640px),
  // drag the grabber down to close on phones
  const closePhotoViewer = useCallback(() => setActivePhotoModal(null), []);
  useScrollLock(activePhotoModal !== null);
  const overlayMotion = usePresenceMotion('overlay');
  const sheetMotion = usePresenceMotion('sheet');
  const viewerDrag = useSheetDrag(closePhotoViewer);

  // Bumped on every like tap (per photo id): re-keys the heart icon so it pops again
  const [likePops, setLikePops] = useState<Record<string, number>>({});

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

  // The grid stagger plays once: for the cards on screen when the grid first shows photos. `initial` is
  // only read when a card mounts, so turning this off right after that commit leaves the running stagger
  // alone and later cards simply appear.
  const [gridIntro, setGridIntro] = useState(true);
  const hasGridItems = filteredPhotos.length > 0;
  useEffect(() => {
    if (gridIntro && hasGridItems) setGridIntro(false);
  }, [gridIntro, hasGridItems]);
  const staggerGrid = gridIntro && !reducedMotion;

  const handleLike = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    haptic('light');
    setLikePops((prev) => ({ ...prev, [photo.id]: (prev[photo.id] || 0) + 1 }));
    // Optimistic +1 on the loaded item (no live listener any more); reverted if the write fails.
    bumpLike(photo.id, 1);
    toggleLikePhoto(photo.id).catch((err) => {
      console.warn('Like failed:', err);
      bumpLike(photo.id, -1);
    });
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
            {/* Counts the LOADED photos (no total-count query); "+ more" while older pages exist */}
            {status !== 'loading' && status !== 'error' && (
              <span className="text-xs text-slate-400">
                {t(isOne(photos.length) ? 'gallery.photosAvailableOne' : 'gallery.photosAvailableOther', {
                  count: formatNumber(photos.length),
                })}
                {feed.hasMore && <span className="ms-1">{t('gallery.morePhotosHint')}</span>}
              </span>
            )}
            <button
              type="button"
              onClick={refresh}
              disabled={status === 'loading' || status === 'loadingMore'}
              title={t('gallery.refresh')}
              aria-label={t('gallery.refresh')}
              className="touch-target inline-flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
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
      {status === 'loading' ? (
        <GallerySkeleton label={t('common.loadingApp')} />
      ) : status === 'error' ? (
        <div className="glass-card text-center py-14 px-4 rounded-3xl" role="alert">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-slate-300 max-w-sm mx-auto mb-4">{t('gallery.loadFailed')}</p>
          <button type="button" onClick={() => void loadFirstPage()} className="btn-primary pressable text-xs">
            {t('common.tryAgain')}
          </button>
        </div>
      ) : filteredPhotos.length === 0 && photos.length > 0 && feed.hasMore ? (
        // Filters only search the loaded pages: offer older photos
        <div className="glass-card text-center py-14 px-4 rounded-3xl">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-slate-300 max-w-sm mx-auto mb-4">{t('gallery.filterLoadMoreHint')}</p>
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={status === 'loadingMore'}
            className="btn-primary pressable text-xs disabled:opacity-60"
          >
            {status === 'loadingMore' ? t('gallery.loadingMore') : t('gallery.loadMore')}
          </button>
          {loadMoreFailed && <p className="text-xs text-rose-400 mt-3" role="alert">{t('gallery.loadFailed')}</p>}
        </div>
      ) : filteredPhotos.length === 0 ? (
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
          {filteredPhotos.map((photo, index) => (
            // Motion wrapper = grid item: the stagger (opacity + translate) lives here, not on the card,
            // so it never fights the card's own `.pressable-soft` scale / opacity transitions.
            <motion.div
              key={photo.id}
              className="flex flex-col"
              custom={index}
              variants={gridItemVariants}
              initial={staggerGrid && index < GRID_STAGGER_LIMIT ? 'hidden' : false}
              animate="shown"
            >
              <div
                onClick={() => setActivePhotoModal(photo)}
                className="group glass-card glass-card-interactive pressable-soft cv-auto hover:border-rose-500/50 rounded-3xl overflow-hidden flex-1 flex flex-col justify-between"
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
                        aria-label={t('gallery.likeWithCount', { count: formatNumber(likesOf(photo)) })}
                        className="glass-icon-button w-auto h-9 px-3 gap-1 hover:bg-rose-600 hover:text-white"
                      >
                        <LikeHeart
                          pop={likePops[photo.id] || 0}
                          reduced={reducedMotion}
                          className="w-3.5 h-3.5 fill-current text-rose-400"
                        />
                        <span className="text-[11px] font-bold">{formatNumber(likesOf(photo))}</span>
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
            </motion.div>
          ))}
        </div>
      )}

      {/* Next page (button only: no automatic loading, every photo is a large inline image) */}
      {(status === 'ready' || status === 'loadingMore') && feed.hasMore && filteredPhotos.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={status === 'loadingMore'}
            aria-busy={status === 'loadingMore' || undefined}
            className="glass-button min-h-11 px-5 rounded-2xl text-sm font-bold pressable disabled:opacity-60"
          >
            {status === 'loadingMore' ? (
              <>
                <span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                ></span>
                <span>{t('gallery.loadingMore')}</span>
              </>
            ) : (
              <span>{t('gallery.loadMore')}</span>
            )}
          </button>
          {loadMoreFailed && (
            <p className="text-xs text-rose-400 text-center" role="alert">
              {t('gallery.loadFailed')}
            </p>
          )}
        </div>
      )}

      {/* FULL PHOTO DETAILS: bottom sheet on phones, centered dialog from 640px. Portaled to <body> so the
          animated / z-indexed <main> around the gallery can neither trap nor cover it. AnimatePresence keeps
          the closing viewer (last rendered photo) mounted until its exit animation has finished. */}
      {createPortal(
        <AnimatePresence>
          {activePhotoModal && (
            <motion.div
              key="photo-viewer-overlay"
              className="glass-overlay touch-none"
              aria-hidden="true"
              onClick={closePhotoViewer}
              {...overlayMotion}
            />
          )}
          {activePhotoModal && (
            <div key="photo-viewer-sheet" className="sheet-viewport">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby={photoTitleId}
                className="glass-sheet sm:max-w-4xl"
                {...sheetMotion}
                {...viewerDrag.sheetProps}
              >
                {/* Grabber: drag down to close (phones only) */}
                <div className="sheet-handle" {...viewerDrag.handleProps}>
                  <div className="sheet-grabber" aria-hidden="true" />
                </div>

                <button
                  type="button"
                  onClick={closePhotoViewer}
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
                              {formatKccId(activePhotoModal.userId16)}
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
                          <LikeHeart
                            pop={likePops[activePhotoModal.id] || 0}
                            reduced={reducedMotion}
                            className="w-4 h-4 fill-current text-rose-400"
                          />
                          <span>
                            {t('gallery.likeWithCount', { count: formatNumber(likesOf(activePhotoModal)) })}
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
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
