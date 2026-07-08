import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RecipeExplorer } from "@/components/recipes/RecipeExplorer";
import { getAllRecipes } from "@/lib/recipes";
import { spiceBySlug } from "@/data/spices";

export const metadata: Metadata = {
  title: "All Recipes",
  description:
    "Search and filter every Akhals Spice & More recipe — by spice blend, cooking time, difficulty and popularity.",
  alternates: { canonical: "/recipes" },
};

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ spice?: string; group?: string }>;
}) {
  const { spice, group } = await searchParams;
  const recipes = await getAllRecipes();
  const activeSpice = spice && spiceBySlug(spice) ? spice : undefined;

  return (
    <>
      <SiteHeader />
      <main id="main" className="grain min-h-screen bg-cream pb-24 pt-28 md:pt-36">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <header className="max-w-2xl">
            <p className="eyebrow text-cinnamon">The recipe library</p>
            <h1 className="font-display mt-4 text-4xl leading-tight text-ink md:text-6xl">
              {activeSpice
                ? `Recipes for ${spiceBySlug(activeSpice)!.name}`
                : "What are we cooking?"}
            </h1>
            <p className="mt-5 text-ink-faint">
              Every recipe is written for a specific Akhals blend. Scanned a
              packet? Its recipes are already filtered for you below.
            </p>
          </header>
          <div className="mt-12">
            <RecipeExplorer recipes={recipes} initialSpice={activeSpice} initialGroup={group} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
