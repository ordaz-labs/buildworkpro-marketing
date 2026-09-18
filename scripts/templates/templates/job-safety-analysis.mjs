// Job safety analysis (JSA / JHA) — one landscape page: task, PPE, permits,
// step / hazard / control table and crew sign-off. PDF fillable, Word, Excel
// (with a hazard-and-control reference sheet). Sample = the crane day on the
// STORY job: setting RTU-1 to RTU-4 on the Building B roof, August 3, 2026.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'job-safety-analysis',
  name: 'Job Safety Analysis (JSA) Template',
  basename: 'job-safety-analysis-template',
  docName: 'Job safety analysis',
};

export const PPE = [
  'Hard hat',
  'Safety glasses',
  'Gloves',
  'Hi-vis vest',
  'Steel-toe boots',
  'Hearing protection',
  'Fall-arrest harness',
  'Face shield',
  'Respirator',
];
export const PERMITS = [
  'Hot work permit',
  'Confined space',
  'Lockout / tagout',
  'Crane lift plan',
  'Utility locate / overhead lines',
  'Weather checked',
  'Rescue plan',
  'Emergency numbers posted',
];

const BLANK_STEPS = 7;
const CREW_ROWS = 4; // × 2 columns = 8 signatures

const SAMPLE = {
  number: 'JSA-014',
  date: 'August 3, 2026',
  task: 'Crane lift and set of RTU-1 to RTU-4 on the Building B roof',
  location: 'Roof, Building B (east side) · crane pad in the north parking lot',
  when: 'Monday, August 3, 2026 · 6:30 AM pre-lift meeting · lift window 7:00 AM–1:00 PM',
  preparedBy: `${STORY.people.foreman}, Foreman (competent person)`,
  reviewedBy: `${STORY.people.gcSuper}, Superintendent, Brightline`,
  crewSize: '6 + crane operator',
  ppe: [
    'Hard hat',
    'Safety glasses',
    'Gloves',
    'Hi-vis vest',
    'Steel-toe boots',
    'Fall-arrest harness',
  ],
  permits: [
    'Crane lift plan',
    'Utility locate / overhead lines',
    'Weather checked',
    'Rescue plan',
    'Emergency numbers posted',
  ],
  steps: [
    [
      'Pre-lift meeting and crane setup',
      'Unstable ground at outriggers; overhead power lines; people inside the swing radius',
      'Outrigger mats on the inspected pad; 20 ft clearance from lines verified; swing radius barricaded and posted; load chart and lift plan reviewed with the operator; one signal person named',
      'Crane operator · L. Herrera',
    ],
    [
      'Roof access and edge protection',
      'Falls from the roof edge and through curb openings; ladder falls',
      'Harness tied off to certified anchors within 6 ft of the edge; warning line at 15 ft; open curbs covered and marked; ladder secured, three-point contact',
      'Crew A',
    ],
    [
      'Rigging each RTU',
      'Rigging failure; pinch points; load shifting when tensioned',
      'Rated slings and spreader bar inspected before each pick; rig only to manufacturer lift points; tag lines both ends; hands clear as the load tensions',
      'M. Santos (rigger)',
    ],
    [
      'Lift and swing to the roof',
      'Suspended load; wind gusts; struck-by',
      'Nobody under the load; stop work above 20 mph or the operator’s limit; radio between operator and signal person; exclusion zones on the ground and roof',
      'D. Cole (signal)',
    ],
    [
      'Landing the unit on the curb',
      'Crush and pinch at the curb; load swing; fall at the edge',
      'Guide with tag lines only; no hands under the unit; set on the curb gasket and align before releasing tension; crew tied off',
      'Crew A',
    ],
    [
      'Unhook and secure the unit',
      'Rigging snag; dropped tools; roof-edge fall',
      'Release rigging only after the unit is seated and fastened; tool lanyards; stay 6 ft from the edge or tied off',
      'M. Santos (rigger)',
    ],
    [
      'Demobilize crane and close out',
      'Crane travel; trip hazards from mats and rigging; heat stress',
      'Spotter for crane travel; remove mats and barricades; water and shade break every hour per the heat plan; debrief and sign off',
      'Crane operator · L. Herrera',
    ],
  ],
  crew: [
    ['Luis Herrera', '08/03/2026'],
    ['Miguel Santos', '08/03/2026'],
    ['Derek Cole', '08/03/2026'],
    ['Aaron Pham', '08/03/2026'],
    ['Jake Lindqvist', '08/03/2026'],
    ['Rosa Delgado', '08/03/2026'],
    ['Wes Tanner — Front Range Crane', '08/03/2026'],
    ['', ''],
  ],
};

/** Landscape compact header with the company fields in a row (see punch-list.mjs). */
function jsaHeader({ company, title, subtitle, fillable }) {
  if (!fillable) return H.compactHeader({ company, title, subtitle });
  const right = `<div class="row" style="gap:12px;width:470px;align-items:flex-end">${H.field({ name: 'co.name', label: 'Your company', flex: 1.3 })}${H.field({ name: 'co.line1', label: 'Address', flex: 1.2 })}${H.field({ name: 'co.line2', label: 'Phone · license no.', flex: 1 })}</div>`;
  return `<div class="hdr hdr-compact"><div class="col grow"><span class="title">${H.esc(title)}</span>${subtitle ? `<span class="sub">${H.esc(subtitle)}</span>` : ''}</div>${right}</div><div class="hdr-compact-rule"></div>`;
}

const key = (t) =>
  t
    .toLowerCase()
    .replace(/[^a-z]+/g, '_')
    .replace(/_$/, '');

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const stepCols = [
    { key: 'n', label: 'Step', width: 30, align: 'center', mono: true },
    { key: 'step', label: 'Task step — what is done, in order', width: 176 },
    { key: 'hazard', label: 'Potential hazards — what can hurt someone', width: 220 },
    {
      key: 'control',
      label: 'Controls / safe practices — how the hazard is eliminated or reduced',
    },
    { key: 'who', label: 'Responsible', width: 92 },
  ];
  const stepRows = s
    ? s.steps.map(([step, hazard, control, who], i) => ({
        cells: { n: String(i + 1), step, hazard, control, who },
      }))
    : [];
  const crewCols = [
    { key: 'name1', label: 'Crew member (print)', width: 150 },
    { key: 'sig1', label: 'Signature' },
    { key: 'date1', label: 'Date', width: 64, align: 'center', mono: true },
    { key: 'name2', label: 'Crew member (print)', width: 150 },
    { key: 'sig2', label: 'Signature' },
    { key: 'date2', label: 'Date', width: 64, align: 'center', mono: true },
  ];
  const crewRows = s
    ? Array.from({ length: CREW_ROWS }, (_, i) => ({
        cells: {
          name1: s.crew[i][0],
          sig1: '',
          date1: s.crew[i][1],
          name2: s.crew[i + CREW_ROWS][0],
          sig2: '',
          date2: s.crew[i + CREW_ROWS][1],
        },
      }))
    : [];

  const page = `
${jsaHeader({
  company,
  title: 'Job safety analysis',
  subtitle: s
    ? `${s.number} · ${s.date} · one JSA per task, reviewed with the crew before work starts`
    : 'One JSA per task — reviewed with the crew before work starts, revised when conditions change',
  fillable: !sample,
})}
<div style="margin-top:12px">
${H.metaRow([
  {
    label: 'Job / task',
    lines: [
      { text: s ? s.task : '', strong: true, field: 'task.title' },
      { text: s ? s.location : '', field: 'task.location' },
      { text: s ? s.when : '', field: 'task.when' },
    ],
  },
  {
    label: 'Project',
    lines: [
      { text: s ? SAMPLE_PROJECT.name : '', strong: true, field: 'project.name' },
      { text: s ? `${SAMPLE_PROJECT.number} · ${SAMPLE_GC.name}` : '', field: 'project.number' },
      { text: s ? SAMPLE_PROJECT.address : '', field: 'project.address' },
    ],
  },
  {
    label: 'People',
    kv: [
      {
        k: 'JSA no. · date',
        v: s ? `${s.number} · Aug 3, 2026` : '',
        field: 'task.number',
        mono: true,
      },
      { k: 'Prepared by', v: s ? s.preparedBy : '', field: 'task.prepared_by' },
      { k: 'Reviewed by', v: s ? s.reviewedBy : '', field: 'task.reviewed_by' },
      { k: 'Crew size', v: s ? s.crewSize : '', field: 'task.crew_size', mono: true },
    ],
  },
])}
</div>
<div class="row" style="gap:24px">
  <div class="col" style="flex:1.15">${H.checkboxRow('Required PPE', [...PPE.map((p) => ({ name: `ppe.${key(p)}`, label: p, checked: !!s && s.ppe.includes(p) }))])}</div>
  <div class="col" style="flex:1">${H.checkboxRow(
    'Permits and pre-task checks',
    PERMITS.map((p) => ({
      name: `permit.${key(p)}`,
      label: p,
      checked: !!s && s.permits.includes(p),
    }))
  )}</div>
</div>
${H.table({ columns: stepCols, rows: stepRows, blankRows: s ? 0 : BLANK_STEPS, fieldPrefix: 'step', variant: 'grid compact', rowHeight: 36 })}
${H.section('Crew sign-off', 'I took part in this JSA, understand the hazards and controls, and will stop work if conditions change')}
${H.table({ columns: crewCols, rows: crewRows, blankRows: s ? 0 : CREW_ROWS, fieldPrefix: 'crew', variant: 'grid compact', rowHeight: 21 })}
${H.fieldRow([
  H.field({ name: 'sig.prepared', label: 'Prepared by — signature', flex: 1.4 }),
  H.field({ name: 'sig.prepared_date', label: 'Date', value: s ? '08/03/2026' : '', width: 80 }),
  H.field({
    name: 'sig.reviewed',
    label: 'Reviewed by (supervisor / safety) — signature',
    flex: 1.4,
  }),
  H.field({ name: 'sig.reviewed_date', label: 'Date', value: s ? '08/03/2026' : '', width: 80 }),
  H.field({ name: 'sig.revised', label: 'Revised (date / reason)', value: s ? '' : '', flex: 1.2 }),
])}
${H.finePrint('General-purpose form, not legal or safety-engineering advice. A JSA supports, and does not replace, the hazard assessment, training and written programs your jurisdiction and your contract require (in the US, OSHA 29 CFR 1926 and the GC’s site-specific safety plan). Keep the signed JSA with the daily report for the day of the work.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [page],
    landscape: true,
    css: `.check{margin-right:8px;margin-bottom:3px}`,
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'JSA-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: true }] };
}

// ---------------------------------------------------------------------------
// Word (portrait)
// ---------------------------------------------------------------------------
export async function docx() {
  const W = D.CONTENT_W;
  const children = [
    ...D.companyHeader({
      title: 'Job Safety Analysis',
      number: 'JSA no. ________',
      date: 'Date ____________',
    }),
    D.metaRow([
      {
        label: 'Job / task',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Project',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
        ],
      },
    ]),
    D.spacer(4),
    D.fieldGrid([
      [
        { label: 'Prepared by (competent person)', width: Math.round(W * 0.34) },
        { label: 'Reviewed by (supervisor / safety)', width: Math.round(W * 0.34) },
        { label: 'Crew size', width: Math.round(W * 0.14) },
        { label: 'Time', width: W - 2 * Math.round(W * 0.34) - Math.round(W * 0.14) },
      ],
    ]),
    D.label('Required PPE'),
    D.p([...PPE.slice(0, 5).flatMap((p, i) => [D.checkbox(p), D.run(i < 4 ? '    ' : '')])], {
      after: 40,
    }),
    D.p([...PPE.slice(5).flatMap((p, i) => [D.checkbox(p), D.run(i < 3 ? '    ' : '')])], {
      after: 80,
    }),
    D.label('Permits and pre-task checks'),
    D.p(
      [...PERMITS.flatMap((p, i) => [D.checkbox(p), D.run(i < PERMITS.length - 1 ? '    ' : '')])],
      { after: 120 }
    ),
    D.heading('Task steps, hazards and controls', 'in the order the work is done'),
    D.table({
      columns: [
        { label: 'Step', width: 700, align: 'center' },
        { label: 'Task step', width: 2200 },
        { label: 'Potential hazards', width: 2700 },
        { label: 'Controls / safe practices', width: 3100 },
        { label: 'Responsible', width: 1380 },
      ],
      blankRows: 7,
      blankHeight: 360,
    }),
    D.heading(
      'Crew sign-off',
      'I took part in this JSA, understand the hazards and controls, and will stop work if conditions change'
    ),
    D.table({
      columns: [
        { label: 'Crew member (print)', width: 2700 },
        { label: 'Signature', width: 3000 },
        { label: 'Date', width: 1200, align: 'center' },
        { label: 'Company / trade', width: 3180 },
      ],
      blankRows: 4,
      blankHeight: 240,
    }),
    D.fieldGrid([
      [
        { label: 'Prepared by (signature)', width: Math.round(W * 0.35) },
        { label: 'Date', width: Math.round(W * 0.15) },
        { label: 'Reviewed by (signature)', width: Math.round(W * 0.35) },
        { label: 'Date', width: W - 2 * Math.round(W * 0.35) - Math.round(W * 0.15) },
      ],
    ]),
    D.fine(
      'General-purpose form, not legal or safety-engineering advice; it supports, and does not replace, the programs your jurisdiction and contract require. File the signed JSA with the daily report.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Job safety analysis' });
}

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------
const HAZARD_LIBRARY = [
  [
    'Falls from height',
    'Roof edges, leading edges, floor and curb openings, ladders, scaffolds, lifts',
    'Guardrails or personal fall arrest tied to a rated anchor; covers marked HOLE; ladders secured with 3-point contact; lift harness tied to the basket',
  ],
  [
    'Struck-by',
    'Suspended loads, crane swing, vehicles, dropped tools, material handling',
    'Exclusion zones and spotters; tag lines; tool lanyards; hi-vis; never under a load',
  ],
  [
    'Caught-in / pinch',
    'Rigging under tension, rotating equipment, trench walls, setting equipment on curbs',
    'Hands clear when tensioning; guards in place; trench protective systems; guide loads with tag lines',
  ],
  [
    'Electrical',
    'Overhead lines, energized panels, temporary power, cords in water',
    'Line clearance verified (20 ft rule); lockout / tagout; GFCI on all temporary power; qualified persons only on live work',
  ],
  [
    'Silica and dust',
    'Core drilling, cutting block or concrete, demolition',
    'Wet methods or on-tool vacuum; respirator per the exposure control plan; barricade and post',
  ],
  [
    'Hot work',
    'Brazing, soldering, welding, grinding near combustibles',
    'Hot work permit; fire watch 30 minutes after; extinguisher within reach; combustibles moved 35 ft or shielded',
  ],
  [
    'Confined space',
    'Mechanical pits, tanks, crawl spaces, ducts, vaults',
    'Permit and atmospheric testing; attendant and rescue plan; ventilation; no entry without the permit',
  ],
  [
    'Heat and cold stress',
    'Roof work in summer, enclosed spaces, winter exposure',
    'Water, rest and shade schedule; acclimatize new crew; buddy checks; adjust hours',
  ],
  [
    'Noise',
    'Cutting, hammer drills, generators, equipment rooms',
    'Hearing protection above 85 dBA; schedule loud work; post the area',
  ],
  [
    'Manual handling',
    'Pipe, duct, equipment, fixtures, gas cylinders',
    'Mechanical aids and team lifts; pre-plan the path; cylinders capped, secured and upright',
  ],
  [
    'Chemical exposure',
    'Solvents, adhesives, refrigerants, sealants, cleaners',
    'SDS on site; gloves and eye protection per the SDS; ventilation; refrigerant recovery by certified technicians',
  ],
  [
    'Housekeeping / slips and trips',
    'Cords, scrap, mats, wet floors, stored material in walkways',
    'Clean as you go; cords overhead or covered; lighting; designated storage',
  ],
  [
    'Mobile equipment',
    'Forklifts, lifts, cranes, trucks backing up',
    'Certified operators; spotters; backup alarms; pedestrians separated',
  ],
  [
    'Pressure and stored energy',
    'Hydrostatic and pneumatic tests, springs, compressed gas',
    'Test procedure and pressure limits posted; keep clear of joints during tests; bleed before opening',
  ],
];

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });
  const ws = X.sheet(wb, 'JSA', { landscape: true, fitHeight: 1 });
  const COLS = 6;
  X.widths(ws, [12, 30, 34, 44, 18, 14]);
  let r = X.titleBlock(ws, {
    title: 'Job Safety Analysis',
    subtitle:
      'One JSA per task. Fill in the header, tick the PPE and permits, list the steps in order with their hazards and controls, and have the crew sign before work starts.',
    cols: COLS,
    right: 'Print: landscape, one page',
    rightFrom: 5,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.kv(ws, r, 1, 'Job / task', null, { labelTo: 1, to: 3 });
  X.kv(ws, r, 4, 'JSA no.', null, { to: 6 });
  r++;
  X.kv(ws, r, 1, 'Location', null, { labelTo: 1, to: 3 });
  X.kv(ws, r, 4, 'Date', null, { to: 6, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Project', null, { labelTo: 1, to: 3 });
  X.kv(ws, r, 4, 'Crew size', null, { to: 6, numFmt: '0' });
  r++;
  X.kv(ws, r, 1, 'Prepared by', null, { labelTo: 1, to: 3 });
  X.kv(ws, r, 4, 'Reviewed by', null, { to: 6 });
  r += 2;
  X.label(ws, r, 1, 'Required PPE');
  X.label(ws, r, 4, 'Permits and pre-task checks');
  r++;
  const ppeStart = r;
  for (let i = 0; i < Math.max(Math.ceil(PPE.length / 2), Math.ceil(PERMITS.length / 2)); i++) {
    const row = ppeStart + i;
    const a = PPE[i * 2];
    const b = PPE[i * 2 + 1];
    if (a) X.input(ws, row, 1, `☐  ${a}`, { merge: 2 });
    if (b) X.input(ws, row, 3, `☐  ${b}`);
    const c = PERMITS[i * 2];
    const dd = PERMITS[i * 2 + 1];
    if (c) X.input(ws, row, 4, `☐  ${c}`);
    if (dd) X.input(ws, row, 5, `☐  ${dd}`, { merge: 6 });
    ws.getRow(row).height = 16;
  }
  r = ppeStart + 5;
  X.noteRow(
    ws,
    r,
    'Change ☐ to ☒ to tick a box (copy it from this note). Add rows to the table below if the task has more steps; keep them in the order the work is done.',
    COLS,
    { height: 22 }
  );
  r += 2;
  X.headerRow(
    ws,
    r,
    [
      'Step',
      'Task step — what is done, in order',
      'Potential hazards',
      'Controls / safe practices',
      'Responsible',
      'Done ✓',
    ],
    {
      aligns: ['center', 'left', 'left', 'left', 'left', 'center'],
    }
  );
  r++;
  const first = r;
  for (let i = 0; i < 10; i++) {
    X.bodyRow(
      ws,
      r,
      [
        { value: i + 1, align: 'center', color: X.C.ink3 },
        { input: true, wrap: true },
        { input: true, wrap: true },
        { input: true, wrap: true },
        { input: true, wrap: true },
        { input: true, align: 'center' },
      ],
      { height: 34 }
    );
    r++;
  }
  const last = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    {
      formula: `"Steps: "&COUNTA(B${first}:B${last})&"   ·   Controls written: "&COUNTA(D${first}:D${last})`,
      align: 'left',
    },
    {},
    {},
    {
      formula: `IF(COUNTA(B${first}:B${last})=0,"",IF(COUNTA(D${first}:D${last})<COUNTA(B${first}:B${last}),"Every step needs a control","Controls complete"))`,
      align: 'left',
    },
    {},
  ]);
  ws.getCell(r, 5).font = { name: X.FONT, size: 9, bold: true, color: { argb: X.C.deduct } };
  ws.addConditionalFormatting({
    ref: `E${r}`,
    rules: [
      {
        type: 'containsText',
        operator: 'containsText',
        text: 'complete',
        style: { font: { color: { argb: X.C.add }, bold: true } },
        priority: 1,
      },
    ],
  });
  r += 2;
  X.label(
    ws,
    r,
    1,
    'Crew sign-off — I took part in this JSA, understand the hazards and controls, and will stop work if conditions change'
  );
  r++;
  X.headerRow(ws, r, ['#', 'Crew member (print)', 'Signature', 'Company / trade', 'Date', ''], {
    aligns: ['center', 'left', 'left', 'left', 'center', 'center'],
  });
  r++;
  for (let i = 0; i < 10; i++) {
    X.bodyRow(
      ws,
      r,
      [
        { value: i + 1, align: 'center', color: X.C.ink3 },
        { input: true },
        { input: true },
        { input: true },
        { input: true, numFmt: X.FMT.date, align: 'center' },
        { value: '' },
      ],
      { height: 18 }
    );
    r++;
  }
  r++;
  r =
    X.signatureBlock(
      ws,
      r,
      ['Prepared by (competent person)', 'Reviewed by (supervisor / safety)'],
      { cols: [1, 4], width: 3 }
    ) + 1;
  X.brandFooter(
    ws,
    r,
    COLS,
    'Free template by BuildWorkPro — buildworkpro.com/templates. General-purpose form, not legal or safety-engineering advice; it supports and does not replace the programs your jurisdiction and contract require.'
  );
  ws.pageSetup.printArea = `A1:F${r}`;

  // ---- hazard library ----
  const lib = X.sheet(wb, 'Hazard Library', { landscape: true, fitHeight: 0, printTitles: '4:4' });
  X.widths(lib, [26, 52, 80]);
  let lr = X.titleBlock(lib, {
    title: 'Common construction hazards and controls',
    subtitle:
      'A starting point for the hazards column — not a substitute for looking at the actual task, site and crew. Copy the wording that fits and make it specific.',
    cols: 3,
  });
  X.headerRow(lib, lr, [
    'Hazard category',
    'Where it shows up on mechanical / plumbing / electrical work',
    'Typical controls (most effective first)',
  ]);
  lr++;
  HAZARD_LIBRARY.forEach(([cat, where, controls]) => {
    X.bodyRow(
      lib,
      lr,
      [
        { value: cat, bold: true, wrap: true },
        { value: where, wrap: true, color: X.C.ink2 },
        { value: controls, wrap: true },
      ],
      { height: 40 }
    );
    lr++;
  });
  lr++;
  X.noteRow(
    lib,
    lr,
    'Hierarchy of controls: eliminate the hazard, substitute a safer method, engineer it out (guardrails, ventilation), then administrative controls (permits, training, rotation) and finally PPE. PPE is the last line, not the first.',
    3,
    { height: 36 }
  );
  lr += 2;
  X.brandFooter(
    lib,
    lr,
    3,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Reference list only; your written safety program, the SDS and the manufacturer’s instructions govern.'
  );

  X.howToSheet(wb, {
    title: 'Job Safety Analysis Template',
    steps: [
      'Fill in the task, location, date, project and who is preparing and reviewing the JSA. One JSA per task — a crane pick, a hot-work job, a confined-space entry — not one per project.',
      'Tick the PPE and the permits or pre-task checks the work needs. If a permit is required and not in hand, the work does not start.',
      'Break the task into steps in the order they happen. Six to ten steps is normal; if you have twenty, the task is really two tasks.',
      'For each step write what can hurt someone (the hazard) and how it is eliminated or reduced (the control). Use the Hazard Library sheet for wording, then make it specific to this site. The totals row flags any step without a control.',
      'Name who is responsible for each control, review the JSA with the crew at the start of the shift, and have everyone sign. Revise it the moment conditions change — new crew, weather, a different lift path.',
      'Print landscape (fits one page) and keep the signed copy with the daily report for that day. The GC’s safety officer and your insurer will ask for it after an incident.',
    ],
    tips: [
      'Write hazards as what happens to a person — “fall from the roof edge”, not “roof”. Controls must answer the hazard: a hard hat does nothing for a fall.',
      'A JSA that is filled out in the truck and never read to the crew is paperwork. A three-minute review at the task location is the part that prevents injuries.',
      'Pair it with a toolbox talk sign-in when the topic is broader than one task — heat, ladders, housekeeping.',
    ],
    feature: {
      text: 'BuildWorkPro site logs carry a Safety tag, so incidents, near misses and safety meetings are logged with the day’s work, with photos, and can be filtered out in seconds when the GC or your insurer asks.',
      url: 'https://buildworkpro.com/features/site-logs/',
    },
  });
  return wb;
}
