import React, { useState } from 'react';
import { FestivalProvider, useFestival } from './context/FestivalContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { CelebrationFireworks } from './components/ui/CelebrationFireworks';

// View Hubs
import { HeroSection } from './components/home/HeroSection';
import { PodiumLeaderboard } from './components/home/PodiumLeaderboard';
import { OverallLeaderboardTable } from './components/home/OverallLeaderboardTable';
import { LiveNowSection } from './components/home/LiveNowSection';
import { RecentResultsFeed } from './components/home/RecentResultsFeed';
import { AnnouncementsSection } from './components/home/AnnouncementsSection';

import { LeaderboardHub } from './components/leaderboard/LeaderboardHub';
import { ArtsHub } from './components/arts/ArtsHub';
import { SportsHub } from './components/sports/SportsHub';
import { ScheduleHub } from './components/schedule/ScheduleHub';
import { ResultSearchHub } from './components/results/ResultSearchHub';
import { TeamsHub } from './components/teams/TeamsHub';
import { ParticipantsHub } from './components/participants/ParticipantsHub';
import { GalleryHub } from './components/gallery/GalleryHub';
import { DocumentsHub } from './components/documents/DocumentsHub';
import { CertificateVerificationHub } from './components/certificates/CertificateVerificationHub';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Modals
import { ArtsResultModal } from './components/arts/ArtsResultModal';
import { SportsMatchModal } from './components/sports/SportsMatchModal';
import { TeamDetailModal } from './components/teams/TeamDetailModal';
import { PrintableCertificateModal } from './components/certificates/PrintableCertificateModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { HelpModal } from './components/help/HelpModal';

import { ArtsProgram, SportsMatch, Team, Participant } from './types/festival';

const MainFestivalApp: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, participants, teams } = useFestival();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modal States
  const [selectedArtsProgram, setSelectedArtsProgram] = useState<ArtsProgram | null>(null);
  const [selectedSportsMatch, setSelectedSportsMatch] = useState<SportsMatch | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedCertParticipant, setSelectedCertParticipant] = useState<Participant | null>(null);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [initialSearchChestNo, setInitialSearchChestNo] = useState<string>('');

  const handleSelectParticipant = (chestNo: string) => {
    setInitialSearchChestNo(chestNo);
    setActiveTab('results');
  };

  const handleSelectTeamById = (teamId: string) => {
    const found = teams.find((t) => t.id === teamId);
    if (found) {
      setSelectedTeam(found);
    }
  };

  const handleOpenCertificateModal = (p: Participant) => {
    setSelectedCertParticipant(p);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area (offset by Sidebar width on desktop) */}
      <div
        className={`flex-1 flex flex-col ${
          isSidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[260px]'
        } min-w-0 transition-all duration-300 bg-white`}
      >
        {/* Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12 bg-white">
          {/* HOME DASHBOARD */}
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <HeroSection setActiveTab={setActiveTab} />
              <LiveNowSection
                setActiveTab={setActiveTab}
                onOpenArtsDetail={(prog) => setSelectedArtsProgram(prog)}
                onOpenSportsDetail={(match) => setSelectedSportsMatch(match)}
              />
              <PodiumLeaderboard setActiveTab={setActiveTab} />
              <OverallLeaderboardTable
                setActiveTab={setActiveTab}
                onSelectTeam={handleSelectTeamById}
              />
              <RecentResultsFeed
                setActiveTab={setActiveTab}
                onOpenArtsDetail={(prog) => setSelectedArtsProgram(prog)}
              />
              <AnnouncementsSection setActiveTab={setActiveTab} />
            </div>
          )}

          {/* LEADERBOARD VIEW */}
          {activeTab === 'leaderboard' && (
            <div className="animate-in fade-in duration-200">
              <LeaderboardHub
                setActiveTab={setActiveTab}
                onSelectTeam={handleSelectTeamById}
              />
            </div>
          )}

          {/* ARTS HUB */}
          {activeTab === 'arts' && (
            <div className="animate-in fade-in duration-200">
              <ArtsHub
                onOpenArtsDetail={(prog) => setSelectedArtsProgram(prog)}
                setActiveTab={setActiveTab}
              />
            </div>
          )}

          {/* SPORTS HUB */}
          {activeTab === 'sports' && (
            <div className="animate-in fade-in duration-200">
              <SportsHub
                onOpenSportsDetail={(match) => setSelectedSportsMatch(match)}
                setActiveTab={setActiveTab}
              />
            </div>
          )}

          {/* RESULTS SEARCH HUB */}
          {activeTab === 'results' && (
            <div className="animate-in fade-in duration-200">
              <ResultSearchHub
                initialChestNo={initialSearchChestNo}
                setActiveTab={setActiveTab}
                onOpenCertificateModal={handleOpenCertificateModal}
              />
            </div>
          )}

          {/* TEAMS HUB */}
          {activeTab === 'teams' && (
            <div className="animate-in fade-in duration-200">
              <TeamsHub
                onSelectTeam={(team) => setSelectedTeam(team)}
                setActiveTab={setActiveTab}
              />
            </div>
          )}

          {/* PARTICIPANTS HUB */}
          {activeTab === 'participants' && (
            <div className="animate-in fade-in duration-200">
              <ParticipantsHub
                setActiveTab={setActiveTab}
                onSelectParticipant={handleSelectParticipant}
              />
            </div>
          )}

          {/* SCHEDULE HUB */}
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in duration-200">
              <ScheduleHub
                setActiveTab={setActiveTab}
                onOpenArtsTab={() => setActiveTab('arts')}
                onOpenSportsTab={() => setActiveTab('sports')}
              />
            </div>
          )}

          {/* GALLERY HUB */}
          {activeTab === 'gallery' && (
            <div className="animate-in fade-in duration-200">
              <GalleryHub />
            </div>
          )}

          {/* DOCUMENTS HUB */}
          {activeTab === 'documents' && (
            <div className="animate-in fade-in duration-200">
              <DocumentsHub />
            </div>
          )}

          {/* CERTIFICATES HUB */}
          {activeTab === 'certificates' && (
            <div className="animate-in fade-in duration-200">
              <CertificateVerificationHub
                onOpenCertificateModal={handleOpenCertificateModal}
              />
            </div>
          )}

          {/* ADMIN DASHBOARD */}
          {activeTab === 'admin' && (
            <div className="animate-in fade-in duration-200">
              <AdminDashboard onClose={() => setActiveTab('home')} />
            </div>
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-black font-display">AHIA FEST 2026</span>
              <span>•</span>
              <span className="text-slate-600">Result & Leaderboard Engine</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Where Talent Meets Competition • Powered by Real-Time Event Sync
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
      />

      {/* Global Modals */}
      <ArtsResultModal
        program={selectedArtsProgram}
        onClose={() => setSelectedArtsProgram(null)}
        setActiveTab={setActiveTab}
        onSelectParticipant={handleSelectParticipant}
      />

      <SportsMatchModal
        match={selectedSportsMatch}
        onClose={() => setSelectedSportsMatch(null)}
        setActiveTab={setActiveTab}
      />

      <TeamDetailModal
        team={selectedTeam}
        onClose={() => setSelectedTeam(null)}
        setActiveTab={setActiveTab}
        onSelectParticipant={handleSelectParticipant}
      />

      <PrintableCertificateModal
        participant={selectedCertParticipant}
        onClose={() => setSelectedCertParticipant(null)}
      />

      <AdminLoginModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setActiveTab('admin');
        }}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveTab={setActiveTab}
        onSelectParticipant={handleSelectParticipant}
      />

      <CelebrationFireworks />
      {/* Toast Notifications */}
      {activeTab === 'admin' && <ToastContainer />}
    </div>
  );
};

export default function App() {
  return (
    <FestivalProvider>
      <MainFestivalApp />
    </FestivalProvider>
  );
}
