import { NextRequest, NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";
import { isMediaName } from "@/lib/media";

export const runtime = "nodejs";

const notFound = () => new NextResponse("Not found", { status: 404 });

/**
 * Public read route for admin-uploaded images (MediaAsset rows written by
 * /api/admin/upload). Public on purpose: these images appear on public recipe pages.
 * Names embed a timestamp and are never reused, so responses are cacheable forever by the
 * browser and Vercel's CDN; each image is read from Postgres only on a cache miss.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!isMediaName(name) || !hasDatabase()) return notFound();

  try {
    const asset = await prisma.mediaAsset.findUnique({
      where: { name },
      select: { bytes: true, contentType: true },
    });
    if (!asset) return notFound();
    return new NextResponse(new Uint8Array(asset.bytes), {
      headers: {
        "Content-Type": asset.contentType,
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[media] read failed", err);
    return new NextResponse("Could not load image", { status: 500 });
  }
}
