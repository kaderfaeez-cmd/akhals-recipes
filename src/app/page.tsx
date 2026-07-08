import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CinematicHero } from "@/components/hero/CinematicHero";
import { FeaturedSteam } from "@/components/home/FeaturedSteam";
import { Collections } from "@/components/home/Collections";
import { Story, FinalCta } from "@/components/home/StoryAndCta";
import { getFeaturedRecipes } from "@/lib/recipes";

export default async function HomePage() {
  const featured = await getFeaturedRecipes();
  const heroDish = featured[0];

  return (
    <>
      <SiteHeader dark />
      <main id="main">
        <CinematicHero
          dishImage={heroDish?.heroImage ?? "/img/recipes/durban-chicken-curry.png"}
          dishTitle={heroDish?.title ?? "Durban Chicken Curry"}
          dishHref={`/recipes/${heroDish?.slug ?? "durban-chicken-curry"}`}
        />
        <FeaturedSteam recipes={featured} />
        <Collections />
        <Story />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
