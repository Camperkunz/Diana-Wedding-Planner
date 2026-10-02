This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment variables

All values live in `.env.local` (git-ignored) locally and in the hosting
dashboard (project → Settings → Environment Variables) in production.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | Sanity project the Studio writes to. |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Usually `production`. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Public origin of the site, e.g. `https://dianaweddings.ca`. Drives `metadataBase`, canonical URLs, `og:url`, `robots.txt` and the sitemap. Falls back to the built-in default when unset. |
| `RESEND_API_KEY` | yes (contact form) | API key from [resend.com](https://resend.com). |
| `RESEND_FROM_ADDRESS` | yes (contact form) | Verified sender, e.g. `Diana <hello@example.ca>`. When missing, the form falls back to `Contact Form <onboarding@resend.dev>` — Resend only accepts that for test emails to your own account, so production must set a **verified** address. |
| `RESEND_FALLBACK_EMAIL` | optional | Last-resort recipient when no valid address is configured in the Studio. |

### Contact form go-live checklist

1. **Verify a sending domain in Resend** (Domains → Add Domain → add the DNS
   records). Without it, emails are sent from `onboarding@resend.dev` and are
   treated as test traffic.
2. Set `RESEND_FROM_ADDRESS` to an address **on that verified domain**.
3. In the Studio open **Contact Page → Form Recipient Email** (recipient falls
   back to Site Settings → Contact Details → email, then `RESEND_FALLBACK_EMAIL`).
4. Spam protection is already built in: a hidden honeypot field
   (`_hp_website`), per-IP rate limiting (3 sends / 10 min) and server-side
   escaping of every submitted value.

### SEO files

`src/app/robots.ts` and `src/app/sitemap.ts` generate `/robots.txt` and
`/sitemap.xml` automatically from `NEXT_PUBLIC_SITE_URL` — no extra
configuration needed when the domain changes.
