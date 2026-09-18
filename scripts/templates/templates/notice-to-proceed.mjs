// Notice to proceed — one-page letter-form: to/from, project, contract
// reference, commencement date, contract time and completion date, the
// conditions received or outstanding, site coordination, and an
// acknowledgment signature. Fillable PDF and Word.
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'notice-to-proceed',
  name: 'Notice to Proceed Template',
  basename: 'notice-to-proceed-template',
  docName: 'Notice to proceed',
};

// The completed example: Brightline (GC) issues the notice to Summit under the
// STORY subcontract. June 1 + 170 calendar days = November 18, 2026.
const SAMPLE = {
  number: 'NTP-001',
  date: 'May 28, 2026',
  issuer: {
    name: SAMPLE_GC.name,
    line1: SAMPLE_GC.line1,
    line2: '(303) 555-0192 · projects@brightlinebuilders.com · Lic. GC-118842',
  },
  to: {
    name: SAMPLE_COMPANY.name,
    line1: SAMPLE_COMPANY.line1,
    attn: `Attn: ${STORY.people.pm}, Project Manager · (303) 555-0148`,
  },
  contract: {
    number: 'SC-2026-118',
    date: STORY.contractDate,
    sum: STORY.contractSum,
    scope: 'Mechanical and plumbing (Exhibit A)',
  },
  commencement: STORY.startDate,
  days: '170',
  substantial: STORY.completionDate,
  final: 'December 4, 2026',
  conditions: {
    agreement: true,
    insurance: true,
    bonds: false,
    sov: true,
    schedule: true,
    safety: true,
    permits: true,
    submittals: false,
  },
  outstanding:
    'Payment and performance bonds are not required under Section 7 of the Agreement. Preliminary submittals for RTU-1 to RTU-4 are due June 8 per the scope of work; release of long-lead equipment is authorized on receipt of this notice.',
  site: {
    meeting: 'May 29, 2026 · 8:00 a.m., site trailer',
    contact: `${STORY.people.gcSuper}, Superintendent · (303) 555-0193`,
    hours: 'Mon–Fri 7:00 a.m.–3:30 p.m.',
    access: 'Gate B off Harbor Point Blvd; laydown NE corner',
  },
  instructions:
    'Mobilize no earlier than June 1. Underground work is released; the slab pour is scheduled for June 29 — schedule below-slab inspections with the superintendent 48 hours ahead. Submit the first application for payment by June 25 for work through June 30.',
  issued: { name: `${STORY.people.gcPm}, Project Manager`, date: '05/28/2026' },
  acknowledged: { name: `${STORY.people.pm}, Project Manager`, date: '05/29/2026' },
};

const CONDITIONS = [
  ['agreement', 'Signed agreement received'],
  ['insurance', 'Certificates of insurance and endorsements received'],
  ['bonds', 'Payment and performance bonds received (if required)'],
  ['sov', 'Schedule of values approved'],
  ['schedule', 'Baseline schedule submitted'],
  ['safety', 'Site-specific safety plan received'],
  ['permits', 'Permits for the Work received'],
  ['submittals', 'Preliminary submittals received'],
];

const NOTICE_COPY =
  'You are hereby notified to proceed with the Work under the Agreement referenced above. The Contract Time begins on the commencement date stated below; conditions not yet met are listed under Conditions.';

const SIGN_COPY =
  'Receipt acknowledged. The Contract Time begins on the commencement date stated above; outstanding conditions will be met before the related work begins.';

const FINE =
  'General-purpose form, not legal advice. Issue a notice to proceed only after the conditions precedent in your agreement are met — insurance, bonds where required, permits and an approved schedule of values — because the commencement date is the date the schedule, any liquidated damages and every time extension are measured from. Keep the acknowledged copy with the agreement.';

function conditionGrid(s) {
  const box = ([key, label]) =>
    `<div style="flex:1;min-width:0;padding:3px 0">${H.checkbox({ name: `cond.${key}`, label, checked: !!s && s.conditions[key] })}</div>`;
  const left = CONDITIONS.slice(0, 4).map(box).join('');
  const right = CONDITIONS.slice(4).map(box).join('');
  return `<div class="row" style="gap:20px;margin-top:8px"><div class="col grow">${left}</div><div class="col grow">${right}</div></div>`;
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = s ? s.issuer : { name: '', line1: '', line2: '' };
  const f = (name, label, value, opts = {}) =>
    H.field({ name, label, value: s ? value : '', ...opts });

  const body = `
${H.header({ company, title: 'Notice to proceed', number: s ? s.number : 'NTP-____', date: s?.date, fillable: !sample })}
${H.metaRow([
  {
    label: 'To (contractor / subcontractor)',
    lines: [
      { text: s?.to.name ?? '', strong: true, field: 'to.name' },
      { text: s?.to.line1 ?? '', field: 'to.line1' },
      { text: s?.to.attn ?? '', field: 'to.attn' },
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
    label: 'Agreement',
    kv: [
      { k: 'Agreement no.', v: s?.contract.number ?? '', field: 'contract.number', mono: true },
      { k: 'Agreement date', v: s?.contract.date ?? '', field: 'contract.date' },
      { k: 'Contract sum', v: s ? H.money(s.contract.sum) : '', field: 'contract.sum', mono: true },
      { k: 'Scope', v: s?.contract.scope ?? '', field: 'contract.scope' },
    ],
  },
])}
${H.prose(`<p style="margin-top:14px">${H.esc(NOTICE_COPY)}</p>`)}
${H.fieldRow([
  f('time.commencement', 'Commencement date', s?.commencement, { flex: 1.1 }),
  f('time.days', 'Contract time (calendar days)', s?.days, { flex: 1.1 }),
  f('time.substantial', 'Substantial completion', s?.substantial, { flex: 1 }),
  f('time.final', 'Final completion (optional)', s?.final, { flex: 1 }),
])}
${H.section('Conditions', 'check what has been received; list anything outstanding below')}
${conditionGrid(s)}
${H.textarea({
  name: 'outstanding',
  label: 'Outstanding items and conditions of this notice',
  hint: 'what must be received before the related work begins, and any release of long-lead items',
  value: s?.outstanding,
  height: 54,
})}
${H.section('Site coordination')}
${H.fieldRow([
  f('site.meeting', 'Preconstruction meeting (date, time, place)', s?.site.meeting, { flex: 1.2 }),
  f('site.contact', 'Site contact (superintendent)', s?.site.contact, { flex: 1.2 }),
])}
${H.fieldRow([
  f('site.hours', 'Working hours', s?.site.hours),
  f('site.access', 'Site access and laydown', s?.site.access, { flex: 1.4 }),
])}
${H.textarea({
  name: 'instructions',
  label: 'Special instructions',
  hint: 'phasing, released areas, inspections, first billing date',
  value: s?.instructions,
  height: 60,
})}
${H.signatures({
  title: 'Issued and acknowledged',
  copy: SIGN_COPY,
  parties: [
    {
      name: 'Issued by',
      sub: s ? s.issuer.name : 'owner / general contractor',
      fields: [
        { label: 'Signature', name: 'sig.issued' },
        { label: 'Printed name and title', name: 'sig.issued_name', value: s?.issued.name },
        { label: 'Date', name: 'sig.issued_date', value: s?.issued.date },
      ],
    },
    {
      name: 'Acknowledged by',
      sub: s ? s.to.name : 'contractor / subcontractor',
      fields: [
        { label: 'Signature', name: 'sig.ack' },
        { label: 'Printed name and title', name: 'sig.ack_name', value: s?.acknowledged.name },
        { label: 'Date', name: 'sig.ack_date', value: s?.acknowledged.date },
      ],
    },
  ],
})}
${H.finePrint(FINE)}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    footer: H.footerText(`${meta.docName}${s ? ` · ${s.number}` : ''}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const q = Math.round(W / 4);
  const half = Math.round(W / 2);
  const children = [
    ...D.companyHeader({
      title: 'Notice to Proceed',
      number: 'NTP No. ________',
      date: 'Date ____________',
    }),
    D.metaRow([
      {
        label: 'To — name, address, attention',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Project — name, number, address',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
        ],
      },
    ]),
    D.fieldGrid([
      [
        { label: 'Agreement no.', width: q },
        { label: 'Agreement date', width: q },
        { label: 'Contract sum', width: q },
        { label: 'Scope', width: W - 3 * q },
      ],
    ]),
    D.p(NOTICE_COPY, { size: 9, before: 80, after: 80 }),
    D.fieldGrid([
      [
        { label: 'Commencement date', width: q },
        { label: 'Calendar days', width: q },
        { label: 'Substantial completion', width: q },
        { label: 'Final completion', width: W - 3 * q },
      ],
    ]),
    D.heading('Conditions', 'check what has been received; list anything outstanding below'),
    ...[0, 2, 4, 6].map((i) =>
      D.p(
        [
          D.checkbox(CONDITIONS[i][1]),
          new D.TextRun({ children: [new D.Tab()], font: D.FONT }),
          D.checkbox(CONDITIONS[i + 1][1]),
        ],
        { after: 60, tabStops: [{ type: D.TabStopType.LEFT, position: half }] }
      )
    ),
    ...D.textBox(
      'Outstanding items and conditions of this notice — and any release of long-lead items',
      {
        lines: 1,
      }
    ),
    D.heading('Site coordination'),
    D.fieldGrid([
      [
        { label: 'Preconstruction meeting (date, time, place)', width: half },
        { label: 'Site contact (superintendent)', width: W - half },
      ],
      [
        { label: 'Working hours', width: half },
        { label: 'Site access and laydown', width: W - half },
      ],
    ]),
    ...D.textBox(
      'Special instructions — phasing, released areas, inspections, first billing date',
      {
        lines: 1,
      }
    ),
    ...D.signatures({
      title: 'Issued and acknowledged',
      copy: SIGN_COPY,
      parties: [
        { name: 'Issued by', sub: 'owner / general contractor' },
        { name: 'Acknowledged by', sub: 'contractor / subcontractor' },
      ],
      lines: ['Signature', 'Name, title and date'],
    }),
    D.fine(FINE),
  ];
  return D.document({ title: meta.name, children, footerCenter: meta.docName });
}
