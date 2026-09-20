// Pure math and formatting for the online Pay Application Builder
// (/tools/pay-app/). Mirrors computePayApp() in scripts/templates/templates/
// aia-g702-g703.mjs so the browser tool, the Excel workbook and the completed
// example PDF all agree to the cent. No DOM, no storage: everything here is
// unit-testable from Playwright by importing it directly.

export type Row = {
  id: string;
  /** Item number as printed (SOV line number or the CO number). */
  n: string;
  desc: string;
  /** Scheduled value (column C). Negative on a deductive change order. */
  c: number;
  /** From previous applications (column D). */
  d: number;
  /** This period (column E). */
  e: number;
  /** Materials presently stored (column F). */
  f: number;
  /** True when the row is an approved change order rather than a base SOV line. */
  co: boolean;
};

export type Company = { name: string; line1: string; line2: string; signer: string };
export type Job = {
  to: string;
  toAddress: string;
  project: string;
  projectNumber: string;
  projectAddress: string;
  contractDate: string;
  contractFor: string;
};
export type Application = {
  number: number;
  /** ISO dates (yyyy-mm-dd) or ''. */
  periodFrom: string;
  periodTo: string;
  date: string;
  ratePct: number;
  /**
   * Line 7, total earned less retainage on the previous application. Null on
   * an application the tool has not rolled forward, in which case it is
   * derived from column D at the current rate.
   */
  prevCertified: number | null;
};
export type HistoryEntry = {
  number: number;
  periodTo: string;
  earned: number;
  due: number;
  savedAt: string;
};
export type State = {
  v: 1;
  company: Company;
  job: Job;
  app: Application;
  rows: Row[];
  history: HistoryEntry[];
  updatedAt: string;
};

export type RowCalc = {
  g: number;
  pct: number;
  balance: number;
  retainage: number;
};

export type AppCalc = {
  base: number;
  coAdds: number;
  coDeds: number;
  net: number;
  revised: number;
  totals: { c: number; d: number; e: number; f: number; g: number };
  retWork: number;
  retStored: number;
  retainage: number;
  earned: number;
  previousCerts: number;
  previousDerived: boolean;
  due: number;
  balance: number;
  pct: number;
  remaining: number;
};

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export function computeRow(r: Row, ratePct: number): RowCalc {
  const g = round2(r.d + r.e + r.f);
  return {
    g,
    pct: r.c ? (g / r.c) * 100 : 0,
    balance: round2(r.c - g),
    retainage: round2(g * (ratePct / 100)),
  };
}

export function computeApp(
  rows: Row[],
  ratePct: number,
  prevCertified: number | null = null
): AppCalc {
  const rate = ratePct / 100;
  const t = rows.reduce((a, r) => ({ c: a.c + r.c, d: a.d + r.d, e: a.e + r.e, f: a.f + r.f }), {
    c: 0,
    d: 0,
    e: 0,
    f: 0,
  });
  const base = round2(rows.filter((r) => !r.co).reduce((s, r) => s + r.c, 0));
  const coAdds = round2(rows.filter((r) => r.co && r.c > 0).reduce((s, r) => s + r.c, 0));
  const coDeds = round2(rows.filter((r) => r.co && r.c < 0).reduce((s, r) => s + Math.abs(r.c), 0));
  const net = round2(coAdds - coDeds);
  const revised = round2(base + net);
  const g = round2(t.d + t.e + t.f);
  const retWork = round2((t.d + t.e) * rate);
  const retStored = round2(t.f * rate);
  const retainage = round2(retWork + retStored);
  const earned = round2(g - retainage);
  const previousDerived = prevCertified === null;
  const previousCerts = previousDerived ? round2(t.d * (1 - rate)) : round2(prevCertified ?? 0);
  const due = round2(earned - previousCerts);
  const balance = round2(revised - earned);
  return {
    base,
    coAdds,
    coDeds,
    net,
    revised,
    totals: { c: round2(t.c), d: round2(t.d), e: round2(t.e), f: round2(t.f), g },
    retWork,
    retStored,
    retainage,
    earned,
    previousCerts,
    previousDerived,
    due,
    balance,
    pct: t.c ? (g / t.c) * 100 : 0,
    remaining: round2(t.c - g),
  };
}

/** 14600 → "14,600.00"; -1980 → "(1,980.00)". Empty string for 0 when `blankZero`. */
export function money(n: number, blankZero = false): string {
  if (blankZero && Math.abs(n) < 0.005) return '';
  const s = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < -0.005 ? `(${s})` : s;
}

export const pct = (n: number, digits = 1): string => `${n.toFixed(digits)}%`;

/** "2026-08-31" → "August 31, 2026". Passes anything else through untouched. */
export function longDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const isoOf = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Next calendar billing period after `periodTo`: first of next month → last of that month. */
export function nextPeriod(periodTo: string): { from: string; to: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(periodTo);
  if (!m) return { from: '', to: '' };
  const y = Number(m[1]);
  const mo = Number(m[2]); // 1-based
  const from = new Date(y, mo, 1); // first day of the following month
  const to = new Date(y, mo + 1, 0); // last day of that month
  return { from: isoOf(from), to: isoOf(to) };
}

/**
 * Roll the application forward one period: this period's work moves into
 * "from previous applications", this period clears, stored material stays for
 * the user to update, and line 7 becomes this application's line 6.
 */
export function rollForward(state: State): State {
  const calc = computeApp(state.rows, state.app.ratePct, state.app.prevCertified);
  const period = nextPeriod(state.app.periodTo);
  const now = new Date().toISOString();
  return {
    ...state,
    rows: state.rows.map((r) => ({ ...r, d: round2(r.d + r.e), e: 0 })),
    app: {
      ...state.app,
      number: state.app.number + 1,
      periodFrom: period.from,
      periodTo: period.to,
      date: '',
      prevCertified: calc.earned,
    },
    history: [
      ...state.history,
      {
        number: state.app.number,
        periodTo: state.app.periodTo,
        earned: calc.earned,
        due: calc.due,
        savedAt: now,
      },
    ],
    updatedAt: now,
  };
}

let seq = 0;
export const newId = (): string => `r${Date.now().toString(36)}${(seq++).toString(36)}`;

export function blankRow(n: string, co = false): Row {
  return { id: newId(), n, desc: '', c: 0, d: 0, e: 0, f: 0, co };
}

/** The same Summit Mechanical / Harbor Point story every template example uses. */
export function sampleState(): State {
  const sov: [string, string, number, number, number, number][] = [
    ['1', 'Mobilization & submittals', 14600, 14600, 0, 0],
    ['2', 'Underground sanitary & storm', 38400, 38400, 0, 0],
    ['3', 'Domestic water rough-in', 52800, 31680, 15840, 0],
    ['4', 'Sanitary waste & vent rough-in', 61200, 42840, 12240, 0],
    ['5', 'HVAC equipment (RTU-1 to RTU-4)', 96500, 0, 24125, 38600],
    ['6', 'Ductwork & distribution', 88700, 17740, 26610, 0],
    ['7', 'Refrigerant & hydronic piping', 41300, 0, 8260, 0],
    ['8', 'Controls & BMS integration', 33600, 0, 0, 6720],
    ['9', 'Insulation', 18900, 0, 3780, 0],
    ['10', 'Plumbing fixtures & trim', 24700, 0, 0, 0],
    ['11', 'Testing, balancing & commissioning', 9800, 0, 0, 0],
    ['12', 'Closeout, O&M manuals & training', 5700, 0, 0, 0],
  ];
  const rows: Row[] = sov.map(([n, desc, c, d, e, f]) => ({
    id: newId(),
    n,
    desc,
    c,
    d,
    e,
    f,
    co: false,
  }));
  rows.push({
    id: newId(),
    n: 'CO-001',
    desc: 'Relocate RTU-2 curb per structural revision S-201 Rev. 1',
    c: 7350,
    d: 7350,
    e: 0,
    f: 0,
    co: true,
  });
  rows.push({
    id: newId(),
    n: 'CO-002',
    desc: 'Delete owner-furnished water heater; credit installation only',
    c: -1980,
    d: -1980,
    e: 0,
    f: 0,
    co: true,
  });
  return {
    v: 1,
    company: {
      name: 'Summit Mechanical Contractors',
      line1: '4120 Industrial Way, Suite 200, Denver, CO 80216',
      line2: '(303) 555-0148 · office@summitmech.com · Lic. C-2214-MC',
      signer: 'Dana Whitfield, Project Manager',
    },
    job: {
      to: 'Brightline Builders, Inc.',
      toAddress: '1550 Wewatta St, Denver, CO 80202',
      project: 'Harbor Point Medical Office — Building B',
      projectNumber: 'PRJ-2026-0412',
      projectAddress: '2200 Harbor Point Blvd, Denver, CO 80216',
      contractDate: '2026-05-18',
      contractFor: 'Mechanical & plumbing subcontract',
    },
    app: {
      number: 3,
      periodFrom: '2026-08-01',
      periodTo: '2026-08-31',
      date: '2026-09-03',
      ratePct: 10,
      prevCertified: null,
    },
    rows,
    history: [],
    updatedAt: new Date().toISOString(),
  };
}

export function emptyState(): State {
  const s = sampleState();
  return {
    ...s,
    company: { name: '', line1: '', line2: '', signer: '' },
    job: {
      to: '',
      toAddress: '',
      project: '',
      projectNumber: '',
      projectAddress: '',
      contractDate: '',
      contractFor: '',
    },
    app: { number: 1, periodFrom: '', periodTo: '', date: '', ratePct: 10, prevCertified: null },
    rows: [blankRow('1'), blankRow('2'), blankRow('3'), blankRow('4'), blankRow('5')],
    history: [],
  };
}
