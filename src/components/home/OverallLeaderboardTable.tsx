import React, { useState } from 'react';
import { Award01Icon as Trophy, ArrowUp01Icon as ArrowUp, ArrowDown01Icon as ArrowDown, MinusSignIcon as Minus, FilterIcon as Filter, SparklesIcon as Sparkles, FireIcon as Flame } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge } from '../ui/GlassCard';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';

interface OverallLeaderboardTableProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectTeam?: (teamId: string) => void;
}

export const OverallLeaderboardTable: React.FC<OverallLeaderboardTableProps> = ({
  setActiveTab,
  onSelectTeam,
}) => {
  const { teams, festConfig } = useFestival();
  const [boardType, setBoardType] = useState<'arts' | 'sports'>('arts');

  const applyArtsPenalties = festConfig.applyArtsPenalties ?? (festConfig.applyPenaltiesToPodium ?? true);
  const applySportsPenalties = festConfig.applySportsPenalties ?? (festConfig.applyPenaltiesToPodium ?? true);

  // Helper to compute net points
  const getTeamNetPoints = (team: typeof teams[0], type: 'arts' | 'sports') => {
    if (type === 'arts') {
      const minus = applyArtsPenalties ? (Number(team.artsMinusPoints) || 0) : 0;
      return Math.max(0, (team.artsPoints || 0) - minus);
    } else {
      const minus = applySportsPenalties ? (Number(team.sportsMinusPoints) || 0) : 0;
      return Math.max(0, (team.sportsPoints || 0) - minus);
    }
  };

  const getTeamGrossPoints = (team: typeof teams[0], type: 'arts' | 'sports') => {
    if (type === 'arts') return team.artsPoints || 0;
    return team.sportsPoints || 0;
  };

  const maxPoints = Math.max(
    ...teams.map((t) => getTeamNetPoints(t, boardType)),
    1
  );

  // Sort based on selected tab and net points
  const sortedTeams = [...teams].sort((a, b) => {
    const aNet = getTeamNetPoints(a, boardType);
    const bNet = getTeamNetPoints(b, boardType);
    if (bNet !== aNet) return bNet - aNet;
    if (b.golds !== a.golds) return b.golds - a.golds;
    return b.silvers - a.silvers;
  });

  const handleRowClick = (teamId: string) => {
    if (onSelectTeam) {
      onSelectTeam(teamId);
    } else {
      setActiveTab('teams');
    }
  };

  return (
    <GlassCard padding="none" className="overflow-hidden bg-white border-slate-200">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 shadow-2xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-wide">
              {boardType === 'arts'
                ? 'ARTS FEST HOUSE STANDINGS'
                : 'SPORTS CHAMPIONSHIP STANDINGS'}
            </h3>
            <p className="text-xs text-slate-500">
              {boardType === 'arts'
                ? 'Computed live from published Arts jury verdicts & evaluation marks'
                : 'Computed live from official Sports tournament matches & athletic points'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs: Arts / Sports */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setBoardType('arts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              boardType === 'arts'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎭</span>
            <span>Arts Standings</span>
          </button>
          <button
            onClick={() => setBoardType('sports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              boardType === 'sports'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⚽</span>
            <span>Sports Standings</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/80">
              <th className="py-3 px-4 sm:px-6 w-16 text-center">Rank</th>
              <th className="py-3 px-4">House / Team</th>
              <th className="py-3 px-3 text-right">Arts Pts</th>
              <th className="py-3 px-3 text-right">Sports Pts</th>
              <th className="py-3 px-4 sm:px-6 text-right font-bold text-slate-900">
                {boardType === 'arts' ? 'Net Arts Points' : 'Net Sports Points'}
              </th>
              <th className="py-3 px-4 text-center w-16">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedTeams.map((team, idx) => {
              const rank = idx + 1;
              const netPoints = getTeamNetPoints(team, boardType);
              const grossPoints = getTeamGrossPoints(team, boardType);
              const minusPoints = boardType === 'arts' 
                ? (Number(team.artsMinusPoints) || 0)
                : (Number(team.sportsMinusPoints) || 0);
              const percentage = Math.round((netPoints / maxPoints) * 100);

              const rankBadges = {
                1: <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-300 inline-flex items-center justify-center font-mono shadow-2xs">01</span>,
                2: <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-300 inline-flex items-center justify-center font-mono shadow-2xs">02</span>,
                3: <span className="w-7 h-7 rounded-full bg-orange-50 text-orange-800 font-bold border border-orange-300 inline-flex items-center justify-center font-mono shadow-2xs">03</span>,
              };

              return (
                <tr
                  key={team.id || `ov-team-${idx}`}
                  onClick={() => handleRowClick(team.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Rank */}
                  <td className="py-4 px-4 sm:px-6 text-center font-mono font-bold">
                    <div className="flex items-center justify-center">
                      {rank <= 3 ? rankBadges[rank as 1 | 2 | 3] : (
                        <span className="text-slate-400 text-xs font-mono">0{rank}</span>
                      )}
                    </div>
                  </td>

                  {/* Team Info & Progress Bar */}
                  <td className="py-4 px-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <TeamLogo
                          logo={team.logo}
                          name={team.name}
                          color={team.color}
                          size="md"
                          className="group-hover:scale-110 transition-transform"
                        />
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
                            <span>{team.name}</span>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {team.shortCode}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 truncate hidden sm:block">
                            Captain: {team.captain}
                          </div>
                        </div>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: team.color,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Arts Points */}
                  <td className={`py-4 px-3 text-right font-mono font-semibold ${boardType === 'arts' ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>
                    {team.artsPoints}
                  </td>

                  {/* Sports Points */}
                  <td className={`py-4 px-3 text-right font-mono font-semibold ${boardType === 'sports' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}>
                    {team.sportsPoints}
                  </td>

                  {/* Net Total Points for Active Category */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className={`text-base sm:text-lg font-black font-display font-mono ${boardType === 'arts' ? 'text-purple-600' : 'text-sky-600'}`}>
                      {netPoints}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono font-semibold">
                      {(boardType === 'arts' ? applyArtsPenalties : applySportsPenalties) && minusPoints > 0 ? (
                        <span className="text-slate-400">Gross: {grossPoints} | -{minusPoints}</span>
                      ) : (
                        <span>NET {boardType.toUpperCase()} PTS</span>
                      )}
                    </div>
                  </td>

                  {/* Trend Indicator */}
                  <td className="py-4 px-4 text-center">
                    {team.trend === 'up' && (
                      <span className="inline-flex items-center justify-center text-emerald-600 text-xs font-bold" title="Moved up in rank">
                        <ArrowUp className="w-4 h-4" />
                      </span>
                    )}
                    {team.trend === 'down' && (
                      <span className="inline-flex items-center justify-center text-rose-600 text-xs font-bold" title="Dropped in rank">
                        <ArrowDown className="w-4 h-4" />
                      </span>
                    )}
                    {team.trend === 'same' && (
                      <span className="inline-flex items-center justify-center text-slate-400 text-xs" title="No rank change">
                        <Minus className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer link to full leaderboard */}
      <div className="p-3 sm:p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Showing 5 of 5 competing houses
        </span>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className="text-purple-600 hover:text-purple-700 font-semibold transition-colors cursor-pointer"
        >
          Open Interactive Analytics & Charts →
        </button>
      </div>
    </GlassCard>
  );
};
