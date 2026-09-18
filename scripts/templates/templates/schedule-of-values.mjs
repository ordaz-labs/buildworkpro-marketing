// Schedule of values — the contract sum broken into billable line items.
// One-page portrait form (fillable PDF) and an Excel workbook whose SOV sheet
// ties out to the contract sum and whose Billing Tracker sheet carries the
// continuation-sheet math (previous / this period / stored / total / % /
// balance / retainage) for every line.
//
// Local helper: sovTable() — a table with pre-numbered rows, a change-order
// section and fillable subtotal/total rows, which H.table cannot interleave.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'schedule-of-values',
  name: 'Schedule of Values Template',
  basename: 'schedule-of-values-template',
  docName: 'Schedule of values',
};

const NOTES = {
  1: 'Submittals, bonds, temporary facilities',
  5: 'Equipment 72% · rigging & set 28%',
  6: 'By area: L1 40% · L2 35% · roof 25%',
  11: 'Billed on acceptance of the TAB report',
  12: 'O&M manuals, training, as-builts',
};

/** Change orders approved before the revision date (CO-003 is approved Sept 16). */
const APPROVED_COS = STORY.changeOrders.filter((co) => co.n !== 'CO-003');
const CO_NET = APPROVED_COS.reduce((s, co) => s + co.amount, 0);
const REVISED = STORY.contractSum + CO_NET;

const SAMPLE = {
  revision: 'Revision 2',
  date: 'September 3, 2026',
  reason: 'Adds CO-001 and CO-002 as lines; submitted with application no. 3',
  lines: STORY.sov.map((l) => ({ ...l, note: NOTES[l.n] ?? '' })),
  cos: APPROVED_COS.map((co) => ({
    n: co.n,
    desc: co.desc,
    value: co.amount,
    note: `Approved ${co.approved}`,
  })),
};

const CSS = `
.sigt{display:flex;flex-direction:column;margin-top:14px;border-top:1px solid var(--ink);padding-top:8px}
.sigt .title{font-size:9.5px;font-weight:600}
.sigt .copy{font-size:8.5px;color:var(--ink2);margin-top:2px}
.sigt .parties{display:flex;gap:24px;margin-top:8px}
.sigt .party{display:flex;flex-direction:column;flex:1;min-width:0}
.sigt .party .who{font-size:8.5px;font-weight:600}
.sigt .party .who span{color:var(--ink3);font-weight:400}
.sigrow{display:flex;gap:14px;margin-top:6px}
.sl{display:flex;flex-direction:column;flex:1;min-width:0}
.sl .sp{border-bottom:1px solid var(--ink);height:22px;font-size:8.5px;white-space:nowrap;display:flex;align-items:flex-end;padding-bottom:2px}
.sl .lab{font-size:6.5px;letter-spacing:.6px;text-transform:uppercase;color:var(--ink3);margin-top:2px}
table.sov td{height:18px;padding:2px 8px;font-size:9px}
table.sov th{padding:5px 8px}
table.sov td.n{font-family:"IBM Plex Mono";text-align:center;color:var(--ink2)}
table.sov td.num{font-family:"IBM Plex Mono";text-align:right;white-space:nowrap}
table.sov td.note{font-size:8px;color:var(--ink2)}
table.sov tr.sect td{padding:7px 8px 3px;border-bottom:1px solid var(--ink);font-size:7.5px;letter-spacing:.9px;text-transform:uppercase;font-weight:700;color:var(--ink);height:auto}
table.sov tr.sub td{font-size:8.5px;color:var(--ink2);border-bottom:none;padding-top:5px;padding-bottom:2px}
table.sov tr.sub td.num{color:var(--ink);font-weight:600}
table.sov tr.total td{border-top:1.5px solid var(--ink);border-bottom:none;font-weight:700;padding-top:7px;font-size:9.5px}
table.sov tr.foot td{border-bottom:none;padding-top:2px;font-size:7.5px;color:var(--ink3);font-style:italic}
`;

function sovTable({ sample, fillable }) {
  const s = sample ? SAMPLE : null;
  const total = s ? REVISED : null;
  const pctOf = (v) => (s && total ? H.pct((v / total) * 100, 2) : '');
  const f = (name) => (fillable ? ` data-field="${name}"` : '');
  const row = (n, desc, value, pct, note, fields) =>
    `<tr><td class="n"${fields ? f(`${fields}.n`) : ''}>${H.esc(n)}</td><td${fields ? f(`${fields}.desc`) : ''}>${H.esc(desc)}</td><td class="num"${fields ? f(`${fields}.value`) : ''}>${H.esc(value)}</td><td class="num"${fields ? f(`${fields}.pct`) : ''}>${H.esc(pct)}</td><td class="note"${fields ? f(`${fields}.note`) : ''}>${H.esc(note)}</td></tr>`;
  const head = `<thead><tr><th style="width:56px" class="center">Item no.</th><th>Description of work</th><th class="right" style="width:96px">Scheduled value</th><th class="right" style="width:76px">% of contract</th><th style="width:170px">Notes / basis</th></tr></thead>`;
  const lines = s
    ? s.lines.map((l) => row(l.n, l.desc, H.money(l.value), pctOf(l.value), l.note)).join('')
    : Array.from({ length: 22 }, (_, i) => row(String(i + 1), '', '', '', '', `sov.${i + 1}`)).join(
        ''
      );
  const coRows = s
    ? s.cos.map((c) => row(c.n, c.desc, H.money(c.value), pctOf(c.value), c.note)).join('')
    : [1, 2].map((i) => row('CO-', '', '', '', '', `co.${i}`)).join('');
  const sub = (label, value, pct, name) =>
    `<tr class="sub"><td></td><td>${H.esc(label)}</td><td class="num"${f(`${name}.value`)}>${H.esc(value)}</td><td class="num"${f(`${name}.pct`)}>${H.esc(pct)}</td><td></td></tr>`;
  const origSum = s ? s.lines.reduce((a, l) => a + l.value, 0) : 0;
  return `<table class="t sov" style="margin-top:12px">${head}<tbody>${lines}
<tr class="sect"><td colspan="5">Approved change orders — added as lines when approved</td></tr>${coRows}
${sub('Original schedule of values', s ? H.money(origSum) : '', s ? pctOf(origSum) : '', 'sub.sov')}
${sub('Net approved change orders', s ? H.money(CO_NET) : '', s ? pctOf(CO_NET) : '', 'sub.co')}
<tr class="total"><td></td><td>Total scheduled value — must equal the contract sum to date</td><td class="num"${f('total.value')}>${s ? H.esc(H.money(REVISED)) : ''}</td><td class="num"${f('total.pct')}>${s ? '100.00%' : ''}</td><td></td></tr>
<tr class="foot"><td></td><td colspan="4">Every line is a percentage of the contract sum to date; the percentages add to 100.00%. If the total and the contract sum differ, a line is missing or a change order was never added.</td></tr>
</tbody></table>`;
}

const sigLine = ({ label, name, value, width }) =>
  `<div class="sl"${width ? ` style="flex:none;width:${width}px"` : ''}><div class="sp" data-field="${name}">${value ? H.esc(value) : ''}</div><span class="lab">${H.esc(label)}</span></div>`;

/** Compact two-party signature block (title, one line of signature / name / date per party). */
function signatureRow(s) {
  const party = (who, sub, key, name, date) =>
    `<div class="party"><span class="who">${H.esc(who)} <span>· ${H.esc(sub)}</span></span><div class="sigrow">${sigLine({ label: 'Signature', name: `sig.${key}`, width: 104 })}${sigLine({ label: 'Printed name and title', name: `sig.${key}_name`, value: name })}${sigLine({ label: 'Date', name: `sig.${key}_date`, value: date, width: 58 })}</div></div>`;
  return `<div class="sigt"><span class="title">Submitted and accepted</span><span class="copy">The scheduled values above are the basis for progress billing on this contract until a revised schedule is accepted.</span><div class="parties">${party('Prepared by (contractor)', s ? SAMPLE_COMPANY.name : 'your company', 'contractor', s ? `${STORY.people.pm}, Project Manager` : '', s ? '09/03/2026' : '')}${party('Accepted by (owner / GC)', s ? SAMPLE_GC.name : 'authorized representative', 'owner', s ? `${STORY.people.gcPm}, Project Manager` : '', s ? '09/05/2026' : '')}</div></div>`;
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const fillable = !sample;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const body = `
${H.header({ company, title: 'Schedule of values', number: s ? s.revision : 'Revision ____', date: s ? s.date : undefined, fillable })}
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
    label: 'Submitted to (owner / general contractor)',
    lines: [
      { text: s ? SAMPLE_GC.name : '', strong: true, field: 'to.name' },
      { text: s ? SAMPLE_GC.line1 : '', field: 'to.line1' },
      { text: s ? SAMPLE_GC.line2 : '', field: 'to.line2' },
    ],
  },
  {
    label: 'Contract',
    kv: [
      { k: 'Contract date', v: s ? STORY.contractDate : '', field: 'contract.date' },
      {
        k: 'Original contract sum',
        v: s ? H.money(STORY.contractSum) : '',
        field: 'contract.original',
        mono: true,
      },
      {
        k: 'Net approved change orders',
        v: s ? H.money(CO_NET) : '',
        field: 'contract.changes',
        mono: true,
      },
      {
        k: 'Contract sum to date',
        v: s ? H.money(REVISED) : '',
        field: 'contract.revised',
        mono: true,
        strong: true,
      },
    ],
  },
])}
${H.fieldRow([
  H.field({ name: 'date', label: 'Date', value: s ? s.date : '', width: 130 }),
  H.field({
    name: 'reason',
    label: 'Revision / reason',
    hint: 'e.g. "Initial SOV with application no. 1" or "adds CO-004"',
    value: s ? s.reason : '',
    flex: 1,
  }),
])}
${sovTable({ sample, fillable })}
${signatureRow(s)}
${H.finePrint('Match the line items to how the work actually phases and keep every value defensible on a walkthrough. Add approved change orders as new lines with the CO number as the item number, so the schedule always ties to the contract sum your pay applications bill against. Not an AIA document.')}`;

  return {
    sections: [
      {
        html: H.document({
          title: meta.name,
          pages: [body],
          css: CSS,
          footer: H.footerText(`${meta.docName} · ${s ? s.revision : 'Revision ____'}`),
        }),
        mode: 'pages',
        landscape: false,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------
const ROWS = 30;

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });

  // ---- Sheet 1: Schedule of Values ----
  const ws = X.sheet(wb, 'Schedule of Values', { fitHeight: 1 });
  X.widths(ws, [13, 42, 17, 14, 30]);
  let r = X.titleBlock(ws, {
    title: 'Schedule of Values',
    subtitle:
      'Break the contract sum into the line items you will bill against every period. The tie-out row at the bottom must read 0.00.',
    cols: 5,
    right: 'Print: fits one page',
    rightFrom: 4,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.label(ws, r, 1, 'Project');
  X.label(ws, r, 3, 'Contract');
  r++;
  X.kv(ws, r, 1, 'Project name', null);
  X.kv(ws, r, 3, 'Contract date', null, { labelTo: 4, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Project no.', null);
  X.kv(ws, r, 3, 'Original contract sum', null, {
    labelTo: 4,
    numFmt: X.FMT.money,
    align: 'right',
  });
  const origRow = r;
  r++;
  X.kv(ws, r, 1, 'Site address', null);
  X.kv(ws, r, 3, 'Net approved change orders', null, {
    labelTo: 4,
    numFmt: X.FMT.money,
    align: 'right',
  });
  const coRow = r;
  r++;
  X.kv(ws, r, 1, 'Contractor', null);
  X.text(ws, r, 3, 'Contract sum to date', { size: 9, color: X.C.ink2, merge: 4 });
  X.calc(ws, r, 5, `E${origRow}+E${coRow}`, { numFmt: X.FMT.money, bold: true });
  const targetRow = r;
  const target = `$E$${targetRow}`;
  r++;
  X.kv(ws, r, 1, 'To (owner / GC)', null);
  X.kv(ws, r, 3, 'Revision / date', null, { labelTo: 4 });
  r += 2;

  X.headerRow(
    ws,
    r,
    ['Item no.', 'Description of work', 'Scheduled value', '% of contract', 'Notes / basis'],
    {
      aligns: ['center', 'left', 'right', 'right', 'left'],
    }
  );
  r++;
  const first = r;
  for (let i = 0; i < ROWS; i++) {
    X.bodyRow(ws, r, [
      { input: true, align: 'center' },
      { input: true, wrap: true },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR($C${r}="",${target}=0),"",C${r}/${target})`, numFmt: '0.00%;-0.00%;""' },
      { input: true, wrap: true },
    ]);
    r++;
  }
  const last = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Total scheduled value' },
    { formula: `SUM(C${first}:C${last})`, numFmt: X.FMT.money },
    { formula: `IF(${target}=0,"",C${r}/${target})`, numFmt: '0.00%;-0.00%;""' },
    {},
  ]);
  const totRow = r;
  r++;
  X.text(ws, r, 2, 'Tie-out: total scheduled value − contract sum to date (must be 0.00)', {
    size: 9,
    color: X.C.ink2,
    align: 'right',
  });
  X.calc(ws, r, 3, `C${totRow}-${target}`, { numFmt: X.FMT.money, bold: true });
  ws.addConditionalFormatting({
    ref: `C${r}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'notEqual',
        formulae: ['0'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE8E6' } },
          font: { color: { argb: X.C.deduct }, bold: true },
        },
        priority: 1,
      },
    ],
  });
  r += 2;
  X.noteRow(
    ws,
    r,
    'Add approved change orders as new lines with the CO number as the item number and update the net approved change orders cell above, so the schedule always ties to the contract sum your pay applications bill against.',
    5,
    { height: 34 }
  );
  r += 2;
  r = X.signatureBlock(ws, r, ['Prepared by (contractor)', 'Accepted by (owner / GC)'], {
    cols: [1, 4],
    width: 2,
  });
  X.brandFooter(
    ws,
    r,
    5,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Match the lines to how the work phases and keep every value defensible on a walkthrough. Not an AIA document.'
  );
  ws.pageSetup.printArea = `A1:E${r}`;

  // ---- Sheet 2: Billing Tracker ----
  const bt = X.sheet(wb, 'Billing Tracker', { landscape: true, fitHeight: 1 });
  X.widths(bt, [9, 40, 14, 14, 14, 14, 15, 9, 14, 13]);
  let b = X.titleBlock(bt, {
    title: 'Billing Tracker',
    subtitle:
      'The continuation-sheet math for every line. Item numbers, descriptions and scheduled values pull from the Schedule of Values sheet; enter previous, this period and stored per line.',
    cols: 10,
    right: 'Print: landscape, one page wide',
    rightFrom: 8,
  });
  X.inputLegend(bt, b, 1);
  X.kv(bt, b, 6, 'Application no.', null);
  X.kv(bt, b, 9, 'Period to', null, { numFmt: X.FMT.date });
  b++;
  X.kv(bt, b, 6, 'Retainage rate', 0.1, { numFmt: X.FMT.pct, align: 'right' });
  const rate = `$G$${b}`;
  X.text(bt, b, 9, 'Contract sum to date', { size: 9, color: X.C.ink2 });
  X.calc(bt, b, 10, `'Schedule of Values'!${target}`, { numFmt: X.FMT.money });
  b += 2;
  X.headerRow(
    bt,
    b,
    [
      'Item no.',
      'Description of work',
      'Scheduled value',
      'Previous applications',
      'This period',
      'Materials stored',
      'Total completed & stored to date',
      '% complete',
      'Balance to finish',
      'Retainage (rate × total)',
    ],
    {
      height: 40,
      aligns: [
        'center',
        'left',
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
  const hdrRow = b;
  b++;
  const bfirst = b;
  for (let i = 0; i < ROWS; i++) {
    const src = first + i;
    X.bodyRow(bt, b, [
      {
        formula: `IF('Schedule of Values'!A${src}="","",'Schedule of Values'!A${src})`,
        align: 'center',
        color: X.C.ink2,
      },
      {
        formula: `IF('Schedule of Values'!B${src}="","",'Schedule of Values'!B${src})`,
        wrap: true,
      },
      {
        formula: `IF('Schedule of Values'!C${src}="","",'Schedule of Values'!C${src})`,
        numFmt: X.FMT.moneyBlank,
      },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF($C${b}="","",D${b}+E${b}+F${b})`, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR($C${b}="",$C${b}=0),"",G${b}/C${b})`, numFmt: X.FMT.pctBlank },
      { formula: `IF($C${b}="","",C${b}-G${b})`, numFmt: X.FMT.moneyBlank },
      { formula: `IF($C${b}="","",ROUND(G${b}*${rate},2))`, numFmt: X.FMT.moneyBlank },
    ]);
    b++;
  }
  const blast = b - 1;
  X.totalRow(bt, b, [
    { value: '' },
    { value: 'Grand total' },
    { formula: `SUM(C${bfirst}:C${blast})`, numFmt: X.FMT.money },
    { formula: `SUM(D${bfirst}:D${blast})`, numFmt: X.FMT.money },
    { formula: `SUM(E${bfirst}:E${blast})`, numFmt: X.FMT.money },
    { formula: `SUM(F${bfirst}:F${blast})`, numFmt: X.FMT.money },
    { formula: `SUM(G${bfirst}:G${blast})`, numFmt: X.FMT.money },
    { formula: `IF(C${b}=0,"",G${b}/C${b})`, numFmt: X.FMT.pctBlank },
    { formula: `SUM(I${bfirst}:I${blast})`, numFmt: X.FMT.money },
    { formula: `SUM(J${bfirst}:J${blast})`, numFmt: X.FMT.money },
  ]);
  const btot = b;
  b += 2;
  X.label(bt, b, 7, 'This period at a glance');
  b++;
  const g0 = b;
  const glance = [
    ['Work completed and stored this period (E + F)', `E${btot}+F${btot}`],
    ['Less retainage on this period', `ROUND((E${btot}+F${btot})*${rate},2)`],
    ['Bill this period, net of retainage', `J${g0}-J${g0 + 1}`],
    ['Total earned less retainage to date (G − retainage)', `G${btot}-J${btot}`],
  ];
  glance.forEach(([k, formula], i) => {
    X.text(bt, b, 7, k, { size: 9, color: i === 2 ? X.C.ink : X.C.ink2, bold: i === 2, merge: 9 });
    X.calc(bt, b, 10, formula, { numFmt: X.FMT.money, bold: i === 2 });
    bt.getCell(b, 10).border = { bottom: { style: 'thin', color: { argb: X.C.rule } } };
    if (i === 2) bt.getCell(b, 10).border.top = { style: 'medium', color: { argb: X.C.ink } };
    b++;
  });
  b++;
  X.noteRow(
    bt,
    b,
    "Roll forward each period: once the application is approved, add This Period into Previous Applications as a value and clear This Period. Stored material that has since been installed leaves Materials Stored and is billed in This Period. The grand total row is what goes on the pay application's lines 4 and 5.",
    10,
    { height: 40 }
  );
  b += 2;
  X.brandFooter(
    bt,
    b,
    10,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Pair with the free pay application template for the application and certificate page.'
  );
  bt.views = [{ state: 'frozen', ySplit: hdrRow, showGridLines: false }];
  bt.pageSetup.printArea = `A1:J${b}`;
  bt.pageSetup.printTitlesRow = `${hdrRow}:${hdrRow}`;

  X.howToSheet(wb, {
    title: 'Schedule of Values Template',
    steps: [
      'Fill in the project header and enter the original contract sum and the net of approved change orders — the contract sum to date is the number every line is measured against.',
      'List one row per line item on the Schedule of Values sheet: item number, description, scheduled value. Match the lines to how the work phases (mobilization, underground, rough-in by system, equipment, finishes, closeout).',
      'Watch the % of contract column and the tie-out row. The total must equal the contract sum to date; the tie-out turns red until it does.',
      'When a change order is approved, add it as a new line with the CO number as the item number and update the net approved change orders cell. The schedule keeps tying out.',
      'Each billing period, open the Billing Tracker and enter previous applications, this period and materials stored per line. Total, % complete, balance to finish and retainage compute; the grand total is what goes on your pay application.',
    ],
    tips: [
      'Keep every value defensible: you should be able to walk the GC through the site and show why a line is 60% complete.',
      'Front-load carefully. Weighting mobilization and general conditions is common; an obviously inflated early line invites a rejected application.',
      'Split labor and material on big-ticket lines when the GC allows it — stored material can then be billed before it is installed.',
      'Do not make closeout lines too small to bother billing. That is how retainage release stalls.',
    ],
    feature: {
      text: 'In BuildWorkPro the schedule of values is seeded from your accepted bid and approved change orders, stays tied to the contract sum, and carries forward into every pay application automatically.',
      url: 'https://buildworkpro.com/features/pay-applications/',
    },
  });
  return wb;
}
