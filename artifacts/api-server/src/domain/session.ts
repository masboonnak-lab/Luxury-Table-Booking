import { createHash, randomBytes } from "node:crypto";
import type { CookieOptions } from "express";

export const SESSION_COOKIE = "session";

/** Long enough that a guest is not asked to sign in every visit. */
export const SESSION_TTL_DAYS = 30;

/**
 * The cookie carries the token; the database stores only its digest. A dump of
 * `sessions` therefore cannot be replayed as a login.
 */
export function newSessionToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function cookieOptions(expiresAt: Date): CookieOptions {
  return {
    httpOnly: true,
    // Lax, not None: the site reaches the API through a same-origin /api path,
    // so the cookie is never sent cross-site and does not need the weaker
    // setting. If the API is ever called from another origin, that call needs
    // SameSite=None and HTTPS on both ends — change it deliberately, not by
    // discovering sign-in silently fails in one browser.
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    expires: expiresAt,
  };
}
