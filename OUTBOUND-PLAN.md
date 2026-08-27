# The Named-List Playbook — Targeted Outbound (BuildWorkPro)

_Owner: Ivan · Started 2026-08-27 · Not published (repo-root reference doc)_

Companion to `GROWTH-PLAN.md` (SEO/content, plays the long game) and
`META-ADS-PLAN.md` (paid social infrastructure). This doc covers the third
motion: **account-based outbound to named subcontractors, one trade at a time.**

## Situation

Signups are flat and Meta CAC is climbing. Both facts have the same cause.

Cold interest-targeted ads work when the audience is large and the platform can
learn who converts. "Small commercial subcontractors who will pay $79/month for
software" is neither. Meta's interest graph cannot see it, so it sells the
nearest thing it has — "interested in construction" — which is mostly hobbyists,
laborers, and the general contractors we explicitly do not serve. We pay rising
CPMs to reach ~95% wrong people, and the few right ones land on a generic page
with no reason to believe the product understands their trade.

## Strategy — invert who does the targeting

There are only a few thousand companies per trade per metro that fit the ICP,
and **every one of them is publicly listed** — state licence boards, permit
records, supplier directories, association rosters. Build the list ourselves and
market to named companies instead of to an ad platform's guess.

Once we hold the names, every channel gets cheap:

- Email costs ~nothing per prospect.
- Meta flips from prospecting (expensive) to retargeting a known list (cheap).
- Direct mail reaches a licence address the state already verified for us.

### Audit this first — before spending anything

Confirm the leak isn't the funnel. Measure how many visitors click "Start free
trial" versus how many complete signup in the app. If click-to-signup completion
is poor, no acquisition channel fixes it. The UTM/click-id passthrough in
`src/layouts/Layout.astro` already forwards attribution to the app, so this is a
reporting question, not a build.

## Beachhead — glazing first

One vertical proves out before the next starts. Glazing is the pick:

- **Unfair advantage.** We know the trade cold — CRL part grammar, Mr Glass
  quoting, NOAs, shop drawings. Copy written by someone who knows what a
  TAPER-LOC is does not read like SaaS spam.
- **Proof exists.** National Glass and Construction runs on the product, and the
  disclosed customer story is already live. A glazing owner reading a glazing
  company's story converts differently than one reading a generic testimonial.
- **Findable population.** State-licensed, clustered in known metros, organized
  around a small set of suppliers and one association (NGA).

**Vertical #2 (weeks 7+):** concrete or electrical — pick whichever existing
`/solutions/` page shows more organic traffic. The demand signal is free.

## The four stages

### 1. List engine — `scripts/leadgen/`

Built and tested; see `scripts/leadgen/README.md` for the runbook.

| Stage            | Source                                   | Cost        |
| ---------------- | ---------------------------------------- | ----------- |
| `dbpr.mjs`       | FL DBPR licensee extract (free download) | $0          |
| `places.mjs`     | Google Places (New) text search          | ~cents/run  |
| `merge.mjs`      | dedupe + rank across sources             | $0          |
| `import-bwp.mjs` | optional contacts+leads import           | $0          |
| _(manual)_       | Apollo/Hunter email enrichment           | ~$50–100/mo |

Target: **500–1,000 qualified companies per vertical per metro.** The state file
is the spine (who may legally contract, plus the mailing address the postcard
test needs); Places adds what the state never carries (website for enrichment,
review count as a size proxy).

Later sources worth adding: county permit records (Miami-Dade / Broward
portals, or Shovels/BuildZoom) to filter for who is _actively pulling permits_ —
the best "in business and busy" signal available.

**Two exclusions carry most of the value.** Auto glass is a different business
entirely — no GC bids, no schedule of values, no pay applications — so emailing
windshield shops burns domain reputation for nothing. Distributors are flagged
rather than dropped, since many South Florida shops both fabricate and install.
Both rules live as data in `lib/qualify.mjs`, so a second vertical is a new
keyword set, not a new script.

### 2. Landing pages — shipped

- **`/lp/glazing/`** — outbound destination. Minimal chrome, noindex, out of the
  sitemap. `?src=email` / `?src=mail` / `?src=retarget` swap the headline so each
  channel's landing copy continues its own message. National Glass proof block;
  comparison strip vs GC platforms.
- **`/solutions/glazing-contractors/`** — the SEO page, filling the gap where the
  one trade with a real customer story had no page. In nav and sitemap.

Clone the `/lp/` pattern per trade for verticals 2–3; it is an afternoon each,
not a rebuild.

### 3. Channels — surround the named list

| Channel                | Motion                                                                                                                    | Cost        | Role      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------- | --------- |
| Cold email             | Separate sending domain, 2-week warmup, 25–50/day, 3-touch sequence in trade language → `/lp/glazing/?src=email`          | ~$100/mo    | Primary   |
| Meta, reframed         | **Kill cold interest prospecting.** Upload the named list as a Custom Audience + retarget site visitors, $10–20/day       | $300–600/mo | Air cover |
| Groups & forums        | Glazing/contractor Facebook groups, r/Construction: answer real questions, share the template pages. No drive-by pitching | $0          | Trust     |
| Direct mail test       | 300–500 postcards to verified licence addresses, memorable URL                                                            | ~$350 once  | Test      |
| Supplier & association | Glass distributor counters, NGA chapters, Glass Magazine / US Glass placements                                            | varies      | Compounds |

The sequencing is the point: an owner gets an email that clearly knows their
trade, sees a BWP ad two days later, and lands on a page about glazing subs with
a glazing customer's story. Three cheap touches buy the familiarity one
expensive cold ad never achieves.

### 4. Cadence — 90 days

1. **Weeks 1–2 — Foundation.** Pages shipped ✅. Build glazing list #1 (South
   Florida). Buy + warm the sending domain. Run the funnel audit.
2. **Weeks 3–6 — Wave one.** Email live at 25–50/day; retargeting on; 2–3 group
   posts/week. Call warm replies — at this volume the founder can.
3. **Weeks 7–10 — Iterate + vertical two.** Rewrite the sequence from what
   replies actually said. Run the direct-mail test. Stand up vertical #2.
4. **Weeks 11–13 — Scale what worked.** Double budget only on channels beating
   target CAC. Start partnership conversations. Pick vertical #3.

## Metrics — with kill thresholds

| Metric                          | Healthy                                                 | Rework below                           |
| ------------------------------- | ------------------------------------------------------- | -------------------------------------- |
| Email reply rate                | 3–5%                                                    | <1% after 300 sends → rewrite sequence |
| LP visit → trial click          | 8–15%                                                   | <4% → page rework                      |
| Retargeting CPM vs old cold CPM | materially lower                                        | parity → audience too small, grow list |
| 90-day outcome                  | 1,000+ contacted · 30–60 trials · CAC known per channel | —                                      |

Weekly loop, 30 minutes: pipeline counts, spend per channel, **one change
shipped per week** (a subject line, a headline variant, a new list segment). The
strategy is the loop, not the launch.

## Compliance floor

US cold B2B email is CAN-SPAM: accurate from-name and headers, real physical
address in the footer, working one-click unsubscribe, no deceptive subject
lines. Keep volume low and personalization high — the goal is 50 good
conversations, not 5,000 deliveries. Any rows reaching Canada or the EU need a
CASL/GDPR check first; both require a stronger basis than CAN-SPAM.

Sources are public records and public business listings. The Places stage uses
the official billed API rather than scraping Maps HTML.

## Open decision — where the outbound list lives

The list is _marketing prospects for BuildWorkPro the product_, not glazing
jobs. The production BuildWorkPro account is National Glass's real operating
pipeline (400+ bids, 143 projects, live dollar values). Importing several
hundred prospects there would put never-going-to-be-a-job rows into the
denominator of every win rate, forecast, and stage-conversion number.

**Recommendation: a separate BuildWorkPro account for outbound.** It keeps the
dogfooding benefit without corrupting the operating company's reporting.
`import-bwp.mjs` therefore dry-runs by default and prints which account the key
opens before writing anything.

## Status log

- 2026-08-27: Strategy drafted. Glazing chosen as beachhead vertical #1.
  `/lp/glazing/` + `/solutions/glazing-contractors/` shipped (PR #168, merged —
  all 7 CI checks green). Lead engine built and tested in `scripts/leadgen/`
  (19 unit tests, all passing; full CI suite green). **Not yet run against real
  data** — every external source (myfloridalicense.com, Apollo, Hunter,
  app.buildworkpro.com) is blocked by the cloud session's egress policy, so
  stages 1–2 must be run locally. Next: download the CILB business file and run
  stage 1 to get the real qualified count for South Florida, then draft the
  3-touch email sequence.
