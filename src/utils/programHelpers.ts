import { ArtsProgram, ArtsResultEntry } from '../types/festival';

/**
 * Deduplicates and canonicalizes program results.
 * Guarantees that:
 * 1. No participant appears more than once in the same program.
 * 2. No podium rank (1st, 2nd, 3rd) is duplicated by multiple conflicting entries.
 * 3. Results are cleanly sorted by rank (1, 2, 3...).
 */
export function deduplicateProgramResults(results?: any[]): ArtsResultEntry[] {
  if (!Array.isArray(results) || results.length === 0) return [];

  const valid = results.filter((r) => r && typeof r === 'object');
  const seenRanks = new Set<number>();
  const seenParticipants = new Set<string>();
  const deduplicated: ArtsResultEntry[] = [];

  // Iterate from newest/latest to oldest so the most recent verdict/update takes priority
  for (let i = valid.length - 1; i >= 0; i--) {
    const r = valid[i];
    const rankNum = Number(r.rank);
    const isPodiumRank = rankNum === 1 || rankNum === 2 || rankNum === 3;

    const pId = r.participantId ? String(r.participantId).trim().toLowerCase() : '';
    const chestNo = r.chestNo ? String(r.chestNo).trim().toLowerCase() : '';
    const admNo = r.admissionNo ? String(r.admissionNo).trim().toLowerCase() : '';
    const name = r.participantName ? String(r.participantName).trim().toLowerCase() : '';

    // Check if this participant was already recorded
    let duplicateParticipant = false;
    if (pId && seenParticipants.has(`id_${pId}`)) duplicateParticipant = true;
    if (chestNo && seenParticipants.has(`chest_${chestNo}`)) duplicateParticipant = true;
    if (admNo && seenParticipants.has(`adm_${admNo}`)) duplicateParticipant = true;
    if (name && pId.startsWith('team-group-') && seenParticipants.has(`teamgroup_${name}`)) duplicateParticipant = true;

    if (duplicateParticipant) {
      continue;
    }

    // For standard podium positions (1st, 2nd, 3rd), allow only one entry per rank slot
    if (isPodiumRank && seenRanks.has(rankNum)) {
      continue;
    }

    // Register this entry
    if (pId) seenParticipants.add(`id_${pId}`);
    if (chestNo) seenParticipants.add(`chest_${chestNo}`);
    if (admNo) seenParticipants.add(`adm_${admNo}`);
    if (name && pId.startsWith('team-group-')) seenParticipants.add(`teamgroup_${name}`);
    if (isPodiumRank) seenRanks.add(rankNum);

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
 * based on disciplineType tag, program code, event name, or venue.
 */
export function isSportsProgram(p: Partial<ArtsProgram> | any): boolean {
  if (!p) return false;
  const dt = String(p.disciplineType || '').trim().toLowerCase();
  if (dt === 'sports' || dt === 'sport' || dt === 'athletics' || dt === 'athletic') return true;
  if (dt === 'arts' || dt === 'art' || dt === 'cultural' || dt === 'culture') return false;

  // Check code prefix (e.g. SP-101, SPT-01, ATH-01, SPORT-01, ATHLETICS-01)
  const code = String(p.code || '').trim().toLowerCase();
  if (/^(sp|spt|ath|sport|athl|match|game)-?/i.test(code)) return true;
  if (/^(art|arts|cult|lit|clt)-?/i.test(code)) return false;

  // Check name keywords (standard sports / athletics events)
  const name = String(p.name || '').toLowerCase();
  const sportsKeywords = [
    'sprint',
    '100m',
    '200m',
    '400m',
    '800m',
    '1500m',
    '5000m',
    '100 m',
    '200 m',
    '400 m',
    '800 m',
    'relay',
    '4x100',
    '4x400',
    '4 x 100',
    '4 x 400',
    'hurdles',
    'long jump',
    'high jump',
    'triple jump',
    'pole vault',
    'shot put',
    'shotput',
    'discus',
    'javelin',
    'hammer throw',
    'football',
    'cricket',
    'volleyball',
    'badminton',
    'basketball',
    'table tennis',
    'tug of war',
    'tug-of-war',
    'arm wrestling',
    'chess',
    'carrom',
    'kabaddi',
    'athletics',
    'sports',
    'marathon',
    'cross country',
    'swimming',
    'archery',
    'dodgeball',
  ];
  if (sportsKeywords.some((kw) => name.includes(kw))) return true;

  // Check venue/stage keywords (e.g. Stadium, Ground, Court, Track)
  const venue = `${p.venue || ''} ${p.stage || ''}`.toLowerCase();
  if (
    /(ground|stadium|court|track|pitch|arena)/i.test(venue) &&
    !/(auditorium|hall|stage 1|stage 2|seminar)/i.test(venue)
  ) {
    if (/(race|jump|throw|match|tournament|game)/i.test(name)) return true;
  }

  return false;
}
