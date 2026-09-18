import React from 'react';
import { Award01Icon as Award, Tick01Icon as CheckCircle2, Award01Icon as Trophy, ArrowRight01Icon as ArrowRight, BrushIcon as Palette, Activity02Icon as Activity } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { ActiveTab } from '../layout/Sidebar';
import { ArtsProgram } from '../../types/festival';
import { deduplicateProgramResults } from '../../utils/programHelpers';

interface RecentResultsFeedProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenArtsDetail: (program: ArtsProgram) => void;
}

export const RecentResultsFeed: React.FC<RecentResultsFeedProps> = ({
  setActiveTab,
  onOpenArtsDetail,
}) => {
  const { artsPrograms, teams } = useFestival();

  const publishedPrograms = artsPrograms.filter(
    (p) => p.publishStatus === 'Published' && p.results && p.results.length > 0
  );

  if (publishedPrograms.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-wide">
            RECENTLY PUBLISHED VERDICTS
          </h2>
        </div>
        <button
          onClick={() => setActiveTab('arts')}
          className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
        >
          View All Arts Results →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedPrograms.slice(0, 3).map((program, idx) => {
          const cleanResults = deduplicateProgramResults(program.results || []);
          const firstPlace = cleanResults.find((r) => r.rank === 1);
          const secondPlace = cleanResults.find((r) => r.rank === 2);
          const thirdPlace = cleanResults.find((r) => r.rank === 3);

          const teamFirst = firstPlace ? teams.find((t) => t.id === firstPlace.teamId) : null;

          return (
            <div
              key={program.id || `rec-prog-${program.code || idx}-${idx}`}
              onClick={() => onOpenArtsDetail(program)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <GlassBadge variant="arts" size="xs">
                    {program.category} • {program.section}
                  </GlassBadge>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {program.publishedAt || 'Today'}
                  </span>
                </div>

                <h3 className="text-base font-bold font-display text-slate-900 mt-2 group-hover:text-purple-700 transition-colors">
                  {program.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{program.stage}</p>

                {/* Top 3 Result summary */}
                <div className="mt-3.5 space-y-2 pt-3 border-t border-slate-100">
                  {firstPlace && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🥇</span>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 truncate block">
                            {firstPlace.participantName}
                          </span>
                          <span className="text-[10px] text-amber-800 font-medium">
                            {teamFirst?.name || firstPlace.teamId} • Chest {firstPlace.chestNo}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-amber-700">
                          {firstPlace.marks}/{program.maxMarks}
                        </span>
                        <span className="text-[10px] block text-slate-500 font-bold">
                          Grade {firstPlace.grade}
                        </span>
                      </div>
                    </div>
                  )}

                  {secondPlace && (
                    <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 truncate">
                        <span>🥈</span>
                        <span className="truncate">{secondPlace.participantName}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {secondPlace.marks} pts (Grade {secondPlace.grade})
                      </span>
                    </div>
                  )}

                  {thirdPlace && (
                    <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 truncate">
                        <span>🥉</span>
                        <span className="truncate">{thirdPlace.participantName}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {thirdPlace.marks} pts (Grade {thirdPlace.grade})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-purple-600 font-semibold group-hover:text-purple-700">
                <span>View Full Marksheet</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
