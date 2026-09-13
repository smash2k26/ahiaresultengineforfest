import React, { useState, useMemo } from 'react';
import {
  Calendar01Icon as Calendar,
  Clock01Icon as Clock,
  Location01Icon as MapPin,
  BrushIcon as Palette,
  Activity02Icon as Activity,
  RadioIcon as Radio,
  Tick01Icon as CheckCircle2,
  FilterIcon as Filter,
  Search01Icon as Search,
  Award01Icon as Trophy,
  SparklesIcon as Sparkles,
  ArrowRight01Icon as ArrowRight,
  Layers01Icon as Layers,
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { ActiveTab } from '../layout/Sidebar';
import { ArtsProgram, SportsMatch, ScheduleItem } from '../../types/festival';

interface ScheduleHubProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenArtsTab: () => void;
  onOpenSportsTab: () => void;
  onOpenArtsDetail?: (prog: ArtsProgram) => void;
  onOpenSportsDetail?: (match: SportsMatch) => void;
}

interface UnifiedScheduleEntry {
  id: string;
  source: 'schedule' | 'arts' | 'sports';
  title: string;
  code?: string;
  type: 'Arts' | 'Sports' | 'Ceremony' | 'Other';
  category?: string;
  section?: string;
  stageVenue: string;
  dayLabel: string;
  dateStr: string;
  timeSlot: string;
  status: 'LIVE' | 'COMPLETED' | 'UPCOMING';
  publishStatus?: string;
  originalArtsProgram?: ArtsProgram;
  originalSportsMatch?: SportsMatch;
  originalScheduleItem?: ScheduleItem;
}

// Helper to extract or normalize day label (e.g. "Day 1", "Day 2", "Day 3")
function normalizeDay(val: string | number | undefined, dateVal?: string): string {
  const combined = `${val || ''} ${dateVal || ''}`.trim();
  const match = combined.match(/day\s*0*([1-9])/i);
  if (match) {
    return `Day ${match[1]}`;
  }
  if (typeof val === 'number' && val >= 1 && val <= 10) {
    return `Day ${val}`;
  }
  if (dateVal && dateVal.trim() && !dateVal.includes('-') && dateVal.length < 15) {
    return dateVal.trim();
  }
  return 'Day 1';
}

export const ScheduleHub: React.FC<ScheduleHubProps> = ({
  setActiveTab,
  onOpenArtsTab,
  onOpenSportsTab,
  onOpenArtsDetail,
  onOpenSportsDetail,
}) => {
  const { schedule, artsPrograms, sportsMatches, festConfig } = useFestival();
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Arts' | 'Sports' | 'Ceremony'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'LIVE' | 'UPCOMING' | 'COMPLETED'>('All');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Merge custom schedule items, Arts programs, and Sports matches into one unified timeline
  const unifiedEntries: UnifiedScheduleEntry[] = useMemo(() => {
    const list: UnifiedScheduleEntry[] = [];
    const seenIds = new Set<string>();

    // 1. Ingest explicit Schedule items
    (schedule || []).forEach((s) => {
      const dayLabel = normalizeDay(s.day, s.date);
      const timeSlot =
        s.time ||
        (s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : s.startTime) ||
        s.scheduledTime ||
        '10:00 AM';
      const stageVenue = s.stage || s.venue || 'Festival Stage';

      list.push({
        id: `sch-${s.id}`,
        source: 'schedule',
        title: s.title || 'Special Event',
        type: s.type || 'Ceremony',
        category: s.category ? String(s.category) : undefined,
        stageVenue,
        dayLabel,
        dateStr: s.date || 'Festival Schedule',
        timeSlot,
        status: (s.status as 'LIVE' | 'COMPLETED' | 'UPCOMING') || 'UPCOMING',
        originalScheduleItem: s,
      });

      if (s.referenceId) {
        seenIds.add(s.referenceId);
      }
    });

    // 2. Ingest Arts & Cultural / Track Programs
    (artsPrograms || []).forEach((p) => {
      if (seenIds.has(p.id)) return;

      const isSportsDiscipline = p.disciplineType === 'Sports';
      const dayLabel = normalizeDay(p.date, p.date);
      const stageVenue = p.stage || p.venue || (isSportsDiscipline ? 'Sports Arena' : 'Main Stage');
      const timeSlot = p.time || '10:00 AM';

      list.push({
        id: `arts-${p.id}`,
        source: 'arts',
        title: p.name || 'Arts Program',
        code: p.code,
        type: isSportsDiscipline ? 'Sports' : 'Arts',
        category: p.category,
        section: p.section,
        stageVenue,
        dayLabel,
        dateStr: p.date || 'Day 1',
        timeSlot,
        status: p.status || 'UPCOMING',
        publishStatus: p.publishStatus,
        originalArtsProgram: p,
      });
    });

    // 3. Ingest Sports Matches & Fixtures
    (sportsMatches || []).forEach((m) => {
      if (seenIds.has(m.id)) return;

      const dayLabel = normalizeDay(m.date, m.scheduledTime);
      const stageVenue = m.venue || 'Sports Ground';
      const timeSlot = m.time || m.scheduledTime || '02:00 PM';

      list.push({
        id: `sports-${m.id}`,
        source: 'sports',
        title: m.title || `${m.sport} - ${m.round}`,
        code: m.sport,
        type: 'Sports',
        stageVenue,
        dayLabel,
        dateStr: m.date || 'Tournament Day',
        timeSlot,
        status: m.status || 'UPCOMING',
        originalSportsMatch: m,
      });
    });

    // Sort entries by Day, then Status (LIVE first), then Time
    return list.sort((a, b) => {
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
      if (a.dayLabel !== b.dayLabel) return a.dayLabel.localeCompare(b.dayLabel);
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }, [schedule, artsPrograms, sportsMatches]);

  // Extract all distinct days dynamically
  const availableDays = useMemo(() => {
    const daysSet = new Set<string>();
    unifiedEntries.forEach((e) => {
      if (e.dayLabel) daysSet.add(e.dayLabel);
    });

    // Ensure standard Day 1, Day 2, Day 3 exist if empty
    if (daysSet.size === 0) {
      daysSet.add('Day 1');
      daysSet.add('Day 2');
      daysSet.add('Day 3');
    }

    const sortedDays = Array.from(daysSet).sort((a, b) => a.localeCompare(b));
    return ['All', ...sortedDays];
  }, [unifiedEntries]);

  // Extract all unique stages/venues for filter
  const availableStages = useMemo(() => {
    const stages = new Set<string>();
    unifiedEntries.forEach((e) => {
      if (e.stageVenue && e.stageVenue.trim()) {
        stages.add(e.stageVenue.trim());
      }
    });
    return ['All', ...Array.from(stages).sort()];
  }, [unifiedEntries]);

  // Filter items based on user selection
  const filtered = useMemo(() => {
    return unifiedEntries.filter((item) => {
      // Day filter
      const matchesDay = selectedDay === 'All' || item.dayLabel.toLowerCase() === selectedDay.toLowerCase();

      // Discipline Type filter
      const matchesType =
        typeFilter === 'All' ||
        (typeFilter === 'Ceremony' ? item.type === 'Ceremony' || item.type === 'Other' : item.type === typeFilter);

      // Status filter
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

      // Stage / Venue filter
      const matchesStage = stageFilter === 'All' || item.stageVenue === stageFilter;

      // Search query
      const q = (search || '').toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q) ||
        (item.stageVenue || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.timeSlot || '').toLowerCase().includes(q);

      return matchesDay && matchesType && matchesStatus && matchesStage && matchesSearch;
    });
  }, [unifiedEntries, selectedDay, typeFilter, statusFilter, stageFilter, search]);

  const liveCount = unifiedEntries.filter((i) => i.status === 'LIVE').length;
  const artsCount = unifiedEntries.filter((i) => i.type === 'Arts').length;
  const sportsCount = unifiedEntries.filter((i) => i.type === 'Sports').length;

  const handleItemClick = (item: UnifiedScheduleEntry) => {
    if (item.source === 'arts' && item.originalArtsProgram && onOpenArtsDetail) {
      onOpenArtsDetail(item.originalArtsProgram);
    } else if (item.source === 'sports' && item.originalSportsMatch && onOpenSportsDetail) {
      onOpenSportsDetail(item.originalSportsMatch);
    } else if (item.type === 'Arts') {
      onOpenArtsTab();
    } else if (item.type === 'Sports') {
      onOpenSportsTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Schedule Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#111318] to-[#0A0C10] border border-amber-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <GlassBadge variant="warning" size="sm">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                TIMELINE & STAGES
              </GlassBadge>
              <span className="text-xs text-amber-300 font-mono">
                {festConfig.dates || 'Official Program Schedule'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Festival Timeline & Program Schedule
            </h1>
            <p className="text-xs sm:text-sm text-gray-300">
              Live schedule of all cultural items, athletic events, ceremonies, and venue allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/8 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-amber-400">{unifiedEntries.length}</div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Slots</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/8 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-purple-400">{artsCount}</div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Arts Items</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/8 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-sky-400">{sportsCount}</div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Sports Items</div>
            </div>
            {liveCount > 0 && (
              <div className="px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center min-w-[80px] animate-pulse">
                <div className="text-xl font-bold font-mono text-red-400">{liveCount}</div>
                <div className="text-[10px] text-red-300 uppercase font-semibold">Live Now</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {availableDays.map((d) => {
          const countForDay =
            d === 'All'
              ? unifiedEntries.length
              : unifiedEntries.filter((i) => i.dayLabel.toLowerCase() === d.toLowerCase()).length;

          return (
            <button
              key={`day-tab-${d}`}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                selectedDay === d
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                  : 'bg-[#111318]/80 border-white/8 hover:border-white/20 text-gray-300 hover:text-white'
              }`}
            >
              <span>{d === 'All' ? 'All Days' : d}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                  selectedDay === d ? 'bg-black/20 text-gray-950' : 'bg-white/10 text-gray-400'
                }`}
              >
                {countForDay}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111318]/90 border border-white/8 backdrop-blur-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event code, program name, stage, venue, or time slot..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Discipline Filters */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/8 text-xs overflow-x-auto">
            {(['All', 'Arts', 'Sports', 'Ceremony'] as const).map((t) => (
              <button
                key={`type-${t}`}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-amber-500 text-gray-950 font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'Ceremony' ? 'Ceremonies' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Filters: Stage/Venue and Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Venue / Stage:
            </span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {availableStages.map((st) => (
                <option key={st} value={st} className="bg-gray-900 text-white">
                  {st === 'All' ? 'All Stages & Venues' : st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            {(['All', 'LIVE', 'UPCOMING', 'COMPLETED'] as const).map((st) => (
              <button
                key={`st-${st}`}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st === 'All' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Timeline Items */}
      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const isLive = item.status === 'LIVE';
          const isCompleted = item.status === 'COMPLETED';

          return (
            <div
              key={item.id || `sch-item-${idx}`}
              onClick={() => handleItemClick(item)}
              className={`p-4 sm:p-5 rounded-2xl bg-[#111318]/90 border backdrop-blur-2xl transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl hover:border-amber-500/40 cursor-pointer group ${
                isLive
                  ? 'border-amber-500/50 bg-amber-950/20 shadow-amber-950/30'
                  : 'border-white/8 hover:bg-[#151820]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                {/* Time Badge */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 border border-white/10 w-24 text-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-xs font-mono font-bold text-white leading-tight">
                    {item.timeSlot}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {item.dayLabel}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Discipline Badge */}
                    <GlassBadge
                      variant={
                        item.type === 'Arts'
                          ? 'arts'
                          : item.type === 'Sports'
                          ? 'sports'
                          : 'warning'
                      }
                      size="xs"
                    >
                      {item.type === 'Arts' ? (
                        <Palette className="w-3 h-3" />
                      ) : item.type === 'Sports' ? (
                        <Activity className="w-3 h-3" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {item.type}
                    </GlassBadge>

                    {item.code && (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-amber-300">
                        {item.code}
                      </span>
                    )}

                    {item.category && (
                      <span className="text-[11px] font-semibold text-gray-400">
                        {item.category}
                      </span>
                    )}

                    {item.section && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono">
                        {item.section}
                      </span>
                    )}

                    {isLive && (
                      <GlassBadge variant="live" size="xs" pulse>
                        LIVE ON STAGE
                      </GlassBadge>
                    )}
                    {isCompleted && (
                      <GlassBadge
                        variant={item.publishStatus === 'Published' ? 'success' : 'neutral'}
                        size="xs"
                      >
                        {item.publishStatus === 'Published' ? 'Result Published' : 'Completed'}
                      </GlassBadge>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-display text-white group-hover:text-amber-300 transition-colors truncate">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1 text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-semibold">{item.stageVenue}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-gray-400">{item.dateStr}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {item.type === 'Arts' ? (
                  <GlassButton
                    variant="arts"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                  >
                    <span>View Program</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </GlassButton>
                ) : item.type === 'Sports' ? (
                  <GlassButton
                    variant="sports"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                  >
                    <span>Match Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </GlassButton>
                ) : (
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                  >
                    <span>Slot Details</span>
                  </GlassButton>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400 bg-white/[0.01] rounded-3xl border border-white/5 space-y-3">
            <Calendar className="w-12 h-12 text-amber-400/40 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">No Scheduled Programs Found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                No events matched your selected day or search filters.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  setSelectedDay('All');
                  setTypeFilter('All');
                  setStatusFilter('All');
                  setStageFilter('All');
                  setSearch('');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
