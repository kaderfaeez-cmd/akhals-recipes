import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import sharp, { type Metadata } from "sharp";
import { hasDatabase, prisma } from "@/lib/prisma";
import { mediaUrl } from "@/lib/media";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const WIDTHS = [480, 960, 1600];
// Decoded size cap (sharp's default is ~268 MP, enough to exhaust a serverless function's memory).
const MAX_PIXELS = 40_000_000;

/** What sharp says the bytes really are. AVIF reports as HEIF with AV1 compression. */
function isAllowedFormat(meta: Metadata): boolean {
  if (meta.format === "jpeg" || meta.format === "png" || meta.format === "webp") return true;
  return meta.format === "heif" && meta.compression === "av1";
}

/**
 * Media library upload: decodes the image with sharp (anything that isn't a real image fails
 * here), re-encodes it to WebP at 480 / 960 / 1600 px without enlarging, and stores each size in
 * the MediaAsset table. Vercel has no durable local disk, so the bytes live in Postgres and are
 * served publicly by src/app/media/[name]/route.ts.
 *
 * Note: Vercel rejects request bodies over 4.5 MB before this handler runs, so in production the
 * effective limit is lower than MAX_BYTES.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdminSession();
  if (denied) return denied;
  if (!hasDatabase()) {
    return NextResponse.json({ ok: false, error: "Database not configured. Set DATABASE_URL." }, { status: 503 });
  }
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

  let meta: Metadata;
  try {
    meta = await sharp(buffer).metadata();
  } catch (err) {
    console.error("[admin/upload] unreadable image", err);
    return NextResponse.json({ ok: false, error: "Image processing failed" }, { status: 500 });
  }
  // The declared MIME type is client-supplied; check what the bytes really are before decoding.
  if (!isAllowedFormat(meta)) {
    return NextResponse.json({ ok: false, error: "Unsupported image type" }, { status: 415 });
  }
  if ((meta.width ?? 0) * (meta.height ?? 0) > MAX_PIXELS) {
    return NextResponse.json({ ok: false, error: "Image dimensions too large (max 40 megapixels)" }, { status: 413 });
  }

  const encoded: { name: string; width: number; bytes: Uint8Array<ArrayBuffer> }[] = [];
  try {
    for (const width of WIDTHS) {
      if (meta.width && meta.width < width && encoded.length > 0) break;
      const webp = await sharp(buffer, { limitInputPixels: MAX_PIXELS })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      // Copy into a plain ArrayBuffer-backed array, the type Prisma expects for a Bytes column.
      const bytes = new Uint8Array(webp);
      encoded.push({ name: `${base}-${stamp}-${width}.webp`, width, bytes });
    }
  } catch (err) {
    console.error("[admin/upload] processing failed", err);
    return NextResponse.json({ ok: false, error: "Image processing failed" }, { status: 500 });
  }

  try {
    // All sizes or none, so a failure part-way leaves no orphan rows.
    await prisma.$transaction(
      encoded.map(({ name, width, bytes }) =>
        prisma.mediaAsset.create({ data: { name, width, contentType: "image/webp", size: bytes.length, bytes } })
      )
    );
  } catch (err) {
    console.error("[admin/upload] storing failed", err);
    return NextResponse.json({ ok: false, error: "Could not save the image" }, { status: 500 });
  }

  const variants = encoded.map(({ name, width }) => ({ width, url: mediaUrl(name) }));
  return NextResponse.json({
    ok: true,
    url: variants[variants.length - 1]?.url,
    variants,
    original: { width: meta.width, height: meta.height },
  });
}
