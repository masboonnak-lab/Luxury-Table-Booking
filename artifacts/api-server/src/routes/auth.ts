import { Router, type IRouter, type Request } from "express";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db, sessionsTable, usersTable, type User } from "@workspace/db";
import {
  GetCurrentUserResponse,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "@workspace/api-zod";

import { pgErrorCode, UNIQUE_VIOLATION } from "../domain/holds";
import { hashPassword, verifyPassword } from "../domain/password";
import { isThaiPhone, normalisePhone } from "../domain/phone";
import {
  cookieOptions,
  hashToken,
  newSessionToken,
  SESSION_COOKIE,
  sessionExpiry,
} from "../domain/session";
import { badRequest, conflict, Problem } from "../lib/problem";

const router: IRouter = Router();

function toAuthUser(user: User): {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
} {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email ?? undefined,
    createdAt: user.createdAt,
  };
}

const unauthorized = (message: string): Problem =>
  new Problem(401, "unauthorized", message);

function requirePhone(raw: string): string {
  const phone = normalisePhone(raw);
  if (!isThaiPhone(phone)) {
    throw badRequest(
      "invalid_phone",
      "เบอร์โทรไม่ถูกต้อง (ขึ้นต้นด้วย 0 และมี 9–10 หลัก)",
    );
  }
  return phone;
}

/** Resolves the session cookie to a user, or null. Never throws on a bad cookie. */
export async function currentUser(req: Request): Promise<User | null> {
  const token = (req.cookies as Record<string, string> | undefined)?.[
    SESSION_COOKIE
  ];
  if (!token) {
    return null;
  }

  const [found] = await db
    .select({ user: usersTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(sessionsTable.tokenHash, hashToken(token)),
        isNull(sessionsTable.revokedAt),
        gt(sessionsTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return found?.user ?? null;
}

router.post("/auth/register", async (req, res) => {
  const body = RegisterBody.parse(req.body);
  const phone = requirePhone(body.phone);

  if (!body.pdpaConsent) {
    throw badRequest(
      "consent_required",
      "ต้องยินยอมให้เก็บข้อมูลส่วนบุคคลก่อนสมัครสมาชิก",
    );
  }

  const now = new Date();
  const passwordHash = await hashPassword(body.password);

  const user = await db
    .insert(usersTable)
    .values({
      name: body.name.trim(),
      phone,
      email: body.email?.trim() || null,
      passwordHash,
      pdpaConsentAt: now,
      lastLoginAt: now,
    })
    .returning()
    .then((rows) => rows[0]!)
    .catch((err: unknown) => {
      if (pgErrorCode(err) === UNIQUE_VIOLATION) {
        throw conflict(
          "phone_taken",
          "เบอร์โทรนี้สมัครสมาชิกไว้แล้ว กรุณาเข้าสู่ระบบ",
        );
      }
      throw err;
    });

  const { token, tokenHash } = newSessionToken();
  const expiresAt = sessionExpiry(now);
  await db
    .insert(sessionsTable)
    .values({ userId: user.id, tokenHash, expiresAt });

  res.cookie(SESSION_COOKIE, token, cookieOptions(expiresAt));
  res.status(201).json(RegisterResponse.parse(toAuthUser(user)));
});

router.post("/auth/login", async (req, res) => {
  const body = LoginBody.parse(req.body);
  const phone = normalisePhone(body.phone);

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);

  // Same message and roughly the same work either way, so the response does
  // not reveal whether the phone number has an account.
  const ok = user
    ? await verifyPassword(body.password, user.passwordHash)
    : await verifyPassword(body.password, "scrypt$AAAA$AAAA").then(() => false);

  if (!user || !ok) {
    throw unauthorized("เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง");
  }

  const now = new Date();
  const { token, tokenHash } = newSessionToken();
  const expiresAt = sessionExpiry(now);

  await db.transaction(async (tx) => {
    await tx
      .insert(sessionsTable)
      .values({ userId: user.id, tokenHash, expiresAt });
    await tx
      .update(usersTable)
      .set({ lastLoginAt: now })
      .where(eq(usersTable.id, user.id));
  });

  res.cookie(SESSION_COOKIE, token, cookieOptions(expiresAt));
  res.json(LoginResponse.parse(toAuthUser(user)));
});

router.post("/auth/logout", async (req, res) => {
  const token = (req.cookies as Record<string, string> | undefined)?.[
    SESSION_COOKIE
  ];

  if (token) {
    await db
      .update(sessionsTable)
      .set({ revokedAt: sql`now()` })
      .where(
        and(
          eq(sessionsTable.tokenHash, hashToken(token)),
          isNull(sessionsTable.revokedAt),
        ),
      );
  }

  res.clearCookie(SESSION_COOKIE, cookieOptions(new Date(0)));
  res.status(204).end();
});

router.get("/auth/me", async (req, res) => {
  const user = await currentUser(req);
  if (!user) {
    throw unauthorized("กรุณาเข้าสู่ระบบ");
  }
  res.json(GetCurrentUserResponse.parse(toAuthUser(user)));
});

export default router;
