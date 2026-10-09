import { defineType, defineField } from 'sanity'

/**
 * Privacy Policy — the text of the legal page at /privacy.
 *
 * Deliberately a plain `text` field (the same editing model as the FAQ answers):
 * the document is long but never structured data, and the site parses the small
 * inline syntax itself. See `content.description` for the syntax shown to editors
 * and `src/app/privacy/page.tsx` for the matching parser.
 */
export const privacyPolicy = defineType({
  name: 'privacyPolicy',
  title: 'Privacy Policy',
  type: 'document',
  description:
    'The text of the Privacy Policy page (/privacy). Layout is fixed in the website; only the text is editable here.',
  // Seed the document with the text that used to live hardcoded in the page, so
  // the editor opens it pre-filled and only has to press Publish.
  initialValue: {
    lastUpdated: 'October 2, 2026',
    content: `This Privacy Policy explains how {name} (“we”, “us”, “our”) collects, uses, stores and protects personal information when you visit this website (the “Site”) or contact us through the Site.
We operate as a wedding planning business serving clients in Ottawa and surrounding areas in Ontario, Canada. We handle personal information in accordance with applicable Canadian privacy law, including the Personal Information Protection and Electronic Documents Act (PIPEDA).
By using the Site or submitting the contact form you acknowledge that you have read this Privacy Policy. If you do not agree with it, please do not use the Site or the contact form.
## 1. Who we are
{name} is a wedding planning business based in {location}, and we are responsible for the personal information described in this Policy. You can reach us at {email}.
## 2. Information we collect
You provide it directly. When you fill in the contact form we collect the details you enter — normally your name, e-mail address and message, and, where you choose to provide them, your phone number, your wedding date and the service you are interested in. Fields marked with an asterisk are required so that we can identify you and reply; the rest are optional. We do not ask for or collect any sensitive personal information, such as government ID numbers, financial information or health data.
Collected automatically. When you visit the Site, Google Analytics 4 records standard, pseudonymous usage information: which pages you view, how long you stay, how you arrived at the Site (for example a search engine or a social network), your browser and device type, your language and your approximate region.
GA4 is configured with IP anonymization and Google Signals and advertising personalization are disabled.
We do not use Google Analytics to intentionally identify individual visitors or to create advertising profiles.
## 3. Cookies and similar technologies
The Site uses a small number of cookies and similar technical identifiers.
- _ga — distinguishes one visitor from another so visits can be counted (analytics, first-party).
- _ga_<container id> — keeps the state of your session for analytics measurement (analytics, first-party).
- Strictly necessary technical cookies or tokens — security, load balancing and delivery of the Site and its images (essential, first-party).
These analytics cookies may remain on your device for up to two years, depending on Google's configuration. We do not use cookies for advertising, behavioural advertising, or remarketing.
The analytics cookies are set by Google Analytics 4 and are used only to produce aggregate traffic statistics. Our hosting, content-management and image-delivery providers may also set the strictly necessary cookies or tokens listed above; these are required for the Site to load correctly and stay secure.
You can also control or delete cookies through your browser settings. Disabling analytics cookies may prevent your visit from being included in our website statistics, but it does not prevent you from viewing or contacting us through the Site.
## 4. Why we use your information, and our legal bases
- To reply to your enquiry, arrange a consultation and prepare a proposal — based on your consent and on taking steps, at your request, before entering into a contract.
- To keep the Site secure and protect it from spam and abuse — based on our legitimate interest in a safe, functioning website.
- To understand how the Site is used and improve its content and performance — based on your consent where consent is required, and otherwise on our legitimate interest in improving our services.
We do not sell, rent or trade your personal information, and we do not add you to a mailing list or use your contact details for marketing unless you separately agree to it. We do not use information submitted through the contact form to send unsolicited marketing communications unless you separately provide consent where required.
## 5. Who else may process your information
We share personal information only with the service providers that make the Site and the contact form work, and only to the extent necessary:
- Google LLC — Google Analytics 4, for website statistics.
- Resend, Inc. — delivery of contact-form messages to our mailbox.
- Sanity — the content-management system that stores the Site's text and images.
- Our hosting and content-delivery provider — serving the Site's pages and images.
Each of these providers processes information under its own terms and only as far as necessary to provide its service to us.
## 6. International transfers
Some of the providers listed above store or process information outside Canada, including in the United States. Where personal information is transferred internationally we rely on the safeguards those providers offer, such as standard contractual clauses or equivalent protections.
## 7. How long we keep your information
- Contact-form messages: kept for as long as needed to handle your enquiry and to keep an accurate business record, and then deleted or anonymised — normally within 24 months after our last contact with you.
- Analytics data: retained in Google Analytics 4 according to the property's retention settings (up to 14 months by default), after which it is deleted or aggregated.
- Copies may remain in encrypted backups for a limited additional period before being overwritten.
## 8. Consent
Where required by applicable privacy law, we obtain meaningful consent for the collection, use and disclosure of personal information. The form of consent may be express or implied depending on the circumstances, the sensitivity of the information, and your reasonable expectations.
When you voluntarily submit information through our contact form, we use that information for the purpose for which you provided it, including responding to your enquiry and discussing our services. You may withdraw consent to the use of your personal information at any time, subject to legal or contractual restrictions and reasonable notice. Withdrawing consent may affect our ability to continue providing certain services or responding to an enquiry. Where we intend to use personal information for a new purpose that is not reasonably connected to the original purpose, we will seek consent where required.
## 9. How to opt out of analytics
You can limit analytics tracking in any of the following ways:
- install the Google Analytics Opt-out Browser Add-on (https://tools.google.com/dlpage/gaoptout);
- block or delete cookies — including _ga and _ga_* — in your browser settings;
- browse the Site in a private or incognito window.
None of these options affects your ability to view the Site or to contact us.
## 10. Security
We use reasonable administrative, technical and physical safeguards appropriate to the sensitivity of the personal information we handle. The Site is served over HTTPS and uses appropriate security measures to protect information against unauthorized access, disclosure, alteration or destruction. Access to personal information is limited to people and service providers who reasonably need it for the purposes described in this Privacy Policy. No method of transmission or storage over the Internet is completely secure. While we take reasonable precautions to protect personal information, we cannot guarantee absolute security. If we experience a privacy breach involving personal information, we will assess the situation and take the steps required by applicable Canadian privacy law.
## 11. Children
The Site is intended for a general audience and is not directed specifically at children. We do not knowingly collect personal information from children for purposes unrelated to providing our services. If you believe that a child has provided us with personal information through the Site, please contact us so that we can review the situation and take appropriate steps.
## 12. Changes to this Privacy Policy
We may update this Privacy Policy to reflect changes in the tools we use or in applicable law. The revised version will be published on this page with a new “Last updated” date, and the new date is what the contact form records together with your consent. Continued use of the Site after a change means that you accept the updated Policy.
## 13. Contact us
If you have any questions about this Privacy Policy, or want to exercise your privacy rights, please contact us:
{name}
{address}
{email}
If you are not satisfied with our response to a privacy concern, you may contact the Office of the Privacy Commissioner of Canada (https://www.priv.gc.ca).`,
  },
  fields: [
    defineField({
      name: 'content',
      title: 'Policy Text',
      type: 'text',
      rows: 30,
      description:
        'Syntax: every new line starts a new paragraph (empty lines are ignored). Start a line with "## " to make a section heading, e.g. "## 1. Who we are". Consecutive lines starting with "- " become one bulleted list. The placeholders {name}, {email}, {address} and {location} are replaced on the website with the live values from Business & Contact Info, so the policy can never show a stale address.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'string',
      description:
        'Shown under the page title as "Last updated: …" and recorded by the contact form as the policy version of the consent, e.g. "October 2, 2026". Update it whenever the text above changes.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Privacy Policy', subtitle: 'Fixed design · editable text' }),
  },
})
