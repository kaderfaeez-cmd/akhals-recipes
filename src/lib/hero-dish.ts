import type { RecipeListItem } from "@/lib/recipes";

// A current seed recipe's photo, used only if there are no recipes at all.
const FALLBACK_IMAGE = "/img/recipes/durban-chicken-curry.png";

/**
 * Props for the homepage hero dish: the first featured recipe, else the newest published one,
 * else a link to the recipe library. Never a hard-coded slug, which can be retired or deleted
 * and then 404s.
 */
export function heroDishProps(featured: RecipeListItem[], all: RecipeListItem[]) {
  const dish = featured[0] ?? all[0];
  if (!dish) return { dishImage: FALLBACK_IMAGE, dishTitle: "Our recipes", dishHref: "/recipes" };
  return { dishImage: dish.heroImage, dishTitle: dish.title, dishHref: `/recipes/${dish.slug}` };
}
