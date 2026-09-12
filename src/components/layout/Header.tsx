import React, { useState, useRef, useEffect } from 'react';
import { Menu01Icon as Menu, Search01Icon as Search, Notification01Icon as Bell, SparklesIcon as Sparkles, Shield01Icon as Shield, Award01Icon as Trophy, RefreshIcon as RefreshCw, LinkSquare01Icon as ExternalLink, Tick01Icon as CheckCircle2, RadioIcon as Radio, File02Icon as FileSpreadsheet } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassBadge, GlassButton } from '../ui/GlassCard';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
  onOpenAdminAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onOpenAdminAuth,
}) => {
  const {
    setIsSearchOpen,
    liveUpdates,
    announcements,
    googleSheetsConfig,
    syncWithGoogleSheets,
    adminUser,
    isAdminLoggedIn,
    stats,
  } = useFestival();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithGoogleSheets();
    setIsSyncing(false);
  };

  const getPageTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'home':
        return { title: 'Live Result Command Center', subtitle: 'AHIA FEST 2026 • Live Standing & Scoring Engine' };
      case 'leaderboard':
        return { title: 'Championship Leaderboard', subtitle: 'Arts & Sports House Standings' };
      case 'arts':
        return { title: 'Arts & Cultural Dashboard', subtitle: 'Stage Events, Solo & Group Competitions' };
      case 'sports':
        return { title: 'Sports & Athletics Arena', subtitle: 'Live Scoreboards, Matches & Standings' };
      case 'schedule':
        return { title: 'Festival Schedule & Timeline', subtitle: 'Day-wise Stages, Venues & Time Slots' };
      case 'results':
        return { title: 'Check Individual Results', subtitle: 'Instant Search by Admission No, Chest No & Name' };
      case 'teams':
        return { title: 'Houses & Teams Profiles', subtitle: 'House Captains, Rosters & Points Analytics' };
      case 'participants':
        return { title: 'Participant Registry', subtitle: 'Directory of all Registered Student Competitors' };
      case 'gallery':
        return { title: 'Festival Moments & Gallery', subtitle: 'High-res photos from Stages, Ground & Ceremonies' };
      case 'documents':
        return { title: 'Rules, Handbooks & Guidelines', subtitle: 'Official bylaws, judging criteria & appeals' };
      case 'certificates':
        return { title: 'Digital Certificate Verification', subtitle: 'Verify Official Merit & Participation Certificates' };
      case 'admin':
        return { title: 'Festival Administration Panel', subtitle: 'Score Entry, Result Publishing, Sheets Sync & Schedules' };
    }
  };

  const pageInfo = getPageTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-18">
        {/* Left Side: Mobile Menu Button & Clean Title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold font-display text-slate-900 truncate tracking-wide">
              {pageInfo.title}
            </h2>
          </div>
        </div>

        {/* Right Side: Global Search, Quick Check Result, Notifications & Admin */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
            <span className="hidden sm:inline">Search chest, team, event...</span>
            <span className="inline sm:hidden">Search</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-200 text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Quick Check Result Button */}
          {activeTab !== 'results' && (
            <GlassButton
              variant="arts"
              size="sm"
              onClick={() => setActiveTab('results')}
              className="hidden lg:flex"
            >
              Check Result
            </GlassButton>
          )}

          {/* Notification Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/10 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Live Activity Stream</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
                </div>

                <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                  {liveUpdates.slice(0, 6).map((item, idx) => (
                    <div
                      key={item.id || `live-upd-${idx}`}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200/70 transition-colors flex items-start gap-2.5"
                    >
                      <span className="text-base shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 leading-snug truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                          {item.description}
                        </div>
                        <span className="text-[10px] text-purple-600 font-mono mt-1 block">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('schedule');
                      setIsNotifOpen(false);
                    }}
                    className="text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    View Schedule
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('leaderboard');
                      setIsNotifOpen(false);
                    }}
                    className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                  >
                    Full Standings →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Avatar / Auth Trigger */}
          {isAdminLoggedIn ? (
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer"
              title={`Logged in as ${adminUser?.fullName} (${adminUser?.role})`}
            >
              <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {adminUser?.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-purple-800 truncate max-w-[90px]">
                {adminUser?.username}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminAuth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              title="Admin Login"
            >
              <Shield className="w-4 h-4 text-purple-600" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
