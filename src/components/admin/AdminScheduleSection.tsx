import React, { useState } from 'react';
import { Clock01Icon as Clock, Add01Icon as Plus, Delete01Icon as Trash2, Edit02Icon as Edit2, Calendar01Icon as Calendar, Search01Icon as Search, Location01Icon as MapPin, Cancel01Icon as X, SparklesIcon as Sparkles, Layers01Icon as Layers } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { ScheduleItem } from '../../types/festival';

export const AdminScheduleSection: React.FC = () => {
  const {
    schedule,
    addScheduleItem,
    editScheduleItem,
    deleteScheduleItem,
    showToast,
  } = useFestival();

  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form state
  const [day, setDay] = useState('Day 1');
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('09:30 AM');
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState('Stage 1 (Main Auditorium)');
  const [category, setCategory] = useState('Senior');
  const [type, setType] = useState<'Arts' | 'Sports' | 'Ceremony'>('Arts');
  const [status, setStatus] = useState<ScheduleItem['status']>('UPCOMING');

  const filteredSchedule = (schedule || []).filter((item) => {
    const q = (search || '').toLowerCase();
    const matchesQuery =
      !q ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.stage || '').toLowerCase().includes(q) ||
      (item.category ? String(item.category).toLowerCase().includes(q) : false);

    const matchesDay = dayFilter === 'All' || item.day === dayFilter;
    const matchesStage = stageFilter === 'All' || item.stage === stageFilter;

    return matchesQuery && matchesDay && matchesStage;
  });

  const stages = Array.from(new Set(schedule.map((s) => s.stage)));
  const days = Array.from(new Set(schedule.map((s) => s.day)));

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDay('Day 1');
    setDate('2026-10-15');
    setTime('09:30 AM');
    setStage('Stage 1 (Main Auditorium)');
    setCategory('Senior');
    setType('Arts');
    setStatus('UPCOMING');
    setIsNewModalOpen(true);
  };

  const handleOpenEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setDay(item.day || 'Day 1');
    setDate(item.date || '2026-10-15');
    setTime(item.time || '09:30 AM');
    setStage(item.stage || 'Stage 1 (Main Auditorium)');
    setCategory(item.category || 'Senior');
    setType(item.type || 'Arts');
    setStatus(item.status || 'UPCOMING');
    setIsNewModalOpen(true);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Error', 'Please enter program title.', 'error');
      return;
    }

    if (editingItem) {
      editScheduleItem(editingItem.id, {
        day,
        date,
        time,
        title: title.trim(),
        stage,
        category,
        type,
        status,
      });
      showToast('Schedule Updated', 'Slot details updated successfully.', 'success');
    } else {
      addScheduleItem({
        day,
        date,
        time,
        title: title.trim(),
        stage,
        category,
        type,
        status,
      });
      showToast('Schedule Slot Created', 'Timeline updated successfully.', 'success');
    }

    setTitle('');
    setEditingItem(null);
    setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Festival Timeline &amp; Stage Schedule Manager
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Organize stage slots, venues, event timing, and live day-wise schedules.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Schedule Slot</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schedule by event name, stage, or category..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Days</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Stages / Venues</option>
            {stages.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Day &amp; Time</th>
                <th className="px-4 py-3">Event / Program</th>
                <th className="px-4 py-3">Stage / Venue</th>
                <th className="px-4 py-3">Type &amp; Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSchedule.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <span className="font-bold text-slate-900 block">{item.day}</span>
                    <span className="font-mono text-[11px] text-slate-500">{item.time}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{item.stage}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mr-1.5">
                      {item.type}
                    </span>
                    <span className="text-slate-500 text-[11px]">{item.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.status === 'LIVE'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : item.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                        title="Edit Schedule Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteScheduleItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Delete Schedule Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSchedule.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No schedule slots found. Click &quot;Add Schedule Slot&quot; to organize events.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Schedule Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Schedule Slot</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Program / Event Name
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Classical Dance Bharatanatyam (Single)"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Day</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Day 1">Day 1</option>
                    <option value="Day 2">Day 2</option>
                    <option value="Day 3">Day 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="09:30 AM"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Stage / Venue
                </label>
                <input
                  type="text"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  placeholder="Stage 1 (Main Auditorium) or Ground B"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Arts">Arts</option>
                    <option value="Sports">Sports</option>
                    <option value="Ceremony">Ceremony</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Senior">Senior</option>
                    <option value="Junior">Junior</option>
                    <option value="Sub Junior">Sub Junior</option>
                    <option value="General">General / All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE">Live Now</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
