import { createHmac } from "node:crypto";
import { hasDatabase, prisma } from "@/lib/prisma";

/**
 * Fixed-window rate limiting stored in Postgres (table RateLimitBucket), so the count is shared by
 * every Vercel serverless instance. Without a database (local dev) it falls back to an in-process
 * Map, which is per instance and resets on restart — fine for development only.
 *
 * Keys are HMAC-SHA256 hashes of "<purpose>:<client IP>", so raw IPs are never stored.
 */

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export const LOGIN_RATE_LIMIT: RateLimitRule = { limit: 10, windowMs: 15 * 60_000 };
export const TRACK_RATE_LIMIT: RateLimitRule = { limit: 60, windowMs: 10 * 60_000 };

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimitStore {
  /** Count one hit for `key` and return the count inside the current window. */
  hit(key: string, windowMs: number, now: Date): Promise<{ count: number; resetAt: Date }>;
}

// Expired buckets are deleted on roughly 1 hit in CLEANUP_ODDS, keeping the table small without
// a cron job.
const CLEANUP_ODDS = 50;

export const prismaRateLimitStore: RateLimitStore = {
  async hit(key, windowMs, now) {
    // Inside an open window: atomic increment.
    const bumped = await prisma.rateLimitBucket.updateMany({
      where: { key, resetAt: { gt: now } },
      data: { count: { increment: 1 } },
    });
    if (bumped.count === 1) {
      const row = await prisma.rateLimitBucket.findUnique({ where: { key } });
      if (row) return { count: row.count, resetAt: row.resetAt };
    }
    // No bucket, or its window has ended: start a new window. (Two requests racing here can both
    // start at 1, under-counting by one — acceptable for this purpose.)
    const resetAt = new Date(now.getTime() + windowMs);
    const row = await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    if (Math.floor(Math.random() * CLEANUP_ODDS) === 0) {
      await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } });
    }
    return { count: row.count, resetAt: row.resetAt };
  },
};

export function memoryRateLimitStore(): RateLimitStore {
  const buckets = new Map<string, { count: number; resetAt: Date }>();
  return {
    async hit(key, windowMs, now) {
      const current = buckets.get(key);
      const bucket =
        current && current.resetAt > now
          ? { count: current.count + 1, resetAt: current.resetAt }
          : { count: 1, resetAt: new Date(now.getTime() + windowMs) };
      buckets.set(key, bucket);
      return bucket;
    },
  };
}

const devStore = memoryRateLimitStore();

export function defaultRateLimitStore(): RateLimitStore {
  return hasDatabase() ? prismaRateLimitStore : devStore;
}

/** Counts a hit and says whether it is within the rule. Store errors propagate to the caller. */
export async function checkRateLimit(
  key: string,
  rule: RateLimitRule,
  store: RateLimitStore = defaultRateLimitStore(),
  now: Date = new Date()
): Promise<RateLimitResult> {
  const { count, resetAt } = await store.hit(key, rule.windowMs, now);
  if (count <= rule.limit) return { allowed: true, retryAfterSeconds: 0 };
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)) };
}

/**
 * The client's IP from proxy headers. On Vercel, x-forwarded-for / x-real-ip are set by the
 * platform (client-supplied values are overwritten), so the first x-forwarded-for entry is the
 * real client. Behind a different proxy this must be revisited.
 */
export function clientIp(header: (name: string) => string | null | undefined): string {
  const forwarded = header("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || header("x-real-ip")?.trim();
  return ip ? normalizeIp(ip) : "unknown";
}

/**
 * IPv4 stays as is (IPv4-mapped IPv6 is unwrapped). IPv6 is reduced to its /64 network: one
 * subscriber usually controls a whole /64, so per-address limits would be trivial to rotate past.
 */
function normalizeIp(ip: string): string {
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped) return mapped[1];
  if (!ip.includes(":")) return ip;

  const halves = ip.toLowerCase().split("::");
  if (halves.length > 2) return ip.toLowerCase();
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return ip.toLowerCase();
  const groups = [...head, ...Array<string>(missing).fill("0"), ...tail];
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return ip.toLowerCase();
  return `${groups.slice(0, 4).map((g) => parseInt(g, 16).toString(16)).join(":")}::/64`;
}

export function rateLimitKey(purpose: string, ip: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "akhals-rate-limit";
  return `${purpose}:${createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32)}`;
}
