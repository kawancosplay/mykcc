import React, { useState, useMemo } from 'react';
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
import { LanguageCode, TRANSLATIONS } from '../lib/i18n';
import { format16DigitUserId } from '../lib/idGenerator';
import { User as FirebaseUser } from 'firebase/auth';

interface PhotoGalleryProps {
  photos: Photo[];
  currentMember: Member | null;
  user: FirebaseUser | null;
  onOpenUpload: () => void;
  onRequireLogin: () => void;
  currentLang: LanguageCode;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  currentMember,
  user,
  onOpenUpload,
  onRequireLogin,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [activePhotoModal, setActivePhotoModal] = useState<Photo | null>(null);

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
    return Array.from(set).sort();
  }, [photos]);

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
        p.event.toLowerCase().includes(q);

      const matchChar = selectedCharacter === 'ALL' || p.character === selectedCharacter;
      const matchEvt = selectedEvent === 'ALL' || p.event === selectedEvent;

      return matchSearch && matchChar && matchEvt;
    });
  }, [photos, searchQuery, selectedCharacter, selectedEvent]);

  const handleLike = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    toggleLikePhoto(photo.id, photo.likesCount || 0);
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
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-pink-400" />
              <span>{t.galleryTitle}</span>
            </span>
            <span className="text-xs text-slate-400">
              {photos.length} Karya Foto Tersedia
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            KawanCosplay Photo Showcase
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mt-1">
            {t.galleryDesc}
          </p>
        </div>

        {/* Upload Action */}
        <button
          onClick={() => {
            if (user || currentMember) {
              onOpenUpload();
            } else {
              onRequireLogin();
            }
          }}
          className="px-4 py-2 rounded-xl liquid-glass-button text-white font-bold text-xs sm:text-sm shadow-md inline-flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.uploadPhoto}</span>
        </button>
      </div>

      {/* Filter and Categorization Controls */}
      <div className="liquid-glass-card rounded-2xl p-4 mb-8 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama karakter, seri, fotografer, atau event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Categorize by Character */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">Semua Karakter ({availableCharacters.length})</option>
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
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">Semua Event ({availableEvents.length})</option>
              {availableEvents.map((evt) => (
                <option key={evt} value={evt}>
                  {evt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>
            Menampilkan <strong className="text-white">{filteredPhotos.length}</strong> karya cosplay
          </span>
          {(searchQuery || selectedCharacter !== 'ALL' || selectedEvent !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCharacter('ALL');
                setSelectedEvent('ALL');
              }}
              className="text-rose-400 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
          <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Belum ada foto dalam kategori ini</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-4">
            Jadilah yang pertama mengunggah foto cosplay untuk karakter atau event ini!
          </p>
          <button
            onClick={() => {
              if (user || currentMember) onOpenUpload();
              else onRequireLogin();
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
          >
            Unggah Foto Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhotoModal(photo)}
              className="group cursor-pointer liquid-glass-card hover:border-rose-500/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-950/30 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo Image container */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-950">
                  <img
                    src={photo.photoUrl}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 blur-sm brightness-50"
                    onLoad={(e) => {
                      e.currentTarget.classList.remove('blur-sm', 'brightness-50');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                  {/* Character Badge Top */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600/90 text-white backdrop-blur-md shadow-md">
                      {photo.character}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-900/80 text-slate-300 backdrop-blur-md border border-slate-700">
                      {photo.series}
                    </span>
                  </div>

                  {/* Top right quick actions */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
                    <button
                      type="button"
                      title={currentLang === 'id' ? 'Unduh Foto' : 'Download Photo'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(photo);
                      }}
                      className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-700 text-slate-200 hover:text-white backdrop-blur-md transition-all shadow-md active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleLike(e, photo)}
                      className="p-2 rounded-full bg-slate-900/80 hover:bg-rose-600 text-slate-200 hover:text-white backdrop-blur-md transition-all flex items-center space-x-1 shadow-md"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current text-rose-400 group-hover:scale-110" />
                      <span className="text-[11px] font-bold">{photo.likesCount || 0}</span>
                    </button>
                  </div>

                  {/* Title & Author at bottom of photo */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-rose-300 transition-colors">
                      {photo.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-300">
                      <span>Oleh: <strong className="text-rose-400">{photo.authorName}</strong></span>
                      {photo.userId16 && (
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {photo.userId16.slice(-4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Meta footer */}
                <div className="p-4 bg-slate-900 text-xs space-y-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{photo.event}</span>
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

      {/* FULL PHOTO DETAILS MODAL */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in text-slate-100">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-rose-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/80 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo view */}
            <div className="md:w-3/5 bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
              <img
                src={activePhotoModal.photoUrl}
                alt={activePhotoModal.title}
                className="max-h-[70vh] w-full object-contain rounded-2xl"
              />
            </div>

            {/* Photo metadata */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                    {activePhotoModal.character}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                    {activePhotoModal.series}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
                  {activePhotoModal.title}
                </h2>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 mb-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cosplayer:</span>
                    <span className="font-bold text-rose-400">{activePhotoModal.authorName}</span>
                  </div>
                  {activePhotoModal.userId16 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">16-Digit ID:</span>
                      <span className="font-mono text-slate-300">
                        {format16DigitUserId(activePhotoModal.userId16)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Event / Lokasi:</span>
                    <span className="font-semibold text-slate-200">{activePhotoModal.event}</span>
                  </div>
                  {activePhotoModal.photographer && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fotografer:</span>
                      <span className="font-mono text-pink-300">{activePhotoModal.photographer}</span>
                    </div>
                  )}
                </div>

                {activePhotoModal.caption && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Catatan Pemotretan
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      {activePhotoModal.caption}
                    </p>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleLike(e, activePhotoModal)}
                    className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-rose-500/30"
                  >
                    <Heart className="w-4 h-4 fill-current text-rose-400" />
                    <span>Sukai ({activePhotoModal.likesCount || 0})</span>
                  </button>
                  <button
                    onClick={() => handleDownload(activePhotoModal)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-slate-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(activePhotoModal.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
