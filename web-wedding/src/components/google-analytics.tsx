'use client';

import Script from 'next/script';

// Strict allow-list for the GA4 Measurement ID. The ID is the only value that
// ever reaches the inline snippet below, and this pattern allows nothing but
// `G-` followed by alphanumerics — no quotes, backticks, spaces or tags — so no
// script injection is possible even if the CMS value were tampered with.
const GA_ID_PATTERN = /^G-[A-Z0-9]{4,}$/i;

type Props = { id?: string };

export function GoogleAnalytics({ id }: Props) {
  // Third validation layer (Studio rule + sanity-data mapper + here).
  // Empty/invalid ID → nothing is rendered and analytics stays fully off.
  if (!id || !GA_ID_PATTERN.test(id)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true, allow_google_signals: false });`}
      </Script>
    </>
  );
}
