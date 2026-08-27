/**
 * Unit tests for the lead pipeline.
 *
 * Run: node --test scripts/leadgen/test/
 *
 * The invariants worth protecting are the ones whose failure is silent: a bad
 * dedupe key deletes real prospects, and a leaky ICP filter emails windshield
 * shops. Both would look like a successful run.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  normalizeCompanyName,
  normalizePhone,
  normalizeStreet,
  normalizeDomain,
  formatPhone,
} from '../lib/text.mjs';
import { parseDelimited, buildHeaderMap, missingFields, toCsv } from '../lib/csv.mjs';
import { qualifyGlazing, SOUTH_FLORIDA_COUNTIES } from '../lib/qualify.mjs';
import { parseDbprText } from '../dbpr.mjs';
import { mergeAll } from '../merge.mjs';
import { buildPayloads } from '../import-bwp.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures/dbpr-sample.csv'), 'utf8');

test('company names from different sources collapse to one key', () => {
  const key = normalizeCompanyName('ACME GLASS & MIRROR, INC.');
  assert.equal(key, 'ACME GLASS AND MIRROR');
  assert.equal(normalizeCompanyName('Acme Glass and Mirror Inc'), key);
  assert.equal(normalizeCompanyName('acme  glass   &  mirror llc'), key);
});

test('a legal suffix inside a name is not stripped', () => {
  assert.equal(normalizeCompanyName('INC GLASS CO'), 'INC GLASS');
});

test('phone numbers normalize across formats', () => {
  assert.equal(normalizePhone('+1 (305) 555-1234'), '3055551234');
  assert.equal(normalizePhone('305.555.1234'), '3055551234');
  assert.equal(normalizePhone('555-1234'), '', 'a 7-digit number is not usable');
  assert.equal(formatPhone('3055551234'), '(305) 555-1234');
});

test('street spellings collapse to one key', () => {
  assert.equal(normalizeStreet('7720 Northwest 74th Terrace'), '7720 NW 74TH TER');
  assert.equal(normalizeStreet('7720 NW 74th Ter.'), '7720 NW 74TH TER');
});

test('domains normalize and reject junk', () => {
  assert.equal(normalizeDomain('https://WWW.AcmeGlass.com/about'), 'acmeglass.com');
  assert.equal(normalizeDomain('acmeglass.com'), 'acmeglass.com');
  assert.equal(normalizeDomain('not a url'), '');
});

test('delimiter is detected and quoted fields survive', () => {
  const pipe = parseDelimited('a|b\n1|2');
  assert.equal(pipe.delimiter, '|');
  const quoted = parseDelimited('a,b\n"x,1","he said ""hi"""');
  assert.deepEqual(quoted.rows[0], { a: 'x,1', b: 'he said "hi"' });
});

test('header mapping tolerates drifted column names and reports gaps', () => {
  const { headers } = parseDelimited('License Number|Primary Business Name|Status');
  const mapping = buildHeaderMap(headers, {
    licenseNumber: ['LicenseNumber'],
    company: ['BusinessName'],
    email: ['Email'],
  });
  assert.equal(mapping.company, 'Primary Business Name');
  assert.deepEqual(missingFields(mapping, ['company', 'email']), ['email']);
});

test('auto glass is always rejected, however it is spelled', () => {
  for (const name of ['JOE AUTO GLASS', 'ABC AUTOGLASS LLC', 'QUICK WINDSHIELD REPAIR']) {
    const verdict = qualifyGlazing({ company: name, status: 'Current', phone: '3055551234' });
    assert.equal(verdict.qualified, false, `${name} should be rejected`);
  }
});

test('a qualified glazing shop passes and carries a score', () => {
  const verdict = qualifyGlazing(
    {
      company: 'COASTAL STOREFRONT AND ALUMINUM',
      county: 'MIAMI-DADE',
      status: 'Current',
      phone: '7865554400',
      domain: 'coastalstorefront.com',
    },
    { counties: SOUTH_FLORIDA_COUNTIES }
  );
  assert.equal(verdict.qualified, true);
  assert.ok(verdict.score > 0);
});

test('unreachable and expired records never become leads', () => {
  assert.equal(
    qualifyGlazing({ company: 'GHOST GLAZING', status: 'Current' }).qualified,
    false,
    'no phone/email/website'
  );
  assert.equal(
    qualifyGlazing({ company: 'OLD GLASS', status: 'Expired', phone: '3055551234' }).qualified,
    false,
    'expired licence'
  );
});

test('supply houses are flagged for review, not silently dropped', () => {
  const verdict = qualifyGlazing({
    company: 'GULFSTREAM GLASS SUPPLY CO',
    status: 'Current',
    phone: '9545556060',
  });
  assert.equal(verdict.qualified, true);
  assert.match(verdict.flags.join(' '), /supply-side/);
});

test('the DBPR fixture yields only in-metro, active, non-auto glazing firms', () => {
  const { kept, rejected } = parseDbprText(fixture);
  const names = kept.map((record) => record.companyKey);

  assert.ok(names.includes('ACME GLASS AND MIRROR'));
  assert.ok(names.includes('COASTAL STOREFRONT AND ALUMINUM'));
  assert.ok(!names.some((name) => name.includes('AUTO')), 'auto glass excluded');
  assert.ok(!names.some((name) => name.includes('TAMPA')), 'out-of-metro excluded');
  assert.ok(!names.some((name) => name.includes('LEGACY')), 'expired licence excluded');
  assert.ok(!names.some((name) => name.includes('ROOFING')), 'wrong trade excluded');
  assert.equal(kept.length + rejected.length, 10);
});

test('a missing required column fails loudly instead of emitting garbage', () => {
  assert.throws(() => parseDbprText('Foo|Bar\n1|2'), /missing required column/i);
});

test('the same company from two sources merges into one enriched row', () => {
  const dbpr = [
    {
      source: 'dbpr',
      company: 'Coastal Storefront & Aluminum Corp',
      companyKey: 'COASTAL STOREFRONT AND ALUMINUM',
      licenseNumber: 'SCC131152005',
      street: '7720 NW 74th Terrace',
      streetKey: '7720 NW 74TH TER',
      zip: '33166',
      phone: '7865554400',
      email: 'estimating@coastalstorefront.com',
      domain: '',
      score: 85,
    },
  ];
  const places = [
    {
      source: 'places',
      company: 'Coastal Storefront and Aluminum',
      companyKey: 'COASTAL STOREFRONT AND ALUMINUM',
      licenseNumber: '',
      street: '7720 Northwest 74th Terrace',
      streetKey: '7720 NW 74TH TER',
      zip: '33166',
      phone: '7865554400',
      email: '',
      domain: 'coastalstorefront.com',
      reviewCount: 37,
      score: 55,
    },
  ];

  const merged = mergeAll([dbpr, places]);
  assert.equal(merged.length, 1, 'one company, not two');
  assert.equal(merged[0].email, 'estimating@coastalstorefront.com', 'keeps DBPR email');
  assert.equal(merged[0].domain, 'coastalstorefront.com', 'gains the Places domain');
  assert.equal(merged[0].licenseNumber, 'SCC131152005');
  assert.equal(merged[0].reviewCount, 37);
  assert.deepEqual(merged[0].sources, ['dbpr', 'places']);
});

test('genuinely different companies are never merged', () => {
  const merged = mergeAll([
    [
      {
        source: 'dbpr',
        company: 'A Glass',
        companyKey: 'A GLASS',
        zip: '33127',
        phone: '3055551111',
      },
      {
        source: 'dbpr',
        company: 'B Glass',
        companyKey: 'B GLASS',
        zip: '33127',
        phone: '3055552222',
      },
    ],
  ]);
  assert.equal(merged.length, 2);
});

test('same name in a different city stays separate', () => {
  const merged = mergeAll([
    [
      {
        source: 'dbpr',
        company: 'Elite Glass',
        companyKey: 'ELITE GLASS',
        zip: '33127',
        streetKey: '1 MAIN ST',
        phone: '3055551111',
      },
      {
        source: 'dbpr',
        company: 'Elite Glass',
        companyKey: 'ELITE GLASS',
        zip: '33401',
        streetKey: '2 OAK AVE',
        phone: '5615552222',
      },
    ],
  ]);
  assert.equal(merged.length, 2, 'same name, different place — two companies');
});

test('merged output is ranked with best-evidenced first', () => {
  const merged = mergeAll([
    [{ source: 'dbpr', company: 'Low', companyKey: 'LOW', phone: '3050000001', score: 20 }],
    [{ source: 'dbpr', company: 'High', companyKey: 'HIGH', phone: '3050000002', score: 90 }],
  ]);
  assert.equal(merged[0].company, 'High');
});

test('CSV output escapes commas and quotes', () => {
  const csv = toCsv([{ a: 'x,y', b: 'he said "hi"' }], ['a', 'b']);
  assert.equal(csv, 'a,b\n"x,y","he said ""hi"""\n');
});

test('import payloads match the documented BuildWorkPro schemas', () => {
  const { contact, lead } = buildPayloads(
    {
      company: 'Coastal Storefront & Aluminum Corp',
      companyKey: 'COASTAL STOREFRONT AND ALUMINUM',
      email: 'estimating@coastalstorefront.com',
      phone: '7865554400',
      domain: 'coastalstorefront.com',
      street: '7720 NW 74th Terrace',
      city: 'Medley',
      state: 'FL',
      zip: '33166',
      licenseNumber: 'SCC131152005',
      sources: ['dbpr', 'places'],
    },
    1,
    'glazing-outbound'
  );

  // CreateContact requires `type`; CreateLead requires `name` and `stageId`.
  assert.equal(contact.type, 'other');
  assert.equal(contact.companyName, 'Coastal Storefront & Aluminum Corp');
  assert.equal(contact.website, 'https://coastalstorefront.com');
  assert.equal(lead.name, 'Coastal Storefront & Aluminum Corp');
  assert.equal(lead.stageId, 1);
  assert.equal(lead.siteZipCode, '33166');
  assert.match(lead.description, /SCC131152005/);
});
