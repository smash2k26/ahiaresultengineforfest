import { Participant, SportsMatch, Team, CategoryType, SportType, EventStatus, ResultPublishStatus } from '../types/festival';

/**
 * Escapes a cell value for standard RFC 4180 CSV
 */
export function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Robust CSV parser handling multi-line strings, quoted commas, and escaped quotes
 */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Downloads a string content as a CSV file with UTF-8 BOM for Microsoft Excel compatibility
 */
export function downloadCSVFile(content: string, filename: string): void {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// PARTICIPANTS CSV
// ============================================================================

export function exportParticipantsToCSV(participants: Participant[], teams: Team[]): string {
  const teamMap = new Map<string, string>();
  teams.forEach((t) => teamMap.set(t.id, t.name));

  const headers = [
    'ID',
    'Chest No',
    'Admission No',
    'Participant Name',
    'House / Team',
    'Category',
    'Section',
    'Class / Year',
    'Total Points',
    'Golds',
    'Silvers',
    'Bronzes',
    'Overall Rank',
    'Photo URL',
  ];

  const rows = participants.map((p) => [
    p.id,
    p.chestNo,
    p.admissionNo || '',
    p.name,
    teamMap.get(p.teamId) || p.teamId,
    p.category,
    p.section,
    p.yearClass || '',
    p.totalPoints || 0,
    p.golds || 0,
    p.silvers || 0,
    p.bronzes || 0,
    p.overallRank || '',
    p.photo || '',
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.map(escapeCsvCell).join(',')),
  ].join('\r\n');

  return csvContent;
}

export function generateParticipantsSampleCSV(teams: Team[]): string {
  const t1 = teams[0]?.name || 'House Ruby';
  const t2 = teams[1]?.name || 'House Sapphire';
  const t3 = teams[2]?.name || 'House Emerald';
  const t4 = teams[3]?.name || 'House Topaz';

  const headers = [
    'Chest No',
    'Admission No',
    'Participant Name',
    'House / Team',
    'Category',
    'Section',
    'Class / Year',
    'Total Points',
    'Photo URL',
  ];

  const sampleRows = [
    ['101', 'ADM-2024-01', 'Zayan Al-Khatib', t1, 'Senior', 'Individual', 'Grade 12A', '25', ''],
    ['102', 'ADM-2024-02', 'Faheema Rahman', t2, 'Senior', 'Individual', 'Grade 12B', '30', ''],
    ['103', 'ADM-2024-03', 'Bilal Ahmed', t3, 'Junior', 'Group', 'Grade 10A', '15', ''],
    ['104', 'ADM-2024-04', 'Aisha Mariyam', t4, 'Sub Junior', 'Individual', 'Grade 8C', '10', ''],
  ];

  return [
    headers.map(escapeCsvCell).join(','),
    ...sampleRows.map((r) => r.map(escapeCsvCell).join(',')),
  ].join('\r\n');
}

export function parseParticipantsCSV(
  csvText: string,
  teams: Team[]
): { valid: Participant[]; errors: string[]; warnings: string[] } {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    return {
      valid: [],
      errors: ['The CSV file is empty or does not contain header and data rows.'],
      warnings: [],
    };
  }

  const rawHeaders = rows[0].map((h) => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
  const dataRows = rows.slice(1);

  // Map header indexes
  const getColIndex = (candidates: string[]) => {
    return rawHeaders.findIndex((h) => candidates.some((c) => h === c || h.includes(c)));
  };

  const chestIdx = getColIndex(['chestno', 'chestnumber', 'chest', 'chestnum']);
  const nameIdx = getColIndex(['participantname', 'studentname', 'name', 'student']);
  const admIdx = getColIndex(['admissionno', 'admno', 'admission', 'admnum']);
  const teamIdx = getColIndex(['houseteam', 'team', 'house', 'teamid', 'housename']);
  const catIdx = getColIndex(['category', 'division']);
  const secIdx = getColIndex(['section', 'eventtype']);
  const classIdx = getColIndex(['classyear', 'class', 'grade', 'yearclass', 'year']);
  const pointsIdx = getColIndex(['totalpoints', 'points', 'pts']);
  const goldsIdx = getColIndex(['golds', 'gold']);
  const silversIdx = getColIndex(['silvers', 'silver']);
  const bronzesIdx = getColIndex(['bronzes', 'bronze']);
  const idIdx = getColIndex(['id', 'participantid']);
  const photoIdx = getColIndex(['photo', 'photourl', 'avatar', 'image']);

  if (chestIdx === -1 && nameIdx === -1) {
    return {
      valid: [],
      errors: [
        'Could not find required columns. Please ensure your CSV has "Chest No" and "Participant Name" columns.',
      ],
      warnings: [],
    };
  }

  // Build team lookup maps (id, name lowercase, shortCode lowercase)
  const teamById = new Map<string, Team>();
  const teamByName = new Map<string, Team>();
  const teamByCode = new Map<string, Team>();

  teams.forEach((t) => {
    teamById.set(t.id.toLowerCase(), t);
    teamByName.set(t.name.toLowerCase().trim(), t);
    if (t.shortCode) teamByCode.set(t.shortCode.toLowerCase().trim(), t);
  });

  const valid: Participant[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  dataRows.forEach((row, rowIdx) => {
    const rowNum = rowIdx + 2; // +1 for 1-based, +1 for header
    const chestNo = (chestIdx >= 0 ? row[chestIdx] : '').trim();
    const name = (nameIdx >= 0 ? row[nameIdx] : '').trim();

    if (!name && !chestNo) {
      // Empty row, skip
      return;
    }

    if (!name) {
      errors.push(`Row ${rowNum}: Missing Participant Name for Chest #${chestNo || rowIdx}`);
      return;
    }

    const effectiveChestNo = chestNo || String(200 + rowIdx);

    // Resolve team
    const rawTeam = (teamIdx >= 0 ? row[teamIdx] : '').trim();
    let resolvedTeam = teams[0];
    if (rawTeam) {
      const lower = rawTeam.toLowerCase();
      if (teamById.has(lower)) {
        resolvedTeam = teamById.get(lower)!;
      } else if (teamByName.has(lower)) {
        resolvedTeam = teamByName.get(lower)!;
      } else if (teamByCode.has(lower)) {
        resolvedTeam = teamByCode.get(lower)!;
      } else {
        // Partial match
        const found = teams.find(
          (t) => t.name.toLowerCase().includes(lower) || lower.includes(t.name.toLowerCase())
        );
        if (found) {
          resolvedTeam = found;
        } else {
          warnings.push(
            `Row ${rowNum}: House/Team "${rawTeam}" not recognized. Assigned to "${teams[0]?.name}".`
          );
        }
      }
    }

    // Resolve Category
    const rawCat = (catIdx >= 0 ? row[catIdx] : '').trim();
    let category: Participant['category'] = 'Senior';
    if (/sub/i.test(rawCat)) category = 'Sub Junior';
    else if (/jun/i.test(rawCat)) category = 'Junior';
    else if (/gen/i.test(rawCat)) category = 'General';
    else if (/sen/i.test(rawCat)) category = 'Senior';

    // Resolve Section
    const rawSec = (secIdx >= 0 ? row[secIdx] : '').trim();
    let section: 'Individual' | 'Group' | 'Both' = 'Individual';
    if (/group/i.test(rawSec)) section = 'Group';
    else if (/both/i.test(rawSec)) section = 'Both';

    const admNo = admIdx >= 0 ? row[admIdx]?.trim() || `ADM-${effectiveChestNo}` : `ADM-${effectiveChestNo}`;
    const yearClass = classIdx >= 0 ? row[classIdx]?.trim() || 'Grade 11' : 'Grade 11';
    const totalPoints = pointsIdx >= 0 ? Number(row[pointsIdx]) || 0 : 0;
    const golds = goldsIdx >= 0 ? Number(row[goldsIdx]) || 0 : 0;
    const silvers = silversIdx >= 0 ? Number(row[silversIdx]) || 0 : 0;
    const bronzes = bronzesIdx >= 0 ? Number(row[bronzesIdx]) || 0 : 0;
    const customId = idIdx >= 0 && row[idIdx]?.trim() ? row[idIdx].trim() : `part-${effectiveChestNo}`;
    const photo =
      photoIdx >= 0 && row[photoIdx]?.trim()
        ? row[photoIdx].trim()
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    valid.push({
      id: customId,
      chestNo: effectiveChestNo,
      name,
      admissionNo: admNo,
      teamId: resolvedTeam.id,
      category,
      section,
      yearClass,
      totalPoints,
      golds,
      silvers,
      bronzes,
      participatedPrograms: [],
      photo,
    });
  });

  return { valid, errors, warnings };
}

// ============================================================================
// SPORTS MATCHES CSV
// ============================================================================

export function exportSportsMatchesToCSV(matches: SportsMatch[], teams: Team[]): string {
  const teamMap = new Map<string, string>();
  teams.forEach((t) => teamMap.set(t.id, t.name));

  const headers = [
    'Match ID',
    'Sport',
    'Category',
    'Title / Event',
    'Round',
    'Team A',
    'Team B',
    'Score A',
    'Score B',
    'Detail Score',
    'Winner Team',
    'Venue',
    'Scheduled Date & Time',
    'Status',
    'Publish Status',
  ];

  const rows = matches.map((m) => [
    m.id,
    m.sport,
    m.category || 'Senior',
    m.title,
    m.round,
    teamMap.get(m.teamAId) || m.teamAId,
    teamMap.get(m.teamBId) || m.teamBId,
    m.scoreA,
    m.scoreB,
    m.detailScore || '',
    m.winnerTeamId ? teamMap.get(m.winnerTeamId) || m.winnerTeamId : '-',
    m.venue,
    m.scheduledTime || `${m.date || 'Day 1'} • ${m.time || '10:00 AM'}`,
    m.status,
    m.publishStatus,
  ]);

  return [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.map(escapeCsvCell).join(',')),
  ].join('\r\n');
}

export function generateSportsMatchesSampleCSV(teams: Team[]): string {
  const t1 = teams[0]?.name || 'House Ruby';
  const t2 = teams[1]?.name || 'House Sapphire';
  const t3 = teams[2]?.name || 'House Emerald';
  const t4 = teams[3]?.name || 'House Topaz';

  const headers = [
    'Sport',
    'Category',
    'Title / Event',
    'Round',
    'Team A',
    'Team B',
    'Score A',
    'Score B',
    'Detail Score',
    'Winner Team',
    'Venue',
    'Scheduled Date & Time',
    'Status',
  ];

  const sampleRows = [
    ['Football', 'Senior', 'Senior Football Semis', 'Semi Final', t1, t2, '2', '1', '2 - 1 (FT)', t1, 'Main Stadium Ground', 'Day 1 • 04:00 PM', 'COMPLETED'],
    ['Cricket', 'Senior', 'T20 Championship Clash', 'Final', t3, t4, '145', '142', '145/4 vs 142/8 (20 ov)', t3, 'Cricket Oval Ground', 'Day 2 • 09:30 AM', 'COMPLETED'],
    ['Badminton', 'Junior', 'Junior Boys Doubles', 'Quarter Final', t1, t3, '21', '18', '21-18, 21-19', t1, 'Indoor Court A', 'Day 1 • 11:30 AM', 'COMPLETED'],
    ['Volleyball', 'Senior', 'Inter-House Volleyball', 'League', t2, t4, '0', '0', 'Upcoming', '', 'Outdoor Court B', 'Day 2 • 03:00 PM', 'UPCOMING'],
  ];

  return [
    headers.map(escapeCsvCell).join(','),
    ...sampleRows.map((r) => r.map(escapeCsvCell).join(',')),
  ].join('\r\n');
}

export function parseSportsMatchesCSV(
  csvText: string,
  teams: Team[]
): { valid: SportsMatch[]; errors: string[]; warnings: string[] } {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    return {
      valid: [],
      errors: ['The CSV file is empty or does not contain header and data rows.'],
      warnings: [],
    };
  }

  const rawHeaders = rows[0].map((h) => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
  const dataRows = rows.slice(1);

  const getColIndex = (candidates: string[]) => {
    return rawHeaders.findIndex((h) => candidates.some((c) => h === c || h.includes(c)));
  };

  const idIdx = getColIndex(['matchid', 'id']);
  const sportIdx = getColIndex(['sport', 'gametype']);
  const catIdx = getColIndex(['category', 'division']);
  const titleIdx = getColIndex(['titleevent', 'title', 'event', 'matchtitle', 'fixture']);
  const roundIdx = getColIndex(['round', 'stage']);
  const teamAIdx = getColIndex(['teama', 'team1', 'firstteam']);
  const teamBIdx = getColIndex(['teamb', 'team2', 'secondteam']);
  const scoreAIdx = getColIndex(['scorea', 'score1', 'points1']);
  const scoreBIdx = getColIndex(['scoreb', 'score2', 'points2']);
  const detailIdx = getColIndex(['detailscore', 'detail', 'scoretext', 'summary']);
  const winnerIdx = getColIndex(['winnerteam', 'winner', 'winningteam']);
  const venueIdx = getColIndex(['venue', 'ground', 'court', 'location']);
  const timeIdx = getColIndex(['scheduleddatetime', 'time', 'datetime', 'scheduledtime', 'date']);
  const statusIdx = getColIndex(['status', 'matchstatus']);
  const pubStatusIdx = getColIndex(['publishstatus', 'publish']);

  if (sportIdx === -1 && teamAIdx === -1) {
    return {
      valid: [],
      errors: [
        'Could not find required sports columns. Please ensure your CSV includes "Sport", "Team A", and "Team B".',
      ],
      warnings: [],
    };
  }

  // Lookup helpers
  const teamById = new Map<string, Team>();
  const teamByName = new Map<string, Team>();
  const teamByCode = new Map<string, Team>();

  teams.forEach((t) => {
    teamById.set(t.id.toLowerCase(), t);
    teamByName.set(t.name.toLowerCase().trim(), t);
    if (t.shortCode) teamByCode.set(t.shortCode.toLowerCase().trim(), t);
  });

  const resolveTeam = (raw: string, defaultTeam: Team): Team => {
    if (!raw) return defaultTeam;
    const lower = raw.toLowerCase().trim();
    if (teamById.has(lower)) return teamById.get(lower)!;
    if (teamByName.has(lower)) return teamByName.get(lower)!;
    if (teamByCode.has(lower)) return teamByCode.get(lower)!;
    const found = teams.find(
      (t) => t.name.toLowerCase().includes(lower) || lower.includes(t.name.toLowerCase())
    );
    return found || defaultTeam;
  };

  const valid: SportsMatch[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  dataRows.forEach((row, rowIdx) => {
    const rowNum = rowIdx + 2;
    const rawSport = (sportIdx >= 0 ? row[sportIdx] : 'Football').trim();
    const rawTeamA = (teamAIdx >= 0 ? row[teamAIdx] : '').trim();
    const rawTeamB = (teamBIdx >= 0 ? row[teamBIdx] : '').trim();

    if (!rawSport && !rawTeamA && !rawTeamB) {
      return; // Skip empty row
    }

    const fallbackTeam = teams[0] || ({ id: 'team-1', name: 'Team A' } as Team);
    const teamA = resolveTeam(rawTeamA, fallbackTeam);
    const teamB = resolveTeam(rawTeamB, teams[1] || fallbackTeam);

    if (teamA.id === teamB.id && teams.length > 1) {
      warnings.push(`Row ${rowNum}: Team A and Team B are identical ("${teamA.name}").`);
    }

    // Resolve sport
    let sport: SportType = 'Football';
    const sLower = rawSport.toLowerCase();
    if (sLower.includes('cricket')) sport = 'Cricket';
    else if (sLower.includes('badminton')) sport = 'Badminton';
    else if (sLower.includes('volley')) sport = 'Volleyball';
    else if (sLower.includes('basket')) sport = 'Basketball';
    else if (sLower.includes('table') || sLower.includes('tt')) sport = 'Table Tennis';
    else if (sLower.includes('athletic') || sLower.includes('track') || sLower.includes('race') || sLower.includes('relay')) sport = 'Athletics';
    else if (sLower.includes('tug') || sLower.includes('kabaddi')) sport = 'Tug of War';
    else if (sLower.includes('chess')) sport = 'Chess';

    // Resolve status
    const rawStatus = (statusIdx >= 0 ? row[statusIdx] : '').trim().toUpperCase();
    let status: EventStatus = 'UPCOMING';
    if (rawStatus === 'LIVE' || rawStatus === 'IN_PROGRESS' || rawStatus === 'ONGOING') status = 'LIVE';
    else if (rawStatus === 'COMPLETED' || rawStatus === 'FINISHED' || rawStatus === 'CONCLUDED') status = 'COMPLETED';

    // Resolve Winner
    const rawWinner = (winnerIdx >= 0 ? row[winnerIdx] : '').trim();
    let winnerTeamId: string | undefined = undefined;
    if (rawWinner && rawWinner !== '-' && rawWinner !== 'None') {
      const winTeam = resolveTeam(rawWinner, teamA);
      winnerTeamId = winTeam.id;
    }

    const scoreA = scoreAIdx >= 0 && row[scoreAIdx] !== undefined ? row[scoreAIdx].trim() : '0';
    const scoreB = scoreBIdx >= 0 && row[scoreBIdx] !== undefined ? row[scoreBIdx].trim() : '0';
    const title = titleIdx >= 0 && row[titleIdx]?.trim() ? row[titleIdx].trim() : `${sport} Fixture`;
    const round = roundIdx >= 0 && row[roundIdx]?.trim() ? row[roundIdx].trim() : 'Quarter Final';
    const venue = venueIdx >= 0 && row[venueIdx]?.trim() ? row[venueIdx].trim() : 'Main Stadium';
    const scheduledTime = timeIdx >= 0 && row[timeIdx]?.trim() ? row[timeIdx].trim() : 'Day 1 • 10:00 AM';
    const detailScore = detailIdx >= 0 && row[detailIdx]?.trim() ? row[detailIdx].trim() : undefined;
    const matchId = idIdx >= 0 && row[idIdx]?.trim() ? row[idIdx].trim() : `sport-${Date.now() % 100000 + rowIdx}`;
    const pubStatus: ResultPublishStatus = pubStatusIdx >= 0 && row[pubStatusIdx]?.trim() === 'Draft' ? 'Draft' : 'Published';

    valid.push({
      id: matchId,
      sport,
      category: (catIdx >= 0 && (row[catIdx]?.trim() as CategoryType)) || 'Senior',
      title,
      round,
      teamAId: teamA.id,
      teamBId: teamB.id,
      scoreA: isNaN(Number(scoreA)) ? scoreA : Number(scoreA),
      scoreB: isNaN(Number(scoreB)) ? scoreB : Number(scoreB),
      detailScore,
      venue,
      date: scheduledTime.split('•')[0]?.trim() || 'Day 1',
      time: scheduledTime.split('•')[1]?.trim() || '10:00 AM',
      scheduledTime,
      status,
      publishStatus: pubStatus,
      winnerTeamId,
      events: [],
    });
  });

  return { valid, errors, warnings };
}
