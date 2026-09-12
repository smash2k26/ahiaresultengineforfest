import React, { useState } from 'react';
import { Award01Icon as Trophy, BarChartIcon as BarChart2, PieChartIcon as PieIcon, ArrowUpRight01Icon as TrendingUp, Award01Icon as Award, FireIcon as Flame, SparklesIcon as Sparkles, ArrowUp01Icon as ArrowUp, ArrowDown01Icon as ArrowDown, MinusSignIcon as Minus } from 'hugeicons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { PodiumLeaderboard } from '../home/PodiumLeaderboard';
import { OverallLeaderboardTable } from '../home/OverallLeaderboardTable';
import { ActiveTab } from '../layout/Sidebar';

interface LeaderboardHubProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectTeam?: (teamId: string) => void;
}

export const LeaderboardHub: React.FC<LeaderboardHubProps> = ({
  setActiveTab,
  onSelectTeam,
}) => {
  const { teams, stats } = useFestival();

  // Prepare Chart Data for Recharts
  const barChartData = teams.map((t) => ({
    name: t.shortCode,
    fullName: t.name,
    Arts: t.artsPoints,
    Sports: t.sportsPoints,
    Total: t.totalPoints,
    color: t.color,
  }));

  const pieChartData = teams.map((t) => ({
    name: t.name,
    value: t.totalPoints,
    color: t.color,
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Visual Podium on Top */}
      <PodiumLeaderboard setActiveTab={setActiveTab} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: House Points (Arts vs Sports) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-base sm:text-lg font-bold font-display text-slate-900">
                House Points Comparison (Arts vs Sports)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono font-medium">Live Computed</span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0F172A',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Arts" fill="#9333EA" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Sports" fill="#0284C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: House Share */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold font-display text-slate-900">
                House Score Distribution
              </h3>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`pie-cell-${entry.name || index}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0F172A',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {teams.map((t, idx) => (
              <div key={t.id ? `lb-t-${t.id}-${idx}` : `lb-t-${idx}`} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-slate-700 truncate font-medium">{t.shortCode}:</span>
                <span className="font-mono font-bold text-slate-900 ml-auto">{t.artsPoints + t.sportsPoints}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Leaderboard Table */}
      <OverallLeaderboardTable setActiveTab={setActiveTab} onSelectTeam={onSelectTeam} />
    </div>
  );
};
