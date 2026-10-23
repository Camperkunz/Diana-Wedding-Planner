#!/usr/bin/env node
/**
 * Pushes the URLs of the live sitemap to IndexNow — the feed Bing, Yandex,
 * Seznam and Naver share, and the one the AI search crawlers read. New albums
 * are usually picked up within hours instead of waiting for a crawl cycle.
 *
 * Google does NOT use IndexNow: submit the sitemap once in Search Console and
 * use "Request indexing" there.
 *
 * Usage (from the `web-wedding` folder):
 *   npm run indexnow                  # submit every URL of the live sitemap
 *   npm run indexnow -- --dry-run     # print what would be sent
 *   npm run indexnow -- --site=http://localhost:8787   # against a preview
 *
 * The key comes from INDEXNOW_KEY, or from the `<key>.txt` file committed in
 * `public/` — IndexNow requires it to be reachable at https://<host>/<key>.txt,
 * which is exactly where that file is deployed.
 */
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const DEFAULT_SITE = 'https://dianavoloshina.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
// IndexNow rejects a single submission carrying more than 10,000 URLs.
const MAX_URLS_PER_REQUEST = 10000;

function flagValue(name, fallback = null) {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

const site = (flagValue('site') || process.env.INDEXNOW_SITE || DEFAULT_SITE).replace(/\/+$/, '');
const host = new URL(site).host;

/** IndexNow key: the env var first, then the key file committed in `public/`. */
function readKey() {
  const fromEnv = process.env.INDEXNOW_KEY?.trim();
  if (fromEnv) return fromEnv;

  const publicDir = join(projectRoot, 'public');
  const keyFile = existsSync(publicDir)
    ? readdirSync(publicDir).find((file) => /^[0-9a-f]{8,128}\.txt$/i.test(file))
    : undefined;

  if (keyFile) return keyFile.replace(/\.txt$/i, '');

  throw new Error('No IndexNow key found. Set INDEXNOW_KEY or add <key>.txt to public/.');
}

async function loadSitemapUrls(sitemapUrl) {
  const response = await fetch(sitemapUrl);
  if (!response.ok) throw new Error(`GET ${sitemapUrl} answered ${response.status}`);

  const xml = await response.text();
  // Only page URLs: image entries use <image:loc>, which this pattern skips.
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
    .map((match) => match[1].replace(/&amp;/g, '&'))
    .filter((url) => url.startsWith('http'));

  return [...new Set(urls)];
}

async function main() {
  const key = readKey();
  const sitemapUrl = process.env.INDEXNOW_SITEMAP || `${site}/sitemap.xml`;
  const urls = await loadSitemapUrls(sitemapUrl);

  if (!urls.length) throw new Error(`No URLs found in ${sitemapUrl}`);
  if (urls.length > MAX_URLS_PER_REQUEST) {
    throw new Error(`${urls.length} URLs is over the IndexNow limit of ${MAX_URLS_PER_REQUEST}.`);
  }

  const foreign = urls.filter((url) => new URL(url).host !== host);
  if (foreign.length) {
    throw new Error(`The sitemap contains URLs for another host: ${foreign.slice(0, 3).join(', ')}`);
  }

  console.log(`IndexNow: ${urls.length} URL(s) for ${host}`);
  urls.forEach((url) => console.log(`  ${url}`));

  if (hasFlag('dry-run')) {
    console.log('Dry run — nothing was submitted.');
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${site}/${key}.txt`,
      urlList: urls,
    }),
  });

  // 200 = accepted; 202 = accepted, the key is still being validated.
  if (response.ok) {
    console.log(`IndexNow answered ${response.status} — URLs submitted.`);
    return;
  }

  console.error(`IndexNow answered ${response.status}: ${(await response.text()).trim()}`);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
