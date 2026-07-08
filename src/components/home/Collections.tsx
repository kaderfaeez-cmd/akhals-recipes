"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SPICE_GROUPS, SPICES } from "@/data/spices";

const GROUP_COPY: Record<string, string> = {
  Everyday: "The blends that live next to the stove.",
  "Curry & Masala": "Durban pots, Kashmiri colour, tandoori fire.",
  Seafood: "From pickled fish Fridays to prawn curry nights.",
  "Braai & Grill": "Coals, smoke, and unapologetic seasoning.",
  Signature: "The ones people phone us about.",
};

/**
 * Section 4 — editorial bento of spice collections.
 * Asymmetric grid, numbered like chapters in a cookbook.
 */
export function Collections() {
  return (
    <section id="collections" className="grain bg-cream py-24 md:py-32" aria-labelledby="collections-heading">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.header
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="eyebrow text-cinnamon">Browse by blend</p>
            <h2 id="collections-heading" className="font-display mt-4 max-w-xl text-4xl leading-tight text-ink md:text-5xl">
              Twenty-four spices. Five chapters.
            </h2>
          </div>
          <Link href="/recipes" className="eyebrow border-b border-ink/40 pb-1 text-ink-soft transition-colors hover:border-spice hover:text-spice">
            All recipes →
          </Link>
        </motion.header>

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {SPICE_GROUPS.map((group, i) => {
            const spices = SPICES.filter((s) => s.group === group);
            const wide = i === 0 || i === 3;
            return (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className={wide ? "md:col-span-4" : "md:col-span-2"}
              >
                <Link
                  href={`/recipes?group=${encodeURIComponent(group)}`}
                  className="group flex h-full flex-col justify-between rounded-sm border border-(--line) bg-cream-soft p-6 transition-all duration-300 hover:border-transparent hover:bg-charcoal md:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-display text-sm text-ink-faint transition-colors group-hover:text-saffron-bright">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="eyebrow text-ink-faint transition-colors group-hover:text-cream/50">
                      {spices.length} blends
                    </span>
                  </div>
                  <div className="mt-10">
                    <h3 className="font-display text-2xl text-ink transition-colors group-hover:text-cream md:text-3xl">
                      {group}
                    </h3>
                    <p className="mt-2 text-sm text-ink-faint transition-colors group-hover:text-cream/60">
                      {GROUP_COPY[group]}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {spices.slice(0, wide ? 6 : 3).map((s) => (
                        <span
                          key={s.slug}
                          className="rounded-full border border-(--line) px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.14em] text-ink-soft transition-colors group-hover:border-cream/20 group-hover:text-cream/70"
                        >
                          {s.name}
                        </span>
                      ))}
                      {spices.length > (wide ? 6 : 3) && (
                        <span className="px-1 py-1 text-[0.625rem] text-ink-faint transition-colors group-hover:text-cream/50">
                          +{spices.length - (wide ? 6 : 3)} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
