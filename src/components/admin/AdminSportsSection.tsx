import React, { useState } from 'react';
import { Activity02Icon as Activity, Add01Icon as Plus, Delete01Icon as Trash2, Edit02Icon as Edit2, Search01Icon as Search, Tick01Icon as CheckCircle2, Clock01Icon as Clock, Award01Icon as Trophy, Cancel01Icon as X, PlayIcon as Play, ReloadIcon as RotateCcw, Upload01Icon as Upload } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { SportsMatch, SportType, CategoryType, EventStatus } from '../../types/festival';
import { AdminBulkDataModal } from './AdminBulkDataModal';

export const AdminSportsSection: React.FC = () => {
  const {
    sportsMatches,
    teams,
    addSportsMatch,
    editSportsMatch,
    deleteSportsMatch,
    updateSportsScore,
    showToast,
  } = useFestival();

  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isBulkCsvOpen, setIsBulkCsvOpen] = useState(false);

  // New Match Modal
  const [isNewMatchOpen, setIsNewMatchOpen] = useState(false);
  const [newSport, setNewSport] = useState<SportType>('Football');
  const [newCategory, setNewCategory] = useState<CategoryType>('Senior');
  const [newTeamA, setNewTeamA] = useState(teams[0]?.id || '');
  const [newTeamB, setNewTeamB] = useState(teams[1]?.id || '');
  const [newVenue, setNewVenue] = useState('Main Stadium / Ground A');
  const [newDate, setNewDate] = useState('Day 1');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newRound, setNewRound] = useState('Quarter Final');

  // Live Score Modal
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<SportsMatch | null>(null);
  const [scoreTeamA, setScoreTeamA] = useState<number | string>(0);
  const [scoreTeamB, setScoreTeamB] = useState<number | string>(0);
  const [detailScore, setDetailScore] = useState('');
  const [winnerTeamId, setWinnerTeamId] = useState('');
  const [matchStatus, setMatchStatus] = useState<EventStatus>('LIVE');

  // Edit Match Modal
  const [editingMatch, setEditingMatch] = useState<SportsMatch | null>(null);
  const [editSport, setEditSport] = useState<SportType>('Football');
  const [editCategory, setEditCategory] = useState<CategoryType>('Senior');
  const [editTeamA, setEditTeamA] = useState('');
  const [editTeamB, setEditTeamB] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editScheduledTime, setEditScheduledTime] = useState('');
  const [editRound, setEditRound] = useState('');

  const handleOpenEditMatch = (match: SportsMatch) => {
    setEditingMatch(match);
    setEditSport(match.sport);
    setEditCategory(match.category || 'Senior');
    setEditTeamA(match.teamAId);
    setEditTeamB(match.teamBId);
    setEditVenue(match.venue);
    setEditScheduledTime(match.scheduledTime || `${match.date || 'Day 1'} • ${match.time || '10:00 AM'}`);
    setEditRound(match.round);
  };

  const handleSaveEditMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;
    editSportsMatch(editingMatch.id, {
      sport: editSport,
      category: editCategory,
      teamAId: editTeamA,
      teamBId: editTeamB,
      venue: editVenue,
      scheduledTime: editScheduledTime,
      round: editRound,
    });
    setEditingMatch(null);
  };

  const filteredMatches = (sportsMatches || []).filter((m) => {
    const q = (search || '').toLowerCase();
    const teamA = teams.find((t) => t.id === m.teamAId);
    const teamB = teams.find((t) => t.id === m.teamBId);
    const matchesQuery =
      !q ||
      (m.sport || '').toLowerCase().includes(q) ||
      (m.round || '').toLowerCase().includes(q) ||
      (m.venue || '').toLowerCase().includes(q) ||
      (teamA?.name || '').toLowerCase().includes(q) ||
      (teamB?.name || '').toLowerCase().includes(q);

    const matchesSport = sportFilter === 'All' || m.sport === sportFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

    return matchesQuery && matchesSport && matchesStatus;
  });

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamA || !newTeamB || newTeamA === newTeamB) {
      showToast('Error', 'Please select two different teams.', 'error');
      return;
    }

    addSportsMatch({
      sport: newSport,
      category: newCategory,
      teamAId: newTeamA,
      teamBId: newTeamB,
      venue: newVenue,
      scheduledTime: `${newDate} • ${newTime}`,
      round: newRound,
      status: 'UPCOMING',
      scoreA: 0,
      scoreB: 0,
    });

    showToast('Match Scheduled', `${newSport} fixture created.`, 'success');
    setIsNewMatchOpen(false);
  };

  const handleOpenScoreModal = (match: SportsMatch) => {
    setActiveMatch(match);
    setScoreTeamA(match.scoreA);
    setScoreTeamB(match.scoreB);
    setDetailScore(match.detailScore || '');
    setWinnerTeamId(match.winnerTeamId || '');
    setMatchStatus(match.status);
    setIsScoreModalOpen(true);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;

    updateSportsScore(
      activeMatch.id,
      scoreTeamA,
      scoreTeamB,
      detailScore,
      winnerTeamId || undefined,
      matchStatus
    );

    showToast('Score Updated', 'Live match score and winner saved.', 'success');
    setIsScoreModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Sports Fixtures & Live Match Scoreboard
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage athletic events, football, cricket, and update live scores in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBulkCsvOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 cursor-pointer"
            title="Import or Export Sports Fixtures via CSV"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Bulk CSV Fixtures</span>
          </button>

          <button
            onClick={() => setIsNewMatchOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Fixture</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sports match by sport, house, venue, or round..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Sports</option>
            <option value="Football">Football</option>
            <option value="Cricket">Cricket</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Basketball">Basketball</option>
            <option value="Badminton">Badminton</option>
            <option value="Table Tennis">Table Tennis</option>
            <option value="Tug of War">Tug of War</option>
            <option value="Athletics">Athletics</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="LIVE">Live Now</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.map((m, idx) => {
          const teamA = teams.find((t) => t.id === m.teamAId);
          const teamB = teams.find((t) => t.id === m.teamBId);
          const winnerTeam = teams.find((t) => t.id === m.winnerTeamId);

          return (
            <div
              key={m.id ? `sp-m-${m.id}-${idx}` : `sp-m-${idx}`}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {m.sport}
                  </span>
                  <span className="text-xs text-slate-500">{m.category} • {m.round}</span>
                </div>

                <span
                  className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    m.status === 'LIVE'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                      : m.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              {/* Match Versus Board */}
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex-1 text-center">
                  <span className="text-2xl block">{teamA?.logo || '🛡️'}</span>
                  <span className="text-sm font-bold text-slate-900 truncate block mt-1">
                    {teamA?.name || 'Team A'}
                  </span>
                  <span className="text-2xl font-black font-mono text-indigo-600 block mt-1">
                    {m.scoreA}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-400 font-mono">VS</div>

                <div className="flex-1 text-center">
                  <span className="text-2xl block">{teamB?.logo || '🛡️'}</span>
                  <span className="text-sm font-bold text-slate-900 truncate block mt-1">
                    {teamB?.name || 'Team B'}
                  </span>
                  <span className="text-2xl font-black font-mono text-indigo-600 block mt-1">
                    {m.scoreB}
                  </span>
                </div>
              </div>

              {m.detailScore && (
                <div className="p-2 rounded-lg bg-slate-50 text-center text-xs font-mono text-slate-600">
                  {m.detailScore}
                </div>
              )}

              {winnerTeam && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Winner: {winnerTeam.name} (+15 Sports PTS)
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>{m.scheduledTime} • {m.venue}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenScoreModal(m)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Update Score / Winner
                  </button>
                  <button
                    onClick={() => handleOpenEditMatch(m)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                    title="Edit Match Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSportsMatch(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                    title="Delete Match"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No Sports Matches Found</h3>
          <p className="text-xs text-slate-500 mt-1">Click &quot;Add New Fixture&quot; to schedule an athletic or game event.</p>
        </div>
      )}

      {/* Create Match Modal */}
      {isNewMatchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Schedule New Sports Fixture</h3>
              <button
                onClick={() => setIsNewMatchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sport</label>
                  <select
                    value={newSport}
                    onChange={(e) => setNewSport(e.target.value as SportType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Table Tennis">Table Tennis</option>
                    <option value="Tug of War">Tug of War</option>
                    <option value="Athletics">Athletics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Senior">Senior</option>
                    <option value="Junior">Junior</option>
                    <option value="Sub Junior">Sub Junior</option>
                    <option value="All">All Categories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Team A (House)</label>
                  <select
                    value={newTeamA}
                    onChange={(e) => setNewTeamA(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {teams.map((t, idx) => (
                      <option key={`sp-ta-${t.id}-${idx}`} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Team B (House)</label>
                  <select
                    value={newTeamB}
                    onChange={(e) => setNewTeamB(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {teams.map((t, idx) => (
                      <option key={`sp-tb-${t.id}-${idx}`} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Round</label>
                  <input
                    type="text"
                    value={newRound}
                    onChange={(e) => setNewRound(e.target.value)}
                    placeholder="Quarter Final"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Day</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="Day 1"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Venue / Court</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="Main Ground / Football Turf"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMatchOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Schedule Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Score Modal */}
      {isScoreModalOpen && activeMatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Update Score: {activeMatch.sport} ({activeMatch.round})
              </h3>
              <button
                onClick={() => setIsScoreModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {teams.find((t) => t.id === activeMatch.teamAId)?.name || 'Team A'}
                  </label>
                  <input
                    type="number"
                    value={scoreTeamA}
                    onChange={(e) => setScoreTeamA(e.target.value)}
                    className="w-full text-center text-2xl font-mono font-black py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {teams.find((t) => t.id === activeMatch.teamBId)?.name || 'Team B'}
                  </label>
                  <input
                    type="number"
                    value={scoreTeamB}
                    onChange={(e) => setScoreTeamB(e.target.value)}
                    className="w-full text-center text-2xl font-mono font-black py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Detail Score (Sets / Overs / Penalty Shootout)
                </label>
                <input
                  type="text"
                  value={detailScore}
                  onChange={(e) => setDetailScore(e.target.value)}
                  placeholder="e.g. 21-18, 19-21, 21-15 or (4-3 on penalties)"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Declare Match Winner
                </label>
                <select
                  value={winnerTeamId}
                  onChange={(e) => setWinnerTeamId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="">No Winner Yet (In Progress / Draw)</option>
                  <option value={activeMatch.teamAId}>
                    {teams.find((t) => t.id === activeMatch.teamAId)?.name} (Team A)
                  </option>
                  <option value={activeMatch.teamBId}>
                    {teams.find((t) => t.id === activeMatch.teamBId)?.name} (Team B)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Match Status
                </label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value as EventStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="LIVE">LIVE NOW</option>
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="RESULT PENDING">RESULT PENDING</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScoreModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save Score &amp; Winner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Match Modal */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Sports Fixture Details</h3>
              <button
                onClick={() => setEditingMatch(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sport</label>
                  <select
                    value={editSport}
                    onChange={(e) => setEditSport(e.target.value as SportType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Table Tennis">Table Tennis</option>
                    <option value="Tug of War">Tug of War</option>
                    <option value="Athletics">Athletics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Senior">Senior</option>
                    <option value="Junior">Junior</option>
                    <option value="Sub-Junior">Sub-Junior</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Team A</label>
                  <select
                    value={editTeamA}
                    onChange={(e) => setEditTeamA(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Team B</label>
                  <select
                    value={editTeamB}
                    onChange={(e) => setEditTeamB(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Round / Stage</label>
                  <input
                    type="text"
                    value={editRound}
                    onChange={(e) => setEditRound(e.target.value)}
                    placeholder="e.g. Semi Final / League Match"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={editScheduledTime}
                    onChange={(e) => setEditScheduledTime(e.target.value)}
                    placeholder="e.g. Day 1 • 10:30 AM"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Venue / Pitch</label>
                <input
                  type="text"
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  placeholder="e.g. Main Turf Court 1"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import/Export Modal */}
      <AdminBulkDataModal
        isOpen={isBulkCsvOpen}
        onClose={() => setIsBulkCsvOpen(false)}
        initialTab="sports"
      />
    </div>
  );
};
