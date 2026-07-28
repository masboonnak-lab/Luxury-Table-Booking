import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  eventsTable,
  ordersTable,
  slipsTable,
  venueTablesTable,
  zonesTable,
  type InsertOrder,
  type Order as OrderRow,
} from "@workspace/db";
import {
  CancelOrderBody,
  CancelOrderParams,
  CancelOrderResponse,
  CreateBookingBody,
  CreateBookingResponse,
  CreateTicketOrderBody,
  CreateTicketOrderResponse,
  GetOrderParams,
  GetOrderResponse,
  ListOrdersQueryParams,
  ListOrdersResponse,
  SubmitSlipBody,
  SubmitSlipParams,
  SubmitSlipResponse,
} from "@workspace/api-zod";

import { advisoryKey, orderCode } from "../domain/codes";
import { holdsInventory, pgErrorCode, UNIQUE_VIOLATION } from "../domain/holds";
import { depositSatang } from "../domain/money";
import { viewAll, viewOf } from "../domain/order-lookup";
import { toOrderView } from "../domain/order-view";
import { isThaiPhone, normalisePhone } from "../domain/phone";
import {
  addDays,
  DEFAULT_HOLD_UNTIL,
  DEFAULT_SLOT,
  MAX_BOOKING_DAYS_AHEAD,
  PAYMENT_WINDOW_MINUTES,
  RECEIPT_PREFIX,
  venueToday,
} from "../domain/venue";
import { badRequest, conflict, forbidden, gone, notFound } from "../lib/problem";

const router: IRouter = Router();

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Codes are random, so a collision is possible in principle. The nested
 * transaction is a savepoint: a clash rolls back only the failed insert and we
 * draw another code, instead of losing the whole booking.
 */
async function insertOrder(
  tx: Tx,
  values: Omit<InsertOrder, "code">,
): Promise<OrderRow> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await tx.transaction(async (sp) => {
        const [row] = await sp
          .insert(ordersTable)
          .values({ ...values, code: orderCode(RECEIPT_PREFIX) })
          .returning();
        return row!;
      });
    } catch (err) {
      if (attempt >= 2 || pgErrorCode(err) !== UNIQUE_VIOLATION) {
        throw err;
      }
    }
  }
}

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

/* --------------------------------------------------------------- bookings */

router.post("/bookings", async (req, res) => {
  const body = CreateBookingBody.parse(req.body);
  const phone = requirePhone(body.phone);
  const slot = body.slot ?? DEFAULT_SLOT;

  const today = venueToday();
  if (body.date < today) {
    throw badRequest("date_in_past", "เลือกวันที่ย้อนหลังไม่ได้");
  }
  if (body.date > addDays(today, MAX_BOOKING_DAYS_AHEAD)) {
    throw badRequest(
      "date_too_far",
      `จองล่วงหน้าได้ไม่เกิน ${MAX_BOOKING_DAYS_AHEAD} วัน`,
    );
  }

  const [found] = await db
    .select({ table: venueTablesTable, zone: zonesTable })
    .from(venueTablesTable)
    .innerJoin(zonesTable, eq(venueTablesTable.zoneId, zonesTable.id))
    .where(
      and(
        eq(venueTablesTable.id, body.tableId),
        eq(venueTablesTable.active, true),
      ),
    )
    .limit(1);

  if (!found) {
    throw notFound("table_unknown", "ไม่พบโต๊ะที่เลือก");
  }

  const { table, zone } = found;
  if (body.guests < table.minSeats || body.guests > table.maxSeats) {
    throw badRequest(
      "party_does_not_fit",
      `โต๊ะ ${table.id} รับได้ ${table.minSeats}–${table.maxSeats} ท่าน`,
    );
  }

  const order = await db.transaction(async (tx) => {
    // Serialise everyone competing for this exact table+date+slot, so the
    // check below and the insert cannot be interleaved.
    const [k1, k2] = advisoryKey(`table:${table.id}:${body.date}:${slot}`);
    await tx.execute(sql`select pg_advisory_xact_lock(${k1}::int4, ${k2}::int4)`);

    const now = new Date();
    const [clash] = await tx
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.kind, "table"),
          eq(ordersTable.tableId, table.id),
          eq(ordersTable.date, body.date),
          eq(ordersTable.slot, slot),
          holdsInventory(now),
        ),
      )
      .limit(1);

    if (clash) {
      throw conflict(
        "table_taken",
        "โต๊ะนี้เพิ่งถูกจองไปแล้ว กรุณาเลือกโต๊ะอื่น",
      );
    }

    return insertOrder(tx, {
      kind: "table",
      bookerName: body.bookerName.trim(),
      phone,
      email: body.email?.trim() || null,
      occasion: body.occasion?.trim() || null,
      notes: body.notes?.trim() || null,
      date: body.date,
      slot,
      holdUntil: body.holdUntil ?? DEFAULT_HOLD_UNTIL,
      tableId: table.id,
      guests: body.guests,
      // Priced here, never taken from the client.
      amountSatang: depositSatang(zone.minSpendSatang, body.guests),
      holdExpiresAt: new Date(
        now.getTime() + PAYMENT_WINDOW_MINUTES * 60_000,
      ),
    });
  });

  res
    .status(201)
    .json(
      CreateBookingResponse.parse(
        toOrderView(order, { zoneId: zone.id, zoneName: zone.name }),
      ),
    );
});

/* ---------------------------------------------------------- ticket orders */

router.post("/ticket-orders", async (req, res) => {
  const body = CreateTicketOrderBody.parse(req.body);
  const phone = requirePhone(body.phone);

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, body.eventId))
    .limit(1);

  if (!event) {
    throw notFound("event_unknown", "ไม่พบอีเวนต์นี้");
  }
  if (event.date < venueToday()) {
    throw conflict("event_past", "อีเวนต์นี้ผ่านไปแล้ว");
  }

  const order = await db.transaction(async (tx) => {
    const [k1, k2] = advisoryKey(`event:${event.id}`);
    await tx.execute(sql`select pg_advisory_xact_lock(${k1}::int4, ${k2}::int4)`);

    const now = new Date();
    const [held] = await tx
      .select({
        quantity: sql<number>`coalesce(sum(${ordersTable.quantity}), 0)::int`,
      })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.kind, "ticket"),
          eq(ordersTable.eventId, event.id),
          holdsInventory(now),
        ),
      );

    const left = Math.max(
      0,
      event.capacity - event.baseSold - (held?.quantity ?? 0),
    );
    if (body.quantity > left) {
      throw conflict(
        "not_enough_tickets",
        left === 0 ? "บัตรจำหน่ายหมดแล้ว" : `เหลือบัตรอีกเพียง ${left} ใบ`,
      );
    }

    return insertOrder(tx, {
      kind: "ticket",
      bookerName: body.bookerName.trim(),
      phone,
      email: body.email?.trim() || null,
      notes: body.notes?.trim() || null,
      date: event.date,
      slot: event.doorsAt,
      holdUntil: event.doorsAt,
      eventId: event.id,
      quantity: body.quantity,
      amountSatang: event.priceSatang * body.quantity,
      holdExpiresAt: new Date(
        now.getTime() + PAYMENT_WINDOW_MINUTES * 60_000,
      ),
    });
  });

  res
    .status(201)
    .json(
      CreateTicketOrderResponse.parse(
        toOrderView(order, { eventTitle: event.title }),
      ),
    );
});

/* ----------------------------------------------------------------- lookup */

router.get("/orders", async (req, res) => {
  const query = ListOrdersQueryParams.parse(req.query);
  const phone = requirePhone(query.phone);

  const rows = await db
    .select()
    .from(ordersTable)
    .where(
      query.kind
        ? and(eq(ordersTable.phone, phone), eq(ordersTable.kind, query.kind))
        : eq(ordersTable.phone, phone),
    )
    .orderBy(desc(ordersTable.createdAt));

  res.json(ListOrdersResponse.parse(await viewAll(rows)));
});

router.get("/orders/:code", async (req, res) => {
  const { code } = GetOrderParams.parse(req.params);

  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.code, code))
    .limit(1);

  if (!row) {
    throw notFound("order_unknown", "ไม่พบรายการจองนี้");
  }

  res.json(GetOrderResponse.parse(await viewOf(row)));
});

/* ------------------------------------------------------------------ slips */

router.post("/orders/:code/slip", async (req, res) => {
  const { code } = SubmitSlipParams.parse(req.params);
  const body = SubmitSlipBody.parse(req.body);

  // The expiry branch has to commit its status change, so it returns rather
  // than throwing — a throw would roll the update back with it.
  const outcome = await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.code, code))
      .limit(1)
      .for("update");

    if (!row) {
      throw notFound("order_unknown", "ไม่พบรายการจองนี้");
    }
    if (row.status === "cancelled") {
      throw conflict("order_cancelled", "รายการนี้ถูกยกเลิกไปแล้ว");
    }
    if (row.status === "paid") {
      throw conflict("already_paid", "รายการนี้ชำระเงินเรียบร้อยแล้ว");
    }

    const now = new Date();
    if (row.status === "expired" || row.holdExpiresAt.getTime() <= now.getTime()) {
      await tx
        .update(ordersTable)
        .set({ status: "expired" })
        .where(eq(ordersTable.id, row.id));
      return { expired: true as const };
    }

    try {
      await tx.insert(slipsTable).values({
        hash: body.hash,
        orderId: row.id,
        fileName: body.fileName,
        sizeBytes: body.sizeBytes,
      });
    } catch (err) {
      if (pgErrorCode(err) === UNIQUE_VIOLATION) {
        throw conflict(
          "slip_duplicate",
          "สลิปนี้ถูกใช้ไปแล้ว กรุณาอัปโหลดสลิปการโอนของรายการนี้",
        );
      }
      throw err;
    }

    const [updated] = await tx
      .update(ordersTable)
      .set({ status: "paid", paidAt: now })
      .where(eq(ordersTable.id, row.id))
      .returning();

    return { expired: false as const, order: updated! };
  });

  if (outcome.expired) {
    throw gone(
      "hold_expired",
      "หมดเวลาชำระเงิน ระบบได้ปล่อยที่นั่งคืนแล้ว กรุณาจองใหม่อีกครั้ง",
    );
  }

  res.json(
    SubmitSlipResponse.parse({
      order: await viewOf(outcome.order),
      slipStatus: "pending_bank_check",
      // Honest: the duplicate check is real, authenticity is not checked yet.
      pendingBankCheck: true,
    }),
  );
});

/* ----------------------------------------------------------------- cancel */

router.post("/orders/:code/cancel", async (req, res) => {
  const { code } = CancelOrderParams.parse(req.params);
  const body = CancelOrderBody.parse(req.body);
  const phone = requirePhone(body.phone);

  const order = await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.code, code))
      .limit(1)
      .for("update");

    if (!row) {
      throw notFound("order_unknown", "ไม่พบรายการจองนี้");
    }
    // The reference alone is not proof of ownership.
    if (row.phone !== phone) {
      throw forbidden("phone_mismatch", "เบอร์โทรไม่ตรงกับรายการจองนี้");
    }
    if (row.status === "cancelled") {
      throw conflict("already_cancelled", "รายการนี้ถูกยกเลิกไปแล้ว");
    }
    if (row.status === "expired") {
      throw conflict("hold_expired", "รายการนี้หมดอายุไปแล้ว");
    }

    const [updated] = await tx
      .update(ordersTable)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(eq(ordersTable.id, row.id))
      .returning();

    return updated!;
  });

  res.json(CancelOrderResponse.parse(await viewOf(order)));
});

export default router;
