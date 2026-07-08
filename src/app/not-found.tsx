import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="grain flex min-h-[70vh] flex-col items-center justify-center bg-cream px-6 pt-20 text-center">
        <p className="eyebrow text-cinnamon">Nothing simmering here</p>
        <h1 className="font-display mt-4 text-5xl text-ink md:text-6xl">This page boiled dry.</h1>
        <p className="mt-4 max-w-md text-ink-faint">
          The recipe you&apos;re after may have moved. The whole library is one click away.
        </p>
        <Link
          href="/recipes"
          className="eyebrow mt-8 border border-ink/30 px-6 py-3.5 text-ink transition-colors hover:border-spice hover:text-spice"
        >
          Browse all recipes
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
