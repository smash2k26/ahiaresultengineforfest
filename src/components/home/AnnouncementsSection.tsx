import React from 'react';
import { Megaphone01Icon as Megaphone, Alert01Icon as AlertCircle, Clock01Icon as Clock, ArrowRight01Icon as ChevronRight } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge } from '../ui/GlassCard';
import { ActiveTab } from '../layout/Sidebar';

interface AnnouncementsSectionProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ setActiveTab }) => {
  const { announcements } = useFestival();

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-500" />
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 tracking-wide">
            OFFICIAL FESTIVAL CIRCULARS & NOTICES
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.slice(0, 4).map((ann, idx) => {
          const badgeVariants = {
            Arts: 'arts',
            Sports: 'sports',
            Breaking: 'live',
            General: 'neutral',
            Schedule: 'warning',
          } as const;

          return (
            <div
              key={ann.id || `ann-home-${idx}`}
              className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-200 shadow-xs ${
                ann.isUrgent
                  ? 'border-rose-300 bg-rose-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <GlassBadge
                  variant={badgeVariants[ann.category] || 'neutral'}
                  size="xs"
                  pulse={ann.isUrgent}
                >
                  {ann.category}
                </GlassBadge>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  {ann.timestamp}
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {ann.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {ann.content}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>By: {ann.author}</span>
                {ann.isUrgent && (
                  <span className="text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Urgent Notice
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
