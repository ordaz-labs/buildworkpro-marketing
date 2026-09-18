// Subcontractor agreement — a 15-section standard form of agreement between a
// contractor and a subcontractor. Word (primary) and a flow PDF whose page-1
// Agreement Summary is fillable; the numbered terms refer to the Summary so
// every deal-specific value lives in one place.
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_OWNER, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'subcontractor-agreement',
  name: 'Subcontractor Agreement Template',
  basename: 'subcontractor-agreement-template',
  docName: 'Subcontractor agreement',
};

const SUBTITLE =
  'Standard form of agreement between a contractor and a subcontractor. Complete the Agreement Summary, attach Exhibits A–D, and sign.';

// The completed example: the STORY subcontract — Brightline Builders (the
// general contractor) engages Summit Mechanical for the mechanical scope.
const SAMPLE = {
  number: 'SC-2026-118',
  date: STORY.contractDate,
  contractor: {
    name: SAMPLE_GC.name,
    address: SAMPLE_GC.line1,
    contact: '(303) 555-0192 · projects@brightlinebuilders.com',
    license: 'GC-118842',
    rep: `${STORY.people.gcPm}, Project Manager`,
  },
  subcontractor: {
    name: SAMPLE_COMPANY.name,
    address: SAMPLE_COMPANY.line1,
    contact: '(303) 555-0148 · office@summitmech.com',
    license: 'C-2214-MC',
    rep: `${STORY.people.pm}, Project Manager`,
  },
  project: {
    name: SAMPLE_PROJECT.name,
    number: SAMPLE_PROJECT.number,
    address: SAMPLE_PROJECT.address,
    owner: SAMPLE_OWNER.name,
    primeDate: 'April 27, 2026',
    architect: 'Kestrel Design Group (Alison Park)',
  },
  work: 'Complete mechanical and plumbing scope for Building B per Division 22 and 23 specifications and drawings M-001–M-602 and P-001–P-401: underground sanitary and storm, domestic water, sanitary waste and vent, HVAC equipment RTU-1 to RTU-4, ductwork, refrigerant and hydronic piping, controls and BMS integration, insulation, plumbing fixtures and trim, testing, balancing and commissioning, and closeout. Excludes power wiring to equipment, fire sprinkler, and the owner-furnished water heater (installation only). Full scope and exclusions in Exhibit A.',
  terms: {
    price: STORY.contractSum,
    retainage: STORY.retainagePct,
    start: STORY.startDate,
    finish: STORY.completionDate,
    billingDay: '25th',
    paymentDays: '30',
    coMarkup: '15',
    warrantyMonths: '12',
    cglOcc: 1000000,
    cglAgg: 2000000,
    auto: 1000000,
    umbrella: 2000000,
    cureDays: '10',
    state: 'Colorado',
    venue: 'Denver County, Colorado',
    disputes: 'arbitration',
  },
  signed: {
    contractor: { name: `${STORY.people.gcPm}, Project Manager`, date: '05/18/2026' },
    subcontractor: { name: `${STORY.people.pm}, Project Manager`, date: '05/18/2026' },
  },
};

// Clause text shared by the PDF and the Word document. `lead` is the opening
// paragraph; `subs` are lettered sub-clauses.
export const CLAUSES = [
  {
    title: 'Scope of Work',
    lead: 'The Subcontractor shall furnish all labor, materials, equipment, tools, supervision and services required to complete the work summarized in the Agreement Summary and described in Exhibit A (the "Work"), in accordance with the Contract Documents. The Work includes everything reasonably inferable from the Contract Documents as necessary to produce the intended result, except items expressly excluded in Exhibit A. The Subcontractor has examined the Contract Documents and the site conditions a reasonable inspection would reveal, and is satisfied as to the nature and extent of the Work.',
  },
  {
    title: 'Contract Documents',
    lead: 'The Contract Documents consist of this Agreement, Exhibits A through D, the drawings and specifications listed in Exhibit A, the provisions of the prime contract between the Contractor and the Owner that apply to the Work, and approved change orders. The Contractor shall provide the applicable prime contract provisions to the Subcontractor on request; the Subcontractor is not bound by a prime contract term it has not been given. In the event of a conflict, the order of precedence is:',
    subs: [
      'approved change orders, the most recent first;',
      'this Agreement, including the Agreement Summary;',
      'Exhibits A through D;',
      'the drawings and specifications, with specifications governing over drawings and large-scale details over small-scale;',
      'the applicable provisions of the prime contract.',
    ],
  },
  {
    title: 'Subcontract Price',
    lead: "The Contractor shall pay the Subcontractor the Subcontract Price stated in the Agreement Summary for full performance of the Work, subject only to additions and deductions by approved change order. The Subcontract Price includes all sales and use taxes on the Work and the permits, inspections and fees required for the Subcontractor's trade, unless Exhibit A expressly assigns them to the Contractor. Unit prices and allowances, if any, are listed in Exhibit B and apply only to changes in quantity of the listed items.",
  },
  {
    title: 'Progress Payments and Retainage',
    lead: 'Payment for the Work shall be made as follows:',
    subs: [
      'Applications. On or before the Billing Day of each month, the Subcontractor shall submit an application for payment for Work completed and materials suitably stored on site during the period, itemized against the Schedule of Values in Exhibit B in a standard progress-billing format with a continuation sheet, and supported by the lien waivers required by Section 12.',
      'Payment. The Contractor shall pay each application within the Payment Period stated in the Agreement Summary. If the Contractor disputes any part of an application, it shall notify the Subcontractor in writing within seven days of receipt, stating the amount and the reason, and shall pay the undisputed balance when due.',
      'Retainage. The Contractor may withhold retainage at the Retainage Percentage from each progress payment. Retainage is released with final payment, or earlier where the prime contract or applicable law provides. Where a statute limits the retainage rate or the time it may be held, the statute controls.',
      'Final payment. Final payment, including all retainage, is due within the Payment Period after the Subcontractor has completed the Work and its punch list items, delivered the closeout documents required by the Contract Documents (record drawings, warranties, operation and maintenance data and training), and furnished its final lien waiver, conditional on payment, together with final waivers from its sub-tier subcontractors and suppliers.',
      "Withholding. The Contractor may withhold from a payment only the amount reasonably necessary to protect it from defective Work not remedied, liens or claims filed as a result of the Subcontractor's Work, or the Subcontractor's failure to pay its sub-tiers and suppliers, and shall release the amount withheld when the cause is cured.",
    ],
  },
  {
    title: 'Changes in the Work',
    lead: 'Changes to the Work shall be handled as follows:',
    subs: [
      'Written change orders. The Contractor may add to, delete from or revise the Work by a written change order signed by both parties before the changed work begins, stating the adjustment to the Subcontract Price and the Contract Time. A verbal direction is not a change order.',
      'Notice. The Subcontractor shall notify the Contractor in writing within seven calendar days (or any shorter period required by the prime contract and provided to the Subcontractor) after it first becomes aware of a direction, condition or event it considers a change, and before performing the affected work where practicable.',
      'Pricing. Changed work is priced by agreed lump sum, by the unit prices in Exhibit B where they apply, or by the documented cost of labor, materials, equipment and sub-tier work plus overhead and profit at the Change Order Markup stated in the Agreement Summary.',
      "Directed work. If the Contractor directs changed work in writing before the price is agreed, the Subcontractor shall proceed and record the labor, materials and equipment used on daily time-and-materials tickets signed by the Contractor's representative, and the parties shall issue a change order when the cost is known.",
      'No claim without a writing. The Subcontractor is not entitled to additional compensation for work performed without a signed change order or written directive, and the Contractor is not obligated to pay for it.',
    ],
  },
  {
    title: 'Schedule',
    lead: 'The Subcontractor shall commence the Work on the Commencement Date, prosecute it diligently in the sequence and coordination required by the Contractor\'s project schedule (Exhibit C, as reasonably updated), and complete the Work by the Completion Date (the "Contract Time"). The Contractor shall give the Subcontractor reasonable notice of when the site and the work of others will be ready, and shall not require the Subcontractor to start before they are.',
    subs: [
      "Extensions. The Contract Time shall be extended by change order for delays caused by the Owner, the Contractor, other trades, unusually severe weather, or other causes beyond the Subcontractor's reasonable control, provided the Subcontractor gives written notice within seven calendar days after the delay begins.",
      "Compensation. Delays caused by the Contractor or the Owner that increase the Subcontractor's cost of performance shall be compensated by change order.",
      'Recovery. If the Subcontractor falls behind the schedule for reasons within its control, it shall at its own expense add labor, shifts or equipment as needed to recover. Liquidated damages under the prime contract may be assessed against the Subcontractor only to the extent caused by its delay, and only if the rate is stated in Exhibit A.',
    ],
  },
  {
    title: 'Insurance',
    lead: 'Before starting the Work, and until final payment (and, for completed-operations coverage, through the Warranty Period), the Subcontractor shall maintain with insurers licensed in the state of the Project and rated A- or better:',
    subs: [
      'commercial general liability insurance on an occurrence basis, with the per-occurrence and aggregate limits stated in the Agreement Summary, including products and completed operations and contractual liability;',
      'automobile liability insurance covering owned, hired and non-owned vehicles, with the limit stated in the Agreement Summary;',
      "workers' compensation insurance as required by law, and employer's liability insurance;",
      'umbrella or excess liability insurance in the amount stated in the Agreement Summary, if any.',
      "Certificates of insurance and additional-insured endorsements naming the Contractor and the Owner on a primary and non-contributory basis for the Work, with a waiver of subrogation, shall be delivered before mobilization and on each renewal. The Contractor shall carry, or cause the Owner to carry, builder's risk or property insurance on the Work, and the parties waive rights against each other for loss covered by that insurance.",
    ],
  },
  {
    title: 'Licenses, Permits and Compliance',
    lead: 'The Subcontractor represents that it holds, and shall maintain throughout the Work, every contractor license and registration required to perform the Work where the Project is located, and shall obtain the trade permits and inspections required for the Work unless Exhibit A assigns them to the Contractor. The Subcontractor shall comply with all laws, codes, ordinances and regulations applicable to the Work, including wage, tax, employment and environmental requirements, shall pay all taxes and contributions on its labor and materials, and shall furnish proof of compliance on request.',
  },
  {
    title: 'Safety',
    lead: 'The Subcontractor is responsible for the safety of its employees, sub-tier subcontractors and suppliers on the Project and for the safe performance of its Work. The Subcontractor shall:',
    subs: [
      "comply with all applicable occupational safety and health laws and the Contractor's site safety program, and designate a competent person for its Work who is on site whenever its crews are;",
      'provide the personal protective equipment, fall protection and training its Work requires, hold documented safety meetings, and furnish a job safety analysis for high-hazard tasks when the Contractor requests one;',
      'keep its work areas clean and free of hazards, and correct any unsafe condition created by its Work immediately on notice;',
      "report any injury, incident or near miss involving its Work to the Contractor's superintendent the same day and in writing within 24 hours.",
      "The Contractor may stop the Subcontractor's Work to abate an imminent hazard without adjustment to the Subcontract Price or the Contract Time.",
    ],
  },
  {
    title: 'Warranty',
    lead: "The Subcontractor warrants that the Work will be free from defects in materials and workmanship, performed in a good and workmanlike manner by properly qualified workers, and in conformance with the Contract Documents, for the Warranty Period stated in the Agreement Summary measured from substantial completion of the Project (or of the Work, if the Owner accepts it earlier), or for the longer period required by the prime contract. Within that period the Subcontractor shall, at its own expense and promptly after written notice, correct defective Work and repair other work damaged by the defect or its correction. The Subcontractor shall assign manufacturers' warranties to the Owner at completion. This warranty excludes ordinary wear and tear, misuse, and damage by others, and is in addition to any warranty implied by law.",
  },
  {
    title: 'Indemnification',
    lead: "To the fullest extent permitted by law, each party shall indemnify, defend and hold harmless the other party, the Owner, and their officers, agents and employees from claims, damages, losses and expenses, including reasonable attorneys' fees, for bodily injury, sickness, death, or damage to property other than the Work itself, arising out of the performance of the Work, but only to the extent caused by the negligent acts or omissions of the indemnifying party, its sub-tier subcontractors, or anyone for whose acts it is legally responsible. This obligation is not limited by the insurance required in Section 7 and does not require either party to indemnify the other for the other's own negligence where the law prohibits it.",
  },
  {
    title: 'Liens and Waivers',
    lead: "Provided the Contractor has paid the amounts properly due, the Subcontractor shall keep the Project free of liens and claims arising from its Work and shall promptly discharge or bond over any lien filed by its sub-tier subcontractors or suppliers. With each application for payment the Subcontractor shall furnish a conditional waiver for the amount applied for and an unconditional waiver for the previous payment received, together with matching waivers from its sub-tiers and suppliers, in the form required by the law of the state where the Project is located. No waiver is effective for amounts not actually received, and nothing in this Agreement waives the Subcontractor's lien or bond rights in advance of payment.",
  },
  {
    title: 'Termination and Suspension',
    lead: 'This Agreement may be suspended or terminated as follows:',
    subs: [
      "For cause. Either party may terminate this Agreement for the other party's material breach that is not cured within the Cure Period stated in the Agreement Summary after written notice describing the breach. Material breach by the Subcontractor includes repeated failure to supply enough properly skilled workers or proper materials, failure to pay its sub-tiers or suppliers, disregard of laws or the site safety program, and persistent failure to follow the project schedule.",
      "Completion by others. If the Contractor terminates for the Subcontractor's default, it may complete the Work by any reasonable means, and the Subcontractor is liable for the reasonable cost of completion in excess of the unpaid balance of the Subcontract Price; any excess of that balance over the cost of completion is paid to the Subcontractor.",
      "Suspension for nonpayment. If the Contractor fails to pay an undisputed amount within seven days after it is due, the Subcontractor may, on seven days' written notice, suspend the Work until paid, and the Contract Time and the Subcontract Price shall be adjusted for the suspension, demobilization and remobilization.",
      'For convenience. The Contractor may terminate this Agreement for its convenience on written notice. The Subcontractor shall then be paid for Work properly performed through the termination date, including retainage on that Work, reasonable demobilization costs, and materials ordered for the Project that cannot be returned or used elsewhere, but not for anticipated profit on Work not performed.',
    ],
  },
  {
    title: 'Disputes and Governing Law',
    lead: "The parties shall first attempt to resolve any dispute through direct negotiation between the representatives named in the Agreement Summary within 15 days after written notice of the dispute. A dispute not resolved by negotiation shall be resolved by the method selected in the Agreement Summary: mediation followed, if unresolved, by binding arbitration under the construction rules of a recognized arbitration provider; or litigation in the state or federal courts sitting in the Venue. This Agreement is governed by the laws of the Governing State, without regard to its conflict-of-law rules. The prevailing party is entitled to recover its reasonable attorneys' fees and costs where the law permits. Pending resolution of a dispute, the Subcontractor shall continue to perform, and the Contractor shall continue to pay undisputed amounts, under this Agreement.",
  },
  {
    title: 'General Provisions',
    lead: 'The following provisions also apply:',
    subs: [
      'Entire agreement. This Agreement, with its Exhibits, is the entire agreement between the parties regarding the Work and supersedes all prior proposals, negotiations and understandings. It may be amended only in a writing signed by both parties.',
      "Assignment and subcontracting. Neither party may assign this Agreement without the other's written consent, except that the Contractor may assign it to the Owner if the prime contract is terminated. The Subcontractor shall not subcontract a material portion of the Work without the Contractor's consent and remains fully responsible for its sub-tier subcontractors and suppliers.",
      'Independent contractor. The Subcontractor is an independent contractor, controls the means and methods of its Work, and is responsible for its own employees, taxes and insurance.',
      'Notices. Notices under this Agreement shall be in writing and delivered by hand, courier, certified mail, or email with confirmation of receipt, to the addresses in the Agreement Summary.',
      "Miscellaneous. If any provision is held unenforceable, the remainder continues in effect. A party's failure to enforce a provision is not a waiver of it. This Agreement may be signed in counterparts and by electronic signature, each of which is an original.",
    ],
  },
];

const EXHIBITS = [
  [
    'A',
    'Scope of Work, Contract Documents and Exclusions',
    'drawing and specification list, assigned permits, liquidated damages rate if any',
  ],
  [
    'B',
    'Schedule of Values, Unit Prices and Allowances',
    'the line items every application for payment bills against',
  ],
  ['C', 'Project Schedule', 'milestones and the sequence the Work must follow'],
  [
    'D',
    'Insurance Certificates and Endorsements',
    'delivered before mobilization and on each renewal',
  ],
];

const SIGN_COPY =
  'The parties have read this Agreement, including Exhibits A through D, and sign it as of the Agreement Date stated in the Agreement Summary. Each signer represents that he or she is authorized to bind the party named.';

const FINE =
  'General-purpose form, not legal advice. Construction contract requirements — retainage limits, prompt-payment rules, lien waiver forms, indemnity and pay-if-paid restrictions, licensing — vary by state and by project. Have a licensed attorney review this Agreement before you sign or issue it.';

const LETTERS = 'abcdefghijklmnop';

/**
 * Page margins for flow documents. The kit's BASE_CSS sets `@page{margin:0}`
 * and pads `.flow`, which gives pages 2+ no top margin and lets content run
 * under the footer. Page 1 keeps the `.flow` padding (so measured field
 * positions still match print); later pages get a real top margin; every page
 * reserves the bottom margin for the footer. Side padding stays on `.flow`.
 */
const FLOW_CSS =
  '.section{break-after:avoid;page-break-after:avoid}' +
  '.brk{height:1056px}@media print{.brk{height:0;break-before:page;page-break-before:always}}';
/** Page break in print, spacer on screen: page 1 is the Agreement Summary, the terms start on page 2. */
const PAGE_BREAK = '<div class="brk"></div>';

// ---------------------------------------------------------------------------
// Local helpers (contract-style title block, lettered sub-clauses).
// ---------------------------------------------------------------------------

/** D.clause with keepNext, so a lead paragraph is never orphaned from sub-clause (a). */
function dClause(n, title, body, keepNext) {
  return new D.Paragraph({
    children: [
      D.run(`${n}.`, { bold: true, color: D.C.ink2 }),
      D.run('\t', {}),
      D.run(`${title}. `, { bold: true }),
      D.run(body),
    ],
    tabStops: [{ type: D.TabStopType.LEFT, position: 400 }],
    indent: { left: 400, hanging: 400 },
    spacing: { after: 120, line: 276 },
    keepLines: true,
    keepNext,
  });
}

/** Title block for contract-type documents: title + subtitle left, number/date fields right. */
function titleBlock({ title, subtitle, fields }) {
  return `<div class="hdr">
  <div class="hdr-co" style="max-width:440px"><span class="name" style="font-size:24px;letter-spacing:-.5px;line-height:1">${H.esc(title)}</span><span class="line" style="margin-top:7px">${H.esc(subtitle)}</span></div>
  <div class="col" style="gap:6px;width:180px;flex:none">${fields.join('')}</div>
</div><div class="hdr-rule"></div>`;
}

/** Numbered clause with optional lettered sub-clauses. The lead stays with sub-clause (a). */
function clauseBlock(n, { title, lead, subs = [] }) {
  const sub = (i, text) =>
    `<div class="clause avoid" style="margin-top:4px;margin-left:26px"><span class="n" style="width:16px">(${LETTERS[i]})</span><span>${H.nl2br(text)}</span></div>`;
  const [first, ...rest] = subs;
  return `<div class="avoid">${H.clause(n, title, lead)}${first != null ? sub(0, first) : ''}</div>${rest
    .map((t, i) => sub(i + 1, t))
    .join('')}`;
}

/** A vertical stack of fields with a bold column caption. */
function partyColumn(caption, hint, fields) {
  return `<div class="col grow" style="gap:6px"><span class="label" style="color:var(--ink);margin-bottom:2px">${H.esc(caption)} <span class="ink3" style="text-transform:none;letter-spacing:0;font-weight:400">— ${H.esc(hint)}</span></span>${fields.join('')}</div>`;
}

function exhibitList(items, attached) {
  return items
    .map(
      ([id, title, note]) =>
        `<div class="row avoid" style="gap:12px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--rule)"><span class="mono strong" style="width:62px;flex:none">Exhibit ${id}</span><span class="grow"><span class="strong">${H.esc(title)}</span><span class="small ink2"> — ${H.esc(note)}</span></span><span style="flex:none">${H.checkbox({ label: 'Attached', checked: attached })}${H.checkbox({ label: 'Not used' })}</span></div>`
    )
    .join('');
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const t = s?.terms;
  const f = (name, label, value, opts = {}) =>
    H.field({ name, label, value: s ? value : '', ...opts });
  const party = (key, caption, hint) => {
    const p = s?.[key] ?? {};
    return partyColumn(caption, hint, [
      f(`${key}.name`, 'Legal name', p.name),
      f(`${key}.address`, 'Address', p.address),
      f(`${key}.contact`, 'Phone · email', p.contact),
      `<div class="row" style="gap:12px">${f(`${key}.license`, 'License no.', p.license, { flex: 0.8 })}${f(`${key}.rep`, 'Representative (name, title)', p.rep, { flex: 1.4 })}</div>`,
    ]);
  };

  const body = `
${titleBlock({
  title: 'Subcontractor Agreement',
  subtitle: SUBTITLE,
  fields: [
    f('agreement.number', 'Agreement no.', s?.number),
    f('agreement.date', 'Agreement date', s?.date),
  ],
})}
${H.section('Parties')}
<div class="row" style="gap:24px;margin-top:8px">
  ${party('contractor', 'Contractor', 'the party engaging the Subcontractor')}
  ${party('subcontractor', 'Subcontractor', 'the party performing the Work')}
</div>
${H.section('Project')}
${H.fieldRow([
  f('project.name', 'Project name', s?.project.name, { flex: 1.5 }),
  f('project.number', 'Project no.', s?.project.number, { flex: 0.7 }),
  f('project.owner', 'Owner', s?.project.owner, { flex: 1.2 }),
])}
${H.fieldRow([
  f('project.address', 'Project address', s?.project.address, { flex: 1.5 }),
  f('project.prime_date', 'Prime contract date', s?.project.primeDate, { flex: 0.7 }),
  f('project.architect', 'Architect / engineer', s?.project.architect, { flex: 1.2 }),
])}
${H.textarea({
  name: 'work.summary',
  label: 'Summary of the Work',
  hint: 'trade, systems and spec sections — the full scope and exclusions are Exhibit A',
  value: s?.work,
  height: 46,
})}
${H.section('Agreement summary', 'the numbered terms below refer to these values')}
${H.fieldRow([
  f('terms.price', 'Subcontract price', t ? H.money(t.price) : '', { flex: 1.1 }),
  f('terms.retainage', 'Retainage (%)', t ? `${t.retainage}%` : ''),
  f('terms.start', 'Commencement date', t?.start, { flex: 1.1 }),
  f('terms.finish', 'Completion date', t?.finish, { flex: 1.1 }),
])}
${H.fieldRow([
  f('terms.billing_day', 'Billing day (of month)', t?.billingDay, { flex: 1.1 }),
  f('terms.payment_days', 'Payment within (days)', t?.paymentDays),
  f('terms.co_markup', 'Change order markup (%)', t ? `${t.coMarkup}%` : '', { flex: 1.1 }),
  f('terms.warranty', 'Warranty period (months)', t?.warrantyMonths, { flex: 1.1 }),
])}
${H.fieldRow([
  f(
    'terms.cgl_occurrence',
    'Liability — per occurrence',
    t ? H.money(t.cglOcc, { cents: false }) : '',
    { flex: 1.1 }
  ),
  f('terms.cgl_aggregate', 'Liability — aggregate', t ? H.money(t.cglAgg, { cents: false }) : ''),
  f('terms.auto', 'Auto liability', t ? H.money(t.auto, { cents: false }) : '', { flex: 1.1 }),
  f(
    'terms.umbrella',
    'Umbrella / excess (if any)',
    t ? H.money(t.umbrella, { cents: false }) : '',
    { flex: 1.1 }
  ),
])}
${H.fieldRow([
  f('terms.cure_days', 'Cure period (days)', t?.cureDays, { flex: 1.1 }),
  f('terms.state', 'Governing state', t?.state),
  f('terms.venue', 'Venue (county, state)', t?.venue, { flex: 1.1 }),
  `<div class="field" style="flex:1.1"><span class="label">Dispute resolution — select one</span><div style="margin-top:5px;display:flex;flex-direction:column;gap:3px">${H.checkbox({ name: 'terms.disputes_arbitration', label: 'Mediation, then binding arbitration', checked: t?.disputes === 'arbitration' })}${H.checkbox({ name: 'terms.disputes_litigation', label: 'Litigation in the Venue', checked: t?.disputes === 'litigation' })}</div></div>`,
])}
${PAGE_BREAK}
<div class="avoid">${H.section('Terms and conditions')}${clauseBlock(1, CLAUSES[0])}</div>
${CLAUSES.slice(1)
  .map((c, i) => clauseBlock(i + 2, c))
  .join('')}
${H.signatures({
  title: 'Signatures',
  copy: SIGN_COPY,
  parties: [
    {
      name: 'Contractor',
      sub: s ? s.contractor.name : 'authorized signatory',
      fields: [
        { label: 'Signature' },
        { label: 'Printed name and title', value: s?.signed.contractor.name },
        { label: 'Date', value: s?.signed.contractor.date },
      ],
    },
    {
      name: 'Subcontractor',
      sub: s ? s.subcontractor.name : 'authorized signatory',
      fields: [
        { label: 'Signature' },
        { label: 'Printed name and title', value: s?.signed.subcontractor.name },
        { label: 'Date', value: s?.signed.subcontractor.date },
      ],
    },
  ],
})}
<div class="avoid">${H.section('Exhibits', 'initial each attached exhibit')}<div style="margin-top:4px">${exhibitList(EXHIBITS, !!s)}</div></div>
${H.finePrint(FINE)}`;

  const doc = H.flowDocument({
    title: meta.name,
    body,
    css: FLOW_CSS,
  });
  return {
    sections: [
      {
        html: doc,
        mode: 'flow',
        landscape: false,
        footer: H.footerText(`${meta.docName}${s ? ` · ${s.number}` : ''}`),
      },
    ],
  };
}

export async function docx() {
  const W = D.CONTENT_W;
  const half = Math.round(W / 2);
  const q = Math.round(W / 4);
  const children = [
    ...D.titleBlock({
      title: 'Subcontractor Agreement',
      subtitle: SUBTITLE,
      number: 'No. ____________',
      date: 'Dated ______________',
    }),
    D.heading('Parties'),
    D.fieldGrid(
      ['legal name', 'address', 'phone · email', 'license no.', 'representative (name, title)'].map(
        (l) => [
          { label: `Contractor — ${l}`, width: half },
          { label: `Subcontractor — ${l}`, width: W - half },
        ]
      )
    ),
    D.heading('Project'),
    D.fieldGrid([
      [
        { label: 'Project name', width: Math.round(W * 0.45) },
        { label: 'Project no.', width: Math.round(W * 0.2) },
        { label: 'Owner', width: W - Math.round(W * 0.45) - Math.round(W * 0.2) },
      ],
      [
        { label: 'Project address', width: Math.round(W * 0.45) },
        { label: 'Prime contract date', width: Math.round(W * 0.2) },
        {
          label: 'Architect / engineer',
          width: W - Math.round(W * 0.45) - Math.round(W * 0.2),
        },
      ],
    ]),
    ...D.textBox('Summary of the Work', {
      lines: 3,
      hint: 'Trade, systems and spec sections. The full scope, drawing list and exclusions are Exhibit A.',
    }),
    D.heading('Agreement summary', 'the numbered terms refer to these values'),
    D.fieldGrid([
      [
        { label: 'Subcontract price', width: q },
        { label: 'Retainage (%)', width: q },
        { label: 'Commencement date', width: q },
        { label: 'Completion date', width: W - 3 * q },
      ],
      [
        { label: 'Billing day (of month)', width: q },
        { label: 'Payment within (days)', width: q },
        { label: 'CO markup (%)', width: q },
        { label: 'Warranty (months)', width: W - 3 * q },
      ],
      [
        { label: 'GL — per occurrence', width: q },
        { label: 'GL — aggregate', width: q },
        { label: 'Auto liability', width: q },
        { label: 'Umbrella / excess', width: W - 3 * q },
      ],
      [
        { label: 'Cure period (days)', width: q },
        { label: 'Governing state', width: q },
        { label: 'Venue (county, state)', width: q },
        {
          label: 'Disputes (see §14)',
          width: W - 3 * q,
          value: '☐ Arbitration    ☐ Litigation',
        },
      ],
    ]),
    D.heading('Terms and conditions'),
  ];
  CLAUSES.forEach((c, i) => {
    children.push(dClause(i + 1, c.title, c.lead, (c.subs ?? []).length > 0));
    (c.subs ?? []).forEach((text, j) => children.push(D.subClause(LETTERS[j], text)));
  });
  children.push(
    ...D.signatures({
      title: 'Signatures',
      copy: SIGN_COPY,
      parties: [
        { name: 'Contractor', sub: 'authorized signatory' },
        { name: 'Subcontractor', sub: 'authorized signatory' },
      ],
    }),
    D.heading('Exhibits', 'initial each attached exhibit'),
    D.table({
      columns: [
        { label: 'Exhibit', width: 1300 },
        { label: 'Title', width: W - 1300 - 2300 },
        { label: 'Attached', width: 2300, align: 'center' },
      ],
      rows: EXHIBITS.map(([id, title, note]) => [
        `Exhibit ${id}`,
        `${title} — ${note}`,
        '☐ Yes   ☐ Not used',
      ]),
    }),
    D.fine(FINE)
  );
  return D.document({ title: meta.name, children, footerCenter: meta.docName });
}
