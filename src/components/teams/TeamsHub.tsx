import React, { useState } from 'react';
import {
  FireIcon as Flame,
  ArrowRight01Icon as ArrowRight,
  Edit02Icon as Edit2,
  Tick01Icon as Check,
  Cancel01Icon as X,
  UserGroupIcon as Users,
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { Team } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';
import { GlassModal } from '../ui/GlassModal';

interface TeamsHubProps {
  onSelectTeam: (team: Team) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const TeamsHub: React.FC<TeamsHubProps> = ({
  onSelectTeam,
}) => {
  const { teams, participants, editTeam } = useFestival();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [captain, setCaptain] = useState('');
  const [viceCaptain, setViceCaptain] = useState('');
  const [staffInCharge, setStaffInCharge] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOpenEditLeaders = (team: Team, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTeam(team);
    setCaptain(team.captain || '');
    setViceCaptain(team.viceCaptain || '');
    setStaffInCharge(team.staffInCharge || team.staffAdvisor || '');
    setSuccessMessage('');
  };

  const handleSaveLeaders = () => {
    if (!editingTeam) return;
    editTeam(editingTeam.id, {
      captain: captain.trim() || 'House Captain',
      viceCaptain: viceCaptain.trim() || 'Vice Captain',
      staffInCharge: staffInCharge.trim() || 'Staff In-Charge',
      staffAdvisor: staffInCharge.trim() || 'Staff In-Charge',
    });
    setSuccessMessage('Leadership saved successfully!');
    setTimeout(() => {
      setEditingTeam(null);
      setSuccessMessage('');
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Teams Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden text-slate-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                HOUSES &amp; TEAMS
              </span>
              <span className="text-xs text-amber-700 font-mono font-semibold">{teams.length} Competing Houses</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              House Rosters, Captains &amp; Standings
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Meet the royal houses of AHIA FEST 2026. Explore team rosters, captain profiles, and division point breakdown.
            </p>
          </div>

          <button
            onClick={() => handleOpenEditLeaders(teams[0])}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer self-start md:self-auto shrink-0"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Team Leaders</span>
          </button>
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
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">House Leaders</span>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditLeaders(team, e)}
                      className="text-amber-800 hover:text-amber-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
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

      {/* Edit Leaders Modal */}
      {editingTeam && (
        <GlassModal
          isOpen={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          maxWidth="lg"
          title={
            <div className="flex items-center gap-3">
              <TeamLogo logo={editingTeam.logo} name={editingTeam.name} color={editingTeam.color} size="lg" />
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-slate-900">
                  Edit House Leaders — {editingTeam.name}
                </h3>
                <p className="text-xs text-slate-500">Update Captain, Vice Captain, and Staff In-Charge</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Team Selector if user wants to switch team inside modal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Select House
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {teams.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleOpenEditLeaders(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      editingTeam.id === t.id
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  House Captain Name
                </label>
                <input
                  type="text"
                  value={captain}
                  onChange={(e) => setCaptain(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vice Captain Name
                </label>
                <input
                  type="text"
                  value={viceCaptain}
                  onChange={(e) => setViceCaptain(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff In-Charge / Advisor
                </label>
                <input
                  type="text"
                  value={staffInCharge}
                  onChange={(e) => setStaffInCharge(e.target.value)}
                  placeholder="e.g. Prof. Robert Miller"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
                />
              </div>
            </div>

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingTeam(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLeaders}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Leaders</span>
              </button>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};
