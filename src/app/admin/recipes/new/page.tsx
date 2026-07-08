"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { RecipeForm, EMPTY_RECIPE } from "@/components/admin/RecipeForm";

export default function NewRecipePage() {
  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-ink">New recipe</h1>
      <div className="mt-8">
        <RecipeForm initial={EMPTY_RECIPE} />
      </div>
    </AdminShell>
  );
}
