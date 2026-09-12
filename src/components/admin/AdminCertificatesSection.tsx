import React, { useState } from 'react';
import { Award01Icon as Award, Search01Icon as Search, Tick01Icon as CheckCircle2, Download01Icon as Download, Add01Icon as Plus, Cancel01Icon as X, Folder01Icon as FileCheck, Shield02Icon as ShieldCheck, LinkSquare01Icon as ExternalLink, FilterIcon as Filter, Delete01Icon as Trash2, SparklesIcon as Sparkles, PrinterIcon as Printer, QrCodeIcon as QrCode } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { Certificate } from '../../types/festival';

export const AdminCertificatesSection: React.FC = () => {
  const {
    certificates,
    participants,
    teams,
    artsPrograms,
    generateCertificate,
    bulkGenerateCertificatesFromResults,
    deleteCertificate,
    showToast,
  } = useFestival();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  // Issue modal state
  const [participantId, setParticipantId] = useState(participants[0]?.id || '');
  const [programId, setProgramId] = useState(artsPrograms[0]?.id || 'custom');
  const [programCode, setProgramCode] = useState(artsPrograms[0]?.code || 'ART-101');
  const [eventName, setEventName] = useState(artsPrograms[0]?.name || 'Classical Dance Bharatanatyam');
  const [eventType, setEventType] = useState<'Arts' | 'Sports'>('Arts');
  const [rank, setRank] = useState<'1st' | '2nd' | '3rd' | 'Participation'>('1st');
  const [grade, setGrade] = useState<string>('A');
  const [marks, setMarks] = useState<number>(95);
  const [pointsAwarded, setPointsAwarded] = useState<number>(10);

  const handleProgramSelect = (progId: string) => {
    setProgramId(progId);
    if (progId === 'custom') {
      return;
    }
    const prog = artsPrograms.find((p) => p.id === progId);
    if (prog) {
      setEventName(prog.name);
      setProgramCode(prog.code || '');
      setEventType('Arts');
    }
  };

  const handleRankChange = (selectedRank: '1st' | '2nd' | '3rd' | 'Participation') => {
    setRank(selectedRank);
    if (selectedRank === '1st') {
      setPointsAwarded(10);
      setGrade('A+');
      setMarks(95);
    } else if (selectedRank === '2nd') {
      setPointsAwarded(7);
      setGrade('A');
      setMarks(88);
    } else if (selectedRank === '3rd') {
      setPointsAwarded(5);
      setGrade('B+');
      setMarks(80);
    } else {
      setPointsAwarded(1);
      setGrade('B');
      setMarks(72);
    }
  };

  const filteredCerts = (certificates || []).filter((c) => {
    const q = (search || '').toLowerCase();
    const matchesQuery =
      !q ||
      (c.participantName || '').toLowerCase().includes(q) ||
      (c.chestNo || '').toLowerCase().includes(q) ||
      (c.teamName || '').toLowerCase().includes(q) ||
      (c.eventName || '').toLowerCase().includes(q) ||
      (c.programCode ? String(c.programCode).toLowerCase().includes(q) : false) ||
      (c.id || '').toLowerCase().includes(q) ||
      (c.verificationCode || '').toLowerCase().includes(q);

    const matchesType = typeFilter === 'All' || c.certificateType === typeFilter;
    return matchesQuery && matchesType;
  });

  const handleBulkGenerate = () => {
    const count = bulkGenerateCertificatesFromResults();
    if (count > 0) {
      showToast(
        'Certificates Generated',
        `Successfully generated and registered ${count} official certificates from published program results.`,
        'success'
      );
    } else {
      showToast(
        'Up to Date',
        'All published program results already have corresponding certificates registered.',
        'info'
      );
    }
  };

  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = participants.find((x) => x.id === participantId);
    if (!p) {
      showToast('Error', 'Please select a participant.', 'error');
      return;
    }

    const team = teams.find((t) => t.id === p.teamId);
    const certType: Certificate['certificateType'] =
      rank === '1st'
        ? 'Winner'
        : rank === '2nd'
        ? 'Runner Up'
        : rank === '3rd'
        ? 'Third Place'
        : 'Participation';

    const newCert = generateCertificate({
      participantId: p.id,
      participantName: p.name,
      chestNo: p.chestNo,
      admissionNo: p.admissionNo,
      teamName: team?.name || 'Festival Contender',
      eventName,
      programId: programId !== 'custom' ? programId : undefined,
      programCode,
      eventType,
      category: p.category,
      rank,
      marks,
      grade,
      pointsAwarded,
      certificateType: certType,
    });

    showToast('Certificate Issued', `Issued with verification code ${newCert.verificationCode}`, 'success');
    setIsIssueModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Digital Certificates &amp; Verification Registry
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Issue and verify tamper-proof digital merit and participation certificates based on student programs, points, and grades.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleBulkGenerate}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>⚡ Auto-Generate From Results</span>
          </button>

          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Custom Certificate</span>
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
            placeholder="Search certificate by student name, chest number, event, program code, or certificate ID..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Certificate Types</option>
            <option value="Winner">Winner (1st Place)</option>
            <option value="Runner Up">Runner Up (2nd Place)</option>
            <option value="Third Place">Third Place (3rd Place)</option>
            <option value="Participation">Participation</option>
          </select>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Certificate ID &amp; Code</th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Program / Event</th>
                <th className="px-4 py-3 text-center">Rank &amp; Grade</th>
                <th className="px-4 py-3 text-center">Points &amp; Marks</th>
                <th className="px-4 py-3">Issued Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-slate-900 block">{cert.id}</span>
                    <span className="font-mono text-[10px] text-indigo-600 font-semibold">
                      VERIFY: {cert.verificationCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{cert.participantName}</div>
                    <div className="text-[11px] text-slate-500">
                      Chest #{cert.chestNo} • {cert.teamName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{cert.eventName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {cert.programCode && <span className="text-indigo-600 font-bold mr-1.5">{cert.programCode}</span>}
                      {cert.eventType} • {cert.category}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cert.certificateType === 'Winner'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : cert.certificateType === 'Runner Up'
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : cert.certificateType === 'Third Place'
                          ? 'bg-orange-100 text-orange-900 border border-orange-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {cert.rank} Place
                    </span>
                    {cert.grade && (
                      <div className="text-[10px] text-emerald-700 font-bold font-mono mt-0.5">
                        Grade {cert.grade}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    <div className="font-bold text-slate-900">
                      {cert.pointsAwarded !== undefined ? `${cert.pointsAwarded} PTS` : 'N/A'}
                    </div>
                    {cert.marks !== undefined && (
                      <div className="text-[10px] text-slate-500">
                        {cert.marks} Marks
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{cert.issueDate}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        View &amp; Print
                      </button>
                      <button
                        onClick={() => deleteCertificate(cert.id)}
                        title="Revoke & delete certificate"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCerts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No certificates issued yet. Click &quot;Auto-Generate From Results&quot; or &quot;Issue Custom Certificate&quot; to generate official student credentials.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Issue Verified Digital Certificate</h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Recipient Participant
                </label>
                <select
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {participants.map((p) => {
                    const t = teams.find((x) => x.id === p.teamId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} (Chest #{p.chestNo} • {t?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Select Program or Custom Event
                </label>
                <select
                  value={programId}
                  onChange={(e) => handleProgramSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="custom">-- Custom Event Entry --</option>
                  {artsPrograms.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      [{prog.code}] {prog.name} ({prog.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Event / Program Name
                  </label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Mime or 100m Sprint"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Program Code
                  </label>
                  <input
                    type="text"
                    value={programCode}
                    onChange={(e) => setProgramCode(e.target.value)}
                    placeholder="e.g. ART-101"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Arts">Arts &amp; Cultural</option>
                    <option value="Sports">Sports &amp; Athletics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Placement Rank</label>
                  <select
                    value={rank}
                    onChange={(e) => handleRankChange(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="1st">1st Place (Winner - 10 pts)</option>
                    <option value="2nd">2nd Place (Runner Up - 7 pts)</option>
                    <option value="3rd">3rd Place (Third - 5 pts)</option>
                    <option value="Participation">Participation (1 pt)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Grade</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="A+, A, B..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Marks</label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    placeholder="95"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Points Awarded</label>
                  <input
                    type="number"
                    value={pointsAwarded}
                    onChange={(e) => setPointsAwarded(Number(e.target.value))}
                    placeholder="10"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Generate &amp; Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview & Print Certificate Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border-4 border-amber-300 relative print:m-0 print:border-none">
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-1.5 border-b-2 border-amber-100 pb-4">
              <div className="inline-flex p-2.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 block">
                AHIA FEST 2026 • ANNUAL ARTS &amp; ATHLETICS FESTIVAL
              </span>
              <h3 className="text-2xl font-black font-display text-slate-900">
                CERTIFICATE OF {previewCert.certificateType.toUpperCase()}
              </h3>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-3 text-sm text-slate-700 leading-relaxed px-4">
              <p className="italic text-slate-500">This is to certify that</p>
              <h4 className="text-2xl sm:text-3xl font-black text-indigo-950 font-display underline decoration-amber-400 decoration-2 underline-offset-4">
                {previewCert.participantName}
              </h4>
              <p className="text-xs text-slate-600 font-mono">
                Chest No: <strong className="text-slate-900">{previewCert.chestNo}</strong> • Admission No: <strong className="text-slate-900">{previewCert.admissionNo}</strong> • House: <strong className="text-amber-700">{previewCert.teamName}</strong>
              </p>
              <p className="text-slate-800 pt-2 text-sm">
                has secured <strong className="text-indigo-900 font-bold">{previewCert.rank} Place</strong> with{' '}
                <strong className="text-emerald-700 font-bold">Grade {previewCert.grade || 'A'}</strong> ({previewCert.marks || 95} Marks) and{' '}
                <strong className="text-amber-700 font-bold">{previewCert.pointsAwarded || 10} Points</strong> in the event{' '}
                <strong className="text-slate-950 font-bold underline">{previewCert.eventName}</strong>{' '}
                {previewCert.programCode && <span className="font-mono text-indigo-600 font-bold">({previewCert.programCode})</span>} ({previewCert.category}) held during AHIA FEST 2026.
              </p>
            </div>

            {/* Verification Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="font-mono block font-bold text-slate-800">{previewCert.id}</span>
                <span className="text-[10px] text-slate-400">Issued on {previewCert.issueDate}</span>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-emerald-600 font-bold justify-end">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Digitally Verified</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">CODE: {previewCert.verificationCode}</span>
              </div>
            </div>

            {/* Print & Close Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 print:hidden">
              <button
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
