import React, { useState } from 'react';
import { Award01Icon as Trophy, FireIcon as Flame, UserGroupIcon as Users, Award01Icon as Award, BrushIcon as Palette, Activity02Icon as Activity, ArrowRight01Icon as ArrowRight, SparklesIcon as Sparkles } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { Team } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';

interface TeamsHubProps {
  onSelectTeam: (team: Team) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const TeamsHub: React.FC<TeamsHubProps> = ({
  onSelectTeam,
  setActiveTab,
}) => {
  const { teams, participants } = useFestival();

  return (
    <div className="space-y-6">
      {/* Teams Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/30 via-[#111318] to-[#0A0C10] border border-amber-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <GlassBadge variant="gold" size="sm">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              HOUSES & TEAMS
            </GlassBadge>
            <span className="text-xs text-amber-300 font-mono">5 Competing Houses</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            House Rosters, Captains & Standings
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Meet the 5 royal houses of AHIA FEST 2026. Explore team rosters, captain profiles, arts & sports point breakdown, and championship medals.
          </p>
        </div>
      </div>

      {/* Houses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, idx) => {
          const houseParticipants = participants.filter((p) => p.teamId === team.id);

          return (
            <div
              key={team.id ? `th-team-${team.id}-${idx}` : `th-team-${idx}`}
              onClick={() => onSelectTeam(team)}
              className="p-6 rounded-3xl bg-[#111318]/90 border border-white/8 hover:border-amber-500/40 backdrop-blur-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-5 shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* House Crest Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <TeamLogo
                      logo={team.logo}
                      name={team.name}
                      color={team.color}
                      size="2xl"
                      className="filter drop-shadow group-hover:scale-110 transition-transform"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                          {team.shortCode}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          Rank #{team.rank}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-display text-white group-hover:text-amber-300 transition-colors mt-0.5">
                        {team.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black font-display font-mono text-amber-400">
                      {team.totalPoints}
                    </span>
                    <span className="text-[10px] text-gray-500 block font-mono">PTS</span>
                  </div>
                </div>

                {/* Motto */}
                <p className="text-xs text-gray-400 italic mt-3 border-l-2 pl-2.5" style={{ borderColor: team.color }}>
                  &ldquo;{team.motto}&rdquo;
                </p>

                {/* Leadership info */}
                <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 text-xs text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Captain:</span>
                    <span className="font-semibold text-white">{team.captain}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Vice Captain:</span>
                    <span className="text-gray-300">{team.viceCaptain}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-gray-400">Staff In-Charge:</span>
                    <span className="text-gray-300">{team.staffInCharge}</span>
                  </div>
                </div>

                {/* Points Split & Medals */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-center">
                    <span className="text-[10px] text-purple-400 uppercase font-mono block">Arts Points</span>
                    <span className="text-base font-bold font-mono text-purple-300">{team.artsPoints}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-950/20 border border-sky-500/20 text-center">
                    <span className="text-[10px] text-sky-400 uppercase font-mono block">Sports Points</span>
                    <span className="text-base font-bold font-mono text-sky-300">{team.sportsPoints}</span>
                  </div>
                </div>

                {/* Medals Row */}
                <div className="mt-3 flex items-center justify-around p-2 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
                  <span className="text-amber-400">🥇 {team.golds} Gold</span>
                  <span className="text-slate-300">🥈 {team.silvers} Silver</span>
                  <span className="text-amber-600">🥉 {team.bronzes} Bronze</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-amber-300 font-semibold group-hover:text-amber-200">
                <span>View House Roster ({houseParticipants.length} students)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
