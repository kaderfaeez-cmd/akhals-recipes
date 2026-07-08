/* Seeds the database with the spice catalogue, seed recipes and an admin user.
   Run: npx prisma db seed  (configured in package.json)                        */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SPICES } from "../src/data/spices";
import { RECIPES } from "../src/data/recipes";

const prisma = new PrismaClient();

async function main() {
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
