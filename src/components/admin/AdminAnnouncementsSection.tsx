import React, { useState } from 'react';
import { Megaphone01Icon as Megaphone, Add01Icon as Plus, Delete01Icon as Trash2, Edit02Icon as Edit2, Search01Icon as Search, Cancel01Icon as X, Alert02Icon as AlertTriangle, SparklesIcon as Sparkles } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { Announcement } from '../../types/festival';

export const AdminAnnouncementsSection: React.FC = () => {
  const {
    announcements,
    addAnnouncement,
    editAnnouncement,
    deleteAnnouncement,
    showToast,
  } = useFestival();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // New Announcement form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('General');
  const [isUrgent, setIsUrgent] = useState(false);
  const [author, setAuthor] = useState('Central Fest Control');

  const filteredAnnouncements = (announcements || []).filter((a) => {
    const q = (search || '').toLowerCase();
    const matchesQuery =
      !q ||
      (a.title || '').toLowerCase().includes(q) ||
      (a.content || '').toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setTitle('');
    setContent('');
    setCategory('General');
    setIsUrgent(false);
    setAuthor('Central Fest Control');
    setIsNewModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setTitle(ann.title || '');
    setContent(ann.content || '');
    setCategory(ann.category || 'General');
    setIsUrgent(Boolean(ann.isUrgent));
    setAuthor(ann.author || 'Central Fest Control');
    setIsNewModalOpen(true);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Error', 'Please fill in all announcement fields.', 'error');
      return;
    }

    if (editingAnnouncement) {
      editAnnouncement(editingAnnouncement.id, {
        title: title.trim(),
        content: content.trim(),
        category,
        isUrgent,
        author,
      });
      showToast('Announcement Updated', 'Broadcast item modified successfully.', 'success');
    } else {
      addAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        isUrgent,
        author,
      });
      showToast('Broadcast Published', 'Live announcement posted to the website banner & ticker.', 'success');
    }

    setTitle('');
    setContent('');
    setIsUrgent(false);
    setEditingAnnouncement(null);
    setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Live Announcements &amp; Broadcast Ticker
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Post breaking announcements, schedule changes, and stage callouts directly to the live home ticker.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post Live Broadcast</span>
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
            placeholder="Search announcements by title or content..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Breaking">Breaking</option>
            <option value="Arts">Arts</option>
            <option value="Sports">Sports</option>
            <option value="General">General</option>
            <option value="Schedule">Schedule</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.map((ann, idx) => (
          <div
            key={ann.id ? `adm-ann-${ann.id}-${idx}` : `adm-ann-${idx}`}
            className={`p-4 rounded-xl border transition-all ${
              ann.isUrgent
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-white border-slate-200'
            } shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {ann.isUrgent && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                    Urgent Alert
                  </span>
                )}

                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                  {ann.category}
                </span>

                <span className="text-xs text-slate-400">
                  {new Date(ann.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
              <div className="text-[11px] text-slate-400">Published by: {ann.author || 'Admin'}</div>
            </div>

            <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
              <button
                onClick={() => handleOpenEdit(ann)}
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                title="Edit announcement"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteAnnouncement(ann.id)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">No Announcements Found</h3>
            <p className="text-xs text-slate-500 mt-1">Post a live broadcast or emergency notice for all attendees.</p>
          </div>
        )}
      </div>

      {/* New Announcement Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Post Live Broadcast Announcement</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Western Group Song Commencing at Stage 1"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Detailed Message / Broadcast Body
                </label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter message for attendees, participants, or jury..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="General">General</option>
                    <option value="Breaking">Breaking</option>
                    <option value="Arts">Arts</option>
                    <option value="Sports">Sports</option>
                    <option value="Schedule">Schedule</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Author / Authority</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <input
                  type="checkbox"
                  id="urgent-check"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="urgent-check" className="text-xs font-bold text-rose-900 cursor-pointer">
                  Mark as Urgent Alert (High Priority Flash Banner)
                </label>
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
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
