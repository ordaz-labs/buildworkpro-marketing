// Work order — one-page form (PDF fillable), Word, and an Excel workbook with a
// computed work order plus a work order log.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'work-order',
  name: 'Work Order Template',
  basename: 'work-order-template',
  docName: 'Work order',
};

const PRIORITIES = ['Routine', 'Urgent', 'Emergency'];
const BILLING = ['Contract extra (change order)', 'T&M', 'Service call', 'Warranty — no charge'];

// WO-0187 — temporary cooling for the owner's early IT install, directed by the GC.
const SAMPLE = {
  number: 'WO-0187',
  date: 'September 9, 2026',
  requestedBy: `${STORY.people.gcPm}, Brightline`,
  reference: 'Brightline field directive FD-07 · email 9/8/2026',
  priority: 'Urgent',
  billing: 'Contract extra (change order)',
  dueBy: 'September 11, 2026',
  assignedTo: 'Sam Pruitt (lead) · Andre Kim',
  site: {
    name: SAMPLE_PROJECT.name,
    line1: SAMPLE_PROJECT.address,
    line2: 'Level 1, Server Room 118 · contact: Tom Okafor, Super · (303) 555-0192',
  },
  description:
    'Provide temporary conditioned air to Level 1 Server Room 118 for the owner\'s early network-equipment install (before permanent RTU-1 startup). Set one 5-ton portable spot cooler, run 8" flex exhaust to the ceiling plenum above corridor 1B, connect condensate pump to floor sink FS-1, and verify 68°F supply. Remove after RTU-1 startup (est. Oct 15).',
  labor: [
    {
      tech: 'Sam Pruitt',
      date: '9/10',
      desc: 'Sheet metal journeyman — set unit, duct exhaust',
      hours: 6,
      rate: 92,
    },
    {
      tech: 'Andre Kim',
      date: '9/10',
      desc: 'Apprentice — condensate pump, tie-in, testing',
      hours: 6,
      rate: 58,
    },
  ],
  materials: [
    { desc: '8" insulated flex duct, 25 ft', qty: 2, unit: 'EA', cost: 48 },
    { desc: 'Condensate pump, 1/30 hp, with 20 ft tubing', qty: 1, unit: 'EA', cost: 135 },
    { desc: 'Duct tape, clamps, hanger strap', qty: 1, unit: 'LS', cost: 42 },
  ],
  equipment: [
    { desc: 'Portable spot cooler, 5-ton — monthly rental', qty: 1, unit: 'MO', rate: 795 },
  ],
  markupPct: 15,
  taxPct: 8.81,
  completion:
    'Completed 9/10. Spot cooler set in Room 118, exhaust ducted to plenum above corridor 1B, condensate pump to FS-1, unit tested at 68°F supply with owner IT lead present. Rental starts 9/10; remove after RTU-1 startup. To be billed as CO-004 on the next pay application.',
  completedDate: '09/10/2026',
  tech: 'Sam Pruitt, Sheet Metal Journeyman',
  customer: `${STORY.people.gcPm}, Project Manager`,
};

function totals(s) {
  const labor = s.labor.reduce((t, l) => t + l.hours * l.rate, 0);
  const materials = s.materials.reduce((t, m) => t + m.qty * m.cost, 0);
  const equipment = s.equipment.reduce((t, e) => t + e.qty * e.rate, 0);
  const subtotal = labor + materials + equipment;
  const markup = subtotal * (s.markupPct / 100);
  const tax = materials * (s.taxPct / 100);
  return { labor, materials, equipment, subtotal, markup, tax, total: subtotal + markup + tax };
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const t = s ? totals(s) : null;

  const laborCols = [
    { key: 'tech', label: 'Technician', width: 96 },
    { key: 'date', label: 'Date', width: 44, align: 'center' },
    { key: 'desc', label: 'Labor — classification · work done' },
    { key: 'hours', label: 'Hours', width: 44, align: 'right' },
    { key: 'rate', label: 'Rate', width: 60, align: 'right' },
    { key: 'amount', label: 'Amount', width: 74, align: 'right' },
  ];
  const laborRows = s
    ? s.labor.map((l) => ({
        cells: {
          tech: l.tech,
          date: l.date,
          desc: l.desc,
          hours: l.hours.toFixed(1),
          rate: H.money(l.rate),
          amount: H.money(l.hours * l.rate),
        },
      }))
    : [];
  const matCols = [
    { key: 'desc', label: 'Materials & parts' },
    { key: 'qty', label: 'Qty', width: 44, align: 'right' },
    { key: 'unit', label: 'Unit', width: 40, align: 'center' },
    { key: 'cost', label: 'Unit cost', width: 60, align: 'right' },
    { key: 'amount', label: 'Amount', width: 74, align: 'right' },
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
    { key: 'desc', label: 'Equipment / rentals / subcontract' },
    { key: 'qty', label: 'Qty', width: 44, align: 'right' },
    { key: 'unit', label: 'Unit', width: 40, align: 'center' },
    { key: 'rate', label: 'Rate', width: 60, align: 'right' },
    { key: 'amount', label: 'Amount', width: 74, align: 'right' },
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
${H.header({ company, title: 'Work order', number: s ? s.number : 'WO-____', date: s ? s.date : undefined, fillable: !sample })}
${H.metaRow([
  {
    label: 'Customer / bill to',
    lines: [
      { text: s ? SAMPLE_GC.name : '', strong: true, field: 'customer.name' },
      { text: s ? SAMPLE_GC.line1 : '', field: 'customer.line1' },
      { text: s ? SAMPLE_GC.line2 : '', field: 'customer.line2' },
    ],
  },
  {
    label: 'Job site / location',
    lines: [
      { text: s ? s.site.name : '', strong: true, field: 'site.name' },
      { text: s ? s.site.line1 : '', field: 'site.line1' },
      { text: s ? s.site.line2 : '', field: 'site.line2' },
    ],
  },
  {
    label: 'Work order',
    kv: [
      { k: 'Date issued', v: s ? s.date : '', field: 'wo.date' },
      { k: 'Requested by', v: s ? s.requestedBy : '', field: 'wo.requested_by' },
      { k: 'Due by', v: s ? s.dueBy : '', field: 'wo.due' },
      { k: 'Assigned to', v: s ? s.assignedTo : '', field: 'wo.assigned' },
      { k: 'PO / reference', v: s ? 'FD-07' : '', field: 'wo.reference', mono: true },
    ],
  },
])}
<div class="row" style="gap:20px;margin-top:8px;align-items:flex-start">
  <div class="col" style="flex:1">${H.checkboxRow(
    'Priority',
    PRIORITIES.map((p) => ({
      name: `priority.${p.toLowerCase()}`,
      label: p,
      checked: !!s && s.priority === p,
    }))
  )}</div>
  <div class="col" style="flex:2.2">${H.checkboxRow(
    'Bill as',
    BILLING.map((b) => ({
      name: `billing.${b
        .split(' ')[0]
        .toLowerCase()
        .replace(/[^a-z&]/g, '')}`,
      label: b,
      checked: !!s && s.billing === b,
    }))
  )}</div>
</div>
${H.textarea({ name: 'description', label: 'Description of work requested', hint: 'what, where, why — and the directive, email or call that authorized it', value: s ? s.description : '', height: 46 })}
${H.table({ columns: laborCols, rows: laborRows, blankRows: sample ? 0 : 3, fieldPrefix: 'labor', variant: 'compact', rowHeight: 20 })}
${H.table({ columns: matCols, rows: matRows, blankRows: sample ? 0 : 4, fieldPrefix: 'mat', variant: 'compact', rowHeight: 20 })}
${H.table({ columns: eqCols, rows: eqRows, blankRows: sample ? 0 : 2, fieldPrefix: 'equip', variant: 'compact', rowHeight: 20 })}
${H.split(
  `${H.textarea({ name: 'completion', label: 'Completion notes', hint: 'what was done, tested how, anything left open, follow-up', value: s ? s.completion : '', height: 50 })}
   <div class="row" style="gap:12px;margin-top:8px">
     ${H.field({ name: 'completed_date', label: 'Date completed', value: s ? s.completedDate : '', width: 90 })}
     ${H.field({ name: 'status', label: 'Status', hint: 'open · in progress · complete · billed', value: s ? 'Complete — bill as CO-004' : '', flex: 1 })}
   </div>`,
  H.totals([
    { label: 'Labor', value: s ? H.money(t.labor) : '', field: 'tot.labor' },
    { label: 'Materials & parts', value: s ? H.money(t.materials) : '', field: 'tot.materials' },
    { label: 'Equipment / rentals', value: s ? H.money(t.equipment) : '', field: 'tot.equipment' },
    { label: 'Subtotal', value: s ? H.money(t.subtotal) : '', field: 'tot.subtotal' },
    {
      label: `Overhead & profit (${s ? s.markupPct : '___'}%)`,
      value: s ? H.money(t.markup) : '',
      field: 'tot.markup',
    },
    {
      label: `Sales tax on materials (${s ? s.taxPct : '___'}%)`,
      value: s ? H.money(t.tax) : '',
      field: 'tot.tax',
    },
    {
      label: 'Work order total',
      value: s ? H.money(t.total) : '',
      total: true,
      field: 'tot.total',
    },
  ]),
  [1.25, 1]
)}
${H.signatures({
  title: 'Sign-off',
  copy: 'The technician certifies the work above was performed as described. The customer or GC representative accepts the work as complete and authorizes billing on the terms indicated.',
  parties: [
    {
      name: 'Work performed by',
      sub: s ? SAMPLE_COMPANY.name : 'your company',
      fields: [
        { label: 'Signature', name: 'sig.tech' },
        { label: 'Printed name and title', name: 'sig.tech_name', value: s ? s.tech : '' },
        { label: 'Date', name: 'sig.tech_date', value: s ? s.completedDate : '' },
      ],
    },
    {
      name: 'Accepted by',
      sub: s ? SAMPLE_GC.name : 'customer / GC representative',
      fields: [
        { label: 'Signature', name: 'sig.customer' },
        { label: 'Printed name and title', name: 'sig.customer_name', value: s ? s.customer : '' },
        { label: 'Date', name: 'sig.customer_date', value: s ? s.completedDate : '' },
      ],
    },
  ],
})}
${H.finePrint('General-purpose form, not legal advice. A work order authorizes and records a job; on a contract project, work outside the original scope still needs a signed change order before it is billable — attach this work order as backup. Rates and markup follow your contract or rate sheet.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    css: '.hdr-rule{margin:12px 0 12px}table.t{margin-top:8px}.textarea{margin-top:8px}.sig{margin-top:12px}.sig .copy{max-width:none}.sig .parties{margin-top:12px}.sig .party .who{margin-bottom:10px}.sig .line .sp{height:24px}.sig .under{margin-top:10px}',
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'WO-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const children = [
    ...D.companyHeader({
      title: 'Work Order',
      number: 'WO No. ________',
      date: 'Date ____________',
    }),
    D.metaRow([
      {
        label: 'Customer / bill to',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Job site / location',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
    ]),
    D.spacer(4),
    D.fieldGrid([
      [
        { label: 'Requested by', width: Math.round(W * 0.34) },
        { label: 'PO / reference', width: Math.round(W * 0.22) },
        { label: 'Due by', width: Math.round(W * 0.2) },
        {
          label: 'Assigned to',
          width: W - Math.round(W * 0.34) - Math.round(W * 0.22) - Math.round(W * 0.2),
        },
      ],
    ]),
    D.label('Priority'),
    D.p(
      [
        ...PRIORITIES.flatMap((r, i) => [
          D.checkbox(r),
          D.run(i < PRIORITIES.length - 1 ? '     ' : ''),
        ]),
      ],
      { after: 80 }
    ),
    D.label('Bill as'),
    D.p(
      [...BILLING.flatMap((r, i) => [D.checkbox(r), D.run(i < BILLING.length - 1 ? '     ' : '')])],
      { after: 120 }
    ),
    ...D.textBox('Description of work requested', {
      lines: 4,
      hint: 'What, where, why — and the directive, email or call that authorized it.',
    }),
    D.heading('Labor', 'technician · classification · hours × rate'),
    D.table({
      columns: [
        { label: 'Technician / crew', width: 2200 },
        { label: 'Date', width: 900, align: 'center' },
        { label: 'Classification · work done', width: 3500 },
        { label: 'Hours', width: 900, align: 'right' },
        { label: 'Rate', width: 1100, align: 'right' },
        { label: 'Amount', width: W - 2200 - 900 - 3500 - 900 - 1100, align: 'right' },
      ],
      blankRows: 4,
      blankHeight: 280,
    }),
    D.heading('Materials & parts', 'qty × unit cost'),
    D.table({
      columns: [
        { label: 'Description', width: 5400 },
        { label: 'Qty', width: 900, align: 'right' },
        { label: 'Unit', width: 900, align: 'center' },
        { label: 'Unit cost', width: 1300, align: 'right' },
        { label: 'Amount', width: W - 5400 - 900 - 900 - 1300, align: 'right' },
      ],
      blankRows: 4,
      blankHeight: 280,
    }),
    D.heading('Equipment, rentals & subcontract', 'qty × rate'),
    D.table({
      columns: [
        { label: 'Description', width: 5400 },
        { label: 'Qty', width: 900, align: 'right' },
        { label: 'Unit', width: 900, align: 'center' },
        { label: 'Rate', width: 1300, align: 'right' },
        { label: 'Amount', width: W - 5400 - 900 - 900 - 1300, align: 'right' },
      ],
      blankRows: 2,
      blankHeight: 280,
    }),
    D.spacer(2),
    D.ladder(
      [
        { k: 'Labor', v: '$', input: true },
        { k: 'Materials & parts', v: '$', input: true },
        { k: 'Equipment / rentals', v: '$', input: true },
        { k: 'Subtotal', v: '$', input: true },
        { k: 'Overhead and profit (____ %)', v: '$', input: true },
        { k: 'Sales tax on materials (____ %)', v: '$', input: true },
        { k: 'Work order total', v: '$', total: true, input: true },
      ],
      { kWidth: 7400 }
    ),
    ...D.textBox('Completion notes', {
      lines: 3,
      hint: 'What was done, how it was tested, anything left open, follow-up needed. Date completed: ____________   Status: ☐ open  ☐ in progress  ☐ complete  ☐ billed',
    }),
    ...D.signatures({
      title: 'Sign-off',
      copy: 'The technician certifies the work above was performed as described. The customer or GC representative accepts the work as complete and authorizes billing on the terms indicated.',
      parties: [
        { name: 'Work performed by', sub: 'your company' },
        { name: 'Accepted by', sub: 'customer / GC representative' },
      ],
    }),
    D.fine(
      'General-purpose form, not legal advice. A work order authorizes and records a job; on a contract project, work outside the original scope still needs a signed change order before it is billable — attach this work order as backup. Rates and markup follow your contract or rate sheet.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Work order' });
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });

  // ---- Sheet 1: the work order ----
  const ws = X.sheet(wb, 'Work Order', { fitHeight: 1 });
  X.widths(ws, [20, 30, 8, 8, 14, 16]);
  let r = X.titleBlock(ws, {
    title: 'Work Order',
    subtitle:
      'Authorize the job, record labor, materials and equipment, and get the sign-off. Every amount calculates.',
    cols: 6,
    right: 'Print: fits one page',
    rightFrom: 5,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.label(ws, r, 1, 'Your company');
  X.label(ws, r, 4, 'Work order');
  r++;
  X.kv(ws, r, 1, 'Company');
  X.kv(ws, r, 4, 'WO number', null, { labelTo: 5 });
  r++;
  X.kv(ws, r, 1, 'Address');
  X.kv(ws, r, 4, 'Date issued', null, { labelTo: 5, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Phone / email');
  X.kv(ws, r, 4, 'Due by', null, { labelTo: 5, numFmt: X.FMT.date });
  r += 2;
  X.label(ws, r, 1, 'Customer / bill to');
  X.label(ws, r, 4, 'Job site / request');
  r++;
  X.kv(ws, r, 1, 'Customer');
  X.kv(ws, r, 4, 'Site / location', null, { labelTo: 5 });
  r++;
  X.kv(ws, r, 1, 'Contact');
  X.kv(ws, r, 4, 'Requested by', null, { labelTo: 5 });
  r++;
  X.kv(ws, r, 1, 'Phone / email');
  X.kv(ws, r, 4, 'PO / reference', null, { labelTo: 5 });
  r++;
  X.kv(ws, r, 1, 'Priority');
  X.dropdown(ws, `B${r}`, PRIORITIES);
  X.statusColors(ws, `B${r}`, { Emergency: 'FFFDE8E6', Urgent: 'FFFFF7E6' });
  X.kv(ws, r, 4, 'Bill as', null, { labelTo: 5 });
  X.dropdown(ws, `F${r}`, BILLING);
  r++;
  X.kv(ws, r, 1, 'Assigned to');
  X.kv(ws, r, 4, 'Status', 'Open', { labelTo: 5 });
  X.dropdown(ws, `F${r}`, ['Open', 'In progress', 'Complete', 'Billed', 'Cancelled']);
  r += 2;
  X.label(
    ws,
    r,
    1,
    'Description of work requested — what, where, why, and the directive / email / call that authorized it'
  );
  r++;
  ws.mergeCells(r, 1, r + 2, 6);
  X.input(ws, r, 1, null, { wrap: true });
  for (let i = 0; i < 3; i++) ws.getRow(r + i).height = 18;
  r += 4;

  // Labor
  X.headerRow(
    ws,
    r,
    ['Technician / crew', 'Classification · work done', 'Date', 'Hours', 'Rate', 'Amount'],
    {
      aligns: ['left', 'left', 'center', 'right', 'right', 'right'],
    }
  );
  r++;
  const lFirst = r;
  for (let i = 0; i < 5; i++) {
    X.bodyRow(ws, r, [
      { input: true },
      { input: true, wrap: true },
      { input: true, numFmt: 'm/d', align: 'center' },
      { input: true, numFmt: '0.00;-0.00;""', align: 'right' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR(D${r}="",E${r}=""),"",D${r}*E${r})`, numFmt: X.FMT.moneyBlank },
    ]);
    r++;
  }
  const lLast = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Labor' },
    {},
    { formula: `SUM(D${lFirst}:D${lLast})`, numFmt: '0.00' },
    {},
    { formula: `SUM(F${lFirst}:F${lLast})`, numFmt: X.FMT.money },
  ]);
  const laborRow = r;
  r += 2;

  // Materials
  X.headerRow(ws, r, ['Materials & parts', '', 'Qty', 'Unit', 'Unit cost', 'Amount'], {
    aligns: ['left', 'left', 'right', 'center', 'right', 'right'],
  });
  ws.mergeCells(r, 1, r, 2);
  r++;
  const mFirst = r;
  for (let i = 0; i < 5; i++) {
    ws.mergeCells(r, 1, r, 2);
    X.bodyRow(ws, r, [
      { input: true, wrap: true },
      { input: true },
      { input: true, numFmt: '0.##;-0.##;""', align: 'right' },
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR(C${r}="",E${r}=""),"",C${r}*E${r})`, numFmt: X.FMT.moneyBlank },
    ]);
    r++;
  }
  const mLast = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Materials & parts' },
    {},
    {},
    {},
    { formula: `SUM(F${mFirst}:F${mLast})`, numFmt: X.FMT.money },
  ]);
  const matRow = r;
  r += 2;

  // Equipment
  X.headerRow(ws, r, ['Equipment, rentals & subcontract', '', 'Qty', 'Unit', 'Rate', 'Amount'], {
    aligns: ['left', 'left', 'right', 'center', 'right', 'right'],
  });
  ws.mergeCells(r, 1, r, 2);
  r++;
  const eFirst = r;
  for (let i = 0; i < 3; i++) {
    ws.mergeCells(r, 1, r, 2);
    X.bodyRow(ws, r, [
      { input: true, wrap: true },
      { input: true },
      { input: true, numFmt: '0.##;-0.##;""', align: 'right' },
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR(C${r}="",E${r}=""),"",C${r}*E${r})`, numFmt: X.FMT.moneyBlank },
    ]);
    r++;
  }
  const eLast = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Equipment / rentals' },
    {},
    {},
    {},
    { formula: `SUM(F${eFirst}:F${eLast})`, numFmt: X.FMT.money },
  ]);
  const eqRow = r;
  r += 2;

  // Totals ladder
  X.text(ws, r, 2, 'Subtotal', { align: 'right', color: X.C.ink2, size: 9.5 });
  X.calc(ws, r, 6, `F${laborRow}+F${matRow}+F${eqRow}`, { numFmt: X.FMT.money });
  const subRow = r;
  r++;
  X.text(ws, r, 2, 'Overhead & profit — enter rate →', {
    align: 'right',
    color: X.C.ink2,
    size: 9,
  });
  X.input(ws, r, 5, 0.15, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(ws, r, 6, `F${subRow}*E${r}`, { numFmt: X.FMT.money });
  const mkRow = r;
  r++;
  X.text(ws, r, 2, 'Sales tax on materials — enter rate →', {
    align: 'right',
    color: X.C.ink2,
    size: 9,
  });
  X.input(ws, r, 5, 0, { numFmt: '0.00%', align: 'right' });
  X.calc(ws, r, 6, `F${matRow}*E${r}`, { numFmt: X.FMT.money });
  const taxRow = r;
  r++;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'WORK ORDER TOTAL' },
    {},
    {},
    {},
    { formula: `F${subRow}+F${mkRow}+F${taxRow}`, numFmt: X.FMT.money, bold: true },
  ]);
  r += 2;
  X.label(ws, r, 1, 'Completion notes — what was done, how it was tested, anything left open');
  r++;
  ws.mergeCells(r, 1, r + 1, 6);
  X.input(ws, r, 1, null, { wrap: true });
  ws.getRow(r).height = 18;
  ws.getRow(r + 1).height = 18;
  r += 3;
  X.kv(ws, r, 1, 'Date completed', null, { numFmt: X.FMT.date });
  X.kv(ws, r, 4, 'Change order ref. (if extra)', null, { labelTo: 5 });
  r += 2;
  r = X.signatureBlock(ws, r, ['Work performed by (technician)', 'Accepted by (customer / GC)'], {
    cols: [1, 4],
    width: 2,
  });
  r++;
  X.brandFooter(
    ws,
    r,
    6,
    'Free template by BuildWorkPro — buildworkpro.com/templates. A work order authorizes and records a job; on a contract project, out-of-scope work still needs a signed change order before it bills — attach this as backup.'
  );
  ws.pageSetup.printArea = `A1:F${r}`;

  // ---- Sheet 2: work order log ----
  const log = X.sheet(wb, 'Work Order Log', { landscape: true, fitHeight: 0, printTitles: '1:6' });
  X.widths(log, [10, 12, 24, 36, 18, 11, 12, 12, 12, 14, 20]);
  let lr = X.titleBlock(log, {
    title: 'Work Order Log',
    subtitle:
      'One row per work order. Status drives the open, complete and unbilled counts; days open runs from the issue date until it is complete.',
    cols: 11,
  });
  X.inputLegend(log, lr, 1);
  lr++;
  X.text(log, lr, 3, 'Open', { color: X.C.ink2, size: 9, align: 'right' });
  const openCell = `D${lr}`;
  X.text(log, lr, 5, 'Complete, not billed', { color: X.C.ink2, size: 9, align: 'right' });
  const unbilledCell = `F${lr}`;
  X.text(log, lr, 7, 'Unbilled value', { color: X.C.ink2, size: 9, align: 'right' });
  const unbilledValCell = `H${lr}`;
  X.text(log, lr, 9, 'Billed to date', { color: X.C.ink2, size: 9, align: 'right' });
  const billedCell = `J${lr}`;
  lr++;
  X.headerRow(
    log,
    lr,
    [
      'WO #',
      'Date issued',
      'Customer / site',
      'Work requested',
      'Requested by',
      'Priority',
      'Assigned to',
      'Due by',
      'Completed',
      'Amount',
      'Status',
    ],
    {
      aligns: [
        'center',
        'center',
        'left',
        'left',
        'left',
        'center',
        'left',
        'center',
        'center',
        'right',
        'center',
      ],
    }
  );
  lr++;
  const first = lr;
  for (let i = 0; i < 30; i++) {
    X.bodyRow(log, lr, [
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, wrap: true },
      { input: true, wrap: true },
      { input: true },
      { input: true, align: 'center' },
      { input: true },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, align: 'center' },
    ]);
    lr++;
  }
  const last = lr - 1;
  X.dropdown(log, `F${first}:F${last}`, PRIORITIES);
  X.dropdown(log, `K${first}:K${last}`, ['Open', 'In progress', 'Complete', 'Billed', 'Cancelled']);
  X.statusColors(log, `K${first}:K${last}`, {
    Billed: 'FFE6F4EA',
    Complete: 'FFEFF6FF',
    Open: 'FFFFF7E6',
    Cancelled: 'FFF3F5F8',
  });
  X.statusColors(log, `F${first}:F${last}`, { Emergency: 'FFFDE8E6', Urgent: 'FFFFF7E6' });
  // Overdue: past due date and not complete / billed / cancelled.
  log.addConditionalFormatting({
    ref: `H${first}:H${last}`,
    rules: [
      {
        type: 'expression',
        formulae: [`AND($H${first}<>"",$H${first}<TODAY(),$I${first}="",$K${first}<>"Cancelled")`],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE8E6' } },
          font: { color: { argb: X.C.deduct }, bold: true },
        },
        priority: 1,
      },
    ],
  });
  X.totalRow(log, lr, [
    { value: '' },
    { value: 'Totals' },
    { formula: `COUNTA(A${first}:A${last})&" work orders"`, align: 'left' },
    {},
    {},
    {},
    {},
    {},
    {},
    { formula: `SUM(J${first}:J${last})`, numFmt: X.FMT.money },
    {},
  ]);
  const setCalc = (ref, formula, numFmt, bold = false) => {
    const c = log.getCell(ref);
    c.value = { formula };
    c.numFmt = numFmt;
    c.font = { name: X.FONT, size: 10, bold };
    c.alignment = { horizontal: 'right' };
  };
  setCalc(
    openCell,
    `COUNTIF(K${first}:K${last},"Open")+COUNTIF(K${first}:K${last},"In progress")`,
    '0',
    true
  );
  setCalc(unbilledCell, `COUNTIF(K${first}:K${last},"Complete")`, '0', true);
  setCalc(
    unbilledValCell,
    `SUMIFS(J${first}:J${last},K${first}:K${last},"Complete")`,
    X.FMT.money,
    true
  );
  setCalc(billedCell, `SUMIFS(J${first}:J${last},K${first}:K${last},"Billed")`, X.FMT.money, true);
  log.views = [{ state: 'frozen', ySplit: first - 1, showGridLines: false }];
  lr += 2;
  X.brandFooter(
    log,
    lr,
    11,
    'Free template by BuildWorkPro — buildworkpro.com/templates. A due date turns red when it has passed and the work order has no completed date. Mark a work order Billed once it is on an invoice or a pay application.'
  );

  X.howToSheet(wb, {
    title: 'Work Order Template',
    steps: [
      'On the Work Order sheet, fill your company, the customer, the job site, who requested the work and the PO or reference that authorized it. Amber cells are inputs.',
      'Set the priority and how the job bills — contract extra (change order), T&M, service call or warranty. Bill-as decides whether this work order needs a change order behind it.',
      'Describe the work requested in plain words: what, where, why, and the directive, email or call that authorized it.',
      'Enter labor (hours × rate), materials (qty × unit cost) and equipment or rentals (qty × rate). Each amount, the section totals, overhead & profit and sales tax on materials calculate; the work order total is at the bottom.',
      'Write the completion notes, the date completed and the change order reference if the work is an extra, then print (fits one page) and get the technician and the customer or GC to sign.',
      'Log every work order on the Work Order Log sheet. The open count, complete-not-billed count, unbilled value and billed-to-date total update from the status column; a due date turns red when it is overdue.',
    ],
    tips: [
      'A signed work order is proof the work was requested and accepted. It is not a change order — on a contract project, get the change order signed before the extra bills.',
      'Number work orders in one sequence across all jobs (WO-0187, WO-0188…) so the log stays searchable.',
      'Complete-not-billed is the number to watch. Work orders that sit in that state are money you have already spent.',
    ],
    feature: {
      text: 'In BuildWorkPro, extra work becomes a change order the customer signs online, crew hours are logged against the project with per-person labor rates, and the approved amount rolls into the contract value and the next pay application.',
      url: 'https://buildworkpro.com/features/project-management/',
    },
  });
  return wb;
}
