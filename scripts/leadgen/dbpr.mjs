#!/usr/bin/env node
/**
 * Stage 1 — Florida DBPR licensee extract -> normalized company records.
 *
 * DBPR publishes downloadable licensee files (Business/Individual extracts per
 * board) at https://www2.myfloridalicense.com/sto/file_download/. Download the
 * construction-industry business file, then point this script at it:
 *
 *   node scripts/leadgen/dbpr.mjs --in ~/Downloads/cilb_business.csv \
 *     --out .leadgen/dbpr.json
 *
 * The state file is the spine of the list: it is free, authoritative on who may
 * legally contract, and carries the mailing address the postcard test needs.
 * Column names drift between refreshes, so the header is discovered rather than
 * assumed — if a required field is missing the script prints the headers it did
 * find and exits non-zero instead of emitting malformed rows.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseDelimited, buildHeaderMap, missingFields } from './lib/csv.mjs';
import {
  normalizeCompanyName,
  normalizePhone,
  normalizeStreet,
  normalizeState,
  normalizeZip,
  normalizeEmail,
  squash,
  titleCase,
} from './lib/text.mjs';
import { qualifyGlazing, SOUTH_FLORIDA_COUNTIES } from './lib/qualify.mjs';

/** Logical field -> the column names DBPR extracts have used for it. */
const FIELD_SPEC = {
  licenseNumber: ['LicenseNumber', 'LicNbr', 'License', 'LicenseNo'],
  company: ['BusinessName', 'DBAName', 'PrimaryBusinessName', 'Name', 'CompanyName'],
  classification: ['LicenseType', 'Classification', 'Rank', 'BoardName', 'ProfessionName'],
  status: ['LicenseStatus', 'Status', 'StatusCode', 'PrimaryStatus'],
  street: ['MailingAddress', 'Address1', 'BusinessAddress', 'AddressLine1', 'Street'],
  city: ['City', 'MailingCity', 'BusinessCity'],
  state: ['State', 'MailingState', 'BusinessState'],
  zip: ['Zip', 'ZipCode', 'MailingZip', 'PostalCode'],
  county: ['County', 'CountyName', 'MailingCounty'],
  phone: ['Phone', 'PhoneNumber', 'BusinessPhone', 'Telephone'],
  email: ['Email', 'EmailAddress'],
  expires: ['ExpirationDate', 'ExpiresOn', 'LicenseExpirationDate'],
};

const REQUIRED = ['company'];

export function parseDbprText(text, options = {}) {
  const { headers, rows } = parseDelimited(text);
  const mapping = buildHeaderMap(headers, FIELD_SPEC);

  const absent = missingFields(mapping, REQUIRED);
  if (absent.length > 0) {
    const error = new Error(
      `DBPR file is missing required column(s): ${absent.join(', ')}.\n` +
        `Columns found: ${headers.join(' | ')}\n` +
        `Add the real column name to FIELD_SPEC in scripts/leadgen/dbpr.mjs.`
    );
    error.headers = headers;
    throw error;
  }

  const pick = (row, field) => (mapping[field] ? squash(row[mapping[field]]) : '');
  const counties = options.counties ?? SOUTH_FLORIDA_COUNTIES;

  const kept = [];
  const rejected = [];

  for (const row of rows) {
    const company = pick(row, 'company');
    if (!company) continue;

    const record = {
      source: 'dbpr',
      company: titleCase(company),
      companyKey: normalizeCompanyName(company),
      licenseNumber: pick(row, 'licenseNumber'),
      classification: pick(row, 'classification'),
      status: pick(row, 'status'),
      street: titleCase(pick(row, 'street')),
      streetKey: normalizeStreet(pick(row, 'street')),
      city: titleCase(pick(row, 'city')),
      state: normalizeState(pick(row, 'state')) || 'FL',
      zip: normalizeZip(pick(row, 'zip')),
      county: pick(row, 'county'),
      phone: normalizePhone(pick(row, 'phone')),
      email: normalizeEmail(pick(row, 'email')),
      domain: '',
      licenseExpires: pick(row, 'expires'),
    };

    const verdict = qualifyGlazing(record, { counties });
    if (verdict.qualified) {
      kept.push({ ...record, score: verdict.score, flags: verdict.flags });
    } else {
      rejected.push({ company: record.company, reason: verdict.reasons[0] ?? 'unqualified' });
    }
  }

  return { mapping, headers, kept, rejected, totalRows: rows.length };
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
    console.error('Usage: node scripts/leadgen/dbpr.mjs --in <licensee-file> [--out file.json]');
    console.error(
      'Download the licensee file from https://www2.myfloridalicense.com/sto/file_download/'
    );
    process.exit(2);
  }

  let result;
  try {
    result = parseDbprText(readFileSync(args.in, 'utf8'), {
      counties: args.counties ? args.counties.split(',') : undefined,
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const out = args.out ?? '.leadgen/dbpr.json';
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(result.kept, null, 2)}\n`);

  console.log(`DBPR: read ${result.totalRows} rows`);
  console.log(`  mapped columns: ${Object.keys(result.mapping).join(', ')}`);
  console.log(`  qualified:      ${result.kept.length}`);
  console.log(`  rejected:       ${result.rejected.length}`);
  const withEmail = result.kept.filter((r) => r.email).length;
  console.log(`  with email:     ${withEmail} (rest need enrichment)`);
  console.log(`  -> ${out}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
