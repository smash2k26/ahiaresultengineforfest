import React, { useState } from 'react';
import { Calendar01Icon as Calendar, Clock01Icon as Clock, Location01Icon as MapPin, BrushIcon as Palette, Activity02Icon as Activity, RadioIcon as Radio, Tick01Icon as CheckCircle2, FilterIcon as Filter, UserGroupIcon as Users, Notification01Icon as Bell } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { ActiveTab } from '../layout/Sidebar';

interface ScheduleHubProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenArtsTab: () => void;
  onOpenSportsTab: () => void;
}

export const ScheduleHub: React.FC<ScheduleHubProps> = ({
  setActiveTab,
  onOpenArtsTab,
  onOpenSportsTab,
}) => {
  const { schedule } = useFestival();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Arts' | 'Sports'>('All');

  const days = [
    { day: 1, label: 'Day 1 — Inaugural & Solo Arts', date: 'Oct 24, 2026' },
    { day: 2, label: 'Day 2 — Group Dance & Sports', date: 'Oct 25, 2026' },
    { day: 3, label: 'Day 3 — Finals & Grand Valedictory', date: 'Oct 26, 2026' },
  ];

  const filtered = (schedule || []).filter((s) => {
    const matchesDay = s.day === selectedDay;
    const matchesType = typeFilter === 'All' || s.type === typeFilter;
    return matchesDay && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Schedule Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#111318] to-[#0A0C10] border border-amber-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <GlassBadge variant="warning" size="sm">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              TIMELINE & STAGES
            </GlassBadge>
            <span className="text-xs text-amber-300 font-mono">Day 1 to Day 3</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            Festival Timeline & Venue Schedules
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Official day-wise program timeline across Main Auditorium, Kalam Stage, Open Air Theatre, Stadium & Indoor Badminton Courts.
          </p>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {days.map((d, idx) => (
          <button
            key={`sch-day-${d.day}-${idx}`}
            onClick={() => setSelectedDay(d.day)}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
              selectedDay === d.day
                ? 'bg-gradient-to-br from-amber-500/20 to-purple-600/20 border-amber-500/50 shadow-lg shadow-amber-500/10'
                : 'bg-[#111318]/80 border-white/8 hover:border-white/20 text-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Day 0{d.day}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{d.date}</span>
            </div>
            <div className="text-sm font-bold text-white mt-1.5">{d.label}</div>
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111318]/90 border border-white/8">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">Event Discipline:</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/8 text-xs">
          {(['All', 'Arts', 'Sports'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                typeFilter === t
                  ? 'bg-white text-gray-950 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Timeline Items */}
      <div className="space-y-4">
        {filtered.map((item, idx) => {
          const isLive = item.status === 'LIVE';
          const isCompleted = item.status === 'COMPLETED';

          return (
            <div
              key={item.id || `sch-item-${item.title || idx}-${idx}`}
              className={`p-5 rounded-3xl bg-[#111318]/90 border backdrop-blur-2xl transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${
                isLive ? 'border-amber-500/40 bg-amber-950/20 shadow-amber-950/30' : 'border-white/8'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 w-24 text-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-xs font-mono font-bold text-white">{item.timeSlot}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <GlassBadge
                      variant={item.type === 'Arts' ? 'arts' : 'sports'}
                      size="xs"
                    >
                      {item.type === 'Arts' ? <Palette className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                      {item.type}
                    </GlassBadge>

                    {isLive && (
                      <GlassBadge variant="live" size="xs" pulse>
                        ON STAGE NOW
                      </GlassBadge>
                    )}
                    {isCompleted && (
                      <GlassBadge variant="success" size="xs">
                        Finished
                      </GlassBadge>
                    )}
                    {!isLive && !isCompleted && (
                      <GlassBadge variant="neutral" size="xs">
                        Upcoming
                      </GlassBadge>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-display text-white">
                    {item.eventTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {item.stageVenue}
                    </span>
                    <span>•</span>
                    <span>Coordinator: {item.coordinator}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {item.type === 'Arts' ? (
                  <GlassButton variant="arts" size="sm" onClick={onOpenArtsTab}>
                    Open Arts Hub
                  </GlassButton>
                ) : (
                  <GlassButton variant="sports" size="sm" onClick={onOpenSportsTab}>
                    Open Sports Arena
                  </GlassButton>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400 bg-white/[0.01] rounded-3xl border border-white/5">
            <Calendar className="w-10 h-10 text-amber-400/40 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No Events on this Filter</h3>
            <p className="text-xs text-gray-500 mt-1">Select another day or show all disciplines.</p>
          </div>
        )}
      </div>
    </div>
  );
};
