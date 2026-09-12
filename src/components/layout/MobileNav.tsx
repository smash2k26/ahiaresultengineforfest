import React from 'react';
import { Home01Icon as Home, Award01Icon as Trophy, Search01Icon as Search, Calendar01Icon as Calendar, Shield02Icon as ShieldCheck, UserIcon as User } from 'hugeicons-react';
import { ActiveTab } from './Sidebar';
import { useFestival } from '../../context/FestivalContext';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAdminAuth: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAdminAuth,
}) => {
  const { isAdminLoggedIn } = useFestival();

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'leaderboard' as ActiveTab, label: 'Ranks', icon: <Trophy className="w-5 h-5" /> },
    { id: 'results' as ActiveTab, label: 'Result', icon: <Search className="w-5 h-5" /> },
    { id: 'schedule' as ActiveTab, label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E1015]/95 backdrop-blur-2xl border-t border-white/8 lg:hidden px-2 py-1.5 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                isActive
                  ? 'text-purple-400 font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? 'bg-purple-600/20 scale-110' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Admin Tab or Profile */}
        <button
          onClick={() => {
            if (isAdminLoggedIn) {
              setActiveTab('admin');
            } else {
              onOpenAdminAuth();
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer min-w-[56px] ${
            activeTab === 'admin'
              ? 'text-purple-400 font-bold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-transform ${
              activeTab === 'admin' ? 'bg-purple-600/20 scale-110' : ''
            }`}
          >
            {isAdminLoggedIn ? (
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {isAdminLoggedIn ? 'Admin' : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
};
