import React, { useMemo } from 'react';
import { Users, Sparkles, MapPin, Layers, Heart, BarChart3, PieChart, ShieldCheck } from 'lucide-react';
import { Member } from '../types';

interface StatsOverviewProps {
  members: Member[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ members }) => {
  // Aggregate stats
  const stats = useMemo(() => {
    const roleCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};
    const fandomCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {
      web_form: 0,
      google_form_sync: 0,
      spreadsheet_import: 0,
    };

    members.forEach((m) => {
      // Role
      const r = m.primaryRole || 'Lainnya';
      roleCounts[r] = (roleCounts[r] || 0) + 1;

      // City
      const c = m.city || 'Lainnya';
      cityCounts[c] = (cityCounts[c] || 0) + 1;

      // Fandom
      const f = m.fandom || 'Anime & Games';
      fandomCounts[f] = (fandomCounts[f] || 0) + 1;

      // Source
      if (m.source && sourceCounts[m.source] !== undefined) {
        sourceCounts[m.source]++;
      }
    });

    const sortedRoles = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
    const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
    const sortedFandoms = Object.entries(fandomCounts).sort((a, b) => b[1] - a[1]);

    return {
      total: members.length,
      sortedRoles,
      sortedCities,
      sortedFandoms,
      sourceCounts,
    };
  }, [members]);

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
            <span>Community Analytics</span>
          </span>
          <span className="text-xs text-slate-400">Demografi & Minat KawanCosplay</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Statistik & Demografi Komunitas
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mt-1">
          Gambaran umum ekosistem member KawanCosplay berdasarkan divisi keahlian, sebaran kota domisili, dan judul fandom favorit.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Member Terdaftar</p>
          <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">{stats.total}</h3>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <span>● 100% Terverifikasi Aktif</span>
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Web Form Pendaftaran</p>
          <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
            {stats.sourceCounts.web_form}
          </h3>
          <p className="text-[11px] text-indigo-300 mt-2">Pendaftar sistem baru</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sinkron Google Form</p>
          <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
            {stats.sourceCounts.google_form_sync}
          </h3>
          <p className="text-[11px] text-emerald-300 mt-2">Hasil Live Transition Sync</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sebaran Kota Domisili</p>
          <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
            {stats.sortedCities.length}
          </h3>
          <p className="text-[11px] text-amber-300 mt-2">Kota se-Indonesia</p>
        </div>
      </div>

      {/* Grid: Role Distribution & City Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Roles Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-2">Sebaran Peran di Komunitas</h3>
          <p className="text-xs text-slate-400 mb-6">
            Komposisi cosplayer, crafter, fotografer, makeup artist, dan crew
          </p>

          <div className="space-y-4">
            {stats.sortedRoles.map(([role, count]) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={role} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200">{role}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cities Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-2">Sebaran Regional / Kota</h3>
          <p className="text-xs text-slate-400 mb-6">
            Lokasi domisili member untuk keperluan agenda regional gathering & photoshoot
          </p>

          <div className="space-y-4">
            {stats.sortedCities.slice(0, 8).map(([city, count]) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={city} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{city}</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fandom Interests */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2">Top Fandom & Minat Karakter</h3>
        <p className="text-xs text-slate-400 mb-6">
          Judul anime, game, dan seri populer yang paling diminati untuk proyek group cosplay
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.sortedFandoms.map(([fandom, count]) => (
            <div
              key={fandom}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
            >
              <div className="min-w-0 pr-3">
                <h4 className="text-xs font-bold text-white truncate">{fandom}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Minat Proyek Cosplay</p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-mono font-bold text-xs shrink-0 border border-rose-500/30">
                {count} Member
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
