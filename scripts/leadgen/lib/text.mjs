/**
 * Normalization helpers shared by every stage of the lead pipeline.
 *
 * The whole engine depends on recognizing that "ACME GLASS & MIRROR, INC." from a
 * state license file and "Acme Glass and Mirror Inc" from a Maps listing are the
 * same company. That judgement lives here, in one place, so the DBPR parser, the
 * Places parser, and the merge step can never disagree about it.
 */

/** Legal-entity suffixes that carry no identity — dropped before comparing names. */
const LEGAL_SUFFIXES = new Set([
  'INC',
  'INCORPORATED',
  'LLC',
  'LLP',
  'LP',
  'LTD',
  'CORP',
  'CORPORATION',
  'CO',
  'COMPANY',
  'PA',
  'PLLC',
  'DBA',
]);

/** USPS-style abbreviations so two spellings of one street collapse to one key. */
const STREET_ABBREVIATIONS = new Map([
  ['STREET', 'ST'],
  ['AVENUE', 'AVE'],
  ['BOULEVARD', 'BLVD'],
  ['DRIVE', 'DR'],
  ['ROAD', 'RD'],
  ['LANE', 'LN'],
  ['COURT', 'CT'],
  ['PLACE', 'PL'],
  ['TERRACE', 'TER'],
  ['CIRCLE', 'CIR'],
  ['HIGHWAY', 'HWY'],
  ['PARKWAY', 'PKWY'],
  ['SUITE', 'STE'],
  ['UNIT', 'STE'],
  ['NORTH', 'N'],
  ['SOUTH', 'S'],
  ['EAST', 'E'],
  ['WEST', 'W'],
  ['NORTHWEST', 'NW'],
  ['NORTHEAST', 'NE'],
  ['SOUTHWEST', 'SW'],
  ['SOUTHEAST', 'SE'],
]);

/** Collapse whitespace and uppercase. The base of every other normalizer. */
export function squash(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

/**
 * Reduce a company name to its identity: uppercase, no punctuation, no legal
 * suffix, "AND" for "&". "ACME GLASS & MIRROR, INC." -> "ACME GLASS AND MIRROR".
 */
export function normalizeCompanyName(value) {
  const base = squash(value)
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!base) return '';

  const words = base.split(' ');
  // Strip trailing legal suffixes only — "INC" mid-name is part of the name.
  while (words.length > 1 && LEGAL_SUFFIXES.has(words[words.length - 1])) {
    words.pop();
  }
  return words.join(' ');
}

/** 10-digit NANP string, or '' when the input isn't a usable US phone number. */
export function normalizePhone(value) {
  const digits = squash(value).replace(/\D/g, '');
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return local.length === 10 ? local : '';
}

/** Format a normalized phone for humans: 3055551234 -> (305) 555-1234. */
export function formatPhone(value) {
  const digits = normalizePhone(value);
  if (!digits) return '';
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Street address reduced to a comparable key — abbreviations applied, no punctuation. */
export function normalizeStreet(value) {
  const base = squash(value)
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!base) return '';
  return base
    .split(' ')
    .map((word) => STREET_ABBREVIATIONS.get(word) ?? word)
    .join(' ');
}

/** Two-letter state code, or '' if the value isn't one. */
export function normalizeState(value) {
  const base = squash(value)
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
  return base.length === 2 ? base : '';
}

/** 5-digit ZIP (ZIP+4 truncated), or '' when absent. */
export function normalizeZip(value) {
  const digits = squash(value).replace(/\D/g, '');
  return digits.length >= 5 ? digits.slice(0, 5) : '';
}

/** Lowercased registrable host with 'www.' removed, from a URL or bare domain. */
export function normalizeDomain(value) {
  let raw = squash(value).toLowerCase();
  if (!raw) return '';
  if (!raw.includes('://')) raw = `https://${raw}`;
  try {
    return new URL(raw).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Lowercased, trimmed email — '' unless it has the shape of an address. */
export function normalizeEmail(value) {
  const base = squash(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(base) ? base : '';
}

/** Display casing for a SHOUTED source value: 'ACME GLASS' -> 'Acme Glass'. */
export function titleCase(value) {
  const base = squash(value);
  if (!base) return '';
  // Already mixed-case input is left alone — the source knew better than we do.
  if (base !== base.toUpperCase()) return base;
  return base
    .toLowerCase()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase())
    .replace(/\b(Llc|Inc|Pa|Llp|Lp)\b/g, (word) => word.toUpperCase());
}
