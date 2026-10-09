/**
 * Versioning for the legal pages.
 *
 * The Privacy Policy text now lives in the Studio (Brand & Settings > Policies)
 * and its "Last updated" field is the version recorded with a contact-form
 * consent — the /privacy page and the form read the same document, so they
 * cannot drift apart. This constant is only the fallback used while that
 * document has not been published yet; when the policy changes in the Studio,
 * update the `Last Updated` field there (not this constant).
 */
export const PRIVACY_POLICY_LAST_UPDATED = 'October 2, 2026';
