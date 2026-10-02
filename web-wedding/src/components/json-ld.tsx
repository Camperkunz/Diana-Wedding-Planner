/**
 * Renders structured data (schema.org) for search engines.
 *
 * The payload is JSON produced in server components, and `<` is escaped so a
 * string coming from the CMS can never close the `<script>` tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
