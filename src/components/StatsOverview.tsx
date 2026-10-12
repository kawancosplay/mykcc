import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, MapPin, Layers, Heart, BarChart3, PieChart, ShieldCheck } from 'lucide-react';
import { Member } from '../types';
import { SPRING, useReducedMotion } from '../lib/motion';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

interface StatsOverviewProps {
  members: Member[];
}

// Buckets for members without a role / city (OTHER_BUCKET) or fandom (DEFAULT_FANDOM_BUCKET). They are only
// grouping keys (also matching stored values with the same text); their display labels are translated.
const OTHER_BUCKET = 'Lainnya';
const DEFAULT_FANDOM_BUCKET = 'Anime & Games';
// A Map, not an object literal, so member-typed values like "constructor" never hit Object.prototype.
const BUCKET_LABEL_KEYS = new Map<string, TranslationKey>([
  [OTHER_BUCKET, 'stats.otherLabel'],
  [DEFAULT_FANDOM_BUCKET, 'stats.fandomAnimeGames'],
]);

// Distribution bars grow from their start edge when the stats appear (one after another), then follow
// member updates with their CSS width transition. Reduced motion: drawn at full size at once.
const BAR_STAGGER_STEP = 0.03; // s between two bars
const BAR_STAGGER_LIMIT = 8;

/** Bar fill: grows via scaleX (transform only; the bar holds no children) from the inline-start edge. */
const DistributionBar: React.FC<{ pct: number; index: number; reduced: boolean; className: string }> = ({
  pct,
  index,
  reduced,
  className,
}) => (
  <motion.div
    className={`${className} h-2.5 rounded-full origin-left rtl:origin-right transition-[width] duration-500 ease-out-soft`}
    style={{ width: `${pct}%` }}
    initial={reduced ? false : { scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ ...SPRING.page, delay: Math.min(index, BAR_STAGGER_LIMIT) * BAR_STAGGER_STEP }}
  />
);

export const StatsOverview: React.FC<StatsOverviewProps> = ({ members }) => {
  const { t, formatNumber, intlLocale } = useI18n();
  const reducedMotion = useReducedMotion() === true;

  const pluralRules = useMemo(() => {
    try {
      return new Intl.PluralRules(intlLocale);
    } catch {
      return null;
    }
  }, [intlLocale]);
  const isOne = (count: number) => (pluralRules ? pluralRules.select(count) === 'one' : count === 1);

  const bucketLabel = (value: string) => {
    const key = BUCKET_LABEL_KEYS.get(value);
    return key ? t(key) : value;
  };

  // "12 (34%)" with locale-aware number and percent formatting
  const countWithPercent = (count: number, pct: number) =>
    t('stats.countWithPercent', {
      count: formatNumber(count),
      percent: formatNumber(pct / 100, { style: 'percent', maximumFractionDigits: 0 }),
    });

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
      const r = m.primaryRole || OTHER_BUCKET;
      roleCounts[r] = (roleCounts[r] || 0) + 1;

      // City
      const c = m.city || OTHER_BUCKET;
      cityCounts[c] = (cityCounts[c] || 0) + 1;

      // Fandom
      const f = m.fandom || DEFAULT_FANDOM_BUCKET;
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
          <span className="glass-chip font-bold bg-rose-500/20 text-rose-300 border-rose-500/30">
            <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('stats.badge')}</span>
          </span>
          <span className="text-xs text-slate-400">{t('stats.subtitle')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {t('stats.title')}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mt-1">
          {t('stats.description')}
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('admin.totalMembers')}</p>
          <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">{formatNumber(stats.total)}</h3>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <span>● {t('stats.allVerifiedActive')}</span>
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('stats.webFormLabel')}</p>
          <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
            {formatNumber(stats.sourceCounts.web_form)}
          </h3>
          <p className="text-[11px] text-indigo-300 mt-2">{t('stats.webFormDesc')}</p>
        </div>

        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('stats.googleFormLabel')}</p>
          <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
            {formatNumber(stats.sourceCounts.google_form_sync)}
          </h3>
          <p className="text-[11px] text-emerald-300 mt-2">{t('stats.googleFormDesc')}</p>
        </div>

        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('stats.citiesLabel')}</p>
          <h3 className="text-3xl sm:text-4xl font-black text-white mt-1">
            {formatNumber(stats.sortedCities.length)}
          </h3>
          <p className="text-[11px] text-amber-300 mt-2">{t('stats.citiesDesc')}</p>
        </div>
      </div>

      {/* Grid: Role Distribution & City Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Roles Breakdown */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-2">{t('stats.rolesTitle')}</h3>
          <p className="text-xs text-slate-400 mb-6">
            {t('stats.rolesDesc')}
          </p>

          <div className="space-y-4">
            {stats.sortedRoles.map(([role, count], index) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={role} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200">{bucketLabel(role)}</span>
                    <span className="text-slate-400 font-mono">
                      {countWithPercent(count, pct)}
                    </span>
                  </div>
                  <div className="w-full glass-well rounded-full h-2.5 overflow-hidden">
                    <DistributionBar
                      pct={pct}
                      index={index}
                      reduced={reducedMotion}
                      className="bg-gradient-to-r from-rose-500 to-pink-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cities Breakdown */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-2">{t('stats.regionsTitle')}</h3>
          <p className="text-xs text-slate-400 mb-6">
            {t('stats.regionsDesc')}
          </p>

          <div className="space-y-4">
            {stats.sortedCities.slice(0, 8).map(([city, count], index) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={city} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{bucketLabel(city)}</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      {countWithPercent(count, pct)}
                    </span>
                  </div>
                  <div className="w-full glass-well rounded-full h-2.5 overflow-hidden">
                    <DistributionBar
                      pct={pct}
                      index={index}
                      reduced={reducedMotion}
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fandom Interests */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-2">{t('stats.fandomsTitle')}</h3>
        <p className="text-xs text-slate-400 mb-6">
          {t('stats.fandomsDesc')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.sortedFandoms.map(([fandom, count]) => (
            <div
              key={fandom}
              className="glass-well p-4 rounded-2xl flex items-center justify-between"
            >
              <div className="min-w-0 pr-3">
                <h4 className="text-xs font-bold text-white truncate">{bucketLabel(fandom)}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{t('stats.fandomInterest')}</p>
              </div>
              <span className="glass-chip font-mono font-bold bg-rose-500/20 text-rose-300 border-rose-500/30 shrink-0">
                {t(isOne(count) ? 'stats.memberCountOne' : 'stats.memberCountOther', { count: formatNumber(count) })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
