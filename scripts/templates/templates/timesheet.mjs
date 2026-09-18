// Construction timesheet — landscape weekly time card (PDF fillable) and an
// Excel workbook: a weekly timesheet with regular / overtime split by daily and
// weekly thresholds, plus a crew summary sheet.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import { SAMPLE_COMPANY, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'timesheet',
  name: 'Construction Timesheet Template',
  basename: 'construction-timesheet-template',
  docName: 'Weekly timesheet',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Javier Soto, journeyman plumber — week ending Sunday, August 23, 2026.
const SAMPLE = {
  employee: 'Javier Soto',
  classification: 'Journeyman plumber · Local 3',
  empNo: 'Emp. no. 1042 · Crew: Herrera',
  weekEnding: 'Aug 23, 2026',
  payPeriod: 'Aug 17 – Aug 23, 2026',
  supervisor: `${STORY.people.foreman}, Foreman`,
  rate: 42,
  otRate: 63,
  rows: [
    {
      day: 'Mon',
      date: '8/17',
      job: 'Harbor Point MOB — Bldg B',
      code: '22 13 16 · Sanitary waste & vent',
      start: '6:30',
      end: '3:00',
      brk: '30',
      hours: 8,
      reg: 8,
      ot: 0,
      notes: 'L2 Suites 212–214',
    },
    {
      day: 'Tue',
      date: '8/18',
      job: 'Harbor Point MOB — Bldg B',
      code: '22 11 16 · Domestic water',
      start: '6:30',
      end: '3:00',
      brk: '30',
      hours: 8,
      reg: 8,
      ot: 0,
      notes: 'L2 Suites 210–214',
    },
    {
      day: 'Wed',
      date: '8/19',
      job: 'Harbor Point MOB — Bldg B',
      code: '22 13 16 · Sanitary waste & vent',
      start: '6:30',
      end: '5:00',
      brk: '30',
      hours: 10,
      reg: 8,
      ot: 2,
      notes: 'Pressure test L2 — inspector 3:30',
    },
    {
      day: 'Thu',
      date: '8/20',
      job: 'Harbor Point MOB — Bldg B',
      code: '22 11 16 · Domestic water',
      start: '6:30',
      end: '3:00',
      brk: '30',
      hours: 8,
      reg: 8,
      ot: 0,
      notes: '',
    },
    {
      day: 'Fri',
      date: '8/21',
      job: 'Harbor Point MOB — Bldg B',
      code: '23 21 13 · Hydronic piping',
      start: '6:30',
      end: '3:00',
      brk: '30',
      hours: 8,
      reg: 8,
      ot: 0,
      notes: 'Roof — RTU-2 condensate',
    },
    {
      day: 'Sat',
      date: '8/22',
      job: 'Harbor Point MOB — Bldg B',
      code: '22 13 16 · Sanitary waste & vent',
      start: '7:00',
      end: '11:00',
      brk: '0',
      hours: 4,
      reg: 0,
      ot: 4,
      notes: 'Make-up for test — approved LH',
    },
    {
      day: 'Sun',
      date: '8/23',
      job: '—',
      code: '',
      start: '',
      end: '',
      brk: '',
      hours: null,
      reg: null,
      ot: null,
      notes: '',
    },
  ],
  notesText:
    'Wed OT: pressure test ran late for city inspector. Sat: 4 hrs approved by foreman 8/21. No absences. No injuries.',
};

const sum = (rows, k) => rows.reduce((t, r) => t + (r[k] ?? 0), 0);

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const hours = s ? sum(s.rows, 'hours') : 0;
  const reg = s ? sum(s.rows, 'reg') : 0;
  const ot = s ? sum(s.rows, 'ot') : 0;

  const cols = [
    { key: 'day', label: 'Day', width: 38 },
    { key: 'date', label: 'Date', width: 50, align: 'center' },
    { key: 'job', label: 'Job / project', width: 150 },
    { key: 'code', label: 'Cost code / task', width: 168 },
    { key: 'start', label: 'Start', width: 48, align: 'center' },
    { key: 'end', label: 'End', width: 48, align: 'center' },
    { key: 'brk', label: 'Break (min)', width: 52, align: 'right' },
    { key: 'hours', label: 'Hours', width: 48, align: 'right' },
    { key: 'reg', label: 'Regular', width: 50, align: 'right' },
    { key: 'ot', label: 'Overtime', width: 54, align: 'right' },
    { key: 'notes', label: 'Notes' },
  ];
  const fmt = (n) => (n == null ? '' : n.toFixed(1));
  const rows = s
    ? s.rows.map((r) => ({
        cells: {
          ...r,
          hours: fmt(r.hours),
          reg: r.reg === 0 ? '—' : fmt(r.reg),
          ot: r.ot === 0 ? '—' : fmt(r.ot),
        },
      }))
    : DAYS.map((d, i) => ({ cells: { day: d }, field: `row.${i + 1}` }));
  // Extra rows for a split day / second job.
  const extra = s ? [] : [1, 2, 3].map((i) => ({ cells: {}, field: `row.${7 + i}`, muted: true }));
  const totalRow = {
    total: '',
    cells: {
      day: '',
      job: 'Weekly totals',
      hours: s ? hours.toFixed(1) : '',
      reg: s ? reg.toFixed(1) : '',
      ot: s ? ot.toFixed(1) : '',
    },
    ...(sample ? {} : { field: 'total' }),
  };

  const body = `
${H.header({ company, title: 'Weekly timesheet', number: s ? `Week ending ${s.weekEnding}` : 'Week ending __________', fillable: !sample })}
${H.metaRow([
  {
    label: 'Employee',
    lines: [
      { text: s ? s.employee : '', strong: true, field: 'emp.name' },
      { text: s ? s.classification : '', field: 'emp.classification' },
      { text: s ? s.empNo : '', field: 'emp.number' },
    ],
  },
  {
    label: 'Default job / project',
    lines: [
      { text: s ? SAMPLE_PROJECT.name : '', strong: true, field: 'project.name' },
      { text: s ? SAMPLE_PROJECT.number : '', mono: true, field: 'project.number' },
      {
        text: s ? `GC: Brightline Builders · Super: ${STORY.people.gcSuper}` : '',
        field: 'project.gc',
      },
    ],
  },
  {
    label: 'Week',
    kv: [
      { k: 'Pay period', v: s ? s.payPeriod : '', field: 'week.period' },
      { k: 'Supervisor', v: s ? s.supervisor : '', field: 'week.supervisor' },
      { k: 'Regular rate', v: s ? H.money(s.rate) + ' / hr' : '', field: 'week.rate', mono: true },
      {
        k: 'Overtime rate (1.5×)',
        v: s ? H.money(s.otRate) + ' / hr' : '',
        field: 'week.ot_rate',
        mono: true,
      },
    ],
  },
])}
${H.table({ columns: cols, rows: [...rows, ...extra, totalRow], variant: 'compact', rowHeight: 21 })}
${H.split(
  H.textarea({
    name: 'notes',
    label: 'Notes / exceptions',
    hint: 'absences, late starts, per diem, travel, injuries, who approved overtime',
    value: s ? s.notesText : '',
    height: 40,
  }),
  H.totals([
    {
      label: 'Regular hours × rate',
      value: s ? `${reg.toFixed(1)} × ${H.money(s.rate)} = ${H.money(reg * s.rate)}` : '',
      field: 'pay.regular',
    },
    {
      label: 'Overtime hours × rate',
      value: s ? `${ot.toFixed(1)} × ${H.money(s.otRate)} = ${H.money(ot * s.otRate)}` : '',
      field: 'pay.overtime',
    },
    {
      label: 'Gross for the week',
      value: s ? H.money(reg * s.rate + ot * s.otRate) : '',
      total: true,
      field: 'pay.gross',
    },
  ]),
  [1.4, 1]
)}
${H.signatures({
  copy: 'The employee certifies the hours above are accurate and were worked on the jobs and cost codes shown. The supervisor approves them for payroll and job costing.',
  parties: [
    {
      name: 'Employee',
      fields: [
        { label: 'Signature', name: 'sig.employee' },
        { label: 'Printed name', name: 'sig.employee_name', value: s ? s.employee : '' },
        { label: 'Date', name: 'sig.employee_date', value: s ? '08/23/2026' : '' },
      ],
    },
    {
      name: 'Approved by',
      sub: 'supervisor / foreman',
      fields: [
        { label: 'Signature', name: 'sig.supervisor' },
        {
          label: 'Printed name and title',
          name: 'sig.supervisor_name',
          value: s ? s.supervisor : '',
        },
        { label: 'Date', name: 'sig.supervisor_date', value: s ? '08/24/2026' : '' },
      ],
    },
  ],
})}
${H.finePrint('Overtime rules differ by state and by contract — some states require daily overtime over 8 hours, most require weekly overtime over 40; prevailing-wage jobs also require certified payroll reports. Split regular and overtime hours per the rule that applies to you. Not legal or payroll advice.')}`;

  const doc = H.document({
    title: meta.name,
    landscape: true,
    pages: [body],
    css: '.hdr-rule{margin:10px 0 10px}table.t{margin-top:10px}.sig{margin-top:12px}.sig .copy{max-width:none}.sig .parties{margin-top:8px}.sig .party .who{margin-bottom:8px}.sig .line .sp{height:22px}.sig .under{margin-top:8px}.totals{margin-top:10px}',
    footer: H.footerText(meta.docName),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: true }] };
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });

  // ---- Sheet 1: weekly timesheet ----
  const ws = X.sheet(wb, 'Weekly Timesheet', { landscape: true, fitHeight: 1 });
  X.widths(ws, [7, 10, 24, 24, 9, 9, 9, 9, 10, 10, 30]);
  let r = X.titleBlock(ws, {
    title: 'Weekly Timesheet',
    subtitle:
      'Enter start, end and break per day; hours, the regular / overtime split and pay calculate from the thresholds you set.',
    cols: 11,
    right: 'Print: fits one page',
    rightFrom: 10,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.label(ws, r, 1, 'Employee');
  X.label(ws, r, 5, 'Week');
  X.label(ws, r, 9, 'Overtime rules');
  r++;
  X.kv(ws, r, 1, 'Name', null, { labelTo: 2, to: 4 });
  X.kv(ws, r, 5, 'Week ending (Sun)', null, { labelTo: 6, to: 8, numFmt: X.FMT.date });
  const weekEnd = `$G$${r}`;
  X.kv(ws, r, 9, 'Weekly OT after (hrs)', 40, { labelTo: 10, numFmt: '0.##', align: 'right' });
  const weekly = `$K$${r}`;
  r++;
  X.kv(ws, r, 1, 'Classification', null, { labelTo: 2, to: 4 });
  X.kv(ws, r, 5, 'Supervisor', null, { labelTo: 6, to: 8 });
  X.kv(ws, r, 9, 'Daily OT after (hrs, blank = off)', null, {
    labelTo: 10,
    numFmt: '0.##',
    align: 'right',
  });
  const daily = `$K$${r}`;
  r++;
  X.kv(ws, r, 1, 'Employee no. / crew', null, { labelTo: 2, to: 4 });
  X.kv(ws, r, 5, 'Regular rate ($ / hr)', null, {
    labelTo: 6,
    to: 8,
    numFmt: X.FMT.money,
    align: 'right',
  });
  const rate = `$G$${r}`;
  X.kv(ws, r, 9, 'Overtime multiplier', 1.5, { labelTo: 10, numFmt: '0.0"×"', align: 'right' });
  const mult = `$K$${r}`;
  r += 2;

  X.headerRow(
    ws,
    r,
    [
      'Day',
      'Date',
      'Job / project',
      'Cost code / task',
      'Start',
      'End',
      'Break (min)',
      'Hours',
      'Regular',
      'Overtime',
      'Notes',
    ],
    {
      aligns: [
        'left',
        'center',
        'left',
        'left',
        'center',
        'center',
        'right',
        'right',
        'right',
        'right',
        'left',
      ],
    }
  );
  r++;
  const first = r;
  const ROWS = 10; // Mon–Sun + 3 split-day rows
  for (let i = 0; i < ROWS; i++) {
    const fixed = i < 7;
    const prevSum = i === 0 ? '0' : `SUM($I$${first}:I${r - 1})`;
    X.bodyRow(ws, r, [
      fixed ? { value: DAYS[i], bold: true } : { input: true },
      fixed
        ? {
            formula: `IF(${weekEnd}="","",${weekEnd}-${6 - i})`,
            numFmt: 'm/d',
            align: 'center',
            color: X.C.ink2,
          }
        : { input: true, numFmt: 'm/d', align: 'center' },
      { input: true },
      { input: true },
      { input: true, numFmt: 'h:mm AM/PM', align: 'center' },
      { input: true, numFmt: 'h:mm AM/PM', align: 'center' },
      { input: true, numFmt: '0;-0;""', align: 'right' },
      {
        formula: `IF(OR(E${r}="",F${r}=""),"",ROUND(MOD(F${r}-E${r},1)*24-IF(G${r}="",0,G${r})/60,2))`,
        numFmt: '0.00;-0.00;""',
      },
      {
        formula: `IF(H${r}="","",MIN(IF(${daily}="",H${r},MIN(H${r},${daily})),MAX(0,${weekly}-${prevSum})))`,
        numFmt: '0.00;-0.00;""',
      },
      { formula: `IF(H${r}="","",H${r}-I${r})`, numFmt: '0.00;-0.00;""' },
      { input: true, wrap: true },
    ]);
    r++;
  }
  const last = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: '' },
    { value: 'Weekly totals' },
    {},
    {},
    {},
    {},
    { formula: `SUM(H${first}:H${last})`, numFmt: '0.00' },
    { formula: `SUM(I${first}:I${last})`, numFmt: '0.00' },
    { formula: `SUM(J${first}:J${last})`, numFmt: '0.00' },
    {},
  ]);
  const totRow = r;
  r += 2;
  X.text(ws, r, 8, 'Regular pay', { align: 'right', color: X.C.ink2, size: 9.5 });
  ws.mergeCells(r, 8, r, 9);
  X.calc(ws, r, 10, `IF(${rate}="","",I${totRow}*${rate})`, { numFmt: X.FMT.moneyBlank });
  const regPay = r;
  r++;
  X.text(ws, r, 8, 'Overtime pay', { align: 'right', color: X.C.ink2, size: 9.5 });
  ws.mergeCells(r, 8, r, 9);
  X.calc(ws, r, 10, `IF(${rate}="","",J${totRow}*${rate}*${mult})`, { numFmt: X.FMT.moneyBlank });
  r++;
  X.totalRow(
    ws,
    r,
    [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { value: 'Gross for the week' },
      {},
      {
        formula: `IF(${rate}="","",J${regPay}+J${regPay + 1})`,
        numFmt: X.FMT.moneyBlank,
        bold: true,
      },
      {},
    ],
    { startCol: 1 }
  );
  ws.mergeCells(r, 8, r, 9);
  r += 2;
  X.label(
    ws,
    r,
    1,
    'Notes / exceptions — absences, late starts, per diem, travel, injuries, who approved overtime'
  );
  r++;
  ws.mergeCells(r, 1, r + 1, 11);
  X.input(ws, r, 1, null, { wrap: true });
  ws.getRow(r).height = 18;
  ws.getRow(r + 1).height = 18;
  r += 3;
  X.noteRow(
    ws,
    r,
    'Regular / overtime split: each day is capped at the daily threshold (if set); regular hours are then capped at the weekly threshold in date order, and everything above is overtime. Check the rule that applies in your state and contract.',
    11,
    { height: 30 }
  );
  r += 2;
  r = X.signatureBlock(ws, r, ['Employee', 'Approved by (supervisor / foreman)'], {
    cols: [1, 7],
    width: 4,
  });
  r++;
  X.brandFooter(
    ws,
    r,
    11,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Overtime rules differ by state and contract; prevailing-wage jobs also require certified payroll. Not legal or payroll advice.'
  );
  ws.pageSetup.printArea = `A1:K${r}`;

  // ---- Sheet 2: crew summary ----
  const cs = X.sheet(wb, 'Crew Summary', { landscape: true, fitHeight: 1 });
  X.widths(cs, [22, 20, 10, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 12, 12, 13]);
  let cr = X.titleBlock(cs, {
    title: 'Crew Summary',
    subtitle:
      'One row per person for the week. Regular / overtime split by the weekly threshold; pay from each person’s rate.',
    cols: 16,
  });
  X.inputLegend(cs, cr, 1);
  cr++;
  X.kv(cs, cr, 1, 'Week ending (Sunday)', null, { numFmt: X.FMT.date });
  const cWeekEnd = `$B$${cr}`;
  X.kv(cs, cr, 4, 'Project', null, { labelTo: 5, to: 9 });
  X.kv(cs, cr, 11, 'Weekly OT after (hrs)', 40, { labelTo: 13, numFmt: '0.##', align: 'right' });
  const cWeekly = `$N$${cr}`;
  cr++;
  X.kv(cs, cr, 1, 'Prepared by', null);
  X.kv(cs, cr, 4, 'Approved by', null, { labelTo: 5, to: 9 });
  X.kv(cs, cr, 11, 'Overtime multiplier', 1.5, { labelTo: 13, numFmt: '0.0"×"', align: 'right' });
  const cMult = `$N$${cr}`;
  cr += 2;
  X.text(cs, cr, 3, 'Date', { size: 8, color: X.C.ink3, align: 'right' });
  DAYS.forEach((_, i) => {
    X.calc(cs, cr, 4 + i, `IF(${cWeekEnd}="","",${cWeekEnd}-${6 - i})`, {
      numFmt: 'm/d',
      align: 'right',
    });
    cs.getCell(cr, 4 + i).font = { name: X.FONT, size: 8, color: { argb: X.C.ink3 } };
  });
  cr++;
  X.headerRow(
    cs,
    cr,
    [
      'Name',
      'Classification',
      'Rate',
      ...DAYS,
      'Total',
      'Regular',
      'Overtime',
      'Regular pay',
      'OT pay',
      'Gross',
    ],
    {
      aligns: [
        'left',
        'left',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
        'right',
      ],
    }
  );
  cr++;
  const cFirst = cr;
  for (let i = 0; i < 15; i++) {
    X.bodyRow(cs, cr, [
      { input: true },
      { input: true },
      { input: true, numFmt: X.FMT.moneyBlank },
      ...DAYS.map(() => ({ input: true, numFmt: '0.00;-0.00;""', align: 'right' })),
      { formula: `IF(COUNT(D${cr}:J${cr})=0,"",SUM(D${cr}:J${cr}))`, numFmt: '0.00;-0.00;""' },
      { formula: `IF(K${cr}="","",MIN(K${cr},${cWeekly}))`, numFmt: '0.00;-0.00;""' },
      { formula: `IF(K${cr}="","",K${cr}-L${cr})`, numFmt: '0.00;-0.00;""' },
      { formula: `IF(OR(K${cr}="",C${cr}=""),"",L${cr}*C${cr})`, numFmt: X.FMT.moneyBlank },
      {
        formula: `IF(OR(K${cr}="",C${cr}=""),"",M${cr}*C${cr}*${cMult})`,
        numFmt: X.FMT.moneyBlank,
      },
      { formula: `IF(OR(K${cr}="",C${cr}=""),"",N${cr}+O${cr})`, numFmt: X.FMT.moneyBlank },
    ]);
    cr++;
  }
  const cLast = cr - 1;
  X.totalRow(cs, cr, [
    { value: 'Crew totals' },
    { formula: `COUNTA(A${cFirst}:A${cLast})&" people"`, align: 'left' },
    {},
    ...DAYS.map((_, i) => ({
      formula: `SUM(${X.col(4 + i)}${cFirst}:${X.col(4 + i)}${cLast})`,
      numFmt: '0.00',
    })),
    { formula: `SUM(K${cFirst}:K${cLast})`, numFmt: '0.00' },
    { formula: `SUM(L${cFirst}:L${cLast})`, numFmt: '0.00' },
    { formula: `SUM(M${cFirst}:M${cLast})`, numFmt: '0.00' },
    { formula: `SUM(N${cFirst}:N${cLast})`, numFmt: X.FMT.money },
    { formula: `SUM(O${cFirst}:O${cLast})`, numFmt: X.FMT.money },
    { formula: `SUM(P${cFirst}:P${cLast})`, numFmt: X.FMT.money },
  ]);
  cs.views = [{ state: 'frozen', ySplit: cFirst - 1, showGridLines: false }];
  cr += 2;
  X.brandFooter(
    cs,
    cr,
    16,
    'Free template by BuildWorkPro — buildworkpro.com/templates. The crew summary splits overtime on the weekly threshold only; use the Weekly Timesheet for daily-overtime states. Not legal or payroll advice.'
  );

  X.howToSheet(wb, {
    title: 'Construction Timesheet Template',
    steps: [
      'On the Weekly Timesheet sheet, fill the employee, the week-ending Sunday (the dates fill in), the supervisor and the regular rate. Amber cells are inputs.',
      'Set the overtime rules: weekly overtime after 40 hours (change it if your contract differs), daily overtime after 8 hours for states or agreements that use it (leave blank to turn it off), and the overtime multiplier (1.5 by default).',
      'For each day enter the job, the cost code or task, start time, end time and break minutes. Hours calculate; you can also type hours straight into the Hours column if you do not track start and end.',
      'Regular and overtime split automatically: each day is capped at the daily threshold, then regular hours are capped at the weekly threshold in date order, and the rest is overtime. Use the three extra rows for a day split across two jobs.',
      'Regular pay, overtime pay and gross calculate from the rate. Print (fits one page), have the employee sign, and the supervisor approve.',
      'On the Crew Summary sheet, enter each person’s rate and hours per day for the week. Totals, the weekly regular / overtime split and pay calculate per person and for the crew.',
    ],
    tips: [
      'Job and cost code on every line is what turns a timesheet into job costing. A week of hours with no job is payroll, not information.',
      'The hours here should match the daily report for the same day. If the timesheet says 10 and the daily report says 8, one of them is wrong — and both are evidence.',
      'Prevailing-wage and public jobs require certified payroll reports on top of the timesheet; keep classification and rate on every line so the report can be built from it.',
    ],
    feature: {
      text: 'In BuildWorkPro crews log hours against the project in quarter-hour steps, the labor rate you set per person turns them into cost automatically, a manager reviews entries before payroll, and the Time Tracking page totals hours and cost for any date range.',
      url: 'https://buildworkpro.com/features/time-tracking/',
    },
  });
  return wb;
}
