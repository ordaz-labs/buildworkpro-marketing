#!/usr/bin/env node
/**
 * Stage 2 — Google Places (New) text search -> normalized company records.
 *
 * The state file proves who is licensed; Places proves who is trading. It adds
 * the two fields DBPR never carries — a website (which is what email enrichment
 * resolves against) and a review count (a rough size proxy that separates a
 * two-truck shop from a dormant registration).
 *
 *   GOOGLE_MAPS_API_KEY=… node scripts/leadgen/places.mjs \
 *     --queries "glass and glazing contractor,storefront glass,shower door installer" \
 *     --cities "Miami FL,Fort Lauderdale FL,West Palm Beach FL" \
 *     --out .leadgen/places.json
 *
 * Billing note: Text Search is billed per request, not per result. The default
 * 3 queries x 3 cities x up to 3 pages is at most 27 requests per run — cents,
 * not dollars — but the script prints its request count so a wider sweep can
 * never surprise you on the invoice.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  normalizeCompanyName,
  normalizePhone,
  normalizeStreet,
  normalizeState,
  normalizeZip,
  normalizeDomain,
  squash,
} from './lib/text.mjs';
import { qualifyGlazing } from './lib/qualify.mjs';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.userRatingCount',
  'places.primaryTypeDisplayName',
  'nextPageToken',
].join(',');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pull one address component by type from the Places response shape.
 * `short` picks the abbreviated form — states must come back "FL", not
 * "Florida", or they will not match the state file's two-letter codes.
 */
function component(place, type, short = false) {
  const found = (place.addressComponents ?? []).find((c) => (c.types ?? []).includes(type));
  if (!found) return '';
  return squash((short ? found.shortText : found.longText) ?? found.longText ?? '');
}

/** Places result -> the same record shape every other stage speaks. */
export function toRecord(place) {
  const company = squash(place.displayName?.text ?? '');
  const street = [component(place, 'street_number'), component(place, 'route')]
    .filter(Boolean)
    .join(' ');
  return {
    source: 'places',
    company,
    companyKey: normalizeCompanyName(company),
    licenseNumber: '',
    classification: squash(place.primaryTypeDisplayName?.text ?? ''),
    status: '',
    street: street || squash(place.formattedAddress ?? '').split(',')[0],
    streetKey: normalizeStreet(street || squash(place.formattedAddress ?? '').split(',')[0]),
    city: component(place, 'locality') || component(place, 'postal_town'),
    state: normalizeState(component(place, 'administrative_area_level_1', true)),
    zip: normalizeZip(component(place, 'postal_code')),
    county: component(place, 'administrative_area_level_2'),
    phone: normalizePhone(place.nationalPhoneNumber ?? ''),
    email: '',
    domain: normalizeDomain(place.websiteUri ?? ''),
    reviewCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : 0,
  };
}

async function searchOnce(apiKey, textQuery, pageToken) {
  const body = { textQuery, pageSize: 20 };
  if (pageToken) body.pageToken = pageToken;

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Places API ${response.status}: ${detail.slice(0, 300)}`);
  }
  return response.json();
}

/** Run every query x city combination, following pagination up to `maxPages`. */
export async function sweep({ apiKey, queries, cities, maxPages = 3, onRequest }) {
  const records = [];
  let requests = 0;

  for (const city of cities) {
    for (const query of queries) {
      let pageToken;
      for (let page = 0; page < maxPages; page += 1) {
        const data = await searchOnce(apiKey, `${query} in ${city}`, pageToken);
        requests += 1;
        if (onRequest) onRequest(requests, `${query} in ${city}`, page + 1);

        for (const place of data.places ?? []) records.push(toRecord(place));

        pageToken = data.nextPageToken;
        if (!pageToken) break;
        // Places rejects a page token used too quickly after it is issued.
        await sleep(2000);
      }
    }
  }
  return { records, requests };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] ?? 'true';
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error(
      'GOOGLE_MAPS_API_KEY is not set. Create a key with the Places API (New) enabled.'
    );
    process.exit(2);
  }

  const queries = (
    args.queries ?? 'glass and glazing contractor,storefront glass,shower door installer'
  )
    .split(',')
    .map((q) => q.trim())
    .filter(Boolean);
  const cities = (args.cities ?? 'Miami FL,Fort Lauderdale FL,West Palm Beach FL')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  console.log(`Places: ${queries.length} queries x ${cities.length} cities (max 3 pages each)`);

  let result;
  try {
    result = await sweep({
      apiKey,
      queries,
      cities,
      onRequest: (n, label, page) => console.log(`  [${n}] ${label} (page ${page})`),
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  // Qualify without a county filter: Places already scoped the search by city,
  // and its county field is often blank.
  const kept = [];
  for (const record of result.records) {
    const verdict = qualifyGlazing(record, { counties: null });
    if (verdict.qualified) kept.push({ ...record, score: verdict.score, flags: verdict.flags });
  }

  const out = args.out ?? '.leadgen/places.json';
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(kept, null, 2)}\n`);

  console.log(`  billed requests: ${result.requests}`);
  console.log(`  results:         ${result.records.length}`);
  console.log(`  qualified:       ${kept.length}`);
  console.log(`  with website:    ${kept.filter((r) => r.domain).length}`);
  console.log(`  -> ${out}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
