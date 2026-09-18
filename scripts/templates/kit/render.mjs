// Playwright + pdf-lib + sharp: HTML → PDF (optionally fillable) and preview PNG/WebP.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { chromium } from '@playwright/test';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import sharp from 'sharp';
import { PAGE, PAGE_LANDSCAPE, INK, BRAND } from './tokens.mjs';

const PX_TO_PT = 0.75;

let browserPromise = null;
export async function getBrowser() {
  if (!browserPromise) browserPromise = chromium.launch();
  return browserPromise;
}
export async function closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise;
    browserPromise = null;
    await b.close();
  }
}

async function tmpHtml(html) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bwp-tpl-'));
  const file = path.join(dir, 'doc.html');
  await fs.writeFile(file, html);
  return file;
}

function footerTemplate({ left, center }) {
  const s = 'font-family:Helvetica,Arial,sans-serif;font-size:7.5px;color:' + INK.ink3 + ';';
  return `<div style="width:100%;padding:0 ${PAGE.marginSide * PX_TO_PT}pt 14pt;box-sizing:border-box;${s}">
  <div style="border-top:1px solid ${INK.rule};padding-top:6pt;display:flex;justify-content:space-between;gap:12pt;align-items:flex-start">
    <span style="max-width:46%">${escapeHtml(left)}</span>
    <span style="text-align:center">${escapeHtml(center ?? '')}</span>
    <span style="white-space:nowrap">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
  </div></div>`;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Render one HTML section to PDF bytes.
 * mode 'pages'  — HTML built with html.document(): fixed .page blocks, in-doc footer printed.
 * mode 'flow'   — HTML built with html.flowDocument(): browser breaks pages, footer via template.
 * Returns { pdf: Uint8Array, fields: [{name,type,page,x,y,w,h}], pages }.
 */
export async function renderSection({
  html,
  landscape = false,
  mode = 'pages',
  footer,
  fillable = true,
}) {
  const browser = await getBrowser();
  const size = landscape ? PAGE_LANDSCAPE : PAGE;
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const file = await tmpHtml(html);
  try {
    await page.goto('file://' + file);
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);

    // Overflow check for fixed pages.
    if (mode === 'pages') {
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll('.page')]
          .map((p, i) => ({ i, over: p.scrollHeight - p.clientHeight }))
          .filter((x) => x.over > 2)
      );
      for (const o of overflow) console.warn(`  ⚠ page ${o.i + 1} overflows by ${o.over}px`);
    }

    let fields = [];
    if (fillable) {
      fields = await page.evaluate(() =>
        [...document.querySelectorAll('[data-field]')].map((el) => {
          const r = el.getBoundingClientRect();
          return {
            name: el.dataset.field,
            type: el.dataset.fieldType || 'text',
            x: r.x + window.scrollX,
            y: r.y + window.scrollY,
            w: r.width,
            h: r.height,
            fontSize: parseFloat(getComputedStyle(el).fontSize) || 9.5,
            align: getComputedStyle(el).textAlign,
          };
        })
      );
    }

    const pdfOpts = {
      format: 'Letter',
      landscape,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    };
    if (mode === 'flow' && footer) {
      pdfOpts.displayHeaderFooter = true;
      pdfOpts.headerTemplate = '<span></span>';
      pdfOpts.footerTemplate = footerTemplate(footer);
    }
    const pdf = await page.pdf(pdfOpts);
    const doc = await PDFDocument.load(pdf);
    const pages = doc.getPageCount();
    const pageH = size.height;
    // Map each field to a page. Fixed pages: y / pageH. Flow: page 1 only.
    const mapped = [];
    for (const f of fields) {
      const idx = mode === 'pages' ? Math.floor((f.y + f.h / 2) / pageH) : 0;
      const yInPage = f.y - idx * pageH;
      if (mode === 'flow' && f.y + f.h > pageH) {
        console.warn(`  ⚠ field ${f.name} is past page 1 of a flow document — skipped`);
        continue;
      }
      if (idx >= pages) continue;
      mapped.push({ ...f, page: idx, y: yInPage });
    }
    return { pdf, fields: mapped, pages, size };
  } finally {
    await context.close();
    await fs.rm(path.dirname(file), { recursive: true, force: true });
  }
}

/** Add AcroForm fields to a PDF from measured boxes. */
async function addFields(doc, sections) {
  const form = doc.getForm();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  let pageOffset = 0;
  const used = new Set();
  for (const s of sections) {
    for (const f of s.fields) {
      const page = doc.getPage(pageOffset + f.page);
      const inset = f.type === 'checkbox' ? 0 : 1.5;
      const x = f.x * PX_TO_PT;
      const w = Math.max(6, f.w * PX_TO_PT);
      const h = Math.max(6, f.h * PX_TO_PT - 2 * inset);
      const y = s.size.height * PX_TO_PT - (f.y + f.h) * PX_TO_PT + inset;
      let name = f.name;
      let k = 2;
      while (used.has(name)) name = `${f.name}_${k++}`;
      used.add(name);
      if (f.type === 'checkbox') {
        const cb = form.createCheckBox(name);
        cb.addToPage(page, {
          x,
          y,
          width: w,
          height: h,
          borderWidth: 0,
          backgroundColor: undefined,
        });
      } else {
        const tf = form.createTextField(name);
        if (f.type === 'multiline') tf.enableMultiline();
        tf.addToPage(page, {
          x,
          y,
          width: w,
          height: h,
          borderWidth: 0,
          backgroundColor: undefined,
          font: helv,
          textColor: rgb(0.106, 0.122, 0.141),
        });
        const fs = Math.min(f.fontSize * PX_TO_PT, f.type === 'multiline' ? 8 : Math.max(6, h - 3));
        tf.setFontSize(fs);
        if (f.align === 'right') tf.setAlignment(2);
        else if (f.align === 'center') tf.setAlignment(1);
      }
    }
    pageOffset += s.pages;
  }
  form.updateFieldAppearances(helv);
}

/**
 * Render one or more sections and write a single PDF. Each section:
 * { html, landscape, mode, footer }. Sections are concatenated in order.
 * Returns total page count.
 */
export async function writePdf(outFile, sections, { fillable = true, title } = {}) {
  const rendered = [];
  for (const s of sections) rendered.push(await renderSection({ ...s, fillable }));
  const merged = await PDFDocument.create();
  for (const r of rendered) {
    const src = await PDFDocument.load(r.pdf);
    const copied = await merged.copyPages(src, src.getPageIndices());
    copied.forEach((p) => merged.addPage(p));
  }
  if (fillable && rendered.some((r) => r.fields.length)) await addFields(merged, rendered);
  merged.setTitle(title ?? path.basename(outFile, '.pdf'));
  merged.setAuthor(BRAND.name);
  merged.setProducer(`${BRAND.name} template kit`);
  merged.setCreator(BRAND.templatesUrl);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, await merged.save());
  return rendered.reduce((n, r) => n + r.pages, 0);
}

/**
 * Screenshot page 1 of a section (screen media so the preview footer shows)
 * and write PNG + WebP at `width` px wide. For 'flow' HTML the top page-height
 * region is clipped, which is a faithful page 1 as long as nothing breaks early.
 */
export async function writePreview(
  outBase,
  { html, landscape = false, mode = 'pages', pageIndex = 0 },
  { width = 1200 } = {}
) {
  const browser = await getBrowser();
  const size = landscape ? PAGE_LANDSCAPE : PAGE;
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const file = await tmpHtml(html);
  try {
    await page.goto('file://' + file);
    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => document.fonts.ready);
    let png;
    if (mode === 'pages') {
      const el = page.locator('.page').nth(pageIndex);
      png = await el.screenshot({ type: 'png' });
    } else {
      png = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: pageIndex * size.height, width: size.width, height: size.height },
      });
    }
    await fs.mkdir(path.dirname(outBase), { recursive: true });
    const img = sharp(png).resize({ width });
    await img
      .clone()
      .png({ compressionLevel: 9, palette: true })
      .toFile(outBase + '.png');
    await img
      .clone()
      .webp({ quality: 82 })
      .toFile(outBase + '.webp');
    const meta = await sharp(outBase + '.png').metadata();
    return { width: meta.width, height: meta.height };
  } finally {
    await context.close();
    await fs.rm(path.dirname(file), { recursive: true, force: true });
  }
}
