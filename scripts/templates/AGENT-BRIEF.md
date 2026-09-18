# Brief for template build agents

You are building free construction templates for buildworkpro.com. Each
template = a generator module + a landing page. The bar is "top-notch, leaves
a deep impression": a subcontractor who downloads it should feel they got a
better document than the paid ones, and the completed example must look like a
real document from a real company.

Repo: `/Users/ivan/buildworkpro/buildworkpro-marketing` on branch
`feat/templates-v2`. Do **not** commit, push, run `astro dev`, `astro build` or
`npm run test:e2e` — the lead does that. Other agents work in the same tree in
parallel, so only touch the files assigned to you.

## Read first (in this order)

1. `scripts/templates/README.md` — conventions
2. `scripts/templates/PLAN.md` — the spec for every template (keywords, title,
   formats, sections, sample data, related, feature link, blog interlinks)
3. `scripts/templates/kit/tokens.mjs` — design tokens + the shared sample STORY
4. `scripts/templates/kit/html.mjs`, `kit/xlsx.mjs`, `kit/docx.mjs` — the APIs
5. `scripts/templates/templates/change-order.mjs` — the finished exemplar
   module (PDF fillable + Word + Excel with a log)
6. `src/pages/templates/change-order.astro` — the finished exemplar page
7. `src/components/templates/TemplatePage.astro` — the page component props
8. `src/data/templates.ts` — the registry: your slug, basename, formats and
   title MUST match it (do not edit the registry; report mismatches)
9. The existing `src/pages/templates/<slug>.astro` and the existing file(s) in
   `public/templates-files/` for any slug that already exists — carry their
   substance (FAQ answers, what's-inside, sample rows) forward, then REPLACE
   the page with a TemplatePage-based one.
10. The feature page each template funnels to (e.g.
    `src/pages/features/pay-applications.astro`) so every product claim you
    make is true.

## Per template

1. Write `scripts/templates/templates/<slug>.mjs` exporting `meta`, `html`,
   and `xlsx` / `docx` as PLAN.md lists. Sample mode uses STORY / SAMPLE_*.
2. Build: `node scripts/templates/build.mjs <slug>`. Fix every "overflows"
   warning. Forms are one page; logs/schedules may be landscape.
3. Look at the results with the Read tool (it shows images):
   - `public/templates-previews/<slug>.png` (completed example)
   - `node scripts/templates/verify.mjs <slug>` → PNGs in
     `tmp/template-check/<slug>/` (`pdf-1.png` = blank fillable, `docx-1.png`,
     `xlsx-1.png`…). Check: nothing truncated, labels aligned, one page for
     forms, band heads and rules render, footer present.
   - For Excel formulas: `node scripts/templates/verify.mjs <slug> --fill
"Sheet!C5=100" "Sheet!D5=4" …` then read the printed text and confirm
     totals compute. Never ship an unverified formula.
   - Fillable fields: `python3 -c "from pypdf import PdfReader; r=PdfReader('public/templates-files/<basename>.pdf'); print(len(r.get_fields() or {}))"`
     should be > 0 for every form.
4. Iterate until it looks like the change-order exemplar in polish. Blank
   fields never contain placeholder text (hints go in labels).
5. Write `src/pages/templates/<slug>.astro` with `TemplatePage`:
   - `title` / `description` / `h1` from PLAN.md (primary keyword first;
     description ≤ 160 chars, names the formats, ends "No email required.").
   - `intro`: two sentences, concrete.
   - `downloads`: order from PLAN (primary first), always include `example`.
   - `whatsInside`: 8–10 concrete items. `howTo`: 5 substantive steps.
   - Slot content: 4–6 `<h2>` sections, 600–1,000 words of genuinely useful
     guidance — what the document is, when to use it, field-by-field notes,
     a worked example that references the completed sample (real numbers from
     STORY), comparison with adjacent documents, common mistakes. Link to
     related templates (`/templates/<slug>/`), the matching blog post, and the
     feature page. No fluff, no keyword stuffing, no invented legal specifics.
   - `faqs`: 6–7 People-Also-Ask style questions, answers 2–4 sentences.
   - `related`: the 4 slugs from PLAN. `feature`, `cta`, `disclaimer`,
     `updated: '2026-09-17'`.
6. Validate: `npx prettier --write <your files>`, `npx eslint <your module>`,
   and `npx astro check 2>&1 | grep -B2 -A6 "<slug>"` must show no errors.

## Hard rules

- Never print "AIA", "G702", "G703" inside a document file. Pages may say
  "G702/G703 style" with the trademark disclaimer.
- Not legal advice disclaimers on contracts, waivers, certificates, notices.
- Lien waivers: the 12 statutory-form states (CA, TX, AZ, NV, UT, GA, FL, MA,
  MI, MO, MS, WY) must be named; the form is for the other states.
- Keep historical `basename`s for existing slugs.
- Sample data must reconcile with STORY (contract $486,200, SOV lines, COs,
  pay app #3 August 2026, the named people). Totals must add up.
- Don't edit kit files or other agents' files. If a kit helper is missing,
  write a local helper inside your module and mention it in your report.

## Report back

For each slug: files produced, PDF page counts, sheets, formulas verified
(yes/no + how), anything you could not finish, and any kit limitation you hit.
