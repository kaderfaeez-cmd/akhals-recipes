"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Story() {
  return (
    <section id="story" className="bg-cream-deep py-24 md:py-32" aria-labelledby="story-heading">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-12 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5"
        >
          <p className="eyebrow text-cinnamon">Our craft</p>
          <h2 id="story-heading" className="font-display mt-4 text-4xl leading-tight text-ink md:text-5xl">
            Ground the old way. Cooked the home way.
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-end gap-6 text-ink-soft md:col-span-6 md:col-start-7"
        >
          <p className="text-lg leading-relaxed">
            Akhals blends are roasted and ground in small batches — the way
            spice has always been treated in the homes that taught us to cook.
            No fillers, no shortcuts, no anonymous heat.
          </p>
          <p className="leading-relaxed">
            Every recipe on this site was written for a specific blend on our
            shelf. Scan the code on your packet and it brings you straight to
            the dishes that blend was made for.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-spice-deep py-28 text-center md:py-40" aria-labelledby="cta-heading">
      <div
        aria-hidden
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 50% 110%, #e8ab3c55, transparent), radial-gradient(ellipse 40% 40% at 10% -10%, #17131066, transparent)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-3xl px-5"
      >
        <p className="eyebrow text-saffron-bright">Your packet is waiting</p>
        <h2 id="cta-heading" className="font-display mt-5 text-4xl leading-tight text-cream md:text-6xl">
          Dinner is one scan away.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-cream/70">
          Browse the full recipe library — searchable, filterable, and written
          for the exact blend in your hand.
        </p>
        <Link
          href="/recipes"
          className="eyebrow mt-10 inline-block border border-saffron-bright bg-saffron-bright px-8 py-4 text-charcoal transition-colors hover:bg-transparent hover:text-saffron-bright"
        >
          Explore every recipe
        </Link>
      </motion.div>
    </section>
  );
}
