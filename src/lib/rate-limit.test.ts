import { describe, expect, test } from "vitest";
import { checkRateLimit, clientIp, memoryRateLimitStore, rateLimitKey } from "./rate-limit";

const rule = { limit: 3, windowMs: 60_000 };
const t0 = new Date("2026-11-24T10:00:00Z");
const at = (ms: number) => new Date(t0.getTime() + ms);

describe("checkRateLimit", () => {
  test("allows up to the limit, then refuses with the seconds left in the window", async () => {
    const store = memoryRateLimitStore();
    for (let i = 0; i < 3; i++) expect((await checkRateLimit("k", rule, store, at(i * 1000))).allowed).toBe(true);
    expect(await checkRateLimit("k", rule, store, at(20_000))).toEqual({ allowed: false, retryAfterSeconds: 40 });
  });

  test("a new window starts once the old one has ended", async () => {
    const store = memoryRateLimitStore();
    for (let i = 0; i < 4; i++) await checkRateLimit("k", rule, store, at(0));
    expect((await checkRateLimit("k", rule, store, at(60_000))).allowed).toBe(true);
  });

  test("keys are counted separately", async () => {
    const store = memoryRateLimitStore();
    for (let i = 0; i < 4; i++) await checkRateLimit("a", rule, store, t0);
    expect((await checkRateLimit("b", rule, store, t0)).allowed).toBe(true);
  });

  test("store errors reach the caller, which decides to fail open or closed", async () => {
    const broken = { hit: () => Promise.reject(new Error("down")) };
    await expect(checkRateLimit("k", rule, broken, t0)).rejects.toThrow("down");
  });
});

describe("client identity", () => {
  const headers = (h: Record<string, string>) => (name: string) => h[name];

  test("uses the first x-forwarded-for entry, then x-real-ip", () => {
    expect(clientIp(headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
    expect(clientIp(headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(headers({}))).toBe("unknown");
  });

  test("keys are stable per purpose and IP and never contain the IP", () => {
    const key = rateLimitKey("login", "203.0.113.7");
    expect(key).toBe(rateLimitKey("login", "203.0.113.7"));
    expect(key).not.toBe(rateLimitKey("track", "203.0.113.7"));
    expect(key).not.toContain("203.0.113.7");
    expect(key).toMatch(/^login:[0-9a-f]{32}$/);
  });
});
