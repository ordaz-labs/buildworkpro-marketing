#!/usr/bin/env node
// Character counts for X drafts. Reads every fenced ```text block in a
// social/x/*.md file and reports the raw length and the X-adjusted length,
// where every URL counts as 23 characters (t.co) and emoji count as 2.
//
//   node scripts/x-count.mjs social/x/2026-09-agents-launch.md
//
// Exits 1 if any post is over the limit so it can gate a PR later.

import fs from 'node:fs';

const LIMIT = 280;
const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/x-count.mjs <file.md>');
  process.exit(2);
}

const src = fs.readFileSync(file, 'utf8');
const lines = src.split('\n');

let heading = '(top)';
let inBlock = false;
let block = [];
let over = 0;
const rows = [];

const xLength = (text) => {
  const noUrls = text.replace(/https?:\/\/\S+/g, 'x'.repeat(23));
  // X counts most emoji and CJK as 2; approximate with a weighted count.
  let n = 0;
  for (const ch of noUrls) {
    const cp = ch.codePointAt(0);
    n += cp > 0x1f000 || (cp >= 0x2600 && cp <= 0x27bf) ? 2 : 1;
  }
  return n;
};

for (const line of lines) {
  const h = line.match(/^##\s+(.*)$/);
  if (h) heading = h[1].trim();
  if (line.startsWith('```text')) {
    inBlock = true;
    block = [];
    continue;
  }
  if (inBlock && line.startsWith('```')) {
    inBlock = false;
    const text = block.join('\n').trim();
    const raw = text.length;
    const adj = xLength(text);
    const isLong = /\blong\b/i.test(heading);
    const bad = adj > LIMIT && !isLong;
    if (bad) over += 1;
    rows.push({ heading, raw, adj, flag: bad ? 'OVER' : isLong ? 'long' : 'ok' });
    continue;
  }
  if (inBlock) block.push(line);
}

const width = Math.max(...rows.map((r) => r.heading.length), 8);
for (const r of rows) {
  console.log(
    `${r.heading.padEnd(width)}  raw ${String(r.raw).padStart(3)}  x ${String(r.adj).padStart(3)}  ${r.flag}`
  );
}
console.log(`\n${rows.length} posts, ${over} over ${LIMIT}`);
process.exit(over ? 1 : 0);
