# Diana Voloshina — Content Studio

The Sanity Studio powering [dianavoloshina.com](https://dianavoloshina.com). It provides a custom content management interface for website pages, services, wedding albums, brand settings and backstage videos.

The website consumes the same Sanity documents through a typed data layer, keeping content separate from the frontend implementation.

## Tech Stack

- **CMS:** Sanity Studio v6
- **Plugins:** `@sanity/vision`, `@sanity/color-input`
- **Dataset:** `production`
- **Studio structure:** Custom desk structure and singleton documents

The project ID and dataset name are public identifiers. No credentials are stored in this repository.

## Getting Started

Requires Node.js 22.

```bash
npm install
npm run dev
```

Open [http://localhost:3333](http://localhost:3333) and sign in with a Sanity account that has access to the project.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local Studio |
| `npm run build` | Build the Studio |
| `npm run start` | Serve the production build locally |
| `npm run deploy` | Deploy the hosted Studio |
| `npm run deploy-graphql` | Deploy the GraphQL API |

## Content Model

### Singleton Documents

The Studio uses fixed document IDs for site-wide settings and individual pages.

| Document | Purpose |
|---|---|
| `siteSettings` | Business details, contact information and social links |
| `siteLayout` | Header navigation and footer |
| `siteDesign` | Brand colours |
| `homePage` | Homepage content and featured content ordering |
| `aboutPage` | About page content |
| `servicesPage` | Services page content |
| `portfolioPage` | Portfolio page content |
| `faqPage` | Frequently asked questions |
| `backstagePage` | Backstage page content |
| `contactPage` | Contact form configuration |
| `privacyPolicy` | Privacy policy content |

Singleton protections prevent editors from accidentally creating, duplicating or deleting these documents through the Studio interface.

### Collections

| Document | Purpose |
|---|---|
| `album` | Wedding galleries, stories, cover images and SEO |
| `service` | Service packages, pricing and descriptions |
| `backstageVideo` | Video entries with automatically derived thumbnails |

Reusable schema objects include `seo`, `button` and `socialLink`.

## Custom Studio Experience

The desk structure groups content into Pages, Brand & Settings, Services, Wedding Albums and Backstage Videos.

Custom functionality includes:

- Centralised ordering of services and albums through the homepage document
- Bulk photo uploads with drag-and-drop gallery ordering
- Optional cover image overrides without changing gallery order
- Per-page and per-album SEO settings
- Site-wide brand colours managed through Sanity

Service and album ordering includes fallback behaviour for documents that are not explicitly ordered.

## Content Publishing and Revalidation

Publishing content triggers a Sanity webhook to the website's `/api/revalidate` endpoint.

The endpoint verifies the webhook signature and invalidates the relevant cache tags, allowing published changes to reach the website without a new deployment. The sitemap refreshes on its scheduled interval, and unpublished drafts are not exposed by the public website.

## Project Structure

| Path | Description |
|---|---|
| `schemaTypes/documents` | Page, album, service and settings schemas |
| `schemaTypes/objects/shared` | Reusable schema objects |
| `deskStructure.ts` | Custom Studio navigation |
| `components/BulkPhotosInput.tsx` | Bulk photo uploader |
| `sanity.config.ts` | Studio configuration and singleton protections |
| `sanity.cli.ts` | CLI configuration and deployment settings |

## Deployment

```bash
npm run deploy
```

This deploys the hosted Sanity Studio. Studio auto-updates are enabled through `sanity.cli.ts`.

Content changes propagate to the website through the Sanity webhook and do not require a website deployment.

## Resources

- [Sanity documentation](https://www.sanity.io/docs)
- [Studio structure builder](https://www.sanity.io/docs/structure-builder-introduction)