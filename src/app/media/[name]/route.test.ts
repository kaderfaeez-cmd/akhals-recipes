import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

// Uploaded images are stored in Postgres (MediaAsset) and served here. They appear on public
// recipe pages, so this route is public; it must only ever return stored WebP images.

const { prisma } = vi.hoisted(() => ({ prisma: { mediaAsset: { findUnique: vi.fn() } } }));
vi.mock("@/lib/prisma", () => ({ prisma, hasDatabase: () => true }));

import { GET } from "./route";

const get = (name: string) =>
  GET(new NextRequest(`http://localhost/media/${encodeURIComponent(name)}`), { params: Promise.resolve({ name }) });

const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 4, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /media/[name]", () => {
  test("serves a stored image with long-lived caching and no type sniffing", async () => {
    prisma.mediaAsset.findUnique.mockResolvedValue({ bytes: webp, contentType: "image/webp" });
    const res = await get("mutton-curry-mf3k2-960.webp");
    expect(res.status).toBe(200);
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(webp);
    expect(res.headers.get("content-type")).toBe("image/webp");
    expect(res.headers.get("cache-control")).toContain("immutable");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(prisma.mediaAsset.findUnique).toHaveBeenCalledWith({
      where: { name: "mutton-curry-mf3k2-960.webp" },
      select: { bytes: true, contentType: true },
    });
  });

  test("an unknown image is a 404", async () => {
    prisma.mediaAsset.findUnique.mockResolvedValue(null);
    expect((await get("missing-1-480.webp")).status).toBe(404);
  });

  test.each(["../.env", "a.svg", "UPPER.webp", "x.webp.html", "", "a b.webp"])(
    "a name the upload route never creates (%j) is a 404 without a query",
    async (name) => {
      expect((await get(name)).status).toBe(404);
      expect(prisma.mediaAsset.findUnique).not.toHaveBeenCalled();
    }
  );

  test("a database failure is a 500 that leaks nothing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prisma.mediaAsset.findUnique.mockRejectedValue(new Error("password authentication failed for user x"));
    const res = await get("a-1-480.webp");
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("password");
  });
});
