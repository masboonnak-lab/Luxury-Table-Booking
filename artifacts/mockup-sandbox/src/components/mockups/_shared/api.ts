/**
 * The browser's side of the API.
 *
 * Requests go to a same-origin `/api` path on purpose. The session is an
 * httpOnly cookie, and a cross-origin cookie needs SameSite=None over HTTPS on
 * both ends — which is exactly the kind of setup that works in one environment
 * and silently fails in another. Same-origin sidesteps all of it: in dev the
 * Vite server proxies /api to the API process, and in production the API has
 * to be served under the same hostname.
 */

const BASE = import.meta.env["VITE_API_URL"] ?? "";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    /** Stable machine code, e.g. `phone_taken`. */
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      // Without this the session cookie is neither sent nor stored.
      credentials: "include",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // A network failure is not a server response; saying so beats "undefined".
    throw new ApiError(0, "network", "ติดต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    // An HTML error page means the request never reached the API.
    throw new ApiError(
      res.status,
      "not_json",
      "เซิร์ฟเวอร์ตอบกลับผิดรูปแบบ — API อาจยังไม่ได้เปิดใช้งาน",
    );
  }

  if (!res.ok) {
    const err = payload as { error?: string; message?: string } | undefined;
    throw new ApiError(
      res.status,
      err?.error ?? "unknown",
      err?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่",
    );
  }

  return payload as T;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "member" | "admin";
  suspended: boolean;
  createdAt: string;
}

export interface OrderView {
  code: string;
  kind: "table" | "ticket";
  status: "pending" | "paid" | "cancelled" | "expired";
  bookerName: string;
  phone: string;
  date: string;
  slot: string;
  holdUntil: string;
  guests?: number;
  tableId?: string;
  zoneName?: string;
  eventTitle?: string;
  quantity?: number;
  amount: number;
  createdAt: string;
}

export const api = {
  register: (body: {
    name: string;
    phone: string;
    email: string;
    password: string;
    pdpaConsent: boolean;
  }) => request<AuthUser>("POST", "/auth/register", body),

  login: (body: { phone: string; password: string }) =>
    request<AuthUser>("POST", "/auth/login", body),

  logout: () => request<void>("POST", "/auth/logout"),

  me: () => request<AuthUser>("GET", "/auth/me"),

  updateProfile: (body: { name?: string; email?: string }) =>
    request<AuthUser>("PATCH", "/auth/me", body),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<void>("POST", "/auth/password", body),

  myOrders: () => request<Array<OrderView>>("GET", "/me/orders"),
};
