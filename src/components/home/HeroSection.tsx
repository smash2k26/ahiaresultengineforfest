import React from 'react';
import { SparklesIcon as Sparkles, UserGroupIcon as Users, Award01Icon as Award, BrushIcon as Palette, Activity02Icon as Activity, Tick01Icon as CheckCircle2, FireIcon as Flame, RadioIcon as Radio, Location01Icon as MapPin, Calendar01Icon as Calendar, Megaphone01Icon as Megaphone, Video01Icon as Video, LinkSquare01Icon as ExternalLink } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { ActiveTab } from '../layout/Sidebar';

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
      label: 'Total Programs',
      value: stats.totalPrograms,
      sub: 'Arts & Sports events',
      icon: <Flame className="w-4 h-4 text-amber-500" />,
      tab: 'schedule' as ActiveTab,
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
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {getStatusBadge()}
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-slate-900 leading-tight">
                {festConfig?.festivalName || 'AHIA FEST'}{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  {festConfig?.year || '2026'}
                </span>
              </h1>
              <p className="text-xs sm:text-base text-slate-700 font-medium tracking-wide mt-1">
                {festConfig?.tagline || 'Annual Inter-House Arts & Athletics Fest'}
                {festConfig?.theme && (
                  <span className="italic text-purple-700 ml-1.5">— &ldquo;{festConfig.theme}&rdquo;</span>
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

          {/* Quick House Standings Snippet */}
          <div className="lg:w-80 p-4 rounded-2xl bg-white border border-slate-200 shrink-0 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Top Contenders
              </span>
              <span className="text-[10px] font-mono font-semibold text-purple-600">Live Points</span>
            </div>

            <div className="space-y-2">
              {teams.slice(0, 3).map((team, idx) => (
                <div
                  key={team.id || `hero-team-${idx}`}
                  onClick={() => setActiveTab('leaderboard')}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-100 hover:border-purple-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400 w-4">
                      0{idx + 1}
                    </span>
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs text-white font-bold"
                      style={{ backgroundColor: team.color || '#4f46e5' }}
                    >
                      {team.logo || team.name.slice(0, 1)}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-600">
                      {team.totalPoints}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">PTS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Animated Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={`stat-card-${stat.label}-${idx}`}
            onClick={() => setActiveTab(stat.tab)}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                {stat.icon}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-semibold">0{idx + 1}</span>
            </div>

            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">{stat.label}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
