// Construction meeting minutes — two-page fillable PDF and a Word document.
// Sample = Summit's weekly progress/coordination meeting #14 with Brightline
// and Kestrel on September 2, 2026 (the week pay app #3 goes in, CO-003 is
// being priced, and controls submittal 23 09 23 Rev 1 is in review).
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'meeting-minutes',
  name: 'Construction Meeting Minutes Template',
  basename: 'construction-meeting-minutes-template',
  docName: 'Meeting minutes',
};

const MEETING_TYPES = ['Progress / OAC', 'Preconstruction', 'Coordination', 'Safety', 'Closeout'];

const SAMPLE = {
  number: 'MTG-014',
  date: 'September 2, 2026',
  type: 'Progress / OAC',
  title: 'Weekly progress & coordination meeting #14 — mechanical / plumbing',
  when: 'Wednesday, September 2, 2026 · 7:30–8:20 AM · Brightline job trailer',
  calledBy: `Called by ${STORY.people.gcPm}, Brightline · Minutes by ${STORY.people.pm}, Summit`,
  next: 'Wed, Sep 9, 2026 · 7:30 AM',
  nextWhere: 'Brightline job trailer',
  issued: 'Sep 2, 2026',
  correctionsDue: 'Sep 4, 2026',
  attendees: [
    [STORY.people.gcPm, 'Brightline Builders · Project Manager', true, '(303) 555-0192'],
    [STORY.people.gcSuper, 'Brightline Builders · Superintendent', true, '(303) 555-0193'],
    [STORY.people.pm, 'Summit Mechanical · Project Manager (minutes)', true, 'dana@summitmech.com'],
    [STORY.people.foreman, 'Summit Mechanical · Foreman', true, '(303) 555-0161'],
    ['Alison Park', 'Kestrel Design Group · Architect', true, 'apark@kestreldg.com'],
    [
      'Ray Castellanos',
      'Kestrel Design Group · MEP engineer (by phone)',
      true,
      'rcastellanos@kestreldg.com',
    ],
    ['Jordan Blake', 'Peak Electric · Foreman', true, '(303) 555-0177'],
    [STORY.people.estimator, 'Summit Mechanical · Estimator', false, 'priya@summitmech.com'],
  ],
  items1: [
    [
      '14.01',
      'Schedule status',
      'Duct mains L2 at 65%, hydronic piping 55%. RTU-1 to RTU-4 set Aug 3–4, AHU-3 set Aug 11. Controls rough-in starts Sep 14 and depends on 23 09 23 Rev 1 (item 14.02).',
      'Issue schedule Rev 2 with status as of Aug 31',
      'D. Whitfield',
      'Sep 3',
      'Open',
    ],
    [
      '12.03',
      'RFI-014 / AHU-3 condensate drain',
      'M-402 Rev. 2 issued Aug 28 adds a 2" condensate drain to the floor sink. Summit to price as CO-003; Brightline needs pricing before the Sep 14 owner meeting. Carried from meeting 12.',
      'Submit CO-003 pricing with backup',
      'D. Whitfield',
      'Sep 14',
      'Open',
    ],
    [
      '14.02',
      'Submittal 23 09 23 Rev 1 — BMS controls',
      'Resubmitted Aug 24 with revised sequences and points list. In review 9 days; Kestrel MEP to return by Sep 7 so controls rough-in holds Sep 14.',
      'Return reviewed submittal',
      'R. Castellanos',
      'Sep 7',
      'Open',
    ],
    [
      '14.03',
      'RTU power & disconnects',
      'Peak Electric to complete disconnects and feeders at RTU-1 to RTU-4 by Sep 9. Summit startup with the manufacturer rep scheduled Sep 10–11.',
      'Complete RTU disconnects',
      'J. Blake',
      'Sep 9',
      'Open',
    ],
    [
      '14.04',
      'Level 1 above-ceiling inspection',
      'Summit ready for above-ceiling inspection at grids A–D. Brightline to request the city inspection for Sep 8; drywall ceilings cannot start until it passes.',
      'Schedule inspection',
      'T. Okafor',
      'Sep 4',
      'Open',
    ],
    [
      '14.05',
      'Pay application #3 (August)',
      'Summit submitting pay app #3 on Sep 3 with the conditional waiver for #2. Brightline confirms the Sep 5 cutoff for the owner draw.',
      'Submit pay app #3 + waiver',
      'D. Whitfield',
      'Sep 3',
      'Open',
    ],
  ],
  items2: [
    [
      '14.06',
      'Safety',
      'Crane-day debrief (Aug 3): no incidents; JSA and toolbox talk sign-in on file. Heat-illness plan (water, shade, rest breaks) continues through September.',
      'None — record only',
      'L. Herrera',
      '—',
      'Closed',
    ],
    [
      '13.02',
      'Owner-furnished water heater (CO-002)',
      'Delivered Aug 26; Summit completed connections Aug 28. Credit per CO-002 already applied. Item closed.',
      'None',
      'D. Whitfield',
      '—',
      'Closed',
    ],
    [
      '14.07',
      'RTU-2 curb flashing (CO-001 relocation)',
      'Roofer to flash the relocated curb by Sep 4; Summit seals unit-to-curb after. Open penetration to be covered nightly until flashed.',
      'Flash RTU-2 curb',
      'T. Okafor',
      'Sep 4',
      'Open',
    ],
    [
      '14.08',
      'Level 1 ceiling close-in',
      'Drywall starts L1 ceilings Sep 14 after the inspection. All Summit L1 above-ceiling work (hangers, insulation, labels) complete by Sep 11.',
      'Finish L1 above-ceiling work',
      'L. Herrera',
      'Sep 11',
      'Open',
    ],
  ],
  oldBusiness:
    'Item 12.03 (RFI-014 / CO-003) carried — pricing due Sep 14. Item 13.02 (owner-furnished water heater) closed.',
  newBusiness:
    'Diffuser submittal 23 37 13 (sent Aug 21) needs to return by Sep 4 to hold the Sep 21 install on a 4-week lead. Brightline to confirm the Sep 5 owner-draw cutoff applies to all subs.',
};

const attendeeCols = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Company · role' },
  { key: 'present', label: 'Present', width: 50, align: 'center' },
  { key: 'contact', label: 'Email / phone', width: 170 },
];
const itemCols = [
  { key: 'n', label: 'Item', width: 40, mono: true },
  { key: 'topic', label: 'Topic', width: 108 },
  { key: 'desc', label: 'Discussion / decision' },
  { key: 'action', label: 'Action', width: 118 },
  { key: 'owner', label: 'Owner', width: 66 },
  { key: 'due', label: 'Due', width: 40, mono: true },
  { key: 'status', label: 'Status', width: 44 },
];
const itemRows = (list) =>
  list.map(([n, topic, desc, action, owner, due, status]) => ({
    cells: { n, topic, desc, action, owner, due, status },
  }));

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };

  const page1 = `
${H.header({ company, title: 'Meeting minutes', number: s ? s.number : 'MTG-____', date: s ? s.date : undefined, fillable: !sample })}
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
    label: 'Meeting',
    lines: [
      { text: s ? s.title : '', strong: true, field: 'meeting.title' },
      { text: s ? s.when : '', field: 'meeting.when' },
      { text: s ? s.calledBy : '', field: 'meeting.called_by' },
    ],
  },
  {
    label: 'Record',
    kv: [
      { k: 'Meeting type', v: s ? s.type : '', field: 'meeting.type' },
      { k: 'Minutes issued', v: s ? s.issued : '', field: 'meeting.issued', mono: true },
      {
        k: 'Corrections due',
        v: s ? s.correctionsDue : '',
        field: 'meeting.corrections_due',
        mono: true,
      },
      { k: 'Next meeting', v: s ? s.next : '', field: 'meeting.next', mono: true, strong: true },
    ],
  },
])}
${H.section('Attendees', s ? '' : `type: ${MEETING_TYPES.join(' · ')}`)}
${H.table({
  columns: attendeeCols,
  rows: s
    ? s.attendees.map(([name, role, present, contact]) => ({
        cells: { name, role, present: present ? '✓' : '—', contact },
        muted: !present,
      }))
    : [],
  blankRows: s ? 0 : 10,
  fieldPrefix: 'att',
  variant: 'compact',
  rowHeight: 20,
})}
${H.section('Agenda, discussion & actions', 'number items meeting.item (14.01); carried items keep their original number')}
${H.table({ columns: itemCols, rows: s ? itemRows(s.items1) : [], blankRows: s ? 0 : 9, fieldPrefix: 'item', variant: 'compact', rowHeight: 26 })}`;

  const page2 = `
<div class="row" style="justify-content:space-between;align-items:baseline"><span class="strong" style="font-size:11px">Meeting minutes — continued</span><span class="small ink2 mono"${s ? '' : ' data-field="meeting.number_p2" style="min-width:120px;text-align:right"'}>${s ? `${s.number} · ${s.date}` : ''}</span></div>
<div class="hdr-rule" style="margin:8px 0 6px"></div>
${H.section('Agenda, discussion & actions (continued)')}
${H.table({ columns: itemCols, rows: s ? itemRows(s.items2) : [], blankRows: s ? 0 : 12, fieldPrefix: 'item_p2', variant: 'compact', rowHeight: 26 })}
${H.split(
  H.textarea({
    name: 'old_business',
    label: 'Old business',
    hint: 'items carried from earlier meetings and their status',
    value: s ? s.oldBusiness : '',
    height: 64,
  }),
  H.textarea({
    name: 'new_business',
    label: 'New business',
    hint: 'raised today, not yet an action item',
    value: s ? s.newBusiness : '',
    height: 64,
  })
)}
${H.fieldRow([
  H.field({ name: 'next.date', label: 'Next meeting — date & time', value: s ? s.next : '' }),
  H.field({ name: 'next.where', label: 'Location', value: s ? s.nextWhere : '' }),
  H.field({
    name: 'distribution',
    label: 'Distribution',
    value: s ? 'All attendees · Brightline file · Summit project file' : '',
    flex: 1.4,
  }),
])}
${H.signatures({
  title: 'Record of the meeting',
  copy: 'These minutes are the record of the meeting. Corrections must be received in writing by the corrections-due date above; otherwise the minutes stand as issued.',
  parties: [
    {
      name: 'Prepared by',
      sub: s ? SAMPLE_COMPANY.name : 'minutes taker',
      fields: [
        { label: 'Signature', name: 'sig.prepared' },
        {
          label: 'Printed name and title',
          name: 'sig.prepared_name',
          value: s ? `${STORY.people.pm}, Project Manager` : '',
        },
        { label: 'Date', name: 'sig.prepared_date', value: s ? '09/02/2026' : '' },
      ],
    },
    {
      name: 'Reviewed by',
      sub: s ? SAMPLE_GC.name : 'chair / general contractor',
      fields: [
        { label: 'Signature', name: 'sig.reviewed' },
        {
          label: 'Printed name and title',
          name: 'sig.reviewed_name',
          value: s ? `${STORY.people.gcPm}, Project Manager` : '',
        },
        { label: 'Date', name: 'sig.reviewed_date', value: s ? '09/02/2026' : '' },
      ],
    },
  ],
})}
${H.finePrint('Minutes record decisions and actions, not a transcript. A decision recorded here does not change the contract by itself — scope, price or time changes still need a signed change order, and a question about the documents still needs an RFI. General-purpose form, not legal advice.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [page1, page2],
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'MTG-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const children = [
    ...D.companyHeader({
      title: 'Meeting Minutes',
      number: 'Meeting no. ________',
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
        label: 'Meeting',
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
        { label: 'Meeting type', width: Math.round(W * 0.25) },
        { label: 'Date · time', width: Math.round(W * 0.25) },
        { label: 'Location', width: Math.round(W * 0.25) },
        { label: 'Called by / minutes by', width: W - 3 * Math.round(W * 0.25) },
      ],
      [
        { label: 'Minutes issued', width: Math.round(W * 0.25) },
        { label: 'Corrections due', width: Math.round(W * 0.25) },
        { label: 'Next meeting', width: Math.round(W * 0.25) },
        { label: 'Distribution', width: W - 3 * Math.round(W * 0.25) },
      ],
    ]),
    D.heading('Attendees', 'type: ' + MEETING_TYPES.join(' · ')),
    D.table({
      columns: [
        { label: 'Name', width: 2900 },
        { label: 'Company · role', width: 3400 },
        { label: 'Present', width: 1100, align: 'center' },
        { label: 'Email / phone', width: 2680 },
      ],
      blankRows: 8,
      blankHeight: 300,
    }),
    D.heading(
      'Agenda, discussion & actions',
      'number items meeting.item (14.01); carried items keep their number'
    ),
    D.table({
      columns: [
        { label: 'Item', width: 700 },
        { label: 'Topic', width: 1600 },
        { label: 'Discussion / decision', width: 3100 },
        { label: 'Action', width: 1900 },
        { label: 'Owner', width: 1000 },
        { label: 'Due', width: 800 },
        { label: 'Status', width: 980 },
      ],
      blankRows: 12,
      blankHeight: 420,
    }),
    ...D.textBox('Old business', {
      lines: 3,
      hint: 'Items carried from earlier meetings and their status.',
    }),
    ...D.textBox('New business', { lines: 3, hint: 'Raised today, not yet an action item.' }),
    ...D.signatures({
      title: 'Record of the meeting',
      copy: 'These minutes are the record of the meeting. Corrections must be received in writing by the corrections-due date; otherwise the minutes stand as issued.',
      parties: [
        { name: 'Prepared by', sub: 'minutes taker' },
        { name: 'Reviewed by', sub: 'chair / general contractor' },
      ],
    }),
    D.fine(
      'Minutes record decisions and actions, not a transcript. A decision recorded here does not change the contract by itself — scope, price or time changes still need a signed change order, and a question about the documents still needs an RFI. General-purpose form, not legal advice.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Meeting minutes' });
}
