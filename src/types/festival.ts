export type CategoryType = 'Senior' | 'Junior' | 'Sub Junior' | 'All';
export type SectionType = 'Individual' | 'Group' | 'All';
export type EventStatus = 'LIVE' | 'UPCOMING' | 'COMPLETED' | 'RESULT PENDING';
export type ResultPublishStatus = 'Draft' | 'Verified' | 'Published';

export type SportType = 
  | 'Football' 
  | 'Cricket' 
  | 'Volleyball' 
  | 'Basketball' 
  | 'Badminton' 
  | 'Table Tennis' 
  | 'Chess' 
  | 'Athletics' 
  | 'Tug of War';

export interface FestConfig {
  festivalName: string;
  name?: string;
  year: string;
  edition?: string;
  statusBanner: 'LIVE' | 'UPCOMING' | 'CONCLUDED' | 'PAUSED';
  tagline: string;
  theme?: string;
  motto?: string;
  dates?: string;
  currentDay?: string;
  venue?: string;
  organizedBy?: string;
  chiefGuest?: string;
  announcementTicker?: string;
  enableLiveTicker?: boolean;
  announcementTickerSpeed?: 'normal' | 'slow' | 'fast';
  liveStreamUrl?: string;
  isCelebrationMode?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl: string;
  bannerUrl?: string;
  adminPassword?: string;
  adminUsername?: string;
  podiumCategory?: 'arts' | 'sports';
  accentColor?: string;
  accentPreset?: 'indigo' | 'purple' | 'emerald' | 'sky' | 'rose' | 'amber' | 'cyan' | 'pink' | 'custom';
  copyrightText?: string;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  color: string;
  accentColor: string;
  logo: string;
  captain: string;
  viceCaptain?: string;
  staffAdvisor?: string;
  description: string;
  slogan?: string;
  artsPoints: number;
  sportsPoints: number;
  totalPoints: number;
  golds: number;
  silvers: number;
  bronzes: number;
  totalWins: number;
  rank: number;
  previousRank: number;
  trend: 'up' | 'down' | 'same';
  membersCount: number;
}

export interface Participant {
  id: string;
  name: string;
  admissionNo: string;
  chestNo: string;
  teamId: string;
  category: 'Senior' | 'Junior' | 'Sub Junior' | 'General';
  section: 'Individual' | 'Group' | 'Both';
  yearClass: string;
  classGrade?: string;
  sectionName?: string;
  contact?: string;
  photo: string;
  totalPoints: number;
  artsPoints?: number;
  sportsPoints?: number;
  golds: number;
  silvers: number;
  bronzes: number;
  artsGolds?: number;
  artsSilvers?: number;
  artsBronzes?: number;
  sportsGolds?: number;
  sportsSilvers?: number;
  sportsBronzes?: number;
  artsRank?: number;
  sportsRank?: number;
  overallRank?: number;
  participatedPrograms: string[]; // Program IDs
}

export interface ArtsResultEntry {
  id?: string;
  programId?: string;
  programName?: string;
  programCode?: string;
  participantId: string;
  participantName: string;
  chestNo: string;
  admissionNo?: string;
  teamId: string;
  marks: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'Participated' | string;
  rank: number; // 1, 2, 3, 4, etc.
  position: '1st' | '2nd' | '3rd' | '4th' | 'Consolation' | '-' | string;
  pointsAwarded: number;
  status?: 'Published' | 'Draft' | 'Verified';
  publishedAt?: string;
}

export interface ArtsProgram {
  id: string;
  code?: string;
  name: string;
  category: 'Senior' | 'Junior' | 'Sub Junior' | 'General';
  section: 'Individual' | 'Group';
  disciplineType?: 'Arts' | 'Sports';
  stage: string;
  venue: string;
  date: string;
  time: string;
  scheduledTime?: string;
  maxMarks: number;
  status: EventStatus;
  publishStatus: ResultPublishStatus;
  judges: string[];
  participantsCount: number;
  registeredParticipantIds: string[];
  results: ArtsResultEntry[];
  publishedAt?: string;
}

export interface MatchEvent {
  id: string;
  minute: number | string;
  type: 'goal' | 'card_yellow' | 'card_red' | 'point' | 'wicket' | 'substitution' | 'set_won';
  teamId: string;
  playerName: string;
  description: string;
}

export interface SportsMatch {
  id: string;
  sport: SportType;
  category?: CategoryType;
  title: string;
  round: 'League' | 'Quarter Final' | 'Semi Final' | 'Final' | '3rd Place Playoff' | string;
  teamAId: string;
  teamBId: string;
  scoreA: number | string;
  scoreB: number | string;
  detailScore?: string; // e.g., "142/4 (20 ov) vs 138/8 (20 ov)" or "21-19, 18-21, 21-15"
  venue: string;
  date: string;
  time: string;
  scheduledTime?: string;
  status: EventStatus;
  publishStatus: ResultPublishStatus;
  matchTimer?: {
    minute: number;
    seconds: number;
    isRunning: boolean;
  };
  winnerTeamId?: string;
  pointsAwardedA?: number;
  pointsAwardedB?: number;
  pointsToWinner?: number;
  referees?: string[];
  events: MatchEvent[];
  stats?: {
    possessionA?: number;
    possessionB?: number;
    shotsA?: number;
    shotsB?: number;
    foulsA?: number;
    foulsB?: number;
    cornersA?: number;
    cornersB?: number;
  };
}

export interface ScheduleItem {
  id: string;
  title: string;
  type: 'Arts' | 'Sports' | 'Ceremony' | 'Other';
  category: CategoryType;
  venue: string;
  stage?: string;
  day: 'Day 1' | 'Day 2' | 'Day 3' | string;
  date: string;
  time?: string;
  scheduledTime?: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  referenceId?: string; // Link to ArtsProgram or SportsMatch
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Breaking' | 'Arts' | 'Sports' | 'General' | 'Schedule';
  timestamp: string;
  isUrgent?: boolean;
  author: string;
}

export interface LiveUpdate {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'result' | 'match' | 'rank_change' | 'announcement';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Arts' | 'Sports' | 'Opening Ceremony' | 'Competitions' | 'Winners' | 'Behind the Scenes';
  imageUrl: string;
  caption: string;
  date: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Official Circular' | 'Rules & Regulations' | 'Schedule' | 'Guidelines' | 'Circulars' | 'Results' | 'General Notice' | string;
  fileSize?: string;
  issueDate?: string;
  fileUrl?: string;
  updatedAt: string;
  description: string;
  contentMarkdown?: string;
  status?: 'Active' | 'Archived' | 'Draft' | 'Published' | string;
  isPublic?: boolean;
}

export interface Certificate {
  id: string; // Serial code e.g. "AHIA-2026-W-8839"
  participantId: string;
  participantName: string;
  chestNo: string;
  admissionNo: string;
  teamName: string;
  eventName: string;
  eventType: 'Arts' | 'Sports';
  category: string;
  rank: '1st' | '2nd' | '3rd' | 'Participation';
  certificateType: 'Winner' | 'Runner Up' | 'Third Place' | 'Participation';
  issueDate: string;
  verificationCode: string;
  digitalSignature: string;
  programId?: string;
  programCode?: string;
  marks?: number;
  grade?: string;
  pointsAwarded?: number;
}

export interface ScoringRules {
  goldPoints: number; // default 10
  silverPoints: number; // default 7
  bronzePoints: number; // default 5
  gradePointsA_Plus: number; // default 5
  gradePointsA: number; // default 3
  gradePointsB_Plus: number; // default 2
  gradePointsB: number; // default 1
  participationPoints: number; // default 1
  groupEventMultiplier: number; // default 1.5
  sportsWinnerPoints: number; // default 15
  sportsRunnerUpPoints: number; // default 10
  sportsThirdPlacePoints: number; // default 5
}

export interface GoogleSheetsConfig {
  sheetUrl: string;
  sheetId: string;
  appsScriptUrl: string;
  deploymentId?: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'connected' | 'error';
  errorMessage?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: 'Super Admin' | 'Arts Coordinator' | 'Sports Coordinator' | 'Scorekeeper';
  email: string;
  token?: string;
}

export interface FestivalStats {
  totalParticipants: number;
  totalPrograms: number;
  artsPrograms: number;
  sportsEvents: number;
  resultsPublished: number;
  liveEventsCount: number;
  pendingResultsCount: number;
}
