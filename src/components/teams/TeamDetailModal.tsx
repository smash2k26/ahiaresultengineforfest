import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon as Users,
  Alert02Icon as AlertTriangle,
  Edit02Icon as Edit2,
  Tick01Icon as Check,
  Cancel01Icon as X,
} from 'hugeicons-react';
import { GlassModal } from '../ui/GlassModal';
import { Team } from '../../types/festival';
import { useFestival } from '../../context/FestivalContext';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo, ParticipantAvatar } from '../ui/TeamLogo';

interface TeamDetailModalProps {
  team: Team | null;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectParticipant?: (chestNo: string) => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  team,
  onClose,
  setActiveTab,
  onSelectParticipant,
}) => {
  const { participants, teamMinuses, editTeam } = useFestival();
  const [isEditingLeaders, setIsEditingLeaders] = useState(false);
  const [captain, setCaptain] = useState(team?.captain || '');
  const [viceCaptain, setViceCaptain] = useState(team?.viceCaptain || '');
  const [staffInCharge, setStaffInCharge] = useState(team?.staffInCharge || team?.staffAdvisor || '');

  useEffect(() => {
    if (team) {
      setCaptain(team.captain || '');
      setViceCaptain(team.viceCaptain || '');
      setStaffInCharge(team.staffInCharge || team.staffAdvisor || '');
      setIsEditingLeaders(false);
    }
  }, [team]);

  if (!team) return null;

  const houseMembers = participants.filter((p) => p.teamId === team.id);
  const housePenalties = teamMinuses.filter((m) => m.teamId === team.id);

  const handleSaveLeaders = () => {
    editTeam(team.id, {
      captain: captain.trim() || 'House Captain',
      viceCaptain: viceCaptain.trim() || 'Vice Captain',
      staffInCharge: staffInCharge.trim() || 'Staff Advisor',
      staffAdvisor: staffInCharge.trim() || 'Staff Advisor',
    });
    setIsEditingLeaders(false);
  };

  const handleParticipantClick = (identifier: string) => {
    if (onSelectParticipant) {
      onSelectParticipant(identifier);
    } else {
      setActiveTab('results');
    }
    onClose();
  };

  return (
    <GlassModal
      isOpen={!!team}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-3">
          <TeamLogo logo={team.logo} name={team.name} color={team.color} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold font-display text-slate-900">
                {team.name}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Rank #{team.rank}
              </span>
            </div>
            <p className="text-xs text-amber-700 italic font-medium">&ldquo;{team.motto}&rdquo;</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* House Overview Banner */}
        <div className={`p-5 rounded-3xl bg-white border border-slate-200 shadow-sm grid grid-cols-2 ${(team.minusPoints || 0) > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4 text-center`}>
          <div className="space-y-1 p-2 rounded-2xl bg-amber-50/50 border border-amber-100">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">Total Points</span>
            <span className="text-2xl sm:text-3xl font-black font-display font-mono text-amber-700">
              {team.totalPoints}
            </span>
          </div>

          <div className="space-y-1 p-2 rounded-2xl bg-purple-50/50 border border-purple-100">
            <span className="text-[10px] font-mono uppercase text-purple-700 font-semibold block">Arts Points</span>
            <span className="text-2xl sm:text-3xl font-black font-display font-mono text-purple-800">
              {team.artsPoints}
            </span>
          </div>

          <div className="space-y-1 p-2 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] font-mono uppercase text-sky-700 font-semibold block">Sports Points</span>
            <span className="text-2xl sm:text-3xl font-black font-display font-mono text-sky-800">
              {team.sportsPoints}
            </span>
          </div>

          {(team.minusPoints || 0) > 0 && (
            <div className="space-y-1 p-2 rounded-2xl bg-rose-50/50 border border-rose-100">
              <span className="text-[10px] font-mono uppercase text-rose-700 font-semibold block">Deductions</span>
              <span className="text-2xl sm:text-3xl font-black font-display font-mono text-rose-700">
                -{team.minusPoints}
              </span>
            </div>
          )}
        </div>

        {/* House Leadership details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>👑</span> House Leadership & Officers
            </span>
            {!isEditingLeaders ? (
              <button
                onClick={() => setIsEditingLeaders(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Leaders</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveLeaders}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditingLeaders(false)}
                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {!isEditingLeaders ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block font-mono text-[10px] uppercase font-semibold">House Captain</span>
                <span className="font-bold text-slate-900 text-sm">{team.captain || 'Not Set'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-mono text-[10px] uppercase font-semibold">Vice Captain</span>
                <span className="font-bold text-slate-900 text-sm">{team.viceCaptain || 'Not Set'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-mono text-[10px] uppercase font-semibold">Staff In-Charge</span>
                <span className="font-semibold text-slate-800 text-sm">{team.staffInCharge || team.staffAdvisor || 'Not Set'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <label className="block text-slate-500 font-mono text-[10px] uppercase font-semibold mb-1">House Captain</label>
                <input
                  type="text"
                  value={captain}
                  onChange={(e) => setCaptain(e.target.value)}
                  placeholder="House Captain"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-mono text-[10px] uppercase font-semibold mb-1">Vice Captain</label>
                <input
                  type="text"
                  value={viceCaptain}
                  onChange={(e) => setViceCaptain(e.target.value)}
                  placeholder="Vice Captain"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-mono text-[10px] uppercase font-semibold mb-1">Staff In-Charge</label>
                <input
                  type="text"
                  value={staffInCharge}
                  onChange={(e) => setStaffInCharge(e.target.value)}
                  placeholder="Staff In-Charge"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* House Penalties Log if any */}
        {housePenalties.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                House Disciplinary Deductions ({housePenalties.length} Records, -{team.minusPoints || 0} pts total)
              </h4>
            </div>
            <div className="space-y-2">
              {housePenalties.map((pen) => (
                <div key={pen.id} className="p-2.5 rounded-xl bg-white border border-rose-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{pen.reason}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">{pen.category}</span>
                    </div>
                    {pen.notes && <p className="text-[11px] text-slate-500 mt-0.5">{pen.notes}</p>}
                    <span className="text-[10px] text-slate-400 font-mono">By: {pen.registeredBy} • {pen.timestamp}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                    -{pen.pointsDeducted} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roster Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              House Roster ({houseMembers.length} Registered Competitors)
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Click row to view profile</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="py-2.5 px-3">Chest No</th>
                  <th className="py-2.5 px-3">Participant</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3 text-right">Pts Contributed</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {houseMembers.map((member, idx) => (
                  <tr
                    key={member.id ? `tdm-${member.id}-${idx}` : `tdm-${member.chestNo || idx}-${idx}`}
                    onClick={() => handleParticipantClick(member.admissionNo || member.chestNo)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer text-slate-800"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-purple-700">
                      {member.chestNo}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <ParticipantAvatar
                          photo={member.photo}
                          name={member.name}
                          className="w-6 h-6 rounded-md object-cover border border-slate-200"
                        />
                        <span className="font-bold text-slate-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{member.category}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{member.gradeClass}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                      +{member.totalPoints} PTS
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-purple-600 hover:text-purple-800 text-xs font-semibold">
                        View Result →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              setActiveTab('leaderboard');
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-colors cursor-pointer"
          >
            Compare with other Houses →
          </button>
        </div>
      </div>
    </GlassModal>
  );
};
