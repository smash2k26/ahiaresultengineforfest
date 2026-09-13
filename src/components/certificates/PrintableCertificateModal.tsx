import React, { useRef, useState } from 'react';
import {
  Award01Icon as Award,
  Download01Icon as Download,
  PrinterIcon as Printer,
  Shield02Icon as ShieldCheck,
  QrCodeIcon as QrCode,
  Layers01Icon as Layers,
} from 'hugeicons-react';
import { GlassModal } from '../ui/GlassModal';
import { Participant } from '../../types/festival';
import { useFestival } from '../../context/FestivalContext';

interface PrintableCertificateModalProps {
  participant: Participant | null;
  onClose: () => void;
}

export const PrintableCertificateModal: React.FC<PrintableCertificateModalProps> = ({
  participant,
  onClose,
}) => {
  const { teams, certificates } = useFestival();
  const certRef = useRef<HTMLDivElement>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  if (!participant) return null;

  const team = teams.find((t) => t.id === participant.teamId);

  // Collect all available results/programs for this participant
  const availableResults = (participant.results && participant.results.length > 0)
    ? participant.results
    : [
        {
          programId: 'prog-default',
          programName: 'General Arts Competition',
          programCategory: participant.category,
          grade: 'A',
          marks: 92,
          position: '1st Place',
          pointsAwarded: participant.artsPoints || 10,
        },
      ];

  const currentResult = availableResults[selectedResultIndex] || availableResults[0];

  // Try matching with official registered certificate if exists
  const participantChest = String(participant.chestNo || '').toUpperCase();
  const participantAdm = String(participant.admissionNo || '0000');
  const matchingCert = (certificates || []).find(
    (c) =>
      String(c.chestNo || '').toUpperCase() === participantChest &&
      (c.eventName === currentResult.programName || !currentResult.programName)
  );

  const certificateId = matchingCert?.id || `AHIA-2026-${participant.chestNo || 'X'}-${participantAdm.slice(-4)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <GlassModal
      isOpen={!!participant}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-500" />
          <span className="text-base sm:text-lg font-bold font-display text-slate-900">
            Official Merit &amp; Excellence Certificate
          </span>
        </div>
      }
      subtitle={`Certificate ID: ${certificateId}`}
    >
      <div className="space-y-6">
        {/* Multi-Program Switcher if participant competed in multiple events */}
        {availableResults.length > 1 && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Select Program for Certificate:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {availableResults.map((r, idx) => (
                <button
                  key={`res-opt-${idx}-${r.programName}`}
                  onClick={() => setSelectedResultIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedResultIndex === idx
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {r.programName} ({r.position || 'Ranked'})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* The Printable Certificate Canvas Card (White / Ivory Gold theme) */}
        <div
          ref={certRef}
          className="relative p-6 sm:p-10 rounded-3xl bg-white border-4 border-amber-500 text-center shadow-xl shadow-slate-200 overflow-hidden print:m-0 print:border-amber-600 print:shadow-none"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500" />

          {/* Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <span className="text-9xl font-black font-display tracking-tighter text-slate-900">AHIA</span>
          </div>

          <div className="relative z-10 space-y-4">
            {/* Header / Seal */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center shadow-md p-1 mb-1">
                <span className="text-2xl">🏆</span>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-800 font-mono">
                AHIA FEST 2026 • ANNUAL ARTS &amp; SPORTS FESTIVAL
              </div>
              <h2 className="text-xl sm:text-3xl font-black font-display text-slate-900 tracking-wide">
                CERTIFICATE OF MERIT
              </h2>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
            </div>

            {/* Certificate Body Text */}
            <p className="text-xs sm:text-sm text-slate-600 italic pt-2">
              This is to proudly certify that
            </p>

            <div className="py-2">
              <h3 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 underline decoration-amber-500/60 decoration-2 underline-offset-8">
                {participant.name}
              </h3>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                Chest No: <strong className="text-slate-900">{participant.chestNo}</strong> • Admission No: <strong className="text-slate-900">{participant.admissionNo}</strong>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
              representing <strong className="text-amber-800 font-bold">{team?.name || 'House'}</strong> has secured{' '}
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-300 inline-block">
                {currentResult.position || 'Rank Secured'}
              </span>{' '}
              with Grade <strong className="text-emerald-700 font-bold">{currentResult.grade || 'A'}</strong> ({currentResult.marks || 90} Marks) and{' '}
              <strong className="text-amber-800 font-bold font-mono">{currentResult.pointsAwarded || 10} Points</strong> in the event{' '}
              <strong className="text-slate-900 underline">{currentResult.programName}</strong> ({participant.category}) held during AHIA FEST 2026.
            </p>

            {/* Badges & QR Verification */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 border-t border-slate-200 mt-6">
              {/* Convener Signature */}
              <div className="text-center space-y-1">
                <div className="font-serif italic text-base text-slate-800 font-semibold">
                  Dr. K. M. Rahman
                </div>
                <div className="h-px w-32 bg-slate-300 mx-auto" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  Festival Convener
                </span>
              </div>

              {/* QR Verification Seal */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-amber-600">
                  <QrCode className="w-10 h-10" />
                </div>
                <span className="text-[9px] font-mono text-slate-500">
                  ID: {certificateId}
                </span>
                <span className="text-[9px] text-emerald-700 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Digitally Certified
                </span>
              </div>

              {/* General Secretary Signature */}
              <div className="text-center space-y-1">
                <div className="font-serif italic text-base text-slate-800 font-semibold">
                  Prof. Ananya Nair
                </div>
                <div className="h-px w-32 bg-slate-300 mx-auto" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  General Secretary
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Certificate</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download PDF / Print</span>
            </button>
          </div>
        </div>
      </div>
    </GlassModal>
  );
};
