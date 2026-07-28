/**
 * Serves the landing page, and forwards its /api calls to the API service.
 *
 * The proxy is the whole point. The session is an httpOnly cookie, and a
 * cookie set by a different origin needs SameSite=None over HTTPS on both
 * ends — the kind of arrangement that works in one browser or one environment
 * and silently fails in another. Routing /api through this Worker means the
 * browser only ever talks to sovereign-os.online, so the cookie is ordinary
 * same-site and simply works.
 */

const API_PREFIX = "/entertainment/club/api";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === API_PREFIX || url.pathname.startsWith(`${API_PREFIX}/`)) {
      if (!env.API_ORIGIN) {
        return Response.json(
          {
            error: "api_not_configured",
            message: "ยังไม่ได้ตั้งค่าเซิร์ฟเวอร์ API",
          },
          { status: 503 },
        );
      }

      const target = new URL(env.API_ORIGIN);
      // /entertainment/club/api/auth/login -> /api/auth/login
      target.pathname = `/api${url.pathname.slice(API_PREFIX.length)}`;
      target.search = url.search;

      // Constructing from the original request keeps method, headers, body and
      // — critically — the Cookie header. Set-Cookie comes back untouched, and
      // the browser attributes it to this hostname because that is who it asked.
      return fetch(new Request(target, request));
    }

    return env.ASSETS.fetch(request);
  },
};
