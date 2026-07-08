"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SPICES } from "@/data/spices";

interface RecipeFormValues {
  id?: string;
  slug: string;
  title: string;
  description: string;
  spiceSlug: string;
  status: "DRAFT" | "PUBLISHED";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  heroImage: string;
  gallery: string[];
  ingredients: { group?: string; items: string[] }[];
  instructions: { title: string; body: string }[];
  tips: string[];
  tags: string[];
  spiceProducts: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  featured: boolean;
}

export const EMPTY_RECIPE: RecipeFormValues = {
  slug: "",
  title: "",
  description: "",
  spiceSlug: SPICES[0].slug,
  status: "DRAFT",
  difficulty: "MEDIUM",
  prepMinutes: 15,
  cookMinutes: 30,
  servings: 4,
  heroImage: "",
  gallery: [],
  ingredients: [],
  instructions: [],
  tips: [],
  tags: [],
  spiceProducts: [],
  seoTitle: "",
  seoDescription: "",
  featured: false,
};

/* Text-block encodings so editors work in plain textareas:
   Ingredients — "## Group name" starts a group, one item per line.
   Instructions — "Title :: body" per line.                        */
function ingredientsToText(groups: RecipeFormValues["ingredients"]): string {
  return groups
    .map((g) => (g.group ? `## ${g.group}\n` : "") + g.items.join("\n"))
    .join("\n\n");
}
function textToIngredients(text: string): RecipeFormValues["ingredients"] {
  const groups: RecipeFormValues["ingredients"] = [];
  let current: { group?: string; items: string[] } = { items: [] };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      if (current.items.length) groups.push(current);
      current = { group: line.slice(3).trim(), items: [] };
    } else {
      current.items.push(line);
    }
  }
  if (current.items.length) groups.push(current);
  return groups;
}
function instructionsToText(steps: RecipeFormValues["instructions"]): string {
  return steps.map((s) => `${s.title} :: ${s.body}`).join("\n");
}
function textToInstructions(text: string): RecipeFormValues["instructions"] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("::");
      return { title: title.trim(), body: rest.join("::").trim() || title.trim() };
    });
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export function RecipeForm({ initial }: { initial: RecipeFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial.id);
  const [values, setValues] = useState(initial);
  const [ingredientsText, setIngredientsText] = useState(ingredientsToText(initial.ingredients));
  const [instructionsText, setInstructionsText] = useState(instructionsToText(initial.instructions));
  const [tipsText, setTipsText] = useState(initial.tips.join("\n"));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof RecipeFormValues>(key: K, value: RecipeFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const uploadHero = async (file: File) => {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const body = await res.json();
      if (body.ok) set("heroImage", body.url);
      else setError(body.error ?? "Upload failed");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      ...values,
      slug: values.slug || slugify(values.title),
      ingredients: textToIngredients(ingredientsText),
      instructions: textToInstructions(instructionsText),
      tips: tipsText.split("\n").map((t) => t.trim()).filter(Boolean),
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
    };
    if (payload.ingredients.length === 0 || payload.instructions.length === 0) {
      setError("Add at least one ingredient and one instruction step.");
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(isEdit ? `/api/admin/recipes/${initial.id}` : "/api/admin/recipes", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!body.ok) {
        setError(body.error ?? "Save failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "mt-2 w-full rounded-sm border border-(--line) bg-white/60 px-3.5 py-2.5 text-sm text-ink focus:border-cinnamon";
  const label = "eyebrow text-ink-faint";

  return (
    <form onSubmit={submit} className="max-w-3xl">
      {error && (
        <p role="alert" className="mb-6 border-l-2 border-spice bg-cream-soft p-4 text-sm text-ink-soft">
          {error}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className={label}>Title</span>
          <input required className={input} value={values.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label>
          <span className={label}>Slug</span>
          <input
            className={input}
            value={values.slug}
            placeholder={slugify(values.title) || "auto-generated"}
            onChange={(e) => set("slug", slugify(e.target.value))}
          />
        </label>
        <label>
          <span className={label}>Spice blend</span>
          <select className={input} value={values.spiceSlug} onChange={(e) => set("spiceSlug", e.target.value)}>
            {SPICES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className={label}>Description</span>
          <textarea required rows={3} className={input} value={values.description} onChange={(e) => set("description", e.target.value)} />
        </label>

        <label>
          <span className={label}>Prep minutes</span>
          <input type="number" min={0} className={input} value={values.prepMinutes} onChange={(e) => set("prepMinutes", Number(e.target.value))} />
        </label>
        <label>
          <span className={label}>Cook minutes</span>
          <input type="number" min={0} className={input} value={values.cookMinutes} onChange={(e) => set("cookMinutes", Number(e.target.value))} />
        </label>
        <label>
          <span className={label}>Servings</span>
          <input type="number" min={1} className={input} value={values.servings} onChange={(e) => set("servings", Number(e.target.value))} />
        </label>
        <label>
          <span className={label}>Difficulty</span>
          <select className={input} value={values.difficulty} onChange={(e) => set("difficulty", e.target.value as RecipeFormValues["difficulty"])}>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Moderate</option>
            <option value="HARD">Project</option>
          </select>
        </label>

        <div className="md:col-span-2">
          <span className={label}>Featured image</span>
          <div className="mt-2 flex items-center gap-3">
            <input
              className="w-full rounded-sm border border-(--line) bg-white/60 px-3.5 py-2.5 text-sm text-ink focus:border-cinnamon"
              value={values.heroImage}
              placeholder="/uploads/… or /img/recipes/…"
              onChange={(e) => set("heroImage", e.target.value)}
              required
            />
            <label className="eyebrow shrink-0 cursor-pointer border border-ink/30 px-4 py-3 text-ink hover:border-cinnamon">
              {uploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        <label className="md:col-span-2">
          <span className={label}>Ingredients — one per line, “## Group name” starts a group</span>
          <textarea required rows={9} className={`${input} font-mono text-xs`} value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} />
        </label>
        <label className="md:col-span-2">
          <span className={label}>Instructions — one step per line, “Step title :: instructions”</span>
          <textarea required rows={9} className={`${input} font-mono text-xs`} value={instructionsText} onChange={(e) => setInstructionsText(e.target.value)} />
        </label>
        <label className="md:col-span-2">
          <span className={label}>Kitchen tips — one per line</span>
          <textarea rows={3} className={`${input} font-mono text-xs`} value={tipsText} onChange={(e) => setTipsText(e.target.value)} />
        </label>

        <label>
          <span className={label}>Tags (comma separated)</span>
          <input
            className={input}
            value={values.tags.join(", ")}
            onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          />
        </label>
        <label>
          <span className={label}>Spice products used (comma separated)</span>
          <input
            className={input}
            value={values.spiceProducts.join(", ")}
            onChange={(e) => set("spiceProducts", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          />
        </label>

        <label>
          <span className={label}>SEO title</span>
          <input className={input} maxLength={70} value={values.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} />
        </label>
        <label>
          <span className={label}>SEO description</span>
          <input className={input} maxLength={170} value={values.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} />
        </label>

        <div className="flex items-center gap-6 md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={values.status === "PUBLISHED"}
              onChange={(e) => set("status", e.target.checked ? "PUBLISHED" : "DRAFT")}
            />
            Published
          </label>
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        <button
          type="submit"
          disabled={busy || uploading}
          className="eyebrow bg-spice px-7 py-3.5 text-cream transition-colors hover:bg-spice-deep disabled:opacity-50"
        >
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create recipe"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="eyebrow border border-ink/30 px-7 py-3.5 text-ink hover:border-spice hover:text-spice"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export type { RecipeFormValues };
