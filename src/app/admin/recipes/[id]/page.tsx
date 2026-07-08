"use client";

import { use } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { RecipeForm, EMPTY_RECIPE, type RecipeFormValues } from "@/components/admin/RecipeForm";
import useFetch from "@/components/admin/useFetch";

interface ApiRecipe extends Omit<RecipeFormValues, "spiceSlug"> {
  id: string;
  spice: { slug: string };
  ingredients: { group?: string; items: string[] }[];
  instructions: { title: string; body: string }[];
}

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error } = useFetch<{ ok: boolean; recipe?: ApiRecipe; error?: string }>(
    `/api/admin/recipes/${id}`
  );

  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-ink">Edit recipe</h1>
      {error && <p role="alert" className="mt-6 text-sm text-spice">{error}</p>}
      {data && !data.ok && <p role="alert" className="mt-6 text-sm text-spice">{data.error}</p>}
      {data?.recipe && (
        <div className="mt-8">
          <RecipeForm
            initial={{
              ...EMPTY_RECIPE,
              ...data.recipe,
              spiceSlug: data.recipe.spice.slug,
            }}
          />
        </div>
      )}
    </AdminShell>
  );
}
