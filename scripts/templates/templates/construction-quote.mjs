// Construction quote — a one-page fixed-price offer: line items, optional
// items, subtotal / tax / total, deposit, terms and an acceptance signature.
// Fillable PDF, Excel (with a quote log) and Word.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_OWNER, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'construction-quote',
  name: 'Construction Quote Template',
  basename: 'construction-quote-template',
  docName: 'Quote',
};

// A small owner-direct service job for the same owner, outside the GC
// contract — the situation a fixed-price quote (rather than a bid proposal)
// is for. Crew rate matches the $98/hr used on CO-003.
const SAMPLE = {
  number: 'Q-2026-0231',
  date: 'September 10, 2026',
  valid: 'October 10, 2026',
  start: 'Within 3 weeks of acceptance',
  preparedBy: `${STORY.people.estimator}, Estimator`,
  customer: {
    name: SAMPLE_OWNER.name,
    line1: SAMPLE_OWNER.line1,
    line2: 'Attn: Facilities Manager · (303) 555-0170',
  },
  job: {
    name: 'Harbor Point — Building A (existing)',
    line1: '2100 Harbor Point Blvd, Denver, CO 80216',
    line2: 'Roof level — exhaust fan EF-3 (break room / restrooms)',
  },
  description:
    'Remove and replace the failed rooftop exhaust fan EF-3 serving the Building A break room and restrooms, matching the existing 1,800 CFM capacity, and return it to service the same day.',
  items: [
    {
      desc: 'Remove and dispose of existing roof exhaust fan EF-3',
      qty: 1,
      unit: 'LS',
      price: 380,
    },
    {
      desc: 'New direct-drive upblast exhaust fan, 1,800 CFM @ 0.5" SP, ½ HP 120 V',
      sub: 'With backdraft damper and factory disconnect',
      qty: 1,
      unit: 'EA',
      price: 2640,
      taxable: true,
    },
    {
      desc: 'Curb adapter, 20" to 24", galvanized, sealed to existing curb',
      qty: 1,
      unit: 'EA',
      price: 410,
      taxable: true,
    },
    {
      desc: 'Electrical — disconnect, reconnect and test at existing circuit',
      sub: 'Licensed electrician',
      qty: 1,
      unit: 'LS',
      price: 685,
    },
    {
      desc: 'Labor — two-technician crew: removal, set, start-up and airflow check',
      qty: 8,
      unit: 'HR',
      price: 196,
    },
    { desc: 'Boom lift for roof access, one day', qty: 1, unit: 'DAY', price: 425 },
  ],
  taxRate: 8.81,
  depositPct: 30,
  options: [
    { n: 'A', desc: 'Replace EF-4 (same size, adjacent curb) during the same visit', amount: 2890 },
    { n: 'B', desc: 'Vibration-isolation curb and 5-year extended motor warranty', amount: 520 },
  ],
  terms:
    'Deposit: 30% on acceptance; balance net 15 days from completion. Schedule: fan ships 2–3 weeks after acceptance; one day on site during normal hours. Exclusions: roofing repairs beyond the curb seal, permit fees if required, after-hours work, ductwork changes. Warranty: one year on labor; manufacturer’s parts warranty passes through. Price is firm through the valid-until date.',
  sig: {
    customer: 'Facilities Manager, Harbor Point Development LLC',
    customerDate: '09/15/2026',
    contractor: `${STORY.people.pm}, Project Manager`,
    contractorDate: '09/10/2026',
  },
};

const round2 = (n) => Math.round(n * 100) / 100;

function compute(s) {
  const subtotal = s.items.reduce((t, i) => t + i.qty * i.price, 0);
  const taxable = s.items.filter((i) => i.taxable).reduce((t, i) => t + i.qty * i.price, 0);
  const tax = round2(taxable * (s.taxRate / 100));
  const total = round2(subtotal + tax);
  const deposit = round2(total * (s.depositPct / 100));
  return { subtotal, taxable, tax, total, deposit, balance: round2(total - deposit) };
}

const FINE =
  'A quote is a fixed-price offer for the work described, not an estimate. Work not listed, hidden conditions and customer-requested changes are priced by written change order before they start. General-purpose form, not legal advice.';

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const t = s ? compute(s) : null;

  const itemCols = [
    { key: 'n', label: '#', width: 24, align: 'center', mono: true },
    { key: 'desc', label: 'Description' },
    { key: 'qty', label: 'Qty', width: 46, align: 'right' },
    { key: 'unit', label: 'Unit', width: 42, align: 'center' },
    { key: 'price', label: 'Unit price', width: 76, align: 'right' },
    { key: 'amount', label: 'Amount', width: 86, align: 'right' },
  ];
  const itemRows = s
    ? s.items.map((i, idx) => ({
        cells: {
          n: String(idx + 1),
          desc: i.desc,
          qty: String(i.qty),
          unit: i.unit,
          price: H.money(i.price),
          amount: H.money(i.qty * i.price),
        },
        sub: i.sub,
      }))
    : [];
  const optCols = [
    { key: 'n', label: 'Opt.', width: 40, align: 'center', mono: true },
    { key: 'desc', label: 'Optional items — priced separately, not included in the total' },
    { key: 'amount', label: 'Add', width: 86, align: 'right' },
  ];
  const optRows = s
    ? s.options.map((o) => ({ cells: { n: o.n, desc: o.desc, amount: H.money(o.amount) } }))
    : [];

  const body = `
${H.header({ company, title: 'Quote', number: s ? s.number : 'Q-____', date: s ? s.date : undefined, fillable: !sample })}
${H.metaRow([
  {
    label: 'Prepared for',
    lines: [
      { text: s ? s.customer.name : '', strong: true, field: 'customer.name' },
      { text: s ? s.customer.line1 : '', field: 'customer.line1' },
      { text: s ? s.customer.line2 : '', field: 'customer.line2' },
    ],
  },
  {
    label: 'Job address',
    lines: [
      { text: s ? s.job.name : '', strong: true, field: 'job.name' },
      { text: s ? s.job.line1 : '', field: 'job.line1' },
      { text: s ? s.job.line2 : '', field: 'job.line2' },
    ],
  },
  {
    label: 'Quote',
    kv: [
      { k: 'Quote date', v: s ? s.date : '', field: 'quote.date' },
      { k: 'Valid until', v: s ? s.valid : '', field: 'quote.valid', strong: true },
      { k: 'Estimated start', v: s ? s.start : '', field: 'quote.start' },
      { k: 'Prepared by', v: s ? s.preparedBy : '', field: 'quote.prepared_by' },
    ],
  },
])}
${H.textarea({ name: 'description', label: 'Description of work', hint: 'what you will do, where, and what "done" looks like', value: s ? s.description : '', height: 40 })}
${H.table({ columns: itemCols, rows: itemRows, blankRows: sample ? 0 : 8, fieldPrefix: 'item', rowHeight: 22 })}
${H.table({ columns: optCols, rows: optRows, blankRows: sample ? 0 : 3, fieldPrefix: 'opt', rowHeight: 22, variant: 'compact' })}
${H.split(
  `${H.textarea({ name: 'terms', label: 'Terms', hint: 'deposit, payment, schedule, exclusions, warranty', value: s ? s.terms : '', height: 96 })}`,
  H.totals([
    { label: 'Subtotal', value: s ? H.money(t.subtotal) : '', field: 'tot.subtotal' },
    {
      label: s
        ? `Sales tax — ${s.taxRate}% on materials (${H.money(t.taxable)})`
        : 'Sales tax (___% on $________)',
      value: s ? H.money(t.tax) : '',
      field: 'tot.tax',
    },
    { label: 'Quote total', value: s ? H.money(t.total) : '', total: true, field: 'tot.total' },
    {
      label: s
        ? `Deposit due on acceptance (${s.depositPct}%)`
        : 'Deposit due on acceptance (___%)',
      value: s ? H.money(t.deposit) : '',
      field: 'tot.deposit',
    },
    {
      label: 'Balance due on completion',
      value: s ? H.money(t.balance) : '',
      field: 'tot.balance',
    },
  ]),
  [1.25, 1]
)}
${H.signatures({
  title: 'Acceptance',
  copy: 'By signing, the customer accepts this quote, the optional items marked above, and the terms stated, and authorizes the work to be scheduled.',
  parties: [
    {
      name: 'Accepted by',
      sub: s ? s.customer.name : 'customer',
      fields: [
        { label: 'Signature', name: 'sig.customer' },
        {
          label: 'Printed name and title',
          name: 'sig.customer_name',
          value: s ? s.sig.customer : '',
        },
        { label: 'Date', name: 'sig.customer_date', value: s ? s.sig.customerDate : '' },
      ],
    },
    {
      name: 'Quoted by',
      sub: s ? SAMPLE_COMPANY.name : 'your company',
      fields: [
        { label: 'Signature', name: 'sig.contractor' },
        {
          label: 'Printed name and title',
          name: 'sig.contractor_name',
          value: s ? s.sig.contractor : '',
        },
        { label: 'Date', name: 'sig.contractor_date', value: s ? s.sig.contractorDate : '' },
      ],
    },
  ],
})}
${H.finePrint(FINE)}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'Q-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const w = (f) => Math.round(W * f);
  const children = [
    ...D.companyHeader({ title: 'Quote', number: 'Quote No. ________', date: 'Date ____________' }),
    D.metaRow([
      {
        label: 'Prepared for',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Job address',
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
        { label: 'Valid until', width: w(0.34) },
        { label: 'Estimated start', width: w(0.33) },
        { label: 'Prepared by', width: W - w(0.34) - w(0.33) },
      ],
    ]),
    ...D.textBox('Description of work', {
      lines: 3,
      hint: 'What you will do, where, and what "done" looks like.',
    }),
    D.heading('Price', 'fixed price for the work described'),
    D.table({
      columns: [
        { label: '#', width: 500, align: 'center' },
        { label: 'Description', width: 5300 },
        { label: 'Qty', width: 900, align: 'right' },
        { label: 'Unit', width: 800, align: 'center' },
        { label: 'Unit price', width: 1280, align: 'right' },
        { label: 'Amount', width: W - 500 - 5300 - 900 - 800 - 1280, align: 'right' },
      ],
      blankRows: 8,
      blankHeight: 280,
    }),
    D.spacer(2),
    D.ladder(
      [
        { k: 'Subtotal', v: '$', input: true },
        { k: 'Sales tax (____ % on $________ of materials)', v: '$', input: true },
        { k: 'Quote total', v: '$', total: true, input: true },
        { k: 'Deposit due on acceptance (____ %)', v: '$', input: true },
        { k: 'Balance due on completion', v: '$', input: true },
      ],
      { kWidth: 7400 }
    ),
    D.pageBreak(),
    D.heading('Optional items', 'priced separately — not included in the total'),
    D.table({
      columns: [
        { label: 'Opt.', width: 800, align: 'center' },
        { label: 'Description', width: W - 800 - 1700 },
        { label: 'Add', width: 1700, align: 'right' },
      ],
      blankRows: 3,
      blankHeight: 280,
    }),
    D.heading('Terms'),
    ...D.textBox('Deposit, payment, schedule, exclusions, warranty', {
      lines: 4,
      hint: 'Example: 30% deposit on acceptance, balance net 15 days from completion. Price firm through the valid-until date. Excludes permit fees, after-hours work and hidden conditions.',
    }),
    ...D.signatures({
      title: 'Acceptance',
      copy: 'By signing, the customer accepts this quote, the optional items marked above, and the terms stated, and authorizes the work to be scheduled.',
      parties: [
        { name: 'Accepted by', sub: 'customer' },
        { name: 'Quoted by', sub: 'your company' },
      ],
    }),
    D.fine(FINE),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Quote' });
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });

  // ---- Sheet 1: the quote ----
  const ws = X.sheet(wb, 'Quote', { fitHeight: 1 });
  X.widths(ws, [5, 44, 9, 8, 13, 7, 15]);
  let r = X.titleBlock(ws, {
    title: 'Quote',
    subtitle:
      'A fixed-price offer: line items, optional extras, tax on the taxable lines, deposit and balance. Print fits one page.',
    cols: 7,
    right: 'Amber = your inputs',
    rightFrom: 5,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.label(ws, r, 1, 'Your company');
  X.label(ws, r, 3, 'Quote');
  r++;
  X.kv(ws, r, 1, 'Company', null, { to: 2 });
  X.kv(ws, r, 3, 'Quote no.', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Address', null, { to: 2 });
  X.kv(ws, r, 3, 'Date', null, { labelTo: 4, to: 7, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Phone / email', null, { to: 2 });
  X.kv(ws, r, 3, 'Valid until', null, { labelTo: 4, to: 7, numFmt: X.FMT.date });
  r += 2;
  X.label(ws, r, 1, 'Prepared for');
  X.label(ws, r, 3, 'Job');
  r++;
  X.kv(ws, r, 1, 'Customer', null, { to: 2 });
  X.kv(ws, r, 3, 'Job name / address', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Address', null, { to: 2 });
  X.kv(ws, r, 3, 'Estimated start', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Contact / phone', null, { to: 2 });
  X.kv(ws, r, 3, 'Prepared by', null, { labelTo: 4, to: 7 });
  r += 2;
  X.label(ws, r, 1, 'Description of work');
  r++;
  ws.mergeCells(r, 1, r + 1, 7);
  X.input(ws, r, 1, null, { wrap: true });
  ws.getRow(r).height = 20;
  ws.getRow(r + 1).height = 20;
  r += 3;

  X.headerRow(ws, r, ['#', 'Description', 'Qty', 'Unit', 'Unit price', 'Tax?', 'Amount'], {
    aligns: ['center', 'left', 'right', 'center', 'right', 'center', 'right'],
  });
  r++;
  const first = r;
  for (let i = 0; i < 12; i++) {
    X.bodyRow(ws, r, [
      { value: i + 1, align: 'center', color: X.C.ink3 },
      { input: true, wrap: true },
      { input: true, numFmt: X.FMT.num, align: 'right' },
      { input: true, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, align: 'center' },
      { formula: `IF(OR(C${r}="",E${r}=""),"",C${r}*E${r})`, numFmt: X.FMT.moneyBlank },
    ]);
    r++;
  }
  const last = r - 1;
  X.dropdown(ws, `F${first}:F${last}`, ['Y', 'N']);
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Subtotal' },
    {},
    {},
    {},
    {},
    { formula: `SUM(G${first}:G${last})`, numFmt: X.FMT.money },
  ]);
  const subtotalRow = r;
  r++;
  X.text(ws, r, 2, 'Taxable amount (lines marked Y)', { color: X.C.ink2, size: 9 });
  X.calc(ws, r, 7, `SUMIF(F${first}:F${last},"Y",G${first}:G${last})`, { numFmt: X.FMT.money });
  ws.getCell(r, 7).font = { name: X.FONT, size: 10, color: { argb: X.C.ink2 } };
  const taxableRow = r;
  r++;
  X.text(ws, r, 2, 'Sales tax — enter your rate →', { color: X.C.ink2, size: 9 });
  X.input(ws, r, 5, 0, { numFmt: '0.00%', align: 'right' });
  X.calc(ws, r, 7, `G${taxableRow}*E${r}`, { numFmt: X.FMT.money });
  const taxRow = r;
  r++;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'QUOTE TOTAL' },
    {},
    {},
    {},
    {},
    { formula: `G${subtotalRow}+G${taxRow}`, numFmt: X.FMT.money },
  ]);
  ws.getCell(r, 7).font = { name: X.FONT, size: 12, bold: true };
  const totalRow = r;
  r++;
  X.text(ws, r, 2, 'Deposit due on acceptance — enter % →', { color: X.C.ink2, size: 9 });
  X.input(ws, r, 5, 0.3, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(ws, r, 7, `ROUND(G${totalRow}*E${r},2)`, { numFmt: X.FMT.money });
  const depositRow = r;
  r++;
  X.text(ws, r, 2, 'Balance due on completion', { color: X.C.ink2, size: 9 });
  X.calc(ws, r, 7, `G${totalRow}-G${depositRow}`, { numFmt: X.FMT.money });
  r += 2;

  X.headerRow(
    ws,
    r,
    ['Opt.', 'Optional items — priced separately, not in the total', '', '', '', '', 'Add'],
    {
      aligns: ['center', 'left', 'left', 'left', 'left', 'left', 'right'],
    }
  );
  r++;
  for (const n of ['A', 'B', 'C']) {
    X.bodyRow(ws, r, [
      { value: n, align: 'center', color: X.C.ink3 },
      { input: true, wrap: true },
      {},
      {},
      {},
      {},
      { input: true, numFmt: X.FMT.moneyBlank },
    ]);
    ws.mergeCells(r, 2, r, 6);
    r++;
  }
  r++;
  X.label(ws, r, 1, 'Terms — deposit, payment, schedule, exclusions, warranty');
  r++;
  ws.mergeCells(r, 1, r + 2, 7);
  X.input(ws, r, 1, null, { wrap: true });
  for (let i = 0; i < 3; i++) ws.getRow(r + i).height = 18;
  r += 4;
  r = X.signatureBlock(ws, r, ['Accepted by (customer)', 'Quoted by'], { cols: [1, 5], width: 3 });
  r++;
  X.brandFooter(
    ws,
    r,
    7,
    'Free template by BuildWorkPro — buildworkpro.com/templates. A quote is a fixed-price offer for the work described; changes and hidden conditions are priced by written change order. Not legal advice.'
  );
  ws.pageSetup.printArea = `A1:G${r}`;

  // ---- Sheet 2: quote log ----
  const log = X.sheet(wb, 'Quote Log', { landscape: true, fitHeight: 1 });
  X.widths(log, [12, 26, 34, 13, 13, 15, 13, 14, 28]);
  let lr = X.titleBlock(log, {
    title: 'Quote Log',
    subtitle:
      'One row per quote sent. Status drives the accepted total and the win rate; expired quotes show when the valid-until date has passed.',
    cols: 9,
  });
  X.text(log, lr, 4, 'Quoted', { color: X.C.ink2, size: 9, align: 'right' });
  const quotedCell = `E${lr}`;
  X.text(log, lr, 6, 'Accepted', { color: X.C.ink2, size: 9, align: 'right' });
  const acceptedCell = `G${lr}`;
  X.text(log, lr, 8, 'Win rate (by count)', { color: X.C.ink2, size: 9, align: 'right' });
  const winCell = `I${lr}`;
  lr += 2;
  X.headerRow(
    log,
    lr,
    [
      'Quote no.',
      'Customer',
      'Job',
      'Date',
      'Valid until',
      'Amount',
      'Status',
      'Days left',
      'Notes',
    ],
    { aligns: ['left', 'left', 'left', 'center', 'center', 'right', 'center', 'right', 'left'] }
  );
  lr++;
  const lfirst = lr;
  for (let i = 0; i < 30; i++) {
    X.bodyRow(log, lr, [
      { input: true },
      { input: true, wrap: true },
      { input: true, wrap: true },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, align: 'center' },
      {
        formula: `IF(OR(E${lr}="",G${lr}<>"Sent"),"",E${lr}-TODAY())`,
        numFmt: '0;[Red]-0;0',
      },
      { input: true, wrap: true },
    ]);
    lr++;
  }
  const llast = lr - 1;
  X.dropdown(log, `G${lfirst}:G${llast}`, ['Sent', 'Accepted', 'Declined', 'Expired']);
  X.statusColors(log, `G${lfirst}:G${llast}`, {
    Accepted: 'FFE6F4EA',
    Declined: 'FFFDE8E6',
    Expired: 'FFF1F3F5',
    Sent: 'FFFFF7E6',
  });
  X.totalRow(log, lr, [
    { value: '' },
    { value: 'Totals' },
    {},
    {},
    {},
    { formula: `SUM(F${lfirst}:F${llast})`, numFmt: X.FMT.money },
    { formula: `COUNTA(A${lfirst}:A${llast})`, numFmt: '0', align: 'center' },
    {},
    {},
  ]);
  const setCalc = (ref, formula, numFmt, bold) => {
    const c = log.getCell(ref);
    c.value = { formula };
    c.numFmt = numFmt;
    c.font = { name: X.FONT, size: 10, bold: !!bold };
    c.alignment = { horizontal: 'right' };
  };
  setCalc(quotedCell, `SUM(F${lfirst}:F${llast})`, X.FMT.money);
  setCalc(
    acceptedCell,
    `SUMIFS(F${lfirst}:F${llast},G${lfirst}:G${llast},"Accepted")`,
    X.FMT.money,
    true
  );
  setCalc(
    winCell,
    `IFERROR(COUNTIF(G${lfirst}:G${llast},"Accepted")/(COUNTIF(G${lfirst}:G${llast},"Accepted")+COUNTIF(G${lfirst}:G${llast},"Declined")+COUNTIF(G${lfirst}:G${llast},"Expired")),0)`,
    X.FMT.pct,
    true
  );
  log.views = [{ state: 'frozen', ySplit: lfirst - 1, showGridLines: false }];
  lr += 2;
  X.brandFooter(
    log,
    lr,
    9,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Win rate counts Accepted against Accepted + Declined + Expired; quotes still marked Sent are not in the denominator.'
  );

  X.howToSheet(wb, {
    title: 'Construction Quote Template',
    steps: [
      'Fill in your company, the customer, the job address and the quote number and dates on the Quote sheet. Set a valid-until date — a quote with no expiry binds you to old prices.',
      'Describe the work in two or three sentences: what you will do, where, and what finished looks like.',
      'Enter each line with quantity, unit and unit price; amounts compute. Mark taxable lines Y and enter your sales-tax rate — leave the rate at 0% if tax is already in your prices.',
      'Set the deposit percentage. The quote total, deposit due and balance due calculate.',
      'List optional items the customer can add (they are not in the total), write your terms, print, and get the acceptance signature before you order material.',
      'Log every quote on the Quote Log sheet and update its status. Quoted, accepted and win-rate figures update at the top.',
    ],
    tips: [
      'A quote is a fixed price. If you are not sure of the scope, send an estimate or a T&M rate sheet instead.',
      'Name the exclusions. "Roofing repairs beyond the curb seal" costs nothing to write and saves an argument on the roof.',
      'Ask for the deposit with the signature — an accepted quote with no deposit is a maybe.',
      'Follow up two days before the valid-until date. Expired quotes are the cheapest jobs to re-win.',
    ],
    feature: {
      text: 'In BuildWorkPro a quote is a bid: line items priced from your catalog with margin applied as a rate, sent as a branded PDF for e-signature, tracked from sent to accepted, and converted into a project in one click.',
      url: 'https://buildworkpro.com/features/construction-bidding/',
    },
  });
  return wb;
}
