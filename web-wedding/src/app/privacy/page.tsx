import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { getSiteLayout, getSiteSettings, getPrivacyPolicy, buildSeoMetadata } from '@/lib/sanity-data';
import { absoluteUrl } from '@/lib/site';
import { PRIVACY_POLICY_LAST_UPDATED } from '@/lib/legal';
import { safeMailtoHref } from '@/lib/safe-url';

// ISR: policy edits made in the Studio appear within this window.
export const revalidate = 21600;

/**
 * Privacy Policy.
 *
 * The text now lives in the Studio (Brand & Settings > Policies > Privacy Policy)
 * as a plain `text` field so the editor can update it without a deploy; this page
 * parses the small inline syntax the field documents in the Studio:
 *
 *   - every non-empty line is one paragraph (spacing is applied automatically),
 *   - a line starting with `## ` is a section heading,
 *   - consecutive lines starting with `- ` form one bulleted list,
 *   - `{name}`, `{email}`, `{address}` and `{location}` are replaced with the
 *     live values from Site Settings, so the policy can never show a stale
 *     address (the guarantee the old hardcoded version was built around).
 *
 * While the Studio document has no text yet (or was emptied by mistake), the
 * last known policy below renders instead — a legal page must never go blank.
 */

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return buildSeoMetadata(
    { canonicalUrl: absoluteUrl('/privacy') },
    `Privacy Policy | ${settings?.name || 'Diana — Wedding Planner'}`,
    'How this website collects, uses and protects personal information — contact form details, cookies and Google Analytics — and the rights you have over your data.'
  );
}

/** Clause heading. */
function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-2xl md:text-3xl text-foreground mt-14 mb-4">{children}</h2>;
}

/** Body paragraph. */
function P({ children }: { children: ReactNode }) {
  return <p className="mb-4">{children}</p>;
}

/** Body list. */
function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mb-4 space-y-2 pl-5 list-disc marker:text-accent/60">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/** Cookie or storage key. */
function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-sm bg-muted/60 px-1.5 py-0.5 text-[0.85em] text-foreground">{children}</code>
  );
}

/** Styling shared by the external references in the policy. */
const externalLink =
  'text-accent underline underline-offset-2 hover:text-accent/80 focus-visible:text-accent/80';

/** One parsed unit of the Studio `content` field. */
type PolicyBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

/** Live business values substituted into `{…}` tokens; mirrors Site Settings. */
type PolicyValues = {
  name: string;
  email: string;
  emailHref?: string;
  address: string;
  location: string;
};

/** The tokens the Studio field documents; kept in sync with its description. */
const TOKEN_PATTERN = /\{(name|email|address|location)\}/g;

/**
 * Parses the Studio `content` field. Syntax (documented on the field in the
 * Studio): every non-empty line is one paragraph, a line starting with `## ` is
 * a section heading, and consecutive lines starting with `- ` form one list.
 * Blank lines are ignored — paragraph spacing is the renderer's job.
 */
function parsePolicy(value: unknown): PolicyBlock[] {
  const lines = String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: PolicyBlock[] = [];
  for (const line of lines) {
    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith('- ')) {
      const item = line.slice(2).trim();
      const last = blocks[blocks.length - 1];
      if (last?.type === 'list') last.items.push(item);
      else blocks.push({ type: 'list', items: [item] });
      continue;
    }
    blocks.push({ type: 'paragraph', text: line });
  }
  return blocks;
}

/** Plain-text resolution of the `{…}` tokens, used for empty-block checks. */
function resolveTokens(text: string, values: PolicyValues): string {
  return text.replace(TOKEN_PATTERN, (_, token: string) => {
    const value = values[token as keyof PolicyValues];
    return typeof value === 'string' ? value : '';
  });
}

/** Renders one line with `{…}` tokens; `{email}` becomes a mailto link. */
function renderTokens(text: string, values: PolicyValues): ReactNode {
  const parts = text.split(/(\{(?:name|email|address|location)\})/g);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    switch (part) {
      case '{name}':
        return <Fragment key={index}>{values.name}</Fragment>;
      case '{email}':
        if (!values.email) return null;
        return values.emailHref ? (
          <a key={index} href={values.emailHref} className={externalLink}>
            {values.email}
          </a>
        ) : (
          <Fragment key={index}>{values.email}</Fragment>
        );
      case '{address}':
        return values.address ? <Fragment key={index}>{values.address}</Fragment> : null;
      case '{location}':
        return values.location ? <Fragment key={index}>{values.location}</Fragment> : null;
      default:
        return <Fragment key={index}>{part}</Fragment>;
    }
  });
}

/** Renders parsed blocks with the shared H2 / P / Bullets spacing. */
function PolicyText({ blocks, values }: { blocks: PolicyBlock[]; values: PolicyValues }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return <H2 key={index}>{renderTokens(block.text, values)}</H2>;
        }
        if (block.type === 'list') {
          const items = block.items
            .filter((item) => resolveTokens(item, values).trim())
            .map((item) => renderTokens(item, values));
          return items.length ? <Bullets key={index} items={items} /> : null;
        }
        // Drop paragraphs that resolve to nothing (e.g. an empty {address} line).
        if (!resolveTokens(block.text, values).trim()) return null;
        return <P key={index}>{renderTokens(block.text, values)}</P>;
      })}
    </>
  );
}

export default async function PrivacyPage() {
  const [settings, layout, policy] = await Promise.all([
    getSiteSettings(),
    getSiteLayout(),
    getPrivacyPolicy(),
  ]);

  // Same sources the footer uses, so the policy and the footer always agree.
  const businessName = settings?.name || 'Diana — Wedding Planner';
  const email = settings?.email || layout?.footerEmail || '';
  const emailHref = safeMailtoHref(email);
  const location = settings?.location || settings?.serviceArea || '';
  const address = layout?.footerAddress || settings?.address || settings?.location || '';

  const values: PolicyValues = { name: businessName, email, emailHref, address, location };
  // The Studio text wins; the constant is the fallback while the document has
  // not been published yet (it also feeds the consent recorded by the form).
  const lastUpdated = policy?.lastUpdated || PRIVACY_POLICY_LAST_UPDATED;
  const blocks = parsePolicy(policy?.content);

  return (
    <section className="pt-28 pb-20 md:pt-40 md:pb-28 bg-background">
      <div className="container-narrow">
        <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">Legal</p>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground font-light mb-12">
          Last updated: {lastUpdated}
        </p>

        <div className="text-muted-foreground font-light leading-relaxed">
          {blocks.length > 0 ? (
            <PolicyText blocks={blocks} values={values} />
          ) : (
            <>
          <P>
            This Privacy Policy explains how {businessName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
            &ldquo;our&rdquo;) collects, uses, stores and protects personal information when you visit this website (the &ldquo;Site&rdquo;) or contact us through the Site.
          </P>
          <P>
            We operate as a wedding planning business serving clients in Ottawa and surrounding areas in Ontario, Canada. We handle personal information in accordance with applicable Canadian privacy law, including the Personal Information Protection and Electronic Documents Act (PIPEDA).
          </P>
          <P>
            By using the Site or submitting the contact form you acknowledge that you have read this Privacy
            Policy. If you do not agree with it, please do not use the Site or the contact form.
          </P>

          <H2>1. Who we are</H2>
          <P>
            {businessName} is a wedding planning business based in {location}, and we are responsible for the personal information described in this Policy.
            {emailHref ? (
              <>
                {' '}
                You can reach us at{' '}
                <a href={emailHref} className={externalLink}>
                  {email}
                </a>
                .
              </>
            ) : null}
          </P>

          <H2>2. Information we collect</H2>
          <P>
            <strong className="font-medium text-foreground">You provide it directly.</strong> When you fill
            in the contact form we collect the details you enter — normally your name, e-mail address and
            message, and, where you choose to provide them, your phone number, your wedding date and the
            service you are interested in. Fields marked with an asterisk are required so that we can
            identify you and reply; the rest are optional. We do not ask for or collect any sensitive personal information, such as government ID numbers, financial information or health data.
          </P>
          <P>
            <strong className="font-medium text-foreground">Collected automatically.</strong> When you visit
            the Site, Google Analytics 4 records standard, pseudonymous usage information: which pages you
            view, how long you stay, how you arrived at the Site (for example a search engine or a social
            network), your browser and device type, your language and your approximate region.
          </P>
          <P>
            GA4 is configured with IP anonymization and Google Signals and advertising personalization are disabled.
          </P>
          <P>
            We do not use Google Analytics to intentionally identify individual visitors or to create advertising profiles.
          </P>

          <H2>3. Cookies and similar technologies</H2>
          <P>The Site uses a small number of cookies and similar technical identifiers.</P>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted-foreground font-sans font-light">
                    Name
                  </th>
                  <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted-foreground font-sans font-light">
                    Purpose
                  </th>
                  <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted-foreground font-sans font-light">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <Code>_ga</Code>
                  </td>
                  <td className="py-3 pr-4">Distinguishes one visitor from another so visits can be counted.</td>
                  <td className="py-3 pr-4">Analytics (first-party)</td>
                </tr>
                <tr className="border-b border-border/50 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <Code>_ga_&lt;container id&gt;</Code>
                  </td>
                  <td className="py-3 pr-4">Keeps the state of your session for analytics measurement.</td>
                  <td className="py-3 pr-4">Analytics (first-party)</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 pr-4">Strictly necessary technical cookies or tokens</td>
                  <td className="py-3 pr-4">Security, load balancing and delivery of the Site and its images.</td>
                  <td className="py-3 pr-4">Essential (first-party)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <P>
            These analytics cookies may remain on your device for up to two years, depending on Google&apos;s configuration. We do not use cookies for advertising, behavioural advertising, or remarketing.
          </P>
          <P>
            The analytics cookies are set by Google Analytics 4 and are used only to produce aggregate traffic
            statistics. Our hosting, content-management and image-delivery providers may also set the strictly
            necessary cookies or tokens listed above; these are required for the Site to load correctly and
            stay secure.
          </P>
          <P>
            You can also control or delete cookies through your browser settings. Disabling analytics cookies may prevent your visit from being included in our website statistics, but it does not prevent you from viewing or contacting us through the Site.
          </P>

          <H2>4. Why we use your information, and our legal bases</H2>
          <Bullets
            items={[
              <>
                To reply to your enquiry, arrange a consultation and prepare a proposal — based on your
                consent and on taking steps, at your request, before entering into a contract.
              </>,
              <>
                To keep the Site secure and protect it from spam and abuse — based on our legitimate interest
                in a safe, functioning website.
              </>,
              <>
                To understand how the Site is used and improve its content and performance — based on your
                consent where consent is required, and otherwise on our legitimate interest in improving our
                services.
              </>,
            ]}
          />
          <P>
            We do not sell, rent or trade your personal information, and we do not add you to a mailing list
            or use your contact details for marketing unless you separately agree to it. We do not use information submitted through the contact form to send unsolicited marketing communications unless you separately provide consent where required.
          </P>

          <H2>5. Who else may process your information</H2>
          <P>
            We share personal information only with the service providers that make the Site and the contact
            form work, and only to the extent necessary:
          </P>
          <Bullets
            items={[
              <>
                <strong className="font-medium text-foreground">Google LLC</strong> — Google Analytics 4, for
                website statistics.
              </>,
              <>
                <strong className="font-medium text-foreground">Resend, Inc.</strong> — delivery of
                contact-form messages to our mailbox.
              </>,
              <>
                <strong className="font-medium text-foreground">Sanity</strong> — the content-management
                system that stores the Site&rsquo;s text and images.
              </>,
              <>
                <strong className="font-medium text-foreground">Our hosting and content-delivery provider</strong>{' '}
                — serving the Site&rsquo;s pages and images.
              </>,
            ]}
          />
          <P>
            Each of these providers processes information under its own terms and only as far as necessary to
            provide its service to us.
          </P>

          <H2>6. International transfers</H2>
          <P>
            Some of the providers listed above store or process information outside Canada, including in the
            United States. Where personal information is transferred internationally we rely on the
            safeguards those providers offer, such as standard contractual clauses or equivalent protections.
          </P>

          <H2>7. How long we keep your information</H2>
          <Bullets
            items={[
              <>
                <strong className="font-medium text-foreground">Contact-form messages:</strong> kept for as
                long as needed to handle your enquiry and to keep an accurate business record, and then
                deleted or anonymised — normally within 24 months after our last contact with you.
              </>,
              <>
                <strong className="font-medium text-foreground">Analytics data:</strong> retained in Google
                Analytics 4 according to the property&rsquo;s retention settings (up to 14 months by default),
                after which it is deleted or aggregated.
              </>,
              <>
                Copies may remain in encrypted backups for a limited additional period before being
                overwritten.
              </>,
            ]}
          />

          <H2>8. Consent</H2>
          <P>
            Where required by applicable privacy law, we obtain meaningful consent for the collection, use and disclosure of personal information. The form of consent may be express or implied depending on the circumstances, the sensitivity of the information, and your reasonable expectations.
          </P>
          <P>
            When you voluntarily submit information through our contact form, we use that information for the purpose for which you provided it, including responding to your enquiry and discussing our services. You may withdraw consent to the use of your personal information at any time, subject to legal or contractual restrictions and reasonable notice. Withdrawing consent may affect our ability to continue providing certain services or responding to an enquiry. Where we intend to use personal information for a new purpose that is not reasonably connected to the original purpose, we will seek consent where required.
          </P>

          <H2>9. How to opt out of analytics</H2>
          <P>You can limit analytics tracking in any of the following ways:</P>
          <Bullets
            items={[
              <>
                install the{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={externalLink}
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                ;
              </>,
              <>
                block or delete cookies — including <Code>_ga</Code> and <Code>_ga_*</Code> — in your browser
                settings;
              </>,
              <>browse the Site in a private or incognito window.</>,
            ]}
          />
          <P>
            None of these options affects your ability to view the Site or to contact us.
          </P>

          <H2>10. Security</H2>
          <P>
            We use reasonable administrative, technical and physical safeguards appropriate to the sensitivity of the personal information we handle. The Site is served over HTTPS and uses appropriate security measures to protect information against unauthorized access, disclosure, alteration or destruction. Access to personal information is limited to people and service providers who reasonably need it for the purposes described in this Privacy Policy. No method of transmission or storage over the Internet is completely secure. While we take reasonable precautions to protect personal information, we cannot guarantee absolute security. If we experience a privacy breach involving personal information, we will assess the situation and take the steps required by applicable Canadian privacy law.
          </P>

          <H2>11. Children</H2>
          <P>
            The Site is intended for a general audience and is not directed specifically at children. We do not knowingly collect personal information from children for purposes unrelated to providing our services. If you believe that a child has provided us with personal information through the Site, please contact us so that we can review the situation and take appropriate steps.
          </P>

          <H2>12. Changes to this Privacy Policy</H2>
          <P>
            We may update this Privacy Policy to reflect changes in the tools we use or in applicable law. The
            revised version will be published on this page with a new &ldquo;Last updated&rdquo; date, and the
            new date is what the contact form records together with your consent. Continued use of the Site
            after a change means that you accept the updated Policy.
          </P>

          <H2>13. Contact us</H2>
          <P>
            If you have any questions about this Privacy Policy, or want to exercise your privacy rights, please contact us:
          </P>
          <P>
            {businessName}
            {address ? (
              <>
                <br />
                {address}
              </>
            ) : null}
            {emailHref ? (
              <>
                <br />
                <a href={emailHref} className={externalLink}>
                  {email}
                </a>
              </>
            ) : null}
          </P>
          <P>
            If you are not satisfied with our response to a privacy concern, you may contact the{' '}
            <a
              href="https://www.priv.gc.ca"
              target="_blank"
              rel="noopener noreferrer"
              className={externalLink}
            >
              Office of the Privacy Commissioner of Canada
            </a>
            .
          </P>
            </>
          )}
        </div>
      </div>
    </section>
  );
}