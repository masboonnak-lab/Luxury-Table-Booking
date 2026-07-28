/**
 * Builds the landing page as the site at sovereign-os.online/entertainment/club.
 *
 * The three settings have to agree or the deploy breaks in a way that only
 * shows up in the browser, so they live here rather than in a shell command:
 *
 *   BASE_PATH          what the asset URLs are prefixed with
 *   OUT_DIR            where the files land — must mirror BASE_PATH, because
 *                      Workers resolve a URL path against the assets directory
 *   VITE_MOCKUP_ENTRY  which mockup renders at the base path
 *
 * Deploy the result with:
 *   pnpm dlx wrangler deploy --config artifacts/mockup-sandbox/wrangler.jsonc
 */

import { build } from "vite";

const BASE_PATH = "/entertainment/club/";
const ENTRY = "LandingPage";

process.env.BASE_PATH = BASE_PATH;
process.env.OUT_DIR = `dist${BASE_PATH}`.replace(/\/$/, "");
process.env.VITE_MOCKUP_ENTRY = ENTRY;
// API calls go to <base>/api, which the Worker proxies to the API service.
// Same-origin, so the session cookie is ordinary same-site.
process.env.VITE_API_URL = BASE_PATH.replace(/\/$/, "");
// vite.config validates PORT even for a build; it is unused here.
process.env.PORT ??= "5173";
process.env.NODE_ENV = "production";

await build();

console.log(`\nBuilt ${ENTRY} for ${BASE_PATH} into ${process.env.OUT_DIR}`);
