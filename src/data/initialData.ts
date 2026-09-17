import {
  Team,
  TeamMinus,
  Participant,
  ArtsProgram,
  SportsMatch,
  ScheduleItem,
  Announcement,
  LiveUpdate,
  GalleryItem,
  DocumentItem,
  Certificate,
  ScoringRules,
  GoogleSheetsConfig,
  AdminUser,
  FestConfig
} from '../types/festival';

export const INITIAL_FEST_CONFIG: FestConfig = {
  festivalName: 'AHIA FEST 2026',
  name: 'AHIA FEST 2026',
  year: '2026',
  edition: 'Annual Championship Edition',
  statusBanner: 'LIVE',
  tagline: 'Annual Inter-House Arts & Athletics Fest',
  theme: 'Where talent meets competition.',
  motto: 'Ignite the Spirit of Excellence',
  dates: 'March 15 - 18, 2026',
  currentDay: 'Day 1 of 3',
  venue: 'Grand Central Stage & Main Athletic Arena',
  organizedBy: 'Hidaya Union Devoted Activities (HUDA)',
  chiefGuest: 'Prof. Dr. K. M. Andrews',
  announcementTicker: '⚡ Stage 1 Classical Dance Finals underway • High Jump preliminaries starting at Arena B • Official Live Results posting in real-time!',
  liveStreamUrl: '',
  contactEmail: 'festival@ahiaedu.org',
  contactPhone: '+91 98470 12345',
  logoUrl: '/assets/festival_logo.svg',
  bannerUrl: 'https://images.unsplash.com/photo-1511525258028-df0c67b3ff2d?w=1200&auto=format&fit=crop&q=80',
  adminPassword: 'hudaahiasmash20262027',
  adminUsername: 'smash2k26',
  podiumCategory: 'arts',
  accentColor: '#4f46e5',
  accentPreset: 'indigo',
  enableLiveTicker: true,
  announcementTickerSpeed: 'normal',
  copyrightText: '© 2026 AHIA FEST • Hidaya Union Devoted Activities (HUDA). All Rights Reserved.',
  applyPenaltiesToPodium: true,
};

export const INITIAL_SCORING_RULES: ScoringRules = {
  goldPoints: 10,
  silverPoints: 7,
  bronzePoints: 5,
  gradePointsA_Plus: 5,
  gradePointsA: 3,
  gradePointsB_Plus: 2,
  gradePointsB: 1,
  participationPoints: 1,
  groupEventMultiplier: 1.5,
  sportsWinnerPoints: 15,
  sportsRunnerUpPoints: 10,
  sportsThirdPlacePoints: 5,
  defaultMinusPoints: 5,
};

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'RUBY ROYALS',
    shortCode: 'RBY',
    color: '#EF4444',
    accentColor: '#F87171',
    logo: '👑',
    captain: 'Alexander Rivera',
    viceCaptain: 'Sarah Jenkins',
    staffAdvisor: 'Prof. Thomas Kurian',
    slogan: 'Courage, Honor, Glory',
    description: 'The fiery house of passion and unwavering competitive strength.',
    artsPoints: 0,
    sportsPoints: 0,
    totalPoints: 0,
    golds: 0,
    silvers: 0,
    bronzes: 0,
    totalWins: 0,
    rank: 1,
    previousRank: 1,
    trend: 'same',
    membersCount: 48,
  },
  {
    id: 'team-2',
    name: 'SAPPHIRE SHARKS',
    shortCode: 'SPH',
    color: '#3B82F6',
    accentColor: '#60A5FA',
    logo: '🦈',
    captain: 'David Chen',
    viceCaptain: 'Maya Patel',
    staffAdvisor: 'Dr. Rebecca Mathews',
    slogan: 'Depth, Speed, Dominance',
    description: 'The dynamic force of strategy, boundless agility, and endurance.',
    artsPoints: 0,
    sportsPoints: 0,
    totalPoints: 0,
    golds: 0,
    silvers: 0,
    bronzes: 0,
    totalWins: 0,
    rank: 2,
    previousRank: 2,
    trend: 'same',
    membersCount: 45,
  },
  {
    id: 'team-3',
    name: 'EMERALD EAGLES',
    shortCode: 'EMR',
    color: '#10B981',
    accentColor: '#34D399',
    logo: '🦅',
    captain: 'Ryan Thorne',
    viceCaptain: 'Elena Gomez',
    staffAdvisor: 'Prof. Suresh Nair',
    slogan: 'Vision, Precision, Triumph',
    description: 'The soaring house of intellect, razor-sharp focus, and cultural artistry.',
    artsPoints: 0,
    sportsPoints: 0,
    totalPoints: 0,
    golds: 0,
    silvers: 0,
    bronzes: 0,
    totalWins: 0,
    rank: 3,
    previousRank: 3,
    trend: 'same',
    membersCount: 46,
  },
];

export const INITIAL_PARTICIPANTS: Participant[] = [];

export const INITIAL_ARTS_PROGRAMS: ArtsProgram[] = [];

export const INITIAL_SPORTS_MATCHES: SportsMatch[] = [];

export const INITIAL_SCHEDULE: ScheduleItem[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_LIVE_UPDATES: LiveUpdate[] = [];

export const INITIAL_GALLERY: GalleryItem[] = [];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_CERTIFICATES: Certificate[] = [];

export const INITIAL_TEAM_MINUSES: TeamMinus[] = [];

export const INITIAL_GOOGLE_SHEETS_CONFIG: GoogleSheetsConfig = {
  sheetUrl: 'https://script.google.com/macros/s/AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w/exec',
  sheetId: 'AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w/exec',
  deploymentId: 'AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w',
  autoSync: true,
  syncIntervalMinutes: 1,
  lastSyncedAt: 'Live Connected',
  syncStatus: 'connected',
};

export const INITIAL_ADMIN_USER: AdminUser = {
  id: 'admin-1',
  username: 'smash2k26',
  fullName: 'Chief Festival Controller (smash2k26)',
  role: 'Super Admin',
  email: 'smash2k26@gmail.com',
  token: 'auth-token-smash-2026',
};
