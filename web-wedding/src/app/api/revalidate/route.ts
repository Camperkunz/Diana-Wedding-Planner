import { revalidatePath, revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { SANITY_ALL_TAG, sanityTag } from '@/lib/sanity-tags';

// Sanity webhook → ISR invalidation.
//
// What changed vs. the previous version:
//  - Album edits no longer trigger revalidatePath('/sitemap.xml') and per-slug
//    revalidatePath('/portfolio/${slug}'). Those queued one extra HEAD per
//    affected document and pushed DOQueueHandler.revalidate to the 30s Workers
//    timeout under normal editing. Listing + detail pages both carry
//    sanityTag('album'), so a single revalidateTag('album') covers them.
//  - The actual invalidation work is fire-and-forget via ctx.waitUntil(), so
//    Sanity gets its 200 back in <100 ms instead of ~3 s and stops retrying.
//
// The `parseBody` ~3 s wait is intentional: it lets the Content Lake CDN catch
// up before the next render, so we do NOT try to shortcut it.

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

export async function POST(request: NextRequest) {
    const secret = process.env.SANITY_WEBHOOK_SECRET?.trim();
    if (!secret) {
        console.error('[revalidate] SANITY_WEBHOOK_SECRET is not configured');
        return Response.json(
            { message: 'SANITY_WEBHOOK_SECRET is not configured' },
            { status: 500 }
        );
    }

    let parsed: {
        body: WebhookDocument | WebhookDocument[] | null;
        isValidSignature: boolean | null;
    };
    try {
        parsed = await parseBody<WebhookDocument | WebhookDocument[]>(request, secret);
    } catch (error) {
        console.error('[revalidate] could not read the webhook payload', error);
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

    const tagsToRevalidate: string[] = [];
    const pathsToRevalidate: Array<{ path: string; type: 'page' | 'layout' }> = [];

    if (types.length === 0) {
        // Deletes and unexpected projections arrive without `_type`. Flushing the
        // global tag is the only safe answer: it cannot leave a stale page behind.
        tagsToRevalidate.push(SANITY_ALL_TAG);
        pathsToRevalidate.push({ path: '/', type: 'layout' });
    } else {
        for (const type of types) {
            tagsToRevalidate.push(sanityTag(type));
        }

        // Album pages (listing + detail) are tagged with sanityTag('album') in
        // sanity-data.ts, so the tag revalidation above already covers them.
        // Explicitly NOT added here on purpose:
        //   - revalidatePath('/portfolio')      → redundant with the tag
        //   - revalidatePath('/sitemap.xml')    → re-renders the whole sitemap per edit
        //   - revalidatePath('/portfolio/${slug}') → N+1 HEAD per bulk edit,
        //     was the direct cause of 30s DOQueueHandler.revalidate timeouts.
        // Sitemap freshness is handled by the sitemap route's own revalidate value.
    }

    const work = (async () => {
        for (const tag of tagsToRevalidate) {
            try {
                revalidateTag(tag, { expire: 0 });
            } catch (error) {
                console.error(`[revalidate] revalidateTag(${tag}) failed`, error);
            }
        }
        for (const { path, type } of pathsToRevalidate) {
            try {
                revalidatePath(path, type);
            } catch (error) {
                console.error(`[revalidate] revalidatePath(${path}) failed`, error);
            }
        }
    })();

    // Fire-and-forget on Cloudflare Workers. Fall back to awaiting when running
    // outside Workers (next dev, unit tests, local node) so the handler still
    // behaves correctly and doesn't silently skip revalidation.
    let queued = false;
    try {
        const { ctx } = await getCloudflareContext({ async: true });
        if (ctx?.waitUntil) {
            ctx.waitUntil(work);
            queued = true;
        }
    } catch (error) {
        console.warn('[revalidate] getCloudflareContext unavailable, running inline', error);
    }

    if (!queued) {
        await work;
    }

    return Response.json({
        revalidated: [
            ...tagsToRevalidate,
            ...pathsToRevalidate.map((p) => `path:${p.path}`),
        ],
        types,
    });
}