import React, { useState } from 'react';
import { File01Icon as FileText, Download01Icon as Download, Shield02Icon as ShieldCheck, Search01Icon as Search, FileDownloadIcon as FileDown, BookOpen01Icon as BookOpen, Alert01Icon as AlertCircle } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';

export const DocumentsHub: React.FC = () => {
  const { documents, showToast } = useFestival();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Manual', 'Rules', 'Circular', 'Guidelines'];

  const filtered = (documents || []).filter((doc) => {
    const q = (search || '').toLowerCase();
    const matchesSearch =
      !q ||
      (doc.title || '').toLowerCase().includes(q) ||
      (doc.description || '').toLowerCase().includes(q) ||
      (doc.category || '').toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All' || doc.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const handleDownload = (title: string) => {
    showToast('Download Started', `Downloading "${title}" official PDF document.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Documents Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-[#111318] to-[#0A0C10] border border-emerald-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <GlassBadge variant="success" size="sm">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              OFFICIAL REPOSITORY
            </GlassBadge>
            <span className="text-xs text-emerald-300 font-mono">Bylaws & Guidelines</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            Festival Rules, Bylaws & Manuals
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Download verified festival handbooks, judging rubrics, appeal forms, code of conduct, and schedule circulars.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111318]/90 border border-white/8 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents, handbooks, rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/8 text-xs overflow-x-auto">
          {categories.map((cat, idx) => (
            <button
              key={`doc-cat-${cat}-${idx}`}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc, idx) => (
          <div
            key={doc.id ? `doc-${doc.id}-${idx}` : `doc-${idx}`}
            className="p-5 rounded-3xl bg-[#111318]/90 border border-white/8 hover:border-emerald-500/40 backdrop-blur-2xl transition-all duration-200 shadow-xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <GlassBadge variant="success" size="xs">
                  {doc.category}
                </GlassBadge>
                <span className="text-[10px] text-gray-500 font-mono">
                  {doc.fileSize} • {doc.fileType}
                </span>
              </div>

              <h3 className="text-base font-bold font-display text-white">{doc.title}</h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{doc.description}</p>
              <div className="text-[10px] text-gray-500 font-mono mt-2">
                Updated: {doc.updatedAt}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Official PDF
              </span>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(doc.title)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </GlassButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
