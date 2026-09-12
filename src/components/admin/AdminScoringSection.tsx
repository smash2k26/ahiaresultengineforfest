import React, { useState } from 'react';
import { Award01Icon as Award, SparklesIcon as Sparkles, Award01Icon as Trophy, ReloadIcon as RotateCcw, Tick01Icon as CheckCircle2, FloppyDiskIcon as Save, HelpCircleIcon as HelpCircle } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { ScoringRules } from '../../types/festival';

export const AdminScoringSection: React.FC = () => {
  const {
    scoringRules,
    updateScoringRules,
    recalculateAllStandings,
    showToast,
  } = useFestival();

  const [rules, setRules] = useState<ScoringRules>(scoringRules);

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
    };
    setRules(defaultRules);
    updateScoringRules(defaultRules);
    recalculateAllStandings();
    showToast('Reset to Defaults', 'Standard scoring rules formula restored.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Scoring Rules Matrix &amp; Point Formula Engine
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Configure placement points, grade bonuses, and group multipliers. Changes recalculate the entire leaderboard automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              <span className="text-[11px] text-orange-700 block text-center">Awarded to 3rd position</span>
            </div>
          </div>
        </div>

        {/* Grade Points Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Academic &amp; Performance Grade Bonuses
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1.5 text-center">
              <label className="block text-xs font-bold text-indigo-900">Grade A+ (90%+)</label>
              <input
                type="number"
                min="0"
                value={rules.gradePointsA_Plus}
                onChange={(e) => setRules({ ...rules, gradePointsA_Plus: Number(e.target.value) })}
                className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-1.5 text-center">
              <label className="block text-xs font-bold text-indigo-900">Grade A (80%+)</label>
              <input
                type="number"
                min="0"
                value={rules.gradePointsA}
                onChange={(e) => setRules({ ...rules, gradePointsA: Number(e.target.value) })}
                className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-center">
              <label className="block text-xs font-bold text-slate-800">Grade B+ (70%+)</label>
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

        {/* Sports & Group Multipliers Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Sports Points &amp; Group Multiplier
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
              <label className="block text-xs font-bold text-indigo-900">Group Event Multiplier</label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={rules.groupEventMultiplier}
                onChange={(e) => setRules({ ...rules, groupEventMultiplier: Number(e.target.value) })}
                className="w-full text-center text-lg font-mono font-bold py-1.5 rounded-lg border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500"
              />
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
  );
};
