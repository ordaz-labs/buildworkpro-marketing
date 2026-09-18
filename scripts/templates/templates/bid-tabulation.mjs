// Bid tabulation — level supplier and sub-tier quotes side by side: base bid,
// a scope checklist marked Incl / Excl / quoted add per bidder, plug values for
// the gaps, and the apples-to-apples leveled total with the low bidder
// highlighted. Landscape Excel (formulas + conditional formatting) and PDF.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import { SAMPLE_COMPANY, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'bid-tabulation',
  name: 'Bid Tabulation Template',
  basename: 'bid-tabulation-template',
  docName: 'Bid tabulation',
};

const BIDDERS = 5;

// Summit leveling the RTU equipment package it carried at $74,800 on the
// estimate. The low leveled total ($72,940) is the $1,860 buyout saving that
// shows on the budget template's RTU line.
const SAMPLE = {
  number: 'BT-041-02',
  date: 'June 9, 2026',
  package: 'HVAC equipment — RTU-1 to RTU-4',
  spec: '23 74 13 Packaged rooftop units · M-601',
  due: 'June 8, 2026, 2:00 PM',
  budget: 74800,
  preparedBy: `${STORY.people.estimator}, Estimator`,
  reviewedBy: `${STORY.people.pm}, Project Manager`,
  bidders: [
    { name: 'Front Range Equipment Sales', ref: 'FR-26-1188 · 06/05/2026', base: 68400 },
    { name: 'Mile High HVAC Supply', ref: 'MH-40217 · 06/08/2026', base: 66300 },
    { name: 'Colorado Air Products', ref: 'CAP-2026-0619 · 06/08/2026', base: 71800 },
    { name: 'Peak Mechanical Supply', ref: 'Q-8841 · 06/04/2026', base: 64900 },
  ],
  // cell values per bidder: 'Incl' | 'Excl' | number (quoted add / deduct)
  items: [
    {
      desc: 'Factory roof curbs, 14", per M-601',
      plug: 3600,
      cells: ['Incl', 'Excl', 'Incl', 'Excl'],
    },
    {
      desc: 'Economizers with barometric relief',
      plug: 4800,
      cells: ['Incl', 'Incl', 'Incl', 'Excl'],
    },
    {
      desc: 'Factory-mounted BACnet DDC controllers',
      plug: 2950,
      cells: ['Excl', 'Incl', 'Incl', 'Excl'],
      note: 'Front Range: field-mounted by others',
    },
    {
      desc: 'Hail guards and duct smoke detectors',
      plug: 1850,
      cells: ['Incl', 'Excl', 'Incl', 'Excl'],
    },
    {
      desc: 'Freight to site, tailgate delivery',
      plug: 1400,
      cells: ['Incl', 1190, 'Incl', 'Excl'],
      note: 'Mile High quoted freight as a separate add',
    },
    {
      desc: 'Factory start-up and 1-year parts warranty',
      plug: 2200,
      cells: ['Incl', 'Incl', 'Excl', 'Excl'],
    },
    {
      desc: '5-year compressor warranty (23 74 13 ¶2.9)',
      plug: 1650,
      cells: ['Excl', 'Incl', 'Incl', 'Excl'],
    },
    { desc: 'Submittals and O&M manuals', plug: 350, cells: ['Incl', 'Incl', 'Incl', 'Incl'] },
    {
      desc: 'Ship within 12 weeks of submittal approval',
      plug: 2500,
      cells: ['Incl', 'Incl', 'Incl', 'Excl'],
      note: 'Plug = crane remobilization if late',
    },
    {
      desc: 'Payment terms net 30, no deposit',
      plug: 0,
      cells: ['Incl', 'Incl', 'Incl', 'Excl'],
      note: 'Peak requires 50% deposit at order',
    },
  ],
  notes:
    'Peak has the lowest base bid but excludes $20,950 of specified scope and wants a 50% deposit. Mile High is low on a leveled basis once Summit buys curbs and hail guards separately ($5,450). Recommend award to Mile High HVAC Supply at $67,490 (base plus freight), curbs and hail guards purchased separately — $1,860 under the estimate line.',
  award: 'Mile High HVAC Supply — $72,940.00 leveled',
};

function level(s) {
  return s.bidders.map((b, i) => {
    const gaps = s.items.reduce((t, it) => t + (it.cells[i] === 'Excl' ? it.plug : 0), 0);
    const adds = s.items.reduce(
      (t, it) => t + (typeof it.cells[i] === 'number' ? it.cells[i] : 0),
      0
    );
    return { gaps, adds, total: b.base + gaps + adds };
  });
}

const CSS = `
table.t.tab th.b,table.t.tab td.b{text-align:right;width:88px}
table.t.tab th.b .nm{display:block;font-size:8px;letter-spacing:.3px;text-transform:none;color:var(--ink);font-weight:600;min-height:11px}
table.t.tab th.b .ref{display:block;font-size:7px;letter-spacing:0;text-transform:none;font-weight:400;color:var(--ink3);margin-top:2px;min-height:9px}
table.t.tab tr.sum td{background:var(--band)}
table.t.tab tr.lev td{border-top:1.5px solid var(--ink);font-weight:700;font-size:9.5px;padding-top:6px;padding-bottom:6px}
table.t.tab td.low{color:var(--add)}
table.t.tab .tag{margin-left:0}
`;

const money = (n) => (n < 0 ? '(' + H.money(-n) + ')' : H.money(n));

function tabTable({ sample }) {
  const s = sample ? SAMPLE : null;
  const lv = s ? level(s) : null;
  const low = lv ? Math.min(...lv.map((x) => x.total)) : null;
  const bidderTh = (i) => {
    const b = s?.bidders[i];
    return `<th class="b"><span class="nm"${s ? '' : ` data-field="bidder.${i + 1}.name"`}>${b ? H.esc(b.name) : s ? '—' : ''}</span><span class="ref"${s ? '' : ` data-field="bidder.${i + 1}.ref"`}>${b ? H.esc(b.ref) : s ? '' : ''}</span></th>`;
  };
  const head = `<tr><th style="width:22px" class="center">#</th><th>Scope item / requirement</th><th class="right" style="width:62px">Plug value</th>${Array.from({ length: BIDDERS }, (_, i) => bidderTh(i)).join('')}<th style="width:150px">Notes</th></tr>`;

  const cellHtml = (v) => {
    if (v === 'Incl') return '<span class="tag add">Incl</span>';
    if (v === 'Excl') return '<span class="tag ded">Excl</span>';
    if (typeof v === 'number') return (v < 0 ? '' : '+') + money(v);
    return '';
  };
  const bidderTds = (rowKey, fn) =>
    Array.from({ length: BIDDERS }, (_, i) =>
      s
        ? `<td class="b${fn.cls?.(i) ?? ''}">${fn.value(i)}</td>`
        : `<td class="b" data-field="${rowKey}.${i + 1}"></td>`
    ).join('');

  let rows = `<tr><td class="center mono">1</td><td class="strong">Base bid — as quoted, before leveling</td><td class="right ink3">—</td>${bidderTds('base', { value: (i) => (s.bidders[i] ? H.money(s.bidders[i].base) : '') })}<td class="micro ink2"${s ? '' : ' data-field="base.notes"'}>${s ? 'Lump sum per bidder’s quote' : ''}</td></tr>`;
  const n = s ? s.items.length : 10;
  for (let k = 0; k < n; k++) {
    const it = s?.items[k];
    rows += `<tr${s ? '' : ' class="blank" style="height:20px"'}><td class="center mono">${k + 2}</td><td${s ? '' : ` data-field="item.${k + 1}.desc"`}>${it ? H.esc(it.desc) : ''}</td><td class="right"${s ? '' : ` data-field="item.${k + 1}.plug"`}>${it ? (it.plug ? H.money(it.plug) : '—') : ''}</td>${bidderTds(`item.${k + 1}`, { value: (i) => cellHtml(it.cells[i]) })}<td class="micro ink2"${s ? '' : ` data-field="item.${k + 1}.notes"`}>${it?.note ? H.esc(it.note) : ''}</td></tr>`;
  }
  const sum = (cls, label, rowKey, fn, extra = '') =>
    `<tr class="${cls}"><td></td><td colspan="2"${extra}>${label}</td>${bidderTds(rowKey, fn)}<td class="micro ink2">${cls === 'lev' && s ? 'Low leveled bid highlighted' : ''}</td></tr>`;
  const v = (i, f) => (s.bidders[i] ? f(i) : '');
  rows += sum('sum', 'Scope gaps — plug values for items marked Excl', 'gaps', {
    value: (i) => v(i, (i) => H.money(lv[i].gaps)),
  });
  rows += sum('sum', 'Quoted adds / (deducts)', 'adds', {
    value: (i) => v(i, (i) => (lv[i].adds ? money(lv[i].adds) : H.money(0))),
  });
  rows += sum('lev', 'Leveled total', 'leveled', {
    value: (i) =>
      v(
        i,
        (i) =>
          (lv[i].total === low ? `<span class="tag add" style="margin-right:6px">Low</span>` : '') +
          H.money(lv[i].total)
      ),
    cls: (i) => (s.bidders[i] && lv[i].total === low ? ' low' : ''),
  });
  const ranks = lv ? lv.map((x) => 1 + lv.filter((y) => y.total < x.total).length) : [];
  rows += sum('', 'Rank', 'rank', { value: (i) => v(i, (i) => String(ranks[i])) });
  rows += sum('', 'Over low leveled bid', 'overlow', {
    value: (i) => v(i, (i) => (lv[i].total === low ? '—' : '+' + H.money(lv[i].total - low))),
  });
  rows += sum(
    '',
    s ? `Over / (under) budget of ${H.money(s.budget)}` : 'Over / (under) budget',
    'vsbudget',
    {
      value: (i) => v(i, (i) => money(lv[i].total - s.budget)),
    }
  );
  return `<table class="t tab compact" style="margin-top:10px"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const body = `
${H.header({ company, title: 'Bid tabulation', number: s ? s.number : 'BT-____', date: s ? s.date : undefined, fillable: !sample })}
${H.metaRow([
  {
    label: 'Project',
    lines: [
      { text: s ? SAMPLE_PROJECT.name : '', strong: true, field: 'project.name' },
      { text: s ? SAMPLE_PROJECT.number : '', mono: true, field: 'project.number' },
      { text: s ? SAMPLE_PROJECT.address : '', field: 'project.address' },
    ],
  },
  {
    label: 'Bid package',
    kv: [
      { k: 'Scope', v: s ? s.package : '', field: 'pkg.scope', strong: true },
      { k: 'Spec / drawings', v: s ? s.spec : '', field: 'pkg.spec' },
      { k: 'Bids due', v: s ? s.due : '', field: 'pkg.due' },
      { k: 'Budget (estimate)', v: s ? H.money(s.budget) : '', field: 'pkg.budget', mono: true },
    ],
  },
  {
    label: 'Leveling',
    kv: [
      { k: 'Prepared by', v: s ? s.preparedBy : '', field: 'prepared_by' },
      { k: 'Reviewed by', v: s ? s.reviewedBy : '', field: 'reviewed_by' },
      { k: 'Date', v: s ? s.date : '', field: 'date' },
    ],
  },
])}
${tabTable({ sample })}
${H.split(
  H.textarea({
    name: 'notes',
    label: 'Leveling notes & recommendation',
    hint: 'why the low leveled bid is low, what was plugged, anything to negotiate before award',
    value: s ? s.notes : '',
    height: 54,
  }),
  `${H.field({ name: 'award', label: 'Recommended award', value: s ? s.award : '', tall: true })}
   <p class="micro ink3" style="margin-top:6px;line-height:1.45">Incl = in the bidder’s price. Excl = not in the price — the plug value is added so every bidder carries the same scope. A number is an add or (deduct) the bidder quoted for that item. Leveled total = base bid + plugs + quoted adds.</p>`,
  [1.5, 1]
)}
${H.finePrint('Plug values are your estimate of what an excluded item will cost to buy elsewhere — use real quotes where you have them. A low leveled bid still needs its exclusions written into the purchase order or subcontract. Not legal advice.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    landscape: true,
    css: CSS,
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'BT-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: true }] };
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });
  const ws = X.sheet(wb, 'Bid Tab', { landscape: true, fitHeight: 1 });
  // A # | B item | C plug | D..H bidders | I notes
  X.widths(ws, [5, 44, 12, 17, 17, 17, 17, 17, 30]);
  const B1 = 4;
  const bidderCols = Array.from({ length: BIDDERS }, (_, i) => X.col(B1 + i)); // D..H
  const first = bidderCols[0];
  const last = bidderCols[BIDDERS - 1];

  let r = X.titleBlock(ws, {
    title: 'Bid Tabulation',
    subtitle:
      'Type Incl, Excl or a quoted add / (deduct) for each scope item under each bidder. Excluded items add the plug value, so the leveled totals compare the same scope.',
    cols: 9,
    right: 'Landscape · fits one page wide',
    rightFrom: 7,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.label(ws, r, 1, 'Project');
  X.label(ws, r, 4, 'Bid package');
  X.label(ws, r, 7, 'Leveling');
  r++;
  X.kv(ws, r, 1, 'Project name', null, { to: 3 });
  X.kv(ws, r, 4, 'Scope', null, { to: 6 });
  X.kv(ws, r, 7, 'Prepared by', null, { to: 9 });
  r++;
  X.kv(ws, r, 1, 'Project number', null, { to: 3 });
  X.kv(ws, r, 4, 'Spec / drawings', null, { to: 6 });
  X.kv(ws, r, 7, 'Reviewed by', null, { to: 9 });
  r++;
  X.kv(ws, r, 1, 'Site address', null, { to: 3 });
  X.kv(ws, r, 4, 'Bids due', null, { to: 6, numFmt: X.FMT.date });
  X.kv(ws, r, 7, 'Date', null, { to: 9, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 4, 'Budget (estimate)', null, { to: 6, numFmt: X.FMT.money, align: 'right' });
  const budgetCell = `E${r}`;
  r += 2;

  // Bidder register
  const reg = (lab, numFmt, align) => {
    X.text(ws, r, 2, lab, { color: X.C.ink2, size: 9, align: 'right' });
    bidderCols.forEach((c, i) =>
      X.input(ws, r, B1 + i, null, {
        numFmt,
        align: align ?? 'left',
        wrap: true,
        bold: lab === 'Bidder',
      })
    );
    r++;
  };
  X.label(ws, r, 2, 'Bidders');
  r++;
  reg('Bidder');
  const nameRow = r - 1;
  reg('Contact / quote no.');
  reg('Quote date', X.FMT.date, 'center');
  r++;

  X.headerRow(
    ws,
    r,
    [
      '#',
      'Scope item / requirement',
      'Plug value',
      ...bidderCols.map((_, i) => `Bidder ${i + 1}`),
      'Notes',
    ],
    { aligns: ['center', 'left', 'right', ...bidderCols.map(() => 'right'), 'left'] }
  );
  bidderCols.forEach((_, i) => {
    ws.getCell(r, B1 + i).value = {
      formula: `IF(${bidderCols[i]}${nameRow}="","Bidder ${i + 1}",${bidderCols[i]}${nameRow})`,
    };
  });
  r++;
  // Base bid row
  X.bodyRow(ws, r, [
    { value: 1, align: 'center', color: X.C.ink3 },
    { value: 'Base bid — as quoted, before leveling', bold: true },
    { value: '—', align: 'right', color: X.C.ink3 },
    ...bidderCols.map(() => ({ input: true, numFmt: X.FMT.moneyBlank })),
    { input: true, wrap: true },
  ]);
  const baseRow = r;
  r++;
  const s1 = r;
  for (let k = 0; k < 14; k++) {
    X.bodyRow(ws, r, [
      { value: k + 2, align: 'center', color: X.C.ink3 },
      { input: true, wrap: true },
      { input: true, numFmt: X.FMT.moneyBlank },
      ...bidderCols.map(() => ({ input: true, numFmt: X.FMT.moneyBlank, align: 'right' })),
      { input: true, wrap: true },
    ]);
    r++;
  }
  const s2 = r - 1;
  // Incl / Excl colours
  X.statusColors(ws, `${first}${s1}:${last}${s2}`, { Excl: 'FFFDE8E6', Incl: 'FFE6F4EA' });

  const sumRow = (label, fn, { bold, numFmt = X.FMT.moneyBlank } = {}) => {
    X.bodyRow(ws, r, [
      { value: '' },
      { value: label, bold, size: bold ? 10 : 9.5 },
      {},
      ...bidderCols.map((c) => ({ formula: fn(c), numFmt, bold })),
      {},
    ]);
    ws.mergeCells(r, 2, r, 3);
    const row = r;
    r++;
    return row;
  };
  const gapsRow = sumRow(
    'Scope gaps — plug values for items marked Excl',
    (c) => `IF(${c}${baseRow}="","",SUMPRODUCT((${c}${s1}:${c}${s2}="Excl")*($C$${s1}:$C$${s2})))`
  );
  const addsRow = sumRow(
    'Quoted adds / (deducts)',
    (c) => `IF(${c}${baseRow}="","",SUM(${c}${s1}:${c}${s2}))`
  );
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'LEVELED TOTAL' },
    {},
    ...bidderCols.map((c) => ({
      formula: `IF(${c}${baseRow}="","",${c}${baseRow}+${c}${gapsRow}+${c}${addsRow})`,
      numFmt: X.FMT.moneyBlank,
    })),
    { value: 'low leveled bid highlighted', align: 'left' },
  ]);
  ws.mergeCells(r, 2, r, 3);
  ws.getCell(r, 9).font = { name: X.FONT, size: 8, italic: true, color: { argb: X.C.ink3 } };
  const levRow = r;
  ws.addConditionalFormatting({
    ref: `${first}${levRow}:${last}${levRow}`,
    rules: [
      {
        type: 'expression',
        formulae: [
          `AND(${first}${levRow}<>"",${first}${levRow}=MIN($${first}$${levRow}:$${last}$${levRow}))`,
        ],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFE6F4EA' } },
          font: { bold: true, color: { argb: X.C.add } },
        },
        priority: 1,
      },
    ],
  });
  r++;
  sumRow(
    'Rank (1 = low)',
    (c) => `IF(${c}${levRow}="","",RANK(${c}${levRow},$${first}$${levRow}:$${last}$${levRow},1))`,
    {
      numFmt: '0;;""',
    }
  );
  sumRow(
    'Over low leveled bid',
    (c) => `IF(${c}${levRow}="","",${c}${levRow}-MIN($${first}$${levRow}:$${last}$${levRow}))`
  );
  sumRow(
    'Over / (under) budget',
    (c) => `IF(OR(${c}${levRow}="",${budgetCell}=""),"",${c}${levRow}-${budgetCell})`,
    {
      numFmt: '"$"#,##0.00;("$"#,##0.00);"$"0.00',
    }
  );
  r++;
  X.kv(ws, r, 1, 'Recommended award', null, { labelTo: 1, to: 6 });
  r += 2;
  X.label(ws, r, 1, 'Leveling notes & recommendation');
  r++;
  ws.mergeCells(r, 1, r + 2, 9);
  X.input(ws, r, 1, null, { wrap: true });
  for (let i = 0; i < 3; i++) ws.getRow(r + i).height = 18;
  r += 4;
  X.noteRow(
    ws,
    r,
    'Incl = in the bidder’s price. Excl = not in the price, so the plug value in column C is added. A number is an add or (deduct) the bidder quoted for that item. Leveled total = base bid + plugs + quoted adds. Type the words exactly (Incl / Excl) so the formulas and colours pick them up.',
    9,
    { height: 40 }
  );
  r += 2;
  X.brandFooter(
    ws,
    r,
    9,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Plug values are your estimate of what an excluded item costs elsewhere; use real quotes where you have them. Write the exclusions of the winning bid into the purchase order or subcontract.'
  );
  ws.pageSetup.printArea = `A1:I${r}`;
  ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 0, showGridLines: false }];

  X.howToSheet(wb, {
    title: 'Bid Tabulation Template',
    steps: [
      'Fill in the project, the bid package (scope, spec section, due date) and the budget you carried for it on your estimate.',
      'Enter each bidder’s name, quote number and date across the top, and their base bid in row 1.',
      'List every scope item and requirement the package must include — curbs, controls, freight, start-up, warranty, submittals, lead time, payment terms. Put a plug value next to each: what it would cost you to buy that item separately.',
      'Under each bidder, type Incl if the item is in their price, Excl if it is not, or the add / (deduct) amount they quoted for it.',
      'Read the leveled totals. Excluded items add their plug, quoted adds are summed, and the low leveled bid is highlighted green with rank, spread over low, and over / (under) budget for each bidder.',
      'Write your recommendation, then carry the winning bidder’s exclusions into the purchase order or subcontract so the gaps are bought, not forgotten.',
    ],
    tips: [
      'The lowest base bid is rarely the lowest leveled bid. Level before you call anyone.',
      'Plug high, not low. If you have no quote for the gap, price it at what a rushed purchase would cost.',
      'A bidder with many Excl marks is telling you they read the spec differently — ask them before you assume.',
      'Keep the tab with the job file. When the budget review asks why you bought from the second-lowest, this page is the answer.',
    ],
    feature: {
      text: 'In BuildWorkPro the winning number goes straight into a line-item bid priced from your catalog, with margin and overhead applied as rates — and the won bid converts into a project whose cost budget you can track against.',
      url: 'https://buildworkpro.com/features/construction-bidding/',
    },
  });
  return wb;
}
