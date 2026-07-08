"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { RecipeListItem } from "@/lib/recipes";
import { SPICES, SPICE_GROUPS, type SpiceGroup } from "@/data/spices";

type SortKey = "newest" | "time" | "difficulty" | "popularity";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "time", label: "Cooking time" },
  { key: "difficulty", label: "Difficulty" },
  { key: "popularity", label: "Popularity" },
];

const DIFFICULTY_RANK: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };

export function RecipeExplorer({
  recipes,
  initialSpice,
  initialGroup,
}: {
  recipes: RecipeListItem[];
  initialSpice?: string;
  initialGroup?: string;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [spice, setSpice] = useState<string | null>(initialSpice ?? null);
  const [group, setGroup] = useState<SpiceGroup | null>(
    (SPICE_GROUPS as string[]).includes(initialGroup ?? "") ? (initialGroup as SpiceGroup) : null
  );
  const [sort, setSort] = useState<SortKey>("newest");

  const visibleSpices = useMemo(
    () => (group ? SPICES.filter((s) => s.group === group) : SPICES),
    [group]
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    let list = recipes;
    if (group) {
      const groupSlugs = new Set(SPICES.filter((s) => s.group === group).map((s) => s.slug));
      list = list.filter((r) => groupSlugs.has(r.spiceSlug));
    }
    if (spice) list = list.filter((r) => r.spiceSlug === spice);
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.spiceName.toLowerCase().includes(q) ||
          r.tags.some((t) => t.includes(q))
      );
    }
    const sorted = [...list];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
        break;
      case "time":
        sorted.sort((a, b) => a.prepMinutes + a.cookMinutes - (b.prepMinutes + b.cookMinutes));
        break;
      case "difficulty":
        sorted.sort((a, b) => (DIFFICULTY_RANK[a.difficulty] ?? 1) - (DIFFICULTY_RANK[b.difficulty] ?? 1));
        break;
      case "popularity":
        sorted.sort((a, b) => b.views - a.views);
        break;
    }
    return sorted;
  }, [recipes, deferredQuery, spice, group, sort]);

  return (
    <div>
      {/* Search + sort bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="relative flex-1 md:max-w-md">
          <span className="sr-only">Search recipes</span>
          <Search
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by dish, spice or craving…"
            className="w-full rounded-sm border border-(--line) bg-cream-soft py-3.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-cinnamon"
          />
        </label>
        <div className="flex items-center gap-2 overflow-x-auto" role="group" aria-label="Sort recipes">
          <span className="eyebrow shrink-0 text-ink-faint">Sort</span>
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              aria-pressed={sort === s.key}
              className={`shrink-0 rounded-full px-4 py-2 text-xs transition-colors ${
                sort === s.key
                  ? "bg-ink text-cream"
                  : "text-ink-soft hover:bg-cream-deep"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Group chapters */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by collection">
        <button
          type="button"
          onClick={() => {
            setGroup(null);
            setSpice(null);
          }}
          aria-pressed={!group}
          className={`shrink-0 border-b-2 px-3 pb-2 text-sm transition-colors ${
            !group ? "border-spice font-medium text-spice" : "border-transparent text-ink-faint hover:text-ink"
          }`}
        >
          All
        </button>
        {SPICE_GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGroup(group === g ? null : g);
              setSpice(null);
            }}
            aria-pressed={group === g}
            className={`shrink-0 border-b-2 px-3 pb-2 text-sm transition-colors ${
              group === g ? "border-spice font-medium text-spice" : "border-transparent text-ink-faint hover:text-ink"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Spice chips */}
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by spice">
        {visibleSpices.map((s) => {
          const active = spice === s.slug;
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => setSpice(active ? null : s.slug)}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-2 text-xs transition-all ${
                active
                  ? "border-transparent text-cream"
                  : "border-(--line) bg-cream-soft text-ink-soft hover:border-cinnamon/60"
              }`}
              style={active ? { backgroundColor: s.accent } : undefined}
            >
              {s.name}
              {active && <X size={12} aria-hidden className="ml-1.5 inline-block" />}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <p className="mt-10 text-sm text-ink-faint" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
        {spice ? ` for ${SPICES.find((s) => s.slug === spice)?.name}` : ""}
      </p>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((r, i) => (
            <motion.div
              key={r.slug}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
            >
              <RecipeCard recipe={r} priority={i < 3} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 rounded-sm border border-dashed border-(--line-strong) p-12 text-center">
          <p className="font-display text-2xl text-ink">Nothing in the pot yet.</p>
          <p className="mt-2 text-sm text-ink-faint">
            Try a different spice or clear your search — new recipes land regularly.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSpice(null);
              setGroup(null);
            }}
            className="eyebrow mt-6 border border-ink/30 px-5 py-3 text-ink transition-colors hover:border-spice hover:text-spice"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
