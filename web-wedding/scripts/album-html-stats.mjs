/**
 * Prerendered album-page statistics (before/after companion to
 * `album-perf-baseline.mjs`).
 *
 * Run from `web-wedding/` after a build:
 *   node scripts/album-html-stats.mjs
 *
 * Reads the ISR output of `next build` (`.next/server/app/portfolio/[albumSlug]/`)
 * and reports, per album, the real numbers this optimisation is about: HTML
 * bytes (raw + gzip), how many <img> the page ships, how many `srcSet` entries
 * and how many characters of CDN URLs they add up to, and whether the gallery
 * has `content-visibility` + a stable aspect ratio.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const roots = ['.next/server/app/portfolio', '.next/server/app/portfolio/[albumSlug]'];
const fromArgv = process.argv.slice(2);
const albums = fromArgv.length
  ? fromArgv
  : roots.flatMap((root) => {
      try {
        return readdirSync(root)
          .filter((name) => name.endsWith('.html'))
          .map((name) => `${root}/${name}`);
      } catch {
        return [];
      }
    });
const kb = (value) => `${(value / 1024).toFixed(1)} KB`;

for (const file of albums) {
  const html = readFileSync(file, 'utf8');
  const images = html.match(/<img\b[^>]*>/g) || [];
  const gallery = images.filter((tag) => tag.includes('cdn.sanity.io'));
  // React 19 writes the attribute back out as `srcSet` (camelCase) in this
  // build, so match case-insensitively and only in attribute form.
  const srcSets = html.match(/\bsrcset="[^"]*"/gi) || [];
  const srcSetChars = srcSets.reduce((total, value) => total + value.length, 0);
  const entries = srcSets.reduce((total, value) => total + (value.match(/\d+w/g) || []).length, 0);
  const widths = new Set();
  for (const match of html.matchAll(/\bw=(\d+)/g)) widths.add(Number(match[1]));
  // Bytes the page ships as the inline React Server Components flight payload —
  // this is where an over-fetched listing still costs the visitor.
  const flight = [...html.matchAll(/self\.__next_f\.push\(\[1,"/g)].length;
  const flightChars = (html.match(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g) || []).reduce(
    (total, value) => total + value.length,
    0
  );

  console.log(`\n${file.split('/').pop().replace('.html', '')}`);
  console.log(`  html......................... ${kb(Buffer.byteLength(html))} raw / ${kb(gzipSync(html).length)} gzip`);
  console.log(`  flight payload chunks........ ${flight} (${kb(flightChars)} of inline script)`);
  console.log(`  <img> total.................. ${images.length} (cdn.sanity.io: ${gallery.length})`);
  console.log(`  srcSet entries / chars....... ${entries} / ${kb(srcSetChars)}`);
  console.log(`  image widths present......... ${[...widths].sort((a, b) => a - b).join(', ')}`);
  console.log(`  figures with cv-auto......... ${(html.match(/cv-auto/g) || []).length}`);
  console.log(`  inline aspect-ratio style.... ${(html.match(/aspect-ratio:/g) || []).length}`);
}
console.log('');
