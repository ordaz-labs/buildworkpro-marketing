// Application and Certificate for Payment (G702/G703 style) — a portrait
// application page plus a landscape continuation sheet (fillable PDF), and a
// three-sheet Excel workbook with the retainage math wired end to end. Mirrors
// the pay application the main app renders (server/lib/pdf/documents/pay-app.tsx).
//
// Local helpers (no kit equivalent): appLines() for the numbered 1–9 block with
// 5a/5b retainage sub-lines, coSummary() for the additions/deductions table,
// continuationTable() for the lettered A–I schedule with a grouped
// "Work completed" head, and the sigLine()/notary()/progress() blocks.
import * as H from '../kit/html.mjs';
import * as X from '../kit/xlsx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_OWNER, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';

export const meta = {
  slug: 'aia-g702-g703',
  name: 'Pay Application Template',
  basename: 'pay-application-template-g702-g703-style',
  docName: 'Application and certificate for payment',
};

const FOOTER_CENTER = 'Formatted to standard progress-billing conventions. Not an AIA document.';

const CERTIFICATION =
  'I certify that the work covered by this application has been completed as described on the continuation sheet, that amounts previously certified have been paid, and that the current payment shown is now due.';
const CERTIFICATE =
  'Based on the data comprising this application and the attached continuation sheet, the amount certified is payable to the contractor named above, subject to the terms of the contract.';
const CERT_NOTE_1 =
  'This certificate is not a negotiable instrument. The amount certified is payable only to the contractor named on this application.';
const CERT_NOTE_2 =
  'Issuing this certificate, making payment, and accepting payment do not waive any rights of the owner or the contractor under the contract.';

const round2 = (n) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Sample: application no. 3, August 2026, on the STORY job. Previous = work
// billed on applications 1–2 (June–July); this period = August; stored =
// RTUs and controllers delivered to site but not yet set.
// ---------------------------------------------------------------------------
const PROGRESS = {
  1: { d: 14600, e: 0, f: 0 },
  2: { d: 38400, e: 0, f: 0 },
  3: { d: 31680, e: 15840, f: 0 },
  4: { d: 42840, e: 12240, f: 0 },
  5: { d: 0, e: 24125, f: 38600 },
  6: { d: 17740, e: 26610, f: 0 },
  7: { d: 0, e: 8260, f: 0 },
  8: { d: 0, e: 0, f: 6720 },
  9: { d: 0, e: 3780, f: 0 },
  10: { d: 0, e: 0, f: 0 },
  11: { d: 0, e: 0, f: 0 },
  12: { d: 0, e: 0, f: 0 },
};

/** Change orders approved on or before the application date (CO-003 is approved Sept 16 — not yet). */
const APPROVED_COS = STORY.changeOrders.filter((co) => co.n !== 'CO-003');

export const SAMPLE_ROWS = [
  ...STORY.sov.map((l) => ({ n: l.n, desc: l.desc, c: l.value, ...PROGRESS[l.n] })),
  ...APPROVED_COS.map((co) => ({
    n: co.n,
    desc: co.desc,
    c: co.amount,
    d: co.amount,
    e: 0,
    f: 0,
    co: true,
  })),
];

export function computePayApp(rows, rate) {
  const t = rows.reduce((a, r) => ({ c: a.c + r.c, d: a.d + r.d, e: a.e + r.e, f: a.f + r.f }), {
    c: 0,
    d: 0,
    e: 0,
    f: 0,
  });
  const coAdds = APPROVED_COS.filter((co) => co.amount > 0).reduce((s, co) => s + co.amount, 0);
  const coDeds = APPROVED_COS.filter((co) => co.amount < 0).reduce(
    (s, co) => s + Math.abs(co.amount),
    0
  );
  const net = coAdds - coDeds;
  const revised = STORY.contractSum + net;
  const g = t.d + t.e + t.f;
  const retWork = round2((t.d + t.e) * (rate / 100));
  const retStored = round2(t.f * (rate / 100));
  const retainage = round2(retWork + retStored);
  const earned = round2(g - retainage);
  const previousCerts = round2(t.d * (1 - rate / 100));
  const due = round2(earned - previousCerts);
  const balance = round2(revised - earned);
  return {
    totals: t,
    coAdds,
    coDeds,
    net,
    revised,
    g,
    retWork,
    retStored,
    retainage,
    earned,
    previousCerts,
    due,
    balance,
    pct: t.c ? (g / t.c) * 100 : 0,
    remaining: t.c - g,
  };
}

const RATE = STORY.retainagePct;
const PA = STORY.payApp;
export const PAY_APP_SAMPLE = {
  number: PA.number,
  date: PA.date,
  periodFrom: PA.periodFrom,
  periodTo: PA.periodTo,
  rate: RATE,
  ...computePayApp(SAMPLE_ROWS, RATE),
};

if (Math.abs(SAMPLE_ROWS.reduce((s, r) => s + r.c, 0) - PAY_APP_SAMPLE.revised) > 0.005)
  throw new Error('aia-g702-g703: sample scheduled values do not foot to the contract sum to date');

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------
const CSS = `
.g7{display:flex;flex-direction:column;margin-top:5px}
.g7r{display:flex;align-items:flex-start;gap:6px;padding:3px 0;border-bottom:1px dotted var(--rule)}
.g7r.sub{padding-left:16px}
.g7r .n{width:16px;flex-shrink:0;font-family:"IBM Plex Mono";font-size:7.5px;font-weight:700;color:var(--ink2);padding-top:1px}
.g7r .lb{display:flex;flex-direction:column;flex:1;min-width:0;font-size:8.5px;line-height:1.3}
.g7r.sub .lb{font-size:7.5px}
.g7r .hint{font-size:6.5px;color:var(--ink3);margin-top:1px}
.g7r .amt{width:96px;flex-shrink:0;text-align:right;font-size:8.5px;font-weight:500;min-height:11px;font-family:"IBM Plex Mono"}
.g7r.strong .lb>span:first-child,.g7r.strong .amt{font-weight:700}
.g7r.due{border:1.5px solid var(--ink);background:var(--band);padding:5px 6px;margin:3px 0}
.g7r.due .amt{font-size:10.5px;font-weight:700}
.g7r .rate{display:inline-block;min-width:22px;border-bottom:1px solid var(--ink);text-align:center;font-family:"IBM Plex Mono";font-size:8px}
.hd{font-size:8px;letter-spacing:.9px;text-transform:uppercase;font-weight:700;color:var(--ink);margin:10px 0 3px}
.hd.first{margin-top:0}
.intro{font-size:7.5px;color:var(--ink2);line-height:1.4;margin-bottom:2px}
table.co{width:100%;border-collapse:collapse;font-size:7.5px;margin-top:4px}
table.co th,table.co td{border:1px solid var(--ink);padding:4px 6px;vertical-align:top}
table.co th{background:var(--band);font-weight:600;text-align:left;font-size:7.5px}
table.co th.right,table.co td.right{text-align:right;font-family:"IBM Plex Mono";white-space:nowrap}
table.co td.num{min-height:10px}
table.co tr.tot td{font-weight:600}
table.co tr.net td{font-weight:700}
table.co .conums{display:block;font-family:"IBM Plex Mono";color:var(--ink3);font-size:6.5px;margin-top:2px}
.sl{display:flex;flex-direction:column;flex:1;min-width:0}
.sl .sp{border-bottom:1px solid var(--ink);height:20px;font-size:9px;display:flex;align-items:flex-end;padding-bottom:2px}
.sl .sp.script{font-style:italic;color:var(--ink2)}
.sl .lab{font-size:6.5px;color:var(--ink3);margin-top:2px}
.sigrow{display:flex;gap:16px;margin-top:10px}
.notary{display:flex;flex-direction:column;margin-top:12px;border:1px solid var(--ink);padding:6px 8px}
.notary .ln{display:flex;gap:12px;margin-top:4px;font-size:7.5px;color:var(--ink2)}
.notary .ln span{flex:1;display:flex;gap:4px;align-items:flex-end}
.notary .ln .bx{flex:1;border-bottom:1px solid var(--ink);min-height:11px}
.notary .body{font-size:7px;color:var(--ink2);line-height:1.35;margin-top:6px}
.notary .body .bx{display:inline-block;border-bottom:1px solid var(--ink);min-width:34px;height:9px;vertical-align:bottom}
.notary .body .bx.w{min-width:80px}
.certbox{display:flex;flex-direction:column;margin-top:8px;border:1.5px solid var(--ink);padding:8px 10px}
.certbox .amt{font-size:16px;font-weight:700;font-family:"IBM Plex Mono";margin-top:4px;min-height:19px}
.certnote{font-size:6.3px;color:var(--ink3);line-height:1.35;margin-top:5px}
.prog{display:flex;flex-direction:column;margin-top:12px;border:1px solid var(--rule);padding:6px 8px}
.prog .row3{display:flex;justify-content:space-between;margin-top:4px;font-size:7.5px}
.prog .row3>div{display:flex;flex-direction:column}
.prog .row3 .v{font-family:"IBM Plex Mono";font-weight:600;margin-top:2px;min-height:10px}
.prog .bar{height:5px;background:var(--band2);margin-top:6px;display:flex}
.prog .bar>div{height:5px;background:var(--accent)}
table.cs{width:100%;table-layout:fixed;border-collapse:collapse;margin-top:8px;font-size:8px}
table.cs th{background:var(--band);border-bottom:1px solid var(--ink2);border-right:1px solid var(--rule);padding:3px 4px;vertical-align:bottom;font-weight:600;color:var(--ink2)}
table.cs th:last-child,table.cs td:last-child{border-right:none}
table.cs th.work{background:var(--band2)}
table.cs th.grp{border-bottom:none;padding:2px 4px;height:14px}
table.cs th.grp.work{text-align:center;font-size:7px;font-weight:700;letter-spacing:.6px}
table.cs th .lt{display:block;font-family:"IBM Plex Mono";font-size:9px;font-weight:700;line-height:1.1}
table.cs th .lb{display:block;font-size:6.8px;letter-spacing:.4px;text-transform:uppercase;margin-top:1px;line-height:1.25}
table.cs th .cap{display:block;font-size:6.3px;color:var(--ink3);font-weight:400;margin-top:1px}
table.cs td{padding:3px 4px;border-bottom:1px solid var(--rule);border-right:1px solid var(--rule);vertical-align:top;font-size:8px;height:21px}
table.cs td.num{font-family:"IBM Plex Mono";white-space:nowrap;text-align:right}
table.cs td.n{font-family:"IBM Plex Mono";text-align:center}
table.cs tr.total td{border-top:2px solid var(--ink);border-bottom:1px solid var(--ink);background:var(--band);font-weight:700;padding:5px 4px}
table.cs .cotag{font-size:6.5px;letter-spacing:.4px;font-weight:700;padding:0 4px;border:1px solid var(--ink);border-radius:2px;font-family:"IBM Plex Mono";margin-left:5px}
`;

const hd = (text, first = false) => `<div class="hd${first ? ' first' : ''}">${H.esc(text)}</div>`;

function sigLine({ label, name, value, width, script = false }) {
  return `<div class="sl"${width ? ` style="flex:none;width:${width}px"` : ''}><div class="sp${script ? ' script' : ''}"${name ? ` data-field="${name}"` : ''}>${value ? H.esc(value) : ''}</div><span class="lab">${H.esc(label)}</span></div>`;
}

/** Numbered application lines 1–9 with 5a/5b. lines = [{ n, label (html ok), hint, amount, sub, strong, due, field }] */
function appLines(lines) {
  return `<div class="g7">${lines
    .map((l) => {
      const cls = ['g7r', l.due ? 'due' : '', l.sub ? 'sub' : '', l.strong || l.due ? 'strong' : '']
        .filter(Boolean)
        .join(' ');
      return `<div class="${cls}"><span class="n">${H.esc(l.n ?? '')}</span><div class="lb"><span>${l.label}</span>${l.hint ? `<span class="hint">${H.esc(l.hint)}</span>` : ''}</div>${l.amount != null ? `<span class="amt"${l.field ? ` data-field="${l.field}"` : ''}>${H.esc(l.amount)}</span>` : ''}</div>`;
    })
    .join('')}</div>`;
}

function coSummary(s, fillable) {
  const cell = (v, name) =>
    `<td class="right num"${fillable && name ? ` data-field="${name}"` : ''}>${v != null ? H.esc(v) : ''}</td>`;
  const m = (n) => (s ? H.money(n) : null);
  const thisNums = s ? '' : '';
  return `<table class="co"><thead><tr><th>Change orders approved by owner / GC</th><th class="right" style="width:72px">Additions</th><th class="right" style="width:72px">Deductions</th></tr></thead><tbody>
<tr><td>Total approved in previous months</td>${cell(m(s ? s.coAdds : 0), 'co.prev_add')}${cell(m(s ? s.coDeds : 0), 'co.prev_ded')}</tr>
<tr><td>Total approved this month${s ? `<span class="conums">none this period</span>` : `<span class="conums"${fillable ? ' data-field="co.this_numbers" style="min-height:9px"' : ''}>&nbsp;</span>`}${thisNums}</td>${cell(m(0), 'co.this_add')}${cell(m(0), 'co.this_ded')}</tr>
<tr class="tot"><td>Totals</td>${cell(m(s ? s.coAdds : 0), 'co.tot_add')}${cell(m(s ? s.coDeds : 0), 'co.tot_ded')}</tr>
<tr class="net"><td>Net change by change orders</td><td colspan="2" class="right num"${fillable ? ' data-field="co.net"' : ''}>${s ? H.esc(H.money(s.net)) : ''}</td></tr>
</tbody></table>`;
}

function notary() {
  return `<div class="notary">${hd('Notary acknowledgment (optional)', true)}
<div class="ln"><span>State of <span class="bx" data-field="notary.state"></span></span><span>County of <span class="bx" data-field="notary.county"></span></span></div>
<div class="body">Subscribed and sworn to (or affirmed) before me on this <span class="bx" data-field="notary.day"></span> day of <span class="bx w" data-field="notary.month"></span>, 20<span class="bx" style="min-width:20px" data-field="notary.year"></span>, by the above-named contractor, personally known to me or identified by satisfactory evidence to be the person whose signature appears on this application for payment.</div>
<div class="sigrow">${sigLine({ label: 'Notary public — signature', name: 'notary.sig' })}${sigLine({ label: 'Printed name', name: 'notary.name' })}</div>
<div class="ln" style="justify-content:space-between;margin-top:6px"><span>My commission expires <span class="bx" data-field="notary.expires"></span></span><span class="ink3" style="flex:none">[Affix notary seal]</span></div>
</div>`;
}

function progress(s, fillable) {
  const f = (name) => (fillable ? ` data-field="${name}"` : '');
  const bar = s ? Math.max(0, Math.min(100, s.pct)) : 0;
  return `<div class="prog">${hd('Progress', true)}
<div class="row3"><div><span class="label">Complete %</span><span class="v"${f('prog.pct')}>${s ? H.pct(s.pct, 1) : ''}</span></div><div style="align-items:center"><span class="label">This period</span><span class="v"${f('prog.this')}>${s ? H.money(s.totals.e) : ''}</span></div><div style="align-items:flex-end"><span class="label">Remaining</span><span class="v"${f('prog.remaining')}>${s ? H.money(s.remaining) : ''}</span></div></div>
<div class="bar"><div style="width:${bar}%"></div></div></div>`;
}

const CS_COLS = [
  { key: 'n', letter: 'A', label: 'Item no.', align: 'center', width: 46 },
  { key: 'desc', letter: 'B', label: 'Description of work', align: 'left' },
  { key: 'c', letter: 'C', label: 'Scheduled value', align: 'right', width: 84 },
  {
    key: 'd',
    letter: 'D',
    label: 'From previous applications',
    caption: 'D + E of prior',
    align: 'right',
    width: 82,
    work: true,
  },
  { key: 'e', letter: 'E', label: 'This period', align: 'right', width: 76, work: true },
  {
    key: 'f',
    letter: 'F',
    label: 'Materials presently stored',
    caption: 'not in D or E',
    align: 'right',
    width: 82,
  },
  {
    key: 'g',
    letter: 'G',
    label: 'Total completed & stored',
    caption: 'D + E + F',
    align: 'right',
    width: 86,
  },
  { key: 'h', letter: 'H', label: '%', caption: 'G ÷ C', align: 'right', width: 46 },
  {
    key: 'i',
    letter: 'I',
    label: 'Balance to finish',
    caption: 'C − G',
    align: 'right',
    width: 84,
  },
  { key: 'r', letter: '', label: 'Retainage', caption: '', align: 'right', width: 78 },
];

/** Lettered A–I continuation table with a grouped "Work completed" head over D and E. */
function continuationTable({ rows, blankRows, totals, fillable, rateCaption }) {
  const cols = CS_COLS.map((c) => (c.key === 'r' ? { ...c, caption: rateCaption } : c));
  const grp = cols
    .map((c) => {
      if (c.letter === 'E') return '';
      if (c.work)
        return `<th class="grp work" colspan="2" style="width:${c.width + cols.find((x) => x.letter === 'E').width}px">WORK COMPLETED</th>`;
      return `<th class="grp"${c.width ? ` style="width:${c.width}px"` : ''}>&nbsp;</th>`;
    })
    .join('');
  const head = cols
    .map(
      (c) =>
        `<th class="${c.work ? 'work' : ''}" style="text-align:${c.align}${c.width ? `;width:${c.width}px` : ''}">${c.letter ? `<span class="lt">${c.letter}</span>` : ''}<span class="lb">${H.esc(c.label)}</span>${c.caption ? `<span class="cap">${H.esc(c.caption)}</span>` : '<span class="cap">&nbsp;</span>'}</th>`
    )
    .join('');
  const td = (c, v, field, extra = '') => {
    const cls = c.key === 'n' ? 'n' : c.key === 'desc' ? '' : 'num';
    return `<td class="${cls}"${field ? ` data-field="${field}"` : ''}${extra}>${v ?? ''}</td>`;
  };
  const body = rows
    .map(
      (r) =>
        `<tr>${cols
          .map((c) => {
            if (c.key === 'desc')
              return td(
                c,
                `${H.esc(r.desc)}${r.co ? `<span class="cotag">${H.esc(r.n)}</span>` : ''}`
              );
            if (c.key === 'n') return td(c, H.esc(r.n));
            if (c.key === 'h') return td(c, H.esc(H.pct(r.h, 1)));
            return td(c, H.esc(H.money(r[c.key])));
          })
          .join('')}</tr>`
    )
    .join('');
  let blanks = '';
  for (let i = 1; i <= blankRows; i++)
    blanks += `<tr>${cols.map((c) => td(c, '', fillable ? `sov.${i}.${c.key}` : null)).join('')}</tr>`;
  const tot = `<tr class="total">${cols
    .map((c) => {
      if (c.key === 'n') return td(c, '&nbsp;');
      if (c.key === 'desc') return td(c, 'Grand total');
      const v = totals ? (c.key === 'h' ? H.pct(totals.h, 1) : H.money(totals[c.key])) : '';
      return td(c, H.esc(v), fillable ? `sov.total.${c.key}` : null);
    })
    .join('')}</tr>`;
  return `<table class="cs"><thead><tr>${grp}</tr><tr>${head}</tr></thead><tbody>${body}${blanks}${tot}</tbody></table>`;
}

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------
export function html({ sample }) {
  const s = sample ? PAY_APP_SAMPLE : null;
  const fillable = !sample;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const f = (name) => (fillable ? name : undefined);
  const rateHtml = s ? `${s.rate}` : `<span class="rate" data-field="pa.rate">&nbsp;</span>`;

  const cells = [
    {
      label: 'To (owner / GC)',
      value: s ? SAMPLE_GC.name : '',
      sub: s ? SAMPLE_GC.line1 : '',
      field: f('to.name'),
      subField: f('to.address'),
    },
    {
      label: 'Project',
      value: s ? SAMPLE_PROJECT.name : '',
      sub: s ? SAMPLE_PROJECT.address : '',
      field: f('project.name'),
      subField: f('project.address'),
    },
    {
      label: 'Application no.',
      value: s ? s.number : '',
      field: f('app.number'),
      kv: [
        { k: 'Period from', v: s ? s.periodFrom : '', field: f('app.period_from') },
        { k: 'Period to', v: s ? s.periodTo : '', field: f('app.period_to') },
      ],
    },
    {
      label: 'Distribution to',
      boxes: [
        { label: 'Owner', on: !!s, name: f('dist.owner') },
        { label: 'Architect', on: false, name: f('dist.architect') },
        { label: 'Contractor', on: !!s, name: f('dist.contractor') },
        { label: 'Field', on: false, name: f('dist.field') },
        { label: 'Other', on: false, name: f('dist.other') },
      ],
    },
    {
      label: 'From (contractor)',
      value: s ? SAMPLE_COMPANY.name : '',
      sub: s ? SAMPLE_COMPANY.line1 : '',
      field: f('from.name'),
      subField: f('from.address'),
    },
    {
      label: 'Via architect / engineer',
      value: s ? 'Kestrel Design Group · Alison Park' : '',
      sub: s ? 'Owner: ' + SAMPLE_OWNER.name : '',
      field: f('architect.name'),
      subField: f('architect.ref'),
    },
    {
      label: 'Contract',
      kv: [
        { k: 'Contract date', v: s ? STORY.contractDate : '', field: f('contract.date') },
        { k: 'Contract for', v: s ? 'Mechanical, Bldg B' : '', field: f('contract.for') },
        { k: 'Project no.', v: s ? SAMPLE_PROJECT.number : '', field: f('project.number') },
      ],
    },
    {
      label: 'Application',
      kv: [
        { k: 'Application date', v: s ? s.date : '', field: f('app.date') },
        { k: 'Submitted by', v: s ? STORY.people.pm : '', field: f('app.submitted_by') },
      ],
    },
  ];

  const m = (n) => (s ? H.money(n) : '');
  const lines = [
    { n: '1', label: 'Original contract sum', amount: m(STORY.contractSum), field: f('pa.1') },
    { n: '2', label: 'Net change by change orders', amount: m(s?.net), field: f('pa.2') },
    {
      n: '3',
      label: 'Contract sum to date',
      hint: 'Line 1 + 2',
      amount: m(s?.revised),
      strong: true,
      field: f('pa.3'),
    },
    {
      n: '4',
      label: 'Total completed and stored to date',
      hint: 'Column G on the continuation sheet (D + E + F)',
      amount: m(s?.g),
      field: f('pa.4'),
    },
    { n: '5', label: `Retainage (${rateHtml}%)` },
    {
      label: `a. ${rateHtml}% of completed work (columns D + E)`,
      amount: m(s?.retWork),
      sub: true,
      field: f('pa.5a'),
    },
    {
      label: `b. ${rateHtml}% of stored material (column F)`,
      amount: m(s?.retStored),
      sub: true,
      field: f('pa.5b'),
    },
    {
      label: 'Total retainage (a + b)',
      amount: m(s?.retainage),
      sub: true,
      strong: true,
      field: f('pa.5'),
    },
    {
      n: '6',
      label: 'Total earned less retainage',
      hint: 'Line 4 − 5',
      amount: m(s?.earned),
      field: f('pa.6'),
    },
    {
      n: '7',
      label: 'Less previous certificates for payment',
      hint: 'Line 6 of the previous application',
      amount: m(s?.previousCerts),
      field: f('pa.7'),
    },
    {
      n: '8',
      label: 'Current payment due',
      hint: 'Line 6 − 7',
      amount: m(s?.due),
      due: true,
      field: f('pa.8'),
    },
    {
      n: '9',
      label: 'Balance to finish, including retainage',
      hint: 'Line 3 − 6',
      amount: m(s?.balance),
      strong: true,
      field: f('pa.9'),
    },
  ];

  const page1 = `
${H.compactHeader({
  company,
  title: 'Application and Certificate for Payment',
  subtitle: 'Progress billing · Continuation sheet attached (page 2)',
  fillable,
})}
${H.formCells(cells)}
${H.split(
  `${hd("Contractor's application for payment")}<div class="intro">The contractor applies for payment as shown below for work completed and materials presently stored through the period to date.</div>${appLines(lines)}`,
  `${hd('Change order summary')}${coSummary(s, fillable)}${progress(s, fillable)}`,
  [1.15, 1],
  18
)}
${H.split(
  `${hd("Contractor's certification")}<div class="intro">${H.esc(CERTIFICATION)}</div>
<div class="sigrow">${sigLine({ label: 'Contractor — signature', name: f('sig.contractor'), script: true })}${sigLine({ label: 'Printed name and title', name: f('sig.contractor_name'), value: s ? `${STORY.people.pm}, Project Manager` : '' })}${sigLine({ label: 'Date', name: f('sig.contractor_date'), value: s ? '09/03/2026' : '', width: 70 })}</div>
${notary()}`,
  `${hd('Certificate for payment')}<div class="intro">${H.esc(CERTIFICATE)}</div>
<div class="certbox"><span class="label">Amount certified</span><span class="amt"${fillable ? ' data-field="cert.amount"' : ''}>${s ? H.esc(H.money(s.due)) : ''}</span></div>
<div class="certnote">${H.esc(CERT_NOTE_1)}</div><div class="certnote">${H.esc(CERT_NOTE_2)}</div>
<div class="sigrow">${sigLine({ label: 'Authorized signer (owner / GC / architect)', name: f('cert.sig'), script: true })}${sigLine({ label: 'Date', name: f('cert.date'), width: 70 })}</div>
<div class="sigrow" style="margin-top:8px">${sigLine({ label: 'Printed name and title', name: f('cert.name') })}</div>`,
  [1.15, 1],
  18
)}
${H.finePrint('Formatted to standard progress-billing conventions. Not an AIA document — confirm with your general contractor which form they require. Column letters (C, D, E, F, G) refer to the continuation sheet. Retainage, stored-material and certification terms follow your contract.')}`;

  const csRows = s
    ? SAMPLE_ROWS.map((r) => {
        const g = r.d + r.e + r.f;
        return { ...r, g, h: r.c ? (g / r.c) * 100 : 0, i: r.c - g, r: round2(g * (RATE / 100)) };
      })
    : [];
  const csTotals = s
    ? {
        c: s.totals.c,
        d: s.totals.d,
        e: s.totals.e,
        f: s.totals.f,
        g: s.g,
        h: s.pct,
        i: s.remaining,
        r: s.retainage,
      }
    : null;

  const page2 = `
<div class="hdr hdr-compact"><div class="col grow"><span class="title">Continuation Sheet</span><span class="sub">Schedule of values · Application and certificate for payment${s ? ` · ${H.esc(SAMPLE_COMPANY.name)}` : ''}</span></div></div><div class="hdr-compact-rule"></div>
${H.fieldRow(
  [
    H.field({
      name: f('cs.app_number'),
      label: 'Application no.',
      value: s ? s.number : '',
      width: 90,
    }),
    H.field({
      name: f('cs.app_date'),
      label: 'Application date',
      value: s ? s.date : '',
      width: 130,
    }),
    H.field({
      name: f('cs.period_to'),
      label: 'Period to',
      value: s ? s.periodTo : '',
      width: 120,
    }),
    H.field({
      name: f('cs.project'),
      label: 'Project',
      value: s ? `${SAMPLE_PROJECT.name} · ${SAMPLE_PROJECT.number}` : '',
      flex: 1.6,
    }),
    H.field({
      name: f('cs.to'),
      label: 'To (owner / GC)',
      value: s ? SAMPLE_GC.name : '',
      flex: 1,
    }),
    H.field({
      name: f('cs.rate'),
      label: 'Retainage rate',
      value: s ? `${s.rate}%` : '',
      width: 92,
    }),
  ],
  14
)}
${continuationTable({
  rows: csRows,
  blankRows: s ? 0 : 22,
  totals: csTotals,
  fillable,
  rateCaption: s ? `${s.rate}% of G` : 'rate × G',
})}
${H.note(
  '<b>Roll forward.</b> On the next application, column D = this application’s D + E; column E starts at zero; material that was stored (F) and has since been installed leaves F and is billed in E. The grand total of column G is line 4 on page 1, and the retainage total is line 5.'
)}`;

  const footer = { left: H.brandLine(), center: FOOTER_CENTER };
  return {
    sections: [
      {
        html: H.document({
          title: meta.name,
          pages: [page1],
          css: CSS,
          footer,
          pageStart: 1,
          pageTotal: 2,
        }),
        mode: 'pages',
        landscape: false,
        footer,
      },
      {
        html: H.document({
          title: meta.name,
          pages: [page2],
          css: CSS,
          landscape: true,
          footer,
          pageStart: 2,
          pageTotal: 2,
        }),
        mode: 'pages',
        landscape: true,
        footer,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------
const CS_HDR = 7; // header row of the Continuation Sheet (asserted when built)
const CS_ROWS = 22;
const CS_FIRST = CS_HDR + 1;
const CS_LAST = CS_FIRST + CS_ROWS - 1;
const CS_TOTAL = CS_LAST + 1;
const CS = "'Continuation Sheet'";

export async function xlsx() {
  const wb = X.workbook({ title: meta.name, subject: 'Application and certificate for payment' });

  // ---- Sheet 1: Pay Application ----
  const ws = X.sheet(wb, 'Pay Application', { fitHeight: 1 });
  X.widths(ws, [34, 13, 13, 17, 13, 17]);
  let r = X.titleBlock(ws, {
    title: 'Application and Certificate for Payment',
    subtitle:
      'Progress billing summary. Lines 4 to 9 compute from the Continuation Sheet; the retainage rate on line 5 drives every line.',
    cols: 6,
    right: 'Not an AIA document · Print: fits one page',
    rightFrom: 4,
  });
  X.inputLegend(ws, r, 1);
  r += 2;

  X.label(ws, r, 1, 'From (contractor — your company)');
  X.label(ws, r, 4, 'Application');
  r++;
  X.kv(ws, r, 1, 'Company', null, { to: 3 });
  X.kv(ws, r, 4, 'Application no.', null, { to: 6 });
  const appNoRow = r;
  r++;
  X.kv(ws, r, 1, 'Address', null, { to: 3 });
  X.kv(ws, r, 4, 'Period from', null, { to: 6, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Phone · email · license', null, { to: 3 });
  X.kv(ws, r, 4, 'Period to', null, { to: 6, numFmt: X.FMT.date });
  const periodToRow = r;
  r += 2;
  X.label(ws, r, 1, 'To (owner / general contractor)');
  X.label(ws, r, 4, 'Project');
  r++;
  X.kv(ws, r, 1, 'Company', null, { to: 3 });
  X.kv(ws, r, 4, 'Project name', null, { to: 6 });
  r++;
  X.kv(ws, r, 1, 'Address', null, { to: 3 });
  X.kv(ws, r, 4, 'Site address', null, { to: 6 });
  r++;
  X.kv(ws, r, 1, 'Contact', null, { to: 3 });
  X.kv(ws, r, 4, 'Project no.', null, { to: 6 });
  r += 2;
  X.label(ws, r, 1, 'Contract');
  X.label(ws, r, 4, 'Certification');
  r++;
  X.kv(ws, r, 1, 'Contract date', null, { to: 3, numFmt: X.FMT.date });
  X.kv(ws, r, 4, 'Application date', null, { to: 6, numFmt: X.FMT.date });
  r++;
  X.kv(ws, r, 1, 'Contract for', null, { to: 3 });
  X.kv(ws, r, 4, 'Submitted by', null, { to: 6 });
  r++;
  X.kv(ws, r, 1, 'Via architect / engineer', null, { to: 3 });
  X.kv(ws, r, 4, 'Distribution to', null, { to: 6 });
  X.dropdown(ws, `E${r}:F${r}`, ['Owner', 'Architect', 'Contractor', 'Field', 'Other']);
  r += 2;

  X.sectionRow(ws, r, "Contractor's application for payment", 6);
  r++;
  X.text(
    ws,
    r,
    1,
    'The contractor applies for payment as shown below for work completed and materials presently stored through the period to date.',
    { merge: 6, size: 8.5, italic: true, color: X.C.ink2, wrap: true }
  );
  ws.getRow(r).height = 26;
  r++;

  const line = (n, lab, { hint, input, formula, bold, numFmt = X.FMT.money, sub, dflt } = {}) => {
    X.text(ws, r, 1, sub ? `        ${lab}` : `${n}.  ${lab}`, {
      merge: 3,
      bold: !!bold,
      size: sub ? 9 : 10,
      color: sub && !bold ? X.C.ink2 : X.C.ink,
    });
    if (hint)
      X.text(ws, r, 4, hint, { merge: 5, size: 8, italic: true, color: X.C.ink3, align: 'right' });
    if (input) X.input(ws, r, 6, dflt ?? null, { numFmt, align: 'right', bold: !!bold });
    else X.calc(ws, r, 6, formula, { numFmt, bold: !!bold });
    ws.getCell(r, 6).border = { bottom: { style: 'thin', color: { argb: X.C.rule } } };
    if (input) ws.getCell(r, 6).border.bottom = { style: 'thin', color: { argb: X.C.ink3 } };
    ws.getRow(r).height = sub ? 16 : 19;
    return r++;
  };
  const L1 = line('1', 'Original contract sum', { input: true });
  const L2 = line('2', 'Net change by change orders', {
    hint: 'net of the change order summary below',
    formula: '0',
  });
  const L3 = line('3', 'Contract sum to date', {
    hint: 'Line 1 + 2',
    formula: `F${L1}+F${L2}`,
    bold: true,
  });
  const L4 = line('4', 'Total completed and stored to date', {
    hint: 'Continuation Sheet, column G total (D + E + F)',
    formula: `${CS}!G${CS_TOTAL}`,
  });
  const L5 = line('5', 'Retainage rate — edit; applies to every line', {
    input: true,
    numFmt: X.FMT.pct,
    dflt: 0.1,
  });
  const L5a = line('', 'a. Retainage on completed work (columns D + E)', {
    sub: true,
    formula: `ROUND((${CS}!D${CS_TOTAL}+${CS}!E${CS_TOTAL})*F${L5},2)`,
  });
  const L5b = line('', 'b. Retainage on stored material (column F)', {
    sub: true,
    formula: `ROUND(${CS}!F${CS_TOTAL}*F${L5},2)`,
  });
  const L5t = line('', 'Total retainage (a + b)', {
    sub: true,
    bold: true,
    formula: `F${L5a}+F${L5b}`,
  });
  const L6 = line('6', 'Total earned less retainage', {
    hint: 'Line 4 − 5',
    formula: `F${L4}-F${L5t}`,
  });
  const L7 = line('7', 'Less previous certificates for payment', {
    hint: 'enter line 6 of your previous application (0 on application no. 1)',
    input: true,
  });
  const L8 = line('8', 'Current payment due', {
    hint: 'Line 6 − 7',
    formula: `F${L6}-F${L7}`,
    bold: true,
  });
  ws.getCell(L8, 6).border = {
    top: { style: 'medium', color: { argb: X.C.ink } },
    bottom: { style: 'medium', color: { argb: X.C.ink } },
    left: { style: 'medium', color: { argb: X.C.ink } },
    right: { style: 'medium', color: { argb: X.C.ink } },
  };
  ws.getCell(L8, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: X.C.band } };
  line('9', 'Balance to finish, including retainage', {
    hint: 'Line 3 − 6',
    formula: `F${L3}-F${L6}`,
    bold: true,
  });
  r++;

  X.sectionRow(ws, r, 'Change order summary', 6);
  r++;
  X.headerRow(
    ws,
    r,
    ['Change orders approved by owner / GC', '', '', '', 'Additions', 'Deductions'],
    {
      aligns: ['left', 'left', 'left', 'left', 'right', 'right'],
    }
  );
  r++;
  const coPrev = r;
  X.bodyRow(ws, r, [
    { value: 'Total approved in previous months' },
    {},
    {},
    {},
    { input: true, numFmt: X.FMT.moneyBlank },
    { input: true, numFmt: X.FMT.moneyBlank },
  ]);
  r++;
  const coThis = r;
  X.bodyRow(ws, r, [
    { value: 'Total approved this month' },
    { input: true, wrap: true },
    {},
    {},
    { input: true, numFmt: X.FMT.moneyBlank },
    { input: true, numFmt: X.FMT.moneyBlank },
  ]);
  ws.mergeCells(r, 2, r, 4);
  X.text(ws, r + 1, 2, 'list the CO numbers approved this period in the amber cell above', {
    merge: 4,
    size: 7.5,
    italic: true,
    color: X.C.ink3,
  });
  r += 2;
  const coTot = r;
  X.totalRow(ws, r, [
    { value: '' },
    { value: 'Totals' },
    {},
    {},
    { formula: `SUM(E${coPrev}:E${coThis})`, numFmt: X.FMT.money },
    { formula: `SUM(F${coPrev}:F${coThis})`, numFmt: X.FMT.money },
  ]);
  r++;
  X.text(ws, r, 1, 'Net change by change orders (additions − deductions) → line 2', {
    merge: 4,
    bold: true,
  });
  X.calc(ws, r, 6, `E${coTot}-F${coTot}`, { numFmt: X.FMT.money, bold: true });
  ws.getCell(r, 6).border = { bottom: { style: 'thin', color: { argb: X.C.rule } } };
  const coNet = r;
  ws.getCell(L2, 6).value = { formula: `F${coNet}` };
  r += 2;

  X.sectionRow(ws, r, "Contractor's certification", 6);
  r++;
  X.noteRow(ws, r, CERTIFICATION, 6, { height: 32 });
  r += 2;
  r = X.signatureBlock(ws, r, ['Contractor', 'Certified by (owner / general contractor)'], {
    cols: [1, 4],
    width: 3,
  });
  X.brandFooter(
    ws,
    r,
    6,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Formatted to standard progress-billing conventions. Not an AIA document — confirm with your general contractor which form they require.'
  );
  ws.pageSetup.printArea = `A1:F${r}`;

  // ---- Sheet 2: Continuation Sheet ----
  const cs = X.sheet(wb, 'Continuation Sheet', {
    landscape: true,
    fitHeight: 1,
    printTitles: `${CS_HDR}:${CS_HDR}`,
  });
  X.widths(cs, [9, 42, 14, 14, 14, 14, 15, 8, 14, 13]);
  let c = X.titleBlock(cs, {
    title: 'Continuation Sheet',
    subtitle:
      'Schedule of values — one row per line item. Columns G to J calculate; the retainage rate comes from line 5 of the Pay Application sheet.',
    cols: 10,
    right: 'Print: landscape, one page wide',
    rightFrom: 8,
  });
  X.inputLegend(cs, c, 1);
  X.text(cs, c, 6, 'Application no.', { size: 9, color: X.C.ink2, align: 'right' });
  X.calc(cs, c, 7, `IF('Pay Application'!E${appNoRow}="","",'Pay Application'!E${appNoRow})`, {
    align: 'left',
    bold: true,
  });
  X.text(cs, c, 9, 'Period to', { size: 9, color: X.C.ink2, align: 'right' });
  X.calc(
    cs,
    c,
    10,
    `IF('Pay Application'!E${periodToRow}="","",'Pay Application'!E${periodToRow})`,
    {
      numFmt: X.FMT.date,
      align: 'left',
    }
  );
  c++;
  X.text(cs, c, 6, 'Retainage rate', { size: 9, color: X.C.ink2, align: 'right' });
  X.calc(cs, c, 7, `'Pay Application'!F${L5}`, { numFmt: X.FMT.pct, align: 'left' });
  X.text(cs, c, 9, 'Contract sum to date', { size: 9, color: X.C.ink2, align: 'right' });
  X.calc(cs, c, 10, `'Pay Application'!F${L3}`, { numFmt: X.FMT.money, align: 'left' });
  c += 2;
  if (c !== CS_HDR)
    throw new Error(`Continuation Sheet header landed on row ${c}, expected ${CS_HDR}`);
  X.headerRow(
    cs,
    c,
    [
      'A\nItem no.',
      'B\nDescription of work',
      'C\nScheduled value',
      'D\nFrom previous applications (D + E of prior)',
      'E\nThis period',
      'F\nMaterials presently stored (not in D or E)',
      'G\nTotal completed & stored to date (D + E + F)',
      'H\n% (G ÷ C)',
      'I\nBalance to finish (C − G)',
      'Retainage (rate × G)',
    ],
    {
      height: 48,
      aligns: [
        'center',
        'left',
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
  c++;
  const rate = `'Pay Application'!$F$${L5}`;
  for (let i = 0; i < CS_ROWS; i++) {
    X.bodyRow(cs, c, [
      { input: true, align: 'center' },
      { input: true, wrap: true },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: X.FMT.moneyBlank },
      { input: true, numFmt: X.FMT.moneyBlank },
      { formula: `IF($C${c}="","",D${c}+E${c}+F${c})`, numFmt: X.FMT.moneyBlank },
      { formula: `IF(OR($C${c}="",$C${c}=0),"",G${c}/C${c})`, numFmt: X.FMT.pctBlank },
      { formula: `IF($C${c}="","",C${c}-G${c})`, numFmt: X.FMT.moneyBlank },
      { formula: `IF($C${c}="","",ROUND(G${c}*${rate},2))`, numFmt: X.FMT.moneyBlank },
    ]);
    c++;
  }
  if (c !== CS_TOTAL) throw new Error('Continuation Sheet total row drifted');
  X.totalRow(cs, c, [
    { value: '' },
    { value: 'Grand total' },
    { formula: `SUM(C${CS_FIRST}:C${CS_LAST})`, numFmt: X.FMT.money },
    { formula: `SUM(D${CS_FIRST}:D${CS_LAST})`, numFmt: X.FMT.money },
    { formula: `SUM(E${CS_FIRST}:E${CS_LAST})`, numFmt: X.FMT.money },
    { formula: `SUM(F${CS_FIRST}:F${CS_LAST})`, numFmt: X.FMT.money },
    { formula: `SUM(G${CS_FIRST}:G${CS_LAST})`, numFmt: X.FMT.money },
    { formula: `IF(C${c}=0,"",G${c}/C${c})`, numFmt: X.FMT.pctBlank },
    { formula: `SUM(I${CS_FIRST}:I${CS_LAST})`, numFmt: X.FMT.money },
    { formula: `SUM(J${CS_FIRST}:J${CS_LAST})`, numFmt: X.FMT.money },
  ]);
  c++;
  X.text(cs, c, 2, 'Tie-out: column C total − contract sum to date (must be 0.00)', {
    merge: 9,
    align: 'right',
    size: 9,
    color: X.C.ink2,
  });
  X.calc(cs, c, 10, `C${CS_TOTAL}-'Pay Application'!F${L3}`, { numFmt: X.FMT.money });
  cs.addConditionalFormatting({
    ref: `J${c}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'notEqual',
        formulae: ['0'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE8E6' } },
          font: { color: { argb: X.C.deduct }, bold: true },
        },
        priority: 1,
      },
    ],
  });
  c += 2;
  X.noteRow(
    cs,
    c,
    "Roll forward to the next application: once this application is approved, add each row's This Period (E) into From Previous Applications (D) as a value and clear E. Material that was stored (F) and has since been installed leaves F and is billed in E. Then change the application number and period dates on the Pay Application sheet, and enter this application's line 6 on the new line 7.",
    10,
    { height: 44 }
  );
  c += 2;
  X.brandFooter(
    cs,
    c,
    10,
    'Free template by BuildWorkPro — buildworkpro.com/templates. Column G is line 4 on the Pay Application; the retainage total is line 5. Change orders become new rows — use the CO number as the item number.'
  );
  cs.views = [{ state: 'frozen', ySplit: CS_HDR, showGridLines: false }];
  cs.pageSetup.printArea = `A1:J${c}`;

  X.howToSheet(wb, {
    title: 'Pay Application Template',
    steps: [
      'Fill in the header on the Pay Application sheet: your company, the owner or GC you bill, the project, and the application number and billing period. Amber cells are inputs.',
      'Enter line 1, the original contract sum. Line 2 comes from the change order summary lower on the sheet — enter approved change orders as additions and deductions, split between previous months and this month.',
      'Set the retainage rate on line 5 (10% is the default; 5% is common; some contracts step down after 50% complete). It drives the retainage column on the Continuation Sheet and lines 5a, 5b, 6 and 8.',
      'On the Continuation Sheet, list your schedule of values — one row per line item, scheduled value in column C. The tie-out cell under the grand total must read 0.00: the scheduled values have to add up to the contract sum to date.',
      'Each billing period enter This Period (E) and Materials Presently Stored (F) per row. Columns G to J, the grand total, and lines 4 to 9 calculate. Line 7 is the one number you type in from last period: its line 6.',
      'Print both sheets (each fits one page), sign the certification, and send. Then roll forward: D = D + E, clear E, update F, bump the application number, and enter last period’s line 6 on line 7.',
    ],
    tips: [
      'Keep the item numbers identical to your schedule of values and add approved change orders as new rows with the CO number as the item number — the GC traces every dollar back to a signed document.',
      'Stored materials need backup: invoices, a bill of sale or delivery ticket, and proof of insurance on the stored items. Bill them in F only until they are installed, then move them to E.',
      'Line 8 is what you get paid. If the GC certifies a different amount, the difference is what to reconcile before the next application — do not let it drift.',
    ],
    feature: {
      text: 'In BuildWorkPro the schedule of values prefills from your accepted bid and approved change orders, previous applications lock and carry forward automatically, retainage is a field on every pay app, and the PDF emails to your GC from the app.',
      url: 'https://buildworkpro.com/features/pay-applications/',
    },
  });
  return wb;
}
