import React from 'react';
import {
  FireIcon as Flame,
  ArrowRight01Icon as ArrowRight,
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { Team } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';

interface TeamsHubProps {
  onSelectTeam: (team: Team) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const TeamsHub: React.FC<TeamsHubProps> = ({
  onSelectTeam,
}) => {
  const { teams, participants } = useFestival();

  return (
    <div className="space-y-6">
      {/* Teams Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden text-slate-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              HOUSES &amp; TEAMS
            </span>
            <span className="text-xs text-amber-700 font-mono font-semibold">5 Competing Houses</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            House Rosters, Captains &amp; Standings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Meet the 5 royal houses of AHIA FEST 2026. Explore team rosters, captain profiles, and arts &amp; sports point breakdown.
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
              className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md hover:-translate-y-1"
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
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {team.shortCode}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-700">
                          Rank #{team.rank}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-display text-slate-900 group-hover:text-amber-700 transition-colors mt-0.5">
                        {team.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black font-display font-mono text-amber-700">
                      {team.totalPoints}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono font-semibold">PTS</span>
                  </div>
                </div>

                {/* Motto */}
                <p className="text-xs text-slate-600 italic mt-3 border-l-2 pl-2.5" style={{ borderColor: team.color }}>
                  &ldquo;{team.motto}&rdquo;
                </p>

                {/* Leadership info */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Captain:</span>
                    <span className="font-bold text-slate-900">{team.captain}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Vice Captain:</span>
                    <span className="text-slate-800">{team.viceCaptain}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Staff In-Charge:</span>
                    <span className="text-slate-800">{team.staffInCharge}</span>
                  </div>
                </div>

                {/* Points Split */}
                <div className={`mt-4 grid ${(team.minusPoints || 0) > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-xs`}>
                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-center">
                    <span className="text-[10px] text-purple-700 uppercase font-mono font-semibold block truncate">Arts</span>
                    <span className="text-base font-bold font-mono text-purple-900">{team.artsPoints}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-center">
                    <span className="text-[10px] text-sky-700 uppercase font-mono font-semibold block truncate">Sports</span>
                    <span className="text-base font-bold font-mono text-sky-900">{team.sportsPoints}</span>
                  </div>
                  {(team.minusPoints || 0) > 0 && (
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-center">
                      <span className="text-[10px] text-rose-700 uppercase font-mono font-semibold block truncate">Penalties</span>
                      <span className="text-base font-bold font-mono text-rose-700">-{team.minusPoints}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-800 font-semibold group-hover:text-amber-900">
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
