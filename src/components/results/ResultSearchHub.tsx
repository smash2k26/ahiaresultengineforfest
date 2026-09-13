import React, { useState, useEffect, useMemo } from 'react';
import { Search01Icon as Search, Award01Icon as Award, Award01Icon as Trophy, UserIcon as User, Tick01Icon as CheckCircle2, Download01Icon as Download, SparklesIcon as Sparkles, QrCodeIcon as QrCode, BrushIcon as Palette, Activity02Icon as Activity, ArrowRight01Icon as ArrowRight, FilterIcon as Filter, Award02Icon as Medal, Calendar01Icon as Calendar, Clock01Icon as Clock, ArrowRight01Icon as ChevronRight, Folder01Icon as FileCheck, Shield02Icon as ShieldCheck, Building02Icon as Building2 } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassBadge, GlassButton } from '../ui/GlassCard';
import { Participant, ArtsResultEntry, ArtsProgram } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo, ParticipantAvatar } from '../ui/TeamLogo';

interface ResultSearchHubProps {
  initialChestNo?: string;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCertificateModal: (participant: Participant) => void;
}

export const ResultSearchHub: React.FC<ResultSearchHubProps> = ({
  initialChestNo,
  setActiveTab,
  onOpenCertificateModal,
}) => {
  const { participants, teams, artsPrograms, sportsMatches, festConfig } = useFestival();
  const [viewTab, setViewTab] = useState<'participants' | 'programs' | 'houses'>('participants');
  const [query, setQuery] = useState(initialChestNo || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('All');

  useEffect(() => {
    if (initialChestNo) {
      setQuery(initialChestNo);
      setViewTab('participants');
    }
  }, [initialChestNo]);

  // Aggregate and map results per participant from artsPrograms
  const participantResultsMap = useMemo(() => {
    const map = new Map<string, Array<ArtsResultEntry & { programName: string; stage?: string; category?: string; code?: string }>>();

    artsPrograms.forEach((prog) => {
      (prog.results || []).forEach((res) => {
        const keyById = res.participantId;
        const keyByChest = res.chestNo ? String(res.chestNo).toLowerCase().trim() : undefined;

        const enrichedResult = {
          ...res,
          programName: prog.name,
          stage: prog.stage,
          category: prog.category,
          code: prog.code,
        };

        if (keyById) {
          const list = map.get(keyById) || [];
          list.push(enrichedResult);
          map.set(keyById, list);
        }
        if (keyByChest && keyByChest !== keyById) {
          const list = map.get(keyByChest) || [];
          list.push(enrichedResult);
          map.set(keyByChest, list);
        }
      });
    });

    return map;
  }, [artsPrograms]);

  const q = (query || '').toLowerCase().trim();

  // Filter participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesQuery =
        !q ||
        (p.chestNo || '').toLowerCase().includes(q) ||
        (p.admissionNo || '').toLowerCase().includes(q) ||
        (p.name || '').toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesTeam = selectedTeam === 'All' || p.teamId === selectedTeam;

      return matchesQuery && matchesCat && matchesTeam;
    });
  }, [participants, q, selectedCategory, selectedTeam]);

  // Filter programs with published or drafted results
  const filteredPrograms = useMemo(() => {
    return artsPrograms.filter((prog) => {
      const matchesQuery =
        !q ||
        (prog.name || '').toLowerCase().includes(q) ||
        (prog.code || '').toLowerCase().includes(q) ||
        (prog.stage || '').toLowerCase().includes(q) ||
        (prog.results || []).some(
          (r) =>
            (r.participantName || '').toLowerCase().includes(q) ||
            (r.chestNo || '').toLowerCase().includes(q)
        );

      const matchesCat = selectedCategory === 'All' || prog.category === selectedCategory;
      const matchesStatus =
        selectedProgramFilter === 'All' ||
        (selectedProgramFilter === 'Published' && prog.publishStatus === 'Published') ||
        (selectedProgramFilter === 'Draft' && prog.publishStatus === 'Draft') ||
        (selectedProgramFilter === 'Completed' && prog.status === 'COMPLETED');

      return matchesQuery && matchesCat && matchesStatus;
    });
  }, [artsPrograms, q, selectedCategory, selectedProgramFilter]);

  // Quick sample chest numbers
  const quickChestNumbers = useMemo(() => {
    if (participants.length > 0) {
      return participants.slice(0, 8).map((p) => p.chestNo);
    }
    return ['A101', 'A102', 'A103', 'A104', 'A105', 'A106'];
  }, [participants]);

  return (
    <div className="space-y-6">
      {/* Result Hub Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-amber-50 border border-slate-200 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                <FileCheck className="w-3.5 h-3.5 text-purple-700" />
                Live Result Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Official AHIA System</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              Digital Result Search & Performance Slips
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Instant access to participant evaluation marks, prize standings, jury verdicts, and authenticated digital merit certificates.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs min-w-[90px]">
              <div className="text-xl font-bold font-mono text-purple-700">
                {artsPrograms.reduce((acc, p) => acc + (p.results?.length || 0), 0)}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Scores Logged</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs min-w-[90px]">
              <div className="text-xl font-bold font-mono text-amber-600">
                {artsPrograms.filter((p) => p.publishStatus === 'Published').length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Published</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-fit">
        <button
          onClick={() => setViewTab('participants')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            viewTab === 'participants'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          By Participant (Chest No)
        </button>

        <button
          onClick={() => setViewTab('programs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            viewTab === 'programs'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          By Program Result Sheet
        </button>

        <button
          onClick={() => setViewTab('houses')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            viewTab === 'houses'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          House Standings & Medals
        </button>
      </div>

      {/* Search Input Box */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-purple-600 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              viewTab === 'participants'
                ? "Type Chest No (e.g. A101), Admission No (e.g. ADM202601), or Student Name..."
                : viewTab === 'programs'
                ? "Search Program Name, Code, Venue, or Winner Name..."
                : "Search House Name or Captain..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Quick Chest Number Pills */}
        {viewTab === 'participants' && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium">Quick Test Chests:</span>
            {quickChestNumbers.map((ch, idx) => (
              <button
                key={`qch-${ch || 'none'}-${idx}`}
                onClick={() => setQuery(ch)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-300 font-mono font-semibold transition-colors cursor-pointer"
              >
                {ch}
              </button>
            ))}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-700 underline ml-auto text-xs cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}

        {/* Category & Team Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">House:</span>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Houses</option>
              {teams.map((t, idx) => (
                <option key={`res-t-opt-${t.id}-${idx}`} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Categories</option>
              <option value="Senior">Senior</option>
              <option value="Junior">Junior</option>
              <option value="Sub Junior">Sub Junior</option>
            </select>
          </div>

          {viewTab === 'programs' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Publish Status:</span>
              <select
                value={selectedProgramFilter}
                onChange={(e) => setSelectedProgramFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published Official</option>
                <option value="Draft">Draft / In Evaluation</option>
                <option value="Completed">Completed Events</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: PARTICIPANT DIGITAL RESULT SLIPS */}
      {/* ------------------------------------------------------------- */}
      {viewTab === 'participants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Matched Competitors ({filteredParticipants.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">Official Registry Sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredParticipants.map((participant, idx) => {
              const team = teams.find((t) => t.id === participant.teamId);
              const pResults =
                participantResultsMap.get(participant.id) ||
                (participant.chestNo ? participantResultsMap.get(String(participant.chestNo).toLowerCase().trim()) : undefined) ||
                [];

              return (
                <div
                  key={participant.id ? `rsh-p-${participant.id}-${idx}` : `rsh-p-${participant.chestNo || idx}-${idx}`}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 hover:border-purple-300 transition-all duration-200 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Profile Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ParticipantAvatar
                          photo={participant.photo}
                          name={participant.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 shadow-xs"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                              {participant.chestNo}
                            </span>
                            <span className="text-xs text-slate-500">{participant.category}</span>
                          </div>
                          <h4 className="text-base sm:text-lg font-bold font-display text-slate-900 mt-1 truncate">
                            {participant.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Adm No: <span className="font-mono text-slate-700 font-semibold">{participant.admissionNo}</span> • Class {participant.yearClass || participant.classGrade || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black font-display font-mono text-amber-600">
                          {participant.totalPoints}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono font-semibold">TOTAL PTS</div>
                      </div>
                    </div>

                    {/* House Affiliation */}
                    {team && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <TeamLogo logo={team.logo} name={team.name} color={team.color} size="sm" />
                          <span className="font-bold text-slate-800">{team.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">House #{team.rank}</span>
                      </div>
                    )}

                    {/* Program Results & Positions Breakdown */}
                    <div className="mt-4 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Recorded Events ({pResults.length})</span>
                        <span className="text-amber-600 font-mono font-semibold">
                          🥇 {participant.golds} | 🥈 {participant.silvers} | 🥉 {participant.bronzes}
                        </span>
                      </div>

                      {pResults.length > 0 ? (
                        <div className="space-y-1.5">
                          {pResults.map((res, idx) => (
                            <div
                              key={`pres-${participant.id}-${res.programName || ''}-${res.chestNo || ''}-${idx}`}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                            >
                              <div className="truncate min-w-0 pr-2">
                                <div className="font-semibold text-slate-900 truncate">
                                  {res.programName}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Position: <strong className="text-amber-600 font-bold">{res.position}</strong> • {res.grade}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="font-mono font-bold text-slate-900">
                                  {res.marks} Marks
                                </div>
                                <div className="text-[10px] font-bold text-emerald-600">
                                  +{res.pointsAwarded} Pts Awarded
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                          No official scores recorded yet. Results will appear here once published from Admin panel.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Action: Digital Certificate */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Entry
                    </div>

                    <button
                      onClick={() => onOpenCertificateModal(participant)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      View Official Certificate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredParticipants.length === 0 && (
            <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
              <User className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">No Participant Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Check the chest number or admission number and try searching again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PROGRAM-WISE RESULT SHEETS */}
      {/* ------------------------------------------------------------- */}
      {viewTab === 'programs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Arts & Cultural Programs ({filteredPrograms.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">Jury Evaluation Verdicts</span>
          </div>

          <div className="space-y-4">
            {filteredPrograms.map((prog, idx) => {
              const results = prog.results || [];
              const sortedResults = [...results].sort((a, b) => a.rank - b.rank || b.marks - a.marks);

              return (
                <div
                  key={prog.id ? `rsh-prog-${prog.id}-${idx}` : `rsh-prog-${prog.code || idx}-${idx}`}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {prog.code || 'EV-' + prog.id.slice(-3)}
                        </span>
                        <span className="text-xs text-slate-500">{prog.category} • {prog.section}</span>
                      </div>
                      <h4 className="text-lg font-bold font-display text-slate-900 mt-1">
                        {prog.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Venue: {prog.venue || prog.stage}</span>
                        <span>•</span>
                        <span>Time: {prog.time || prog.scheduledTime || 'N/A'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                          prog.publishStatus === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : prog.publishStatus === 'Draft'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {prog.publishStatus === 'Published' ? '✓ Official Published' : prog.publishStatus === 'Draft' ? 'Draft Marks' : 'Pending Verdict'}
                      </span>
                    </div>
                  </div>

                  {/* Results Table */}
                  {sortedResults.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                            <th className="py-2.5 px-3">Position / Rank</th>
                            <th className="py-2.5 px-3">Chest No</th>
                            <th className="py-2.5 px-3">Participant Name</th>
                            <th className="py-2.5 px-3">House</th>
                            <th className="py-2.5 px-3">Raw Marks</th>
                            <th className="py-2.5 px-3">Grade</th>
                            <th className="py-2.5 px-3 text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sortedResults.map((res, idx) => {
                            const team = teams.find((t) => t.id === res.teamId);
                            const isFirst = res.rank === 1 || res.position.includes('1st');
                            const isSecond = res.rank === 2 || res.position.includes('2nd');
                            const isThird = res.rank === 3 || res.position.includes('3rd');

                            return (
                              <tr key={`prog-res-${prog.id}-${res.participantId || res.chestNo || idx}-${idx}`} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2.5 px-3 font-bold">
                                  {isFirst && <span className="text-amber-600 font-bold">🥇 1st Prize</span>}
                                  {isSecond && <span className="text-slate-600 font-bold">🥈 2nd Prize</span>}
                                  {isThird && <span className="text-amber-700 font-bold">🥉 3rd Prize</span>}
                                  {!isFirst && !isSecond && !isThird && (
                                    <span className="text-slate-600">{res.position || `Rank #${res.rank}`}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-purple-700">
                                  {res.chestNo}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                  {res.participantName}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600">
                                  {team ? (
                                    <div className="flex items-center gap-1.5">
                                      <TeamLogo logo={team.logo} name={team.name} color={team.color} size="xs" />
                                      <span>{team.name}</span>
                                    </div>
                                  ) : (
                                    res.teamId
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-900 font-semibold">
                                  {res.marks}/100
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                                    {res.grade}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">
                                  +{res.pointsAwarded} PTS
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No jury scores entered yet for this program. Evaluators can enter scores in the Admin Portal.
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPrograms.length === 0 && (
              <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
                <Palette className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900">No Programs Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting the category or search keyword.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: HOUSE STANDINGS & MEDAL TALLY */}
      {/* ------------------------------------------------------------- */}
      {viewTab === 'houses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Inter-House Championship Standings ({teams.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">Recalculated Live with Every Mark</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team, idx) => (
              <div
                key={team.id ? `rsh-team-${team.id}-${idx}` : `rsh-team-${idx}`}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <TeamLogo logo={team.logo} name={team.name} color={team.color} size="xl" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {team.shortCode}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">Rank #{team.rank}</span>
                      </div>
                      <h4 className="text-lg font-bold font-display text-slate-900 mt-0.5">
                        {team.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Captain: <strong className="text-slate-700">{team.captain || 'Assigned in Admin'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black font-display font-mono text-amber-600">
                      {team.totalPoints}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono font-semibold">TOTAL PTS</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-700">{team.artsPoints}</div>
                    <div className="text-[10px] text-slate-400">Arts Points</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-700">{team.sportsPoints}</div>
                    <div className="text-[10px] text-slate-400">Sports Points</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-amber-600 font-mono">
                      🥇 {team.golds} 🥈 {team.silvers} 🥉 {team.bronzes}
                    </div>
                    <div className="text-[10px] text-slate-400">Medal Tally</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
