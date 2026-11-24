import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

// Every /api/admin/* handler must check the session itself. src/middleware.ts is the first gate,
// but Next's docs say Proxy/Middleware must not be the only one: a matcher mistake or a
// middleware bypass would otherwise expose every admin API.

const { getServerSession, prisma } = vi.hoisted(() => {
  const model = () => ({
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: "r1", slug: "r1" }),
    update: vi.fn().mockResolvedValue({ id: "r1", slug: "r1" }),
    upsert: vi.fn().mockResolvedValue({ id: "s1" }),
    delete: vi.fn().mockResolvedValue({ id: "r1", slug: "r1" }),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    count: vi.fn().mockResolvedValue(0),
    groupBy: vi.fn().mockResolvedValue([]),
  });
  return {
    getServerSession: vi.fn(),
    prisma: {
      recipe: model(),
      spice: model(),
      scanEvent: model(),
      mediaAsset: model(),
      $transaction: vi.fn().mockResolvedValue([]),
    },
  };
});

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma, hasDatabase: () => true }));

import * as recipes from "./recipes/route";
import * as recipeById from "./recipes/[id]/route";
import * as upload from "./upload/route";
import * as analytics from "./analytics/route";

const ctx = { params: Promise.resolve({ id: "r1" }) };
const req = (method: string, body?: BodyInit) =>
  new NextRequest("http://localhost/api/admin/x", { method, body });

const handlers: [string, () => Promise<Response>][] = [
  ["GET /api/admin/recipes", () => recipes.GET()],
  ["POST /api/admin/recipes", () => recipes.POST(req("POST", "{}"))],
  ["GET /api/admin/recipes/[id]", () => recipeById.GET(req("GET"), ctx)],
  ["PUT /api/admin/recipes/[id]", () => recipeById.PUT(req("PUT", '{"status":"DRAFT"}'), ctx)],
  ["DELETE /api/admin/recipes/[id]", () => recipeById.DELETE(req("DELETE"), ctx)],
  ["POST /api/admin/upload", () => upload.POST(req("POST", new FormData()))],
  ["GET /api/admin/analytics", () => analytics.GET()],
];

function prismaCalls(): number {
  return Object.values(prisma)
    .flatMap((m) => (typeof m === "function" ? [m] : Object.values(m)))
    .reduce((n, fn) => n + fn.mock.calls.length, 0);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin API without a session", () => {
  test.each(handlers)("%s returns 401 and touches no data", async (_name, call) => {
    getServerSession.mockResolvedValue(null);
    const res = await call();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, error: "Not signed in" });
    expect(prismaCalls()).toBe(0);
  });

  test("a session with no user is rejected too", async () => {
    getServerSession.mockResolvedValue({ expires: "2099-01-01" });
    expect((await recipes.GET()).status).toBe(401);
  });

  test("a failing session lookup is a 401, not a crash", async () => {
    getServerSession.mockRejectedValue(new Error("JWT decode failed"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await analytics.GET()).status).toBe(401);
  });
});

describe("admin API with a session", () => {
  test.each(handlers)("%s is not rejected as unauthenticated", async (_name, call) => {
    getServerSession.mockResolvedValue({ user: { email: "admin@example.com" }, expires: "2099-01-01" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await call();
    expect(res.status).not.toBe(401);
  });
});
