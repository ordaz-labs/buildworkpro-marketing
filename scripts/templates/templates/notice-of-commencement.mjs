// Notice of commencement (Florida) — one page following the form in Fla. Stat.
// § 713.13(1)(d): permit and tax folio numbers, the nine numbered items
// (property, improvement, owner, contractor, surety, lender, persons designated
// to receive notices, the owner's additional designee, expiration date), the
// statutory WARNING TO OWNER verbatim, the owner's signature and the Florida
// notary acknowledgment. Fillable PDF and Word.
//
// The statutory wording below was copied from The 2026 Florida Statutes,
// s. 713.13, as published by the Florida Legislature
// (leg.state.fl.us, Chapter 713, Part I). Re-check it when the statute changes.
//
// Sample: a Florida job for the same owner and GC as STORY — Harbor Point
// Development's Tampa medical office building, built by Brightline Builders.
// Summit Mechanical's Tampa office is a lienor on it (see notice-to-owner.mjs).
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_OWNER, SAMPLE_GC } from '../kit/tokens.mjs';

export const meta = {
  slug: 'notice-of-commencement',
  name: 'Notice of Commencement (Florida)',
  basename: 'notice-of-commencement-florida',
  docName: 'Notice of commencement',
};

/** The Florida job shared by the notice of commencement and notice to owner samples. */
export const FL = {
  permit: 'BLD-2026-041882',
  folio: '115246.0104',
  state: 'Florida',
  county: 'Hillsborough',
  recorded: 'September 8, 2026',
  preparedBy: `Grant Holloway, ${SAMPLE_OWNER.name}, ${SAMPLE_OWNER.line1}`,
  property: {
    name: 'Harbor Point Medical Office — Tampa (Building C)',
    legal:
      'Lot 4, Block 2, WESTSHORE COMMERCE CENTER, according to the plat thereof as recorded in Plat Book 118, Page 42, of the Public Records of Hillsborough County, Florida.',
    address: '4800 W Cypress St, Tampa, FL 33607',
  },
  improvement:
    'New three-story medical office building (42,000 sq ft) with site work, utilities and parking',
  owner: {
    name: SAMPLE_OWNER.name,
    address: SAMPLE_OWNER.line1,
    interest: 'Fee simple',
    titleholder: 'Same as owner',
    signer: 'Grant Holloway',
    title: 'Managing Member',
  },
  contractor: {
    name: SAMPLE_GC.name,
    address: '3001 N Rocky Point Dr E, Suite 200, Tampa, FL 33607',
    phone: '(813) 555-0142',
  },
  surety: {
    name: 'Meridian Surety Company, 1200 Market St, Suite 800, St. Louis, MO 63103',
    phone: '(314) 555-0110',
    amount: 6850000,
  },
  lender: {
    name: 'Gulf Harbor Bank, N.A., 100 S Ashley Dr, Tampa, FL 33602',
    phone: '(813) 555-0177',
  },
  designee: {
    name: 'Carla Mendez, Esq., Bayline Law, PLLC, 400 N Ashley Dr, Suite 1900, Tampa, FL 33602',
    phone: '(813) 555-0126',
  },
  copyTo: {
    who: 'Construction Loan Administration',
    of: 'Gulf Harbor Bank, N.A.',
    phone: '(813) 555-0178',
  },
  expires: 'September 8, 2028',
};

// ---- Statutory text, Fla. Stat. § 713.13(1)(d) (2026) — do not paraphrase ----
const PREAMBLE =
  'The undersigned hereby gives notice that improvement will be made to certain real property, and in accordance with Chapter 713, Florida Statutes, the following information is provided in this Notice of Commencement.';
const WARNING =
  'WARNING TO OWNER: ANY PAYMENTS MADE BY THE OWNER AFTER THE EXPIRATION OF THE NOTICE OF COMMENCEMENT ARE CONSIDERED IMPROPER PAYMENTS UNDER CHAPTER 713, PART I, SECTION 713.13, FLORIDA STATUTES, AND CAN RESULT IN YOUR PAYING TWICE FOR IMPROVEMENTS TO YOUR PROPERTY. A NOTICE OF COMMENCEMENT MUST BE RECORDED AND POSTED ON THE SITE OF THE IMPROVEMENT BEFORE THE FIRST INSPECTION. IF YOU INTEND TO OBTAIN FINANCING, CONSULT WITH YOUR LENDER OR AN ATTORNEY BEFORE COMMENCING WORK OR RECORDING YOUR NOTICE OF COMMENCEMENT.';
const ITEM7 =
  'Persons within the State of Florida designated by Owner upon whom notices or other documents may be served as provided by Section 713.13(1)(a)7., Florida Statutes:';
const ITEM8 =
  "to receive a copy of the Lienor's Notice as provided in Section 713.13(1)(b), Florida Statutes.";
const ITEM9 =
  'Expiration date of notice of commencement (the expiration date will be 1 year after the date of recording unless a different date is specified):';

const FINE =
  'Follows the form in Fla. Stat. § 713.13(1)(d). Only the owner (or the lessee who contracted for the improvement) may sign, before a notary. Record with the clerk of the circuit court in the county where the property is located, attach a copy of any payment bond, and post a certified copy (or a notarized statement of filing with a copy) on the job site before the first inspection. Check the clerk’s formatting and fee requirements. Florida only. Not legal advice — consult a Florida construction attorney.';

const CSS = `
.rec{display:flex;gap:20px;align-items:stretch}
.rec .rbox{width:250px;flex:none;border:1px dashed var(--ink3);display:flex;align-items:flex-end;justify-content:center;padding:6px;font-size:7px;letter-spacing:.8px;text-transform:uppercase;color:var(--ink3)}
.ttl{text-align:center;font-size:17px;font-weight:700;letter-spacing:1.4px;margin-top:8px}

.pre{font-size:8.5px;line-height:1.4;margin-top:5px}
.it{display:flex;gap:8px;border-top:1px solid var(--rule);padding:3px 0 4px}
.it .n{font-family:"IBM Plex Mono";font-weight:500;font-size:9px;width:16px;flex:none;padding-top:1px}
.it .b{flex:1;min-width:0}
.it .h{font-size:8.5px;font-weight:600}
.it .h span{font-weight:400;color:var(--ink2)}
.it .row{margin-top:0!important}
.it .field .box{min-height:16px;font-size:9px}
.it .field{margin-top:1px}

.inl{display:inline-block;border-bottom:1px solid var(--ink);min-height:13px;vertical-align:bottom;font-size:9px;padding:0 3px}
.warn{border:1.5px solid var(--ink);padding:5px 8px;margin-top:5px;font-size:7.8px;line-height:1.4;font-weight:600}
.ntry{border:1px solid var(--rule);padding:4px 8px;margin-top:6px;font-size:7.5px;line-height:1.6;color:var(--ink2)}
.ntry .t{font-size:7.5px;letter-spacing:.9px;text-transform:uppercase;font-weight:700;color:var(--ink2);margin-bottom:2px}
.sl{display:flex;flex-direction:column;flex:1;min-width:0}
.sl .sp{border-bottom:1px solid var(--ink);height:20px;font-size:9px;display:flex;align-items:flex-end;padding-bottom:2px}
.sl .lb{font-size:6.5px;letter-spacing:.5px;text-transform:uppercase;color:var(--ink3);margin-top:2px}
`;

const inl = (name, value, w) =>
  `<span class="inl" style="min-width:${w}px"${name ? ` data-field="${name}"` : ''}>${value ? H.esc(value) : ''}</span>`;
const sigLine = (label, name, value, width) =>
  `<div class="sl"${width ? ` style="flex:none;width:${width}px"` : ''}><div class="sp"${name ? ` data-field="${name}"` : ''}>${value ? H.esc(value) : ''}</div><span class="lb">${H.esc(label)}</span></div>`;
const item = (n, head, body) =>
  `<div class="it"><span class="n">${n}.</span><div class="b"><div class="h">${head}</div>${body}</div></div>`;

export function html({ sample }) {
  const s = sample ? FL : null;
  const f = (name, label, value, opts = {}) =>
    H.field({ name, label, value: s ? value : '', ...opts });
  const row = (fields) => H.fieldRow(fields, 14);

  const body = `
<div class="rec">
  <div class="col grow" style="gap:4px">
    ${f('prepared_by', 'Prepared by and return to (name and address)', s?.preparedBy)}
    ${row([f('permit', 'Permit no.', s?.permit), f('folio', 'Tax folio no.', s?.folio), f('state', 'State of', s?.state, { flex: 0.8 }), f('county', 'County of', s?.county, { flex: 0.9 })])}
  </div>
  <div class="rbox">Space above reserved for the clerk’s recording information</div>
</div>
<div class="ttl">NOTICE OF COMMENCEMENT</div>
<p class="pre">${H.esc(PREAMBLE)}</p>
<div style="margin-top:6px">
${item(
  1,
  'Description of property <span>— legal description of the property, and street address if available</span>',
  `${H.textarea({ name: 'property.legal', label: 'Legal description', value: s?.property.legal, height: s ? 26 : 40 }).replace('margin-top:10px', 'margin-top:1px')}
  ${row([f('property.address', 'Street address', s?.property.address, { flex: 1.2 }), f('property.name', 'Project name (optional)', s?.property.name)])}`
)}
${item(2, 'General description of improvement', f('improvement', '', s?.improvement).replace('<span class="label"></span>', ''))}
${item(
  3,
  'Owner information or Lessee information if the Lessee contracted for the improvement',
  `${row([f('owner.name', 'a. Name and address', s ? `${s.owner.name}, ${s.owner.address}` : '', { flex: 2 }), f('owner.interest', 'b. Interest in property', s?.owner.interest)])}
  ${f('owner.titleholder', 'c. Name and address of fee simple titleholder (if different from Owner listed above)', s?.owner.titleholder)}`
)}
${item(
  4,
  'Contractor',
  row([
    f(
      'contractor.name',
      'a. Name and address',
      s ? `${s.contractor.name}, ${s.contractor.address}` : '',
      { flex: 2.6 }
    ),
    f('contractor.phone', 'b. Contractor’s phone number', s?.contractor.phone),
  ])
)}
${item(
  5,
  'Surety <span>(if applicable, a copy of the payment bond is attached)</span>',
  row([
    f('surety.name', 'a. Name and address', s?.surety.name, { flex: 2.6 }),
    f('surety.phone', 'b. Phone number', s?.surety.phone, { flex: 0.9 }),
    f(
      'surety.amount',
      'c. Amount of bond $',
      s ? H.money(s.surety.amount, { cents: false }).slice(1) : '',
      { flex: 0.9 }
    ),
  ])
)}
${item(
  6,
  'Lender',
  row([
    f('lender.name', 'a. Name and address', s?.lender.name, { flex: 2.6 }),
    f('lender.phone', 'b. Lender’s phone number', s?.lender.phone),
  ])
)}
${item(
  7,
  H.esc(ITEM7),
  row([
    f('designee.name', 'a. Name and address', s?.designee.name, { flex: 2.6 }),
    f('designee.phone', 'b. Phone numbers of designated persons', s?.designee.phone),
  ])
)}
${item(
  8,
  `a. In addition to himself or herself, Owner designates ${inl('copy_to.who', s?.copyTo.who, 150)} of ${inl('copy_to.of', s?.copyTo.of, 130)} <span>${H.esc(ITEM8)}</span>`,
  f('copy_to.phone', 'b. Phone number of person or entity designated by owner', s?.copyTo.phone, {
    width: 300,
  })
)}
${item(9, `<span style="color:var(--ink);font-weight:600">${H.esc(ITEM9)}</span>`, f('expires', '', s?.expires, { width: 220 }).replace('<span class="label"></span>', ''))}
</div>
<div class="warn">${H.esc(WARNING)}</div>
<div class="row" style="gap:16px;margin-top:4px">
  ${sigLine('Signature of Owner or Lessee, or Owner’s or Lessee’s Authorized Officer/Director/Partner/Manager', 'sig.owner', '')}
  ${sigLine('Printed name', 'sig.name', s?.owner.signer, 150)}
  ${sigLine('Signatory’s Title/Office', 'sig.title', s?.owner.title, 150)}
</div>
<div class="ntry"><div class="t">Notary acknowledgment</div>
State of ${inl('notary.state', s ? 'Florida' : '', 90)} County of ${inl('notary.county', s?.county, 110)}<br>
The foregoing instrument was acknowledged before me by means of ${H.checkbox({ name: 'notary.physical', label: 'physical presence', checked: !!s })}or sworn to (or affirmed) by ${H.checkbox({ name: 'notary.online', label: 'online notarization' })}this ${inl('notary.day', s ? '8th' : '', 34)} day of ${inl('notary.month', s ? 'September' : '', 80)}, ${inl('notary.year', s ? '2026' : '', 36)} (year), by ${inl('notary.by', s?.owner.signer, 120)} (name of person) as ${inl('notary.as', s?.owner.title, 110)} (type of authority, e.g. officer, trustee, attorney in fact) for ${inl('notary.for', s?.owner.name, 170)} (name of party on behalf of whom instrument was executed).
<div class="row" style="gap:16px;margin-top:4px">
  ${sigLine('Signature of Notary Public — State of Florida', 'notary.sig', '')}
  ${sigLine('Print, type, or stamp commissioned name of Notary Public', 'notary.name', '')}
</div>
<div style="margin-top:5px">${H.checkbox({ name: 'notary.known', label: 'Personally known', checked: !!s })}OR ${H.checkbox({ name: 'notary.produced', label: 'Produced identification' })}Type of identification produced ${inl('notary.id_type', '', 180)}</div>
</div>
${H.finePrint(FINE).replace('margin-top:14px', 'margin-top:8px')}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    css: CSS,
    footer: H.footerText(`${meta.docName} · Florida · Fla. Stat. § 713.13`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const half = Math.round(W / 2);
  const wide = Math.round(W * 0.68);
  const pair = (a, b) => [
    { label: a, width: wide },
    { label: b, width: W - wide },
  ];
  const itemHead = (n, text) =>
    D.p([D.run(`${n}.  `, { bold: true }), D.run(text, { bold: true, size: 9 })], {
      before: 100,
      after: 20,
      keepNext: true,
    });
  const children = [
    D.fieldGrid([
      [{ label: 'Prepared by and return to (name and address)', width: W }],
      [
        { label: 'Permit no.', width: half },
        { label: 'Tax folio no.', width: W - half },
      ],
      [
        { label: 'State of', width: half },
        { label: 'County of', width: W - half },
      ],
    ]),
    D.p([D.run('NOTICE OF COMMENCEMENT', { size: 16, bold: true, spacing: 30 })], {
      align: D.AlignmentType.CENTER,
      before: 160,
      after: 20,
    }),
    D.p('Chapter 713, Part I, Florida Statutes · form of § 713.13(1)(d)', {
      size: 8,
      color: D.C.ink2,
      align: D.AlignmentType.CENTER,
      after: 120,
    }),
    D.p(PREAMBLE, { size: 9, after: 80 }),
    itemHead(
      1,
      'Description of property (legal description of the property, and street address if available):'
    ),
    ...D.textBox('Legal description', { lines: 2 }),
    D.fieldGrid([[{ label: 'Street address', width: W }]]),
    itemHead(2, 'General description of improvement:'),
    D.fieldGrid([[{ label: 'Description', width: W }]]),
    itemHead(
      3,
      'Owner information or Lessee information if the Lessee contracted for the improvement:'
    ),
    D.fieldGrid([
      pair('a. Name and address', 'b. Interest in property'),
      [
        {
          label:
            'c. Name and address of fee simple titleholder (if different from Owner listed above)',
          width: W,
        },
      ],
    ]),
    itemHead(4, 'Contractor:'),
    D.fieldGrid([pair('a. Name and address', "b. Contractor's phone number")]),
    itemHead(5, 'Surety (if applicable, a copy of the payment bond is attached):'),
    D.fieldGrid([
      pair('a. Name and address', 'b. Phone number'),
      [{ label: 'c. Amount of bond $', width: W }],
    ]),
    itemHead(6, 'Lender:'),
    D.fieldGrid([pair('a. Name and address', "b. Lender's phone number")]),
    itemHead(7, ITEM7),
    D.fieldGrid([pair('a. Name and address', 'b. Phone numbers of designated persons')]),
    itemHead(
      8,
      `a. In addition to himself or herself, Owner designates ____________________ of ____________________ ${ITEM8}`
    ),
    D.fieldGrid([[{ label: 'b. Phone number of person or entity designated by owner', width: W }]]),
    itemHead(9, ITEM9),
    D.fieldGrid([[{ label: 'Expiration date', width: W }]]),
    D.note(WARNING),
    ...D.signatures({
      title: 'Owner',
      parties: [{ name: 'Owner or Lessee', sub: 'no one else may sign in the owner’s stead' }],
      lines: [
        "Signature of Owner or Lessee, or Owner's or Lessee's Authorized Officer/Director/Partner/Manager",
        "Signatory's Title/Office",
      ],
    }),
    D.heading('Notary acknowledgment'),
    D.p('State of ____________________   County of ____________________', { size: 9, after: 80 }),
    D.p(
      'The foregoing instrument was acknowledged before me by means of ☐ physical presence or sworn to (or affirmed) by ☐ online notarization this ____ day of ______________, ______ (year), by ______________________ (name of person) as ______________________ (type of authority, e.g. officer, trustee, attorney in fact) for ______________________________ (name of party on behalf of whom instrument was executed).',
      { size: 9, after: 80 }
    ),
    D.fieldGrid([
      [
        { label: 'Signature of Notary Public — State of Florida', width: half },
        { label: 'Print, type, or stamp commissioned name of Notary Public', width: W - half },
      ],
    ]),
    D.p(
      '☐ Personally known   OR   ☐ Produced identification     Type of identification produced ______________________',
      {
        size: 9,
        before: 60,
      }
    ),
    D.fine(FINE),
  ];
  return D.document({ title: meta.name, children, footerCenter: `${meta.docName} · Florida` });
}
