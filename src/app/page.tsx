import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CinematicHero } from "@/components/hero/CinematicHero";
import { FeaturedSteam } from "@/components/home/FeaturedSteam";
import { Collections } from "@/components/home/Collections";
import { Story, FinalCta } from "@/components/home/StoryAndCta";
import { getAllRecipes, getFeaturedRecipes } from "@/lib/recipes";
import { heroDishProps } from "@/lib/hero-dish";

export default async function HomePage() {
  const [featured, all] = await Promise.all([getFeaturedRecipes(), getAllRecipes()]);

  return (
    <>
      <SiteHeader dark />
      <main id="main">
        <CinematicHero {...heroDishProps(featured, all)} />
        <FeaturedSteam recipes={featured} />
        <Collections />
        <Story />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
