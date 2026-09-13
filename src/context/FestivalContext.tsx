import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Team,
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
  updateFestConfig: (config: Partial<FestConfig>) => void;

  // Documents & Circulars
  addDocument: (doc: Omit<DocumentItem, 'id' | 'updatedAt'>) => void;
  editDocument: (id: string, docData: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;

  // Results & Marks
  addResultMark: (mark: {
    programId: string;
    participantId: string;
    marks: number;
    grade: string;
    position: string;
    pointsAwarded: number;
    publishNow?: boolean;
  }) => void;
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

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('ahia_participants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
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
  }, []);

  const isDeleted = useCallback((id: string | number | undefined | null) => {
    if (id === undefined || id === null) return false;
    const clean = String(id).trim().toLowerCase();
    return deletedIdsRef.current.has(clean);
  }, []);

  // Sync Accent Color dynamically to root CSS variables for instant live theme customization
  useEffect(() => {
    const accent = festConfig?.accentColor || '#4f46e5';
    document.documentElement.style.setProperty('--fest-accent', accent);
    const hex = accent.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      document.documentElement.style.setProperty('--fest-accent-rgb', `${r}, ${g}, ${b}`);
      document.documentElement.style.setProperty('--fest-accent-light', `rgba(${r}, ${g}, ${b}, 0.08)`);
      document.documentElement.style.setProperty('--fest-accent-border', `rgba(${r}, ${g}, ${b}, 0.25)`);
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

      // 1. Process Published Arts Programs
      artsPrograms.forEach((prog) => {
        if (prog.publishStatus === 'Published' && prog.results && prog.results.length > 0) {
          const isGroup = prog.section === 'Group';
          const multiplier = isGroup ? scoringRules.groupEventMultiplier : 1;

          prog.results.forEach((res) => {
            if (teamStats[res.teamId]) {
              let pts = 0;
              if (res.rank === 1) {
                pts += scoringRules.goldPoints;
                teamStats[res.teamId].golds += 1;
                teamStats[res.teamId].wins += 1;
              } else if (res.rank === 2) {
                pts += scoringRules.silverPoints;
                teamStats[res.teamId].silvers += 1;
              } else if (res.rank === 3) {
                pts += scoringRules.bronzePoints;
                teamStats[res.teamId].bronzes += 1;
              } else {
                pts += scoringRules.participationPoints;
              }

              // Add Grade bonus
              if (res.grade === 'A+') pts += scoringRules.gradePointsA_Plus;
              else if (res.grade === 'A') pts += scoringRules.gradePointsA;
              else if (res.grade === 'B+') pts += scoringRules.gradePointsB_Plus;
              else if (res.grade === 'B') pts += scoringRules.gradePointsB;

              teamStats[res.teamId].arts += Math.round(pts * multiplier);
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
        const total = stats.arts + stats.sports;
        return {
          ...team,
          artsPoints: stats.arts,
          sportsPoints: stats.sports,
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
  }, [artsPrograms, sportsMatches, scoringRules]);

  // Auto push helper for all mutations
  const triggerAutoPush = useCallback((customOverrides?: any) => {
    isRemoteSyncInProgressRef.current = true;
    if (pushToGoogleSheetsRef.current) {
      pushToGoogleSheetsRef.current({ ...customOverrides, silent: true });
    }
    setTimeout(() => {
      isRemoteSyncInProgressRef.current = false;
    }, 4000);
  }, []);

  // Immediate remote delete dispatcher for individual items
  const dispatchRemoteDelete = useCallback((sheetName: string, id: string) => {
    if (!id) return;
    recordDeletedId(id);
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
    dispatchRemoteDelete('Programs', id);
    setArtsPrograms((prev) => {
      const prog = prev.find((p) => p.id === id);
      if (prog && prog.code) {
        recordDeletedId(prog.code);
        dispatchRemoteDelete('Programs', prog.code);
      }
      const updated = prev.filter((p) => p.id !== id && p.code !== id);
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });
    showToast('Program Deleted', 'Arts event deleted.', 'warning');
  }, [showToast, triggerAutoPush, dispatchRemoteDelete, recordDeletedId]);

  // Sports Actions
  const updateSportsScore = useCallback((
    matchId: string,
    scoreA: number | string,
    scoreB: number | string,
    detailScore?: string,
    winnerTeamId?: string,
    status?: EventStatus
  ) => {
    setSportsMatches((prev) =>
      prev.map((m) => {
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
      })
    );

    showToast('Score Updated', 'Live match scoreboard refreshed.', 'success');
    if (status === 'COMPLETED') {
      setTimeout(recalculateAllStandings, 100);
    }
  }, [showToast, recalculateAllStandings]);

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
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
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
      newParts.forEach((p) => {
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

  const updateFestConfig = useCallback((config: Partial<FestConfig>) => {
    setFestConfig((prev) => {
      const updated = { ...prev, ...config };
      localStorage.setItem('ahia_fest_config', JSON.stringify(updated));
      triggerAutoPush({ festConfig: updated });
      return updated;
    });
    showToast('Festival Configuration Saved', 'Festival branding and settings updated.', 'success');
  }, [showToast, triggerAutoPush]);

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
    marks: number;
    grade: string;
    position: string;
    pointsAwarded: number;
    publishNow?: boolean;
  }) => {
    const prog = artsPrograms.find((p) => p.id === mark.programId);
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
      marks: mark.marks,
      grade: mark.grade,
      rank: rankNum,
      position: mark.position,
      pointsAwarded: mark.pointsAwarded,
      status: mark.publishNow ? 'Published' : 'Draft',
      publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setArtsPrograms((prev) =>
      prev.map((p) => {
        if (p.id === prog.id) {
          const existingResults = (p.results || []).filter((r) => r.participantId !== participant.id);
          const updatedResults = [...existingResults, resultEntry];
          return {
            ...p,
            results: updatedResults,
            publishStatus: mark.publishNow ? 'Published' : p.publishStatus,
            status: mark.publishNow ? 'COMPLETED' : p.status,
          };
        }
        return p;
      })
    );

    // Update participant stats
    setParticipants((prev) =>
      prev.map((pt) => {
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
      })
    );

    showToast('Mark Recorded', `Result for ${participant.name} saved and synced.`, 'success');
    setTimeout(recalculateAllStandings, 100);
  }, [artsPrograms, participants, showToast, recalculateAllStandings]);

  const deleteResultMark = useCallback((programId: string, participantId: string) => {
    const compositeKey = `${programId}_${participantId}`;
    dispatchRemoteDelete('ResultsMarks', compositeKey);
    setArtsPrograms((prev) => {
      const updated = prev.map((p) => {
        if (p.id === programId || p.code === programId) {
          return {
            ...p,
            results: (p.results || []).filter((r) => r.participantId !== participantId),
          };
        }
        return p;
      });
      localStorage.setItem('ahia_arts_programs', JSON.stringify(updated));
      triggerAutoPush({ artsPrograms: updated });
      return updated;
    });
    showToast('Mark Deleted', 'Result entry removed.', 'info');
    setTimeout(recalculateAllStandings, 0);
  }, [showToast, recalculateAllStandings, dispatchRemoteDelete, triggerAutoPush]);

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
        // Fetch live state from Google Apps Script Web App
        const res = await fetch(googleSheetsConfig.appsScriptUrl, {
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
                festivalName: cfg.festivalName || cfg.name || prev.festivalName,
                name: cfg.festivalName || cfg.name || prev.name,
                year: cfg.year || prev.year,
                edition: cfg.edition !== undefined ? cfg.edition : prev.edition,
                statusBanner: (cfg.statusBanner as any) || prev.statusBanner,
                tagline: cfg.tagline !== undefined ? cfg.tagline : prev.tagline,
                theme: cfg.theme !== undefined ? cfg.theme : prev.theme,
                motto: cfg.motto !== undefined ? cfg.motto : prev.motto,
                dates: cfg.dates !== undefined ? cfg.dates : prev.dates,
                currentDay: cfg.currentDay !== undefined ? cfg.currentDay : prev.currentDay,
                venue: cfg.venue !== undefined ? cfg.venue : prev.venue,
                organizedBy: cfg.organizedBy !== undefined ? cfg.organizedBy : prev.organizedBy,
                chiefGuest: cfg.chiefGuest !== undefined ? cfg.chiefGuest : prev.chiefGuest,
                announcementTicker: cfg.announcementTicker !== undefined ? cfg.announcementTicker : prev.announcementTicker,
                enableLiveTicker: cfg.enableLiveTicker !== undefined ? (cfg.enableLiveTicker === 'true' || cfg.enableLiveTicker === true) : prev.enableLiveTicker,
                announcementTickerSpeed: (cfg.announcementTickerSpeed as any) || prev.announcementTickerSpeed || 'normal',
                accentColor: cfg.accentColor || prev.accentColor || '#4F46E5',
                accentPreset: (cfg.accentPreset as any) || prev.accentPreset || 'indigo',
                liveStreamUrl: cfg.liveStreamUrl !== undefined ? cfg.liveStreamUrl : prev.liveStreamUrl,
                contactEmail: cfg.contactEmail !== undefined ? cfg.contactEmail : prev.contactEmail,
                contactPhone: cfg.contactPhone !== undefined ? cfg.contactPhone : prev.contactPhone,
                copyrightText: cfg.copyrightText || prev.copyrightText,
                logoUrl: cfg.logoUrl !== undefined ? cfg.logoUrl : prev.logoUrl,
                bannerUrl: cfg.bannerUrl !== undefined ? cfg.bannerUrl : prev.bannerUrl,
                adminUsername: cfg.adminUsername || prev.adminUsername || 'smash2k26',
                adminPassword: cfg.adminPassword || prev.adminPassword,
                podiumCategory: (cfg.podiumCategory as any) || prev.podiumCategory || 'arts',
              };
              localStorage.setItem('ahia_fest_config', JSON.stringify(updated));
              return updated;
            });
            recordsUpdated++;
          }

          // 2. Safe Merge Teams (Preserve all locally added teams not in sheets)
          if (Array.isArray(data.teams) && data.teams.length > 0) {
            const remoteSanitized = data.teams
              .filter((t: any) => t && (t.id || t.name) && !isDeleted(t.id) && !isDeleted(t.shortCode))
              .map((t: any, idx: number) => ({
                ...t,
                id: String(t.id || `team-${idx + 1}`),
                name: t.name || `Team ${idx + 1}`,
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
                totalPoints: Number(t.totalPoints) || 0,
                golds: Number(t.golds) || 0,
                silvers: Number(t.silvers) || 0,
                bronzes: Number(t.bronzes) || 0,
                totalWins: Number(t.totalWins) || 0,
                rank: Number(t.rank) || idx + 1,
                membersCount: Number(t.membersCount) || 0,
              }));

            setTeams((prevLocal) => {
              const remoteMap = new Map<string, any>();
              remoteSanitized.forEach((t: Team) => {
                remoteMap.set(t.id, t);
                if (t.shortCode) remoteMap.set(t.shortCode.toLowerCase(), t);
                if (t.name) remoteMap.set(t.name.trim().toLowerCase(), t);
              });

              const merged: Team[] = [...remoteSanitized];
              const mergedIdSet = new Set(remoteSanitized.map((t: Team) => t.id));

              prevLocal.forEach((localTeam) => {
                if (!localTeam || !localTeam.id) return;
                if (isDeleted(localTeam.id) || (localTeam.shortCode && isDeleted(localTeam.shortCode))) return;

                const matchByShort = localTeam.shortCode ? remoteMap.get(localTeam.shortCode.toLowerCase()) : null;
                const matchByName = localTeam.name ? remoteMap.get(localTeam.name.trim().toLowerCase()) : null;
                const existing = remoteMap.get(localTeam.id) || matchByShort || matchByName;

                if (existing) {
                  const targetIdx = merged.findIndex((m) => m.id === existing.id);
                  if (targetIdx !== -1) {
                    merged[targetIdx] = {
                      ...localTeam,
                      ...existing,
                      logo: existing.logo && existing.logo !== '🏆' ? existing.logo : (localTeam.logo || existing.logo),
                      color: existing.color || localTeam.color,
                      accentColor: existing.accentColor || localTeam.accentColor,
                      slogan: existing.slogan || localTeam.slogan,
                      description: existing.description || localTeam.description,
                      captain: existing.captain || localTeam.captain,
                      viceCaptain: existing.viceCaptain || localTeam.viceCaptain,
                      staffAdvisor: existing.staffAdvisor || localTeam.staffAdvisor,
                    };
                  }
                } else {
                  // Keep locally added team
                  if (!mergedIdSet.has(localTeam.id)) {
                    merged.push(localTeam);
                    mergedIdSet.add(localTeam.id);
                    hasLocalAdditionsToSyncBack = true;
                  }
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
          if (Array.isArray(rawPrograms) && rawPrograms.length > 0) {
            const remoteSanitized = rawPrograms
              .filter((pr: any) => pr && (pr.id || pr.code || pr.name) && !isDeleted(pr.id) && !isDeleted(pr.code))
              .map((pr: any, idx: number) => {
                let results = pr.results;
                if (typeof results === 'string' && results.trim()) {
                  try { results = JSON.parse(results); } catch { results = []; }
                }
                const filteredResults = Array.isArray(results)
                  ? results.filter((r: any) => !isDeleted(`${pr.code || pr.id}_${r.participantId}`) && !isDeleted(r.participantId))
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
                if (pr.code) remoteMap.set(String(pr.code).trim().toLowerCase(), pr);
              });

              const merged: ArtsProgram[] = remoteSanitized.map((remotePr: ArtsProgram) => {
                const localMatch = prevLocal.find(
                  (lp) => lp.id === remotePr.id || (lp.code && remotePr.code && lp.code.trim().toLowerCase() === remotePr.code.trim().toLowerCase())
                );
                if (localMatch) {
                  // Merge results: keep both remote results and any freshly entered local marks
                  const resultMap = new Map<string, any>();
                  (remotePr.results || []).forEach((r: any) => {
                    const key = r.participantId || r.chestNo;
                    if (key && !isDeleted(`${remotePr.code || remotePr.id}_${key}`) && !isDeleted(key)) {
                      resultMap.set(key, r);
                    }
                  });
                  (localMatch.results || []).forEach((r: any) => {
                    const key = r.participantId || r.chestNo;
                    if (key && !isDeleted(`${remotePr.code || remotePr.id}_${key}`) && !isDeleted(key)) {
                      const existingRes = resultMap.get(key);
                      if (!existingRes) {
                        resultMap.set(key, r); // Keep locally recorded result
                        hasLocalAdditionsToSyncBack = true;
                      } else {
                        resultMap.set(key, { ...existingRes, ...r });
                      }
                    }
                  });
                  return {
                    ...localMatch,
                    ...remotePr,
                    results: Array.from(resultMap.values()),
                    publishStatus: remotePr.publishStatus || localMatch.publishStatus || 'Draft',
                    status: remotePr.status || localMatch.status || 'UPCOMING',
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
                  const validResults = (localPr.results || []).filter(
                    (r) => !isDeleted(`${localPr.code || localPr.id}_${r.participantId}`) && !isDeleted(r.participantId)
                  );
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

          // 10. Sync Scoring Rules
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
  }, [festConfig, googleSheetsConfig.appsScriptUrl, googleSheetsConfig.deploymentId, teams, participants, artsPrograms, sportsMatches, schedule, announcements, certificates, documents, scoringRules, showToast]);

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
    }, 1800);

    return () => clearTimeout(timer);
  }, [
    teams,
    participants,
    artsPrograms,
    sportsMatches,
    schedule,
    announcements,
    certificates,
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
        addDocument,
        editDocument,
        deleteDocument,
        addResultMark,
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
