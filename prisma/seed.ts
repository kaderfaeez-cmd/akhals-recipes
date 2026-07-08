/* Seeds the database with the spice catalogue, seed recipes and an admin user.
   Run: npx prisma db seed  (configured in package.json)                        */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SPICES } from "../src/data/spices";
import { RECIPES } from "../src/data/recipes";

const prisma = new PrismaClient();

// Earlier placeholder recipes, replaced by the family-notebook originals.
// Removed here so production doesn't keep serving invented content.
const RETIRED_SLUGS = [
  "durban-chicken-curry",
  "lamb-biryani",
  "chicken-tikka-skewers",
  "cape-malay-pickled-fish",
  "braai-tbone-steak",
  "coconut-prawn-curry",
  "butter-chicken",
  "lamb-potjiekos",
  "tandoori-roast-chicken",
  "pepper-steak-potjie-pie",
  "kashmiri-lamb-curry",
  "crispy-fried-fish",
];

async function main() {
  // Retire placeholder recipes (and their scan events) if present
  const retired = await prisma.recipe.findMany({
    where: { slug: { in: RETIRED_SLUGS } },
    select: { id: true },
  });
  if (retired.length > 0) {
    const ids = retired.map((r) => r.id);
    await prisma.scanEvent.deleteMany({ where: { recipeId: { in: ids } } });
    await prisma.recipe.deleteMany({ where: { id: { in: ids } } });
    console.log(`Retired ${ids.length} placeholder recipes`);
  }

  // Spices
  for (const s of SPICES) {
    await prisma.spice.upsert({
      where: { slug: s.slug },
      update: { name: s.name, tagline: s.tagline, heatLevel: s.heatLevel, accent: s.accent },
      create: { slug: s.slug, name: s.name, tagline: s.tagline, heatLevel: s.heatLevel, accent: s.accent },
    });
  }
  console.log(`Seeded ${SPICES.length} spices`);

  // Recipes
  for (const r of RECIPES) {
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
  }
  console.log(`Seeded ${RECIPES.length} recipes`);

  // Admin user
  const email = process.env.ADMIN_EMAIL ?? "admin@akhalsrecipes.co.za";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn("ADMIN_PASSWORD not set — skipping admin user creation.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Akhals Admin", passwordHash, role: "ADMIN" },
  });
  console.log(`Admin user ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
