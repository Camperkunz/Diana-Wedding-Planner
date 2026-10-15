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
| `NEXT_PUBLIC_SITE_URL` | Build | yes in production | Canonical origin, used for metadata/Open Graph. Falling back to localhost in a production build is treated as a mistake and fails the build on purpose |
| `RESEND_API_KEY` | Runtime (secret) | yes | Sending contact-form email |
| `RESEND_FROM_ADDRESS` | Runtime | yes | Verified sender, as `Name <addr@domain>`. Required — when it is missing the submission is rejected with a generic error and the reason is logged. There is no test-sender fallback |
| `RESEND_FALLBACK_EMAIL` | Runtime | optional | Last-resort recipient if the recipient in Sanity is unusable |

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
(free plan, no R2), so Sanity changes appear within ~1-2 minutes with no redeploy.

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

### Deploying by hand

```bash
npm run deploy
```

## Contact form

When a visitor submits the contact form:

1. the recipient address is resolved **server-side** from Sanity, never taken
   from the request, so the action cannot be abused as an open mail relay;
2. every interpolated value is HTML-escaped;
3. the reply-to address is dropped unless it parses as an email address;
4. submissions are rate limited per IP in memory (best effort — it resets on cold
   starts and is per-instance, so it is not a substitute for a CAPTCHA or a WAF).

Before launch, confirm that `RESEND_API_KEY` and `RESEND_FROM_ADDRESS` are set as
*runtime* secrets in the dashboard and that the sender domain is verified in
Resend; then submit a real test message against the deployed site. The sender has
**no fallback**: if `RESEND_FROM_ADDRESS` is missing, the submission fails with a
generic error and the Worker logs `Contact form: RESEND_FROM_ADDRESS is not
configured.`

## SEO

There is currently no `src/app/robots.ts` or `src/app/sitemap.ts`, so the site
does not serve `/robots.txt` or `/sitemap.xml`. `SITE_URL` exported from
`src/lib/site.ts` is the canonical origin to build them from if they are added.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Sanity documentation](https://www.sanity.io/docs)
