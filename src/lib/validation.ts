import "server-only";
import { NextResponse } from "next/server";

/**
 * Request validation helpers.
 *
 * Every write endpoint previously trusted the shape of its JSON body, so a
 * non-numeric quantity or a product id that doesn't exist surfaced as an
 * unhandled 500 (and a database stack trace in the logs) instead of a useful
 * 4xx. These helpers keep that validation in one place.
 */

/** Parse a JSON body, returning null rather than throwing on malformed input. */
export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/** A positive integer id, or null if the value isn't one. */
export function parseId(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isInteger(n) || n < 1) return null;
  return n;
}

/** An integer clamped to [min, max], or `fallback` when the value isn't numeric. */
export function parseCount(value: unknown, { min, max, fallback }: { min: number; max: number; fallback: number }) {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Trimmed, length-capped string, or null when absent/blank. */
export function parseText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });
export const notFound = (message: string) => NextResponse.json({ error: message }, { status: 404 });
