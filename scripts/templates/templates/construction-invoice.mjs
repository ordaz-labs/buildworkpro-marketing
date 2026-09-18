// Contractor invoice — a one-page fillable PDF with a hero amount due, a Word
// document, and an Excel workbook that computes line amounts, sales tax on
// taxable lines, retainage held, payments received and the balance due.
// Mirrors the invoice the main app renders (server/lib/pdf/documents/invoice.tsx).
//
// Local helper (docx): heroTable() — a boxed amount-due row the Word kit lacks.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_OWNER } from '../kit/tokens.mjs';

export const meta = {
  slug: 'construction-invoice',
  name: 'Contractor Invoice Template',
  basename: 'construction-invoice-template',
  docName: 'Invoice',
};

const TERMS = ['Due on receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60'];
const round2 = (n) => Math.round(n * 100) / 100;

// Sample: work Summit does directly for the owner, outside the Brightline
// subcontract — a server-room cooling add in the owner's existing Building A.
// Direct-to-owner is what an invoice is for; work under the GC goes on the
// pay application instead.
const SAMPLE = {
  number: 'INV-2026-0147',
  issued: 'September 8, 2026',
  due: 'October 8, 2026',
  terms: 'Net 30',
  po: 'Owner work authorization dated Aug 12, 2026 · PO HP-1187',
  billTo: { name: SAMPLE_OWNER.name, line1: SAMPLE_OWNER.line1, line2: 'Attn: Accounts Payable' },
  project: {
    name: 'Harbor Point Medical Office — Building A, Suite 210',
    sub: 'Server room cooling: two ductless split systems',
    address: '2200 Harbor Point Blvd, Denver, CO 80216',
  },
  items: [
    {
      desc: 'Ductless mini-split system, 2-ton wall-mount heat pump',
      sub: 'Indoor head, outdoor unit, remote',
      qty: 2,
      unit: 'EA',
      price: 2840,
      tax: true,
    },
    {
      desc: 'Line set, 25 ft insulated, with wall sleeve',
      qty: 2,
      unit: 'EA',
      price: 196,
      tax: true,
    },
    { desc: 'Condensate pump', qty: 2, unit: 'EA', price: 118, tax: true },
    { desc: 'Disconnect, whip and equipment pad', qty: 2, unit: 'EA', price: 145, tax: true },
    {
      desc: 'Installation labor — journeyman and apprentice',
      qty: 24,
      unit: 'HR',
      price: 98,
      tax: false,
    },
    {
      desc: 'Electrical — dedicated 240 V circuits from panel (subcontracted)',
      qty: 1,
      unit: 'LS',
      price: 1180,
      tax: false,
    },
    {
      desc: 'Startup, refrigerant charge, test and owner walkthrough',
      qty: 1,
      unit: 'LS',
      price: 340,
      tax: false,
    },
  ],
  taxRate: 8.81,
  retainagePct: 5,
  paid: 3000,
  paidNote: 'deposit 08/14/2026',
  howToPay:
    'By check payable to Summit Mechanical Contractors, 4120 Industrial Way, Suite 200, Denver, CO 80216, or by ACH — routing and account on request at office@summitmech.com. Write INV-2026-0147 on the memo line.',
  notes:
    'Work completed September 4, 2026. Retainage of 5% held per the owner work authorization, released on final acceptance. One-year warranty on parts and labor from completion.',
  paymentTerms:
    'Payment is due within 30 days of the invoice date. Balances past due accrue a late charge of 1.5% per month (18% per year). Sales tax is charged on materials only; labor and subcontracted electrical are not taxable in Colorado.',
};

function compute(s) {
  const lines = s.items.map((i) => ({ ...i, amount: round2(i.qty * i.price) }));
  const subtotal = round2(lines.reduce((a, l) => a + l.amount, 0));
  const taxable = round2(lines.filter((l) => l.tax).reduce((a, l) => a + l.amount, 0));
  const tax = round2(taxable * (s.taxRate / 100));
  const total = round2(subtotal + tax);
  const retainage = round2(subtotal * (s.retainagePct / 100));
  const balance = round2(total - retainage - s.paid);
  return { lines, subtotal, taxable, tax, total, retainage, balance };
}

export const INVOICE_SAMPLE = { ...SAMPLE, ...compute(SAMPLE) };

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------
export function html({ sample }) {
  const s = sample ? INVOICE_SAMPLE : null;
  const fillable = !sample;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };

  const cols = [
    { key: 'n', label: '#', width: 26, align: 'center', mono: true },
    { key: 'desc', label: 'Description' },
    { key: 'qty', label: 'Qty', width: 44, align: 'right' },
    { key: 'unit', label: 'Unit', width: 40, align: 'center' },
    { key: 'price', label: 'Unit price', width: 78, align: 'right' },
    { key: 'tax', label: 'Taxable', width: 46, align: 'center' },
    { key: 'amount', label: 'Amount', width: 84, align: 'right' },
  ];
  const rows = s
    ? s.lines.map((l, i) => ({
        cells: {
          n: String(i + 1),
          desc: l.desc,
          qty: String(l.qty),
          unit: l.unit,
          price: H.money(l.price),
          tax: l.tax ? 'Yes' : '—',
          amount: H.money(l.amount),
        },
        sub: l.sub,
      }))
    : [];

  const body = `
${H.header({ company, title: 'Invoice', number: s ? s.number : 'INV-____', date: s ? s.issued : undefined, fillable })}
${H.metaRow([
  {
    label: 'Bill to',
    lines: [
      { text: s ? s.billTo.name : '', strong: true, field: 'billto.name' },
      { text: s ? s.billTo.line1 : '', field: 'billto.line1' },
      { text: s ? s.billTo.line2 : '', field: 'billto.line2' },
    ],
  },
  {
    label: 'Project / job',
    lines: [
      { text: s ? s.project.name : '', strong: true, field: 'project.name' },
      { text: s ? s.project.sub : '', field: 'project.sub' },
      { text: s ? s.project.address : '', field: 'project.address' },
    ],
  },
  {
    label: 'Invoice',
    kv: [
      { k: 'Issued', v: s ? s.issued : '', field: 'invoice.issued' },
      { k: 'Due', v: s ? s.due : '', field: 'invoice.due', strong: true },
      { k: 'Terms', v: s ? s.terms : '', field: 'invoice.terms' },
      { k: 'PO / reference', v: s ? 'PO HP-1187' : '', field: 'invoice.po' },
    ],
  },
])}
${H.hero({
  label: 'Amount due',
  sub: s ? `Due ${s.due} · ${s.terms} · ${s.po}` : 'Due date · terms · reference',
  amount: s ? H.money(s.balance) : '',
  field: 'amount_due',
})}
${H.table({ columns: cols, rows, blankRows: sample ? 0 : 10, fieldPrefix: 'item', rowHeight: 22 })}
${H.split(
  `${H.textarea({ name: 'how_to_pay', label: 'How to pay', hint: 'check payable to, ACH details, memo line', value: s ? s.howToPay : '', height: 54 })}
${H.textarea({ name: 'notes', label: 'Notes', hint: 'completion date, retainage terms, warranty', value: s ? s.notes : '', height: 44 })}`,
  H.totals([
    { label: 'Subtotal', value: s ? H.money(s.subtotal) : '', field: 'tot.subtotal' },
    { label: 'Taxable amount', value: s ? H.money(s.taxable) : '', field: 'tot.taxable' },
    {
      label: `Sales tax (${s ? `${s.taxRate}%` : '____ %'})`,
      value: s ? H.money(s.tax) : '',
      field: 'tot.tax',
    },
    { label: 'Total', value: s ? H.money(s.total) : '', field: 'tot.total' },
    {
      label: `Less retainage held (${s ? `${s.retainagePct}%` : '____ %'})`,
      value: s ? '- ' + H.money(s.retainage) : '',
      field: 'tot.retainage',
      tone: 'deduct',
    },
    {
      label: `Less payments received${s ? ` (${s.paidNote})` : ''}`,
      value: s ? '- ' + H.money(s.paid) : '',
      field: 'tot.paid',
      tone: 'deduct',
    },
    { label: 'Balance due', value: s ? H.money(s.balance) : '', total: true, field: 'tot.balance' },
  ]),
  [1.1, 1]
)}
${H.textarea({ name: 'terms', label: 'Payment terms', hint: 'due date, late charge, what is and is not taxed', value: s ? s.paymentTerms : '', height: 30 })}
${H.finePrint('An invoice bills a complete amount for work or service — direct-to-owner jobs, service calls, T&M work. If you are billing a general contractor monthly against a schedule of values with retainage, use an application for payment instead. Confirm sales tax treatment of labor and materials for your state.')}`;

  return {
    sections: [
      {
        html: H.document({
          title: meta.name,
          pages: [body],
          footer: H.footerText(`${meta.docName} · ${s ? s.number : 'INV-____'}`),
        }),
        mode: 'pages',
        landscape: false,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Word
// ---------------------------------------------------------------------------
function heroTable() {
  const W = D.CONTENT_W;
  const lw = Math.round(W * 0.6);
  const border = { style: D.BorderStyle.SINGLE, size: 6, color: D.C.rule };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new D.Table({
    width: { size: W, type: D.WidthType.DXA },
    columnWidths: [lw, W - lw],
    layout: 'fixed',
    borders: { ...borders, insideHorizontal: border, insideVertical: border },
    rows: [
      new D.TableRow({
        children: [
          new D.TableCell({
            width: { size: lw, type: D.WidthType.DXA },
            borders,
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              D.label('Amount due', { after: 20 }),
              D.p('Due date · terms · reference', { size: 8.5, color: D.C.ink2, after: 0 }),
            ],
          }),
          new D.TableCell({
            width: { size: W - lw, type: D.WidthType.DXA },
            borders,
            shading: { type: D.ShadingType.CLEAR, fill: D.C.input, color: 'auto' },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            verticalAlign: 'center',
            children: [
              D.p([D.run('$', { size: 18, bold: true })], {
                align: D.AlignmentType.RIGHT,
                after: 0,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** Two labelled amber boxes side by side (how to pay · notes). */
function twoBoxes(left, right, lines = 2) {
  const W = D.CONTENT_W;
  const gap = 300;
  const w = Math.floor((W - gap) / 2);
  const border = { style: D.BorderStyle.SINGLE, size: 4, color: D.C.rule };
  const box = (b) => {
    const paras = [D.p('', { after: 0, size: 9.5 })];
    for (let i = 1; i < lines; i++) paras.push(D.p('', { after: 0 }));
    return new D.TableCell({
      width: { size: w, type: D.WidthType.DXA },
      borders: D.noBorders,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [
        D.label(b.label, { after: 30 }),
        D.p(b.hint, { size: 8, italic: true, color: D.C.ink3, after: 30 }),
        new D.Table({
          width: { size: w, type: D.WidthType.DXA },
          columnWidths: [w],
          layout: 'fixed',
          borders: D.noBorders,
          rows: [
            new D.TableRow({
              cantSplit: true,
              children: [
                new D.TableCell({
                  width: { size: w, type: D.WidthType.DXA },
                  shading: { type: D.ShadingType.CLEAR, fill: D.C.input, color: 'auto' },
                  borders: { top: border, bottom: border, left: border, right: border },
                  margins: { top: 80, bottom: 80, left: 100, right: 100 },
                  children: paras,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };
  const spacer = new D.TableCell({
    width: { size: gap, type: D.WidthType.DXA },
    borders: D.noBorders,
    children: [D.p('', { after: 0 })],
  });
  return new D.Table({
    width: { size: W, type: D.WidthType.DXA },
    columnWidths: [w, gap, w],
    layout: 'fixed',
    borders: D.noBorders,
    rows: [new D.TableRow({ cantSplit: true, children: [box(left), spacer, box(right)] })],
  });
}

export async function docx() {
  const W = D.CONTENT_W;
  const children = [
    ...D.companyHeader({
      title: 'Invoice',
      number: 'Invoice no. ________',
      date: 'Date ____________',
    }),
    D.metaRow([
      {
        label: 'Bill to',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Project / job',
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
        { label: 'Issue date', width: Math.round(W * 0.25) },
        { label: 'Due date', width: Math.round(W * 0.25) },
        { label: 'Terms', width: Math.round(W * 0.25) },
        { label: 'PO / reference', width: W - 3 * Math.round(W * 0.25) },
      ],
    ]),
    D.spacer(4),
    heroTable(),
    D.spacer(2),
    D.table({
      columns: [
        { label: '#', width: 500, align: 'center' },
        { label: 'Description', width: 4700 },
        { label: 'Qty', width: 800, align: 'right' },
        { label: 'Unit', width: 700, align: 'center' },
        { label: 'Unit price', width: 1300, align: 'right' },
        { label: 'Taxable', width: 1100, align: 'center' },
        { label: 'Amount', width: W - 500 - 4700 - 800 - 700 - 1300 - 1100, align: 'right' },
      ],
      blankRows: 6,
      blankHeight: 280,
    }),
    D.spacer(2),
    D.ladder(
      [
        { k: 'Subtotal', v: '$', input: true },
        { k: 'Sales tax on taxable lines (____ %)', v: '$', input: true },
        { k: 'Total', v: '$', input: true },
        { k: 'Less retainage held (____ %)', v: '$', input: true },
        { k: 'Less payments received', v: '$', input: true },
        { k: 'Balance due', v: '$', total: true, input: true },
      ],
      { kWidth: 7400 }
    ),
    D.spacer(2),
    twoBoxes(
      { label: 'How to pay', hint: 'Check payable to, ACH details, memo line.' },
      { label: 'Notes to customer', hint: 'Completion date, retainage release, warranty.' }
    ),
    D.spacer(4),
    D.label('Payment terms'),
    D.p(
      'Payment is due within ______ days of the invoice date. Balances past due accrue a late charge of ______ % per month. Sales tax is charged on ______________________ only.',
      { size: 9.5, after: 120 }
    ),
    D.fine(
      'Bills a complete amount for work or service. Billing a general contractor monthly against a schedule of values with retainage? Use an application for payment instead. Confirm sales tax treatment for your state. Not legal or accounting advice.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Invoice' });
}

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------
export async function xlsx() {
  const wb = X.workbook({ title: meta.name });
  const ws = X.sheet(wb, 'Invoice', { fitHeight: 1 });
  X.widths(ws, [14, 34, 8, 8, 13, 9, 15]);
  let r = X.titleBlock(ws, {
    title: 'Invoice',
    subtitle:
      'Line items, sales tax on taxable lines, retainage held and payments received compute to the balance due.',
    cols: 7,
    right: 'Print: fits one page',
    rightFrom: 5,
  });
  X.inputLegend(ws, r, 1);
  r += 2;

  X.label(ws, r, 1, 'Your company');
  X.label(ws, r, 3, 'Invoice');
  r++;
  X.kv(ws, r, 1, 'Company', null, { to: 2 });
  X.kv(ws, r, 3, 'Invoice no.', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Address', null, { to: 2 });
  X.kv(ws, r, 3, 'Issue date', null, { labelTo: 4, to: 7, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Phone · email', null, { to: 2 });
  X.kv(ws, r, 3, 'Due date', null, { labelTo: 4, to: 7, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'License no.', null, { to: 2 });
  X.kv(ws, r, 3, 'Terms', null, { labelTo: 4, to: 7 });
  X.dropdown(ws, `E${r}:G${r}`, TERMS);
  r += 2;
  X.label(ws, r, 1, 'Bill to');
  X.label(ws, r, 3, 'Project / job');
  r++;
  X.kv(ws, r, 1, 'Customer', null, { to: 2 });
  X.kv(ws, r, 3, 'Project name', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Address', null, { to: 2 });
  X.kv(ws, r, 3, 'Site address', null, { labelTo: 4, to: 7 });
  r++;
  X.kv(ws, r, 1, 'Contact', null, { to: 2 });
  X.kv(ws, r, 3, 'PO / reference', null, { labelTo: 4, to: 7 });
  r += 2;

  const heroRow = r;
  r += 3;

  X.headerRow(ws, r, ['#', 'Description', 'Qty', 'Unit', 'Unit price', 'Taxable', 'Amount'], {
    aligns: ['center', 'left', 'right', 'center', 'right', 'center', 'right'],
  });
  r++;
  const first = r;
  for (let i = 0; i < 15; i++) {
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
  X.text(ws, r, 2, 'Taxable amount (lines marked Y)', { align: 'right', color: X.C.ink2, size: 9 });
  X.calc(ws, r, 7, `SUMIFS(G${first}:G${last},F${first}:F${last},"Y")`, { numFmt: X.FMT.money });
  const taxableRow = r;
  r++;
  X.text(ws, r, 2, 'Sales tax on taxable amount — enter rate →', {
    align: 'right',
    color: X.C.ink2,
    size: 9,
  });
  X.input(ws, r, 6, 0, { numFmt: '0.00%', align: 'right' });
  X.calc(ws, r, 7, `ROUND(G${taxableRow}*F${r},2)`, { numFmt: X.FMT.money });
  const taxRow = r;
  r++;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Total' },
    {},
    {},
    {},
    {},
    { formula: `G${subtotalRow}+G${taxRow}`, numFmt: X.FMT.money },
  ]);
  const totalRow = r;
  r++;
  X.text(ws, r, 2, 'Less retainage held on the subtotal — enter rate →', {
    align: 'right',
    color: X.C.ink2,
    size: 9,
  });
  X.input(ws, r, 6, 0, { numFmt: X.FMT.pct, align: 'right' });
  X.calc(ws, r, 7, `ROUND(G${subtotalRow}*F${r},2)`, { numFmt: X.FMT.money });
  const retRow = r;
  r++;
  X.text(ws, r, 2, 'Less payments received (deposits, prior payments)', {
    align: 'right',
    color: X.C.ink2,
    size: 9,
  });
  X.input(ws, r, 7, null, { numFmt: X.FMT.moneyBlank, align: 'right' });
  const paidRow = r;
  r++;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'BALANCE DUE' },
    {},
    {},
    {},
    {},
    { formula: `G${totalRow}-G${retRow}-G${paidRow}`, numFmt: X.FMT.money },
  ]);
  ws.getCell(r, 7).border = {
    top: { style: 'medium', color: { argb: X.C.ink } },
    bottom: { style: 'medium', color: { argb: X.C.ink } },
    left: { style: 'medium', color: { argb: X.C.ink } },
    right: { style: 'medium', color: { argb: X.C.ink } },
  };
  ws.getCell(r, 7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: X.C.band } };
  const balanceRow = r;
  r += 2;

  X.heroCell(ws, heroRow, 5, 'Amount due', `G${balanceRow}`, { merge: 7 });
  X.text(ws, heroRow + 1, 1, 'Balance due after tax, retainage held and payments received.', {
    merge: 4,
    size: 8.5,
    italic: true,
    color: X.C.ink2,
  });

  X.label(ws, r, 1, 'How to pay — check payable to, ACH details, memo line');
  r++;
  ws.mergeCells(r, 1, r + 1, 7);
  X.input(ws, r, 1, null, { wrap: true });
  ws.getRow(r).height = 20;
  ws.getRow(r + 1).height = 20;
  r += 3;
  X.label(ws, r, 1, 'Notes — completion date, retainage release, warranty');
  r++;
  ws.mergeCells(r, 1, r + 1, 7);
  X.input(ws, r, 1, null, { wrap: true });
  ws.getRow(r).height = 20;
  ws.getRow(r + 1).height = 20;
  r += 3;
  X.label(ws, r, 1, 'Payment terms — due date, late charge, what is taxed');
  r++;
  ws.mergeCells(r, 1, r + 1, 7);
  X.input(ws, r, 1, null, { wrap: true });
  ws.getRow(r).height = 20;
  ws.getRow(r + 1).height = 20;
  r += 3;
  X.brandFooter(
    ws,
    r,
    7,
    'Free template by BuildWorkPro — buildworkpro.com/templates. For progress billing against a schedule of values with retainage, use the free pay application template instead. Confirm sales tax treatment of labor and materials for your state.'
  );
  ws.pageSetup.printArea = `A1:G${r}`;

  X.howToSheet(wb, {
    title: 'Contractor Invoice Template',
    steps: [
      'Fill in your company, the customer, the project and the invoice number, dates and terms. Amber cells are inputs; pick the terms from the dropdown and state the due date as a date.',
      'Enter one line per item of work, material or service: description, quantity, unit and unit price. The amount computes. Mark each line Y or N in the Taxable column.',
      'Enter your sales tax rate. Tax is charged only on the lines marked Y, so labor and subcontracted work can stay untaxed where your state exempts them.',
      'If the customer holds retainage, enter the rate — it is figured on the subtotal, before tax. Enter any deposit or prior payment on the payments line. The balance due and the Amount due box compute.',
      'Fill in how to pay, notes and payment terms, then print (fits one page) or save as PDF and send. Number invoices in sequence and never reuse a number.',
    ],
    tips: [
      'State the due date as a date, not just "Net 30" — an invoice with a date on it gets paid before one with a term.',
      'Billing a GC monthly against a schedule of values? That is a pay application, not an invoice. Use the free pay application template; some GCs want both.',
      'Attach the signed T&M ticket or work order as backup. Invoices with backup get paid; invoices without get questioned.',
    ],
    feature: {
      text: 'In BuildWorkPro invoices are generated from your projects and approved pay applications, numbered automatically, emailed with the PDF attached, and synced to QuickBooks Online.',
      url: 'https://buildworkpro.com/features/pay-applications/',
    },
  });
  return wb;
}
