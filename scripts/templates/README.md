# Free template generator

Every file under `public/templates-files/` and every preview under
`public/templates-previews/` is **generated** from a module in
`scripts/templates/templates/`. Never hand-edit the outputs — edit the module
and rebuild:

```bash
node scripts/templates/build.mjs                # rebuild everything
node scripts/templates/build.mjs change-order   # one slug (or several)
node scripts/templates/build.mjs --no-preview   # skip the PNG/WebP previews
```

The build also writes `src/data/templates-manifest/<slug>.json` (file sizes,
page counts, preview dimensions) which the `/templates/*` pages import through
`src/data/templates-manifest.ts`.

## One module per template

```js
export const meta = { slug, name, basename, docName };
export function html({ sample }) { return { sections: [{ html, mode, landscape, footer }], previews? } }
export async function xlsx() { return ExcelJS.Workbook }   // optional
export async function docx() { return docx.Document }      // optional
```

- `slug` — the URL (`/templates/<slug>/`) and the module file name.
- `basename` — output file stem. **Existing templates keep their historical
  basenames** (they are indexed and linked); see `index.mjs`.
- `html({ sample: false })` is the **blank, fillable** PDF. `html({ sample: true })`
  is the **completed example** PDF and the source of the preview image. Same
  layout, different data — write the module once with a `SAMPLE` object and
  render values only when `sample` is true.
- `sections`: most templates are one section. Use several when orientation
  changes mid-document (pay application: portrait summary + landscape
  continuation sheet).
  - `mode: 'pages'` — built with `H.document({ pages: [...] })`. Fixed-height
    pages, in-document footer, fillable fields on every page. The build warns
    when a page overflows — fix the layout, never ship an overflow.
  - `mode: 'flow'` — built with `H.flowDocument({ body })`. The browser breaks
    pages (contracts, long forms). Pass `footer: H.footerText(...)`. Fillable
    fields work on page 1 only, so keep the party/date fields near the top.

## Design rules (mirror the app's PDF kit)

Everything in `kit/` reproduces `server/lib/pdf/` in the main app: IBM Plex
Sans, ink `#1b1f24`, band table heads `#f3f5f8`, `#d7dce3` rules, uppercase
7.5 px labels, right-aligned tabular numbers, one ruled total row, signature
lines with the label **under** the rule, footer `Free template by BuildWorkPro ·
buildworkpro.com/templates · <document> · Page n of N`.

- Letter size, 52 px top / 56 px side margins (portrait). Fit forms on **one
  page**. Logs and schedules go landscape.
- Header: `H.header()` (company left, title + number right, accent rule) or
  `H.compactHeader()` for form-register documents.
- Under the header: `H.metaRow()` — who it is for, which project, key figures.
- Inputs: `H.field()` (single line, ruled), `H.textarea()` (boxed), `H.checkbox()`.
  Give every input a `name` so the PDF is fillable. Names are dotted paths
  (`project.name`, `item.3.qty`, `sig.contractor_date`).
- Tables: `H.table()` with `blankRows` + `fieldPrefix` in blank mode and real
  rows in sample mode. Money via `H.money()`.
- End with `H.signatures()` where a signature is expected, then `H.finePrint()`
  with the disclaimer that fits the document (not legal advice / not an AIA
  document / follow your contract).
- Sample data lives in `kit/tokens.mjs` (`SAMPLE_COMPANY`, `SAMPLE_GC`,
  `SAMPLE_OWNER`, `SAMPLE_PROJECT`) — a Denver mechanical sub on a medical
  office job. Keep every sample consistent with that story, realistic, and
  internally consistent (totals must add up; dates in order; CO numbers match
  across documents).
- **Never** print "AIA", "G702", "G703" inside a document. The pay application
  is "Application and Certificate for Payment" and its footer says
  "Formatted to standard progress-billing conventions. Not an AIA document."

### Excel (`kit/xlsx.mjs`)

- Amber cells (`X.input`) are inputs; formulas (`X.calc`) are plain. Put
  `X.inputLegend` near the top of every data sheet.
- `X.headerRow` → `X.bodyRow` (one call per row, with formulas per column) →
  `X.totalRow`. Use `X.FMT.moneyBlank` so empty rows stay blank.
- Every workbook ends with `X.howToSheet()` (steps, tips, feature link) and a
  `X.brandFooter()` line on each data sheet. Sheets print to one page wide
  (`X.sheet(..., { landscape, printTitles })`).
- Dropdowns (`X.dropdown`) and status colours (`X.statusColors`) on any
  status/type column. Freeze panes below the header row on logs.
- Verify formulas by opening the file in LibreOffice (`soffice --headless
  --convert-to pdf`) or Excel; never ship an unverified formula.

### Word (`kit/docx.mjs`)

- `D.companyHeader()` → `D.metaRow()` / `D.fieldGrid()` → `D.heading()`
  sections → `D.table()` / `D.textBox()` / `D.ladder()` → `D.signatures()` →
  `D.fine()`. Contracts use `D.clause(n, title, body)` and `D.subClause`.
- Real tables with shaded heads, never runs of underscores. Amber shading marks
  inputs.

## Adding a template

1. Create `templates/<slug>.mjs`, add the slug to `templates/index.mjs`.
2. `node scripts/templates/build.mjs <slug>` and look at
   `public/templates-previews/<slug>.png` and both PDFs.
3. Add the page `src/pages/templates/<slug>.astro` using
   `src/components/templates/TemplatePage.astro`, the card in
   `src/pages/templates/index.astro`, the row in `src/pages/api/template-pack.ts`,
   the `public/llms.txt` entry, and a test in `tests/templates.spec.ts`.
