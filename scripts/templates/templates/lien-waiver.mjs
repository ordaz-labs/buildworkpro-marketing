// Lien waiver forms — four one-page forms in one document (conditional and
// unconditional waiver and release on progress payment; conditional and
// unconditional on final payment) as a fillable PDF and a Word document.
// General forms for states WITHOUT a statutory lien waiver form; the twelve
// statutory-form states are named in the fine print of every form.
//
// Sample: the progress forms are filled for application for payment no. 3
// ($122,557.50, through August 31, 2026, retention and CO-003 carved out); the
// final forms for the closeout payment that releases retainage on the same job.
import * as H from '../kit/html.mjs';
import * as D from '../kit/docx.mjs';
import { SAMPLE_COMPANY, SAMPLE_GC, SAMPLE_OWNER, SAMPLE_PROJECT, STORY } from '../kit/tokens.mjs';
import { PAY_APP_SAMPLE } from './aia-g702-g703.mjs';

export const meta = {
  slug: 'lien-waiver',
  name: 'Lien Waiver Forms',
  basename: 'lien-waiver-forms',
  docName: 'Lien waiver',
};

const STATUTORY_STATES =
  'California, Texas, Arizona, Nevada, Utah, Georgia, Florida, Massachusetts, Michigan, Missouri, Mississippi and Wyoming';

const round2 = (n) => Math.round(n * 100) / 100;
const FINAL_CONTRACT = STORY.contractSum + STORY.changeOrders.reduce((s, co) => s + co.amount, 0);
const FINAL_PAYMENT = round2(FINAL_CONTRACT * (STORY.retainagePct / 100));
const CO3 = STORY.changeOrders[2];

export const FORMS = [
  {
    key: 'f1',
    n: 1,
    kind: 'progress',
    conditional: true,
    title: 'Conditional Waiver and Release on Progress Payment',
    effect: 'Takes effect only when the payment described below has cleared',
  },
  {
    key: 'f2',
    n: 2,
    kind: 'progress',
    conditional: false,
    title: 'Unconditional Waiver and Release on Progress Payment',
    effect: 'Takes effect when signed — sign only after the payment has cleared your account',
  },
  {
    key: 'f3',
    n: 3,
    kind: 'final',
    conditional: true,
    title: 'Conditional Waiver and Release on Final Payment',
    effect: 'Takes effect only when the final payment described below has cleared',
  },
  {
    key: 'f4',
    n: 4,
    kind: 'final',
    conditional: false,
    title: 'Unconditional Waiver and Release on Final Payment',
    effect:
      'Takes effect when signed — sign only after every dollar, retention included, has cleared',
  },
];

const PROGRESS_SAMPLE = {
  through: PAY_APP_SAMPLE.periodTo,
  amount: PAY_APP_SAMPLE.due,
  reference: `Application for payment no. ${PAY_APP_SAMPLE.number}`,
  retention: PAY_APP_SAMPLE.retainage,
  pending: CO3.amount,
  disputed: 0,
  exceptions: `${CO3.n} (${CO3.desc}, ${H.money(CO3.amount)}) submitted August 28, 2026 and not yet approved as of this waiver. Retention of ${H.money(PAY_APP_SAMPLE.retainage)} withheld through application no. ${PAY_APP_SAMPLE.number} remains due.`,
  signedConditional: '09/03/2026',
  signedUnconditional: '10/02/2026',
};

const FINAL_SAMPLE = {
  through: 'November 30, 2026',
  amount: FINAL_PAYMENT,
  reference: 'Final application for payment no. 6 — release of retention',
  disputed: 0,
  exceptions: 'None. All approved change orders (CO-001 through CO-003) have been paid in full.',
  signedConditional: '12/04/2026',
  signedUnconditional: '01/08/2027',
};

/** Waiver language for each form. Plain English, modeled on common conditional/unconditional forms; not a statutory form. */
function waiverText(form) {
  if (form.kind === 'progress' && form.conditional)
    return [
      'On receipt by the claimant of a check from the customer named above in the payment amount stated above, payable to the claimant, and when the check has been properly endorsed and has been paid by the bank on which it is drawn, this document becomes effective to release any mechanics lien, stop payment notice or payment bond right the claimant has on the job of the owner named above, located at the project stated above, to the following extent.',
      'This release covers a progress payment for labor, services, equipment or materials furnished to the customer through the through date stated above only, and does not cover any retention, any pending change orders or extras, any disputed items, or any labor, services, equipment or materials furnished after that date, as listed under exceptions below. Before any recipient of this document relies on it, that person should verify evidence of payment to the claimant.',
    ];
  if (form.kind === 'progress' && !form.conditional)
    return [
      'The claimant has been paid and has received a progress payment in the payment amount stated above for labor, services, equipment or materials furnished to the customer named above on the job of the owner named above, located at the project stated above, and does hereby release any mechanics lien, stop payment notice or payment bond right the claimant has on the job to the following extent.',
      'This release covers a progress payment for all labor, services, equipment or materials furnished to the customer through the through date stated above only, and does not cover any retention, any pending change orders or extras, any disputed items, or any labor, services, equipment or materials furnished after that date, as listed under exceptions below.',
    ];
  if (form.kind === 'final' && form.conditional)
    return [
      'On receipt by the claimant of a check from the customer named above in the payment amount stated above, payable to the claimant, and when the check has been properly endorsed and has been paid by the bank on which it is drawn, this document becomes effective to release any mechanics lien, stop payment notice or payment bond right the claimant has on the job of the owner named above, located at the project stated above.',
      'This release covers the final payment to the claimant for all labor, services, equipment or materials furnished on the job, including all retention, except for the disputed claims for additional work listed under exceptions below. Before any recipient of this document relies on it, that person should verify evidence of payment to the claimant.',
    ];
  return [
    'The claimant has been paid in full for all labor, services, equipment or materials furnished to the customer named above on the job of the owner named above, located at the project stated above, including all retention, and does hereby waive and release any right to a mechanics lien, stop payment notice or any right against a payment bond on the job, except for the disputed claims for additional work listed under exceptions below.',
    'The claimant further represents that it has paid, or will pay from the proceeds of this payment, every subcontractor, supplier and laborer who furnished labor, services, equipment or materials to the claimant for this job.',
  ];
}

const NOTICE =
  'NOTICE TO CLAIMANT: This document waives and releases lien, stop payment notice and payment bond rights unconditionally and states that you have been paid for giving up those rights. It is enforceable against you if you sign it, even if you have not been paid. If you have not been paid, use a conditional waiver and release form.';

const FINE_DOCX = `General form for use where no statutory lien waiver form is prescribed; in ${STATUTORY_STATES} use the statutory form and verify it is current. Not legal advice — have a construction attorney licensed in the project's state review before relying on it.`;

const FINE = `General form for use where no statutory lien waiver form is prescribed. Twelve states prescribe the form and wording of lien waivers by statute — ${STATUTORY_STATES} — and a waiver on this form may be ineffective there; use the form in the statute or from the state agency and verify it is the current version. Not legal advice. Lien law, notice deadlines and waiver rules differ by state; have a construction attorney licensed in the project's state review before relying on this form.`;

const CSS = `
.hd{font-size:8px;letter-spacing:.9px;text-transform:uppercase;font-weight:700;color:var(--ink);margin:12px 0 4px;padding-bottom:3px;border-bottom:1px solid var(--ink)}
.hd .hint{float:right;font-size:7.5px;letter-spacing:0;text-transform:none;font-weight:400;color:var(--ink3)}
.wt{font-size:9px;line-height:1.5;color:var(--ink);margin-top:6px}
.wt p+p{margin-top:5px}
.notice{border:1.5px solid var(--ink);padding:6px 9px;margin-top:8px;font-size:8px;line-height:1.45;font-weight:600}
.sl{display:flex;flex-direction:column;flex:1;min-width:0}
.sl .sp{border-bottom:1px solid var(--ink);height:22px;font-size:9px;display:flex;align-items:flex-end;padding-bottom:2px}
.sl .lab{font-size:6.5px;letter-spacing:.6px;text-transform:uppercase;color:var(--ink3);margin-top:2px}
.sigrow{display:flex;gap:16px;margin-top:8px}
.notary{display:flex;flex-direction:column;margin-top:12px;border:1px solid var(--rule);padding:6px 8px}
.notary .t{font-size:7.5px;letter-spacing:.9px;text-transform:uppercase;font-weight:700;color:var(--ink2)}
.notary .ln{display:flex;gap:12px;margin-top:4px;font-size:7.5px;color:var(--ink2)}
.notary .ln span{flex:1;display:flex;gap:4px;align-items:flex-end}
.notary .ln .bx{flex:1;border-bottom:1px solid var(--ink);min-height:11px}
.notary .body{font-size:7px;color:var(--ink2);line-height:1.35;margin-top:6px}
.notary .body .bx{display:inline-block;border-bottom:1px solid var(--ink);min-width:34px;height:9px;vertical-align:bottom}
.notary .body .bx.w{min-width:80px}
.meta4>div{flex:1}
`;

const sigLine = ({ label, name, value, width }) =>
  `<div class="sl"${width ? ` style="flex:none;width:${width}px"` : ''}><div class="sp" data-field="${name}">${value ? H.esc(value) : ''}</div><span class="lab">${H.esc(label)}</span></div>`;

const hd = (text, hint) =>
  `<div class="hd">${H.esc(text)}${hint ? `<span class="hint">${H.esc(hint)}</span>` : ''}</div>`;

function notary(p) {
  return `<div class="notary"><span class="t">Notary acknowledgment — optional unless your contract or state requires it</span>
<div class="ln"><span>State of <span class="bx" data-field="${p}.notary.state"></span></span><span>County of <span class="bx" data-field="${p}.notary.county"></span></span></div>
<div class="body">Subscribed and sworn to (or affirmed) before me on this <span class="bx" data-field="${p}.notary.day"></span> day of <span class="bx w" data-field="${p}.notary.month"></span>, 20<span class="bx" style="min-width:20px" data-field="${p}.notary.year"></span>, by the person signing above, personally known to me or identified by satisfactory evidence.</div>
<div class="sigrow" style="margin-top:8px">${sigLine({ label: 'Notary public — signature', name: `${p}.notary.sig` })}${sigLine({ label: 'Printed name', name: `${p}.notary.name` })}${sigLine({ label: 'Commission expires', name: `${p}.notary.expires`, width: 110 })}</div></div>`;
}

function formPage(form, sample, { n = form.n, total = FORMS.length } = {}) {
  const p = form.key;
  const s = sample ? (form.kind === 'progress' ? PROGRESS_SAMPLE : FINAL_SAMPLE) : null;
  const fillable = !sample;
  const company = sample ? SAMPLE_COMPANY : { name: '', line1: '', line2: '' };
  const signed = s ? (form.conditional ? s.signedConditional : s.signedUnconditional) : '';
  const meta = H.metaRow([
    {
      label: 'Claimant (you)',
      lines: [
        { text: s ? SAMPLE_COMPANY.name : '', strong: true, field: `${p}.claimant.name` },
        { text: s ? SAMPLE_COMPANY.line1 : '', field: `${p}.claimant.address` },
      ],
    },
    {
      label: 'Customer (who hired you)',
      lines: [
        { text: s ? SAMPLE_GC.name : '', strong: true, field: `${p}.customer.name` },
        { text: s ? SAMPLE_GC.line1 : '', field: `${p}.customer.address` },
      ],
    },
    {
      label: 'Owner of the property',
      lines: [
        { text: s ? SAMPLE_OWNER.name : '', strong: true, field: `${p}.owner.name` },
        { text: s ? SAMPLE_OWNER.line1 : '', field: `${p}.owner.address` },
      ],
    },
    {
      label: 'Project / property',
      lines: [
        { text: s ? SAMPLE_PROJECT.name : '', strong: true, field: `${p}.project.name` },
        { text: s ? SAMPLE_PROJECT.address : '', field: `${p}.project.address` },
      ],
    },
  ]).replace('class="meta"', 'class="meta meta4"');

  const payment = H.fieldRow([
    H.field({ name: `${p}.through`, label: 'Through date', value: s ? s.through : '', width: 130 }),
    H.field({
      name: `${p}.amount`,
      label: 'Payment amount',
      value: s ? H.money(s.amount) : '',
      width: 120,
    }),
    H.field({
      name: `${p}.maker`,
      label: 'Paid by (maker of check)',
      value: s ? SAMPLE_GC.name : '',
      flex: 1,
    }),
    H.field({
      name: `${p}.reference`,
      label: 'Reference (application / check no.)',
      value: s ? s.reference : '',
      flex: 1.2,
    }),
  ]);

  const exceptions =
    form.kind === 'progress'
      ? H.fieldRow([
          H.field({
            name: `${p}.exc.retention`,
            label: 'Retention withheld',
            value: s ? H.money(s.retention) : '',
            flex: 1,
          }),
          H.field({
            name: `${p}.exc.pending`,
            label: 'Pending change orders / extras',
            value: s ? H.money(s.pending) : '',
            flex: 1,
          }),
          H.field({
            name: `${p}.exc.disputed`,
            label: 'Disputed claims',
            value: s ? H.money(s.disputed) : '',
            flex: 1,
          }),
          H.field({
            name: `${p}.exc.after`,
            label: 'Furnished after the through date',
            value: s ? 'Not covered' : '',
            flex: 1,
          }),
        ])
      : H.fieldRow([
          H.field({
            name: `${p}.exc.disputed`,
            label: 'Disputed claims for additional work',
            value: s ? H.money(s.disputed) : '',
            flex: 1,
          }),
          H.field({
            name: `${p}.exc.other`,
            label: 'Other (contract warranty and indemnity obligations survive)',
            value: s ? 'None' : '',
            flex: 1.6,
          }),
        ]);

  const [para1, para2] = waiverText(form);
  return `
${H.compactHeader({ company, title: form.title, subtitle: `Form ${n} of ${total} · ${form.effect}`, fillable })}
${hd('Parties and project', 'the customer is whoever contracted with the claimant')}
${meta}
${hd('Payment', form.kind === 'progress' ? 'the progress payment this waiver covers' : 'the final payment, retention included')}
${payment}
${hd('Waiver and release')}
<div class="wt"><p>${H.esc(para1)}</p><p>${H.esc(para2)}</p></div>
${form.conditional ? '' : `<div class="notice">${H.esc(NOTICE)}</div>`}
${hd('Exceptions — this document does not affect', form.kind === 'progress' ? 'rights the claimant keeps after signing' : 'list disputed extras or write none')}
${exceptions}
${H.textarea({ name: `${p}.exc.description`, label: 'Description of exceptions', hint: 'change order numbers, amounts and status; disputed items', value: s ? s.exceptions : '', height: form.conditional ? 44 : 36 })}
${hd("Claimant's signature", form.conditional ? 'sign with the pay application; effective when the payment clears' : 'sign only after the payment has cleared your account')}
<div class="sigrow">${sigLine({ label: 'Signature', name: `${p}.sig` })}${sigLine({ label: 'Printed name and title', name: `${p}.sig_name`, value: s ? `${STORY.people.pm}, Project Manager` : '' })}${sigLine({ label: 'Company', name: `${p}.sig_company`, value: s ? SAMPLE_COMPANY.name : '' })}${sigLine({ label: 'Date', name: `${p}.sig_date`, value: signed, width: 70 })}</div>
${notary(p)}
${H.finePrint(FINE)}`;
}

export function html({ sample }) {
  const pages = FORMS.map((f) => formPage(f, sample));
  return {
    sections: [
      {
        html: H.document({
          title: meta.name,
          pages,
          css: CSS,
          footer: H.footerText(
            'Lien waiver forms · general form, not a statutory form · not legal advice'
          ),
        }),
        mode: 'pages',
        landscape: false,
      },
    ],
    previews: [{ section: 0, page: 0 }],
  };
}

// ---------------------------------------------------------------------------
// Word
// ---------------------------------------------------------------------------
function docxForm(form, { n = form.n, total = FORMS.length } = {}) {
  const W = D.CONTENT_W;
  const q = Math.round(W / 4);
  const [para1, para2] = waiverText(form);
  const exceptions =
    form.kind === 'progress'
      ? [
          [
            { label: 'Retention withheld', width: q },
            { label: 'Pending COs / extras', width: q },
            { label: 'Disputed claims', width: q },
            { label: 'After the through date', width: W - 3 * q },
          ],
        ]
      : [
          [
            { label: 'Disputed claims for additional work', width: Math.round(W * 0.4) },
            {
              label: 'Other (contract warranty and indemnity obligations survive)',
              width: W - Math.round(W * 0.4),
            },
          ],
        ];
  return [
    D.p(
      [
        D.run(form.title, { size: 15, bold: true }),
        new D.TextRun({ children: [new D.Tab()], font: D.FONT }),
        D.run(`Form ${n} of ${total}`, { size: 10, color: D.C.ink2 }),
      ],
      { tabStops: [{ type: D.TabStopType.RIGHT, position: W }], after: 30 }
    ),
    D.p(form.effect, { size: 9, italic: true, color: D.C.ink2, after: 60 }),
    new D.Paragraph({
      children: [],
      border: { bottom: { style: D.BorderStyle.SINGLE, size: 12, color: D.C.accent, space: 1 } },
      spacing: { after: 120 },
    }),
    D.heading('Parties and project', 'the customer is whoever contracted with the claimant'),
    D.metaRow([
      {
        label: 'Claimant (you)',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Customer (hired you)',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Property owner',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
        ],
      },
      {
        label: 'Project / property',
        lines: [
          { text: '', bold: true, input: true },
          { text: '', input: true },
        ],
      },
    ]),
    D.heading(
      'Payment',
      form.kind === 'progress'
        ? 'the progress payment this waiver covers'
        : 'the final payment, retention included'
    ),
    D.fieldGrid([
      [
        { label: 'Through date', width: q },
        { label: 'Payment amount', width: q },
        { label: 'Paid by (check maker)', width: q },
        { label: 'Reference (app. / check no.)', width: W - 3 * q },
      ],
    ]),
    D.heading('Waiver and release'),
    D.p(para1, { size: 9, after: 60 }),
    D.p(para2, { size: 9, after: 60 }),
    ...(form.conditional ? [] : [D.note(NOTICE)]),
    D.heading('Exceptions — this document does not affect'),
    D.fieldGrid(exceptions),
    ...D.textBox('Description of exceptions', {
      lines: 1,
      hint: 'Change order numbers, amounts and status; disputed items.',
    }),
    D.heading(
      "Claimant's signature",
      form.conditional
        ? 'sign with the pay application; effective when the payment clears'
        : 'sign only after the payment has cleared your account'
    ),
    D.fieldGrid([
      [
        { label: 'Signature', width: Math.round(W * 0.3) },
        { label: 'Printed name and title', width: Math.round(W * 0.3) },
        { label: 'Company', width: Math.round(W * 0.25) },
        { label: 'Date', width: W - Math.round(W * 0.3) * 2 - Math.round(W * 0.25) },
      ],
    ]),
    D.heading('Notary acknowledgment', 'optional unless your contract or state requires it'),
    D.fieldGrid([
      [
        { label: 'State of', width: q },
        { label: 'County of', width: q },
        { label: 'Sworn before me on (date)', width: q },
        { label: 'Commission expires', width: W - 3 * q },
      ],
      [
        { label: 'Notary signature', width: 2 * q },
        { label: 'Printed name', width: W - 2 * q },
      ],
    ]),
    D.fine(FINE_DOCX),
  ];
}

export async function docx() {
  const children = [];
  FORMS.forEach((form, i) => {
    if (i > 0) children.push(D.pageBreak());
    children.push(...docxForm(form));
  });
  return D.document({ title: meta.name, children, footerCenter: 'Lien waiver forms' });
}

/**
 * The conditional-only or unconditional-only pair (progress + final) as its own
 * two-form document, for the dedicated conditional / unconditional pages.
 */
export function waiverSet({ meta: m, conditional }) {
  const set = FORMS.filter((f) => f.conditional === conditional);
  const label = conditional ? 'Conditional' : 'Unconditional';
  return {
    html({ sample }) {
      const pages = set.map((f, i) => formPage(f, sample, { n: i + 1, total: set.length }));
      return {
        sections: [
          {
            html: H.document({
              title: m.name,
              pages,
              css: CSS,
              footer: H.footerText(
                `${label} lien waiver · general form, not a statutory form · not legal advice`
              ),
            }),
            mode: 'pages',
            landscape: false,
          },
        ],
        previews: [{ section: 0, page: 0 }],
      };
    },
    async docx() {
      const children = [];
      set.forEach((form, i) => {
        if (i > 0) children.push(D.pageBreak());
        children.push(...docxForm(form, { n: i + 1, total: set.length }));
      });
      return D.document({ title: m.name, children, footerCenter: m.docName });
    },
  };
}
