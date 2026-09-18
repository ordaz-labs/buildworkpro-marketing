// Request for information — one-page form (PDF fillable), Word, and an Excel
// RFI log with a days-open formula and overdue highlighting.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'rfi',
  name: 'RFI Template',
  basename: 'rfi-template',
  docName: 'Request for information',
};

const IMPACT = ['None', 'Possible', 'Likely'];
const RESPONSE_TYPES = [
  'Clarification only — no change to contract',
  'Change — price and time by change order',
  'Rejected — proceed per contract documents',
];

// RFI-014 — the question that produced M-402 Rev. 2 and CO-003.
const SAMPLE = {
  number: 'RFI-014',
  date: 'August 24, 2026',
  responseBy: 'August 31, 2026',
  to: {
    name: 'Kestrel Design Group · Alison Park, AIA',
    line1: 'Architect of record',
    line2: `via Brightline Builders — ${STORY.people.gcPm}, Project Manager`,
  },
  from: `Summit Mechanical — ${STORY.people.pm}, PM`,
  subject: 'AHU-3 condensate drain — no drain or point of discharge shown on M-402',
  spec: '23 05 00 · para. 3.4.B',
  drawing: 'M-402 · P-201',
  discipline: 'Mechanical / plumbing',
  question:
    'M-402 (Level 2 mechanical plan) locates AHU-3 in Mechanical Room 214 but shows no condensate drain line or point of discharge. P-201 shows floor sink FS-2 in Room 214 approximately 32 ft from the unit, at the opposite end of the room. Spec 23 05 00 para. 3.4.B requires condensate piped to an approved receptor with a trap per the manufacturer.\nPlease confirm: (1) the point of discharge for AHU-3 condensate, and (2) the routing and pipe material, given the 2" coil connection on the approved submittal (23 74 13-02).',
  suggested:
    'Route a 2" Type L copper condensate drain from the AHU-3 coil connection, trapped per the manufacturer’s detail, along the north wall of Room 214 and core-drilled through the slab to discharge at FS-2 per P-201. Copper in lieu of PVC given proximity to the reheat coil. Summit will price the added drain as a change order if this routing is accepted.',
  cost: 'Likely',
  schedule: 'Possible',
  hold: 'No',
  holdNote: 'AHU-3 set proceeds; final drain piping on hold',
  response:
    'Confirmed. Route per the contractor’s suggested routing. Revised M-402 Rev. 2 issued 9/2/2026 adds the 2" condensate drain and slab penetration detail 6/M-402. Contractor to submit pricing as a change order; no adjustment to contract time is accepted by this response.',
  respondedBy: 'Alison Park, AIA — Kestrel Design Group',
  respondedDate: 'September 2, 2026',
  responseType: 'Change — price and time by change order',
  distribution: 'Brightline (M. Reed) · Summit (D. Whitfield) · project file',
};

const impactBoxes = (group, value) =>
  IMPACT.map((i) => ({ name: `${group}.${i.toLowerCase()}`, label: i, checked: value === i }));

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };

  const body = `
${H.header({ company, title: 'Request for information', number: s ? s.number : 'RFI-____', date: s ? s.date : undefined, fillable: !sample })}
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
    label: 'To (architect / engineer / GC)',
    lines: [
      { text: s ? s.to.name : '', strong: true, field: 'to.name' },
      { text: s ? s.to.line1 : '', field: 'to.line1' },
      { text: s ? s.to.line2 : '', field: 'to.line2' },
    ],
  },
  {
    label: 'RFI',
    kv: [
      { k: 'Date submitted', v: s ? s.date : '', field: 'rfi.date' },
      { k: 'Response required by', v: s ? s.responseBy : '', field: 'rfi.response_by' },
      { k: 'Spec section', v: s ? s.spec : '', field: 'rfi.spec', mono: true },
      { k: 'Drawing / detail', v: s ? s.drawing : '', field: 'rfi.drawing', mono: true },
      { k: 'Discipline', v: s ? s.discipline : '', field: 'rfi.discipline' },
    ],
  },
])}
${H.fieldRow([
  H.field({
    name: 'subject',
    label: 'Subject',
    hint: 'one question per RFI',
    value: s ? s.subject : '',
    flex: 2,
  }),
  H.field({
    name: 'from',
    label: 'From (contractor · name, title)',
    value: s ? s.from : '',
    flex: 1.3,
  }),
])}
${H.textarea({ name: 'question', label: 'Information requested', hint: 'state the question; cite the drawing, detail, spec paragraph or field condition — one question per RFI', value: s ? s.question : '', height: 82 })}
${H.textarea({ name: 'suggested', label: "Contractor's suggested answer", hint: 'a proposed reading gets a faster yes / no than an open question', value: s ? s.suggested : '', height: 54 })}
<div class="row" style="gap:20px;margin-top:2px">
  <div class="col" style="flex:1">${H.checkboxRow('Cost impact if unanswered', impactBoxes('impact.cost', s?.cost))}</div>
  <div class="col" style="flex:1">${H.checkboxRow('Schedule impact', impactBoxes('impact.schedule', s?.schedule))}</div>
  <div class="col" style="flex:1.3">
    <div class="field" style="margin-top:10px"><span class="label">Work on hold?</span><div style="margin-top:4px">${H.checkbox({ name: 'impact.hold_yes', label: 'Yes', checked: s?.hold === 'Yes' })}${H.checkbox({ name: 'impact.hold_no', label: 'No', checked: s?.hold === 'No' })}<span class="small ink2" style="margin-left:4px"${sample ? '' : ' data-field="impact.hold_note" style="display:inline-block;min-width:150px;min-height:12px;border-bottom:1px solid var(--rule)"'}>${s ? H.esc(s.holdNote) : ''}</span></div></div>
  </div>
</div>
${H.section('Response', 'architect / engineer / GC — an RFI response is not a change order')}
${H.textarea({ name: 'response.text', label: 'Answer', hint: 'if the answer changes scope, cost or time, say so — a change order follows', value: s ? s.response : '', height: 66 })}
${H.fieldRow([
  H.field({
    name: 'response.by',
    label: 'Responded by (name, title, firm)',
    value: s ? s.respondedBy : '',
    flex: 1.6,
  }),
  H.field({ name: 'response.date', label: 'Date', value: s ? s.respondedDate : '', flex: 0.7 }),
  H.field({
    name: 'response.distribution',
    label: 'Distribution',
    value: s ? s.distribution : '',
    flex: 1.6,
  }),
])}
${H.checkboxRow(
  'This response is',
  RESPONSE_TYPES.map((t, i) => ({
    name: `response.type_${i + 1}`,
    label: t,
    checked: !!s && s.responseType === t,
  }))
)}
${H.signatures({
  parties: [
    {
      name: 'Submitted by',
      sub: s ? SAMPLE_COMPANY.name : 'contractor',
      fields: [
        { label: 'Signature', name: 'sig.contractor' },
        {
          label: 'Printed name and title',
          name: 'sig.contractor_name',
          value: s ? `${STORY.people.pm}, Project Manager` : '',
        },
        { label: 'Date', name: 'sig.contractor_date', value: s ? '08/24/2026' : '' },
      ],
    },
    {
      name: 'Response by',
      sub: s ? 'Kestrel Design Group' : 'architect / engineer / GC',
      fields: [
        { label: 'Signature', name: 'sig.responder' },
        {
          label: 'Printed name and title',
          name: 'sig.responder_name',
          value: s ? 'Alison Park, AIA, Principal' : '',
        },
        { label: 'Date', name: 'sig.responder_date', value: s ? '09/02/2026' : '' },
      ],
    },
  ],
})}
${H.finePrint('General-purpose form, not legal advice. An RFI documents a question and its answer; it does not change the contract sum or time. If the response adds, deletes or revises work, issue a change order and attach this RFI as backup. Do not proceed on an assumption — get the answer in writing.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    css: '.hdr-rule{margin:12px 0 12px}.textarea{margin-top:8px}.sig{margin-top:14px}.sig .parties{margin-top:10px}.sig .party .who{margin-bottom:10px}.sig .line .sp{height:24px}.sig .under{margin-top:10px}',
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'RFI-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const children = [
    ...D.companyHeader({
      title: 'Request for Information',
      number: 'RFI No. ________',
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
        label: 'To (architect / engineer / GC)',
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
        { label: 'Subject — one question per RFI', width: Math.round(W * 0.62) },
        { label: 'From (contractor · name, title)', width: W - Math.round(W * 0.62) },
      ],
      [
        { label: 'Spec section', width: Math.round(W * 0.25) },
        { label: 'Drawing / detail', width: Math.round(W * 0.25) },
        { label: 'Discipline', width: Math.round(W * 0.25) },
        { label: 'Response required by', width: W - 3 * Math.round(W * 0.25) },
      ],
    ]),
    ...D.textBox('1. Information requested', {
      lines: 6,
      hint: 'State the question. Reference the drawing, detail, spec section or field condition. One question per RFI — a bundled RFI gets a bundled, unusable answer.',
    }),
    ...D.textBox("2. Contractor's suggested interpretation / solution", {
      lines: 4,
      hint: 'Propose a reading. A suggested solution gets a faster yes / no than an open-ended question, and it shows you already did the homework.',
    }),
    D.label('3. Impact if unanswered by the date above'),
    D.p(
      [
        D.run('Cost impact:  ', { size: 9.5, color: D.C.ink2 }),
        ...IMPACT.flatMap((i) => [D.checkbox(i), D.run('   ')]),
        D.run('      Schedule impact:  ', { size: 9.5, color: D.C.ink2 }),
        ...IMPACT.flatMap((i) => [D.checkbox(i), D.run('   ')]),
        D.run('      Work on hold:  ', { size: 9.5, color: D.C.ink2 }),
        D.checkbox('Yes'),
        D.run('   '),
        D.checkbox('No'),
      ],
      { after: 120 }
    ),
    D.heading('4. Response', 'architect / engineer / GC — an RFI response is not a change order'),
    ...D.textBox('Answer', {
      lines: 5,
      hint: 'Answer the question. If the answer changes the contract sum or time, say so — a change order follows; an RFI response is not a change order by itself.',
    }),
    D.fieldGrid([
      [
        { label: 'Responded by (name, title, firm)', width: Math.round(W * 0.45) },
        { label: 'Date', width: Math.round(W * 0.2) },
        { label: 'Distribution', width: W - Math.round(W * 0.45) - Math.round(W * 0.2) },
      ],
    ]),
    D.label('This response is'),
    D.p(
      [
        ...RESPONSE_TYPES.flatMap((t, i) => [
          D.checkbox(t),
          D.run(i < RESPONSE_TYPES.length - 1 ? '     ' : ''),
        ]),
      ],
      { after: 120 }
    ),
    ...D.signatures({
      title: 'Signatures',
      parties: [
        { name: 'Submitted by', sub: 'contractor' },
        { name: 'Response by', sub: 'architect / engineer / GC' },
      ],
    }),
    D.fine(
      'General-purpose form, not legal advice. An RFI documents a question and its answer; it does not change the contract sum or time. If the response adds, deletes or revises work, issue a change order and attach this RFI as backup. Do not proceed on an assumption — get the answer in writing.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Request for information' });
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });
  const log = X.sheet(wb, 'RFI Log', { landscape: true, fitHeight: 0, printTitles: '1:7' });
  X.widths(log, [9, 36, 20, 12, 12, 12, 9, 12, 10, 10, 10, 26]);
  let lr = X.titleBlock(log, {
    title: 'RFI Log',
    subtitle:
      'One row per request for information. Days open counts from submission until the response date (or today); an overdue response date turns red.',
    cols: 12,
  });
  X.inputLegend(log, lr, 1);
  lr++;
  X.kv(log, lr, 1, 'Project', null, { to: 3 });
  X.text(log, lr, 5, 'Open', { color: X.C.ink2, size: 9, align: 'right' });
  const openCell = `F${lr}`;
  X.text(log, lr, 7, 'Overdue', { color: X.C.ink2, size: 9, align: 'right' });
  const overdueCell = `H${lr}`;
  X.text(log, lr, 9, 'Avg days to answer', { color: X.C.ink2, size: 9, align: 'right' });
  log.mergeCells(lr, 9, lr, 10);
  const avgCell = `K${lr}`;
  lr++;
  X.kv(log, lr, 1, 'To (A/E / GC)', null, { to: 3 });
  X.text(log, lr, 5, 'Answered', { color: X.C.ink2, size: 9, align: 'right' });
  const answeredCell = `F${lr}`;
  X.text(log, lr, 7, 'With cost impact', { color: X.C.ink2, size: 9, align: 'right' });
  const costCell = `H${lr}`;
  lr++;
  X.headerRow(
    log,
    lr,
    [
      'RFI #',
      'Subject',
      'To',
      'Submitted',
      'Response due',
      'Responded',
      'Days open',
      'Status',
      'Cost',
      'Schedule',
      'CO ref.',
      'Notes / resolution',
    ],
    {
      aligns: [
        'center',
        'left',
        'left',
        'center',
        'center',
        'center',
        'right',
        'center',
        'center',
        'center',
        'center',
        'left',
      ],
    }
  );
  lr++;
  const first = lr;
  for (let i = 0; i < 30; i++) {
    X.bodyRow(log, lr, [
      { input: true, align: 'center' },
      { input: true, wrap: true },
      { input: true },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { input: true, numFmt: X.FMT.date, align: 'center' },
      { formula: `IF(D${lr}="","",IF(F${lr}="",TODAY()-D${lr},F${lr}-D${lr}))`, numFmt: '0;-0;""' },
      { input: true, align: 'center' },
      { input: true, align: 'center' },
      { input: true, align: 'center' },
      { input: true, align: 'center' },
      { input: true, wrap: true },
    ]);
    lr++;
  }
  const last = lr - 1;
  X.dropdown(log, `H${first}:H${last}`, ['Open', 'Answered', 'Closed', 'Void']);
  X.dropdown(log, `I${first}:I${last}`, IMPACT);
  X.dropdown(log, `J${first}:J${last}`, IMPACT);
  X.statusColors(log, `H${first}:H${last}`, {
    Answered: 'FFE6F4EA',
    Closed: 'FFF3F5F8',
    Open: 'FFFFF7E6',
  });
  X.statusColors(log, `I${first}:J${last}`, { Likely: 'FFFDE8E6', Possible: 'FFFFF7E6' });
  // Overdue: response due date has passed, no response date, status not closed/void.
  log.addConditionalFormatting({
    ref: `E${first}:E${last}`,
    rules: [
      {
        type: 'expression',
        formulae: [
          `AND($E${first}<>"",$E${first}<TODAY(),$F${first}="",$H${first}<>"Closed",$H${first}<>"Void")`,
        ],
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
    { formula: `COUNTA(A${first}:A${last})&" RFIs logged"`, align: 'left' },
    {},
    {},
    {},
    {},
    { formula: `IF(COUNT(G${first}:G${last})=0,"",MAX(G${first}:G${last}))`, numFmt: '0' },
    { value: 'max days', align: 'left' },
    {},
    {},
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
  setCalc(openCell, `COUNTIF(H${first}:H${last},"Open")`, '0');
  setCalc(
    answeredCell,
    `COUNTIF(H${first}:H${last},"Answered")+COUNTIF(H${first}:H${last},"Closed")`,
    '0'
  );
  setCalc(
    overdueCell,
    `COUNTIFS(E${first}:E${last},"<"&TODAY(),F${first}:F${last},"",H${first}:H${last},"Open")`,
    '0'
  );
  setCalc(
    costCell,
    `COUNTIF(I${first}:I${last},"Likely")+COUNTIF(I${first}:I${last},"Possible")`,
    '0'
  );
  setCalc(
    avgCell,
    `IFERROR(SUMIFS(G${first}:G${last},F${first}:F${last},"<>")/COUNTIFS(F${first}:F${last},"<>"),"")`,
    '0.0'
  );
  log.views = [{ state: 'frozen', ySplit: first - 1, showGridLines: false }];
  lr += 2;
  X.brandFooter(
    log,
    lr,
    12,
    'Free template by BuildWorkPro — buildworkpro.com/templates. An answered RFI that changed scope, cost or time is not finished until its change order number is in the CO ref. column.'
  );

  X.howToSheet(wb, {
    title: 'RFI Log',
    steps: [
      'Enter the project and who RFIs go to at the top. Amber cells are inputs.',
      'Log each RFI the day it is sent: number, subject, to, date submitted and the response-required date (your contract usually sets the turnaround — 7 to 10 days is common).',
      'Days open counts automatically from the submitted date to the responded date, or to today while it is unanswered. The response-due cell turns red once it has passed with no answer.',
      'When the answer arrives, enter the responded date and set the status to Answered. Mark the cost and schedule impact, and if the answer changes the work, put the change order number in CO ref. — an RFI is not closed until its change order is.',
      'The counts at the top show open, answered, overdue and cost-impact RFIs and the average days to answer — the number to bring to the next progress meeting.',
    ],
    tips: [
      'One question per RFI. Bundled RFIs get bundled, unusable answers and cannot be closed independently.',
      'Suggest an answer in the RFI itself. A proposed reading gets a faster yes / no than an open question.',
      'An RFI response that adds or deletes work is not authorization. Price it on a change order and attach the RFI as backup.',
    ],
    feature: {
      text: 'In BuildWorkPro every project carries its documents, comments, change orders, site logs and activity history on one record, so the RFI, the drawing revision it produced and the change order that priced it are all in one place.',
      url: 'https://buildworkpro.com/features/project-management/',
    },
  });
  return wb;
}
