import React, { useState } from 'react';
import {
  File01Icon as FileText,
  Download01Icon as Download,
  Shield02Icon as ShieldCheck,
  Search01Icon as Search,
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassBadge } from '../ui/GlassCard';

export const DocumentsHub: React.FC = () => {
  const { documents, showToast } = useFestival();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Manual', 'Rules', 'Circular', 'Guidelines'];

  const filtered = (documents || []).filter((doc) => {
    const q = (search || '').toLowerCase();
    const matchesSearch =
      !q ||
      String(doc.title || '').toLowerCase().includes(q) ||
      String(doc.description || '').toLowerCase().includes(q) ||
      String(doc.category || '').toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All' || doc.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const handleDownload = (title: string) => {
    showToast('Download Started', `Downloading "${title}" official PDF document.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Documents Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden text-slate-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              OFFICIAL REPOSITORY
            </span>
            <span className="text-xs text-emerald-700 font-mono font-semibold">Bylaws &amp; Guidelines</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Festival Rules, Bylaws &amp; Manuals
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Download verified festival handbooks, judging rubrics, appeal forms, code of conduct, and schedule circulars.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents, handbooks, rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs overflow-x-auto">
          {categories.map((cat, idx) => (
            <button
              key={`doc-cat-${cat}-${idx}`}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {doc.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {doc.fileSize} • {doc.fileType}
                </span>
              </div>

              <h3 className="text-base font-bold font-display text-slate-900">{doc.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{doc.description}</p>
              <div className="text-[10px] text-slate-400 font-mono mt-2">
                Updated: {doc.updatedAt}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Official PDF
              </span>
              <button
                onClick={() => handleDownload(doc.title)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No Documents Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing the search query or selecting &ldquo;All&rdquo;.</p>
        </div>
      )}
    </div>
  );
};
