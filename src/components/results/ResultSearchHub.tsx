import React, { useState, useEffect, useMemo } from 'react';
import { Search01Icon as Search, Award01Icon as Award, Award01Icon as Trophy, UserIcon as User, Tick01Icon as CheckCircle2, Download01Icon as Download, SparklesIcon as Sparkles, QrCodeIcon as QrCode, BrushIcon as Palette, Activity02Icon as Activity, ArrowRight01Icon as ArrowRight, FilterIcon as Filter, Award02Icon as Medal, Calendar01Icon as Calendar, Clock01Icon as Clock, ArrowRight01Icon as ChevronRight, Folder01Icon as FileCheck, Shield02Icon as ShieldCheck, Building02Icon as Building2 } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassBadge, GlassButton } from '../ui/GlassCard';
import { Participant, ArtsResultEntry, ArtsProgram } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo, ParticipantAvatar } from '../ui/TeamLogo';
import { generateResultsPDF } from '../../utils/pdfExport';
import { deduplicateProgramResults } from '../../utils/programHelpers';

interface ResultSearchHubProps {
  initialChestNo?: string;
  initialAdmissionNo?: string;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCertificateModal: (participant: Participant) => void;
}

export const ResultSearchHub: React.FC<ResultSearchHubProps> = ({
  initialChestNo,
  initialAdmissionNo,
  setActiveTab,
  onOpenCertificateModal,
}) => {
  const { participants, teams, artsPrograms, sportsMatches, festConfig } = useFestival();
  const [viewTab, setViewTab] = useState<'participants' | 'programs' | 'houses'>('participants');
  const [query, setQuery] = useState(initialAdmissionNo || initialChestNo || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('All');

  useEffect(() => {
    const initVal = initialAdmissionNo || initialChestNo;
    if (initVal) {
      setQuery(initVal);
      setViewTab('participants');
    }
  }, [initialAdmissionNo, initialChestNo]);

  // Aggregate and map results per participant from artsPrograms
  const participantResultsMap = useMemo(() => {
    const map = new Map<string, Array<ArtsResultEntry & { programName: string; stage?: string; category?: string; code?: string }>>();

    artsPrograms.forEach((prog) => {
      const cleanResults = deduplicateProgramResults(prog.results || []);
      cleanResults.forEach((res) => {
        const keyById = res.participantId;
        const keyByAdm = res.admissionNo ? String(res.admissionNo).toLowerCase().trim() : undefined;
        const keyByChest = res.chestNo ? String(res.chestNo).toLowerCase().trim() : undefined;

        const enrichedResult = {
          ...res,
          programName: prog.name,
          stage: prog.stage,
          category: prog.category,
          code: prog.code,
        };

        const pushUnique = (k: string) => {
          const list = map.get(k) || [];
          const alreadyHas = list.some((item) => (item.code && item.code === prog.code) || (item.id && item.id === res.id) || (item.programName === prog.name && item.rank === res.rank));
          if (!alreadyHas) {
            list.push(enrichedResult);
            map.set(k, list);
          }
        };

        if (keyById) pushUnique(keyById);
        if (keyByAdm && keyByAdm !== keyById) pushUnique(keyByAdm);
        if (keyByChest && keyByChest !== keyById) pushUnique(keyByChest);
      });
    });

    return map;
  }, [artsPrograms]);

  const q = (query || '').toLowerCase().trim();

  // Filter participants: search by Student Name, Admission No (Ad No), or Chest No
  const filteredParticipants = useMemo(() => {
    const cleanQ = q.replace(/[\s-_]/g, '');
    return participants.filter((p) => {
      const cleanAdm = String(p.admissionNo || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanName = String(p.name || '').toLowerCase();
      const cleanChest = String(p.chestNo || '').toLowerCase().replace(/[\s-_]/g, '');
      const matchesQuery =
        !q ||
        cleanName.includes(q) ||
        (cleanQ && cleanAdm.includes(cleanQ)) ||
        (cleanQ && cleanChest.includes(cleanQ));

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesTeam = selectedTeam === 'All' || p.teamId === selectedTeam;

      return matchesQuery && matchesCat && matchesTeam;
    });
  }, [participants, q, selectedCategory, selectedTeam]);

  // Filter programs with published or drafted results (matches by program info, student name, or result admission no)
  const filteredPrograms = useMemo(() => {
    const cleanQ = q.replace(/[\s-_]/g, '');
    return artsPrograms.filter((prog) => {
      const cleanProgName = String(prog.name || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanProgCode = String(prog.code || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanStage = String(prog.stage || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanCat = String(prog.category || '').toLowerCase().replace(/[\s-_]/g, '');

      const matchesQuery =
        !q ||
        (cleanQ && cleanProgCode.includes(cleanQ)) ||
        (cleanQ && cleanProgName.includes(cleanQ)) ||
        (cleanQ && cleanStage.includes(cleanQ)) ||
        (cleanQ && cleanCat.includes(cleanQ)) ||
        String(prog.name || '').toLowerCase().includes(q) ||
        String(prog.code || '').toLowerCase().includes(q) ||
        String(prog.stage || '').toLowerCase().includes(q) ||
        (prog.results || []).some(
          (r) => {
            const cleanAdm = String(r.admissionNo || '').toLowerCase().replace(/[\s-_]/g, '');
            const cleanChest = String(r.chestNo || '').toLowerCase().replace(/[\s-_]/g, '');
            const cleanPName = String(r.participantName || '').toLowerCase().replace(/[\s-_]/g, '');
            const house = teams.find((t) => t.id === r.teamId);
            const cleanHouse = String(house?.name || '').toLowerCase().replace(/[\s-_]/g, '');
            return (
              (cleanQ && cleanAdm.includes(cleanQ)) ||
              (cleanQ && cleanChest.includes(cleanQ)) ||
              (cleanQ && cleanPName.includes(cleanQ)) ||
              (cleanQ && cleanHouse.includes(cleanQ)) ||
              String(r.admissionNo || '').toLowerCase().includes(q) ||
              String(r.participantName || '').toLowerCase().includes(q) ||
              String(r.chestNo || '').toLowerCase().includes(q) ||
              String(house?.name || '').toLowerCase().includes(q)
            );
          }
        );

      const matchesCat = selectedCategory === 'All' || prog.category === selectedCategory;
      const matchesStatus =
        selectedProgramFilter === 'All' ||
        (selectedProgramFilter === 'Published' && (prog.publishStatus === 'Published' || (prog.results && prog.results.length > 0))) ||
        (selectedProgramFilter === 'Draft' && prog.publishStatus === 'Draft') ||
        (selectedProgramFilter === 'Completed' && prog.status === 'COMPLETED');

      return matchesQuery && matchesCat && matchesStatus;
    });
  }, [artsPrograms, q, selectedCategory, selectedProgramFilter, teams]);

  // Quick sample admission numbers
  const quickAdmissionNumbers = useMemo(() => {
    const adms = participants
      .map((p) => p.admissionNo)
      .filter((adm): adm is string => Boolean(adm && adm.trim()));
    if (adms.length > 0) {
      return Array.from(new Set(adms)).slice(0, 8);
    }
    return ['AD-101', 'AD-102', 'AD-103', 'AD-104', 'AD-105'];
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

      {/* View Switcher Tabs & Download PDF Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-fit flex-wrap">
          <button
            onClick={() => setViewTab('participants')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewTab === 'participants'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            By Participant (Ad No)
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
            House Standings
          </button>
        </div>

        <button
          type="button"
          onClick={() => generateResultsPDF(artsPrograms, teams, participants, { festConfig })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
          title="Download complete certified Results PDF containing Category Totals & Grand Total With/Without Minus"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Download Official PDF (Grand Total)</span>
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
                ? "Search student name, Admission No (Ad No, e.g. AD-101), or chest no..."
                : viewTab === 'programs'
                ? "Search Program Name, Code, Venue, Winner name or Ad No..."
                : "Search House Name or Captain..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Quick Admission Number Pills */}
        {viewTab === 'participants' && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium">Quick Test Ad Nos:</span>
            {quickAdmissionNumbers.map((adm, idx) => (
              <button
                key={`qadm-${adm || 'none'}-${idx}`}
                onClick={() => setQuery(adm)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-300 font-mono font-semibold transition-colors cursor-pointer"
              >
                {adm}
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
                        <span className="text-purple-700 font-mono font-bold">
                          Total: {participant.totalPoints} PTS
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
                Try searching by student name, admission number (Ad No), or chest number.
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
              const results = deduplicateProgramResults(prog.results || []);
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
      {/* TAB 3: HOUSE STANDINGS & CATEGORY TOTALS */}
      {/* ------------------------------------------------------------- */}
      {viewTab === 'houses' && (() => {
        // Calculate category point breakdown per team
        const normalizeCat = (catStr?: string): 'Sub Junior' | 'Junior' | 'Senior' | 'General' => {
          if (!catStr) return 'General';
          const s = catStr.toLowerCase().replace(/[-_ ]/g, '');
          if (s.includes('subjunior') || s.includes('subjun')) return 'Sub Junior';
          if (s.includes('junior')) return 'Junior';
          if (s.includes('senior')) return 'Senior';
          return 'General';
        };

        const teamCatPoints: Record<string, { sub: number; jun: number; sen: number; gen: number }> = {};
        teams.forEach((t) => {
          teamCatPoints[t.id] = { sub: 0, jun: 0, sen: 0, gen: 0 };
        });

        artsPrograms.forEach((prog) => {
          const cleanResults = deduplicateProgramResults(prog.results || []);
          const catKey = normalizeCat(prog.category);
          cleanResults.forEach((res) => {
            if (res.teamId && teamCatPoints[res.teamId]) {
              const pts = Number(res.pointsAwarded) || 0;
              if (catKey === 'Sub Junior') teamCatPoints[res.teamId].sub += pts;
              else if (catKey === 'Junior') teamCatPoints[res.teamId].jun += pts;
              else if (catKey === 'Senior') teamCatPoints[res.teamId].sen += pts;
              else teamCatPoints[res.teamId].gen += pts;
            }
          });
        });

        return (
          <div className="space-y-6">
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

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                      <div className="text-xs font-bold text-purple-800">{team.artsPoints}</div>
                      <div className="text-[10px] text-purple-600">Arts Points</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="text-xs font-bold text-sky-800">{team.sportsPoints}</div>
                      <div className="text-[10px] text-sky-600">Sports Points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Points Breakdown Table */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Category & Grand Total Breakdown</h4>
                  <p className="text-xs text-slate-500">Sub Grand Total (Sub Jun + Junior + Senior), General, Penalties & Grand Total</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">House / Team</th>
                      <th className="py-2.5 px-3 text-center">Sub Jun</th>
                      <th className="py-2.5 px-3 text-center">Junior</th>
                      <th className="py-2.5 px-3 text-center">Senior</th>
                      <th className="py-2.5 px-3 text-center font-bold text-violet-700 bg-violet-50/50">Sub Grand Total</th>
                      <th className="py-2.5 px-3 text-center">General</th>
                      <th className="py-2.5 px-3 text-center font-bold text-slate-800">Total (w/o Minus)</th>
                      <th className="py-2.5 px-3 text-center font-bold text-rose-600">Minus Pts</th>
                      <th className="py-2.5 px-3 text-center font-bold text-indigo-700 bg-indigo-50/50">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teams.map((t, idx) => {
                      const cp = teamCatPoints[t.id] || { sub: 0, jun: 0, sen: 0, gen: 0 };
                      const subGrandTotal = cp.sub + cp.jun + cp.sen;
                      const grossTotal = subGrandTotal + cp.gen;
                      const minusPts = Number(t.artsMinusPoints || t.minusPoints) || 0;
                      const netGrandTotal = Math.max(0, grossTotal - minusPts);

                      return (
                        <tr key={t.id} className={idx === 0 ? 'bg-amber-50/40 font-medium' : 'hover:bg-slate-50/60'}>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                            {idx === 0 ? '1st 🏆' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : `${idx + 1}th`}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {t.name} {t.shortCode ? `(${t.shortCode})` : ''}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">{cp.sub}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{cp.jun}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{cp.sen}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-violet-700 bg-violet-50/30">
                            {subGrandTotal}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">{cp.gen}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                            {grossTotal}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-600">
                            {minusPts > 0 ? `-${minusPts}` : '0'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700 bg-indigo-50/30">
                            {netGrandTotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
