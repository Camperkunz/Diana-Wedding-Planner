/**
 * Album performance baseline / re-measurement (Step 0 of the album optimisation).
 *
 * Run from `web-wedding/`:  node scripts/album-perf-baseline.mjs
 *
 * It measures, against the live Sanity dataset and without touching any app
 * code, the two costs that the optimisation targets:
 *
 *  1. DATA LAYER — the listing query as it is today
 *     (`getAlbums()` / `getHomePage().featuredAlbums`, which both pull
 *     `photos[]{...}` for every album) versus the card projection that only
 *     needs the cover: payload bytes, object count and mapping CPU.
 *  2. RENDER LAYER — for the album with the most photos, how many `srcSet`
 *     entries and how many characters of markup the current widths list
 *     produces versus the gallery widths list, replicating the URL logic in
 *     `src/lib/sanity-image.ts` + `src/components/ui/ResponsiveImage.tsx`.
 *
 * The Worker CPU / TTFB half of the baseline is measured separately on the
 * deployed Worker (`wrangler tail --format json` for `cpuTime`, `curl` with
 * `cf-cache-status` for hit-vs-miss TTFB) — see the run notes in the summary.
 */
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

// ── env ─────────────────────────────────────────────────────────────────────
function loadEnv(path = new URL('../.env.local', import.meta.url)) {
  const env = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-05-15',
  useCdn: true,
});
const builder = createImageUrlBuilder(client);

// ── the two projections being compared ──────────────────────────────────────
// Today: every listing pulls the whole gallery.
const OLD_PROJECTION = `
  _id, title, slug, category, coverImage, coverImageAlt,
  story, date, venue, location,
  seo{ metaTitle, metaDescription, ogImage, canonicalUrl, noIndex, noFollow },
  photos[]{ image, alt, caption }
`;

// Proposed: listings only need the cover — resolved to the first gallery photo
// in GROQ (skipping photos with no asset, exactly like `mapAlbum`'s filter),
// plus `_key` so the gallery can use stable React keys.
const NEW_PROJECTION = `
  _id, title, slug, category, coverImageAlt,
  date, venue, location,
  "coverImage": coalesce(coverImage, photos[defined(image.asset)][0].image)
`;

const ALBUM_PHOTOS_PROJECTION = `
  _id, title, slug,
  photos[]{ _key, image, alt, caption }
`;

// ── URL helpers (mirrors of src/lib/sanity-image.ts) ────────────────────────
const ASSET_SIZE_IN_NAME = /-(\d{2,5})x(\d{2,5})\.[a-z0-9]+$/i;

function dimensionsFromUrl(url) {
  const match = ASSET_SIZE_IN_NAME.exec(url.split('?')[0]);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : undefined;
}

function sanityImage(source, width = 1920) {
  if (!source) return undefined;
  try {
    return builder.image(source).width(width).auto('format').url();
  } catch {
    return undefined;
  }
}

/** Mirror of `srcSetFromUrl`: rewrites an already-built CDN URL per width. */
function srcSetFromUrl(url, widths) {
  if (!/^https:\/\/cdn\.sanity\.io\/images\//.test(url)) return undefined;
  const [base, query = ''] = url.split('?');
  const params = new URLSearchParams(query);
  if (!params.has('w') || params.has('h') || params.has('fit')) return undefined;

  params.delete('w');
  const originalWidth = dimensionsFromUrl(base)?.width;
  const entries = widths
    .filter((width) => (originalWidth ? width <= originalWidth : true))
    .map((width) => {
      const sized = new URLSearchParams(params);
      sized.set('w', String(width));
      return `${base}?${sized.toString()} ${width}w`;
    });

  return entries.length > 1 ? entries.join(', ') : undefined;
}

// ── mapping helpers ─────────────────────────────────────────────────────────
/** Today's `mapAlbum` — builds one URL per photo of every album. */
function mapAlbum(album) {
  const photos = (album.photos || [])
    .map((photo) => ({ src: sanityImage(photo.image, 1800), alt: photo.alt || album.title }))
    .filter((photo) => Boolean(photo.src));

  return {
    coverImage: sanityImage(album.coverImage, 1800) || photos[0]?.src,
    photos,
  };
}

/** Proposed `mapAlbumCard` — one URL per album, no gallery. */
function mapAlbumCard(album) {
  return { coverImage: sanityImage(album.coverImage, 1800) };
}

function timeMapping(items, mapper, iterations = 20) {
  mapper(items[0]); // warm-up
  const started = performance.now();
  for (let i = 0; i < iterations; i += 1) items.forEach(mapper);
  return (performance.now() - started) / iterations;
}

const bytes = (value) => Buffer.byteLength(JSON.stringify(value), 'utf8');
const kb = (value) => `${(value / 1024).toFixed(1)} KB`;

// ── measure: data layer ─────────────────────────────────────────────────────
const oldStart = performance.now();
const oldAlbums = await client.fetch(`*[_type == "album"] | order(_createdAt desc){${OLD_PROJECTION}}`);
const oldQueryMs = performance.now() - oldStart;

const newStart = performance.now();
const newAlbums = await client.fetch(`*[_type == "album"] | order(_createdAt desc){${NEW_PROJECTION}}`);
const newQueryMs = performance.now() - newStart;

const photoTotal = oldAlbums.reduce((total, album) => total + (album.photos?.length || 0), 0);

console.log('\n=== 1. DATA LAYER: listing queries (all albums) ===');
console.log(`albums....................... ${oldAlbums.length}`);
console.log(`photos inside those albums... ${photoTotal}`);
console.log(
  `OLD (photos[]{} per album)... ${kb(bytes(oldAlbums))} | query ${oldQueryMs.toFixed(0)} ms | ` +
    `map ${timeMapping(oldAlbums, mapAlbum).toFixed(1)} ms/run`
);
console.log(
  `NEW (cover only)............. ${kb(bytes(newAlbums))} | query ${newQueryMs.toFixed(0)} ms | ` +
    `map ${timeMapping(newAlbums, mapAlbumCard).toFixed(1)} ms/run`
);
console.log(
  `payload ratio................ ${(bytes(oldAlbums) / bytes(newAlbums)).toFixed(1)}x smaller with the card projection`
);

// ── measure: render layer (srcSet cost for the biggest album) ───────────────
const OLD_GRID_WIDTHS = [480, 768, 1024, 1440, 1920];
const NEW_GRID_WIDTHS = [480, 768, 1024, 1280];

const withPhotos = await client.fetch(
  `*[_type == "album" && count(photos) > 0] | order(count(photos) desc){${ALBUM_PHOTOS_PROJECTION}}`
);
const biggest = withPhotos[0];

console.log('\n=== 2. RENDER LAYER: gallery srcSet for the biggest album ===');
console.log(`album........................ "${biggest?.title}" — ${biggest?.photos?.length || 0} photos`);

for (const [label, widths] of [
  ['OLD widths [480,768,1024,1440,1920]', OLD_GRID_WIDTHS],
  [`NEW widths [${NEW_GRID_WIDTHS.join(',')}]`, NEW_GRID_WIDTHS],
]) {
  let entries = 0;
  let chars = 0;
  let photosWithoutDimensions = 0;
  let keys = new Set();

  for (const photo of biggest?.photos || []) {
    const src = sanityImage(photo.image, 1800);
    if (!src) continue;
    if (!dimensionsFromUrl(src)) photosWithoutDimensions += 1;
    keys.add(photo._key);
    const set = srcSetFromUrl(src, widths);
    if (set) {
      entries += set.split(', ').length;
      chars += set.length;
    }
  }

  console.log(
    `${label.padEnd(38)} ${entries} srcSet entries | ${kb(chars)} of markup | ` +
      `${photosWithoutDimensions} photo(s) without dimensions in the URL | ` +
      `${keys.size} distinct _key(s)`
  );
}

console.log('\n=== 3. COVER EQUIVALENCE: card projection vs today\'s mapAlbum ===');
for (const album of oldAlbums) {
  const today = mapAlbum(album).coverImage;
  const card = mapAlbumCard(newAlbums.find((item) => item._id === album._id)).coverImage;
  console.log(
    `${today === card ? 'same  ' : 'DIFF  '} ${album.title.padEnd(24)} ` +
      `${today === card ? '' : `\n        today: ${today}\n        card : ${card}`}`
  );
}

// The `coalesce` fallback is the branch only coverless albums take. Force it and
// compare with what today's `mapAlbum` would have produced from `photos[0]`.
const coverInfo = await client.fetch(`*[_type == "album"]{ _id, "hasCover": defined(coverImage) }`);
const fallbackProbe = await client.fetch(
  `*[_type == "album"][0]{
    "fallback": coalesce(null, photos[defined(image.asset)][0].image),
    "firstPhoto": photos[defined(image.asset)][0].image,
    "emptyCase": coalesce(null, [][0].image)
  }`
);
console.log(`albums with an explicit coverImage.. ${coverInfo.filter((album) => album.hasCover).length}/${coverInfo.length}`);
console.log(
  `forced fallback == photos[0].src..... ${sanityImage(fallbackProbe?.fallback, 1800) === sanityImage(fallbackProbe?.firstPhoto, 1800)}`
);
console.log(`empty album / no cover resolves to. ${String(fallbackProbe?.emptyCase)}`);

// ── scaling: what the same code costs on a real archive ─────────────────────
function timeUrlBuilds(image, iterations = 200) {
  const started = performance.now();
  for (let i = 0; i < iterations; i += 1) sanityImage(image, 1280);
  return ((performance.now() - started) / iterations) * 1000; // µs per build
}

const biggestPhotos = biggest?.photos || [];
const perPhotoBytes = biggestPhotos.length ? Math.round(bytes(biggestPhotos) / biggestPhotos.length) : 0;
const perCardBytes = Math.round(bytes(newAlbums) / Math.max(1, newAlbums.length));
const buildUs = timeUrlBuilds(biggestPhotos[0]?.image);
const EXAMPLE_ALBUMS = 20;
const EXAMPLE_PHOTOS = 120;

console.log('\n=== 4. SCALING (measured per unit, projected) ===');
console.log(`bytes per gallery photo in a listing payload. ${perPhotoBytes} B  (image object + alt + caption)`);
console.log(`bytes per album card (new projection)........ ${perCardBytes} B`);
console.log(`building one CDN URL from an image object.... ${buildUs.toFixed(1)} µs`);
console.log(`\nprojection for an archive of ${EXAMPLE_ALBUMS} albums × ${EXAMPLE_PHOTOS} photos:`);
console.log(
  `  OLD listing: ≈ ${Math.round((EXAMPLE_ALBUMS * (perCardBytes + EXAMPLE_PHOTOS * perPhotoBytes)) / 1024)} KB, ` +
    `${EXAMPLE_ALBUMS * EXAMPLE_PHOTOS} URL builds ≈ ${Math.round((EXAMPLE_ALBUMS * EXAMPLE_PHOTOS * buildUs) / 1000)} ms of CPU`
);
console.log(
  `  NEW listing: ≈ ${Math.round((EXAMPLE_ALBUMS * perCardBytes) / 1024)} KB, ` +
    `${EXAMPLE_ALBUMS} URL builds ≈ ${((EXAMPLE_ALBUMS * buildUs) / 1000).toFixed(2)} ms of CPU`
);

console.log('\n(Worker cpuTime / TTFB are measured on the deployed Worker — see summary.)\n');
