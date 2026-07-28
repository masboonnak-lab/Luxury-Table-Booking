import type { NextFunction, Request, Response } from "express";
import { ZodError } from "@workspace/api-zod/errors";

import { logger } from "./logger";

/**
 * Every failure the client is allowed to see. `code` is the stable identifier
 * the UI branches on; `message` is Thai text safe to render to a guest.
 */
export class Problem extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "Problem";
  }
}

export const badRequest = (code: string, message: string): Problem =>
  new Problem(400, code, message);
export const forbidden = (code: string, message: string): Problem =>
  new Problem(403, code, message);
export const notFound = (code: string, message: string): Problem =>
  new Problem(404, code, message);
export const conflict = (code: string, message: string): Problem =>
  new Problem(409, code, message);
export const gone = (code: string, message: string): Problem =>
  new Problem(410, code, message);

/**
 * Express 5 forwards a rejected promise from an async handler to the error
 * middleware on its own, so handlers can simply throw.
 */
export function problemHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof Problem) {
    res.status(err.status).json({ error: err.code, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    // The first issue is the one worth showing; the rest are usually the same
    // mistake seen from another angle.
    const issue = err.issues[0];
    res.status(400).json({
      error: "invalid_request",
      message: issue
        ? `ข้อมูลไม่ถูกต้องที่ฟิลด์ "${issue.path.join(".") || "body"}"`
        : "ข้อมูลที่ส่งมาไม่ถูกต้อง",
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    error: "internal_error",
    message: "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
  });
}
