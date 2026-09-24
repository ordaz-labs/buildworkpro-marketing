// Letter of intent (construction) — a GC-to-subcontractor LOI awarding a scope
// pending the formal subcontract: scope and price, a not-to-exceed early-work
// authorization, schedule, conditions, the non-binding clause, and acceptance
// signatures. One page, fillable PDF and Word.
//
// Sample: Brightline Builders tells Summit Mechanical it intends to award the
// Harbor Point mechanical subcontract (STORY: $486,200, subcontract dated May
// 18, 2026, start June 1) and releases submittals and RTU procurement early.
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_OWNER, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'letter-of-intent',
  name: 'Construction Letter of Intent Template',
  basename: 'construction-letter-of-intent-template',
  docName: 'Letter of intent',
};

const SAMPLE = {
  number: 'LOI-2026-018',
  date: 'May 11, 2026',
  issuer: {
    name: SAMPLE_GC.name,
    line1: SAMPLE_GC.line1,
    line2: '(303) 555-0192 · projects@brightlinebuilders.com · Lic. GC-118842',
  },
  to: {
    name: SAMPLE_COMPANY.name,
    line1: SAMPLE_COMPANY.line1,
    attn: `Attn: ${STORY.people.pm}, Project Manager`,
  },
  prime: `${SAMPLE_OWNER.name} · prime contract dated May 4, 2026`,
  scope:
    'Complete mechanical and plumbing systems per your bid dated April 24, 2026 and drawings M-001 to M-602 and P-001 to P-401 (Rev. 1): underground sanitary and storm, domestic water, waste and vent, RTU-1 to RTU-4, ductwork, hydronic and refrigerant piping, controls and BMS integration, insulation, fixtures, testing, balancing and commissioning. Excludes electrical power wiring and roof curbs (by others).',
  price: STORY.contractSum,
  basis: 'lump',
  nte: 38000,
  early:
    'Submittals and shop drawings for all equipment; release of RTU-1 to RTU-4 purchase order (deposit and shop drawings only); field verification of the Building B slab penetrations. No site work.',
  start: STORY.startDate,
  finish: STORY.completionDate,
  subcontractBy: STORY.contractDate,
  acceptBy: 'May 15, 2026',
  conditions: {
    subcontract: true,
    insurance: true,
    bonds: false,
    sov: true,
    schedule: true,
    license: true,
  },
  signed: {
    gc: { name: `${STORY.people.gcPm}, Project Manager`, date: '05/11/2026' },
    sub: { name: `${STORY.people.pm}, Project Manager`, date: '05/12/2026' },
  },
};

const CONDITIONS = [
  ['subcontract', 'Formal subcontract signed by both parties'],
  ['insurance', 'Certificates of insurance and endorsements'],
  ['bonds', 'Payment and performance bonds'],
  ['sov', 'Schedule of values approved'],
  ['schedule', 'Baseline schedule and manpower plan'],
  ['license', 'Contractor license and registrations verified'],
];

const INTRO =
  'This letter confirms our intent to award you the subcontract described below, subject to the execution of a formal subcontract agreement and the conditions listed. It is issued so that you can hold your price and begin the early work authorized in paragraph 2.';

const TERMS = [
  [
    'Intent only',
    'Except for paragraphs 2 through 4, this letter is a statement of intent, not a subcontract, and does not bind either party to enter into one. Either party may decline to sign the formal subcontract without liability, other than as stated in paragraph 2.',
  ],
  [
    'Early-work authorization',
    'You are authorized to perform only the early work described above, and only up to the not-to-exceed amount. We will pay your documented cost of that work plus the markup in your bid, up to that amount, whether or not the formal subcontract is signed; you will deliver the work product and materials paid for. Work beyond the not-to-exceed amount requires our written increase.',
  ],
  [
    'Formal subcontract governs',
    'When signed, the formal subcontract supersedes this letter. Early work becomes part of the subcontract work, and amounts paid under paragraph 2 are credited against the subcontract price.',
  ],
  [
    'Expiration',
    'This letter lapses if you have not accepted it by the date stated above, or if the formal subcontract is not signed by the date stated, unless both parties extend it in writing.',
  ],
];

const FINE =
  'General-purpose form, not legal advice. Whether a letter of intent is binding depends on its wording and on how the parties act on it, and the law differs by state. Keep early-work authorizations narrow and capped, and have a construction attorney review the letter before you sign or issue it.';

const CSS = `.clause{margin-top:4px;font-size:8.8px;line-height:1.45}.sig{margin-top:12px}.sig .parties{margin-top:12px}.sig .party .who{margin-bottom:6px}.sig .line .sp{height:24px}`;

function conditionGrid(s) {
  const box = ([key, label]) =>
    `<div style="flex:1;min-width:0;padding:2px 0">${H.checkbox({ name: `cond.${key}`, label, checked: !!s && s.conditions[key] })}</div>`;
  return `<div class="row" style="gap:20px;margin-top:6px"><div class="col grow">${CONDITIONS.slice(0, 3).map(box).join('')}</div><div class="col grow">${CONDITIONS.slice(3).map(box).join('')}</div></div>`;
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = s ? s.issuer : { name: '', line1: '', line2: '' };
  const f = (name, label, value, opts = {}) =>
    H.field({ name, label, value: s ? value : '', ...opts });

  const body = `
${H.header({ company, title: 'Letter of intent', number: s ? s.number : 'LOI-____', date: s?.date, fillable: !sample })}
${H.metaRow([
  {
    label: 'To (subcontractor)',
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
    label: 'Owner / prime contract',
    lines: [{ text: s?.prime ?? '', field: 'prime' }],
  },
])}
${H.prose(`<p style="margin-top:10px">${H.esc(INTRO)}</p>`)}
${H.section('1 · Award', 'scope, price and basis')}
${H.textarea({ name: 'scope', label: 'Scope of work', hint: 'bid date, drawings and specs, key inclusions and exclusions', value: s?.scope, height: 50 })}
${H.fieldRow([
  f('price', 'Subcontract price', s ? H.money(s.price) : '', { flex: 1 }),
  `<div class="field" style="flex:2"><span class="label">Price basis</span><div style="margin-top:5px">${H.checkbox({ name: 'basis.lump', label: 'Lump sum', checked: s?.basis === 'lump' })}${H.checkbox({ name: 'basis.unit', label: 'Unit prices' })}${H.checkbox({ name: 'basis.gmp', label: 'Guaranteed maximum' })}${H.checkbox({ name: 'basis.tm', label: 'Time and materials' })}</div></div>`,
])}
${H.section('2 · Early-work authorization', 'optional — leave blank if no work is released')}
${H.fieldRow([
  f('nte', 'Not-to-exceed amount', s ? H.money(s.nte) : '', { width: 150 }),
  f('early', 'Work released before the subcontract is signed', s?.early, { flex: 1 }),
])}
${H.section('Schedule and conditions')}
${H.fieldRow([
  f('start', 'Anticipated start', s?.start),
  f('finish', 'Substantial completion', s?.finish),
  f('subcontract_by', 'Formal subcontract by', s?.subcontractBy),
  f('accept_by', 'Accept this letter by', s?.acceptBy),
])}
<div class="micro ink2" style="margin-top:8px">Required before work under the subcontract begins:</div>
${conditionGrid(s)}
${H.section('Terms')}
${TERMS.map(([t, b], i) => H.clause(String(i + 1), t, b)).join('')}
${H.signatures({
  title: 'Issued and accepted',
  copy: 'Signed by authorized representatives. The subcontractor’s signature accepts the early-work authorization and confirms the price and scope above.',
  parties: [
    {
      name: 'Contractor',
      sub: s ? s.issuer.name : 'general contractor',
      fields: [
        { label: 'Signature', name: 'sig.gc' },
        { label: 'Printed name and title', name: 'sig.gc_name', value: s?.signed.gc.name },
        { label: 'Date', name: 'sig.gc_date', value: s?.signed.gc.date },
      ],
    },
    {
      name: 'Subcontractor',
      sub: s ? s.to.name : 'accepted by',
      fields: [
        { label: 'Signature', name: 'sig.sub' },
        { label: 'Printed name and title', name: 'sig.sub_name', value: s?.signed.sub.name },
        { label: 'Date', name: 'sig.sub_date', value: s?.signed.sub.date },
      ],
    },
  ],
})}
${H.finePrint(FINE)}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    css: CSS,
    footer: H.footerText(`${meta.docName}${s ? ` · ${s.number}` : ''}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const q = Math.round(W / 4);
  const half = Math.round(W / 2);
  const third = Math.round(W / 3);
  const children = [
    ...D.companyHeader({
      title: 'Letter of Intent',
      number: 'LOI No. ________',
      date: 'Date ____________',
    }),
    D.metaRow([
      {
        label: 'To (subcontractor)',
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
      { label: 'Owner / prime contract', lines: [{ text: '', input: true }] },
    ]),
    D.p(INTRO, { size: 9.5, before: 120, after: 80 }),
    D.heading('1 · Award', 'scope, price and basis'),
    ...D.textBox('Scope of work', {
      lines: 3,
      hint: 'Bid date, drawings and specs, key inclusions and exclusions.',
    }),
    D.fieldGrid([
      [
        { label: 'Subcontract price', width: third },
        {
          label: 'Price basis',
          width: W - third,
          value: '☐ Lump sum   ☐ Unit prices   ☐ Guaranteed maximum   ☐ Time and materials',
        },
      ],
    ]),
    D.heading('2 · Early-work authorization', 'optional — leave blank if no work is released'),
    D.fieldGrid([
      [
        { label: 'Not-to-exceed amount', width: q },
        { label: 'Work released before the subcontract is signed', width: W - q },
      ],
    ]),
    D.heading('Schedule and conditions'),
    D.fieldGrid([
      [
        { label: 'Anticipated start', width: q },
        { label: 'Substantial completion', width: q },
        { label: 'Formal subcontract by', width: q },
        { label: 'Accept this letter by', width: W - 3 * q },
      ],
    ]),
    D.p('Required before work under the subcontract begins:', {
      size: 8.5,
      color: D.C.ink2,
      before: 60,
      after: 40,
    }),
    ...[0, 1, 2].map((i) =>
      D.p(
        [
          D.checkbox(CONDITIONS[i][1]),
          new D.TextRun({ children: [new D.Tab()], font: D.FONT }),
          D.checkbox(CONDITIONS[i + 3][1]),
        ],
        { after: 60, tabStops: [{ type: D.TabStopType.LEFT, position: half }] }
      )
    ),
    D.heading('Terms'),
    ...TERMS.map(([t, b], i) => D.clause(i + 1, t, b)),
    ...D.signatures({
      title: 'Issued and accepted',
      copy: 'Signed by authorized representatives. The subcontractor’s signature accepts the early-work authorization and confirms the price and scope above.',
      parties: [
        { name: 'Contractor', sub: 'general contractor' },
        { name: 'Subcontractor', sub: 'accepted by' },
      ],
    }),
    D.fine(FINE),
  ];
  return D.document({ title: meta.name, children, footerCenter: meta.docName });
}
