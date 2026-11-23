import { z } from "zod";

/**
 * Field rules shared by create and update. Defaults are deliberately NOT here: zod 4's .partial()
 * still applies .default(), so an update built from a schema with defaults would fill every field
 * the client didn't send (a status-only Publish/Draft toggle used to wipe tips, tags, gallery and
 * products and reset difficulty and featured). Defaults belong to creation only.
 */
const recipeFields = {
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(1000),
  spiceSlug: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  prepMinutes: z.coerce.number().int().min(0).max(24 * 60),
  cookMinutes: z.coerce.number().int().min(0).max(48 * 60),
  servings: z.coerce.number().int().min(1).max(100),
  heroImage: z.string().min(1),
  gallery: z.array(z.string()),
  ingredients: z
    .array(
      z.object({
        group: z.string().max(80).optional(),
        items: z.array(z.string().min(1).max(300)).min(1),
      })
    )
    .min(1),
  instructions: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        body: z.string().min(1).max(2000),
      })
    )
    .min(1),
  tips: z.array(z.string().max(500)),
  tags: z.array(z.string().max(40)),
  spiceProducts: z.array(z.string().max(80)),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(170).optional().nullable(),
  featured: z.boolean(),
};

/** Body of POST /api/admin/recipes: a full recipe, with defaults for the optional parts. */
export const recipeInputSchema = z.object({
  ...recipeFields,
  status: recipeFields.status.default("DRAFT"),
  difficulty: recipeFields.difficulty.default("MEDIUM"),
  gallery: recipeFields.gallery.default([]),
  tips: recipeFields.tips.default([]),
  tags: recipeFields.tags.default([]),
  spiceProducts: recipeFields.spiceProducts.default([]),
  featured: recipeFields.featured.default(false),
});

export type RecipeInput = z.infer<typeof recipeInputSchema>;

/** Body of PUT /api/admin/recipes/[id]: any subset of the recipe fields; only sent fields are returned. */
export const recipeUpdateSchema = z.object(recipeFields).partial();
