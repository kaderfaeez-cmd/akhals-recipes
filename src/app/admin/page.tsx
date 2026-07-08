"use client";

import Link from "next/link";
import useSWRLike from "@/components/admin/useFetch";
import { AdminShell } from "@/components/admin/AdminShell";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface AdminRecipe {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  views: number;
  updatedAt: string;
  spice: { name: string };
}

export default function AdminRecipesPage() {
  const { data, error, reload } = useSWRLike<{ ok: boolean; recipes?: AdminRecipe[]; error?: string }>(
    "/api/admin/recipes"
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (r: AdminRecipe) => {
    if (!window.confirm(`Delete “${r.title}” permanently? This cannot be undone.`)) return;
    setBusyId(r.id);
    await fetch(`/api/admin/recipes/${r.id}`, { method: "DELETE" });
    setBusyId(null);
    reload();
  };

  const togglePublish = async (r: AdminRecipe) => {
    setBusyId(r.id);
    await fetch(`/api/admin/recipes/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: r.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
    });
    setBusyId(null);
    reload();
  };

  return (
    <AdminShell>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Recipes</h1>
          <p className="mt-1 text-sm text-ink-faint">Create, edit, publish.</p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="eyebrow inline-flex items-center gap-2 bg-spice px-5 py-3 text-cream transition-colors hover:bg-spice-deep"
        >
          <Plus size={15} aria-hidden /> New recipe
        </Link>
      </header>

      {error && (
        <p role="alert" className="mt-8 border-l-2 border-spice bg-cream-soft p-4 text-sm text-ink-soft">
          {error}
        </p>
      )}
      {data && !data.ok && (
        <p role="alert" className="mt-8 border-l-2 border-saffron bg-cream-soft p-4 text-sm text-ink-soft">
          {data.error} — the public site currently serves the built-in seed recipes.
        </p>
      )}

      {data?.recipes && (
        <div className="mt-8 overflow-x-auto rounded-sm border border-(--line) bg-cream-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-(--line) text-xs uppercase tracking-[0.14em] text-ink-faint">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Spice</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data.recipes.map((r) => (
                <tr key={r.id} className="border-b border-(--line) last:border-0">
                  <td className="px-4 py-3.5 font-medium text-ink">{r.title}</td>
                  <td className="px-4 py-3.5 text-ink-soft">{r.spice.name}</td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => togglePublish(r)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        r.status === "PUBLISHED"
                          ? "bg-emerald-700/15 text-emerald-800"
                          : "bg-saffron/20 text-cinnamon"
                      }`}
                    >
                      {r.status === "PUBLISHED" ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-ink-soft">{r.views}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/recipes/${r.id}`}
                        aria-label={`Edit ${r.title}`}
                        className="rounded-sm border border-(--line) p-2 text-ink-soft hover:border-cinnamon hover:text-cinnamon"
                      >
                        <Pencil size={14} aria-hidden />
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => remove(r)}
                        aria-label={`Delete ${r.title}`}
                        className="rounded-sm border border-(--line) p-2 text-ink-soft hover:border-spice hover:text-spice disabled:opacity-40"
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.recipes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-faint">
                    No recipes in the database yet. Run the seed, or create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
