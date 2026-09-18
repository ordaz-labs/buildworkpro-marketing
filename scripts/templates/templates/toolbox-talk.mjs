// Toolbox talk / safety meeting record — one portrait page with a 14-row
// sign-in table. PDF fillable + Word. Sample = the tailgate talk before the
// crane day on the STORY job (August 3, 2026), the same morning as JSA-014.
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'toolbox-talk',
  name: 'Toolbox Talk Template',
  basename: 'toolbox-talk-template',
  docName: 'Toolbox talk',
};

const SIGN_IN_ROWS = 14;

const SAMPLE = {
  number: 'TBT-031',
  date: 'August 3, 2026',
  topic: 'Crane lifts and suspended loads — RTU set day',
  presenter: `${STORY.people.foreman}, Foreman`,
  materials: 'JSA-014 · crane lift plan · rigging inspection checklist',
  time: '6:30–6:50 AM',
  location: 'North parking lot crane pad',
  attendeeCount: '9',
  keyPoints:
    '1. Nobody under the load — ever. The exclusion zone on the ground and on the roof is barricaded; if you are not rigging or signaling, stay outside it.\n2. One signal person (Derek). The operator takes signals from Derek only; anyone can call STOP.\n3. Tag lines control the load, never your hands. Guide the unit to the curb with the lines and keep hands out from under it until it is seated.\n4. Tied off within 6 ft of the edge, warning line at 15 ft. Curb openings stay covered until the unit lands.\n5. Wind limit is 20 mph or the operator’s chart, whichever is lower. 6:15 check: 8 mph, clear. Forecast 91°F — water and shade every hour.',
  hazards:
    'Suspended loads and swing radius; rigging failure and pinch points when the load tensions; roof-edge falls and open curbs; overhead lines at the north drive (20 ft clearance verified); heat stress.',
  questions:
    'A. Pham asked whether the relocated RTU-2 curb (CO-001) had been re-checked for the anchor bolt pattern — confirmed Friday. J. Lindqvist reported a missing rung clip on the roof-hatch ladder.',
  actions:
    'Replace the roof-hatch ladder rung clip — L. Herrera — done 6:45 AM. Post exclusion-zone signage at the north drive entrance — D. Cole — before 7:00 AM. Add the heat-break schedule to today’s daily report — L. Herrera.',
  attendees: [
    ['Luis Herrera', 'Summit Mechanical · Foreman'],
    ['Miguel Santos', 'Summit Mechanical · Rigger'],
    ['Derek Cole', 'Summit Mechanical · Signal person'],
    ['Aaron Pham', 'Summit Mechanical · Sheet metal'],
    ['Jake Lindqvist', 'Summit Mechanical · Sheet metal'],
    ['Rosa Delgado', 'Summit Mechanical · Pipefitter'],
    ['Wes Tanner', 'Front Range Crane · Operator'],
    ['Jordan Blake', 'Peak Electric · Foreman'],
    [STORY.people.gcSuper, 'Brightline Builders · Superintendent'],
  ],
};

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const cols = [
    { key: 'n', label: '#', width: 26, align: 'center', mono: true },
    { key: 'name', label: 'Name (print)', width: 190 },
    { key: 'company', label: 'Company / trade', width: 200 },
    { key: 'sig', label: 'Signature' },
  ];
  const rows = s
    ? Array.from({ length: SIGN_IN_ROWS }, (_, i) => ({
        cells: {
          n: String(i + 1),
          name: s.attendees[i]?.[0] ?? '',
          company: s.attendees[i]?.[1] ?? '',
          sig: '',
        },
      }))
    : [];

  const page = `
${H.header({ company, title: 'Toolbox talk', number: s ? s.number : 'TBT-____', date: s ? s.date : undefined, fillable: !sample })}
${H.metaRow([
  {
    label: 'Topic',
    lines: [
      { text: s ? s.topic : '', strong: true, field: 'talk.topic' },
      { text: s ? `Presented by ${s.presenter}` : '', field: 'talk.presenter' },
      { text: s ? `Materials: ${s.materials}` : '', field: 'talk.materials' },
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
    label: 'Meeting',
    kv: [
      { k: 'Date', v: s ? 'Aug 3, 2026' : '', field: 'talk.date', mono: true },
      { k: 'Start – end', v: s ? s.time : '', field: 'talk.time', mono: true },
      { k: 'Location', v: s ? s.location : '', field: 'talk.location' },
      {
        k: 'Attendees',
        v: s ? s.attendeeCount : '',
        field: 'talk.count',
        mono: true,
        strong: true,
      },
    ],
  },
])}
${H.textarea({ name: 'key_points', label: 'Key points', hint: 'three to five things the crew must remember — say them, then write them', value: s ? s.keyPoints : '', height: 96 })}
${H.split(
  H.textarea({
    name: 'hazards',
    label: 'Hazards discussed',
    hint: 'specific to today’s work and location',
    value: s ? s.hazards : '',
    height: 62,
  }),
  H.textarea({
    name: 'questions',
    label: 'Questions / concerns raised',
    hint: 'who raised what',
    value: s ? s.questions : '',
    height: 62,
  })
)}
${H.textarea({ name: 'actions', label: 'Corrective actions / follow-ups', hint: 'action · owner · when', value: s ? s.actions : '', height: 44 })}
${H.section('Attendee sign-in', 'everyone who attended signs; the presenter signs below')}
${H.table({ columns: cols, rows, blankRows: s ? 0 : SIGN_IN_ROWS, fieldPrefix: 'att', variant: 'grid compact', rowHeight: 20 })}
${H.fieldRow([
  H.field({ name: 'sig.presenter', label: 'Presenter signature', flex: 1.4 }),
  H.field({ name: 'sig.presenter_date', label: 'Date', value: s ? '08/03/2026' : '', width: 84 }),
  H.field({
    name: 'sig.supervisor',
    label: 'Reviewed by (supervisor / safety)',
    value: s ? `${STORY.people.pm}, Project Manager` : '',
    flex: 1.4,
  }),
  H.field({ name: 'sig.supervisor_date', label: 'Date', value: s ? '08/04/2026' : '', width: 84 }),
])}
${H.finePrint('General-purpose form, not legal or safety-engineering advice. A toolbox talk records training and communication; it does not replace the task-specific hazard analysis (JSA), the written safety program or the training your jurisdiction and contract require. File it with the daily report for the day.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [page],
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'TBT-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const half = Math.round(W / 2);
  const children = [
    ...D.companyHeader({
      title: 'Toolbox Talk',
      number: 'Talk no. ________',
      date: 'Date ____________',
    }),
    D.metaRow([
      { label: 'Topic', lines: [{ text: '', bold: true, input: true }] },
      { label: 'Project', lines: [{ text: '', bold: true, input: true }] },
    ]),
    D.spacer(4),
    D.fieldGrid([
      [
        { label: 'Presented by', width: Math.round(W * 0.34) },
        { label: 'Start – end time', width: Math.round(W * 0.22) },
        { label: 'Location', width: Math.round(W * 0.28) },
        {
          label: 'Attendees',
          width: W - Math.round(W * 0.34) - Math.round(W * 0.22) - Math.round(W * 0.28),
        },
      ],
    ]),
    ...D.textBox('Key points', {
      lines: 3,
      hint: 'Three to five things the crew must remember — say them, then write them.',
    }),
    D.fieldGrid([
      [
        { label: 'Hazards discussed', width: half, lines: 2 },
        { label: 'Questions / concerns raised', width: W - half, lines: 2 },
      ],
    ]),
    ...D.textBox('Corrective actions / follow-ups', { lines: 1, hint: 'Action · owner · when.' }),
    D.heading('Attendee sign-in', 'everyone who attended signs; the presenter signs below'),
    D.table({
      columns: [
        { label: '#', width: 500, align: 'center' },
        { label: 'Name (print)', width: 3200 },
        { label: 'Company / trade', width: 2800 },
        { label: 'Signature', width: 3580 },
      ],
      rows: Array.from({ length: SIGN_IN_ROWS }, (_, i) => ({
        cells: [String(i + 1), '', '', ''],
        input: [false, true, true, true],
      })),
    }),
    D.fieldGrid([
      [
        { label: 'Presenter signature', width: Math.round(W * 0.35) },
        { label: 'Date', width: Math.round(W * 0.15) },
        { label: 'Reviewed by (supervisor / safety)', width: Math.round(W * 0.35) },
        { label: 'Date', width: W - 2 * Math.round(W * 0.35) - Math.round(W * 0.15) },
      ],
    ]),
    D.fine(
      'General-purpose form, not legal or safety-engineering advice. A toolbox talk records training and communication; it does not replace the task-specific hazard analysis (JSA), the written safety program or the training your jurisdiction and contract require. File it with the daily report for the day.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Toolbox talk' });
}
