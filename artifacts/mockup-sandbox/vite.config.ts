import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";
import { BRAND } from "./src/components/mockups/_shared/brand";

/**
 * When one mockup is deployed as a real site (VITE_MOCKUP_ENTRY), the sandbox's
 * "Mockup Canvas" title and 🎨 favicon are wrong in a way visitors can see.
 * Swap in the venue's identity from the brand config.
 */
function brandedHtmlPlugin() {
  const entry = process.env.VITE_MOCKUP_ENTRY;

  return {
    name: "branded-index-html",
    transformIndexHtml(html: string): string {
      if (!entry) {
        return html;
      }
      const title = `${BRAND.venueName} · ${BRAND.venueTagline}`;
      return html
        .replace(/<html lang="en"/, '<html lang="th"')
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace(/content="Mockup Canvas"/g, `content="${BRAND.venueName}"`)
        .replace(
          /content="UI prototyping sandbox with infinite canvas"/g,
          `content="${BRAND.venueTagline}"`,
        );
    },
  };
}

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Replit binds IPv4-only. On hosts where `localhost` resolves to ::1 first
// (e.g. Windows), browsers hit IPv6 and get refused — set HOST=:: to dual-stack.
const host = process.env.HOST ?? "0.0.0.0";

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    mockupPreviewPlugin(),
    brandedHtmlPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    // Cloudflare Workers map a URL path onto a file path under the assets
    // directory, so a site living at /entertainment/club must be built into a
    // matching folder. OUT_DIR is how that is asked for.
    outDir: path.resolve(import.meta.dirname, process.env.OUT_DIR ?? "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host,
    allowedHosts: true,
    fs: {
      strict: true,
    },
    // The session is an httpOnly cookie. Proxying keeps /api same-origin, so
    // the browser stores and sends it without SameSite=None and HTTPS on both
    // ends — the setup that works locally and fails in production, or vice
    // versa. Production must serve the API under the same hostname too.
    proxy: {
      "/api": {
        target: process.env.API_TARGET ?? "http://127.0.0.1:5100",
        changeOrigin: false,
      },
    },
  },
  preview: {
    port,
    host,
    allowedHosts: true,
  },
});
