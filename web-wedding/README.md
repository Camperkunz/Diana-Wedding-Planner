# Diana Wedding Planner — website

A Next.js (App Router) site whose content is managed in Sanity Studio. It is
deployed to [Cloudflare Workers](https://developers.cloudflare.com/workers/)
through the [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
adapter, and built automatically from GitHub by **Cloudflare Workers Builds** —
a push to `main` is all it takes to ship.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page auto-updates as you
edit files; the entry point is `src/app/page.tsx`.

```bash
npm run typecheck   # tsc --noEmit
```

### Fonts

Fonts are self-hosted: the files live in `public/fonts` and are declared with
`@font-face` in `src/app/globals.css`. `next/font/google` is deliberately **not**
used — it downloads from Google at build time, and Turbopack cannot parse the
extensionless `/l/font?kit=…` URLs it is sometimes served
(vercel/next.js#99114). Keeping the fonts local also avoids a third-party request
on every page load.

## Project layout

| Path | What lives there |
| --- | --- |
| `src/app` | routes, layout, server actions |
| `src/app/sanity` | Sanity client, image URL builder, queries |
| `src/lib` | `site.ts` (canonical URL, metadata helpers), Sanity data access |
| `src/components` | page sections and UI primitives (shadcn/ui) |
| `public/fonts` | self-hosted webfonts |

## Environment variables

Locally these live in `.env.local`, which is git-ignored. In production they are
set in the Cloudflare dashboard on the Worker — and it matters *which* section
they go in:

- **Build** variables are inlined by `next build`, so every `NEXT_PUBLIC_*` value
  must be a *Build* variable (and set for preview builds too).
- **Runtime** secrets are read by the Worker while handling a request. Anything
  sensitive belongs here, encrypted as a secret.

| Variable | Where | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Build | yes | Sanity project to read content from |
| `NEXT_PUBLIC_SANITY_DATASET` | Build | yes | Sanity dataset (`production`) |
| `NEXT_PUBLIC_SITE_URL` | Build | recommended | Canonical origin used by metadata, Open Graph, `sitemap.xml`, `robots.txt` and the JSON-LD. In a production build without it, `src/lib/site.ts` falls back to `https://dianavoloshina.com`; in development it falls back to `http://localhost:3000` |
| `RESEND_API_KEY` | Runtime (secret) | yes | Sending contact-form email |
| `RESEND_FROM_ADDRESS` | Runtime | yes | Verified sender, as `Name <addr@domain>`. Required — when it is missing the submission is rejected with a generic error and the reason is logged. There is no test-sender fallback |
| `RESEND_FALLBACK_EMAIL` | Runtime | optional | Last-resort recipient if the recipient in Sanity is unusable |
| `SANITY_WEBHOOK_SECRET` | Runtime (secret) | yes for revalidation | Shared secret of the Sanity webhook (`/api/revalidate`). Without it the route answers 500 and content only refreshes when the ISR window expires |

> Careful: the Cloudflare adapter compiles the `.env*` files into the Worker
> bundle. Never put a production secret in `.env.local` — set it in the
> dashboard instead.

## Deploying

Deployment is automatic. Workers Builds checks out the repo, builds the Worker
and deploys it on every push to `main`.

### Build settings

Cloudflare dashboard → the Worker → **Settings → Build**:

| Setting | Value |
| --- | --- |
| Git repository | `Camperkunz/Diana-Wedding-Planner` |
| Production branch | `main` |
| **Root directory** | `web-wedding` *(the app is not at the repo root)* |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler versions upload` |

`wrangler.jsonc` in this folder is what gets deployed — `.open-next/worker.js`
plus `.open-next/assets` — and it declares the bindings and compatibility flags
the Worker needs. `open-next.config.ts` stores the ISR cache in Cloudflare KV
(free plan, no R2). A Sanity webhook calls `/api/revalidate`, which drops the
cache tags of the edited document type, so saved content is live within seconds
instead of waiting for the ISR window (see [Content updates](#content-updates-sanity-webhook)).

### One-time setup

Create a KV namespace (free, no card needed): Cloudflare dashboard →
Storage & databases → KV → Create namespace (any name). Copy its ID into
`kv_namespaces[0].id` in `wrangler.jsonc`.

### Local production preview

```bash
npm run preview
```

Builds the Worker and serves it in the real Workers runtime (`workerd`) on your
machine, using the values from `.env.local`. Use it to test anything that behaves
differently on Cloudflare — server actions and ISR in particular. `npm run dev`
remains the normal day-to-day workflow.

### Content updates (Sanity webhook)

Pages are cached with ISR in KV and tagged per document type, so the Studio tells
the site what changed instead of the site waiting for the `revalidate` window:

1. `src/lib/sanity-tags.ts` gives every cached `client.fetch` a `next: { tags }`
   set — one tag per document type plus the global `sanity:all`.
2. `POST /api/revalidate` (`src/app/api/revalidate/route.ts`) verifies the
   `sanity-webhook-signature` header against `SANITY_WEBHOOK_SECRET`, then calls
   `revalidateTag()` for each changed `_type`. An album payload also refreshes
   `/portfolio` and the album's own URL; a payload without `_type` (a delete)
   flushes `sanity:all`.
3. OpenNext keeps the tags in a Durable Object (`NEXT_TAG_CACHE_DO_SHARDED`, the
   `v2` migration in `wrangler.jsonc`, applied by the next deploy). Unlike the KV
   tag cache variant there is no ~60s propagation delay.

One-time setup in the Studio — sanity.io/manage → the project → **API →
Webhooks** → Create webhook:

| Field | Value |
| --- | --- |
| URL | `https://<worker-host>/api/revalidate` |
| Dataset | `production` |
| Trigger on | create, update, delete |
| API version | `v2021-03-25` or newer (the payload needs `ids`) |
| Secret | the same value as the Worker's `SANITY_WEBHOOK_SECRET` |
| Filter | `_type in ["album","service","homePage","siteSettings","siteLayout","siteDesign","backstageVideo","aboutPage","portfolioPage","faqPage","backstagePage","contactPage","privacyPolicy","servicesPage"]` |
| Projection | `{"_type": _type, "slug": slug.current}` |

Set the Worker secret (dashboard → Settings → Variables and Secrets → add an
encrypted secret, or):

```bash
npx wrangler secret put SANITY_WEBHOOK_SECRET
```

To test the route against the real runtime, run `npm run preview`, put the same
secret in `.dev.vars` (git-ignored, read by `wrangler dev`), and send a signed
payload:

```bash
node scripts/sanity-webhook-test.mjs http://localhost:8787/api/revalidate --type=album --slug=<album-slug>
```

`--all` sends an unattributable payload (global flush) and `--bad-signature` must
answer `401`. The response lists what was invalidated, and Sanity shows the same
body in its webhook delivery log.

> Workers Cache stays disabled in `wrangler.jsonc` on purpose: the edge honours
> Next's `s-maxage` and its copy cannot be purged on `workers.dev`, so it would
> hide webhook updates for up to the ISR window.

### Deploying by hand

```bash
npm run deploy
```

## Contact form

When a visitor submits the contact form:

1. the recipient address is resolved **server-side** from Sanity, never taken
   from the request, so the action cannot be abused as an open mail relay;
2. every interpolated value is HTML-escaped;
3. the reply-to address is taken from the first field that looks like an email
   field *and* holds a valid address, falling back to the first valid address in
   the form — never from an unvalidated value;
4. submissions are rate limited in memory per caller (best effort — it resets on
   cold starts and is per-instance, so it is not a substitute for a CAPTCHA or a
   WAF). The bucket is keyed on `cf-connecting-ip`, falling back to the last
   `x-forwarded-for` hop and then `x-real-ip`, because the *first*
   `x-forwarded-for` entry is whatever the visitor sent. Only a submission that
   really reaches Resend counts, and a full log drops expired buckets instead of
   resetting everybody's limit;
5. every attempt carries a deterministic Resend idempotency key (caller, content
   and minute), so a double-click or a retried submission is deduplicated rather
   than delivered twice;
6. the message is sent as HTML *and* plain text.

Resend failures are logged with the provider's error name
(`daily_quota_exceeded`, `rate_limit_exceeded`, `validation_error`, …) so a quota
or sender-domain problem stays diagnosable; visitors always receive the same
generic message.

Before launch, confirm that `RESEND_API_KEY` and `RESEND_FROM_ADDRESS` are set as
*runtime* secrets in the dashboard and that the sender domain is verified in
Resend; then submit a real test message against the deployed site. The sender has
**no fallback**: if `RESEND_FROM_ADDRESS` is missing, the submission fails with a
generic error and the Worker logs `Contact form: RESEND_FROM_ADDRESS is not
configured.` A log line about "no client IP header found" means the rate limiter
is falling back to a coarser bucket — worth checking once via `wrangler tail`.

## SEO

The site is fully indexable — there is no on/off switch to forget. Indexing is the
default, and the only thing that can mark a page `noindex` is the editor's "Hide
from Search Engines" switch in the Studio (per-page SEO and per-album SEO).

| What | Where it comes from |
| --- | --- |
| Canonical + `og:url` | The page's own path (`buildSeoMetadata(..., '/services')`) unless the editor set an absolute "Canonical URL" in the Studio |
| `robots.txt` | `src/app/robots.ts` — `Allow: /`, `Disallow: /api/`, links the sitemap |
| `sitemap.xml` | `src/app/sitemap.ts` — the 8 fixed pages plus every album from Sanity that is not hidden, with `lastModified` and up to 7 gallery images per album (image sitemap) |
| Structured data | `src/app/layout.tsx` (`ProfessionalService` with `@id`, postal address and `sameAs` from Site Settings) |
| Host | `www.dianavoloshina.com` 301/308-redirects to the apex (`next.config.mjs`) |

`NEXT_PUBLIC_SITE_URL` (a **Build** variable) decides which origin ends up in all of
the above; when it is missing from a production build, `src/lib/site.ts` falls back
to `https://dianavoloshina.com` — never to localhost or the old `workers.dev`
address.

Changing `robots.txt` or `sitemap.xml` requires a new build: they are generated at
build time and served from the ISR cache. After deploying, check
`https://dianavoloshina.com/robots.txt` (must contain `Allow: /`) and the sitemap
(8 + one URL per album). If a stale copy is still served, purge the Worker's
incremental cache, then re-submit the sitemap in Google Search Console.

### After publishing content

`npm run indexnow` (from this folder) pushes the current sitemap URLs to IndexNow,
which Bing, Yandex, Seznam and the AI search crawlers read — new albums usually
show up there within hours instead of weeks. It needs `INDEXNOW_KEY` (or the key
file in `public/`) and only talks to `api.indexnow.org`; nothing about the Worker
or its free-tier quota changes.

Google still has to be asked once: Search Console → Sitemaps → add
`https://dianavoloshina.com/sitemap.xml`, then use URL Inspection → *Request
indexing* for the home page and the main sections.

### Free-tier notes

Indexing does not change the cost of a request: static assets are served by
Cloudflare's asset server (free, unlimited), one page view costs about one Worker
invocation. Do **not** enable "Cache Everything"/Worker Cache for HTML: purging it
by cache tag is an Enterprise feature on this setup, so Studio edits would then
sit behind a stale edge copy for hours. The existing KV cache interception already
serves repeat hits without loading the Next.js bundle.

The real risk to the 100k requests/day free quota is AI/crawler traffic, not
couples. Cloudflare's managed `robots.txt` (Security → Bots / AI Crawl Control) is
the place to block AI training bots while keeping Googlebot and Bingbot allowed.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Sanity documentation](https://www.sanity.io/docs)
