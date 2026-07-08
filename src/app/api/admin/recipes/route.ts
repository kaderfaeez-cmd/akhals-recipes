import { NextRequest, NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { recipeInputSchema } from "@/lib/validation";
import { spiceBySlug } from "@/data/spices";

const noDb = () =>
  NextResponse.json(
    { ok: false, error: "Database not configured. Set DATABASE_URL." },
    { status: 503 }
  );

export async function GET() {
  if (!hasDatabase()) return noDb();
  const recipes = await prisma.recipe.findMany({
    include: { spice: { select: { name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ ok: true, recipes });
}

export async function POST(req: NextRequest) {
  if (!hasDatabase()) return noDb();
  const parsed = recipeInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const spiceMeta = spiceBySlug(data.spiceSlug);
  if (!spiceMeta) {
    return NextResponse.json({ ok: false, error: "Unknown spice" }, { status: 400 });
  }

  try {
    const spice = await prisma.spice.upsert({
      where: { slug: spiceMeta.slug },
      update: {},
      create: {
        slug: spiceMeta.slug,
        name: spiceMeta.name,
        tagline: spiceMeta.tagline,
        heatLevel: spiceMeta.heatLevel,
        accent: spiceMeta.accent,
      },
    });
    const recipe = await prisma.recipe.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        status: data.status,
        difficulty: data.difficulty,
        prepMinutes: data.prepMinutes,
        cookMinutes: data.cookMinutes,
        servings: data.servings,
        heroImage: data.heroImage,
        gallery: data.gallery,
        ingredients: data.ingredients,
        instructions: data.instructions,
        tips: data.tips,
        tags: data.tags,
        spiceProducts: data.spiceProducts,
        seoTitle: data.seoTitle ?? undefined,
        seoDescription: data.seoDescription ?? undefined,
        featured: data.featured,
        spiceId: spice.id,
      },
    });
    return NextResponse.json({ ok: true, recipe }, { status: 201 });
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "code" in err && err.code === "P2002"
        ? "A recipe with that slug already exists."
        : "Could not create recipe.";
    console.error("[admin/recipes POST]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
