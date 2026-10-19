// Configuration for the @opennextjs/cloudflare adapter.
// ISR cache lives in Cloudflare KV, stale entries are revalidated through a
// Durable Object queue, and cache tags live in a Durable Object as well:
// `/api/revalidate` turns a Sanity webhook into `revalidateTag()` calls, so an
// edit in the Studio is live within seconds. The `revalidate` exports on the
// pages stay as a safety net for anything the webhook did not catch.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";

export default defineCloudflareConfig({
	incrementalCache: kvIncrementalCache,
	// The memory queue was used before: on a stale cache entry OpenNext
	// *blocks the user request* while it sends a HEAD revalidation to this same
	// worker with a hard 10s `AbortSignal.timeout`. When the re-render did not
	// finish in 10s, the queue logged `TimeoutError: The operation was aborted
	// due to timeout`, wrote nothing to KV, and the page stayed stale — so every
	// following visitor waited another 10s before getting the stale HTML.
	// The Durable Object queue hands the job over immediately (the revalidation
	// itself runs in `ctx.waitUntil`) and retries with backoff, so a slow render
	// never delays the response. Requires the NEXT_CACHE_DO_QUEUE binding and
	// the `v1` migration in wrangler.jsonc.
	queue: doQueue,
	// Tag cache — the store `revalidateTag()` / `revalidatePath()` write to.
	// Without it the adapter resolves the tag cache to `"dummy"` (its default),
	// every revalidation is a silent no-op, and `/api/revalidate` would change
	// nothing.
	//
	// Why Durable Objects instead of the KV tag cache: KV is cheaper to set up
	// (one namespace) but only guarantees ~60s global propagation, which is the
	// same order of magnitude as the ISR window this is supposed to beat. The
	// sharded DO tag cache reads and writes synchronously during the request, so
	// a webhook takes effect immediately. It needs the NEXT_TAG_CACHE_DO_SHARDED
	// binding and the `v2` migration in wrangler.jsonc; the class itself is
	// already exported by the adapter's worker entry. `next dev` has no DO
	// binding, so the override is a no-op there (dev renders uncached anyway).
	tagCache: doShardedTagCache,
	// Serve SSG/ISR responses straight from the KV cache entry, without booting
	// the Next.js server bundle. Big CPU/latency win on cache hits.
	enableCacheInterception: true,
});
