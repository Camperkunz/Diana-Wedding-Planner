# Diana Wedding Planner

A production website for an independent wedding planner, built with Next.js and Sanity CMS and deployed to Cloudflare Workers.

The site is built automatically through Cloudflare Workers Builds. Pushing to `main` triggers a production deployment.

## Tech Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **CMS:** Sanity
- **Hosting:** Cloudflare Workers with `@opennextjs/cloudflare`
- **Caching:** Incremental Static Regeneration (ISR) with Cloudflare KV and tag-based revalidation
- **Email:** Resend
- **Styling:** Tailwind CSS and shadcn/ui

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The main page entry point is `src/app/page.tsx`.

Run the TypeScript check with:

```bash
npm run typecheck
```

### Fonts

Fonts are self-hosted in `public/fonts` and declared in `src/app/globals.css`. This avoids build-time Google Fonts downloads and third-party font requests at runtime.

## Project Structure

| Path | Description |
|---|---|
| `src/app` | Routes, layouts, API endpoints and server actions |
| `src/app/sanity` | Sanity client, queries and image utilities |
| `src/lib` | Site configuration, metadata helpers and data access |
| `src/components` | Page sections and UI components |
| `public/fonts` | Self-hosted fonts |

## Deployment

Production deployments are handled by Cloudflare Workers Builds.

The application lives in `web-wedding` within the [`Camperkunz/Diana-Wedding-Planner`](https://github.com/Camperkunz/Diana-Wedding-Planner) repository.

Cloudflare build settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | `web-wedding` |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |

The deployment configuration is defined in `wrangler.jsonc` and `open-next.config.ts`. The application uses Cloudflare KV for incremental caching.

For a local production-runtime preview:

```bash
npm run preview
```

For a manual deployment:

```bash
npm run deploy
```

Production secrets must be configured in the Cloudflare dashboard, not committed to the repository.

## Content Management and Caching

Website content is managed through Sanity Studio.

Pages use ISR caching to reduce repeated server-side work. A Sanity webhook triggers tag-based revalidation when content changes, allowing updated pages to become available without waiting for the normal cache expiration window.

Cloudflare Workers Cache is intentionally disabled for HTML responses to prevent stale edge-cached pages from interfering with content updates.

## Contact Form

The contact form sends email through Resend. Recipient addresses are resolved server-side from Sanity configuration rather than accepted from visitor submissions.

The implementation includes input validation, HTML escaping, best-effort rate limiting, request deduplication and plain-text email delivery alongside HTML.

Configure the required Resend credentials and verify the sender domain before testing the production form.

## SEO

The site includes:

- Page-specific metadata and canonical URLs
- Open Graph metadata
- `robots.txt` and a dynamically generated sitemap
- Sitemap entries for published portfolio albums
- Structured data for the wedding planning business
- Per-page and per-album search engine visibility controls
- IndexNow support for notifying participating search engines of content updates

The public site URL is configured through the build environment, with a production-domain fallback.

After deployment, verify:

- [robots.txt](https://dianavoloshina.com/robots.txt)
- [XML sitemap](https://dianavoloshina.com/sitemap.xml)
- Google Search Console sitemap submission

After publishing new content, run `npm run indexnow` when search engine notification is needed. Search engine crawling and indexing are controlled by the respective search providers and are not guaranteed.

## Additional Notes

The project is configured to work within Cloudflare's free-tier constraints. Cache behavior, webhook revalidation and production environment variables should be verified when changing the deployment configuration.

For deployment troubleshooting and infrastructure-specific setup, refer to the configuration files in the repository.