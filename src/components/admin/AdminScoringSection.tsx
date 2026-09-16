import React, { useState } from 'react';
import {
  Award01Icon as Award,
  SparklesIcon as Sparkles,
  Award01Icon as Trophy,
  ReloadIcon as RotateCcw,
  Tick01Icon as CheckCircle2,
  FloppyDiskIcon as Save,
  HelpCircleIcon as HelpCircle,
  Alert02Icon as AlertTriangle
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { ScoringRules } from '../../types/festival';
import { AdminTeamMinusesSection } from './AdminTeamMinusesSection';

export const AdminScoringSection: React.FC = () => {
  const {
    scoringRules,
    updateScoringRules,
    recalculateAllStandings,
    showToast,
  } = useFestival();

  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'minuses'>('matrix');
  const [rules, setRules] = useState<ScoringRules>({
    ...scoringRules,
    defaultMinusPoints: scoringRules.defaultMinusPoints ?? 5,
  });

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateScoringRules(rules);
    recalculateAllStandings();
    showToast(
      'Rules Saved & Recalculated',
      'All house and individual standings have been updated with the new formula.',
      'success'
    );
  };

  const handleResetDefaults = () => {
    const defaultRules: ScoringRules = {
      goldPoints: 10,
      silverPoints: 7,
      bronzePoints: 5,
      gradePointsA_Plus: 5,
      gradePointsA: 3,
      gradePointsB_Plus: 2,
      gradePointsB: 1,
      participationPoints: 1,
      groupEventMultiplier: 1.5,
      sportsWinnerPoints: 15,
      sportsRunnerUpPoints: 10,
      sportsThirdPlacePoints: 5,
      defaultMinusPoints: 5,
    };
    setRules(defaultRules);
    updateScoringRules(defaultRules);
    recalculateAllStandings();
    showToast('Reset to Defaults', 'Standard scoring rules formula restored.', 'info');
  };

  const handleSetPodiumOnlyPreset = () => {
    const podiumOnlyRules: ScoringRules = {
      goldPoints: 10,
      silverPoints: 7,
      bronzePoints: 5,
      gradePointsA_Plus: 0,
      gradePointsA: 0,
      gradePointsB_Plus: 0,
      gradePointsB: 0,
      participationPoints: 0,
      groupEventMultiplier: 0,
      sportsWinnerPoints: 0,
      sportsRunnerUpPoints: 0,
      sportsThirdPlacePoints: 0,
      defaultMinusPoints: rules.defaultMinusPoints ?? 5,
    };
    setRules(podiumOnlyRules);
    updateScoringRules(podiumOnlyRules);
    recalculateAllStandings();
    showToast('Podium Only Mode Applied', 'Grade points, sports points & group multiplier set to 0. Only 1st, 2nd, and 3rd get points.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Scoring Matrix &amp; Points Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('minuses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'minuses'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>House Penalty / Minus Points Registry</span>
        </button>
      </div>

      {activeSubTab === 'minuses' ? (
        <AdminTeamMinusesSection />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Scoring Rules Matrix &amp; Point Formula Engine
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Configure placement points, grade bonuses, group multipliers, and default penalty minus values.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSetPodiumOnlyPreset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>1st, 2nd &amp; 3rd Only (Zero Grade/Multiplier)</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-2.5 text-blue-900 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Zero Points Allowed: </span>
              You can set Grade points (A+, A, B+, B, Participation), Sports points, and Group Multipliers to <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold text-blue-950">0</code>. When set to 0, championship points are awarded exclusively to the 1st, 2nd, and 3rd podium finishers.
            </div>
          </div>

          <form onSubmit={handleSaveRules} className="space-y-6">
            {/* Placement Points Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Podium Placement Points (Arts &amp; Stage)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <label className="block text-xs font-bold text-amber-900 uppercase">
                    🥇 1st Place (Gold)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rules.goldPoints}
                    onChange={(e) => setRules({ ...rules, goldPoints: Number(e.target.value) })}
                    className="w-full text-center text-xl font-mono font-bold py-2 rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-amber-700 block text-center">Awarded to event winner</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase">
                    🥈 2nd Place (Silver)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rules.silverPoints}
                    onChange={(e) => setRules({ ...rules, silverPoints: Number(e.target.value) })}
                    className="w-full text-center text-xl font-mono font-bold py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 block text-center">Awarded to runner up</span>
                </div>

                <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-2">
                  <label className="block text-xs font-bold text-orange-900 uppercase">
                    🥉 3rd Place (Bronze)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rules.bronzePoints}
                    onChange={(e) => setRules({ ...rules, bronzePoints: Number(e.target.value) })}
                    className="w-full text-center text-xl font-mono font-bold py-2 rounded-lg border border-orange-300 bg-white focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-[11px] text-orange-700 block text-center">Awarded to 3rd place</span>
                </div>
              </div>
            </div>

            {/* Performance Grades Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Performance Grade Points
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-slate-800">Grade A+ (80%+)</label>
                  <input
                    type="number"
                    min="0"
                    value={rules.gradePointsA_Plus}
                    onChange={(e) => setRules({ ...rules, gradePointsA_Plus: Number(e.target.value) })}
                    className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-slate-800">Grade A (70%+)</label>
                  <input
                    type="number"
                    min="0"
                    value={rules.gradePointsA}
                    onChange={(e) => setRules({ ...rules, gradePointsA: Number(e.target.value) })}
                    className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-slate-800">Grade B+ (65%+)</label>
                  <input
                    type="number"
                    min="0"
                    value={rules.gradePointsB_Plus}
                    onChange={(e) => setRules({ ...rules, gradePointsB_Plus: Number(e.target.value) })}
                    className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-slate-800">Grade B (60%+)</label>
                  <input
                    type="number"
                    min="0"
                    value={rules.gradePointsB}
                    onChange={(e) => setRules({ ...rules, gradePointsB: Number(e.target.value) })}
                    className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-center col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-800">Participation</label>
                  <input
                    type="number"
                    min="0"
                    value={rules.participationPoints}
                    onChange={(e) => setRules({ ...rules, participationPoints: Number(e.target.value) })}
                    className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Sports, Multipliers & Penalties Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Sports Points, Multiplier &amp; Penalty Settings
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-emerald-900">Sports Winner Pts</label>
                  <input
                    type="number"
                    min="0"
                    value={rules.sportsWinnerPoints}
                    onChange={(e) => setRules({ ...rules, sportsWinnerPoints: Number(e.target.value) })}
                    className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-slate-800">Sports Runner-up Pts</label>
                  <input
                    type="number"
                    min="0"
                    value={rules.sportsRunnerUpPoints}
                    onChange={(e) => setRules({ ...rules, sportsRunnerUpPoints: Number(e.target.value) })}
                    className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-slate-800">Sports 3rd Place Pts</label>
                  <input
                    type="number"
                    min="0"
                    value={rules.sportsThirdPlacePoints}
                    onChange={(e) => setRules({ ...rules, sportsThirdPlacePoints: Number(e.target.value) })}
                    className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-indigo-900">Group Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={rules.groupEventMultiplier}
                    onChange={(e) => setRules({ ...rules, groupEventMultiplier: Number(e.target.value) })}
                    className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Default Minus Points Setting */}
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs uppercase">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Default House Penalty / Minus Value</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    Standard deduction value pre-filled when registering house disciplinary penalties.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={rules.defaultMinusPoints ?? 5}
                    onChange={(e) => setRules({ ...rules, defaultMinusPoints: Number(e.target.value) || 5 })}
                    className="w-24 text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-rose-300 bg-white text-rose-900 focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-800">pts / infraction</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Rules &amp; Recalculate Standings</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
