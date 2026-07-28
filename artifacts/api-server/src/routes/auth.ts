import { Router, type IRouter, type Request } from "express";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import {
  db,
  ordersTable,
  sessionsTable,
  usersTable,
  type User,
} from "@workspace/db";
import {
  ChangePasswordBody,
  GetCurrentUserResponse,
  ListMyOrdersQueryParams,
  ListMyOrdersResponse,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";

import { pgErrorCode, UNIQUE_VIOLATION } from "../domain/holds";
import { viewAll } from "../domain/order-lookup";
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

export function toAuthUser(user: User): {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: User["role"];
  suspended: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
} {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    suspended: user.suspendedAt !== null,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt ?? undefined,
  };
}

export const unauthorized = (message: string): Problem =>
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

/** The session or a 401 — the shape every signed-in route starts from. */
export async function requireUser(req: Request): Promise<User> {
  const user = await currentUser(req);
  if (!user) {
    throw unauthorized("กรุณาเข้าสู่ระบบ");
  }
  if (user.suspendedAt) {
    throw new Problem(
      403,
      "account_suspended",
      "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อร้าน",
    );
  }
  return user;
}

/** Same, and it must be an admin. */
export async function requireAdmin(req: Request): Promise<User> {
  const user = await requireUser(req);
  if (user.role !== "admin") {
    throw new Problem(403, "forbidden", "ต้องเป็นผู้ดูแลระบบเท่านั้น");
  }
  return user;
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
      email: body.email.trim().toLowerCase(),
      passwordHash,
      pdpaConsentAt: now,
      lastLoginAt: now,
    })
    .returning()
    .then((rows) => rows[0]!)
    .catch((err: unknown) => {
      if (pgErrorCode(err) === UNIQUE_VIOLATION) {
        // Two unique columns can trip; say which so the guest can act on it.
        const taken = String(err).includes("email") ? "email" : "phone";
        throw conflict(
          taken === "email" ? "email_taken" : "phone_taken",
          taken === "email"
            ? "อีเมลนี้สมัครสมาชิกไว้แล้ว กรุณาเข้าสู่ระบบ"
            : "เบอร์โทรนี้สมัครสมาชิกไว้แล้ว กรุณาเข้าสู่ระบบ",
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
  if (user.suspendedAt) {
    throw new Problem(
      403,
      "account_suspended",
      "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อร้าน",
    );
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
  const user = await requireUser(req);
  res.json(GetCurrentUserResponse.parse(toAuthUser(user)));
});

/* ---------------------------------------------------------------- profile */

router.patch("/auth/me", async (req, res) => {
  const user = await requireUser(req);
  const body = UpdateProfileBody.parse(req.body);

  const changes: Partial<{ name: string; email: string }> = {};
  if (body.name !== undefined) {
    changes.name = body.name.trim();
  }
  if (body.email !== undefined) {
    changes.email = body.email.trim().toLowerCase();
  }

  if (Object.keys(changes).length === 0) {
    res.json(UpdateProfileResponse.parse(toAuthUser(user)));
    return;
  }

  const updated = await db
    .update(usersTable)
    .set({ ...changes, updatedAt: new Date() })
    .where(eq(usersTable.id, user.id))
    .returning()
    .then((rows) => rows[0]!)
    .catch((err: unknown) => {
      if (pgErrorCode(err) === UNIQUE_VIOLATION) {
        throw conflict("email_taken", "อีเมลนี้ถูกใช้กับบัญชีอื่นแล้ว");
      }
      throw err;
    });

  res.json(UpdateProfileResponse.parse(toAuthUser(updated)));
});

router.post("/auth/password", async (req, res) => {
  const user = await requireUser(req);
  const body = ChangePasswordBody.parse(req.body);

  if (!(await verifyPassword(body.currentPassword, user.passwordHash))) {
    throw unauthorized("รหัสผ่านเดิมไม่ถูกต้อง");
  }

  const passwordHash = await hashPassword(body.newPassword);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(usersTable)
      .set({ passwordHash, updatedAt: now })
      .where(eq(usersTable.id, user.id));

    // A password is usually changed because the old one leaked, so every other
    // session has to go with it. The current one is re-issued below.
    await tx
      .update(sessionsTable)
      .set({ revokedAt: now })
      .where(and(eq(sessionsTable.userId, user.id), isNull(sessionsTable.revokedAt)));
  });

  const { token, tokenHash } = newSessionToken();
  const expiresAt = sessionExpiry(now);
  await db
    .insert(sessionsTable)
    .values({ userId: user.id, tokenHash, expiresAt });

  res.cookie(SESSION_COOKIE, token, cookieOptions(expiresAt));
  res.status(204).end();
});

router.get("/me/orders", async (req, res) => {
  const user = await requireUser(req);
  const query = ListMyOrdersQueryParams.parse(req.query);

  // Matched on phone, not user id: a booking made before signing up should
  // still show up in the member's list.
  const rows = await db
    .select()
    .from(ordersTable)
    .where(
      query.kind
        ? and(eq(ordersTable.phone, user.phone), eq(ordersTable.kind, query.kind))
        : eq(ordersTable.phone, user.phone),
    )
    .orderBy(desc(ordersTable.createdAt));

  res.json(ListMyOrdersResponse.parse(await viewAll(rows)));
});

export default router;
