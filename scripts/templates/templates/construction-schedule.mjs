// Construction schedule — Excel Gantt driven by formulas + conditional
// formatting (16 period columns, weekly by default), and a landscape PDF grid.
// Sample = the STORY mechanical scope, June–November 2026, status as of the
// pay app #3 period end (Aug 31, 2026).
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'construction-schedule',
  name: 'Construction Schedule Template',
  basename: 'construction-schedule-template',
  docName: 'Construction schedule',
};

const PERIODS = 16;
const BLANK_ROWS = 24;
const XLSX_ROWS = 40;

// ---------------------------------------------------------------------------
// Local date helpers (UTC so the build is timezone-independent)
// ---------------------------------------------------------------------------
const d = (y, m, day) => new Date(Date.UTC(y, m - 1, day));
const DAY = 86400000;
const addDays = (date, n) => new Date(date.getTime() + n * DAY);
const isWeekend = (date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;
/** End date (inclusive) of a task that starts on `start` and lasts `n` workdays. */
function workdayEnd(start, n) {
  if (n <= 1) return start;
  let cur = start;
  let left = isWeekend(start) ? n : n - 1;
  while (left > 0) {
    cur = addDays(cur, 1);
    if (!isWeekend(cur)) left--;
  }
  return cur;
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (date) => `${MON[date.getUTCMonth()]} ${date.getUTCDate()}`;
const fmtLong = (date) => `${fmt(date)}, ${date.getUTCFullYear()}`;

// ---------------------------------------------------------------------------
// Sample schedule (workdays; every end date is WORKDAY(start, dur-1))
// ---------------------------------------------------------------------------
const SAMPLE = {
  revision: 'Rev 2 · updated September 3, 2026',
  chartStart: d(2026, 6, 1),
  daysPerCol: 14,
  statusDate: d(2026, 8, 31),
  tasks: [
    ['Mobilization', 'Mobilize, temp facilities & layout', d(2026, 6, 1), 3, 1, '', 'L. Herrera'],
    ['', 'Submittals: RTUs, fixtures, duct shops', d(2026, 6, 1), 15, 1, '', 'D. Whitfield'],
    ['Underground', 'Underground sanitary & storm', d(2026, 6, 4), 15, 1, 1, 'Crew A'],
    ['', 'Underground inspection & backfill', d(2026, 6, 25), 3, 1, 3, 'Crew A'],
    ['Rough-in', 'Domestic water rough-in, Level 1', d(2026, 6, 30), 15, 1, 4, 'Crew A'],
    ['', 'Sanitary waste & vent rough-in, Level 1', d(2026, 6, 30), 20, 1, 4, 'Crew B'],
    ['', 'Water & waste rough-in, Level 2', d(2026, 7, 28), 20, 1, 6, 'Crew B'],
    [
      'HVAC equipment',
      'RTU curbs & roof coord. (CO-001 RTU-2)',
      d(2026, 7, 6),
      5,
      1,
      2,
      'Sheet metal',
    ],
    ['', 'Crane day: set RTU-1 to RTU-4', d(2026, 8, 3), 2, 1, 8, 'Sheet metal'],
    ['', 'Set AHU-3 & mech room equipment', d(2026, 8, 5), 5, 1, 9, 'Sheet metal'],
    ['Ductwork', 'Duct mains & risers, Level 1', d(2026, 7, 13), 20, 1, 2, 'Sheet metal'],
    ['', 'Duct mains & branches, Level 2', d(2026, 8, 10), 25, 0.65, 11, 'Sheet metal'],
    ['', 'Diffusers, grilles & dampers', d(2026, 9, 21), 15, 0, 12, 'Sheet metal'],
    ['Piping', 'Refrigerant piping to RTUs', d(2026, 8, 10), 10, 1, 9, 'Crew B'],
    ['', 'Hydronic piping, AHU-3 & reheat coils', d(2026, 8, 17), 20, 0.55, 10, 'Crew B'],
    ['Controls', 'Controls rough-in & wiring', d(2026, 9, 14), 15, 0, 12, 'BMS sub'],
    ['', 'BMS integration & point-to-point', d(2026, 10, 12), 15, 0, 16, 'BMS sub'],
    ['Insulation', 'Duct insulation', d(2026, 9, 14), 15, 0, 12, 'Insulation sub'],
    ['', 'Pipe insulation', d(2026, 9, 21), 15, 0, 15, 'Insulation sub'],
    ['Fixtures', 'Plumbing fixtures & trim', d(2026, 10, 5), 15, 0, 7, 'Crew A'],
    ['Test & balance', 'Testing, air & water balancing', d(2026, 11, 2), 10, 0, 17, 'TAB agency'],
    ['', 'Commissioning & owner training', d(2026, 11, 16), 3, 0, 21, 'D. Whitfield'],
    ['Closeout', 'Punch list, O&M manuals, closeout', d(2026, 11, 9), 8, 0, 20, 'L. Herrera'],
  ].map(([phase, task, start, dur, pct, pred, owner], i) => ({
    n: i + 1,
    phase,
    task,
    start,
    dur,
    end: workdayEnd(start, dur),
    pct,
    pred,
    owner,
  })),
};

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------
const CSS = `
table.gantt{table-layout:fixed;width:100%;border-collapse:collapse;margin-top:10px;font-size:8px}
table.gantt th{font-size:6.5px;letter-spacing:.6px;text-transform:uppercase;font-weight:600;color:var(--ink2);background:var(--band);border:1px solid var(--rule);border-bottom:1px solid var(--ink2);padding:3px 4px;text-align:left;vertical-align:bottom;overflow:hidden}
table.gantt th.g{text-align:center;padding:2px 0;letter-spacing:0;border-bottom:1px solid var(--rule)}
table.gantt th.g.d{font-family:"IBM Plex Mono";text-transform:none;font-weight:500;color:var(--ink);border-bottom:1px solid var(--ink2);font-size:6.5px}
table.gantt th.g.st,table.gantt td.g.st{background:#fff6dd}
table.gantt td{border:1px solid var(--rule);padding:2px 4px;height:19px;vertical-align:middle;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2}
table.gantt td.c{text-align:center}
table.gantt td.r{text-align:right;font-family:"IBM Plex Mono"}
table.gantt td.mono{font-family:"IBM Plex Mono"}
table.gantt td.ph{font-size:7px;letter-spacing:.5px;text-transform:uppercase;font-weight:600;color:var(--ink2)}
table.gantt td.g{padding:0;position:relative}
table.gantt tr.grp td{border-top:1px solid var(--ink3)}
.bar{position:absolute;top:4px;height:11px;background:#bfdbfe;margin-right:-1px}
.bar.first{border-radius:3px 0 0 3px}.bar.last{border-radius:0 3px 3px 0;margin-right:0}
.bar .done{position:absolute;left:0;top:0;bottom:0;background:var(--accent)}
.bar.first .done{border-radius:3px 0 0 3px}.bar.last .done.full{border-radius:0 3px 3px 0}
.tl{position:absolute;top:-1px;bottom:-1px;width:0;border-left:1.5px dashed var(--deduct);z-index:2}
.legend{display:flex;gap:16px;align-items:center;margin-top:10px;font-size:7.5px;color:var(--ink2)}
.legend span{display:inline-flex;align-items:center;gap:5px}
.legend i{display:inline-block;width:18px;height:8px;border-radius:2px}
`;

function ganttCells(task, cols, days, status) {
  const S = task.start.getTime();
  const Eex = addDays(task.end, 1).getTime();
  const P = S + (Eex - S) * task.pct;
  return cols
    .map((cs, i) => {
      const c0 = cs.getTime();
      const c1 = c0 + days * DAY;
      const hasStatus = status && status.getTime() >= c0 && status.getTime() < c1;
      const cls = `g${hasStatus ? ' st' : ''}`;
      let inner = '';
      const os = Math.max(S, c0);
      const oe = Math.min(Eex, c1);
      if (os < oe) {
        const left = ((os - c0) / (days * DAY)) * 100;
        const width = ((oe - os) / (days * DAY)) * 100;
        const first = os === S;
        const last = oe === Eex;
        let done = '';
        if (P > os) {
          const de = Math.min(oe, P);
          const dw = ((de - os) / (oe - os)) * 100;
          done = `<div class="done${dw >= 99.9 ? ' full' : ''}" style="width:${dw.toFixed(1)}%"></div>`;
        }
        inner += `<div class="bar${first ? ' first' : ''}${last ? ' last' : ''}" style="left:${left.toFixed(1)}%;width:${width.toFixed(1)}%">${done}</div>`;
      }
      if (hasStatus) {
        const x = ((status.getTime() + DAY - c0) / (days * DAY)) * 100;
        inner += `<div class="tl" style="left:${Math.min(x, 100).toFixed(1)}%"></div>`;
      }
      return `<td class="${cls}" data-col="${i + 1}">${inner}</td>`;
    })
    .join('');
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const cols = s
    ? Array.from({ length: PERIODS }, (_, i) => addDays(s.chartStart, i * s.daysPerCol))
    : [];

  const head = `<thead>
<tr>
  <th rowspan="2" style="text-align:center">#</th><th rowspan="2">Phase</th><th rowspan="2">Task</th><th rowspan="2">Start</th><th rowspan="2" style="text-align:center">Dur (wd)</th><th rowspan="2">End</th><th rowspan="2" style="text-align:center">% done</th><th rowspan="2" style="text-align:center">Pred</th><th rowspan="2">Owner / crew</th>
  ${Array.from({ length: PERIODS }, (_, i) => `<th class="g">${i + 1}</th>`).join('')}
</tr>
<tr>${Array.from({ length: PERIODS }, (_, i) => {
    const st = s && s.statusDate >= cols[i] && s.statusDate < addDays(cols[i], s.daysPerCol);
    return `<th class="g d${st ? ' st' : ''}"${s ? '' : ` data-field="col.${i + 1}.start"`}>${s ? fmt(cols[i]) : '&nbsp;'}</th>`;
  }).join('')}</tr>
</thead>`;

  let body = '';
  if (s) {
    body = s.tasks
      .map(
        (t) => `<tr${t.phase ? ' class="grp"' : ''}>
  <td class="c mono ink3">${t.n}</td><td class="ph">${H.esc(t.phase)}</td><td>${H.esc(t.task)}</td>
  <td class="mono">${fmt(t.start)}</td><td class="c mono">${t.dur}</td><td class="mono">${fmt(t.end)}</td>
  <td class="c mono${t.pct >= 1 ? ' strong' : ''}">${Math.round(t.pct * 100)}%</td><td class="c mono ink2">${t.pred || ''}</td><td class="ink2">${H.esc(t.owner)}</td>
  ${ganttCells(t, cols, s.daysPerCol, s.statusDate)}
</tr>`
      )
      .join('');
  } else {
    for (let i = 1; i <= BLANK_ROWS; i++) {
      const f = (k, cls = '') => `<td class="${cls}" data-field="t.${i}.${k}"></td>`;
      body += `<tr><td class="c mono ink3">${i}</td>${f('phase')}${f('task')}${f('start', 'mono')}${f('dur', 'c mono')}${f('end', 'mono')}${f('pct', 'c mono')}${f('pred', 'c mono')}${f('owner')}${Array.from({ length: PERIODS }, () => '<td class="g"></td>').join('')}</tr>`;
    }
  }

  const colgroup = `<colgroup><col style="width:20px"><col style="width:78px"><col style="width:170px"><col style="width:46px"><col style="width:30px"><col style="width:46px"><col style="width:30px"><col style="width:30px"><col style="width:62px">${Array.from({ length: PERIODS }, () => '<col style="width:28px">').join('')}</colgroup>`;

  const page = `
${H.header({
  company,
  title: 'Construction schedule',
  number: s ? 'Rev 2' : 'Rev ____',
  date: s ? 'September 3, 2026' : undefined,
  fillable: !sample,
})}
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
    label: 'Prepared for',
    lines: [
      { text: s ? SAMPLE_GC.name : '', strong: true, field: 'to.name' },
      { text: s ? SAMPLE_GC.line2 : '', field: 'to.line1' },
      { text: s ? `Prepared by ${STORY.people.pm}, Project Manager` : '', field: 'prepared_by' },
    ],
  },
  {
    label: 'Key dates',
    kv: [
      { k: 'Contract start', v: s ? STORY.startDate : '', field: 'dates.start', mono: true },
      {
        k: 'Substantial completion',
        v: s ? STORY.completionDate : '',
        field: 'dates.completion',
        mono: true,
      },
      { k: 'Status date', v: s ? fmtLong(s.statusDate) : '', field: 'dates.status', mono: true },
      {
        k: 'Days per column',
        v: s ? `${s.daysPerCol} (two weeks)` : '',
        field: 'dates.days_per_col',
        mono: true,
      },
    ],
  },
])}
<table class="gantt">${colgroup}${head}<tbody>${body}</tbody></table>
<div class="legend">
  <span><i style="background:#bfdbfe"></i> Planned</span>
  <span><i style="background:var(--accent)"></i> Complete (bar shaded to % done)</span>
  <span><i style="border-left:1.5px dashed var(--deduct);width:0;height:10px;border-radius:0"></i> Status date</span>
  <span class="ink3">Dur = workdays (weekends excluded). Pred = task # that must finish first. Write the start date of each column in the header — weekly for a 4-month job, every 2 weeks for 8 months.</span>
</div>
${H.finePrint('Planning document, not a contract schedule. Contract time, milestone dates and notice requirements come from your subcontract — update this schedule when a change order adjusts them, and record delays in your daily report the day they happen.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [page],
    landscape: true,
    css: CSS,
    footer: H.footerText(`${meta.docName} · ${s ? SAMPLE_PROJECT.number : 'Rev ____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: true }] };
}

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------
const FILL_PLANNED = 'FFBFDBFE';
const FILL_DONE = 'FF2563EB';
const FILL_STATUS = 'FFFFF3D6';
const FILL_LATE = 'FFFDE8E6';

function scheduleSheet(wb, name, { sample }) {
  const ws = X.sheet(wb, name, { landscape: true, fitHeight: 1, printTitles: '10:11' });
  const COLS = 9 + PERIODS; // A..Y
  X.widths(ws, [4, 14, 34, 12, 6.5, 12, 6.5, 6, 13, ...Array(PERIODS).fill(4.3)]);
  let r = X.titleBlock(ws, {
    title: sample ? 'Construction Schedule — Example' : 'Construction Schedule',
    subtitle: sample
      ? 'The completed example: a mechanical subcontract, June–November 2026, status as of August 31. Days per column is set to 14 so the whole job fits; set it to 7 for a weekly view.'
      : 'Enter a start date and a duration in workdays for each task; the end date, the bars and the summary calculate. Change the chart start or the days per column to pan or zoom the Gantt.',
    cols: COLS,
    right: 'Print: landscape, fits one page',
    rightFrom: 18,
  });
  X.inputLegend(ws, r, 1);
  r += 2;

  // ---- meta + Gantt settings ----
  const metaTop = r;
  X.kv(ws, r, 1, 'Project', sample ? SAMPLE_PROJECT.name : null, { labelTo: 2, to: 3 });
  X.kv(ws, r, 4, 'Chart start (Monday of column 1)', sample ? SAMPLE.chartStart : null, {
    labelTo: 6,
    to: 9,
    numFmt: X.FMT.date,
  });
  const START = `$G$${r}`;
  r++;
  X.kv(ws, r, 1, 'Prepared by', sample ? `${STORY.people.pm}, Project Manager` : null, {
    labelTo: 2,
    to: 3,
  });
  X.kv(ws, r, 4, 'Days per column (7 = weekly)', sample ? SAMPLE.daysPerCol : 7, {
    labelTo: 6,
    to: 9,
    numFmt: '0',
  });
  const DAYS = `$G$${r}`;
  r++;
  X.kv(ws, r, 1, 'Revision / date', sample ? SAMPLE.revision : null, { labelTo: 2, to: 3 });
  X.kv(ws, r, 4, 'Status date (draws the today band)', sample ? SAMPLE.statusDate : null, {
    labelTo: 6,
    to: 9,
    numFmt: X.FMT.date,
  });
  const STATUS = `$G$${r}`;
  // legend for the bars, right of the settings
  const legend = [
    [FILL_PLANNED, 'Planned'],
    [FILL_DONE, 'Complete (to % done)'],
    [FILL_STATUS, 'Status date column'],
  ];
  legend.forEach(([fill, text], i) => {
    const row = metaTop + i;
    const sw = ws.getCell(row, 11);
    sw.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    X.text(ws, row, 12, text, { size: 8.5, color: X.C.ink2, merge: 18 });
    ws.getCell(row, 12).alignment = { vertical: 'middle' };
  });
  r += 2;

  // ---- header (two rows) ----
  const h1 = r;
  const h2 = r + 1;
  X.headerRow(
    ws,
    h1,
    ['#', 'Phase', 'Task', 'Start', 'Dur (wd)', 'End', '% done', 'Pred #', 'Owner / crew'],
    { aligns: ['center', 'left', 'left', 'left', 'center', 'left', 'center', 'center', 'left'] }
  );
  X.headerRow(
    ws,
    h1,
    Array.from({ length: PERIODS }, (_, i) => String(i + 1)),
    { startCol: 10, aligns: Array(PERIODS).fill('center') }
  );
  ws.getRow(h2).height = 16;
  for (let c = 1; c <= COLS; c++) {
    const cell = ws.getCell(h2, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: X.C.band } };
    cell.border = { bottom: { style: 'thin', color: { argb: X.C.ink2 } } };
    if (c >= 10) {
      const n = c - 10;
      cell.value = { formula: `IF(${START}="","",${START}+${n}*${DAYS})` };
      cell.numFmt = 'm/d';
      cell.font = { name: X.FONT, size: 7.5, bold: true, color: { argb: X.C.ink } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  }
  // a top rule across the # header so the two header rows read as one band
  for (let c = 1; c <= 9; c++)
    ws.getCell(h1, c).border = { top: { style: 'thin', color: { argb: X.C.rule } } };

  // ---- task rows ----
  const first = h2 + 1;
  const last = first + XLSX_ROWS - 1;
  const tasks = sample ? SAMPLE.tasks : [];
  for (let i = 0; i < XLSX_ROWS; i++) {
    const row = first + i;
    const t = tasks[i];
    X.bodyRow(
      ws,
      row,
      [
        { value: i + 1, align: 'center', color: X.C.ink3 },
        { input: true, value: t ? t.phase || null : null },
        { input: true, value: t ? t.task : null, wrap: false },
        { input: true, value: t ? t.start : null, numFmt: X.FMT.date, align: 'left' },
        { input: true, value: t ? t.dur : null, numFmt: '0', align: 'center' },
        {
          formula: `IF(OR(D${row}="",E${row}=""),"",IF(E${row}<=1,D${row},WORKDAY(D${row},E${row}-1)))`,
          numFmt: X.FMT.date,
          align: 'left',
        },
        { input: true, value: t ? t.pct : null, numFmt: '0%', align: 'center' },
        { input: true, value: t ? t.pred || null : null, numFmt: '0', align: 'center' },
        { input: true, value: t ? t.owner : null },
        ...Array.from({ length: PERIODS }, () => ({ value: null })),
      ],
      { height: 16 }
    );
    // the phase label reads as a group heading
    if (t && t.phase) {
      ws.getCell(row, 2).font = { name: X.FONT, size: 8, bold: true, color: { argb: X.C.ink2 } };
      for (let c = 1; c <= COLS; c++)
        ws.getCell(row, c).border = {
          top: { style: 'thin', color: { argb: X.C.ink3 } },
          bottom: { style: 'thin', color: { argb: X.C.rule } },
        };
    }
  }
  // light vertical rules between Gantt columns
  for (let row = first; row <= last; row++)
    for (let c = 10; c <= COLS; c++)
      ws.getCell(row, c).border = {
        ...ws.getCell(row, c).border,
        left: { style: 'hair', color: { argb: X.C.rule } },
      };

  // ---- summary row ----
  const sum = last + 1;
  X.totalRow(ws, sum, [
    { value: '' },
    { value: 'Summary' },
    {
      formula: `"Tasks: "&COUNTA(C${first}:C${last})&"   ·   Complete: "&COUNTIF(G${first}:G${last},1)&"   ·   In progress: "&COUNTIFS(G${first}:G${last},">0",G${first}:G${last},"<1")`,
      align: 'left',
    },
    {
      formula: `IF(COUNT(D${first}:D${last})=0,"",MIN(D${first}:D${last}))`,
      numFmt: X.FMT.date,
      align: 'left',
    },
    { value: '' },
    {
      formula: `IF(COUNT(F${first}:F${last})=0,"",MAX(F${first}:F${last}))`,
      numFmt: X.FMT.date,
      align: 'left',
    },
    {
      formula: `IF(SUM(E${first}:E${last})=0,"",SUMPRODUCT(E${first}:E${last},G${first}:G${last})/SUM(E${first}:E${last}))`,
      numFmt: '0%',
      align: 'center',
    },
    { value: '' },
    { value: 'earliest start · latest finish · % (duration-weighted)', align: 'left' },
  ]);
  ws.getCell(sum, 9).font = { name: X.FONT, size: 7.5, italic: true, color: { argb: X.C.ink3 } };
  for (let c = 10; c <= COLS; c++)
    ws.getCell(sum, c).border = { top: { style: 'medium', color: { argb: X.C.ink } } };

  // ---- validation ----
  ws.dataValidations.add(`G${first}:G${last}`, {
    type: 'decimal',
    operator: 'between',
    formulae: [0, 1],
    allowBlank: true,
    showErrorMessage: true,
    errorTitle: 'Percent complete',
    error: 'Enter a value between 0% and 100%.',
  });
  ws.dataValidations.add(`E${first}:E${last}`, {
    type: 'whole',
    operator: 'greaterThanOrEqual',
    formulae: [0],
    allowBlank: true,
    showErrorMessage: true,
    errorTitle: 'Duration',
    error: 'Duration is a whole number of workdays.',
  });

  // ---- Gantt conditional formatting ----
  const J = 'J';
  const Y = X.col(COLS);
  const ganttRef = `${J}${first}:${Y}${last}`;
  const g = (row) => ({
    start: `$D${row}`,
    end: `$F${row}`,
    pct: `$G${row}`,
    col: `${J}$${h2}`,
  });
  const f = g(first);
  const overlap = `${f.start}<>"",${f.end}<>"",${f.col}<>"",${f.start}<=${f.col}+${DAYS}-1,${f.end}>=${f.col}`;
  const doneEdge = `${f.start}+(${f.end}-${f.start}+1)*${f.pct}`;
  ws.addConditionalFormatting({
    ref: ganttRef,
    rules: [
      {
        type: 'expression',
        priority: 1,
        formulae: [`AND(${overlap},${f.pct}>0,${f.col}<${doneEdge})`],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: FILL_DONE } } },
      },
      {
        type: 'expression',
        priority: 2,
        formulae: [`AND(${overlap},OR(${f.pct}=0,${f.pct}="",${f.col}>=${doneEdge}))`],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: FILL_PLANNED } } },
      },
      {
        type: 'expression',
        priority: 3,
        formulae: [
          `AND(${STATUS}<>"",${f.col}<>"",${f.col}<=${STATUS},${f.col}+${DAYS}-1>=${STATUS})`,
        ],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: FILL_STATUS } } },
      },
    ],
  });
  // status column highlight on the date header row too
  ws.addConditionalFormatting({
    ref: `${J}${h2}:${Y}${h2}`,
    rules: [
      {
        type: 'expression',
        priority: 4,
        formulae: [
          `AND(${STATUS}<>"",${J}$${h2}<>"",${J}$${h2}<=${STATUS},${J}$${h2}+${DAYS}-1>=${STATUS})`,
        ],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: FILL_STATUS } } },
      },
    ],
  });
  // sequence check: a start date on or before its predecessor's end turns red
  const predEnd = `INDEX($F$${first}:$F$${last},MATCH($H${first},$A$${first}:$A$${last},0))`;
  ws.addConditionalFormatting({
    ref: `D${first}:D${last}`,
    rules: [
      {
        type: 'expression',
        priority: 5,
        formulae: [
          `AND($H${first}<>"",$D${first}<>"",ISNUMBER(MATCH($H${first},$A$${first}:$A$${last},0)),ISNUMBER(${predEnd}),$D${first}<=${predEnd})`,
        ],
        style: {
          font: { color: { argb: X.C.deduct }, bold: true },
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: FILL_LATE } },
        },
      },
    ],
  });

  ws.views = [{ state: 'frozen', xSplit: 3, ySplit: h2, showGridLines: false }];
  r = sum + 2;
  X.noteRow(
    ws,
    r,
    'How the bars work: a column is shaded when the task overlaps the dates that column covers (its start date plus the days per column). The dark part of the bar follows % done. A red start date means the task starts before its predecessor finishes.',
    COLS,
    { height: 30 }
  );
  r += 2;
  X.brandFooter(
    ws,
    r,
    COLS,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Planning document, not a contract schedule: contract time and milestone dates come from your subcontract.'
  );
  ws.pageSetup.printArea = `A1:${Y}${r}`;
  return ws;
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });
  scheduleSheet(wb, 'Schedule', { sample: false });
  scheduleSheet(wb, 'Example', { sample: true });
  X.howToSheet(wb, {
    title: 'Construction Schedule Template',
    steps: [
      'On the Schedule sheet, enter the project, the Monday you want column 1 to start on, and the days per column: 7 gives a 16-week weekly view, 14 covers eight months at two weeks per column.',
      'List the work one task per row, grouped by phase. Give each task a start date and a duration in workdays — the end date is computed with WORKDAY, so weekends are skipped automatically.',
      'Put the task number that must finish first in Pred #. If a start date turns red, that task starts before its predecessor ends — move it or shorten the predecessor.',
      'The Gantt shades itself: light blue where a task overlaps a column, dark blue for the portion that is done as you update % done each week.',
      'Enter a status date to draw a highlighted column through the chart, then print (landscape, one page) for the trailer wall or the weekly meeting. Change the chart start date to pan forward as the job progresses.',
      'The Example sheet holds a complete six-month mechanical schedule with the same formulas — copy rows from it or clear it and use it as a second project.',
    ],
    tips: [
      'Task durations of two days to two weeks are the useful range. Finer and you are maintaining a spreadsheet instead of building; coarser and slippage hides inside long bars.',
      'Update % done and the status date every week, on the same day. A schedule that is updated irregularly gets ignored.',
      'When a change order adds contract time, add the days to the affected task and note the CO number in the task name — the revised completion date has to match the signed change order.',
      'Record delays in the daily report the day they happen. The schedule shows the effect; the daily report proves the cause.',
    ],
    feature: {
      text: 'In BuildWorkPro, phases and tasks carry start dates and workday durations, dependencies highlight the critical path, and the Gantt chart is rescheduled by dragging bars — on the same project as your change orders, site logs and pay applications.',
      url: 'https://buildworkpro.com/features/project-management/',
    },
  });
  return wb;
}
