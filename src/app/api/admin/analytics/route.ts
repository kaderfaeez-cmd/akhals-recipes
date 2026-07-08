import { NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/prisma";

export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json({
      ok: true,
      live: false,
      totals: { scans: 0, recipes: 0 },
      topRecipes: [],
      topSpices: [],
      devices: [],
      countries: [],
    });
  }

  try {
    const [scans, recipes, topRecipes, deviceGroups, countryGroups, spiceGroups] =
      await Promise.all([
        prisma.scanEvent.count(),
        prisma.recipe.count(),
        prisma.recipe.findMany({
          orderBy: { views: "desc" },
          take: 8,
          select: { slug: true, title: true, views: true, spice: { select: { name: true } } },
        }),
        prisma.scanEvent.groupBy({ by: ["device"], _count: { device: true } }),
        prisma.scanEvent.groupBy({
          by: ["country"],
          _count: { country: true },
          orderBy: { _count: { country: "desc" } },
          take: 10,
        }),
        prisma.scanEvent.groupBy({
          by: ["spiceSlug"],
          _count: { spiceSlug: true },
          orderBy: { _count: { spiceSlug: "desc" } },
          take: 10,
        }),
      ]);

    return NextResponse.json({
      ok: true,
      live: true,
      totals: { scans, recipes },
      topRecipes: topRecipes.map((r) => ({ slug: r.slug, title: r.title, views: r.views, spice: r.spice.name })),
      topSpices: spiceGroups.filter((g) => g.spiceSlug).map((g) => ({ spice: g.spiceSlug, count: g._count.spiceSlug })),
      devices: deviceGroups.map((g) => ({ device: g.device, count: g._count.device })),
      countries: countryGroups.filter((g) => g.country).map((g) => ({ country: g.country, count: g._count.country })),
    });
  } catch (err) {
    console.error("[admin/analytics]", err);
    return NextResponse.json({ ok: false, error: "Analytics query failed" }, { status: 500 });
  }
}
