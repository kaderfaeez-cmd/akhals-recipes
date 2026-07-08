import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const WIDTHS = [480, 960, 1600];

/**
 * Media library upload: compresses to WebP and emits responsive sizes.
 * NOTE: writes to local disk (public/uploads). On Vercel the filesystem is
 * ephemeral — swap the write for Vercel Blob / S3 when hosting there.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "File too large (max 12 MB)" }, { status: 413 });
  }
  if (!/^image\/(png|jpe?g|webp|avif)$/i.test(file.type)) {
    return NextResponse.json({ ok: false, error: "Unsupported image type" }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base = file.name
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  const stamp = Date.now().toString(36);
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  try {
    const image = sharp(buffer).rotate();
    const meta = await image.metadata();
    const variants: { width: number; url: string }[] = [];

    for (const width of WIDTHS) {
      if (meta.width && meta.width < width && variants.length > 0) break;
      const name = `${base}-${stamp}-${width}.webp`;
      const out = await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      await writeFile(path.join(dir, name), out);
      variants.push({ width, url: `/uploads/${name}` });
    }

    return NextResponse.json({
      ok: true,
      url: variants[variants.length - 1]?.url,
      variants,
      original: { width: meta.width, height: meta.height },
    });
  } catch (err) {
    console.error("[admin/upload]", err);
    return NextResponse.json({ ok: false, error: "Image processing failed" }, { status: 500 });
  }
}
