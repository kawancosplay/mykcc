/**
 * Gallery moderation tab: every photo, newest first, 24 per page ("Load more"), client-side search over the
 * LOADED photos, delete with confirmation (photo + audit-log entry in one batch). No approval queue.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, ImageOff, RefreshCw, Search, Trash2, Images, Wifi } from 'lucide-react';
import type { Photo, PhotoPageCursor } from '../../types';
import { ADMIN_GALLERY_PAGE_SIZE, deletePhotoAsAdmin, fetchPhotosPage } from '../../lib/galleryService';
import { formatKccId, isValidKccId } from '../../lib/idGenerator';
import { describeFirestoreError } from '../../lib/firebase';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import { AdminSheet, NoticeBanner, Spinner, digitsOnly } from './adminUi';
import type { AdminNotice } from './adminUi';

export interface AdminGalleryTabProps {
  busy: boolean; // a long ID task runs: deletes are disabled
}

type Status = 'loading' | 'ready' | 'loadingMore' | 'error';

const uploaderOf = (p: Photo): string => p.authorCosname || p.authorName || p.authorNameAlias || '';

export const AdminGalleryTab: React.FC<AdminGalleryTabProps> = ({ busy }) => {
  const { t, formatDate, formatNumber } = useI18n();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cursor, setCursor] = useState<PhotoPageCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<AdminNotice | null>(null);
  const [viewing, setViewing] = useState<Photo | null>(null);
  // Ignores the result of a request that was superseded by a refresh
  const requestId = useRef(0);

  const loadFirstPage = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    setError(null);
    try {
      const page = await fetchPhotosPage({ pageSize: ADMIN_GALLERY_PAGE_SIZE, source: 'server' });
      if (id !== requestId.current) return;
      setPhotos(page.photos);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
      setStatus('ready');
    } catch (e) {
      if (id !== requestId.current) return;
      console.error('Admin gallery load failed:', e);
      setError(describeFirestoreError(e));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadFirstPage();
    return () => {
      requestId.current++;
    };
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (status !== 'ready' || !hasMore) return;
    const id = ++requestId.current;
    setStatus('loadingMore');
    try {
      const page = await fetchPhotosPage({ pageSize: ADMIN_GALLERY_PAGE_SIZE, cursor, source: 'server' });
      if (id !== requestId.current) return;
      setPhotos((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.photos.filter((p) => !seen.has(p.id))];
      });
      setCursor(page.cursor);
      setHasMore(page.hasMore);
      setStatus('ready');
    } catch (e) {
      if (id !== requestId.current) return;
      console.error('Admin gallery load more failed:', e);
      setStatus('ready');
      setNotice({ kind: 'error', text: describeFirestoreError(e) });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return photos;
    const qDigits = digitsOnly(q);
    return photos.filter((p) => {
      const fields = [p.title, p.character, p.series, p.event, p.authorName, p.authorCosname, p.authorNameAlias];
      if (fields.some((f) => typeof f === 'string' && f.toLowerCase().includes(q))) return true;
      return qDigits.length >= 3 && digitsOnly(p.userId16).includes(qDigits);
    });
  }, [photos, query]);

  const handleDelete = async (photo: Photo) => {
    if (busy || deletingId) return;
    const title = photo.title || photo.character || t('admin.galleryUntitled');
    const uploader = uploaderOf(photo) || '—';
    if (!window.confirm(t('admin.galleryDeleteConfirm', { title, uploader }))) return;

    setDeletingId(photo.id);
    setNotice(null);
    try {
      await deletePhotoAsAdmin(photo);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (viewing?.id === photo.id) setViewing(null);
      haptic('success');
      setNotice({ kind: 'success', text: t('admin.galleryDeleted') });
    } catch (e) {
      console.error('Admin photo delete failed:', e);
      haptic('error');
      setNotice({ kind: 'error', text: describeFirestoreError(e) });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-300 shrink-0">
              <Images className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('admin.galleryTitle')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('admin.galleryDesc')}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1 flex items-start gap-1.5">
                <Wifi className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
                <span>{t('admin.galleryDataNote')}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadFirstPage()}
            disabled={status === 'loading' || status === 'loadingMore'}
            className="glass-button pressable px-3.5 text-xs pointer-coarse:min-h-11 self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{t('admin.refresh')}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('admin.gallerySearchPlaceholder')}
            aria-label={t('admin.gallerySearchPlaceholder')}
            className="w-full ps-10 pe-4 py-3 liquid-glass-input rounded-2xl text-white text-base"
          />
        </div>

        {status !== 'loading' && status !== 'error' && photos.length > 0 && (
          <p className="text-xs text-slate-400" aria-live="polite">
            {t('admin.galleryLoadedCount', {
              shown: formatNumber(filtered.length),
              loaded: formatNumber(photos.length),
            })}
          </p>
        )}

        <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />
      </div>

      {status === 'error' && (
        <div className="liquid-glass-card rounded-3xl p-6 text-center space-y-3">
          <p className="text-sm font-bold text-rose-300">{t('admin.galleryLoadFailed')}</p>
          {error && <p className="text-xs text-slate-400 break-words">{error}</p>}
          <button type="button" onClick={() => void loadFirstPage()} className="glass-button pressable px-4 text-xs">
            <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t('common.tryAgain')}</span>
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden">
              <div className="glass-skeleton aspect-square rounded-none" />
              <div className="p-3 space-y-2">
                <div className="glass-skeleton h-3.5 w-3/4" />
                <div className="glass-skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {(status === 'ready' || status === 'loadingMore') && photos.length === 0 && (
        <div className="liquid-glass-card rounded-3xl p-10 text-center text-sm text-slate-400 flex flex-col items-center gap-3">
          <ImageOff className="w-8 h-8 text-slate-500" aria-hidden="true" />
          <span>{t('admin.galleryEmpty')}</span>
        </div>
      )}

      {(status === 'ready' || status === 'loadingMore') && photos.length > 0 && filtered.length === 0 && (
        <div className="liquid-glass-card rounded-3xl p-6 text-center text-xs text-slate-400">
          {t('admin.galleryNoResults')}
        </div>
      )}

      {filtered.length > 0 && status !== 'loading' && status !== 'error' && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((photo) => {
            const title = photo.title || t('admin.galleryUntitled');
            const uploader = uploaderOf(photo);
            const deleting = deletingId === photo.id;
            const subtitle = [photo.character, photo.series].filter(Boolean).join(' · ');
            return (
              <li
                key={photo.id}
                className={`glass-card rounded-2xl overflow-hidden flex flex-col cv-auto transition-opacity ${
                  deleting ? 'opacity-50' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => setViewing(photo)}
                  className="relative block aspect-square bg-slate-950 overflow-hidden"
                  aria-label={title}
                >
                  {photo.photoUrl ? (
                    <img
                      src={photo.photoUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-slate-600">
                      <ImageOff className="w-6 h-6" aria-hidden="true" />
                    </span>
                  )}
                  {deleting && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                      <Spinner className="w-6 h-6" />
                    </span>
                  )}
                </button>
                <div className="p-3 flex-1 flex flex-col gap-1 min-w-0 text-[11px] text-slate-400">
                  <p className="font-bold text-white text-sm truncate" title={title}>
                    {title}
                  </p>
                  {subtitle && <p className="truncate">{subtitle}</p>}
                  {photo.event && <p className="truncate">{photo.event}</p>}
                  {uploader && (
                    <p className="truncate text-slate-300">
                      {t('admin.galleryUploader', { name: uploader })}
                      {isValidKccId(photo.userId16) && (
                        <span className="font-mono text-slate-500"> • {formatKccId(photo.userId16)}</span>
                      )}
                    </p>
                  )}
                  <div className="mt-auto pt-1.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate">{photo.createdAt ? formatDate(photo.createdAt) : '—'}</p>
                      <p className="flex items-center gap-1 text-pink-300">
                        <Heart className="w-3 h-3" aria-hidden="true" />
                        <span>{t('admin.galleryLikes', { count: formatNumber(photo.likesCount || 0) })}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(photo)}
                      disabled={busy || deletingId !== null}
                      className="touch-target pressable shrink-0 p-2 rounded-xl bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900 text-rose-300 disabled:opacity-40"
                      aria-label={`${t('admin.galleryDelete')}: ${title}`}
                      title={t('admin.galleryDelete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (status === 'ready' || status === 'loadingMore') && photos.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={status === 'loadingMore'}
            className="glass-button pressable px-5 text-sm pointer-coarse:min-h-11 w-full sm:w-auto"
          >
            {status === 'loadingMore' ? <Spinner /> : <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />}
            <span>{t('admin.loadMore')}</span>
          </button>
        </div>
      )}

      {/* Simple lightbox: same data URL, no extra read */}
      <AdminSheet
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing ? viewing.title || t('admin.galleryUntitled') : ''}
        subtitle={viewing ? uploaderOf(viewing) : undefined}
        widthClass="sm:max-w-3xl"
      >
        {viewing && (
          <div className="space-y-4">
            {viewing.photoUrl && (
              <img
                src={viewing.photoUrl}
                alt={viewing.title || ''}
                decoding="async"
                className="w-full max-h-[70vh] object-contain rounded-2xl bg-slate-950"
              />
            )}
            <button
              type="button"
              onClick={() => void handleDelete(viewing)}
              disabled={busy || deletingId !== null}
              className="glass-button pressable w-full sm:w-auto px-4 text-xs pointer-coarse:min-h-11 bg-rose-950/60 border-rose-500/40 text-rose-200"
            >
              {deletingId === viewing.id ? <Spinner /> : <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
              <span>{t('admin.galleryDelete')}</span>
            </button>
          </div>
        )}
      </AdminSheet>
    </div>
  );
};
