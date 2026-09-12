import React, { useState, useRef } from 'react';
import {
  Download01Icon as Download,
  Upload01Icon as Upload,
  Cancel01Icon as X,
  Tick01Icon as CheckCircle2,
  File01Icon as FileText,
  UserGroupIcon as Users,
  Activity02Icon as Activity,
  SparklesIcon as Sparkles,
  ReloadIcon as RotateCcw,
  Copy01Icon as Copy,
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { Participant, SportsMatch } from '../../types/festival';
import {
  exportParticipantsToCSV,
  exportSportsMatchesToCSV,
  generateParticipantsSampleCSV,
  generateSportsMatchesSampleCSV,
  parseParticipantsCSV,
  parseSportsMatchesCSV,
  downloadCSVFile,
} from '../../utils/csvHelpers';

interface AdminBulkDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'participants' | 'sports';
}

export const AdminBulkDataModal: React.FC<AdminBulkDataModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'participants',
}) => {
  const {
    participants,
    sportsMatches,
    teams,
    bulkImportParticipants,
    bulkImportSportsMatches,
    pushToGoogleSheets,
    showToast,
    festConfig,
  } = useFestival();

  const [activeTab, setActiveTab] = useState<'participants' | 'sports'>(initialTab);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedParticipants, setParsedParticipants] = useState<Participant[]>([]);
  const [parsedSports, setParsedSports] = useState<SportsMatch[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [autoPushToSheets, setAutoPushToSheets] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  // Process text based on active tab
  const processCsvText = (text: string) => {
    setCsvRawText(text);
    if (activeTab === 'participants') {
      const result = parseParticipantsCSV(text, teams);
      setParsedParticipants(result.valid);
      setParsedSports([]);
      setParseErrors(result.errors);
      setParseWarnings(result.warnings);
    } else {
      const result = parseSportsMatchesCSV(text, teams);
      setParsedSports(result.valid);
      setParsedParticipants([]);
      setParseErrors(result.errors);
      setParseWarnings(result.warnings);
    }
  };

  // Reset import state
  const handleClear = () => {
    setCsvRawText('');
    setParsedParticipants([]);
    setParsedSports([]);
    setParseErrors([]);
    setParseWarnings([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Switch tab and clear active parse
  const handleSwitchTab = (tab: 'participants' | 'sports') => {
    setActiveTab(tab);
    handleClear();
  };

  // Trigger download of live data
  const handleExportLive = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (activeTab === 'participants') {
      const csv = exportParticipantsToCSV(participants, teams);
      downloadCSVFile(csv, `${festConfig.shortName || 'Festival'}_Participants_${timestamp}.csv`);
      showToast('CSV Exported', `Exported ${participants.length} participant records.`, 'success');
    } else {
      const csv = exportSportsMatchesToCSV(sportsMatches, teams);
      downloadCSVFile(csv, `${festConfig.shortName || 'Festival'}_SportsMatches_${timestamp}.csv`);
      showToast('CSV Exported', `Exported ${sportsMatches.length} sports fixtures.`, 'success');
    }
  };

  // Trigger download of sample template
  const handleDownloadSample = () => {
    if (activeTab === 'participants') {
      const sample = generateParticipantsSampleCSV(teams);
      downloadCSVFile(sample, `Sample_Participants_Template.csv`);
      showToast('Template Downloaded', 'Sample participants template ready to fill.', 'info');
    } else {
      const sample = generateSportsMatchesSampleCSV(teams);
      downloadCSVFile(sample, `Sample_Sports_Fixtures_Template.csv`);
      showToast('Template Downloaded', 'Sample sports fixtures template ready to fill.', 'info');
    }
  };

  // Commit import to state and optionally push to Google Sheets
  const handleCommitImport = async () => {
    setIsProcessing(true);
    try {
      if (activeTab === 'participants') {
        if (parsedParticipants.length === 0) return;
        bulkImportParticipants(parsedParticipants);
        if (autoPushToSheets) {
          await pushToGoogleSheets({ participants: parsedParticipants });
        }
        showToast(
          'Import Successful',
          `Imported ${parsedParticipants.length} participants and synced to Google Sheets.`,
          'success'
        );
      } else {
        if (parsedSports.length === 0) return;
        bulkImportSportsMatches(parsedSports);
        if (autoPushToSheets) {
          await pushToGoogleSheets({ sportsMatches: parsedSports });
        }
        showToast(
          'Import Successful',
          `Imported ${parsedSports.length} sports fixtures and synced to Google Sheets.`,
          'success'
        );
      }
      handleClear();
      onClose();
    } catch (err: any) {
      showToast('Import Error', err.message || 'Failed to complete bulk import.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const parsedCount = activeTab === 'participants' ? parsedParticipants.length : parsedSports.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="bulk-csv-data-modal"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Bulk CSV Import &amp; Export Center</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Fast Updates
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Instantly import or export hundreds of records via standard CSV spreadsheets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 gap-2">
          <button
            onClick={() => handleSwitchTab('participants')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'participants'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Participants Database ({participants.length} Active)</span>
          </button>

          <button
            onClick={() => handleSwitchTab('sports')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === 'sports'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Sports Fixtures &amp; Scores ({sportsMatches.length} Matches)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Action Row: Export & Download Template */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <div>
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                {activeTab === 'participants' ? 'Export or Template Options' : 'Sports Match Data Operations'}
              </h3>
              <p className="text-xs text-indigo-900/70 mt-0.5">
                Download currently registered rows or get a clean blank template with correct headers.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template</span>
              </button>

              <button
                onClick={handleExportLive}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Current to CSV</span>
              </button>
            </div>
          </div>

          {/* Import Method Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                IMPORT NEW OR UPDATED RECORDS
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    inputMode === 'file' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Upload File (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    inputMode === 'text' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Paste CSV Text
                </button>
              </div>
            </div>

            {inputMode === 'file' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  Click to browse or drag and drop your CSV file here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports UTF-8 CSV generated from Google Sheets or Microsoft Excel
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={5}
                  value={csvRawText}
                  onChange={(e) => processCsvText(e.target.value)}
                  placeholder={
                    activeTab === 'participants'
                      ? 'Chest No,Participant Name,House,Category,Section,Class\n101,Zayan Al-Khatib,Ruby,Senior,Individual,Grade 12'
                      : 'Sport,Team A,Team B,Round,Score A,Score B,Status\nFootball,Ruby,Sapphire,Final,2,1,COMPLETED'
                  }
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white"
                />
              </div>
            )}
          </div>

          {/* Validation Messages */}
          {parseErrors.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>⚠️ CSV Formatting Issues Detected:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {parseErrors.map((err, i) => (
                  <li key={`err-${i}`}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {parseWarnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
              <div className="font-bold">Notice &amp; Auto-Adjustments:</div>
              <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
                {parseWarnings.map((warn, i) => (
                  <li key={`warn-${i}`}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedCount > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Parsed Records Preview</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                    {parsedCount} Records Ready
                  </span>
                </h4>
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                    {activeTab === 'participants' ? (
                      <tr>
                        <th className="px-3 py-2">Chest #</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">House / Team</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Class</th>
                        <th className="px-3 py-2 text-right">Points</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-3 py-2">Sport</th>
                        <th className="px-3 py-2">Title</th>
                        <th className="px-3 py-2">Team A</th>
                        <th className="px-3 py-2">Team B</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activeTab === 'participants'
                      ? parsedParticipants.slice(0, 50).map((p, idx) => {
                          const team = teams.find((t) => t.id === p.teamId);
                          return (
                            <tr key={`prev-part-${idx}`} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-mono font-bold text-indigo-700">
                                #{p.chestNo}
                              </td>
                              <td className="px-3 py-1.5 font-semibold text-slate-900">{p.name}</td>
                              <td className="px-3 py-1.5">
                                <span className="inline-flex items-center gap-1 font-medium">
                                  <span>{team?.logo || '🛡️'}</span>
                                  <span>{team?.name || p.teamId}</span>
                                </span>
                              </td>
                              <td className="px-3 py-1.5">{p.category}</td>
                              <td className="px-3 py-1.5 text-slate-500">{p.yearClass}</td>
                              <td className="px-3 py-1.5 text-right font-mono font-bold">
                                {p.totalPoints}
                              </td>
                            </tr>
                          );
                        })
                      : parsedSports.slice(0, 50).map((m, idx) => {
                          const teamA = teams.find((t) => t.id === m.teamAId);
                          const teamB = teams.find((t) => t.id === m.teamBId);
                          return (
                            <tr key={`prev-sport-${idx}`} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-bold text-indigo-700">{m.sport}</td>
                              <td className="px-3 py-1.5 font-medium text-slate-900">{m.title}</td>
                              <td className="px-3 py-1.5">{teamA?.name || m.teamAId}</td>
                              <td className="px-3 py-1.5">{teamB?.name || m.teamBId}</td>
                              <td className="px-3 py-1.5 font-mono font-bold">
                                {m.scoreA} - {m.scoreB}
                              </td>
                              <td className="px-3 py-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    m.status === 'COMPLETED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : m.status === 'LIVE'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {m.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
              {parsedCount > 50 && (
                <p className="text-[11px] text-slate-400 text-center">
                  Showing first 50 rows of {parsedCount} parsed records.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPushToSheets}
              onChange={(e) => setAutoPushToSheets(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              Push imported records directly to Google Sheets webhook
            </span>
          </label>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleCommitImport}
              disabled={parsedCount === 0 || isProcessing}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                parsedCount === 0 || isProcessing
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow active:scale-98'
              }`}
            >
              {isProcessing ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing &amp; Syncing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Import &amp; Commit {parsedCount > 0 ? `(${parsedCount} Records)` : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
