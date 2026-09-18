import React, { useState, useMemo, useEffect } from 'react';
import { SparklesIcon as Sparkles, Calendar01Icon as Calendar, UserIcon as User, UserGroupIcon as Users, File01Icon as FileText, Settings01Icon as Settings, CodeIcon as Code, Add01Icon as Plus, Delete01Icon as Trash2, Tick01Icon as CheckCircle2, Download01Icon as Download, Upload01Icon as Upload, Copy01Icon as Copy, Tick01Icon as Check, Search01Icon as Search, Cancel01Icon as X, LockIcon as Lock, Logout01Icon as LogOut, LinkSquare01Icon as ExternalLink, Edit02Icon as Edit2, Shield01Icon as Shield, EyeIcon as Eye, ViewOffIcon as EyeOff, RadioIcon as Radio, ReloadIcon as RotateCcw, BookOpen01Icon as BookOpen, ArrowLeft01Icon as ArrowLeft, Activity02Icon as Activity, Megaphone01Icon as Megaphone, Clock01Icon as Clock, Award01Icon as Award, Award01Icon as Trophy } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import {
  ArtsProgram,
  ArtsResultEntry,
  Team,
  Participant,
  DocumentItem,
  EventStatus,
  FestConfig,
} from '../../types/festival';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../data/googleAppsScriptCode';
import { isSportsProgram, deduplicateProgramResults } from '../../utils/programHelpers';
import { AdminSportsSection } from './AdminSportsSection';
import { AdminAnnouncementsSection } from './AdminAnnouncementsSection';
import { AdminScheduleSection } from './AdminScheduleSection';
import { AdminScoringSection } from './AdminScoringSection';
import { AdminTeamMinusesSection } from './AdminTeamMinusesSection';
import { AdminCertificatesSection } from './AdminCertificatesSection';
import { AdminBulkDataModal } from './AdminBulkDataModal';
import { ResultPodiumModal, isProgramPublished } from './ResultPodiumModal';
import { TeamLogo, ParticipantAvatar } from '../ui/TeamLogo';
import { generateResultsPDF, generateSportsResultsPDF, generateArtsResultsOnlyPDF } from '../../utils/pdfExport';

interface AdminDashboardProps {
  onClose?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const {
    adminUser,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
    resetAllData,
    artsPrograms,
    sportsMatches,
    teams,
    participants,
    documents,
    festConfig,
    updateFestConfig,
    addDocument,
    deleteDocument,
    editDocument,
    addResultMark,
    deleteResultMark,
    addArtsProgram,
    deleteArtsProgram,
    editArtsProgram,
    addParticipant,
    deleteParticipant,
    editParticipant,
    addTeam,
    editTeam,
    deleteTeam,
    googleSheetsConfig,
    updateGoogleSheetsConfig,
    syncWithGoogleSheets,
    pushToGoogleSheets,
    exportDataAsJson,
    importDataFromJson,
    showToast,
  } = useFestival();

  // Navigation tab state matching all web sections
  const [activeTab, setActiveTab] = useState<
    | 'results'
    | 'programs'
    | 'sports'
    | 'participants'
    | 'teams'
    | 'announcements'
    | 'schedule'
    | 'scoring'
    | 'docs'
    | 'certificates'
    | 'settings'
    | 'sheets'
  >('results');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Bulk CSV Import/Export Modal State
  const [isBulkCsvModalOpen, setIsBulkCsvModalOpen] = useState(false);
  const [bulkCsvInitialTab, setBulkCsvInitialTab] = useState<'participants' | 'sports'>('participants');

  // -------------------------------------------------------------
  // TAB 1: RESULTS & MARKS EVALUATION
  // -------------------------------------------------------------
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsProgramFilter, setResultsProgramFilter] = useState('All');
  const [resultsCategoryFilter, setResultsCategoryFilter] = useState('All');
  const [resultsHouseFilter, setResultsHouseFilter] = useState('All');
  const [isPodiumModalOpen, setIsPodiumModalOpen] = useState(false);
  const [podiumModalProgramId, setPodiumModalProgramId] = useState('');

  // Aggregate all result entries across programs with rich participant & house fallback
  const allResultRecords = useMemo(() => {
    const list: Array<ArtsResultEntry & { programTitle: string; programCode: string; programObjId: string; programCategory: string }> = [];
    const seenRecordKeys = new Set<string>();

    artsPrograms.forEach((p) => {
      const cleanResults = deduplicateProgramResults(p.results || []);
      cleanResults.forEach((r) => {
        const pt = participants.find((part) => part.id === r.participantId || (part.chestNo && r.chestNo && part.chestNo.toLowerCase() === r.chestNo.toLowerCase()));
        const tm = teams.find((t) => t.id === r.teamId || t.id === r.participantId || (pt && t.id === pt.teamId));

        const pKey = p.id || p.code;
        const partKey = r.participantId || (r.chestNo ? String(r.chestNo).trim().toLowerCase() : '') || (r.admissionNo ? String(r.admissionNo).trim().toLowerCase() : '') || r.id;
        const rankKey = r.rank ? `r_${r.rank}` : '';
        const uniqueKey = `${pKey}_${partKey}_${rankKey}`;

        if (seenRecordKeys.has(uniqueKey)) return;
        seenRecordKeys.add(uniqueKey);

        list.push({
          ...r,
          participantName: r.participantName || pt?.name || tm?.name || 'Winner',
          teamId: r.teamId || pt?.teamId || tm?.id || '',
          chestNo: r.chestNo || pt?.chestNo || '',
          admissionNo: r.admissionNo || pt?.admissionNo || '',
          programObjId: p.id,
          programTitle: p.name,
          programCode: p.code || 'EV-' + p.id.slice(-3),
          programCategory: p.category || pt?.category || 'General',
        });
      });
    });
    return list;
  }, [artsPrograms, participants, teams]);

  const filteredResults = useMemo(() => {
    const q = (resultsSearch || '').toLowerCase().trim();
    const cleanQ = q.replace(/[\s-_]/g, '');
    return allResultRecords.filter((r) => {
      const cleanAdm = String(r.admissionNo || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanCode = String(r.programCode || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanTitle = String(r.programTitle || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanChest = String(r.chestNo || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanName = String(r.participantName || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanCat = String(r.programCategory || '').toLowerCase().replace(/[\s-_]/g, '');
      const house = teams.find((t) => t.id === r.teamId);
      const cleanHouse = String(house?.name || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanPos = String(r.position || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanGrade = String(r.grade || '').toLowerCase().replace(/[\s-_]/g, '');

      const matchQuery =
        !q ||
        (cleanQ && cleanAdm.includes(cleanQ)) ||
        (cleanQ && cleanCode.includes(cleanQ)) ||
        (cleanQ && cleanTitle.includes(cleanQ)) ||
        (cleanQ && cleanChest.includes(cleanQ)) ||
        (cleanQ && cleanName.includes(cleanQ)) ||
        (cleanQ && cleanHouse.includes(cleanQ)) ||
        (cleanQ && cleanCat.includes(cleanQ)) ||
        (cleanQ && cleanPos.includes(cleanQ)) ||
        (cleanQ && cleanGrade.includes(cleanQ)) ||
        String(r.programTitle || '').toLowerCase().includes(q) ||
        String(r.programCode || '').toLowerCase().includes(q) ||
        String(r.participantName || '').toLowerCase().includes(q) ||
        String(r.chestNo || '').toLowerCase().includes(q) ||
        String(house?.name || '').toLowerCase().includes(q) ||
        String(r.grade || '').toLowerCase().includes(q) ||
        String(r.position || '').toLowerCase().includes(q);

      const matchProgram =
        resultsProgramFilter === 'All' ||
        r.programObjId === resultsProgramFilter ||
        r.programTitle === resultsProgramFilter ||
        r.programCode === resultsProgramFilter ||
        (r.programCode && resultsProgramFilter && r.programCode.toLowerCase() === resultsProgramFilter.toLowerCase());

      const matchCategory =
        resultsCategoryFilter === 'All' ||
        r.programCategory?.toLowerCase() === resultsCategoryFilter.toLowerCase() ||
        (cleanCat && cleanCat === resultsCategoryFilter.toLowerCase().replace(/[\s-_]/g, ''));

      const matchHouse =
        resultsHouseFilter === 'All' ||
        r.teamId === resultsHouseFilter ||
        (house && house.id === resultsHouseFilter);

      return matchQuery && matchProgram && matchCategory && matchHouse;
    });
  }, [allResultRecords, resultsSearch, resultsProgramFilter, resultsCategoryFilter, resultsHouseFilter, teams]);

  const handleOpenNewMarkModal = () => {
    if (artsPrograms.length === 0) {
      showToast('No Programs Found', 'Please add a Program first in the Programs tab.', 'warning');
      setActiveTab('programs');
      return;
    }
    setPodiumModalProgramId(artsPrograms[0]?.id || '');
    setIsPodiumModalOpen(true);
  };

  const handleOpenEditMarkModal = (markRecord: any) => {
    setPodiumModalProgramId(markRecord.programObjId);
    setIsPodiumModalOpen(true);
  };

  const handleDownloadResultsPDF = (filterCurrentView: boolean = false) => {
    if (allResultRecords.length === 0) {
      showToast('No Results Recorded', 'There are no published or recorded results to export to PDF.', 'warning');
      return;
    }

    try {
      const selectedProg = artsPrograms.find((p) => p.id === resultsProgramFilter);
      const selectedHouse = teams.find((t) => t.id === resultsHouseFilter);

      generateResultsPDF(artsPrograms, teams, participants, {
        festConfig,
        filterProgramId: filterCurrentView && resultsProgramFilter !== 'All' ? resultsProgramFilter : undefined,
        filterProgramTitle: filterCurrentView && selectedProg ? selectedProg.name : undefined,
        filterHouseId: filterCurrentView && resultsHouseFilter !== 'All' ? resultsHouseFilter : undefined,
        filterHouseName: filterCurrentView && selectedHouse ? selectedHouse.name : undefined,
        searchTerm: filterCurrentView && resultsSearch ? resultsSearch : undefined,
      });

      showToast(
        'PDF Downloaded',
        filterCurrentView && (resultsProgramFilter !== 'All' || resultsHouseFilter !== 'All' || resultsSearch)
          ? `Filtered results exported to official PDF statement.`
          : `Official PDF exported with Sub Junior, Junior, Senior, General divisions, category team totals, and grand total standings.`,
        'success'
      );
    } catch (err: any) {
      console.error('Failed to generate results PDF:', err);
      showToast('Export Error', 'Failed to generate results PDF. Please try again.', 'error');
    }
  };

  const handleDownloadSportsResultsPDF = () => {
    try {
      generateSportsResultsPDF(sportsMatches, teams, participants, { festConfig }, artsPrograms);
      showToast('Sports PDF Downloaded', 'Official Sports Championship & Athletics results exported to PDF.', 'success');
    } catch (err: any) {
      console.error('Failed to generate sports results PDF:', err);
      showToast('Export Error', 'Failed to generate sports results PDF. Please try again.', 'error');
    }
  };

  const handleDownloadArtsResultsOnlyPDF = () => {
    if (allResultRecords.length === 0) {
      showToast('No Results Recorded', 'There are no published arts results to export.', 'warning');
      return;
    }
    try {
      generateArtsResultsOnlyPDF(artsPrograms, teams, participants, { festConfig });
      showToast('Arts Results Only PDF Downloaded', 'Official Arts competition results statement (results only) exported.', 'success');
    } catch (err: any) {
      console.error('Failed to generate arts results only PDF:', err);
      showToast('Export Error', 'Failed to generate arts results PDF. Please try again.', 'error');
    }
  };

  // -------------------------------------------------------------
  // TAB 2: PROGRAMS & FIXTURES MANAGER
  // -------------------------------------------------------------
  const [progSearch, setProgSearch] = useState('');
  const [progTypeFilter, setProgTypeFilter] = useState('All');
  const [progCategoryFilter, setProgCategoryFilter] = useState('All');
  const [progStatusFilter, setProgStatusFilter] = useState('All');
  const [isNewProgModalOpen, setIsNewProgModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ArtsProgram | null>(null);

  // New Program Form
  const [newProgCode, setNewProgCode] = useState('');
  const [newProgName, setNewProgName] = useState('');
  const [newProgType, setNewProgType] = useState<'Arts' | 'Sports'>('Arts');
  const [newProgCategory, setNewProgCategory] = useState<'Senior' | 'Junior' | 'Sub Junior' | 'General'>('Senior');
  const [newProgScheduleDay, setNewProgScheduleDay] = useState('Day 1');
  const [newProgVenue, setNewProgVenue] = useState('Main Stage');
  const [newProgStatus, setNewProgStatus] = useState<EventStatus>('UPCOMING');

  const filteredPrograms = useMemo(() => {
    const q = (progSearch || '').toLowerCase();
    return artsPrograms.filter((p) => {
      const matchSearch =
        !q ||
        String(p.code || '').toLowerCase().includes(q) ||
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.venue || '').toLowerCase().includes(q) ||
        String(p.stage || '').toLowerCase().includes(q) ||
        String(p.scheduledTime || '').toLowerCase().includes(q);

      const isSport = isSportsProgram(p);
      const matchType =
        progTypeFilter === 'All' ||
        (progTypeFilter === 'Arts' && !isSport) ||
        (progTypeFilter === 'Sports' && isSport);

      const matchCategory =
        progCategoryFilter === 'All' || p.category === progCategoryFilter;

      const matchStatus =
        progStatusFilter === 'All' ||
        (progStatusFilter === 'Upcoming' && p.status === 'UPCOMING') ||
        (progStatusFilter === 'Live' && p.status === 'LIVE') ||
        (progStatusFilter === 'Completed' && p.status === 'COMPLETED') ||
        (progStatusFilter === 'Postponed' && p.status === 'RESULT PENDING');

      return matchSearch && matchType && matchCategory && matchStatus;
    });
  }, [artsPrograms, progSearch, progTypeFilter, progCategoryFilter, progStatusFilter]);

  const handleOpenNewProgModal = () => {
    setEditingProgram(null);
    const nextNum = artsPrograms.length + 101;
    setNewProgCode(`EV-${nextNum}`);
    setNewProgName('');
    setNewProgType('Arts');
    setNewProgCategory('Senior');
    setNewProgScheduleDay('Day 1');
    setNewProgVenue('Main Stage');
    setNewProgStatus('UPCOMING');
    setIsNewProgModalOpen(true);
  };

  const handleOpenEditProgModal = (prog: ArtsProgram) => {
    setEditingProgram(prog);
    setNewProgCode(prog.code || '');
    setNewProgName(prog.name || '');
    setNewProgType(isSportsProgram(prog) ? 'Sports' : 'Arts');
    setNewProgCategory((prog.category as any) || 'Senior');
    setNewProgScheduleDay(prog.scheduledTime || prog.date || 'Day 1');
    setNewProgVenue(prog.stage || prog.venue || 'Main Stage');
    setNewProgStatus(prog.status || 'UPCOMING');
    setIsNewProgModalOpen(true);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName.trim()) {
      showToast('Error', 'Please enter a program name.', 'error');
      return;
    }

    if (editingProgram) {
      editArtsProgram(editingProgram.id, {
        code: newProgCode.trim() || editingProgram.code,
        name: newProgName.trim(),
        category: newProgCategory,
        disciplineType: newProgType,
        stage: newProgVenue.trim() || 'Main Stage',
        venue: newProgVenue.trim() || 'Main Auditorium',
        date: newProgScheduleDay,
        scheduledTime: newProgScheduleDay,
        status: newProgStatus,
      });
      showToast('Program Updated', 'Program details modified.', 'success');
    } else {
      addArtsProgram({
        code: newProgCode.trim() || `EV-${artsPrograms.length + 1}`,
        name: newProgName.trim(),
        category: newProgCategory,
        section: 'Individual',
        disciplineType: newProgType,
        stage: newProgVenue.trim() || 'Main Stage',
        venue: newProgVenue.trim() || 'Main Auditorium',
        date: newProgScheduleDay,
        time: '10:00 AM',
        scheduledTime: newProgScheduleDay,
        maxMarks: 100,
        status: newProgStatus,
        publishStatus: 'Draft',
        judges: ['Official Festival Jury'],
        participantsCount: 0,
        registeredParticipantIds: [],
      });
    }

    setEditingProgram(null);
    setIsNewProgModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 3: STUDENT PARTICIPANTS DATABASE
  // -------------------------------------------------------------
  const [partSearch, setPartSearch] = useState('');
  const [partHouseFilter, setPartHouseFilter] = useState('All');
  const [partCategoryFilter, setPartCategoryFilter] = useState('All');
  const [isNewPartModalOpen, setIsNewPartModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  // New Participant Form
  const [newPartAdmission, setNewPartAdmission] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartTeamId, setNewPartTeamId] = useState('');
  const [newPartCategory, setNewPartCategory] = useState<'Senior' | 'Junior' | 'Sub Junior' | 'General'>('Senior');
  const [newPartClass, setNewPartClass] = useState('XII');
  const [newPartSection, setNewPartSection] = useState('A');
  const [newPartPhotoUrl, setNewPartPhotoUrl] = useState('');

  const filteredParticipants = useMemo(() => {
    const q = (partSearch || '').toLowerCase().trim();
    const cleanQ = q.replace(/[\s-_]/g, '');
    return participants.filter((p) => {
      const cleanAdm = String(p.admissionNo || '').toLowerCase().replace(/[\s-_]/g, '');
      const cleanName = String(p.name || '').toLowerCase();
      const cleanChest = String(p.chestNo || '').toLowerCase().replace(/[\s-_]/g, '');
      const matchSearch =
        !q ||
        cleanName.includes(q) ||
        (cleanQ && cleanAdm.includes(cleanQ)) ||
        (cleanQ && cleanChest.includes(cleanQ));

      const matchHouse =
        partHouseFilter === 'All' || p.teamId === partHouseFilter;

      const matchCategory =
        partCategoryFilter === 'All' || p.category === partCategoryFilter;

      return matchSearch && matchHouse && matchCategory;
    });
  }, [participants, partSearch, partHouseFilter, partCategoryFilter]);

  const handleOpenNewPartModal = () => {
    setEditingParticipant(null);
    const nextAdm = 1000 + participants.length + 1;
    setNewPartAdmission(`AD-${nextAdm}`);
    setNewPartName('');
    setNewPartTeamId(teams[0]?.id || 'team-1');
    setNewPartCategory('Senior');
    setNewPartClass('XII');
    setNewPartSection('A');
    setNewPartPhotoUrl('');
    setIsNewPartModalOpen(true);
  };

  const handleOpenEditPartModal = (pt: Participant) => {
    setEditingParticipant(pt);
    setNewPartAdmission(pt.admissionNo || '');
    setNewPartName(pt.name || '');
    setNewPartTeamId(pt.teamId || teams[0]?.id || 'team-1');
    setNewPartCategory((pt.category as any) || 'Senior');
    const classParts = (pt.yearClass || '').split(' ');
    setNewPartClass(classParts[0] || pt.classGrade || 'XII');
    setNewPartSection(classParts[1] || pt.sectionName || 'A');
    setNewPartPhotoUrl(pt.photo || '');
    setIsNewPartModalOpen(true);
  };

  const handleSaveParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) {
      showToast('Error', 'Please enter student name.', 'error');
      return;
    }

    if (editingParticipant) {
      editParticipant(editingParticipant.id, {
        name: newPartName.trim(),
        admissionNo: newPartAdmission.trim() || editingParticipant.admissionNo,
        teamId: newPartTeamId || editingParticipant.teamId,
        category: newPartCategory as 'Senior' | 'Junior' | 'Sub Junior',
        yearClass: `${newPartClass} ${newPartSection}`.trim(),
        classGrade: newPartClass,
        sectionName: newPartSection,
        photo: newPartPhotoUrl.trim() || editingParticipant.photo,
      });
      showToast('Participant Updated', 'Student profile details modified.', 'success');
    } else {
      addParticipant({
        name: newPartName.trim(),
        admissionNo: newPartAdmission.trim() || `AD-${Date.now() % 10000}`,
        chestNo: `C-${(participants.length + 101).toString()}`,
        teamId: newPartTeamId || teams[0]?.id || 'team-1',
        category: newPartCategory as 'Senior' | 'Junior' | 'Sub Junior',
        section: 'Individual',
        yearClass: `${newPartClass} ${newPartSection}`.trim(),
        classGrade: newPartClass,
        sectionName: newPartSection,
        photo: newPartPhotoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
    }

    setEditingParticipant(null);
    setIsNewPartModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 4: CHAMPIONSHIP HOUSES
  // -------------------------------------------------------------
  const [houseSearch, setHouseSearch] = useState('');
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShortCode, setNewTeamShortCode] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#4f46e5');
  const [newTeamAccentColor, setNewTeamAccentColor] = useState('#6366f1');
  const [newTeamSlogan, setNewTeamSlogan] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('');
  const [newTeamCaptain, setNewTeamCaptain] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  const filteredHouses = useMemo(() => {
    const q = (houseSearch || '').toLowerCase();
    return teams.filter((t) =>
      !q ||
      String(t.name || '').toLowerCase().includes(q) ||
      String(t.slogan || '').toLowerCase().includes(q)
    );
  }, [teams, houseSearch]);

  const handleOpenNewTeamModal = () => {
    const nextNum = teams.length + 1;
    setNewTeamName(`House ${String.fromCharCode(64 + nextNum)}`);
    setNewTeamShortCode(`H${nextNum}`);
    setNewTeamColor('#4f46e5');
    setNewTeamAccentColor('#6366f1');
    setNewTeamSlogan('Glory and Excellence');
    setNewTeamLogo('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80');
    setNewTeamCaptain('House Captain');
    setNewTeamDesc('Official festival championship house.');
    setIsNewTeamModalOpen(true);
  };

  const handleSaveNewTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      showToast('Error', 'Please enter a team name.', 'error');
      return;
    }
    addTeam({
      name: newTeamName.trim(),
      shortCode: (newTeamShortCode.trim() || newTeamName.slice(0, 3)).toUpperCase(),
      color: newTeamColor,
      accentColor: newTeamAccentColor || newTeamColor,
      logo: newTeamLogo.trim() || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80',
      captain: newTeamCaptain.trim() || 'House Captain',
      description: newTeamDesc.trim() || newTeamSlogan.trim() || 'Official Championship House',
      slogan: newTeamSlogan.trim() || 'Championship Contender',
      membersCount: 0,
    });
    setIsNewTeamModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 5: DOCS & CIRCULARS
  // -------------------------------------------------------------
  const [docSearch, setDocSearch] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);

  // New Doc Form
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Official Circular');
  const [newDocDate, setNewDocDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDocLink, setNewDocLink] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocPublic, setNewDocPublic] = useState(true);

  const filteredDocs = useMemo(() => {
    const q = (docSearch || '').toLowerCase();
    const catQ = (docCategoryFilter || '').toLowerCase();
    return documents.filter((d) => {
      const matchSearch =
        !q ||
        String(d.title || '').toLowerCase().includes(q) ||
        String(d.description || '').toLowerCase().includes(q) ||
        String(d.category || '').toLowerCase().includes(q);

      const matchCategory =
        docCategoryFilter === 'All' ||
        String(d.category || '').toLowerCase().includes(catQ);

      return matchSearch && matchCategory;
    });
  }, [documents, docSearch, docCategoryFilter]);

  const handleOpenNewDocModal = () => {
    setEditingDoc(null);
    setNewDocTitle('');
    setNewDocCategory('Official Circular');
    setNewDocDate(new Date().toISOString().split('T')[0]);
    setNewDocLink('');
    setNewDocDesc('');
    setNewDocPublic(true);
    setIsNewDocModalOpen(true);
  };

  const handleOpenEditDocModal = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setNewDocTitle(doc.title || '');
    setNewDocCategory(doc.category || 'Official Circular');
    setNewDocDate(doc.issueDate || new Date().toISOString().split('T')[0]);
    setNewDocLink(doc.fileUrl || '');
    setNewDocDesc(doc.description || '');
    setNewDocPublic(doc.isPublic ?? true);
    setIsNewDocModalOpen(true);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) {
      showToast('Error', 'Please enter a document title.', 'error');
      return;
    }

    if (editingDoc) {
      editDocument(editingDoc.id, {
        title: newDocTitle.trim(),
        category: newDocCategory,
        description: newDocDesc.trim(),
        issueDate: newDocDate,
        fileUrl: newDocLink.trim(),
        isPublic: newDocPublic,
      });
      showToast('Document Updated', 'Official record modified successfully.', 'success');
    } else {
      addDocument({
        title: newDocTitle.trim(),
        category: newDocCategory,
        description: newDocDesc.trim(),
        issueDate: newDocDate,
        fileUrl: newDocLink.trim(),
        fileSize: 'PDF (Online)',
        status: 'Active',
        isPublic: newDocPublic,
      });
    }

    setEditingDoc(null);
    setIsNewDocModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 6: FEST SETTINGS
  // -------------------------------------------------------------
  const [festNameInput, setFestNameInput] = useState(String(festConfig?.festivalName || 'smash 2026'));
  const [festYearInput, setFestYearInput] = useState(String(festConfig?.year || '2026'));
  const [festEditionInput, setFestEditionInput] = useState(String(festConfig?.edition || 'Annual Championship Edition'));
  const [festBannerInput, setFestBannerInput] = useState<'LIVE' | 'UPCOMING' | 'CONCLUDED' | 'PAUSED'>(
    festConfig?.statusBanner || 'LIVE'
  );
  const [festTaglineInput, setFestTaglineInput] = useState(
    String(festConfig?.tagline || 'Annual Inter-House Arts & Athletics Fest')
  );
  const [festThemeInput, setFestThemeInput] = useState(
    String(festConfig?.theme || 'Where talent meets competition.')
  );
  const [festVenueInput, setFestVenueInput] = useState(
    String(festConfig?.venue || 'Grand Central Stage & Main Athletic Arena')
  );
  const [festOrganizedByInput, setFestOrganizedByInput] = useState(
    String(festConfig?.organizedBy || 'Hidaya Union Devoted Activities (HUDA)')
  );
  const [festChiefGuestInput, setFestChiefGuestInput] = useState(
    String(festConfig?.chiefGuest || 'Prof. Dr. K. M. Andrews')
  );
  const [festLogoUrlInput, setFestLogoUrlInput] = useState(String(festConfig?.logoUrl || ''));
  const [festBannerUrlInput, setFestBannerUrlInput] = useState(String(festConfig?.bannerUrl || ''));
  const [festPasswordInput, setFestPasswordInput] = useState('');
  const [festAdminUsernameInput, setFestAdminUsernameInput] = useState(String(festConfig?.adminUsername || 'smash2k26'));
  const [festCelebrationMode, setFestCelebrationMode] = useState(Boolean(festConfig?.isCelebrationMode));
  const [festApplyPenaltiesToPodium, setFestApplyPenaltiesToPodium] = useState(festConfig?.applyPenaltiesToPodium ?? true);
  const [festApplyArtsPenalties, setFestApplyArtsPenalties] = useState(festConfig?.applyArtsPenalties ?? (festConfig?.applyPenaltiesToPodium ?? true));
  const [festApplySportsPenalties, setFestApplySportsPenalties] = useState(festConfig?.applySportsPenalties ?? (festConfig?.applyPenaltiesToPodium ?? true));
  const [festPodiumCategory, setFestPodiumCategory] = useState<'arts' | 'sports'>(
    festConfig?.podiumCategory === 'sports' ? 'sports' : 'arts'
  );

  // Web Theme Accent Color & Controls
  const [festAccentColor, setFestAccentColor] = useState(String(festConfig?.accentColor || '#4F46E5'));
  const [festAccentPreset, setFestAccentPreset] = useState<string>(festConfig?.accentPreset || 'indigo');
  const [festTickerText, setFestTickerText] = useState(String(festConfig?.announcementTicker || ''));
  const [festEnableTicker, setFestEnableTicker] = useState<boolean>(festConfig?.enableLiveTicker ?? true);
  const [festTickerSpeed, setFestTickerSpeed] = useState<'slow' | 'normal' | 'fast'>(festConfig?.announcementTickerSpeed || 'normal');
  const [festLiveStreamUrl, setFestLiveStreamUrl] = useState(String(festConfig?.liveStreamUrl || ''));
  const [festContactEmail, setFestContactEmail] = useState(String(festConfig?.contactEmail || 'festival@ahiaedu.org'));
  const [festContactPhone, setFestContactPhone] = useState(String(festConfig?.contactPhone || '+91 98470 12345'));
  const [festCopyright, setFestCopyright] = useState(String(festConfig?.copyrightText || '© 2026 AHIA FEST • Hidaya Union Devoted Activities (HUDA). All Rights Reserved.'));

  // Synchronize input fields when festConfig updates from Google Sheets or localStorage
  useEffect(() => {
    if (festConfig) {
      setFestNameInput(String(festConfig.festivalName || 'smash 2026'));
      setFestYearInput(String(festConfig.year || '2026'));
      setFestEditionInput(String(festConfig.edition || 'Annual Championship Edition'));
      setFestBannerInput(festConfig.statusBanner || 'LIVE');
      setFestTaglineInput(String(festConfig.tagline || 'Annual Inter-House Arts & Athletics Fest'));
      setFestThemeInput(String(festConfig.theme || 'Where talent meets competition.'));
      setFestVenueInput(String(festConfig.venue || 'Grand Central Stage & Main Athletic Arena'));
      setFestOrganizedByInput(String(festConfig.organizedBy || 'Hidaya Union Devoted Activities (HUDA)'));
      setFestChiefGuestInput(String(festConfig.chiefGuest || 'Prof. Dr. K. M. Andrews'));
      setFestLogoUrlInput(String(festConfig.logoUrl || ''));
      setFestBannerUrlInput(String(festConfig.bannerUrl || ''));
      setFestAdminUsernameInput(String(festConfig.adminUsername || 'smash2k26'));
      setFestPodiumCategory(festConfig.podiumCategory === 'sports' ? 'sports' : 'arts');
      setFestCelebrationMode(Boolean(festConfig.isCelebrationMode));
      setFestApplyPenaltiesToPodium(festConfig.applyPenaltiesToPodium ?? true);
      setFestApplyArtsPenalties(festConfig.applyArtsPenalties ?? (festConfig.applyPenaltiesToPodium ?? true));
      setFestApplySportsPenalties(festConfig.applySportsPenalties ?? (festConfig.applyPenaltiesToPodium ?? true));
      setFestAccentColor(String(festConfig.accentColor || '#4F46E5'));
      setFestAccentPreset(festConfig.accentPreset || 'indigo');
      setFestTickerText(String(festConfig.announcementTicker || ''));
      setFestEnableTicker(festConfig.enableLiveTicker ?? true);
      setFestTickerSpeed(festConfig.announcementTickerSpeed || 'normal');
      setFestLiveStreamUrl(String(festConfig.liveStreamUrl || ''));
      setFestContactEmail(String(festConfig.contactEmail || 'festival@ahiaedu.org'));
      setFestContactPhone(String(festConfig.contactPhone || '+91 98470 12345'));
      setFestCopyright(String(festConfig.copyrightText || '© 2026 AHIA FEST • Hidaya Union Devoted Activities (HUDA). All Rights Reserved.'));
    }
  }, [festConfig]);

  const handleSelectAccentPreset = async (presetKey: string, hexColor: string) => {
    setFestAccentPreset(presetKey);
    setFestAccentColor(hexColor);
    document.documentElement.style.setProperty('--fest-accent', hexColor);
    const updated = {
      ...festConfig,
      accentPreset: presetKey as any,
      accentColor: hexColor,
    };
    updateFestConfig(updated, true);
    showToast('Accent Theme Applied', `Switched theme to ${presetKey.toUpperCase()} (${hexColor}).`, 'success');
    if (googleSheetsConfig.appsScriptUrl) {
      await pushToGoogleSheets({ festConfig: updated, silent: true });
    }
  };

  const handleCustomAccentColorChange = (hex: string) => {
    setFestAccentColor(hex);
    setFestAccentPreset('custom');
    document.documentElement.style.setProperty('--fest-accent', hex);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(hex.trim())) {
      updateFestConfig({ accentColor: hex.trim(), accentPreset: 'custom' }, true);
    }
  };

  const handleApplyCustomAccentColor = async () => {
    const hex = festAccentColor.trim();
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
      showToast('Invalid Hex Color', 'Please enter a valid hex color code (e.g. #4F46E5).', 'error');
      return;
    }
    const updated = {
      ...festConfig,
      accentPreset: 'custom' as any,
      accentColor: hex,
    };
    updateFestConfig(updated, true);
    showToast('Accent Color Saved', `Custom color ${hex} saved and synced to Google Sheets.`, 'success');
    if (googleSheetsConfig.appsScriptUrl) {
      await pushToGoogleSheets({ festConfig: updated, silent: true });
    }
  };

  const handleQuickTogglePodiumCategory = async (mode: 'arts' | 'sports') => {
    setFestPodiumCategory(mode);
    const updated = {
      ...festConfig,
      podiumCategory: mode,
    };
    updateFestConfig(updated);
    showToast('Podium Display Updated', `Championship podium now set to ${mode.toUpperCase()} leading.`, 'success');
    if (googleSheetsConfig.appsScriptUrl) {
      await pushToGoogleSheets({
        festConfig: updated,
      });
    }
  };

  const handleQuickToggleCelebration = async () => {
    const nextVal = !festCelebrationMode;
    setFestCelebrationMode(nextVal);
    const updated = {
      ...festConfig,
      isCelebrationMode: nextVal,
    };
    updateFestConfig(updated, true);
    if (nextVal) {
      showToast('Celebration Mode ON 🎉', 'Fireworks celebration active for site visitors!', 'success');
      window.dispatchEvent(new CustomEvent('fest-trigger-fireworks'));
    } else {
      showToast('Celebration Mode OFF', 'Celebration fireworks turned OFF.', 'info');
    }
    if (googleSheetsConfig.appsScriptUrl) {
      await pushToGoogleSheets({
        festConfig: updated,
        silent: true,
      });
    }
  };

  const handleQuickTogglePenalties = async () => {
    const nextVal = !festApplyPenaltiesToPodium;
    setFestApplyPenaltiesToPodium(nextVal);
    setFestApplyArtsPenalties(nextVal);
    setFestApplySportsPenalties(nextVal);
    const updated = {
      ...festConfig,
      applyPenaltiesToPodium: nextVal,
      applyArtsPenalties: nextVal,
      applySportsPenalties: nextVal,
    };
    updateFestConfig(updated, true);
    if (nextVal) {
      showToast('All Penalties Applied', 'Disciplinary penalties will now be deducted from podium points.', 'info');
    } else {
      showToast('All Penalties Hidden', 'Podium now shows gross points without minus points deducted.', 'info');
    }
    if (googleSheetsConfig.appsScriptUrl) {
      await pushToGoogleSheets({
        festConfig: updated,
        silent: true,
      });
    }
  };

  const handleQuickToggleArtsPenalties = async () => {
    const nextVal = !festApplyArtsPenalties;
    setFestApplyArtsPenalties(nextVal);
    const updated = {
      ...festConfig,
      applyArtsPenalties: nextVal,
    };
    updateFestConfig(updated, true);
    if (nextVal) {
      showToast('Arts Penalties Active', 'Arts minus points will now be deducted from Arts rankings.', 'info');
    } else {
      showToast('Arts Penalties Hidden', 'Arts leaderboard now displays raw points without minus deductions.', 'info');
    }
    if (googleSheetsConfig.appsScriptUrl) {
      await pushToGoogleSheets({
        festConfig: updated,
        silent: true,
      });
    }
  };

  const handleQuickToggleSportsPenalties = async () => {
    const nextVal = !festApplySportsPenalties;
    setFestApplySportsPenalties(nextVal);
    const updated = {
      ...festConfig,
      applySportsPenalties: nextVal,
    };
    updateFestConfig(updated, true);
    if (nextVal) {
      showToast('Sports Penalties Active', 'Sports minus points will now be deducted from Sports rankings.', 'info');
    } else {
      showToast('Sports Penalties Hidden', 'Sports leaderboard now displays raw points without minus deductions.', 'info');
    }
    if (googleSheetsConfig.appsScriptUrl) {
      await pushToGoogleSheets({
        festConfig: updated,
        silent: true,
      });
    }
  };

  const handleTestFireworks = () => {
    window.dispatchEvent(new CustomEvent('fest-trigger-fireworks'));
    showToast('🎉 Test Fireworks Launched!', 'Celebration sequence active on screen.', 'success');
  };

  const handleSaveFestSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<FestConfig> = {
      festivalName: String(festNameInput || 'smash 2026').trim(),
      name: String(festNameInput || 'smash 2026').trim(),
      year: String(festYearInput || '2026').trim(),
      edition: String(festEditionInput || '').trim(),
      statusBanner: festBannerInput,
      tagline: String(festTaglineInput || '').trim(),
      theme: String(festThemeInput || '').trim(),
      venue: String(festVenueInput || '').trim(),
      organizedBy: String(festOrganizedByInput || '').trim(),
      chiefGuest: String(festChiefGuestInput || '').trim(),
      logoUrl: String(festLogoUrlInput || '').trim(),
      bannerUrl: String(festBannerUrlInput || '').trim(),
      podiumCategory: festPodiumCategory,
      isCelebrationMode: festCelebrationMode,
      applyPenaltiesToPodium: festApplyPenaltiesToPodium,
      applyArtsPenalties: festApplyArtsPenalties,
      applySportsPenalties: festApplySportsPenalties,
      accentColor: festAccentColor,
      accentPreset: festAccentPreset as any,
      announcementTicker: festTickerText,
      enableLiveTicker: festEnableTicker,
      announcementTickerSpeed: festTickerSpeed,
      liveStreamUrl: festLiveStreamUrl,
      contactEmail: festContactEmail,
      contactPhone: festContactPhone,
      copyrightText: festCopyright,
      adminUsername: festAdminUsernameInput.trim() || 'smash2k26',
    };
    if (festPasswordInput.trim()) {
      updated.adminPassword = festPasswordInput.trim();
      changeAdminPassword(festPasswordInput.trim());
      setFestPasswordInput('');
    }
    updateFestConfig(updated);
    if (googleSheetsConfig.appsScriptUrl) {
      await pushToGoogleSheets({ festConfig: updated });
    }
    showToast('Settings Saved', 'All festival & website settings saved to local & Google Sheets database.', 'success');
  };

  // -------------------------------------------------------------
  // TAB 7: GOOGLE SHEETS SETUP
  // -------------------------------------------------------------
  const [sheetScriptUrl, setSheetScriptUrl] = useState(googleSheetsConfig.appsScriptUrl || '');
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [diagStatus, setDiagStatus] = useState<{
    running: boolean;
    status?: 'success' | 'warning' | 'error';
    title?: string;
    details?: string;
    version?: string;
    actionRequired?: string;
  } | null>(null);

  useEffect(() => {
    if (googleSheetsConfig.appsScriptUrl) {
      setSheetScriptUrl(googleSheetsConfig.appsScriptUrl);
    }
  }, [googleSheetsConfig.appsScriptUrl]);

  const googleAppsScriptCode = GOOGLE_APPS_SCRIPT_CODE;

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setIsCopiedCode(true);
    showToast('Code Copied', 'Google Apps Script code copied to clipboard!', 'success');
    setTimeout(() => setIsCopiedCode(false), 2500);
  };

  const handleSaveSheetUrl = () => {
    const trimmed = sheetScriptUrl.trim();
    const match = trimmed.match(/\/s\/([a-zA-Z0-9_-]+)\/exec/);
    const extractedId = match ? match[1] : '';
    const newDeploymentId = extractedId || googleSheetsConfig.deploymentId || 'AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w';

    updateGoogleSheetsConfig({ 
      appsScriptUrl: trimmed,
      deploymentId: newDeploymentId,
      sheetId: newDeploymentId,
      sheetUrl: trimmed,
    });
    showToast('Saved', 'Google Apps Script deployment URL updated.', 'success');
  };

  const handleTestWebhookDiagnostics = async () => {
    const url = sheetScriptUrl.trim() || googleSheetsConfig.appsScriptUrl;
    if (!url) {
      showToast('No URL', 'Please enter your Google Apps Script Web App URL first.', 'warning');
      return;
    }
    setDiagStatus({ running: true });
    try {
      const getRes = await fetch(url, { method: 'GET', redirect: 'follow' });
      if (!getRes.ok) {
        throw new Error(`HTTP ${getRes.status}: ${getRes.statusText}`);
      }
      const data = await getRes.json();
      
      if (data.version === '2.1-gridlines-fixed') {
        setDiagStatus({
          running: false,
          status: 'success',
          title: 'Webhook Online & Healthy (v2.1)',
          details: 'Your deployed Google Apps Script is running the latest version with designed headers, row heights, column widths, and gridline safeguards.',
          version: data.version,
        });
        showToast('Webhook Verified', 'Apps Script is live with the latest updated code!', 'success');
      } else {
        setDiagStatus({
          running: false,
          status: 'warning',
          title: 'Older Deployment Version Running in Google Sheets',
          details: 'Your Google Apps Script Web App answered, but it is running an OLDER deployment version without the latest fixes.',
          actionRequired: 'In your Google Apps Script editor: Click Deploy → Manage deployments → Click the Edit (pencil) icon → Under Version, select "New version" → Click Deploy. Then data will reach your sheet immediately!',
          version: data.version || 'Unversioned (Old build)',
        });
        showToast('New Version Needed', 'Please deploy a "New version" in Apps Script.', 'warning');
      }
    } catch (err: any) {
      setDiagStatus({
        running: false,
        status: 'error',
        title: 'Connection / Permission Blocked',
        details: err.message || String(err),
        actionRequired: 'Ensure when deploying as Web App: "Execute as" is set to "Me", and "Who has access" is set to "Anyone".',
      });
      showToast('Webhook Error', 'Could not reach the Apps Script endpoint.', 'error');
    }
  };

  // -------------------------------------------------------------
  // AUTHENTICATION SCREEN IF NOT LOGGED IN
  // -------------------------------------------------------------
  if (!isAdminLoggedIn) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          {onClose && (
            <div className="text-left mb-3">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Festival</span>
              </button>
            </div>
          )}
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Official Festival Login
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Enter administrative credentials to manage scores &amp; live results.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginAdmin(loginUsername, loginPassword);
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN PANEL
  // -------------------------------------------------------------
  return (
    <div id="admin-management-panel" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Row with Admin Profile and Quick Logout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Official Fest Admin Control</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {festConfig?.statusBanner || 'LIVE'}
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Logged in as <strong className="text-slate-800">{adminUser?.fullName}</strong> ({adminUser?.role})
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setBulkCsvInitialTab('participants');
              setIsBulkCsvModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            title="Bulk CSV Import & Export for Participants and Sports"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bulk CSV Hub</span>
          </button>
          <button
            onClick={() => syncWithGoogleSheets()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Sheets</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Close Admin and return to festival"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Close Admin</span>
            </button>
          )}
          <button
            onClick={() => {
              logoutAdmin();
              if (onClose) {
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Championship Podium & Celebration Quick Toggle Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Podium Category Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 border border-indigo-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-xl shadow-2xs border border-indigo-100 text-indigo-600">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>CHAMPIONSHIP PODIUM</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                    festPodiumCategory === 'sports'
                      ? 'bg-sky-600 text-white'
                      : festPodiumCategory === 'arts'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {festPodiumCategory.toUpperCase()} ONLY
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Display Arts leaders or Sports leaders on live podium.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => handleQuickTogglePodiumCategory('arts')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                festPodiumCategory === 'arts'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span>🎭 Arts</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickTogglePodiumCategory('sports')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                festPodiumCategory === 'sports'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
              }`}
            >
              <span>⚽ Sports</span>
            </button>
          </div>
        </div>

        {/* Celebration Fireworks Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-xl shadow-2xs border border-amber-100 text-amber-600">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>VISITOR CELEBRATION</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                    festCelebrationMode ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {festCelebrationMode ? 'ON (7 sec fireworks)' : 'OFF'}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                When ON, site visitors see fireworks &amp; celebration for 7 sec.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTestFireworks}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-amber-300 text-amber-800 hover:bg-amber-100/60 transition-all cursor-pointer shadow-xs"
              title="Trigger a test celebration firework blast on screen right now"
            >
              <span>💥 Test Fireworks</span>
            </button>

            <button
              type="button"
              onClick={handleQuickToggleCelebration}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs ${
                festCelebrationMode
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:brightness-110 shadow-amber-200'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🎉 Celebration: {festCelebrationMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation Bar - Compact and All Web Sections */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar w-full flex-wrap">
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'results'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Results &amp; Marks ({allResultRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('programs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'programs'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Programs ({artsPrograms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sports')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'sports'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          <span>Sports &amp; Matches ({sportsMatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'participants'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5 text-indigo-600" />
          <span>Participants ({participants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'teams'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          <span>Teams ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
          <span>Broadcast &amp; Ticker</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Timeline &amp; Stages</span>
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'scoring'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>Scoring Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'docs'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Docs &amp; Circulars ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Certificates</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-indigo-600" />
          <span>Fest Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-indigo-600" />
          <span>&lt;&gt; Google Sheets</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: RESULTS & MARKS EVALUATION */}
      {/* ========================================================= */}
      {activeTab === 'results' && (
        <div id="section-results-marks" className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Result Entry &amp; Marks Evaluation</span>
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Assign 1st, 2nd &amp; 3rd place podium winners. Automatic points calculation syncs instantly to live leaderboards.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => handleDownloadResultsPDF(false)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                title="Download Arts Results & Standings PDF statement"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Download Arts Results & Standings (PDF)</span>
              </button>

              <button
                onClick={handleDownloadArtsResultsOnlyPDF}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                title="Download Arts Results Only PDF statement"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Download Arts Results Only (PDF)</span>
              </button>

              <button
                onClick={handleDownloadSportsResultsPDF}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                title="Download Sports Results PDF statement"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Download Sports Results (PDF)</span>
              </button>

              <button
                onClick={handleOpenNewMarkModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Enter Podium Results</span>
              </button>
            </div>
          </div>

          {/* 3-Slot Podium Results Modal */}
          <ResultPodiumModal
            isOpen={isPodiumModalOpen}
            onClose={() => setIsPodiumModalOpen(false)}
            initialProgramId={podiumModalProgramId}
          />

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={resultsSearch}
                onChange={(e) => setResultsSearch(e.target.value)}
                placeholder="Search results by student name, Admission No, program code, house..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={resultsProgramFilter}
                onChange={(e) => setResultsProgramFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Programs</option>
                {artsPrograms.map((p) => {
                  const isPub = isProgramPublished(p);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.code ? `${p.code} - ` : ''} {p.name} {isPub ? '✓ [Published]' : '• [Pending]'}
                    </option>
                  );
                })}
              </select>

              <select
                value={resultsCategoryFilter}
                onChange={(e) => setResultsCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Senior">Senior</option>
                <option value="Junior">Junior</option>
                <option value="Sub Junior">Sub Junior</option>
                <option value="General">General</option>
              </select>

              <select
                value={resultsHouseFilter}
                onChange={(e) => setResultsHouseFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Houses</option>
                {teams.map((t, idx) => (
                  <option key={`adm-res-t-${t.id}-${idx}`} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <span className="text-xs text-slate-500 whitespace-nowrap">
                Showing {filteredResults.length} of {allResultRecords.length}
              </span>

              <button
                type="button"
                onClick={() => handleDownloadResultsPDF(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors cursor-pointer shrink-0 border border-slate-200"
                title="Download filtered results view as PDF"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>PDF (View)</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Student Participant</th>
                    <th className="px-4 py-3">Admission No</th>
                    <th className="px-4 py-3">House / Team</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Points</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                        No result records found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((r, i) => {
                      const house = teams.find((t) => t.id === r.teamId);
                      const isFirst = r.position?.includes('1st') || r.rank === 1;
                      const isSecond = r.position?.includes('2nd') || r.rank === 2;
                      const isThird = r.position?.includes('3rd') || r.rank === 3;

                      return (
                        <tr key={`adm-res-${r.programObjId}-${r.participantId || r.chestNo || i}-${i}`} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            <span className="inline-block font-bold text-indigo-700 mr-1.5">{r.programCode}</span>
                            <span>{r.programTitle}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {r.participantName}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">{r.admissionNo || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                              style={{ backgroundColor: house?.color || '#4f46e5' }}
                            >
                              {house?.name || 'House'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-indigo-600">{r.grade || '-'}</td>
                          <td className="px-4 py-3">
                            {isFirst ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                🥇 1st Place
                              </span>
                            ) : isSecond ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                                🥈 2nd Place
                              </span>
                            ) : isThird ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
                                🥉 3rd Place
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-slate-600 bg-slate-100">
                                {r.position}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">{r.pointsAwarded} pts</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.status === 'Published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.status || 'Published'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditMarkModal(r)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                                title="Edit Podium Results for Event"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteResultMark(r.programObjId, r.participantId || r.chestNo || r.id || '')}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: PROGRAMS & FIXTURES MANAGER */}
      {/* ========================================================= */}
      {activeTab === 'programs' && (
        <div id="section-programs-manager" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Programs &amp; Fixtures Manager
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Manage Arts &amp; Sports events, schedules, categories, venues, and status.
              </p>
            </div>
            <button
              onClick={handleOpenNewProgModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Program</span>
            </button>
          </div>

          {/* New Program Modal */}
          {isNewProgModalOpen && (
            <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-sm relative">
              <button
                onClick={() => setIsNewProgModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-indigo-900 mb-4">Create New Program</h3>

              <form onSubmit={handleSaveProgram} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Program Code
                    </label>
                    <input
                      type="text"
                      required
                      value={newProgCode}
                      onChange={(e) => setNewProgCode(e.target.value)}
                      placeholder="EV-101"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Program Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newProgName}
                      onChange={(e) => setNewProgName(e.target.value)}
                      placeholder="e.g. Classical Solo Dance"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Discipline Type
                    </label>
                    <select
                      value={newProgType}
                      onChange={(e) => setNewProgType(e.target.value as 'Arts' | 'Sports')}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Arts">Arts</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={newProgCategory}
                      onChange={(e) => setNewProgCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Senior">Senior</option>
                      <option value="Junior">Junior</option>
                      <option value="Sub Junior">Sub Junior</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Date / Schedule Day
                    </label>
                    <input
                      type="text"
                      value={newProgScheduleDay}
                      onChange={(e) => setNewProgScheduleDay(e.target.value)}
                      placeholder="Day 1"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Venue / Stage
                    </label>
                    <input
                      type="text"
                      value={newProgVenue}
                      onChange={(e) => setNewProgVenue(e.target.value)}
                      placeholder="Main Stage"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Event Status
                    </label>
                    <select
                      value={newProgStatus}
                      onChange={(e) => setNewProgStatus(e.target.value as EventStatus)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="LIVE">Live</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="RESULT PENDING">Postponed / Result Pending</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewProgModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                  >
                    Save Program
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={progSearch}
                onChange={(e) => setProgSearch(e.target.value)}
                placeholder="Search programs by code, program name, venue, day..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={progTypeFilter}
                onChange={(e) => setProgTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Types</option>
                <option value="Arts">Arts</option>
                <option value="Sports">Sports</option>
              </select>

              <select
                value={progCategoryFilter}
                onChange={(e) => setProgCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Senior">Senior</option>
                <option value="Junior">Junior</option>
                <option value="Sub Junior">Sub Junior</option>
                <option value="General">General</option>
              </select>

              <select
                value={progStatusFilter}
                onChange={(e) => setProgStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Live">Live</option>
                <option value="Completed">Completed</option>
                <option value="Postponed">Postponed</option>
              </select>

              <span className="text-xs text-slate-500 whitespace-nowrap">
                Showing {filteredPrograms.length} of {artsPrograms.length}
              </span>
            </div>
          </div>

          {/* Programs Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Program Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date &amp; Time</th>
                    <th className="px-4 py-3">Venue</th>
                    <th className="px-4 py-3">Event Status</th>
                    <th className="px-4 py-3">Results Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPrograms.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                        No programs found matching your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredPrograms.map((p, idx) => {
                      const isPub = isProgramPublished(p);
                      return (
                      <tr key={p.id ? `adm-prog-${p.id}-${idx}` : `adm-prog-${p.code || idx}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-700">{p.code || 'EV-100'}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{p.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            isSportsProgram(p)
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-100'
                          }`}>
                            {isSportsProgram(p) ? 'Sports' : 'Arts'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{p.category}</td>
                        <td className="px-4 py-3 text-slate-600">{p.scheduledTime || p.date || 'Day 1'}</td>
                        <td className="px-4 py-3 text-slate-600">{p.venue || p.stage}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              p.status === 'LIVE'
                                ? 'bg-rose-100 text-rose-800'
                                : p.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isPub ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setPodiumModalProgramId(p.id);
                                setIsPodiumModalOpen(true);
                              }}
                              className={`p-1.5 active:scale-95 rounded-lg transition-all cursor-pointer ${
                                isPub
                                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                              }`}
                              title={isPub ? 'Podium Results Published (Click to Edit)' : 'Enter Podium Results (Pending)'}
                            >
                              <Trophy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditProgModal(p)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                              title="Edit Program"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteArtsProgram(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                              title="Delete Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: SPORTS FIXTURES & MATCH SCOREBOARD */}
      {/* ========================================================= */}
      {activeTab === 'sports' && (
        <div id="section-sports-scoreboard">
          <AdminSportsSection />
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: STUDENT PARTICIPANTS DATABASE */}
      {/* ========================================================= */}
      {activeTab === 'participants' && (
        <div id="section-participants-database" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Student Participants Database
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Manage admission numbers, house affiliations, and category divisions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setBulkCsvInitialTab('participants');
                  setIsBulkCsvModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                title="Bulk Import / Export Participants using CSV"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Bulk CSV Import / Export</span>
              </button>

              <button
                onClick={handleOpenNewPartModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Register Participant</span>
              </button>
            </div>
          </div>

          {/* Register Participant Modal */}
          {isNewPartModalOpen && (
            <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-sm relative">
              <button
                onClick={() => setIsNewPartModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-indigo-900 mb-4">Register New Participant</h3>

              <form onSubmit={handleSaveParticipant} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      required
                      value={newPartAdmission}
                      onChange={(e) => setNewPartAdmission(e.target.value)}
                      placeholder="AD-1001"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Full Student Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      House / Team
                    </label>
                    <select
                      value={newPartTeamId}
                      onChange={(e) => setNewPartTeamId(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {teams.map((t, idx) => (
                        <option key={`adm-np-t-${t.id}-${idx}`} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={newPartCategory}
                      onChange={(e) => setNewPartCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Senior">Senior</option>
                      <option value="Junior">Junior</option>
                      <option value="Sub Junior">Sub Junior</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Class &amp; Section
                      </label>
                      <input
                        type="text"
                        value={newPartClass}
                        onChange={(e) => setNewPartClass(e.target.value)}
                        placeholder="XII"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Sec
                      </label>
                      <input
                        type="text"
                        value={newPartSection}
                        onChange={(e) => setNewPartSection(e.target.value)}
                        placeholder="A"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Student Photo URL (Google Photos, Google Drive, or Web Image)
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={newPartPhotoUrl}
                      onChange={(e) => setNewPartPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="w-10 h-10 rounded-lg border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                      {newPartPhotoUrl ? (
                        <img
                          src={newPartPhotoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as any).src = '')}
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Preview</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Helper Note matching the video */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>How to use image links:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
                    <li><strong>Google Photos:</strong> Open photo in Google Photos → Right click → "Copy image address" (starts with <code>lh3.googleusercontent.com</code> and paste here.)</li>
                    <li><strong>Google Drive:</strong> Set file sharing to "Anyone with link can view" and paste the link (it auto-converts).</li>
                    <li><strong>Other hosts:</strong> Direct image links from Imgur, PostImages, or Unsplash work directly.</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPartModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                  >
                    Save Participant
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                placeholder="Search students by name, Admission No (Ad No, e.g. AD-101), or Chest No..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={partHouseFilter}
                onChange={(e) => setPartHouseFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Houses</option>
                {teams.map((t, idx) => (
                  <option key={`adm-pf-t-${t.id}-${idx}`} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={partCategoryFilter}
                onChange={(e) => setPartCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Senior">Senior</option>
                <option value="Junior">Junior</option>
                <option value="Sub Junior">Sub Junior</option>
                <option value="General">General</option>
              </select>

              <span className="text-xs text-slate-500 whitespace-nowrap">
                Showing {filteredParticipants.length} of {participants.length}
              </span>
            </div>
          </div>

          {/* Participants Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Admission No</th>
                    <th className="px-4 py-3">House / Team</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Class &amp; Sec</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        No participants found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((pt, idx) => {
                      const house = teams.find((t) => t.id === pt.teamId);
                      return (
                        <tr key={pt.id ? `adm-pt-${pt.id}-${idx}` : `adm-pt-${pt.chestNo || idx}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2.5">
                            <ParticipantAvatar
                              photo={pt.photo}
                              name={pt.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <span>{pt.name}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">{pt.admissionNo}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
                              style={{ backgroundColor: house?.color || '#4f46e5' }}
                            >
                              {house?.name || 'House'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{pt.category}</td>
                          <td className="px-4 py-3 font-mono">{pt.yearClass}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditPartModal(pt)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                                title="Edit Participant"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteParticipant(pt.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                                title="Delete Participant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: CHAMPIONSHIP HOUSES / TEAMS */}
      {/* ========================================================= */}
      {activeTab === 'teams' && (
        <div id="section-championship-houses" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Championship Houses &amp; Teams
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Add, remove, and configure house identities, emblems, brand colors, and slogans.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={houseSearch}
                  onChange={(e) => setHouseSearch(e.target.value)}
                  placeholder="Search house..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleOpenNewTeamModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add House / Team</span>
              </button>

              <button
                onClick={() => pushToGoogleSheets()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Sync all teams to Google Sheets"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Push to Sheets</span>
              </button>
            </div>
          </div>

          {/* House Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHouses.map((t, idx) => (
              <div
                key={t.id ? `adm-house-${t.id}-${idx}` : `adm-house-${idx}`}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: t.color || '#4f46e5' }}
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <TeamLogo logo={t.logo} name={t.name} color={t.color} size="lg" roundedClassName="rounded-xl" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                      <p className="text-xs text-slate-500">{t.slogan || 'Championship Contender'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${t.name}"? This cannot be undone.`)) {
                        deleteTeam(t.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete House"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-slate-900 text-sm font-mono">{t.totalPoints || 0} pts</span>
                      {(t.minusPoints || 0) > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 font-mono">(-{t.minusPoints})</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Rank</span>
                    <span className="font-bold text-indigo-600 text-sm font-mono">#{t.rank || 1}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      House Name
                    </label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => editTeam(t.id, { name: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Slogan / Motto
                    </label>
                    <input
                      type="text"
                      value={t.slogan || t.description || ''}
                      onChange={(e) => editTeam(t.id, { slogan: e.target.value, description: e.target.value })}
                      placeholder="e.g. United in Strength"
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={t.color || '#4f46e5'}
                          onChange={(e) => editTeam(t.id, { color: e.target.value })}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={t.color || '#4f46e5'}
                          onChange={(e) => editTeam(t.id, { color: e.target.value })}
                          className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={t.accentColor || t.color || '#6366f1'}
                          onChange={(e) => editTeam(t.id, { accentColor: e.target.value })}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={t.accentColor || t.color || '#6366f1'}
                          onChange={(e) => editTeam(t.id, { accentColor: e.target.value })}
                          className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Emblem / Logo URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={t.logo || ''}
                        onChange={(e) => editTeam(t.id, { logo: e.target.value })}
                        placeholder="Image URL or Drive link (e.g. https://...)"
                        className="w-full px-3 py-1.5 text-xs text-slate-600 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none truncate"
                      />
                      <TeamLogo logo={t.logo} name={t.name} color={t.color} size="md" roundedClassName="rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* House Penalty & Minus Points Section */}
          <div className="pt-8 border-t border-slate-200">
            <AdminTeamMinusesSection />
          </div>

          {/* Add Team Modal */}
          {isNewTeamModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Add New Championship House</h3>
                    <p className="text-xs text-slate-500">Create a new team/house for student participation and scoring.</p>
                  </div>
                  <button
                    onClick={() => setIsNewTeamModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveNewTeam} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        House / Team Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="e.g. House Phoenix"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Short Code
                      </label>
                      <input
                        type="text"
                        value={newTeamShortCode}
                        onChange={(e) => setNewTeamShortCode(e.target.value)}
                        placeholder="e.g. PHX"
                        className="w-full px-3 py-2 text-sm uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Motto / Slogan
                    </label>
                    <input
                      type="text"
                      value={newTeamSlogan}
                      onChange={(e) => setNewTeamSlogan(e.target.value)}
                      placeholder="e.g. Rising to Greatness"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTeamColor}
                          onChange={(e) => setNewTeamColor(e.target.value)}
                          className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={newTeamColor}
                          onChange={(e) => setNewTeamColor(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs font-mono rounded border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newTeamAccentColor}
                          onChange={(e) => setNewTeamAccentColor(e.target.value)}
                          className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={newTeamAccentColor}
                          onChange={(e) => setNewTeamAccentColor(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs font-mono rounded border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Emblem / Logo URL (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTeamLogo}
                        onChange={(e) => setNewTeamLogo(e.target.value)}
                        placeholder="Image URL or Drive link (e.g. https://...)"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <TeamLogo logo={newTeamLogo} name={newTeamName || 'Team'} color={newTeamColor} size="md" roundedClassName="rounded-md" />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsNewTeamModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Create House
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: DOCUMENTS & OFFICIAL CIRCULARS */}
      {/* ========================================================= */}
      {activeTab === 'docs' && (
        <div id="section-documents-circulars" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Documents &amp; Official Circulars
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Publish guidelines, event rubrics, schedules, PDF circulars, and notices for students and judges.
              </p>
            </div>
            <button
              onClick={handleOpenNewDocModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Circular / Document</span>
            </button>
          </div>

          {/* New Document Modal */}
          {isNewDocModalOpen && (
            <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-sm relative">
              <button
                onClick={() => setIsNewDocModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-indigo-900 mb-4">Create New Document or Official Circular</h3>

              <form onSubmit={handleSaveDocument} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Document / Notice Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="e.g. Arts First Stage Rules & Time Limits"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={newDocCategory}
                      onChange={(e) => setNewDocCategory(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Official Circular">Official Circular</option>
                      <option value="Rules & Regulations">Rules &amp; Regulations</option>
                      <option value="Schedule">Schedule</option>
                      <option value="Guidelines">Guidelines</option>
                      <option value="Results">Results</option>
                      <option value="General Notice">General Notice</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Issue / Effective Date
                    </label>
                    <input
                      type="date"
                      value={newDocDate}
                      onChange={(e) => setNewDocDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Document File / Google Drive / Cloud Link
                    </label>
                    <input
                      type="text"
                      value={newDocLink}
                      onChange={(e) => setNewDocLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... or https://..."
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Brief Description / Key Points
                  </label>
                  <textarea
                    rows={3}
                    value={newDocDesc}
                    onChange={(e) => setNewDocDesc(e.target.value)}
                    placeholder="Detailed instructions, important guidelines, or summary of this circular..."
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="doc-pub-check"
                    checked={newDocPublic}
                    onChange={(e) => setNewDocPublic(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="doc-pub-check" className="text-sm font-medium text-slate-700">
                    Publish document to public Docs &amp; Notices section
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewDocModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                  >
                    Save Document
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search documents & circulars by title, description, category, date..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={docCategoryFilter}
                onChange={(e) => setDocCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Rules & Regulations">Rules &amp; Regulations</option>
                <option value="Schedule">Schedule</option>
                <option value="Guidelines">Guidelines</option>
                <option value="Circulars">Circulars</option>
                <option value="Results">Results</option>
              </select>

              <span className="text-xs text-slate-500 whitespace-nowrap">
                Showing {filteredDocs.length} of {documents.length}
              </span>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Title &amp; Summary</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">File / Link</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        No documents or circulars found. Click "Publish New Circular / Document" to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc, idx) => (
                      <tr key={doc.id ? `adm-doc-${doc.id}-${idx}` : `adm-doc-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div className="font-semibold text-slate-900">{doc.title}</div>
                          {doc.description && (
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{doc.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {doc.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">{doc.issueDate || doc.updatedAt}</td>
                        <td className="px-4 py-3">
                          {doc.fileUrl ? (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                            >
                              <span>View File</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Notice text</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            {doc.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditDocModal(doc)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                              title="Edit Document"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 rounded-lg transition-all cursor-pointer"
                              title="Delete Document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: LIVE ANNOUNCEMENTS & BROADCAST TICKER */}
      {/* ========================================================= */}
      {activeTab === 'announcements' && (
        <div id="section-announcements-broadcast">
          <AdminAnnouncementsSection />
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: FESTIVAL TIMELINE & STAGE SCHEDULE */}
      {/* ========================================================= */}
      {activeTab === 'schedule' && (
        <div id="section-timeline-schedule">
          <AdminScheduleSection />
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: SCORING RULES MATRIX */}
      {/* ========================================================= */}
      {activeTab === 'scoring' && (
        <div id="section-scoring-rules">
          <AdminScoringSection />
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: DIGITAL CERTIFICATES REGISTRY */}
      {/* ========================================================= */}
      {activeTab === 'certificates' && (
        <div id="section-certificates-registry">
          <AdminCertificatesSection />
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 6: FEST & WEB SETTINGS */}
      {/* ========================================================= */}
      {activeTab === 'settings' && (
        <div id="section-fest-settings" className="space-y-8">
          {/* General Festival & Web Configuration Form */}
          <form onSubmit={handleSaveFestSettings} className="space-y-8">

            {/* CARD 1: Web Accent Color & Visual Theme Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>🎨</span>
                    <span>Web Accent Color & Theme Settings</span>
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Customize the website primary accent color, button hues, and celebratory themes. Stored directly in Google Sheets.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 self-start sm:self-auto">
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: festAccentColor }}
                  />
                  <span>Active: {festAccentColor.toUpperCase()}</span>
                </div>
              </div>

              {/* Color Presets Grid */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Preset Color Palettes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'indigo', name: 'Indigo Classic', hex: '#4F46E5', desc: 'Authoritative & Regal' },
                    { id: 'purple', name: 'Royal Purple', hex: '#9333EA', desc: 'Arts & Prestige' },
                    { id: 'emerald', name: 'Emerald Green', hex: '#059669', desc: 'Vibrant & Fresh' },
                    { id: 'sky', name: 'Sky Athletics', hex: '#0284C7', desc: 'Sporting Energy' },
                    { id: 'rose', name: 'Crimson Rose', hex: '#E11D48', desc: 'High Intensity' },
                    { id: 'amber', name: 'Golden Amber', hex: '#D97706', desc: 'Trophy Gold' },
                    { id: 'cyan', name: 'Ocean Cyan', hex: '#0891B2', desc: 'Clean Modern' },
                    { id: 'pink', name: 'Electric Pink', hex: '#DB2777', desc: 'Dynamic Pulse' },
                  ].map((preset) => {
                    const isSelected = festAccentColor.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectAccentPreset(preset.id, preset.hex)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-lg shrink-0 mt-0.5 shadow-xs flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && '✓'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {preset.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {preset.hex}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input & Live Preview */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Custom Color Picker (Hex)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={festAccentColor}
                          onChange={(e) => handleCustomAccentColorChange(e.target.value)}
                          className="w-11 h-11 rounded-xl border border-slate-300 cursor-pointer p-1 bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={festAccentColor}
                        onChange={(e) => handleCustomAccentColorChange(e.target.value)}
                        placeholder="#4F46E5"
                        maxLength={7}
                        className="w-32 px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomAccentColor}
                        className="px-3 py-2 rounded-lg text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
                        style={{ backgroundColor: festAccentColor }}
                      >
                        Save &amp; Apply
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="text-xs font-bold text-slate-600 block">Live UI Element Preview</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: festAccentColor }}
                      >
                        Primary Action
                      </button>
                      <span
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border"
                        style={{
                          backgroundColor: `${festAccentColor}18`,
                          borderColor: `${festAccentColor}40`,
                          color: festAccentColor,
                        }}
                      >
                        Live Tag Badge
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: General Festival Identity & Branding */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
                General Festival Configuration
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Manage festival name, branding, tagline, operational year, and broadcast status.
              </p>

              <div className="space-y-5">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">Celebration Mode 🎉</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          festCelebrationMode ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${festCelebrationMode ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
                          {festCelebrationMode ? 'DB Stored: ON' : 'DB Stored: OFF'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">When ON, celebration data is saved to Firestore database (table/collection: <code>settings/celebration</code> &amp; <code>celebration_history</code>). Visitors see celebration fireworks upon opening.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={handleTestFireworks}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-amber-300 text-amber-800 hover:bg-amber-100/60 shadow-xs cursor-pointer"
                        title="Trigger test celebration fireworks right now"
                      >
                        💥 Test Blast
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={festCelebrationMode}
                          onChange={handleQuickToggleCelebration}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono bg-white/80 p-2 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <span>Database Record: <code>{JSON.stringify({ table: "settings", doc: "celebration", celebrationMode: festCelebrationMode, source: "admin_toggle" })}</code></span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">✓ Cloud Database Synced</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Disciplinary Penalty Controls & Deductions</span>
                      <span className="text-xs font-normal text-slate-500">(Google Sheets & Live App Synced)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Control whether registered house penalty minuses are subtracted from live podium leaderboards, scorecards, and PDF reports.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Arts Penalty Toggle */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                            <span>🎨</span> Arts Penalty Minuses
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            festApplyArtsPenalties ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${festApplyArtsPenalties ? 'bg-purple-600' : 'bg-slate-400'}`}></span>
                            {festApplyArtsPenalties ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Deduct Arts minus points from Arts podiums & scorecards.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={festApplyArtsPenalties}
                          onChange={handleQuickToggleArtsPenalties}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    {/* Sports Penalty Toggle */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-sky-950 flex items-center gap-1.5">
                            <span>⚽</span> Sports Penalty Minuses
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            festApplySportsPenalties ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${festApplySportsPenalties ? 'bg-sky-600' : 'bg-slate-400'}`}></span>
                            {festApplySportsPenalties ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Deduct Sports minus points from Sports podiums & scorecards.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={festApplySportsPenalties}
                          onChange={handleQuickToggleSportsPenalties}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Master Toggle */}
                  <div className="pt-1 flex items-center justify-between text-xs text-slate-600 bg-white/60 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">Master Switch (All Podium Penalties):</span>
                    <button
                      type="button"
                      onClick={handleQuickTogglePenalties}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        festApplyPenaltiesToPodium 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {festApplyPenaltiesToPodium ? 'Disable All Penalties' : 'Enable All Penalties'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Festival Title
                    </label>
                    <input
                      type="text"
                      required
                      value={festNameInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFestNameInput(val);
                        updateFestConfig({ festivalName: val, name: val }, true);
                      }}
                      placeholder="smash 2026"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Edition / Sub-title
                    </label>
                    <input
                      type="text"
                      value={festEditionInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFestEditionInput(val);
                        updateFestConfig({ edition: val }, true);
                      }}
                      placeholder="Annual Championship Edition"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Year
                      </label>
                      <input
                        type="text"
                        required
                        value={festYearInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFestYearInput(val);
                          updateFestConfig({ year: val }, true);
                        }}
                        placeholder="2026"
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Status Banner
                      </label>
                      <select
                        value={festBannerInput}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setFestBannerInput(val);
                          updateFestConfig({ statusBanner: val }, true);
                        }}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                      >
                        <option value="LIVE">LIVE</option>
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="CONCLUDED">CONCLUDED</option>
                        <option value="PAUSED">PAUSED</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Short Tagline
                    </label>
                    <input
                      type="text"
                      value={festTaglineInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFestTaglineInput(val);
                        updateFestConfig({ tagline: val }, true);
                      }}
                      placeholder="Annual Inter-House Arts & Athletics Fest"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Theme Motto
                    </label>
                    <input
                      type="text"
                      value={festThemeInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFestThemeInput(val);
                        updateFestConfig({ theme: val }, true);
                      }}
                      placeholder="Where talent meets competition."
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Brand Logo URL
                    </label>
                    <input
                      type="text"
                      value={festLogoUrlInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFestLogoUrlInput(val);
                        updateFestConfig({ logoUrl: val }, true);
                      }}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Banner Background URL
                    </label>
                    <input
                      type="text"
                      value={festBannerUrlInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFestBannerUrlInput(val);
                        updateFestConfig({ bannerUrl: val }, true);
                      }}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Championship Podium Display Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFestPodiumCategory('arts');
                        updateFestConfig({ podiumCategory: 'arts' }, true);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        festPodiumCategory === 'arts'
                          ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <span>🎭 Arts Leading Only</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Podium shows only Arts points & rankings.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFestPodiumCategory('sports');
                        updateFestConfig({ podiumCategory: 'sports' }, true);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        festPodiumCategory === 'sports'
                          ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <span>⚽ Sports Leading Only</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Podium shows only Sports points & rankings.
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Campus Venue, Committee & Webcast */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
                Venue, Organizing Committee & Live Broadcast
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Official location credentials, dignitaries, and live webcast streaming link.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Festival Campus Venue
                  </label>
                  <input
                    type="text"
                    value={festVenueInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFestVenueInput(val);
                      updateFestConfig({ venue: val }, true);
                    }}
                    placeholder="Grand Central Stage & Main Athletic Arena"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Organized By Committee
                  </label>
                  <input
                    type="text"
                    value={festOrganizedByInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFestOrganizedByInput(val);
                      updateFestConfig({ organizedBy: val }, true);
                    }}
                    placeholder="Hidaya Union Devoted Activities (HUDA)"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Chief Guest / Dignitary
                  </label>
                  <input
                    type="text"
                    value={festChiefGuestInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFestChiefGuestInput(val);
                      updateFestConfig({ chiefGuest: val }, true);
                    }}
                    placeholder="Prof. Dr. K. M. Andrews"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Live Stream / Webcast URL (YouTube or Vimeo)
                </label>
                <input
                  type="text"
                  value={festLiveStreamUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFestLiveStreamUrl(val);
                    updateFestConfig({ liveStreamUrl: val }, true);
                  }}
                  placeholder="https://youtube.com/live/..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* CARD 4: Live Announcement Ticker */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Header Breaking News Ticker
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Controls the scrolling live bulletin bar at the top of every visitor screen.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={festEnableTicker}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setFestEnableTicker(val);
                      updateFestConfig({ enableLiveTicker: val }, true);
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Breaking Ticker Text
                  </label>
                  <input
                    type="text"
                    value={festTickerText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFestTickerText(val);
                      updateFestConfig({ announcementTicker: val }, true);
                    }}
                    placeholder="Official Live Results posting in real-time! Stay tuned for house standings updates."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ticker Speed
                  </label>
                  <select
                    value={festTickerSpeed}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setFestTickerSpeed(val);
                      updateFestConfig({ announcementTickerSpeed: val }, true);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="slow">Slow (Readable)</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CARD 5: Contact & Copyright */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
                Contact & Footer Information
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Official contact credentials and copyright notice displayed on public views.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Support Email
                  </label>
                  <input
                    type="email"
                    value={festContactEmail}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFestContactEmail(val);
                      updateFestConfig({ contactEmail: val }, true);
                    }}
                    placeholder="festival@ahiaedu.org"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Hotline Phone
                  </label>
                  <input
                    type="text"
                    value={festContactPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFestContactPhone(val);
                      updateFestConfig({ contactPhone: val }, true);
                    }}
                    placeholder="+91 98470 12345"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Footer Copyright Notice
                </label>
                <input
                  type="text"
                  value={festCopyright}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFestCopyright(val);
                    updateFestConfig({ copyrightText: val }, true);
                  }}
                  placeholder="© 2026 AHIA FEST • Hidaya Union Devoted Activities (HUDA). All Rights Reserved."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* CARD 6: Master Admin Security & Credentials */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
                Admin Portal Credentials
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Configure administrative login credentials for festival score management.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    value={festAdminUsernameInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFestAdminUsernameInput(val);
                      updateFestConfig({ adminUsername: val }, true);
                    }}
                    placeholder="Enter admin username"
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Update Admin Password (leave blank to retain current)
                  </label>
                  <input
                    type="password"
                    value={festPasswordInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFestPasswordInput(val);
                      if (val.trim()) {
                        changeAdminPassword(val.trim());
                        updateFestConfig({ adminPassword: val.trim() }, true);
                      }
                    }}
                    placeholder="e.g. hudaahiasmash20262027"
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Current default: <span className="font-mono font-semibold text-slate-700">hudaahiasmash20262027</span>
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save All Settings & Sync to Sheets</span>
                </button>
                <span className="text-xs text-slate-500">
                  ⚡ Settings are instantly applied to the web app and saved to the Google Sheet.
                </span>
              </div>
            </div>
          </form>

          {/* Database Operations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              DATABASE OPERATIONS
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all records to 0? This will clear all entries.')) {
                    resetAllData();
                  }
                }}
                className="px-4 py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Reset All Data (Clear to 0)
              </button>

              <button
                onClick={() => {
                  const dataStr = exportDataAsJson();
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `fest_backup_${Date.now()}.json`;
                  a.click();
                  showToast('Exported', 'JSON database backup downloaded.', 'success');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Database (JSON)</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-sm transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const content = evt.target?.result as string;
                        if (content) importDataFromJson(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 7: GOOGLE SHEETS SETUP */}
      {/* ========================================================= */}
      {activeTab === 'sheets' && (
        <div id="section-sheets-setup" className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                  GOOGLE APPS SCRIPT DATABASE ENGINE
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Google Apps Script Web App Integration
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  Connect your Google Spreadsheet to turn Google Sheets into the real-time backend API for this fest website.
                </p>
              </div>

              <button
                onClick={handleCopyScriptCode}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors shrink-0"
              >
                {isCopiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopiedCode ? 'Copied Code!' : 'Copy Apps Script Code'}</span>
              </button>
            </div>

            {/* Connection Status Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                </span>
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    Webhook Connected &amp; Live
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono">
                    Deployment ID: {googleSheetsConfig.deploymentId || 'AKfycbwwh4ZwnwW2C98pwlgoVfN4MI3VokZjr12fO6z5BflcLrFwJoTAhyE4NSvy4JeClymp8w'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Auto-Sync Active (Every 1 min)
                </span>
                {googleSheetsConfig.lastSyncedAt && (
                  <span className="text-[11px] text-emerald-700">
                    Last sync: {googleSheetsConfig.lastSyncedAt}
                  </span>
                )}
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                GOOGLE APPS SCRIPT WEB APP DEPLOYMENT URL (WEBHOOK)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={sheetScriptUrl}
                  onChange={(e) => setSheetScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3.5 py-2.5 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveSheetUrl}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors shrink-0 cursor-pointer"
                >
                  Save URL
                </button>
              </div>
            </div>

            {/* Sync Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => syncWithGoogleSheets()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>1-Click Pull from Google Sheets</span>
              </button>

              <button
                onClick={() => pushToGoogleSheets()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Push Live Data &amp; Schema to Google Sheets</span>
              </button>

              <button
                onClick={handleTestWebhookDiagnostics}
                disabled={diagStatus?.running}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>{diagStatus?.running ? 'Testing Webhook...' : 'Test Webhook & Diagnose'}</span>
              </button>

              <button
                onClick={() => {
                  setBulkCsvInitialTab('participants');
                  setIsBulkCsvModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bulk CSV Import / Export Center</span>
              </button>
            </div>

            {/* Live Webhook Diagnostic Result Card */}
            {diagStatus && (
              <div
                className={`p-4 rounded-xl border text-xs transition-all ${
                  diagStatus.status === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : diagStatus.status === 'warning'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : diagStatus.running
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 animate-pulse'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5 font-bold">
                    {diagStatus.status === 'success' && '✅'}
                    {diagStatus.status === 'warning' && '⚠️'}
                    {diagStatus.status === 'error' && '❌'}
                    {diagStatus.running && '⏳'}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="font-bold text-sm">
                      {diagStatus.running ? 'Checking Google Apps Script Webhook...' : diagStatus.title}
                    </div>
                    {diagStatus.details && <p className="text-xs leading-relaxed">{diagStatus.details}</p>}
                    {diagStatus.actionRequired && (
                      <div className="p-3 bg-white/80 border border-current/20 rounded-lg mt-2 font-medium">
                        <strong className="block mb-1 text-[11px] uppercase tracking-wider">Required Action to Fix:</strong>
                        <p>{diagStatus.actionRequired}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Why Data Is Not Reaching Google Sheets - Immediate Fix Guide */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300/80 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                <span>🚨 Why Data is Not Reaching Google Sheets &amp; How to Fix It in 30 Seconds</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-amber-900 leading-relaxed">
                <li>
                  <strong>Step 1: Deploy a "New Version" (Most Critical):</strong> In Google Apps Script, merely clicking <em>Save</em> (Ctrl+S) does <strong>NOT</strong> update your live Web App. You must click <strong>Deploy → Manage deployments</strong>, click the <strong>Edit (pencil) icon</strong>, change the <strong>Version dropdown to "New version"</strong>, and click <strong>Deploy</strong>!
                </li>
                <li>
                  <strong>Step 2: "Who has access" must be "Anyone":</strong> If set to "Only myself", browser push requests are blocked by Google authentication.
                </li>
                <li>
                  <strong>Step 3: Run Setup Once in Apps Script:</strong> In your Google Apps Script editor, select <code>setupFestivalSheets</code> in the function dropdown at the top and click <strong>Run</strong>. All 10 sheets (SiteSettings, Teams, Participants, Programs, ResultsMarks, etc.) will instantly appear in your Google Spreadsheet with formatted and aligned headers!
                </li>
              </ul>
            </div>

            <p className="text-xs text-slate-500">
              Any changes made in Google Sheets will automatically populate the live scoreboard and mark sheets when you click "Pull from Sheets".
            </p>

            {/* 3-Minute Setup Instructions matching the video */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                3-MINUTE SETUP INSTRUCTIONS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Create Google Sheet</h4>
                  <p className="text-xs text-slate-600">
                    Open <strong>sheets.new</strong> in your browser. Go to <strong>Extensions → Apps Script</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Paste &amp; Deploy</h4>
                  <p className="text-xs text-slate-600">
                    Replace <strong>Code.gs</strong> with the code above. Click <strong>Deploy → New deployment</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Access Setting</h4>
                  <p className="text-xs text-slate-600">
                    Set "Who has access" to <strong>Anyone</strong>, and paste the Web App URL here.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Sheets Tabs & Column Titles Architecture Matrix */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Required Google Sheets Tabs &amp; Column Titles
                  </h3>
                  <p className="text-xs text-slate-500">
                    These 10 tabs store all festival data, site configuration, and scoring. Running <code>setupFestivalSheets()</code> in Apps Script creates them automatically with formatted, styled headers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 1: SiteSettings
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("settingKey\tparamName\tparamValue\tnotes");
                        showToast('Copied', 'SiteSettings headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Festival Name, Year, Status Banner, Tagline, Logo URL, Admin Password, and Last Synced.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    settingKey | paramName | paramValue | notes
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 2: Teams
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("id\tname\tshortCode\tcolor\taccentColor\tslogan\tartsPoints\tsportsPoints\ttotalPoints\tgolds\tsilvers\tbronzes\ttotalWins\trank\tlogo\tcaptain\tdescription\tmembersCount");
                        showToast('Copied', 'Teams headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Stores house profiles, primary &amp; accent colors, logos, and computed points.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    id | name | shortCode | color | accentColor | slogan | artsPoints | sportsPoints | totalPoints | golds | silvers | bronzes | totalWins | rank | logo | captain | description | membersCount
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 3: Participants
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("id\tname\tadmissionNo\tchestNo\tteamId\tcategory\tsection\tyearClass\tphoto\ttotalPoints\tgolds\tsilvers\tbronzes\toverallRank\tparticipatedPrograms");
                        showToast('Copied', 'Participants headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Student roster with chest numbers, house assignments, class, and medal counts.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    id | name | admissionNo | chestNo | teamId | category | section | yearClass | photo | totalPoints | golds | silvers | bronzes | overallRank | participatedPrograms
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 4: Programs
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("id\tcode\tname\tcategory\tsection\tdisciplineType\tstage\tvenue\tdate\ttime\tmaxMarks\tstatus\tpublishStatus\tresults");
                        showToast('Copied', 'Programs headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Arts &amp; cultural items with stage/venue, schedule, judge scoring, and 1st/2nd/3rd results.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    id | code | name | category | section | disciplineType | stage | venue | date | time | maxMarks | status | publishStatus | results
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 5: ResultsMarks
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("programId\tprogramName\tchestNo\tparticipantName\tteamId\tmark\tgrade\tposition\tpoints\tremarks");
                        showToast('Copied', 'ResultsMarks headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Granular judge score sheets: participant marks, grades (A/B/C), podium ranking, and points.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    programId | programName | chestNo | participantName | teamId | mark | grade | position | points | remarks
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 6: SportsMatches
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("id\tsport\ttitle\tround\tteamAId\tteamBId\tscoreA\tscoreB\tdetailScore\tvenue\tdate\ttime\tstatus\tpublishStatus\twinnerTeamId\tevents");
                        showToast('Copied', 'SportsMatches headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Athletics, football, cricket, and court match fixtures, live scoreboards, and winners.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    id | sport | title | round | teamAId | teamBId | scoreA | scoreB | detailScore | venue | date | time | status | publishStatus | winnerTeamId | events
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 7: Schedule
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("id\ttitle\ttype\tcategory\tvenue\tday\tdate\tstartTime\tendTime\tstatus\treferenceId");
                        showToast('Copied', 'Schedule headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Festival timeline across all days, stages, and venues.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    id | title | type | category | venue | day | date | startTime | endTime | status | referenceId
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 8: Announcements
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("id\ttitle\tcontent\tcategory\ttimestamp\tisUrgent\tauthor");
                        showToast('Copied', 'Announcements headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Live broadcast ticker, official notifications, and breaking alerts.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    id | title | content | category | timestamp | isUrgent | author
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 9: Certificates
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("certificateNo\tissueDate\tchestNo\tparticipantName\tteamName\teventTitle\tcategory\tposition\tgrade\tstatus\tverificationCode");
                        showToast('Copied', 'Certificates headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Issued digital certificates, verification credentials, and serial records.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    certificateNo | issueDate | chestNo | participantName | teamName | eventTitle | category | position | grade | status | verificationCode
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Tab 10: ScoringRules
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("ruleKey\truleName\tpointsValue\tdescription");
                        showToast('Copied', 'ScoringRules headers copied to clipboard!', 'success');
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      Copy Headers
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Point scale weights for 1st, 2nd, 3rd, grades A/B/C, and athletic wins.
                  </p>
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    ruleKey | ruleName | pointsValue | description
                  </div>
                </div>
              </div>
            </div>

            {/* Code Block Preview with copy */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="font-mono font-medium">Code.gs (Ready-to-deploy Google Apps Script)</span>
                <span className="text-emerald-600 font-medium">Supports auto-sync &amp; automatic calculations</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-56 leading-relaxed">
                {googleAppsScriptCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Bulk CSV Import & Export Hub Modal */}
      <AdminBulkDataModal
        isOpen={isBulkCsvModalOpen}
        onClose={() => setIsBulkCsvModalOpen(false)}
        initialTab={bulkCsvInitialTab}
      />
    </div>
  );
};
