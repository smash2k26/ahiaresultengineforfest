import React from 'react';
import { BrushIcon as Palette, Location01Icon as MapPin, Clock01Icon as Clock, Award01Icon as Award, Tick01Icon as CheckCircle2, UserGroupIcon as Users, Shield02Icon as ShieldCheck, Folder01Icon as FileCheck, Award01Icon as Trophy, LinkSquare01Icon as ExternalLink } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassBadge, GlassButton } from '../ui/GlassCard';
import { ArtsProgram } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo } from '../ui/TeamLogo';
import { deduplicateProgramResults } from '../../utils/programHelpers';

interface ArtsResultModalProps {
  program: ArtsProgram | null;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectParticipant?: (chestNo: string) => void;
}

export const ArtsResultModal: React.FC<ArtsResultModalProps> = ({
  program,
  onClose,
  setActiveTab,
  onSelectParticipant,
}) => {
  const { teams } = useFestival();

  if (!program) return null;

  const cleanResults = deduplicateProgramResults(program.results || []);
  const isPublished = program.publishStatus === 'Published';
  const first = cleanResults.find((r) => r.rank === 1);
  const second = cleanResults.find((r) => r.rank === 2);
  const third = cleanResults.find((r) => r.rank === 3);

  const handleChestClick = (identifier: string) => {
    if (onSelectParticipant) {
      onSelectParticipant(identifier);
      onClose();
    } else {
      setActiveTab('results');
      onClose();
    }
  };

  return (
    <GlassModal
      isOpen={!!program}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-purple-400" />
          <span className="text-base sm:text-lg font-bold font-display text-white">
            {program.name}
          </span>
        </div>
      }
      subtitle={`${program.category} • ${program.section} Event • Max Marks: ${program.maxMarks}`}
    >
      <div className="space-y-6">
        {/* Stage & Program Metadata Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/8 text-xs">
          <div className="space-y-1">
            <span className="text-gray-400 block font-mono text-[10px] uppercase">Stage & Venue</span>
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>{program.stage}</span>
            </div>
            <span className="text-gray-400 text-[11px] block">{program.venue}</span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 block font-mono text-[10px] uppercase">Schedule Time</span>
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{program.time}</span>
            </div>
            <span className="text-gray-400 text-[11px] block">{program.date}</span>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 block font-mono text-[10px] uppercase">Verdict Status</span>
            <div className="flex items-center gap-1.5">
              {isPublished ? (
                <GlassBadge variant="success" size="xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Official Result Published
                </GlassBadge>
              ) : program.status === 'LIVE' ? (
                <GlassBadge variant="live" size="xs" pulse>
                  On Stage Now
                </GlassBadge>
              ) : (
                <GlassBadge variant="warning" size="xs">
                  Result Under Verification
                </GlassBadge>
              )}
            </div>
            <span className="text-gray-400 text-[11px] block">
              {program.judges?.length || 0} Expert Jury Panel
            </span>
          </div>
        </div>

        {/* Jury Panel List */}
        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-purple-300">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-bold">Official Judging Panel:</span>
          </div>
          <div className="text-gray-200 font-medium truncate">
            {program.judges && program.judges.length > 0 ? program.judges.join(' • ') : 'Certified Expert Jury Panel'}
          </div>
        </div>

        {/* If Results Published: Top 3 Visual Podium */}
        {isPublished && program.results.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>Podium Winners</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1st Place */}
              {first && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-center space-y-1.5 relative order-1 sm:order-2">
                  <span className="inline-block text-2xl">🥇</span>
                  <div className="text-xs font-black uppercase text-amber-300 tracking-wider">
                    1st Position (Gold)
                  </div>
                  <div className="text-sm font-bold text-white leading-tight">
                    {first.participantName}
                  </div>
                  <button
                    onClick={() => handleChestClick(first.admissionNo || first.chestNo)}
                    className="text-xs font-mono text-amber-300 underline hover:text-white cursor-pointer"
                  >
                    Ad No: {first.admissionNo || first.chestNo}
                  </button>
                  <div className="text-xs font-mono font-bold text-amber-400 pt-1">
                    {first.marks} Marks • Grade {first.grade}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    +{first.pointsAwarded} House Points
                  </div>
                </div>
              )}

              {/* 2nd Place */}
              {second && (
                <div className="p-4 rounded-2xl bg-slate-400/10 border border-slate-400/30 text-center space-y-1.5 order-2 sm:order-1">
                  <span className="inline-block text-2xl">🥈</span>
                  <div className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                    2nd Position (Silver)
                  </div>
                  <div className="text-sm font-bold text-white leading-tight">
                    {second.participantName}
                  </div>
                  <button
                    onClick={() => handleChestClick(second.admissionNo || second.chestNo)}
                    className="text-xs font-mono text-slate-300 underline hover:text-white cursor-pointer"
                  >
                    Ad No: {second.admissionNo || second.chestNo}
                  </button>
                  <div className="text-xs font-mono font-bold text-slate-200 pt-1">
                    {second.marks} Marks • Grade {second.grade}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    +{second.pointsAwarded} House Points
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {third && (
                <div className="p-4 rounded-2xl bg-amber-700/10 border border-amber-700/30 text-center space-y-1.5 order-3">
                  <span className="inline-block text-2xl">🥉</span>
                  <div className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                    3rd Position (Bronze)
                  </div>
                  <div className="text-sm font-bold text-white leading-tight">
                    {third.participantName}
                  </div>
                  <button
                    onClick={() => handleChestClick(third.admissionNo || third.chestNo)}
                    className="text-xs font-mono text-amber-400 underline hover:text-white cursor-pointer"
                  >
                    Ad No: {third.admissionNo || third.chestNo}
                  </button>
                  <div className="text-xs font-mono font-bold text-amber-300 pt-1">
                    {third.marks} Marks • Grade {third.grade}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    +{third.pointsAwarded} House Points
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Marksheet Table */}
        {isPublished && cleanResults.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Marks Breakdown ({cleanResults.length} Ranked)
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Max Marks: {program.maxMarks}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3 text-center w-12">Rank</th>
                    <th className="py-2.5 px-3 font-mono">Chest No</th>
                    <th className="py-2.5 px-3">Participant</th>
                    <th className="py-2.5 px-3">House / Team</th>
                    <th className="py-2.5 px-3 text-right">Marks</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-center">Position</th>
                    <th className="py-2.5 px-3 text-right">House Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cleanResults.map((res, idx) => {
                    const team = teams.find((t) => t.id === res.teamId);
                    const isWinner = res.rank === 1;

                    return (
                      <tr
                        key={res.participantId || `${res.chestNo || 'res'}-${idx}`}
                        className={`hover:bg-slate-50 transition-colors text-slate-800 ${
                          isWinner ? 'bg-amber-50/60' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {res.rank === 1 && <span className="text-amber-600">01</span>}
                          {res.rank === 2 && <span className="text-slate-600">02</span>}
                          {res.rank === 3 && <span className="text-amber-800">03</span>}
                          {res.rank > 3 && <span className="text-slate-500">0{res.rank}</span>}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-purple-700">
                          <button
                            onClick={() => handleChestClick(res.admissionNo || res.chestNo)}
                            className="hover:underline cursor-pointer"
                          >
                            {res.admissionNo || res.chestNo}
                          </button>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{res.participantName}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <TeamLogo logo={team?.logo} name={team?.name} color={team?.color} size="xs" fallbackEmoji="🛡️" />
                            <span className="truncate">{team?.name || res.teamId}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {res.marks}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              res.grade === 'A+'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : res.grade === 'A'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {res.grade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-amber-800">
                          {res.position}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                          +{res.pointsAwarded}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <FileCheck className="w-10 h-10 text-purple-600/40 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Results Pending Official Publication</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Jury scoring sheets are being compiled and verified by the technical desk. Once published, official marks, grades and standings will appear here.
            </p>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/8">
          <GlassButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </GlassButton>

          {isPublished && (
            <GlassButton
              variant="arts"
              size="sm"
              onClick={() => {
                setActiveTab('certificates');
                onClose();
              }}
              icon={<Award className="w-4 h-4" />}
            >
              Verify Digital Certificates
            </GlassButton>
          )}
        </div>
      </div>
    </GlassModal>
  );
};
