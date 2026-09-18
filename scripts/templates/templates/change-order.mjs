// Construction change order — one-page form (PDF fillable), Word, and an Excel
// workbook that adds a change order log.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT } from '../kit/tokens.mjs';

export const meta = {
  slug: 'change-order',
  name: 'Construction Change Order Template',
  basename: 'change-order-template',
  docName: 'Change order',
};

const REASONS = ['Owner request', 'Design change', 'Field conditions', 'Code requirement', 'Other'];

const SAMPLE = {
  number: 'CO-003',
  date: 'September 14, 2026',
  to: SAMPLE_GC,
  contract: { original: 486200, prior: 5370 }, // CO-001 + CO-002 from STORY
  description:
    'Add a dedicated 2" condensate drain line from AHU-3 to the mechanical room floor sink, per revised drawing M-402 Rev. 2 (RFI-014). Includes core drilling through the second-floor slab, hangers, insulation, and tie-in.',
  reasons: ['Design change'],
  reference: 'RFI-014 · Drawing M-402 Rev. 2',
  items: [
    {
      desc: '2" Type L copper drain line, installed',
      sub: 'Includes hangers and fittings',
      qty: '64',
      unit: 'LF',
      price: 38.5,
      tag: 'add',
    },
    {
      desc: 'Core drill 4" penetration through slab',
      sub: 'Second floor, mechanical chase',
      qty: '2',
      unit: 'EA',
      price: 425,
      tag: 'add',
    },
    { desc: 'Pipe insulation, 1" closed cell', qty: '64', unit: 'LF', price: 9.25, tag: 'add' },
    { desc: 'Labor — journeyman plumber', qty: '18', unit: 'HR', price: 98, tag: 'add' },
    {
      desc: 'Credit: delete PVC drain per original M-402',
      qty: '1',
      unit: 'LS',
      price: -640,
      tag: 'ded',
    },
  ],
  markupPct: 15,
  days: 3,
  completion: 'November 21, 2026',
};

function computeTotals(items, markupPct) {
  const adds = items.filter((i) => i.price >= 0).reduce((s, i) => s + i.qty * i.price, 0);
  const deds = items.filter((i) => i.price < 0).reduce((s, i) => s + Math.abs(i.qty * i.price), 0);
  const subtotal = adds - deds;
  const markup = subtotal * (markupPct / 100);
  return { adds, deds, subtotal, markup, net: subtotal + markup };
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const t = s
    ? computeTotals(
        s.items.map((i) => ({ ...i, qty: Number(i.qty) })),
        s.markupPct
      )
    : null;
  const before = s ? s.contract.original + s.contract.prior : null;

  const itemCols = [
    { key: 'n', label: '#', width: 26, align: 'center', mono: true },
    { key: 'desc', label: 'Description of changed work' },
    { key: 'qty', label: 'Qty', width: 46, align: 'right' },
    { key: 'unit', label: 'Unit', width: 44, align: 'center' },
    { key: 'price', label: 'Unit price', width: 78, align: 'right' },
    { key: 'amount', label: 'Amount', width: 84, align: 'right' },
  ];
  const itemRows = s
    ? s.items.map((i, idx) => ({
        cells: {
          n: String(idx + 1),
          desc: i.desc,
          qty: i.qty,
          unit: i.unit,
          price: H.money(Math.abs(i.price)),
          amount: (i.price < 0 ? '- ' : '') + H.money(Math.abs(Number(i.qty) * i.price)),
        },
        sub: i.sub,
        tag: { label: i.tag === 'ded' ? 'Deduct' : 'Add', tone: i.tag },
      }))
    : [];

  const body = `
${H.header({ company, title: 'Change order', number: s ? s.number : 'CO-____', date: s ? s.date : undefined, fillable: !sample })}
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
    label: 'To (owner / general contractor)',
    lines: [
      { text: s ? s.to.name : '', strong: true, field: 'to.name' },
      { text: s ? s.to.line1 : '', field: 'to.line1' },
      { text: s ? s.to.line2 : '', field: 'to.line2' },
    ],
  },
  {
    label: 'Contract sum',
    kv: [
      {
        k: 'Original contract',
        v: s ? H.money(s.contract.original) : '',
        field: 'contract.original',
        mono: true,
      },
      {
        k: 'Prior approved changes',
        v: s ? H.money(s.contract.prior) : '',
        field: 'contract.prior',
        mono: true,
      },
      {
        k: 'Contract before this CO',
        v: s ? H.money(before) : '',
        field: 'contract.before',
        mono: true,
      },
      {
        k: 'This change order',
        v: s ? (t.net < 0 ? '- ' : '+ ') + H.money(Math.abs(t.net)) : '',
        field: 'contract.this',
        mono: true,
        tone: s && t.net < 0 ? 'deduct' : 'add',
      },
      {
        k: 'Revised contract sum',
        v: s ? H.money(before + t.net) : '',
        field: 'contract.revised',
        mono: true,
        strong: true,
      },
    ],
  },
])}
${H.fieldRow([
  H.field({ name: 'date', label: 'Date issued', value: s ? s.date : '', flex: 1 }),
  H.field({
    name: 'reference',
    label: 'Reference (RFI / drawing / directive)',
    value: s ? s.reference : '',
    flex: 1.6,
  }),
  H.field({
    name: 'requested_by',
    label: 'Requested by',
    value: s ? 'Marcus Reed, Brightline Builders' : '',
    flex: 1.2,
  }),
])}
${H.checkboxRow(
  'Reason for change',
  REASONS.map((r) => ({
    name: `reason.${r.toLowerCase().replace(/\s+/g, '_')}`,
    label: r,
    checked: !!s && s.reasons.includes(r),
  }))
)}
${H.textarea({ name: 'description', label: 'Description of the change', hint: 'what is added, deleted or revised — reference the drawing, RFI or site condition that triggered it', value: s ? s.description : '', height: 52 })}
${H.table({ columns: itemCols, rows: itemRows, blankRows: sample ? 0 : 6, fieldPrefix: 'item', rowHeight: 22 })}
${H.split(
  `${H.textarea({ name: 'schedule', label: 'Adjustment to the schedule', value: s ? `Contract time is increased by ${s.days} calendar days. Revised substantial completion date: ${s.completion}.` : '', placeholder: 'Contract time is increased / decreased / unchanged by ___ calendar days. Revised completion date: ________', height: 44 })}
   ${H.prose(
     `<p class="small ink2" style="margin-top:8px;line-height:1.45">The price and time above are <b>full and final compensation</b> for the changed work, including all direct, indirect and cumulative impacts. <b>No changed work proceeds until both parties sign.</b> Once signed, this change order adjusts the contract sum and becomes billable on the next application for payment.</p>`
   )}`,
  H.totals([
    { label: 'Additions', value: s ? H.money(t.adds) : '', field: 'tot.adds' },
    { label: 'Deductions', value: s ? '- ' + H.money(t.deds) : '', field: 'tot.deds' },
    { label: 'Subtotal', value: s ? H.money(t.subtotal) : '', field: 'tot.subtotal' },
    {
      label: `Overhead & profit (${s ? s.markupPct : '___'}%)`,
      value: s ? H.money(t.markup) : '',
      field: 'tot.markup',
    },
    {
      label: 'Net change this CO',
      value: s ? (t.net < 0 ? '- ' : '') + H.money(Math.abs(t.net)) : '',
      total: true,
      tone: s && t.net < 0 ? 'deduct' : 'add',
      field: 'tot.net',
    },
  ]),
  [1.15, 1]
)}
${H.signatures({
  title: 'Approval',
  copy: 'Both parties agree the contract sum and contract time are revised as shown above and the contractor is authorized to proceed with the described work.',
  parties: [
    {
      name: 'Contractor',
      sub: s ? SAMPLE_COMPANY.name : 'your company',
      fields: [
        { label: 'Signature', name: 'sig.contractor' },
        {
          label: 'Printed name and title',
          name: 'sig.contractor_name',
          value: s ? 'Dana Whitfield, Project Manager' : '',
        },
        { label: 'Date', name: 'sig.contractor_date', value: s ? '09/14/2026' : '' },
      ],
    },
    {
      name: 'Owner / GC',
      sub: s ? s.to.name : 'authorized representative',
      fields: [
        { label: 'Signature', name: 'sig.owner' },
        {
          label: 'Printed name and title',
          name: 'sig.owner_name',
          value: s ? 'Marcus Reed, Project Manager' : '',
        },
        { label: 'Date', name: 'sig.owner_date', value: s ? '09/16/2026' : '' },
      ],
    },
  ],
})}
${H.finePrint('General-purpose form, not legal advice. Your contract may set specific notice periods, pricing rules (unit rates, allowable markup) and documentation requirements for changes — follow those first. Keep the signed original with the pay application it is billed on.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'CO-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const children = [
    ...D.companyHeader({
      title: 'Change Order',
      number: 'CO No. ________',
      date: 'Date ____________',
    }),
    D.metaRow([
      {
        label: 'Project',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'To (owner / general contractor)',
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
        { label: 'Reference (RFI / drawing)', width: Math.round(W * 0.45) },
        { label: 'Requested by', width: Math.round(W * 0.3) },
        { label: 'Date issued', width: W - Math.round(W * 0.45) - Math.round(W * 0.3) },
      ],
    ]),
    D.label('Reason for change'),
    D.p(
      [...REASONS.flatMap((r, i) => [D.checkbox(r), D.run(i < REASONS.length - 1 ? '     ' : '')])],
      { after: 120 }
    ),
    ...D.textBox('Description of the change', {
      lines: 3,
      hint: 'What is added, deleted or revised — reference the drawing, RFI or site condition that triggered it.',
    }),
    D.heading('Pricing of the changed work', 'attach T&M tickets or quotes as backup'),
    D.table({
      columns: [
        { label: '#', width: 500, align: 'center' },
        { label: 'Description', width: 5200 },
        { label: 'Qty', width: 900, align: 'right' },
        { label: 'Unit', width: 800, align: 'center' },
        { label: 'Unit price', width: 1300, align: 'right' },
        { label: 'Amount', width: W - 500 - 5200 - 900 - 800 - 1300, align: 'right' },
      ],
      blankRows: 5,
      blankHeight: 280,
    }),
    D.spacer(2),
    D.ladder(
      [
        { k: 'Additions', v: '$', input: true },
        { k: 'Deductions', v: '$', input: true },
        { k: 'Subtotal', v: '$', input: true },
        { k: 'Overhead and profit (____ %)', v: '$', input: true },
        { k: 'Net change this change order', v: '$', total: true, input: true },
      ],
      { kWidth: 7400 }
    ),
    D.heading('Adjustment to the contract sum'),
    D.ladder([
      { k: 'Original contract sum', v: '$', input: true },
      { k: 'Net change by previously approved change orders', v: '$', input: true },
      { k: 'Contract sum before this change order', v: '$', input: true },
      { k: 'This change order (add / deduct)', v: '$', input: true },
      { k: 'Revised contract sum including this change order', v: '$', total: true, input: true },
    ]),
    D.heading('Adjustment to the schedule'),
    D.p(
      'The contract time is  ☐ increased   ☐ decreased   ☐ unchanged  by ________ calendar days. Revised substantial completion date: ____________________.',
      { size: 9.5, after: 120 }
    ),
    D.heading('Agreement'),
    D.p([
      D.run('The price and time above are '),
      D.run('full and final compensation', { bold: true }),
      D.run(
        ' for the changed work, including all direct, indirect and cumulative impacts on the remaining work. '
      ),
      D.run('No changed work proceeds until both parties sign.', { bold: true }),
      D.run(
        ' Once signed, this change order adjusts the contract sum and contract time and the changed work becomes billable on the next application for payment.'
      ),
    ]),
    ...D.signatures({
      title: 'Approval',
      copy: 'Both parties agree the contract sum and contract time are revised as shown above and the contractor is authorized to proceed with the described work.',
      parties: [
        { name: 'Contractor', sub: 'your company' },
        { name: 'Owner / General contractor', sub: 'authorized representative' },
      ],
    }),
    D.fine(
      'General-purpose form, not legal advice. Your contract may set specific notice periods, pricing rules (unit rates, allowable markup) and documentation requirements for changes — follow those first. Keep the signed original with the pay application it is billed on.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Change order' });
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });

  // ---- Sheet 1: the form ----
  const ws = X.sheet(wb, 'Change Order', { fitHeight: 1 });
  X.widths(ws, [5, 40, 9, 9, 14, 16]);
  let r = X.titleBlock(ws, {
    title: 'Change Order',
    subtitle:
      'Prices the change, adjusts the contract sum and time, and gets both signatures before the work starts.',
    cols: 6,
    right: 'Print: fits one page',
    rightFrom: 4,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.label(ws, r, 1, 'Your company');
  X.label(ws, r, 3, 'Change order');
  r++;
  X.kv(ws, r, 1, 'Company', null, { to: 2 });
  X.kv(ws, r, 3, 'CO number', null, { labelTo: 4, to: 6 });
  r++;
  X.kv(ws, r, 1, 'Address', null, { to: 2 });
  X.kv(ws, r, 3, 'Date', null, { labelTo: 4, to: 6, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Phone / email', null, { to: 2 });
  X.kv(ws, r, 3, 'Reference (RFI / drawing)', null, { labelTo: 4, to: 6 });
  r += 2;
  X.label(ws, r, 1, 'Project');
  X.label(ws, r, 3, 'To (owner / GC)');
  r++;
  X.kv(ws, r, 1, 'Project name', null, { to: 2 });
  X.kv(ws, r, 3, 'Company', null, { labelTo: 4, to: 6 });
  r++;
  X.kv(ws, r, 1, 'Project number', null, { to: 2 });
  X.kv(ws, r, 3, 'Contact', null, { labelTo: 4, to: 6 });
  r++;
  X.kv(ws, r, 1, 'Site address', null, { to: 2 });
  X.kv(ws, r, 3, 'Reason for change', null, { labelTo: 4, to: 6 });
  X.dropdown(ws, `E${r}:F${r}`, REASONS);
  r += 2;
  X.label(ws, r, 1, 'Description of the change');
  r++;
  ws.mergeCells(r, 1, r + 2, 6);
  X.input(ws, r, 1, null, { wrap: true });
  ws.getRow(r).height = 20;
  ws.getRow(r + 1).height = 20;
  ws.getRow(r + 2).height = 20;
  r += 4;

  X.headerRow(ws, r, ['#', 'Description of changed work', 'Qty', 'Unit', 'Unit price', 'Amount'], {
    aligns: ['center', 'left', 'right', 'center', 'right', 'right'],
  });
  r++;
  const first = r;
  for (let i = 0; i < 10; i++) {
    X.bodyRow(ws, r, [
      { value: i + 1, align: 'center', color: X.C.ink3 },
      { input: true, wrap: true },
      { input: true, numFmt: X.FMT.num, align: 'right' },
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR(C${r}="",E${r}=""),"",C${r}*E${r})`, numFmt: X.FMT.moneyBlank },
    ]);
    r++;
  }
  const last = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Subtotal of changed work' },
    {},
    {},
    {},
    { formula: `SUM(F${first}:F${last})`, numFmt: X.FMT.money },
  ]);
  const subtotalRow = r;
  r++;
  X.text(ws, r, 2, 'Overhead & profit — enter rate →', {
    align: 'right',
    color: X.C.ink2,
    size: 9,
  });
  X.input(ws, r, 5, 0.15, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(ws, r, 6, `F${subtotalRow}*E${r}`, { numFmt: X.FMT.money });
  const markupRow = r;
  r++;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'NET CHANGE THIS CHANGE ORDER' },
    {},
    {},
    {},
    { formula: `F${subtotalRow}+F${markupRow}`, numFmt: X.FMT.money },
  ]);
  const netRow = r;
  r += 2;

  X.label(ws, r, 1, 'Adjustment to the contract sum');
  r++;
  const ladder = [
    ['Original contract sum', null, true],
    ['Net change by previously approved change orders', null, true],
    ['Contract sum before this change order', `F${r}+F${r + 1}`, false],
    ['This change order', `F${netRow}`, false],
    ['Revised contract sum including this change order', `F${r + 2}+F${r + 3}`, false],
  ];
  ladder.forEach(([k, f, inp], i) => {
    X.text(ws, r, 2, k, {
      color: i === 4 ? X.C.ink : X.C.ink2,
      bold: i === 4,
      size: i === 4 ? 10 : 9.5,
    });
    if (inp) X.input(ws, r, 6, null, { numFmt: X.FMT.money, align: 'right' });
    else X.calc(ws, r, 6, f, { numFmt: X.FMT.money, bold: i === 4 });
    if (i === 4) ws.getCell(r, 6).border = { top: { style: 'medium', color: { argb: X.C.ink } } };
    r++;
  });
  r++;
  X.label(ws, r, 1, 'Adjustment to the schedule');
  r++;
  X.kv(ws, r, 1, 'Time change (calendar days, + / −)', null, { to: 2, numFmt: '+0;-0;0' });
  X.kv(ws, r, 3, 'Revised completion date', null, { labelTo: 4, to: 6, numFmt: X.FMT.date });
  r += 2;
  X.noteRow(
    ws,
    r,
    'The price and time above are full and final compensation for the changed work, including all direct, indirect and cumulative impacts. No changed work proceeds until both parties sign. Once signed, the change order adjusts the contract sum and is billable on the next application for payment.',
    6,
    { height: 44 }
  );
  r += 2;
  r = X.signatureBlock(ws, r, ['Contractor', 'Owner / general contractor'], {
    cols: [1, 4],
    width: 3,
  });
  X.brandFooter(
    ws,
    r,
    6,
    'Free template by BuildWorkPro — buildworkpro.com/templates. General-purpose form, not legal advice. Follow the notice, pricing and documentation rules in your contract.'
  );
  ws.pageSetup.printArea = `A1:F${r}`;

  // ---- Sheet 2: change order log ----
  const log = X.sheet(wb, 'CO Log', { landscape: true, fitHeight: 1 });
  X.widths(log, [9, 40, 13, 13, 14, 10, 14, 30]);
  let lr = X.titleBlock(log, {
    title: 'Change Order Log',
    subtitle:
      'One row per change order. Status drives the approved total; the running contract sum recalculates on every row.',
    cols: 8,
  });
  X.kv(log, lr, 1, 'Original contract sum', 0, { labelTo: 2, numFmt: X.FMT.money });
  const origCell = `C${lr}`;
  X.text(log, lr, 5, 'Approved to date', { color: X.C.ink2, size: 9, align: 'right' });
  const approvedCell = `F${lr}`;
  X.text(log, lr, 7, 'Revised contract', { color: X.C.ink2, size: 9, align: 'right' });
  const revisedCell = `H${lr}`;
  lr++;
  X.text(log, lr, 5, 'Pending', { color: X.C.ink2, size: 9, align: 'right' });
  const pendingCell = `F${lr}`;
  lr++;
  X.headerRow(
    log,
    lr,
    [
      'CO #',
      'Description',
      'Date submitted',
      'Date approved',
      'Amount',
      'Days',
      'Status',
      'Running contract sum',
    ],
    { aligns: ['center', 'left', 'center', 'center', 'right', 'right', 'center', 'right'] }
  );
  lr++;
  const lfirst = lr;
  for (let i = 0; i < 30; i++) {
    X.bodyRow(log, lr, [
      { input: true, align: 'center' },
      { input: true, wrap: true },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: '0;-0;""', align: 'right' },
      { input: true, align: 'center' },
      {
        formula: `IF(A${lr}="","",${origCell}+SUMIFS($E$${lfirst}:E${lr},$G$${lfirst}:G${lr},"Approved"))`,
        numFmt: X.FMT.moneyBlank,
      },
    ]);
    lr++;
  }
  const llast = lr - 1;
  X.dropdown(log, `G${lfirst}:G${llast}`, ['Pending', 'Approved', 'Rejected', 'Void']);
  X.statusColors(log, `G${lfirst}:G${llast}`, {
    Approved: 'FFE6F4EA',
    Rejected: 'FFFDE8E6',
    Pending: 'FFFFF7E6',
  });
  X.totalRow(log, lr, [
    { value: '' },
    { value: 'Totals' },
    {},
    {},
    {
      formula: `SUMIFS(E${lfirst}:E${llast},G${lfirst}:G${llast},"Approved")`,
      numFmt: X.FMT.money,
    },
    { formula: `SUMIFS(F${lfirst}:F${llast},G${lfirst}:G${llast},"Approved")`, numFmt: '0' },
    { value: 'approved', align: 'center' },
    {},
  ]);
  log.getCell(approvedCell).value = {
    formula: `SUMIFS(E${lfirst}:E${llast},G${lfirst}:G${llast},"Approved")`,
  };
  log.getCell(approvedCell).numFmt = X.FMT.money;
  log.getCell(approvedCell).font = { name: X.FONT, size: 10, bold: true };
  log.getCell(approvedCell).alignment = { horizontal: 'right' };
  log.getCell(pendingCell).value = {
    formula: `SUMIFS(E${lfirst}:E${llast},G${lfirst}:G${llast},"Pending")`,
  };
  log.getCell(pendingCell).numFmt = X.FMT.money;
  log.getCell(pendingCell).font = { name: X.FONT, size: 10 };
  log.getCell(pendingCell).alignment = { horizontal: 'right' };
  log.getCell(revisedCell).value = { formula: `${origCell}+${approvedCell}` };
  log.getCell(revisedCell).numFmt = X.FMT.money;
  log.getCell(revisedCell).font = { name: X.FONT, size: 10, bold: true };
  log.getCell(revisedCell).alignment = { horizontal: 'right' };
  log.views = [{ state: 'frozen', ySplit: lfirst - 1, showGridLines: false }];
  lr += 2;
  X.brandFooter(
    log,
    lr,
    8,
    'Free template by BuildWorkPro — buildworkpro.com/templates. The running contract sum on each row is the original sum plus every change order marked Approved above it.'
  );

  X.howToSheet(wb, {
    title: 'Change Order Template',
    steps: [
      'Fill in your company, the project, and who the change order goes to on the Change Order sheet. Amber cells are inputs.',
      'Describe the change and pick a reason. Reference the RFI, drawing revision or directive that triggered it — that reference is what wins a dispute later.',
      'Price the changed work line by line: quantity × unit price computes each amount. Deducts go in as negative unit prices.',
      'Set your overhead & profit rate. The net change, the contract-sum ladder and the revised contract sum calculate automatically.',
      'Enter any time change in calendar days and the revised completion date, then print (File → Print fits one page) and get both signatures before starting the work.',
      'Log every change order on the CO Log sheet. Mark it Approved once signed — the approved total and revised contract sum update, and the running contract sum shows on each row.',
    ],
    tips: [
      'Never start changed work on a verbal OK. If the GC directs the work before signing, send a confirming email the same day and note it in your daily report.',
      'Approved change orders become new lines on your schedule of values and are billed on the next pay application — keep the CO number consistent across both.',
      'Attach the T&M ticket or vendor quote as backup. A change order with backup gets approved; one without gets "negotiated".',
    ],
    feature: {
      text: 'In BuildWorkPro, change orders are priced with real line items, e-signed by the customer from an emailed link, and applied to the contract value and the next pay application the moment they are approved.',
      url: 'https://buildworkpro.com/features/change-orders/',
    },
  });
  return wb;
}
