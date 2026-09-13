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
import { isSportsProgram } from '../../utils/programHelpers';

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

      const isSportsDiscipline = isSportsProgram(p);
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
      {/* Schedule Banner (White Card) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden text-slate-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                TIMELINE & STAGES
              </span>
              <span className="text-xs text-amber-700 font-mono font-semibold">
                {festConfig.dates || 'Official Program Schedule'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              Festival Timeline & Program Schedule
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Live schedule of all cultural items, athletic events, ceremonies, and venue allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-amber-600">{unifiedEntries.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Slots</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-purple-600">{artsCount}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Arts Items</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[80px]">
              <div className="text-xl font-bold font-mono text-sky-600">{sportsCount}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Sports Items</div>
            </div>
            {liveCount > 0 && (
              <div className="px-4 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-center min-w-[80px] animate-pulse">
                <div className="text-xl font-bold font-mono text-red-600">{liveCount}</div>
                <div className="text-[10px] text-red-700 uppercase font-bold">Live Now</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day Selector Tabs Container */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {availableDays.map((d) => {
          const countForDay =
            d === 'All'
              ? unifiedEntries.length
              : unifiedEntries.filter((i) => i.dayLabel.toLowerCase() === d.toLowerCase()).length;

          const isActive = selectedDay === d;

          return (
            <button
              key={`day-tab-${d}`}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{d === 'All' ? 'All Days' : d}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? 'bg-amber-600/20 text-amber-950' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {countForDay}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar (White Card) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event code, program name, stage, venue, or time slot..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Discipline Filters */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs overflow-x-auto">
            {(['All', 'Arts', 'Sports', 'Ceremony'] as const).map((t) => (
              <button
                key={`type-${t}`}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'Ceremony' ? 'Ceremonies' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Filters: Stage/Venue and Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Venue / Stage:
            </span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {availableStages.map((st) => (
                <option key={st} value={st} className="bg-white text-slate-900">
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
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st === 'All' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Timeline Items (White Cards) */}
      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const isLive = item.status === 'LIVE';
          const isCompleted = item.status === 'COMPLETED';

          return (
            <div
              key={item.id || `sch-item-${idx}`}
              onClick={() => handleItemClick(item)}
              className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md cursor-pointer group ${
                isLive
                  ? 'border-amber-500/60 bg-amber-50/40 shadow-amber-500/10'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                {/* Time Badge */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-200 w-24 text-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-500 mb-1" />
                  <span className="text-xs font-mono font-bold text-slate-900 leading-tight">
                    {item.timeSlot}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {item.dayLabel}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Discipline Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        item.type === 'Arts'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : item.type === 'Sports'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.type === 'Arts' ? (
                        <Palette className="w-3 h-3" />
                      ) : item.type === 'Sports' ? (
                        <Activity className="w-3 h-3" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {item.type}
                    </span>

                    {item.code && (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">
                        {item.code}
                      </span>
                    )}

                    {item.category && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        {item.category}
                      </span>
                    )}

                    {item.section && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {item.section}
                      </span>
                    )}

                    {isLive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                        LIVE ON STAGE
                      </span>
                    )}
                    {isCompleted && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.publishStatus === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.publishStatus === 'Published' ? 'Result Published' : 'Completed'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-semibold">{item.stageVenue}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">{item.dateStr}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {item.type === 'Arts' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors cursor-pointer"
                  >
                    <span>View Program</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : item.type === 'Sports' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Match Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Slot Details</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900">No Scheduled Programs Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
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
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
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
