import React, { useState } from 'react';
import { X, Upload, Camera, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Member, Photo } from '../types';
import { addPhotoToFirestore } from '../lib/galleryService';

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
  const [photoUrl, setPhotoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [character, setCharacter] = useState('');
  const [series, setSeries] = useState('');
  const [event, setEvent] = useState('Comic Frontier (Comifuro)');
  const [customEvent, setCustomEvent] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!photoUrl) {
      setErrorMsg('Mohon unggah file foto cosplay atau masukkan URL gambar.');
      return;
    }

    if (!character.trim() || !series.trim() || !title.trim()) {
      setErrorMsg('Nama karakter, serial anime/game, dan judul foto wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalEvent = event === 'Lainnya (Tulis Sendiri)' && customEvent ? customEvent.trim() : event;

      const newPhotoPayload: Omit<Photo, 'id'> = {
        memberId: currentMember.id,
        userId16: currentMember.userId16,
        authorName: currentMember.cosplayName || currentMember.fullName || 'Member',
        authorCosname: currentMember.cosplayName,
        authorAvatar: currentMember.avatarUrl,
        photoUrl,
        title: title.trim(),
        character: character.trim(),
        series: series.trim(),
        event: finalEvent,
        photographer: photographer.trim() || undefined,
        caption: caption.trim() || undefined,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      };

      const docId = await addPhotoToFirestore(newPhotoPayload);
      const created: Photo = {
        id: docId,
        ...newPhotoPayload,
      };

      onPhotoAdded(created);
      onClose();
    } catch (err: unknown) {
      console.error('Upload photo error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengunggah foto ke galeri.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-slate-100">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-block mb-2">
            Galeri Komunitas MyKCC
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">Unggah Karya Foto Cosplay</h3>
          <p className="text-xs text-slate-400 mt-1">
            Karya fotomu akan tampil di galeri publik dan dapat dicari berdasarkan karakter serta event.
          </p>
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
              File Foto Cosplay <span className="text-rose-400">*</span>
            </label>

            {photoUrl ? (
              <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-slate-950 border border-rose-500/40 mb-2 group">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-3 right-3 p-2 bg-slate-950/80 text-white rounded-xl text-xs hover:bg-rose-600 transition-colors"
                >
                  Ganti Foto
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-700 hover:border-rose-500/60 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors">
                <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-semibold mb-2">
                  Pilih file gambar dari galeri perangkatmu (JPG, PNG, WebP)
                </p>
                <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors border border-slate-700">
                  <Upload className="w-4 h-4 text-rose-400" />
                  <span>Pilih File Gambar</span>
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
                Judul Foto / Konsep <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Raiden Shogun - Inazuma Castle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Nama Karakter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Karakter yang Dicosplaykan <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Frieren, Furina, Gojo Satoru"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Serial / Series */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Serial Anime / Game / Fandom <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Genshin Impact, Sousou no Frieren"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Event */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Event / Tempat Pemotretan
              </label>
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="Comic Frontier (Comifuro)">Comic Frontier (Comifuro)</option>
                <option value="Anime Festival Asia (AFA ID)">Anime Festival Asia (AFA ID)</option>
                <option value="Indonesia Comic Con (ICC)">Indonesia Comic Con (ICC)</option>
                <option value="Jakarta Cosplay Parade Monas">Jakarta Cosplay Parade Monas</option>
                <option value="KawanCosplay Monthly Gathering">KawanCosplay Monthly Gathering</option>
                <option value="Outdoor Nature Photoshoot">Outdoor Nature Photoshoot</option>
                <option value="Indoor Studio Session">Indoor Studio Session</option>
                <option value="Japanese Matsuri / Culture Fest">Japanese Matsuri / Culture Fest</option>
                <option value="Lainnya (Tulis Sendiri)">Lainnya (Tulis Sendiri)</option>
              </select>

              {event === 'Lainnya (Tulis Sendiri)' && (
                <input
                  type="text"
                  placeholder="Ketik nama event / lokasi"
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
              Kredit Fotografer / Kru
            </label>
            <input
              type="text"
              placeholder="@fotografer_name atau Nama Studio"
              value={photographer}
              onChange={(e) => setPhotographer(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Keterangan / Caption */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Caption / Cerita di Balik Kostum
            </label>
            <textarea
              rows={2}
              placeholder="Ceritakan proses pembuatan kostum, props, atau keseruan saat event..."
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
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Unggah ke Galeri</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
