// Construction punch list — landscape fillable PDF list, Word table form, and
// an Excel tracker with live status counts, days-open math and an overdue flag.
// Sample = Summit's mechanical/plumbing items from the owner–architect punch
// walk on November 5, 2026, status as of November 12 (STORY completion Nov 18).
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'punch-list',
  name: 'Construction Punch List Template',
  basename: 'punch-list-template',
  docName: 'Punch list',
};

export const STATUSES = ['Open', 'Ready for Review', 'Complete'];
export const PRIORITIES = ['High', 'Med', 'Low'];

const BLANK_ROWS = 16;
const XLSX_ROWS = 40;

const SAMPLE = {
  number: 'PL-02',
  date: 'November 5, 2026',
  statusDate: 'November 12, 2026',
  area: 'Levels 1 & 2 and roof — mechanical & plumbing scope',
  conductedBy: `${STORY.people.gcSuper}, Brightline · Alison Park, Kestrel Design Group`,
  preparedBy: `${STORY.people.foreman}, Foreman`,
  items: [
    [
      'L1 · Exam 104',
      'Diffuser D-12 not aligned with ceiling grid; reset and re-seal',
      'Sheet metal',
      'Med',
      'Complete',
      '11/05',
      '11/13',
      '11/06',
      'T. Okafor',
    ],
    [
      'L1 · Corridor 100',
      'Fire-caulk missing at 4" waste penetration above ceiling, grid B-4',
      'Plumbing',
      'High',
      'Complete',
      '11/05',
      '11/09',
      '11/06',
      'T. Okafor',
    ],
    [
      'L1 · Restroom 108',
      'Lavatory L-2 faucet loose; tighten mounting nuts and re-seal deck',
      'Plumbing',
      'Low',
      'Complete',
      '11/05',
      '11/13',
      '11/09',
      'T. Okafor',
    ],
    [
      'L1 · Mech room 115',
      'Label hydronic piping and valve tags per spec 23 05 53',
      'Piping',
      'Med',
      'Ready for Review',
      '11/05',
      '11/13',
      '11/11',
      '',
    ],
    [
      'L2 · Exam 210',
      'Thermostat T-210 reads 4°F high; recalibrate and verify against reference',
      'Controls',
      'Med',
      'Open',
      '11/05',
      '11/13',
      '',
      '',
    ],
    [
      'L2 · Corridor 200',
      'Duct insulation torn at VAV-2-3; repair and restore vapor barrier',
      'Insulation',
      'Low',
      'Complete',
      '11/05',
      '11/13',
      '11/10',
      'T. Okafor',
    ],
    [
      'L2 · Procedure 214',
      'Return grille RG-14 rattles at high speed; add gasket and re-secure',
      'Sheet metal',
      'Low',
      'Open',
      '11/05',
      '11/13',
      '',
      '',
    ],
    [
      'Roof · RTU-2',
      'Condensate trap missing; install per detail 3 / M-501 and prime',
      'Piping',
      'High',
      'Ready for Review',
      '11/05',
      '11/09',
      '11/09',
      '',
    ],
    [
      'Roof · RTU-4',
      'Seal curb-to-unit flashing at NW corner; water test',
      'Sheet metal',
      'High',
      'Complete',
      '11/05',
      '11/09',
      '11/06',
      'T. Okafor',
    ],
    [
      'L2 · Restroom 208',
      'Water closet WC-4 runs; replace flush valve diaphragm',
      'Plumbing',
      'Med',
      'Open',
      '11/05',
      '11/13',
      '',
      '',
    ],
    [
      'L1 · Mech room 115',
      'AHU-3 condensate drain (CO-003): add cleanout and label per M-402 Rev. 2',
      'Piping',
      'Med',
      'Ready for Review',
      '11/05',
      '11/13',
      '11/11',
      '',
    ],
    [
      'L2 · Above ceiling D-7',
      'Hanger missing on 6" duct run; add support at 8 ft o.c.',
      'Sheet metal',
      'High',
      'Open',
      '11/05',
      '11/09',
      '',
      '',
    ],
  ].map(([loc, item, trade, pri, status, noted, due, done, verified], i) => ({
    n: i + 1,
    loc,
    item,
    trade,
    pri,
    status,
    noted,
    due,
    done,
    verified,
  })),
};
const count = (status) => SAMPLE.items.filter((i) => i.status === status).length;

/** Landscape compact header: the kit's fillable variant stacks the company
 *  fields vertically (~100px); on a landscape log that costs six rows, so the
 *  blank form lays the three company fields out in one row instead. */
function logHeader({ company, title, subtitle, fillable }) {
  if (!fillable) return H.compactHeader({ company, title, subtitle });
  const right = `<div class="row" style="gap:12px;width:470px;align-items:flex-end">${H.field({ name: 'co.name', label: 'Your company', flex: 1.3 })}${H.field({ name: 'co.line1', label: 'Address', flex: 1.2 })}${H.field({ name: 'co.line2', label: 'Phone · license no.', flex: 1 })}</div>`;
  return `<div class="hdr hdr-compact"><div class="col grow"><span class="title">${H.esc(title)}</span>${subtitle ? `<span class="sub">${H.esc(subtitle)}</span>` : ''}</div>${right}</div><div class="hdr-compact-rule"></div>`;
}

// ---------------------------------------------------------------------------
// PDF (landscape)
// ---------------------------------------------------------------------------
export function html({ sample }) {
  const s = sample ? SAMPLE : null;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const columns = [
    { key: 'n', label: '#', width: 22, align: 'center', mono: true },
    { key: 'loc', label: 'Location / room', width: 104 },
    { key: 'item', label: 'Item — what is wrong and what fixes it' },
    { key: 'trade', label: 'Trade / responsible', width: 86 },
    { key: 'pri', label: 'Priority', width: 46, align: 'center' },
    { key: 'status', label: 'Status', width: 84 },
    { key: 'noted', label: 'Noted', width: 44, align: 'center', mono: true },
    { key: 'due', label: 'Due', width: 44, align: 'center', mono: true },
    { key: 'done', label: 'Completed', width: 56, align: 'center', mono: true },
    { key: 'verified', label: 'Verified by', width: 70 },
  ];
  const rows = s
    ? s.items.map((i) => ({
        cells: {
          n: String(i.n),
          loc: i.loc,
          item: i.item,
          trade: i.trade,
          pri: i.pri,
          status: i.status,
          noted: i.noted,
          due: i.due,
          done: i.done,
          verified: i.verified,
        },
      }))
    : [];

  const page = `
${logHeader({
  company,
  title: 'Punch list',
  subtitle: s
    ? `${s.number} · walk of ${s.date} · status as of ${s.statusDate}`
    : 'Items noted at the walk-through, closed only when verified',
  fillable: !sample,
})}
<div style="margin-top:12px">
${H.metaRow([
  {
    label: 'Project',
    lines: [
      { text: s ? SAMPLE_PROJECT.name : '', strong: true, field: 'project.name' },
      { text: s ? `${SAMPLE_PROJECT.number} · ${SAMPLE_GC.name}` : '', field: 'project.number' },
      { text: s ? SAMPLE_PROJECT.address : '', field: 'project.address' },
    ],
  },
  {
    label: 'Punch walk',
    lines: [
      { text: s ? s.area : '', strong: true, field: 'walk.area' },
      { text: s ? `Conducted by ${s.conductedBy}` : '', field: 'walk.conducted_by' },
      { text: s ? `Prepared by ${s.preparedBy}` : '', field: 'walk.prepared_by' },
    ],
  },
  {
    label: 'Status',
    kv: [
      {
        k: 'List no. / walk date',
        v: s ? `${s.number} · ${s.date}` : '',
        field: 'walk.number',
        mono: true,
      },
      { k: 'Items on list', v: s ? String(s.items.length) : '', field: 'counts.total', mono: true },
      { k: 'Open', v: s ? String(count('Open')) : '', field: 'counts.open', mono: true },
      {
        k: 'Ready for review',
        v: s ? String(count('Ready for Review')) : '',
        field: 'counts.ready',
        mono: true,
      },
      {
        k: 'Complete',
        v: s ? String(count('Complete')) : '',
        field: 'counts.complete',
        mono: true,
        strong: true,
      },
    ],
  },
])}
</div>
${H.table({
  columns,
  rows,
  blankRows: sample ? 0 : BLANK_ROWS,
  fieldPrefix: 'item',
  variant: 'grid compact',
  rowHeight: 19,
})}
<p class="micro ink3" style="margin-top:6px">Priority: High = safety, water or weather exposure, or blocks another trade · Med = must close before final · Low = cosmetic. Status: Open → Ready for Review (fixed, awaiting verification) → Complete (verified by the GC, owner or architect).</p>
${H.signatures({
  title:
    'Sign-off — an item is Complete only when the verifier initials it; the list is closed when every item shows Complete',
  parties: [
    {
      name: 'Contractor',
      sub: s ? SAMPLE_COMPANY.name : 'your company',
      fields: [
        { label: 'Signature', name: 'sig.contractor' },
        {
          label: 'Printed name and title',
          name: 'sig.contractor_name',
          value: s ? `${STORY.people.foreman}, Foreman` : '',
        },
        { label: 'Date', name: 'sig.contractor_date', value: s ? '11/12/2026' : '' },
      ],
    },
    {
      name: 'Verified for GC / owner',
      sub: s ? SAMPLE_GC.name : 'superintendent, owner or architect',
      fields: [
        { label: 'Signature', name: 'sig.verifier' },
        {
          label: 'Printed name and title',
          name: 'sig.verifier_name',
          value: s ? `${STORY.people.gcSuper}, Superintendent` : '',
        },
        { label: 'Date', name: 'sig.verifier_date', value: s ? '' : '' },
      ],
    },
  ],
})}
${H.finePrint('General-purpose form, not legal advice. Your contract defines substantial completion, who prepares the punch list and how long you have to close it — follow those terms. Keep the verified list with your certificate of substantial completion and final pay application.')}`;

  const doc = H.document({
    title: meta.name,
    pages: [page],
    landscape: true,
    css: `.sig{margin-top:10px;padding-top:7px}.sig .parties{margin-top:8px}.sig .party .who{margin-bottom:8px}.sig .line .sp{height:18px}.sig .under{margin-top:6px}.micro.ink3{margin-top:10px}`,
    footer: H.footerText(`${meta.docName} · ${s ? s.number : 'PL-____'}`),
  });
  return { sections: [{ html: doc, mode: 'pages', landscape: true }] };
}

// ---------------------------------------------------------------------------
// Word (portrait)
// ---------------------------------------------------------------------------
export async function docx() {
  const W = D.CONTENT_W;
  const children = [
    ...D.companyHeader({
      title: 'Punch List',
      number: 'List no. ________',
      date: 'Walk date ____________',
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
        label: 'Punch walk',
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
        { label: 'Area / floors walked', width: Math.round(W * 0.4) },
        { label: 'Conducted by (GC / owner / architect)', width: Math.round(W * 0.35) },
        { label: 'Prepared by', width: W - Math.round(W * 0.4) - Math.round(W * 0.35) },
      ],
      [
        { label: 'Items on list', width: Math.round(W * 0.25) },
        { label: 'Open', width: Math.round(W * 0.25) },
        { label: 'Ready for review', width: Math.round(W * 0.25) },
        { label: 'Complete', width: W - 3 * Math.round(W * 0.25) },
      ],
    ]),
    D.heading(
      'Punch items',
      'one row per item — location first, then what is wrong and what fixes it'
    ),
    D.table({
      columns: [
        { label: '#', width: 400, align: 'center' },
        { label: 'Location / room', width: 1500 },
        { label: 'Item', width: 3280 },
        { label: 'Trade / responsible', width: 1300 },
        { label: 'Pri', width: 700, align: 'center' },
        { label: 'Status', width: 1100 },
        { label: 'Noted', width: 900, align: 'center' },
        { label: 'Done', width: 900, align: 'center' },
      ],
      blankRows: 12,
      blankHeight: 300,
    }),
    D.p(
      'Priority: High = safety, water or weather exposure, or blocks another trade · Med = must close before final · Low = cosmetic. Status: Open → Ready for Review → Complete (verified). Write the verifier’s initials and the date next to Done when an item is verified.',
      { size: 8, color: D.C.ink3, before: 80, after: 0 }
    ),
    D.spacer(4),
    D.fieldGrid([
      [
        { label: 'Contractor — signature', width: Math.round(W * 0.35) },
        { label: 'Date', width: Math.round(W * 0.15) },
        { label: 'Verified for GC / owner — signature', width: Math.round(W * 0.35) },
        { label: 'Date', width: W - 2 * Math.round(W * 0.35) - Math.round(W * 0.15) },
      ],
    ]),
    D.fine(
      'General-purpose form, not legal advice. Your contract defines substantial completion, who prepares the punch list and how long you have to close it — follow those terms. Attach photos of each item where you can; keep the verified list with your certificate of substantial completion and final pay application.'
    ),
  ];
  return D.document({ title: meta.name, children, footerCenter: 'Punch list' });
}

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------
export async function xlsx() {
  const wb = X.workbook({ title: meta.name });
  const ws = X.sheet(wb, 'Punch List', { landscape: true, fitHeight: 0, printTitles: '10:10' });
  const COLS = 12;
  X.widths(ws, [5, 18, 44, 16, 9, 17, 12, 12, 13, 9, 14, 26]);
  let r = X.titleBlock(ws, {
    title: 'Punch List',
    subtitle:
      'One row per item. Pick the status from the dropdown — the counts, days open and the overdue flag calculate from it.',
    cols: COLS,
    right: 'Print: landscape, one page wide',
    rightFrom: 10,
  });
  X.inputLegend(ws, r, 1);
  r += 2;
  const metaTop = r;
  X.kv(ws, r, 1, 'Project', null, { labelTo: 2, to: 3 });
  X.kv(ws, r, 4, 'Walk date', null, { labelTo: 5, to: 6, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Area / floors walked', null, { labelTo: 2, to: 3 });
  X.kv(ws, r, 4, 'Status date (blank = today)', null, { labelTo: 5, to: 6, numFmt: X.FMT.date });
  const STATUS_DATE = `$F$${r}`;
  r++;
  X.kv(ws, r, 1, 'Prepared by', null, { labelTo: 2, to: 3 });
  X.kv(ws, r, 4, 'Conducted with (GC / architect)', null, { labelTo: 5, to: 6 });
  r += 2;

  const head = r;
  X.headerRow(
    ws,
    head,
    [
      '#',
      'Location / room',
      'Item — what is wrong and what fixes it',
      'Trade / responsible',
      'Priority',
      'Status',
      'Date noted',
      'Due',
      'Date completed',
      'Days open',
      'Verified by',
      'Notes / photo ref.',
    ],
    {
      aligns: [
        'center',
        'left',
        'left',
        'left',
        'center',
        'left',
        'center',
        'center',
        'center',
        'right',
        'left',
        'left',
      ],
    }
  );
  const first = head + 1;
  const last = first + XLSX_ROWS - 1;
  const asOf = `IF(${STATUS_DATE}<>"",${STATUS_DATE},TODAY())`;
  for (let i = 0; i < XLSX_ROWS; i++) {
    const row = first + i;
    X.bodyRow(
      ws,
      row,
      [
        { value: i + 1, align: 'center', color: X.C.ink3 },
        { input: true, wrap: true },
        { input: true, wrap: true },
        { input: true },
        { input: true, align: 'center' },
        { input: true },
        { input: true, numFmt: X.FMT.date, align: 'center' },
        { input: true, numFmt: X.FMT.date, align: 'center' },
        { input: true, numFmt: X.FMT.date, align: 'center' },
        {
          formula: `IF(OR(C${row}="",G${row}=""),"",IF(I${row}<>"",I${row},${asOf})-G${row})`,
          numFmt: '0',
          align: 'right',
        },
        { input: true },
        { input: true, wrap: true },
      ],
      { height: 18 }
    );
  }
  X.dropdown(ws, `E${first}:E${last}`, PRIORITIES);
  X.dropdown(ws, `F${first}:F${last}`, STATUSES);
  X.statusColors(ws, `F${first}:F${last}`, {
    Complete: 'FFE6F4EA',
    'Ready for Review': 'FFE3ECFF',
    Open: 'FFFFF7E6',
  });
  X.statusColors(ws, `E${first}:E${last}`, { High: 'FFFDE8E6' });
  // overdue: due date passed and not complete
  ws.addConditionalFormatting({
    ref: `H${first}:H${last}`,
    rules: [
      {
        type: 'expression',
        priority: 1,
        formulae: [`AND($H${first}<>"",$F${first}<>"Complete",$H${first}<${asOf})`],
        style: {
          font: { color: { argb: X.C.deduct }, bold: true },
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE8E6' } },
        },
      },
    ],
  });
  X.totalRow(ws, last + 1, [
    { value: '' },
    { value: 'Totals' },
    { formula: `"Items on list: "&COUNTA(C${first}:C${last})`, align: 'left' },
    {},
    { formula: `COUNTIF(E${first}:E${last},"High")&" high"`, align: 'center' },
    { formula: `COUNTIF(F${first}:F${last},"Complete")&" complete"`, align: 'left' },
    {},
    {
      formula: `COUNTIFS(H${first}:H${last},"<"&${asOf},F${first}:F${last},"<>Complete")&" overdue"`,
      align: 'center',
    },
    {},
    {
      formula: `IF(COUNT(J${first}:J${last})=0,"",ROUND(AVERAGE(J${first}:J${last}),0))`,
      numFmt: '0',
      align: 'right',
    },
    { value: 'avg days', align: 'left' },
    {},
  ]);
  ws.getCell(last + 1, 11).font = {
    name: X.FONT,
    size: 8,
    italic: true,
    color: { argb: X.C.ink3 },
  };

  // ---- live counts, top right ----
  const counts = [
    ['Open', `COUNTIF(F${first}:F${last},"Open")`],
    ['Ready for review', `COUNTIF(F${first}:F${last},"Ready for Review")`],
    ['Complete', `COUNTIF(F${first}:F${last},"Complete")`],
  ];
  const counts2 = [
    ['Items on list', `COUNTA(C${first}:C${last})`, '0'],
    [
      'High priority open',
      `COUNTIFS(E${first}:E${last},"High",F${first}:F${last},"<>Complete")`,
      '0',
    ],
    [
      '% closed',
      `IF(COUNTA(C${first}:C${last})=0,"",COUNTIF(F${first}:F${last},"Complete")/COUNTA(C${first}:C${last}))`,
      '0%',
    ],
  ];
  counts.forEach(([lab, f], i) => {
    const row = metaTop + i;
    X.text(ws, row, 8, lab, { size: 9, color: X.C.ink2 });
    ws.getCell(row, 8).alignment = { vertical: 'middle' };
    X.calc(ws, row, 9, f, { numFmt: '0', bold: true, align: 'right' });
  });
  counts2.forEach(([lab, f, fmt], i) => {
    const row = metaTop + i;
    X.text(ws, row, 11, lab, { size: 9, color: X.C.ink2 });
    ws.getCell(row, 11).alignment = { vertical: 'middle' };
    X.calc(ws, row, 12, f, { numFmt: fmt, bold: i === 2, align: 'left' });
  });
  ws.views = [{ state: 'frozen', xSplit: 3, ySplit: head, showGridLines: false }];
  r = last + 3;
  X.noteRow(
    ws,
    r,
    'Status must be exactly Open, Ready for Review or Complete (use the dropdown) — the counts depend on it. Days open runs from the date noted to the completed date, or to the status date (today if blank) while the item is open. A red due date is overdue.',
    COLS,
    { height: 30 }
  );
  r += 2;
  X.brandFooter(
    ws,
    r,
    COLS,
    'Free template by BuildWorkPro — buildworkpro.com/templates. General-purpose form, not legal advice; your contract defines substantial completion and how punch items are closed.'
  );
  ws.pageSetup.printArea = `A1:L${r}`;

  X.howToSheet(wb, {
    title: 'Punch List Template',
    steps: [
      'Fill in the project, the walk date and who conducted the walk. Set a status date if you are reporting as of a specific day; leave it blank to count days open to today.',
      'Add one row per item: location first (floor · room · grid), then a description that says what is wrong and what fixes it, and the trade or person responsible.',
      'Set a priority — High for safety, water or weather exposure or anything blocking another trade — and a due date. The row turns red when a due date passes without the item marked Complete.',
      'Update the status from the dropdown as items move: Open → Ready for Review once fixed → Complete only after the GC, owner or architect verifies it. Record the verifier by name.',
      'Watch the counts at the top: items on list, open, ready for review, complete, high-priority open and % closed all update live. Sort or filter by trade to hand each sub exactly their items.',
      'When every item reads Complete, print the list (landscape, one page wide) and file it with your certificate of substantial completion and final pay application.',
    ],
    tips: [
      'Walk your own punch before the official one. Items you find and close yourself never appear on the GC’s list.',
      'Photograph every item when it is noted and again when it is fixed — a before/after pair ends most arguments about whether an item was really closed.',
      'Require a verifier other than the person who did the fix. Items that get re-opened three times are the ones nobody checked.',
      'Retainage release usually waits on a closed punch list. Every open item is money you have already earned and cannot collect yet.',
    ],
    feature: {
      text: 'In BuildWorkPro, project tasks and punch items carry photos, assignees, priorities and status inside the project record, visible to the office and the field — and closeout sits next to the change orders and pay applications for the same job.',
      url: 'https://buildworkpro.com/features/project-management/',
    },
  });
  return wb;
}
