// Configuration for the @opennextjs/cloudflare adapter.
// Free setup: ISR cache lives in Cloudflare KV (free plan) and stale pages are
// re-rendered in the background through the memory queue + WORKER_SELF_REFERENCE.
// Sanity changes show up within ~1-2 minutes without a redeploy.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

export default defineCloudflareConfig({
	incrementalCache: kvIncrementalCache,
	queue: memoryQueue,
	// Serve SSG/ISR responses straight from the KV cache entry, without booting
	// the Next.js server bundle. Big CPU/latency win on cache hits.
	enableCacheInterception: true,
});
