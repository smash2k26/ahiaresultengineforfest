import React, { useState } from 'react';
import { FireIcon as Flame, UserGroupIcon as Users, Award01Icon as Trophy, Award01Icon as Award, BrushIcon as Palette, Activity02Icon as Activity, ArrowRight01Icon as ArrowRight, Shield02Icon as ShieldCheck, Tick01Icon as CheckCircle2 } from 'hugeicons-react';
import { GlassModal } from '../ui/GlassModal';
import { GlassBadge, GlassButton } from '../ui/GlassCard';
import { Team } from '../../types/festival';
import { useFestival } from '../../context/FestivalContext';
import { ActiveTab } from '../layout/Sidebar';

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
  const { participants } = useFestival();
  const [tab, setTab] = useState<'roster' | 'analytics'>('roster');

  if (!team) return null;

  const houseMembers = participants.filter((p) => p.teamId === team.id);

  const handleParticipantClick = (chestNo: string) => {
    if (onSelectParticipant) {
      onSelectParticipant(chestNo);
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
          <span className="text-3xl">{team.logo}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold font-display text-white">
                {team.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">
                Rank #{team.rank}
              </span>
            </div>
            <p className="text-xs text-amber-400/80 italic">&ldquo;{team.motto}&rdquo;</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* House Overview Banner */}
        <div className="p-5 rounded-3xl bg-black/40 border border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Points</span>
            <span className="text-2xl sm:text-3xl font-black font-display font-mono text-amber-400">
              {team.totalPoints}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-purple-400 block">Arts Points</span>
            <span className="text-2xl sm:text-3xl font-black font-display font-mono text-purple-300">
              {team.artsPoints}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-sky-400 block">Sports Points</span>
            <span className="text-2xl sm:text-3xl font-black font-display font-mono text-sky-300">
              {team.sportsPoints}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-400 block">Medals Tally</span>
            <div className="text-xs sm:text-sm font-mono font-bold text-white pt-1">
              🥇 {team.golds} | 🥈 {team.silvers} | 🥉 {team.bronzes}
            </div>
          </div>
        </div>

        {/* House Leadership details */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-gray-400 block font-mono text-[10px] uppercase">Captain</span>
            <span className="font-bold text-white text-sm">{team.captain}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-mono text-[10px] uppercase">Vice Captain</span>
            <span className="font-bold text-white text-sm">{team.viceCaptain}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-mono text-[10px] uppercase">Staff In-Charge</span>
            <span className="font-semibold text-gray-300">{team.staffInCharge}</span>
          </div>
        </div>

        {/* Roster Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" />
              House Roster ({houseMembers.length} Registered Competitors)
            </h4>
            <span className="text-[10px] text-gray-400 font-mono">Click to check marks</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/8 bg-black/30">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/8 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/[0.02]">
                  <th className="py-2.5 px-3">Chest No</th>
                  <th className="py-2.5 px-3">Participant</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3 text-center">Medals</th>
                  <th className="py-2.5 px-3 text-right">Pts Contributed</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {houseMembers.map((member, idx) => (
                  <tr
                    key={member.id ? `tdm-${member.id}-${idx}` : `tdm-${member.chestNo || idx}-${idx}`}
                    onClick={() => handleParticipantClick(member.chestNo)}
                    className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-purple-300">
                      {member.chestNo}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-6 h-6 rounded-md object-cover"
                        />
                        <span className="font-bold text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{member.category}</td>
                    <td className="py-3 px-3 text-gray-400 font-mono">{member.gradeClass}</td>
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      🥇 {member.golds} 🥈 {member.silvers} 🥉 {member.bronzes}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                      +{member.totalPoints} PTS
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-purple-400 hover:text-purple-300 text-xs font-semibold">
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
        <div className="flex items-center justify-between pt-4 border-t border-white/8">
          <GlassButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </GlassButton>

          <GlassButton
            variant="gold"
            size="sm"
            onClick={() => {
              setActiveTab('leaderboard');
              onClose();
            }}
          >
            Compare with other Houses →
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
