// Submittal log + submittal transmittal (cover sheet). Excel: a log with live
// counts, days-in-review and submit-by math, plus a Transmittal sheet. PDF: two
// sections — landscape log, portrait cover sheet. Sample = Summit's mechanical
// submittals on the STORY job, status as of September 3, 2026.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'submittal-log',
  name: 'Submittal Log Template',
  basename: 'submittal-log-template',
  docName: 'Submittal log',
};

export const TYPES = [
  'Product Data',
  'Shop Drawings',
  'Samples',
  'Mock-up',
  'Calculations',
  'Certificates',
  'O&M / Closeout',
];
export const STATUSES = [
  'Not Submitted',
  'Submitted',
  'Approved',
  'Approved as Noted',
  'Revise and Resubmit',
  'Rejected',
];
const ACTIONS = [
  'For review and approval',
  'For information',
  'Resubmittal',
  'For record / closeout',
];
const SENT_VIA = ['Upload to GC portal', 'Email', 'Hand delivered', 'Courier'];

const BLANK_ROWS = 20;
const XLSX_ROWS = 40;
const REVIEW_DAYS = 14;

const d = (y, m, day) => new Date(Date.UTC(y, m - 1, day));
const DAY = 86400000;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (date) => (date ? `${MON[date.getUTCMonth()]} ${date.getUTCDate()}` : '');
const days = (a, b) => Math.round((b.getTime() - a.getTime()) / DAY);

const STATUS_DATE = d(2026, 9, 3);
const ARCH = 'Kestrel · A. Park';
const MEP = 'Kestrel · MEP eng.';
const SAMPLE = {
  statusDate: STATUS_DATE,
  contractRef: 'Subcontract SC-0412-M · Div. 22 & 23',
  rows: [
    [
      '23 74 13',
      'Packaged rooftop units RTU-1 to RTU-4 — product data & performance',
      'Product Data',
      0,
      d(2026, 6, 5),
      d(2026, 6, 19),
      'Approved as Noted',
      ARCH,
      d(2026, 8, 3),
      42,
    ],
    [
      '23 31 13',
      'Ductwork shop drawings — Level 1 mains & risers',
      'Shop Drawings',
      0,
      d(2026, 6, 8),
      d(2026, 6, 24),
      'Revise and Resubmit',
      ARCH,
      d(2026, 7, 13),
      14,
    ],
    [
      '23 31 13',
      'Ductwork shop drawings — Level 1 mains & risers',
      'Shop Drawings',
      1,
      d(2026, 6, 29),
      d(2026, 7, 8),
      'Approved',
      ARCH,
      d(2026, 7, 13),
      14,
    ],
    [
      '22 42 00',
      'Plumbing fixtures & trim schedule',
      'Product Data',
      0,
      d(2026, 6, 10),
      d(2026, 6, 26),
      'Approved as Noted',
      ARCH,
      d(2026, 10, 5),
      56,
    ],
    [
      '23 73 13',
      'AHU-3 indoor air-handling unit',
      'Product Data',
      0,
      d(2026, 6, 12),
      d(2026, 7, 1),
      'Approved',
      ARCH,
      d(2026, 8, 5),
      35,
    ],
    [
      '23 09 23',
      'BMS controls — sequences, points list, wiring diagrams',
      'Shop Drawings',
      0,
      d(2026, 7, 20),
      d(2026, 8, 12),
      'Revise and Resubmit',
      MEP,
      d(2026, 9, 14),
      21,
    ],
    [
      '23 09 23',
      'BMS controls — sequences, points list, wiring diagrams',
      'Shop Drawings',
      1,
      d(2026, 8, 24),
      null,
      'Submitted',
      MEP,
      d(2026, 9, 14),
      21,
    ],
    [
      '23 07 13',
      'Duct insulation — product data',
      'Product Data',
      0,
      d(2026, 7, 15),
      d(2026, 7, 29),
      'Approved',
      ARCH,
      d(2026, 9, 14),
      14,
    ],
    [
      '22 07 19',
      'Pipe insulation — product data',
      'Product Data',
      0,
      d(2026, 7, 15),
      d(2026, 7, 29),
      'Approved',
      ARCH,
      d(2026, 9, 21),
      14,
    ],
    [
      '23 05 53',
      'Pipe & valve identification — label samples',
      'Samples',
      0,
      d(2026, 8, 18),
      null,
      'Submitted',
      ARCH,
      d(2026, 10, 5),
      21,
    ],
    [
      '23 37 13',
      'Diffusers, registers & grilles — product data',
      'Product Data',
      0,
      d(2026, 8, 21),
      null,
      'Submitted',
      ARCH,
      d(2026, 9, 21),
      28,
    ],
    [
      '23 05 93',
      'TAB agency qualifications & test plan',
      'Certificates',
      0,
      null,
      null,
      'Not Submitted',
      MEP,
      d(2026, 11, 2),
      0,
    ],
    [
      '23 08 00',
      'Commissioning plan & checklists',
      'Product Data',
      0,
      null,
      null,
      'Not Submitted',
      MEP,
      d(2026, 11, 16),
      0,
    ],
  ].map(([spec, desc, type, rev, submitted, returned, status, reviewer, need, lead], i) => ({
    n: i + 1,
    spec,
    desc,
    type,
    rev,
    submitted,
    returned,
    status,
    reviewer,
    need,
    lead,
    inReview: submitted ? days(submitted, returned ?? STATUS_DATE) : null,
    submitBy: new Date(need.getTime() - (lead + REVIEW_DAYS) * DAY),
  })),
  transmittal: {
    number: 'T-011',
    date: 'August 21, 2026',
    submittal: '23 37 13-01',
    spec: '23 37 13 — Diffusers, Registers and Grilles',
    rev: '0',
    sentVia: 'Upload to GC portal',
    action: 'For review and approval',
    returnBy: 'September 4, 2026',
    sending: ['Product data', 'Samples'],
    items: [
      [
        '1',
        '1 PDF',
        'Ceiling diffusers — 24×24 modular plaque, neck sizes per schedule',
        '23 37 13',
        'Product Data',
        '0',
      ],
      [
        '2',
        '1 PDF',
        'Return & exhaust grilles, sidewall registers, opposed-blade dampers',
        '23 37 13',
        'Product Data',
        '0',
      ],
      ['3', '1 PDF', 'Finish schedule & manufacturer color chart', '23 37 13', 'Samples', '0'],
    ],
    remarks:
      'Reviewed for conformance with the contract documents. Neck sizes and locations coordinated with reflected ceiling plans A-601 and A-602; no deviations. Units are on a 4-week lead and are required on site September 21 — please return by September 4 to hold the schedule.',
  },
};
const countStatus = (list) => SAMPLE.rows.filter((r) => list.includes(r.status)).length;

/** Landscape compact header: the kit's fillable variant stacks the company
 *  fields vertically (~100px); on a landscape log that costs six rows, so the
 *  blank form lays the three company fields out in one row instead. */
function logHeader({ company, title, subtitle, fillable }) {
  if (!fillable) return H.compactHeader({ company, title, subtitle });
  const right = `<div class="row" style="gap:12px;width:470px;align-items:flex-end">${H.field({ name: 'co.name', label: 'Your company', flex: 1.3 })}${H.field({ name: 'co.line1', label: 'Address', flex: 1.2 })}${H.field({ name: 'co.line2', label: 'Phone · license no.', flex: 1 })}</div>`;
  return `<div class="hdr hdr-compact"><div class="col grow"><span class="title">${H.esc(title)}</span>${subtitle ? `<span class="sub">${H.esc(subtitle)}</span>` : ''}</div>${right}</div><div class="hdr-compact-rule"></div>`;
}

// ---------------------------------------------------------------------------
// PDF — section 1: landscape log
// ---------------------------------------------------------------------------
function logPage(s, company) {
  const columns = [
    { key: 'n', label: '#', width: 22, align: 'center', mono: true },
    { key: 'spec', label: 'Spec section', width: 56, mono: true },
    { key: 'desc', label: 'Description' },
    { key: 'type', label: 'Type', width: 64 },
    { key: 'rev', label: 'Rev', width: 26, align: 'center', mono: true },
    { key: 'submitted', label: 'Submitted', width: 50, align: 'center', mono: true },
    { key: 'returned', label: 'Returned', width: 50, align: 'center', mono: true },
    { key: 'days', label: 'Days in review', width: 40, align: 'right', mono: true },
    { key: 'status', label: 'Status', width: 84 },
    { key: 'reviewer', label: 'Reviewer', width: 72 },
    { key: 'need', label: 'Need on site', width: 52, align: 'center', mono: true },
    { key: 'lead', label: 'Lead (days)', width: 36, align: 'right', mono: true },
    { key: 'submitBy', label: 'Submit by', width: 52, align: 'center', mono: true },
  ];
  const rows = s
    ? s.rows.map((r) => ({
        cells: {
          n: String(r.n),
          spec: r.spec,
          desc: r.desc,
          type: r.type,
          rev: String(r.rev),
          submitted: fmt(r.submitted),
          returned: fmt(r.returned),
          days: r.inReview == null ? '' : String(r.inReview),
          status: r.status,
          reviewer: r.reviewer,
          need: fmt(r.need),
          lead: r.lead ? String(r.lead) : '—',
          submitBy: fmt(r.submitBy),
        },
      }))
    : [];
  return `
${logHeader({
  company,
  title: 'Submittal log',
  subtitle: s
    ? `Divisions 22 & 23 · status as of September 3, 2026 · review period ${REVIEW_DAYS} days`
    : 'Every product data sheet, shop drawing and sample owed — numbered, dated and statused',
  fillable: !s,
})}
<div style="margin-top:12px">
${H.metaRow([
  {
    label: 'Project',
    lines: [
      { text: s ? SAMPLE_PROJECT.name : '', strong: true, field: 'project.name' },
      { text: s ? `${SAMPLE_PROJECT.number} · ${SAMPLE_GC.name}` : '', field: 'project.number' },
      { text: s ? SAMPLE_PROJECT.address : '', field: 'project.address' },
    ],
  },
  {
    label: 'Contract / prepared by',
    lines: [
      { text: s ? s.contractRef : '', strong: true, field: 'log.contract' },
      {
        text: s ? 'Reviewer: Kestrel Design Group · Alison Park, Architect' : '',
        field: 'log.reviewer',
      },
      {
        text: s ? `Prepared by ${STORY.people.pm}, Project Manager` : '',
        field: 'log.prepared_by',
      },
    ],
  },
  {
    label: 'Status',
    kv: [
      {
        k: 'Status date · review period',
        v: s ? `Sep 3, 2026 · ${REVIEW_DAYS} days` : '',
        field: 'log.status_date',
        mono: true,
      },
      {
        k: 'Not submitted',
        v: s ? String(countStatus(['Not Submitted'])) : '',
        field: 'counts.not_submitted',
        mono: true,
      },
      {
        k: 'Submitted (in review)',
        v: s ? String(countStatus(['Submitted'])) : '',
        field: 'counts.submitted',
        mono: true,
      },
      {
        k: 'Approved / as noted',
        v: s ? String(countStatus(['Approved', 'Approved as Noted'])) : '',
        field: 'counts.approved',
        mono: true,
        strong: true,
      },
      {
        k: 'Revise / rejected',
        v: s ? String(countStatus(['Revise and Resubmit', 'Rejected'])) : '',
        field: 'counts.revise',
        mono: true,
      },
    ],
  },
])}
</div>
${H.table({ columns, rows, blankRows: s ? 0 : BLANK_ROWS, fieldPrefix: 'sub', variant: 'grid compact', rowHeight: 20 })}
<p class="micro ink3" style="margin-top:8px;line-height:1.45">Submit by = need-on-site date − lead time − review period. One row per submittal and a new row for each revision. Status: Not Submitted → Submitted → Approved / Approved as Noted (install to the markups) / Revise and Resubmit / Rejected. Days in review counts from the submitted date to the returned date, or to the status date while it sits with the reviewer.</p>
${H.finePrint('General-purpose form, not legal advice. Your specification (usually Division 01 — Submittal Procedures) sets the numbering, the review period, resubmittal rules and what a reviewer stamp does and does not approve. Follow it, and keep the returned copy with the transmittal.')}`;
}

// ---------------------------------------------------------------------------
// PDF — section 2: portrait cover sheet / transmittal
// ---------------------------------------------------------------------------
function coverPage(s, company) {
  const t = s ? s.transmittal : null;
  const itemCols = [
    { key: 'n', label: '#', width: 26, align: 'center', mono: true },
    { key: 'copies', label: 'Copies', width: 52, align: 'center' },
    { key: 'desc', label: 'Description of item' },
    { key: 'spec', label: 'Spec section', width: 76, mono: true },
    { key: 'type', label: 'Type', width: 84 },
    { key: 'rev', label: 'Rev', width: 36, align: 'center', mono: true },
  ];
  const itemRows = t
    ? t.items.map(([n, copies, desc, spec, type, rev]) => ({
        cells: { n, copies, desc, spec, type, rev },
      }))
    : [];
  return `
${H.header({ company, title: 'Submittal transmittal', number: t ? t.number : 'T-____', date: t ? t.date : undefined, fillable: !s })}
${H.metaRow([
  {
    label: 'To',
    lines: [
      { text: s ? SAMPLE_GC.name : '', strong: true, field: 'to.name' },
      { text: s ? SAMPLE_GC.line1 : '', field: 'to.line1' },
      { text: s ? SAMPLE_GC.line2 : '', field: 'to.line2' },
    ],
  },
  {
    label: 'Project',
    lines: [
      { text: s ? SAMPLE_PROJECT.name : '', strong: true, field: 'project.name' },
      { text: s ? SAMPLE_PROJECT.number : '', mono: true, field: 'project.number' },
      { text: s ? SAMPLE_PROJECT.address : '', field: 'project.address' },
    ],
  },
  {
    label: 'Submittal',
    kv: [
      {
        k: 'Submittal no.',
        v: t ? t.submittal : '',
        field: 'sub.number',
        mono: true,
        strong: true,
      },
      { k: 'Revision', v: t ? t.rev : '', field: 'sub.rev', mono: true },
      { k: 'Date sent', v: t ? 'Aug 21, 2026' : '', field: 'sub.date', mono: true },
      { k: 'Return requested by', v: t ? 'Sep 4, 2026' : '', field: 'sub.return_by', mono: true },
    ],
  },
])}
${H.fieldRow([
  H.field({ name: 'sub.spec', label: 'Specification section', value: t ? t.spec : '', flex: 1.6 }),
  H.field({
    name: 'sub.sent_via',
    label: 'Sent via',
    hint: SENT_VIA.join(' / ').toLowerCase(),
    value: t ? t.sentVia : '',
    flex: 1,
  }),
])}
${H.checkboxRow(
  'Action requested',
  ACTIONS.map((a) => ({
    name: `action.${a.toLowerCase().replace(/[^a-z]+/g, '_')}`,
    label: a,
    checked: !!t && t.action === a,
  }))
)}
${H.checkboxRow(
  'We are sending',
  [
    'Product data',
    'Shop drawings',
    'Samples',
    'Mock-up',
    'Calculations',
    'Certificates',
    'O&M / closeout',
  ].map((a) => ({
    name: `sending.${a.toLowerCase().replace(/[^a-z]+/g, '_')}`,
    label: a,
    checked: !!t && t.sending.includes(a),
  }))
)}
${H.table({ columns: itemCols, rows: itemRows, blankRows: s ? 0 : 6, fieldPrefix: 'item', rowHeight: 22 })}
${H.checkboxRow('Contractor review', [
  {
    name: 'review.conformance',
    label: 'Reviewed for conformance with the contract documents',
    checked: !!t,
  },
  { name: 'review.dimensions', label: 'Field dimensions verified / coordinated', checked: !!t },
  {
    name: 'review.deviations',
    label: 'Deviations from the specification are listed in remarks',
    checked: false,
  },
])}
${H.textarea({ name: 'remarks', label: 'Remarks', hint: 'why it matters to the schedule, deviations, what you need back and when', value: t ? t.remarks : '', height: 58 })}
${H.textarea({ name: 'reviewer_action', label: 'Reviewer action (for the reviewer)', hint: 'stamp, action taken, date returned, comments', value: '', height: 44 })}
${H.signatures({
  title: 'Transmitted',
  parties: [
    {
      name: 'Submitted by',
      sub: s ? SAMPLE_COMPANY.name : 'your company',
      fields: [
        { label: 'Signature', name: 'sig.sender' },
        {
          label: 'Printed name and title',
          name: 'sig.sender_name',
          value: s ? `${STORY.people.pm}, Project Manager` : '',
        },
        { label: 'Date', name: 'sig.sender_date', value: s ? '08/21/2026' : '' },
      ],
    },
    {
      name: 'Received by',
      sub: s ? SAMPLE_GC.name : 'general contractor / architect',
      fields: [
        { label: 'Signature', name: 'sig.receiver' },
        {
          label: 'Printed name and title',
          name: 'sig.receiver_name',
          value: s ? `${STORY.people.gcPm}, Project Manager` : '',
        },
        { label: 'Date', name: 'sig.receiver_date', value: s ? '08/21/2026' : '' },
      ],
    },
  ],
})}
${H.finePrint('A reviewer’s approval does not relieve the contractor of responsibility for dimensions, quantities, fabrication, coordination with other trades or compliance with the contract documents unless the deviation was specifically called out and accepted in writing. General-purpose form, not legal advice.')}`;
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const log = H.document({
    title: meta.name,
    pages: [logPage(s, company)],
    landscape: true,
    pageStart: 1,
    pageTotal: 2,
    footer: H.footerText(`${meta.docName} · ${s ? SAMPLE_PROJECT.number : ''}`.replace(/ · $/, '')),
  });
  const cover = H.document({
    title: `${meta.name} — transmittal`,
    pages: [coverPage(s, company)],
    css: `.sig{margin-top:14px}`,
    pageStart: 2,
    pageTotal: 2,
    footer: H.footerText(`Submittal transmittal · ${s ? SAMPLE.transmittal.number : 'T-____'}`),
  });
  return {
    sections: [
      { html: log, mode: 'pages', landscape: true },
      { html: cover, mode: 'pages', landscape: false },
    ],
    previews: [
      { section: 0, page: 0 },
      { section: 1, page: 0 },
    ],
  };
}

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------
export async function xlsx() {
  const wb = X.workbook({ title: meta.name });

  // ---- Sheet 1: the log ----
  const ws = X.sheet(wb, 'Submittal Log', { landscape: true, fitHeight: 0, printTitles: '10:10' });
  const COLS = 14;
  X.widths(ws, [5, 11, 42, 15, 5, 12, 12, 9, 19, 17, 12, 8, 12, 26]);
  let r = X.titleBlock(ws, {
    title: 'Submittal Log',
    subtitle:
      'One row per submittal, a new row for each revision. Status from the dropdown drives the counts; need-on-site and lead time drive the submit-by date.',
    cols: COLS,
    right: 'Print: landscape, one page wide',
    rightFrom: 12,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  const metaTop = r;
  X.kv(ws, r, 1, 'Project', null, { labelTo: 2, to: 3 });
  X.kv(ws, r, 4, 'Status date (blank = today)', null, { labelTo: 5, to: 7, numFmt: X.FMT.date });
  const STATUS = `$F$${r}`;
  r++;
  X.kv(ws, r, 1, 'Spec / contract ref.', null, { labelTo: 2, to: 3 });
  X.kv(ws, r, 4, 'Review period (days)', REVIEW_DAYS, { labelTo: 5, to: 7, numFmt: '0' });
  const REVIEW = `$F$${r}`;
  r++;
  X.kv(ws, r, 1, 'Prepared by', null, { labelTo: 2, to: 3 });
  X.kv(ws, r, 4, 'Reviewer', null, { labelTo: 5, to: 7 });
  r += 2;

  const head = r;
  X.headerRow(
    ws,
    head,
    [
      '#',
      'Spec section',
      'Description',
      'Type',
      'Rev',
      'Date submitted',
      'Date returned',
      'Days in review',
      'Status',
      'Reviewer',
      'Need on site',
      'Lead time (days)',
      'Submit by',
      'Notes / action required',
    ],
    {
      aligns: [
        'center',
        'left',
        'left',
        'left',
        'center',
        'center',
        'center',
        'right',
        'left',
        'left',
        'center',
        'right',
        'center',
        'left',
      ],
    }
  );
  const first = head + 1;
  const last = first + XLSX_ROWS - 1;
  const asOf = `IF(${STATUS}<>"",${STATUS},TODAY())`;
  for (let i = 0; i < XLSX_ROWS; i++) {
    const row = first + i;
    X.bodyRow(
      ws,
      row,
      [
        { value: i + 1, align: 'center', color: X.C.ink3 },
        { input: true },
        { input: true, wrap: true },
        { input: true },
        { input: true, align: 'center', numFmt: '0' },
        { input: true, numFmt: X.FMT.date, align: 'center' },
        { input: true, numFmt: X.FMT.date, align: 'center' },
        {
          formula: `IF(F${row}="","",IF(G${row}<>"",G${row},${asOf})-F${row})`,
          numFmt: '0',
          align: 'right',
        },
        { input: true },
        { input: true },
        { input: true, numFmt: X.FMT.date, align: 'center' },
        { input: true, numFmt: '0', align: 'right' },
        {
          formula: `IF(K${row}="","",K${row}-IF(L${row}="",0,L${row})-${REVIEW})`,
          numFmt: X.FMT.date,
          align: 'center',
        },
        { input: true, wrap: true },
      ],
      { height: 18 }
    );
  }
  X.dropdown(ws, `D${first}:D${last}`, TYPES);
  X.dropdown(ws, `I${first}:I${last}`, STATUSES);
  X.statusColors(ws, `I${first}:I${last}`, {
    'Approved as Noted': 'FFE6F4EA',
    Approved: 'FFE6F4EA',
    Revise: 'FFFDE8E6',
    Rejected: 'FFFDE8E6',
    Submitted: 'FFE3ECFF',
    'Not Submitted': 'FFFFF7E6',
  });
  // overdue with the reviewer: still Submitted and past the review period
  ws.addConditionalFormatting({
    ref: `H${first}:H${last}`,
    rules: [
      {
        type: 'expression',
        priority: 1,
        formulae: [`AND($I${first}="Submitted",$H${first}<>"",$H${first}>${REVIEW})`],
        style: {
          font: { color: { argb: X.C.deduct }, bold: true },
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE8E6' } },
        },
      },
    ],
  });
  // late to submit: not yet submitted and the submit-by date has passed (or was submitted after it)
  ws.addConditionalFormatting({
    ref: `M${first}:M${last}`,
    rules: [
      {
        type: 'expression',
        priority: 2,
        formulae: [
          `AND($M${first}<>"",OR(AND($I${first}="Not Submitted",$M${first}<${asOf}),AND($F${first}<>"",$F${first}>$M${first})))`,
        ],
        style: {
          font: { color: { argb: X.C.deduct }, bold: true },
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE8E6' } },
        },
      },
    ],
  });
  X.totalRow(ws, last + 1, [
    { value: '' },
    { value: 'Totals' },
    { formula: `"Submittals logged: "&COUNTA(C${first}:C${last})`, align: 'left' },
    {},
    {},
    { formula: `COUNT(F${first}:F${last})&" sent"`, align: 'center' },
    { formula: `COUNT(G${first}:G${last})&" back"`, align: 'center' },
    {
      formula: `IF(COUNT(H${first}:H${last})=0,"",ROUND(AVERAGE(H${first}:H${last}),0))`,
      numFmt: '0',
      align: 'right',
    },
    { value: 'avg days in review', align: 'left' },
    {},
    {},
    {},
    {
      formula: `COUNTIFS(I${first}:I${last},"Not Submitted",M${first}:M${last},"<"&${asOf})&" late"`,
      align: 'center',
    },
    {},
  ]);
  ws.getCell(last + 1, 9).font = { name: X.FONT, size: 8, italic: true, color: { argb: X.C.ink3 } };

  // ---- live counts, top right ----
  const counts = [
    ['Not submitted', `COUNTIF(I${first}:I${last},"Not Submitted")`],
    ['Submitted (in review)', `COUNTIF(I${first}:I${last},"Submitted")`],
    [
      'Approved + as noted',
      `COUNTIF(I${first}:I${last},"Approved")+COUNTIF(I${first}:I${last},"Approved as Noted")`,
    ],
  ];
  const counts2 = [
    [
      'Revise / rejected',
      `COUNTIF(I${first}:I${last},"Revise and Resubmit")+COUNTIF(I${first}:I${last},"Rejected")`,
    ],
    [
      'Overdue with reviewer',
      `COUNTIFS(I${first}:I${last},"Submitted",H${first}:H${last},">"&${REVIEW})`,
    ],
    [
      'Late to submit',
      `COUNTIFS(I${first}:I${last},"Not Submitted",M${first}:M${last},"<"&${asOf})`,
    ],
  ];
  counts.forEach(([lab, f], i) => {
    const row = metaTop + i;
    X.text(ws, row, 9, lab, { size: 9, color: X.C.ink2 });
    ws.getCell(row, 9).alignment = { vertical: 'middle' };
    X.calc(ws, row, 10, f, { numFmt: '0', bold: true, align: 'left' });
  });
  counts2.forEach(([lab, f], i) => {
    const row = metaTop + i;
    X.text(ws, row, 11, lab, { size: 9, color: X.C.ink2, merge: 12 });
    ws.getCell(row, 11).alignment = { vertical: 'middle' };
    X.calc(ws, row, 13, f, { numFmt: '0', bold: i > 0, align: 'left' });
    if (i > 0)
      ws.getCell(row, 13).font = {
        name: X.FONT,
        size: 10,
        bold: true,
        color: { argb: X.C.deduct },
      };
  });
  ws.views = [{ state: 'frozen', xSplit: 3, ySplit: head, showGridLines: false }];
  r = last + 3;
  X.noteRow(
    ws,
    r,
    'Submit by = need-on-site date − lead time − review period. Days in review counts to the returned date, or to the status date (today if blank) while the submittal is with the reviewer. Red = overdue with the reviewer, or a submit-by date that has passed without a submission.',
    COLS,
    { height: 30 }
  );
  r += 2;
  X.brandFooter(
    ws,
    r,
    COLS,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Follow your Division 01 submittal procedures for numbering, review periods and resubmittals. General-purpose template, not a contract document.'
  );
  ws.pageSetup.printArea = `A1:N${r}`;

  // ---- Sheet 2: transmittal / cover sheet ----
  const tr = X.sheet(wb, 'Transmittal', { fitHeight: 1 });
  X.widths(tr, [5, 10, 44, 14, 14, 8]);
  let t = X.titleBlock(tr, {
    title: 'Submittal Transmittal',
    subtitle:
      'Cover sheet for one submittal package. Fill it in, print it (fits one page) or save as PDF, and log the submittal on the Submittal Log sheet.',
    cols: 6,
    right: 'Print: portrait, one page',
    rightFrom: 4,
  });
  X.inputLegend(tr, t, 1);
  t += 2;
  X.label(tr, t, 1, 'To');
  X.label(tr, t, 4, 'Transmittal');
  t++;
  X.kv(tr, t, 1, 'Company', null, { labelTo: 2, to: 3 });
  X.kv(tr, t, 4, 'Transmittal no.', null, { to: 6 });
  t++;
  X.kv(tr, t, 1, 'Attention', null, { labelTo: 2, to: 3 });
  X.kv(tr, t, 4, 'Date sent', null, { to: 6, numFmt: X.FMT.date });
  const SENT = `E${t}`;
  t++;
  X.kv(tr, t, 1, 'Project', null, { labelTo: 2, to: 3 });
  X.kv(tr, t, 4, 'Review period (days)', REVIEW_DAYS, { to: 6, numFmt: '0' });
  const REV_DAYS = `E${t}`;
  t++;
  X.kv(tr, t, 1, 'Project number', null, { labelTo: 2, to: 3 });
  X.text(tr, t, 4, 'Return requested by', { size: 9, color: X.C.ink2 });
  X.calc(tr, t, 5, `IF(${SENT}="","",${SENT}+${REV_DAYS})`, {
    numFmt: X.FMT.date,
    align: 'left',
    bold: true,
  });
  tr.mergeCells(t, 5, t, 6);
  t += 2;
  X.label(tr, t, 1, 'Submittal');
  t++;
  X.kv(tr, t, 1, 'Submittal no. / rev', null, { labelTo: 2, to: 3 });
  X.kv(tr, t, 4, 'Sent via', null, { to: 6 });
  X.dropdown(tr, `E${t}:F${t}`, SENT_VIA);
  t++;
  X.kv(tr, t, 1, 'Specification section', null, { labelTo: 2, to: 3 });
  X.kv(tr, t, 4, 'Action requested', null, { to: 6 });
  X.dropdown(tr, `E${t}:F${t}`, ACTIONS);
  t += 2;
  X.headerRow(tr, t, ['#', 'Copies', 'Description of item', 'Spec section', 'Type', 'Rev'], {
    aligns: ['center', 'center', 'left', 'left', 'left', 'center'],
  });
  t++;
  for (let i = 0; i < 8; i++) {
    X.bodyRow(tr, t, [
      { value: i + 1, align: 'center', color: X.C.ink3 },
      { input: true, align: 'center' },
      { input: true, wrap: true },
      { input: true },
      { input: true },
      { input: true, align: 'center' },
    ]);
    X.dropdown(tr, `E${t}`, TYPES);
    t++;
  }
  t++;
  X.label(tr, t, 1, 'Contractor review');
  t++;
  X.text(
    tr,
    t,
    1,
    '☐  Reviewed for conformance with the contract documents     ☐  Field dimensions verified / coordinated     ☐  Deviations listed in remarks',
    { size: 9, color: X.C.ink2, merge: 6 }
  );
  t += 2;
  X.label(
    tr,
    t,
    1,
    'Remarks — why it matters to the schedule, deviations, what you need back and when'
  );
  t++;
  tr.mergeCells(t, 1, t + 3, 6);
  X.input(tr, t, 1, null, { wrap: true });
  for (let i = 0; i < 4; i++) tr.getRow(t + i).height = 18;
  tr.getCell(t, 1).alignment = { vertical: 'top', wrapText: true };
  t += 5;
  t = X.signatureBlock(tr, t, ['Submitted by', 'Received by'], { cols: [1, 4], width: 3 }) + 1;
  X.brandFooter(
    tr,
    t,
    6,
    'Free template by BuildWorkPro — buildworkpro.com/templates. A reviewer’s approval does not relieve the contractor of responsibility for dimensions, quantities, coordination or compliance with the contract documents unless a deviation was specifically accepted in writing.'
  );
  tr.pageSetup.printArea = `A1:F${t}`;

  X.howToSheet(wb, {
    title: 'Submittal Log Template',
    steps: [
      'Enter the project, the reviewer and the review period your Division 01 specification allows (14 days is common; some contracts say 10 or 21). Set a status date if you are reporting as of a specific day.',
      'Log every submittal the spec requires — one row each, numbered by spec section (23 74 13-01, 23 74 13-02 …). Pick the type from the dropdown and add a new row for each revision rather than overwriting.',
      'Enter the date each item is needed on site and its lead time in days. Submit by calculates backwards: need-on-site − lead time − review period. That is the date you must send it to protect the schedule.',
      'Record the submitted and returned dates and set the status from the dropdown as it moves: Not Submitted → Submitted → Approved, Approved as Noted, Revise and Resubmit or Rejected. Days in review and the counts update live.',
      'Watch the red cells: a red days-in-review means the reviewer is past the review period (send a reminder, citing the spec); a red submit-by date means you are late to submit and fabrication is at risk.',
      'Use the Transmittal sheet as the cover for each package: it fills the return-by date from the review period, and the received-by signature proves when the reviewer got it.',
    ],
    tips: [
      'Work backwards from the install date, not forward from today. Six-week lead items with a two-week review need eight weeks — plus a resubmittal cycle if the first one comes back marked up.',
      '"Approved as Noted" means build to the markups. Read every note and log a resubmittal if a note changes cost or scope — then write the RFI or change order it triggers.',
      'One product per row. Three items on one line is how "approved as noted" becomes an argument about which note applied to which item.',
      'Keep the returned copy with the transmittal. The reviewer stamp and date are what you produce when a delay claim asks who held the schedule.',
    ],
    feature: {
      text: 'In BuildWorkPro, project documents, tasks and closeout live on the same project as your RFIs, change orders and pay applications — so shop drawings and product data are attached to the job, not a side spreadsheet.',
      url: 'https://buildworkpro.com/features/project-management/',
    },
  });
  return wb;
}
