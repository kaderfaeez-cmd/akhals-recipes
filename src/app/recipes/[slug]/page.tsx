import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users, Flame, Timer } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { CookingMode } from "@/components/recipes/CookingMode";
import { ShareActions } from "@/components/recipes/ShareActions";
import { ScanTracker } from "@/components/recipes/ScanTracker";
import { getRecipe, getRelatedRecipes, getAllRecipes } from "@/lib/recipes";

export async function generateStaticParams() {
  const recipes = await getAllRecipes();
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return {};
  return {
    title: recipe.title,
    description: recipe.description,
    alternates: { canonical: `/recipes/${recipe.slug}` },
    openGraph: {
      title: `${recipe.title} · Akhals Spice & More`,
      description: recipe.description,
      type: "article",
      images: [{ url: recipe.heroImage, width: 1792, height: 1344 }],
    },
  };
}

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Moderate",
  HARD: "Project",
};

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();
  const related = await getRelatedRecipes(recipe);

  const recipeSchema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: [recipe.heroImage],
    author: { "@type": "Organization", name: "Akhals Spice & More" },
    datePublished: recipe.publishedAt,
    prepTime: `PT${recipe.prepMinutes}M`,
    cookTime: `PT${recipe.cookMinutes}M`,
    totalTime: `PT${recipe.prepMinutes + recipe.cookMinutes}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: "Main course",
    recipeCuisine: "South African",
    keywords: recipe.tags.join(", "),
    recipeIngredient: recipe.ingredients.flatMap((g) => g.items),
    recipeInstructions: recipe.instructions.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  };

  return (
    <>
      <SiteHeader />
      <ScanTracker recipeSlug={recipe.slug} spiceSlug={recipe.spiceSlug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />
      <main id="main" className="bg-cream">
        {/* Hero */}
        <div className="relative h-[52vh] min-h-[380px] w-full bg-charcoal md:h-[64vh]">
          <Image
            src={recipe.heroImage}
            alt={recipe.title}
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-charcoal/40" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-4xl px-5 pb-10 md:px-8 md:pb-14">
              <Link
                href={`/recipes?spice=${recipe.spiceSlug}`}
                className="inline-block px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-cream"
                style={{ backgroundColor: recipe.spiceAccent }}
              >
                {recipe.spiceName}
              </Link>
              <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] text-cream md:text-6xl">
                {recipe.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-(--line) pb-8 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <Timer size={16} strokeWidth={1.75} aria-hidden className="text-cinnamon" />
              Prep {recipe.prepMinutes} min
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock size={16} strokeWidth={1.75} aria-hidden className="text-cinnamon" />
              Cook {recipe.cookMinutes} min
            </span>
            <span className="inline-flex items-center gap-2">
              <Users size={16} strokeWidth={1.75} aria-hidden className="text-cinnamon" />
              Serves {recipe.servings}
            </span>
            <span className="inline-flex items-center gap-2">
              <Flame size={16} strokeWidth={1.75} aria-hidden className="text-cinnamon" />
              {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
            </span>
          </div>

          <p className="mt-8 text-lg leading-relaxed text-ink-soft">{recipe.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <CookingMode title={recipe.title} steps={recipe.instructions} />
            <ShareActions title={recipe.title} description={recipe.description} />
          </div>

          <div className="mt-14 grid gap-12 md:grid-cols-12">
            {/* Ingredients */}
            <aside className="md:col-span-5">
              <h2 className="font-display text-2xl text-ink md:text-3xl">Ingredients</h2>
              {recipe.ingredients.map((group, gi) => (
                <div key={gi} className="mt-6">
                  {group.group && <h3 className="eyebrow text-cinnamon">{group.group}</h3>}
                  <ul className="mt-3 space-y-3">
                    {group.items.map((item, ii) => (
                      <li key={ii} className="flex gap-3 border-b border-(--line) pb-3 text-sm leading-relaxed text-ink-soft">
                        <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: recipe.spiceAccent }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="mt-10 rounded-sm bg-cream-deep p-6">
                <h3 className="eyebrow text-cinnamon">From our shelf</h3>
                <ul className="mt-4 space-y-2.5">
                  {recipe.spiceProducts.map((p) => (
                    <li key={p} className="font-display text-lg text-ink">
                      Akhals {p}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Method */}
            <div className="md:col-span-7">
              <h2 className="font-display text-2xl text-ink md:text-3xl">Method</h2>
              <ol className="mt-6 space-y-8">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-5">
                    <span className="font-display mt-0.5 text-3xl text-cinnamon/60" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-ink">{step.title}</h3>
                      <p className="mt-2 leading-relaxed text-ink-soft">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {recipe.tips.length > 0 && (
                <div className="mt-12 border-l-2 pl-6" style={{ borderColor: recipe.spiceAccent }}>
                  <h3 className="eyebrow text-cinnamon">From the Akhals kitchen</h3>
                  <ul className="mt-4 space-y-3">
                    {recipe.tips.map((tip, i) => (
                      <li key={i} className="text-sm italic leading-relaxed text-ink-soft">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="grain border-t border-(--line) bg-cream-soft py-16 md:py-24" aria-labelledby="related-heading">
            <div className="mx-auto max-w-6xl px-5 md:px-8">
              <h2 id="related-heading" className="font-display text-3xl text-ink md:text-4xl">
                Keep the stove on
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <RecipeCard key={r.slug} recipe={r} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
