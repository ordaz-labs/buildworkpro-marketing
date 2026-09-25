// Conditional lien waiver — the two conditional forms from the four-form lien
// waiver set (conditional waiver and release on progress payment, and on final
// payment) as their own fillable PDF and Word document. The waiver wording,
// exception fields, notary block and statutory-state fine print are shared
// with lien-waiver.mjs, so the three pages can never drift apart.
//
// Sample: the progress form is filled for application for payment no. 3; the
// final form for the closeout payment that releases retainage on the same job.
import { waiverSet } from './lien-waiver.mjs';

export const meta = {
  slug: 'conditional-lien-waiver',
  name: 'Conditional Lien Waiver Forms',
  basename: 'conditional-lien-waiver-form',
  docName: 'Conditional lien waiver',
};

const { html, docx } = waiverSet({ meta, conditional: true });
export { html, docx };
