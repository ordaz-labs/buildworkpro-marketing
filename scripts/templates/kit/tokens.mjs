// Design tokens for every generated template. These mirror the document kit in
// the main app (server/lib/pdf/theme.ts, "modern" tone) so a free template
// looks like the PDF BuildWorkPro itself produces. Keep the two in step.

export const INK = {
  ink: '#1b1f24',
  ink2: '#4a5260',
  ink3: '#8b93a1',
  rule: '#d7dce3',
  band: '#f3f5f8',
  band2: '#e9edf2',
  paper: '#ffffff',
  add: '#1b7f4b',
  deduct: '#b3261e',
  warn: '#b25e09',
};

/** Brand blue — the app's DEFAULT_ACCENT_COLOR. */
export const ACCENT = '#2563eb';
export const ACCENT_SOFT = '#eff6ff';

/** Fill for cells the user is expected to type into (Excel + Word). */
export const INPUT_FILL = 'FFFBEB'; // amber-50, hex without '#' for exceljs/docx
export const INPUT_FILL_CSS = '#fffbeb';

export const BRAND = {
  name: 'BuildWorkPro',
  domain: 'buildworkpro.com',
  url: 'https://buildworkpro.com',
  templatesUrl: 'https://buildworkpro.com/templates/',
  tagline: 'Subcontractor Solutions',
};

/** Letter page in CSS px at 96 dpi (matches Chrome print: 1 px = 0.75 pt). */
export const PAGE = {
  width: 816,
  height: 1056,
  marginTop: 52,
  marginSide: 56,
  marginBottom: 64,
};

export const PAGE_LANDSCAPE = {
  width: 1056,
  height: 816,
  marginTop: 44,
  marginSide: 48,
  marginBottom: 56,
};

/** A realistic sample company used for filled-in example renders. */
export const SAMPLE_COMPANY = {
  name: 'Summit Mechanical Contractors',
  line1: '4120 Industrial Way, Suite 200, Denver, CO 80216',
  line2: '(303) 555-0148 · office@summitmech.com · Lic. C-2214-MC',
};

export const SAMPLE_OWNER = {
  name: 'Harbor Point Development LLC',
  line1: '900 Wynkoop St, Denver, CO 80202',
};

export const SAMPLE_GC = {
  name: 'Brightline Builders, Inc.',
  line1: '1550 Wewatta St, Denver, CO 80202',
  line2: 'Attn: Marcus Reed, Project Manager · (303) 555-0192',
};

export const SAMPLE_PROJECT = {
  name: 'Harbor Point Medical Office — Building B',
  number: 'PRJ-2026-0412',
  address: '2200 Harbor Point Blvd, Denver, CO 80216',
};

/**
 * One consistent job story for every sample render, so the completed examples
 * reconcile with each other (the CO on the change order is the CO line on the
 * pay application, the SOV totals match the contract, dates run in order).
 */
export const STORY = {
  contractSum: 486200,
  contractDate: 'May 18, 2026',
  startDate: 'June 1, 2026',
  completionDate: 'November 18, 2026',
  retainagePct: 10,
  people: {
    pm: 'Dana Whitfield', // Summit PM — signs COs, pay apps, proposals
    foreman: 'Luis Herrera', // Summit foreman — files daily reports, T&M tickets
    estimator: 'Priya Natarajan', // Summit estimator — estimates, quotes, bids
    gcPm: 'Marcus Reed', // Brightline PM — approves COs, receives RFIs
    gcSuper: 'Tom Okafor', // Brightline superintendent — signs T&M tickets, daily reports
    architect: 'Kestrel Design Group · Alison Park, AIA',
  },
  // Schedule of values for the mechanical subcontract (sums to contractSum).
  sov: [
    { n: '1', desc: 'Mobilization & submittals', value: 14600 },
    { n: '2', desc: 'Underground sanitary & storm', value: 38400 },
    { n: '3', desc: 'Domestic water rough-in', value: 52800 },
    { n: '4', desc: 'Sanitary waste & vent rough-in', value: 61200 },
    { n: '5', desc: 'HVAC equipment (RTU-1 to RTU-4)', value: 96500 },
    { n: '6', desc: 'Ductwork & distribution', value: 88700 },
    { n: '7', desc: 'Refrigerant & hydronic piping', value: 41300 },
    { n: '8', desc: 'Controls & BMS integration', value: 33600 },
    { n: '9', desc: 'Insulation', value: 18900 },
    { n: '10', desc: 'Plumbing fixtures & trim', value: 24700 },
    { n: '11', desc: 'Testing, balancing & commissioning', value: 9800 },
    { n: '12', desc: 'Closeout, O&M manuals & training', value: 5700 },
  ],
  changeOrders: [
    {
      n: 'CO-001',
      desc: 'Relocate RTU-2 curb per structural revision S-201 Rev. 1',
      amount: 7350,
      days: 2,
      approved: 'July 8, 2026',
    },
    {
      n: 'CO-002',
      desc: 'Delete owner-furnished water heater; credit installation only',
      amount: -1980,
      days: 0,
      approved: 'July 29, 2026',
    },
    {
      n: 'CO-003',
      desc: 'Add 2" condensate drain from AHU-3 per M-402 Rev. 2 (RFI-014)',
      amount: 5784.5,
      days: 3,
      approved: 'September 16, 2026',
    },
  ],
  // Pay application #3, August 2026 billing period.
  payApp: {
    number: '3',
    periodFrom: 'August 1, 2026',
    periodTo: 'August 31, 2026',
    date: 'September 3, 2026',
  },
};
