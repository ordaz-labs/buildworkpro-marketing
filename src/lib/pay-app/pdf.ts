// Fills the fillable pay application PDF that scripts/templates ships at
// public/templates-files/pay-application-template-g702-g703-style.pdf. The
// field names come from that generator (application page: to./from./project./
// app./pa./prog./sig./cs. plus the change-order summary; continuation sheet:
// sov.<row>.<col> for 22 rows and sov.total.<col>). Runs in the browser with
// pdf-lib; nothing leaves the visitor's machine.
import { computeApp, computeRow, longDate, money, pct, type State } from './math';

export const PDF_TEMPLATE_URL = '/templates-files/pay-application-template-g702-g703-style.pdf';
/** Rows the continuation sheet can print. Anything beyond is reported, not silently dropped. */
export const PDF_ROW_CAPACITY = 22;

const rateText = (ratePct: number): string =>
  `${Number.isInteger(ratePct) ? ratePct : ratePct.toFixed(2)}%`;

export function buildFieldValues(state: State): Record<string, string> {
  const calc = computeApp(state.rows, state.app.ratePct, state.app.prevCertified);
  const appNumber = String(state.app.number);
  const v: Record<string, string> = {
    'co.name': state.company.name,
    'co.line1': state.company.line1,
    'co.line2': state.company.line2,
    'from.name': state.company.name,
    'from.address': state.company.line1,
    'to.name': state.job.to,
    'to.address': state.job.toAddress,
    'project.name': state.job.project,
    'project.address': state.job.projectAddress,
    'project.number': state.job.projectNumber,
    'app.number': appNumber,
    'app.period_from': longDate(state.app.periodFrom),
    'app.period_to': longDate(state.app.periodTo),
    'app.date': longDate(state.app.date),
    'app.submitted_by': state.company.signer,
    'contract.date': longDate(state.job.contractDate),
    'contract.for': state.job.contractFor,
    'co.prev_add': money(calc.coAdds, true),
    'co.prev_ded': money(calc.coDeds, true),
    'co.tot_add': money(calc.coAdds, true),
    'co.tot_ded': money(calc.coDeds, true),
    'co.net': money(calc.net),
    'pa.1': money(calc.base),
    'pa.2': money(calc.net),
    'pa.3': money(calc.revised),
    'pa.4': money(calc.totals.g),
    'pa.rate': rateText(state.app.ratePct),
    'pa.rate_2': rateText(state.app.ratePct),
    'pa.rate_3': rateText(state.app.ratePct),
    'pa.5a': money(calc.retWork),
    'pa.5b': money(calc.retStored),
    'pa.5': money(calc.retainage),
    'pa.6': money(calc.earned),
    'pa.7': money(calc.previousCerts),
    'pa.8': money(calc.due),
    'pa.9': money(calc.balance),
    'prog.pct': pct(calc.pct),
    'prog.this': money(calc.totals.e + calc.totals.f),
    'prog.remaining': money(calc.remaining),
    'sig.contractor_name': state.company.signer,
    'sig.contractor_date': longDate(state.app.date),
    'cs.app_number': appNumber,
    'cs.app_date': longDate(state.app.date),
    'cs.period_to': longDate(state.app.periodTo),
    'cs.project': state.job.project,
    'cs.to': state.job.to,
    'cs.rate': rateText(state.app.ratePct),
    'sov.total.c': money(calc.totals.c),
    'sov.total.d': money(calc.totals.d),
    'sov.total.e': money(calc.totals.e),
    'sov.total.f': money(calc.totals.f),
    'sov.total.g': money(calc.totals.g),
    'sov.total.h': pct(calc.pct),
    'sov.total.i': money(calc.remaining),
    'sov.total.r': money(calc.retainage),
  };
  state.rows.slice(0, PDF_ROW_CAPACITY).forEach((r, i) => {
    const k = `sov.${i + 1}`;
    const rc = computeRow(r, state.app.ratePct);
    v[`${k}.n`] = r.n;
    v[`${k}.desc`] = r.desc;
    v[`${k}.c`] = money(r.c);
    v[`${k}.d`] = money(r.d, true);
    v[`${k}.e`] = money(r.e, true);
    v[`${k}.f`] = money(r.f, true);
    v[`${k}.g`] = money(rc.g, true);
    v[`${k}.h`] = r.c ? pct(rc.pct) : '';
    v[`${k}.i`] = money(rc.balance);
    v[`${k}.r`] = money(rc.retainage, true);
  });
  return v;
}

/** Fill the template bytes with `state`. Fields the template lacks are skipped. */
export async function fillPayAppPdf(templateBytes: ArrayBuffer, state: State): Promise<Uint8Array> {
  // Loaded on demand: pdf-lib is ~300 KB and only needed once the visitor
  // asks for the PDF, so the builder itself stays light on first paint.
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.load(templateBytes);
  const form = doc.getForm();
  const values = buildFieldValues(state);
  for (const [name, value] of Object.entries(values)) {
    try {
      form.getTextField(name).setText(value);
    } catch {
      // Field not present in this template revision — leave it blank.
    }
  }
  try {
    form.getCheckBox('dist.contractor').check();
  } catch {
    // optional
  }
  doc.setTitle(
    `Pay Application ${state.app.number}${state.job.project ? ` — ${state.job.project}` : ''}`
  );
  doc.setProducer('BuildWorkPro Pay Application Builder');
  return doc.save();
}

export function pdfFileName(state: State): string {
  const slug = state.job.project
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `pay-application-${state.app.number}${slug ? `-${slug}` : ''}.pdf`;
}
