// Construction estimate — the pricing worksheet behind a bid. Sections for
// materials, labor, equipment and subcontractors, then sales tax on materials,
// contingency, overhead and profit priced as a true margin (not a markup).
// One-page fillable PDF + an Excel workbook with a Markup vs Margin sheet.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'construction-estimate',
  name: 'Construction Estimate Template',
  basename: 'construction-estimate-template',
  docName: 'Construction estimate',
};

/** Rates behind the completed example. Total cost × 1.10 ÷ 0.88 = $486,200 exactly. */
const RATES = { tax: 8.81, contingency: 3, overhead: 10, margin: 12 };

const SAMPLE = {
  number: 'EST-2026-041',
  date: 'April 30, 2026',
  valid: 'June 3, 2026',
  bidDue: 'May 5, 2026',
  preparedBy: `${STORY.people.estimator}, Estimator`,
  reviewedBy: `${STORY.people.pm}, Project Manager`,
  to: SAMPLE_GC,
  docs: 'M-001–M-602 & P-001–P-402 dated 03/27/2026 · Div. 22 & 23 · Addenda 1–2',
  sections: [
    {
      key: 'mat',
      title: 'Materials',
      hint: 'delivered cost, before sales tax',
      blank: 5,
      items: [
        {
          desc: 'Packaged rooftop units RTU-1 to RTU-4 with curbs, economizers & BACnet controllers',
          sub: 'Budget quote — Front Range Equipment Sales, per M-601 schedule',
          qty: 1,
          unit: 'LS',
          cost: 74800,
        },
        {
          desc: 'Air devices, VAV terminals & fire/smoke dampers per M-401 / M-402',
          qty: 1,
          unit: 'LS',
          cost: 16250,
        },
        {
          desc: 'Type L copper pipe, fittings & valves — domestic water',
          qty: 2860,
          unit: 'LF',
          cost: 11.4,
        },
        { desc: 'Cast iron & PVC DWV pipe, fittings & hangers', qty: 3120, unit: 'LF', cost: 8.75 },
        { desc: 'Plumbing fixtures & trim per P-601 schedule', qty: 42, unit: 'EA', cost: 385 },
        {
          desc: 'Refrigerant & hydronic piping, controls hardware & specialties',
          qty: 1,
          unit: 'LS',
          cost: 20276,
        },
      ],
    },
    {
      key: 'lab',
      title: 'Labor',
      hint: 'qty = hours · unit cost = fully loaded hourly rate',
      blank: 4,
      items: [
        { desc: 'Plumbers — underground, rough-in & trim', qty: 780, unit: 'HR', cost: 68.5 },
        {
          desc: 'Pipefitters — refrigerant, hydronic & equipment set',
          qty: 300,
          unit: 'HR',
          cost: 71,
        },
        { desc: 'Sheet metal — air devices, dampers & RTU set', qty: 180, unit: 'HR', cost: 66 },
        { desc: 'Foreman — supervision, layout & coordination', qty: 240, unit: 'HR', cost: 84 },
      ],
    },
    {
      key: 'eq',
      title: 'Equipment',
      hint: 'rentals, crane, tools',
      blank: 3,
      items: [
        {
          desc: 'Crane — 90-ton hydraulic for RTU sets, incl. rigging crew',
          qty: 2,
          unit: 'DAY',
          cost: 3850,
        },
        {
          desc: 'Scissor & boom lifts (4 mo), press tools & core drill rental',
          qty: 1,
          unit: 'LS',
          cost: 7000,
        },
      ],
    },
    {
      key: 'subs',
      title: 'Subcontractors',
      hint: 'written quotes attached',
      blank: 3,
      items: [
        {
          desc: 'Sheet metal ductwork — fabricate & install',
          sub: 'Ridgeline Sheet Metal quote dated 04/28/2026',
          qty: 1,
          unit: 'LS',
          cost: 31850,
        },
        { desc: 'Pipe & duct insulation — Front Range Insulators', qty: 1, unit: 'LS', cost: 9487 },
        {
          desc: 'Testing, adjusting & balancing — Rocky Mountain TAB (independent)',
          qty: 1,
          unit: 'LS',
          cost: 5600,
        },
        {
          desc: 'Controls programming & BMS integration — Alpine Controls',
          qty: 1,
          unit: 'LS',
          cost: 5795,
        },
      ],
    },
  ],
  notes:
    'Pricing per bid set dated 03/27/2026 and Addenda 1–2. Excludes medical gas, fire protection, power wiring to equipment (Div. 26), roof flashing, structural dunnage, cutting/patching and utility fees. Installation of owner-furnished water heater WH-1 carried at $1,980. Bonds not included (add 1.2% if required). Sales tax at Denver 8.81% on materials. Bid submitted as a $486,200 lump sum on proposal BP-2026-041.',
};

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Section band rows use a local `tr.sec` class so the hint can sit in the same
 * cell as the title (the kit's `tr.section` row is a single uppercase cell).
 */
const CSS = `
.hdr-rule{margin:10px 0 12px}
.page>p.micro{margin-top:10px!important}
table.t.compact td{padding:2.5px 6px}
table.t tr.subtotal td{padding:3px 6px 6px}
.totals>div{gap:2px}
.row .textarea{margin-top:0!important}
table.t tr.sec td{padding:6px 6px 2px;border-bottom:1px solid var(--ink);font-size:8px;letter-spacing:.9px;text-transform:uppercase;font-weight:700}
table.t tr.sec .hint{font-weight:400;letter-spacing:0;text-transform:none;font-size:7.5px;color:var(--ink3)}
`;

function compute(sample, rates) {
  const sec = {};
  for (const s of sample.sections) sec[s.key] = s.items.reduce((t, i) => t + i.qty * i.cost, 0);
  const direct = sec.mat + sec.lab + sec.eq + sec.subs;
  const tax = round2(sec.mat * (rates.tax / 100));
  const contingency = round2(direct * (rates.contingency / 100));
  const cost = round2(direct + tax + contingency);
  const overhead = round2(cost * (rates.overhead / 100));
  const costOh = round2(cost + overhead);
  const total = round2(costOh / (1 - rates.margin / 100));
  const profit = round2(total - costOh);
  const markupEq = (profit / costOh) * 100;
  return { sec, direct, tax, contingency, cost, overhead, costOh, profit, total, markupEq };
}

/**
 * Local table builder (the kit's H.table appends blank rows only at the end
 * and cannot make a subtotal amount fillable). Reuses the kit's table.t CSS.
 */
function estimateTable({ sample, sections }) {
  const cols = [
    { key: 'n', label: '#', width: 24, cls: 'center mono' },
    { key: 'desc', label: 'Description' },
    { key: 'qty', label: 'Qty', width: 54, cls: 'right' },
    { key: 'unit', label: 'Unit', width: 40, cls: 'center' },
    { key: 'cost', label: 'Unit cost', width: 76, cls: 'right' },
    { key: 'amount', label: 'Amount', width: 86, cls: 'right' },
  ];
  const th = cols
    .map(
      (c) =>
        `<th class="${c.cls ?? ''}"${c.width ? ` style="width:${c.width}px"` : ''}>${H.esc(c.label)}</th>`
    )
    .join('');
  let n = 0;
  const body = sections
    .map((s) => {
      const head = `<tr class="sec"><td colspan="${cols.length}"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><span>${H.esc(s.title)}</span><span class="hint">${H.esc(s.hint)}</span></div></td></tr>`;
      let rows = '';
      if (sample) {
        for (const i of s.items) {
          n++;
          const sub = i.sub ? `<span class="sub">${H.esc(i.sub)}</span>` : '';
          rows += `<tr><td class="center mono">${n}</td><td>${H.esc(i.desc)}${sub}</td><td class="right">${i.qty.toLocaleString('en-US')}</td><td class="center">${H.esc(i.unit)}</td><td class="right">${H.money(i.cost)}</td><td class="right">${H.money(i.qty * i.cost)}</td></tr>`;
        }
      } else {
        for (let k = 1; k <= s.blank; k++) {
          n++;
          rows += `<tr class="blank" style="height:20px"><td class="center mono ink3">${n}</td>${cols
            .slice(1)
            .map((c) => `<td class="${c.cls ?? ''}" data-field="${s.key}.${k}.${c.key}"></td>`)
            .join('')}</tr>`;
        }
      }
      const amt = sample ? H.money(s.items.reduce((t, i) => t + i.qty * i.cost, 0)) : '';
      const subtotal = `<tr class="subtotal"><td colspan="${cols.length - 1}">${H.esc(s.title)} subtotal</td><td class="amt mono"${sample ? '' : ` data-field="sub.${s.key}"`}>${amt}</td></tr>`;
      return head + rows + subtotal;
    })
    .join('');
  return `<table class="t compact" style="margin-top:8px"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`;
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const t = s ? compute(s, RATES) : null;
  const pctLabel = (v) => (s ? `${v}%` : '___%');

  const body = `
${H.header({ company, title: 'Estimate', number: s ? s.number : 'EST-____', date: s ? s.date : undefined, fillable: !sample })}
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
    label: 'Prepared for (GC / owner)',
    lines: [
      { text: s ? s.to.name : '', strong: true, field: 'to.name' },
      { text: s ? s.to.line1 : '', field: 'to.line1' },
      { text: s ? s.to.line2 : '', field: 'to.line2' },
    ],
  },
  {
    label: 'Estimate',
    kv: [
      { k: 'Date', v: s ? s.date : '', field: 'est.date' },
      { k: 'Pricing valid through', v: s ? s.valid : '', field: 'est.valid' },
      { k: 'Bid due', v: s ? s.bidDue : '', field: 'est.bid_due' },
    ],
  },
])}
${H.fieldRow([
  H.field({
    name: 'est.docs',
    label: 'Bid documents & addenda',
    hint: 'drawing set, spec divisions, addenda acknowledged',
    value: s ? s.docs : '',
    flex: 2.3,
  }),
  H.field({ name: 'est.prepared_by', label: 'Prepared by', value: s ? s.preparedBy : '', flex: 1 }),
  H.field({ name: 'est.reviewed_by', label: 'Reviewed by', value: s ? s.reviewedBy : '', flex: 1 }),
])}
${estimateTable({ sample, sections: SAMPLE.sections })}
${H.split(
  `${H.textarea({
    name: 'notes',
    label: 'Basis of estimate, assumptions & exclusions',
    hint: 'what the price relies on — carry these onto the proposal',
    value: s ? s.notes : '',
    height: 84,
  })}
  ${H.prose(
    `<p class="small ink2" style="margin-top:8px;line-height:1.45"><b>Margin, not markup.</b> Overhead is a cost, priced before profit. Profit is a share of the <i>price</i>: price = (cost + overhead) ÷ (1 − margin). ${s ? `A ${RATES.margin}% margin here equals a ${t.markupEq.toFixed(1)}% markup on cost + overhead.` : 'A 15% markup on cost is only a 13% margin on price.'}</p>`
  )}`,
  H.totals([
    { label: 'Direct cost subtotal', value: s ? H.money(t.direct) : '', field: 'tot.direct' },
    {
      label: `Sales tax on materials (${pctLabel(RATES.tax)})`,
      value: s ? H.money(t.tax) : '',
      field: 'tot.tax',
    },
    {
      label: `Contingency (${pctLabel(RATES.contingency)} of direct cost)`,
      value: s ? H.money(t.contingency) : '',
      field: 'tot.contingency',
    },
    { label: 'Total estimated cost', value: s ? H.money(t.cost) : '', field: 'tot.cost' },
    {
      label: `Overhead (${pctLabel(RATES.overhead)})`,
      value: s ? H.money(t.overhead) : '',
      field: 'tot.overhead',
    },
    { label: 'Cost + overhead', value: s ? H.money(t.costOh) : '', field: 'tot.cost_oh' },
    {
      label: `Profit — ${pctLabel(RATES.margin)} margin on price`,
      value: s ? H.money(t.profit) : '',
      field: 'tot.profit',
    },
    {
      label: 'Estimate total',
      value: s ? H.money(t.total) : '',
      total: true,
      field: 'tot.total',
    },
  ]),
  [1.3, 1]
)}
${H.finePrint('Internal pricing worksheet — the customer-facing number and the assumptions above go on your quote or bid proposal. Not accounting or tax advice: confirm the sales-tax treatment of materials for your state and contract.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    css: CSS,
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'EST-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });

  // ---- Sheet 1: Estimate ----
  const ws = X.sheet(wb, 'Estimate', { fitHeight: 1 });
  X.widths(ws, [5, 46, 9, 7, 13, 15, 24]);
  let r = X.titleBlock(ws, {
    title: 'Construction Estimate',
    subtitle:
      'Materials, labor, equipment and subcontractors by section — then tax, contingency, overhead and profit as a true margin.',
    cols: 7,
    right: 'Print: fits one page',
    rightFrom: 5,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.label(ws, r, 1, 'Your company');
  X.label(ws, r, 3, 'Estimate');
  r++;
  X.kv(ws, r, 1, 'Company', null, { to: 2 });
  X.kv(ws, r, 3, 'Estimate no.', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Address', null, { to: 2 });
  X.kv(ws, r, 3, 'Date', null, { labelTo: 4, to: 7, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Phone / email', null, { to: 2 });
  X.kv(ws, r, 3, 'Pricing valid through', null, { labelTo: 4, to: 7, numFmt: X.FMT.date });
  r += 2;
  X.label(ws, r, 1, 'Project');
  X.label(ws, r, 3, 'Prepared for (GC / owner)');
  r++;
  X.kv(ws, r, 1, 'Project name', null, { to: 2 });
  X.kv(ws, r, 3, 'Company', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Project number', null, { to: 2 });
  X.kv(ws, r, 3, 'Contact', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Site address', null, { to: 2 });
  X.kv(ws, r, 3, 'Prepared by', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Bid documents & addenda', null, { to: 2 });
  X.kv(ws, r, 3, 'Reviewed by', null, { labelTo: 4, to: 7 });
  r += 2;

  X.headerRow(
    ws,
    r,
    ['#', 'Description', 'Qty', 'Unit', 'Unit cost', 'Amount', 'Notes / quote ref'],
    {
      aligns: ['center', 'left', 'right', 'center', 'right', 'right', 'left'],
    }
  );
  r++;

  const subtotalCells = {};
  const sections = [
    ['mat', 'Materials — delivered cost before sales tax', 8],
    ['lab', 'Labor — qty is hours, unit cost is the fully loaded hourly rate', 5],
    ['eq', 'Equipment — rentals, crane, tools', 4],
    ['subs', 'Subcontractors — attach written quotes', 5],
  ];
  let lineNo = 1;
  for (const [key, title, count] of sections) {
    X.sectionRow(ws, r, title, 7);
    r++;
    const first = r;
    for (let i = 0; i < count; i++) {
      X.bodyRow(ws, r, [
        { value: lineNo++, align: 'center', color: X.C.ink3 },
        { input: true, wrap: true },
        { input: true, numFmt: X.FMT.num, align: 'right' },
        { input: true, align: 'center' },
        { input: true, numFmt: X.FMT.moneyBlank },
        { formula: `IF(OR(C${r}="",E${r}=""),"",C${r}*E${r})`, numFmt: X.FMT.moneyBlank },
        { input: true, wrap: true },
      ]);
      r++;
    }
    const last = r - 1;
    X.bodyRow(ws, r, [
      { value: '' },
      { value: `${title.split(' — ')[0]} subtotal`, bold: true, size: 9 },
      {},
      {},
      {},
      { formula: `SUM(F${first}:F${last})`, numFmt: X.FMT.money, bold: true },
      {},
    ]);
    ws.getCell(r, 6).border = {
      top: { style: 'thin', color: { argb: X.C.ink2 } },
      bottom: { style: 'thin', color: { argb: X.C.rule } },
    };
    subtotalCells[key] = `F${r}`;
    r += 2;
  }

  // ---- Pricing ladder ----
  const ladderLabel = (row, txt, { bold, size } = {}) =>
    X.text(ws, row, 2, txt, { color: bold ? X.C.ink : X.C.ink2, bold, size: size ?? 9.5 });
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Direct cost subtotal' },
    {},
    {},
    {},
    {
      formula: `${subtotalCells.mat}+${subtotalCells.lab}+${subtotalCells.eq}+${subtotalCells.subs}`,
      numFmt: X.FMT.money,
    },
    {},
  ]);
  const directRow = r;
  r++;
  ladderLabel(r, 'Sales tax on materials — enter your rate →');
  X.input(ws, r, 5, 0, { numFmt: '0.00%', align: 'right' });
  X.calc(ws, r, 6, `${subtotalCells.mat}*E${r}`, { numFmt: X.FMT.money });
  const taxRow = r;
  r++;
  ladderLabel(r, 'Contingency — % of direct cost →');
  X.input(ws, r, 5, 0.03, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(ws, r, 6, `F${directRow}*E${r}`, { numFmt: X.FMT.money });
  const contRow = r;
  r++;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Total estimated cost' },
    {},
    {},
    {},
    { formula: `F${directRow}+F${taxRow}+F${contRow}`, numFmt: X.FMT.money },
    {},
  ]);
  const costRow = r;
  r++;
  ladderLabel(r, 'Overhead — % of cost (office, trucks, insurance, estimating) →');
  X.input(ws, r, 5, 0.1, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(ws, r, 6, `F${costRow}*E${r}`, { numFmt: X.FMT.money });
  const ohRow = r;
  r++;
  ladderLabel(r, 'Cost + overhead');
  X.calc(ws, r, 6, `F${costRow}+F${ohRow}`, { numFmt: X.FMT.money });
  const costOhRow = r;
  r++;
  ladderLabel(r, 'Profit — margin as % of PRICE (not markup on cost) →');
  X.input(ws, r, 5, 0.12, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(ws, r, 6, `IF(E${r}>=1,"",F${costOhRow}/(1-E${r})-F${costOhRow})`, {
    numFmt: X.FMT.money,
  });
  const profitRow = r;
  r++;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'ESTIMATE TOTAL' },
    {},
    {},
    {},
    { formula: `F${costOhRow}+N(F${profitRow})`, numFmt: X.FMT.money },
    {},
  ]);
  ws.getCell(r, 6).font = { name: X.FONT, size: 12, bold: true };
  const totalRow = r;
  r++;
  ladderLabel(
    r,
    'Equivalent markup on cost + overhead (what the same profit looks like as a markup)',
    {
      size: 9,
    }
  );
  X.calc(ws, r, 6, `IFERROR(N(F${profitRow})/F${costOhRow},0)`, { numFmt: X.FMT.pct });
  ws.getCell(r, 6).font = { name: X.FONT, size: 10, color: { argb: X.C.ink2 } };
  r++;
  ladderLabel(r, 'Gross margin check — profit ÷ price (should equal the margin you entered)', {
    size: 9,
  });
  X.calc(ws, r, 6, `IFERROR(N(F${profitRow})/F${totalRow},0)`, { numFmt: X.FMT.pct });
  ws.getCell(r, 6).font = { name: X.FONT, size: 10, color: { argb: X.C.ink2 } };
  r += 2;

  X.label(ws, r, 1, 'Basis of estimate, assumptions & exclusions — carry these onto the proposal');
  r++;
  ws.mergeCells(r, 1, r + 3, 7);
  X.input(ws, r, 1, null, { wrap: true });
  for (let i = 0; i < 4; i++) ws.getRow(r + i).height = 18;
  r += 5;
  X.noteRow(
    ws,
    r,
    'Margin is a share of the price; markup is a share of cost. A 15% markup is only a 13% margin. This sheet prices by margin: price = (cost + overhead) ÷ (1 − margin). See the Markup vs Margin sheet for the conversion table.',
    7,
    { height: 40 }
  );
  r += 2;
  X.brandFooter(
    ws,
    r,
    7,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Internal pricing worksheet; the customer-facing number goes on your quote or proposal. Not accounting or tax advice.'
  );
  ws.pageSetup.printArea = `A1:G${r}`;

  // ---- Sheet 2: Markup vs Margin ----
  const mm = X.sheet(wb, 'Markup vs Margin', { fitHeight: 1 });
  X.widths(mm, [46, 16, 4, 16, 18]);
  let m = X.titleBlock(mm, {
    title: 'Markup vs. Margin',
    subtitle: 'The pricing mistake that quietly eats profit — and the conversion table to fix it.',
    cols: 5,
  });
  const para = (txt, opts = {}) => {
    X.text(mm, m, 1, txt, { wrap: true, merge: 5, color: opts.color, bold: opts.bold, size: 9.5 });
    mm.getRow(m).height = Math.max(16, Math.ceil(txt.length / 95) * 14);
    m++;
  };
  para(
    'Markup is a percentage added to COST. Margin is a percentage of the PRICE. They describe the same dollars from opposite ends, and they are never the same number.'
  );
  para(
    'On $10,000 of cost, a 15% markup gives a $11,500 price — but $1,500 ÷ $11,500 is only a 13.0% margin. To keep 15% of the price you must mark cost up 17.6%. Contractors who price by markup routinely keep less than they think.'
  );
  para(
    'The Estimate sheet prices by margin: price = (cost + overhead) ÷ (1 − margin). Overhead is real cost (trucks, insurance, the office, estimating time) — price it before profit, never out of profit.',
    { color: X.C.ink2 }
  );
  m++;
  X.label(mm, m, 1, 'Try it — change the amber cells');
  m++;
  X.inputLegend(mm, m, 1);
  m++;
  X.kv(mm, m, 1, 'Job cost including overhead', 100000, { numFmt: X.FMT.money, align: 'right' });
  const costCell = `B${m}`;
  m++;
  X.headerRow(mm, m, ['If you…', 'Rate', '', 'Price', 'What you actually get'], {
    aligns: ['left', 'right', 'left', 'right', 'right'],
  });
  m++;
  X.text(mm, m, 1, 'Add a MARKUP to cost of', { size: 9.5 });
  X.input(mm, m, 2, 0.15, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(mm, m, 4, `${costCell}*(1+B${m})`, { numFmt: X.FMT.money });
  X.calc(mm, m, 5, `IFERROR(B${m}/(1+B${m}),0)`, { numFmt: X.FMT.pct });
  X.text(mm, m + 1, 5, '← margin you keep', { size: 8, color: X.C.ink3, align: 'right' });
  const mkRow = m;
  m += 2;
  X.text(mm, m, 1, 'Want a MARGIN on price of', { size: 9.5 });
  X.input(mm, m, 2, 0.15, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(mm, m, 4, `IF(B${m}>=1,"",${costCell}/(1-B${m}))`, { numFmt: X.FMT.money });
  X.calc(mm, m, 5, `IF(B${m}>=1,"",B${m}/(1-B${m}))`, { numFmt: X.FMT.pct });
  X.text(mm, m + 1, 5, '← markup you must apply', { size: 8, color: X.C.ink3, align: 'right' });
  const mgRow = m;
  m += 2;
  X.totalRow(mm, m, [
    { value: 'Profit left on the table by using the markup rate instead' },
    {},
    {},
    { formula: `IFERROR(D${mgRow}-D${mkRow},0)`, numFmt: X.FMT.money },
    {},
  ]);
  m += 2;

  X.label(mm, m, 1, 'Conversion table');
  m++;
  X.headerRow(
    mm,
    m,
    ['Markup on cost', 'Margin on price', '', 'Margin on price', 'Markup needed'],
    {
      aligns: ['right', 'right', 'left', 'right', 'right'],
    }
  );
  m++;
  const markups = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 1];
  const margins = [0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5];
  for (let i = 0; i < markups.length; i++) {
    X.bodyRow(mm, m, [
      { value: markups[i], numFmt: X.FMT.pct, align: 'right' },
      { formula: `A${m}/(1+A${m})`, numFmt: X.FMT.pct },
      { value: '' },
      { value: margins[i], numFmt: X.FMT.pct, align: 'right' },
      { formula: `D${m}/(1-D${m})`, numFmt: X.FMT.pct },
    ]);
    m++;
  }
  m++;
  para('Formulas: margin = markup ÷ (1 + markup). Markup = margin ÷ (1 − margin).', {
    color: X.C.ink2,
  });
  m++;
  const link = (row, text, url) => {
    const c = mm.getCell(row, 1);
    c.value = { text, hyperlink: url };
    c.font = { name: X.FONT, size: 9, color: { argb: X.C.accent }, underline: true };
  };
  link(
    m,
    'Full explanation with worked examples: buildworkpro.com/blog/construction-markup-vs-margin/',
    'https://buildworkpro.com/blog/construction-markup-vs-margin/'
  );
  m++;
  link(
    m,
    'Estimating software that applies margin and overhead as rates on every bid: buildworkpro.com/features/construction-bidding/',
    'https://buildworkpro.com/features/construction-bidding/'
  );
  m += 2;
  X.brandFooter(
    mm,
    m,
    5,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Free to use and share for your own business.'
  );

  X.howToSheet(wb, {
    title: 'Construction Estimate Template',
    steps: [
      'Fill in your company, the project, who the estimate is for and the bid documents you priced from (drawing set date and addenda). Amber cells are inputs.',
      'List materials with quantity, unit and delivered unit cost. Put HVAC equipment, fixtures and pipe here — anything you buy. Amounts compute per line.',
      'List labor by trade or crew: quantity is hours, unit cost is the fully loaded hourly rate (wage + payroll taxes + insurance + benefits), never the bare wage.',
      'Add equipment (crane days, lift rentals, tool rental) and subcontractor quotes as lump sums. Reference the quote date in the notes column.',
      'Set your rates in the ladder: sales tax on materials (leave 0% if tax is already in your unit costs), contingency, overhead, and profit as a MARGIN on price. The estimate total computes; the check rows show the equivalent markup and confirm the margin.',
      'Write the basis of estimate — what the price assumes and excludes — then carry the total and the assumptions onto your proposal or quote.',
    ],
    tips: [
      'Overhead is not profit. Trucks, insurance, the office and your estimating hours are costs; price them before profit or you are paying them out of profit.',
      'Price by margin, not markup. A 15% markup is a 13% margin. The Markup vs Margin sheet has the conversion table.',
      'Get every subcontractor quote in writing with a scope list, and level them before you pick one — the bid tabulation template does that.',
      'Won the job? The estimate becomes the cost budget for job costing, and the sections map onto your schedule of values for billing.',
    ],
    feature: {
      text: 'In BuildWorkPro every bid is built from line items typed as material, labor or other cost, priced from a reusable catalog, with margin, overhead and commission applied as rates on the Rates tab — then exported as a branded PDF proposal and converted into a project when you win.',
      url: 'https://buildworkpro.com/features/construction-bidding/',
    },
  });
  return wb;
}
