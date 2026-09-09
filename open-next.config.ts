import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Defaults are deliberate. The storefront renders every page per request
 * (force-dynamic), so there is no ISR cache to configure — the database is the
 * cache.
 */
export default defineCloudflareConfig();
