// Construction budget / job cost tracker — by cost code: original budget,
// approved changes, revised budget, committed, actual to date, projected final,
// variance and % spent, with a contract-vs-cost summary. Landscape Excel
// (Budget + Cost Codes + How to Use) and a landscape PDF.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import { SAMPLE_COMPANY, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'construction-budget',
  name: 'Construction Budget Template',
  basename: 'construction-budget-template',
  docName: 'Job cost budget',
};

const round2 = (n) => Math.round(n * 100) / 100;

// The Harbor Point mechanical job at mid-September 2026. The original cost
// budget is the estimate's total cost ($388,960); approved changes are the
// cost side of CO-001 (+$6,391.30), CO-002 (-$1,721.74) and CO-003 (+$5,030).
const SAMPLE = {
  asOf: 'September 17, 2026',
  costsThrough: 'September 11, 2026',
  preparedBy: `${STORY.people.pm}, Project Manager`,
  contract: {
    original: STORY.contractSum,
    changes: round2(STORY.changeOrders.reduce((t, c) => t + c.amount, 0)),
  },
  rows: [
    {
      code: '01-1000',
      desc: 'Supervision & project management',
      type: 'L',
      orig: 20160,
      chg: 0,
      com: null,
      act: 12600,
      etc: 7980,
    },
    {
      code: '01-5000',
      desc: 'Lifts, tools & temporary facilities',
      type: 'E',
      orig: 7000,
      chg: 850,
      com: 4600,
      act: 5290,
      etc: 2300,
    },
    {
      code: '01-5400',
      desc: 'Crane & rigging',
      type: 'E',
      orig: 7700,
      chg: 1925,
      com: 9625,
      act: 9625,
      etc: 0,
    },
    {
      code: '01-9000',
      desc: 'Contingency',
      type: 'O',
      orig: 10848.06,
      chg: 0,
      com: null,
      act: 0,
      etc: null,
    },
    {
      code: '01-9100',
      desc: 'Sales & use tax on materials',
      type: 'O',
      orig: 16509.94,
      chg: 0,
      com: null,
      act: 13880,
      etc: 2400,
    },
    {
      code: '22-1100',
      desc: 'Plumbing labor — underground, rough-in & trim',
      type: 'L',
      orig: 53430,
      chg: -1721.74,
      com: null,
      act: 38950,
      etc: 11400,
    },
    {
      code: '22-1300',
      desc: 'Domestic water piping & valves',
      type: 'M',
      orig: 32604,
      chg: 0,
      com: 33180,
      act: 31240,
      etc: 1940,
    },
    {
      code: '22-1400',
      desc: 'Sanitary waste, vent & storm piping',
      type: 'M',
      orig: 27300,
      chg: 0,
      com: 26880,
      act: 26880,
      etc: 0,
    },
    {
      code: '22-4000',
      desc: 'Plumbing fixtures & trim',
      type: 'M',
      orig: 16170,
      chg: 0,
      com: 16170,
      act: 0,
      etc: null,
    },
    {
      code: '23-0500',
      desc: 'Pipefitter labor — refrigerant, hydronic & equipment',
      type: 'L',
      orig: 21300,
      chg: 1764,
      com: null,
      act: 14200,
      etc: 9600,
    },
    {
      code: '23-0593',
      desc: 'Testing, adjusting & balancing',
      type: 'S',
      orig: 5600,
      chg: 0,
      com: 5600,
      act: 0,
      etc: null,
    },
    {
      code: '23-0700',
      desc: 'Pipe & duct insulation',
      type: 'S',
      orig: 9487,
      chg: 0,
      com: 9487,
      act: 4100,
      etc: null,
    },
    {
      code: '23-0900',
      desc: 'Controls hardware',
      type: 'M',
      orig: 9850,
      chg: 0,
      com: 10240,
      act: 6150,
      etc: null,
    },
    {
      code: '23-0910',
      desc: 'Controls programming & BMS integration',
      type: 'S',
      orig: 5795,
      chg: 0,
      com: 5795,
      act: 0,
      etc: null,
    },
    {
      code: '23-2300',
      desc: 'Refrigerant, hydronic & condensate piping',
      type: 'M',
      orig: 10426,
      chg: 2416,
      com: 12510,
      act: 9870,
      etc: 2900,
    },
    {
      code: '23-3100',
      desc: 'Sheet metal ductwork — fab & install',
      type: 'S',
      orig: 31850,
      chg: 0,
      com: 31850,
      act: 22295,
      etc: null,
    },
    {
      code: '23-3700',
      desc: 'Air devices, VAV terminals & dampers',
      type: 'M',
      orig: 16250,
      chg: 0,
      com: 15960,
      act: 15960,
      etc: 0,
    },
    {
      code: '23-3800',
      desc: 'Sheet metal & equipment-set labor',
      type: 'L',
      orig: 11880,
      chg: 1616.3,
      com: null,
      act: 8450,
      etc: 5900,
    },
    {
      code: '23-7400',
      desc: 'Packaged rooftop units & accessories',
      type: 'M',
      orig: 74800,
      chg: 2850,
      com: 75790,
      act: 75790,
      etc: 0,
    },
  ],
};

/** Projected final: actual + estimate-to-complete when given, else the largest of revised / committed / actual. */
function project(row) {
  const revised = round2(row.orig + row.chg);
  const projected =
    row.etc == null ? Math.max(revised, row.com ?? 0, row.act) : round2(row.act + row.etc);
  return { revised, projected, variance: round2(revised - projected), pct: row.act / revised };
}

function totals(s) {
  const t = { orig: 0, chg: 0, revised: 0, com: 0, act: 0, projected: 0 };
  for (const r of s.rows) {
    const p = project(r);
    t.orig += r.orig;
    t.chg += r.chg;
    t.revised += p.revised;
    t.com += r.com ?? 0;
    t.act += r.act;
    t.projected += p.projected;
  }
  for (const k of Object.keys(t)) t[k] = round2(t[k]);
  t.variance = round2(t.revised - t.projected);
  t.pct = t.act / t.revised;
  t.contract = round2(s.contract.original + s.contract.changes);
  t.gp = round2(t.contract - t.projected);
  t.margin = t.gp / t.contract;
  t.bidGp = round2(s.contract.original - t.orig);
  t.bidMargin = t.bidGp / s.contract.original;
  return t;
}

const CSS = `
table.t.budget td,table.t.budget th{padding:3px 5px}
table.t.budget td.neg{color:var(--deduct)}
table.t.budget td.pos{color:var(--add)}
.kpi{display:flex;gap:12px;margin-top:10px}
.kpi>div{flex:1;border:1px solid var(--rule);border-radius:4px;padding:6px 10px;display:flex;flex-direction:column}
.kpi .v{font-family:"IBM Plex Mono";font-weight:600;font-size:12px;margin-top:2px;min-height:14px}
.kpi .s{font-size:7.5px;color:var(--ink3);margin-top:1px}
`;

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const t = s ? totals(s) : null;
  const signed = (n) => (n < 0 ? '(' + H.money(-n) + ')' : H.money(n));
  const cols = [
    { key: 'code', label: 'Code', width: 52, mono: true },
    { key: 'desc', label: 'Cost code description' },
    { key: 'type', label: 'Type', width: 30, align: 'center' },
    { key: 'orig', label: 'Original budget', width: 78, align: 'right' },
    { key: 'chg', label: 'Approved changes', width: 70, align: 'right' },
    { key: 'revised', label: 'Revised budget', width: 78, align: 'right' },
    { key: 'com', label: 'Committed', width: 74, align: 'right' },
    { key: 'act', label: 'Actual to date', width: 76, align: 'right' },
    { key: 'projected', label: 'Projected final', width: 78, align: 'right' },
    { key: 'variance', label: 'Variance', width: 66, align: 'right' },
    { key: 'pct', label: '% spent', width: 46, align: 'right' },
  ];
  let rows = '';
  if (s) {
    for (const r of s.rows) {
      const p = project(r);
      const vcls = p.variance < 0 ? ' neg' : p.variance > 0 ? ' pos' : '';
      rows += `<tr><td class="mono">${r.code}</td><td>${H.esc(r.desc)}</td><td class="center">${r.type}</td><td class="right">${H.money(r.orig)}</td><td class="right">${r.chg ? signed(r.chg) : '—'}</td><td class="right">${H.money(p.revised)}</td><td class="right">${r.com == null ? '—' : H.money(r.com)}</td><td class="right">${H.money(r.act)}</td><td class="right">${H.money(p.projected)}</td><td class="right${vcls}">${p.variance === 0 ? '—' : signed(p.variance)}</td><td class="right">${H.pct(p.pct * 100, 0)}</td></tr>`;
    }
    rows += `<tr class="total"><td></td><td>Totals</td><td></td><td class="right">${H.money(t.orig)}</td><td class="right">${signed(t.chg)}</td><td class="right">${H.money(t.revised)}</td><td class="right">${H.money(t.com)}</td><td class="right">${H.money(t.act)}</td><td class="right">${H.money(t.projected)}</td><td class="right${t.variance < 0 ? ' neg' : ' pos'}">${signed(t.variance)}</td><td class="right">${H.pct(t.pct * 100, 0)}</td></tr>`;
  } else {
    for (let i = 1; i <= 18; i++) {
      rows += `<tr class="blank" style="height:19px">${cols.map((c) => `<td class="${c.align ?? ''}${c.mono ? ' mono' : ''}" data-field="row.${i}.${c.key}"></td>`).join('')}</tr>`;
    }
    rows += `<tr class="total"><td></td><td>Totals</td><td></td>${cols
      .slice(3)
      .map((c) => `<td class="right" data-field="tot.${c.key}"></td>`)
      .join('')}</tr>`;
  }
  const th = cols
    .map(
      (c) =>
        `<th class="${c.align ?? ''}"${c.width ? ` style="width:${c.width}px"` : ''}>${H.esc(c.label)}</th>`
    )
    .join('');
  const table = `<table class="t budget compact" style="margin-top:8px"><thead><tr>${th}</tr></thead><tbody>${rows}</tbody></table>`;

  const kpi = (label, value, sub, field) =>
    `<div><span class="label">${H.esc(label)}</span><span class="v"${field ? ` data-field="${field}"` : ''}>${value ?? ''}</span>${sub ? `<span class="s">${H.esc(sub)}</span>` : ''}</div>`;

  const body = `
${H.header({ company, title: 'Job cost budget', number: s ? SAMPLE_PROJECT.number : 'Project ____', date: s ? `as of ${s.asOf}` : undefined, fillable: !sample })}
${H.metaRow([
  {
    label: 'Project',
    lines: [
      { text: s ? SAMPLE_PROJECT.name : '', strong: true, field: 'project.name' },
      { text: s ? SAMPLE_PROJECT.address : '', field: 'project.address' },
      {
        text: s ? `Costs posted through ${s.costsThrough} · prepared by ${s.preparedBy}` : '',
        field: 'project.prepared',
      },
    ],
  },
  {
    label: 'Contract value',
    kv: [
      {
        k: 'Original contract',
        v: s ? H.money(s.contract.original) : '',
        field: 'contract.original',
        mono: true,
      },
      {
        k: 'Approved change orders',
        v: s ? signed(s.contract.changes) : '',
        field: 'contract.changes',
        mono: true,
      },
      {
        k: 'Revised contract',
        v: s ? H.money(t.contract) : '',
        field: 'contract.revised',
        mono: true,
        strong: true,
      },
    ],
  },
  {
    label: 'Margin',
    kv: [
      {
        k: 'Gross profit at bid',
        v: s ? `${H.money(t.bidGp)} · ${H.pct(t.bidMargin * 100)}` : '',
        field: 'margin.bid',
        mono: true,
      },
      {
        k: 'Projected gross profit',
        v: s ? `${H.money(t.gp)} · ${H.pct(t.margin * 100)}` : '',
        field: 'margin.projected',
        mono: true,
        strong: true,
      },
      {
        k: 'Budget variance',
        v: s ? signed(t.variance) : '',
        field: 'margin.variance',
        mono: true,
      },
    ],
  },
])}
${table}
<div class="kpi avoid">
${kpi('Revised cost budget', s ? H.money(t.revised) : '', s ? `Original ${H.money(t.orig)} + changes ${signed(t.chg)}` : 'original + approved changes', 'kpi.revised')}
${kpi('Committed', s ? H.money(t.com) : '', 'POs and subcontracts issued', 'kpi.committed')}
${kpi('Actual to date', s ? H.money(t.act) : '', s ? `${H.pct(t.pct * 100)} of revised budget spent` : 'costs posted to the job', 'kpi.actual')}
${kpi('Projected final cost', s ? H.money(t.projected) : '', s ? `${signed(t.variance)} vs. revised budget` : 'actual + estimate to complete', 'kpi.projected')}
${kpi('Projected gross profit', s ? `${H.money(t.gp)} · ${H.pct(t.margin * 100)}` : '', s ? `vs. ${H.pct(t.bidMargin * 100)} at bid` : 'revised contract − projected cost', 'kpi.gp')}
</div>
${H.finePrint('Type: L labor · M material · E equipment · S subcontract · O other. Projected final = actual + estimate to complete where you have one, otherwise the larger of revised budget, committed and actual. Variance = revised budget − projected final (positive is favorable). Committed = purchase orders and subcontracts issued, whether or not invoiced.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    landscape: true,
    css: CSS,
    footer: H.footerText(`${meta.docName} · ${s ? SAMPLE_PROJECT.number : 'Project ____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: true }] };
}

const COST_CODES = [
  ['01-1000', 'Supervision & project management', 'L'],
  ['01-3000', 'Submittals, coordination & closeout', 'O'],
  ['01-5000', 'Lifts, tools & temporary facilities', 'E'],
  ['01-5400', 'Crane & rigging', 'E'],
  ['01-5600', 'Vehicles & fuel', 'E'],
  ['01-7000', 'Permits, fees & inspections', 'O'],
  ['01-8000', 'Bonds & insurance', 'O'],
  ['01-9000', 'Contingency', 'O'],
  ['01-9100', 'Sales & use tax on materials', 'O'],
  ['02-4000', 'Demolition & removal', 'S'],
  ['03-3000', 'Concrete — pads, curbs & patching', 'S'],
  ['05-5000', 'Metal fabrications & supports', 'M'],
  ['07-2000', 'Thermal insulation', 'S'],
  ['07-8000', 'Firestopping', 'M'],
  ['08-1000', 'Doors, frames & hardware', 'M'],
  ['09-2000', 'Drywall, patching & painting', 'S'],
  ['21-1000', 'Fire protection', 'S'],
  ['22-1100', 'Plumbing labor', 'L'],
  ['22-1300', 'Domestic water piping & valves', 'M'],
  ['22-1400', 'Sanitary, vent & storm piping', 'M'],
  ['22-3000', 'Water heaters & plumbing equipment', 'M'],
  ['22-4000', 'Plumbing fixtures & trim', 'M'],
  ['23-0500', 'HVAC / pipefitter labor', 'L'],
  ['23-0593', 'Testing, adjusting & balancing', 'S'],
  ['23-0700', 'Pipe & duct insulation', 'S'],
  ['23-0900', 'Controls hardware', 'M'],
  ['23-0910', 'Controls programming & BMS', 'S'],
  ['23-2300', 'Refrigerant, hydronic & condensate piping', 'M'],
  ['23-3100', 'Ductwork — fab & install', 'S'],
  ['23-3700', 'Air devices, terminals & dampers', 'M'],
  ['23-3800', 'Sheet metal & equipment-set labor', 'L'],
  ['23-7400', 'Packaged rooftop units & accessories', 'M'],
  ['23-8100', 'Split systems & heat pumps', 'M'],
  ['26-0500', 'Electrical — power & connections', 'S'],
  ['26-5000', 'Lighting', 'M'],
  ['31-2000', 'Earthwork, trenching & backfill', 'S'],
  ['32-1000', 'Paving & site restoration', 'S'],
  ['33-1000', 'Site utilities', 'S'],
];

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });
  // ---- Sheet 1: Budget ----
  const ws = X.sheet(wb, 'Budget', { landscape: true, fitHeight: 0, printTitles: '12:12' });
  // A code | B desc | C type | D orig | E chg | F revised | G committed | H actual | I ETC | J projected | K variance | L % spent
  X.widths(ws, [10, 40, 7, 15, 14, 15, 14, 15, 14, 15, 14, 9]);
  let r = X.titleBlock(ws, {
    title: 'Job Cost Budget',
    subtitle:
      'One row per cost code. Enter the original budget, approved changes, commitments and actual cost; projected final, variance and % spent calculate.',
    cols: 12,
    right: 'Landscape · one page wide',
    rightFrom: 10,
  });
  X.inputLegend(ws, r, 1);
  r++;
  X.label(ws, r, 1, 'Project');
  X.label(ws, r, 7, 'Contract value');
  r++;
  X.kv(ws, r, 1, 'Project name', null, { to: 3 });
  X.kv(ws, r, 7, 'Original contract', null, { to: 8, numFmt: X.FMT.money, align: 'right' });
  const origContract = `H${r}`;
  X.text(ws, r, 10, 'Revised contract', { color: X.C.ink2, size: 9, align: 'right' });
  X.calc(ws, r, 11, `${origContract}+H${r + 1}`, { numFmt: X.FMT.money, bold: true });
  const revContract = `K${r}`;
  r++;
  X.kv(ws, r, 1, 'Project number', null, { to: 3 });
  X.kv(ws, r, 7, 'Approved change orders', null, { to: 8, numFmt: X.FMT.money, align: 'right' });
  X.text(ws, r, 10, 'Projected gross profit', { color: X.C.ink2, size: 9, align: 'right' });
  const gpCell = `K${r}`;
  r++;
  X.kv(ws, r, 1, 'As of / costs through', null, { to: 3 });
  X.text(ws, r, 10, 'Projected margin', { color: X.C.ink2, size: 9, align: 'right' });
  const marginCell = `K${r}`;
  r++;
  X.kv(ws, r, 1, 'Prepared by', null, { to: 3 });
  X.text(ws, r, 10, 'Margin at bid', { color: X.C.ink2, size: 9, align: 'right' });
  const bidMarginCell = `K${r}`;
  r += 2;
  const headRow = r;
  X.headerRow(
    ws,
    r,
    [
      'Code',
      'Cost code description',
      'Type',
      'Original budget',
      'Approved changes',
      'Revised budget',
      'Committed',
      'Actual to date',
      'Est. to complete',
      'Projected final',
      'Variance',
      '% spent',
    ],
    {
      aligns: [
        'left',
        'left',
        'center',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
      ],
    }
  );
  ws.pageSetup.printTitlesRow = `${headRow}:${headRow}`;
  r++;
  const first = r;
  const N = 30;
  for (let i = 0; i < N; i++) {
    X.bodyRow(ws, r, [
      { input: true },
      { input: true, wrap: true },
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF(AND(D${r}="",E${r}=""),"",N(D${r})+N(E${r}))`, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: X.FMT.moneyBlank },
      {
        formula: `IF(F${r}="","",IF(I${r}="",MAX(N(F${r}),N(G${r}),N(H${r})),N(H${r})+I${r}))`,
        numFmt: X.FMT.moneyBlank,
      },
      { formula: `IF(J${r}="","",F${r}-J${r})`, numFmt: '"$"#,##0.00;[Red]("$"#,##0.00);"—"' },
      { formula: `IF(OR(F${r}="",F${r}=0),"",N(H${r})/F${r})`, numFmt: '0%' },
    ]);
    r++;
  }
  const last = r - 1;
  X.dropdown(ws, `C${first}:C${last}`, ['L', 'M', 'E', 'S', 'O']);
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Totals' },
    {},
    { formula: `SUM(D${first}:D${last})`, numFmt: X.FMT.money },
    { formula: `SUM(E${first}:E${last})`, numFmt: X.FMT.money },
    { formula: `SUM(F${first}:F${last})`, numFmt: X.FMT.money },
    { formula: `SUM(G${first}:G${last})`, numFmt: X.FMT.money },
    { formula: `SUM(H${first}:H${last})`, numFmt: X.FMT.money },
    { formula: `SUM(I${first}:I${last})`, numFmt: X.FMT.money },
    { formula: `SUM(J${first}:J${last})`, numFmt: X.FMT.money },
    { formula: `F${r}-J${r}`, numFmt: '"$"#,##0.00;[Red]("$"#,##0.00)' },
    { formula: `IF(F${r}=0,"",H${r}/F${r})`, numFmt: '0%' },
  ]);
  const totRow = r;
  ws.getCell(gpCell).value = { formula: `${revContract}-J${totRow}` };
  ws.getCell(gpCell).numFmt = X.FMT.money;
  ws.getCell(gpCell).font = { name: X.FONT, size: 10, bold: true };
  ws.getCell(gpCell).alignment = { horizontal: 'right' };
  ws.getCell(marginCell).value = { formula: `IF(${revContract}=0,"",${gpCell}/${revContract})` };
  ws.getCell(marginCell).numFmt = X.FMT.pct;
  ws.getCell(marginCell).font = { name: X.FONT, size: 10, bold: true };
  ws.getCell(marginCell).alignment = { horizontal: 'right' };
  ws.getCell(bidMarginCell).value = {
    formula: `IF(${origContract}=0,"",(${origContract}-D${totRow})/${origContract})`,
  };
  ws.getCell(bidMarginCell).numFmt = X.FMT.pct;
  ws.getCell(bidMarginCell).font = { name: X.FONT, size: 10 };
  ws.getCell(bidMarginCell).alignment = { horizontal: 'right' };
  // Variance colours on the body
  ws.addConditionalFormatting({
    ref: `K${first}:K${last}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'lessThan',
        formulae: ['0'],
        style: { font: { color: { argb: X.C.deduct } } },
        priority: 1,
      },
      {
        type: 'cellIs',
        operator: 'greaterThan',
        formulae: ['0'],
        style: { font: { color: { argb: X.C.add } } },
        priority: 2,
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: `L${first}:L${last}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'greaterThan',
        formulae: ['1'],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE8E6' } } },
        priority: 1,
      },
    ],
  });
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: headRow, showGridLines: false }];
  r += 2;
  X.noteRow(
    ws,
    r,
    'Type: L labor · M material · E equipment · S subcontract · O other. Projected final = actual + estimate to complete when you enter one, otherwise the larger of revised budget, committed and actual. Variance = revised budget − projected final (positive is favorable, red is over). Committed = purchase orders and subcontracts issued, invoiced or not.',
    12,
    { height: 40 }
  );
  r += 2;
  X.brandFooter(
    ws,
    r,
    12,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Update actual costs weekly from payroll and vendor invoices; a budget reviewed monthly is a history, not a control.'
  );
  ws.pageSetup.printArea = `A1:L${r}`;

  // ---- Sheet 2: Cost Codes ----
  const cc = X.sheet(wb, 'Cost Codes', { fitHeight: 0 });
  X.widths(cc, [12, 50, 9, 40]);
  let c = X.titleBlock(cc, {
    title: 'Cost Codes',
    subtitle:
      'A CSI MasterFormat-style starter list for a mechanical / plumbing sub. Edit freely — the codes are yours; the point is to use the same ones on every job.',
    cols: 4,
  });
  X.inputLegend(cc, c, 1);
  c += 2;
  X.headerRow(cc, c, ['Code', 'Description', 'Type', 'Notes'], {
    aligns: ['left', 'left', 'center', 'left'],
  });
  c++;
  const cfirst = c;
  for (const [code, desc, type] of COST_CODES) {
    X.bodyRow(cc, c, [
      { input: true, value: code },
      { input: true, value: desc },
      { input: true, value: type, align: 'center' },
      { input: true, wrap: true },
    ]);
    c++;
  }
  for (let i = 0; i < 10; i++) {
    X.bodyRow(cc, c, [
      { input: true },
      { input: true },
      { input: true, align: 'center' },
      { input: true },
    ]);
    c++;
  }
  X.dropdown(cc, `C${cfirst}:C${c - 1}`, ['L', 'M', 'E', 'S', 'O']);
  c++;
  X.noteRow(
    cc,
    c,
    'Divisions follow CSI MasterFormat (01 general requirements, 22 plumbing, 23 HVAC, 26 electrical…). Keep a code for contingency and one for sales tax so neither hides inside a material line. Type: L labor · M material · E equipment · S subcontract · O other.',
    4,
    { height: 44 }
  );
  c += 2;
  X.brandFooter(cc, c, 4, 'Free template by BuildWorkPro — buildworkpro.com/templates.');

  X.howToSheet(wb, {
    title: 'Construction Budget Template',
    steps: [
      'Fill in the project and the original contract value on the Budget sheet. Amber cells are inputs.',
      'Add one row per cost code from the Cost Codes sheet (edit that list to match how you actually buy and track work) with its type: L labor, M material, E equipment, S subcontract, O other.',
      'Enter the original budget for each code — the cost side of your estimate, not the sell price. Overhead and profit are not job costs; contingency and sales tax get their own codes.',
      'When a change order is approved, put its cost (not its price) in Approved changes on the codes it affects, and its price in Approved change orders at the top. Revised budget and revised contract recalculate.',
      'Enter Committed (POs and subcontracts issued) and Actual to date (posted payroll, invoices and receipts) — weekly, from your accounting system. Where you know the cost to finish a code, enter it in Est. to complete; otherwise the projection uses the larger of revised budget, committed and actual.',
      'Read Projected final, Variance (red is over) and % spent by code, and the projected gross profit and margin at the top against the margin you bid.',
    ],
    tips: [
      'Compare % spent to % complete. 74% of the labor budget spent at 60% complete is the earliest warning you will get.',
      'Committed is not spent. A PO you issued but have not been invoiced for is still money you owe — include it.',
      'Post change-order costs to the codes where the work happens, not to one "changes" line, or you will never know which trades run over.',
      'Reconcile revised contract to your latest change order and pay application every month — they should be the same number.',
    ],
    feature: {
      text: 'In BuildWorkPro the accepted bid becomes the project’s contract value, approved change orders adjust it automatically, and the Reports module shows bid, project and activity KPIs for any period — exportable to CSV or PDF.',
      url: 'https://buildworkpro.com/features/reports/',
    },
  });
  return wb;
}
