import React, { useEffect, useState } from 'react';
import {
  SparklesIcon as Sparkles,
  FireIcon as Fire,
  Award01Icon as Trophy,
  CrownIcon as Crown,
  ArrowRight01Icon as ArrowRight,
  Cancel01Icon as X,
} from 'hugeicons-react';
import confetti from 'canvas-confetti';
import { useFestival } from '../../context/FestivalContext';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';

interface HomeCelebrationBannerProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const HomeCelebrationBanner: React.FC<HomeCelebrationBannerProps> = ({ setActiveTab }) => {
  const { festConfig, teams, toggleCelebrationMode, isAdminLoggedIn } = useFestival();
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasBurstOnLoad, setHasBurstOnLoad] = useState(false);

  // Determine top team
  const podiumCategory = festConfig?.podiumCategory || 'arts';
  const sortedTeams = [...teams].sort((a, b) => {
    if (podiumCategory === 'sports') {
      if (b.sportsPoints !== a.sportsPoints) return b.sportsPoints - a.sportsPoints;
      return b.totalPoints - a.totalPoints;
    }
    if (podiumCategory === 'arts') {
      if (b.artsPoints !== a.artsPoints) return b.artsPoints - a.artsPoints;
      return b.totalPoints - a.totalPoints;
    }
    return b.totalPoints - a.totalPoints;
  });

  const leadingTeam = sortedTeams[0];
  const leadingPoints = leadingTeam
    ? podiumCategory === 'sports'
      ? leadingTeam.sportsPoints
      : podiumCategory === 'arts'
      ? leadingTeam.artsPoints
      : leadingTeam.totalPoints
    : 0;

  // Custom multi-burst fireworks for Home Dashboard
  const triggerHomeFireworks = () => {
    // Center big starburst
    confetti({
      particleCount: 90,
      spread: 120,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6'],
      zIndex: 9999,
    });

    // Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 70,
        origin: { x: 0.05, y: 0.65 },
        colors: ['#F59E0B', '#F97316', '#EC4899', '#6366F1'],
        zIndex: 9999,
      });
    }, 180);

    // Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 70,
        origin: { x: 0.95, y: 0.65 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
        zIndex: 9999,
      });
    }, 360);
  };

  // Automatically trigger fireworks when user opens/views Home Dashboard in celebration mode
  useEffect(() => {
    if (festConfig?.isCelebrationMode && !hasBurstOnLoad) {
      setHasBurstOnLoad(true);
      const timer = setTimeout(() => {
        triggerHomeFireworks();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [festConfig?.isCelebrationMode, hasBurstOnLoad]);

  if (!festConfig?.isCelebrationMode || isDismissed) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Animated shimmer overlay */}
      <div className="relative bg-slate-950/90 rounded-[14px] p-4 sm:p-5 text-white backdrop-blur-md overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Title & Status */}
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="relative shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6 animate-spin duration-3000 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  🎉 Celebration Mode Active
                </span>
                <span className="text-xs text-amber-200/80 font-medium">
                  Grand Festival Finale
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white mt-1 truncate">
                {festConfig.festivalName || 'AHIA FEST'} Celebration in Full Swing!
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Championship honors, high-stakes leaderboards, and celebratory fireworks live on stage!
              </p>
            </div>
          </div>

          {/* Center / Leader badge */}
          {leadingTeam && (
            <div
              onClick={() => setActiveTab('leaderboard')}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer group shrink-0"
              title="Click to view championship standings"
            >
              <div className="relative">
                <TeamLogo
                  logoUrl={leadingTeam.logoUrl}
                  teamName={leadingTeam.name}
                  color={leadingTeam.color}
                  size="sm"
                  className="w-8 h-8 rounded-lg"
                />
                <Crown className="w-3.5 h-3.5 text-amber-300 absolute -top-1.5 -right-1.5 drop-shadow" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <span>Current Leader</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-xs font-black text-white truncate max-w-[140px]">
                  {leadingTeam.name}
                </div>
              </div>
              <div className="text-right pl-1 border-l border-white/10">
                <div className="text-xs font-mono font-black text-amber-300">
                  {leadingPoints}
                </div>
                <div className="text-[9px] text-slate-400 uppercase font-semibold">PTS</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={triggerHomeFireworks}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <Fire className="w-4 h-4 text-amber-200" />
              <span>💥 Blast Fireworks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Podium</span>
            </button>

            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => toggleCelebrationMode(false)}
                title="Turn Celebration Mode OFF (Admin)"
                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
