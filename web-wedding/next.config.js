/** @type {import('next').NextConfig} */

// Baseline hardening for every response. None of these change how the site renders;
// they remove whole classes of browser-level attacks:
//  - nosniff      : the browser must never guess a MIME type (blocks "upload looks like script" bugs),
//  - SAMEORIGIN   : the site cannot be framed by a third party (clickjacking),
//  - Referrer-Policy : full URLs are not sent to other origins,
//  - Permissions-Policy : camera/mic/geolocation stay off (no feature is used by the site).
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  images: { unoptimized: true },
  // Do not advertise the framework/version in responses.
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = nextConfig;