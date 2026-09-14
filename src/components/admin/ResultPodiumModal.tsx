import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Cancel01Icon as X,
  Search01Icon as Search,
  Tick01Icon as CheckCircle2,
  Award01Icon as Trophy,
  Award01Icon as Award,
  SparklesIcon as Sparkles,
  ArrowDown01Icon as ChevronDown,
  UserIcon as User,
  BookOpen01Icon as BookOpen,
  Delete01Icon as Trash2,
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { ArtsProgram, Participant, Team, ArtsResultEntry } from '../../types/festival';
import { isSportsProgram } from '../../utils/programHelpers';

interface ResultPodiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgramId?: string;
}

interface PodiumSlotState {
  participantId: string;
  grade: string;
  points: number;
}

export const ResultPodiumModal: React.FC<ResultPodiumModalProps> = ({
  isOpen,
  onClose,
  initialProgramId,
}) => {
  const {
    artsPrograms,
    participants,
    teams,
    scoringRules,
    savePodiumResults,
    showToast,
  } = useFestival();

  // Selected Program
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    initialProgramId || (artsPrograms[0]?.id ?? '')
  );
  const [programSearch, setProgramSearch] = useState('');
  const [programTypeFilter, setProgramTypeFilter] = useState<'All' | 'Arts' | 'Sports'>('All');
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const programDropdownRef = useRef<HTMLDivElement>(null);

  // Sync selectedProgramId whenever modal opens or initialProgramId changes
  useEffect(() => {
    if (isOpen) {
      if (initialProgramId) {
        setSelectedProgramId(initialProgramId);
      } else if (!selectedProgramId && artsPrograms.length > 0) {
        setSelectedProgramId(artsPrograms[0].id);
      }
      setProgramSearch('');
      setIsProgramDropdownOpen(false);
      setIsDropdownSlot1(false);
      setIsDropdownSlot2(false);
      setIsDropdownSlot3(false);
    }
  }, [isOpen, initialProgramId, artsPrograms]);

  // Podium Slots: 1st, 2nd, 3rd
  const [slot1, setSlot1] = useState<PodiumSlotState>({ participantId: '', grade: 'Grade A+ (Outstanding)', points: 10 });
  const [slot2, setSlot2] = useState<PodiumSlotState>({ participantId: '', grade: 'Grade A (Distinction)', points: 7 });
  const [slot3, setSlot3] = useState<PodiumSlotState>({ participantId: '', grade: 'Grade B+ (Merit)', points: 5 });

  // Participant search states for each slot dropdown
  const [searchSlot1, setSearchSlot1] = useState('');
  const [isDropdownSlot1, setIsDropdownSlot1] = useState(false);
  const dropdownSlot1Ref = useRef<HTMLDivElement>(null);

  const [searchSlot2, setSearchSlot2] = useState('');
  const [isDropdownSlot2, setIsDropdownSlot2] = useState(false);
  const dropdownSlot2Ref = useRef<HTMLDivElement>(null);

  const [searchSlot3, setSearchSlot3] = useState('');
  const [isDropdownSlot3, setIsDropdownSlot3] = useState(false);
  const dropdownSlot3Ref = useRef<HTMLDivElement>(null);

  const [filterByCategoryOnly, setFilterByCategoryOnly] = useState(true);
  const [publishImmediate, setPublishImmediate] = useState(true);

  // Helper to calculate default points for a rank and grade
  const calcPoints = (rank: 1 | 2 | 3, grade: string): number => {
    let base = 0;
    if (rank === 1) base = scoringRules.goldPoints;
    else if (rank === 2) base = scoringRules.silverPoints;
    else if (rank === 3) base = scoringRules.bronzePoints;

    let gradeBonus = 0;
    if (grade.includes('A+') || grade === 'A+') gradeBonus = scoringRules.gradePointsA_Plus;
    else if (grade.includes('A') || grade === 'A') gradeBonus = scoringRules.gradePointsA;
    else if (grade.includes('B+') || grade === 'B+') gradeBonus = scoringRules.gradePointsB_Plus;
    else if (grade.includes('B') || grade === 'B') gradeBonus = scoringRules.gradePointsB;
    else if (grade.includes('Participation') || grade === 'Participated') gradeBonus = scoringRules.participationPoints;

    return base + gradeBonus;
  };

  // Find active program
  const activeProgram = useMemo(() => {
    if (!selectedProgramId) return artsPrograms[0] || null;
    return (
      artsPrograms.find((p) => p.id === selectedProgramId) ||
      artsPrograms.find((p) => p.code === selectedProgramId) ||
      artsPrograms[0] ||
      null
    );
  }, [artsPrograms, selectedProgramId]);

  // Check if participant matches program category
  const isMatchingCategory = (participantCategory?: string, programCategory?: string) => {
    if (!programCategory || programCategory === 'All' || programCategory.toLowerCase() === 'general') {
      return true;
    }
    const normProg = programCategory.toLowerCase().replace(/[\s\-_]/g, '');
    const normPart = (participantCategory || '').toLowerCase().replace(/[\s\-_]/g, '');

    if (normProg === normPart) return true;
    if (normProg.includes('subjunior') && normPart.includes('subjunior')) return true;
    if (!normProg.includes('subjunior') && normProg.includes('junior') && !normPart.includes('subjunior') && normPart.includes('junior')) return true;
    if (normProg.includes('senior') && normPart.includes('senior')) return true;
    return false;
  };

  const programCategoryLabel = activeProgram?.category || 'General';

  // When activeProgram changes, load existing results if present
  useEffect(() => {
    if (!activeProgram) return;
    const results = activeProgram.results || [];

    const resolveParticipantId = (entry?: ArtsResultEntry): string => {
      if (!entry) return '';
      // 1. Direct ID match
      if (entry.participantId) {
        const found = participants.find((p) => p.id === entry.participantId);
        if (found) return found.id;
      }
      // 2. Chest No match
      if (entry.chestNo) {
        const found = participants.find((p) => p.chestNo && p.chestNo.toLowerCase() === entry.chestNo.toLowerCase());
        if (found) return found.id;
      }
      // 3. Admission No match
      if (entry.admissionNo) {
        const found = participants.find((p) => p.admissionNo && p.admissionNo.toLowerCase() === entry.admissionNo.toLowerCase());
        if (found) return found.id;
      }
      // 4. Participant Name match
      if (entry.participantName) {
        const found = participants.find((p) => p.name.toLowerCase() === entry.participantName.toLowerCase());
        if (found) return found.id;
      }
      return entry.participantId || '';
    };

    const isRank1 = (r: ArtsResultEntry) => r.rank === 1 || String(r.position || '').toLowerCase().includes('1st') || String(r.position || '') === '1';
    const isRank2 = (r: ArtsResultEntry) => r.rank === 2 || String(r.position || '').toLowerCase().includes('2nd') || String(r.position || '') === '2';
    const isRank3 = (r: ArtsResultEntry) => r.rank === 3 || String(r.position || '').toLowerCase().includes('3rd') || String(r.position || '') === '3';

    const r1 = results.find(isRank1);
    const r2 = results.find(isRank2);
    const r3 = results.find(isRank3);

    const partId1 = resolveParticipantId(r1);
    const partId2 = resolveParticipantId(r2);
    const partId3 = resolveParticipantId(r3);

    if (r1) {
      setSlot1({
        participantId: partId1,
        grade: r1.grade || 'Grade A+ (Outstanding)',
        points: r1.pointsAwarded ?? calcPoints(1, r1.grade || 'Grade A+ (Outstanding)'),
      });
    } else {
      setSlot1({
        participantId: '',
        grade: 'Grade A+ (Outstanding)',
        points: calcPoints(1, 'Grade A+ (Outstanding)'),
      });
    }

    if (r2) {
      setSlot2({
        participantId: partId2,
        grade: r2.grade || 'Grade A (Distinction)',
        points: r2.pointsAwarded ?? calcPoints(2, r2.grade || 'Grade A (Distinction)'),
      });
    } else {
      setSlot2({
        participantId: '',
        grade: 'Grade A (Distinction)',
        points: calcPoints(2, 'Grade A (Distinction)'),
      });
    }

    if (r3) {
      setSlot3({
        participantId: partId3,
        grade: r3.grade || 'Grade B+ (Merit)',
        points: r3.pointsAwarded ?? calcPoints(3, r3.grade || 'Grade B+ (Merit)'),
      });
    } else {
      setSlot3({
        participantId: '',
        grade: 'Grade B+ (Merit)',
        points: calcPoints(3, 'Grade B+ (Merit)'),
      });
    }
  }, [activeProgram, participants, scoringRules]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (programDropdownRef.current && !programDropdownRef.current.contains(e.target as Node)) {
        setIsProgramDropdownOpen(false);
      }
      if (dropdownSlot1Ref.current && !dropdownSlot1Ref.current.contains(e.target as Node)) {
        setIsDropdownSlot1(false);
      }
      if (dropdownSlot2Ref.current && !dropdownSlot2Ref.current.contains(e.target as Node)) {
        setIsDropdownSlot2(false);
      }
      if (dropdownSlot3Ref.current && !dropdownSlot3Ref.current.contains(e.target as Node)) {
        setIsDropdownSlot3(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter programs based on search input & type filter
  const filteredPrograms = useMemo(() => {
    const q = programSearch.toLowerCase().trim();
    return artsPrograms.filter((p) => {
      const isSports = isSportsProgram(p);
      if (programTypeFilter === 'Arts' && isSports) return false;
      if (programTypeFilter === 'Sports' && !isSports) return false;

      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.section && p.section.toLowerCase().includes(q))
      );
    });
  }, [artsPrograms, programSearch, programTypeFilter]);

  // Filter participants helper strictly adhering to category
  const filterParticipants = (query: string, currentSelectedId?: string) => {
    const q = query.toLowerCase().trim();
    return participants.filter((pt) => {
      if (currentSelectedId && pt.id === currentSelectedId) {
        return true;
      }
      if (
        filterByCategoryOnly &&
        activeProgram?.category &&
        activeProgram.category !== 'General' &&
        activeProgram.category !== 'All'
      ) {
        if (!isMatchingCategory(pt.category, activeProgram.category)) {
          return false;
        }
      }
      if (!q) return true;
      const house = teams.find((t) => t.id === pt.teamId);
      return (
        pt.name.toLowerCase().includes(q) ||
        (pt.admissionNo && pt.admissionNo.toLowerCase().includes(q)) ||
        (pt.chestNo && pt.chestNo.toLowerCase().includes(q)) ||
        (house && house.name.toLowerCase().includes(q)) ||
        (pt.yearClass && pt.yearClass.toLowerCase().includes(q)) ||
        (pt.category && pt.category.toLowerCase().includes(q))
      );
    });
  };

  const filteredPartsSlot1 = useMemo(() => filterParticipants(searchSlot1, slot1.participantId), [participants, searchSlot1, teams, activeProgram, filterByCategoryOnly, slot1.participantId]);
  const filteredPartsSlot2 = useMemo(() => filterParticipants(searchSlot2, slot2.participantId), [participants, searchSlot2, teams, activeProgram, filterByCategoryOnly, slot2.participantId]);
  const filteredPartsSlot3 = useMemo(() => filterParticipants(searchSlot3, slot3.participantId), [participants, searchSlot3, teams, activeProgram, filterByCategoryOnly, slot3.participantId]);

  if (!isOpen) return null;

  const handleGradeChange = (rank: 1 | 2 | 3, newGrade: string) => {
    const pts = calcPoints(rank, newGrade);
    if (rank === 1) setSlot1((prev) => ({ ...prev, grade: newGrade, points: pts }));
    else if (rank === 2) setSlot2((prev) => ({ ...prev, grade: newGrade, points: pts }));
    else if (rank === 3) setSlot3((prev) => ({ ...prev, grade: newGrade, points: pts }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProgram) {
      showToast('No Program Selected', 'Please select an event to record results.', 'error');
      return;
    }

    if (!slot1.participantId && !slot2.participantId && !slot3.participantId) {
      showToast('No Winners Assigned', 'Please assign at least 1st place or one winner slot.', 'warning');
      return;
    }

    const podiumSlots: Array<{
      rank: 1 | 2 | 3;
      participantId: string;
      grade?: string;
      pointsAwarded: number;
    }> = [];

    if (slot1.participantId) {
      podiumSlots.push({
        rank: 1,
        participantId: slot1.participantId,
        grade: slot1.grade,
        pointsAwarded: Number(slot1.points) || 0,
      });
    }

    if (slot2.participantId) {
      podiumSlots.push({
        rank: 2,
        participantId: slot2.participantId,
        grade: slot2.grade,
        pointsAwarded: Number(slot2.points) || 0,
      });
    }

    if (slot3.participantId) {
      podiumSlots.push({
        rank: 3,
        participantId: slot3.participantId,
        grade: slot3.grade,
        pointsAwarded: Number(slot3.points) || 0,
      });
    }

    savePodiumResults(activeProgram.id, podiumSlots, publishImmediate);
    onClose();
  };

  const getParticipantObj = (idOrRef?: string) => {
    if (!idOrRef) return null;
    return (
      participants.find((p) => p.id === idOrRef) ||
      participants.find((p) => p.chestNo && p.chestNo.toLowerCase() === idOrRef.toLowerCase()) ||
      participants.find((p) => p.admissionNo && p.admissionNo.toLowerCase() === idOrRef.toLowerCase()) ||
      participants.find((p) => p.name.toLowerCase() === idOrRef.toLowerCase()) ||
      null
    );
  };
  const getHouseObj = (teamId?: string) => teams.find((t) => t.id === teamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Podium Result Entry (1st, 2nd &amp; 3rd Place)
              </h2>
              <p className="text-xs text-slate-500">
                Select event, search student participants, assign grades &amp; publish points to live scoreboards.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Search & Select Program */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>1. Select Program / Event</span>
              </label>
              {activeProgram && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {activeProgram.category} • {activeProgram.section}
                </span>
              )}
            </div>

            {/* Searchable Program Combobox */}
            <div className="relative" ref={programDropdownRef}>
              <div
                onClick={() => setIsProgramDropdownOpen(!isProgramDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500 transition-all text-sm"
              >
                {activeProgram ? (
                  <div className="flex items-center gap-2 overflow-hidden">
                    {activeProgram.code && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-xs shrink-0">
                        {activeProgram.code}
                      </span>
                    )}
                    <span className="font-semibold text-slate-900 truncate">{activeProgram.name}</span>
                    <span className="text-xs text-slate-500 hidden sm:inline truncate">
                      ({activeProgram.category} • Stage: {activeProgram.stage || 'Main'})
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">Search and select program...</span>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              </div>

              {/* Dropdown Menu */}
              {isProgramDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 border-b border-slate-100 bg-slate-50/70 space-y-2">
                    {/* Arts / Sports Filter Tabs */}
                    <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-200/70 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setProgramTypeFilter('All'); }}
                        className={`py-1 rounded-md transition-all cursor-pointer ${
                          programTypeFilter === 'All' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Events
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setProgramTypeFilter('Arts'); }}
                        className={`py-1 rounded-md transition-all cursor-pointer ${
                          programTypeFilter === 'Arts' ? 'bg-purple-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-purple-700'
                        }`}
                      >
                        🎭 Arts
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setProgramTypeFilter('Sports'); }}
                        className={`py-1 rounded-md transition-all cursor-pointer ${
                          programTypeFilter === 'Sports' ? 'bg-sky-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-sky-700'
                        }`}
                      >
                        ⚽ Sports
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        value={programSearch}
                        onChange={(e) => setProgramSearch(e.target.value)}
                        placeholder="Search event name, code (e.g. AR-01), category..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {filteredPrograms.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No events found matching "{programSearch}"
                      </div>
                    ) : (
                      filteredPrograms.map((p) => {
                        const isSelected = p.id === activeProgram?.id;
                        const isSports = isSportsProgram(p);
                        return (
                          <div
                            key={`p-sel-${p.id}`}
                            onClick={() => {
                              setSelectedProgramId(p.id);
                              setIsProgramDropdownOpen(false);
                              setProgramSearch('');
                            }}
                            className={`flex items-center justify-between px-3.5 py-2.5 hover:bg-indigo-50/70 cursor-pointer text-xs transition-colors ${
                              isSelected ? 'bg-indigo-50/90 font-semibold text-indigo-900' : 'text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                isSports ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {isSports ? 'Sports' : 'Arts'}
                              </span>
                              {p.code && (
                                <span className="px-1.5 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 text-slate-700">
                                  {p.code}
                                </span>
                              )}
                              <span className="font-medium text-slate-900 truncate">{p.name}</span>
                              <span className="text-[11px] text-slate-500">({p.category})</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                              {p.section}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Three Podium Slots */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>2. Assign Podium Winners (1st, 2nd &amp; 3rd Place)</span>
              </h3>
              <div className="flex items-center gap-2">
                {activeProgram?.category && activeProgram.category !== 'General' && activeProgram.category !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setFilterByCategoryOnly(!filterByCategoryOnly)}
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer border ${
                      filterByCategoryOnly
                        ? 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    }`}
                    title="Click to toggle category filter"
                  >
                    {filterByCategoryOnly
                      ? `Filter: ${activeProgram.category} only (${filteredPartsSlot1.length})`
                      : `Showing all students (${participants.length})`}
                  </button>
                )}
                <span className="text-xs text-slate-500 hidden md:inline">
                  Placement points auto-calculated
                </span>
              </div>
            </div>

            {/* SLOT 1: 1ST PLACE (GOLD) */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-sm shadow-xs">
                    🥇
                  </span>
                  <div>
                    <span className="text-sm font-bold text-amber-950">1st Place (Winner / Gold)</span>
                    <span className="text-[11px] text-amber-700 block">Standard: {scoringRules.goldPoints} base points</span>
                  </div>
                </div>
                {slot1.participantId && (
                  <button
                    type="button"
                    onClick={() => setSlot1({ participantId: '', grade: 'Grade A+ (Outstanding)', points: scoringRules.goldPoints })}
                    className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Slot</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Searchable Participant Selector */}
                <div className="md:col-span-6 relative" ref={dropdownSlot1Ref}>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Select 1st Place Student {activeProgram?.category ? `(${activeProgram.category} only)` : ''}
                  </label>
                  <div
                    onClick={() => setIsDropdownSlot1(!isDropdownSlot1)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-amber-300 rounded-xl cursor-pointer hover:border-amber-500 text-xs shadow-2xs"
                  >
                    {slot1.participantId ? (
                      (() => {
                        const pt = getParticipantObj(slot1.participantId);
                        const house = getHouseObj(pt?.teamId);
                        return (
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: house?.color || '#4f46e5' }}
                            />
                            <span className="font-bold text-slate-900 truncate">{pt?.name}</span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              ({pt?.chestNo ? `#${pt.chestNo}` : pt?.admissionNo || 'Ad No'})
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold">
                              {pt?.category || 'Student'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 truncate">
                              {house?.name || 'House'}
                            </span>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-slate-400">
                        Search {activeProgram?.category || 'Student'} participant (name, chest #, house)...
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownSlot1 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150">
                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            value={searchSlot1}
                            onChange={(e) => setSearchSlot1(e.target.value)}
                            placeholder={`Search ${activeProgram?.category || ''} students by name, chest no, admission no...`}
                            className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {filteredPartsSlot1.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">
                            No {activeProgram?.category || ''} participants found
                            {filterByCategoryOnly && (
                              <button
                                type="button"
                                onClick={() => setFilterByCategoryOnly(false)}
                                className="block mx-auto mt-1 text-indigo-600 hover:underline font-semibold"
                              >
                                Show all students
                              </button>
                            )}
                          </div>
                        ) : (
                          filteredPartsSlot1.map((pt) => {
                            const house = getHouseObj(pt.teamId);
                            const isSelected = pt.id === slot1.participantId;
                            return (
                              <div
                                key={`pt-slot1-${pt.id}`}
                                onClick={() => {
                                  setSlot1((prev) => ({ ...prev, participantId: pt.id }));
                                  setIsDropdownSlot1(false);
                                  setSearchSlot1('');
                                }}
                                className={`flex items-center justify-between px-3 py-2 text-xs hover:bg-amber-50/70 cursor-pointer ${
                                  isSelected ? 'bg-amber-50 font-bold' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: house?.color || '#4f46e5' }}
                                  />
                                  <span className="font-semibold text-slate-900 truncate">{pt.name}</span>
                                  <span className="text-[11px] font-mono text-slate-500">
                                    #{pt.chestNo || pt.admissionNo}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700">
                                    {pt.category}
                                  </span>
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded text-white font-semibold"
                                    style={{ backgroundColor: house?.color || '#4f46e5' }}
                                  >
                                    {house?.name || 'House'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Grade */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Grade Awarded
                  </label>
                  <select
                    value={slot1.grade}
                    onChange={(e) => handleGradeChange(1, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Grade A+ (Outstanding)">Grade A+ (+{scoringRules.gradePointsA_Plus} pts)</option>
                    <option value="Grade A (Distinction)">Grade A (+{scoringRules.gradePointsA} pts)</option>
                    <option value="Grade B+ (Merit)">Grade B+ (+{scoringRules.gradePointsB_Plus} pts)</option>
                    <option value="Grade B (Standard)">Grade B (+{scoringRules.gradePointsB} pts)</option>
                    <option value="Grade C (Pass)">Grade C (Pass)</option>
                    <option value="No Grade / Standard">No Grade / Standard (0 pts)</option>
                  </select>
                </div>

                {/* Points */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Championship Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={slot1.points}
                    onChange={(e) => setSlot1((prev) => ({ ...prev, points: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SLOT 2: 2ND PLACE (SILVER) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-400 text-white font-black text-sm shadow-xs">
                    🥈
                  </span>
                  <div>
                    <span className="text-sm font-bold text-slate-900">2nd Place (Runner-up / Silver)</span>
                    <span className="text-[11px] text-slate-500 block">Standard: {scoringRules.silverPoints} base points</span>
                  </div>
                </div>
                {slot2.participantId && (
                  <button
                    type="button"
                    onClick={() => setSlot2({ participantId: '', grade: 'Grade A (Distinction)', points: scoringRules.silverPoints })}
                    className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Slot</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Searchable Participant Selector */}
                <div className="md:col-span-6 relative" ref={dropdownSlot2Ref}>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Select 2nd Place Student {activeProgram?.category ? `(${activeProgram.category} only)` : ''}
                  </label>
                  <div
                    onClick={() => setIsDropdownSlot2(!isDropdownSlot2)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-xl cursor-pointer hover:border-slate-500 text-xs shadow-2xs"
                  >
                    {slot2.participantId ? (
                      (() => {
                        const pt = getParticipantObj(slot2.participantId);
                        const house = getHouseObj(pt?.teamId);
                        return (
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: house?.color || '#4f46e5' }}
                            />
                            <span className="font-bold text-slate-900 truncate">{pt?.name}</span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              ({pt?.chestNo ? `#${pt.chestNo}` : pt?.admissionNo || 'Ad No'})
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold">
                              {pt?.category || 'Student'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 truncate">
                              {house?.name || 'House'}
                            </span>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-slate-400">
                        Search {activeProgram?.category || 'Student'} participant (name, chest #, house)...
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownSlot2 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150">
                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            value={searchSlot2}
                            onChange={(e) => setSearchSlot2(e.target.value)}
                            placeholder={`Search ${activeProgram?.category || ''} students by name, chest no, admission no...`}
                            className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {filteredPartsSlot2.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">
                            No {activeProgram?.category || ''} participants found
                            {filterByCategoryOnly && (
                              <button
                                type="button"
                                onClick={() => setFilterByCategoryOnly(false)}
                                className="block mx-auto mt-1 text-indigo-600 hover:underline font-semibold"
                              >
                                Show all students
                              </button>
                            )}
                          </div>
                        ) : (
                          filteredPartsSlot2.map((pt) => {
                            const house = getHouseObj(pt.teamId);
                            const isSelected = pt.id === slot2.participantId;
                            return (
                              <div
                                key={`pt-slot2-${pt.id}`}
                                onClick={() => {
                                  setSlot2((prev) => ({ ...prev, participantId: pt.id }));
                                  setIsDropdownSlot2(false);
                                  setSearchSlot2('');
                                }}
                                className={`flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer ${
                                  isSelected ? 'bg-slate-100 font-bold' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: house?.color || '#4f46e5' }}
                                  />
                                  <span className="font-semibold text-slate-900 truncate">{pt.name}</span>
                                  <span className="text-[11px] font-mono text-slate-500">
                                    #{pt.chestNo || pt.admissionNo}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700">
                                    {pt.category}
                                  </span>
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded text-white font-semibold"
                                    style={{ backgroundColor: house?.color || '#4f46e5' }}
                                  >
                                    {house?.name || 'House'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Grade */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Grade Awarded
                  </label>
                  <select
                    value={slot2.grade}
                    onChange={(e) => handleGradeChange(2, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  >
                    <option value="Grade A+ (Outstanding)">Grade A+ (+{scoringRules.gradePointsA_Plus} pts)</option>
                    <option value="Grade A (Distinction)">Grade A (+{scoringRules.gradePointsA} pts)</option>
                    <option value="Grade B+ (Merit)">Grade B+ (+{scoringRules.gradePointsB_Plus} pts)</option>
                    <option value="Grade B (Standard)">Grade B (+{scoringRules.gradePointsB} pts)</option>
                    <option value="Grade C (Pass)">Grade C (Pass)</option>
                    <option value="No Grade / Standard">No Grade / Standard (0 pts)</option>
                  </select>
                </div>

                {/* Points */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Championship Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={slot2.points}
                    onChange={(e) => setSlot2((prev) => ({ ...prev, points: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-center focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SLOT 3: 3RD PLACE (BRONZE) */}
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-orange-600 text-white font-black text-sm shadow-xs">
                    🥉
                  </span>
                  <div>
                    <span className="text-sm font-bold text-orange-950">3rd Place (Third Prize / Bronze)</span>
                    <span className="text-[11px] text-orange-700 block">Standard: {scoringRules.bronzePoints} base points</span>
                  </div>
                </div>
                {slot3.participantId && (
                  <button
                    type="button"
                    onClick={() => setSlot3({ participantId: '', grade: 'Grade B+ (Merit)', points: scoringRules.bronzePoints })}
                    className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Slot</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Searchable Participant Selector */}
                <div className="md:col-span-6 relative" ref={dropdownSlot3Ref}>
                  <label className="block text-[11px] font-bold text-orange-900 mb-1">
                    Select 3rd Place Student {activeProgram?.category ? `(${activeProgram.category} only)` : ''}
                  </label>
                  <div
                    onClick={() => setIsDropdownSlot3(!isDropdownSlot3)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-orange-300 rounded-xl cursor-pointer hover:border-orange-500 text-xs shadow-2xs"
                  >
                    {slot3.participantId ? (
                      (() => {
                        const pt = getParticipantObj(slot3.participantId);
                        const house = getHouseObj(pt?.teamId);
                        return (
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: house?.color || '#4f46e5' }}
                            />
                            <span className="font-bold text-slate-900 truncate">{pt?.name}</span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              ({pt?.chestNo ? `#${pt.chestNo}` : pt?.admissionNo || 'Ad No'})
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold">
                              {pt?.category || 'Student'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 truncate">
                              {house?.name || 'House'}
                            </span>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-slate-400">
                        Search {activeProgram?.category || 'Student'} participant (name, chest #, house)...
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownSlot3 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150">
                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            value={searchSlot3}
                            onChange={(e) => setSearchSlot3(e.target.value)}
                            placeholder={`Search ${activeProgram?.category || ''} students by name, chest no, admission no...`}
                            className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {filteredPartsSlot3.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">
                            No {activeProgram?.category || ''} participants found
                            {filterByCategoryOnly && (
                              <button
                                type="button"
                                onClick={() => setFilterByCategoryOnly(false)}
                                className="block mx-auto mt-1 text-indigo-600 hover:underline font-semibold"
                              >
                                Show all students
                              </button>
                            )}
                          </div>
                        ) : (
                          filteredPartsSlot3.map((pt) => {
                            const house = getHouseObj(pt.teamId);
                            const isSelected = pt.id === slot3.participantId;
                            return (
                              <div
                                key={`pt-slot3-${pt.id}`}
                                onClick={() => {
                                  setSlot3((prev) => ({ ...prev, participantId: pt.id }));
                                  setIsDropdownSlot3(false);
                                  setSearchSlot3('');
                                }}
                                className={`flex items-center justify-between px-3 py-2 text-xs hover:bg-orange-50/70 cursor-pointer ${
                                  isSelected ? 'bg-orange-50 font-bold' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: house?.color || '#4f46e5' }}
                                  />
                                  <span className="font-semibold text-slate-900 truncate">{pt.name}</span>
                                  <span className="text-[11px] font-mono text-slate-500">
                                    #{pt.chestNo || pt.admissionNo}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700">
                                    {pt.category}
                                  </span>
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded text-white font-semibold"
                                    style={{ backgroundColor: house?.color || '#4f46e5' }}
                                  >
                                    {house?.name || 'House'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Grade */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-orange-900 mb-1">
                    Grade Awarded
                  </label>
                  <select
                    value={slot3.grade}
                    onChange={(e) => handleGradeChange(3, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Grade A+ (Outstanding)">Grade A+ (+{scoringRules.gradePointsA_Plus} pts)</option>
                    <option value="Grade A (Distinction)">Grade A (+{scoringRules.gradePointsA} pts)</option>
                    <option value="Grade B+ (Merit)">Grade B+ (+{scoringRules.gradePointsB_Plus} pts)</option>
                    <option value="Grade B (Standard)">Grade B (+{scoringRules.gradePointsB} pts)</option>
                    <option value="Grade C (Pass)">Grade C (Pass)</option>
                    <option value="No Grade / Standard">No Grade / Standard (0 pts)</option>
                  </select>
                </div>

                {/* Points */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-orange-900 mb-1">
                    Championship Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={slot3.points}
                    onChange={(e) => setSlot3((prev) => ({ ...prev, points: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl text-xs font-mono font-bold text-center focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Publication Option */}
          <div className="flex items-center gap-2 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="podium-pub-check"
              checked={publishImmediate}
              onChange={(e) => setPublishImmediate(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="podium-pub-check" className="text-xs font-medium text-slate-700 cursor-pointer">
              Publish podium results immediately to public scoreboards, leaderboards &amp; student mark cards
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save &amp; Publish Podium Results</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
