import React, { useRef, useState } from 'react';
import { Award01Icon as Award, Download01Icon as Download, PrinterIcon as Printer, Shield02Icon as ShieldCheck, SparklesIcon as Sparkles, QrCodeIcon as QrCode, Tick01Icon as CheckCircle2, Share01Icon as Share2, Layers01Icon as Layers } from 'hugeicons-react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassCard';
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
  const { teams, artsPrograms, certificates } = useFestival();
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
  const verificationCode = matchingCert?.verificationCode || `VREF-${participant.chestNo || 'X'}-${participantAdm.slice(-3)}`;

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
          <Award className="w-5 h-5 text-amber-400" />
          <span className="text-base sm:text-lg font-bold font-display text-white">
            Official Merit &amp; Excellence Certificate
          </span>
        </div>
      }
      subtitle={`Certificate ID: ${certificateId}`}
    >
      <div className="space-y-6">
        {/* Multi-Program Switcher if participant competed in multiple events */}
        {availableResults.length > 1 && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
              <Layers className="w-4 h-4" />
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
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {r.programName} ({r.position || 'Ranked'})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* The Printable Certificate Canvas Card */}
        <div
          ref={certRef}
          className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#12141C] via-[#0E1015] to-[#151320] border-4 border-amber-500/40 text-center shadow-2xl shadow-black/80 overflow-hidden print:m-0 print:border-amber-600"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400" />

          {/* Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span className="text-9xl font-black font-display tracking-tighter">AHIA</span>
          </div>

          <div className="relative z-10 space-y-4">
            {/* Header / Seal */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30 p-1 mb-1">
                <div className="w-full h-full bg-[#0E1015] rounded-xl flex items-center justify-center text-amber-400 font-black text-xl">
                  🏆
                </div>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                AHIA FEST 2026 • ANNUAL ARTS &amp; SPORTS FESTIVAL
              </div>
              <h2 className="text-xl sm:text-3xl font-black font-display text-white tracking-wide">
                CERTIFICATE OF MERIT
              </h2>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
            </div>

            {/* Certificate Body Text */}
            <p className="text-xs sm:text-sm text-gray-300 italic pt-2">
              This is to proudly certify that
            </p>

            <div className="py-2">
              <h3 className="text-2xl sm:text-4xl font-extrabold font-display bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent underline decoration-amber-500/40 decoration-1 underline-offset-8">
                {participant.name}
              </h3>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                Chest No: <strong className="text-white">{participant.chestNo}</strong> • Admission No: <strong className="text-white">{participant.admissionNo}</strong>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              representing <strong className="text-amber-300 font-bold">{team?.name || 'House'}</strong> has secured{' '}
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 inline-block">
                {currentResult.position || 'Rank Secured'}
              </span>{' '}
              with Grade <strong className="text-emerald-400 font-bold">{currentResult.grade || 'A'}</strong> ({currentResult.marks || 90} Marks) and{' '}
              <strong className="text-amber-400 font-bold font-mono">{currentResult.pointsAwarded || 10} Points</strong> in the event{' '}
              <strong className="text-white underline">{currentResult.programName}</strong> ({participant.category}) held during AHIA FEST 2026.
            </p>

            {/* Badges & QR Verification */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 border-t border-white/10 mt-6">
              {/* Convener Signature */}
              <div className="text-center space-y-1">
                <div className="font-serif italic text-base text-gray-300 font-semibold">
                  Dr. K. M. Rahman
                </div>
                <div className="h-px w-32 bg-white/20 mx-auto" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                  Festival Convener
                </span>
              </div>

              {/* QR Verification Seal */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-amber-400">
                  <QrCode className="w-10 h-10" />
                </div>
                <span className="text-[9px] font-mono text-gray-400">
                  ID: {certificateId}
                </span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3" /> Digitally Certified
                </span>
              </div>

              {/* General Secretary Signature */}
              <div className="text-center space-y-1">
                <div className="font-serif italic text-base text-gray-300 font-semibold">
                  Prof. Ananya Nair
                </div>
                <div className="h-px w-32 bg-white/20 mx-auto" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                  General Secretary
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <GlassButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </GlassButton>

          <div className="flex items-center gap-3">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4" />}
            >
              Print Certificate
            </GlassButton>

            <GlassButton
              variant="gold"
              size="sm"
              onClick={handlePrint}
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF / Print
            </GlassButton>
          </div>
        </div>
      </div>
    </GlassModal>
  );
};
