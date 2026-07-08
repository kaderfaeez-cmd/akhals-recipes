import Image from "next/image";
import Link from "next/link";
import { Clock, Users, Flame } from "lucide-react";
import type { RecipeListItem } from "@/lib/recipes";

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Moderate",
  HARD: "Project",
};

export function RecipeCard({ recipe, priority = false }: { recipe: RecipeListItem; priority?: boolean }) {
  const total = recipe.prepMinutes + recipe.cookMinutes;
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm bg-cream-soft shadow-[0_1px_2px_rgba(33,23,18,0.08)] ring-1 ring-(--line) transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(33,23,18,0.35)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
        <Image
          src={recipe.heroImage}
          alt={recipe.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span
          className="absolute left-0 top-4 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-cream"
          style={{ backgroundColor: recipe.spiceAccent }}
        >
          {recipe.spiceName}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="font-display text-xl leading-snug text-ink transition-colors group-hover:text-spice md:text-2xl">
          {recipe.title}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-faint">
          {recipe.description}
        </p>
        <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} strokeWidth={1.75} aria-hidden />
            {total} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} strokeWidth={1.75} aria-hidden />
            Serves {recipe.servings}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flame size={14} strokeWidth={1.75} aria-hidden />
            {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}
