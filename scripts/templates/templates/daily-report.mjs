// Construction daily report — one-page field form (PDF fillable), Word, and an
// Excel workbook with the form plus a weekly crew-hours summary.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'daily-report',
  name: 'Construction Daily Report Template',
  basename: 'daily-report-template',
  docName: 'Daily report',
};

// Tuesday, August 18, 2026 — the day RTU-2 and RTU-3 are set on the roof.
// Contract day 79 of 171 (June 1 → November 18, 2026).
const SAMPLE = {
  number: 'DR-056',
  date: 'August 18, 2026',
  dateLong: 'Tuesday, Aug 18, 2026',
  contractDay: 'Day 79 of 171',
  preparedBy: `${STORY.people.foreman}, Foreman`,
  shift: '6:30 AM – 3:00 PM',
  weather: {
    am: '64°F · Clear',
    pm: '88°F · Partly cloudy',
    wind: '8 mph W · 0.00 in',
    delay: 'None (0.0 hrs)',
  },
  crew: [
    {
      name: STORY.people.foreman,
      trade: 'Summit · Foreman',
      hours: 8,
      area: 'Roof — crane pick; Level 2',
    },
    {
      name: 'Javier Soto',
      trade: 'Summit · Journeyman plumber',
      hours: 8,
      area: 'L2 sanitary waste & vent, Suites 212–214',
    },
    {
      name: 'Mike Delgado',
      trade: 'Summit · Journeyman plumber',
      hours: 8,
      area: 'L2 domestic water, Suites 210–214',
    },
    {
      name: 'Andre Kim',
      trade: 'Summit · Apprentice plumber',
      hours: 8,
      area: 'L2 hangers & inserts',
    },
    {
      name: 'Sam Pruitt',
      trade: 'Summit · Sheet metal journeyman',
      hours: 8,
      area: 'Roof — RTU-2 / RTU-3 set, curb flashing',
    },
    {
      name: 'Casey Nguyen',
      trade: 'Summit · Sheet metal apprentice',
      hours: 8,
      area: 'Corridor 2C trunk duct',
    },
  ],
  equipment: [
    { item: '90-ton crane — Peak Crane (sub)', own: 'Rented', hours: '4.5', idle: '—' },
    { item: 'Boom lift, 45 ft articulating', own: 'Rented', hours: '8.0', idle: '—' },
    { item: 'Scissor lift, 19 ft (2)', own: 'Owned', hours: '8.0', idle: '—' },
    { item: 'Threader, press tool, hand tools', own: 'Owned', hours: '8.0', idle: '—' },
  ],
  materials: [
    {
      qty: '300 LF',
      desc: '2" Type L copper, hard drawn',
      vendor: 'Ferguson 4471822',
      stored: 'L2 cage',
    },
    {
      qty: '24 pcs',
      desc: 'Rect. duct 26 ga, 24×12 / 18×10',
      vendor: 'Ductworks 20887',
      stored: 'East laydown',
    },
    {
      qty: '2 ea',
      desc: 'RTU-2 & RTU-3 (subm. 23 74 13-02)',
      vendor: 'Carrier SO 5518-2',
      stored: 'On curbs, roof',
    },
  ],
  work: 'Roof: set RTU-2 and RTU-3 on curbs with 90-ton crane, 7:00–11:30 AM (Peak Crane). Units shimmed, leveled, bolted and tied down; curb flashing complete on RTU-2, RTU-3 flashing tomorrow. Level 2: 2" domestic water rough-in Suites 210–214 complete (approx. 140 LF); sanitary waste & vent rough-in Suites 212–214 (gridlines C–E), ready for pressure test Aug 19. Corridor 2C: main supply trunk hung gridlines C–F, 26 ga, approx. 60 LF.',
  delays:
    'Roof drain at RTU-3 conflicts with curb per A-501 — RFI-016 issued to Brightline 3:15 PM. Sprinkler main not yet in corridor 2C; trunk duct hung, no time lost today. Coordinate by Aug 20.',
  visitors:
    'T. Okafor (Brightline super) on roof for crane pick 7:00–11:30. City rough plumbing inspection, Suites 210–211: PASSED (R. Alvarez, 1:30 PM). A. Park (Kestrel Design Group) walked Level 2 at 2:00 PM.',
  safety:
    'Toolbox talk 6:45 AM — crane signals & suspended loads, 8 attended. Pick zone barricaded, tag lines used. No incidents or near-misses.',
  photosCount: '12',
  photosRefs: 'DR056-01…12 · RTU sets, curb flashing, Suite 212',
  reviewedBy: `${STORY.people.pm}, Project Manager`,
};

const crewTotal = SAMPLE.crew.reduce((s, c) => s + c.hours, 0);

/**
 * Local helper: H.table() cannot emit a ruled total row after its blank rows,
 * so append one by hand. cells = [{ html, cls, field }] in column order.
 */
function withTotalRow(tableHtml, cells) {
  const tds = cells
    .map(
      (c) =>
        `<td class="${c.cls ?? ''}"${c.field ? ` data-field="${c.field}" style="min-height:12px"` : ''}>${c.html ?? ''}</td>`
    )
    .join('');
  return tableHtml.replace('</tbody></table>', `<tr class="total">${tds}</tr></tbody></table>`);
}

export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };

  const crewCols = [
    { key: 'n', label: '#', width: 24, align: 'center', mono: true },
    { key: 'name', label: 'Crew on site · name', width: 124 },
    { key: 'trade', label: 'Company · trade', width: 172 },
    { key: 'hours', label: 'Hours', width: 52, align: 'right' },
    { key: 'area', label: 'Area / task assigned' },
  ];
  const crewRows = s
    ? s.crew.map((c, i) => ({
        cells: {
          n: String(i + 1),
          name: c.name,
          trade: c.trade,
          hours: c.hours.toFixed(1),
          area: c.area,
        },
      }))
    : [];
  const crewTable = withTotalRow(
    H.table({
      columns: crewCols,
      rows: crewRows,
      blankRows: sample ? 0 : 7,
      fieldPrefix: 'crew',
      variant: 'compact',
      rowHeight: 18,
    }),
    [
      { html: '' },
      { html: 'Total crew hours' },
      {
        html: s ? `${s.crew.length} on site` : '',
        cls: 'ink2',
        field: sample ? undefined : 'crew.headcount',
      },
      {
        html: s ? crewTotal.toFixed(1) : '',
        cls: 'right mono',
        field: sample ? undefined : 'crew.total_hours',
      },
      { html: '' },
    ]
  );

  const eqCols = [
    { key: 'item', label: 'Equipment on site' },
    { key: 'own', label: 'Own / rent', width: 54 },
    { key: 'hours', label: 'Hrs', width: 34, align: 'right' },
    { key: 'idle', label: 'Idle · why', width: 62 },
  ];
  const eqRows = s ? s.equipment.map((e) => ({ cells: e })) : [];

  const matCols = [
    { key: 'qty', label: 'Qty', width: 42 },
    { key: 'desc', label: 'Materials delivered' },
    { key: 'vendor', label: 'Vendor · ticket', width: 86 },
    { key: 'stored', label: 'Stored at', width: 66 },
  ];
  const matRows = s ? s.materials.map((m) => ({ cells: m })) : [];

  const body = `
${H.header({ company, title: 'Daily report', number: s ? s.number : 'DR-____', date: s ? s.date : undefined, fillable: !sample })}
${H.metaRow([
  {
    label: 'Project',
    lines: [
      { text: s ? SAMPLE_PROJECT.name : '', strong: true, field: 'project.name' },
      { text: s ? SAMPLE_PROJECT.number : '', mono: true, field: 'project.number' },
      { text: s ? SAMPLE_PROJECT.address : '', field: 'project.address' },
      { text: s ? 'GC: Brightline Builders, Inc. · Super: Tom Okafor' : '', field: 'project.gc' },
    ],
  },
  {
    label: 'Report',
    kv: [
      { k: 'Date', v: s ? s.dateLong : '', field: 'report.date' },
      {
        k: 'Report no.',
        v: s ? s.number.replace('DR-', '') : '',
        field: 'report.number',
        mono: true,
      },
      { k: 'Contract day', v: s ? s.contractDay : '', field: 'report.contract_day' },
      { k: 'Prepared by', v: s ? s.preparedBy : '', field: 'report.prepared_by' },
    ],
  },
  {
    label: 'Weather',
    kv: [
      { k: 'AM · temp / conditions', v: s ? s.weather.am : '', field: 'weather.am' },
      { k: 'PM · temp / conditions', v: s ? s.weather.pm : '', field: 'weather.pm' },
      { k: 'Wind · precipitation', v: s ? s.weather.wind : '', field: 'weather.wind' },
      { k: 'Weather delay (hrs · impact)', v: s ? s.weather.delay : '', field: 'weather.delay' },
    ],
  },
])}
${crewTable}
${H.split(
  H.table({
    columns: eqCols,
    rows: eqRows,
    blankRows: sample ? 0 : 3,
    fieldPrefix: 'equip',
    variant: 'compact',
    rowHeight: 18,
  }),
  H.table({
    columns: matCols,
    rows: matRows,
    blankRows: sample ? 0 : 3,
    fieldPrefix: 'mat',
    variant: 'compact',
    rowHeight: 18,
  }),
  [1, 1.1],
  16
)}
${H.textarea({ name: 'work', label: 'Work performed', hint: 'what was installed or completed, by building / floor / room / gridline — and what was planned but could not be done, and why', value: s ? s.work : '', height: 50 })}
${H.split(
  H.textarea({
    name: 'delays',
    label: 'Delays, disruptions & issues',
    hint: 'cause, who, times, impact — facts, not opinions',
    value: s ? s.delays : '',
    height: 50,
  }),
  H.textarea({
    name: 'visitors',
    label: 'Visitors & inspections',
    hint: 'who, affiliation, result (pass / fail / partial)',
    value: s ? s.visitors : '',
    height: 50,
  }),
  [1, 1],
  16
)}
${H.split(
  H.textarea({
    name: 'safety',
    label: 'Safety & incidents',
    hint: 'toolbox talk, hazards, incidents or near-misses ("None" if none)',
    value: s ? s.safety : '',
    height: 40,
  }),
  `<div class="row" style="gap:12px;margin-top:10px">
    ${H.field({ name: 'photos.count', label: 'Photos', value: s ? s.photosCount : '', width: 56 })}
    ${H.field({ name: 'photos.refs', label: 'Photo file refs / folder', value: s ? s.photosRefs : '', flex: 1 })}
  </div>`,
  [1, 1],
  16
)}
${H.signatures({
  title: 'Certification',
  copy: 'Filed the same day by the person who was on site. The foreman certifies this is an accurate record of the day; the project manager or superintendent reviews it.',
  parties: [
    {
      name: 'Prepared by',
      sub: s ? 'foreman / site lead' : 'foreman / site lead',
      fields: [
        { label: 'Signature', name: 'sig.foreman' },
        { label: 'Printed name and title', name: 'sig.foreman_name', value: s ? s.preparedBy : '' },
        { label: 'Date', name: 'sig.foreman_date', value: s ? '08/18/2026' : '' },
      ],
    },
    {
      name: 'Reviewed by',
      sub: 'project manager / superintendent',
      fields: [
        { label: 'Signature', name: 'sig.reviewer' },
        {
          label: 'Printed name and title',
          name: 'sig.reviewer_name',
          value: s ? s.reviewedBy : '',
        },
        { label: 'Date', name: 'sig.reviewer_date', value: s ? '08/19/2026' : '' },
      ],
    },
  ],
})}
${H.finePrint('One report per site per day, filed before the crew leaves. Daily reports are contemporaneous evidence in delay claims and payment disputes — keep them factual, specific and consistent, with timestamped photos.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [body],
    css: '.hdr-rule{margin:12px 0 12px}table.t{margin-top:8px}.textarea{margin-top:8px}.sig{margin-top:12px}.sig .copy{max-width:none}.sig .parties{margin-top:12px}.sig .party .who{margin-bottom:10px}.sig .line .sp{height:24px}.sig .under{margin-top:10px}',
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'DR-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: false }] };
}

export async function docx() {
  const W = D.CONTENT_W;
  const blank = (n, inputs) =>
    Array.from({ length: n }, () => ({ cells: Array(inputs.length).fill(''), input: inputs }));
  const children = [
    ...D.companyHeader({
      title: 'Daily Report',
      number: 'Report No. ________',
      date: 'Date ____________',
    }),
    D.metaRow([
      {
        label: 'Project',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'General contractor · superintendent',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
          { text: '', input: true },
        ],
      },
    ]),
    D.spacer(4),
    D.fieldGrid([
      [
        { label: 'Prepared by (name, title)', width: Math.round(W * 0.34) },
        { label: 'Shift (start – end)', width: Math.round(W * 0.22) },
        { label: 'Contract day', width: Math.round(W * 0.2) },
        {
          label: 'Weather delay (hrs)',
          width: W - Math.round(W * 0.34) - Math.round(W * 0.22) - Math.round(W * 0.2),
        },
      ],
      [
        { label: 'Weather AM — temp / conditions', width: Math.round(W / 3) },
        { label: 'Weather PM — temp / conditions', width: Math.round(W / 3) },
        { label: 'Wind · precipitation', width: W - 2 * Math.round(W / 3) },
      ],
    ]),
    D.heading('Crew on site', 'name or classification · hours · where they worked'),
    D.table({
      columns: [
        { label: '#', width: 500, align: 'center' },
        { label: 'Name', width: 2600 },
        { label: 'Company · trade / classification', width: 3000 },
        { label: 'Hours', width: 900, align: 'right' },
        { label: 'Area / task assigned', width: W - 500 - 2600 - 3000 - 900 },
      ],
      rows: [
        ...blank(7, [false, true, true, true, true]),
        {
          cells: ['', 'Total crew hours', 'Headcount:', '', ''],
          total: true,
          input: [false, false, false, true, false],
        },
      ],
      blankHeight: 280,
    }),
    D.heading('Equipment on site', 'owned or rented · hours in use · idle time and cause'),
    D.table({
      columns: [
        { label: 'Equipment', width: 4200 },
        { label: 'Owned / rented', width: 1700 },
        { label: 'Hrs used', width: 1100, align: 'right' },
        { label: 'Idle hrs · reason', width: W - 4200 - 1700 - 1100 },
      ],
      blankRows: 4,
      blankHeight: 280,
    }),
    D.heading(
      'Materials delivered / stored',
      'quantity · description · vendor and ticket · where stored · damage or shorts'
    ),
    D.table({
      columns: [
        { label: 'Qty', width: 1000 },
        { label: 'Description', width: 4400 },
        { label: 'Vendor · ticket no.', width: 2400 },
        { label: 'Stored at', width: W - 1000 - 4400 - 2400 },
      ],
      blankRows: 4,
      blankHeight: 280,
    }),
    D.spacer(4),
    ...D.textBox('Work performed', {
      lines: 4,
      hint: 'What was installed or completed, by building / floor / room / gridline — and what was planned but could not be done, and why.',
    }),
    ...D.textBox('Delays, disruptions & issues', {
      lines: 3,
      hint: 'Anything that cost time or money: areas not ready, late information, other trades, weather with times. Cause, who, impact — facts, not opinions.',
    }),
    ...D.textBox('Visitors & inspections', {
      lines: 2,
      hint: 'Who, affiliation, time. Inspections: what was inspected and the result (pass / fail / partial) and any corrective action.',
    }),
    ...D.textBox('Safety & incidents', {
      lines: 2,
      hint: 'Toolbox talk topic and attendance, hazards observed and who they were reported to, incidents or near-misses (write "None" if none).',
    }),
    D.fieldGrid([
      [
        { label: 'Photos taken (count)', width: Math.round(W * 0.25) },
        { label: 'Photo file references / folder', width: W - Math.round(W * 0.25) },
      ],
    ]),
    ...D.signatures({
      title: 'Certification',
      copy: 'Filed the same day by the person who was on site. The foreman certifies this is an accurate record of the day; the project manager or superintendent reviews it.',
      parties: [
        { name: 'Prepared by', sub: 'foreman / site lead' },
        { name: 'Reviewed by', sub: 'project manager / superintendent' },
      ],
    }),
    D.fine(
      'One report per site per day, filed before the crew leaves. Daily reports are contemporaneous evidence in delay claims and payment disputes — keep them factual, specific and consistent. Attach photos with timestamps. Keep your own record even when the GC requires its own form.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Daily report' });
}

export async function xlsx() {
  const wb = X.workbook({ title: meta.name });
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ---- Sheet 1: the daily report form ----
  const ws = X.sheet(wb, 'Daily Report', { fitHeight: 1 });
  X.widths(ws, [4, 20, 26, 10, 18, 20]);
  let r = X.titleBlock(ws, {
    title: 'Daily Report',
    subtitle:
      'One report per site per day, filed before the crew leaves. Crew hours total automatically.',
    cols: 6,
    right: 'Print: fits one page',
    rightFrom: 5,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  X.label(ws, r, 2, 'Your company');
  X.label(ws, r, 4, 'Report');
  r++;
  X.kv(ws, r, 2, 'Company');
  X.kv(ws, r, 4, 'Report no.', null, { labelTo: 5 });
  r++;
  X.kv(ws, r, 2, 'Address');
  X.kv(ws, r, 4, 'Date', null, { labelTo: 5, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 2, 'Phone / email');
  X.kv(ws, r, 4, 'Prepared by (name, title)', null, { labelTo: 5 });
  r += 2;
  X.label(ws, r, 2, 'Project');
  X.label(ws, r, 4, 'Weather');
  r++;
  X.kv(ws, r, 2, 'Project name');
  X.kv(ws, r, 4, 'AM temp / conditions', null, { labelTo: 5 });
  r++;
  X.kv(ws, r, 2, 'Project number');
  X.kv(ws, r, 4, 'PM temp / conditions', null, { labelTo: 5 });
  r++;
  X.kv(ws, r, 2, 'GC / superintendent');
  X.kv(ws, r, 4, 'Wind / precipitation', null, { labelTo: 5 });
  r++;
  X.kv(ws, r, 2, 'Shift (start – end)');
  X.kv(ws, r, 4, 'Weather delay (hrs)', null, { labelTo: 5, numFmt: X.FMT.hours, align: 'right' });
  r += 2;

  X.headerRow(
    ws,
    r,
    ['#', 'Name', 'Company · trade / classification', 'Hours', 'Area / task', ''],
    {
      aligns: ['center', 'left', 'left', 'right', 'left', 'left'],
    }
  );
  ws.mergeCells(r, 5, r, 6);
  r++;
  const cFirst = r;
  for (let i = 0; i < 8; i++) {
    X.bodyRow(ws, r, [
      { value: i + 1, align: 'center', color: X.C.ink3 },
      { input: true },
      { input: true },
      { input: true, numFmt: X.FMT.hours, align: 'right' },
      { input: true },
      { input: true },
    ]);
    ws.mergeCells(r, 5, r, 6);
    r++;
  }
  const cLast = r - 1;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Total crew hours' },
    {
      formula: `IF(COUNTA(B${cFirst}:B${cLast})=0,"",COUNTA(B${cFirst}:B${cLast})&" on site")`,
      align: 'left',
    },
    { formula: `SUM(D${cFirst}:D${cLast})`, numFmt: X.FMT.hours },
    {},
    {},
  ]);
  r += 2;

  X.headerRow(
    ws,
    r,
    ['', 'Equipment on site', 'Owned / rented', 'Hrs used', 'Idle hrs · reason', ''],
    {
      aligns: ['center', 'left', 'left', 'right', 'left', 'left'],
    }
  );
  ws.mergeCells(r, 5, r, 6);
  r++;
  for (let i = 0; i < 4; i++) {
    X.bodyRow(ws, r, [
      { value: '', align: 'center' },
      { input: true },
      { input: true },
      { input: true, numFmt: X.FMT.hours, align: 'right' },
      { input: true },
      { input: true },
    ]);
    ws.mergeCells(r, 5, r, 6);
    r++;
  }
  r++;
  X.headerRow(
    ws,
    r,
    [
      '',
      'Materials delivered / stored',
      'Vendor · ticket no.',
      'Qty',
      'Stored at · damage / shorts',
      '',
    ],
    {
      aligns: ['center', 'left', 'left', 'right', 'left', 'left'],
    }
  );
  ws.mergeCells(r, 5, r, 6);
  r++;
  for (let i = 0; i < 4; i++) {
    X.bodyRow(ws, r, [
      { value: '', align: 'center' },
      { input: true },
      { input: true },
      { input: true, align: 'right' },
      { input: true },
      { input: true },
    ]);
    ws.mergeCells(r, 5, r, 6);
    r++;
  }
  r++;
  const box = (title, lines) => {
    X.label(ws, r, 2, title);
    r++;
    ws.mergeCells(r, 2, r + lines - 1, 6);
    X.input(ws, r, 2, null, { wrap: true });
    for (let i = 0; i < lines; i++) ws.getRow(r + i).height = 18;
    r += lines + 1;
  };
  box(
    'Work performed — what, where (building / floor / room / gridline), and what could not be done and why',
    4
  );
  box('Delays, disruptions & issues — cause, who, times, impact', 3);
  box('Visitors & inspections — who, affiliation, result', 2);
  box('Safety & incidents — toolbox talk topic + attendance, hazards, near-misses', 2);
  X.kv(ws, r, 2, 'Photos taken (count)');
  X.kv(ws, r, 4, 'Photo refs / folder', null, { labelTo: 5 });
  r += 2;
  r = X.signatureBlock(ws, r, ['Prepared by (foreman)', 'Reviewed by (PM / superintendent)'], {
    cols: [2, 4],
    width: 2,
  });
  r++;
  X.brandFooter(
    ws,
    r,
    6,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Daily reports are contemporaneous evidence: same-day, factual, specific. Keep your own record even when the GC requires its own form.'
  );
  ws.pageSetup.printArea = `A1:F${r}`;

  // ---- Sheet 2: weekly crew-hours summary ----
  const wk = X.sheet(wb, 'Weekly Summary', { landscape: true, fitHeight: 1 });
  X.widths(wk, [24, 22, 9, 9, 9, 9, 9, 9, 9, 10, 8, 26]);
  let wr = X.titleBlock(wk, {
    title: 'Weekly Crew Summary',
    subtitle:
      'Hours per person per day, copied from each daily report. Row and day totals, headcount and reports-filed check calculate.',
    cols: 12,
  });
  X.inputLegend(wk, wr, 1);
  wr++;
  X.kv(wk, wr, 1, 'Week ending (Sunday)', null, { numFmt: X.FMT.date });
  const weekEnd = `$B$${wr}`;
  X.kv(wk, wr, 4, 'Project', null, { labelTo: 5, to: 9 });
  wr++;
  X.kv(wk, wr, 1, 'Prepared by', null);
  X.kv(wk, wr, 4, 'Reviewed by', null, { labelTo: 5, to: 9 });
  wr += 2;
  // Date row driven by week ending.
  X.text(wk, wr, 2, 'Date', { size: 8, color: X.C.ink3, align: 'right' });
  DAYS.forEach((_, i) => {
    X.calc(wk, wr, 3 + i, `IF(${weekEnd}="","",${weekEnd}-${6 - i})`, {
      numFmt: 'mmm d',
      align: 'center',
    });
    wk.getCell(wr, 3 + i).font = { name: X.FONT, size: 8, color: { argb: X.C.ink3 } };
  });
  wr++;
  X.headerRow(wk, wr, ['Name', 'Trade / classification', ...DAYS, 'Total', 'Days', 'Notes'], {
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
      'left',
    ],
  });
  wr++;
  const wFirst = wr;
  for (let i = 0; i < 15; i++) {
    X.bodyRow(wk, wr, [
      { input: true },
      { input: true },
      ...DAYS.map(() => ({ input: true, numFmt: '0.00;-0.00;""', align: 'right' })),
      { formula: `IF(COUNT(C${wr}:I${wr})=0,"",SUM(C${wr}:I${wr}))`, numFmt: '0.00;-0.00;""' },
      { formula: `IF(COUNT(C${wr}:I${wr})=0,"",COUNTIF(C${wr}:I${wr},">0"))`, numFmt: '0;-0;""' },
      { input: true, wrap: true },
    ]);
    wr++;
  }
  const wLast = wr - 1;
  X.totalRow(wk, wr, [
    { value: 'Crew hours by day' },
    { formula: `COUNTA(A${wFirst}:A${wLast})&" people"`, align: 'left' },
    ...DAYS.map((_, i) => ({
      formula: `SUM(${X.col(3 + i)}${wFirst}:${X.col(3 + i)}${wLast})`,
      numFmt: '0.00',
    })),
    { formula: `SUM(J${wFirst}:J${wLast})`, numFmt: '0.00' },
    {},
    {},
  ]);
  wr++;
  X.text(wk, wr, 1, 'Headcount by day', { size: 9, color: X.C.ink2 });
  DAYS.forEach((_, i) => {
    X.calc(wk, wr, 3 + i, `COUNTIF(${X.col(3 + i)}${wFirst}:${X.col(3 + i)}${wLast},">0")`, {
      numFmt: '0',
    });
  });
  wr++;
  X.text(wk, wr, 1, 'Daily report filed? (Yes / No)', { size: 9, color: X.C.ink2 });
  DAYS.forEach((_, i) => X.input(wk, wr, 3 + i, null, { align: 'center' }));
  X.dropdown(wk, `C${wr}:I${wr}`, ['Yes', 'No', 'No work']);
  X.statusColors(wk, `C${wr}:I${wr}`, { Yes: 'FFE6F4EA', No: 'FFFDE8E6' });
  X.calc(wk, wr, 10, `COUNTIF(C${wr}:I${wr},"Yes")&" of "&(7-COUNTIF(C${wr}:I${wr},"No work"))`, {
    align: 'right',
  });
  X.text(wk, wr, 11, 'filed', { size: 9, color: X.C.ink3 });
  wk.views = [{ state: 'frozen', ySplit: wFirst - 1, showGridLines: false }];
  wr += 2;
  X.brandFooter(
    wk,
    wr,
    12,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Copy each person’s hours from the daily report into the matching day; the row total, day totals and headcount recalculate. A week with a "No" in the filed row has a gap in the record.'
  );

  X.howToSheet(wb, {
    title: 'Daily Report Template',
    steps: [
      'On the Daily Report sheet, fill your company, the project, the report number and date, who prepared it and the shift. Amber cells are inputs.',
      'Record the weather in the morning and again in the afternoon — temperature, conditions, wind and precipitation — and any hours lost to weather, with the impact.',
      'List every person on site by name or classification with hours and the area or task they worked. The crew-hours total and headcount calculate; "4 workers" is not a record, "J. Soto, journeyman, 8 hrs, Suites 212–214" is.',
      'Log equipment (owned or rented, hours used, idle time and why) and every delivery with quantity, vendor, ticket number and where it was stored. Stored-material entries back up your pay application.',
      'Write the work performed with locations that match the drawings, then the delays and issues (cause, who, times, impact), visitors and inspections with results, safety talk and incidents, and the photo references. Print (fits one page), sign and have the PM review it.',
      'Each week, copy every person’s daily hours into the Weekly Summary sheet. Totals by person and by day, headcount and the reports-filed check recalculate — a "No" in the filed row is a gap in your record.',
    ],
    tips: [
      'File it the same day. A report written Friday for Monday is a reconstruction, and reconstructions lose to contemporaneous records.',
      'The delays section is the one most subs skip and the one that pays. "Suite 205 ceiling grid not installed by others; trim-out could not start" dated the day it happened is the timeline behind a schedule extension.',
      'Keep your own report even when the GC requires its own form — theirs manages the project, yours protects you.',
    ],
    feature: {
      text: 'In BuildWorkPro, site logs are filed from a phone with personnel on site, work performed, materials received, visitors, issues and photos, tagged Progress / Issue / Delay / Safety / Delivery / Inspection so every delay on a job is one filter away months later. A manager marks each log reviewed.',
      url: 'https://buildworkpro.com/features/site-logs/',
    },
  });
  return wb;
}
