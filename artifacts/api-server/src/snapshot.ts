/**
 * Copies every row out of one database and back into another.
 *
 * `pg_dump` refuses to talk to a server newer than itself, which is exactly
 * the situation when a managed Postgres has moved ahead of the client
 * installed locally. This reads and writes through the driver instead, so the
 * server versions do not have to match.
 *
 *   pnpm --filter @workspace/api-server run snapshot:export           # -> backups/
 *   pnpm --filter @workspace/api-server run snapshot:import <file>
 *
 * Export reads DATABASE_URL. Import writes to TARGET_DATABASE_URL if set,
 * otherwise DATABASE_URL — so restoring into a different database is a
 * deliberate act, not a typo away.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pg } from "@workspace/db/pg";

import { logger } from "./lib/logger";

/** Parents before children: a restore has to satisfy the foreign keys. */
const TABLES = [
  "zones",
  "venue_tables",
  "events",
  "users",
  "orders",
  "slips",
  "sessions",
] as const;

interface Snapshot {
  takenAt: string;
  tables: Record<string, Array<Record<string, unknown>>>;
}

function connect(url: string): pg.Pool {
  return new pg.Pool({ connectionString: url });
}

async function exportAll(url: string, outDir: string): Promise<void> {
  const pool = connect(url);
  const snapshot: Snapshot = { takenAt: new Date().toISOString(), tables: {} };

  try {
    for (const table of TABLES) {
      const { rows } = await pool.query(
        `select * from ${pg.escapeIdentifier(table)}`,
      );
      snapshot.tables[table] = rows;
      logger.info({ table, rows: rows.length }, "exported");
    }
  } finally {
    await pool.end();
  }

  await mkdir(outDir, { recursive: true });
  const stamp = snapshot.takenAt.replace(/[:.]/g, "-");
  const file = path.join(outDir, `snapshot-${stamp}.json`);
  await writeFile(file, JSON.stringify(snapshot, null, 2), "utf8");

  const total = Object.values(snapshot.tables).reduce(
    (n, rows) => n + rows.length,
    0,
  );
  logger.info({ file, total }, "Snapshot written");
}

async function importAll(url: string, file: string): Promise<void> {
  const snapshot = JSON.parse(await readFile(file, "utf8")) as Snapshot;
  const pool = connect(url);
  const client = await pool.connect();

  try {
    await client.query("begin");

    for (const table of TABLES) {
      const rows = snapshot.tables[table] ?? [];
      if (rows.length === 0) {
        continue;
      }

      const columns = Object.keys(rows[0]!);
      const quoted = columns.map((c) => pg.escapeIdentifier(c)).join(", ");
      // Existing rows win on conflict rather than the import overwriting them:
      // restoring a backup should not quietly undo newer work.
      const sql =
        `insert into ${pg.escapeIdentifier(table)} (${quoted}) values ` +
        `(${columns.map((_, i) => `$${i + 1}`).join(", ")}) ` +
        `on conflict do nothing`;

      for (const row of rows) {
        await client.query(
          sql,
          columns.map((c) => row[c] ?? null),
        );
      }
      logger.info({ table, rows: rows.length }, "imported");
    }

    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }

  logger.info({ file }, "Snapshot restored");
}

const [, , mode, arg] = process.argv;
const source = process.env["DATABASE_URL"];

if (!source) {
  throw new Error("DATABASE_URL is not set");
}

if (mode === "export") {
  await exportAll(source, arg ?? path.resolve("backups"));
} else if (mode === "import") {
  if (!arg) {
    throw new Error("usage: snapshot import <file.json>");
  }
  await importAll(process.env["TARGET_DATABASE_URL"] ?? source, arg);
} else {
  throw new Error("usage: snapshot <export|import> [arg]");
}
