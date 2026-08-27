# Lead engine — glazing vertical

Builds a named list of real glazing subcontractors in a target metro, so outbound
can address companies by name instead of renting an ad platform's guess at who a
subcontractor is.

Output feeds `/lp/glazing/`, whose `?src=` variants match each channel's message.

## Why this exists

Cold interest-targeted ads are expensive here because the audience is small and
invisible to an interest graph: "commercial glazing subs who would pay $79/mo"
is not something Meta can see, so you pay rising CPMs to reach mostly wrong
people. But every company in that audience is publicly listed — the state
licenses them and Google Maps knows they trade. Once you hold the names, email
costs nothing per prospect, Meta becomes retargeting instead of prospecting, and
direct mail reaches a verified licence address.

## Pipeline

```
DBPR licensee file ─┐
                    ├─► merge (dedupe + rank) ─► CSV for review ─► import to BWP
Google Places sweep ┘                            └─ enrichment (emails)
```

Each stage writes JSON, so any stage can be re-run without redoing the others.
Outputs land in `.leadgen/` (git-ignored — it holds scraped contact data).

## Run it

### 0. Prerequisites

- Node 20+ (already required by this repo).
- A Google Maps API key with **Places API (New)** enabled, for stage 2.
- Nothing else. Stage 1 is a free public download.

### 1. State licence file (the spine)

Download the construction-industry **business** licensee file from
<https://www2.myfloridalicense.com/sto/file_download/>, then:

```bash
node scripts/leadgen/dbpr.mjs \
  --in ~/Downloads/cilb_business.csv \
  --out .leadgen/dbpr.json
```

Optional: `--counties "MIAMI-DADE,BROWARD,PALM BEACH"` to change the metro
(default is South Florida).

The file's column names drift between refreshes, so the parser reads the header
and maps by name. If a required column is missing it prints the headers it found
and exits non-zero — add the real name to `FIELD_SPEC` in `dbpr.mjs`.

### 2. Google Places sweep (who is actually trading)

```bash
GOOGLE_MAPS_API_KEY=… node scripts/leadgen/places.mjs \
  --queries "glass and glazing contractor,storefront glass,shower door installer" \
  --cities "Miami FL,Fort Lauderdale FL,West Palm Beach FL" \
  --out .leadgen/places.json
```

Text Search bills per request, not per result: the default sweep is at most 27
requests. The script prints its request count.

This stage adds the two things the state file never has — a **website** (what
email enrichment resolves against) and a **review count** (a size proxy that
separates a working shop from a dormant registration).

### 3. Merge

```bash
node scripts/leadgen/merge.mjs \
  --in .leadgen/dbpr.json,.leadgen/places.json \
  --out-csv .leadgen/glazing-south-florida.csv \
  --out-json .leadgen/glazing-south-florida.json
```

Pass the authoritative source first — earlier lists win field conflicts.

Records join only on evidence that is hard to share by coincidence: same licence
number, website domain, phone, or the same normalized name at the same address
or ZIP. A false merge deletes a real prospect, so similar names in different
places stay separate.

### 4. Review the CSV — do this before anything sends

Open `.leadgen/glazing-south-florida.csv` in a spreadsheet. Columns to work:

| Column       | What to do with it                                                |
| ------------ | ----------------------------------------------------------------- |
| `score`      | Sort descending. Multi-source rows rank highest.                  |
| `needsEmail` | `yes` = no address yet; these are the enrichment queue.           |
| `flags`      | `possible supply-side` = distributor, not installer. Check first. |
| `sources`    | `dbpr+places` = confirmed by two independent sources.             |

### 5. Enrich the missing emails

The rows with a `domain` but no `contactEmail` are what Apollo or Hunter resolve
cheaply (~$50–100/mo). Export the domain column, enrich, paste back into
`contactEmail`. Rows with neither domain nor email are phone-only — better used
as a call list than an email list.

### 6. Import to BuildWorkPro (optional)

**Read this first.** These rows are marketing prospects for BuildWorkPro the
product — not glazing jobs. Writing them into an account that runs a real
contracting business mixes them into that company's pipeline, and every metric
computed from it (win rate, forecast value, stage conversion) silently becomes
meaningless. Use a **separate BuildWorkPro account** for outbound.

```bash
# Dry run — prints the target account, its existing lead count, and a payload
BWP_API_KEY=bwp_live_… node scripts/leadgen/import-bwp.mjs \
  --in .leadgen/glazing-south-florida.json --stage 1

# Write, once the preflight looks right
BWP_API_KEY=bwp_live_… node scripts/leadgen/import-bwp.mjs \
  --in .leadgen/glazing-south-florida.json --stage 1 --confirm
```

Nothing is written without `--confirm`. Every created id is recorded in
`.leadgen/import-ledger.json` after each row, so an interrupted run resumes
instead of duplicating. Use `--api-base` for a non-production account.

## Compliance

Cold B2B email in the US is CAN-SPAM territory: accurate from-name and header
data, a real physical address in the footer, a working one-click unsubscribe,
and no deceptive subject lines. Keep volume low and personalization high — the
goal is 50 good conversations, not 5,000 deliveries. If any part of the list
reaches Canada or the EU, check CASL/GDPR before mailing those rows: both
require a stronger basis than CAN-SPAM.

Both sources are public records or public business listings. Respect each
source's terms; the Places stage uses the official billed API rather than
scraping Maps HTML.

## Adding a second vertical

The trade knowledge is data, not code. To target concrete or electrical:

1. Copy the keyword sets in `lib/qualify.mjs` (`TRADE_KEYWORDS`,
   `DISQUALIFYING_KEYWORDS`) for the new trade — the disqualifiers matter most.
   For glazing it is auto glass; every trade has an equivalent lookalike.
2. Change `--queries` in stage 2.
3. Everything else — parsing, dedupe, merge, import — is trade-agnostic.

## Tests

```bash
npm run leadgen:test
```

Covers the invariants whose failure would be silent: dedupe keys (a bad one
deletes real prospects) and the ICP filter (a leaky one emails windshield shops).
