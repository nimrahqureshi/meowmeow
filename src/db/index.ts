import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    // `pg` defaults to 10 connections per pool with no connection timeout.
    // Every serverless instance opens its own pool, so under real traffic the
    // database hits max_connections and requests start failing rather than
    // queueing. Bounded explicitly and overridable per environment: keep this
    // low (2-5) on serverless behind a pooler, higher on a long-lived server.
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: Number(process.env.DATABASE_POOL_IDLE_MS ?? 10_000),
    // Fail fast instead of hanging a request forever when the pool is drained.
    connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS ?? 10_000),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
