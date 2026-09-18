#!/usr/bin/env node
// Builds every free template (or the slugs given) into public/templates-files/
// and their preview images into public/templates-previews/, then writes
// src/data/templates-manifest/<slug>.json (file sizes, page counts, preview
// dims). One file per slug so parallel builds never clobber each other.
//
//   node scripts/templates/build.mjs            # everything
//   node scripts/templates/build.mjs change-order rfi
//
// Each module in ./templates exports:
//   meta  = { slug, name, basename, docName }
//   html? = ({ sample }) => ({ sections: [{ html, landscape, mode, footer }] })
//   xlsx? = async () => ExcelJS.Workbook
//   docx? = async () => docx Document
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePdf, writePreview, closeBrowser } from './kit/render.mjs';
import { write as writeXlsx } from './kit/xlsx.mjs';
import { write as writeDocx } from './kit/docx.mjs';
import { SLUGS } from './templates/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILES = path.join(ROOT, 'public/templates-files');
const PREVIEWS = path.join(ROOT, 'public/templates-previews');
const MANIFEST_DIR = path.join(ROOT, 'src/data/templates-manifest');

const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith('--'));
const skipPreview = args.includes('--no-preview');

async function size(file) {
  try {
    return (await fs.stat(file)).size;
  } catch {
    return null;
  }
}

async function loadManifest() {
  const out = {};
  try {
    for (const f of await fs.readdir(MANIFEST_DIR)) {
      if (!f.endsWith('.json')) continue;
      out[f.replace(/\.json$/, '')] = JSON.parse(
        await fs.readFile(path.join(MANIFEST_DIR, f), 'utf8')
      );
    }
  } catch {
    /* first run */
  }
  return out;
}

async function buildOne(slug, manifest) {
  const mod = await import(`./templates/${slug}.mjs`);
  const { meta } = mod;
  if (!meta || meta.slug !== slug)
    throw new Error(`templates/${slug}.mjs must export meta.slug === "${slug}"`);
  const entry = { slug, name: meta.name, basename: meta.basename, files: {}, previews: [] };
  console.log(`\n▶ ${slug}`);

  if (mod.html) {
    // Blank, fillable PDF.
    const blank = mod.html({ sample: false });
    const pdfFile = path.join(FILES, `${meta.basename}.pdf`);
    const pages = await writePdf(pdfFile, blank.sections, { fillable: true, title: meta.name });
    entry.files.pdf = { file: `${meta.basename}.pdf`, bytes: await size(pdfFile), pages };
    console.log(`  pdf   ${pages}p  ${entry.files.pdf.bytes} B`);

    // Filled-in example PDF (not fillable) + previews from it.
    const sample = mod.html({ sample: true });
    const exFile = path.join(FILES, `${meta.basename}-example.pdf`);
    const exPages = await writePdf(exFile, sample.sections, {
      fillable: false,
      title: `${meta.name} — completed example`,
    });
    entry.files.example = {
      file: `${meta.basename}-example.pdf`,
      bytes: await size(exFile),
      pages: exPages,
    };
    console.log(`  example ${exPages}p  ${entry.files.example.bytes} B`);

    if (!skipPreview) {
      const previewSections =
        sample.previews ?? sample.sections.map((_, i) => ({ section: i, page: 0 }));
      for (let i = 0; i < previewSections.length; i++) {
        const pv = previewSections[i];
        const s = sample.sections[pv.section];
        const base = path.join(PREVIEWS, i === 0 ? slug : `${slug}-${i + 1}`);
        const dims = await writePreview(base, {
          html: s.html,
          landscape: s.landscape,
          mode: s.mode,
          pageIndex: pv.page ?? 0,
        });
        entry.previews.push({
          file: `${path.basename(base)}.png`,
          webp: `${path.basename(base)}.webp`,
          ...dims,
          landscape: !!s.landscape,
        });
        console.log(`  preview ${path.basename(base)}.png ${dims.width}×${dims.height}`);
      }
    } else if (manifest[slug]?.previews) {
      entry.previews = manifest[slug].previews;
    }
  }

  if (mod.xlsx) {
    const wb = await mod.xlsx();
    const file = path.join(FILES, `${meta.basename}.xlsx`);
    await writeXlsx(wb, file);
    entry.files.xlsx = {
      file: `${meta.basename}.xlsx`,
      bytes: await size(file),
      sheets: wb.worksheets.map((w) => w.name),
    };
    console.log(`  xlsx  ${entry.files.xlsx.sheets.join(', ')}  ${entry.files.xlsx.bytes} B`);
  }

  if (mod.docx) {
    const doc = await mod.docx();
    const file = path.join(FILES, `${meta.basename}.docx`);
    await writeDocx(doc, file);
    entry.files.docx = { file: `${meta.basename}.docx`, bytes: await size(file) };
    console.log(`  docx  ${entry.files.docx.bytes} B`);
  }

  manifest[slug] = entry;
  await fs.writeFile(
    path.join(MANIFEST_DIR, `${slug}.json`),
    JSON.stringify(entry, null, 2) + '\n'
  );
}

async function main() {
  await fs.mkdir(FILES, { recursive: true });
  await fs.mkdir(PREVIEWS, { recursive: true });
  await fs.mkdir(MANIFEST_DIR, { recursive: true });
  const manifest = await loadManifest();
  const slugs = only.length ? only : SLUGS;
  const failures = [];
  for (const slug of slugs) {
    try {
      await buildOne(slug, manifest);
    } catch (err) {
      failures.push(slug);
      console.error(`  ✖ ${slug}:`, err);
    }
  }
  await closeBrowser();
  if (failures.length) {
    console.error(`\nFailed: ${failures.join(', ')}`);
    process.exit(1);
  }
  console.log(`\n✔ built ${slugs.length} template(s)`);
}

main();
