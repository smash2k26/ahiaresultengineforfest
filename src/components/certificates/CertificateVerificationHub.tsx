import React, { useState } from 'react';
import { Award01Icon as Award, Search01Icon as Search, Shield02Icon as ShieldCheck, QrCodeIcon as QrCode, Tick01Icon as CheckCircle2, Alert01Icon as AlertCircle, PrinterIcon as Printer, Download01Icon as Download, SparklesIcon as Sparkles } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { Participant, Certificate } from '../../types/festival';

interface CertificateVerificationHubProps {
  onOpenCertificateModal: (participant: Participant) => void;
}

export const CertificateVerificationHub: React.FC<CertificateVerificationHubProps> = ({
  onOpenCertificateModal,
}) => {
  const { participants, teams, certificates } = useFestival();
  const [certInput, setCertInput] = useState('');
  const [searchedParticipant, setSearchedParticipant] = useState<Participant | null>(null);
  const [searchedCert, setSearchedCert] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const val = String(certInput || '').trim().toUpperCase();

    // Check in registered certificates
    const matchedCert = (certificates || []).find((c) => {
      const cId = String(c.id || '').toUpperCase();
      const cCode = String(c.verificationCode || '').toUpperCase();
      const cChest = String(c.chestNo || '').toUpperCase();
      return (
        cId === val ||
        cCode === val ||
        cChest === val ||
        (cId && val.includes(cId)) ||
        (cCode && val.includes(cCode))
      );
    });

    // Match either chestNo, admissionNo, or exact certificate string in participants
    const found = participants.find((p) => {
      const pChest = String(p.chestNo || '').toUpperCase();
      const pAdm = String(p.admissionNo || '').toUpperCase();
      return (
        pChest === val ||
        pAdm === val ||
        (pChest && val.includes(pChest)) ||
        (pAdm && val.includes(pAdm)) ||
        (matchedCert && (p.id === matchedCert.participantId || (p.chestNo && p.chestNo === matchedCert.chestNo)))
      );
    });

    setSearchedCert(matchedCert || null);
    setSearchedParticipant(found || null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#111318] to-[#0A0C10] border border-amber-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <GlassBadge variant="gold" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              AUTHENTICITY PORTAL
            </GlassBadge>
            <span className="text-xs text-amber-300 font-mono">Digital Signature Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            Official Certificate Verification
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Verify the authenticity of digital Merit, Excellence, or Participation certificates issued by AHIA FEST 2026.
          </p>
        </div>
      </div>

      {/* Verification Search Box */}
      <div className="p-6 rounded-3xl bg-[#111318]/90 border border-white/10 backdrop-blur-2xl shadow-xl space-y-4 max-w-2xl mx-auto">
        <form onSubmit={handleVerify} className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
            Enter Certificate ID, Verification Code, or Chest Number
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. AHIA-2026-A101-0101, VREF-A101-0101, or A101"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <GlassButton variant="gold" size="md" type="submit">
              Verify Certificate
            </GlassButton>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-gray-400">Sample IDs to try:</span>
          {['A101', 'A102', 'A103', 'A104'].map((s, idx) => (
            <button
              key={`sample-cert-${s}-${idx}`}
              type="button"
              onClick={() => {
                setCertInput(s);
              }}
              className="px-2 py-0.5 rounded bg-white/5 text-amber-300 font-mono text-xs hover:bg-white/10 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Card */}
      {hasSearched && searchedParticipant && (
        <div className="p-6 sm:p-8 rounded-3xl bg-emerald-950/20 border-2 border-emerald-500/40 backdrop-blur-2xl shadow-2xl max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Authentic Certificate Verified
              </h3>
              <p className="text-xs text-emerald-300">
                Issued officially by the Examination &amp; Scoring Committee of AHIA FEST 2026.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Recipient Name:</span>
              <span className="font-bold text-white text-sm">{searchedParticipant.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Chest Number:</span>
              <span className="font-mono font-bold text-amber-400">{searchedParticipant.chestNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Admission Number:</span>
              <span className="font-mono text-gray-300">{searchedParticipant.admissionNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Category &amp; Class:</span>
              <span className="text-gray-300">{searchedParticipant.category} • {searchedParticipant.gradeClass || searchedParticipant.yearClass || 'Class 12'}</span>
            </div>

            {searchedCert && (
              <>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-gray-400">Program / Event:</span>
                  <span className="font-bold text-amber-300">
                    {searchedCert.eventName} {searchedCert.programCode ? `(${searchedCert.programCode})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Placement &amp; Grade:</span>
                  <span className="font-bold text-emerald-400">
                    {searchedCert.rank} Place • Grade {searchedCert.grade || 'A'} ({searchedCert.marks || 90} Marks)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Points Awarded:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {searchedCert.pointsAwarded || 10} Points
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-gray-400">Total Medals:</span>
              <span className="font-mono font-bold text-amber-400">
                🥇 {searchedParticipant.golds} Gold • 🥈 {searchedParticipant.silvers} Silver • 🥉 {searchedParticipant.bronzes} Bronze
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <GlassButton
              variant="gold"
              size="md"
              onClick={() => onOpenCertificateModal(searchedParticipant)}
              icon={<Award className="w-4 h-4" />}
            >
              View &amp; Print Full Certificate
            </GlassButton>
          </div>
        </div>
      )}

      {hasSearched && !searchedParticipant && (
        <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 backdrop-blur-xl max-w-2xl mx-auto text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Certificate Record Not Found</h3>
          <p className="text-xs text-gray-400">
            No certificate matching &ldquo;{certInput}&rdquo; was found in the central festival database. Please double check the ID.
          </p>
        </div>
      )}
    </div>
  );
};

