/* Seeds the database with the spice catalogue, starter recipes and the first admin user.
   Runs on every Vercel build (package.json `vercel-build`) and via `npx prisma db seed`.
   The rules that make it safe to repeat against production live in prisma/seed-core.ts.   */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SPICES } from "../src/data/spices";
import { RECIPES } from "../src/data/recipes";
import { runSeed, type SeedStore } from "./seed-core";

const prisma = new PrismaClient();

const store: SeedStore = {
  async retireRecipes(slugs, createdBefore) {
    const rows = await prisma.recipe.findMany({
      where: { slug: { in: slugs }, createdAt: { lt: createdBefore } },
      select: { id: true },
    });
    if (rows.length === 0) return 0;
    const ids = rows.map((r) => r.id);
    await prisma.$transaction([
      prisma.scanEvent.deleteMany({ where: { recipeId: { in: ids } } }),
      prisma.recipe.deleteMany({ where: { id: { in: ids } } }),
    ]);
    return ids.length;
  },

  async upsertSpice(s) {
    const data = { name: s.name, tagline: s.tagline, heatLevel: s.heatLevel, accent: s.accent };
    await prisma.spice.upsert({ where: { slug: s.slug }, update: data, create: { slug: s.slug, ...data } });
  },

  countRecipes: () => prisma.recipe.count(),

  async createRecipeIfMissing(r) {
    const spice = await prisma.spice.findUniqueOrThrow({ where: { slug: r.spiceSlug } });
    await prisma.recipe.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        slug: r.slug,
        title: r.title,
        description: r.description,
        status: "PUBLISHED",
        difficulty: r.difficulty,
        prepMinutes: r.prepMinutes,
        cookMinutes: r.cookMinutes,
        servings: r.servings,
        heroImage: r.heroImage,
        ingredients: JSON.parse(JSON.stringify(r.ingredients)),
        instructions: JSON.parse(JSON.stringify(r.instructions)),
        tips: r.tips,
        tags: r.tags,
        spiceProducts: r.spiceProducts,
        featured: r.featured,
        views: r.views,
        publishedAt: new Date(r.publishedAt),
        spiceId: spice.id,
      },
    });
  },

  countAdmins: () => prisma.user.count({ where: { role: "ADMIN" } }),

  async findUserRole(email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
    return user?.role ?? null;
  },

  async createAdmin({ email, name, passwordHash }) {
    await prisma.user.create({ data: { email, name, passwordHash, role: "ADMIN" } });
  },
};

runSeed(store, {
  spices: SPICES,
  recipes: RECIPES,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  hashPassword: (password) => bcrypt.hash(password, 12),
  log: { info: console.log, warn: console.warn },
})
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
