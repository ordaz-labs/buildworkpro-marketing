// Registry of every free template: hub cards, related-template cards, and the
// pack email all read from here. Order within a category is display order.
// Keyword volumes (US, DataForSEO, 2026-09) drive the hub order.

export type TemplateCategory =
  'billing' | 'bidding' | 'contracts' | 'field' | 'controls' | 'safety';

export type TemplateFormat = 'PDF' | 'Excel' | 'Word';

export type TemplateEntry = {
  slug: string;
  title: string;
  /** Card copy — one sentence, what it does, no marketing. */
  short: string;
  category: TemplateCategory;
  formats: TemplateFormat[];
  /** Output file stem in public/templates-files/ (matches scripts/templates meta.basename). */
  basename: string;
  /** Combined US monthly searches for the cluster this page targets. */
  volume: number;
};

export const CATEGORIES: Record<TemplateCategory, { title: string; blurb: string }> = {
  billing: {
    title: 'Billing & payment',
    blurb:
      'The paperwork that turns finished work into a check: pay applications, schedules of values, invoices, lien waivers.',
  },
  bidding: {
    title: 'Estimates, bids & proposals',
    blurb: 'Price the job, present it, and win it — with the math done right.',
  },
  contracts: {
    title: 'Contracts & scope',
    blurb: 'Agreements and scope documents that keep the job — and the money — defined.',
  },
  field: {
    title: 'Field & daily paperwork',
    blurb: 'Daily reports, tickets, RFIs and orders that build the record while the work happens.',
  },
  controls: {
    title: 'Project controls & logs',
    blurb: 'Schedules, logs and trackers that keep the job on time and on budget.',
  },
  safety: {
    title: 'Safety',
    blurb: 'The forms an inspector, a GC safety officer or an insurer will ask to see.',
  },
};

const list: TemplateEntry[] = [
  // ---- Billing & payment ----
  {
    slug: 'aia-g702-g703',
    title: 'Pay Application Template (G702 & G703 style)',
    short:
      'Application and certificate for payment with a continuation sheet, retainage math and carry-forward between periods.',
    category: 'billing',
    formats: ['Excel', 'PDF'],
    basename: 'pay-application-template-g702-g703-style',
    volume: 7100,
  },
  {
    slug: 'schedule-of-values',
    title: 'Schedule of Values Template',
    short:
      'Break the contract sum into billable line items with % of contract math and a tie-out check.',
    category: 'billing',
    formats: ['Excel', 'PDF'],
    basename: 'schedule-of-values-template',
    volume: 2500,
  },
  {
    slug: 'construction-invoice',
    title: 'Contractor Invoice Template',
    short:
      'Line items with computed amounts, sales tax, retainage and balance due — for work billed directly, not through a GC.',
    category: 'billing',
    formats: ['Excel', 'Word', 'PDF'],
    basename: 'construction-invoice-template',
    volume: 4200,
  },
  {
    slug: 'lien-waiver',
    title: 'Lien Waiver Forms (4 types)',
    short:
      'Conditional and unconditional waivers for progress and final payment, with the exception fields that protect you.',
    category: 'billing',
    formats: ['Word', 'PDF'],
    basename: 'lien-waiver-forms',
    volume: 3800,
  },
  {
    slug: 'conditional-lien-waiver',
    title: 'Conditional Lien Waiver Form',
    short:
      'Conditional waiver and release on progress and on final payment — effective only once the payment clears.',
    category: 'billing',
    formats: ['Word', 'PDF'],
    basename: 'conditional-lien-waiver-form',
    volume: 1000,
  },
  {
    slug: 'unconditional-lien-waiver',
    title: 'Unconditional Lien Waiver Form',
    short:
      'Unconditional waiver and release on progress and on final payment, for signing after the money clears.',
    category: 'billing',
    formats: ['Word', 'PDF'],
    basename: 'unconditional-lien-waiver-form',
    volume: 1000,
  },
  {
    slug: 'notice-to-owner',
    title: 'Notice to Owner (Florida)',
    short:
      'The Florida preliminary notice under § 713.06 with the statutory warnings, copies-to list and a 45-day service record.',
    category: 'billing',
    formats: ['Word', 'PDF'],
    basename: 'notice-to-owner-florida',
    volume: 1000,
  },
  // ---- Estimates, bids & proposals ----
  {
    slug: 'construction-estimate',
    title: 'Construction Estimate Template',
    short: 'Material, labor, equipment and subs by section, with overhead and true-margin pricing.',
    category: 'bidding',
    formats: ['Excel', 'PDF'],
    basename: 'construction-estimate-template',
    volume: 7500,
  },
  {
    slug: 'construction-bid-proposal',
    title: 'Construction Bid Proposal Template',
    short:
      'Scope, price with alternates, inclusions and exclusions, terms and an acceptance block.',
    category: 'bidding',
    formats: ['Word', 'PDF'],
    basename: 'construction-bid-proposal-template',
    volume: 4100,
  },
  {
    slug: 'construction-quote',
    title: 'Construction Quote Template',
    short:
      'One-page fixed-price quote with line items, options, validity date and acceptance signature.',
    category: 'bidding',
    formats: ['Excel', 'Word', 'PDF'],
    basename: 'construction-quote-template',
    volume: 1700,
  },
  {
    slug: 'bid-tabulation',
    title: 'Bid Tabulation Template',
    short:
      'Level supplier and sub quotes side by side: scope checks, plugs for gaps, and the apples-to-apples total.',
    category: 'bidding',
    formats: ['Excel', 'PDF'],
    basename: 'bid-tabulation-template',
    volume: 250,
  },
  // ---- Contracts & scope ----
  {
    slug: 'subcontractor-agreement',
    title: 'Subcontractor Agreement Template',
    short:
      '15-section standard-form subcontract — scope, retainage, written change orders, lien waivers, insurance.',
    category: 'contracts',
    formats: ['Word', 'PDF'],
    basename: 'subcontractor-agreement-template',
    volume: 5600,
  },
  {
    slug: 'construction-contract',
    title: 'Construction Contract Template',
    short:
      'Owner–contractor agreement for direct work: price, payment schedule, changes, warranty and termination.',
    category: 'contracts',
    formats: ['Word', 'PDF'],
    basename: 'construction-contract-template',
    volume: 2300,
  },
  {
    slug: 'scope-of-work',
    title: 'Scope of Work Template',
    short:
      'Define exactly what is included, excluded, assumed and owed by others before anyone signs.',
    category: 'contracts',
    formats: ['Word', 'PDF'],
    basename: 'scope-of-work-template',
    volume: 3200,
  },
  {
    slug: 'change-order',
    title: 'Construction Change Order Template',
    short:
      'Price the change, adjust the contract sum and schedule, and get both signatures before the work starts.',
    category: 'contracts',
    formats: ['PDF', 'Word', 'Excel'],
    basename: 'change-order-template',
    volume: 3100,
  },
  {
    slug: 'notice-to-proceed',
    title: 'Notice to Proceed Template',
    short:
      'Formal start authorization with the contract time clock, conditions and acknowledgment.',
    category: 'contracts',
    formats: ['Word', 'PDF'],
    basename: 'notice-to-proceed-template',
    volume: 280,
  },
  {
    slug: 'notice-of-commencement',
    title: 'Notice of Commencement (Florida)',
    short:
      'The recorded Florida form under § 713.13: property, owner, contractor, surety, lender, designees and the owner warning.',
    category: 'contracts',
    formats: ['Word', 'PDF'],
    basename: 'notice-of-commencement-florida',
    volume: 2900,
  },
  {
    slug: 'equipment-rental-agreement',
    title: 'Equipment Rental Agreement',
    short:
      'Bare or operated rental with an equipment schedule, hourly to monthly rates, fuel, damage, insurance and return condition.',
    category: 'contracts',
    formats: ['Word', 'PDF'],
    basename: 'equipment-rental-agreement-template',
    volume: 1000,
  },
  {
    slug: 'letter-of-intent',
    title: 'Construction Letter of Intent',
    short:
      'Award a subcontract scope and price pending the formal subcontract, with a capped early-work authorization.',
    category: 'contracts',
    formats: ['Word', 'PDF'],
    basename: 'construction-letter-of-intent-template',
    volume: 210,
  },
  {
    slug: 'certificate-of-completion',
    title: 'Certificate of Substantial Completion Template',
    short:
      'Fix the completion date, the punch list, the warranty start and the retainage release in one signed page.',
    category: 'contracts',
    formats: ['Word', 'PDF'],
    basename: 'certificate-of-completion-template',
    volume: 1000,
  },
  // ---- Field & daily paperwork ----
  {
    slug: 'daily-report',
    title: 'Construction Daily Report Template',
    short:
      'Crew, weather, work performed, deliveries, delays, safety and photos — the record that holds up later.',
    category: 'field',
    formats: ['PDF', 'Word', 'Excel'],
    basename: 'daily-report-template',
    volume: 2800,
  },
  {
    slug: 'work-order',
    title: 'Work Order Template',
    short: 'Authorize and track a job: requested work, labor and materials, completion sign-off.',
    category: 'field',
    formats: ['PDF', 'Word', 'Excel'],
    basename: 'work-order-template',
    volume: 4100,
  },
  {
    slug: 'tm-ticket',
    title: 'T&M Ticket Template',
    short:
      'Time and materials ticket with labor, overtime, materials and equipment, signed on site the same day.',
    category: 'field',
    formats: ['PDF', 'Excel'],
    basename: 'tm-ticket-template',
    volume: 300,
  },
  {
    slug: 'rfi',
    title: 'RFI Template',
    short:
      'Request for information with the question, suggested answer, cost and schedule flags and a response block.',
    category: 'field',
    formats: ['PDF', 'Word', 'Excel'],
    basename: 'rfi-template',
    volume: 1800,
  },
  {
    slug: 'timesheet',
    title: 'Construction Timesheet Template',
    short: 'Weekly time card by job and cost code with regular, overtime and double-time totals.',
    category: 'field',
    formats: ['Excel', 'PDF'],
    basename: 'construction-timesheet-template',
    volume: 1600,
  },
  // ---- Project controls & logs ----
  {
    slug: 'construction-schedule',
    title: 'Construction Schedule Template',
    short: 'Tasks by phase with durations, predecessors, % complete and a week-by-week Gantt bar.',
    category: 'controls',
    formats: ['Excel', 'PDF'],
    basename: 'construction-schedule-template',
    volume: 2300,
  },
  {
    slug: 'punch-list',
    title: 'Construction Punch List Template',
    short:
      'Item, location, trade, priority, status and verification — with live open/complete counts.',
    category: 'controls',
    formats: ['Excel', 'Word', 'PDF'],
    basename: 'punch-list-template',
    volume: 2600,
  },
  {
    slug: 'submittal-log',
    title: 'Submittal Log Template',
    short:
      'Register of shop drawings, product data and samples with status, dates and lead times, plus a transmittal.',
    category: 'controls',
    formats: ['Excel', 'PDF'],
    basename: 'submittal-log-template',
    volume: 700,
  },
  {
    slug: 'construction-budget',
    title: 'Construction Budget Template',
    short: 'Budget vs. committed vs. actual by cost code, with variance and cost-to-complete.',
    category: 'controls',
    formats: ['Excel', 'PDF'],
    basename: 'construction-budget-template',
    volume: 900,
  },
  {
    slug: 'meeting-minutes',
    title: 'Construction Meeting Minutes Template',
    short: 'Attendees, agenda, decisions, and an action-item table with owners and due dates.',
    category: 'controls',
    formats: ['Word', 'PDF'],
    basename: 'construction-meeting-minutes-template',
    volume: 200,
  },
  // ---- Safety ----
  {
    slug: 'job-safety-analysis',
    title: 'Job Safety Analysis (JSA) Template',
    short:
      'Task steps, hazards, controls and PPE, with crew sign-off — the JHA form most GCs require.',
    category: 'safety',
    formats: ['PDF', 'Word', 'Excel'],
    basename: 'job-safety-analysis-template',
    volume: 2200,
  },
  {
    slug: 'toolbox-talk',
    title: 'Toolbox Talk Template',
    short:
      'Safety meeting record with topic, key points, hazards discussed and a crew sign-in sheet.',
    category: 'safety',
    formats: ['PDF', 'Word'],
    basename: 'toolbox-talk-template',
    volume: 350,
  },
];

export const TEMPLATES = Object.fromEntries(list.map((t) => [t.slug, t])) as Record<
  string,
  TemplateEntry
>;
export const TEMPLATE_LIST = list;
export type TemplateSlug = (typeof list)[number]['slug'];

export function byCategory(): {
  key: TemplateCategory;
  title: string;
  blurb: string;
  items: TemplateEntry[];
}[] {
  return (Object.keys(CATEGORIES) as TemplateCategory[]).map((key) => ({
    key,
    ...CATEGORIES[key],
    items: list.filter((t) => t.category === key).sort((a, b) => b.volume - a.volume),
  }));
}
