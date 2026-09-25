// Unconditional lien waiver — the two unconditional forms from the four-form
// lien waiver set (unconditional waiver and release on progress payment, and on
// final payment) as their own fillable PDF and Word document. The waiver
// wording, notice to claimant, exception fields, notary block and
// statutory-state fine print are shared with lien-waiver.mjs.
//
// Sample: the progress form is filled for application for payment no. 3 (signed
// after the payment cleared); the final form for the retainage release.
import { waiverSet } from './lien-waiver.mjs';

export const meta = {
  slug: 'unconditional-lien-waiver',
  name: 'Unconditional Lien Waiver Forms',
  basename: 'unconditional-lien-waiver-form',
  docName: 'Unconditional lien waiver',
};

const { html, docx } = waiverSet({ meta, conditional: false });
export { html, docx };
