// Configuration for the @opennextjs/cloudflare adapter.
// ISR cache lives in Cloudflare KV and stale pages are revalidated through a
// Durable Object queue. Sanity changes show up within ~1-2 minutes without a
// redeploy.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

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
	// Serve SSG/ISR responses straight from the KV cache entry, without booting
	// the Next.js server bundle. Big CPU/latency win on cache hits.
	enableCacheInterception: true,
});
