import React, { useState } from 'react';
import {
  Award01Icon as Award,
  Shield02Icon as ShieldCheck,
  QrCodeIcon as QrCode,
  Tick01Icon as CheckCircle2,
  Alert01Icon as AlertCircle,
} from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { Participant, Certificate } from '../../types/festival';

interface CertificateVerificationHubProps {
  onOpenCertificateModal: (participant: Participant) => void;
}

export const CertificateVerificationHub: React.FC<CertificateVerificationHubProps> = ({
  onOpenCertificateModal,
}) => {
  const { participants, certificates } = useFestival();
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
      const cAdm = String(c.admissionNo || '').toUpperCase();
      return (
        cId === val ||
        cCode === val ||
        cAdm === val ||
        (cId && val.includes(cId)) ||
        (cCode && val.includes(cCode)) ||
        (cAdm && val.includes(cAdm))
      );
    });

    // Match admissionNo or exact certificate string in participants (NOT chestNo)
    const found = participants.find((p) => {
      const pAdm = String(p.admissionNo || '').toUpperCase();
      return (
        pAdm === val ||
        (pAdm && val.includes(pAdm)) ||
        (matchedCert && (p.id === matchedCert.participantId || (p.admissionNo && p.admissionNo === matchedCert.admissionNo)))
      );
    });

    setSearchedCert(matchedCert || null);
    setSearchedParticipant(found || null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden text-slate-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              AUTHENTICITY PORTAL
            </span>
            <span className="text-xs text-amber-700 font-mono font-semibold">Digital Signature Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Official Certificate Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Verify the authenticity of digital Merit, Excellence, or Participation certificates issued by AHIA FEST 2026.
          </p>
        </div>
      </div>

      {/* Verification Search Box */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4 max-w-2xl mx-auto">
        <form onSubmit={handleVerify} className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Enter Certificate ID, Verification Code, or Admission Number (Ad No)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. AHIA-2026-0101, VREF-0101, or AD-101"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Certificate</span>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Sample IDs / Ad Nos to try:</span>
          {['AD-101', 'AD-102', 'AD-103', 'AD-104'].map((s, idx) => (
            <button
              key={`sample-cert-${s}-${idx}`}
              type="button"
              onClick={() => {
                setCertInput(s);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Card */}
      {hasSearched && searchedParticipant && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Authentic Certificate Verified
              </h3>
              <p className="text-xs text-emerald-800">
                Issued officially by the Examination &amp; Scoring Committee of AHIA FEST 2026.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Recipient Name:</span>
              <span className="font-bold text-slate-900 text-sm">{searchedParticipant.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Chest Number:</span>
              <span className="font-mono font-bold text-amber-700">{searchedParticipant.chestNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Admission Number:</span>
              <span className="font-mono text-slate-700">{searchedParticipant.admissionNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Category &amp; Class:</span>
              <span className="text-slate-800 font-medium">
                {searchedParticipant.category} • {searchedParticipant.gradeClass || searchedParticipant.yearClass || 'Class 12'}
              </span>
            </div>

            {searchedCert && (
              <>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Program / Event:</span>
                  <span className="font-bold text-amber-800">
                    {searchedCert.eventName} {searchedCert.programCode ? `(${searchedCert.programCode})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Placement &amp; Grade:</span>
                  <span className="font-bold text-emerald-700">
                    {searchedCert.rank} Place • Grade {searchedCert.grade || 'A'} ({searchedCert.marks || 90} Marks)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Points Awarded:</span>
                  <span className="font-mono font-black text-amber-700 text-sm">
                    {searchedCert.pointsAwarded || 10} Points
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Total Medals:</span>
              <span className="font-mono font-bold text-slate-900">
                🥇 {searchedParticipant.golds} Gold • 🥈 {searchedParticipant.silvers} Silver • 🥉 {searchedParticipant.bronzes} Bronze
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => onOpenCertificateModal(searchedParticipant)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>View &amp; Print Full Certificate</span>
            </button>
          </div>
        </div>
      )}

      {hasSearched && !searchedParticipant && (
        <div className="p-8 rounded-3xl bg-white border border-rose-200 shadow-sm max-w-2xl mx-auto text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Certificate Record Not Found</h3>
          <p className="text-xs text-slate-600">
            No certificate matching &ldquo;{certInput}&rdquo; was found in the central festival database. Please double check the ID.
          </p>
        </div>
      )}
    </div>
  );
};
