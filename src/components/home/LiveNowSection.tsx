import React from 'react';
import { RadioIcon as Radio, BrushIcon as Palette, Activity02Icon as Activity, Clock01Icon as Clock, Location01Icon as MapPin, UserGroupIcon as Users, ArrowRight01Icon as ArrowRight } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { ActiveTab } from '../layout/Sidebar';
import { ArtsProgram, SportsMatch } from '../../types/festival';

interface LiveNowSectionProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenArtsDetail: (program: ArtsProgram) => void;
  onOpenSportsDetail: (match: SportsMatch) => void;
}

export const LiveNowSection: React.FC<LiveNowSectionProps> = ({
  setActiveTab,
  onOpenArtsDetail,
  onOpenSportsDetail,
}) => {
  const { artsPrograms, sportsMatches, teams } = useFestival();

  const liveArts = artsPrograms.filter((a) => a.status === 'LIVE');
  const liveSports = sportsMatches.filter((s) => s.status === 'LIVE');

  if (liveArts.length === 0 && liveSports.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GlassBadge variant="live" size="sm" pulse>
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            LIVE COMPETITIONS NOW
          </GlassBadge>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Stages & Grounds currently underway
          </span>
        </div>

        <button
          onClick={() => setActiveTab('schedule')}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
        >
          View Full Timeline →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Arts Card */}
        {liveArts.length > 0 && (
          <div className="p-5 rounded-2xl bg-white border border-purple-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>Arts Stage • LIVE</span>
              </div>
              <GlassBadge variant="arts" size="xs">
                {liveArts[0].category}
              </GlassBadge>
            </div>

            {liveArts.slice(0, 1).map((program, idx) => (
              <div key={program.id || `live-arts-${idx}`} className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">{program.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      {program.stage}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      {program.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      {program.participantsCount} Participants
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-slate-500">Jury:</span>{' '}
                    <span className="text-slate-900 font-medium">
                      {program.judges && program.judges.length > 0 ? program.judges.join(', ') : 'Official Jury Panel'}
                    </span>
                  </div>
                  <GlassBadge variant="warning" size="xs">
                    Scoring in Progress
                  </GlassBadge>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">Section: {program.section} Event</span>
                  <GlassButton
                    variant="arts"
                    size="sm"
                    onClick={() => onOpenArtsDetail(program)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Stage Details
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live Sports Card with Live Score */}
        {liveSports.length > 0 && (
          <div className="p-5 rounded-2xl bg-white border border-sky-200/90 shadow-sm space-y-4">
            {liveSports.slice(0, 1).map((match, idx) => {
              const teamA = teams.find((t) => t.id === match.teamAId);
              const teamB = teams.find((t) => t.id === match.teamBId);

              return (
                <div key={match.id || `live-sp-${idx}`} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider">
                      <Activity className="w-4 h-4 text-sky-600" />
                      <span>Live Match</span>
                    </div>
                    <GlassBadge variant="sports" size="xs">
                      {match.round}
                    </GlassBadge>
                  </div>

                  {/* Match Score Display */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    {/* Team A */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-2xl">{teamA?.logo || '🛡️'}</span>
                      <div className="truncate">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {teamA?.name || 'Team A'}
                        </div>
                        <div className="text-[10px] text-slate-500">{teamA?.shortCode}</div>
                      </div>
                    </div>

                    {/* Score Center */}
                    <div className="px-3 sm:px-4 text-center shrink-0">
                      <div className="text-2xl sm:text-3xl font-black font-display font-mono text-slate-900 tracking-wider">
                        {match.scoreA} — {match.scoreB}
                      </div>
                      <div className="text-[10px] font-mono text-red-600 font-bold flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        {match.matchTimer ? `${match.matchTimer.minute}'` : 'LIVE'}
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end text-right">
                      <div className="truncate">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {teamB?.name || 'Team B'}
                        </div>
                        <div className="text-[10px] text-slate-500">{teamB?.shortCode}</div>
                      </div>
                      <span className="text-2xl">{teamB?.logo || '⚔️'}</span>
                    </div>
                  </div>

                  {/* Latest match event ticker */}
                  {match.events.length > 0 && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex items-center gap-2 truncate">
                      <span className="text-xs font-mono font-bold text-amber-600">
                        {match.events[match.events.length - 1].minute}
                      </span>
                      <span className="text-slate-600 truncate">
                        {match.events[match.events.length - 1].playerName}:{' '}
                        {match.events[match.events.length - 1].description}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                      {match.venue}
                    </span>
                    <GlassButton
                      variant="sports"
                      size="sm"
                      onClick={() => onOpenSportsDetail(match)}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Live Scoreboard & Stats
                    </GlassButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
