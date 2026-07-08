import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasDatabase, prisma } from "@/lib/prisma";

const trackSchema = z.object({
  recipeSlug: z.string().max(120).optional(),
  spiceSlug: z.string().max(120).optional(),
  referer: z.string().max(500).optional(),
});

function deviceFromUa(ua: string | null): string {
  if (!ua) return "unknown";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = trackSchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }
  if (!hasDatabase()) return NextResponse.json({ ok: true, stored: false });

  const { recipeSlug, spiceSlug, referer } = parsed.data;
  const device = deviceFromUa(req.headers.get("user-agent"));
  // Vercel geo headers when deployed; absent locally.
  const country = req.headers.get("x-vercel-ip-country") ?? undefined;
  const city = req.headers.get("x-vercel-ip-city") ?? undefined;

  try {
    const recipe = recipeSlug
      ? await prisma.recipe.findUnique({ where: { slug: recipeSlug }, select: { id: true } })
      : null;
    await prisma.$transaction([
      prisma.scanEvent.create({
        data: { recipeId: recipe?.id, spiceSlug, device, country, city, referer },
      }),
      ...(recipe
        ? [prisma.recipe.update({ where: { id: recipe.id }, data: { views: { increment: 1 } } })]
        : []),
    ]);
    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[track] failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
