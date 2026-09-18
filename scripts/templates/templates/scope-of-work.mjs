// Scope of work — included work by area/system, exclusions, assumptions, work
// by others, materials & submittals, milestones, acceptance criteria. Word and
// PDF. The blank PDF is a fixed two-page form (every field fillable); the
// completed example flows (its tables carry real rows of varying length).
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'scope-of-work',
  name: 'Construction Scope of Work Template',
  basename: 'scope-of-work-template',
  docName: 'Scope of work',
};

// The completed example: Summit's mechanical scope for Harbor Point Building B,
// issued as Exhibit A to the STORY subcontract. Rows mirror STORY.sov so the
// scope and the schedule of values line up.
const SAMPLE = {
  number: 'SOW-0412 R1',
  date: 'May 11, 2026',
  revision: '1',
  bidRef: 'Q-2026-0412',
  agreementRef: 'Subcontract SC-2026-118',
  overview:
    'Mechanical and plumbing scope for Building B, a two-story, 28,400 SF medical office building. This scope of work is Exhibit A to Subcontract SC-2026-118 and is based on the drawings and the Division 22 and 23 specifications dated April 6, 2026, including addenda 1 and 2.',
  items: [
    [
      'General',
      'Mobilization, submittals, coordination drawings, mechanical and plumbing permits',
      '1 LS · 01 30 00',
    ],
    [
      'Underground',
      'Sanitary and storm below slab: 4"–8" PVC, cleanouts, trench and backfill within the building footprint',
      'P-101 · 22 13 13',
    ],
    [
      'Domestic water',
      'Type L copper mains and branches, valves, backflow preventer; install owner-furnished water heater WH-1',
      'P-201–P-203 · 22 11 16',
    ],
    [
      'Sanitary waste & vent',
      'No-hub cast iron above grade, vents through roof, floor drains and trap primers',
      'P-301 · 22 13 16',
    ],
    [
      'HVAC equipment',
      'RTU-1 to RTU-4 on curbs, split-system air handlers AHU-1 to AHU-3 with condensing units; crane set by Summit',
      'M-501 · 23 74 13',
    ],
    [
      'Ductwork & distribution',
      'Galvanized supply, return and exhaust ductwork; 18 VAV terminals with reheat; diffusers and grilles per schedule',
      'M-201–M-204 · 23 31 13',
    ],
    [
      'Refrigerant & hydronic piping',
      'Refrigerant piping to split systems, condensate drains, hydronic piping to reheat coils',
      'M-401–M-402 · 23 21 13',
    ],
    [
      'Controls & BMS',
      "DDC controllers, sensors and actuators; integration to the owner's existing BMS front end for the points in 23 09 00",
      'M-601 · 23 09 00',
    ],
    ['Insulation', 'Duct wrap and liner, pipe insulation per schedule', '23 07 13 · 23 07 19'],
    [
      'Plumbing fixtures & trim',
      '48 fixtures per P-601 schedule with carriers, stops and trim',
      'P-601 · 22 40 00',
    ],
    [
      'Testing, balancing & commissioning',
      'Pressure tests, TAB by certified agency, functional testing and commissioning support',
      '23 05 93 · 01 91 13',
    ],
    ['Closeout', 'Record drawings, O&M manuals, warranties, 4 hours of owner training', '01 78 00'],
  ],
  exclusions: [
    'Electrical power wiring, disconnects and starters to mechanical equipment',
    'Fire sprinkler and fire alarm systems, including duct detector wiring',
    'Furnishing of water heater WH-1 (owner-furnished; installation is included)',
    'Roofing, flashing and structural framing at roof penetrations and RTU curbs',
    'Concrete housekeeping pads; slab cutting and patching outside the mechanical scope',
    'Medical gas piping and outlets',
    'Painting of exposed ductwork and piping',
    'Permit fees other than mechanical and plumbing permits',
    'Overtime or shift work not shown in the milestone schedule',
    'Hazardous-material testing and abatement',
  ],
  assumptions: [
    'Site available and underground work released by June 8, 2026; slab pour on or about June 29.',
    'Normal working hours Monday–Friday, 7:00 a.m.–3:30 p.m.; one mobilization per phase.',
    'Summit provides the crane and rigging for a one-day RTU set; Brightline coordinates roof access and the street closure.',
    'BMS integration is limited to the points listed in 23 09 00; front-end software licenses are by the owner.',
    'RTU lead time is 10–12 weeks from approved submittal; the schedule assumes approval by June 22.',
    'Pricing is based on the drawings dated April 6, 2026 and addenda 1 and 2.',
  ],
  others: [
    [
      'Power wiring, disconnects and starters to mechanical equipment',
      'Electrical subcontractor',
      'Before start-up (Aug 24)',
    ],
    [
      'Roof curb flashing and roofing patch at RTU curbs',
      'Roofing subcontractor',
      'Before RTU set (Aug 17)',
    ],
    [
      'Structural steel supports at RTU-2 curb per S-201',
      'General contractor',
      'Before RTU set (Aug 17)',
    ],
    ['Water heater WH-1 — furnish only; Summit installs', 'Owner', 'Delivered by Jul 15'],
    ['Concrete housekeeping pads', 'General contractor', 'Jul 20'],
    [
      'Fire alarm duct detector wiring and interlocks',
      'Fire alarm subcontractor',
      'Before commissioning (Nov 2)',
    ],
  ],
  materials: [
    [
      'Packaged rooftop units RTU-1 to RTU-4, 12.5–25 ton, gas heat',
      'Basis of design per 23 74 13',
      'Jun 8, 2026',
    ],
    ['Ductwork shop drawings and VAV terminal schedule', '23 31 13 · 23 36 00', 'Jun 15, 2026'],
    ['Plumbing fixtures and trim', 'P-601 schedule · 22 40 00', 'Jun 8, 2026'],
    ['DDC controls: points list, sequences, panel drawings', '23 09 00', 'Jun 22, 2026'],
    ['Duct and pipe insulation', '23 07 13 · 23 07 19', 'Jun 8, 2026'],
  ],
  milestones: [
    ['Mobilization, submittals and coordination', 'Jun 1, 2026', 'Jun 19, 2026'],
    ['Underground sanitary and storm', 'Jun 8, 2026', 'Jun 26, 2026'],
    ['Domestic water and DWV rough-in', 'Jul 6, 2026', 'Aug 14, 2026'],
    ['Rooftop unit set (crane)', 'Aug 17, 2026', 'Aug 19, 2026'],
    ['Ductwork, refrigerant and hydronic piping', 'Aug 3, 2026', 'Sep 25, 2026'],
    ['Controls and insulation', 'Sep 14, 2026', 'Oct 16, 2026'],
    ['Fixtures and trim', 'Oct 12, 2026', 'Oct 30, 2026'],
    ['Testing, balancing and commissioning', 'Nov 2, 2026', 'Nov 13, 2026'],
    [
      'Closeout, O&M manuals and training',
      'Nov 16, 2026',
      STORY.completionDate.replace('November', 'Nov'),
    ],
  ],
  acceptance:
    'The Work is complete when all systems have been pressure-tested and the TAB report shows airflows within ±10% of design; controls are verified point-to-point and trended for 48 hours; plumbing tests are witnessed by the inspector and Brightline; the mechanical and plumbing finals are signed off; record drawings, O&M manuals and warranties are delivered; and owner training is complete.',
  attachments: ['drawings', 'specs', 'proposal', 'sov'],
  preparedBy: { name: `${STORY.people.pm}, Project Manager`, date: '05/11/2026' },
  acceptedBy: { name: `${STORY.people.gcPm}, Project Manager`, date: '05/18/2026' },
};

const ATTACHMENTS = [
  ['drawings', 'Drawings'],
  ['specs', 'Specifications'],
  ['proposal', 'Proposal / bid'],
  ['sov', 'Schedule of values'],
  ['units', 'Unit prices'],
  ['photos', 'Site photos'],
];

const SIGN_COPY =
  'This scope of work, with its attachments, defines the Work under the agreement referenced above. Items not listed as included, and not reasonably inferable from the referenced documents, are excluded. Changes to this scope are made only by written change order.';

const FINE =
  'General-purpose form, not legal advice. Attach this scope of work to the agreement as an exhibit so it controls; where it conflicts with the drawings or specifications, the order of precedence in the agreement decides. Keep the revision number and date current whenever the scope is renegotiated.';

// Flow: real margins on pages 2+, footer room on every page, no split boxes or
// rows. `.brk` is a page break in print and a spacer on screen, so the preview
// (a clip of the continuous layout) ends where page 1 of the PDF ends.
const FLOW_CSS =
  '.section{break-after:avoid;page-break-after:avoid}.textarea,.sig,tr{break-inside:avoid;page-break-inside:avoid}' +
  '.brk{height:1056px}@media print{.brk{height:0;break-before:page;page-break-before:always}}';
const PAGE_BREAK = '<div class="brk"></div>';

const ITEM_COLS = [
  { key: 'n', label: '#', width: 26, align: 'center', mono: true },
  { key: 'area', label: 'Area / system', width: 150 },
  { key: 'desc', label: 'Description of work included' },
  { key: 'ref', label: 'Qty / spec ref', width: 118 },
];
const OTHERS_COLS = [
  { key: 'item', label: 'Item furnished or performed by others' },
  { key: 'who', label: 'By whom', width: 150 },
  { key: 'when', label: 'Needed by', width: 130 },
];
const MATERIALS_COLS = [
  { key: 'item', label: 'Material / equipment' },
  { key: 'basis', label: 'Basis of design / spec section', width: 190 },
  { key: 'due', label: 'Submittal due', width: 100 },
];
const MILESTONE_COLS = [
  { key: 'milestone', label: 'Milestone' },
  { key: 'start', label: 'Start', width: 110 },
  { key: 'finish', label: 'Finish', width: 110 },
];

const rows = (data, keys) =>
  data.map((r) => ({ cells: Object.fromEntries(keys.map((k, i) => [k, r[i]])) }));

/** Build the document as ordered chunks; the blank form paginates them, the sample flows. */
function parts({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const tbl = (columns, data, keys, prefix, blank, rowHeight = 22) =>
    H.table({
      columns,
      rows: s ? rows(data, keys) : [],
      blankRows: s ? 0 : blank,
      fieldPrefix: prefix,
      rowHeight,
    });
  const lines = (arr) => arr.join('\n');

  const page1 = `
${H.header({ company, title: 'Scope of work', number: s ? s.number : 'SOW-____', date: s?.date, fillable: !sample })}
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
    label: 'Prepared for',
    lines: [
      { text: s ? SAMPLE_GC.name : '', strong: true, field: 'to.name' },
      { text: s ? SAMPLE_GC.line1 : '', field: 'to.line1' },
      { text: s ? SAMPLE_GC.line2 : '', field: 'to.line2' },
    ],
  },
  {
    label: 'Document',
    kv: [
      { k: 'Revision', v: s?.revision ?? '', field: 'doc.revision', mono: true },
      { k: 'Proposal / bid ref.', v: s?.bidRef ?? '', field: 'doc.bid_ref', mono: true },
      { k: 'Agreement ref.', v: s?.agreementRef ?? '', field: 'doc.agreement_ref' },
      { k: 'Prepared by', v: s ? STORY.people.pm : '', field: 'doc.prepared_by' },
    ],
  },
])}
${H.textarea({
  name: 'overview',
  label: 'Project overview',
  hint: 'building, size, phase, and the drawings, specifications and addenda this scope is based on',
  value: s?.overview,
  height: 44,
})}
${H.section('Included work', 'one row per area or system — mirror the schedule of values so scope and billing line up')}
${tbl(ITEM_COLS, s?.items ?? [], ['area', 'desc', 'ref'], 'item', 14)}
${H.textarea({
  name: 'exclusions',
  label: 'Exclusions',
  hint: 'work, materials and fees not included — one item per line; anything not excluded here is included',
  value: s ? lines(s.exclusions) : '',
  height: 96,
})}`;

  // On the blank form this sits at the foot of page 1; the completed example
  // (longer exclusions) starts page 2 with it.
  const assumptions = H.textarea({
    name: 'assumptions',
    label: 'Assumptions and clarifications',
    hint: 'site access, working hours, sequencing, lead times, and the documents the price is based on',
    value: s ? lines(s.assumptions) : '',
    height: 64,
  });

  const page2 = `
${H.section('Work by others', 'what this scope depends on, who provides it, and when')}
${tbl(OTHERS_COLS, s?.others ?? [], ['item', 'who', 'when'], 'others', 4)}
${H.section('Materials and submittals', 'basis of design and when the submittal is due')}
${tbl(MATERIALS_COLS, s?.materials ?? [], ['item', 'basis', 'due'], 'materials', 4)}
${H.section('Schedule milestones')}
${tbl(MILESTONE_COLS, s?.milestones ?? [], ['milestone', 'start', 'finish'], 'milestone', 5)}
${H.textarea({
  name: 'acceptance',
  label: 'Acceptance criteria',
  hint: 'the tests, inspections, documents and sign-offs that mean the Work is complete',
  value: s?.acceptance,
  height: 48,
})}
${H.checkboxRow(
  'Attachments',
  ATTACHMENTS.map(([key, label]) => ({
    name: `attach.${key}`,
    label,
    checked: !!s && s.attachments.includes(key),
  }))
)}
${H.signatures({
  title: 'Prepared and accepted',
  copy: SIGN_COPY,
  parties: [
    {
      name: 'Prepared by',
      sub: s ? SAMPLE_COMPANY.name : 'contractor / subcontractor',
      fields: [
        { label: 'Signature', name: 'sig.prepared' },
        { label: 'Printed name and title', name: 'sig.prepared_name', value: s?.preparedBy.name },
        { label: 'Date', name: 'sig.prepared_date', value: s?.preparedBy.date },
      ],
    },
    {
      name: 'Accepted by',
      sub: s ? SAMPLE_GC.name : 'owner / general contractor',
      fields: [
        { label: 'Signature', name: 'sig.accepted' },
        { label: 'Printed name and title', name: 'sig.accepted_name', value: s?.acceptedBy.name },
        { label: 'Date', name: 'sig.accepted_date', value: s?.acceptedBy.date },
      ],
    },
  ],
})}
${H.finePrint(FINE)}`;

  return {
    page1,
    assumptions,
    page2,
    footer: H.footerText(`${meta.docName}${s ? ` · ${s.number}` : ''}`),
  };
}

export function html({ sample }) {
  const { page1, assumptions, page2, footer } = parts({ sample });
  if (!sample) {
    const doc = H.document({
      title: meta.name,
      pages: [page1 + assumptions, page2],
      footer,
    });
    return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
  }
  const doc = H.flowDocument({
    title: meta.name,
    body: page1 + PAGE_BREAK + assumptions + page2,
    css: FLOW_CSS,
  });
  return { sections: [{ html: doc, mode: 'flow', landscape: false, footer }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const q = Math.round(W / 4);
  const children = [
    ...D.companyHeader({
      title: 'Scope of Work',
      number: 'SOW No. ________',
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
        label: 'Prepared for (owner / general contractor)',
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
        { label: 'Revision', width: q },
        { label: 'Proposal / bid ref.', width: q },
        { label: 'Agreement ref.', width: q },
        { label: 'Prepared by', width: W - 3 * q },
      ],
    ]),
    ...D.textBox('Project overview', {
      lines: 3,
      hint: 'Building, size, phase, and the drawings, specifications and addenda this scope is based on.',
    }),
    D.heading('Included work', 'one row per area or system — mirror the schedule of values'),
    D.table({
      columns: [
        { label: '#', width: 500, align: 'center' },
        { label: 'Area / system', width: 2200 },
        { label: 'Description of work included', width: W - 500 - 2200 - 1800 },
        { label: 'Qty / spec ref', width: 1800 },
      ],
      blankRows: 12,
      blankHeight: 300,
    }),
    ...D.textBox('Exclusions', {
      lines: 6,
      hint: 'Work, materials and fees not included — one item per line. Anything not excluded here is included.',
    }),
    ...D.textBox('Assumptions and clarifications', {
      lines: 4,
      hint: 'Site access, working hours, sequencing, lead times, and the documents the price is based on.',
    }),
    D.heading('Work by others', 'what this scope depends on, who provides it, and when'),
    D.table({
      columns: [
        { label: 'Item furnished or performed by others', width: W - 2600 - 2200 },
        { label: 'By whom', width: 2600 },
        { label: 'Needed by', width: 2200 },
      ],
      blankRows: 4,
      blankHeight: 300,
    }),
    D.heading('Materials and submittals', 'basis of design and when the submittal is due'),
    D.table({
      columns: [
        { label: 'Material / equipment', width: W - 3000 - 1800 },
        { label: 'Basis of design / spec section', width: 3000 },
        { label: 'Submittal due', width: 1800 },
      ],
      blankRows: 4,
      blankHeight: 300,
    }),
    D.heading('Schedule milestones'),
    D.table({
      columns: [
        { label: 'Milestone', width: W - 2 * 1900 },
        { label: 'Start', width: 1900 },
        { label: 'Finish', width: 1900 },
      ],
      blankRows: 5,
      blankHeight: 300,
    }),
    ...D.textBox('Acceptance criteria', {
      lines: 3,
      hint: 'The tests, inspections, documents and sign-offs that mean the Work is complete.',
    }),
    D.label('Attachments'),
    D.p(
      ATTACHMENTS.flatMap(([, label], i) => [
        D.checkbox(label),
        D.run(i < ATTACHMENTS.length - 1 ? '     ' : ''),
      ]),
      { after: 120 }
    ),
    ...D.signatures({
      title: 'Prepared and accepted',
      copy: SIGN_COPY,
      parties: [
        { name: 'Prepared by', sub: 'contractor / subcontractor' },
        { name: 'Accepted by', sub: 'owner / general contractor' },
      ],
    }),
    D.fine(FINE),
  ];
  return D.document({ title: meta.name, children, footerCenter: meta.docName });
}
