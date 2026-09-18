// HTML document kit → rendered to PDF (and the preview PNG) by render.mjs.
// Every helper returns an HTML string. Components mirror the main app's PDF kit
// (DocHeader, MetaRow, ItemTable, Totals, SignatureBlock, FormCells, Footer).
//
// Fillable fields: any element carrying data-field="name" becomes an AcroForm
// field in the PDF (text by default; data-field-type="multiline" | "checkbox").
// render.mjs measures the element's box in print layout and places the field.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INK, ACCENT, BRAND, PAGE, PAGE_LANDSCAPE, INPUT_FILL_CSS } from './tokens.mjs';

const FONTS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fonts');

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Multi-line text → escaped HTML with <br>. */
export function nl2br(value) {
  return esc(value).replace(/\n/g, '<br>');
}

function fontFace(family, file, weight, style = 'normal') {
  const url = 'file://' + path.join(FONTS_DIR, file);
  return `@font-face{font-family:"${family}";src:url("${url}") format("truetype");font-weight:${weight};font-style:${style}}`;
}

export const BASE_CSS = `
${fontFace('IBM Plex Sans', 'IBMPlexSans-Regular.ttf', 400)}
${fontFace('IBM Plex Sans', 'IBMPlexSans-Italic.ttf', 400, 'italic')}
${fontFace('IBM Plex Sans', 'IBMPlexSans-Medium.ttf', 500)}
${fontFace('IBM Plex Sans', 'IBMPlexSans-SemiBold.ttf', 600)}
${fontFace('IBM Plex Sans', 'IBMPlexSans-Bold.ttf', 700)}
${fontFace('IBM Plex Mono', 'IBMPlexMono-Regular.ttf', 400)}
${fontFace('IBM Plex Mono', 'IBMPlexMono-Medium.ttf', 500)}
:root{
  --ink:${INK.ink};--ink2:${INK.ink2};--ink3:${INK.ink3};--rule:${INK.rule};--band:${INK.band};--band2:${INK.band2};
  --accent:${ACCENT};--add:${INK.add};--deduct:${INK.deduct};--warn:${INK.warn};--input:${INPUT_FILL_CSS};
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff}
body{font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:10px;line-height:1.4;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;font-variant-numeric:tabular-nums}
.mono{font-family:"IBM Plex Mono",ui-monospace,monospace}
.page{position:relative;width:${PAGE.width}px;height:${PAGE.height}px;overflow:visible;padding:${PAGE.marginTop}px ${PAGE.marginSide}px ${PAGE.marginBottom}px;page-break-after:always;break-after:page}
.page:last-child{page-break-after:auto;break-after:auto}
.landscape .page{width:${PAGE_LANDSCAPE.width}px;height:${PAGE_LANDSCAPE.height}px;padding:${PAGE_LANDSCAPE.marginTop}px ${PAGE_LANDSCAPE.marginSide}px ${PAGE_LANDSCAPE.marginBottom}px}
.flow{padding:${PAGE.marginTop}px ${PAGE.marginSide}px ${PAGE.marginBottom}px;width:${PAGE.width}px}
.landscape .flow{padding:${PAGE_LANDSCAPE.marginTop}px ${PAGE_LANDSCAPE.marginSide}px ${PAGE_LANDSCAPE.marginBottom}px;width:${PAGE_LANDSCAPE.width}px}
.avoid{break-inside:avoid;page-break-inside:avoid}
.label{font-size:7.5px;letter-spacing:.9px;text-transform:uppercase;color:var(--ink3);font-weight:600}
.small{font-size:9px}.micro{font-size:7.5px}.ink2{color:var(--ink2)}.ink3{color:var(--ink3)}
.strong{font-weight:600}.right{text-align:right}.center{text-align:center}.nowrap{white-space:nowrap}
.row{display:flex;gap:20px}.col{display:flex;flex-direction:column;min-width:0}
.grow{flex:1}
p{margin:0}
/* header */
.hdr{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}
.hdr-co{display:flex;flex-direction:column;flex:1;min-width:0}
.hdr-co .name{font-size:15px;font-weight:600;letter-spacing:-.15px;line-height:1.2}
.hdr-co .line{font-size:8.5px;color:var(--ink2);line-height:1.45}
.hdr-co .line:first-of-type{margin-top:4px}
.hdr-doc{display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0;text-align:right}
.hdr-doc .title{font-size:24px;font-weight:600;letter-spacing:-.5px;line-height:1}
.hdr-doc .num{font-size:10.5px;color:var(--ink2);margin-top:6px;display:flex;gap:4px;align-items:baseline}
.hdr-doc .num b{font-family:"IBM Plex Mono";font-weight:500;color:var(--ink)}
.hdr-doc .meta{font-size:8.5px;color:var(--ink2);margin-top:2px}
.hdr-rule{height:2px;background:var(--accent);margin:16px 0 18px}
.hdr-compact .title{font-size:16px;font-weight:700;letter-spacing:-.2px;line-height:1.15}
.hdr-compact .sub{font-size:7.5px;color:var(--ink2);margin-top:3px}
.hdr-compact-rule{height:2px;background:var(--ink);margin-top:8px}
/* meta row */
.meta{display:flex;gap:20px}
.meta>div{display:flex;flex-direction:column;flex:1.3;min-width:0}
.meta>div.kv{flex:1}
.meta .label{margin-bottom:5px}
.meta .l{font-size:9px;color:var(--ink2);line-height:1.45}
.meta .l.strong{font-size:11px;color:var(--ink);font-weight:600}
.meta .kvr{display:flex;justify-content:space-between;gap:12px;font-size:9px;line-height:1.45}
.meta .kvr .k{color:var(--ink3);flex-shrink:0}.meta .kvr .v{text-align:right;color:var(--ink)}
.meta .kvr.strong .k,.meta .kvr.strong .v{font-weight:600;color:var(--ink)}
/* fields */
.field{display:flex;flex-direction:column;min-width:0}
.field .label{margin-bottom:2px}
.field .box{min-height:18px;border-bottom:1px solid var(--ink);padding:2px 0 1px;font-size:9.5px;line-height:1.3;color:var(--ink);display:flex;align-items:flex-end}
.field .box.tall{min-height:26px}
.field.boxed .box{border:1px solid var(--rule);border-radius:2px;padding:3px 5px;align-items:flex-start}
.field .box .ph{color:var(--ink3);font-style:italic;font-size:8.5px}
.textarea{display:flex;flex-direction:column;min-width:0}
.textarea .label{margin-bottom:3px}
.textarea .box{border:1px solid var(--rule);border-radius:2px;padding:5px 6px;font-size:9.5px;line-height:1.45;color:var(--ink);white-space:pre-wrap}
.textarea .box .ph{color:var(--ink3);font-style:italic;font-size:8.5px}
span.check{display:inline-flex;align-items:center;gap:4px;font-size:8.5px;color:var(--ink2);margin-right:10px}
span.check .bx{width:9px;height:9px;border:1px solid var(--ink);flex-shrink:0;display:inline-block;background:#fff}
span.check .bx.on{background:var(--ink)}
/* sections */
div.section{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:16px;padding-bottom:4px;border-bottom:1px solid var(--ink)}
div.section h2{font-size:8px;letter-spacing:.9px;text-transform:uppercase;font-weight:700;color:var(--ink);margin:0}
div.section .hint{font-size:7.5px;color:var(--ink3)}
.prose{font-size:9.5px;line-height:1.5;color:var(--ink);margin-top:6px}
.prose.ink2{color:var(--ink2)}
.prose p+p{margin-top:5px}
.h3{font-size:9.5px;font-weight:600;margin-top:10px}
.numbered{counter-reset:clause}
.clause{display:flex;gap:8px;margin-top:7px;font-size:9.5px;line-height:1.5}
.clause .n{font-family:"IBM Plex Mono";font-weight:500;color:var(--ink2);flex-shrink:0;width:18px}
.clause b{font-weight:600}
/* table */
table.t{width:100%;border-collapse:collapse;margin-top:12px;font-size:9.5px}
table.t th{font-size:7.5px;letter-spacing:.9px;text-transform:uppercase;font-weight:600;color:var(--ink2);background:var(--band);border-bottom:1px solid var(--rule);padding:6px 8px;text-align:left;vertical-align:bottom}
table.t th.right,table.t td.right{text-align:right;white-space:nowrap}
table.t th.center,table.t td.center{text-align:center}
table.t td{padding:6px 8px;border-bottom:1px solid var(--rule);vertical-align:top;font-size:9.5px}
table.t td.mono{font-family:"IBM Plex Mono"}
table.t td .sub{display:block;font-size:8.5px;color:var(--ink3);margin-top:1px}
table.t tr.section td{padding:9px 8px 4px;border-bottom:1px solid var(--ink);font-size:8px;letter-spacing:.9px;text-transform:uppercase;font-weight:700}
table.t tr.subtotal td{padding:4px 8px 8px;font-size:8.5px;color:var(--ink2)}
table.t tr.subtotal td.amt{font-size:9.5px;font-weight:600;color:var(--ink);text-align:right}
table.t tr.note td{padding:4px 8px 7px 22px;font-style:italic;font-size:9px;color:var(--ink2)}
table.t tr.blank td{height:22px}
table.t tr.total td{border-top:1.5px solid var(--ink);border-bottom:none;font-weight:700;padding-top:8px}
table.t.grid td,table.t.grid th{border:1px solid var(--rule)}
table.t.grid th{border-bottom:1px solid var(--ink2)}
table.t.compact td,table.t.compact th{padding:4px 6px;font-size:8.5px}
table.t.tight th,table.t.tight td{padding:3px 5px;font-size:8px}
.tag{font-size:6.5px;letter-spacing:.7px;text-transform:uppercase;font-weight:700;padding:1px 5px;border:1px solid currentColor;border-radius:3px;margin-left:6px;vertical-align:middle}
.tag.add{color:var(--add)}.tag.ded{color:var(--deduct)}.tag.mod{color:var(--accent)}.tag.neutral{color:var(--ink3)}
/* totals */
.totals{display:flex;justify-content:flex-end;margin-top:12px}
.totals>div{display:flex;flex-direction:column;width:300px;gap:4px}
.totals .r{display:flex;justify-content:space-between;gap:12px;font-size:9.5px}
.totals .r .k{color:var(--ink2)}
.totals .r.total{font-size:12.5px;font-weight:600;border-top:1px solid var(--ink);padding-top:6px;margin-top:4px}
.totals .r.total .k{color:var(--ink)}
.totals .r.add .v{color:var(--add)}.totals .r.deduct .v{color:var(--deduct)}
.totals .fine{font-size:8.5px;color:var(--ink3);text-align:right;line-height:1.4}
/* hero amount */
.hero{display:flex;justify-content:space-between;align-items:flex-end;border:1px solid var(--rule);border-radius:4px;padding:10px 14px;margin-top:14px}
.hero .amt{font-size:18px;font-weight:700;font-family:"IBM Plex Mono"}
/* signatures */
.sig{display:flex;flex-direction:column;margin-top:18px;border-top:1px solid var(--ink);padding-top:10px}
.sig .title{font-size:9.5px;font-weight:600}
.sig .copy{font-size:8.5px;color:var(--ink2);max-width:480px;margin-top:3px;line-height:1.45}
.sig .parties{display:flex;gap:20px;margin-top:20px}
.sig .party{display:flex;flex-direction:column;flex:1}
.sig .party .who{font-size:8.5px;font-weight:600;margin-bottom:18px}
.sig .party .who span{color:var(--ink3);font-weight:400}
.sig .line{display:flex;flex-direction:column;flex:1;min-width:0}
.sig .line .sp{height:30px;font-size:9.5px;display:flex;align-items:flex-end;padding-bottom:2px}
.sig .line .sp.script{font-style:italic;color:var(--ink2)}
.sig .line .lab{border-top:1px solid var(--ink);padding-top:3px;font-size:7.5px;letter-spacing:.7px;text-transform:uppercase;color:var(--ink3)}
.sig .under{display:flex;gap:12px;margin-top:16px}
.sig .under .line:last-child{flex:.5}
/* form register (FormCells) */
.cells{display:flex;flex-direction:column;border:1px solid var(--ink);margin-top:10px}
.cells .r{display:flex}
.cells .c{display:flex;flex-direction:column;flex:1;min-width:0;padding:5px 7px 6px;border-right:1px solid var(--ink);border-bottom:1px solid var(--ink)}
.cells .r:last-child .c{border-bottom:none}.cells .c:last-child{border-right:none}
.cells .c .v{font-size:8.5px;font-weight:600;margin-top:2px;line-height:1.35;min-height:11px}
.cells .c .s{font-size:7.5px;color:var(--ink2);margin-top:1px;line-height:1.35}
.cells .c .kvr{display:flex;justify-content:space-between;gap:8px;margin-top:3px;font-size:7.5px}
.cells .c .kvr .k{font-size:7px;letter-spacing:.7px;text-transform:uppercase;color:var(--ink3);font-weight:600}
.cells .c .kvr .v{font-family:"IBM Plex Mono";font-weight:500;margin:0;font-size:7.5px}
/* callouts */
.note{border-left:2px solid var(--accent);background:var(--band);padding:6px 9px;font-size:8.5px;color:var(--ink2);line-height:1.45;margin-top:10px}
.stamp{display:inline-block;font-size:7px;letter-spacing:1px;text-transform:uppercase;font-weight:700;padding:3px 7px;border:1.5px solid var(--ink);border-radius:3px}
/* page footer: printed in pages mode (fixed pages know their count); flow mode uses render.mjs's footer template */
.pfoot{position:absolute;left:${PAGE.marginSide}px;right:${PAGE.marginSide}px;bottom:0;display:flex;justify-content:space-between;gap:16px;border-top:1px solid var(--rule);padding:8px 0 22px;font-size:7.5px;color:var(--ink3)}
.landscape .pfoot{left:${PAGE_LANDSCAPE.marginSide}px;right:${PAGE_LANDSCAPE.marginSide}px}
@page{size:Letter;margin:0}
.landscape-page{size:Letter landscape}
`;

/**
 * Wrap page content into a complete HTML document of fixed-height pages.
 * Multi-section documents (portrait + landscape) pass `pageStart` / `pageTotal`
 * so the footer numbering runs across sections.
 */
export function document({
  title,
  pages,
  landscape = false,
  css = '',
  footer,
  pageStart = 1,
  pageTotal,
}) {
  const total = pageTotal ?? pageStart - 1 + pages.length;
  const body = pages
    .map(
      (p, i) =>
        `<div class="page">${p}${footer ? previewFooter(footer, pageStart + i, total) : ''}</div>`
    )
    .join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${BASE_CSS}${landscape ? '@page{size:Letter landscape}' : ''}${css}</style></head><body class="${landscape ? 'landscape' : ''}">${body}</body></html>`;
}

/**
 * A document whose content flows across pages (contracts, long forms). The
 * browser breaks pages; `.avoid` keeps blocks intact. No per-page preview footer.
 */
export function flowDocument({ title, body, landscape = false, css = '' }) {
  // On screen (previews) the .flow padding supplies the page margins; in print
  // the @page margins do, on every page, and the render footer template sits in
  // the bottom margin. In print media the .flow box is exactly the page content
  // width so field boxes measured under print emulation map 1:1 onto the page
  // once the margins are added back (render.mjs).
  const g = landscape ? PAGE_LANDSCAPE : PAGE;
  const pageRule = `@page{size:Letter${landscape ? ' landscape' : ''};margin:${g.marginTop}px ${g.marginSide}px ${g.marginBottom}px}@media print{.flow{padding:0;width:${g.width - 2 * g.marginSide}px}}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${BASE_CSS}${pageRule}${css}</style></head><body class="${landscape ? 'landscape' : ''}"><div class="flow">${body}</div></body></html>`;
}

export function previewFooter({ left, center }, n, total) {
  return `<div class="pfoot"><span>${esc(left)}</span><span>${esc(center ?? '')}</span><span>Page ${n} of ${total}</span></div>`;
}

/** Standard footer text for every template: brand line left, document identity center. */
export function footerText(docName) {
  return {
    left: `Free template by ${BRAND.name} · ${BRAND.domain}/templates`,
    center: docName,
  };
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/**
 * Page-1 header: company block left, document title/number right, accent rule.
 * `company` = { name, line1, line2 } — pass blank strings for a fillable header
 * (fields named co.name / co.line1 / co.line2 are emitted automatically when
 * `fillable` is true).
 */
export function header({ company, title, number, date, meta, fillable = false }) {
  const left = fillable
    ? `<div class="hdr-co" style="gap:6px;max-width:330px">
    ${field({ name: 'co.name', label: 'Your company', flex: 1 })}
    <div class="row" style="gap:12px">${field({ name: 'co.line1', label: 'Address', flex: 1.4 })}${field({ name: 'co.line2', label: 'Phone · email · license', flex: 1 })}</div>
  </div>`
    : `<div class="hdr-co">
    <span class="name">${esc(company.name)}</span>
    <span class="line">${esc(company.line1)}</span>
    <span class="line">${esc(company.line2)}</span>
  </div>`;
  // Blank mode: a number like "CO-____" becomes a printed prefix plus a fillable
  // blank, so typed text never overprints the underscores.
  const m = number && fillable ? number.match(/^(.*?)(_{2,})$/) : null;
  const num = m
    ? `<b>${esc(m[1])}</b><span data-field="doc.number" style="display:inline-block;min-width:64px;border-bottom:1px solid var(--ink);height:12px"></span>`
    : number
      ? `<b>${esc(number)}</b>`
      : '';
  return `<div class="hdr">
  ${left}
  <div class="hdr-doc">
    <span class="title">${esc(title)}</span>
    <span class="num">${num}${date ? `<span>· ${esc(date)}</span>` : ''}</span>
    ${meta ? `<span class="meta">${esc(meta)}</span>` : ''}
  </div>
</div>
<div class="hdr-rule"></div>`;
}

/** Compact header for form-register documents (pay application). */
export function compactHeader({ company, title, subtitle, fillable = false }) {
  const right = fillable
    ? `<div class="col" style="gap:5px;width:260px">${field({ name: 'co.name', label: 'Your company' })}${field({ name: 'co.line1', label: 'Address' })}${field({ name: 'co.line2', label: 'Phone · license no.' })}</div>`
    : `<div class="hdr-doc" style="font-size:8.5px"><span class="strong" style="font-size:12px">${esc(company.name)}</span><span class="ink2 micro" style="margin-top:2px">${esc(company.line1)}</span><span class="ink2 micro">${esc(company.line2)}</span></div>`;
  return `<div class="hdr hdr-compact">
  <div class="col grow"><span class="title">${esc(title)}</span>${subtitle ? `<span class="sub">${esc(subtitle)}</span>` : ''}</div>
  ${right}
</div><div class="hdr-compact-rule"></div>`;
}

/**
 * MetaRow: columns = [{ label, lines: [{text, strong, mono, field}], kv: [{k, v, strong, field}] }]
 * A `field` name on a line/kv makes it fillable.
 */
export function metaRow(columns) {
  const col = (c) => {
    const lines = (c.lines ?? [])
      .map((l) => {
        const cls = `l${l.strong ? ' strong' : ''}${l.mono ? ' mono' : ''}`;
        const attrs = l.field ? ` data-field="${l.field}" style="min-height:13px"` : '';
        return `<span class="${cls}"${attrs}>${l.text ? esc(l.text) : l.field ? '&nbsp;' : ''}</span>`;
      })
      .join('');
    const kv = (c.kv ?? [])
      .map(
        (r) =>
          `<div class="kvr${r.strong ? ' strong' : ''}"><span class="k">${esc(r.k)}</span><span class="v${r.mono ? ' mono' : ''}"${r.field ? ` data-field="${r.field}" style="min-width:90px;min-height:12px"` : ''}>${r.v ? esc(r.v) : ''}</span></div>`
      )
      .join('');
    return `<div class="${c.kv ? 'kv' : ''}"><span class="label">${esc(c.label)}</span>${lines}${kv}</div>`;
  };
  return `<div class="meta" style="margin-top:2px">${columns.map(col).join('')}</div>`;
}

/** Uppercase section heading with rule; optional right-aligned hint. */
export function section(title, hint) {
  return `<div class="section"><h2>${esc(title)}</h2>${hint ? `<span class="hint">${esc(hint)}</span>` : ''}</div>`;
}

/** Labelled single-line input. `value` prints in sample mode; blank = fillable. `hint` prints after the label. */
export function field({
  name,
  label,
  value,
  hint,
  placeholder,
  flex = 1,
  width,
  tall = false,
  boxed = false,
}) {
  const style = width ? `width:${width}px;flex:none` : `flex:${flex}`;
  const h = hint ?? placeholder;
  const lab = `${esc(label)}${h ? ` <span style="text-transform:none;letter-spacing:0;font-weight:400">— ${esc(h)}</span>` : ''}`;
  return `<div class="field${boxed ? ' boxed' : ''}" style="${style}"><span class="label">${lab}</span><div class="box${tall ? ' tall' : ''}"${name ? ` data-field="${name}"` : ''}>${value ? esc(value) : '&nbsp;'}</div></div>`;
}

/** A row of fields with the standard 20px gap. */
export function fieldRow(fields, gap = 20) {
  return `<div class="row" style="gap:${gap}px;margin-top:10px">${fields.join('')}</div>`;
}

/** Multi-line labelled box. `height` in px. `hint`/`placeholder` print after the label, never inside the box. */
export function textarea({ name, label, value, placeholder, height = 60, hint }) {
  const h = hint ?? placeholder;
  return `<div class="textarea" style="margin-top:10px"><span class="label">${esc(label)}${h ? ` <span style="text-transform:none;letter-spacing:0;font-weight:400">— ${esc(h)}</span>` : ''}</span><div class="box" style="min-height:${height}px"${name ? ` data-field="${name}" data-field-type="multiline"` : ''}>${value ? nl2br(value) : ''}</div></div>`;
}

export function checkbox({ name, label, checked = false }) {
  return `<span class="check"><span class="bx${checked ? ' on' : ''}"${name ? ` data-field="${name}" data-field-type="checkbox"` : ''}></span>${esc(label)}</span>`;
}

export function checkboxRow(label, boxes) {
  return `<div class="field" style="margin-top:10px"><span class="label">${esc(label)}</span><div style="margin-top:4px">${boxes.map(checkbox).join('')}</div></div>`;
}

/**
 * Table. columns = [{ key, label, width, align: 'left'|'right'|'center', mono }]
 * rows = [{ cells: {key: text}, sub, tag: {label, tone}, field: 'prefix' }]
 *      | { section: 'title' } | { note: 'text' } | { subtotal: 'label', amount }
 *      | { total: 'label', cells: {...} }
 * blankRows: number of empty fillable rows appended (fields named `${fieldPrefix}.${i}.${key}`).
 */
export function table({
  columns,
  rows = [],
  blankRows = 0,
  fieldPrefix,
  variant = '',
  rowHeight = 22,
}) {
  const n = columns.length;
  const th = columns
    .map(
      (c) =>
        `<th class="${c.align ?? ''}"${c.width ? ` style="width:${c.width}px"` : ''}>${esc(c.label)}</th>`
    )
    .join('');
  const body = rows
    .map((r) => {
      if (r.section != null)
        return `<tr class="section"><td colspan="${n}">${esc(r.section)}</td></tr>`;
      if (r.note != null) return `<tr class="note"><td colspan="${n}">${esc(r.note)}</td></tr>`;
      if (r.subtotal != null)
        return `<tr class="subtotal"><td colspan="${n - 1}">${esc(r.subtotal)}</td><td class="amt">${esc(r.amount)}</td></tr>`;
      const cls = r.total != null ? ' class="total"' : r.muted ? ' class="ink3"' : '';
      const tds = columns
        .map((c, i) => {
          let v = r.cells?.[c.key] ?? '';
          if (r.total != null && i === 0 && !v) v = r.total;
          const attrs = r.field ? ` data-field="${r.field}.${c.key}"` : '';
          const sub = c.key === 'desc' && r.sub ? `<span class="sub">${esc(r.sub)}</span>` : '';
          const tag =
            c.key === 'desc' && r.tag
              ? `<span class="tag ${r.tag.tone ?? 'neutral'}">${esc(r.tag.label)}</span>`
              : '';
          return `<td class="${c.align ?? ''}${c.mono ? ' mono' : ''}"${attrs}>${esc(v)}${tag}${sub}</td>`;
        })
        .join('');
      return `<tr${cls}>${tds}</tr>`;
    })
    .join('');
  let blanks = '';
  for (let i = 0; i < blankRows; i++) {
    blanks += `<tr class="blank" style="height:${rowHeight}px">${columns
      .map(
        (c) =>
          `<td class="${c.align ?? ''}"${fieldPrefix ? ` data-field="${fieldPrefix}.${i + 1}.${c.key}"` : ''}></td>`
      )
      .join('')}</tr>`;
  }
  return `<table class="t ${variant}"><thead><tr>${th}</tr></thead><tbody>${body}${blanks}</tbody></table>`;
}

/** Right-aligned totals block. rows = [{ label, value, total, tone, fine, field }] */
export function totals(rows) {
  return `<div class="totals avoid"><div>${rows
    .map((r) => {
      if (r.fine) return `<span class="fine">${esc(r.fine)}</span>`;
      const cls = `r${r.total ? ' total' : ''}${r.tone ? ` ${r.tone}` : ''}`;
      return `<div class="${cls}"><span class="k">${esc(r.label)}</span><span class="v mono"${r.field ? ` data-field="${r.field}" style="min-width:90px;text-align:right"` : ''}>${esc(r.value ?? '')}</span></div>`;
    })
    .join('')}</div></div>`;
}

/** Boxed hero amount (invoice amount due, proposal total). */
export function hero({ label, sub, amount, field }) {
  return `<div class="hero avoid"><div class="col"><span class="label">${esc(label)}</span>${sub ? `<span class="micro ink2" style="margin-top:3px">${esc(sub)}</span>` : ''}</div><span class="amt"${field ? ` data-field="${field}" style="min-width:120px;text-align:right"` : ''}>${esc(amount ?? '')}</span></div>`;
}

/**
 * Signature block. parties = [{ name, sub, fields: [{ label, name, value }] }]
 * First field is the signature line; the rest sit beneath (name/title, date).
 */
export function signatures({ title, copy, parties }) {
  const line = (f, script = false) =>
    `<div class="line"><div class="sp${script ? ' script' : ''}"${f.name ? ` data-field="${f.name}"` : ''}>${f.value ? esc(f.value) : ''}</div><div class="lab">${esc(f.label)}</div></div>`;
  const party = (p) => {
    const [first, ...rest] = p.fields;
    return `<div class="party">${p.name ? `<span class="who">${esc(p.name)}${p.sub ? ` <span>· ${esc(p.sub)}</span>` : ''}</span>` : ''}${line(first, true)}${rest.length ? `<div class="under">${rest.map((f) => line(f)).join('')}</div>` : ''}</div>`;
  };
  return `<div class="sig avoid">${title ? `<span class="title">${esc(title)}</span>` : ''}${copy ? `<span class="copy">${esc(copy)}</span>` : ''}<div class="parties">${parties.map(party).join('')}</div></div>`;
}

/**
 * Form register: 8 cells in two rows of four (FormCells). cells = [{ label, value, sub, kv, field, boxes }]
 */
export function formCells(cells) {
  const rows = [cells.slice(0, 4), cells.slice(4, 8)];
  const cell = (c) => {
    const kv = (c.kv ?? [])
      .map(
        (r) =>
          `<div class="kvr"><span class="k">${esc(r.k)}</span><span class="v"${r.field ? ` data-field="${r.field}" style="min-width:60px;text-align:right"` : ''}>${esc(r.v ?? '')}</span></div>`
      )
      .join('');
    const boxes = c.boxes
      ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px">${c.boxes.map((b) => `<span class="check" style="margin:0;font-size:6.5px"><span class="bx${b.on ? ' on' : ''}"${b.name ? ` data-field="${b.name}" data-field-type="checkbox"` : ''} style="width:7px;height:7px"></span>${esc(b.label)}</span>`).join('')}</div>`
      : '';
    return `<div class="c"><span class="label">${esc(c.label)}</span>${c.value != null || c.field ? `<span class="v"${c.field ? ` data-field="${c.field}"` : ''}>${esc(c.value ?? '')}</span>` : ''}${c.sub != null || c.subField ? `<span class="s"${c.subField ? ` data-field="${c.subField}" style="min-height:10px"` : ''}>${esc(c.sub ?? '')}</span>` : ''}${kv}${boxes}</div>`;
  };
  return `<div class="cells">${rows.map((r) => `<div class="r">${r.map(cell).join('')}</div>`).join('')}</div>`;
}

/** Numbered clause (contracts). */
export function clause(n, title, text) {
  return `<div class="clause avoid"><span class="n">${esc(n)}</span><span><b>${esc(title)}.</b> ${nl2br(text)}</span></div>`;
}

export function prose(html, cls = '') {
  return `<div class="prose ${cls}">${html}</div>`;
}

export function note(html) {
  return `<div class="note avoid">${html}</div>`;
}

export function h3(text) {
  return `<div class="h3">${esc(text)}</div>`;
}

/** Two-column split with a custom left/right flex. */
export function split(left, right, ratio = [1, 1], gap = 20) {
  return `<div class="row" style="gap:${gap}px;align-items:flex-start;margin-top:10px"><div class="col" style="flex:${ratio[0]}">${left}</div><div class="col" style="flex:${ratio[1]}">${right}</div></div>`;
}

export function spacer(px = 10) {
  return `<div style="height:${px}px"></div>`;
}

/** Fine print for the bottom of a form. */
export function finePrint(text) {
  return `<p class="micro ink3" style="margin-top:14px;line-height:1.45">${esc(text)}</p>`;
}

export const money = (n, opts = {}) =>
  n == null || n === ''
    ? ''
    : (n < 0 ? '-' : '') +
      '$' +
      Math.abs(Number(n)).toLocaleString('en-US', {
        minimumFractionDigits: opts.cents === false ? 0 : 2,
        maximumFractionDigits: opts.cents === false ? 0 : 2,
      });

export const pct = (n, d = 1) => (n == null || n === '' ? '' : `${Number(n).toFixed(d)}%`);

export const brandLine = () => `Free template by ${BRAND.name} · ${BRAND.domain}/templates`;
