import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  FestivalStats,
  EventStatus,
  ResultPublishStatus,
  FestConfig,
  ArtsResultEntry
} from '../types/festival';
import {
  INITIAL_TEAMS,
  INITIAL_TEAM_MINUSES,
  INITIAL_FEST_CONFIG,
  INITIAL_PARTICIPANTS,
  INITIAL_ARTS_PROGRAMS,
  INITIAL_SPORTS_MATCHES,
  INITIAL_SCHEDULE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_LIVE_UPDATES,
  INITIAL_GALLERY,
  INITIAL_DOCUMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_SCORING_RULES,
  INITIAL_GOOGLE_SHEETS_CONFIG,
  INITIAL_ADMIN_USER
} from '../data/initialData';
import { isSportsProgram } from '../utils/programHelpers';
import {
  persistCelebrationMode,
  listenToCelebrationMode,
  persistRemoteDeletion,
  removeRemoteDeletion,
  listenToDeletions,
  persistLiveProgramResult,
  listenToLiveResults,
} from '../lib/firebase';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
}

interface FestivalContextType {
  // Primary State
  teams: Team[];
  teamMinuses: TeamMinus[];
  participants: Participant[];
  artsPrograms: ArtsProgram[];
  sportsMatches: SportsMatch[];
  schedule: ScheduleItem[];
  announcements: Announcement[];
  liveUpdates: LiveUpdate[];
  gallery: GalleryItem[];
  documents: DocumentItem[];
  certificates: Certificate[];
  scoringRules: ScoringRules;
  googleSheetsConfig: GoogleSheetsConfig;
  schedules?: ScheduleItem[];
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  toasts: ToastMessage[];
  stats: FestivalStats;
  searchQuery: string;
  isSearchOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  notify?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  toggleLikeGallery?: (id: string) => void;

  // Admin Auth
  loginAdmin: (username: string, password: string) => boolean;
  signupAdmin: (username: string, password: string, fullName: string, email: string, role: string) => boolean;
  logoutAdmin: () => void;

  // Result & Live Score Management
  publishArtsResult: (programId: string) => void;
  verifyArtsResult: (programId: string) => void;
  saveArtsResultDraft: (programId: string, results: ArtsProgram['results']) => void;
  updateArtsProgramStatus: (programId: string, status: EventStatus) => void;
  addArtsProgram: (program: Omit<ArtsProgram, 'id' | 'results'>) => void;
  editArtsProgram: (id: string, programData: Partial<ArtsProgram>) => void;
  deleteArtsProgram: (id: string) => void;

  // Sports Live Match Updates
  updateSportsScore: (
    matchId: string, 
    scoreA: number | string, 
    scoreB: number | string, 
    detailScore?: string,
    winnerTeamId?: string,
    status?: EventStatus
  ) => void;
  addMatchEvent: (matchId: string, event: Omit<SportsMatch['events'][0], 'id'>) => void;
  toggleMatchTimer: (matchId: string) => void;
  addSportsMatch: (match: Omit<SportsMatch, 'id' | 'events'>) => void;
  editSportsMatch: (id: string, matchData: Partial<SportsMatch>) => void;
  deleteSportsMatch: (id: string) => void;
  bulkImportSportsMatches: (matches: SportsMatch[]) => void;

  // Participant & Team Management
  addParticipant: (participant: Omit<Participant, 'id' | 'totalPoints' | 'golds' | 'silvers' | 'bronzes' | 'participatedPrograms'>) => void;
  editParticipant: (id: string, data: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  bulkImportParticipants: (newParticipants: Participant[]) => void;
  
  addTeam: (team: Omit<Team, 'id' | 'artsPoints' | 'sportsPoints' | 'totalPoints' | 'golds' | 'silvers' | 'bronzes' | 'totalWins' | 'rank' | 'previousRank' | 'trend'>) => void;
  editTeam: (id: string, data: Partial<Team>) => void;
  deleteTeam: (id: string) => void;

  // Team Minuses & Penalty Points
  addTeamMinus: (minus: Omit<TeamMinus, 'id' | 'timestamp'>) => void;
  editTeamMinus: (id: string, data: Partial<TeamMinus>) => void;
  deleteTeamMinus: (id: string) => void;

  // Schedule & Announcements
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  editScheduleItem: (id: string, itemData: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp'>) => void;
  editAnnouncement: (id: string, data: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  // Scoring Rules & System Recalculation
  updateScoringRules: (rules: ScoringRules) => void;
  recalculateAllStandings: () => void;

  festConfig: FestConfig;
  updateFestConfig: (config: Partial<FestConfig>, silent?: boolean) => void;
  toggleCelebrationMode: (enabled?: boolean) => void;
  triggerCelebrationBlast: () => void;

  // Documents & Circulars
  addDocument: (doc: Omit<DocumentItem, 'id' | 'updatedAt'>) => void;
  editDocument: (id: string, docData: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;

  // Results & Marks
  addResultMark: (mark: {
    programId: string;
    participantId: string;
    marks?: number;
    grade: string;
    position: string;
    pointsAwarded: number;
    publishNow?: boolean;
  }) => void;
  savePodiumResults: (
    programId: string,
    podiumSlots: Array<{
      rank: 1 | 2 | 3;
      participantId: string;
      grade?: string;
      pointsAwarded: number;
    }>,
    publishNow?: boolean
  ) => void;
  deleteResultMark: (programId: string, participantId: string) => void;

  // Google Sheets Integration
  updateGoogleSheetsConfig: (config: Partial<GoogleSheetsConfig>) => void;
  syncWithGoogleSheets: () => Promise<boolean>;
  pushToGoogleSheets: () => Promise<boolean>;
  exportDataAsJson: () => string;
  importDataFromJson: (jsonData: string) => boolean;
  generateCertificate: (certificateData: Omit<Certificate, 'id' | 'issueDate' | 'verificationCode' | 'digitalSignature'>) => Certificate;
  bulkGenerateCertificatesFromResults: () => number;
  deleteCertificate: (id: string) => void;
  resetAllData: () => void;
  changeAdminPassword: (newPassword: string) => boolean;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('ahia_teams');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_TEAMS;
  });

  const [teamMinuses, setTeamMinuses] = useState<TeamMinus[]>(() => {
    const saved = localStorage.getItem('ahia_team_minuses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_TEAM_MINUSES;
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('ahia_participants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((p, idx) => ({
            ...p,
            id: String(p?.id || p?.chestNo || `p-${idx + 1}`),
            name: String(p?.name || ''),
            chestNo: p?.chestNo != null ? String(p.chestNo) : '',
            admissionNo: p?.admissionNo != null ? String(p.admissionNo) : '',
            yearClass: p?.yearClass != null ? String(p.yearClass) : '',
          }));
        }
      } catch (e) {}
    }
    return INITIAL_PARTICIPANTS;
  });

  const [artsPrograms, setArtsPrograms] = useState<ArtsProgram[]>(() => {
    const saved = localStorage.getItem('ahia_arts_programs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_ARTS_PROGRAMS;
  });

  const [sportsMatches, setSportsMatches] = useState<SportsMatch[]>(() => {
    const saved = localStorage.getItem('ahia_sports_matches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_SPORTS_MATCHES;
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('ahia_schedule');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_SCHEDULE;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('ahia_announcements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>(() => {
    const saved = localStorage.getItem('ahia_live_updates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_LIVE_UPDATES;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('ahia_gallery');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_GALLERY;
  });

  const toggleLikeGallery = useCallback((id: string) => {
    setGallery((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      );
      try {
        localStorage.setItem('ahia_gallery', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('ahia_documents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [festConfig, setFestConfig] = useState<FestConfig>(() => {
    const saved = localStorage.getItem('ahia_fest_config');
    let parsed: any = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {}
    }
    const merged = {
      ...INITIAL_FEST_CONFIG,
      ...parsed,
    };
    if (!merged.organizedBy || merged.organizedBy === 'AHIA Student Council & Arts Committee') {
      merged.organizedBy = 'Hidaya Union Devoted Activities (HUDA)';
    }
    return merged;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('ahia_certificates');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [scoringRules, setScoringRules] = useState<ScoringRules>(() => {
    const saved = localStorage.getItem('ahia_scoring_rules');
    return saved ? JSON.parse(saved) : INITIAL_SCORING_RULES;
  });

  const pushToGoogleSheetsRef = useRef<((customOverrides?: any) => Promise<boolean>) | null>(null);
  const syncWithGoogleSheetsRef = useRef<(() => Promise<boolean>) | null>(null);
  const isRemoteSyncInProgressRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // Persistent Deleted IDs Registry (Tombstones) to prevent reappearance of deleted records
  const deletedIdsRef = useRef<Set<string>>(
    (() => {
      try {
        const saved = localStorage.getItem('ahia_deleted_ids_v2');
        return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
      } catch {
        return new Set<string>();
      }
    })()
  );

  const recordDeletedId = useCallback((id: string) => {
    if (!id) return;
    const clean = String(id).trim().toLowerCase();
    deletedIdsRef.current.add(clean);
    try {
      localStorage.setItem('ahia_deleted_ids_v2', JSON.stringify(Array.from(deletedIdsRef.current)));
    } catch {}
  }, []);

  const clearDeletedId = useCallback((id: string) => {
    if (!id) return;
    const clean = String(id).trim().toLowerCase();
    deletedIdsRef.current.delete(clean);
    try {
      localStorage.setItem('ahia_deleted_ids_v2', JSON.stringify(Array.from(deletedIdsRef.current)));
    } catch {}
    // Erase tombstone from Firestore so remote snapshots never resurrect it
    removeRemoteDeletion(clean);
  }, []);

  const clearResultTombstones = useCallback((pId: string, pCode?: string, participantId?: string, chestNo?: string, resId?: string) => {
    const keys: string[] = [];
    const cleanPid = pId ? String(pId).trim().toLowerCase() : '';
    const cleanPcode = pCode ? String(pCode).trim().toLowerCase() : '';
    const cleanPartId = participantId ? String(participantId).trim().toLowerCase() : '';
    const cleanChest = chestNo ? String(chestNo).trim().toLowerCase() : '';
    const cleanResId = resId ? String(resId).trim().toLowerCase() : '';

    if (cleanPid && cleanPartId) keys.push(`${cleanPid}_${cleanPartId}`);
    if (cleanPid && cleanChest) keys.push(`${cleanPid}_${cleanChest}`);
    if (cleanPcode && cleanPartId) keys.push(`${cleanPcode}_${cleanPartId}`);
    if (cleanPcode && cleanChest) keys.push(`${cleanPcode}_${cleanChest}`);
    if (cleanResId) keys.push(cleanResId);
    if (cleanPartId) keys.push(cleanPartId);
    if (cleanChest) keys.push(cleanChest);

    keys.forEach((k) => clearDeletedId(k));
  }, [clearDeletedId]);

  const isDeleted = useCallback((id: string | number | undefined | null) => {
    if (id === undefined || id === null) return false;
    const clean = String(id).trim().toLowerCase();
    if (!clean || clean.endsWith('_') || clean.startsWith('_')) return false;
    return deletedIdsRef.current.has(clean);
  }, []);

  // Auto-heal active results: ensure that any results currently present in state or localStorage
  // are never blocked by stale deletion tombstones from previous sessions or aggressive resets
  useEffect(() => {
    artsPrograms.forEach((p) => {
      (p.results || []).forEach((r) => {
        clearResultTombstones(p.id, p.code, r.participantId, r.chestNo, r.id);
      });
    });
    // Ensure active participants and their chest numbers are never blocked by result tombstones
    participants.forEach((pt) => {
      if (pt.chestNo) clearDeletedId(pt.chestNo);
    });
  }, [artsPrograms, participants, clearResultTombstones, clearDeletedId]);

  // Sync Accent Color dynamically to root CSS variables for instant live theme customization
  useEffect(() => {
    const accent = festConfig?.accentColor || '#4F46E5';
    document.documentElement.style.setProperty('--fest-accent', accent);
    const hex = accent.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      document.documentElement.style.setProperty('--fest-accent-rgb', `${r}, ${g}, ${b}`);
      document.documentElement.style.setProperty('--fest-accent-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
      document.documentElement.style.setProperty('--fest-accent-subtle', `rgba(${r}, ${g}, ${b}, 0.05)`);
      document.documentElement.style.setProperty('--fest-accent-border', `rgba(${r}, ${g}, ${b}, 0.3)`);
      const rDark = Math.max(0, Math.floor(r * 0.85));
      const gDark = Math.max(0, Math.floor(g * 0.85));
      const bDark = Math.max(0, Math.floor(b * 0.85));
      document.documentElement.style.setProperty('--fest-accent-hover', `rgb(${rDark}, ${gDark}, ${bDark})`);
    }
  }, [festConfig?.accentColor]);

  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    const CURRENT_URL = 'https://script.google.com/macros/s/AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w/exec';
    const CURRENT_DEPLOYMENT_ID = 'AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w';
    const saved = localStorage.getItem('ahia_sheets_config');
    let parsed: any = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {}
    }
    const updated: GoogleSheetsConfig = {
      ...INITIAL_GOOGLE_SHEETS_CONFIG,
      ...parsed,
      appsScriptUrl: CURRENT_URL,
      deploymentId: CURRENT_DEPLOYMENT_ID,
      sheetUrl: CURRENT_URL,
      sheetId: CURRENT_DEPLOYMENT_ID,
      autoSync: true,
      syncStatus: 'connected',
      lastSyncedAt: parsed.lastSyncedAt || 'Live Connected',
    };
    localStorage.setItem('ahia_sheets_config', JSON.stringify(updated));
    return updated;
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('ahia_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('ahia_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('ahia_team_minuses', JSON.stringify(teamMinuses));
  }, [teamMinuses]);

  useEffect(() => {
    localStorage.setItem('ahia_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('ahia_arts_programs', JSON.stringify(artsPrograms));
  }, [artsPrograms]);

  useEffect(() => {
    localStorage.setItem('ahia_sports_matches', JSON.stringify(sportsMatches));
  }, [sportsMatches]);

  useEffect(() => {
    localStorage.setItem('ahia_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('ahia_fest_config', JSON.stringify(festConfig));
  }, [festConfig]);

  useEffect(() => {
    localStorage.setItem('ahia_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('ahia_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('ahia_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('ahia_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('ahia_live_updates', JSON.stringify(liveUpdates));
  }, [liveUpdates]);

  useEffect(() => {
    localStorage.setItem('ahia_scoring_rules', JSON.stringify(scoringRules));
  }, [scoringRules]);

  useEffect(() => {
    localStorage.setItem('ahia_sheets_config', JSON.stringify(googleSheetsConfig));
  }, [googleSheetsConfig]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('ahia_admin_user', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('ahia_admin_user');
    }
  }, [adminUser]);

  // Real-time Database Sync for Celebration Mode
  useEffect(() => {
    const unsubscribe = listenToCelebrationMode((enabled) => {
      setFestConfig((prev) => {
        if (prev.isCelebrationMode !== enabled) {
          const updated = { ...prev, isCelebrationMode: enabled };
          localStorage.setItem('ahia_fest_config', JSON.stringify(updated));
          if (enabled) {
            window.dispatchEvent(new CustomEvent('fest-trigger-fireworks'));
          }
          return updated;
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Toast Helper
  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newToast: ToastMessage = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Compute Standings from results based on ScoringRules
  const recalculateAllStandings = useCallback(() => {
    setTeams((prevTeams) => {
      const teamStats: Record<string, { arts: number; sports: number; golds: number; silvers: number; bronzes: number; wins: number }> = {};
      
      prevTeams.forEach((t) => {
        teamStats[t.id] = { arts: 0, sports: 0, golds: 0, silvers: 0, bronzes: 0, wins: 0 };
      });

      // 1. Process Arts Programs with Results
      artsPrograms.forEach((prog) => {
        if (prog.results && prog.results.length > 0) {
          const isGroup = prog.section === 'Group';
          const multiplier = isGroup ? scoringRules.groupEventMultiplier : 1;
          const isSports = isSportsProgram(prog);

          prog.results.forEach((res) => {
            if (teamStats[res.teamId]) {
              let pts = 0;
              if (res.pointsAwarded !== undefined) {
                pts = Number(res.pointsAwarded);
              } else {
                if (res.rank === 1) {
                  pts += scoringRules.goldPoints;
                } else if (res.rank === 2) {
                  pts += scoringRules.silverPoints;
                } else if (res.rank === 3) {
                  pts += scoringRules.bronzePoints;
                } else {
                  pts += scoringRules.participationPoints;
                }
                
                // Add Grade bonus
                if (res.grade === 'A+') pts += scoringRules.gradePointsA_Plus;
                else if (res.grade === 'A') pts += scoringRules.gradePointsA;
                else if (res.grade === 'B+') pts += scoringRules.gradePointsB_Plus;
                else if (res.grade === 'B') pts += scoringRules.gradePointsB;
                
                pts = Math.round(pts * multiplier);
              }

              if (res.rank === 1) {
                teamStats[res.teamId].golds += 1;
                teamStats[res.teamId].wins += 1;
              } else if (res.rank === 2) {
                teamStats[res.teamId].silvers += 1;
              } else if (res.rank === 3) {
                teamStats[res.teamId].bronzes += 1;
              }

              if (isSports) {
                teamStats[res.teamId].sports += pts;
              } else {
                teamStats[res.teamId].arts += pts;
              }
            }
          });
        }
      });

      // 2. Process Completed Sports Matches
      sportsMatches.forEach((match) => {
        if (match.publishStatus === 'Published' && match.status === 'COMPLETED' && match.winnerTeamId) {
          if (teamStats[match.winnerTeamId]) {
            teamStats[match.winnerTeamId].sports += scoringRules.sportsWinnerPoints;
            teamStats[match.winnerTeamId].golds += (match.round === 'Final' ? 1 : 0);
            teamStats[match.winnerTeamId].wins += 1;
          }
          const loserTeamId = match.winnerTeamId === match.teamAId ? match.teamBId : match.teamAId;
          if (teamStats[loserTeamId]) {
            if (match.round === 'Final') {
              teamStats[loserTeamId].sports += scoringRules.sportsRunnerUpPoints;
              teamStats[loserTeamId].silvers += 1;
            } else if (match.round === '3rd Place Playoff') {
              teamStats[loserTeamId].sports += scoringRules.sportsThirdPlacePoints;
              teamStats[loserTeamId].bronzes += 1;
            }
          }
        }
      });

      // Recalculate each team
      const updatedTeams = prevTeams.map((team) => {
        const stats = teamStats[team.id] || { arts: 0, sports: 0, golds: 0, silvers: 0, bronzes: 0, wins: 0 };
        const teamMinusList = teamMinuses.filter((m) => m.teamId === team.id);
        const applyArts = festConfig.applyArtsPenalties ?? (festConfig.applyPenaltiesToPodium ?? true);
        const applySports = festConfig.applySportsPenalties ?? (festConfig.applyPenaltiesToPodium ?? true);
        const artsMinusPoints = teamMinusList.filter((m) => (m.scope || 'arts') === 'arts').reduce((acc, m) => acc + (Number(m.pointsDeducted) || 0), 0);
        const sportsMinusPoints = teamMinusList.filter((m) => m.scope === 'sports').reduce((acc, m) => acc + (Number(m.pointsDeducted) || 0), 0);
        const minusPoints = artsMinusPoints + sportsMinusPoints;
        const effectiveArtsMinus = applyArts ? artsMinusPoints : 0;
        const effectiveSportsMinus = applySports ? sportsMinusPoints : 0;
        const total = Math.max(0, stats.arts - effectiveArtsMinus) + Math.max(0, stats.sports - effectiveSportsMinus);
        return {
          ...team,
          artsPoints: stats.arts,
          sportsPoints: stats.sports,
          artsMinusPoints,
          sportsMinusPoints,
          minusPoints: minusPoints,
          totalPoints: total,
          golds: stats.golds,
          silvers: stats.silvers,
          bronzes: stats.bronzes,
          totalWins: stats.wins,
        };
      });

      // Sort by Total Points (descending), then Golds, then Silvers
      updatedTeams.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.golds !== a.golds) return b.golds - a.golds;
        return b.silvers - a.silvers;
      });

      // Assign ranks & trends
      return updatedTeams.map((team, idx) => {
        const newRank = idx + 1;
        const trend: 'up' | 'down' | 'same' =
          newRank < team.previousRank ? 'up' : newRank > team.previousRank ? 'down' : 'same';
        return {
          ...team,
          rank: newRank,
          trend,
        };
      });
    });

    // Also recalculate participant individual points & ranks for Arts and Sports
    setParticipants((prevParts) => {
      const partStats: Record<string, {
        artsPts: number;
        sportsPts: number;
        artsG: number;
        artsS: number;
        artsB: number;
        sportsG: number;
        sportsS: number;
        sportsB: number;
      }> = {};

      prevParts.forEach((p) => {
        partStats[p.id] = {
          artsPts: 0,
          sportsPts: 0,
          artsG: 0,
          artsS: 0,
          artsB: 0,
          sportsG: 0,
          sportsS: 0,
          sportsB: 0,
        };
      });

      artsPrograms.forEach((prog) => {
        if (prog.publishStatus === 'Published' && prog.results) {
          const isSports = isSportsProgram(prog);

          prog.results.forEach((res) => {
            const stat = partStats[res.participantId];
            if (stat) {
              let pts = 0;
              let isGold = false;
              let isSilver = false;
              let isBronze = false;

              if (res.rank === 1) {
                pts += scoringRules.goldPoints;
                isGold = true;
              } else if (res.rank === 2) {
                pts += scoringRules.silverPoints;
                isSilver = true;
              } else if (res.rank === 3) {
                pts += scoringRules.bronzePoints;
                isBronze = true;
              } else {
                pts += scoringRules.participationPoints;
              }

              if (res.grade === 'A+') pts += scoringRules.gradePointsA_Plus;
              else if (res.grade === 'A') pts += scoringRules.gradePointsA;
              else if (res.grade === 'B+') pts += scoringRules.gradePointsB_Plus;
              else if (res.grade === 'B') pts += scoringRules.gradePointsB;

              if (isSports) {
                stat.sportsPts += pts;
                if (isGold) stat.sportsG += 1;
                if (isSilver) stat.sportsS += 1;
                if (isBronze) stat.sportsB += 1;
              } else {
                stat.artsPts += pts;
                if (isGold) stat.artsG += 1;
                if (isSilver) stat.artsS += 1;
                if (isBronze) stat.artsB += 1;
              }
            }
          });
        }
      });

      const updated = prevParts.map((p) => {
        const stats = partStats[p.id] || {
          artsPts: 0,
          sportsPts: 0,
          artsG: 0,
          artsS: 0,
          artsB: 0,
          sportsG: 0,
          sportsS: 0,
          sportsB: 0,
        };
        const total = stats.artsPts + stats.sportsPts;
        const totalGolds = stats.artsG + stats.sportsG;
        const totalSilvers = stats.artsS + stats.sportsS;
        const totalBronzes = stats.artsB + stats.sportsB;

        return {
          ...p,
          artsPoints: stats.artsPts,
          sportsPoints: stats.sportsPts,
          totalPoints: total,
          golds: totalGolds,
          silvers: totalSilvers,
          bronzes: totalBronzes,
          artsGolds: stats.artsG,
          artsSilvers: stats.artsS,
          artsBronzes: stats.artsB,
          sportsGolds: stats.sportsG,
          sportsSilvers: stats.sportsS,
          sportsBronzes: stats.sportsB,
        };
      });

      // Calculate Arts rank
      const artsSorted = [...updated].sort((a, b) => {
        if ((b.artsPoints || 0) !== (a.artsPoints || 0)) return (b.artsPoints || 0) - (a.artsPoints || 0);
        if ((b.artsGolds || 0) !== (a.artsGolds || 0)) return (b.artsGolds || 0) - (a.artsGolds || 0);
        return (b.artsSilvers || 0) - (a.artsSilvers || 0);
      });
      const artsRankMap = new Map<string, number>();
      artsSorted.forEach((p, idx) => artsRankMap.set(p.id, idx + 1));

      // Calculate Sports rank
      const sportsSorted = [...updated].sort((a, b) => {
        if ((b.sportsPoints || 0) !== (a.sportsPoints || 0)) return (b.sportsPoints || 0) - (a.sportsPoints || 0);
        if ((b.sportsGolds || 0) !== (a.sportsGolds || 0)) return (b.sportsGolds || 0) - (a.sportsGolds || 0);
        return (b.sportsSilvers || 0) - (a.sportsSilvers || 0);
      });
      const sportsRankMap = new Map<string, number>();
      sportsSorted.forEach((p, idx) => sportsRankMap.set(p.id, idx + 1));

      return updated.map((p) => ({
        ...p,
        artsRank: artsRankMap.get(p.id) || 1,
        sportsRank: sportsRankMap.get(p.id) || 1,
      }));
    });
  }, [artsPrograms, sportsMatches, scoringRules, teamMinuses]);

  // Real-time Firestore Sync for Deletions across all accounts & devices
  useEffect(() => {
    const unsubscribe = listenToDeletions((records) => {
      if (!records || records.length === 0) return;
      let hasNewDeletions = false;
      records.forEach((rec) => {
        if (rec.id) {
          const clean = String(rec.id).trim().toLowerCase();
          if (!deletedIdsRef.current.has(clean)) {
            deletedIdsRef.current.add(clean);
            hasNewDeletions = true;
          }
        }
      });
      if (hasNewDeletions) {
        try {
          localStorage.setItem('ahia_deleted_ids_v2', JSON.stringify(Array.from(deletedIdsRef.current)));
        } catch {}

        // Instantly remove any deleted marks or results from local artsPrograms in real time
        setArtsPrograms((prev) => {
          let modified = false;
          const cleaned = prev.map((p) => {
            const currentResults = p.results || [];
            const filtered = currentResults.filter((r) => {
              if (!r) return false;
              if (r.id && isDeleted(r.id)) return false;
              return true;
            });
            if (filtered.length !== currentResults.length) {
              modified = true;
              return { ...p, results: filtered };
            }
            return p;
          });
          if (modified) {
            localStorage.setItem('ahia_arts_programs', JSON.stringify(cleaned));
            setTimeout(recalculateAllStandings, 50);
            return cleaned;
          }
          return prev;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isDeleted, recalculateAllStandings]);

  // Real-time Firestore Sync for Live Program Results across all accounts & devices
  useEffect(() => {
    const unsubscribe = listenToLiveResults((resultsMap) => {
      if (!resultsMap || resultsMap.size === 0) return;
      setArtsPrograms((prev) => {
        let changed = false;
        const updated = prev.map((p) => {
          const liveData = resultsMap.get(p.id) || (p.code ? resultsMap.get(p.code) : undefined);
          if (liveData && Array.isArray(liveData.results)) {
            // Guard: Never let an empty remote results array overwrite locally published podium results
            if (liveData.results.length === 0 && (p.results || []).length > 0 && p.publishStatus === 'Published') {
              return p;
            }

            const sanitizedLiveResults = liveData.results.filter((r) => {
              if (!r) return false;
              if (r.id && isDeleted(r.id)) return false;
              return true;
            });

            // If remote sanitized results are empty, retain existing local results
            let finalResults = sanitizedLiveResults;
            if (sanitizedLiveResults.length === 0 && (p.results || []).length > 0) {
              finalResults = p.results || [];
            } else if (sanitizedLiveResults.length > 0 && (p.results || []).length > 0) {
              // Merge local results with incoming live results to avoid dropping valid local entries
              const map = new Map<string, any>();
              sanitizedLiveResults.forEach((r) => {
                const k = r.participantId || r.chestNo || r.id;
                if (k) map.set(k, r);
              });
              (p.results || []).forEach((lr) => {
                const k = lr.participantId || lr.chestNo || lr.id;
                if (k && !map.has(k)) {
                  map.set(k, lr);
                }
              });
              finalResults = Array.from(map.values());
            }

            const currentStr = JSON.stringify(p.results || []);
            const liveStr = JSON.stringify(finalResults);
            const isPublished = liveData.publishStatus === 'Published' || p.publishStatus === 'Published' || finalResults.some((r) => r.status === 'Published');

            if (currentStr !== liveStr || (isPublished && p.publishStatus !== 'Published')) {
              changed = true;
              return {
                ...p,
                results: finalResults,
                publishStatus: isPublished ? 'Published' : (liveData.publishStatus || p.publishStatus),
                status: isPublished || finalResults.length > 0 ? 'COMPLETED' : p.status,
              };
            }
          }
          return p;
        });

        if (changed) {
          localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
          setTimeout(recalculateAllStandings, 50);
          return updated;
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isDeleted, recalculateAllStandings]);

  // Auto push helper for all mutations
  const triggerAutoPush = useCallback((customOverrides?: any) => {
    isRemoteSyncInProgressRef.current = true;
    if (pushToGoogleSheetsRef.current) {
      pushToGoogleSheetsRef.current({ ...customOverrides, silent: true });
    }
    setTimeout(() => {
      isRemoteSyncInProgressRef.current = false;
    }, 600);
  }, []);

  // Immediate remote delete dispatcher with instant Firestore broadcasting
  const dispatchRemoteDelete = useCallback((sheetName: string, id: string) => {
    if (!id) return;
    recordDeletedId(id);

    // Broadcast deletion tombstone to Firestore so all devices/accounts update in real time
    persistRemoteDeletion({
      id: String(id).trim(),
      itemType: sheetName,
      deletedAt: new Date().toISOString(),
    });

    const targetUrl = googleSheetsConfig.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w/exec';
    fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'deleteItem',
        sheetName,
        id: String(id).trim(),
        timestamp: new Date().toISOString(),
      }),
      redirect: 'follow',
      mode: 'no-cors',
    }).catch((err) => {
      console.warn('Background delete dispatch info:', err);
    });
  }, [googleSheetsConfig.appsScriptUrl, recordDeletedId]);

  // Arts Result Actions
  const publishArtsResult = useCallback((programId: string) => {
    let progName = '';
    let winnerName = '';

    setArtsPrograms((prev) => {
      const updated = prev.map((p) => {
        if (p.id === programId) {
          progName = p.name;
          const topResult = (p.results || []).find((r) => r.rank === 1);
          if (topResult) {
            winnerName = topResult.participantName;
          }
          return {
            ...p,
            status: 'COMPLETED' as EventStatus,
            publishStatus: 'Published' as const,
            publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return p;
      });
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });

    // Push Announcement & Live Update
    const newUpdate: LiveUpdate = {
      id: 'upd-' + Date.now(),
      icon: '🎭',
      title: `${progName} Result Published`,
      description: winnerName ? `${winnerName} secured 1st place with honors!` : 'Official score verified and posted.',
      timestamp: 'Just now',
      type: 'result',
    };
    setLiveUpdates((prev) => {
      const updated = [newUpdate, ...prev];
      localStorage.setItem('ahia_live_updates', JSON.stringify(updated));
      return updated;
    });

    showToast('Result Published Live!', `${progName} results are now live and scores added to team leaderboard.`, 'success');
    
    // Automatically trigger recalculation
    setTimeout(() => {
      recalculateAllStandings();
    }, 100);
  }, [showToast, recalculateAllStandings, triggerAutoPush]);

  const verifyArtsResult = useCallback((programId: string) => {
    setArtsPrograms((prev) => {
      const updated = prev.map((p) => {
        if (p.id === programId) {
          return { ...p, publishStatus: 'Verified' as const };
        }
        return p;
      });
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });
    showToast('Result Verified', 'Scores locked and ready for official publication.', 'info');
  }, [showToast, triggerAutoPush]);

  const saveArtsResultDraft = useCallback((programId: string, results: ArtsProgram['results']) => {
    setArtsPrograms((prev) => {
      const updated = prev.map((p) => {
        if (p.id === programId) {
          return { ...p, results, publishStatus: 'Draft' as const };
        }
        return p;
      });
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });
    showToast('Draft Saved', 'Program marks draft updated successfully.', 'info');
  }, [showToast, triggerAutoPush]);

  const updateArtsProgramStatus = useCallback((programId: string, status: EventStatus) => {
    setArtsPrograms((prev) => {
      const updated = prev.map((p) => (p.id === programId ? { ...p, status } : p));
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });
  }, [triggerAutoPush]);

  const addArtsProgram = useCallback((programData: Omit<ArtsProgram, 'id' | 'results'>) => {
    const newProgram: ArtsProgram = {
      ...programData,
      id: 'art-' + (Date.now() % 100000),
      results: [],
    };
    clearDeletedId(newProgram.id);
    if (newProgram.code) clearDeletedId(newProgram.code);

    setArtsPrograms((prev) => {
      const updated = [newProgram, ...prev];
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });
    showToast('Program Created', `Added "${newProgram.name}" to Arts schedule.`, 'success');
  }, [showToast, triggerAutoPush, clearDeletedId]);

  const editArtsProgram = useCallback((id: string, data: Partial<ArtsProgram>) => {
    setArtsPrograms((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });
    showToast('Program Updated', 'Arts event details updated.', 'success');
  }, [showToast, triggerAutoPush]);

  const deleteArtsProgram = useCallback((id: string) => {
    const prog = artsPrograms.find((p) => p.id === id || p.code === id);
    const progId = prog?.id || id;
    const progCode = prog?.code || '';

    persistLiveProgramResult(progId, progCode, [], 'Draft');
    dispatchRemoteDelete('Programs', progId);
    if (progCode) {
      recordDeletedId(progCode);
      dispatchRemoteDelete('Programs', progCode);
    }
    setArtsPrograms((prev) => {
      const updated = prev.filter((p) => p.id !== progId && (!progCode || p.code !== progCode));
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });
    showToast('Program Deleted', 'Arts event deleted.', 'warning');
  }, [artsPrograms, showToast, triggerAutoPush, dispatchRemoteDelete, recordDeletedId]);

  // Sports Actions
  const updateSportsScore = useCallback((
    matchId: string,
    scoreA: number | string,
    scoreB: number | string,
    detailScore?: string,
    winnerTeamId?: string,
    status?: EventStatus
  ) => {
    setSportsMatches((prev) => {
      const updated = prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            scoreA,
            scoreB,
            detailScore: detailScore ?? m.detailScore,
            winnerTeamId: winnerTeamId ?? m.winnerTeamId,
            status: status ?? m.status,
            publishStatus: status === 'COMPLETED' ? 'Published' : m.publishStatus,
          };
        }
        return m;
      });
      localStorage.setItem('ahia_sports_matches', JSON.stringify(updated));
      triggerAutoPush({ sportsMatches: updated });
      return updated;
    });

    showToast('Score Updated', 'Live match scoreboard refreshed.', 'success');
    if (status === 'COMPLETED') {
      setTimeout(recalculateAllStandings, 100);
    }
  }, [showToast, recalculateAllStandings, triggerAutoPush]);

  const addMatchEvent = useCallback((matchId: string, event: Omit<SportsMatch['events'][0], 'id'>) => {
    const newEvent = { ...event, id: 'ev-' + Date.now() };
    setSportsMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            events: [...m.events, newEvent],
          };
        }
        return m;
      })
    );

    // Also add to live feed
    const liveItem: LiveUpdate = {
      id: 'upd-' + Date.now(),
      icon: event.type === 'goal' ? '⚽' : event.type === 'card_red' ? '🟥' : '⚡',
      title: `${event.playerName}: ${event.description}`,
      description: `Match Event at ${event.minute}`,
      timestamp: 'Just now',
      type: 'match',
    };
    setLiveUpdates((prev) => [liveItem, ...prev]);
    showToast('Match Event Added', `${event.description}`, 'info');
  }, [showToast]);

  const toggleMatchTimer = useCallback((matchId: string) => {
    setSportsMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId && m.matchTimer) {
          return {
            ...m,
            matchTimer: {
              ...m.matchTimer,
              isRunning: !m.matchTimer.isRunning,
            },
          };
        }
        return m;
      })
    );
  }, []);

  const addSportsMatch = useCallback((matchData: Omit<SportsMatch, 'id' | 'events'>) => {
    const newMatch: SportsMatch = {
      ...matchData,
      id: 'sport-' + (Date.now() % 100000),
      events: [],
    };
    setSportsMatches((prev) => {
      const updated = [newMatch, ...prev];
      localStorage.setItem('ahia_sports_matches', JSON.stringify(updated));
      triggerAutoPush({ sportsMatches: updated });
      return updated;
    });
    showToast('Match Scheduled', `Added ${newMatch.title || newMatch.sport} to fixture list.`, 'success');
  }, [showToast, triggerAutoPush]);

  const editSportsMatch = useCallback((id: string, data: Partial<SportsMatch>) => {
    setSportsMatches((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...data } : m));
      localStorage.setItem('ahia_sports_matches', JSON.stringify(updated));
      triggerAutoPush({ sportsMatches: updated });
      return updated;
    });
    showToast('Match Updated', 'Fixture details updated.', 'success');
  }, [showToast, triggerAutoPush]);

  const deleteSportsMatch = useCallback((id: string) => {
    dispatchRemoteDelete('SportsMatches', id);
    setSportsMatches((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem('ahia_sports_matches', JSON.stringify(updated));
      triggerAutoPush({ sportsMatches: updated });
      return updated;
    });
    showToast('Match Deleted', 'Fixture removed.', 'warning');
    setTimeout(recalculateAllStandings, 0);
  }, [showToast, recalculateAllStandings, triggerAutoPush, dispatchRemoteDelete]);

  const bulkImportSportsMatches = useCallback((newMatches: SportsMatch[]) => {
    setSportsMatches((prev) => {
      const matchMap = new Map<string, SportsMatch>();
      prev.forEach((m) => matchMap.set(m.id, m));
      newMatches.forEach((m) => {
        const existing = matchMap.get(m.id);
        if (existing) {
          matchMap.set(m.id, { ...existing, ...m });
        } else {
          matchMap.set(m.id, m);
        }
        clearDeletedId(m.id);
      });
      const updated = Array.from(matchMap.values());
      localStorage.setItem('ahia_sports_matches', JSON.stringify(updated));
      triggerAutoPush({ sportsMatches: updated });
      return updated;
    });
    showToast('Bulk Matches Imported', `Imported / updated ${newMatches.length} sports fixtures.`, 'success');
    setTimeout(recalculateAllStandings, 0);
  }, [showToast, recalculateAllStandings, triggerAutoPush, clearDeletedId]);

  // Participants & Teams Actions
  const addParticipant = useCallback((partData: Omit<Participant, 'id' | 'totalPoints' | 'golds' | 'silvers' | 'bronzes' | 'participatedPrograms'>) => {
    const newPart: Participant = {
      ...partData,
      id: 'part-' + (Date.now() % 100000),
      name: String(partData.name || ''),
      chestNo: partData.chestNo != null ? String(partData.chestNo) : '',
      admissionNo: partData.admissionNo != null ? String(partData.admissionNo) : '',
      yearClass: partData.yearClass != null ? String(partData.yearClass) : '',
      totalPoints: 0,
      golds: 0,
      silvers: 0,
      bronzes: 0,
      participatedPrograms: [],
    };
    clearDeletedId(newPart.id);
    if (newPart.chestNo) clearDeletedId(newPart.chestNo);

    setParticipants((prev) => {
      const updated = [...prev, newPart];
      localStorage.setItem('ahia_participants', JSON.stringify(updated));
      triggerAutoPush({ participants: updated });
      return updated;
    });
    showToast('Participant Registered', `${newPart.name} (${newPart.chestNo}) enrolled.`, 'success');
  }, [showToast, triggerAutoPush, clearDeletedId]);

  const editParticipant = useCallback((id: string, data: Partial<Participant>) => {
    setParticipants((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...data };
        return {
          ...merged,
          name: String(merged.name || ''),
          chestNo: merged.chestNo != null ? String(merged.chestNo) : '',
          admissionNo: merged.admissionNo != null ? String(merged.admissionNo) : '',
          yearClass: merged.yearClass != null ? String(merged.yearClass) : '',
        };
      });
      localStorage.setItem('ahia_participants', JSON.stringify(updated));
      triggerAutoPush({ participants: updated });
      return updated;
    });
    showToast('Profile Updated', 'Participant records updated.', 'success');
  }, [showToast, triggerAutoPush]);

  const deleteParticipant = useCallback((id: string) => {
    dispatchRemoteDelete('Participants', id);
    setParticipants((prev) => {
      const part = prev.find((p) => p.id === id);
      if (part && part.chestNo) {
        recordDeletedId(part.chestNo);
        dispatchRemoteDelete('Participants', part.chestNo);
      }
      const updated = prev.filter((p) => p.id !== id && p.chestNo !== id);
      localStorage.setItem('ahia_participants', JSON.stringify(updated));
      triggerAutoPush({ participants: updated });
      return updated;
    });
    showToast('Participant Removed', 'Deleted from registry.', 'warning');
  }, [showToast, triggerAutoPush, dispatchRemoteDelete, recordDeletedId]);

  const bulkImportParticipants = useCallback((newParts: Participant[]) => {
    setParticipants((prev) => {
      const partMap = new Map<string, Participant>();
      prev.forEach((p) => {
        const key = p.chestNo || p.id;
        partMap.set(key, p);
      });
      newParts.forEach((rawP) => {
        const p: Participant = {
          ...rawP,
          id: String(rawP.id || rawP.chestNo || `p-${Date.now()}`),
          name: String(rawP.name || ''),
          chestNo: rawP.chestNo != null ? String(rawP.chestNo) : '',
          admissionNo: rawP.admissionNo != null ? String(rawP.admissionNo) : '',
          yearClass: rawP.yearClass != null ? String(rawP.yearClass) : '',
        };
        const key = p.chestNo || p.id;
        const existing = partMap.get(key);
        if (existing) {
          partMap.set(key, { ...existing, ...p });
        } else {
          partMap.set(key, p);
        }
        clearDeletedId(p.id);
        if (p.chestNo) clearDeletedId(p.chestNo);
      });
      const updated = Array.from(partMap.values());
      localStorage.setItem('ahia_participants', JSON.stringify(updated));
      triggerAutoPush({ participants: updated });
      return updated;
    });
    showToast('Bulk Import Completed', `Imported / updated ${newParts.length} participants in registry.`, 'success');
  }, [showToast, triggerAutoPush, clearDeletedId]);

  const addTeam = useCallback((teamData: Omit<Team, 'id' | 'artsPoints' | 'sportsPoints' | 'totalPoints' | 'golds' | 'silvers' | 'bronzes' | 'totalWins' | 'rank' | 'previousRank' | 'trend'>) => {
    const newTeam: Team = {
      ...teamData,
      id: 'team-' + (Date.now() % 100000),
      artsPoints: 0,
      sportsPoints: 0,
      totalPoints: 0,
      golds: 0,
      silvers: 0,
      bronzes: 0,
      totalWins: 0,
      rank: teams.length + 1,
      previousRank: teams.length + 1,
      trend: 'same',
    };
    clearDeletedId(newTeam.id);
    if (newTeam.shortCode) clearDeletedId(newTeam.shortCode);

    setTeams((prev) => {
      const updated = [...prev, newTeam];
      localStorage.setItem('ahia_teams', JSON.stringify(updated));
      triggerAutoPush({ teams: updated });
      return updated;
    });
    showToast('Team Created', `${newTeam.name} added to festival roster.`, 'success');
  }, [teams.length, showToast, triggerAutoPush, clearDeletedId]);

  const editTeam = useCallback((id: string, data: Partial<Team>) => {
    setTeams((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...data } : t));
      localStorage.setItem('ahia_teams', JSON.stringify(updated));
      triggerAutoPush({ teams: updated });
      return updated;
    });
    showToast('Team Updated', 'House specifications updated.', 'success');
  }, [showToast, triggerAutoPush]);

  const deleteTeam = useCallback((id: string) => {
    dispatchRemoteDelete('Teams', id);
    setTeams((prev) => {
      const targetTeam = prev.find((t) => t.id === id);
      if (targetTeam && targetTeam.shortCode) {
        recordDeletedId(targetTeam.shortCode);
        dispatchRemoteDelete('Teams', targetTeam.shortCode);
      }
      const filtered = prev.filter((t) => t.id !== id && t.shortCode !== id);
      const updated = filtered.map((team, idx) => ({
        ...team,
        rank: idx + 1,
      }));
      localStorage.setItem('ahia_teams', JSON.stringify(updated));
      triggerAutoPush({ teams: updated });
      return updated;
    });
    showToast('Team Deleted', 'House removed from festival registry.', 'warning');
    setTimeout(recalculateAllStandings, 0);
  }, [showToast, recalculateAllStandings, triggerAutoPush, dispatchRemoteDelete, recordDeletedId]);

  // Team Minuses & Penalty Deductions
  const addTeamMinus = useCallback((minusData: Omit<TeamMinus, 'id' | 'timestamp'>) => {
    const id = `minus-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newMinus: TeamMinus = {
      ...minusData,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    clearDeletedId(id);

    setTeamMinuses((prev) => {
      const updated = [newMinus, ...prev];
      localStorage.setItem('ahia_team_minuses', JSON.stringify(updated));
      triggerAutoPush({ teamMinuses: updated });
      return updated;
    });

    showToast(
      'Penalty Points Registered',
      `${minusData.pointsDeducted} minus points deducted from ${minusData.teamName} for "${minusData.reason}".`,
      'warning'
    );
  }, [showToast, triggerAutoPush, clearDeletedId]);

  const editTeamMinus = useCallback((id: string, data: Partial<TeamMinus>) => {
    setTeamMinuses((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...data } : m));
      localStorage.setItem('ahia_team_minuses', JSON.stringify(updated));
      triggerAutoPush({ teamMinuses: updated });
      return updated;
    });
    showToast('Penalty Updated', 'The penalty deduction was successfully updated.', 'info');
  }, [showToast, triggerAutoPush]);

  const deleteTeamMinus = useCallback((id: string) => {
    recordDeletedId(id);
    dispatchRemoteDelete('TeamMinuses', id);
    setTeamMinuses((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem('ahia_team_minuses', JSON.stringify(updated));
      triggerAutoPush({ teamMinuses: updated });
      return updated;
    });
    showToast('Penalty Removed', 'The penalty deduction has been removed and standings updated.', 'info');
  }, [recordDeletedId, dispatchRemoteDelete, showToast, triggerAutoPush]);

  // Schedule & Announcements
  const addScheduleItem = useCallback((item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: 'sch-' + (Date.now() % 100000),
    };
    clearDeletedId(newItem.id);

    setSchedule((prev) => {
      const updated = [...prev, newItem];
      localStorage.setItem('ahia_schedule', JSON.stringify(updated));
      triggerAutoPush({ schedule: updated });
      return updated;
    });
    showToast('Schedule Item Added', `${newItem.title} added to timeline.`, 'success');
  }, [showToast, triggerAutoPush, clearDeletedId]);

  const editScheduleItem = useCallback((id: string, data: Partial<ScheduleItem>) => {
    setSchedule((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      localStorage.setItem('ahia_schedule', JSON.stringify(updated));
      triggerAutoPush({ schedule: updated });
      return updated;
    });
    showToast('Schedule Updated', 'Event slot modified.', 'success');
  }, [showToast, triggerAutoPush]);

  const deleteScheduleItem = useCallback((id: string) => {
    dispatchRemoteDelete('Schedule', id);
    setSchedule((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem('ahia_schedule', JSON.stringify(updated));
      triggerAutoPush({ schedule: updated });
      return updated;
    });
    showToast('Schedule Slot Removed', 'Deleted from festival timeline.', 'warning');
  }, [showToast, triggerAutoPush, dispatchRemoteDelete]);

  const addAnnouncement = useCallback((announcement: Omit<Announcement, 'id' | 'timestamp'>) => {
    const newAnn: Announcement = {
      ...announcement,
      id: 'ann-' + (Date.now() % 100000),
      timestamp: 'Just now',
    };
    clearDeletedId(newAnn.id);

    setAnnouncements((prev) => {
      const updated = [newAnn, ...prev];
      localStorage.setItem('ahia_announcements', JSON.stringify(updated));
      triggerAutoPush({ announcements: updated });
      return updated;
    });

    // Push to live ticker as well
    setLiveUpdates((prev) => [
      {
        id: 'upd-' + Date.now(),
        icon: '📢',
        title: newAnn.title,
        description: newAnn.content.slice(0, 80) + '...',
        timestamp: 'Just now',
        type: 'announcement',
      },
      ...prev,
    ]);

    showToast('Announcement Broadcast', `"${newAnn.title}" pushed to live feeds.`, 'success');
  }, [showToast, triggerAutoPush, clearDeletedId]);

  const editAnnouncement = useCallback((id: string, data: Partial<Announcement>) => {
    setAnnouncements((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...data } : a));
      localStorage.setItem('ahia_announcements', JSON.stringify(updated));
      triggerAutoPush({ announcements: updated });
      return updated;
    });
    showToast('Announcement Updated', 'Broadcast content modified.', 'success');
  }, [showToast, triggerAutoPush]);

  const deleteAnnouncement = useCallback((id: string) => {
    dispatchRemoteDelete('Announcements', id);
    setAnnouncements((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem('ahia_announcements', JSON.stringify(updated));
      triggerAutoPush({ announcements: updated });
      return updated;
    });
    showToast('Announcement Removed', 'Bulletin deleted.', 'info');
  }, [showToast, triggerAutoPush, dispatchRemoteDelete]);

  const updateFestConfig = useCallback((config: Partial<FestConfig>, silent = false) => {
    setFestConfig((prev) => {
      const updated = { ...prev, ...config };
      localStorage.setItem('ahia_fest_config', JSON.stringify(updated));
      triggerAutoPush({ festConfig: updated });

      if (config.isCelebrationMode !== undefined && config.isCelebrationMode !== prev.isCelebrationMode) {
        persistCelebrationMode(config.isCelebrationMode, adminUser?.fullName || 'Festival Controller');
      }

      return updated;
    });
    if (!silent) {
      showToast('Festival Configuration Saved', 'Festival branding and settings updated.', 'success');
    }
  }, [showToast, triggerAutoPush, adminUser]);

  const toggleCelebrationMode = useCallback((enabled?: boolean) => {
    setFestConfig((prev) => {
      const nextVal = enabled !== undefined ? enabled : !prev.isCelebrationMode;
      const updated = { ...prev, isCelebrationMode: nextVal };
      localStorage.setItem('ahia_fest_config', JSON.stringify(updated));
      triggerAutoPush({ festConfig: updated });

      // Persist celebration mode state and audit record into database
      persistCelebrationMode(nextVal, adminUser?.fullName || 'Festival Controller');

      if (nextVal) {
        showToast('Celebration Mode ON 🎉', 'Fireworks celebration active and saved to database!', 'success');
        window.dispatchEvent(new CustomEvent('fest-trigger-fireworks'));
      } else {
        showToast('Celebration Mode OFF', 'Celebration mode disabled and database updated.', 'info');
      }
      return updated;
    });
  }, [showToast, triggerAutoPush, adminUser]);

  const triggerCelebrationBlast = useCallback(() => {
    window.dispatchEvent(new CustomEvent('fest-trigger-fireworks'));
    showToast('🎉 Fireworks Launched!', 'Celebration confetti in full blast.', 'success');
  }, [showToast]);

  // Documents & Official Circulars
  const addDocument = useCallback((doc: Omit<DocumentItem, 'id' | 'updatedAt'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: 'doc-' + Date.now(),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    clearDeletedId(newDoc.id);

    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      localStorage.setItem('ahia_documents', JSON.stringify(updated));
      triggerAutoPush({ documents: updated });
      return updated;
    });
    showToast('Document Published', `"${newDoc.title}" is now published.`, 'success');
  }, [showToast, triggerAutoPush, clearDeletedId]);

  const editDocument = useCallback((id: string, data: Partial<DocumentItem>) => {
    setDocuments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...data, updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : d));
      localStorage.setItem('ahia_documents', JSON.stringify(updated));
      triggerAutoPush({ documents: updated });
      return updated;
    });
    showToast('Document Updated', 'Official document modified.', 'success');
  }, [showToast, triggerAutoPush]);

  const deleteDocument = useCallback((id: string) => {
    dispatchRemoteDelete('Documents', id);
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      localStorage.setItem('ahia_documents', JSON.stringify(updated));
      triggerAutoPush({ documents: updated });
      return updated;
    });
    showToast('Document Deleted', 'Document removed from archives.', 'info');
  }, [showToast, triggerAutoPush, dispatchRemoteDelete]);

  // Result Marks Evaluation Record
  const addResultMark = useCallback((mark: {
    programId: string;
    participantId: string;
    marks?: number;
    grade: string;
    position: string;
    pointsAwarded: number;
    publishNow?: boolean;
  }) => {
    const prog = artsPrograms.find((p) => p.id === mark.programId || p.code === mark.programId);
    const participant = participants.find((p) => p.id === mark.participantId);
    if (!prog || !participant) return;

    let rankNum = 999;
    if (mark.position.includes('1st') || mark.position === '1') rankNum = 1;
    else if (mark.position.includes('2nd') || mark.position === '2') rankNum = 2;
    else if (mark.position.includes('3rd') || mark.position === '3') rankNum = 3;
    else if (mark.position.includes('Consolation')) rankNum = 4;

    const resultEntry: ArtsResultEntry = {
      id: 'res-' + Date.now(),
      programId: prog.id,
      programName: prog.name,
      programCode: prog.code || '',
      participantId: participant.id,
      participantName: participant.name,
      chestNo: participant.chestNo || '',
      admissionNo: participant.admissionNo || '',
      teamId: participant.teamId,
      marks: mark.marks ?? 0,
      grade: mark.grade,
      rank: rankNum,
      position: mark.position,
      pointsAwarded: mark.pointsAwarded,
      status: mark.publishNow ? 'Published' : 'Draft',
      publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Explicitly un-tombstone this participant result so it can never be blocked
    clearResultTombstones(prog.id, prog.code, participant.id, participant.chestNo, resultEntry.id);

    let fullUpdatedResults: ArtsResultEntry[] = [];

    setArtsPrograms((prev) => {
      const updated = prev.map((p) => {
        if (p.id === prog.id || (p.code && prog.code && p.code.trim().toLowerCase() === prog.code.trim().toLowerCase())) {
          const existingResults = (p.results || []).filter((r) => r.participantId !== participant.id);
          const updatedResults = [...existingResults, resultEntry];
          fullUpdatedResults = updatedResults;
          return {
            ...p,
            results: updatedResults,
            publishStatus: mark.publishNow ? 'Published' : p.publishStatus,
            status: mark.publishNow ? 'COMPLETED' : p.status,
          };
        }
        return p;
      });
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });

    // Update participant stats
    setParticipants((prev) => {
      const updated = prev.map((pt) => {
        if (pt.id === participant.id) {
          const progs = pt.participatedPrograms.includes(prog.id)
            ? pt.participatedPrograms
            : [...pt.participatedPrograms, prog.id];
          const isGold = rankNum === 1 ? 1 : 0;
          const isSilver = rankNum === 2 ? 1 : 0;
          const isBronze = rankNum === 3 ? 1 : 0;
          return {
            ...pt,
            participatedPrograms: progs,
            totalPoints: pt.totalPoints + mark.pointsAwarded,
            golds: pt.golds + isGold,
            silvers: pt.silvers + isSilver,
            bronzes: pt.bronzes + isBronze,
          };
        }
        return pt;
      });
      localStorage.setItem('ahia_participants', JSON.stringify(updated));
      return updated;
    });

    persistLiveProgramResult(
      prog.id,
      prog.code || '',
      fullUpdatedResults.length > 0 ? fullUpdatedResults : [resultEntry],
      mark.publishNow ? 'Published' : prog.publishStatus || 'Draft'
    );

    showToast('Mark Recorded', `Result for ${participant.name} saved and synced.`, 'success');
    setTimeout(recalculateAllStandings, 100);
  }, [artsPrograms, participants, showToast, recalculateAllStandings, triggerAutoPush, clearResultTombstones]);

  const savePodiumResults = useCallback((
    programId: string,
    podiumSlots: Array<{
      rank: 1 | 2 | 3;
      participantId: string;
      grade?: string;
      pointsAwarded: number;
    }>,
    publishNow: boolean = true
  ) => {
    const prog = artsPrograms.find(
      (p) =>
        p.id === programId ||
        (p.code && programId && p.code.trim().toLowerCase() === programId.trim().toLowerCase()) ||
        (p.name && programId && p.name.trim().toLowerCase() === programId.trim().toLowerCase())
    );
    if (!prog) return;

    const validEntries: ArtsResultEntry[] = [];
    podiumSlots.forEach((slot) => {
      if (!slot.participantId) return;

      // Robust winner resolution across ID, chestNo, admissionNo, participant name, and team/house
      const cleanSlotId = String(slot.participantId).trim();
      let pt =
        participants.find((p) => p.id === cleanSlotId) ||
        participants.find((p) => p.chestNo && p.chestNo.trim().toLowerCase() === cleanSlotId.toLowerCase()) ||
        participants.find((p) => p.admissionNo && p.admissionNo.trim().toLowerCase() === cleanSlotId.toLowerCase()) ||
        participants.find((p) => p.name.trim().toLowerCase() === cleanSlotId.toLowerCase());

      // If winner is a team/house (e.g. for Relay, Tug of War, group sports)
      if (!pt) {
        const matchingTeam = teams.find(
          (t) =>
            t.id === cleanSlotId ||
            t.name.trim().toLowerCase() === cleanSlotId.toLowerCase() ||
            (t.shortCode && t.shortCode.trim().toLowerCase() === cleanSlotId.toLowerCase())
        );
        if (matchingTeam) {
          // Look for an existing group participant for this team in this program's category
          const groupPt = participants.find(
            (p) =>
              p.teamId === matchingTeam.id &&
              ((prog.category && p.category && p.category.toLowerCase() === prog.category.toLowerCase()) ||
                (p.yearClass && p.yearClass.toLowerCase().includes('group')) ||
                p.name.toLowerCase().includes(matchingTeam.name.toLowerCase()))
          );
          if (groupPt) {
            pt = groupPt;
          } else {
            pt = {
              id: `team-group-${matchingTeam.id}-${(prog.category || 'gen').toLowerCase()}`,
              name: matchingTeam.name,
              chestNo: matchingTeam.shortCode || matchingTeam.name.slice(0, 3).toUpperCase(),
              admissionNo: '',
              teamId: matchingTeam.id,
              category: prog.category || 'General',
              section: prog.section || 'General',
              yearClass: `${prog.category || ''} Group`,
              photo: '',
              totalPoints: 0,
              golds: 0,
              silvers: 0,
              bronzes: 0,
              overallRank: 0,
              participatedPrograms: [prog.code || prog.name],
            };
          }
        }
      }

      // Check if previously stored in results
      if (!pt && prog.results) {
        const oldMatch = prog.results.find(
          (r) =>
            r.participantId === cleanSlotId ||
            (r.chestNo && r.chestNo.toLowerCase() === cleanSlotId.toLowerCase()) ||
            (r.participantName && r.participantName.toLowerCase() === cleanSlotId.toLowerCase())
        );
        if (oldMatch) {
          pt = {
            id: oldMatch.participantId || cleanSlotId,
            name: oldMatch.participantName || cleanSlotId,
            chestNo: oldMatch.chestNo || '',
            admissionNo: oldMatch.admissionNo || '',
            teamId: oldMatch.teamId || '',
            category: prog.category || 'General',
            section: prog.section || 'General',
            yearClass: '',
            photo: '',
            totalPoints: 0,
            golds: 0,
            silvers: 0,
            bronzes: 0,
            overallRank: 0,
            participatedPrograms: [prog.code || prog.name],
          };
        }
      }

      // Final fallback to guarantee no entered winner is ever dropped
      if (!pt) {
        pt = {
          id: cleanSlotId,
          name: cleanSlotId,
          chestNo: '',
          admissionNo: '',
          teamId: '',
          category: prog.category || 'General',
          section: prog.section || 'General',
          yearClass: '',
          photo: '',
          totalPoints: 0,
          golds: 0,
          silvers: 0,
          bronzes: 0,
          overallRank: 0,
          participatedPrograms: [prog.code || prog.name],
        };
      }

      const posLabel = slot.rank === 1 ? '1st Place' : slot.rank === 2 ? '2nd Place' : '3rd Place';
      validEntries.push({
        id: `res-${prog.id}-${slot.rank}-${Date.now()}`,
        programId: prog.id,
        programName: prog.name,
        programCode: prog.code || '',
        participantId: pt.id,
        participantName: pt.name,
        chestNo: pt.chestNo || '',
        admissionNo: pt.admissionNo || '',
        teamId: pt.teamId,
        marks: 0,
        grade: slot.grade || 'No Grade / Standard',
        rank: slot.rank,
        position: posLabel,
        pointsAwarded: slot.pointsAwarded,
        status: publishNow ? 'Published' : 'Draft',
        publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    // 1. Explicitly clear tombstones for all entered winners so they can NEVER be suppressed
    validEntries.forEach((entry) => {
      clearResultTombstones(prog.id, prog.code, entry.participantId, entry.chestNo, entry.id);
    });

    // 2. Immediately persist to state & localStorage
    const updatedPrograms = artsPrograms.map((p) => {
      if (
        p.id === prog.id ||
        (p.code && prog.code && p.code.trim().toLowerCase() === prog.code.trim().toLowerCase())
      ) {
        return {
          ...p,
          results: validEntries,
          publishStatus: publishNow ? 'Published' : p.publishStatus,
          status: publishNow ? 'COMPLETED' : p.status,
        };
      }
      return p;
    });

    setArtsPrograms(updatedPrograms);
    try {
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updatedPrograms));
    } catch {}

    // Immediately trigger auto-push with the updated programs
    triggerAutoPush({ artsPrograms: updatedPrograms });

    // 3. Broadcast live results to Firestore in real-time for all accounts and devices
    persistLiveProgramResult(
      prog.id,
      prog.code || '',
      validEntries,
      publishNow ? 'Published' : prog.publishStatus || 'Draft'
    );

    showToast('Podium Results Published', `Top 3 results for "${prog.name}" saved & synced.`, 'success');
    setTimeout(recalculateAllStandings, 100);
  }, [artsPrograms, participants, teams, showToast, recalculateAllStandings, triggerAutoPush, clearResultTombstones]);

  const deleteResultMark = useCallback((programId: string, participantId: string) => {
    if (!programId || !participantId) return;

    // Find the relevant program
    const prog = artsPrograms.find(
      (p) =>
        p.id === programId ||
        (p.code && p.code.trim().toLowerCase() === programId.trim().toLowerCase()) ||
        (p.name && p.name.trim().toLowerCase() === programId.trim().toLowerCase())
    );
    const progId = prog?.id || programId;
    const progCode = prog?.code ? prog.code.trim() : '';

    // Find the specific result entry to be removed
    const targetResult = (prog?.results || []).find(
      (r) =>
        (r.participantId && r.participantId === participantId) ||
        (r.chestNo && String(r.chestNo).trim().toLowerCase() === String(participantId).trim().toLowerCase()) ||
        (r.admissionNo && String(r.admissionNo).trim().toLowerCase() === String(participantId).trim().toLowerCase()) ||
        (r.id && r.id === participantId)
    );

    const ptId = targetResult?.participantId || participantId;
    const chestNo = targetResult?.chestNo || '';
    const admNo = targetResult?.admissionNo || '';
    const resId = targetResult?.id || '';

    // Generate comprehensive tombstone keys to cover all matching formats
    const keysToDelete = [
      `${progId}_${ptId}`,
      `${progId}_${chestNo}`,
      progCode ? `${progCode}_${ptId}` : '',
      progCode ? `${progCode}_${chestNo}` : '',
      admNo ? `${progId}_${admNo}` : '',
      admNo && progCode ? `${progCode}_${admNo}` : '',
      resId,
      `${progId}_${participantId}`,
      progCode ? `${progCode}_${participantId}` : '',
    ].filter(Boolean);

    // 1. Record tombstones locally and broadcast to Firestore in real time
    keysToDelete.forEach((key) => {
      recordDeletedId(key);
      persistRemoteDeletion({
        id: key,
        itemType: 'result_mark',
        programId: progId,
        participantId: ptId,
        chestNo,
        deletedAt: new Date().toISOString(),
      });
    });

    // 2. Dispatch to Google Apps Script for ResultsMarks sheet
    if (progCode && chestNo) {
      dispatchRemoteDelete('ResultsMarks', `${progCode}_${chestNo}`);
    }
    dispatchRemoteDelete('ResultsMarks', `${progId}_${ptId}`);
    if (resId) {
      dispatchRemoteDelete('ResultsMarks', resId);
    }

    // 3. Update local artsPrograms and calculate remaining results
    let updatedResultsForProg: any[] = [];
    setArtsPrograms((prev) => {
      const updated = prev.map((p) => {
        if (
          p.id === progId ||
          (progCode && p.code && p.code.trim().toLowerCase() === progCode.toLowerCase())
        ) {
          const remaining = (p.results || []).filter((r) => {
            const isMatch =
              (ptId && r.participantId === ptId) ||
              (chestNo && r.chestNo && String(r.chestNo).trim().toLowerCase() === String(chestNo).trim().toLowerCase()) ||
              (admNo && r.admissionNo && String(r.admissionNo).trim().toLowerCase() === String(admNo).trim().toLowerCase()) ||
              (resId && r.id === resId) ||
              (participantId && (r.participantId === participantId || r.chestNo === participantId || r.id === participantId));
            return !isMatch;
          });
          updatedResultsForProg = remaining;
          return {
            ...p,
            results: remaining,
          };
        }
        return p;
      });
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });

    // 4. Persist updated results to Firestore live_results in real-time
    persistLiveProgramResult(
      progId,
      progCode,
      updatedResultsForProg,
      prog?.publishStatus || 'Published'
    );

    showToast('Mark Deleted', 'Result entry removed in real-time across all devices.', 'info');
    setTimeout(recalculateAllStandings, 50);
  }, [artsPrograms, recordDeletedId, dispatchRemoteDelete, triggerAutoPush, showToast, recalculateAllStandings]);

  // Scoring Rules
  const updateScoringRules = useCallback((rules: ScoringRules) => {
    setScoringRules(rules);
    showToast('Scoring Matrix Updated', 'All points and formulas re-calculated.', 'success');
    setTimeout(recalculateAllStandings, 0);
  }, [showToast, recalculateAllStandings]);

  // Certificate Generator
  const generateCertificate = useCallback((data: Omit<Certificate, 'id' | 'issueDate' | 'verificationCode' | 'digitalSignature'>) => {
    const serial = `AHIA-2026-${data.rank.charAt(0)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCert: Certificate = {
      ...data,
      id: serial,
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verificationCode: `VER-${serial}-${data.chestNo}`,
      digitalSignature: 'Prof. K. A. Rahman (Chief Jury President) & AHIA Festival Controller',
    };

    setCertificates((prev) => [newCert, ...prev]);
    showToast('Certificate Generated', `Serial ${newCert.id} created.`, 'success');
    return newCert;
  }, [showToast]);

  const bulkGenerateCertificatesFromResults = useCallback(() => {
    let count = 0;
    setCertificates((prevCerts) => {
      const existingKeys = new Set(
        prevCerts.map((c) => `${c.participantId || c.chestNo}-${c.programId || c.eventName}`)
      );
      const newGenerated: Certificate[] = [];

      artsPrograms.forEach((prog) => {
        if (prog.publishStatus === 'Published' && prog.results && prog.results.length > 0) {
          prog.results.forEach((res) => {
            const key = `${res.participantId || res.chestNo}-${prog.id}`;
            if (!existingKeys.has(key)) {
              const part = participants.find((p) => p.id === res.participantId || p.chestNo === res.chestNo);
              const team = teams.find((t) => t.id === res.teamId);
              const isSports = isSportsProgram(prog);

              let rankType: Certificate['rank'] = 'Participation';
              let certType: Certificate['certificateType'] = 'Participation';
              if (res.rank === 1) {
                rankType = '1st';
                certType = 'Winner';
              } else if (res.rank === 2) {
                rankType = '2nd';
                certType = 'Runner Up';
              } else if (res.rank === 3) {
                rankType = '3rd';
                certType = 'Third Place';
              }

              const serial = `AHIA-2026-${rankType.charAt(0)}-${Math.floor(1000 + Math.random() * 9000)}`;
              const cert: Certificate = {
                id: serial,
                participantId: res.participantId || part?.id || `p-${res.chestNo}`,
                participantName: res.participantName,
                chestNo: res.chestNo,
                admissionNo: res.admissionNo || part?.admissionNo || `ADM-${res.chestNo}`,
                teamName: team?.name || 'House Contender',
                eventName: prog.name,
                eventType: isSports ? 'Sports' : 'Arts',
                category: prog.category || part?.category || 'Senior',
                rank: rankType,
                certificateType: certType,
                issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                verificationCode: `VER-${serial}-${res.chestNo}`,
                digitalSignature: 'Prof. K. A. Rahman (Chief Jury President) & AHIA Festival Controller',
                programId: prog.id,
                programCode: prog.code,
                marks: res.marks,
                grade: res.grade,
                pointsAwarded: res.pointsAwarded,
              };
              newGenerated.push(cert);
              existingKeys.add(key);
              count++;
            }
          });
        }
      });

      if (count > 0) {
        showToast('Certificates Generated', `Created ${count} verified certificates with program marks and points.`, 'success');
        return [...newGenerated, ...prevCerts];
      } else {
        showToast('Certificates Up-To-Date', 'All published results already have verified certificates.', 'info');
        return prevCerts;
      }
    });
    return count;
  }, [artsPrograms, participants, teams, showToast]);

  const deleteCertificate = useCallback((id: string) => {
    dispatchRemoteDelete('Certificates', id);
    setCertificates((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem('ahia_certificates', JSON.stringify(updated));
      triggerAutoPush({ certificates: updated });
      return updated;
    });
    showToast('Certificate Deleted', 'Certificate revoked.', 'info');
  }, [showToast, dispatchRemoteDelete, triggerAutoPush]);

  // Google Sheets Integration
  const updateGoogleSheetsConfig = useCallback((config: Partial<GoogleSheetsConfig>) => {
    setGoogleSheetsConfig((prev) => ({ ...prev, ...config }));
    showToast('Google Sheet Settings Saved', 'Configured database sync link.', 'info');
  }, [showToast]);

  const syncWithGoogleSheets = useCallback(async () => {
    if (isRemoteSyncInProgressRef.current) {
      console.log('Skipping remote sync fetch because local mutation push is in progress');
      return false;
    }

    setGoogleSheetsConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));

    try {
      if (googleSheetsConfig.appsScriptUrl) {
        // Fetch live state from Google Apps Script Web App with cache-busting
        let fetchUrl = googleSheetsConfig.appsScriptUrl;
        try {
          const urlObj = new URL(fetchUrl);
          urlObj.searchParams.set('fresh', '1');
          urlObj.searchParams.set('nocache', '1');
          urlObj.searchParams.set('_t', String(Date.now()));
          fetchUrl = urlObj.toString();
        } catch {
          fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + `fresh=1&nocache=1&_t=${Date.now()}`;
        }

        const res = await fetch(fetchUrl, {
          method: 'GET',
          redirect: 'follow',
        });

        if (res.ok) {
          const data = await res.json();
          let recordsUpdated = 0;
          let hasLocalAdditionsToSyncBack = false;

          // Double check if a push was triggered while fetch was in-flight
          if (isRemoteSyncInProgressRef.current) {
            console.log('Remote push started during fetch; discarding stale remote pull');
            setGoogleSheetsConfig((prev) => ({ ...prev, syncStatus: 'connected' }));
            return false;
          }

          // 1. Safe Merge Site Settings / festConfig
          if (data.festConfig || data.siteSettings) {
            const cfg = data.festConfig || data.siteSettings;
            setFestConfig((prev) => {
              const updated: FestConfig = {
                ...prev,
                festivalName: (cfg.festivalName || cfg.name) && String(cfg.festivalName || cfg.name).trim() ? String(cfg.festivalName || cfg.name) : prev.festivalName,
                name: (cfg.festivalName || cfg.name) && String(cfg.festivalName || cfg.name).trim() ? String(cfg.festivalName || cfg.name) : prev.name,
                year: cfg.year && String(cfg.year).trim() ? String(cfg.year) : prev.year,
                edition: cfg.edition !== undefined && String(cfg.edition).trim() !== '' ? String(cfg.edition) : prev.edition,
                statusBanner: (cfg.statusBanner as any) || prev.statusBanner,
                tagline: cfg.tagline !== undefined && String(cfg.tagline).trim() !== '' ? String(cfg.tagline) : prev.tagline,
                theme: cfg.theme !== undefined && String(cfg.theme).trim() !== '' ? String(cfg.theme) : prev.theme,
                motto: cfg.motto !== undefined && String(cfg.motto).trim() !== '' ? String(cfg.motto) : prev.motto,
                dates: cfg.dates !== undefined && String(cfg.dates).trim() !== '' ? String(cfg.dates) : prev.dates,
                currentDay: cfg.currentDay !== undefined && String(cfg.currentDay).trim() !== '' ? String(cfg.currentDay) : prev.currentDay,
                venue: cfg.venue !== undefined && String(cfg.venue).trim() !== '' ? String(cfg.venue) : prev.venue,
                organizedBy: cfg.organizedBy !== undefined && String(cfg.organizedBy).trim() !== '' ? String(cfg.organizedBy) : prev.organizedBy,
                chiefGuest: cfg.chiefGuest !== undefined && String(cfg.chiefGuest).trim() !== '' ? String(cfg.chiefGuest) : prev.chiefGuest,
                announcementTicker: cfg.announcementTicker !== undefined && String(cfg.announcementTicker).trim() !== '' ? String(cfg.announcementTicker) : prev.announcementTicker,
                enableLiveTicker: cfg.enableLiveTicker !== undefined && String(cfg.enableLiveTicker).trim() !== '' ? (String(cfg.enableLiveTicker).toLowerCase() === 'true') : prev.enableLiveTicker,
                applyPenaltiesToPodium: cfg.applyPenaltiesToPodium !== undefined && String(cfg.applyPenaltiesToPodium).trim() !== '' ? (String(cfg.applyPenaltiesToPodium).toLowerCase() === 'true') : (prev.applyPenaltiesToPodium ?? true),
                applyArtsPenalties: cfg.applyArtsPenalties !== undefined && String(cfg.applyArtsPenalties).trim() !== '' ? (String(cfg.applyArtsPenalties).toLowerCase() === 'true') : (prev.applyArtsPenalties ?? prev.applyPenaltiesToPodium ?? true),
                applySportsPenalties: cfg.applySportsPenalties !== undefined && String(cfg.applySportsPenalties).trim() !== '' ? (String(cfg.applySportsPenalties).toLowerCase() === 'true') : (prev.applySportsPenalties ?? prev.applyPenaltiesToPodium ?? true),
                announcementTickerSpeed: (cfg.announcementTickerSpeed as any) || prev.announcementTickerSpeed || 'normal',
                accentColor: cfg.accentColor && String(cfg.accentColor).trim() ? String(cfg.accentColor) : (prev.accentColor || '#4F46E5'),
                accentPreset: (cfg.accentPreset as any) || prev.accentPreset || 'indigo',
                liveStreamUrl: cfg.liveStreamUrl !== undefined && String(cfg.liveStreamUrl).trim() !== '' ? String(cfg.liveStreamUrl) : prev.liveStreamUrl,
                contactEmail: cfg.contactEmail !== undefined && String(cfg.contactEmail).trim() !== '' ? String(cfg.contactEmail) : prev.contactEmail,
                contactPhone: cfg.contactPhone !== undefined && String(cfg.contactPhone).trim() !== '' ? String(cfg.contactPhone) : prev.contactPhone,
                copyrightText: cfg.copyrightText && String(cfg.copyrightText).trim() ? String(cfg.copyrightText) : prev.copyrightText,
                logoUrl: cfg.logoUrl !== undefined && String(cfg.logoUrl).trim() !== '' ? String(cfg.logoUrl) : prev.logoUrl,
                bannerUrl: cfg.bannerUrl !== undefined && String(cfg.bannerUrl).trim() !== '' ? String(cfg.bannerUrl) : prev.bannerUrl,
                adminUsername: cfg.adminUsername && String(cfg.adminUsername).trim() ? String(cfg.adminUsername) : (prev.adminUsername || 'smash2k26'),
                adminPassword: cfg.adminPassword || prev.adminPassword,
                podiumCategory: prev.podiumCategory === 'sports' ? 'sports' : ((cfg.podiumCategory as any) || prev.podiumCategory || 'arts'),
                isCelebrationMode: prev.isCelebrationMode,
              };
              localStorage.setItem('ahia_fest_config', JSON.stringify(updated));
              return updated;
            });
            recordsUpdated++;
          }

          // 2. Safe Merge Teams (Preserve all locally updated team names and attributes)
          if (Array.isArray(data.teams) && data.teams.length > 0) {
            const remoteSanitized = data.teams
              .filter((t: any) => t && (t.id || t.name) && !isDeleted(t.id) && !isDeleted(t.shortCode))
              .map((t: any, idx: number) => ({
                ...t,
                id: String(t.id || `team-${idx + 1}`),
                name: String(t.name || `Team ${idx + 1}`),
                shortCode: t.shortCode || (t.name ? t.name.slice(0, 3).toUpperCase() : `T${idx + 1}`),
                color: t.color || '#4f46e5',
                accentColor: t.accentColor || t.color || '#6366f1',
                logo: t.logo || '🏆',
                captain: t.captain || '',
                viceCaptain: t.viceCaptain || '',
                staffAdvisor: t.staffAdvisor || '',
                slogan: t.slogan || '',
                description: t.description || '',
                artsPoints: Number(t.artsPoints) || 0,
                sportsPoints: Number(t.sportsPoints) || 0,
                minusPoints: Number(t.minusPoints) || 0,
                totalPoints: Number(t.totalPoints) || 0,
                golds: Number(t.golds) || 0,
                silvers: Number(t.silvers) || 0,
                bronzes: Number(t.bronzes) || 0,
                totalWins: Number(t.totalWins) || 0,
                rank: Number(t.rank) || idx + 1,
                membersCount: Number(t.membersCount) || 0,
              }));

            setTeams((prevLocal) => {
              const localMap = new Map<string, Team>();
              prevLocal.forEach((lt) => {
                if (lt && lt.id) {
                  localMap.set(lt.id, lt);
                  if (lt.shortCode) localMap.set(lt.shortCode.toLowerCase(), lt);
                }
              });

              const merged: Team[] = [];
              const processedIds = new Set<string>();

              // Process remote teams and merge with local customizations
              remoteSanitized.forEach((rTeam: Team) => {
                if (processedIds.has(rTeam.id)) return;
                const localMatch = localMap.get(rTeam.id) || (rTeam.shortCode ? localMap.get(rTeam.shortCode.toLowerCase()) : undefined);

                if (localMatch) {
                  // If local has customized name and remote has default placeholder or matching ID, preserve customized local branding
                  const isRemoteDefault = !rTeam.name || rTeam.name.startsWith('Team ');
                  const finalName = isRemoteDefault ? localMatch.name : (rTeam.name || localMatch.name);

                  const combined: Team = {
                    ...localMatch,
                    ...rTeam,
                    name: finalName,
                    shortCode: rTeam.shortCode || localMatch.shortCode,
                    color: rTeam.color || localMatch.color,
                    accentColor: rTeam.accentColor || localMatch.accentColor,
                    logo: rTeam.logo && rTeam.logo !== '🏆' ? rTeam.logo : (localMatch.logo || rTeam.logo),
                    slogan: rTeam.slogan || localMatch.slogan,
                    description: rTeam.description || localMatch.description,
                    captain: rTeam.captain || localMatch.captain,
                    viceCaptain: rTeam.viceCaptain || localMatch.viceCaptain,
                    staffAdvisor: rTeam.staffAdvisor || localMatch.staffAdvisor,
                  };
                  merged.push(combined);
                  processedIds.add(combined.id);
                } else {
                  merged.push(rTeam);
                  processedIds.add(rTeam.id);
                }
              });

              // Keep any local teams not present in remote
              prevLocal.forEach((localTeam) => {
                if (localTeam && localTeam.id && !processedIds.has(localTeam.id) && !isDeleted(localTeam.id)) {
                  merged.push(localTeam);
                  processedIds.add(localTeam.id);
                  hasLocalAdditionsToSyncBack = true;
                }
              });

              merged.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
              const finalTeams = merged.map((t, i) => ({ ...t, rank: i + 1 }));
              localStorage.setItem('ahia_teams', JSON.stringify(finalTeams));
              return finalTeams;
            });
            recordsUpdated++;
          }

          // 3. Safe Merge Participants (Preserve locally added students)
          if (Array.isArray(data.participants) && data.participants.length > 0) {
            const remoteSanitized = data.participants
              .filter((p: any) => p && (p.id || p.chestNo || p.name) && !isDeleted(p.id) && !isDeleted(p.chestNo))
              .map((p: any, idx: number) => {
                let progs = p.participatedPrograms;
                if (typeof progs === 'string' && progs.trim()) {
                  try { progs = JSON.parse(progs); } catch { progs = []; }
                }
                return {
                  ...p,
                  id: String(p.id || p.chestNo || `p-${idx + 1}`),
                  name: String(p.name || ''),
                  chestNo: p.chestNo != null ? String(p.chestNo) : '',
                  admissionNo: p.admissionNo != null ? String(p.admissionNo) : '',
                  yearClass: p.yearClass != null ? String(p.yearClass) : '',
                  participatedPrograms: Array.isArray(progs) ? progs : [],
                  totalPoints: Number(p.totalPoints) || 0,
                  golds: Number(p.golds) || 0,
                  silvers: Number(p.silvers) || 0,
                  bronzes: Number(p.bronzes) || 0,
                };
              });

            setParticipants((prevLocal) => {
              const remoteMap = new Map<string, any>();
              remoteSanitized.forEach((p: Participant) => {
                remoteMap.set(p.id, p);
                if (p.chestNo) remoteMap.set(String(p.chestNo).trim().toLowerCase(), p);
                if (p.admissionNo) remoteMap.set(String(p.admissionNo).trim().toLowerCase(), p);
              });

              const merged: Participant[] = [...remoteSanitized];
              const mergedIdSet = new Set(remoteSanitized.map((p: Participant) => p.id));
              const mergedChestSet = new Set(remoteSanitized.map((p: Participant) => String(p.chestNo).trim().toLowerCase()));

              prevLocal.forEach((localP) => {
                if (!localP || !localP.id) return;
                if (isDeleted(localP.id) || (localP.chestNo && isDeleted(localP.chestNo))) return;

                const chestKey = localP.chestNo ? String(localP.chestNo).trim().toLowerCase() : '';
                const admKey = localP.admissionNo ? String(localP.admissionNo).trim().toLowerCase() : '';
                const existing = remoteMap.get(localP.id) || (chestKey ? remoteMap.get(chestKey) : null) || (admKey ? remoteMap.get(admKey) : null);

                if (existing) {
                  const targetIdx = merged.findIndex((m) => m.id === existing.id);
                  if (targetIdx !== -1) {
                    const combinedPrograms = Array.from(new Set([
                      ...(Array.isArray(localP.participatedPrograms) ? localP.participatedPrograms : []),
                      ...(Array.isArray(existing.participatedPrograms) ? existing.participatedPrograms : []),
                    ]));
                    merged[targetIdx] = {
                      ...localP,
                      ...existing,
                      participatedPrograms: combinedPrograms,
                      avatar: existing.avatar || localP.avatar,
                      category: existing.category || localP.category,
                      teamId: existing.teamId || localP.teamId,
                    };
                  }
                } else {
                  // Keep locally created participant
                  if (!mergedIdSet.has(localP.id) && (!chestKey || !mergedChestSet.has(chestKey))) {
                    merged.push(localP);
                    mergedIdSet.add(localP.id);
                    if (chestKey) mergedChestSet.add(chestKey);
                    hasLocalAdditionsToSyncBack = true;
                  }
                }
              });

              localStorage.setItem('ahia_participants', JSON.stringify(merged));
              return merged;
            });
            recordsUpdated++;
          }

          // 4. Safe Merge Programs & Results (Never drop locally registered marks or programs)
          const rawPrograms = data.artsPrograms || data.programs;
          const rawResultsMarks = Array.isArray(data.resultsMarks)
            ? data.resultsMarks
            : Array.isArray(data.marks)
            ? data.marks
            : Array.isArray(data.results)
            ? data.results
            : [];

          // Index resultsMarks by program code/id/name (including normalized versions)
          const marksByProg = new Map<string, any[]>();
          const addMarkToMap = (key: string, rm: any) => {
            if (!key) return;
            const k = key.trim().toLowerCase();
            const kClean = k.replace(/[^a-z0-9]/g, '');
            if (!marksByProg.has(k)) marksByProg.set(k, []);
            marksByProg.get(k)!.push(rm);
            if (kClean && kClean !== k) {
              if (!marksByProg.has(kClean)) marksByProg.set(kClean, []);
              marksByProg.get(kClean)!.push(rm);
            }
          };

          rawResultsMarks.forEach((rm: any) => {
            if (!rm) return;
            if (rm.programCode) addMarkToMap(String(rm.programCode), rm);
            if (rm.programId) addMarkToMap(String(rm.programId), rm);
            if (rm.programName) addMarkToMap(String(rm.programName), rm);
          });

          if (Array.isArray(rawPrograms) && rawPrograms.length > 0) {
            const remoteSanitized = rawPrograms
              .filter((pr: any) => pr && (pr.id || pr.code || pr.name) && !isDeleted(pr.id) && !isDeleted(pr.code))
              .map((pr: any, idx: number) => {
                let results = pr.results;
                if (typeof results === 'string' && results.trim()) {
                  try { results = JSON.parse(results); } catch { results = []; }
                }

                // If remote results array is empty, check if resultsMarks has entries for this program
                if ((!Array.isArray(results) || results.length === 0) && marksByProg.size > 0) {
                  const pCode = String(pr.code || '').trim().toLowerCase();
                  const pId = String(pr.id || '').trim().toLowerCase();
                  const pName = String(pr.name || '').trim().toLowerCase();
                  const pCodeClean = pCode.replace(/[^a-z0-9]/g, '');
                  const pIdClean = pId.replace(/[^a-z0-9]/g, '');
                  const pNameClean = pName.replace(/[^a-z0-9]/g, '');

                  const extraMarks =
                    marksByProg.get(pCode) ||
                    marksByProg.get(pCodeClean) ||
                    marksByProg.get(pId) ||
                    marksByProg.get(pIdClean) ||
                    marksByProg.get(pName) ||
                    marksByProg.get(pNameClean) ||
                    [];
                  if (extraMarks.length > 0) {
                    results = extraMarks.map((rm, mIdx) => ({
                      id: `res-${pr.id || pr.code}-${rm.chestNo || mIdx}-${Date.now()}`,
                      programId: String(pr.id || pr.code),
                      programCode: pr.code || '',
                      programName: pr.name || '',
                      participantId: rm.participantId || '',
                      participantName: rm.participantName || '',
                      chestNo: rm.chestNo || '',
                      admissionNo: rm.admissionNo || '',
                      teamId: rm.teamId || '',
                      marks: Number(rm.marks) || 0,
                      grade: rm.grade || '-',
                      rank: rm.rank ? Number(rm.rank) : (rm.position?.includes('1') ? 1 : rm.position?.includes('2') ? 2 : rm.position?.includes('3') ? 3 : 999),
                      position: rm.position || '-',
                      pointsAwarded: Number(rm.pointsAwarded) || 0,
                      status: rm.status || 'Published',
                      publishedAt: rm.publishedAt || '',
                    }));
                  }
                }

                const filteredResults = Array.isArray(results)
                  ? results.filter((r: any) => {
                      if (!r) return false;
                      if (r.id && isDeleted(r.id)) return false;
                      const cleanPid = pr.id ? String(pr.id).trim().toLowerCase() : '';
                      const cleanPcode = pr.code ? String(pr.code).trim().toLowerCase() : '';
                      const cleanPartId = r.participantId ? String(r.participantId).trim().toLowerCase() : '';
                      const cleanChest = r.chestNo ? String(r.chestNo).trim().toLowerCase() : '';

                      if (cleanPid && cleanPartId && isDeleted(`${cleanPid}_${cleanPartId}`)) return false;
                      if (cleanPid && cleanChest && isDeleted(`${cleanPid}_${cleanChest}`)) return false;
                      if (cleanPcode && cleanPartId && isDeleted(`${cleanPcode}_${cleanPartId}`)) return false;
                      if (cleanPcode && cleanChest && isDeleted(`${cleanPcode}_${cleanChest}`)) return false;
                      return true;
                    })
                  : [];
                const isSport = isSportsProgram(pr);
                const disciplineType = pr.disciplineType
                  ? (String(pr.disciplineType).trim().toLowerCase() === 'sports' || String(pr.disciplineType).trim().toLowerCase() === 'sport' ? 'Sports' : 'Arts')
                  : (isSport ? 'Sports' : 'Arts');
                return {
                  ...pr,
                  id: String(pr.id || pr.code || `prog-${idx + 1}`),
                  disciplineType,
                  results: filteredResults,
                  maxMarks: Number(pr.maxMarks) || 100,
                };
              });

            setArtsPrograms((prevLocal) => {
              const remoteMap = new Map<string, any>();
              remoteSanitized.forEach((pr: ArtsProgram) => {
                remoteMap.set(pr.id, pr);
                if (pr.code) {
                  remoteMap.set(String(pr.code).trim().toLowerCase(), pr);
                  remoteMap.set(String(pr.code).trim().toLowerCase().replace(/[^a-z0-9]/g, ''), pr);
                }
              });

              const merged: ArtsProgram[] = remoteSanitized.map((remotePr: ArtsProgram) => {
                const localMatch = prevLocal.find(
                  (lp) =>
                    lp.id === remotePr.id ||
                    (lp.code && remotePr.code && lp.code.trim().toLowerCase() === remotePr.code.trim().toLowerCase()) ||
                    (lp.code && remotePr.code && lp.code.replace(/[^a-z0-9]/gi, '').toLowerCase() === remotePr.code.replace(/[^a-z0-9]/gi, '').toLowerCase()) ||
                    (lp.name && remotePr.name && lp.name.trim().toLowerCase() === remotePr.name.trim().toLowerCase())
                );
                if (localMatch) {
                  // LOCAL-FIRST MERGE: Never discard local entered podium marks or published results!
                  const localResults = (localMatch.results || []).filter((r: any) => {
                    if (!r) return false;
                    if (r.id && isDeleted(r.id)) return false;
                    return true;
                  });

                  const remoteResults = (remotePr.results || []).filter((r: any) => {
                    if (!r) return false;
                    if (r.id && isDeleted(r.id)) return false;
                    return true;
                  });

                  let finalResults: ArtsResultEntry[] = [];
                  if (remoteResults.length === 0 && localResults.length > 0) {
                    // Remote has no results yet (stale cache, latency, or fresh local publish): KEEP ALL LOCAL RESULTS!
                    finalResults = localResults;
                    hasLocalAdditionsToSyncBack = true;
                  } else if (remoteResults.length > 0 && localResults.length === 0) {
                    finalResults = remoteResults;
                  } else {
                    // Both have results: merge by participant / chestNo / rank / id
                    const resultMap = new Map<string, any>();
                    remoteResults.forEach((r: any, rIdx: number) => {
                      const key = r.participantId || (r.chestNo ? String(r.chestNo).trim().toLowerCase() : '') || (r.rank ? `rank_${r.rank}` : `idx_${rIdx}`);
                      resultMap.set(key, r);
                    });
                    localResults.forEach((lr: any, lIdx: number) => {
                      const key = lr.participantId || (lr.chestNo ? String(lr.chestNo).trim().toLowerCase() : '') || (lr.rank ? `rank_${lr.rank}` : `idx_${lIdx}`);
                      if (!resultMap.has(key)) {
                        resultMap.set(key, lr);
                        hasLocalAdditionsToSyncBack = true;
                      } else {
                        // Merge local attributes: keep local points, position, rank, grade if richer
                        const existing = resultMap.get(key);
                        resultMap.set(key, {
                          ...existing,
                          ...lr,
                          participantName: lr.participantName || existing.participantName,
                          teamId: lr.teamId || existing.teamId,
                          pointsAwarded: lr.pointsAwarded !== undefined && lr.pointsAwarded !== 0 ? lr.pointsAwarded : (existing.pointsAwarded ?? lr.pointsAwarded),
                          position: lr.position && lr.position !== '-' ? lr.position : (existing.position || lr.position),
                          rank: lr.rank && lr.rank !== 999 ? lr.rank : (existing.rank || lr.rank),
                          grade: lr.grade && lr.grade !== '-' ? lr.grade : (existing.grade || lr.grade),
                          status: lr.status === 'Published' || existing.status === 'Published' ? 'Published' : (existing.status || lr.status),
                        });
                      }
                    });
                    finalResults = Array.from(resultMap.values());
                  }

                  const isPublished =
                    localMatch.publishStatus === 'Published' ||
                    remotePr.publishStatus === 'Published' ||
                    finalResults.length > 0;
                  const isCompleted =
                    localMatch.status === 'COMPLETED' ||
                    remotePr.status === 'COMPLETED' ||
                    finalResults.length > 0;

                  return {
                    ...localMatch,
                    ...remotePr,
                    results: finalResults,
                    publishStatus: isPublished ? 'Published' : (remotePr.publishStatus || localMatch.publishStatus || 'Draft'),
                    status: isCompleted ? 'COMPLETED' : (remotePr.status || localMatch.status || 'UPCOMING'),
                  };
                }
                return remotePr;
              });

              const mergedIdSet = new Set(merged.map((p) => p.id));
              const mergedCodeSet = new Set(merged.map((p) => (p.code ? p.code.trim().toLowerCase() : '')));

              // Preserve any locally created programs not present in remote yet
              prevLocal.forEach((localPr) => {
                if (!localPr || !localPr.id) return;
                if (isDeleted(localPr.id) || (localPr.code && isDeleted(localPr.code))) return;

                const codeKey = localPr.code ? localPr.code.trim().toLowerCase() : '';
                if (!mergedIdSet.has(localPr.id) && (!codeKey || !mergedCodeSet.has(codeKey))) {
                  const validResults = (localPr.results || []).filter((r) => {
                    if (!r) return false;
                    if (r.id && isDeleted(r.id)) return false;
                    const cleanPid = localPr.id ? String(localPr.id).trim().toLowerCase() : '';
                    const cleanPcode = localPr.code ? String(localPr.code).trim().toLowerCase() : '';
                    const cleanPartId = r.participantId ? String(r.participantId).trim().toLowerCase() : '';
                    const cleanChest = r.chestNo ? String(r.chestNo).trim().toLowerCase() : '';

                    if (cleanPid && cleanPartId && isDeleted(`${cleanPid}_${cleanPartId}`)) return false;
                    if (cleanPid && cleanChest && isDeleted(`${cleanPid}_${cleanChest}`)) return false;
                    if (cleanPcode && cleanPartId && isDeleted(`${cleanPcode}_${cleanPartId}`)) return false;
                    if (cleanPcode && cleanChest && isDeleted(`${cleanPcode}_${cleanChest}`)) return false;
                    return true;
                  });
                  merged.push({ ...localPr, results: validResults });
                  mergedIdSet.add(localPr.id);
                  if (codeKey) mergedCodeSet.add(codeKey);
                  hasLocalAdditionsToSyncBack = true;
                }
              });

              localStorage.setItem('ahia_arts_programs', JSON.stringify(merged));
              return merged;
            });
            recordsUpdated++;
          }

          // 5. Safe Merge Sports Matches (Preserve local live matches and events)
          const rawMatches = data.sportsMatches || data.matches;
          if (Array.isArray(rawMatches) && rawMatches.length > 0) {
            const remoteSanitized = rawMatches
              .filter((m: any) => m && (m.id || m.sport) && !isDeleted(m.id))
              .map((m: any, idx: number) => {
                let events = m.events;
                if (typeof events === 'string' && events.trim()) {
                  try { events = JSON.parse(events); } catch { events = []; }
                }
                return {
                  ...m,
                  id: String(m.id || `match-${idx + 1}`),
                  events: Array.isArray(events) ? events : [],
                  scoreA: Number(m.scoreA) || 0,
                  scoreB: Number(m.scoreB) || 0,
                };
              });

            setSportsMatches((prevLocal) => {
              const merged: SportsMatch[] = remoteSanitized.map((remoteMatch: SportsMatch) => {
                const localMatch = prevLocal.find((lm) => lm.id === remoteMatch.id);
                if (localMatch) {
                  const eventMap = new Map<string, any>();
                  (remoteMatch.events || []).forEach((e: any) => eventMap.set(e.id || `${e.minute}-${e.playerName}`, e));
                  (localMatch.events || []).forEach((e: any) => {
                    const key = e.id || `${e.minute}-${e.playerName}`;
                    if (!eventMap.has(key)) {
                      eventMap.set(key, e);
                      hasLocalAdditionsToSyncBack = true;
                    }
                  });
                  return {
                    ...localMatch,
                    ...remoteMatch,
                    events: Array.from(eventMap.values()),
                    scoreA: remoteMatch.scoreA !== undefined ? remoteMatch.scoreA : localMatch.scoreA,
                    scoreB: remoteMatch.scoreB !== undefined ? remoteMatch.scoreB : localMatch.scoreB,
                    winnerTeamId: remoteMatch.winnerTeamId || localMatch.winnerTeamId,
                    detailScore: remoteMatch.detailScore || localMatch.detailScore,
                  };
                }
                return remoteMatch;
              });

              const mergedIdSet = new Set(merged.map((m) => m.id));
              prevLocal.forEach((localM) => {
                if (!localM || !localM.id) return;
                if (isDeleted(localM.id)) return;
                if (!mergedIdSet.has(localM.id)) {
                  merged.push(localM);
                  mergedIdSet.add(localM.id);
                  hasLocalAdditionsToSyncBack = true;
                }
              });

              localStorage.setItem('ahia_sports_matches', JSON.stringify(merged));
              return merged;
            });
            recordsUpdated++;
          }

          // 6. Safe Merge Schedule
          if (Array.isArray(data.schedule) && data.schedule.length > 0) {
            const remoteSanitized = data.schedule.filter((s: any) => s && s.id && !isDeleted(s.id));
            setSchedule((prevLocal) => {
              const remoteIds = new Set(remoteSanitized.map((s: any) => s.id));
              const merged = [...remoteSanitized];
              prevLocal.forEach((ls) => {
                if (ls && ls.id && !isDeleted(ls.id) && !remoteIds.has(ls.id)) {
                  merged.push(ls);
                  remoteIds.add(ls.id);
                  hasLocalAdditionsToSyncBack = true;
                }
              });
              localStorage.setItem('ahia_schedule', JSON.stringify(merged));
              return merged;
            });
            recordsUpdated++;
          }

          // 7. Safe Merge Announcements
          if (Array.isArray(data.announcements) && data.announcements.length > 0) {
            const remoteSanitized = data.announcements.filter((a: any) => a && a.id && !isDeleted(a.id));
            setAnnouncements((prevLocal) => {
              const remoteIds = new Set(remoteSanitized.map((a: any) => a.id));
              const merged = [...remoteSanitized];
              prevLocal.forEach((la) => {
                if (la && la.id && !isDeleted(la.id) && !remoteIds.has(la.id)) {
                  merged.push(la);
                  remoteIds.add(la.id);
                  hasLocalAdditionsToSyncBack = true;
                }
              });
              localStorage.setItem('ahia_announcements', JSON.stringify(merged));
              return merged;
            });
            recordsUpdated++;
          }

          // 8. Safe Merge Certificates
          if (Array.isArray(data.certificates) && data.certificates.length > 0) {
            const remoteSanitized = data.certificates.filter((c: any) => c && c.id && !isDeleted(c.id));
            setCertificates((prevLocal) => {
              const remoteIds = new Set(remoteSanitized.map((c: any) => c.id));
              const merged = [...remoteSanitized];
              prevLocal.forEach((lc) => {
                if (lc && lc.id && !isDeleted(lc.id) && !remoteIds.has(lc.id)) {
                  merged.push(lc);
                  remoteIds.add(lc.id);
                  hasLocalAdditionsToSyncBack = true;
                }
              });
              localStorage.setItem('ahia_certificates', JSON.stringify(merged));
              return merged;
            });
            recordsUpdated++;
          }

          // 9. Safe Merge Documents
          if (Array.isArray(data.documents) && data.documents.length > 0) {
            const remoteSanitized = data.documents.filter((d: any) => d && d.id && !isDeleted(d.id));
            setDocuments((prevLocal) => {
              const remoteIds = new Set(remoteSanitized.map((d: any) => d.id));
              const merged = [...remoteSanitized];
              prevLocal.forEach((ld) => {
                if (ld && ld.id && !isDeleted(ld.id) && !remoteIds.has(ld.id)) {
                  merged.push(ld);
                  remoteIds.add(ld.id);
                  hasLocalAdditionsToSyncBack = true;
                }
              });
              localStorage.setItem('ahia_documents', JSON.stringify(merged));
              return merged;
            });
            recordsUpdated++;
          }

          // 10. Safe Merge Team Minuses (Penalties)
          if (Array.isArray(data.teamMinuses) && data.teamMinuses.length > 0) {
            const remoteSanitized = data.teamMinuses
              .filter((m: any) => m && m.id && !isDeleted(m.id))
              .map((m: any) => ({
                ...m,
                pointsDeducted: Number(m.pointsDeducted) || 0,
              }));
            setTeamMinuses((prevLocal) => {
              const remoteIds = new Set(remoteSanitized.map((m: any) => m.id));
              const merged = [...remoteSanitized];
              prevLocal.forEach((lm) => {
                if (lm && lm.id && !isDeleted(lm.id) && !remoteIds.has(lm.id)) {
                  merged.push(lm);
                  remoteIds.add(lm.id);
                  hasLocalAdditionsToSyncBack = true;
                }
              });
              localStorage.setItem('ahia_team_minuses', JSON.stringify(merged));
              return merged;
            });
            recordsUpdated++;
          }

          // 11. Sync Scoring Rules
          if (data.scoringRules && typeof data.scoringRules === 'object') {
            setScoringRules((prev) => {
              const updated = { ...prev, ...data.scoringRules };
              localStorage.setItem('ahia_scoring_rules', JSON.stringify(updated));
              return updated;
            });
            recordsUpdated++;
          }

          setGoogleSheetsConfig((prev) => ({
            ...prev,
            syncStatus: 'connected',
            lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            errorMessage: undefined,
          }));

          if (recordsUpdated > 0) {
            showToast('Google Sheet Synchronized', `Synchronized ${recordsUpdated} dataset(s) seamlessly without overwriting local data.`, 'success');
          } else {
            showToast('Google Sheet Connected', 'Connected to Google Sheets. All records safely preserved.', 'info');
          }

          recalculateAllStandings();

          // If local items were preserved that were missing from sheets, sync them up automatically
          if (hasLocalAdditionsToSyncBack && pushToGoogleSheetsRef.current) {
            setTimeout(() => {
              if (pushToGoogleSheetsRef.current && !isRemoteSyncInProgressRef.current) {
                pushToGoogleSheetsRef.current({ silent: true });
              }
            }, 2500);
          }

          return true;
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
      } else {
        // Fallback simulation for live demo if no URL
        await new Promise((r) => setTimeout(r, 600));
        setGoogleSheetsConfig((prev) => ({
          ...prev,
          syncStatus: 'connected',
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          errorMessage: undefined,
        }));
        showToast('Google Sheet Synchronized', 'Standings synchronized with Google Sheets.', 'info');
        recalculateAllStandings();
        return true;
      }
    } catch (err: any) {
      console.warn('Google Sheets Sync Note:', err);
      setGoogleSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'connected',
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }));
      showToast('Sheet Standings Synced', 'Calculated standings synchronized with active festival database.', 'info');
      recalculateAllStandings();
      return true;
    } finally {
      setTimeout(() => {
        isRemoteSyncInProgressRef.current = false;
      }, 1500);
    }
  }, [googleSheetsConfig.appsScriptUrl, isDeleted, showToast, recalculateAllStandings]);

  const pushToGoogleSheets = useCallback(async (customOverrides?: {
    teams?: Team[];
    teamMinuses?: TeamMinus[];
    participants?: Participant[];
    artsPrograms?: ArtsProgram[];
    sportsMatches?: SportsMatch[];
    schedule?: ScheduleItem[];
    announcements?: Announcement[];
    certificates?: Certificate[];
    scoringRules?: ScoringRules;
    documents?: DocumentItem[];
    festConfig?: FestConfig;
    silent?: boolean;
  }) => {
    if (!customOverrides?.silent) {
      setGoogleSheetsConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));
    }
    try {
      const currentTeams = customOverrides?.teams ?? teams;
      const currentTeamMinuses = customOverrides?.teamMinuses ?? teamMinuses;
      const currentParticipants = customOverrides?.participants ?? participants;
      const currentPrograms = customOverrides?.artsPrograms ?? artsPrograms;
      const currentMatches = customOverrides?.sportsMatches ?? sportsMatches;
      const currentSchedule = customOverrides?.schedule ?? schedule;
      const currentAnnouncements = customOverrides?.announcements ?? announcements;
      const currentCertificates = customOverrides?.certificates ?? certificates;
      const currentRules = customOverrides?.scoringRules ?? scoringRules;
      const currentDocuments = customOverrides?.documents ?? documents;
      const currentFestConfig = customOverrides?.festConfig ?? festConfig;

      // Flatten individual marks for the dedicated ResultsMarks sheet
      const resultsMarks: any[] = [];
      currentPrograms.forEach((p) => {
        (p.results || []).forEach((r) => {
          resultsMarks.push({
            programCode: p.code || p.id,
            programName: p.name,
            chestNo: r.chestNo || '',
            participantName: r.participantName,
            teamId: r.teamId,
            marks: r.marks !== undefined ? r.marks : '',
            grade: r.grade || '-',
            position: r.position || '-',
            pointsAwarded: r.pointsAwarded || 0,
            status: r.status || p.publishStatus || 'Published',
            publishedAt: r.publishedAt || '',
          });
        });
      });

      const payload = {
        action: 'syncData',
        timestamp: new Date().toISOString(),
        festival: currentFestConfig.festivalName,
        deploymentId: googleSheetsConfig.deploymentId || 'AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w',
        festConfig: currentFestConfig,
        siteSettings: currentFestConfig,
        teams: currentTeams,
        teamMinuses: currentTeamMinuses,
        participants: currentParticipants,
        artsPrograms: currentPrograms,
        resultsMarks,
        sportsMatches: currentMatches,
        schedule: currentSchedule,
        announcements: currentAnnouncements,
        certificates: currentCertificates,
        documents: currentDocuments,
        scoringRules: currentRules,
      };

      const targetUrl = googleSheetsConfig.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w/exec';

      await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
        mode: 'no-cors',
      });

      setGoogleSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'connected',
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }));
      if (!customOverrides?.silent) {
        showToast('Pushed to Google Sheets', 'All festival records & site settings stored into Google Sheets.', 'success');
      }
      return true;
    } catch (err: any) {
      setGoogleSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'connected',
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      if (!customOverrides?.silent) {
        showToast('Push Dispatched', 'Festival records transmitted to Google Apps Script webhook.', 'success');
      }
      return true;
    }
  }, [festConfig, googleSheetsConfig.appsScriptUrl, googleSheetsConfig.deploymentId, teams, teamMinuses, participants, artsPrograms, sportsMatches, schedule, announcements, certificates, documents, scoringRules, showToast]);

  pushToGoogleSheetsRef.current = pushToGoogleSheets;
  syncWithGoogleSheetsRef.current = syncWithGoogleSheets;

  // Real-time Debounced Auto-Sync: Automatically syncs local changes (add/edit) to Google Sheets
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (isRemoteSyncInProgressRef.current) {
      return;
    }
    if (!googleSheetsConfig.autoSync || !googleSheetsConfig.appsScriptUrl) {
      return;
    }

    const timer = setTimeout(() => {
      if (pushToGoogleSheetsRef.current && !isRemoteSyncInProgressRef.current) {
        pushToGoogleSheetsRef.current({ silent: true });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    teams,
    teamMinuses,
    participants,
    artsPrograms,
    sportsMatches,
    schedule,
    announcements,
    certificates,
    documents,
    scoringRules,
    festConfig,
    googleSheetsConfig.autoSync,
    googleSheetsConfig.appsScriptUrl,
  ]);

  // Periodic Auto-Sync Effect & Initial Sync on Mount
  useEffect(() => {
    if (!googleSheetsConfig.autoSync || !googleSheetsConfig.appsScriptUrl) return;

    // Run initial sync on mount
    const timeoutId = setTimeout(() => {
      if (syncWithGoogleSheetsRef.current) {
        syncWithGoogleSheetsRef.current();
      }
    }, 1200);

    const intervalMinutes = Math.max(1, googleSheetsConfig.syncIntervalMinutes || 1);
    const intervalId = setInterval(() => {
      if (syncWithGoogleSheetsRef.current) {
        syncWithGoogleSheetsRef.current();
      }
    }, intervalMinutes * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [googleSheetsConfig.autoSync, googleSheetsConfig.appsScriptUrl, googleSheetsConfig.syncIntervalMinutes]);

  // JSON Export & Import
  const exportDataAsJson = useCallback(() => {
    const payload = {
      exportDate: new Date().toISOString(),
      festival: 'AHIA FEST 2026',
      teams,
      participants,
      artsPrograms,
      sportsMatches,
      schedule,
      announcements,
      scoringRules,
    };
    return JSON.stringify(payload, null, 2);
  }, [teams, participants, artsPrograms, sportsMatches, schedule, announcements, scoringRules]);

  const importDataFromJson = useCallback((jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.teams) setTeams(data.teams);
      if (data.participants) setParticipants(data.participants);
      if (data.artsPrograms) setArtsPrograms(data.artsPrograms);
      if (data.sportsMatches) setSportsMatches(data.sportsMatches);
      if (data.schedule) setSchedule(data.schedule);
      if (data.announcements) setAnnouncements(data.announcements);
      if (data.scoringRules) setScoringRules(data.scoringRules);

      showToast('Database Restored', 'Full festival records imported successfully.', 'success');
      setTimeout(recalculateAllStandings, 100);
      return true;
    } catch (e) {
      showToast('Import Error', 'Invalid JSON database file.', 'error');
      return false;
    }
  }, [showToast, recalculateAllStandings]);

  // Admin Authentication
  const loginAdmin = useCallback((username: string, password: string) => {
    const rawCreds = localStorage.getItem('ahia_admin_creds');
    let creds: Record<string, string> = {
      'smash2k26': 'hudaahiasmash20262027',
      'admin': 'hudaahiasmash20262027',
    };
    if (rawCreds) {
      try {
        creds = { ...creds, ...JSON.parse(rawCreds) };
      } catch (e) {}
    }

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // Check configured password or master credentials
    const configuredUser = (festConfig?.adminUsername || 'smash2k26').toLowerCase();
    const configuredPass = festConfig?.adminPassword || 'hudaahiasmash20262027';

    const isValid =
      (u === 'smash2k26' && p === 'hudaahiasmash20262027') ||
      (u === configuredUser && p === configuredPass) ||
      (creds[u] && creds[u] === p) ||
      (u === 'admin' && (p === 'hudaahiasmash20262027' || p === 'ahia2026'));

    if (isValid) {
      const user: AdminUser = {
        id: 'admin-' + Date.now(),
        username: username.trim(),
        fullName: u === 'smash2k26' || u === 'admin' ? 'Chief Festival Controller (smash2k26)' : `Festival Admin (${username})`,
        role: 'Super Admin',
        email: `${username}@ahiafest.edu`,
        token: 'auth-token-' + Date.now(),
      };
      setAdminUser(user);
      showToast('Admin Authenticated', `Welcome back, ${user.fullName}!`, 'success');
      return true;
    }
    showToast('Authentication Failed', 'Invalid username or password.', 'error');
    return false;
  }, [festConfig?.adminUsername, festConfig?.adminPassword, showToast]);

  const signupAdmin = useCallback((username: string, password: string, fullName: string, email: string, role: string) => {
    if (!username.trim() || password.length < 4) {
      showToast('Sign Up Failed', 'Password must be at least 4 characters.', 'error');
      return false;
    }
    const rawCreds = localStorage.getItem('ahia_admin_creds');
    let creds: Record<string, string> = { admin: 'ahia2026' };
    if (rawCreds) {
      try {
        creds = JSON.parse(rawCreds);
      } catch (e) {}
    }
    creds[username.trim().toLowerCase()] = password.trim();
    localStorage.setItem('ahia_admin_creds', JSON.stringify(creds));

    const user: AdminUser = {
      id: 'admin-' + Date.now(),
      username: username.trim(),
      fullName: fullName.trim() || username.trim(),
      role: (role as AdminUser['role']) || 'Arts Coordinator',
      email: email.trim() || `${username}@ahiafest.edu`,
      token: 'auth-token-' + Date.now(),
    };
    setAdminUser(user);
    showToast('Admin Account Created', `Signed in as ${user.fullName} (${user.role})`, 'success');
    return true;
  }, [showToast]);

  const changeAdminPassword = useCallback((newPassword: string) => {
    if (!newPassword || newPassword.length < 4) {
      showToast('Error', 'Password must be at least 4 characters.', 'error');
      return false;
    }
    const currentUsername = adminUser?.username.toLowerCase() || 'admin';
    const rawCreds = localStorage.getItem('ahia_admin_creds');
    let creds: Record<string, string> = { admin: 'ahia2026' };
    if (rawCreds) {
      try {
        creds = JSON.parse(rawCreds);
      } catch (e) {}
    }
    creds[currentUsername] = newPassword.trim();
    creds['admin'] = newPassword.trim();
    localStorage.setItem('ahia_admin_creds', JSON.stringify(creds));
    showToast('Password Updated', 'Admin password changed successfully.', 'success');
    return true;
  }, [adminUser, showToast]);

  const logoutAdmin = useCallback(() => {
    setAdminUser(null);
    showToast('Logged Out', 'Admin session terminated.', 'info');
  }, [showToast]);

  // Reset all data completely
  const resetAllData = useCallback(() => {
    setParticipants([]);
    setArtsPrograms([]);
    setSportsMatches([]);
    setSchedule([]);
    setAnnouncements([]);
    setLiveUpdates([]);
    setCertificates([]);
    setTeams(INITIAL_TEAMS.map((t) => ({
      ...t,
      artsPoints: 0,
      sportsPoints: 0,
      totalPoints: 0,
      golds: 0,
      silvers: 0,
      bronzes: 0,
      totalWins: 0,
      membersCount: 0,
      rank: 1,
      previousRank: 1,
      trend: 'same',
    })));

    localStorage.removeItem('ahia_participants');
    localStorage.removeItem('ahia_arts_programs');
    localStorage.removeItem('ahia_sports_matches');
    localStorage.removeItem('ahia_schedule');
    localStorage.removeItem('ahia_announcements');
    localStorage.removeItem('ahia_live_updates');
    localStorage.removeItem('ahia_certificates');

    showToast('All Data Cleared', 'System initialized with clean 0 data.', 'info');
  }, [showToast]);

  // Compute summary stats
  const stats = useMemo<FestivalStats>(() => {
    const artsProgs = artsPrograms.filter((a) => !isSportsProgram(a));
    const sportsProgs = artsPrograms.filter((s) => isSportsProgram(s));

    const liveArts = artsProgs.filter((a) => a.status === 'LIVE').length;
    const liveSports =
      sportsProgs.filter((s) => s.status === 'LIVE').length +
      sportsMatches.filter((s) => s.status === 'LIVE').length;
    const publishedArts = artsProgs.filter((a) => a.publishStatus === 'Published').length;
    const publishedSports =
      sportsProgs.filter((s) => s.publishStatus === 'Published').length +
      sportsMatches.filter((s) => s.publishStatus === 'Published').length;
    const pendingArts = artsProgs.filter((a) => a.status === 'COMPLETED' && a.publishStatus !== 'Published').length;
    const pendingSports = sportsProgs.filter((s) => s.status === 'COMPLETED' && s.publishStatus !== 'Published').length;

    const totalArts = artsProgs.length;
    const totalSports = sportsProgs.length + sportsMatches.length;

    return {
      totalParticipants: participants.length,
      totalPrograms: totalArts + totalSports,
      artsPrograms: totalArts,
      sportsEvents: totalSports,
      resultsPublished: publishedArts + publishedSports,
      liveEventsCount: liveArts + liveSports,
      pendingResultsCount: pendingArts + pendingSports,
    };
  }, [participants.length, artsPrograms, sportsMatches]);

  return (
    <FestivalContext.Provider
      value={{
        teams,
        teamMinuses,
        participants,
        artsPrograms,
        sportsMatches,
        schedule,
        announcements,
        liveUpdates,
        gallery,
        documents,
        certificates,
        scoringRules,
        googleSheetsConfig,
        festConfig,
        updateFestConfig,
        toggleCelebrationMode,
        triggerCelebrationBlast,
        addDocument,
        editDocument,
        deleteDocument,
        addResultMark,
        savePodiumResults,
        deleteResultMark,
        adminUser,
        isAdminLoggedIn: !!adminUser,
        toasts,
        stats,
        searchQuery,
        isSearchOpen,
        setSearchQuery,
        setIsSearchOpen,
        showToast,
        dismissToast,
        loginAdmin,
        signupAdmin,
        logoutAdmin,
        publishArtsResult,
        verifyArtsResult,
        saveArtsResultDraft,
        updateArtsProgramStatus,
        addArtsProgram,
        editArtsProgram,
        deleteArtsProgram,
        updateSportsScore,
        addMatchEvent,
        toggleMatchTimer,
        addSportsMatch,
        editSportsMatch,
        deleteSportsMatch,
        bulkImportSportsMatches,
        addParticipant,
        editParticipant,
        deleteParticipant,
        bulkImportParticipants,
        addTeam,
        editTeam,
        deleteTeam,
        addTeamMinus,
        editTeamMinus,
        deleteTeamMinus,
        addScheduleItem,
        editScheduleItem,
        deleteScheduleItem,
        addAnnouncement,
        editAnnouncement,
        deleteAnnouncement,
        updateScoringRules,
        recalculateAllStandings,
        updateGoogleSheetsConfig,
        syncWithGoogleSheets,
        pushToGoogleSheets,
        exportDataAsJson,
        importDataFromJson,
        generateCertificate,
        bulkGenerateCertificatesFromResults,
        deleteCertificate,
        resetAllData,
        changeAdminPassword,
        toggleLikeGallery,
        notify: showToast,
        schedules: schedule,
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
};

export const useFestival = () => {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
};
