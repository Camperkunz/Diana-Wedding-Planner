// Configuration for the @opennextjs/cloudflare adapter.
// Keeping the R2 incremental cache means pages with `export const revalidate`
// are cached in the `NEXT_INC_CACHE_R2_BUCKET` bucket declared in wrangler.jsonc
// instead of being re-rendered on every request.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
	incrementalCache: r2IncrementalCache,
});
