import { revalidatePath } from "next/cache";

/**
 * Marks every public page that shows recipe data as stale, so the next visitor gets a fresh
 * render. The homepage and each /recipes/<slug> page are prerendered at build time with no
 * time-based revalidation, so without this an admin change only went live on the next deploy.
 *
 * Call it after any successful admin write (create, update, status change, delete). The
 * `/recipes/[slug]` pattern covers the edited recipe, a renamed slug's old page, and the
 * "related recipes" strip that every other recipe page renders.
 */
export function revalidatePublicRecipePages(): void {
  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath("/recipes/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
