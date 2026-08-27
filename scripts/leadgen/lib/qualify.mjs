/**
 * ICP qualification for the glazing vertical.
 *
 * The list is only as good as what it excludes. Two exclusions matter most:
 *
 *  - Auto glass. "Glass" in the name catches windshield shops, and they are a
 *    different business entirely — no GC bids, no schedule of values, no pay
 *    applications, no retainage. Emailing them about AIA billing burns domain
 *    reputation for nothing.
 *  - Distributors and fabricators. They sell glass to contractors rather than
 *    bidding and installing it. Flagged rather than dropped, because plenty of
 *    South Florida shops both fabricate and install.
 *
 * Everything here is data, not code, so a second vertical (concrete, electrical)
 * is a new keyword set rather than a new script.
 */

/** Name/classification tokens that say "this company installs glass". */
const TRADE_KEYWORDS = [
  'GLASS',
  'GLAZING',
  'GLAZIER',
  'STOREFRONT',
  'STORE FRONT',
  'MIRROR',
  'SHOWER DOOR',
  'CURTAIN WALL',
  'WINDOW',
  'ALUMINUM',
  'IMPACT WINDOW',
  'RAILING',
];

/** Hard disqualifiers — a different trade wearing a similar word. */
const DISQUALIFYING_KEYWORDS = [
  'AUTO GLASS',
  'AUTOGLASS',
  'WINDSHIELD',
  'AUTO TINT',
  'COLLISION',
  'AUTOMOTIVE',
  'CAR WASH',
  'SAFELITE',
];

/** Soft flags — probably supply-side, worth a human glance before emailing. */
const REVIEW_KEYWORDS = ['SUPPLY', 'SUPPLIES', 'DISTRIBUT', 'WHOLESALE', 'MANUFACTUR'];

/** License statuses that mean the company can legally take work today. */
const ACTIVE_STATUSES = ['CURRENT', 'ACTIVE', 'CURRENT,ACTIVE', 'VALID'];

/** South Florida beachhead. Counties are matched case-insensitively. */
export const SOUTH_FLORIDA_COUNTIES = ['MIAMI-DADE', 'DADE', 'BROWARD', 'PALM BEACH', 'MONROE'];

function containsAny(haystack, needles) {
  return needles.filter((needle) => haystack.includes(needle));
}

/**
 * Score one normalized record against the glazing ICP.
 * Returns { qualified, score, reasons, flags } — `reasons` explains a rejection
 * so a surprising exclusion can be audited instead of guessed at.
 */
export function qualifyGlazing(record, options = {}) {
  const counties = options.counties ?? null;
  const haystack = [record.company, record.classification, record.categories]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  const reasons = [];
  const flags = [];
  let score = 0;

  const disqualifiers = containsAny(haystack, DISQUALIFYING_KEYWORDS);
  if (disqualifiers.length > 0) {
    return {
      qualified: false,
      score: 0,
      reasons: [`auto-glass or non-trade keyword: ${disqualifiers.join(', ')}`],
      flags,
    };
  }

  const tradeHits = containsAny(haystack, TRADE_KEYWORDS);
  if (tradeHits.length === 0) {
    return { qualified: false, score: 0, reasons: ['no glazing trade keyword'], flags };
  }
  score += Math.min(tradeHits.length, 3) * 10;

  if (counties && counties.length > 0) {
    const county = (record.county ?? '').toUpperCase();
    const inMetro = counties.some((target) => county.includes(target.toUpperCase()));
    if (!inMetro) {
      return {
        qualified: false,
        score,
        reasons: [`outside target metro (county: ${record.county || 'unknown'})`],
        flags,
      };
    }
    score += 10;
  }

  // An expired licence means the company may not be trading — never email it.
  if (record.status) {
    const status = record.status.toUpperCase();
    const active = ACTIVE_STATUSES.some((value) => status.includes(value));
    if (!active) {
      return { qualified: false, score, reasons: [`license status: ${record.status}`], flags };
    }
    score += 15;
  }

  const reviewHits = containsAny(haystack, REVIEW_KEYWORDS);
  if (reviewHits.length > 0) flags.push(`possible supply-side: ${reviewHits.join(', ')}`);

  // Reachability: a row with no way to contact it is not a lead.
  if (record.phone) score += 10;
  if (record.email) score += 20;
  if (record.domain) score += 15;
  if (record.street && record.zip) score += 10;

  if (!record.phone && !record.email && !record.domain) {
    return { qualified: false, score, reasons: ['no phone, email, or website'], flags };
  }

  // Review count is a rough size proxy: a shop with reviews is trading.
  if (typeof record.reviewCount === 'number' && record.reviewCount > 0) {
    score += Math.min(record.reviewCount, 50) / 5;
  }

  return { qualified: true, score: Math.round(score), reasons, flags };
}
