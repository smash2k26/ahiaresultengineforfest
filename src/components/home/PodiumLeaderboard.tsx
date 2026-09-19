import React from 'react';
import { Award01Icon as Trophy, CrownIcon as Crown, ArrowUpRight01Icon as TrendingUp, SparklesIcon as Sparkles, BrushIcon as Palette, Activity02Icon as Activity } from 'hugeicons-react';
import confetti from 'canvas-confetti';
import { useFestival } from '../../context/FestivalContext';
import { Team } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';

interface PodiumLeaderboardProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const PodiumLeaderboard: React.FC<PodiumLeaderboardProps> = ({ setActiveTab }) => {
  const { teams, festConfig } = useFestival();

  if (teams.length < 3) return null;

  const [mode, setMode] = React.useState<'championship' | 'sports' | 'arts'>('championship');
  const applyArtsPenalties = festConfig.applyArtsPenalties ?? (festConfig.applyPenaltiesToPodium ?? true);
  const applySportsPenalties = festConfig.applySportsPenalties ?? (festConfig.applyPenaltiesToPodium ?? true);

  // Calculate final championship points for a team
  // teamFinalPoints = SubJuniorPoints + JuniorPoints + SeniorPoints + GeneralPoints - MinusPoints
  const getTeamPoints = (team: Team, selectedMode: 'championship' | 'sports' | 'arts') => {
    if (!team) return 0;
    if (selectedMode === 'sports') {
      const minus = applySportsPenalties ? (Number(team.sportsMinusPoints) || 0) : 0;
      return Math.max(0, (Number(team.sportsPoints) || 0) - minus);
    }
    if (selectedMode === 'arts') {
      const minus = applyArtsPenalties ? (Number(team.artsMinusPoints) || 0) : 0;
      return Math.max(0, (Number(team.artsPoints) || 0) - minus);
    }
    // Championship (Overall)
    if (team.netGrandTotal !== undefined && team.netGrandTotal !== null) {
      return Number(team.netGrandTotal) || 0;
    }
    if (team.totalPoints !== undefined && team.totalPoints !== null) {
      return Number(team.totalPoints) || 0;
    }
    const sub = Number(team.subJuniorPoints) || 0;
    const jun = Number(team.juniorPoints) || 0;
    const sen = Number(team.seniorPoints) || 0;
    const gen = Number(team.generalPoints) || 0;
    const minus = Number(team.minusPoints) || 0;
    return Math.max(0, sub + jun + sen + gen - minus);
  };

  // Sort teams strictly DESCENDING by calculated final points
  const sortedTeams = [...teams].sort((a, b) => {
    const ptsA = getTeamPoints(a, mode);
    const ptsB = getTeamPoints(b, mode);
    if (ptsB !== ptsA) return ptsB - ptsA;
    if (b.golds !== a.golds) return (b.golds || 0) - (a.golds || 0);
    return (b.silvers || 0) - (a.silvers || 0);
  });

  const first = sortedTeams[0] || teams[0];
  const second = sortedTeams[1] || teams[1];
  const third = sortedTeams[2] || teams[2];

  const firstPts = getTeamPoints(first, mode);
  const secondPts = getTeamPoints(second, mode);
  const thirdPts = getTeamPoints(third, mode);
  const leadDiff = secondPts > 0 ? Math.round(((firstPts - secondPts) / secondPts) * 100) : 0;

  const getCategoryTitle = () => {
    if (mode === 'sports') return 'PODIUM — SPORTS STANDINGS';
    if (mode === 'arts') return 'PODIUM — ARTS STANDINGS';
    return 'CHAMPIONSHIP PODIUM — FINAL STANDINGS';
  };

  const getLeaderBadge = () => {
    if (mode === 'sports') return '⚽ SPORTS LEADER';
    if (mode === 'arts') return '🎭 ARTS LEADER';
    return '🏆 CHAMPIONSHIP LEADER';
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#A855F7', '#38BDF8', '#10B981', '#EC4899', '#EF4444'],
      zIndex: 99999,
    });
    if (festConfig?.isCelebrationMode) {
      window.dispatchEvent(new CustomEvent('fest-trigger-fireworks'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {mode === 'sports' ? (
            <Activity className="w-5 h-5 text-sky-500" />
          ) : mode === 'arts' ? (
            <Palette className="w-5 h-5 text-purple-500" />
          ) : (
            <Trophy className="w-5 h-5 text-amber-500" />
          )}
          <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-wide">
            {getCategoryTitle()}
          </h2>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMode('championship')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'championship'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏆 Championship
          </button>
          <button
            onClick={() => setMode('sports')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'sports'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚽ Sports
          </button>
          <button
            onClick={() => setMode('arts')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mode === 'arts'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎭 Arts
          </button>
        </div>

        <button
          onClick={triggerConfetti}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs ${
            festConfig?.isCelebrationMode
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold animate-pulse hover:brightness-110'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{festConfig?.isCelebrationMode ? '🎉 Blast Fireworks' : 'Celebrate #1'}</span>
        </button>
      </div>

      {/* Podium Layout: #2 on Left, #1 in Center (Taller & Glowing), #3 on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-6">
        {/* #2 RUNNER UP (Left) */}
        <div
          onClick={() => setActiveTab('leaderboard')}
          className="order-2 md:order-1 relative rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all duration-200 cursor-pointer group"
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
              🥈 2nd Place
            </span>
          </div>

          <div className="text-center pt-3 space-y-2">
            <div className="flex items-center justify-center filter drop-shadow-xs group-hover:scale-110 transition-transform">
              <TeamLogo logo={second.logo} name={second.name} color={second.color} size="2xl" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-purple-600 transition-colors">
                {second.name}
              </h3>
              <p className="text-[11px] text-slate-500">Captain: {second.captain || 'House Captain'}</p>
            </div>

            <div className="py-2">
              <div className="text-2xl font-black font-display text-slate-900 font-mono">
                {secondPts}
                <span className="text-xs font-sans text-slate-500 font-semibold ml-1">PTS</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2 mt-1">
                {mode === 'sports' ? (
                  <span className="text-sky-600 font-semibold">Sports Points</span>
                ) : mode === 'arts' ? (
                  <span className="text-purple-600 font-semibold">Arts Points</span>
                ) : (
                  <span className="text-slate-600 font-semibold">Overall Grand Total</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* #1 CHAMPION (Center - Crown & Golden Glow) */}
        <div
          onClick={() => {
            triggerConfetti();
            setActiveTab('leaderboard');
          }}
          className="order-1 md:order-2 relative rounded-3xl bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 border-2 border-amber-300 hover:border-amber-400 p-6 shadow-md glow-gold transition-all duration-300 cursor-pointer group transform md:-translate-y-2"
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <Crown className="w-7 h-7 text-amber-500 drop-shadow-sm animate-bounce" />
            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              {getLeaderBadge()}
            </span>
          </div>

          <div className="text-center pt-5 space-y-3">
            <div className="flex items-center justify-center filter drop-shadow-sm group-hover:scale-115 transition-transform duration-300">
              <TeamLogo logo={first.logo} name={first.name} color={first.color} size="3xl" />
            </div>

            <div>
              <h3 className="text-xl font-black font-display tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                {first.name}
              </h3>
              <p className="text-xs text-amber-800 font-medium">Captain: {first.captain || 'House Captain'}</p>
            </div>

            <div className="py-2 px-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="text-3xl sm:text-4xl font-black font-display text-amber-700 font-mono tracking-tight">
                {firstPts}
                <span className="text-sm font-sans text-amber-900/70 font-bold ml-1.5">PTS</span>
              </div>
              <div className="text-xs text-slate-600 flex items-center justify-center gap-3 mt-1 font-medium">
                {mode === 'sports' ? (
                  <span className="text-sky-700 font-bold">Leading in Sports Points</span>
                ) : mode === 'arts' ? (
                  <span className="text-purple-700 font-bold">Leading in Arts Points</span>
                ) : (
                  <span className="text-amber-800 font-bold">Leading Overall Standings</span>
                )}
              </div>
            </div>

            {leadDiff > 0 && (
              <div className="flex items-center justify-center pt-1 border-t border-amber-100 text-xs">
                <span className="text-emerald-600 font-sans font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +{leadDiff}% Lead
                </span>
              </div>
            )}
          </div>
        </div>

        {/* #3 THIRD PLACE (Right) */}
        <div
          onClick={() => setActiveTab('leaderboard')}
          className="order-3 relative rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all duration-200 cursor-pointer group"
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
              🥉 3rd Place
            </span>
          </div>

          <div className="text-center pt-3 space-y-2">
            <div className="flex items-center justify-center filter drop-shadow-xs group-hover:scale-110 transition-transform">
              <TeamLogo logo={third.logo} name={third.name} color={third.color} size="2xl" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-orange-600 transition-colors">
                {third.name}
              </h3>
              <p className="text-[11px] text-slate-500">Captain: {third.captain || 'House Captain'}</p>
            </div>

            <div className="py-2">
              <div className="text-2xl font-black font-display text-slate-900 font-mono">
                {thirdPts}
                <span className="text-xs font-sans text-slate-500 font-semibold ml-1">PTS</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2 mt-1">
                {mode === 'sports' ? (
                  <span className="text-sky-600 font-semibold">Sports Points</span>
                ) : mode === 'arts' ? (
                  <span className="text-purple-600 font-semibold">Arts Points</span>
                ) : (
                  <span className="text-slate-600 font-semibold">Overall Grand Total</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
