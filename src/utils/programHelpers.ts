import { ArtsProgram, ArtsResultEntry, Team, SportsMatch, TeamMinus, ScoringRules, FestConfig } from '../types/festival';

export interface DerivedTeamStat {
  id: string;
  name: string;
  shortCode: string;
  color: string;
  subJuniorPoints: number;
  juniorPoints: number;
  seniorPoints: number;
  generalPoints: number;
  artsPoints: number;
  sportsPoints: number;
  artsMinusPoints: number;
  sportsMinusPoints: number;
  minusPoints: number;
  grossTotal: number;
  netGrandTotal: number;
  totalPoints: number;
  golds: number;
  silvers: number;
  bronzes: number;
  totalWins: number;
  rank: number;
}

/**
 * Normalizes category string into canonical categories:
 * 'Sub Junior' | 'Junior' | 'Senior' | 'General'
 */
export function normalizeCategory(
  rawCategory?: string,
  fallbackText?: string
): 'Sub Junior' | 'Junior' | 'Senior' | 'General' {
  const textToScan = `${rawCategory || ''} ${fallbackText || ''}`.trim().toLowerCase().replace(/[-_]/g, ' ');
  if (!textToScan) return 'General';

  // Check Sub Junior first to prevent 'sub junior' matching 'junior'
  if (
    textToScan.includes('sub') ||
    textToScan.includes('sb') ||
    textToScan.includes('s jun') ||
    textToScan.includes('sjun')
  ) {
    return 'Sub Junior';
  }

  // Check Junior
  if (
    textToScan.includes('junior') ||
    textToScan.includes('jun') ||
    textToScan.includes('jnr') ||
    /\bjr\b/.test(textToScan)
  ) {
    return 'Junior';
  }

  // Check Senior
  if (
    textToScan.includes('senior') ||
    textToScan.includes('sen') ||
    textToScan.includes('snr') ||
    /\bsr\b/.test(textToScan)
  ) {
    return 'Senior';
  }

  // General / Open
  return 'General';
}

/**
 * Normalizes team IDs and team names to match the canonical team ID
 */
export function normalizeTeamId(teamIdOrName?: string, teamsList: Team[] = []): string {
  if (!teamIdOrName) return '';
  const raw = String(teamIdOrName).trim();
  if (!raw) return '';

  // 1. Direct match by team ID
  const direct = teamsList.find((t) => t.id.toLowerCase() === raw.toLowerCase());
  if (direct) return direct.id;

  // 2. Direct match by team name or short code
  const nameMatch = teamsList.find(
    (t) =>
      t.name.toLowerCase() === raw.toLowerCase() ||
      (t.shortCode && t.shortCode.toLowerCase() === raw.toLowerCase()) ||
      t.name.toLowerCase().replace(/\s+team$/i, '') === raw.toLowerCase().replace(/\s+team$/i, '')
  );
  if (nameMatch) return nameMatch.id;

  // 3. Robust alias and house color matching for Red, Blue, Yellow
  const lower = raw.toLowerCase();
  if (lower.includes('red') || lower.includes('ruby') || lower.includes('worrier') || lower.includes('warrior')) {
    const redTeam = teamsList.find(
      (t) => t.id === 'team-1' || /red|ruby/i.test(t.name) || /rby/i.test(t.shortCode || '')
    );
    if (redTeam) return redTeam.id;
    return 'team-1';
  }
  if (lower.includes('blue') || lower.includes('sapphire') || lower.includes('striker')) {
    const blueTeam = teamsList.find(
      (t) => t.id === 'team-2' || /blue|sapphire/i.test(t.name) || /sph/i.test(t.shortCode || '')
    );
    if (blueTeam) return blueTeam.id;
    return 'team-2';
  }
  if (lower.includes('yellow') || lower.includes('emerald') || lower.includes('titan')) {
    const yellowTeam = teamsList.find(
      (t) => t.id === 'team-3' || /yellow|emerald/i.test(t.name) || /emr/i.test(t.shortCode || '')
    );
    if (yellowTeam) return yellowTeam.id;
    return 'team-3';
  }

  return raw;
}

/**
 * Deduplicates and canonicalizes program results inside a single program context.
 * Removes duplicate records for the SAME participant, preserving legitimate ties and rank positions.
 */
export function deduplicateProgramResults(results?: any[]): ArtsResultEntry[] {
  if (!Array.isArray(results) || results.length === 0) return [];

  const valid = results.filter((r) => r && typeof r === 'object');
  const seenParticipants = new Set<string>();
  const deduplicated: ArtsResultEntry[] = [];

  // Iterate from newest (last index) to oldest so the most recent verdict/update takes priority
  for (let i = valid.length - 1; i >= 0; i--) {
    const r = valid[i];

    const pId = r.participantId ? String(r.participantId).trim().toLowerCase() : '';
    const chestNo = r.chestNo ? String(r.chestNo).trim().toLowerCase() : '';
    const admNo = r.admissionNo ? String(r.admissionNo).trim().toLowerCase() : '';
    const name = r.participantName ? String(r.participantName).trim().toLowerCase() : '';

    // Create unique participant key within this program context
    let partKey = pId;
    if (!partKey && chestNo) partKey = `chest_${chestNo}`;
    if (!partKey && admNo) partKey = `adm_${admNo}`;
    if (!partKey && name) partKey = `name_${name}_team_${r.teamId || ''}`;

    if (partKey && seenParticipants.has(partKey)) {
      // Duplicate record for the exact same participant in this program -> skip
      continue;
    }

    if (partKey) {
      seenParticipants.add(partKey);
    }

    deduplicated.push(r as ArtsResultEntry);
  }

  // Restore chronological rank ordering (1st, 2nd, 3rd...)
  deduplicated.reverse();
  deduplicated.sort((a, b) => {
    const rA = Number(a.rank) || 999;
    const rB = Number(b.rank) || 999;
    if (rA !== rB) return rA - rB;
    return (Number(b.marks) || 0) - (Number(a.marks) || 0);
  });

  return deduplicated;
}

/**
 * Accurately determines if a program is a Sports/Athletics event
 */
export function isSportsProgram(p: Partial<ArtsProgram> | any): boolean {
  if (!p) return false;
  const dt = String(p.disciplineType || '').trim().toLowerCase();
  if (dt === 'sports' || dt === 'sport' || dt === 'athletics' || dt === 'athletic') return true;
  if (dt === 'arts' || dt === 'art' || dt === 'cultural' || dt === 'culture') return false;

  const code = String(p.code || '').trim().toLowerCase();
  if (/^(sp|spt|ath|sport|athl|match|game)-?/i.test(code)) return true;
  if (/^(art|arts|cult|lit|clt)-?/i.test(code)) return false;

  const name = String(p.name || '').toLowerCase();
  const sportsKeywords = [
    'sprint', '100m', '200m', '400m', '800m', '1500m', '5000m', '100 m', '200 m', '400 m', '800 m',
    'relay', '4x100', '4x400', '4 x 100', '4 x 400', 'hurdles', 'long jump', 'high jump', 'triple jump',
    'pole vault', 'shot put', 'shotput', 'discus', 'javelin', 'hammer throw', 'football', 'cricket',
    'volleyball', 'badminton', 'basketball', 'table tennis', 'tug of war', 'tug-of-war', 'arm wrestling',
    'chess', 'carrom', 'kabaddi', 'athletics', 'sports', 'marathon', 'cross country', 'swimming',
    'archery', 'dodgeball', 'lemon', 'spoon', 'sack race', 'three leg', 'bombing the city'
  ];
  if (sportsKeywords.some((kw) => name.includes(kw))) return true;

  const venue = `${p.venue || ''} ${p.stage || ''}`.toLowerCase();
  if (
    /(ground|stadium|court|track|pitch|arena)/i.test(venue) &&
    !/(auditorium|hall|stage 1|stage 2|seminar)/i.test(venue)
  ) {
    if (/(race|jump|throw|match|tournament|game)/i.test(name)) return true;
  }

  return false;
}

/**
 * Deduplicates and canonicalizes a collection of Arts & Sports programs.
 */
export function deduplicatePrograms(programs?: ArtsProgram[]): ArtsProgram[] {
  if (!Array.isArray(programs) || programs.length === 0) return [];

  const seenIds = new Set<string>();
  const seenCodes = new Set<string>();
  const seenNameCategory = new Set<string>();
  const deduplicated: ArtsProgram[] = [];

  programs.forEach((pr) => {
    if (!pr) return;
    const pId = pr.id ? String(pr.id).trim().toLowerCase() : '';
    const pCode = pr.code ? String(pr.code).trim().toLowerCase() : '';
    const cleanName = pr.name ? String(pr.name).trim().toLowerCase().replace(/\s+/g, ' ') : '';
    const cleanCat = pr.category ? String(pr.category).trim().toLowerCase() : '';
    const nameCatKey = cleanName ? `${cleanName}__${cleanCat}` : '';

    let existingMatchIdx = -1;
    if (pId && seenIds.has(pId)) {
      existingMatchIdx = deduplicated.findIndex((dp) => dp.id && String(dp.id).trim().toLowerCase() === pId);
    } else if (pCode && seenCodes.has(pCode)) {
      existingMatchIdx = deduplicated.findIndex((dp) => dp.code && String(dp.code).trim().toLowerCase() === pCode);
    } else if (nameCatKey && seenNameCategory.has(nameCatKey)) {
      existingMatchIdx = deduplicated.findIndex((dp) => {
        const dpName = dp.name ? String(dp.name).trim().toLowerCase().replace(/\s+/g, ' ') : '';
        const dpCat = dp.category ? String(dp.category).trim().toLowerCase() : '';
        return dpName && `${dpName}__${dpCat}` === nameCatKey;
      });
    }

    const cleanResults = deduplicateProgramResults(pr.results || []);

    if (existingMatchIdx !== -1) {
      const existing = deduplicated[existingMatchIdx];
      const mergedResults = deduplicateProgramResults([...(existing.results || []), ...cleanResults]);
      const isCompleted = existing.status === 'COMPLETED' || pr.status === 'COMPLETED';
      const isPublished = existing.publishStatus === 'Published' || pr.publishStatus === 'Published';

      deduplicated[existingMatchIdx] = {
        ...existing,
        ...pr,
        id: existing.id || pr.id,
        code: existing.code || pr.code,
        name: existing.name || pr.name,
        category: existing.category || pr.category,
        results: mergedResults,
        status: isCompleted ? 'COMPLETED' : (existing.status || pr.status || 'UPCOMING'),
        publishStatus: isPublished ? 'Published' : (existing.publishStatus || pr.publishStatus || 'Draft'),
      };
    } else {
      if (pId) seenIds.add(pId);
      if (pCode) seenCodes.add(pCode);
      if (nameCatKey) seenNameCategory.add(nameCatKey);

      deduplicated.push({
        ...pr,
        results: cleanResults,
      });
    }
  });

  return deduplicated;
}

/**
 * Single Unified Calculation Engine for Website and PDF exports.
 * Derives division totals, gross totals, penalties, net grand total, and team rankings.
 */
export function calculateDerivedTeamStats(
  teams: Team[] = [],
  programs: ArtsProgram[] = [],
  sportsMatches: SportsMatch[] = [],
  teamMinuses: TeamMinus[] = [],
  scoringRules: ScoringRules,
  festConfig: FestConfig
): DerivedTeamStat[] {
  const teamStatsMap: Record<string, DerivedTeamStat> = {};

  teams.forEach((t) => {
    teamStatsMap[t.id] = {
      id: t.id,
      name: t.name,
      shortCode: t.shortCode || '',
      color: t.color || '#1E40AF',
      subJuniorPoints: 0,
      juniorPoints: 0,
      seniorPoints: 0,
      generalPoints: 0,
      artsPoints: 0,
      sportsPoints: 0,
      artsMinusPoints: 0,
      sportsMinusPoints: 0,
      minusPoints: 0,
      grossTotal: 0,
      netGrandTotal: 0,
      totalPoints: 0,
      golds: 0,
      silvers: 0,
      bronzes: 0,
      totalWins: 0,
      rank: 1,
    };
  });

  // 1. Process all Programs with results
  programs.forEach((prog) => {
    // Only published / completed programs are officially counted in standings
    // Draft or Upcoming programs (such as pending tests or unverified marks) MUST NOT be counted
    const isProgramPublished =
      prog.publishStatus === 'Published' ||
      (prog.status === 'COMPLETED' && prog.publishStatus !== 'Draft');
    if (!isProgramPublished) return;

    const cleanResults = deduplicateProgramResults(prog.results || []);
    if (cleanResults.length === 0) return;

    const isGroup = prog.section === 'Group';
    const multiplier = isGroup ? (scoringRules?.groupEventMultiplier || 1.5) : 1;
    const isSports = isSportsProgram(prog);
    const categoryKey = normalizeCategory(prog.category, prog.name);

    cleanResults.forEach((res) => {
      // Must not count draft result marks
      if (res.status && res.status === 'Draft') return;

      const normalizedTId = normalizeTeamId(res.teamId, teams);
      const teamStat = teamStatsMap[normalizedTId];
      if (!teamStat) return;

      let pts = 0;
      if (
        res.pointsAwarded !== undefined &&
        res.pointsAwarded !== null &&
        !isNaN(Number(res.pointsAwarded)) &&
        Number(res.pointsAwarded) > 0
      ) {
        pts = Number(res.pointsAwarded);
      } else {
        // Fallback scoring:
        // Relay: 1st=10, 2nd=7, 3rd=5
        // Standard Individual: 1st=7, 2nd=5, 3rd=3
        const isRelay = /relay/i.test(prog.name || '') || /relay/i.test(prog.code || '');
        if (isRelay) {
          if (res.rank === 1) pts = 10;
          else if (res.rank === 2) pts = 7;
          else if (res.rank === 3) pts = 5;
        } else {
          if (res.rank === 1) pts = 7;
          else if (res.rank === 2) pts = 5;
          else if (res.rank === 3) pts = 3;
        }
      }

      // Add to Category Division Total
      if (categoryKey === 'Sub Junior') teamStat.subJuniorPoints += pts;
      else if (categoryKey === 'Junior') teamStat.juniorPoints += pts;
      else if (categoryKey === 'Senior') teamStat.seniorPoints += pts;
      else teamStat.generalPoints += pts;

      // Add to Discipline Total
      if (isSports) {
        teamStat.sportsPoints += pts;
      } else {
        teamStat.artsPoints += pts;
      }

      // Medals & Wins
      if (res.rank === 1) {
        teamStat.golds += 1;
        teamStat.totalWins += 1;
      } else if (res.rank === 2) {
        teamStat.silvers += 1;
      } else if (res.rank === 3) {
        teamStat.bronzes += 1;
      }
    });
  });

  // 2. Process Completed Sports Matches (Track Medals & Wins without adding unrequested extra points)
  sportsMatches.forEach((match) => {
    if (match.publishStatus === 'Published' && match.status === 'COMPLETED' && match.winnerTeamId) {
      const winnerId = normalizeTeamId(match.winnerTeamId, teams);
      if (teamStatsMap[winnerId]) {
        teamStatsMap[winnerId].golds += (match.round === 'Final' ? 1 : 0);
        teamStatsMap[winnerId].totalWins += 1;
      }

      const loserTeamId = match.winnerTeamId === match.teamAId ? match.teamBId : match.teamAId;
      const normalizedLoserId = normalizeTeamId(loserTeamId, teams);
      if (teamStatsMap[normalizedLoserId]) {
        if (match.round === 'Final') {
          teamStatsMap[normalizedLoserId].silvers += 1;
        } else if (match.round === '3rd Place Playoff') {
          teamStatsMap[normalizedLoserId].bronzes += 1;
        }
      }
    }
  });

  // 3. Process Penalties & Compute Gross / Net Totals
  const applyArts = festConfig?.applyArtsPenalties ?? (festConfig?.applyPenaltiesToPodium ?? true);
  const applySports = festConfig?.applySportsPenalties ?? (festConfig?.applyPenaltiesToPodium ?? true);

  const teamList = Object.values(teamStatsMap).map((teamStat) => {
    const teamMinusList = teamMinuses.filter((m) => normalizeTeamId(m.teamId, teams) === teamStat.id);

    const artsMinusPoints = teamMinusList
      .filter((m) => (m.scope || 'arts') === 'arts')
      .reduce((acc, m) => acc + (Number(m.pointsDeducted !== undefined ? m.pointsDeducted : m.points) || 0), 0);

    const sportsMinusPoints = teamMinusList
      .filter((m) => m.scope === 'sports')
      .reduce((acc, m) => acc + (Number(m.pointsDeducted !== undefined ? m.pointsDeducted : m.points) || 0), 0);

    const otherMinusPoints = teamMinusList
      .filter((m) => m.scope !== 'arts' && m.scope !== 'sports')
      .reduce((acc, m) => acc + (Number(m.pointsDeducted !== undefined ? m.pointsDeducted : m.points) || 0), 0);

    const minusPoints = artsMinusPoints + sportsMinusPoints + otherMinusPoints;

    const effectiveArtsMinus = applyArts ? artsMinusPoints : 0;
    const effectiveSportsMinus = applySports ? sportsMinusPoints : 0;
    const effectiveOtherMinus = otherMinusPoints;

    // Gross Total MUST be the exact sum of all 4 division totals
    // Gross Total = Sub Junior + Junior + Senior + General
    const grossTotal = teamStat.subJuniorPoints + teamStat.juniorPoints + teamStat.seniorPoints + teamStat.generalPoints;

    // Net Grand Total with penalty deductions
    // teamFinalPoints = SubJuniorPoints + JuniorPoints + SeniorPoints + GeneralPoints - MinusPoints
    const netGrandTotal = Math.max(0, grossTotal - (effectiveArtsMinus + effectiveSportsMinus + effectiveOtherMinus));

    return {
      ...teamStat,
      artsMinusPoints,
      sportsMinusPoints,
      minusPoints,
      grossTotal,
      netGrandTotal,
      totalPoints: netGrandTotal,
    };
  });

  // Sort teams strictly DESCENDING by Net Grand Total (highest final points must be Rank 1)
  // Tie-breaker: grossTotal descending, then golds descending, then silvers descending
  teamList.sort((a, b) => {
    if (b.netGrandTotal !== a.netGrandTotal) return b.netGrandTotal - a.netGrandTotal;
    if (b.grossTotal !== a.grossTotal) return b.grossTotal - a.grossTotal;
    if (b.golds !== a.golds) return b.golds - a.golds;
    return b.silvers - a.silvers;
  });

  return teamList.map((stat, idx) => ({
    ...stat,
    rank: idx + 1,
  }));
}

/**
 * Validation function that checks math consistency for every team
 * and logs detailed diagnostic outputs.
 */
export function validateTeamTotals(statsList: DerivedTeamStat[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  statsList.forEach((st) => {
    // Check: Sub Junior + Junior + Senior + General = Gross Total
    const expectedGross = st.subJuniorPoints + st.juniorPoints + st.seniorPoints + st.generalPoints;
    if (st.grossTotal !== expectedGross) {
      errors.push(
        `Gross Total Mismatch for ${st.name}: Sub Junior(${st.subJuniorPoints}) + Junior(${st.juniorPoints}) + Senior(${st.seniorPoints}) + General(${st.generalPoints}) = ${expectedGross}, but got ${st.grossTotal}`
      );
    }

    // Check: Gross Total - Minus = Grand Total
    const expectedNet = Math.max(0, st.grossTotal - st.minusPoints);
    if (st.netGrandTotal !== expectedNet) {
      errors.push(
        `Net Total Mismatch for ${st.name}: Gross(${st.grossTotal}) - Minus(${st.minusPoints}) = ${expectedNet}, but got ${st.netGrandTotal}`
      );
    }

    console.log(
      `[STAT AUDIT] TEAM: ${st.name} | Sub Junior: ${st.subJuniorPoints} | Junior: ${st.juniorPoints} | Senior: ${st.seniorPoints} | General: ${st.generalPoints} | Gross: ${st.grossTotal} | Minus: ${st.minusPoints} | Final: ${st.netGrandTotal} | Rank: ${st.rank}`
    );
  });

  // Check: Ranking is sorted by Grand Total descending
  for (let i = 0; i < statsList.length - 1; i++) {
    if (statsList[i].netGrandTotal < statsList[i + 1].netGrandTotal) {
      errors.push(
        `Ranking Inversion: Rank ${statsList[i].rank} (${statsList[i].name}: ${statsList[i].netGrandTotal}) is less than Rank ${statsList[i + 1].rank} (${statsList[i + 1].name}: ${statsList[i + 1].netGrandTotal})`
      );
    }
  }

  // Authoritative Validation check for the verified current dataset:
  const redTeam = statsList.find((s) => /red|ruby/i.test(s.name) || s.id === 'team-1');
  const blueTeam = statsList.find((s) => /blue|sapphire/i.test(s.name) || s.id === 'team-2');
  const yellowTeam = statsList.find((s) => /yellow|emerald/i.test(s.name) || s.id === 'team-3');

  if (redTeam && blueTeam && yellowTeam) {
    const redPoints = redTeam.netGrandTotal;
    const bluePoints = blueTeam.netGrandTotal;
    const yellowPoints = yellowTeam.netGrandTotal;

    const redMatches = redPoints === 129;
    const blueMatches = bluePoints === 115;
    const yellowMatches = yellowPoints === 105;

    if (!redMatches || !blueMatches || !yellowMatches) {
      console.error(
        `PODIUM VALIDATION ERROR\nRed:\nExpected: 129\nCalculated: ${redPoints}\nBlue:\nExpected: 115\nCalculated: ${bluePoints}\nYellow:\nExpected: 105\nCalculated: ${yellowPoints}`
      );
      errors.push(
        `PODIUM VALIDATION ERROR: Red Expected 129 got ${redPoints}; Blue Expected 115 got ${bluePoints}; Yellow Expected 105 got ${yellowPoints}`
      );
    } else {
      console.log(
        `[PODIUM VALIDATION VERIFIED] Final Standings match authoritative PDF: 1st Red (129), 2nd Blue (115), 3rd Yellow (105).`
      );
    }
  }

  if (errors.length > 0) {
    console.error(`[CALCULATION ENGINE VALIDATION ERROR] Found ${errors.length} mismatch(es):`, errors);
  }

  return { valid: errors.length === 0, errors };
}
