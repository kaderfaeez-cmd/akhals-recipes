import { z } from "zod";

export const recipeInputSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(1000),
  spiceSlug: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  prepMinutes: z.coerce.number().int().min(0).max(24 * 60),
  cookMinutes: z.coerce.number().int().min(0).max(48 * 60),
  servings: z.coerce.number().int().min(1).max(100),
  heroImage: z.string().min(1),
  gallery: z.array(z.string()).default([]),
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
  tips: z.array(z.string().max(500)).default([]),
  tags: z.array(z.string().max(40)).default([]),
  spiceProducts: z.array(z.string().max(80)).default([]),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(170).optional().nullable(),
  featured: z.boolean().default(false),
});

export type RecipeInput = z.infer<typeof recipeInputSchema>;
