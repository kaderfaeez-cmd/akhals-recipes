// Read layer for recipes. Uses Postgres via Prisma when DATABASE_URL is set,
// otherwise serves the seed content from src/data — so the site renders fully
// before the database is provisioned.
import { RECIPES, type Recipe as SeedRecipe } from "@/data/recipes";
import { SPICES, spiceBySlug } from "@/data/spices";
import { hasDatabase, prisma } from "@/lib/prisma";

export interface RecipeListItem {
  slug: string;
  title: string;
  description: string;
  spiceSlug: string;
  spiceName: string;
  spiceAccent: string;
  difficulty: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  heroImage: string;
  tags: string[];
  featured: boolean;
  views: number;
  publishedAt: string;
}

export interface RecipeDetail extends RecipeListItem {
  ingredients: { group?: string; items: string[] }[];
  instructions: { title: string; body: string }[];
  tips: string[];
  spiceProducts: string[];
}

function fromSeed(r: SeedRecipe): RecipeDetail {
  const spice = spiceBySlug(r.spiceSlug);
  return {
    ...r,
    spiceName: spice?.name ?? r.spiceSlug,
    spiceAccent: spice?.accent ?? "#9e2612",
  };
}

type DbRecipe = {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  heroImage: string;
  tags: string[];
  featured: boolean;
  views: number;
  publishedAt: Date;
  ingredients: unknown;
  instructions: unknown;
  tips: string[];
  spiceProducts: string[];
  spice: { slug: string; name: string; accent: string };
};

function fromDb(r: DbRecipe): RecipeDetail {
  return {
    slug: r.slug,
    title: r.title,
    description: r.description,
    spiceSlug: r.spice.slug,
    spiceName: r.spice.name,
    spiceAccent: r.spice.accent,
    difficulty: r.difficulty,
    prepMinutes: r.prepMinutes,
    cookMinutes: r.cookMinutes,
    servings: r.servings,
    heroImage: r.heroImage,
    tags: r.tags,
    featured: r.featured,
    views: r.views,
    publishedAt: r.publishedAt.toISOString(),
    ingredients: (r.ingredients as RecipeDetail["ingredients"]) ?? [],
    instructions: (r.instructions as RecipeDetail["instructions"]) ?? [],
    tips: r.tips,
    spiceProducts: r.spiceProducts,
  };
}

export async function getAllRecipes(): Promise<RecipeDetail[]> {
  if (hasDatabase()) {
    try {
      const rows = await prisma.recipe.findMany({
        where: { status: "PUBLISHED" },
        include: { spice: true },
        orderBy: { publishedAt: "desc" },
      });
      if (rows.length > 0) return rows.map(fromDb);
    } catch (err) {
      console.error("[recipes] DB read failed, using seed data:", err);
    }
  }
  return RECIPES.map(fromSeed);
}

export async function getRecipe(slug: string): Promise<RecipeDetail | null> {
  if (hasDatabase()) {
    try {
      const row = await prisma.recipe.findUnique({
        where: { slug },
        include: { spice: true },
      });
      if (row && row.status === "PUBLISHED") return fromDb(row);
      if (row) return null;
    } catch (err) {
      console.error("[recipes] DB read failed, using seed data:", err);
    }
  }
  const seed = RECIPES.find((r) => r.slug === slug);
  return seed ? fromSeed(seed) : null;
}

export async function getFeaturedRecipes(): Promise<RecipeDetail[]> {
  const all = await getAllRecipes();
  return all.filter((r) => r.featured).slice(0, 4);
}

export async function getRelatedRecipes(recipe: RecipeDetail, limit = 3): Promise<RecipeListItem[]> {
  const all = await getAllRecipes();
  const scored = all
    .filter((r) => r.slug !== recipe.slug)
    .map((r) => ({
      r,
      score:
        (r.spiceSlug === recipe.spiceSlug ? 3 : 0) +
        r.tags.filter((t) => recipe.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.r);
}

export { SPICES };
