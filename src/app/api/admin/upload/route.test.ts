import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import sharp from "sharp";

// Uploads used to be written to public/uploads on local disk. On Vercel that filesystem is
// ephemeral and files written at runtime are never served, so every uploaded image was lost.
// They must be stored durably (Postgres bytes) and served by a route.

const { prisma, fs } = vi.hoisted(() => ({
  prisma: { mediaAsset: { create: vi.fn() }, $transaction: vi.fn() },
  fs: { mkdir: vi.fn(), writeFile: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma, hasDatabase: () => true }));
vi.mock("@/lib/admin-session", () => ({ requireAdminSession: async () => null }));
vi.mock("node:fs/promises", () => ({ ...fs, default: fs }));

import { POST } from "./route";

const upload = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return POST(new NextRequest("http://localhost/api/admin/upload", { method: "POST", body: form }));
};

const png = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: "#b8341f" } }).png().toBuffer();

const isWebp = (bytes: Uint8Array) =>
  Buffer.from(bytes.subarray(0, 4)).toString("ascii") === "RIFF" &&
  Buffer.from(bytes.subarray(8, 12)).toString("ascii") === "WEBP";

beforeEach(() => {
  vi.clearAllMocks();
  prisma.mediaAsset.create.mockImplementation(async (args: unknown) => args);
  prisma.$transaction.mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
});

describe("POST /api/admin/upload", () => {
  test("stores every WebP size in the database and returns /media URLs, writing nothing to disk", async () => {
    const res = await upload(new File([await png(2000, 1200)], "Mutton Curry!.PNG", { type: "image/png" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(fs.writeFile).not.toHaveBeenCalled();
    expect(fs.mkdir).not.toHaveBeenCalled();

    expect(body.variants.map((v: { width: number }) => v.width)).toEqual([480, 960, 1600]);
    expect(body.url).toBe(body.variants[2].url);
    for (const v of body.variants) expect(v.url).toMatch(/^\/media\/mutton-curry-[a-z0-9]+-(480|960|1600)\.webp$/);

    expect(prisma.mediaAsset.create).toHaveBeenCalledTimes(3);
    for (const [{ data }] of prisma.mediaAsset.create.mock.calls) {
      expect(data.contentType).toBe("image/webp");
      expect(isWebp(data.bytes)).toBe(true);
      expect(data.size).toBe(data.bytes.length);
      expect(`/media/${data.name}`).toBe(body.variants.find((v: { width: number }) => v.width === data.width).url);
    }
    expect(body.original).toEqual({ width: 2000, height: 1200 });
  });

  test("a small image is stored once, without enlarging", async () => {
    const res = await upload(new File([await png(300, 200)], "tiny.png", { type: "image/png" }));
    const body = await res.json();
    expect(body.variants.map((v: { width: number }) => v.width)).toEqual([480]);
    expect(prisma.mediaAsset.create).toHaveBeenCalledTimes(1);
    const meta = await sharp(prisma.mediaAsset.create.mock.calls[0][0].data.bytes).metadata();
    expect(meta.width).toBe(300);
  });

  test("bytes that are not an image are rejected and nothing is stored", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await upload(new File(["<?php echo 1; ?>"], "shell.png", { type: "image/png" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: "Image processing failed" });
    expect(prisma.mediaAsset.create).not.toHaveBeenCalled();
  });

  test("unsupported types and oversized files are still refused before processing", async () => {
    expect((await upload(new File(["x"], "a.svg", { type: "image/svg+xml" }))).status).toBe(415);
    const big = new File([new Uint8Array(12 * 1024 * 1024 + 1)], "big.png", { type: "image/png" });
    expect((await upload(big)).status).toBe(413);
    expect(prisma.mediaAsset.create).not.toHaveBeenCalled();
  });

  test("all sizes of one upload are saved in a single transaction", async () => {
    await upload(new File([await png(2000, 1200)], "a.png", { type: "image/png" }));
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction.mock.calls[0][0]).toHaveLength(3);
  });

  test("a file whose real format is not an allowed raster type is refused, whatever its label", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600"/></svg>';
    const res = await upload(new File([svg], "logo.png", { type: "image/png" }));
    expect(res.status).toBe(415);
    expect(prisma.mediaAsset.create).not.toHaveBeenCalled();
  });

  test("an image with an excessive pixel count is refused before it is decoded", async () => {
    const res = await upload(new File([await png(8000, 6000)], "huge.png", { type: "image/png" }));
    expect(res.status).toBe(413);
    expect((await res.json()).error).toMatch(/too large/i);
    expect(prisma.mediaAsset.create).not.toHaveBeenCalled();
  });

  test.each(["jpeg", "avif", "webp"] as const)("a real %s image is accepted", async (format) => {
    const bytes = await sharp({ create: { width: 640, height: 480, channels: 3, background: "#2a6" } })[format]().toBuffer();
    const res = await upload(new File([bytes], `photo.${format}`, { type: `image/${format}` }));
    expect(res.status).toBe(200);
  });

  test("a database failure is a safe 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prisma.mediaAsset.create.mockRejectedValue(new Error("connection reset"));
    const res = await upload(new File([await png(600, 400)], "a.png", { type: "image/png" }));
    expect(res.status).toBe(500);
    expect((await res.json()).ok).toBe(false);
  });
});
