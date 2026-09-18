// Time & materials ticket — one-page field ticket (PDF fillable) and an Excel
// workbook that keeps the computed ST / OT / materials / equipment structure of
// the original template, restyled, plus a ticket log.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'tm-ticket',
  name: 'T&M Ticket Template',
  basename: 'tm-ticket-template',
  docName: 'T&M ticket',
};

const AUTH = ['Written directive', 'Verbal — confirmed by email', 'Verbal — not confirmed'];

// T&M-007 — Friday, September 11, 2026: duct drops relocated for an electrical revision.
const SAMPLE = {
  number: 'T&M-007',
  date: 'September 11, 2026',
  workDate: 'Fri, Sep 11, 2026',
  directedBy: `${STORY.people.gcSuper}, Superintendent`,
  location: 'Level 2, Suite 205',
  reference: 'E-201 Rev. 3 · Brightline email 9/11 8:02 AM',
  coRef: 'To be priced as CO-005',
  auth: 'Verbal — confirmed by email',
  description:
    'Relocate two 12×8 supply duct drops and diffusers in Suite 205 to clear the revised light fixture layout per E-201 Rev. 3. Drops were installed per M-201 before the electrical revision was issued — not in Summit scope. Directed on site by T. Okafor 7:15 AM; confirming email sent 8:02 AM.',
  labor: [
    { name: 'Sam Pruitt', trade: 'Sheet metal journeyman', st: 8, rate: 92, ot: 2, otRate: 138 },
    { name: 'Casey Nguyen', trade: 'Sheet metal apprentice', st: 8, rate: 58, ot: 2, otRate: 87 },
    {
      name: STORY.people.foreman,
      trade: 'Foreman — layout & supervision',
      st: 1,
      rate: 112,
      ot: 0,
      otRate: 168,
    },
  ],
  materials: [
    { desc: '12×8 rect. duct, 26 ga, 4 ft joints', qty: 3, unit: 'EA', cost: 64 },
    { desc: '8" insulated flex duct, 25 ft', qty: 1, unit: 'EA', cost: 48 },
    { desc: 'Hanger strap, screws, mastic, tape', qty: 1, unit: 'LS', cost: 36 },
  ],
  equipment: [{ desc: 'Scissor lift, 19 ft', qty: 1, unit: 'DAY', rate: 95 }],
  markupPct: 15,
  notes:
    'Existing drops removed and capped 7:30–9:00; new drops set per revised RCP, diffusers reinstalled, joints sealed. Work witnessed by T. Okafor. 6 photos: TM007-01 to -06.',
  photos: '6 · TM007-01 to -06',
};

function totals(s) {
  const labor = s.labor.reduce((t, l) => t + l.st * l.rate + l.ot * l.otRate, 0);
  const materials = s.materials.reduce((t, m) => t + m.qty * m.cost, 0);
  const equipment = s.equipment.reduce((t, e) => t + e.qty * e.rate, 0);
  const subtotal = labor + materials + equipment;
  const markup = subtotal * (s.markupPct / 100);
  return { labor, materials, equipment, subtotal, markup, total: subtotal + markup };
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const t = s ? totals(s) : null;

  const laborCols = [
    { key: 'name', label: 'Name', width: 96 },
    { key: 'trade', label: 'Labor — trade / classification' },
    { key: 'st', label: 'ST hrs', width: 44, align: 'right' },
    { key: 'rate', label: 'ST rate', width: 56, align: 'right' },
    { key: 'ot', label: 'OT hrs', width: 44, align: 'right' },
    { key: 'otRate', label: 'OT rate', width: 56, align: 'right' },
    { key: 'amount', label: 'Amount', width: 72, align: 'right' },
  ];
  const laborRows = s
    ? s.labor.map((l) => ({
        cells: {
          name: l.name,
          trade: l.trade,
          st: l.st.toFixed(1),
          rate: H.money(l.rate),
          ot: l.ot ? l.ot.toFixed(1) : '—',
          otRate: l.ot ? H.money(l.otRate) : '—',
          amount: H.money(l.st * l.rate + l.ot * l.otRate),
        },
      }))
    : [];
  const matCols = [
    { key: 'desc', label: 'Materials' },
    { key: 'qty', label: 'Qty', width: 44, align: 'right' },
    { key: 'unit', label: 'Unit', width: 44, align: 'center' },
    { key: 'cost', label: 'Unit cost', width: 60, align: 'right' },
    { key: 'amount', label: 'Amount', width: 72, align: 'right' },
  ];
  const matRows = s
    ? s.materials.map((m) => ({
        cells: {
          desc: m.desc,
          qty: String(m.qty),
          unit: m.unit,
          cost: H.money(m.cost),
          amount: H.money(m.qty * m.cost),
        },
      }))
    : [];
  const eqCols = [
    { key: 'desc', label: 'Equipment · rentals' },
    { key: 'qty', label: 'Hrs / days', width: 56, align: 'right' },
    { key: 'unit', label: 'Unit', width: 44, align: 'center' },
    { key: 'rate', label: 'Rate', width: 60, align: 'right' },
    { key: 'amount', label: 'Amount', width: 72, align: 'right' },
  ];
  const eqRows = s
    ? s.equipment.map((e) => ({
        cells: {
          desc: e.desc,
          qty: String(e.qty),
          unit: e.unit,
          rate: H.money(e.rate),
          amount: H.money(e.qty * e.rate),
        },
      }))
    : [];

  const body = `
${H.header({ company, title: 'T&M ticket', number: s ? s.number : 'T&M-____', date: s ? s.date : undefined, fillable: !sample })}
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
    label: 'To (general contractor / owner)',
    lines: [
      { text: s ? SAMPLE_GC.name : '', strong: true, field: 'to.name' },
      { text: s ? SAMPLE_GC.line1 : '', field: 'to.line1' },
      { text: s ? SAMPLE_GC.line2 : '', field: 'to.line2' },
    ],
  },
  {
    label: 'Ticket',
    kv: [
      { k: 'Date of work', v: s ? s.workDate : '', field: 'ticket.date' },
      { k: 'Directed by', v: s ? s.directedBy : '', field: 'ticket.directed_by' },
      { k: 'Location / area', v: s ? s.location : '', field: 'ticket.location' },
      { k: 'Reference', v: s ? s.reference : '', field: 'ticket.reference' },
      { k: 'Change order', v: s ? s.coRef : '', field: 'ticket.co_ref' },
    ],
  },
])}
${H.checkboxRow(
  'Authorization',
  AUTH.map((a) => ({
    name: `auth.${a.split(' ')[0].toLowerCase()}${a.includes('not') ? '_unconfirmed' : a.includes('confirmed') ? '_confirmed' : ''}`,
    label: a,
    checked: !!s && s.auth === a,
  }))
)}
${H.textarea({ name: 'description', label: 'Description of extra work', hint: 'what, where, why it is outside the contract scope, and who directed it', value: s ? s.description : '', height: 42 })}
${H.table({ columns: laborCols, rows: laborRows, blankRows: sample ? 0 : 4, fieldPrefix: 'labor', variant: 'compact', rowHeight: 19 })}
${H.table({ columns: matCols, rows: matRows, blankRows: sample ? 0 : 3, fieldPrefix: 'mat', variant: 'compact', rowHeight: 19 })}
${H.table({ columns: eqCols, rows: eqRows, blankRows: sample ? 0 : 2, fieldPrefix: 'equip', variant: 'compact', rowHeight: 20 })}
${H.split(
  `${H.textarea({ name: 'notes', label: 'Notes', hint: 'times, what was witnessed, conditions found', value: s ? s.notes : '', height: 42 })}
   <div class="row" style="gap:12px;margin-top:8px">
     ${H.field({ name: 'photos', label: 'Photos (count · refs)', value: s ? s.photos : '', flex: 1 })}
     ${H.field({ name: 'daily_report', label: 'Daily report no.', value: s ? 'DR-074' : '', width: 90 })}
   </div>`,
  H.totals([
    { label: 'Labor (ST + OT)', value: s ? H.money(t.labor) : '', field: 'tot.labor' },
    { label: 'Materials', value: s ? H.money(t.materials) : '', field: 'tot.materials' },
    { label: 'Equipment', value: s ? H.money(t.equipment) : '', field: 'tot.equipment' },
    { label: 'Subtotal', value: s ? H.money(t.subtotal) : '', field: 'tot.subtotal' },
    {
      label: `Overhead & profit (${s ? s.markupPct : '___'}%)`,
      value: s ? H.money(t.markup) : '',
      field: 'tot.markup',
    },
    { label: 'Ticket total', value: s ? H.money(t.total) : '', total: true, field: 'tot.total' },
  ]),
  [1.25, 1]
)}
${H.signatures({
  title: 'Acknowledgment — signed the same day',
  copy: "The GC representative's signature acknowledges that the hours, materials and equipment recorded above were expended on the described work. Adjustment to the contract sum and time follows by change order.",
  parties: [
    {
      name: 'Subcontractor',
      sub: s ? SAMPLE_COMPANY.name : 'foreman / lead',
      fields: [
        { label: 'Signature', name: 'sig.sub' },
        {
          label: 'Printed name and title',
          name: 'sig.sub_name',
          value: s ? `${STORY.people.foreman}, Foreman` : '',
        },
        { label: 'Date', name: 'sig.sub_date', value: s ? '09/11/2026' : '' },
      ],
    },
    {
      name: 'GC / owner representative',
      sub: s ? SAMPLE_GC.name : 'superintendent / PM',
      fields: [
        { label: 'Signature', name: 'sig.gc' },
        {
          label: 'Printed name and title',
          name: 'sig.gc_name',
          value: s ? `${STORY.people.gcSuper}, Superintendent` : '',
        },
        { label: 'Date', name: 'sig.gc_date', value: s ? '09/11/2026' : '' },
      ],
    },
  ],
})}
${H.finePrint('General-purpose form, not legal advice. A T&M ticket documents cost; it is not a change order until both parties sign one. Follow the notice, rate and markup provisions of your contract, and keep the signed ticket with the change order it supports.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    css: '.hdr-rule{margin:12px 0 12px}table.t{margin-top:8px}.textarea{margin-top:8px}.sig{margin-top:12px}.sig .copy{max-width:none}.sig .parties{margin-top:12px}.sig .party .who{margin-bottom:10px}.sig .line .sp{height:24px}.sig .under{margin-top:10px}',
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'T&M-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });

  // ---- Sheet 1: the ticket ----
  const ws = X.sheet(wb, 'T&M Ticket', { fitHeight: 1 });
  X.widths(ws, [22, 26, 9, 11, 13, 9, 14]);
  let r = X.titleBlock(ws, {
    title: 'Time & Materials Ticket',
    subtitle:
      'Record extra work the same day it happens. Hours × rate, overtime, qty × unit cost and the ticket total compute automatically.',
    cols: 7,
    right: 'Print: fits one page',
    rightFrom: 6,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.label(ws, r, 1, 'Your company');
  X.label(ws, r, 4, 'Ticket');
  r++;
  X.kv(ws, r, 1, 'Company');
  X.kv(ws, r, 4, 'Ticket no.', null, { labelTo: 5, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Address');
  X.kv(ws, r, 4, 'Date of work', null, { labelTo: 5, to: 7, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Phone / email');
  X.kv(ws, r, 4, 'Directed by', null, { labelTo: 5, to: 7 });
  r += 2;
  X.label(ws, r, 1, 'Project');
  X.label(ws, r, 4, 'Reference');
  r++;
  X.kv(ws, r, 1, 'Project name');
  X.kv(ws, r, 4, 'Location / area', null, { labelTo: 5, to: 7 });
  r++;
  X.kv(ws, r, 1, 'To (GC / owner)');
  X.kv(ws, r, 4, 'Directive / RFI / drawing', null, { labelTo: 5, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Authorization');
  X.dropdown(ws, `B${r}`, AUTH);
  X.kv(ws, r, 4, 'Change order ref.', null, { labelTo: 5, to: 7 });
  r += 2;
  X.label(
    ws,
    r,
    1,
    'Description of extra work — what, where, why it is outside scope, and who directed it'
  );
  r++;
  ws.mergeCells(r, 1, r + 2, 7);
  X.input(ws, r, 1, null, { wrap: true });
  for (let i = 0; i < 3; i++) ws.getRow(r + i).height = 18;
  r += 4;

  // Settings: OT multiplier
  X.text(ws, r, 5, 'Overtime multiplier →', { align: 'right', color: X.C.ink2, size: 9 });
  ws.mergeCells(r, 5, r, 6);
  X.input(ws, r, 7, 1.5, { numFmt: '0.0"×"', align: 'right' });
  const otMult = `$G$${r}`;
  r++;

  // Labor
  X.headerRow(
    ws,
    r,
    ['Name', 'Trade / classification', 'ST hours', 'Rate', 'ST amount', 'OT hours', 'OT amount'],
    {
      aligns: ['left', 'left', 'right', 'right', 'right', 'right', 'right'],
    }
  );
  r++;
  const lFirst = r;
  for (let i = 0; i < 6; i++) {
    X.bodyRow(ws, r, [
      { input: true },
      { input: true },
      { input: true, numFmt: '0.00;-0.00;""', align: 'right' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR(C${r}="",D${r}=""),"",C${r}*D${r})`, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: '0.00;-0.00;""', align: 'right' },
      { formula: `IF(OR(F${r}="",D${r}=""),"",F${r}*D${r}*${otMult})`, numFmt: X.FMT.moneyBlank },
    ]);
    r++;
  }
  const lLast = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Labor subtotal (ST + OT)' },
    { formula: `SUM(C${lFirst}:C${lLast})`, numFmt: '0.00' },
    {},
    { formula: `SUM(E${lFirst}:E${lLast})`, numFmt: X.FMT.money },
    { formula: `SUM(F${lFirst}:F${lLast})`, numFmt: '0.00' },
    { formula: `SUM(G${lFirst}:G${lLast})`, numFmt: X.FMT.money },
  ]);
  const laborRow = r;
  r += 2;

  // Materials
  X.headerRow(ws, r, ['Materials', '', '', 'Qty', 'Unit', 'Unit cost', 'Amount'], {
    aligns: ['left', 'left', 'left', 'right', 'center', 'right', 'right'],
  });
  ws.mergeCells(r, 1, r, 3);
  r++;
  const mFirst = r;
  for (let i = 0; i < 5; i++) {
    ws.mergeCells(r, 1, r, 3);
    X.bodyRow(ws, r, [
      { input: true, wrap: true },
      { input: true },
      { input: true },
      { input: true, numFmt: '0.##;-0.##;""', align: 'right' },
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR(D${r}="",F${r}=""),"",D${r}*F${r})`, numFmt: X.FMT.moneyBlank },
    ]);
    r++;
  }
  const mLast = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Materials subtotal' },
    {},
    {},
    {},
    {},
    { formula: `SUM(G${mFirst}:G${mLast})`, numFmt: X.FMT.money },
  ]);
  const matRow = r;
  r += 2;

  // Equipment
  X.headerRow(ws, r, ['Equipment · rentals', '', '', 'Hrs / days', 'Unit', 'Rate', 'Amount'], {
    aligns: ['left', 'left', 'left', 'right', 'center', 'right', 'right'],
  });
  ws.mergeCells(r, 1, r, 3);
  r++;
  const eFirst = r;
  for (let i = 0; i < 3; i++) {
    ws.mergeCells(r, 1, r, 3);
    X.bodyRow(ws, r, [
      { input: true, wrap: true },
      { input: true },
      { input: true },
      { input: true, numFmt: '0.##;-0.##;""', align: 'right' },
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR(D${r}="",F${r}=""),"",D${r}*F${r})`, numFmt: X.FMT.moneyBlank },
    ]);
    r++;
  }
  const eLast = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Equipment subtotal' },
    {},
    {},
    {},
    {},
    { formula: `SUM(G${eFirst}:G${eLast})`, numFmt: X.FMT.money },
  ]);
  const eqRow = r;
  r += 2;

  // Totals
  X.text(ws, r, 5, 'Subtotal (labor + OT + materials + equipment)', {
    align: 'right',
    color: X.C.ink2,
    size: 9.5,
  });
  X.calc(ws, r, 7, `E${laborRow}+G${laborRow}+G${matRow}+G${eqRow}`, { numFmt: X.FMT.money });
  const subRow = r;
  r++;
  X.text(ws, r, 5, 'Overhead & profit — enter rate →', {
    align: 'right',
    color: X.C.ink2,
    size: 9,
  });
  X.input(ws, r, 6, 0.15, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(ws, r, 7, `G${subRow}*F${r}`, { numFmt: X.FMT.money });
  const mkRow = r;
  r++;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'TICKET TOTAL' },
    {},
    {},
    {},
    {},
    { formula: `G${subRow}+G${mkRow}`, numFmt: X.FMT.money, bold: true },
  ]);
  r += 2;
  X.label(ws, r, 1, 'Notes — times, what was witnessed, conditions found, photo references');
  r++;
  ws.mergeCells(r, 1, r + 1, 7);
  X.input(ws, r, 1, null, { wrap: true });
  ws.getRow(r).height = 18;
  ws.getRow(r + 1).height = 18;
  r += 3;
  X.noteRow(
    ws,
    r,
    "Signed the same day. The GC representative's signature acknowledges the hours, materials and equipment recorded were expended on the described work; adjustment to the contract sum and time follows by change order.",
    7,
    { height: 34 }
  );
  r += 2;
  r = X.signatureBlock(ws, r, ['Subcontractor (foreman / lead)', 'GC / owner representative'], {
    cols: [1, 5],
    width: 2,
  });
  r++;
  X.brandFooter(
    ws,
    r,
    7,
    'Free template by BuildWorkPro — buildworkpro.com/templates. A T&M ticket documents cost; it is not a change order until both parties sign one. Rates and markup follow your contract.'
  );
  ws.pageSetup.printArea = `A1:G${r}`;

  // ---- Sheet 2: ticket log ----
  const log = X.sheet(wb, 'T&M Log', { landscape: true, fitHeight: 0, printTitles: '1:6' });
  X.widths(log, [10, 12, 40, 20, 11, 11, 14, 14, 16]);
  let lr = X.titleBlock(log, {
    title: 'T&M Ticket Log',
    subtitle:
      'One row per ticket. Status shows which tickets are still waiting on a change order — the ones that are not yet money.',
    cols: 9,
  });
  X.inputLegend(log, lr, 1);
  lr++;
  X.text(log, lr, 4, 'Awaiting change order', { color: X.C.ink2, size: 9, align: 'right' });
  const pendingCell = `E${lr}`;
  X.text(log, lr, 6, 'Value awaiting CO', { color: X.C.ink2, size: 9, align: 'right' });
  const pendingValCell = `G${lr}`;
  X.text(log, lr, 8, 'In signed COs', { color: X.C.ink2, size: 9, align: 'right' });
  const inCoCell = `I${lr}`;
  lr++;
  X.headerRow(
    log,
    lr,
    [
      'Ticket #',
      'Date of work',
      'Extra work',
      'Directed by',
      'Labor hrs',
      'Signed?',
      'Ticket total',
      'CO ref.',
      'Status',
    ],
    {
      aligns: ['center', 'center', 'left', 'left', 'right', 'center', 'right', 'center', 'center'],
    }
  );
  lr++;
  const first = lr;
  for (let i = 0; i < 30; i++) {
    X.bodyRow(log, lr, [
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, wrap: true },
      { input: true },
      { input: true, numFmt: '0.00;-0.00;""', align: 'right' },
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, align: 'center' },
      { input: true, align: 'center' },
    ]);
    lr++;
  }
  const last = lr - 1;
  X.dropdown(log, `F${first}:F${last}`, ['Yes', 'No — refused', 'No — not yet']);
  X.dropdown(log, `I${first}:I${last}`, [
    'Awaiting CO',
    'In CO — pending',
    'In CO — approved',
    'Billed',
    'Disputed',
    'Void',
  ]);
  X.statusColors(log, `I${first}:I${last}`, {
    approved: 'FFE6F4EA',
    Billed: 'FFE6F4EA',
    Awaiting: 'FFFFF7E6',
    Disputed: 'FFFDE8E6',
  });
  X.statusColors(log, `F${first}:F${last}`, {
    'No — refused': 'FFFDE8E6',
    'No — not yet': 'FFFFF7E6',
  });
  X.totalRow(log, lr, [
    { value: '' },
    { value: 'Totals' },
    { formula: `COUNTA(A${first}:A${last})&" tickets"`, align: 'left' },
    {},
    { formula: `SUM(E${first}:E${last})`, numFmt: '0.00' },
    {},
    { formula: `SUM(G${first}:G${last})`, numFmt: X.FMT.money },
    {},
    {},
  ]);
  const setCalc = (ref, formula, numFmt) => {
    const c = log.getCell(ref);
    c.value = { formula };
    c.numFmt = numFmt;
    c.font = { name: X.FONT, size: 10, bold: true };
    c.alignment = { horizontal: 'right' };
  };
  setCalc(pendingCell, `COUNTIF(I${first}:I${last},"Awaiting CO")`, '0');
  setCalc(
    pendingValCell,
    `SUMIFS(G${first}:G${last},I${first}:I${last},"Awaiting CO")`,
    X.FMT.money
  );
  setCalc(
    inCoCell,
    `SUMIFS(G${first}:G${last},I${first}:I${last},"In CO — approved")+SUMIFS(G${first}:G${last},I${first}:I${last},"Billed")`,
    X.FMT.money
  );
  log.views = [{ state: 'frozen', ySplit: first - 1, showGridLines: false }];
  lr += 2;
  X.brandFooter(
    log,
    lr,
    9,
    'Free template by BuildWorkPro — buildworkpro.com/templates. A ticket marked Awaiting CO is documented cost that has not become contract value yet. Chase those first.'
  );

  X.howToSheet(wb, {
    title: 'T&M Ticket Template',
    steps: [
      'On the T&M Ticket sheet, fill your company, the project, who the ticket goes to, the date of the work and who directed it. Amber cells are inputs.',
      'Pick the authorization type — written directive, verbal confirmed by email, or verbal not confirmed — and reference the directive, RFI or drawing revision. Describe the extra work and why it is outside the contract scope.',
      'Enter labor by name and classification: straight-time hours and rate, and any overtime hours. ST amount, OT amount (at the overtime multiplier, default 1.5×) and the labor subtotal calculate.',
      'Enter materials (qty × unit cost) and equipment or rentals (hours or days × rate). Section subtotals, the ticket subtotal, overhead & profit at your rate and the ticket total calculate.',
      'Add notes — times, what the GC witnessed, photo references — then print (fits one page) and get the GC superintendent to sign the same day.',
      'Log every ticket on the T&M Log sheet with its status. The counts at the top show how many tickets and how much value are still waiting on a change order.',
    ],
    tips: [
      'A signed ticket is proof of cost, not a change order. Roll it into a change order that week so the amount reaches the contract sum and the next pay application.',
      'If the super will not sign, write "directed, not signed" in the notes, send a confirming email the same day and note it in your daily report. A refused signature is still a record.',
      'Use the rates in your subcontract. If there are none, agree rates in writing before the extra work starts — not after.',
    ],
    feature: {
      text: 'In BuildWorkPro, crew hours are logged against the project in quarter-hour steps with per-person labor rates, so the cost of directed work is on the record the day it happens — and a change order the customer e-signs carries it into the contract value and the next pay application.',
      url: 'https://buildworkpro.com/features/time-tracking/',
    },
  });
  return wb;
}
