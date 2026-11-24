/* Seed logic, separated from Prisma so it can be tested with an in-memory store
   (prisma/seed-core.test.ts). prisma/seed.ts wires it to the real database.

   This runs on EVERY Vercel build (package.json `vercel-build`) against production, so every
   step must be safe to repeat:
   - it bootstraps an empty database (first deploy);
   - it never brings back a recipe the client deleted;
   - it never changes an existing user, so the admin's password is never reset from env;
   - it never deletes a recipe the client wrote.                                              */
import type { Recipe } from "../src/data/recipes";
import type { Spice } from "../src/data/spices";

// Earlier placeholder recipes, replaced by the family-notebook originals in commit ed8cf08.
export const RETIRED_SLUGS = [
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

// Commit time of ed8cf08, which stopped the seed creating the placeholders. A row with a retired
// slug created before this can only be a placeholder (the slug is unique, so the client could not
// have used it while the placeholder existed). Anything created later is the client's own recipe
// (a "butter-chicken" is a likely name) and must survive.
export const RETIREMENT_CUTOFF = new Date("2026-07-09T01:22:26+02:00");

export const DEFAULT_ADMIN_EMAIL = "admin@akhalsrecipes.co.za";

/** The database operations the seed needs. prisma/seed.ts implements it with Prisma. */
export interface SeedStore {
  /** Delete recipes (and their scan events) with these slugs created before the date. */
  retireRecipes(slugs: string[], createdBefore: Date): Promise<number>;
  /** Create or refresh one spice from the code catalogue (src/data/spices.ts is canonical). */
  upsertSpice(spice: Spice): Promise<void>;
  countRecipes(): Promise<number>;
  /** Insert a seed recipe as PUBLISHED; do nothing if its slug already exists. */
  createRecipeIfMissing(recipe: Recipe): Promise<void>;
  countAdmins(): Promise<number>;
  findUserRole(email: string): Promise<"ADMIN" | "EDITOR" | null>;
  createAdmin(user: { email: string; name: string; passwordHash: string }): Promise<void>;
}

export interface SeedOptions {
  spices: Spice[];
  recipes: Recipe[];
  adminEmail?: string;
  adminPassword?: string;
  hashPassword: (password: string) => Promise<string>;
  log: { info: (msg: string) => void; warn: (msg: string) => void };
}

export async function runSeed(store: SeedStore, opts: SeedOptions): Promise<void> {
  const { log } = opts;

  const retired = await store.retireRecipes(RETIRED_SLUGS, RETIREMENT_CUTOFF);
  if (retired > 0) log.info(`Retired ${retired} placeholder recipes`);

  for (const spice of opts.spices) await store.upsertSpice(spice);
  log.info(`Seeded ${opts.spices.length} spices`);

  // Seed recipes only into an empty table. Once the client has content, a deleted seed recipe
  // stays deleted. (If every recipe is deleted, the next deploy re-inserts the starter set.)
  if ((await store.countRecipes()) === 0) {
    for (const recipe of opts.recipes) await store.createRecipeIfMissing(recipe);
    log.info(`Inserted ${opts.recipes.length} seed recipes into an empty recipe table`);
  } else {
    log.info("Recipes already exist — seed recipes not inserted");
  }

  await ensureAdmin(store, opts);
}

/** Creates the first admin from env. Never updates an existing user or password hash. */
async function ensureAdmin(store: SeedStore, opts: SeedOptions): Promise<void> {
  const { log } = opts;
  if ((await store.countAdmins()) > 0) {
    log.info("Admin user exists — left unchanged");
    return;
  }
  if (!opts.adminPassword) {
    log.warn("No admin user and ADMIN_PASSWORD not set — skipping admin user creation.");
    return;
  }
  // Login looks the email up lowercased (src/lib/auth.ts), so store it lowercased.
  const email = (opts.adminEmail ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  if (await store.findUserRole(email)) {
    log.warn(`A non-admin user already uses ${email} — not changing it; no admin created.`);
    return;
  }
  await store.createAdmin({
    email,
    name: "Akhals Admin",
    passwordHash: await opts.hashPassword(opts.adminPassword),
  });
  log.info(`Admin user created: ${email}`);
}
