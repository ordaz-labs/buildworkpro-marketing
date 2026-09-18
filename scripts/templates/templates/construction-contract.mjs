// Construction contract — an owner–contractor agreement for direct work
// (residential and light commercial). Word and a flow PDF whose page-1
// Contract Summary and payment schedule are fillable; the numbered terms refer
// to the Summary.
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_OWNER, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'construction-contract',
  name: 'Construction Contract Template',
  basename: 'construction-contract-template',
  docName: 'Construction contract',
};

const SUBTITLE =
  'Agreement between an owner and a contractor for construction work. Complete the Contract Summary and payment schedule, attach Exhibits A–C, and sign.';

// The completed example: the owner of the Harbor Point campus hires Summit
// Mechanical directly for a rooftop-unit replacement on Building A — a
// fixed-price job with a milestone payment schedule that foots to the price.
const SAMPLE = {
  number: 'CN-2026-0431',
  date: 'August 24, 2026',
  owner: {
    name: SAMPLE_OWNER.name,
    address: SAMPLE_OWNER.line1,
    contact: '(303) 555-0170 · facilities@harborpointdev.com',
    rep: 'Elena Marsh, Director of Facilities',
  },
  contractor: {
    name: SAMPLE_COMPANY.name,
    address: SAMPLE_COMPANY.line1,
    contact: '(303) 555-0148 · office@summitmech.com',
    license: 'C-2214-MC',
    rep: `${STORY.people.pm}, Project Manager`,
  },
  project: {
    name: 'Harbor Point Medical Office — Building A: RTU replacement',
    number: 'PRJ-2026-0431',
    address: '2100 Harbor Point Blvd, Denver, CO 80216',
    documents: 'Proposal Q-2026-0587 (Aug 12, 2026) · sched. M-A1',
    designer: 'Summit Mechanical (design-build)',
    permitsBy: 'contractor',
  },
  work: 'Remove and replace two rooftop units (RTU-A1 and RTU-A2) serving Building A with new 12.5-ton high-efficiency packaged units, including crane set, curb adapters, reconnection of the existing electrical disconnects by a licensed electrical subcontractor, controls tie-in to the existing building management system, start-up, and test and balance of the affected zones. Excludes structural roof modifications and roofing repairs. Full scope in Exhibit A.',
  terms: {
    price: 58750,
    basis: 'fixed',
    feePct: '',
    gmp: '',
    allowances: 2400,
    deposit: 5875,
    start: 'September 14, 2026',
    finish: 'October 9, 2026',
    paymentDays: '15',
    coMarkup: '15',
    warrantyMonths: '12',
    cureDays: '10',
    interest: '1.5',
    state: 'Colorado',
    venue: 'Denver County, Colorado',
    disputes: 'litigation',
    cglOcc: 1000000,
    cglAgg: 2000000,
    auto: 1000000,
  },
  schedule: [
    { milestone: 'Deposit on signing', amount: 5875, due: 'August 24, 2026' },
    {
      milestone: 'Equipment delivered to site (RTU-A1, RTU-A2)',
      amount: 23500,
      due: 'On delivery',
    },
    {
      milestone: 'Substantial completion — units running and balanced',
      amount: 23500,
      due: 'On certificate',
    },
    {
      milestone: 'Final completion — punch list and closeout delivered',
      amount: 5875,
      due: 'On acceptance',
    },
  ],
  signed: {
    owner: { name: 'Elena Marsh, Director of Facilities', date: '08/24/2026' },
    contractor: { name: `${STORY.people.pm}, Project Manager`, date: '08/24/2026' },
  },
};

export const CLAUSES = [
  {
    title: 'The Work and Contract Documents',
    lead: 'The Contractor shall furnish all labor, materials, equipment, tools, supervision and services required to complete the work summarized in the Contract Summary and described in Exhibit A (the "Work"). The Contract Documents consist of this Agreement, Exhibits A through C, the plans and specifications identified in the Contract Summary, and approved change orders; in the event of a conflict, approved change orders govern, then this Agreement, then the Exhibits, then the plans and specifications. The Work includes everything reasonably inferable from the Contract Documents as necessary to produce the intended result, except items expressly excluded in Exhibit A.',
  },
  {
    title: 'Contract Price',
    lead: 'The Owner shall pay the Contractor for the Work on the basis selected in the Contract Summary:',
    subs: [
      'Fixed price. If "Fixed price" is selected, the Owner pays the Contract Price stated in the Contract Summary, adjusted only by approved change order.',
      'Cost plus fee. If "Cost plus fee" is selected, the Owner pays the Cost of the Work plus the Fee percentage stated in the Contract Summary. The Cost of the Work is the labor, materials, equipment, subcontracts, permits, insurance and taxes directly attributable to the Work, documented with each invoice, and excludes the Contractor\'s general overhead. If a Guaranteed Maximum Price is stated, costs above it are the Contractor\'s responsibility except to the extent caused by approved change orders.',
      'Allowances. Amounts identified as allowances in the Contract Summary or Exhibit B are included in the Contract Price for the items named. When the actual cost of an allowance item is known, the Contract Price is adjusted by change order for the difference, without markup.',
      'Taxes and permit fees. The Contract Price includes sales and use taxes on the Work and, if the Contract Summary assigns permits to the Contractor, the permit and inspection fees for the Work.',
    ],
  },
  {
    title: 'Payment',
    lead: 'Payment shall be made as follows:',
    subs: [
      'Deposit. The Owner shall pay the Deposit stated in the Contract Summary on signing. The Deposit is applied to the Contract Price as shown in the Payment Schedule, and no Work is scheduled until it is received.',
      'Progress payments. The Contractor shall invoice the Owner when each milestone in the Payment Schedule is reached (or, if the Payment Schedule so states, monthly for the value of Work in place and materials stored on site), and the Owner shall pay each invoice within the Payment Period stated in the Contract Summary.',
      'Disputed amounts. If the Owner disputes any part of an invoice, it shall notify the Contractor in writing within seven days of receipt, stating the amount and the reason, and shall pay the undisputed balance when due.',
      'Final payment. Final payment is due within the Payment Period after Final Completion under Section 11: the punch list is complete, permits are signed off, and the Contractor has delivered the warranties, manuals and final lien waivers required by the Contract Documents.',
      "Late payment. Amounts not paid when due bear interest at the rate stated in the Contract Summary, if any, where permitted by law. If an undisputed amount remains unpaid seven days after it is due, the Contractor may suspend the Work on seven days' written notice until paid, and the Contract Time and Contract Price shall be adjusted for the suspension.",
      'Retainage. The Owner shall not withhold retainage from any payment unless the Payment Schedule expressly provides for it.',
    ],
  },
  {
    title: 'Changes in the Work and Concealed Conditions',
    lead: 'Changes to the Work shall be handled as follows:',
    subs: [
      'Written change orders. The Owner may add to, delete from or revise the Work by a written change order signed by both parties before the changed work begins, stating the adjustment to the Contract Price and the Contract Time. A verbal request is not a change order.',
      'Pricing. Changed work is priced by agreed lump sum, by unit prices where the Contract Documents state them, or by the documented cost of labor, materials, equipment and subcontract work plus overhead and profit at the Change Order Markup stated in the Contract Summary.',
      'Concealed conditions. If the Contractor encounters conditions that differ materially from those indicated in the Contract Documents or ordinarily found in work of this kind — including hidden damage or deterioration, rock, groundwater, buried utilities, or code deficiencies in existing construction — it shall stop work in the affected area and notify the Owner promptly, and the Contract Price and Contract Time shall be adjusted by change order.',
      "Hazardous materials. If materials reasonably believed to be hazardous (such as asbestos, lead paint or mold) are found, the Contractor shall stop work in the area and notify the Owner. Unless the Contract Documents include it, testing and abatement are the Owner's responsibility, performed by a qualified firm, and the Contract Time is extended for the interruption.",
      'Minor changes. Changes that do not affect the Contract Price or the Contract Time may be confirmed by email between the representatives named in the Contract Summary.',
    ],
  },
  {
    title: 'Schedule and Delays',
    lead: 'The Contractor shall commence the Work on the Commencement Date and achieve Substantial Completion by the Substantial Completion Date stated in the Contract Summary (the "Contract Time"), working during the hours permitted by local ordinance and any hours stated in Exhibit A. The Contract Time shall be extended by change order for delays beyond the Contractor\'s reasonable control, including Owner-requested changes, late Owner decisions or selections, Owner-caused delay, permit and inspection delays, material back orders not caused by the Contractor, unusually severe weather, and concealed conditions, provided the Contractor gives written notice within seven days after the delay begins. Delays caused by the Owner that increase the Contractor\'s cost shall be compensated by change order. Liquidated damages do not apply unless a rate is stated in Exhibit A.',
  },
  {
    title: 'Permits, Codes and Inspections',
    lead: 'The party selected in the Contract Summary shall obtain the building permit for the Work. The Contractor shall obtain the trade permits for its Work, schedule the inspections the permits require, and perform the Work in accordance with the codes and regulations in force where the Project is located. The Owner is responsible for zoning approvals, homeowner-association or landlord consents, easements, and any design review not expressly assigned to the Contractor. The Contractor shall correct at its own cost any violation caused by its Work; corrections required by pre-existing conditions are changes under Section 4.',
  },
  {
    title: "Owner's Responsibilities",
    lead: 'The Owner shall:',
    subs: [
      'provide the Contractor access to the site during working hours, and water and electricity for construction, at no cost to the Contractor;',
      'make decisions and selections by the dates the Contractor reasonably requests, and pay for the cost of delay caused by late decisions as a change;',
      'give the Contractor the information it has about the site, including surveys, prior inspection or hazardous-materials reports, and the location of utilities, septic systems and easements;',
      'remove or protect furniture, vehicles, plantings and personal property in and around the work area before the Commencement Date;',
      "communicate through the Contractor's representative rather than directing the Contractor's employees or subcontractors, and not engage other contractors on the site in a way that interferes with the Work;",
      'on request, furnish reasonable evidence that funds are available to pay the Contract Price.',
    ],
  },
  {
    title: "Contractor's Responsibilities",
    lead: 'The Contractor shall:',
    subs: [
      'supervise and direct the Work, with a lead person on site whenever its crews are, and control the means, methods, sequences and safety of the Work;',
      'furnish new materials of good quality conforming to the Contract Documents, unless the Contract Documents specify otherwise;',
      'use qualified, properly licensed and insured subcontractors, remain fully responsible for their work, and pay them and its suppliers promptly;',
      "protect the Owner's property and the Work from damage, keep the site reasonably clean, and remove its debris and equipment at completion;",
      'comply with all laws and safety regulations applicable to the Work and maintain the licenses stated in the Contract Summary;',
      'notify the Owner promptly of any lien, claim or notice it receives relating to the Project.',
    ],
  },
  {
    title: 'Insurance and Indemnification',
    lead: 'Insurance and indemnity obligations are as follows:',
    subs: [
      "Contractor's insurance. Before starting the Work the Contractor shall furnish certificates showing commercial general liability insurance with the per-occurrence and aggregate limits stated in the Contract Summary, automobile liability with the limit stated, and workers' compensation as required by law, and shall keep them in force until Final Completion.",
      "Owner's insurance. The Owner shall maintain property insurance on the existing property and, unless the Contract Summary assigns it to the Contractor, builder's risk coverage on the Work in progress, and shall confirm with its insurer that the Work is covered.",
      'Waiver of subrogation. The parties waive rights against each other for loss covered by property insurance on the Project, to the extent of the insurance proceeds.',
      "Indemnification. To the fullest extent permitted by law, each party shall indemnify and hold harmless the other from claims, damages, losses and expenses, including reasonable attorneys' fees, for bodily injury or property damage (other than the Work itself) arising out of the Work, but only to the extent caused by the negligent acts or omissions of the indemnifying party or anyone for whose acts it is legally responsible.",
    ],
  },
  {
    title: 'Warranty',
    lead: "The Contractor warrants that the Work will be free from defects in materials and workmanship, performed in a good and workmanlike manner, and in conformance with the Contract Documents, for the Warranty Period stated in the Contract Summary measured from Substantial Completion. Within that period the Contractor shall correct defective Work, and repair other work damaged by the defect or the correction, at its own expense and promptly after written notice. The Contractor shall deliver and assign manufacturers' warranties to the Owner at Final Completion. This warranty excludes ordinary wear and tear, misuse, lack of maintenance, Owner-furnished materials, and work by others, and is in addition to any warranty implied by law that cannot be waived.",
  },
  {
    title: 'Substantial Completion, Final Completion and Closeout',
    lead: 'Completion of the Work is determined as follows:',
    subs: [
      'Substantial Completion. The Work is substantially complete when it can be used for its intended purpose with only minor items remaining. The Contractor shall notify the Owner, the parties shall inspect the Work together, and the Owner shall deliver a written punch list within seven days of the inspection. The Owner may withhold from the Substantial Completion payment only the reasonable value of the punch list items.',
      'Warranty and responsibility. The Warranty Period begins, and responsibility for security, utilities and insurance on the completed Work passes to the Owner, on the date of Substantial Completion.',
      'Final Completion. The Work is finally complete when the punch list is corrected, required inspections are signed off, and the Contractor has delivered the warranties, operating manuals, and lien waivers required by the Contract Documents. The Owner shall then make final payment under Section 3.',
      "Occupancy. The Owner shall not occupy or use the Work before Substantial Completion without the Contractor's consent, which may be conditioned on insurer approval.",
    ],
  },
  {
    title: 'Liens and Waivers',
    lead: 'Provided the Owner has paid the amounts properly due, the Contractor shall keep the property free of liens and claims arising from the Work and shall promptly discharge or bond over any lien filed by its subcontractors or suppliers. With each progress payment the Contractor shall furnish a conditional lien waiver for the amount invoiced and an unconditional waiver for the previous payment received, and with final payment a final waiver, together with matching waivers from its subcontractors and suppliers on request, in the form required by the law of the state where the Project is located. The Owner acknowledges that the Contractor, its subcontractors and suppliers may have lien rights under state law and may send the preliminary notices those laws require; such notices are not a claim that anyone has failed to pay.',
  },
  {
    title: 'Termination and Suspension',
    lead: 'This Agreement may be suspended or terminated as follows:',
    subs: [
      'By the Owner for cause. The Owner may terminate this Agreement if the Contractor materially breaches it and fails to cure within the Cure Period stated in the Contract Summary after written notice. The Owner shall then pay the Contractor for Work properly performed through the termination date, less the reasonable cost of completing the Work by others.',
      'By the Contractor for cause. The Contractor may terminate this Agreement if the Owner fails to pay an undisputed amount when due, or otherwise materially breaches it, and fails to cure within the Cure Period after written notice. The Contractor shall then be paid for Work performed through the termination date, materials ordered for the Project that cannot be returned, and reasonable demobilization costs.',
      'By the Owner for convenience. The Owner may terminate this Agreement for its convenience on written notice. The Contractor shall then be paid for Work properly performed through the termination date, materials ordered for the Project that cannot be returned or used elsewhere, and reasonable demobilization costs, but not anticipated profit on Work not performed.',
    ],
  },
  {
    title: 'Disputes and Governing Law',
    lead: "The parties shall first attempt to resolve any dispute through direct negotiation between the representatives named in the Contract Summary within 15 days after written notice of the dispute. A dispute not resolved by negotiation shall be resolved by the method selected in the Contract Summary: mediation followed, if unresolved, by binding arbitration under the construction rules of a recognized arbitration provider; or litigation in the state courts sitting in the Venue. This Agreement is governed by the laws of the Governing State. The prevailing party is entitled to recover its reasonable attorneys' fees and costs where the law permits. Pending resolution of a dispute, the Contractor shall continue to perform and the Owner shall continue to pay undisputed amounts.",
  },
  {
    title: 'Right to Cancel and Consumer Notices',
    lead: "If this Agreement is for work on the Owner's residence and was signed at the residence or anywhere other than the Contractor's place of business, the Owner may have a legal right to cancel it within a set number of business days after signing. Where that right applies, the Contractor shall give the Owner the notice of cancellation the law requires and shall not begin the Work until the cancellation period has passed unless the Owner waives it in writing where the law allows. Many states also require specific disclosures and terms in home-improvement contracts — such as license and registration information, mechanics lien notices, and limits on deposits. Where such requirements apply, they are incorporated into this Agreement, control over any inconsistent term, and shall be attached as Exhibit C.",
  },
  {
    title: 'General Provisions',
    lead: 'The following provisions also apply:',
    subs: [
      "Entire agreement. This Agreement, with its Exhibits, is the entire agreement between the parties regarding the Work and supersedes all prior proposals, negotiations and understandings, including the Contractor's proposal except to the extent Exhibit A incorporates it. It may be amended only in a writing signed by both parties.",
      "Assignment. Neither party may assign this Agreement without the other's written consent.",
      'Independent contractor. The Contractor is an independent contractor and controls the means and methods of the Work.',
      'Notices. Notices under this Agreement shall be in writing and delivered by hand, courier, certified mail, or email with confirmation of receipt, to the addresses in the Contract Summary.',
      "Miscellaneous. If any provision is held unenforceable, the remainder continues in effect. A party's failure to enforce a provision is not a waiver of it. This Agreement may be signed in counterparts and by electronic signature, each of which is an original.",
    ],
  },
];

const EXHIBITS = [
  [
    'A',
    'Scope of Work, Plans and Specifications',
    'the full scope, the drawing and proposal list, exclusions, working hours, and any liquidated damages rate',
  ],
  [
    'B',
    'Allowances, Selections and Schedule',
    'allowance items and amounts, selections the Owner must make and their due dates, milestone schedule',
  ],
  [
    'C',
    'Required Notices',
    'notice of cancellation, lien notices, license disclosures and other terms your state requires in a home-improvement contract',
  ],
];

const SIGN_COPY =
  'The parties have read this Agreement, including Exhibits A through C, and sign it as of the Agreement Date stated in the Contract Summary. Each signer represents that he or she is authorized to bind the party named.';

const FINE =
  'General-purpose form, not legal advice. Home-improvement and construction contract requirements — required notices, right-to-cancel periods, deposit limits, licensing disclosures, lien laws — vary by state and by the type of property. Have a licensed attorney review this Agreement before you sign or issue it.';

const LETTERS = 'abcdefghijklmnop';

// Tighter vertical rhythm than the kit default so the whole Contract Summary and
// payment schedule (with its fillable fields) stay on page 1 in print.
const FLOW_CSS =
  '.section{break-after:avoid;page-break-after:avoid;margin-top:12px}.hdr-rule{margin:12px 0 12px}.totals{margin-top:6px}.check{margin-right:6px}' +
  '.brk{height:1056px}@media print{.brk{height:0;break-before:page;page-break-before:always}}';
/** Page break in print, spacer on screen: page 1 is the Contract Summary and payment schedule. */
const PAGE_BREAK = '<div class="brk"></div>';

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------

function titleBlock({ title, subtitle, fields }) {
  return `<div class="hdr">
  <div class="hdr-co" style="max-width:440px"><span class="name" style="font-size:24px;letter-spacing:-.5px;line-height:1">${H.esc(title)}</span><span class="line" style="margin-top:7px">${H.esc(subtitle)}</span></div>
  <div class="col" style="gap:6px;width:180px;flex:none">${fields.join('')}</div>
</div><div class="hdr-rule"></div>`;
}

function clauseBlock(n, { title, lead, subs = [] }) {
  const sub = (i, text) =>
    `<div class="clause avoid" style="margin-top:4px;margin-left:26px"><span class="n" style="width:16px">(${LETTERS[i]})</span><span>${H.nl2br(text)}</span></div>`;
  const [first, ...rest] = subs;
  return `<div class="avoid">${H.clause(n, title, lead)}${first != null ? sub(0, first) : ''}</div>${rest
    .map((t, i) => sub(i + 1, t))
    .join('')}`;
}

function partyColumn(caption, hint, fields) {
  return `<div class="col grow" style="gap:4px"><span class="label" style="color:var(--ink);margin-bottom:2px">${H.esc(caption)} <span class="ink3" style="text-transform:none;letter-spacing:0;font-weight:400">— ${H.esc(hint)}</span></span>${fields.join('')}</div>`;
}

function checkGroup(label, boxes, flex = 1, inline = false) {
  const lay = inline
    ? 'flex-direction:row;flex-wrap:wrap;gap:2px 0'
    : 'flex-direction:column;gap:2px';
  return `<div class="field" style="flex:${flex}"><span class="label">${H.esc(label)}</span><div style="margin-top:3px;display:flex;${lay}">${boxes.map(H.checkbox).join('')}</div></div>`;
}

function exhibitList(items, attached) {
  return items
    .map(
      ([id, title, note]) =>
        `<div class="row avoid" style="gap:12px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--rule)"><span class="mono strong" style="width:62px;flex:none">Exhibit ${id}</span><span class="grow"><span class="strong">${H.esc(title)}</span><span class="small ink2"> — ${H.esc(note)}</span></span><span style="flex:none">${H.checkbox({ label: 'Attached', checked: attached })}${H.checkbox({ label: 'Not used' })}</span></div>`
    )
    .join('');
}

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

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const t = s?.terms;
  const f = (name, label, value, opts = {}) =>
    H.field({ name, label, value: s ? value : '', ...opts });
  const money0 = (n) => (n == null || n === '' ? '' : H.money(n, { cents: false }));

  const scheduleCols = [
    { key: 'n', label: '#', width: 26, align: 'center', mono: true },
    { key: 'milestone', label: 'Payment milestone' },
    { key: 'amount', label: 'Amount', width: 96, align: 'right' },
    { key: 'due', label: 'Due', width: 130 },
  ];
  const scheduleRows = s
    ? s.schedule.map((r, i) => ({
        cells: { n: String(i + 1), milestone: r.milestone, amount: H.money(r.amount), due: r.due },
      }))
    : [];
  const scheduleTotal = H.totals([
    {
      label: 'Total (equals the Contract Price)',
      value: s ? H.money(s.schedule.reduce((a, r) => a + r.amount, 0)) : '',
      total: true,
      field: 'pay.total',
    },
  ]);

  const body = `
${titleBlock({
  title: 'Construction Contract',
  subtitle: SUBTITLE,
  fields: [
    f('agreement.number', 'Contract no.', s?.number),
    f('agreement.date', 'Agreement date', s?.date),
  ],
})}
${H.section('Parties')}
<div class="row" style="gap:24px;margin-top:8px">
  ${partyColumn('Owner', 'the property owner or its authorized agent', [
    f('owner.name', 'Legal name', s?.owner.name),
    f('owner.address', 'Mailing address', s?.owner.address),
    f('owner.contact', 'Phone · email', s?.owner.contact),
    f('owner.rep', 'Representative (name, title)', s?.owner.rep),
  ])}
  ${partyColumn('Contractor', 'the party performing the Work', [
    f('contractor.name', 'Legal name', s?.contractor.name),
    f('contractor.address', 'Address', s?.contractor.address),
    f('contractor.contact', 'Phone · email', s?.contractor.contact),
    `<div class="row" style="gap:12px">${f('contractor.license', 'License no.', s?.contractor.license, { flex: 0.8 })}${f('contractor.rep', 'Representative (name, title)', s?.contractor.rep, { flex: 1.4 })}</div>`,
  ])}
</div>
${H.section('Project')}
${H.fieldRow([
  f('project.name', 'Project name / description', s?.project.name, { flex: 1.5 }),
  f('project.number', 'Project no.', s?.project.number, { flex: 0.7 }),
  f('project.designer', 'Designer / engineer (if any)', s?.project.designer, { flex: 1.2 }),
])}
${H.fieldRow([
  f('project.address', 'Project address', s?.project.address, { flex: 1.5 }),
  f('project.documents', 'Plans and specifications (title, date)', s?.project.documents, {
    flex: 1.2,
  }),
  checkGroup(
    'Building permit obtained by',
    [
      {
        name: 'project.permits_contractor',
        label: 'Contractor',
        checked: s?.project.permitsBy === 'contractor',
      },
      { name: 'project.permits_owner', label: 'Owner', checked: s?.project.permitsBy === 'owner' },
    ],
    0.7,
    true
  ),
])}
${H.textarea({
  name: 'work.summary',
  label: 'Summary of the Work',
  hint: 'what is built, replaced or repaired, and the main exclusions — the full scope is Exhibit A',
  value: s?.work,
  height: 40,
})}
${H.section('Contract summary', 'the numbered terms below refer to these values')}
${H.fieldRow([
  f('terms.price', 'Contract price', t ? H.money(t.price) : '', { flex: 1.1 }),
  checkGroup(
    'Price basis — select one',
    [
      { name: 'terms.basis_fixed', label: 'Fixed price', checked: t?.basis === 'fixed' },
      {
        name: 'terms.basis_cost_plus',
        label: 'Cost of the Work plus fee',
        checked: t?.basis === 'cost',
      },
    ],
    1.1
  ),
  f('terms.fee_pct', 'Fee (%) — cost plus only', t?.feePct),
  f('terms.gmp', 'Guaranteed maximum ($)', t?.gmp, { flex: 1.1 }),
])}
${H.fieldRow([
  f('terms.allowances', 'Allowances included', t ? H.money(t.allowances) : '', { flex: 1.1 }),
  f('terms.deposit', 'Deposit on signing', t ? H.money(t.deposit) : ''),
  f('terms.start', 'Commencement date', t?.start, { flex: 1.1 }),
  f('terms.finish', 'Substantial completion date', t?.finish, { flex: 1.1 }),
])}
${H.fieldRow([
  f('terms.payment_days', 'Payment within (days of invoice)', t?.paymentDays, { flex: 1.1 }),
  f('terms.co_markup', 'CO markup (%)', t ? `${t.coMarkup}%` : ''),
  f('terms.warranty', 'Warranty (months)', t?.warrantyMonths, { flex: 1.1 }),
  f('terms.cure_days', 'Cure period (days)', t?.cureDays, { flex: 1.1 }),
])}
${H.fieldRow([
  f('terms.interest', 'Late interest (%/month)', t ? `${t.interest}%` : '', { flex: 1.1 }),
  f('terms.state', 'Governing state', t?.state),
  f('terms.venue', 'Venue (county, state)', t?.venue, { flex: 1.1 }),
  checkGroup(
    'Disputes — select one',
    [
      {
        name: 'terms.disputes_arbitration',
        label: 'Mediation, then binding arbitration',
        checked: t?.disputes === 'arbitration',
      },
      {
        name: 'terms.disputes_litigation',
        label: 'Litigation in the Venue',
        checked: t?.disputes === 'litigation',
      },
    ],
    1.1
  ),
])}
${H.fieldRow([
  f('terms.cgl_occurrence', 'Liability — per occurrence', money0(t?.cglOcc), { flex: 1.1 }),
  f('terms.cgl_aggregate', 'Liability — aggregate', money0(t?.cglAgg)),
  f('terms.auto', 'Auto liability', money0(t?.auto), { flex: 1.1 }),
  checkGroup(
    "Builder's risk carried by",
    [
      { name: 'terms.br_owner', label: 'Owner (default)', checked: !!t },
      { name: 'terms.br_contractor', label: 'Contractor' },
    ],
    1.1,
    true
  ),
])}
<div class="avoid">${H.section('Payment schedule', 'milestones and amounts — the total must equal the contract price')}${H.table({ columns: scheduleCols, rows: scheduleRows, blankRows: s ? 0 : 4, fieldPrefix: 'pay', rowHeight: 20 })}${scheduleTotal}</div>
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
      name: 'Owner',
      sub: s ? s.owner.name : 'or authorized agent',
      fields: [
        { label: 'Signature' },
        { label: 'Printed name and title', value: s?.signed.owner.name },
        { label: 'Date', value: s?.signed.owner.date },
      ],
    },
    {
      name: 'Contractor',
      sub: s ? s.contractor.name : 'authorized signatory',
      fields: [
        { label: 'Signature' },
        { label: 'Printed name and title', value: s?.signed.contractor.name },
        { label: 'Date', value: s?.signed.contractor.date },
      ],
    },
  ],
})}
<div class="avoid">${H.section('Exhibits', 'initial each attached exhibit')}<div style="margin-top:4px">${exhibitList(EXHIBITS, !!s)}</div></div>
${H.finePrint(FINE)}`;

  const doc = H.flowDocument({ title: meta.name, body, css: FLOW_CSS });
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
  const third = Math.round(W / 3);
  const children = [
    ...D.titleBlock({
      title: 'Construction Contract',
      subtitle: SUBTITLE,
      number: 'No. ____________',
      date: 'Dated ______________',
    }),
    D.heading('Parties'),
    D.fieldGrid(
      ['legal name', 'address', 'phone · email', 'representative (name, title)', 'license no.'].map(
        (l) => [
          {
            label: `Owner — ${l === 'license no.' ? 'property owner of record (if different)' : l}`,
            width: half,
          },
          { label: `Contractor — ${l}`, width: W - half },
        ]
      )
    ),
    D.heading('Project'),
    D.fieldGrid([
      [
        { label: 'Project name / description', width: third },
        { label: 'Project no.', width: third },
        { label: 'Designer / engineer (if any)', width: W - 2 * third },
      ],
      [
        { label: 'Project address', width: third },
        { label: 'Plans and specifications (title, date)', width: third },
        {
          label: 'Building permit obtained by',
          width: W - 2 * third,
          value: '☐ Contractor    ☐ Owner',
        },
      ],
    ]),
    ...D.textBox('Summary of the Work', {
      lines: 3,
      hint: 'What is built, replaced or repaired, and the main exclusions. The full scope, plans list and exclusions are Exhibit A.',
    }),
    D.heading('Contract summary', 'the numbered terms refer to these values'),
    D.fieldGrid([
      [
        { label: 'Contract price', width: q },
        { label: 'Price basis', width: q, value: '☐ Fixed   ☐ Cost + fee' },
        { label: 'Fee (%) — cost plus only', width: q },
        { label: 'Guaranteed maximum ($)', width: W - 3 * q },
      ],
      [
        { label: 'Allowances included', width: q },
        { label: 'Deposit on signing', width: q },
        { label: 'Commencement date', width: q },
        { label: 'Substantial completion', width: W - 3 * q },
      ],
      [
        { label: 'Payment within (days)', width: q },
        { label: 'CO markup (%)', width: q },
        { label: 'Warranty (months)', width: q },
        { label: 'Cure period (days)', width: W - 3 * q },
      ],
      [
        { label: 'Late interest (%/month)', width: q },
        { label: 'Governing state', width: q },
        { label: 'Venue (county, state)', width: q },
        { label: 'Disputes (see §14)', width: W - 3 * q, value: '☐ Arbitration    ☐ Litigation' },
      ],
      [
        { label: 'GL — per occurrence', width: q },
        { label: 'GL — aggregate', width: q },
        { label: 'Auto liability', width: q },
        { label: "Builder's risk by", width: W - 3 * q, value: '☐ Owner    ☐ Contractor' },
      ],
    ]),
    D.heading('Payment schedule', 'the total must equal the contract price'),
    D.table({
      columns: [
        { label: '#', width: 500, align: 'center' },
        { label: 'Payment milestone', width: W - 500 - 1600 - 2200 },
        { label: 'Amount', width: 1600, align: 'right' },
        { label: 'Due', width: 2200 },
      ],
      rows: [{ cells: ['1', 'Deposit on signing', '$', ''], input: [false, false, true, true] }],
      blankRows: 4,
      blankHeight: 280,
    }),
    D.spacer(2),
    D.ladder([{ k: 'Total (must equal the Contract Price)', v: '$', total: true, input: true }], {
      kWidth: 7400,
    }),
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
        { name: 'Owner', sub: 'or authorized agent' },
        { name: 'Contractor', sub: 'authorized signatory' },
      ],
    }),
    D.heading('Exhibits', 'initial each attached exhibit'),
    D.table({
      columns: [
        { label: 'Exhibit', width: 1300 },
        { label: 'Title', width: W - 1300 - 2300 },
        { label: 'Attached', width: 2300, align: 'center' },
      ],
      rows: EXHIBITS.map(([id, title]) => [`Exhibit ${id}`, title, '☐ Yes   ☐ Not used']),
    }),
    D.fine(FINE)
  );
  return D.document({ title: meta.name, children, footerCenter: meta.docName });
}
