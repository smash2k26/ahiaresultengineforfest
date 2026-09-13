import { ArtsProgram } from '../types/festival';

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
