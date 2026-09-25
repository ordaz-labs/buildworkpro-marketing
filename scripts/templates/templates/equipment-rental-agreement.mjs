// Equipment rental agreement — a rental house (or another contractor) rents
// equipment to a contractor. Flow PDF: page 1 is the fillable Rental Summary
// (parties, jobsite and period, equipment schedule with rate basis and bare vs
// operated, charges, fuel, damage waiver, insurance, usage limits); the
// numbered terms follow, then signatures and a delivery/return condition
// record. Word version with the same structure.
//
// Sample: Summit Mechanical rents lifts, a telehandler and an operated crane
// for the August rooftop-unit set on Harbor Point Building B (STORY).
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'equipment-rental-agreement',
  name: 'Equipment Rental Agreement Template',
  basename: 'equipment-rental-agreement-template',
  docName: 'Equipment rental agreement',
};

const SUBTITLE =
  'Rental of construction equipment, bare or with an operator. Complete the Rental Summary and equipment schedule, check the equipment in and out on the condition record, and sign.';

const SAMPLE = {
  number: 'RA-26-08114',
  date: 'July 30, 2026',
  lessor: {
    name: 'Front Range Equipment Rental, LLC',
    address: '6200 E 56th Ave, Commerce City, CO 80022',
    contact: '(303) 555-0161 · rentals@frontrangerental.com',
    rep: 'Kevin Albright, Branch Manager',
  },
  renter: {
    name: SAMPLE_COMPANY.name,
    address: SAMPLE_COMPANY.line1,
    contact: '(303) 555-0148 · office@summitmech.com',
    rep: `${STORY.people.foreman}, Foreman`,
    po: 'PO 26-0412-017',
  },
  site: {
    name: SAMPLE_PROJECT.name,
    address: SAMPLE_PROJECT.address,
    contact: `${STORY.people.foreman} · (303) 555-0149`,
  },
  start: 'August 3, 2026',
  end: 'August 28, 2026',
  deliveryBy: 'lessor',
  pickupBy: 'lessor',
  items: [
    {
      desc: '60 ft telescopic boom lift, diesel, 4WD',
      unit: 'BL-6012 · SN 0300218844',
      type: 'Bare',
      basis: 'Week',
      rate: 1450,
      qty: 4,
    },
    {
      desc: '26 ft electric scissor lift',
      unit: 'SL-2641 · SN 1100457193',
      type: 'Bare',
      basis: 'Week',
      rate: 395,
      qty: 4,
    },
    {
      desc: '10,000 lb telehandler, 55 ft reach',
      unit: 'TH-1007 · SN 0160332907',
      type: 'Bare',
      basis: 'Day',
      rate: 525,
      qty: 3,
    },
    {
      desc: '40-ton hydraulic truck crane with certified operator (4-hour minimum)',
      unit: 'CR-4003',
      type: 'Operated',
      basis: 'Hour',
      rate: 245,
      qty: 8,
    },
  ],
  delivery: 1050,
  waiver: 'declined',
  deposit: 0,
  fuel: 'full',
  refuel: '6.50',
  hours: { day: '8', week: '40', month: '160' },
  signed: {
    lessor: { name: 'Kevin Albright, Branch Manager', date: '07/30/2026' },
    renter: { name: `${STORY.people.pm}, Project Manager`, date: '07/30/2026' },
  },
};

const rentalTotal = (items) => items.reduce((a, r) => a + r.rate * r.qty, 0);

export const CLAUSES = [
  {
    title: 'Rental',
    lead: 'The Lessor rents to the Renter, and the Renter rents from the Lessor, the equipment listed in the equipment schedule, with its attachments, manuals and accessories (the "Equipment"), for use at the Jobsite during the Rental Period, on the terms of this Agreement. The Lessor remains the owner of the Equipment at all times; the Renter acquires no ownership, lien or other interest in it, shall keep it free of liens and claims, and shall not sublet, lend or move it from the Jobsite without the Lessor\'s written consent.',
  },
  {
    title: 'Rental Period, Rates and Usage',
    lead: 'Rent is charged as follows:',
    subs: [
      "Rental Period. The Rental Period starts when the Equipment is delivered to the Jobsite (or picked up by the Renter) and ends when it is returned to the Lessor, or picked up by the Lessor after the Renter's off-rent call. The Renter shall call the Lessor off rent and obtain an off-rent number; Equipment remains on rent, and in the Renter's care, until picked up.",
      'Rates. Rent is charged at the rate and rate basis (hour, day, week or month) stated in the equipment schedule for each item. Unless the schedule says otherwise, a partial period is charged at the lower of the next shorter rate basis or the full period, and any minimum charge stated applies.',
      'Usage. A day, week or month of rent includes the engine or meter hours stated in the Rental Summary. Hours above that allowance are charged pro rata at the hourly equivalent of the rate, as read from the hour meter at delivery and return. The Renter shall not disconnect or tamper with any hour meter or telematics device.',
    ],
  },
  {
    title: 'Bare Rental and Operated Rental',
    lead: 'Each item in the equipment schedule is either a bare rental or an operated rental:',
    subs: [
      'Bare rental. The Renter provides the operator. The Renter shall use only operators who are qualified, trained, licensed and certified as required by law and by the manufacturer for that Equipment, and is responsible for the operation, rigging, loads, ground conditions and site safety.',
      "Operated rental. The Lessor provides the Equipment with a qualified operator, who remains the Lessor's employee. The Renter directs the work to be done, is responsible for site access, ground bearing and underground conditions, and for the loads, rigging and signaling it provides, and shall give the operator the information needed to perform the lift or task safely. The operator may refuse any lift or task the operator considers unsafe.",
    ],
  },
  {
    title: 'Delivery, Pickup and Return',
    lead: 'Delivery and pickup are by the party and at the charges stated in the Rental Summary. The Renter shall provide safe, clear access for delivery and pickup. At delivery the parties shall record the hour meter, fuel level and visible condition of each item on the condition record; if the Renter does not inspect the Equipment at delivery, it is accepted as being in good working order. The Renter shall return the Equipment in the same condition as delivered, clean, and with the fuel level stated in the Rental Summary, ordinary wear and tear excepted. The Lessor may charge its published rates for cleaning, refueling and missing items.',
  },
  {
    title: 'Use, Maintenance and Breakdowns',
    lead: "The Renter shall use the Equipment only for its intended purpose, within its rated capacity, in accordance with the manufacturer's instructions and all laws and safety regulations, and shall perform the daily pre-use inspection, fluid checks and routine care the manufacturer requires. The Lessor performs scheduled maintenance and repairs from normal use. The Renter shall stop using and immediately report any item that is damaged, unsafe or not working. Rent does not accrue for the time an item is out of service because of a breakdown not caused by the Renter, once reported.",
  },
  {
    title: 'Loss and Damage',
    lead: "From delivery until the Lessor picks it up or receives it back, the Renter is responsible for loss of, theft of and damage to the Equipment from any cause other than ordinary wear and tear or the Lessor's own negligence, and shall pay the reasonable cost of repair or, if the item is lost or not economically repairable, its fair market value, together with rent for the time the item is out of service up to a reasonable period. The Renter shall report any loss, theft or accident to the Lessor within 24 hours, and to the police for theft or vandalism. If the damage waiver in the Rental Summary is accepted, it limits the Renter's responsibility for accidental damage as stated in the Lessor's damage waiver terms, which do not cover theft, misuse, overloading, unqualified operators or loss the Renter fails to report.",
  },
  {
    title: 'Insurance',
    lead: "Before delivery the Renter shall furnish certificates showing commercial general liability insurance, automobile liability if it transports or moves Equipment on public roads, workers' compensation as required by law, and property insurance covering rented equipment for its full replacement value, with the Lessor named as additional insured on the liability policy and as loss payee on the property policy, all in the amounts stated in the Rental Summary. On an operated rental the Lessor shall maintain liability and workers' compensation insurance for its operator and the Equipment's operation.",
  },
  {
    title: 'Indemnification',
    lead: "To the fullest extent permitted by law, each party shall indemnify and hold harmless the other from claims, damages, losses and expenses, including reasonable attorneys' fees, for bodily injury or damage to property (other than the Equipment itself) arising out of the use, operation or transport of the Equipment, but only to the extent caused by the negligent acts or omissions of the indemnifying party or anyone for whose acts it is legally responsible.",
  },
  {
    title: 'Payment',
    lead: 'The Renter shall pay rent, delivery and pickup, fuel, damage waiver (if accepted), taxes and other charges within the payment terms stated in the Rental Summary after each invoice. Rent on long rentals may be invoiced every 28 days. Any deposit is applied to the final invoice, and the balance is refunded after the Equipment is returned and inspected. Overdue amounts bear interest at the rate stated in the Rental Summary, where permitted by law.',
  },
  {
    title: 'Default and Recovery',
    lead: 'If the Renter fails to pay when due, uses the Equipment in breach of this Agreement, or becomes insolvent, the Lessor may, after written notice and a reasonable opportunity to cure (except where the Equipment is at risk), end the rental and recover the Equipment from the Jobsite during working hours, and the Renter shall provide access. Rent and charges accrued to the date of recovery remain due.',
  },
  {
    title: 'Condition of the Equipment',
    lead: 'The Lessor warrants that the Equipment will be delivered in good working order and, where required, with current inspections and certifications. Except as stated in this Agreement, the Lessor makes no other warranty, express or implied, including of merchantability or fitness for a particular purpose. Neither party is liable to the other for lost profits or other consequential damages, except to the extent caused by its own gross negligence or willful misconduct, or as required under Sections 6 and 8.',
  },
  {
    title: 'General Provisions',
    lead: 'This Agreement, with the Rental Summary, the equipment schedule, the condition record and any damage waiver terms the Renter accepts, is the entire agreement between the parties for this rental and supersedes any conflicting terms on a purchase order or delivery ticket. It may be amended only in writing, including by an added or exchanged item recorded on a signed delivery ticket. It is governed by the laws of the state stated in the Rental Summary. If any provision is unenforceable, the rest remains in effect. It may be signed in counterparts and electronically.',
  },
];

const SIGN_COPY =
  'The parties have read this Agreement, including the Rental Summary, the equipment schedule and the numbered terms, and sign it as of the date above. Each signer represents that he or she is authorized to bind the party named.';

const FINE =
  'General-purpose form, not legal advice. Rental terms, insurance requirements, operator certification rules (such as crane operator certification) and sales tax on rentals vary by state and by equipment type. Have an attorney and your insurance agent review the agreement before you sign or issue it.';

const LETTERS = 'abcdefghij';

const FLOW_CSS =
  '.section{break-after:avoid;page-break-after:avoid;margin-top:11px}.hdr-rule{margin:12px 0 10px}.totals{margin-top:6px}.check{margin-right:8px}' +
  '.brk{height:1056px}@media print{.brk{height:0;break-before:page;page-break-before:always}}';
const PAGE_BREAK = '<div class="brk"></div>';

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
  return `<div class="col grow" style="gap:3px"><span class="label" style="color:var(--ink);margin-bottom:1px">${H.esc(caption)} <span class="ink3" style="text-transform:none;letter-spacing:0;font-weight:400">— ${H.esc(hint)}</span></span>${fields.join('')}</div>`;
}

function checkGroup(label, boxes, flex = 1) {
  return `<div class="field" style="flex:${flex}"><span class="label">${H.esc(label)}</span><div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:2px 0">${boxes.map(H.checkbox).join('')}</div></div>`;
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const f = (name, label, value, opts = {}) =>
    H.field({ name, label, value: s ? value : '', ...opts });
  const row = (fields) => H.fieldRow(fields, 16).replace('margin-top:10px', 'margin-top:7px');

  const cols = [
    { key: 'n', label: '#', width: 20, align: 'center', mono: true },
    { key: 'desc', label: 'Equipment (description, size, attachments)' },
    { key: 'unit', label: 'Unit / serial no.', width: 130 },
    { key: 'type', label: 'Bare / oper.', width: 62 },
    { key: 'basis', label: 'Rate per', width: 50 },
    { key: 'rate', label: 'Rate', width: 64, align: 'right' },
    { key: 'qty', label: 'Est. qty', width: 42, align: 'right' },
    { key: 'amt', label: 'Est. amount', width: 76, align: 'right' },
  ];
  const rows = s
    ? s.items.map((r, i) => ({
        cells: {
          n: String(i + 1),
          desc: r.desc,
          unit: r.unit,
          type: r.type,
          basis: r.basis,
          rate: H.money(r.rate),
          qty: String(r.qty),
          amt: H.money(r.rate * r.qty),
        },
      }))
    : [];
  const rent = s ? rentalTotal(s.items) : null;
  const totals = H.totals([
    { label: 'Estimated rent', value: s ? H.money(rent) : '', field: 'tot.rent' },
    { label: 'Delivery and pickup', value: s ? H.money(s.delivery) : '', field: 'tot.delivery' },
    { label: 'Damage waiver', value: s ? 'Declined' : '', field: 'tot.waiver' },
    { label: 'Fuel, cleaning and other', value: s ? H.money(0) : '', field: 'tot.other' },
    {
      label: 'Estimated total before tax',
      value: s ? H.money(rent + s.delivery) : '',
      total: true,
      field: 'tot.total',
    },
  ]);

  const body = `
${titleBlock({
  title: 'Equipment Rental Agreement',
  subtitle: SUBTITLE,
  fields: [f('agreement.number', 'Agreement no.', s?.number), f('agreement.date', 'Date', s?.date)],
})}
<div class="row" style="gap:24px;margin-top:4px">
  ${partyColumn('Lessor', 'owner of the equipment', [
    f('lessor.name', 'Legal name', s?.lessor.name),
    f('lessor.address', 'Address', s?.lessor.address),
    f('lessor.contact', 'Phone · email', s?.lessor.contact),
    f('lessor.rep', 'Representative (name, title)', s?.lessor.rep),
  ])}
  ${partyColumn('Renter', 'the contractor renting the equipment', [
    f('renter.name', 'Legal name', s?.renter.name),
    f('renter.address', 'Address', s?.renter.address),
    f('renter.contact', 'Phone · email', s?.renter.contact),
    `<div class="row" style="gap:12px">${f('renter.rep', 'Site representative', s?.renter.rep, { flex: 1.3 })}${f('renter.po', 'PO / account no.', s?.renter.po)}</div>`,
  ])}
</div>
${H.section('Jobsite and rental period')}
${row([
  f('site.name', 'Jobsite / project', s?.site.name, { flex: 1.4 }),
  f('site.address', 'Jobsite address', s?.site.address, { flex: 1.4 }),
  f('site.contact', 'Site contact · phone', s?.site.contact),
])}
${row([
  f('period.start', 'Rental starts (delivery)', s?.start),
  f('period.end', 'Estimated return', s?.end),
  checkGroup(
    'Delivery by',
    [
      { name: 'delivery.lessor', label: 'Lessor', checked: s?.deliveryBy === 'lessor' },
      { name: 'delivery.renter', label: 'Renter' },
    ],
    0.8
  ),
  checkGroup(
    'Pickup by',
    [
      { name: 'pickup.lessor', label: 'Lessor', checked: s?.pickupBy === 'lessor' },
      { name: 'pickup.renter', label: 'Renter' },
    ],
    0.8
  ),
])}
<div class="avoid">${H.section('Equipment schedule', 'bare = renter supplies the operator; operated = lessor supplies the operator')}
${H.table({ columns: cols, rows, blankRows: s ? 0 : 5, fieldPrefix: 'item', variant: 'compact', rowHeight: 20 })}
${totals}</div>
${H.section('Rental terms', 'the numbered terms refer to these values')}
${row([
  f('usage.day', 'Hours per day', s?.hours.day, { flex: 0.7 }),
  f('usage.week', 'Hours per week', s?.hours.week, { flex: 0.7 }),
  f('usage.month', 'Hours per month', s?.hours.month, { flex: 0.7 }),
  checkGroup(
    'Fuel on return',
    [
      { name: 'fuel.full', label: 'Full', checked: s?.fuel === 'full' },
      { name: 'fuel.as_delivered', label: 'As delivered' },
    ],
    0.9
  ),
  f('fuel.refuel', 'Refuel charge ($/gal)', s?.refuel, { flex: 0.8 }),
])}
${row([
  checkGroup(
    'Damage waiver',
    [
      { name: 'waiver.accepted', label: 'Accepted' },
      {
        name: 'waiver.declined',
        label: 'Declined — renter insures',
        checked: s?.waiver === 'declined',
      },
    ],
    1.3
  ),
  f('deposit', 'Deposit', s ? H.money(s.deposit) : '', { flex: 0.7 }),
  f('terms.payment', 'Payment terms', s ? 'Net 30 days' : '', { flex: 0.8 }),
  f('terms.interest', 'Late interest (%/mo)', s ? '1.5%' : '', { flex: 0.8 }),
  f('terms.state', 'Governing state', s ? 'Colorado' : '', { flex: 0.8 }),
])}
${row([
  f('ins.cgl', 'Liability insurance (per occurrence)', s ? '$1,000,000' : ''),
  f('ins.property', 'Rented-equipment coverage', s ? 'Full replacement value' : ''),
  f('ins.auto', 'Auto liability (if transporting)', s ? '$1,000,000' : ''),
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
      name: 'Lessor',
      sub: s ? s.lessor.name : 'authorized signatory',
      fields: [
        { label: 'Signature' },
        { label: 'Printed name and title', value: s?.signed.lessor.name },
        { label: 'Date', value: s?.signed.lessor.date },
      ],
    },
    {
      name: 'Renter',
      sub: s ? s.renter.name : 'authorized signatory',
      fields: [
        { label: 'Signature' },
        { label: 'Printed name and title', value: s?.signed.renter.name },
        { label: 'Date', value: s?.signed.renter.date },
      ],
    },
  ],
})}
<div class="avoid">${H.section('Condition record', 'fill in at delivery and again at return; both parties initial')}
${H.table({
  columns: [
    { key: 'n', label: 'Item', width: 48, align: 'center' },
    { key: 'hout', label: 'Hours out', width: 70 },
    { key: 'hin', label: 'Hours in', width: 70 },
    { key: 'fout', label: 'Fuel out', width: 60 },
    { key: 'fin', label: 'Fuel in', width: 60 },
    { key: 'dmg', label: 'Condition and damage noted (out / in)' },
    { key: 'ini', label: 'Initials', width: 64 },
  ],
  blankRows: 6,
  variant: 'grid compact',
  rowHeight: 22,
})}</div>
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
      title: 'Equipment Rental Agreement',
      subtitle: SUBTITLE,
      number: 'No. ____________',
      date: 'Dated ______________',
    }),
    D.heading('Parties'),
    D.fieldGrid(
      ['legal name', 'address', 'phone · email', 'representative (name, title)'].map((l) => [
        { label: `Lessor — ${l}`, width: half },
        { label: `Renter — ${l}`, width: W - half },
      ])
    ),
    D.heading('Jobsite and rental period'),
    D.fieldGrid([
      [
        { label: 'Jobsite / project', width: third },
        { label: 'Jobsite address', width: third },
        { label: 'Site contact · phone', width: W - 2 * third },
      ],
      [
        { label: 'Rental starts (delivery)', width: q },
        { label: 'Estimated return', width: q },
        { label: 'Delivery by', width: q, value: '☐ Lessor   ☐ Renter' },
        { label: 'Pickup by', width: W - 3 * q, value: '☐ Lessor   ☐ Renter' },
      ],
    ]),
    D.heading('Equipment schedule', 'bare = renter operates · operated = with lessor’s operator'),
    D.table({
      columns: [
        { label: '#', width: 360, align: 'center' },
        { label: 'Equipment', width: 2640 },
        { label: 'Unit / serial', width: 1500 },
        { label: 'Bare / oper.', width: 1000 },
        { label: 'Rate per', width: 900 },
        { label: 'Rate', width: 1000, align: 'right' },
        { label: 'Est. amount', width: W - 7400, align: 'right' },
      ],
      blankRows: 6,
    }),
    D.ladder(
      [
        { k: 'Estimated rent', input: true },
        { k: 'Delivery and pickup', input: true },
        { k: 'Damage waiver (or "declined")', input: true },
        { k: 'Fuel, cleaning and other', input: true },
        { k: 'Estimated total before tax', total: true, input: true },
      ],
      { kWidth: Math.round(W * 0.7) }
    ),
    D.heading('Rental terms', 'the numbered terms refer to these values'),
    D.fieldGrid([
      [
        { label: 'Hours per day', width: q },
        { label: 'Hours per week', width: q },
        { label: 'Hours per month', width: q },
        { label: 'Refuel charge ($/gal)', width: W - 3 * q },
      ],
      [
        { label: 'Fuel on return', width: q, value: '☐ Full   ☐ As delivered' },
        { label: 'Damage waiver', width: q, value: '☐ Accepted   ☐ Declined' },
        { label: 'Deposit', width: q },
        { label: 'Payment terms', width: W - 3 * q },
      ],
      [
        { label: 'Late interest (%/month)', width: q },
        { label: 'Governing state', width: q },
        { label: 'Liability insurance', width: q },
        { label: 'Rented-equipment coverage', width: W - 3 * q },
      ],
    ]),
    D.pageBreak(),
    D.heading('Terms and conditions'),
  ];
  CLAUSES.forEach((c, i) => {
    children.push(D.clause(i + 1, c.title, c.lead));
    (c.subs ?? []).forEach((t, j) => children.push(D.subClause(LETTERS[j], t)));
  });
  children.push(
    ...D.signatures({
      title: 'Signatures',
      copy: SIGN_COPY,
      parties: [
        { name: 'Lessor', sub: 'authorized signatory' },
        { name: 'Renter', sub: 'authorized signatory' },
      ],
    }),
    D.heading('Condition record', 'fill in at delivery and again at return; both parties initial'),
    D.table({
      columns: [
        { label: 'Item #', width: 700, align: 'center' },
        { label: 'Hours out', width: 1000 },
        { label: 'Hours in', width: 1000 },
        { label: 'Fuel out', width: 900 },
        { label: 'Fuel in', width: 900 },
        { label: 'Condition and damage noted (out / in)', width: W - 5400 },
        { label: 'Initials', width: 900 },
      ],
      blankRows: 6,
      variant: 'grid',
    }),
    D.fine(FINE)
  );
  return D.document({ title: meta.name, children, footerCenter: meta.docName });
}
