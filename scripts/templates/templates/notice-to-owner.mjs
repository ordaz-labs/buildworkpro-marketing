// Notice to owner (Florida) — the preliminary notice a subcontractor, sub-sub
// or supplier serves on the owner under Fla. Stat. § 713.06(2). One page: the
// statutory WARNING and IMPORTANT INFORMATION blocks verbatim, the owner,
// services/materials, property and "order given by" fields, lienor signature,
// the copies-to list, and a service record for the lienor's file (first
// furnishing date, 45-day deadline, certified mail number). Fillable PDF + Word.
//
// The statutory wording below was copied from The 2026 Florida Statutes,
// s. 713.06(2)(c), as published by the Florida Legislature (leg.state.fl.us).
//
// Sample: Summit Mechanical's Tampa office, subcontractor to Brightline on the
// Florida job whose notice of commencement is the notice-of-commencement sample.
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { STORY } from '../kit/tokens.mjs';
import { FL } from './notice-of-commencement.mjs';

export const meta = {
  slug: 'notice-to-owner',
  name: 'Notice to Owner (Florida)',
  basename: 'notice-to-owner-florida',
  docName: 'Notice to owner',
};

const SAMPLE = {
  lienor: {
    name: 'Summit Mechanical Contractors',
    line1: '5402 W Laurel St, Suite 110, Tampa, FL 33607',
    line2: '(813) 555-0148 · tampa@summitmech.com',
  },
  furnished:
    'HVAC equipment, ductwork, plumbing and piping labor and materials under the mechanical subcontract (Brightline subcontract SC-2026-231)',
  orderBy: `${FL.contractor.name}, ${FL.contractor.address}`,
  signer: `${STORY.people.pm}, Project Manager`,
  date: 'October 5, 2026',
  copies: [
    [
      'Contractor',
      `${FL.contractor.name}, ${FL.contractor.address}`,
      '9589 0710 5270 0415 8812 36',
    ],
    [
      'Owner’s designee (notice of commencement item 8)',
      `${FL.copyTo.who}, ${FL.lender.name}`,
      '9589 0710 5270 0415 8812 43',
    ],
  ],
  firstFurnished: 'September 21, 2026',
  deadline: 'November 5, 2026',
  mailed: 'October 5, 2026',
  ownerTracking: '9589 0710 5270 0415 8812 29',
  nocRef: `Recorded ${FL.recorded} · ${FL.county} County`,
};

// ---- Statutory text, Fla. Stat. § 713.06(2)(c) (2026) — do not paraphrase ----
const WARNING =
  'WARNING! FLORIDA’S CONSTRUCTION LIEN LAW ALLOWS SOME UNPAID CONTRACTORS, SUBCONTRACTORS, AND MATERIAL SUPPLIERS TO FILE LIENS AGAINST YOUR PROPERTY EVEN IF YOU HAVE MADE PAYMENT IN FULL. UNDER FLORIDA LAW, YOUR FAILURE TO MAKE SURE THAT WE ARE PAID MAY RESULT IN A LIEN AGAINST YOUR PROPERTY AND YOUR PAYING TWICE. TO AVOID A LIEN AND PAYING TWICE, YOU MUST OBTAIN A WRITTEN RELEASE FROM US EVERY TIME YOU PAY YOUR CONTRACTOR.';
const FURNISHED =
  'The undersigned hereby informs you that he or she has furnished or is furnishing services or materials as follows:';
const PRESCRIBES =
  'Florida law prescribes the serving of this notice and restricts your right to make payments under your contract in accordance with Section 713.06, Florida Statutes.';
const IMPORTANT_1 =
  'Under Florida’s laws, those who work on your property or provide materials and are not paid have a right to enforce their claim for payment against your property. This claim is known as a construction lien. If your contractor fails to pay subcontractors or material suppliers or neglects to make other legally required payments, the people who are owed money may look to your property for payment, EVEN IF YOU HAVE PAID YOUR CONTRACTOR IN FULL.';
const PROTECT = [
  'RECOGNIZE that this Notice to Owner may result in a lien against your property unless all those supplying a Notice to Owner have been paid.',
  'LEARN more about the Construction Lien Law, Chapter 713, Part I, Florida Statutes, and the meaning of this notice by contacting an attorney or the Florida Department of Business and Professional Regulation.',
];

const FINE =
  'Contains the information and warnings required by Fla. Stat. § 713.06(2)(c). Serve it before you start, or no later than 45 days after you first furnish labor, services or materials (and before the owner’s final payment), by a method allowed under § 713.18 — certified or registered mail with evidence of delivery is common; keep the mail log or tracking record. A sub-subcontractor or supplier to a subcontractor must also serve the contractor, and anyone designated in the notice of commencement gets a copy. Florida only. Not legal advice — consult a Florida construction attorney.';

const CSS = `
.warn{border:1.5px solid var(--ink);padding:7px 10px;font-size:8.6px;line-height:1.45;font-weight:700;margin-top:10px}
.ttl{font-size:18px;font-weight:700;letter-spacing:1.4px;margin-top:14px}
.body{font-size:9.5px;line-height:1.5;margin-top:8px}
.inf{border:1px solid var(--rule);background:var(--band);padding:7px 10px;margin-top:10px;font-size:8.4px;line-height:1.45;color:var(--ink)}
.inf .t{font-size:8px;letter-spacing:.9px;text-transform:uppercase;font-weight:700;margin-bottom:3px}
.inf p+p{margin-top:3px}
.sl{display:flex;flex-direction:column;flex:1;min-width:0}
.sl .sp{border-bottom:1px solid var(--ink);height:24px;font-size:9.5px;display:flex;align-items:flex-end;padding-bottom:2px}
.sl .lb{font-size:7px;letter-spacing:.6px;text-transform:uppercase;color:var(--ink3);margin-top:2px}
.svc{border:1px dashed var(--ink3);padding:6px 9px 8px;margin-top:10px}
.svc .t{font-size:7.5px;letter-spacing:.9px;text-transform:uppercase;font-weight:700;color:var(--ink2)}
.svc .t span{font-weight:400;letter-spacing:0;text-transform:none;color:var(--ink3)}
`;

const sigLine = (label, name, value, width) =>
  `<div class="sl"${width ? ` style="flex:none;width:${width}px"` : ''}><div class="sp" data-field="${name}">${value ? H.esc(value) : ''}</div><span class="lb">${H.esc(label)}</span></div>`;

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const f = (name, label, value, opts = {}) =>
    H.field({ name, label, value: s ? value : '', ...opts });
  const company = s ? s.lienor : { name: '', line1: '', line2: '' };

  const copiesCols = [
    { key: 'role', label: 'Copy to', width: 190 },
    { key: 'who', label: 'Name and address' },
    { key: 'track', label: 'Certified mail no.', width: 170, mono: true },
  ];
  const copyRows = s ? s.copies.map(([role, who, track]) => ({ cells: { role, who, track } })) : [];

  const body = `
${H.header({ company, title: 'Notice to owner', meta: 'Florida · Fla. Stat. § 713.06(2)', fillable: !sample })}
<div class="warn">${H.esc(WARNING)}</div>
<div class="ttl">NOTICE TO OWNER</div>
${H.fieldRow([
  f('owner.name', 'To — owner’s name', s ? FL.owner.name : '', { flex: 1 }),
  f('owner.address', 'Owner’s address', s ? FL.owner.address : '', { flex: 1.3 }),
])}
<p class="body">${H.esc(FURNISHED)}</p>
${H.textarea({ name: 'furnished', label: 'General description of services or materials', value: s?.furnished, height: 34 }).replace('margin-top:10px', 'margin-top:4px')}
${H.fieldRow([
  f(
    'property',
    'For the improvement of the real property identified as — property description',
    s ? `${FL.property.address} · ${FL.property.legal.split(',').slice(0, 3).join(',')}` : '',
    { flex: 1 }
  ),
])}
${H.fieldRow([
  f('order_by', 'Under an order given by', s?.orderBy, { flex: 1.5 }),
  f('noc', 'Notice of commencement (if recorded)', s?.nocRef, { flex: 1 }),
])}
<p class="body">${H.esc(PRESCRIBES)}</p>
<div class="inf"><div class="t">Important information for your protection</div><p>${H.esc(IMPORTANT_1)}</p><p><b>PROTECT YOURSELF:</b></p>${PROTECT.map((t) => `<p>— ${H.esc(t)}</p>`).join('')}</div>
<div class="row" style="gap:16px;margin-top:14px">
  ${sigLine('Lienor’s signature', 'sig.lienor', '')}
  ${sigLine('Lienor’s name (company) and signer', 'sig.name', s ? `${s.lienor.name} · ${s.signer}` : '')}
</div>
<div class="row" style="gap:16px;margin-top:6px">
  ${sigLine('Lienor’s address', 'sig.address', s?.lienor.line1)}
  ${sigLine('Date', 'sig.date', s?.date, 130)}
</div>
${H.section('Copies to', 'those persons listed in Section 713.06(2)(a) and (b), Florida Statutes')}
${H.table({ columns: copiesCols, rows: copyRows, blankRows: s ? 1 : 3, fieldPrefix: 'copy', variant: 'compact', rowHeight: 20 })}
<div class="svc"><div class="t">Service record <span>— keep on the lienor’s copy; not part of the statutory notice</span></div>
${H.fieldRow(
  [
    f('svc.first', 'First furnished', s?.firstFurnished),
    f('svc.deadline', '45-day deadline', s?.deadline),
    f('svc.mailed', 'Date mailed or served', s?.mailed),
    f('svc.owner_track', 'Owner’s certified mail no.', s?.ownerTracking, { flex: 1.3 }),
  ],
  14
).replace('margin-top:10px', 'margin-top:4px')}
</div>
${H.finePrint(FINE)}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    css: CSS,
    footer: H.footerText(`${meta.docName} · Florida · Fla. Stat. § 713.06`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const half = Math.round(W / 2);
  const q = Math.round(W / 4);
  const children = [
    ...D.companyHeader({
      title: 'Notice to Owner',
      number: 'Florida · § 713.06',
      date: 'Date ____________',
    }),
    D.p(WARNING, {
      size: 9,
      bold: true,
      after: 160,
      border: {
        top: { style: D.BorderStyle.SINGLE, size: 12, color: D.C.ink, space: 4 },
        bottom: { style: D.BorderStyle.SINGLE, size: 12, color: D.C.ink, space: 4 },
        left: { style: D.BorderStyle.SINGLE, size: 12, color: D.C.ink, space: 4 },
        right: { style: D.BorderStyle.SINGLE, size: 12, color: D.C.ink, space: 4 },
      },
    }),
    D.p([D.run('NOTICE TO OWNER', { size: 16, bold: true, spacing: 30 })], {
      before: 120,
      after: 80,
    }),
    D.fieldGrid([
      [
        { label: 'To — owner’s name', width: half },
        { label: 'Owner’s address', width: W - half },
      ],
    ]),
    D.p(FURNISHED, { size: 9.5, before: 80, after: 60 }),
    ...D.textBox('General description of services or materials', { lines: 2 }),
    D.fieldGrid([
      [
        {
          label: 'For the improvement of the real property identified as — property description',
          width: W,
        },
      ],
      [
        { label: 'Under an order given by', width: half },
        { label: 'Notice of commencement (if recorded)', width: W - half },
      ],
    ]),
    D.p(PRESCRIBES, { size: 9.5, before: 80, after: 80 }),
    D.heading('Important information for your protection'),
    D.p(IMPORTANT_1, { size: 9, after: 60 }),
    D.p('PROTECT YOURSELF:', { size: 9, bold: true, after: 40 }),
    ...PROTECT.map((t) => D.p(`—${t}`, { size: 9, after: 40 })),
    D.fieldGrid([
      [
        { label: 'Lienor’s signature', width: half },
        { label: 'Lienor’s name (company) and signer', width: W - half },
      ],
      [
        { label: 'Lienor’s address', width: half },
        { label: 'Date', width: W - half },
      ],
    ]),
    D.heading('Copies to', 'persons listed in Section 713.06(2)(a) and (b), Florida Statutes'),
    D.table({
      columns: [
        { label: 'Copy to', width: q },
        { label: 'Name and address', width: 2 * q },
        { label: 'Certified mail no.', width: W - 3 * q },
      ],
      blankRows: 3,
    }),
    D.heading('Service record', 'for the lienor’s file'),
    D.fieldGrid([
      [
        { label: 'First furnished', width: q },
        { label: '45th day after', width: q },
        { label: 'Date mailed / served', width: q },
        { label: 'Owner’s certified mail no.', width: W - 3 * q },
      ],
    ]),
    D.fine(FINE),
  ];
  return D.document({ title: meta.name, children, footerCenter: `${meta.docName} · Florida` });
}
