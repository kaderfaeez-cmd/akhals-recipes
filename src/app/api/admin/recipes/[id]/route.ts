import { NextRequest, NextResponse } from "next/server";
import { prisma, hasDatabase } from "@/lib/prisma";
import { recipeInputSchema } from "@/lib/validation";
import { spiceBySlug } from "@/data/spices";

const noDb = () =>
  NextResponse.json(
    { ok: false, error: "Database not configured. Set DATABASE_URL." },
    { status: 503 }
  );

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabase()) return noDb();
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({ where: { id }, include: { spice: true } });
  if (!recipe) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, recipe });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabase()) return noDb();
  const { id } = await params;
  const parsed = recipeInputSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { spiceSlug, ...rest } = parsed.data;

  try {
    let spiceId: string | undefined;
    if (spiceSlug) {
      const meta = spiceBySlug(spiceSlug);
      if (!meta) return NextResponse.json({ ok: false, error: "Unknown spice" }, { status: 400 });
      const spice = await prisma.spice.upsert({
        where: { slug: meta.slug },
        update: {},
        create: { slug: meta.slug, name: meta.name, tagline: meta.tagline, heatLevel: meta.heatLevel, accent: meta.accent },
      });
      spiceId = spice.id;
    }
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...rest,
        seoTitle: rest.seoTitle ?? undefined,
        seoDescription: rest.seoDescription ?? undefined,
        ...(spiceId ? { spiceId } : {}),
      },
    });
    return NextResponse.json({ ok: true, recipe });
  } catch (err) {
    console.error("[admin/recipes PUT]", err);
    return NextResponse.json({ ok: false, error: "Could not update recipe." }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabase()) return noDb();
  const { id } = await params;
  try {
    await prisma.scanEvent.deleteMany({ where: { recipeId: id } });
    await prisma.recipe.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/recipes DELETE]", err);
    return NextResponse.json({ ok: false, error: "Could not delete recipe." }, { status: 400 });
  }
}
