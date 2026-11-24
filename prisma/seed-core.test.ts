import { describe, expect, test } from "vitest";
import { RECIPES, type Recipe } from "../src/data/recipes";
import { SPICES, type Spice } from "../src/data/spices";
import { RETIRED_SLUGS, RETIREMENT_CUTOFF, runSeed, type SeedStore } from "./seed-core";

// prisma/seed.ts runs on EVERY Vercel build against the production database. It must be safe to
// re-run: it may bootstrap an empty database, but it must never bring back recipes the client
// deleted, never touch the admin's password, and never delete a recipe the client wrote.
// This in-memory store stands in for Prisma; no test here touches a real database.

interface Row {
  slug: string;
  createdAt: Date;
  title: string;
}
interface UserRow {
  email: string;
  role: "ADMIN" | "EDITOR";
  passwordHash: string;
}

function memoryStore() {
  const db = {
    spices: new Map<string, Spice>(),
    recipes: [] as Row[],
    users: [] as UserRow[],
  };
  const store: SeedStore = {
    async retireRecipes(slugs, createdBefore) {
      const doomed = db.recipes.filter((r) => slugs.includes(r.slug) && r.createdAt < createdBefore);
      db.recipes = db.recipes.filter((r) => !doomed.includes(r));
      return doomed.length;
    },
    async upsertSpice(spice) {
      db.spices.set(spice.slug, spice);
    },
    async countRecipes() {
      return db.recipes.length;
    },
    async createRecipeIfMissing(recipe: Recipe) {
      if (!db.spices.has(recipe.spiceSlug)) throw new Error(`no spice ${recipe.spiceSlug}`);
      if (db.recipes.some((r) => r.slug === recipe.slug)) return;
      db.recipes.push({ slug: recipe.slug, createdAt: new Date(), title: recipe.title });
    },
    async countAdmins() {
      return db.users.filter((u) => u.role === "ADMIN").length;
    },
    async findUserRole(email) {
      return db.users.find((u) => u.email === email)?.role ?? null;
    },
    async createAdmin({ email, passwordHash }) {
      if (db.users.some((u) => u.email === email)) throw new Error("unique violation");
      db.users.push({ email, passwordHash, role: "ADMIN" });
    },
  };
  return { db, store };
}

const hashPassword = async (pw: string) => `hashed:${pw}`;
const quiet = { info: () => {}, warn: () => {} };
const seed = (store: SeedStore, adminPassword?: string, adminEmail = "Owner@Akhals.example") =>
  runSeed(store, {
    spices: SPICES,
    recipes: RECIPES,
    adminEmail,
    adminPassword,
    hashPassword,
    log: quiet,
  });

describe("first deploy against an empty database", () => {
  test("creates the spice catalogue, the seed recipes and the admin", async () => {
    const { db, store } = memoryStore();
    await seed(store, "first-password");
    expect(db.spices.size).toBe(SPICES.length);
    expect(db.recipes.map((r) => r.slug).sort()).toEqual(RECIPES.map((r) => r.slug).sort());
    expect(db.users).toEqual([
      // Stored lowercased: login looks the email up lowercased.
      { email: "owner@akhals.example", passwordHash: "hashed:first-password", role: "ADMIN" },
    ]);
  });

  test("without ADMIN_PASSWORD it still seeds content and skips the admin", async () => {
    const { db, store } = memoryStore();
    await seed(store, undefined);
    expect(db.recipes.length).toBe(RECIPES.length);
    expect(db.users).toEqual([]);
  });
});

describe("every later deploy", () => {
  test("a seed recipe the client deleted stays deleted", async () => {
    const { db, store } = memoryStore();
    await seed(store, "pw");
    const deleted = RECIPES[0].slug;
    db.recipes = db.recipes.filter((r) => r.slug !== deleted);

    await seed(store, "pw");
    expect(db.recipes.some((r) => r.slug === deleted)).toBe(false);
    expect(db.recipes.length).toBe(RECIPES.length - 1);
  });

  test("the admin's password hash is never overwritten from env", async () => {
    const { db, store } = memoryStore();
    await seed(store, "first-password");
    db.users[0].passwordHash = "hash-the-client-set-later";

    await seed(store, "different-env-password");
    expect(db.users).toEqual([
      { email: "owner@akhals.example", passwordHash: "hash-the-client-set-later", role: "ADMIN" },
    ]);
  });

  test("no second admin is created when ADMIN_EMAIL changes", async () => {
    const { db, store } = memoryStore();
    await seed(store, "pw", "first@akhals.example");
    await seed(store, "pw", "second@akhals.example");
    expect(db.users.map((u) => u.email)).toEqual(["first@akhals.example"]);
  });

  test("an existing non-admin user with the admin email is left untouched", async () => {
    const { db, store } = memoryStore();
    db.users.push({ email: "owner@akhals.example", passwordHash: "editor-hash", role: "EDITOR" });
    await seed(store, "pw");
    expect(db.users).toEqual([{ email: "owner@akhals.example", passwordHash: "editor-hash", role: "EDITOR" }]);
  });

  test("the spice catalogue is still refreshed from code", async () => {
    const { db, store } = memoryStore();
    await seed(store, "pw");
    db.spices.set(SPICES[0].slug, { ...SPICES[0], name: "stale name" });
    await seed(store, "pw");
    expect(db.spices.get(SPICES[0].slug)?.name).toBe(SPICES[0].name);
  });
});

describe("retired placeholder recipes", () => {
  test("old placeholders are removed, but a recipe the client later wrote under that slug is kept", async () => {
    const { db, store } = memoryStore();
    const before = new Date(RETIREMENT_CUTOFF.getTime() - 60_000);
    const after = new Date(RETIREMENT_CUTOFF.getTime() + 86_400_000);
    db.recipes.push(
      { slug: RETIRED_SLUGS[0], createdAt: before, title: "placeholder" },
      { slug: "butter-chicken", createdAt: after, title: "the client's own butter chicken" }
    );
    expect(RETIRED_SLUGS).toContain("butter-chicken");

    await seed(store, "pw");
    expect(db.recipes.some((r) => r.title === "placeholder")).toBe(false);
    expect(db.recipes.some((r) => r.title === "the client's own butter chicken")).toBe(true);
  });
});
