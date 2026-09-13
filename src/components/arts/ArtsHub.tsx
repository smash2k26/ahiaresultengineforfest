import React, { useState } from 'react';
import {
  BrushIcon as Palette,
  Search01Icon as Search,
  FilterIcon as Filter,
  Calendar01Icon as Calendar,
  Clock01Icon as Clock,
  Location01Icon as MapPin,
  Award01Icon as Trophy,
  Tick01Icon as CheckCircle2,
  RadioIcon as Radio,
  SparklesIcon as Sparkles,
  ArrowRight01Icon as ArrowRight,
  UserGroupIcon as Users,
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { ArtsProgram } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { isSportsProgram } from '../../utils/programHelpers';

interface ArtsHubProps {
  onOpenArtsDetail: (program: ArtsProgram) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ArtsHub: React.FC<ArtsHubProps> = ({
  onOpenArtsDetail,
  setActiveTab,
}) => {
  const { artsPrograms, isAdminLoggedIn } = useFestival();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Senior' | 'Junior' | 'Sub Junior'>('All');
  const [sectionFilter, setSectionFilter] = useState<'All' | 'Individual' | 'Group'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'LIVE' | 'COMPLETED' | 'UPCOMING'>('All');

  // Only include Arts discipline programs (exclude Sports events)
  const artsOnlyPrograms = artsPrograms.filter((p) => !isSportsProgram(p));

  const filtered = artsOnlyPrograms.filter((p) => {
    const q = (search || '').toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.stage.toLowerCase().includes(q) ||
      p.venue.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSection = sectionFilter === 'All' || p.section === sectionFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesSection && matchesStatus;
  });

  const liveCount = artsOnlyPrograms.filter((p) => p.status === 'LIVE').length;
  const publishedCount = artsOnlyPrograms.filter((p) => p.publishStatus === 'Published').length;

  return (
    <div className="space-y-6">
      {/* Arts Header Banner (White Card) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden text-slate-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                CULTURAL & ARTS SECTOR
              </span>
              <span className="text-xs text-purple-700 font-mono font-semibold">Stage Verdicts Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              Arts Competitions & Live Stage Scores
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              &ldquo;Cultural excellence, scored live.&rdquo; Explore music, classical dance, literary, fine arts, and theatrical performances scored by expert juries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center min-w-[84px]">
              <div className="text-xl font-bold font-mono text-purple-600">{artsOnlyPrograms.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Items</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center min-w-[84px]">
              <div className="text-xl font-bold font-mono text-emerald-600">{publishedCount}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Published</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center min-w-[84px]">
              <div className="text-xl font-bold font-mono text-red-600">{liveCount}</div>
              <div className="text-[10px] text-red-700 uppercase font-bold">Live Now</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (White Card) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search arts program name, stage, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            {(['All', 'Senior', 'Junior', 'Sub Junior'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Section Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            {(['All', 'Individual', 'Group'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setSectionFilter(sec)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  sectionFilter === sec
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            {(['All', 'LIVE', 'COMPLETED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((program, idx) => {
          const isPublished = program.publishStatus === 'Published';
          const isLive = program.status === 'LIVE';
          const winner = program.results.find((r) => r.rank === 1);

          return (
            <div
              key={program.id ? `arts-p-${program.id}-${idx}` : `arts-p-${program.code || idx}-${idx}`}
              onClick={() => onOpenArtsDetail(program)}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                isLive
                  ? 'border-purple-500/60 bg-purple-50/30 shadow-purple-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      {program.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {program.section}
                    </span>
                  </div>

                  {isLive && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                      ON STAGE
                    </span>
                  )}
                  {isPublished && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Result Published
                    </span>
                  )}
                  {!isLive && !isPublished && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {program.status}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 group-hover:text-purple-600 transition-colors">
                  {program.name}
                </h3>

                <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="truncate text-slate-700">{program.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="font-mono">{program.date} • {program.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>{program.participantsCount} Registered Competitors</span>
                  </div>
                </div>

                {/* Published Winner Quick Card */}
                {isPublished && winner && (
                  <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">🥇</span>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 truncate block">{winner.participantName}</span>
                        <span className="text-[10px] text-amber-800 font-mono font-medium">Chest: {winner.chestNo}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-amber-800">{winner.marks} Marks</span>
                      <span className="text-[10px] block text-emerald-700 font-bold">Grade {winner.grade}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Max Marks: {program.maxMarks}</span>
                <button
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isPublished
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {isPublished ? 'View Result & Marksheet' : 'Program Details'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Palette className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No Arts Programs Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting filters or adjusting search keyword.</p>
        </div>
      )}
    </div>
  );
};
