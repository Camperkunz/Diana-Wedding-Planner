#!/usr/bin/env node
/**
 * Sends a signed Sanity webhook payload to `/api/revalidate`.
 *
 * Sanity signs deliveries as `HMAC-SHA256(secret, "<timestamp>.<body>")`, base64url
 * encoded, in the `sanity-webhook-signature: t=<unix ms>,v1=<signature>` header —
 * this script does the same, so the whole revalidation path can be exercised
 * against `npm run preview` before the real webhook exists.
 *
 * The secret is read from SANITY_WEBHOOK_SECRET, then from `.env.local`, then
 * from `.dev.vars` (all in the `web-wedding` folder).
 *
 * Usage:
 *   node scripts/sanity-webhook-test.mjs http://localhost:8787/api/revalidate --type=album --slug=some-album
 *   node scripts/sanity-webhook-test.mjs https://<worker>.workers.dev/api/revalidate --type=siteSettings
 *   node scripts/sanity-webhook-test.mjs <url> --all              # global flush (sanity:all)
 *   node scripts/sanity-webhook-test.mjs <url> --bad-signature    # expect 401
 */
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function flagValue(name, fallback = null) {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function readSecret() {
  const fromEnv = process.env.SANITY_WEBHOOK_SECRET?.trim();
  if (fromEnv) return fromEnv;

  for (const file of ['.env.local', '.dev.vars']) {
    let contents;
    try {
      contents = readFileSync(join(projectRoot, file), 'utf8');
    } catch {
      continue;
    }
    const line = contents
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith('SANITY_WEBHOOK_SECRET='));
    if (line) {
      return line
        .slice(line.indexOf('=') + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
    }
  }

  return null;
}

const url = process.argv[2];
if (!url || !/^https?:\/\//.test(url)) {
  console.error(
    'Usage: node scripts/sanity-webhook-test.mjs <url> [--type=album] [--slug=slug] [--all] [--bad-signature]'
  );
  process.exit(1);
}

const secret = readSecret();
if (!secret) {
  console.error('SANITY_WEBHOOK_SECRET is not set (env, .env.local or .dev.vars).');
  process.exit(1);
}

const payload = hasFlag('all')
  ? {}
  : { _type: flagValue('type', 'album'), ...(flagValue('slug') ? { slug: flagValue('slug') } : {}) };

const body = JSON.stringify(payload);
const timestamp = Date.now(); // Sanity sends milliseconds, not seconds.
const signingSecret = hasFlag('bad-signature') ? `${secret}-wrong` : secret;
const signature = createHmac('sha256', signingSecret)
  .update(`${timestamp}.${body}`)
  .digest('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

console.log(`POST ${url}`);
console.log(`payload            ${body}`);
console.log(`signature header   t=${timestamp},v1=${signature.slice(0, 12)}…`);

const startedAt = Date.now();
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'sanity-webhook-signature': `t=${timestamp},v1=${signature}`,
  },
  body,
});
const elapsedMs = Date.now() - startedAt;

console.log(`\n${response.status} ${response.statusText} (${elapsedMs} ms)`);
console.log(await response.text());

if (!response.ok) process.exit(2);
