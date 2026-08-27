#!/usr/bin/env node
/**
 * Stage 3 — merge every source into one deduplicated, ranked list.
 *
 *   node scripts/leadgen/merge.mjs --in .leadgen/dbpr.json,.leadgen/places.json \
 *     --out-csv .leadgen/glazing-south-florida.csv \
 *     --out-json .leadgen/glazing-south-florida.json
 *
 * The two sources describe the same companies from opposite sides: DBPR knows
 * the licence number and the mailing address a postcard needs; Places knows the
 * website that email enrichment resolves against and the review count that says
 * the shop is alive. Neither alone is a usable list — the merge is the product.
 *
 * Matching is deliberately conservative. A false merge silently deletes a real
 * prospect, so two records join only on evidence that is hard to share by
 * coincidence: same licence number, same website domain, same phone, or the
 * same normalized company name at the same address or ZIP. Similar names in
 * different places stay separate.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { toCsv } from './lib/csv.mjs';
import { formatPhone } from './lib/text.mjs';

/** Keys that identify the same company. Order matters: strongest evidence first. */
function identityKeys(record) {
  const keys = [];
  if (record.licenseNumber) keys.push(`lic:${record.licenseNumber.toUpperCase()}`);
  if (record.domain) keys.push(`dom:${record.domain}`);
  if (record.phone) keys.push(`tel:${record.phone}`);
  if (record.companyKey && record.streetKey) {
    keys.push(`nam+st:${record.companyKey}|${record.streetKey}`);
  }
  if (record.companyKey && record.zip) keys.push(`nam+zip:${record.companyKey}|${record.zip}`);
  return keys;
}

/** Keep the first non-empty value, so an earlier (higher-trust) source wins. */
function coalesce(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

function mergeRecords(base, incoming) {
  return {
    ...base,
    company: coalesce(base.company, incoming.company),
    companyKey: coalesce(base.companyKey, incoming.companyKey),
    licenseNumber: coalesce(base.licenseNumber, incoming.licenseNumber),
    classification: coalesce(base.classification, incoming.classification),
    status: coalesce(base.status, incoming.status),
    street: coalesce(base.street, incoming.street),
    streetKey: coalesce(base.streetKey, incoming.streetKey),
    city: coalesce(base.city, incoming.city),
    state: coalesce(base.state, incoming.state),
    zip: coalesce(base.zip, incoming.zip),
    county: coalesce(base.county, incoming.county),
    phone: coalesce(base.phone, incoming.phone),
    email: coalesce(base.email, incoming.email),
    domain: coalesce(base.domain, incoming.domain),
    licenseExpires: coalesce(base.licenseExpires, incoming.licenseExpires),
    reviewCount: Math.max(base.reviewCount ?? 0, incoming.reviewCount ?? 0),
    // A company confirmed by two independent sources is a better bet than one.
    score: Math.max(base.score ?? 0, incoming.score ?? 0) + 10,
    flags: [...new Set([...(base.flags ?? []), ...(incoming.flags ?? [])])],
    sources: [...new Set([...(base.sources ?? [base.source]), incoming.source])].filter(Boolean),
  };
}

/**
 * Merge record lists. Earlier lists win field conflicts, so pass the
 * authoritative source (DBPR) first.
 */
export function mergeAll(lists) {
  const byKey = new Map();
  const merged = [];

  for (const list of lists) {
    for (const record of list) {
      const keys = identityKeys(record);
      const hitIndex = keys.map((key) => byKey.get(key)).find((index) => index !== undefined);

      if (hitIndex === undefined) {
        const entry = { ...record, sources: [record.source] };
        const index = merged.length;
        merged.push(entry);
        for (const key of identityKeys(entry)) byKey.set(key, index);
      } else {
        merged[hitIndex] = mergeRecords(merged[hitIndex], record);
        // New identity keys learned from the incoming record point at the same row.
        for (const key of identityKeys(merged[hitIndex])) {
          if (!byKey.has(key)) byKey.set(key, hitIndex);
        }
      }
    }
  }

  merged.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return merged;
}

/** Columns for the spreadsheet a human actually reviews before anything sends. */
const CSV_COLUMNS = [
  'company',
  'contactEmail',
  'phoneFormatted',
  'domain',
  'street',
  'city',
  'state',
  'zip',
  'county',
  'licenseNumber',
  'licenseExpires',
  'reviewCount',
  'score',
  'sources',
  'flags',
  'needsEmail',
];

function toCsvRow(record) {
  return {
    company: record.company,
    contactEmail: record.email,
    phoneFormatted: formatPhone(record.phone),
    domain: record.domain,
    street: record.street,
    city: record.city,
    state: record.state,
    zip: record.zip,
    county: record.county,
    licenseNumber: record.licenseNumber,
    licenseExpires: record.licenseExpires ?? '',
    reviewCount: record.reviewCount ?? 0,
    score: record.score ?? 0,
    sources: (record.sources ?? []).join('+'),
    flags: (record.flags ?? []).join('; '),
    needsEmail: record.email ? '' : 'yes',
  };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] ?? 'true';
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.in) {
    console.error(
      'Usage: node scripts/leadgen/merge.mjs --in a.json,b.json [--out-csv f] [--out-json f]'
    );
    process.exit(2);
  }

  const paths = args.in
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const lists = paths.map((path) => JSON.parse(readFileSync(path, 'utf8')));
  const before = lists.reduce((sum, list) => sum + list.length, 0);
  const merged = mergeAll(lists);

  const outCsv = args['out-csv'] ?? '.leadgen/leads.csv';
  const outJson = args['out-json'] ?? '.leadgen/leads.json';
  mkdirSync(dirname(outCsv), { recursive: true });
  mkdirSync(dirname(outJson), { recursive: true });
  writeFileSync(outCsv, toCsv(merged.map(toCsvRow), CSV_COLUMNS));
  writeFileSync(outJson, `${JSON.stringify(merged, null, 2)}\n`);

  const withEmail = merged.filter((r) => r.email).length;
  const multiSource = merged.filter((r) => (r.sources ?? []).length > 1).length;
  console.log(`Merge: ${before} records in from ${paths.length} source(s)`);
  console.log(
    `  unique companies:   ${merged.length} (${before - merged.length} duplicates collapsed)`
  );
  console.log(`  confirmed by 2+:    ${multiSource}`);
  console.log(`  ready to email:     ${withEmail}`);
  console.log(`  need enrichment:    ${merged.length - withEmail}`);
  console.log(`  -> ${outCsv}`);
  console.log(`  -> ${outJson}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
