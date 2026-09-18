// Certificate of substantial completion — one page: project and contract,
// the definition, the date of substantial completion, the punch list, the
// warranty start, retainage release, responsibilities transferred, closeout
// documents, and contractor / owner / architect signatures. Fillable PDF and Word.
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'certificate-of-completion',
  name: 'Certificate of Substantial Completion Template',
  basename: 'certificate-of-completion-template',
  docName: 'Certificate of substantial completion',
};

// Contract sum as adjusted by CO-001 to CO-003; retainage at STORY.retainagePct.
const ADJUSTED_SUM = STORY.changeOrders.reduce((sum, co) => sum + co.amount, STORY.contractSum);
const RETAINAGE_HELD = Math.round(ADJUSTED_SUM * STORY.retainagePct) / 100;
const PUNCH_VALUE = 4200;
const WITHHELD = PUNCH_VALUE * 1.5;

// The completed example: Summit certifies its mechanical scope on Building B
// substantially complete on the contract completion date; Brightline accepts.
const SAMPLE = {
  number: 'CSC-001',
  date: STORY.completionDate,
  to: {
    name: SAMPLE_GC.name,
    line1: SAMPLE_GC.line1,
    attn: `Attn: ${STORY.people.gcPm}, Project Manager`,
  },
  contract: {
    number: 'SC-2026-118',
    date: STORY.contractDate,
    sum: ADJUSTED_SUM,
    cos: 'CO-001 to CO-003',
  },
  completion: STORY.completionDate,
  portion: 'Mechanical and plumbing — entire Work',
  warrantyStart: STORY.completionDate,
  warrantyEnd: 'November 18, 2027',
  punch: { attached: true, count: '14', value: PUNCH_VALUE, by: 'December 4, 2026' },
  retainage: { held: RETAINAGE_HELD, released: RETAINAGE_HELD - WITHHELD, withheld: WITHHELD },
  responsibilities: ['utilities', 'security', 'maintenance', 'hvac', 'insurance', 'damage'],
  exceptions:
    'Contractor remains responsible for the punch list items and for any damage caused by its crews while completing them.',
  closeout: ['record', 'om', 'warranties', 'training', 'permits'],
  signed: {
    contractor: { name: `${STORY.people.pm}, Project Manager`, date: '11/18/2026' },
    owner: { name: `${STORY.people.gcPm}, Project Manager`, date: '11/19/2026' },
    architect: { name: 'Alison Park, Principal', date: '11/19/2026' },
  },
};

const RESPONSIBILITIES = [
  ['utilities', 'Utilities'],
  ['security', 'Security'],
  ['maintenance', 'Maintenance'],
  ['hvac', 'Heating and cooling'],
  ['insurance', 'Insurance on the Work'],
  ['damage', 'Damage to the Work'],
];

const CLOSEOUT = [
  ['record', 'Record drawings'],
  ['om', 'O&M manuals'],
  ['warranties', 'Warranties'],
  ['training', 'Training complete'],
  ['permits', 'Permit finals signed'],
  ['attic', 'Attic stock / spares'],
];

const DEFINITION =
  'The Work under the Agreement referenced above — or the portion described below — has been inspected and is found to be substantially complete: sufficiently complete in accordance with the Contract Documents that the Owner can occupy or use it for its intended purpose. This is not final completion and does not waive the right to require correction of the items listed below or of defects discovered later.';

const PUNCH_COPY =
  'Failure to complete the listed items by the date stated does not change the date of substantial completion. Amounts withheld for incomplete items are released when they are completed and accepted.';

const RETAINAGE_COPY =
  'Retainage is released as stated above; the balance is due with final payment after the punch list is complete, the closeout documents are accepted, and final lien waivers are delivered.';

const SIGN_COPY =
  'The Contractor certifies, the Owner accepts (subject to the punch list), and the Architect or Engineer, where engaged, confirms that the Work is substantially complete on the date stated.';

const FINE =
  'General-purpose form, not legal advice. Substantial completion usually starts the warranty and the retainage-release clock and shifts responsibility for the Work to the owner — check your agreement before signing. This is not a certificate of occupancy, which only the authority having jurisdiction issues.';

function checkLine(items, prefix, on) {
  return `<div style="display:flex;flex-wrap:wrap;gap:4px 0;margin-top:6px">${items
    .map(([key, label]) =>
      H.checkbox({ name: `${prefix}.${key}`, label, checked: !!on && on.includes(key) })
    )
    .join('')}</div>`;
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const f = (name, label, value, opts = {}) =>
    H.field({ name, label, value: s ? value : '', ...opts });

  const body = `
${H.header({ company, title: 'Certificate of substantial completion', number: s ? s.number : 'CSC-____', date: s?.date, fillable: !sample })}
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
    label: 'Owner / general contractor',
    lines: [
      { text: s?.to.name ?? '', strong: true, field: 'to.name' },
      { text: s?.to.line1 ?? '', field: 'to.line1' },
      { text: s?.to.attn ?? '', field: 'to.attn' },
    ],
  },
  {
    label: 'Agreement',
    kv: [
      { k: 'Agreement no.', v: s?.contract.number ?? '', field: 'contract.number', mono: true },
      { k: 'Agreement date', v: s?.contract.date ?? '', field: 'contract.date' },
      {
        k: 'Contract sum, as adjusted',
        v: s ? H.money(s.contract.sum) : '',
        field: 'contract.sum',
        mono: true,
      },
      { k: 'Change orders included', v: s?.contract.cos ?? '', field: 'contract.cos' },
    ],
  },
])}
${H.prose(`<p style="margin-top:14px">${H.esc(DEFINITION)}</p>`)}
${H.fieldRow([
  f('completion.date', 'Substantial completion date', s?.completion, { flex: 1.15 }),
  f('completion.portion', 'Work or portion certified', s?.portion, { flex: 1.55 }),
  f('warranty.start', 'Warranty period begins', s?.warrantyStart, { flex: 0.9 }),
  f('warranty.end', 'Warranty period ends', s?.warrantyEnd, { flex: 0.9 }),
])}
${H.section('Punch list — items remaining', 'attach the list; the Owner may withhold only the amount stated below')}
<div class="row" style="gap:20px;margin-top:8px;align-items:flex-end">
  <div style="flex:1;padding-bottom:4px">${H.checkbox({ name: 'punch.attached', label: 'Punch list attached', checked: !!s && s.punch.attached })}</div>
  ${f('punch.count', 'Number of items', s?.punch.count, { flex: 0.8 })}
  ${f('punch.value', 'Value of remaining items', s ? H.money(s.punch.value) : '', { flex: 1 })}
  ${f('punch.by', 'To be completed by', s?.punch.by, { flex: 1 })}
</div>
${H.prose(`<p class="small ink2" style="margin-top:8px">${H.esc(PUNCH_COPY)}</p>`)}
${H.section('Retainage and payment')}
${H.fieldRow([
  f('retainage.held', 'Retainage held to date', s ? H.money(s.retainage.held) : ''),
  f('retainage.released', 'Released with certificate', s ? H.money(s.retainage.released) : ''),
  f('retainage.withheld', 'Held to final completion', s ? H.money(s.retainage.withheld) : ''),
  f('retainage.basis', 'Basis for amount withheld', s ? '150% of punch list value' : '', {
    flex: 1.2,
  }),
])}
${H.prose(`<p class="small ink2" style="margin-top:8px">${H.esc(RETAINAGE_COPY)}</p>`)}
${H.section('Responsibilities transferred to the Owner as of the date of substantial completion')}
${checkLine(RESPONSIBILITIES, 'resp', s?.responsibilities)}
${H.fieldRow([
  f('exceptions', 'Exceptions — responsibilities the Contractor retains', s?.exceptions, {
    flex: 1,
  }),
])}
${H.section('Closeout documents delivered')}
${checkLine(CLOSEOUT, 'closeout', s?.closeout)}
${H.signatures({
  title: 'Certified, accepted and confirmed',
  copy: SIGN_COPY,
  parties: [
    {
      name: 'Contractor',
      sub: s ? SAMPLE_COMPANY.name : 'your company',
      fields: [
        { label: 'Signature', name: 'sig.contractor' },
        { label: 'Name and title', name: 'sig.contractor_name', value: s?.signed.contractor.name },
        { label: 'Date', name: 'sig.contractor_date', value: s?.signed.contractor.date },
      ],
    },
    {
      name: 'Owner / GC',
      sub: s ? s.to.name : 'accepting the Work',
      fields: [
        { label: 'Signature', name: 'sig.owner' },
        { label: 'Name and title', name: 'sig.owner_name', value: s?.signed.owner.name },
        { label: 'Date', name: 'sig.owner_date', value: s?.signed.owner.date },
      ],
    },
    {
      name: 'Architect / engineer',
      sub: s ? 'Kestrel Design Group' : 'optional',
      fields: [
        { label: 'Signature', name: 'sig.architect' },
        { label: 'Name and title', name: 'sig.architect_name', value: s?.signed.architect.name },
        { label: 'Date', name: 'sig.architect_date', value: s?.signed.architect.date },
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
  const SHORT = {
    'Heating and cooling': 'Heating / cooling',
    'Insurance on the Work': 'Insurance',
    'Damage to the Work': 'Damage',
    'Training complete': 'Training',
    'Permit finals signed': 'Permit finals',
    'Attic stock / spares': 'Attic stock',
  };
  const boxes = (items) => items.map(([, label]) => `☐ ${SHORT[label] ?? label}`).join('    ');
  const children = [
    ...D.titleBlock({
      title: 'Certificate of Substantial Completion',
      number: 'No. ________',
      date: 'Date ____________',
    }),
    D.metaRow([
      {
        label: 'Your company',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Project',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Owner / general contractor',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
    ]),
    D.fieldGrid([
      [
        { label: 'Agreement no.', width: q },
        { label: 'Agreement date', width: q },
        { label: 'Contract sum, as adjusted', width: q },
        { label: 'Change orders included', width: W - 3 * q },
      ],
      [
        { label: 'Substantial completion date', width: q },
        { label: 'Work or portion certified', width: q },
        { label: 'Warranty period begins', width: q },
        { label: 'Warranty period ends', width: W - 3 * q },
      ],
    ]),
    D.p(DEFINITION, { size: 9.5, before: 80, after: 80 }),
    D.heading(
      'Punch list and retainage',
      'attach the list; a missed date does not move the completion date; balance due at final completion'
    ),
    D.fieldGrid([
      [
        { label: 'Punch list attached', width: q, value: '☐ Yes' },
        { label: 'Number of items', width: q },
        { label: 'Value of remaining items', width: q },
        { label: 'To be completed by', width: W - 3 * q },
      ],
      [
        { label: 'Retainage held to date', width: q },
        { label: 'Released with certificate', width: q },
        { label: 'Held to final completion', width: q },
        { label: 'Basis for amount withheld', width: W - 3 * q },
      ],
    ]),
    D.fieldGrid([
      [
        {
          label:
            'Responsibilities transferred to the Owner as of the date of substantial completion',
          width: W,
          value: boxes(RESPONSIBILITIES),
        },
      ],
      [{ label: 'Exceptions — responsibilities the Contractor retains', width: W }],
      [{ label: 'Closeout documents delivered', width: W, value: boxes(CLOSEOUT) }],
    ]),
    ...D.signatures({
      title: 'Certified, accepted and confirmed',
      copy: SIGN_COPY,
      parties: [
        { name: 'Contractor', sub: 'certifies' },
        { name: 'Owner / GC', sub: 'accepts' },
        { name: 'Architect / engineer', sub: 'optional' },
      ],
      lines: ['Signature', 'Name, title and date'],
    }),
    D.fine(FINE),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Substantial completion' });
}
