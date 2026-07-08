"use client";

import { motion } from "framer-motion";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { RecipeListItem } from "@/lib/recipes";

/**
 * Section 3 — featured recipes rise out of the "steam" of the hero's dish.
 * A soft vertical gradient + blurred plumes at the seam, with cards drifting
 * up on scroll like rising vapour.
 */
export function FeaturedSteam({ recipes }: { recipes: RecipeListItem[] }) {
  return (
    <section className="relative bg-charcoal pb-24 pt-4 md:pb-32" aria-labelledby="featured-heading">
      {/* Steam plumes at the seam */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 h-72 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute bottom-0 h-64 w-40 rounded-full bg-cream/10 blur-3xl"
            style={{ left: `${18 + i * 28}%` }}
            animate={{ y: [-10, -70, -10], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 7 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.header
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="eyebrow text-saffron-bright">Out of the steam</p>
          <h2 id="featured-heading" className="font-display mt-4 text-4xl leading-tight text-cream md:text-5xl">
            What our kitchens can&apos;t stop making
          </h2>
        </motion.header>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recipes.map((r, i) => (
            <motion.div
              key={r.slug}
              initial={{ opacity: 0, y: 56 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            >
              <RecipeCard recipe={r} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
