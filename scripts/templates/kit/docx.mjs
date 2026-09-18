// Word kit (docx). Same grammar as the PDF kit: title block with accent rule,
// uppercase micro labels, band table heads, rule borders, signature tables,
// page-numbered footer. Fonts: Arial (universal) — Word cannot rely on Plex.
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  Footer,
  PageNumber,
  VerticalAlign,
  TableLayoutType,
  HeightRule,
  LevelFormat,
  PageBreak,
  Tab,
  TabStopType,
} from 'docx';
import fs from 'node:fs/promises';
import { INK, INPUT_FILL, BRAND, ACCENT } from './tokens.mjs';

const h = (c) => c.replace('#', '').toUpperCase();
export const C = {
  ink: h(INK.ink),
  ink2: h(INK.ink2),
  ink3: h(INK.ink3),
  rule: h(INK.rule),
  band: h(INK.band),
  band2: h(INK.band2),
  input: INPUT_FILL,
  accent: h(ACCENT),
  add: h(INK.add),
  deduct: h(INK.deduct),
};
export const FONT = 'Arial';
const TW = 1440; // twips per inch
export const CONTENT_W = Math.round(8.5 * TW - 2 * 0.75 * TW); // 7in content width in twips

const border = (color = C.rule, size = 4, style = BorderStyle.SINGLE) => ({ style, size, color });
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
export const noBorders = {
  top: NONE,
  bottom: NONE,
  left: NONE,
  right: NONE,
  insideHorizontal: NONE,
  insideVertical: NONE,
};
export const ruleBorders = {
  top: border(),
  bottom: border(),
  left: border(),
  right: border(),
  insideHorizontal: border(),
  insideVertical: border(),
};

// ---------- text ----------
export function run(text, o = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: (o.size ?? 10) * 2,
    bold: o.bold,
    italics: o.italic,
    color: o.color ?? C.ink,
    allCaps: o.caps,
    characterSpacing: o.spacing,
    break: o.break,
  });
}

export function p(text, o = {}) {
  const children = Array.isArray(text) ? text : [run(text, o)];
  return new Paragraph({
    children,
    alignment: o.align,
    spacing: { before: o.before ?? 0, after: o.after ?? 80, line: o.line ?? 276 },
    keepNext: o.keepNext,
    keepLines: o.keepLines,
    indent: o.indent,
    numbering: o.numbering,
    shading: o.shading,
    border: o.border,
    tabStops: o.tabStops,
  });
}

/** Uppercase micro label (like .label in the PDF kit). */
export function label(text, o = {}) {
  return p([run(text, { size: 7.5, bold: true, color: C.ink3, caps: true, spacing: 18 })], {
    after: o.after ?? 40,
    before: o.before ?? 0,
    keepNext: true,
  });
}

/** Document title block: company placeholder left is done by the caller; this is the big title + subtitle + accent rule. */
export function titleBlock({ title, subtitle, number, date }) {
  const out = [];
  const right = [number, date].filter(Boolean).join('  ·  ');
  out.push(
    new Paragraph({
      children: [
        run(title, { size: 20, bold: true }),
        ...(right
          ? [
              new TextRun({ children: [new Tab()], font: FONT }),
              run(right, { size: 10, color: C.ink2 }),
            ]
          : []),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
      spacing: { after: subtitle ? 40 : 80 },
    })
  );
  if (subtitle) out.push(p(subtitle, { size: 9, italic: true, color: C.ink2, after: 80 }));
  out.push(
    new Paragraph({
      children: [],
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.accent, space: 1 } },
      spacing: { after: 200 },
    })
  );
  return out;
}

/** Section heading: uppercase, bold, ruled underneath. */
export function heading(text, hint) {
  return new Paragraph({
    children: [
      run(text, { size: 8, bold: true, caps: true, spacing: 18 }),
      ...(hint
        ? [
            new TextRun({ children: [new Tab()], font: FONT }),
            run(hint, { size: 7.5, color: C.ink3 }),
          ]
        : []),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.ink, space: 2 } },
    spacing: { before: 240, after: 100 },
    keepNext: true,
  });
}

export function h3(text) {
  return p(text, { size: 10, bold: true, before: 120, after: 40, keepNext: true });
}

/** Numbered contract clause: "3. Subcontract Price. Body…" */
export function clause(n, title, body) {
  return new Paragraph({
    children: [
      run(`${n}.`, { bold: true, color: C.ink2 }),
      run('\t', {}),
      run(`${title}. `, { bold: true }),
      run(body),
    ],
    tabStops: [{ type: TabStopType.LEFT, position: 400 }],
    indent: { left: 400, hanging: 400 },
    spacing: { after: 120, line: 276 },
    keepLines: true,
  });
}

/** Sub-clause (a), (b)… */
export function subClause(letter, body) {
  return new Paragraph({
    children: [run(`(${letter})`, { color: C.ink2 }), run('\t'), run(body)],
    tabStops: [{ type: TabStopType.LEFT, position: 800 }],
    indent: { left: 800, hanging: 400 },
    spacing: { after: 80, line: 276 },
  });
}

/** Shaded callout with accent left border. */
export function note(text) {
  return new Paragraph({
    children: [run(text, { size: 8.5, color: C.ink2 })],
    shading: { type: ShadingType.CLEAR, fill: C.band, color: 'auto' },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: C.accent, space: 6 } },
    indent: { left: 120 },
    spacing: { before: 120, after: 120 },
  });
}

export function fine(text) {
  return p(text, { size: 7.5, color: C.ink3, before: 160, after: 40, line: 260 });
}

export function spacer(pt = 6) {
  return new Paragraph({ children: [], spacing: { before: 0, after: pt * 20 } });
}

export function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

export function bullet(text, o = {}) {
  return new Paragraph({
    children: Array.isArray(text) ? text : [run(text, o)],
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 60, line: 276 },
  });
}

export function numbered(text, o = {}) {
  return new Paragraph({
    children: Array.isArray(text) ? text : [run(text, o)],
    numbering: { reference: 'numbers', level: 0 },
    spacing: { after: 60, line: 276 },
  });
}

export const checkbox = (text, on = false) =>
  run(`${on ? '☒' : '☐'}  ${text}`, { size: 9.5, color: C.ink2 });

// ---------- tables ----------
const cellMargins = { top: 70, bottom: 70, left: 100, right: 100 };

function cell(children, o = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [children],
    width: o.width ? { size: o.width, type: WidthType.DXA } : undefined,
    columnSpan: o.span,
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
    verticalAlign: o.valign ?? VerticalAlign.TOP,
    margins: o.margins ?? cellMargins,
    borders: o.borders,
  });
}

/**
 * Data table. columns = [{ label, width (twips), align }], rows = [[cell text…]] or
 * [{ cells: [...], section: 'title' | total: true | input: [bool…] }].
 * blankRows: append empty (amber) rows. Widths must sum to CONTENT_W.
 */
export function table({
  columns,
  rows = [],
  blankRows = 0,
  blankHeight = 320,
  inputs = true,
  variant = 'rule',
}) {
  const widths = columns.map((c) => c.width);
  const head = new TableRow({
    tableHeader: true,
    children: columns.map((c) =>
      cell(
        p([run(c.label, { size: 7.5, bold: true, color: C.ink2, caps: true, spacing: 16 })], {
          align: alignOf(c.align),
          after: 0,
        }),
        {
          width: c.width,
          fill: C.band,
          valign: VerticalAlign.BOTTOM,
          borders: {
            top: border(),
            bottom: border(C.ink2),
            left: variant === 'grid' ? border() : NONE,
            right: variant === 'grid' ? border() : NONE,
          },
        }
      )
    ),
  });
  const body = rows.map((r) => {
    if (r.section != null) {
      return new TableRow({
        children: [
          cell(
            p([run(r.section, { size: 8, bold: true, caps: true, spacing: 16 })], {
              after: 0,
              before: 60,
            }),
            {
              span: columns.length,
              borders: { bottom: border(C.ink, 6), left: NONE, right: NONE, top: NONE },
            }
          ),
        ],
      });
    }
    const cells = r.cells ?? r;
    const total = !!r.total;
    return new TableRow({
      cantSplit: true,
      children: cells.map((t, i) =>
        cell(
          p([run(String(t ?? ''), { size: 9.5, bold: total || (r.bold?.[i] ?? false) })], {
            align: alignOf(columns[i].align),
            after: 0,
          }),
          {
            width: widths[i],
            fill: r.input?.[i] ? C.input : undefined,
            borders: {
              top: total ? border(C.ink, 12) : variant === 'grid' ? border() : NONE,
              bottom: total ? NONE : border(),
              left: variant === 'grid' ? border() : NONE,
              right: variant === 'grid' ? border() : NONE,
            },
          }
        )
      ),
    });
  });
  const blanks = [];
  for (let i = 0; i < blankRows; i++) {
    blanks.push(
      new TableRow({
        height: { value: blankHeight, rule: HeightRule.ATLEAST },
        cantSplit: true,
        children: columns.map((c) =>
          cell(p('', { after: 0 }), {
            width: c.width,
            fill: inputs ? C.input : undefined,
            borders: {
              top: variant === 'grid' ? border() : NONE,
              bottom: border(),
              left: variant === 'grid' ? border() : NONE,
              right: variant === 'grid' ? border() : NONE,
            },
          })
        ),
      })
    );
  }
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    borders: noBorders,
    rows: [head, ...body, ...blanks],
  });
}

function alignOf(a) {
  return a === 'right'
    ? AlignmentType.RIGHT
    : a === 'center'
      ? AlignmentType.CENTER
      : AlignmentType.LEFT;
}

/**
 * Form fields laid out as a grid: rows of [{ label, value, width }]. Each cell prints the
 * uppercase label and an amber value box underneath. Widths per row must sum to CONTENT_W.
 */
export function fieldGrid(rows) {
  const trs = rows.map(
    (r) =>
      new TableRow({
        cantSplit: true,
        children: r.map((f) =>
          cell(
            [
              p([run(f.label, { size: 7, bold: true, color: C.ink3, caps: true, spacing: 16 })], {
                after: 20,
              }),
              p([run(f.value ?? '', { size: 9.5 })], {
                after: 0,
                shading: { type: ShadingType.CLEAR, fill: C.input, color: 'auto' },
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.ink3, space: 1 } },
              }),
              ...(f.lines
                ? Array.from({ length: f.lines - 1 }, () =>
                    p('', {
                      after: 0,
                      shading: { type: ShadingType.CLEAR, fill: C.input, color: 'auto' },
                      border: {
                        bottom: { style: BorderStyle.SINGLE, size: 6, color: C.ink3, space: 1 },
                      },
                    })
                  )
                : []),
            ],
            {
              width: f.width,
              borders: noBorders,
              margins: { top: 60, bottom: 100, left: 60, right: 160 },
            }
          )
        ),
      })
  );
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: noBorders,
    rows: trs,
  });
}

/** A labelled multi-line box for narrative sections. `lines` controls the box height. */
export function textBox(labelText, { lines = 4, value = '', hint } = {}) {
  const out = [label(labelText, { after: 30 })];
  if (hint) out.push(p(hint, { size: 8, italic: true, color: C.ink3, after: 30 }));
  const paras = [p(value, { after: 0, size: 9.5 })];
  for (let i = 1; i < lines; i++) paras.push(p('', { after: 0 }));
  out.push(
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
      columnWidths: [CONTENT_W],
      borders: noBorders,
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            cell(paras, {
              width: CONTENT_W,
              fill: C.input,
              borders: { top: border(), bottom: border(), left: border(), right: border() },
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
            }),
          ],
        }),
      ],
    })
  );
  out.push(spacer(4));
  return out;
}

/** Signature block for one or two parties (side by side). parties = [{ name, sub }] */
export function signatures({
  title,
  copy,
  parties,
  lines = ['Signature', 'Printed name and title', 'Date'],
}) {
  const out = [];
  out.push(
    new Paragraph({
      children: [run(title ?? 'Signatures', { size: 9.5, bold: true })],
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.ink, space: 6 } },
      spacing: { before: 280, after: copy ? 40 : 160 },
      keepNext: true,
    })
  );
  if (copy) out.push(p(copy, { size: 8.5, color: C.ink2, after: 160, keepNext: true }));
  const w = Math.floor((CONTENT_W - 400) / parties.length);
  const gap = 400;
  const cols = [];
  parties.forEach((party, i) => {
    const children = [
      p(
        [
          run(party.name, { size: 8.5, bold: true }),
          ...(party.sub ? [run(`  ·  ${party.sub}`, { size: 8.5, color: C.ink3 })] : []),
        ],
        { after: 200 }
      ),
    ];
    lines.forEach((l) => {
      children.push(
        p('', {
          after: 0,
          before: 240,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.ink, space: 1 } },
        })
      );
      children.push(
        p([run(l, { size: 7, color: C.ink3, caps: true, spacing: 14 })], { after: 60 })
      );
    });
    cols.push(
      cell(children, {
        width: w,
        borders: noBorders,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      })
    );
    if (i < parties.length - 1)
      cols.push(
        cell(p('', { after: 0 }), {
          width: gap,
          borders: noBorders,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
        })
      );
  });
  const widths = [];
  parties.forEach((_, i) => {
    widths.push(w);
    if (i < parties.length - 1) widths.push(gap);
  });
  out.push(
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: widths,
      layout: TableLayoutType.FIXED,
      borders: noBorders,
      rows: [new TableRow({ cantSplit: true, children: cols })],
    })
  );
  return out;
}

/** Key/value ladder (contract sum table etc.). rows = [{ k, v, total, input }] */
export function ladder(rows, { kWidth = 6000 } = {}) {
  const vWidth = CONTENT_W - kWidth;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [kWidth, vWidth],
    layout: TableLayoutType.FIXED,
    borders: noBorders,
    rows: rows.map(
      (r) =>
        new TableRow({
          cantSplit: true,
          children: [
            cell(
              p([run(r.k, { size: 9.5, bold: !!r.total, color: r.total ? C.ink : C.ink2 })], {
                after: 0,
              }),
              {
                width: kWidth,
                borders: {
                  top: r.total ? border(C.ink, 12) : NONE,
                  bottom: r.total ? NONE : border(),
                  left: NONE,
                  right: NONE,
                },
              }
            ),
            cell(
              p([run(r.v ?? '', { size: r.total ? 11 : 9.5, bold: !!r.total })], {
                align: AlignmentType.RIGHT,
                after: 0,
              }),
              {
                width: vWidth,
                fill: r.input ? C.input : undefined,
                borders: {
                  top: r.total ? border(C.ink, 12) : NONE,
                  bottom: r.total ? NONE : border(),
                  left: NONE,
                  right: NONE,
                },
              }
            ),
          ],
        })
    ),
  });
}

/** Two-column meta block under the title (like MetaRow): cols = [{ label, lines: [{text,bold}] }] */
export function metaRow(cols) {
  const w = Math.floor(CONTENT_W / cols.length);
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: cols.map(() => w),
    layout: TableLayoutType.FIXED,
    borders: noBorders,
    rows: [
      new TableRow({
        cantSplit: true,
        children: cols.map((c) =>
          cell(
            [
              label(c.label, { after: 30 }),
              ...c.lines.map((l) =>
                p(
                  [
                    run(l.text ?? '', {
                      size: l.bold ? 10.5 : 9,
                      bold: l.bold,
                      color: l.bold ? C.ink : C.ink2,
                    }),
                  ],
                  {
                    after: 0,
                    shading: l.input
                      ? { type: ShadingType.CLEAR, fill: C.input, color: 'auto' }
                      : undefined,
                    border: l.input
                      ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.ink3, space: 1 } }
                      : undefined,
                  }
                )
              ),
            ],
            { width: w, borders: noBorders, margins: { top: 0, bottom: 0, left: 0, right: 200 } }
          )
        ),
      }),
    ],
  });
}

// ---------- document ----------
export function document({ title, subject, children, landscape = false, footerCenter }) {
  const footer = new Footer({
    children: [
      new Paragraph({
        children: [
          run(`Free template by ${BRAND.name} · ${BRAND.domain}/templates`, {
            size: 7.5,
            color: C.ink3,
          }),
          new TextRun({ children: [new Tab()], font: FONT }),
          run(footerCenter ?? title, { size: 7.5, color: C.ink3 }),
          new TextRun({ children: [new Tab()], font: FONT }),
          run('Page ', { size: 7.5, color: C.ink3 }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 15, color: C.ink3 }),
          run(' of ', { size: 7.5, color: C.ink3 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 15, color: C.ink3 }),
        ],
        tabStops: [
          { type: TabStopType.CENTER, position: Math.round(CONTENT_W / 2) },
          { type: TabStopType.RIGHT, position: CONTENT_W },
        ],
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.rule, space: 6 } },
        spacing: { before: 0, after: 0 },
      }),
    ],
  });
  return new Document({
    creator: BRAND.name,
    title,
    subject: subject ?? title,
    description: `${title} — free construction template from ${BRAND.name} (${BRAND.templatesUrl})`,
    keywords: 'construction template, subcontractor, buildworkpro',
    styles: {
      default: { document: { run: { font: FONT, size: 20, color: C.ink } } },
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 240 } } },
            },
          ],
        },
        {
          reference: 'numbers',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 300 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: landscape
              ? { width: 15840, height: 12240, orientation: 'landscape' }
              : { width: 12240, height: 15840 },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        footers: { default: footer },
        children,
      },
    ],
  });
}

export async function write(doc, file) {
  const buf = await Packer.toBuffer(doc);
  await fs.writeFile(file, buf);
}

/** Company header table: your company (amber) left, document title right. */
export function companyHeader({ title, number, date, sample }) {
  const left = sample
    ? [
        p([run(sample.name, { size: 15, bold: true })], { after: 40 }),
        p(sample.line1, { size: 8.5, color: C.ink2, after: 0 }),
        p(sample.line2 ?? '', { size: 8.5, color: C.ink2, after: 0 }),
      ]
    : [
        p([run('Your Company Name', { size: 15, bold: true, color: C.ink3 })], {
          after: 40,
          shading: { type: ShadingType.CLEAR, fill: C.input, color: 'auto' },
        }),
        p([run('Address · City, State ZIP', { size: 8.5, color: C.ink3 })], {
          after: 0,
          shading: { type: ShadingType.CLEAR, fill: C.input, color: 'auto' },
        }),
        p([run('Phone · Email · License no.', { size: 8.5, color: C.ink3 })], {
          after: 0,
          shading: { type: ShadingType.CLEAR, fill: C.input, color: 'auto' },
        }),
      ];
  const right = [
    p([run(title, { size: 20, bold: true })], { align: AlignmentType.RIGHT, after: 40 }),
  ];
  const sub = [number, date].filter(Boolean).join('  ·  ');
  if (sub)
    right.push(
      p([run(sub, { size: 10, color: C.ink2 })], { align: AlignmentType.RIGHT, after: 0 })
    );
  const lw = Math.round(CONTENT_W * 0.55);
  return [
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [lw, CONTENT_W - lw],
      layout: TableLayoutType.FIXED,
      borders: noBorders,
      rows: [
        new TableRow({
          children: [
            cell(left, {
              width: lw,
              borders: noBorders,
              margins: { top: 0, bottom: 0, left: 0, right: 200 },
            }),
            cell(right, {
              width: CONTENT_W - lw,
              borders: noBorders,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
            }),
          ],
        }),
      ],
    }),
    new Paragraph({
      children: [],
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.accent, space: 1 } },
      spacing: { before: 120, after: 200 },
    }),
  ];
}

export {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  TabStopType,
  Tab,
};
