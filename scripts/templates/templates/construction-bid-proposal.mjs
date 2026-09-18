// Construction bid proposal — the customer-facing wrapper around the estimate:
// scope, base bid with alternates and allowances, inclusions and exclusions,
// schedule, payment terms, validity and an acceptance block. Word (primary)
// and a flowing PDF whose page-1 fields are fillable.
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'construction-bid-proposal',
  name: 'Construction Bid Proposal Template',
  basename: 'construction-bid-proposal-template',
  docName: 'Bid proposal',
};

const SAMPLE = {
  number: 'BP-2026-041',
  date: 'May 4, 2026',
  valid: 'June 3, 2026',
  validDays: '30',
  preparedBy: `${STORY.people.estimator}, Estimator`,
  package: 'Mechanical & plumbing (Div. 22 & 23)',
  docs: 'M-001–M-602 & P-001–P-402 (03/27/2026) · Project Manual Div. 22 & 23 · Addenda 1–2',
  base: STORY.contractSum,
  scope: `${SAMPLE_COMPANY.name} proposes to furnish all labor, materials, equipment and supervision for the complete mechanical and plumbing scope for Building B, per the bid documents listed above.
• HVAC — four packaged rooftop units RTU-1 to RTU-4 per M-601 with curbs, economizers and factory BACnet controllers; galvanized supply, return and exhaust ductwork, VAV terminals, air devices and fire/smoke dampers per M-201 to M-402; refrigerant and hydronic piping; DDC controls and BMS integration; insulation; testing, adjusting and balancing by an independent agency; commissioning support.
• Plumbing — underground sanitary and storm within the building footprint to 5 ft outside; domestic water rough-in and distribution; sanitary waste and vent; plumbing fixtures and trim per P-601; installation of the owner-furnished water heater WH-1.
• Submittals, coordination drawings, permits for our work, start-up, O&M manuals and owner training.`,
  alternates: [
    {
      n: 'Alt 1',
      desc: 'Upgrade RTU-1 to RTU-4 to high-efficiency units per Addendum 2',
      amount: 28400,
    },
    { n: 'Alt 2', desc: 'BMS graphics package and remote-access license', amount: 6750 },
    {
      n: 'Alt 3',
      desc: 'Delete reheat coils at second-floor exam-room VAV terminals',
      amount: -9300,
    },
    {
      n: 'Allow.',
      desc: 'Installation of owner-furnished water heater WH-1 — carried in the base bid; credited if deleted',
      amount: 1980,
      allowance: true,
    },
  ],
  inclusions: `• Permits and inspections for mechanical and plumbing work
• Submittals, coordination drawings, O&M manuals and training
• Crane and rigging for the RTU sets
• Start-up, independent TAB and commissioning support
• One-year warranty on labor and materials from substantial completion
• Sales and use tax on materials
• Daily cleanup of our debris to the GC-provided dumpster`,
  exclusions: `• Medical gas systems and fire protection
• Power wiring, disconnects and starters (Div. 26)
• Roof curb flashing, roofing repairs, cutting, patching and painting
• Structural steel, dunnage and concrete housekeeping pads
• Utility tap, impact and connection fees
• Overtime or premium time unless directed by written change order
• Temporary heat and hazardous-material handling
• Payment and performance bonds (add 1.2% if required)`,
  start: STORY.startDate,
  completion: STORY.completionDate,
  duration: '24 weeks',
  scheduleNotes:
    'Submittals within 10 business days of award; RTUs ship 12 weeks after submittal approval. Work sequenced per the Brightline baseline schedule dated 04/15/2026, floors 1–2 in that order.',
  billing: 'Monthly, against an approved schedule of values',
  retainage: `${STORY.retainagePct}%, released at final completion`,
  due: 'Net 30 from application date',
  sig: {
    contractor: `${STORY.people.pm}, Project Manager`,
    contractorDate: '05/04/2026',
    accepted: `${STORY.people.gcPm}, Project Manager`,
    acceptedDate: '05/18/2026',
  },
};

/** Terms printed on both the blank and the completed proposal. */
const TERMS = (s) => [
  [
    'Validity',
    `This proposal is valid for ${s ? s.validDays : '____'} days from the proposal date. After that, pricing is subject to material and labor escalation.`,
  ],
  [
    'Payment',
    'Progress payments are invoiced monthly against an approved schedule of values, with retainage as stated above. Stored materials are billable with a bill of sale and insurance certificate. Final payment, including retainage, is due within 30 days of final completion and acceptance.',
  ],
  [
    'Changes',
    'Changes to the work require a written change order signed by both parties before the changed work begins. Directed work performed ahead of signature is recorded on time-and-material tickets and priced at the rates in this proposal.',
  ],
  [
    'Schedule',
    'The price assumes continuous access to the work areas in the sequence above. Delays not caused by us extend the contract time and may be priced as a change.',
  ],
  [
    'Insurance & warranty',
    "We carry general liability, automobile and workers' compensation insurance and will name the owner and general contractor as additional insureds on request. Labor and materials are warranted for one year from substantial completion; manufacturers' warranties pass through.",
  ],
  [
    'Agreement',
    'When accepted below, this proposal — including its inclusions, exclusions and terms — forms the agreement between the parties unless superseded by a mutually executed subcontract consistent with it.',
  ],
];

/**
 * Flow document: the kit applies @page margins on every printed page and the
 * browser breaks pages at `.avoid` block boundaries.
 */
const CSS = `
.section{margin-top:12px}
.hero{margin-top:10px}
table.t{margin-top:8px}
.pg2{break-before:auto}
`;

const FINE =
  'General-purpose form, not legal advice. Have your attorney review the terms and confirm they fit your state and the bid documents before relying on them. Everything named in the exclusions is a dispute you never have.';

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const money = (n) => (n < 0 ? '(' + H.money(-n) + ')' : H.money(n));

  const altRows = s
    ? s.alternates.map((a) => ({
        cells: { n: a.n, desc: a.desc, amount: money(a.amount) },
        tag: a.allowance
          ? { label: 'In base', tone: 'neutral' }
          : { label: a.amount < 0 ? 'Deduct' : 'Add', tone: a.amount < 0 ? 'ded' : 'add' },
      }))
    : [];

  const body = `
${H.header({ company, title: 'Bid proposal', number: s ? s.number : 'BP-____', date: s ? s.date : undefined, fillable: !sample })}
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
    label: 'Submitted to',
    lines: [
      { text: s ? SAMPLE_GC.name : '', strong: true, field: 'to.name' },
      { text: s ? SAMPLE_GC.line1 : '', field: 'to.line1' },
      { text: s ? SAMPLE_GC.line2 : '', field: 'to.line2' },
    ],
  },
  {
    label: 'Proposal',
    kv: [
      { k: 'Proposal date', v: s ? s.date : '', field: 'prop.date' },
      { k: 'Pricing valid through', v: s ? s.valid : '', field: 'prop.valid' },
      { k: 'Base bid', v: s ? H.money(s.base) : '', field: 'prop.base', mono: true, strong: true },
    ],
  },
])}
${H.fieldRow([
  H.field({
    name: 'prop.docs',
    label: 'Bid documents & addenda',
    hint: 'drawing set and date, spec divisions, addenda acknowledged',
    value: s ? s.docs : '',
    flex: 2.2,
  }),
  H.field({
    name: 'prop.package',
    label: 'Trade / bid package',
    value: s ? s.package : '',
    flex: 1.1,
  }),
  H.field({
    name: 'prop.prepared_by',
    label: 'Prepared by',
    value: s ? s.preparedBy : '',
    flex: 0.9,
  }),
])}
<div class="avoid">
${H.section('Scope of work', 'systems, drawings, spec sections and areas — what the price covers')}
${H.textarea({ name: 'scope', label: 'We propose to furnish all labor, materials, equipment and supervision to complete the following work', value: s ? s.scope : '', height: 110 })}
</div>
<div class="avoid">
${H.section('Price', 'lump sum, plus alternates and allowances broken out')}
${H.hero({ label: 'Base bid — all work described above', sub: s ? 'Lump sum. Sales and use tax on materials included. Bonds excluded.' : 'Lump sum for the scope of work above', amount: s ? H.money(s.base) : '', field: 'price.base' })}
${H.table({
  columns: [
    { key: 'n', label: 'Item', width: 52, mono: true },
    {
      key: 'desc',
      label: 'Alternates and allowances — priced separately, not in the base bid unless noted',
    },
    { key: 'amount', label: 'Add / (deduct)', width: 110, align: 'right' },
  ],
  rows: altRows,
  blankRows: sample ? 0 : 4,
  fieldPrefix: 'alt',
  variant: 'compact',
})}
</div>
<div class="avoid">
${H.section('Inclusions & exclusions', 'name it here or argue about it later')}
${H.split(
  H.textarea({
    name: 'inclusions',
    label: 'Included in the price',
    hint: 'permits, hoisting, testing, warranty, cleanup…',
    value: s ? s.inclusions : '',
    height: 112,
  }),
  H.textarea({
    name: 'exclusions',
    label: 'Not included',
    hint: 'other trades, fees, overtime, unforeseen conditions…',
    value: s ? s.exclusions : '',
    height: 112,
  }),
  [1, 1],
  16
)}
</div>
<div class="avoid">
${H.section('Schedule')}
${H.fieldRow([
  H.field({ name: 'sched.start', label: 'Anticipated start', value: s ? s.start : '' }),
  H.field({
    name: 'sched.completion',
    label: 'Substantial completion',
    value: s ? s.completion : '',
  }),
  H.field({ name: 'sched.duration', label: 'Duration', value: s ? s.duration : '' }),
])}
${H.textarea({ name: 'sched.notes', label: 'Schedule notes', hint: 'lead times, submittal turnaround, sequencing assumptions', value: s ? s.scheduleNotes : '', height: 40 })}
</div>
<div class="avoid">
${H.section('Payment terms')}
${H.fieldRow([
  H.field({ name: 'pay.billing', label: 'Progress billing', value: s ? s.billing : '', flex: 1.4 }),
  H.field({ name: 'pay.retainage', label: 'Retainage', value: s ? s.retainage : '' }),
  H.field({ name: 'pay.due', label: 'Payment due', value: s ? s.due : '' }),
])}
</div>
<div class="pg2">
${H.section('Terms and conditions')}
<div class="numbered" style="margin-top:2px">
${TERMS(s)
  .map(([title, text], i) => H.clause(i + 1, title, text))
  .join('')}
</div>
</div>
${H.signatures({
  title: 'Acceptance',
  copy: 'To accept this proposal, sign and date below and return a copy. Acceptance authorizes us to begin submittals and procurement on the start date above.',
  parties: [
    {
      name: 'Submitted by',
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
    {
      name: 'Accepted by',
      sub: s ? SAMPLE_GC.name : 'owner / general contractor',
      fields: [
        { label: 'Signature', name: 'sig.owner' },
        { label: 'Printed name and title', name: 'sig.owner_name', value: s ? s.sig.accepted : '' },
        { label: 'Date', name: 'sig.owner_date', value: s ? s.sig.acceptedDate : '' },
      ],
    },
  ],
})}
${H.finePrint(FINE)}
</div>`;

  const doc = H.flowDocument({ title: meta.name, body, css: CSS });
  return {
    sections: [
      {
        html: doc,
        mode: 'flow',
        landscape: false,
        footer: H.footerText(`${meta.docName} · ${s ? s.number : 'BP-____'}`),
      },
    ],
  };
}

export async function docx() {
  const W = D.CONTENT_W;
  const w = (f) => Math.round(W * f);
  // Guidance line that stays with the box under it (D.textBox's own hint does not keepNext).
  const hint = (text) =>
    D.p([D.run(text, { size: 8, italic: true, color: D.C.ink3 })], { after: 40, keepNext: true });
  const children = [
    ...D.companyHeader({
      title: 'Bid Proposal',
      number: 'Proposal No. ________',
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
        label: 'Submitted to (owner / general contractor)',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
    ]),
    D.fieldGrid([
      [
        { label: 'Bid documents & addenda', width: w(0.5) },
        { label: 'Trade / bid package', width: w(0.27) },
        { label: 'Pricing valid through', width: W - w(0.5) - w(0.27) },
      ],
    ]),
    D.heading('Scope of work', 'systems, drawings, spec sections and areas'),
    D.p(
      'We propose to furnish all labor, materials, equipment and supervision to complete the following work for the price and on the terms set out in this proposal:',
      { size: 9.5, after: 80 }
    ),
    hint(
      'Be specific: systems covered, drawing sheets and spec sections, floors or areas, performance standards. The scope section is what protects you when "while you\'re here" requests start.'
    ),
    ...D.textBox('Work included', { lines: 4 }),
    D.heading('Price', 'lump sum, plus alternates and allowances broken out'),
    D.ladder(
      [{ k: 'Base bid — all work described above (lump sum)', v: '$', total: true, input: true }],
      {
        kWidth: 7000,
      }
    ),
    D.table({
      columns: [
        { label: 'Item', width: 1000 },
        {
          label: 'Alternates and allowances — priced separately, not in the base bid unless noted',
          width: W - 1000 - 1700,
        },
        { label: 'Add / (deduct)', width: 1700, align: 'right' },
      ],
      rows: [
        { cells: ['Alt 1', '', '$'], input: [false, true, true] },
        { cells: ['Alt 2', '', '$'], input: [false, true, true] },
        { cells: ['Allow.', '', '$'], input: [false, true, true] },
      ],
    }),
    D.heading(
      'Inclusions',
      'what the price covers — every inclusion you name is an argument you never have'
    ),
    hint(
      'Permits, submittals, hoisting, testing, start-up, warranty, cleanup, sales tax on materials.'
    ),
    ...D.textBox('Included in the price', { lines: 3 }),
    D.heading('Exclusions', 'the most valuable paragraph in this document'),
    hint(
      'Other trades, cutting and patching, painting, fees, overtime, unforeseen conditions, bonds.'
    ),
    ...D.textBox('Not included', { lines: 3 }),
    D.heading('Schedule'),
    D.fieldGrid([
      [
        { label: 'Anticipated start', width: w(0.24) },
        { label: 'Substantial completion', width: w(0.24) },
        { label: 'Schedule notes — lead times, sequencing', width: W - 2 * w(0.24) },
      ],
    ]),
    D.heading('Payment terms'),
    D.fieldGrid([
      [
        { label: 'Progress billing', width: w(0.4) },
        { label: 'Retainage', width: w(0.3) },
        { label: 'Payment due', width: W - w(0.4) - w(0.3) },
      ],
    ]),
    D.heading('Terms and conditions'),
    ...TERMS(null).map(([title, text], i) => D.clause(i + 1, title, text)),
    ...D.signatures({
      title: 'Acceptance',
      copy: 'To accept this proposal, sign and date below and return a copy. Acceptance authorizes us to begin submittals and procurement on the start date above.',
      parties: [
        { name: 'Submitted by', sub: 'your company' },
        { name: 'Accepted by', sub: 'owner / general contractor' },
      ],
    }),
    D.fine(
      'General-purpose form, not legal advice. Have your attorney review the terms and confirm they fit your state and the bid documents before relying on them.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Bid proposal' });
}
