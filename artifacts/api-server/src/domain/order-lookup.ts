import { eq, inArray } from "drizzle-orm";
import {
  db,
  eventsTable,
  venueTablesTable,
  zonesTable,
  type Order as OrderRow,
} from "@workspace/db";

import { toOrderView, type OrderContext } from "./order-view";

/**
 * Zone and event names live on other tables but belong on the ticket the guest
 * sees. Batched so listing N orders stays three queries, not 2N + 1.
 */
export async function contextFor(
  rows: ReadonlyArray<OrderRow>,
): Promise<Map<string, OrderContext>> {
  const out = new Map<string, OrderContext>();
  if (rows.length === 0) {
    return out;
  }

  const isString = (v: string | null): v is string => v !== null;
  const tableIds = [...new Set(rows.map((r) => r.tableId).filter(isString))];
  const eventIds = [...new Set(rows.map((r) => r.eventId).filter(isString))];

  const zoneByTable = new Map<string, { id: string; name: string }>();
  if (tableIds.length > 0) {
    const found = await db
      .select({
        tableId: venueTablesTable.id,
        zoneId: zonesTable.id,
        zoneName: zonesTable.name,
      })
      .from(venueTablesTable)
      .innerJoin(zonesTable, eq(venueTablesTable.zoneId, zonesTable.id))
      .where(inArray(venueTablesTable.id, tableIds));
    for (const f of found) {
      zoneByTable.set(f.tableId, { id: f.zoneId, name: f.zoneName });
    }
  }

  const titleByEvent = new Map<string, string>();
  if (eventIds.length > 0) {
    const found = await db
      .select({ id: eventsTable.id, title: eventsTable.title })
      .from(eventsTable)
      .where(inArray(eventsTable.id, eventIds));
    for (const f of found) {
      titleByEvent.set(f.id, f.title);
    }
  }

  for (const r of rows) {
    const zone = r.tableId ? zoneByTable.get(r.tableId) : undefined;
    out.set(r.id, {
      zoneId: zone?.id,
      zoneName: zone?.name,
      eventTitle: r.eventId ? titleByEvent.get(r.eventId) : undefined,
    });
  }
  return out;
}

export async function viewOf(
  row: OrderRow,
): Promise<ReturnType<typeof toOrderView>> {
  const ctx = await contextFor([row]);
  return toOrderView(row, ctx.get(row.id) ?? {});
}

/** Views for a whole list, sharing one context lookup and one clock. */
export async function viewAll(
  rows: ReadonlyArray<OrderRow>,
): Promise<Array<ReturnType<typeof toOrderView>>> {
  const ctx = await contextFor(rows);
  const now = new Date();
  return rows.map((r) => toOrderView(r, ctx.get(r.id) ?? {}, now));
}
