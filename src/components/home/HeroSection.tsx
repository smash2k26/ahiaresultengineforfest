import React from 'react';
import { SparklesIcon as Sparkles, UserGroupIcon as Users, Award01Icon as Award, BrushIcon as Palette, Activity02Icon as Activity, Tick01Icon as CheckCircle2, FireIcon as Flame, FireIcon as Fire, RadioIcon as Radio, Location01Icon as MapPin, Calendar01Icon as Calendar, Megaphone01Icon as Megaphone, Video01Icon as Video, LinkSquare01Icon as ExternalLink } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo, formatImageUrl, isImageUrl } from '../ui/TeamLogo';

interface HeroSectionProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ setActiveTab }) => {
  const { stats, teams, festConfig } = useFestival();

  const statCards = [
    {
      label: 'Total Participants',
      value: stats.totalParticipants,
      sub: 'Enrolled students',
      icon: <Users className="w-4 h-4 text-sky-500" />,
      tab: 'participants' as ActiveTab,
    },
    {
      label: 'Arts Programs',
      value: stats.artsPrograms,
      sub: 'Cultural stages',
      icon: <Palette className="w-4 h-4 text-purple-500" />,
      tab: 'arts' as ActiveTab,
    },
    {
      label: 'Sports Events',
      value: stats.sportsEvents,
      sub: 'Grounds & Arenas',
      icon: <Activity className="w-4 h-4 text-blue-500" />,
      tab: 'sports' as ActiveTab,
    },
    {
      label: 'Results Published',
      value: `${stats.resultsPublished} / ${stats.totalPrograms}`,
      sub: `${stats.liveEventsCount} live now`,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      tab: 'leaderboard' as ActiveTab,
    },
  ];

  const getStatusBadge = () => {
    const banner = festConfig?.statusBanner || 'LIVE';
    if (banner === 'LIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          LIVE FESTIVAL ACTIVE
        </span>
      );
    }
    if (banner === 'UPCOMING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Calendar className="w-3.5 h-3.5" />
          UPCOMING FESTIVAL
        </span>
      );
    }
    if (banner === 'CONCLUDED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          FESTIVAL CONCLUDED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <Radio className="w-3.5 h-3.5" />
        TEMPORARILY PAUSED
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 lg:p-10 transition-all ${
          festConfig?.isCelebrationMode
            ? 'border-2 border-amber-400/90 shadow-lg shadow-amber-100/60 ring-2 ring-amber-300/30'
            : 'border border-slate-200 shadow-xs'
        }`}
      >
        {festConfig?.bannerUrl && isImageUrl(festConfig.bannerUrl) && (
          <div className="absolute inset-0 z-0">
            <img
              src={formatImageUrl(festConfig.bannerUrl)}
              alt="Festival Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70" />
          </div>
        )}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {getStatusBadge()}
              {festConfig?.isCelebrationMode && (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('fest-trigger-fireworks'))}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 text-white shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  title="Click to launch fireworks!"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin duration-3000" />
                  <span>🎉 CELEBRATION ACTIVE</span>
                </button>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-slate-900 leading-tight">
                {festConfig?.festivalName || 'AHIA FEST'}{' '}
                <span style={{ color: 'var(--fest-accent)' }}>
                  {festConfig?.year || '2026'}
                </span>
              </h1>
              <p className="text-xs sm:text-base text-slate-700 font-medium tracking-wide mt-1">
                {festConfig?.tagline || 'Annual Inter-House Arts & Athletics Fest'}
                {festConfig?.theme && (
                  <span className="italic ml-1.5" style={{ color: 'var(--fest-accent)' }}>— &ldquo;{festConfig.theme}&rdquo;</span>
                )}
              </p>
            </div>

            {festConfig.organizedBy && (
              <strong className="text-slate-700 font-semibold block text-sm">
                {festConfig.organizedBy}
              </strong>
            )}

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Real-time scoring, live stage verdicts, digital result lookups, and instant team standings powered by the AHIA Result Engine.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <GlassButton
                variant="gold"
                size="md"
                onClick={() => setActiveTab('results')}
                icon={<Award className="w-4 h-4 text-slate-900" />}
              >
                Check Your Result
              </GlassButton>

              {festConfig?.isCelebrationMode && (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('fest-trigger-fireworks'))}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  title="Launch multi-cannon celebratory fireworks!"
                >
                  <Fire className="w-4 h-4 text-amber-200" />
                  <span>💥 Launch Fireworks</span>
                </button>
              )}

              {festConfig?.liveStreamUrl && (
                <a
                  href={festConfig.liveStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs"
                >
                  <Video className="w-4 h-4 text-rose-600" />
                  <span>Watch Live Webcast</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Animated Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={`stat-card-${stat.label}-${idx}`}
            onClick={() => setActiveTab(stat.tab)}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                {stat.icon}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-semibold">0{idx + 1}</span>
            </div>

            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight transition-colors">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-black mt-0.5">{stat.label}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
