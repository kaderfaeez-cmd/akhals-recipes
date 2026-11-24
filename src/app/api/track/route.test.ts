import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { fakeRateLimitBucket } from "@/test/fake-rate-limit-bucket";

// POST /api/track is public: anyone could inflate recipe views and write unlimited ScanEvent rows.
// The limit must live in the database (Vercel runs many instances; memory is not shared).

const { prisma, bucket } = vi.hoisted(() => ({
  prisma: {} as Record<string, unknown>,
  bucket: { current: null as ReturnType<typeof fakeRateLimitBucket> | null },
}));

vi.mock("@/lib/prisma", () => ({ prisma, hasDatabase: () => true }));

import { POST } from "./route";

const scanEventCreate = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  bucket.current = fakeRateLimitBucket();
  Object.assign(prisma, {
    rateLimitBucket: bucket.current,
    recipe: { findUnique: vi.fn().mockResolvedValue({ id: "r1" }), update: vi.fn() },
    scanEvent: { create: scanEventCreate },
    $transaction: vi.fn().mockResolvedValue([]),
  });
});

const beacon = (ip: string) =>
  POST(
    new NextRequest("http://localhost/api/track", {
      method: "POST",
      headers: { "x-forwarded-for": `${ip}, 10.0.0.1`, "user-agent": "iPhone" },
      body: JSON.stringify({ recipeSlug: "durban-mutton-curry", spiceSlug: "durban-special" }),
    })
  );

describe("POST /api/track rate limit", () => {
  test("allows 60 beacons from one visitor in 10 minutes, then answers 429", async () => {
    for (let i = 0; i < 60; i++) expect((await beacon("203.0.113.7")).status).toBe(200);

    const blocked = await beacon("203.0.113.7");
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(scanEventCreate).toHaveBeenCalledTimes(60);
  });

  test("one visitor hitting the limit does not block another", async () => {
    for (let i = 0; i < 61; i++) await beacon("203.0.113.7");
    expect((await beacon("198.51.100.2")).status).toBe(200);
  });

  test("the stored key is a hash, never the raw IP", async () => {
    await beacon("203.0.113.7");
    const keys = [...bucket.current!.rows.keys()];
    expect(keys).toHaveLength(1);
    expect(keys[0]).not.toContain("203.0.113.7");
  });

  test("if the limiter's storage fails, the beacon is still accepted (analytics fail open)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    bucket.current!.updateMany = () => Promise.reject(new Error("connection reset"));
    expect((await beacon("203.0.113.7")).status).toBe(200);
  });
});
