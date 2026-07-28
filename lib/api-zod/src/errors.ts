/**
 * Kept out of index.ts on purpose: Orval rewrites that file on every codegen
 * run and appends its own exports, so anything hand-written there gets
 * duplicated. Consumers import from "@workspace/api-zod/errors" instead.
 *
 * Re-exported so a server can catch a validation failure without taking a
 * direct dependency on zod — this package is the one that owns it.
 */
export { ZodError } from "zod";
