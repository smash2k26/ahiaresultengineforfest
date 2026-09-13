import React, { useState, useEffect } from 'react';
import { Search01Icon as Search, Award01Icon as Trophy, UserGroupIcon as Users, BrushIcon as Palette, Activity02Icon as Activity, File01Icon as FileText, ArrowRight01Icon as ArrowRight, Cancel01Icon as X, SparklesIcon as Sparkles } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { ActiveTab } from './Sidebar';
import { ParticipantAvatar } from '../ui/TeamLogo';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectParticipant?: (chestNo: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onSelectParticipant,
}) => {
  const { participants, teams, artsPrograms, sportsMatches, documents } = useFestival();
  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const q = (query || '').toLowerCase().trim();

  const matchedParticipants = q
    ? participants.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.chestNo || '').toLowerCase().includes(q) ||
          (p.admissionNo || '').toLowerCase().includes(q)
      )
    : [];

  const matchedTeams = q
    ? teams.filter((t) => (t.name || '').toLowerCase().includes(q) || (t.shortCode || '').toLowerCase().includes(q))
    : [];

  const matchedArts = q
    ? artsPrograms.filter(
        (a) =>
          (a.name || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q) ||
          (a.venue || '').toLowerCase().includes(q)
      )
    : [];

  const matchedSports = q
    ? sportsMatches.filter(
        (s) =>
          (s.title || '').toLowerCase().includes(q) ||
          (s.sport || '').toLowerCase().includes(q) ||
          (s.venue || '').toLowerCase().includes(q)
      )
    : [];

  const matchedDocs = q
    ? documents.filter(
        (d) =>
          (d.title || '').toLowerCase().includes(q) ||
          (d.category || '').toLowerCase().includes(q) ||
          (d.description || '').toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchedParticipants.length +
    matchedTeams.length +
    matchedArts.length +
    matchedSports.length +
    matchedDocs.length;

  const handleOpenParticipant = (chestNo: string) => {
    if (onSelectParticipant) {
      onSelectParticipant(chestNo);
    } else {
      setActiveTab('results');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-purple-600 shrink-0" />
          <input
            type="text"
            placeholder="Search chest no (e.g. A101), participant name, house, event..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 text-sm sm:text-base placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-slate-200/70 rounded text-slate-600">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="py-8 text-center text-slate-500 space-y-3">
              <Sparkles className="w-8 h-8 text-purple-500 mx-auto" />
              <p className="text-xs sm:text-sm">
                Type a chest number like <span className="text-purple-600 font-mono font-bold">A101</span>,
                house name like <span className="text-amber-600 font-bold">Ruby Royals</span>, or program name.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['A101', 'Mappilappattu', 'Football', 'Ruby Royals', 'Aisha Safa', 'Rules'].map((s, idx) => (
                  <button
                    key={`search-sug-${s}-${idx}`}
                    onClick={() => setQuery(s)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium text-slate-700">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try checking for typos or searching by Chest Number</p>
            </div>
          )}

          {/* Group: Participants */}
          {matchedParticipants.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 px-2 pb-1.5 flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                Participants ({matchedParticipants.length})
              </div>
              <div className="space-y-1">
                {matchedParticipants.map((p, idx) => {
                  const team = teams.find((t) => t.id === p.teamId);
                  return (
                    <button
                      key={p.id || `search-p-${p.chestNo || idx}-${idx}`}
                      onClick={() => handleOpenParticipant(p.chestNo)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ParticipantAvatar
                          photo={p.photo}
                          name={p.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span className="font-mono text-purple-600 font-semibold">Chest: {p.chestNo}</span>
                            <span>•</span>
                            <span className="text-slate-700">{team?.name}</span>
                            <span>•</span>
                            <span>{p.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-amber-600">
                          {p.totalPoints} PTS
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group: Teams */}
          {matchedTeams.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 px-2 pb-1.5 flex items-center gap-1.5">
                <Trophy className="w-3 h-3" />
                Houses & Teams ({matchedTeams.length})
              </div>
              <div className="space-y-1">
                {matchedTeams.map((t, idx) => (
                  <button
                    key={t.id || `search-t-${idx}`}
                    onClick={() => {
                      setActiveTab('teams');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{t.logo}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                          {t.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Rank #{t.rank} • Captain: {t.captain}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-600">
                        {t.totalPoints} PTS
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group: Arts Programs */}
          {matchedArts.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 px-2 pb-1.5 flex items-center gap-1.5">
                <Palette className="w-3 h-3" />
                Arts Programs ({matchedArts.length})
              </div>
              <div className="space-y-1">
                {matchedArts.map((a, idx) => (
                  <button
                    key={a.id || `search-a-${a.code || idx}-${idx}`}
                    onClick={() => {
                      setActiveTab('arts');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                        {a.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {a.category} • {a.stage} • {a.time}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {a.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group: Sports Matches */}
          {matchedSports.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 px-2 pb-1.5 flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                Sports Competitions ({matchedSports.length})
              </div>
              <div className="space-y-1">
                {matchedSports.map((s, idx) => (
                  <button
                    key={s.id || `search-s-${idx}`}
                    onClick={() => {
                      setActiveTab('sports');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {s.title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {s.sport} • {s.venue} • {s.time}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {s.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group: Documents */}
          {matchedDocs.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 px-2 pb-1.5 flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                Rules & Documents ({matchedDocs.length})
              </div>
              <div className="space-y-1">
                {matchedDocs.map((d, idx) => (
                  <button
                    key={d.id || `search-d-${idx}`}
                    onClick={() => {
                      setActiveTab('documents');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {d.title}
                      </div>
                      <div className="text-[10px] text-slate-500">{d.category}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{d.fileSize}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
