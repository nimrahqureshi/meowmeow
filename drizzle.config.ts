import { defineConfig } from "drizzle-kit";
import "dotenv/config";

/**
 * Credentials come from the environment — never commit a connection string.
 * Copy .env.example to .env and set DATABASE_URL before running db commands.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
