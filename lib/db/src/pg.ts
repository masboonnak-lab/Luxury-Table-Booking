/**
 * The raw driver, re-exported.
 *
 * This package owns the `pg` dependency; anything that needs a connection to a
 * database other than the one `DATABASE_URL` points at — a backup, a restore
 * into a second database — goes through here rather than adding `pg` to its
 * own dependencies and risking a second copy of the driver.
 */
export { default as pg } from "pg";
