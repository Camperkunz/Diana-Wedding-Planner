/** @type {import('next').NextConfig} */

// ── Security headers ────────────────────────────────────────────────────────
// Sent with every response. None of them change how the site looks or renders;
// they remove whole classes of browser-level attacks:
//  - nosniff            : the browser must never guess a MIME type,
//  - DENY               : the site can never be put inside a frame (clickjacking),
//  - Referrer-Policy    : full URLs are not sent to other origins,
//  - Permissions-Policy : camera / mic / location / payment stay off (unused),
//  - HSTS               : browsers only ever talk to this domain over HTTPS,
//  - COOP               : no other window can reach into this one,
//  - CSP                : only the scripts, images and frames the site really uses.
//
// The Content-Security-Policy is an allow-list for exactly what this website
// loads: the Sanity image CDN (all photos), the YouTube / Vimeo players used by
// the Backstage page plus their thumbnails, and Google Analytics (which only
// becomes active when a Measurement ID is saved in the Studio).
// `'unsafe-inline'` is required by the small inline snippets Next.js and the
// GA4 tag emit; `'unsafe-eval'` is added in development only (Turbopack).

const nextConfig = (phase) => {
  // The phase is passed by the Next.js CLI itself. Checking NODE_ENV here is
  // unreliable: on Next 16 the config is evaluated before NODE_ENV is pinned to
  // "production", which used to leak 'unsafe-eval' into the live CSP.
  const isDev = phase === 'phase-development-server';

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.sanity.io https://img.youtube.com https://i.ytimg.com https://i.vimeocdn.com",
    "font-src 'self'",
    "connect-src 'self' https://cdn.sanity.io https://*.sanity.io https://*.google-analytics.com https://www.googletagmanager.com",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ');

  const securityHeaders = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Content-Security-Policy', value: csp },
  ];

  return {
    // Do not advertise the framework/version in responses.
    poweredByHeader: false,
    async headers() {
      return [{ source: '/:path*', headers: securityHeaders }];
    },
  };
};

module.exports = nextConfig;