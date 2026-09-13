import React, { useState } from 'react';
import { BrushIcon as Palette, Search01Icon as Search, FilterIcon as Filter, Calendar01Icon as Calendar, Clock01Icon as Clock, Location01Icon as MapPin, UserGroupIcon as Users, Award01Icon as Award, Tick01Icon as CheckCircle2, RadioIcon as Radio, Add01Icon as Plus } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { ArtsProgram } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { isSportsProgram } from '../../utils/programHelpers';

interface ArtsHubProps {
  onOpenArtsDetail: (program: ArtsProgram) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewProgramModal?: () => void;
}

export const ArtsHub: React.FC<ArtsHubProps> = ({
  onOpenArtsDetail,
  setActiveTab,
  onOpenNewProgramModal,
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
      (p.name || '').toLowerCase().includes(q) ||
      (p.stage || '').toLowerCase().includes(q) ||
      (p.venue || '').toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSec = sectionFilter === 'All' || p.section === sectionFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesCat && matchesSec && matchesStatus;
  });

  const liveCount = artsOnlyPrograms.filter((p) => p.status === 'LIVE').length;
  const completedCount = artsOnlyPrograms.filter((p) => p.status === 'COMPLETED').length;
  const publishedCount = artsOnlyPrograms.filter((p) => p.publishStatus === 'Published').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#111318] to-[#0A0C10] border border-purple-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GlassBadge variant="arts" size="sm">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                CULTURAL & ARTS SECTOR
              </GlassBadge>
              <span className="text-xs text-purple-300/80 font-mono">Stage Verdicts Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Arts Competitions & Live Stage Scores
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              &ldquo;Cultural excellence, scored live.&rdquo; Explore music, classical dance, literary, fine arts, and theatrical performances scored by expert juries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <div className="text-xl font-bold font-mono text-purple-400">{artsOnlyPrograms.length}</div>
              <div className="text-[10px] text-gray-400 uppercase">Total Items</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <div className="text-xl font-bold font-mono text-emerald-400">{publishedCount}</div>
              <div className="text-[10px] text-gray-400 uppercase">Published</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/8 text-center">
              <div className="text-xl font-bold font-mono text-red-400">{liveCount}</div>
              <div className="text-[10px] text-gray-400 uppercase">Live Now</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111318]/90 border border-white/8 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search arts program name, stage, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/8 text-xs">
            {(['All', 'Senior', 'Junior', 'Sub Junior'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Section Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/8 text-xs">
            {(['All', 'Individual', 'Group'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setSectionFilter(sec)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  sectionFilter === sec
                    ? 'bg-white text-gray-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/8 text-xs">
            {(['All', 'LIVE', 'COMPLETED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
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
          const isCompleted = program.status === 'COMPLETED';
          const winner = program.results.find((r) => r.rank === 1);

          return (
            <div
              key={program.id ? `arts-p-${program.id}-${idx}` : `arts-p-${program.code || idx}-${idx}`}
              onClick={() => onOpenArtsDetail(program)}
              className={`p-5 rounded-2xl bg-[#111318]/90 border backdrop-blur-xl hover:border-purple-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 ${
                isLive
                  ? 'border-purple-500/40 shadow-lg shadow-purple-950/30'
                  : 'border-white/8'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <GlassBadge variant="arts" size="xs">
                      {program.category}
                    </GlassBadge>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {program.section}
                    </span>
                  </div>

                  {isLive && (
                    <GlassBadge variant="live" size="xs" pulse>
                      ON STAGE
                    </GlassBadge>
                  )}
                  {isPublished && (
                    <GlassBadge variant="success" size="xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Result Published
                    </GlassBadge>
                  )}
                  {!isLive && !isPublished && (
                    <GlassBadge variant="neutral" size="xs">
                      {program.status}
                    </GlassBadge>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold font-display text-white group-hover:text-purple-300 transition-colors">
                  {program.name}
                </h3>

                <div className="space-y-1.5 mt-3 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate text-gray-300">{program.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{program.date} • {program.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{program.participantsCount} Registered Competitors</span>
                  </div>
                </div>

                {/* Published Winner Quick Card */}
                {isPublished && winner && (
                  <div className="mt-3.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">🥇</span>
                      <div className="truncate">
                        <span className="font-bold text-white truncate block">{winner.participantName}</span>
                        <span className="text-[10px] text-amber-300 font-mono">Chest: {winner.chestNo}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-amber-400">{winner.marks} Marks</span>
                      <span className="text-[10px] block text-emerald-400 font-bold">Grade {winner.grade}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-mono">Max Marks: {program.maxMarks}</span>
                <GlassButton variant={isPublished ? 'arts' : 'secondary'} size="sm">
                  {isPublished ? 'View Result & Marksheet' : 'Program Details'}
                </GlassButton>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-gray-400 bg-white/[0.01] rounded-3xl border border-white/5">
          <Palette className="w-10 h-10 text-purple-400/40 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No Arts Programs Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try resetting filters or adjusting search keyword.</p>
        </div>
      )}
    </div>
  );
};
