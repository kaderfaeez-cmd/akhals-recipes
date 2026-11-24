import assert from "node:assert/strict";
import { test } from "vitest";
import { recipeInputSchema, recipeUpdateSchema } from "./validation.ts";

// The admin list's Publish/Draft button sends only { status }. Whatever the update schema returns
// is written to the recipe, so any field it adds that the client didn't send overwrites real data.

test("a status-only update changes only the status", () => {
  const parsed = recipeUpdateSchema.parse({ status: "PUBLISHED" });
  assert.deepEqual(parsed, { status: "PUBLISHED" });
});

test("a partial update never fills in defaults for fields it didn't send", () => {
  const parsed = recipeUpdateSchema.parse({ title: "Durban Lamb Curry" });
  for (const field of ["status", "difficulty", "gallery", "tips", "tags", "spiceProducts", "featured"]) {
    assert.equal(field in parsed, false, `${field} must not be set`);
  }
});

test("explicitly sent values are still validated and kept, including empty lists", () => {
  assert.deepEqual(recipeUpdateSchema.parse({ tips: [], featured: true }), { tips: [], featured: true });
  assert.equal(recipeUpdateSchema.safeParse({ status: "ARCHIVED" }).success, false);
  assert.equal(recipeUpdateSchema.safeParse({ slug: "Not A Slug" }).success, false);
});

test("creating a recipe still applies the defaults", () => {
  const created = recipeInputSchema.parse({
    slug: "durban-lamb-curry",
    title: "Durban Lamb Curry",
    description: "A slow-cooked lamb curry with Durban masala.",
    spiceSlug: "durban-masala",
    prepMinutes: 20,
    cookMinutes: 90,
    servings: 6,
    heroImage: "/images/lamb.webp",
    ingredients: [{ items: ["1 kg lamb"] }],
    instructions: [{ title: "Brown", body: "Brown the lamb." }],
  });
  assert.equal(created.status, "DRAFT");
  assert.equal(created.difficulty, "MEDIUM");
  assert.deepEqual([created.gallery, created.tips, created.tags, created.spiceProducts], [[], [], [], []]);
  assert.equal(created.featured, false);
});
