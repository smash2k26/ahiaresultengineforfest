import React from 'react';
import { Activity02Icon as Activity, Location01Icon as MapPin, Clock01Icon as Clock, Award01Icon as Trophy, Shield02Icon as ShieldCheck, Tick01Icon as CheckCircle2, Calendar01Icon as Calendar, RadioIcon as Radio, Add01Icon as Plus } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassBadge, GlassButton } from '../ui/GlassCard';
import { SportsMatch } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';

interface SportsMatchModalProps {
  match: SportsMatch | null;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const SportsMatchModal: React.FC<SportsMatchModalProps> = ({
  match,
  onClose,
  setActiveTab,
}) => {
  const { teams } = useFestival();

  if (!match) return null;

  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);
  const winner = match.winnerId ? teams.find((t) => t.id === match.winnerId) : null;
  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';

  return (
    <GlassModal
      isOpen={!!match}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-sky-400" />
          <span className="text-base sm:text-lg font-bold font-display text-white">
            {match.title}
          </span>
        </div>
      }
      subtitle={`${match.sport} • ${match.round} • Venue: ${match.venue}`}
    >
      <div className="space-y-6">
        {/* Match Score Display Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-sky-950/40 via-[#111318] to-black/60 border border-sky-500/30 backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/8 text-xs text-gray-400">
            <span className="font-mono">{match.date}</span>
            <div className="flex items-center gap-1.5">
              {isLive && (
                <GlassBadge variant="live" size="xs" pulse>
                  <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                  LIVE NOW {match.matchTimer ? `(${match.matchTimer.minute}')` : ''}
                </GlassBadge>
              )}
              {isCompleted && (
                <GlassBadge variant="success" size="xs">
                  Full Time Result
                </GlassBadge>
              )}
              {!isLive && !isCompleted && (
                <GlassBadge variant="neutral" size="xs">
                  Scheduled Match
                </GlassBadge>
              )}
            </div>
            <span className="font-mono">{match.time}</span>
          </div>

          <div className="grid grid-cols-3 items-center py-6">
            {/* Team A */}
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="flex items-center justify-center filter drop-shadow">
                <TeamLogo logo={teamA?.logo} name={teamA?.name} color={teamA?.color} size="3xl" fallbackEmoji="🛡️" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                {teamA?.name || 'Team A'}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">
                {teamA?.shortCode}
              </span>
            </div>

            {/* Score Center */}
            <div className="text-center space-y-1">
              <div className="text-3xl sm:text-5xl font-black font-display font-mono text-white tracking-widest">
                {match.scoreA} : {match.scoreB}
              </div>
              <div className="text-xs text-sky-300 font-medium">
                {isLive ? 'Running Match' : isCompleted ? 'Final Score' : 'Kickoff'}
              </div>
            </div>

            {/* Team B */}
            <div className="text-center space-y-2 flex flex-col items-center">
              <div className="flex items-center justify-center filter drop-shadow">
                <TeamLogo logo={teamB?.logo} name={teamB?.name} color={teamB?.color} size="3xl" fallbackEmoji="⚔️" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                {teamB?.name || 'Team B'}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">
                {teamB?.shortCode}
              </span>
            </div>
          </div>

          {/* Winner Banner if match is over */}
          {isCompleted && winner && (
            <div className="mt-2 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Victory to {winner.name}</span>
              </div>
              <span className="font-mono font-bold text-amber-400">
                +{match.pointsToWinner} House Points Awarded
              </span>
            </div>
          )}
        </div>

        {/* Match Event Timeline (Goals, Points, Fouls) */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
            <span>Match Event Timeline</span>
            <span className="text-[10px] font-mono text-gray-500">
              {match.events.length} Recorded Key Events
            </span>
          </div>

          {match.events.length > 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              {match.events.map((evt, idx) => {
                const team = teams.find((t) => t.id === evt.teamId);
                const isGoal = evt.type === 'goal' || evt.type === 'point';
                return (
                  <div
                    key={evt.id || `match-evt-${match.id}-${idx}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-sm"
                  >
                    <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 font-mono font-bold text-[11px] shrink-0 border border-sky-200">
                      {evt.minute}&apos;
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{evt.playerName}</span>
                        <span className="text-[10px] text-slate-500">
                          ({team?.name || evt.teamId})
                        </span>
                        {isGoal && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            GOAL / POINT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{evt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 text-xs bg-white/[0.01] rounded-2xl border border-white/5">
              No live match events recorded yet.
            </div>
          )}
        </div>

        {/* Referees & Officials */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-gray-300">Match Officials:</span>
            <span>{match.referees && match.referees.length > 0 ? match.referees.join(' • ') : 'Certified Officials Panel'}</span>
          </div>
          <span className="font-mono text-gray-500">{match.venue}</span>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/8">
          <GlassButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </GlassButton>

          <GlassButton
            variant="sports"
            size="sm"
            onClick={() => {
              setActiveTab('leaderboard');
              onClose();
            }}
          >
            Check House Points Impact →
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
