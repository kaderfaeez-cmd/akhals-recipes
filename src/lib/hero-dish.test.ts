import { describe, expect, test } from "vitest";
import { RECIPES } from "@/data/recipes";
import { RETIRED_SLUGS } from "../../prisma/seed-core";
import { heroDishProps } from "./hero-dish";
import type { RecipeListItem } from "./recipes";

// The homepage hero links to a featured recipe. With nothing featured it fell back to
// "durban-chicken-curry", a retired placeholder slug that no longer exists, so the link 404'd.

const item = (slug: string, featured = false): RecipeListItem => ({
  slug,
  title: `Title ${slug}`,
  description: "d",
  spiceSlug: "durban-special",
  spiceName: "Durban Special",
  spiceAccent: "#000",
  difficulty: "EASY",
  prepMinutes: 1,
  cookMinutes: 1,
  servings: 1,
  heroImage: `/img/${slug}.png`,
  tags: [],
  featured,
  views: 0,
  publishedAt: "2026-07-09T00:00:00.000Z",
});

describe("heroDishProps", () => {
  test("uses the first featured recipe", () => {
    expect(heroDishProps([item("a", true)], [item("b"), item("a", true)])).toEqual({
      dishImage: "/img/a.png",
      dishTitle: "Title a",
      dishHref: "/recipes/a",
    });
  });

  test("with nothing featured, links to a recipe that actually exists", () => {
    const props = heroDishProps([], [item("newest"), item("older")]);
    expect(props.dishHref).toBe("/recipes/newest");
    expect(props.dishTitle).toBe("Title newest");
  });

  test("with no recipes at all, links to the library rather than a retired slug", () => {
    const props = heroDishProps([], []);
    expect(props.dishHref).toBe("/recipes");
    expect(RETIRED_SLUGS.includes(props.dishHref.replace("/recipes/", ""))).toBe(false);
  });

  test("the fallback image is one of the current seed recipes' images", () => {
    expect(RECIPES.map((r) => r.heroImage)).toContain(heroDishProps([], []).dishImage);
  });
});
