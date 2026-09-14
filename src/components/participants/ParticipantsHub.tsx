import React, { useState, useMemo } from 'react';
import { UserGroupIcon as Users, Search01Icon as Search, FilterIcon as Filter, Award01Icon as Award, Award01Icon as Trophy, ArrowRight01Icon as ArrowRight, SparklesIcon as Sparkles, BrushIcon as Palette, Activity02Icon as Activity, CrownIcon as Crown, Award02Icon as Medal, LayoutGridIcon as LayoutGrid, ListViewIcon as ListViewIcon } from 'hugeicons-react';
import confetti from 'canvas-confetti';
import { useFestival } from '../../context/FestivalContext';
import { Participant } from '../../types/festival';
import { ActiveTab } from '../layout/Sidebar';
import { TeamLogo, ParticipantAvatar } from '../ui/TeamLogo';

interface ParticipantsHubProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectParticipant: (chestNo: string) => void;
}

export const ParticipantsHub: React.FC<ParticipantsHubProps> = ({
  setActiveTab,
  onSelectParticipant,
}) => {
  const { participants, teams, artsPrograms } = useFestival();
  const [activeView, setActiveView] = useState<'directory' | 'arts_leaderboard' | 'sports_leaderboard'>('directory');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [teamFilter, setTeamFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Count events competed per participant from artsPrograms
  const eventCounts = useMemo(() => {
    const counts = new Map<string, number>();
    artsPrograms.forEach((prog) => {
      (prog.results || []).forEach((r) => {
        if (r.participantId) {
          counts.set(r.participantId, (counts.get(r.participantId) || 0) + 1);
        }
        if (r.chestNo) {
          const key = String(r.chestNo).toLowerCase().trim();
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      });
    });
    return counts;
  }, [artsPrograms]);

  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase().trim();
    const cleanQ = q.replace(/[\s-_]/g, '');
    return participants.filter((p) => {
      const cleanAdm = String(p.admissionNo || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanName = String(p.name || '').toLowerCase();
      const cleanChest = String(p.chestNo || '').toLowerCase().replace(/[\s-_]/g, '');
      const matchesSearch =
        !q ||
        cleanName.includes(q) ||
        (cleanQ && cleanAdm.includes(cleanQ)) ||
        (cleanQ && cleanChest.includes(cleanQ));
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesTeam = teamFilter === 'All' || p.teamId === teamFilter;

      return matchesSearch && matchesCategory && matchesTeam;
    });
  }, [participants, search, categoryFilter, teamFilter]);

  // Ranked participants for Arts
  const artsRanked = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ptsA = a.artsPoints || 0;
      const ptsB = b.artsPoints || 0;
      if (ptsB !== ptsA) return ptsB - ptsA;
      const gA = a.artsGolds || a.golds || 0;
      const gB = b.artsGolds || b.golds || 0;
      if (gB !== gA) return gB - gA;
      const sA = a.artsSilvers || a.silvers || 0;
      const sB = b.artsSilvers || b.silvers || 0;
      return sB - sA;
    });
  }, [filtered]);

  // Ranked participants for Sports
  const sportsRanked = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ptsA = a.sportsPoints || 0;
      const ptsB = b.sportsPoints || 0;
      if (ptsB !== ptsA) return ptsB - ptsA;
      const gA = a.sportsGolds || a.golds || 0;
      const gB = b.sportsGolds || b.golds || 0;
      if (gB !== gA) return gB - gA;
      const sA = a.sportsSilvers || a.silvers || 0;
      const sB = b.sportsSilvers || b.silvers || 0;
      return sB - sA;
    });
  }, [filtered]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#A855F7', '#38BDF8', '#F59E0B', '#10B981'],
    });
  };

  const currentLeaderboardData = activeView === 'arts_leaderboard' ? artsRanked : sportsRanked;

  return (
    <div className="space-y-6">
      {/* Participants Banner with View Mode Selector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 border border-slate-200 relative overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                {activeView === 'directory' ? (
                  <Users className="w-3.5 h-3.5 text-indigo-700" />
                ) : activeView === 'arts_leaderboard' ? (
                  <Palette className="w-3.5 h-3.5 text-purple-700" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-sky-700" />
                )}
                {activeView === 'directory'
                  ? 'Student Directory'
                  : activeView === 'arts_leaderboard'
                  ? 'Arts Participant Standings'
                  : 'Sports Participant Standings'}
              </span>
              <span className="text-xs text-slate-500 font-medium">Official Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              {activeView === 'directory'
                ? 'Registered Participants & Chest Numbers'
                : activeView === 'arts_leaderboard'
                ? 'Individual Arts Leaderboard'
                : 'Individual Sports Leaderboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              {activeView === 'directory'
                ? 'Complete index of registered student competitors across all Arts stages, literary contests, and athletic track events.'
                : activeView === 'arts_leaderboard'
                ? 'Official individual participant rankings, medals, and points accumulated exclusively in Arts and Cultural programs.'
                : 'Official individual participant rankings, medals, and points accumulated exclusively in Athletics and Sports events.'}
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs shrink-0 flex-wrap">
            <button
              onClick={() => setActiveView('directory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'directory'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Directory</span>
            </button>

            <button
              onClick={() => {
                setActiveView('arts_leaderboard');
                triggerConfetti();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'arts_leaderboard'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>🎭 Arts Leaderboard</span>
            </button>

            <button
              onClick={() => {
                setActiveView('sports_leaderboard');
                triggerConfetti();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'sports_leaderboard'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>⚽ Sports Leaderboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name, Admission No (Ad No), or Chest No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* House Select */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="All">All Houses</option>
            {teams.map((t, idx) => (
              <option key={t.id || `ph-t-${idx}`} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Senior">Senior</option>
            <option value="Junior">Junior</option>
            <option value="Sub Junior">Sub Junior</option>
          </select>

          {activeView === 'directory' && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <ListViewIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW: PARTICIPANT LEADERBOARD (ARTS / SPORTS ONLY) */}
      {activeView !== 'directory' && (
        <div className="space-y-6">
          {/* Top 3 Participant Podium */}
          {currentLeaderboardData.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
              {/* #2 RUNNER UP */}
              {(() => {
                const secondP = currentLeaderboardData[1];
                const team = teams.find((t) => t.id === secondP.teamId);
                const pts = activeView === 'arts_leaderboard' ? secondP.artsPoints || 0 : secondP.sportsPoints || 0;
                const golds = activeView === 'arts_leaderboard' ? secondP.artsGolds || secondP.golds || 0 : secondP.sportsGolds || secondP.golds || 0;
                const silvers = activeView === 'arts_leaderboard' ? secondP.artsSilvers || secondP.silvers || 0 : secondP.sportsSilvers || secondP.silvers || 0;
                const bronzes = activeView === 'arts_leaderboard' ? secondP.artsBronzes || secondP.bronzes || 0 : secondP.sportsBronzes || secondP.bronzes || 0;

                return (
                  <div
                    onClick={() => onSelectParticipant(secondP.admissionNo || secondP.chestNo)}
                    className="order-2 md:order-1 relative rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all cursor-pointer group text-center space-y-2"
                  >
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
                        🥈 2nd Rank
                      </span>
                    </div>

                    <ParticipantAvatar
                      photo={secondP.photo}
                      name={secondP.name}
                      className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-slate-200 mt-2 group-hover:scale-105 transition-transform"
                    />

                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {secondP.chestNo}
                      </span>
                      <h3 className="text-base font-bold font-display text-slate-900 mt-1 truncate">
                        {secondP.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{team?.name} • {secondP.category}</p>
                    </div>

                    <div className="py-2">
                      <div className="text-2xl font-black font-display text-slate-900 font-mono">
                        {pts}
                        <span className="text-xs font-sans text-slate-500 font-semibold ml-1">
                          {activeView === 'arts_leaderboard' ? 'ARTS PTS' : 'SPORTS PTS'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-600 mt-1">
                        🥇 {golds} 🥈 {silvers} 🥉 {bronzes}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* #1 CHAMPION */}
              {(() => {
                const firstP = currentLeaderboardData[0];
                const team = teams.find((t) => t.id === firstP.teamId);
                const pts = activeView === 'arts_leaderboard' ? firstP.artsPoints || 0 : firstP.sportsPoints || 0;
                const golds = activeView === 'arts_leaderboard' ? firstP.artsGolds || firstP.golds || 0 : firstP.sportsGolds || firstP.golds || 0;
                const silvers = activeView === 'arts_leaderboard' ? firstP.artsSilvers || firstP.silvers || 0 : firstP.sportsSilvers || firstP.silvers || 0;
                const bronzes = activeView === 'arts_leaderboard' ? firstP.artsBronzes || firstP.bronzes || 0 : firstP.sportsBronzes || firstP.bronzes || 0;

                return (
                  <div
                    onClick={() => {
                      triggerConfetti();
                      onSelectParticipant(firstP.admissionNo || firstP.chestNo);
                    }}
                    className="order-1 md:order-2 relative rounded-3xl bg-gradient-to-b from-amber-50/90 via-white to-amber-50/40 border-2 border-amber-300 hover:border-amber-400 p-6 shadow-md transition-all cursor-pointer group text-center space-y-3 transform md:-translate-y-2"
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <Crown className="w-7 h-7 text-amber-500 drop-shadow-xs animate-bounce" />
                      <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
                        👑 {activeView === 'arts_leaderboard' ? 'ARTS CHAMPION' : 'SPORTS CHAMPION'}
                      </span>
                    </div>

                    <ParticipantAvatar
                      photo={firstP.photo}
                      name={firstP.name}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-amber-300 mt-3 group-hover:scale-110 transition-transform duration-300"
                    />

                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        {firstP.chestNo}
                      </span>
                      <h3 className="text-lg font-black font-display text-slate-900 mt-1 truncate">
                        {firstP.name}
                      </h3>
                      <p className="text-xs text-amber-900 font-medium truncate">{team?.name} • {firstP.category}</p>
                    </div>

                    <div className="py-2 px-4 rounded-2xl bg-amber-50 border border-amber-200">
                      <div className="text-3xl font-black font-display text-amber-700 font-mono">
                        {pts}
                        <span className="text-xs font-sans text-amber-900 font-semibold ml-1.5">
                          {activeView === 'arts_leaderboard' ? 'ARTS PTS' : 'SPORTS PTS'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-amber-800 font-bold mt-1">
                        🥇 {golds} Gold • 🥈 {silvers} Silver • 🥉 {bronzes} Bronze
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* #3 THIRD PLACE */}
              {(() => {
                const thirdP = currentLeaderboardData[2];
                const team = teams.find((t) => t.id === thirdP.teamId);
                const pts = activeView === 'arts_leaderboard' ? thirdP.artsPoints || 0 : thirdP.sportsPoints || 0;
                const golds = activeView === 'arts_leaderboard' ? thirdP.artsGolds || thirdP.golds || 0 : thirdP.sportsGolds || thirdP.golds || 0;
                const silvers = activeView === 'arts_leaderboard' ? thirdP.artsSilvers || thirdP.silvers || 0 : thirdP.sportsSilvers || thirdP.silvers || 0;
                const bronzes = activeView === 'arts_leaderboard' ? thirdP.artsBronzes || thirdP.bronzes || 0 : thirdP.sportsBronzes || thirdP.bronzes || 0;

                return (
                  <div
                    onClick={() => onSelectParticipant(thirdP.admissionNo || thirdP.chestNo)}
                    className="order-3 relative rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all cursor-pointer group text-center space-y-2"
                  >
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
                        🥉 3rd Rank
                      </span>
                    </div>

                    <ParticipantAvatar
                      photo={thirdP.photo}
                      name={thirdP.name}
                      className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-slate-200 mt-2 group-hover:scale-105 transition-transform"
                    />

                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                        {thirdP.chestNo}
                      </span>
                      <h3 className="text-base font-bold font-display text-slate-900 mt-1 truncate">
                        {thirdP.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{team?.name} • {thirdP.category}</p>
                    </div>

                    <div className="py-2">
                      <div className="text-2xl font-black font-display text-slate-900 font-mono">
                        {pts}
                        <span className="text-xs font-sans text-slate-500 font-semibold ml-1">
                          {activeView === 'arts_leaderboard' ? 'ARTS PTS' : 'SPORTS PTS'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-600 mt-1">
                        🥇 {golds} 🥈 {silvers} 🥉 {bronzes}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Full Participant Standings Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className={`w-4 h-4 ${activeView === 'arts_leaderboard' ? 'text-purple-600' : 'text-sky-600'}`} />
                <h3 className="text-sm font-bold text-slate-900">
                  {activeView === 'arts_leaderboard' ? 'Arts Participant Standings' : 'Sports Participant Standings'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {currentLeaderboardData.length} Competitors Listed
              </span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="py-3 px-4 text-center">Rank</th>
                  <th className="py-3 px-4 font-mono">Chest No</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">House / Team</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Medals</th>
                  <th className="py-3 px-4 text-right">
                    {activeView === 'arts_leaderboard' ? 'Arts Points' : 'Sports Points'}
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentLeaderboardData.map((p, idx) => {
                  const team = teams.find((t) => t.id === p.teamId);
                  const rankNum = idx + 1;
                  const pts = activeView === 'arts_leaderboard' ? p.artsPoints || 0 : p.sportsPoints || 0;
                  const golds = activeView === 'arts_leaderboard' ? p.artsGolds || p.golds || 0 : p.sportsGolds || p.golds || 0;
                  const silvers = activeView === 'arts_leaderboard' ? p.artsSilvers || p.silvers || 0 : p.sportsSilvers || p.silvers || 0;
                  const bronzes = activeView === 'arts_leaderboard' ? p.artsBronzes || p.bronzes || 0 : p.sportsBronzes || p.bronzes || 0;

                  return (
                    <tr
                      key={p.id || `p-lb-${p.chestNo || idx}-${idx}`}
                      onClick={() => onSelectParticipant(p.admissionNo || p.chestNo)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-center font-bold font-display text-sm">
                        {rankNum === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                            🥇
                          </span>
                        ) : rankNum === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs font-black">
                            🥈
                          </span>
                        ) : rankNum === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 text-xs font-black">
                            🥉
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 text-xs">#{rankNum}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {p.chestNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <ParticipantAvatar
                            photo={p.photo}
                            name={p.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{p.admissionNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{team?.logo}</span>
                          <span className="font-medium">{team?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{p.category}</td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="text-amber-600 font-semibold">🥇 {golds}</span>{' '}
                        <span className="text-slate-600 font-semibold">🥈 {silvers}</span>{' '}
                        <span className="text-orange-600 font-semibold">🥉 {bronzes}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-sm">
                        <span className={activeView === 'arts_leaderboard' ? 'text-purple-600' : 'text-sky-600'}>
                          {pts}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans ml-1">PTS</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Slip</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: DIRECTORY (GRID / TABLE) */}
      {activeView === 'directory' && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p, idx) => {
                const team = teams.find((t) => t.id === p.teamId);
                const eventsCount =
                  eventCounts.get(p.id) ||
                  (p.chestNo ? eventCounts.get(String(p.chestNo).toLowerCase().trim()) : undefined) ||
                  p.participatedPrograms?.length ||
                  0;

                return (
                  <div
                    key={p.id || `p-grid-${p.chestNo || idx}-${idx}`}
                    onClick={() => onSelectParticipant(p.admissionNo || p.chestNo)}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <ParticipantAvatar
                            photo={p.photo}
                            name={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {p.chestNo}
                            </span>
                            <h3 className="text-base font-bold font-display text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors truncate">
                              {p.name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">
                              Adm No: <span className="font-mono text-slate-700 font-semibold">{p.admissionNo}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold font-mono text-indigo-700 block">
                            {p.artsPoints + p.sportsPoints}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono font-semibold">TOTAL PTS</span>
                        </div>
                      </div>

                      {/* House & Category */}
                      <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                        <div className="flex items-center gap-1.5 truncate">
                          <TeamLogo logo={team?.logo} name={team?.name} color={team?.color} size="xs" fallbackEmoji="🛡️" />
                          <span className="truncate font-semibold">{team?.name || p.teamId}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px] shrink-0">
                          {p.category} • Class {p.yearClass || p.classGrade || 'N/A'}
                        </span>
                      </div>

                      {/* Points Breakdown */}
                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-1.5 rounded-lg bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                          <span className="text-[11px] text-purple-800 font-medium">Arts Pts</span>
                          <span className="font-mono font-bold text-purple-700">{p.artsPoints || 0}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-sky-50/60 border border-sky-100 flex items-center justify-between">
                          <span className="text-[11px] text-sky-800 font-medium">Sports Pts</span>
                          <span className="font-mono font-bold text-sky-700">{p.sportsPoints || 0}</span>
                        </div>
                      </div>

                      {/* Results Count & Medals */}
                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                        <span>{eventsCount} Events Recorded</span>
                        <span className="font-mono text-amber-600 font-semibold">
                          🥇 {p.golds} 🥈 {p.silvers} 🥉 {p.bronzes}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-700 font-semibold group-hover:text-indigo-800">
                      <span>View Result Slip</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-3 px-4 font-mono">Chest No</th>
                    <th className="py-3 px-4">Participant</th>
                    <th className="py-3 px-4">House / Team</th>
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Arts Pts</th>
                    <th className="py-3 px-4 text-center">Sports Pts</th>
                    <th className="py-3 px-4 text-center">Medals</th>
                    <th className="py-3 px-4 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p, idx) => {
                    const team = teams.find((t) => t.id === p.teamId);

                    return (
                      <tr
                        key={p.id || `p-tbl-${p.chestNo || idx}-${idx}`}
                        onClick={() => onSelectParticipant(p.admissionNo || p.chestNo)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {p.chestNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <ParticipantAvatar
                              photo={p.photo}
                              name={p.name}
                              className="w-6 h-6 rounded-md object-cover border border-slate-200"
                            />
                            <span className="font-bold text-slate-900">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <TeamLogo logo={team?.logo} name={team?.name} color={team?.color} size="xs" />
                            <span>{team?.name || p.teamId}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{p.admissionNo}</td>
                        <td className="py-3 px-4 text-slate-700">{p.category}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-purple-700">
                          {p.artsPoints || 0}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-sky-700">
                          {p.sportsPoints || 0}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          🥇 {p.golds} 🥈 {p.silvers} 🥉 {p.bronzes}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700">
                          {p.artsPoints + p.sportsPoints} PTS
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
          <Users className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No Competitors Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the filter criteria or search keyword.</p>
        </div>
      )}
    </div>
  );
};
