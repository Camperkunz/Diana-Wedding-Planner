# Diana Voloshina — Wedding Planner Website

A production website and content platform for a wedding planner, built as a
two-app monorepo: a **Next.js** front end on **Cloudflare Workers**, and a
**Sanity Studio** the client uses to edit every page, service, album and colour
without touching code.

**Live:** https://dianavoloshina.com

---

## What this is

The client needed a site that looks like an editorial portfolio rather than a
template, loads fast on mobile over mediocre networks, and — most importantly —
can be updated by a non-technical editor. Every visible string, photo, service,
price table row and brand colour is stored in Sanity; the front end is a thin,
typed rendering layer over that content.

The result is a fully static-feeling site with on-demand revalidation: publishing
in the Studio invalidates exactly the affected cache tags, so edits appear within
seconds while repeat visits are served from Cloudflare's edge without invoking
the Next.js runtime.

## Stack

| Layer | Choice |
| --- | --- |
| Front end | Next.js 16 (App Router, React Server Components, Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS 3, shadcn/ui-style primitives (Radix), self-hosted variable fonts |
| CMS | Sanity v6 — custom desk structure, singletons, colour input plugin, bulk photo uploader |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare`, KV-backed cache, custom domain |
| CI/CD | Cloudflare Workers Builds — every push to `main` builds and deploys |
| Email | Resend, called from a hardened Server Action |
| SEO | Metadata API, JSON-LD, image sitemap, robots, IndexNow |

## Engineering highlights

- **CMS-driven design system.** Colours, logo, navigation, footer, social links and
  policy copy are documents, not constants — the client can restyle the site
  without a deploy. Values are typed and validated in the schema, then applied as
  CSS custom properties.
- **On-demand ISR with tag invalidation.** A signed Sanity webhook maps changed
  document types to cache tags and revalidates them fire-and-forget
  (`src/app/api/revalidate/route.ts`). Bulk edits no longer produce N+1
  revalidations or hit the Workers timeout.
- **Edge cache for repeat traffic.** A KV layer answers previously rendered pages
  without booting the Next.js runtime — meaningful on the Workers free tier.
- **Hardened contact form.** The recipient is resolved server-side from the CMS
  (never from the request, so the action cannot be used as an open relay), every
  interpolated value is HTML-escaped, the client IP is taken only from
  Cloudflare-controlled headers, and submissions are protected by a honeypot, a
  minimum fill-time check, bounded per-IP rate limiting and a deterministic
  Resend idempotency key.
- **Large albums that stay fast.** Galleries are paginated with a server action
  and progressive loading; images go through Sanity's CDN with LQIP blur
  placeholders, responsive `srcset` and fixed aspect boxes to avoid layout shift.
- **SEO as a first-class feature.** Canonical URLs, Open Graph, `ProfessionalService`
  JSON-LD from CMS data, generated `robots.txt` and a sitemap that includes album
  pages plus per-album image entries; `npm run indexnow` pushes new URLs to
  IndexNow-aware engines.
- **Editor safety.** Singleton documents are locked in the Studio — no duplicates,
  no accidental unpublish/delete — and destructive fields are constrained by
  schema validation instead of convention.
- **Type-safety end to end.** Shared content projections, typed queries and
  `tsc --noEmit` in CI-adjacent scripts; `any` stays out of the data layer.

--- 
Useful checks in `web-wedding`:

```bash
npm run typecheck   # tsc --noEmit
npm run preview     # build and run in the local Workers runtime
```

## Deployment

The website deploys automatically: Workers Builds checks out the repository,
builds the Worker with the OpenNext adapter and ships it on every push to `main`.

## Licence and usage

Published as a **portfolio case study with the client's permission**. This is not
open source: no licence is granted to reuse, redistribute or deploy this code or
its design. The brand, copy, photography and all content belong to
**Diana Voloshina**.

Code and architecture by [@Camperkunz](https://github.com/Camperkunz).

