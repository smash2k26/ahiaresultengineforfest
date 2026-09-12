import React from 'react';
import { HelpCircleIcon as HelpCircle, Award01Icon as Trophy, Award01Icon as Award, Alert01Icon as ShieldAlert, Tick01Icon as CheckCircle2, CallIcon as Phone, Mail01Icon as Mail } from 'hugeicons-react';
import { GlassModal } from '../ui/GlassModal';
import { GlassBadge, GlassButton } from '../ui/GlassCard';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          <span className="text-base sm:text-lg font-bold font-display text-white">
            Festival Rules & Scoring Engine Guide
          </span>
        </div>
      }
      subtitle="AHIA FEST 2026 • Official Scoring Matrix & Appeals Handbook"
    >
      <div className="space-y-6 text-xs text-gray-300">
        {/* Scoring Matrix */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            1. Official House Points Matrix
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Arts Points */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
              <span className="text-xs font-bold text-purple-300 block">Arts & Cultural Stage:</span>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-gray-300">
                <li><strong className="text-amber-400">1st Place (Gold):</strong> 10 Points</li>
                <li><strong className="text-slate-300">2nd Place (Silver):</strong> 7 Points</li>
                <li><strong className="text-amber-600">3rd Place (Bronze):</strong> 5 Points</li>
                <li><strong className="text-emerald-400">Grade A+:</strong> 5 Points (for participant)</li>
                <li><strong className="text-sky-400">Grade A:</strong> 3 Points</li>
                <li><strong className="text-gray-400">Grade B:</strong> 1 Point</li>
              </ul>
            </div>

            {/* Sports Points */}
            <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 space-y-2">
              <span className="text-xs font-bold text-sky-300 block">Sports & Arena Matches:</span>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-gray-300">
                <li><strong className="text-amber-400">Match Victory:</strong> 10 Points to winning House</li>
                <li><strong className="text-slate-300">Draw / Tie:</strong> 5 Points to each House</li>
                <li><strong className="text-gray-400">Individual Track 1st:</strong> 10 Points</li>
                <li><strong className="text-gray-400">Individual Track 2nd:</strong> 7 Points</li>
                <li><strong className="text-gray-400">Individual Track 3rd:</strong> 5 Points</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Digital Verification */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            2. Result & Certificate Verification
          </h4>
          <p className="leading-relaxed">
            Every participant is assigned an official <strong className="text-white">Chest Number</strong> (e.g. A101). Results published by jury panels are instantaneously cryptographically signed with unique certificate IDs and accessible on the <strong className="text-purple-300">Check Result</strong> tab.
          </p>
        </div>

        {/* Technical Appeals Desk */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Technical Appeal Desk & Coordinators
          </h4>
          <p className="text-[11px] text-gray-400">
            For disputes regarding scoring or timings, house captains may submit an appeal to the Central Technical Desk within 60 minutes of result publication.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-300 pt-1 font-mono">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-purple-400" /> +91 98470 12345
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" /> appeals@ahiafest.org
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-white/5">
          <GlassButton variant="primary" size="sm" onClick={onClose}>
            Got It
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
