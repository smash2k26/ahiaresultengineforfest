import React, { useState, useMemo } from 'react';
import {
  Alert02Icon as AlertTriangle,
  Add01Icon as Plus,
  Delete01Icon as Trash2,
  Edit02Icon as Edit2,
  Cancel01Icon as X,
  Search01Icon as Search,
  Tick01Icon as CheckCircle2,
  InformationCircleIcon as Info,
  Award01Icon as Trophy,
  Upload01Icon as Upload
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { TeamMinus } from '../../types/festival';
import { TeamLogo } from '../ui/TeamLogo';

export const AdminTeamMinusesSection: React.FC = () => {
  const {
    teams,
    teamMinuses,
    addTeamMinus,
    editTeamMinus,
    deleteTeamMinus,
    scoringRules,
    pushToGoogleSheets,
    showToast,
  } = useFestival();

  const [activeTab, setActiveTab] = useState<'arts' | 'sports'>('arts');
  const [isNewMinusModalOpen, setIsNewMinusModalOpen] = useState(false);
  const [editingMinus, setEditingMinus] = useState<TeamMinus | null>(null);

  // Filter and search
  const [houseFilter, setHouseFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');
  const [pointsDeducted, setPointsDeducted] = useState<number>(scoringRules.defaultMinusPoints || 5);
  const [reason, setReason] = useState('');
  const [scope, setScope] = useState<'arts' | 'sports'>('arts');
  const [category, setCategory] = useState<'Discipline' | 'Late Arrival' | 'Code of Conduct' | 'Attendance' | 'Unsportsmanlike' | 'Other'>('Discipline');
  const [registeredBy, setRegisteredBy] = useState('Festival Admin');
  const [notes, setNotes] = useState('');

  const defaultMinusValue = scoringRules.defaultMinusPoints ?? 5;

  const handleOpenAddModal = () => {
    setSelectedTeamId(teams[0]?.id || '');
    setPointsDeducted(defaultMinusValue);
    setReason('');
    setScope(activeTab);
    setCategory('Discipline');
    setRegisteredBy('Festival Admin');
    setNotes('');
    setIsNewMinusModalOpen(true);
  };

  const handleOpenEditModal = (minus: TeamMinus) => {
    setEditingMinus(minus);
    setSelectedTeamId(minus.teamId);
    setPointsDeducted(minus.pointsDeducted);
    setReason(minus.reason);
    setScope(minus.scope || 'arts');
    setCategory(minus.category || 'Discipline');
    setRegisteredBy(minus.registeredBy || 'Festival Admin');
    setNotes(minus.notes || '');
  };

  const handleSaveNewMinus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Validation Error', 'Please enter a valid reason for the minus deduction.', 'error');
      return;
    }
    const targetTeam = teams.find((t) => t.id === selectedTeamId);
    if (!targetTeam) {
      showToast('Error', 'Please select a valid house/team.', 'error');
      return;
    }

    addTeamMinus({
      teamId: targetTeam.id,
      teamName: targetTeam.name,
      pointsDeducted: Math.max(0, Number(pointsDeducted) || 0),
      reason: reason.trim(),
      scope,
      category,
      registeredBy: registeredBy.trim() || 'Festival Admin',
      notes: notes.trim(),
    });

    setIsNewMinusModalOpen(false);
  };

  const handleSaveEditedMinus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMinus) return;
    if (!reason.trim()) {
      showToast('Validation Error', 'Please enter a valid reason for the minus deduction.', 'error');
      return;
    }
    const targetTeam = teams.find((t) => t.id === selectedTeamId);

    editTeamMinus(editingMinus.id, {
      teamId: targetTeam ? targetTeam.id : editingMinus.teamId,
      teamName: targetTeam ? targetTeam.name : editingMinus.teamName,
      pointsDeducted: Math.max(0, Number(pointsDeducted) || 0),
      reason: reason.trim(),
      scope,
      category,
      registeredBy: registeredBy.trim() || 'Festival Admin',
      notes: notes.trim(),
    });

    setEditingMinus(null);
  };

  // Filtered Minuses List
  const filteredMinuses = useMemo(() => {
    return teamMinuses.filter((m) => {
      const matchScope = (m.scope || 'arts') === activeTab;
      const matchHouse = houseFilter === 'All' || m.teamId === houseFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.teamName.toLowerCase().includes(q) ||
        m.reason.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.registeredBy && m.registeredBy.toLowerCase().includes(q));
      return matchScope && matchHouse && matchSearch;
    });
  }, [teamMinuses, activeTab, houseFilter, searchQuery]);

  // Total Minus points per house for active tab
  const houseMinusTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    teams.forEach((t) => {
      totals[t.id] = 0;
    });
    teamMinuses.forEach((m) => {
      if ((m.scope || 'arts') === activeTab) {
        totals[m.teamId] = (totals[m.teamId] || 0) + (Number(m.pointsDeducted) || 0);
      }
    });
    return totals;
  }, [teams, teamMinuses, activeTab]);

  const activeTabTotalDeductions = useMemo(() => {
    return teamMinuses
      .filter((m) => (m.scope || 'arts') === activeTab)
      .reduce((sum, m) => sum + (Number(m.pointsDeducted) || 0), 0);
  }, [teamMinuses, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              House Penalty &amp; Minus Points Manager
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              Active Deductions: {activeTabTotalDeductions} pts
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-0.5">
            Register disciplinary deductions, late arrival penalties, and rule violations for houses. Penalties instantly reduce championship standings and sync to Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register House Minus</span>
          </button>
          <button
            type="button"
            onClick={() => pushToGoogleSheets()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
            title="Sync all penalties & standings to Google Sheets"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Sync to Sheets</span>
          </button>
        </div>
      </div>

      {/* Scope Tabs: Arts Penalties vs Sports Penalties */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('arts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'arts'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>🎭</span>
          <span>Arts Penalties ({teamMinuses.filter(m => (m.scope || 'arts') === 'arts').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'sports'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>⚽</span>
          <span>Sports Penalties ({teamMinuses.filter(m => m.scope === 'sports').length})</span>
        </button>
      </div>

      {/* House Minus Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {teams.map((t) => {
          const minus = houseMinusTotals[t.id] || 0;
          return (
            <div
              key={t.id}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: t.color || '#4f46e5' }}
              />
              <div className="flex items-center gap-2.5 pl-1.5">
                <TeamLogo logo={t.logo} name={t.name} color={t.color} size="md" roundedClassName="rounded-lg" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[110px]">{t.name}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">Total: {t.totalPoints || 0} pts</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-md ${
                    minus > 0
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {minus > 0 ? `-${minus} pts` : '0 minuses'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search penalties by house, violation reason, category, or registrar..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="All">All Houses ({teamMinuses.length})</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({houseMinusTotals[t.id] || 0} pts deducted)
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 whitespace-nowrap">
            Showing {filteredMinuses.length} records
          </span>
        </div>
      </div>

      {/* Penalties Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">House / Team</th>
                <th className="px-4 py-3 text-center">Deduction</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Reason / Incident Details</th>
                <th className="px-4 py-3">Registered By</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMinuses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">No Minus Penalties Registered</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery || houseFilter !== 'All'
                        ? 'No deductions matched your filter criteria.'
                        : 'All houses currently have clean discipline records with 0 penalty deductions.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMinuses.map((m) => {
                  const teamObj = teams.find((t) => t.id === m.teamId);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <TeamLogo
                            logo={teamObj?.logo}
                            name={m.teamName}
                            color={teamObj?.color}
                            size="sm"
                            roundedClassName="rounded-md"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{m.teamName}</span>
                            <span className="text-[10px] text-slate-400">ID: {m.teamId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-rose-100 text-rose-800 border border-rose-200">
                          -{m.pointsDeducted} pts
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {m.category || 'Discipline'}
                        </span>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-slate-900 text-xs">{m.reason}</p>
                        {m.notes && <p className="text-[11px] text-slate-500 mt-0.5">{m.notes}</p>}
                      </td>

                      <td className="px-4 py-3 text-slate-600">{m.registeredBy || 'Admin'}</td>

                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{m.timestamp || '-'}</td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(m)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Penalty"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Remove this ${m.pointsDeducted}-point deduction from ${m.teamName}?`)) {
                                deleteTeamMinus(m.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Penalty"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Minus Modal */}
      {isNewMinusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-900">Register House Minus Penalty</h3>
              </div>
              <button
                onClick={() => setIsNewMinusModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMinus} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select House / Team
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Current: {t.totalPoints || 0} pts)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Points Deducted (Value)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={pointsDeducted}
                    onChange={(e) => setPointsDeducted(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono font-bold text-rose-700 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Default rule: {defaultMinusValue} pts
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Penalty Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer font-bold text-slate-800"
                  >
                    <option value="arts">🎭 Arts Penalty</option>
                    <option value="sports">⚽ Sports Penalty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Violation Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Discipline">Discipline &amp; Behavior</option>
                    <option value="Late Arrival">Late Arrival to Stage/Ground</option>
                    <option value="Code of Conduct">Code of Conduct Violation</option>
                    <option value="Attendance">Attendance / Non-reporting</option>
                    <option value="Unsportsmanlike">Unsportsmanlike Conduct</option>
                    <option value="Other">Other Infraction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Minus Deduction (Incident Description)
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. 15 minutes late report for Group Song on Stage 1"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Additional Notes / Evidence (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context or remarks..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewMinusModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Confirm &amp; Deduct {pointsDeducted} Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Minus Modal */}
      {editingMinus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Edit Minus Penalty Deduction</h3>
              </div>
              <button
                onClick={() => setEditingMinus(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedMinus} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    House / Team
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Points Deducted (Value)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={pointsDeducted}
                    onChange={(e) => setPointsDeducted(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono font-bold text-rose-700 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Penalty Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer font-bold text-slate-800"
                  >
                    <option value="arts">🎭 Arts Penalty</option>
                    <option value="sports">⚽ Sports Penalty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Violation Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Discipline">Discipline &amp; Behavior</option>
                    <option value="Late Arrival">Late Arrival to Stage/Ground</option>
                    <option value="Code of Conduct">Code of Conduct Violation</option>
                    <option value="Attendance">Attendance / Non-reporting</option>
                    <option value="Unsportsmanlike">Unsportsmanlike Conduct</option>
                    <option value="Other">Other Infraction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Minus Deduction
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMinus(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
