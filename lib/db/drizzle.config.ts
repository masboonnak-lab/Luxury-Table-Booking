import { defineConfig } from "drizzle-kit";
import { existsSync } from "node:fs";
import path from "path";

// drizzle-kit is its own binary, so it never sees the --env-file flag the
// server scripts use. Load the workspace .env here instead, and only when the
// variable is not already set — a real deployment passes it in.
const envFile = path.resolve(__dirname, "..", "..", ".env");
if (!process.env.DATABASE_URL && existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  // Relative with forward slashes: drizzle-kit globs this, and an absolute
  // Windows path with backslashes matches nothing.
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
