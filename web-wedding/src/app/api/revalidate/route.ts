import { revalidatePath, revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { SANITY_ALL_TAG, sanityTag } from '@/lib/sanity-tags';

// Sanity webhook → ISR invalidation.
//
// The Studio posts here after every create/update/delete (webhook settings are
// documented in the README). `parseBody` verifies the `sanity-webhook-signature`
// header against SANITY_WEBHOOK_SECRET and, on success, waits ~3s so the next
// render cannot read the previous document from the Content Lake CDN.
//
// `{ expire: 0 }` marks a tag as expired *now*: OpenNext's tag cache then
// reports `hasBeenRevalidated: true` for every entry carrying that tag and the
// next request re-renders it instead of serving the stale copy. Tags are
// attached in `src/lib/sanity-tags.ts` (one per document type + `sanity:all`).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type WebhookDocument = {
    _type?: string;
    slug?: string | { current?: string };
};

/** The webhook sends a single document, or an array of them for bulk edits. */
function toDocuments(body: unknown): WebhookDocument[] {
    if (Array.isArray(body)) return body as WebhookDocument[];
    if (body && typeof body === 'object') return [body as WebhookDocument];
    return [];
}

function slugOf(document: WebhookDocument): string | null {
    if (typeof document.slug === 'string') return document.slug;
    if (document.slug && typeof document.slug.current === 'string') return document.slug.current;
    return null;
}

export async function POST(request: NextRequest) {
    const secret = process.env.SANITY_WEBHOOK_SECRET?.trim();
    if (!secret) {
        // Misconfiguration rather than a bad request: a 5xx makes Sanity retry,
        // which is what we want once the secret has been set.
        return Response.json({ message: 'SANITY_WEBHOOK_SECRET is not configured' }, { status: 500 });
    }

    let parsed: { body: WebhookDocument | WebhookDocument[] | null; isValidSignature: boolean | null };
    try {
        parsed = await parseBody<WebhookDocument | WebhookDocument[]>(request, secret);
    } catch {
        // Unreadable body or malformed signature header.
        return Response.json({ message: 'Invalid webhook payload' }, { status: 400 });
    }

    if (!parsed.isValidSignature) {
        return Response.json({ message: 'Invalid signature' }, { status: 401 });
    }

    const documents = toDocuments(parsed.body);
    const types = [
        ...new Set(
            documents
                .map((document) => document._type)
                .filter((type): type is string => Boolean(type))
        ),
    ];
    const revalidated: string[] = [];

    if (types.length === 0) {
        // Deletes and unexpected projections arrive without `_type`. Flushing the
        // global tag is the only safe answer: it cannot leave a stale page behind.
        revalidateTag(SANITY_ALL_TAG, { expire: 0 });
        revalidatePath('/', 'layout');
        revalidated.push(SANITY_ALL_TAG, 'path:/');
    } else {
        for (const type of types) {
            const tag = sanityTag(type);
            revalidateTag(tag, { expire: 0 });
            revalidated.push(tag);
        }

        // Album pages are also addressed by slug, so refresh the listing and each
        // affected detail page too — this covers a renamed album, whose old URL
        // no longer resolves to a document and therefore cannot be found by tag.
        if (types.includes('album')) {
            revalidatePath('/portfolio');
            revalidated.push('path:/portfolio');
            revalidatePath('/sitemap.xml');
            revalidated.push('path:/sitemap.xml');
            for (const document of documents) {
                const slug = slugOf(document);
                if (!slug) continue;
                revalidatePath(`/portfolio/${slug}`, 'page');
                revalidated.push(`path:/portfolio/${slug}`);
            }
        }
    }

    // The response body shows up in the Studio's webhook delivery log, which
    // makes "did the deploy have the secret?" answerable without Worker logs.
    return Response.json({ revalidated, types });
}
