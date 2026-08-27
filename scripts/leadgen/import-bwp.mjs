#!/usr/bin/env node
/**
 * Stage 4 — push the merged list into a BuildWorkPro account as contacts + leads.
 *
 *   BWP_API_KEY=bwp_live_… node scripts/leadgen/import-bwp.mjs \
 *     --in .leadgen/glazing-south-florida.json --stage 1        # dry run
 *   BWP_API_KEY=bwp_live_… node scripts/leadgen/import-bwp.mjs \
 *     --in .leadgen/glazing-south-florida.json --stage 1 --confirm
 *
 * READ THIS BEFORE POINTING IT AT A KEY.
 *
 * These rows are *marketing prospects for BuildWorkPro the product*. They are
 * not glazing jobs. Writing several hundred of them into an account that runs a
 * real contracting business mixes them into that company's pipeline, and every
 * number computed from the pipeline — win rate, forecast value, conversion by
 * stage — silently becomes meaningless, because a few hundred never-going-to-be
 * -a-job rows now sit in the denominator. Use a separate BuildWorkPro account
 * (or at minimum a dedicated stage), and set --api-base if it is not production.
 *
 * Nothing is written without --confirm. The preflight prints which account the
 * key belongs to and what is already in it, so the decision is made with the
 * facts on screen. A ledger file records every created id, so a re-run resumes
 * instead of duplicating.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DEFAULT_BASE = 'https://app.buildworkpro.com/api/v1';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(base, key, path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(
      `${options.method ?? 'GET'} ${path} -> ${response.status}: ${detail.slice(0, 300)}`
    );
  }
  return body;
}

/** Contact + lead payloads for one merged record. */
export function buildPayloads(record, stageId, campaign) {
  const noteLines = [
    `Outbound prospect — ${campaign}.`,
    record.licenseNumber ? `FL licence: ${record.licenseNumber}` : null,
    record.licenseExpires ? `Licence expires: ${record.licenseExpires}` : null,
    record.county ? `County: ${record.county}` : null,
    record.reviewCount ? `Google reviews: ${record.reviewCount}` : null,
    record.sources?.length ? `Sources: ${record.sources.join(', ')}` : null,
    record.flags?.length ? `Flags: ${record.flags.join('; ')}` : null,
  ].filter(Boolean);

  const contact = {
    type: 'other',
    companyName: record.company,
    email: record.email || undefined,
    phone: record.phone || undefined,
    website: record.domain ? `https://${record.domain}` : undefined,
    notes: noteLines.join('\n'),
  };

  const lead = {
    name: record.company,
    stageId,
    source: campaign,
    description: noteLines.join('\n'),
    siteAddress: record.street || undefined,
    siteCity: record.city || undefined,
    siteState: record.state || undefined,
    siteZipCode: record.zip || undefined,
  };

  return { contact, lead };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      const next = argv[i + 1];
      args[argv[i].slice(2)] = next && !next.startsWith('--') ? next : 'true';
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = process.env.BWP_API_KEY;
  const base = args['api-base'] ?? DEFAULT_BASE;
  const confirm = args.confirm === 'true';
  const campaign = args.campaign ?? 'glazing-outbound';
  const ledgerPath = args.ledger ?? '.leadgen/import-ledger.json';

  if (!args.in || !args.stage) {
    console.error(
      'Usage: BWP_API_KEY=… node scripts/leadgen/import-bwp.mjs --in leads.json --stage <id> [--confirm]'
    );
    process.exit(2);
  }
  if (!key) {
    console.error('BWP_API_KEY is not set (Settings -> Developer -> API Keys).');
    process.exit(2);
  }

  const records = JSON.parse(readFileSync(args.in, 'utf8'));
  const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : {};
  const pending = records.filter((record) => !ledger[record.companyKey]);

  // Preflight: say out loud which account this key opens and what is in it.
  let stages;
  let existingLeads = null;
  try {
    stages = await api(base, key, '/lead-stages');
    const summary = await api(base, key, '/leads/count').catch(() => null);
    existingLeads = summary?.data?.count ?? summary?.count ?? null;
  } catch (error) {
    console.error(`Preflight failed: ${error.message}`);
    process.exit(1);
  }

  const stageList = stages?.data ?? stages ?? [];
  const stage = stageList.find((s) => String(s.id) === String(args.stage));
  if (!stage) {
    console.error(`Stage ${args.stage} not found. Stages in this account:`);
    for (const s of stageList) console.error(`  ${s.id}: ${s.name}`);
    process.exit(1);
  }

  console.log('--- preflight -------------------------------------------');
  console.log(`  API base:        ${base}`);
  console.log(`  Target stage:    ${stage.id} "${stage.name}"`);
  console.log(`  Leads already in this account: ${existingLeads ?? 'unknown'}`);
  console.log(`  Records in file: ${records.length}`);
  console.log(`  Already imported (ledger): ${records.length - pending.length}`);
  console.log(`  Would create:    ${pending.length} contacts + ${pending.length} leads`);
  console.log('---------------------------------------------------------');

  if (existingLeads && existingLeads > 0) {
    console.log(
      `  NOTE: this account already holds ${existingLeads} leads. If those are real\n` +
        '  jobs, adding marketing prospects here will distort every pipeline metric.\n' +
        '  Prefer a separate account for outbound.'
    );
  }

  if (!confirm) {
    console.log('\nDry run — nothing written. Re-run with --confirm to import.');
    if (pending[0]) {
      const { contact, lead } = buildPayloads(pending[0], stage.id, campaign);
      console.log('\nExample payload for the first record:');
      console.log(JSON.stringify({ contact, lead }, null, 2));
    }
    return;
  }

  let created = 0;
  const failures = [];
  for (const record of pending) {
    try {
      const { contact, lead } = buildPayloads(record, stage.id, campaign);
      const contactResponse = await api(base, key, '/contacts', {
        method: 'POST',
        body: JSON.stringify(contact),
      });
      const contactId = contactResponse?.data?.id ?? contactResponse?.id;

      const leadResponse = await api(base, key, '/leads', {
        method: 'POST',
        body: JSON.stringify({ ...lead, contactId }),
      });
      const leadId = leadResponse?.data?.id ?? leadResponse?.id;

      ledger[record.companyKey] = { contactId, leadId, at: new Date().toISOString() };
      created += 1;
      if (created % 25 === 0) console.log(`  ${created}/${pending.length} imported…`);
      await sleep(120);
    } catch (error) {
      failures.push({ company: record.company, error: error.message });
    }
    // Persist after every row so an interrupted run never re-creates what it made.
    mkdirSync(dirname(ledgerPath), { recursive: true });
    writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
  }

  console.log(`\nImported ${created} of ${pending.length}. Ledger: ${ledgerPath}`);
  if (failures.length > 0) {
    console.log(`Failures (${failures.length}):`);
    for (const failure of failures.slice(0, 10)) {
      console.log(`  ${failure.company}: ${failure.error}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
