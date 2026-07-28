import { Router, type IRouter } from "express";
import { and, asc, eq, sql } from "drizzle-orm";
import {
  db,
  eventsTable,
  ordersTable,
  venueTablesTable,
  zonesTable,
} from "@workspace/db";
import {
  GetAvailabilityQueryParams,
  GetAvailabilityResponse,
  GetFloorResponse,
  ListEventsResponse,
} from "@workspace/api-zod";

import { holdsInventory } from "../domain/holds";
import { toThb } from "../domain/money";
import { DEFAULT_SLOT } from "../domain/venue";

const router: IRouter = Router();

router.get("/floor", async (_req, res) => {
  const [zones, tables] = await Promise.all([
    db
      .select()
      .from(zonesTable)
      .orderBy(asc(zonesTable.sortOrder), asc(zonesTable.id)),
    db
      .select()
      .from(venueTablesTable)
      .where(eq(venueTablesTable.active, true))
      .orderBy(asc(venueTablesTable.id)),
  ]);

  res.json(
    GetFloorResponse.parse({
      zones: zones.map((z) => {
        // Capacity is read off the tables, so it can never contradict the room.
        const inZone = tables.filter((t) => t.zoneId === z.id);
        return {
          id: z.id,
          name: z.name,
          description: z.description,
          minSpend: toThb(z.minSpendSatang),
          capacityMin: inZone.length
            ? Math.min(...inZone.map((t) => t.minSeats))
            : 0,
          capacityMax: inZone.length
            ? Math.max(...inZone.map((t) => t.maxSeats))
            : 0,
        };
      }),
      tables: tables.map((t) => ({
        id: t.id,
        zoneId: t.zoneId,
        shape: t.shape,
        x: t.x,
        y: t.y,
        w: t.w,
        h: t.h,
        minSeats: t.minSeats,
        maxSeats: t.maxSeats,
      })),
    }),
  );
});

router.get("/events", async (_req, res) => {
  const now = new Date();

  const [events, held] = await Promise.all([
    db.select().from(eventsTable).orderBy(asc(eventsTable.date)),
    db
      .select({
        eventId: ordersTable.eventId,
        quantity: sql<number>`coalesce(sum(${ordersTable.quantity}), 0)::int`,
      })
      .from(ordersTable)
      .where(and(eq(ordersTable.kind, "ticket"), holdsInventory(now)))
      .groupBy(ordersTable.eventId),
  ]);

  const heldByEvent = new Map(held.map((h) => [h.eventId, h.quantity]));

  res.json(
    ListEventsResponse.parse(
      events.map((e) => ({
        id: e.id,
        kind: e.kind,
        title: e.title,
        artistTh: e.artistTh,
        artistEn: e.artistEn,
        date: e.date,
        doorsAt: e.doorsAt,
        price: toThb(e.priceSatang),
        capacity: e.capacity,
        ticketsLeft: Math.max(
          0,
          e.capacity - e.baseSold - (heldByEvent.get(e.id) ?? 0),
        ),
      })),
    ),
  );
});

router.get("/availability", async (req, res) => {
  const query = GetAvailabilityQueryParams.parse(req.query);
  const slot = query.slot ?? DEFAULT_SLOT;
  const now = new Date();

  const [tables, taken] = await Promise.all([
    db
      .select()
      .from(venueTablesTable)
      .where(eq(venueTablesTable.active, true))
      .orderBy(asc(venueTablesTable.id)),
    db
      .select({ tableId: ordersTable.tableId })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.kind, "table"),
          eq(ordersTable.date, query.date),
          eq(ordersTable.slot, slot),
          holdsInventory(now),
        ),
      ),
  ]);

  const takenIds = new Set(taken.map((t) => t.tableId));

  const rows = tables.map((t) => {
    const free = !takenIds.has(t.id);
    const fits =
      query.guests === undefined ||
      (query.guests >= t.minSeats && query.guests <= t.maxSeats);
    return { id: t.id, free, selectable: free && fits };
  });

  res.json(
    GetAvailabilityResponse.parse({
      date: query.date,
      slot,
      freeTables: rows.filter((r) => r.free).length,
      tables: rows,
    }),
  );
});

export default router;
