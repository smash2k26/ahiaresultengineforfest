import React from 'react';
import { Home01Icon as Home, Award01Icon as Trophy, BrushIcon as Palette, Activity02Icon as Activity, Calendar01Icon as Calendar, Search01Icon as Search, UserGroupIcon as Users, Award01Icon as Award, Image01Icon as Image01Icon, File01Icon as FileText, Shield02Icon as ShieldCheck, FireIcon as Flame, ArrowRight01Icon as ChevronRight, ArrowLeft01Icon as ChevronLeft, PanelLeftCloseIcon as PanelLeftClose, PanelLeftOpenIcon as PanelLeftOpen, UserCheck01Icon as UserCheck } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassBadge } from '../ui/GlassCard';
import { TeamLogo, formatImageUrl } from '../ui/TeamLogo';

export type ActiveTab =
  | 'home'
  | 'leaderboard'
  | 'arts'
  | 'sports'
  | 'schedule'
  | 'results'
  | 'teams'
  | 'participants'
  | 'gallery'
  | 'documents'
  | 'certificates'
  | 'admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenHelp?: () => void;
  onOpenAdminAuth: () => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  onOpenAdminAuth,
  isCollapsed = false,
  setIsCollapsed,
}) => {
  const { teams, festConfig, adminUser, isAdminLoggedIn } = useFestival();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home Dashboard', icon: <Home className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { id: 'arts', label: 'Arts Hub', icon: <Palette className="w-4 h-4" /> },
    { id: 'sports', label: 'Sports Arena', icon: <Activity className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'results', label: 'Check Result', icon: <Search className="w-4 h-4" /> },
    { id: 'teams', label: 'Houses & Teams', icon: <Flame className="w-4 h-4" /> },
    { id: 'participants', label: 'Participants', icon: <Users className="w-4 h-4" /> },
    { id: 'documents', label: 'Rules & Docs', icon: <FileText className="w-4 h-4" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  const topTeam = teams[0];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 ${
          isCollapsed ? 'w-[76px]' : 'w-[260px]'
        } bg-white/95 border-r border-slate-200 backdrop-blur-xl flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 !w-[260px]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Festival Logo & Branding */}
        <div className={`p-4 border-b border-slate-100 bg-slate-50/50 ${isCollapsed ? 'px-3' : 'p-5'}`}>
          <div
            className={`flex items-center gap-3 cursor-pointer min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}
            onClick={() => handleSelectTab('home')}
            title={isCollapsed ? (festConfig?.name || 'AHIA FEST 2026') : undefined}
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm shadow-purple-900/10 flex items-center justify-center shrink-0 border border-slate-200 bg-white hover:border-purple-500/50 transition-colors">
              <img
                src={formatImageUrl(festConfig?.logoUrl) || '/assets/festival_logo.svg'}
                alt={festConfig?.name || 'AHIA Fest Logo'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-1"
              />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display font-extrabold text-sm tracking-wider text-slate-900 truncate">
                    {festConfig?.name || 'AHIA FEST'} <span className="text-purple-600 text-xs font-bold">2026</span>
                  </h1>
                </div>
                <p className="text-[10px] uppercase font-semibold tracking-widest text-slate-500 truncate">
                  RESULT ENGINE
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-4' : 'px-3 py-4'} space-y-1`}>
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Main Command
            </div>
          )}

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'
                } rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} min-w-0`}>
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
              </button>
            );
          })}

          {/* Quick Favorites / Live Standings Teaser (Visible when enlarged) */}
          {!isCollapsed && (
            <>
              <div className="pt-5 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Current #1 Leader</span>
                <Trophy className="w-3 h-3 text-amber-500" />
              </div>

              {topTeam && (
                <div
                  onClick={() => handleSelectTab('leaderboard')}
                  className="mx-1 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 hover:border-amber-300 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TeamLogo logo={topTeam.logo} name={topTeam.name} color={topTeam.color} size="sm" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                          {topTeam.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{topTeam.totalWins} Wins • Rank 01</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-amber-600">{topTeam.totalPoints}</div>
                      <div className="text-[9px] text-slate-400 font-mono">PTS</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className={`p-3 border-t border-slate-200 space-y-1.5 bg-slate-50/80 ${isCollapsed ? 'px-2' : 'p-3'}`}>
          {/* Desktop Shrink / Enlarge Toggle Button (Bottom Above Admin) */}
          {setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Enlarge Sidebar' : 'Shrink Sidebar'}
              className={`hidden lg:flex w-full items-center ${
                isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
              } rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200`}
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-purple-600" />
                ) : (
                  <>
                    <PanelLeftClose className="w-4 h-4 text-slate-500" />
                    <span>Shrink Sidebar</span>
                  </>
                )}
              </div>
              {!isCollapsed && <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          )}

          {isAdminLoggedIn ? (
            <button
              onClick={() => handleSelectTab('admin')}
              title={isCollapsed ? `Admin: ${adminUser?.fullName}` : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
              } rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} min-w-0`}>
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                {!isCollapsed && (
                  <div className="text-left truncate">
                    <div className="truncate text-slate-900">{adminUser?.fullName}</div>
                    <div className="text-[10px] text-purple-600 font-normal">Admin Command</div>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <GlassBadge variant="arts" size="xs">
                  Active
                </GlassBadge>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAdminAuth}
              title={isCollapsed ? 'Admin Sign In' : undefined}
              className={`w-full flex items-center justify-center gap-2 ${
                isCollapsed ? 'p-2.5' : 'px-3 py-2.5'
              } rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs transition-all cursor-pointer`}
            >
              <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
              {!isCollapsed && <span>Admin Sign In</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
