"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import useFetch from "@/components/admin/useFetch";
import { spiceBySlug } from "@/data/spices";

interface Analytics {
  ok: boolean;
  live: boolean;
  totals: { scans: number; recipes: number };
  topRecipes: { slug: string; title: string; views: number; spice: string }[];
  topSpices: { spice: string; count: number }[];
  devices: { device: string; count: number }[];
  countries: { country: string; count: number }[];
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 truncate text-sm text-ink-soft">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-deep">
        <div
          className="h-full rounded-full bg-cinnamon"
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        />
      </div>
      <span className="w-12 text-right text-sm tabular-nums text-ink">{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, error } = useFetch<Analytics>("/api/admin/analytics");
  const maxRecipeViews = Math.max(0, ...(data?.topRecipes.map((r) => r.views) ?? []));
  const maxDevice = Math.max(0, ...(data?.devices.map((d) => d.count) ?? []));
  const maxCountry = Math.max(0, ...(data?.countries.map((c) => c.count) ?? []));
  const maxSpice = Math.max(0, ...(data?.topSpices.map((s) => s.count) ?? []));

  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-ink">Analytics</h1>
      {error && <p role="alert" className="mt-6 text-sm text-spice">{error}</p>}
      {data && !data.live && (
        <p className="mt-6 border-l-2 border-saffron bg-cream-soft p-4 text-sm text-ink-soft">
          No database connected yet — QR scan tracking starts recording once DATABASE_URL is set.
        </p>
      )}
      {data && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-sm border border-(--line) bg-cream-soft p-6">
              <p className="eyebrow text-ink-faint">QR scans &amp; views</p>
              <p className="font-display mt-2 text-4xl text-ink">{data.totals.scans}</p>
            </div>
            <div className="rounded-sm border border-(--line) bg-cream-soft p-6">
              <p className="eyebrow text-ink-faint">Recipes live</p>
              <p className="font-display mt-2 text-4xl text-ink">{data.totals.recipes}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <section className="rounded-sm border border-(--line) bg-cream-soft p-6">
              <h2 className="font-display text-xl text-ink">Most viewed recipes</h2>
              <div className="mt-5 space-y-3">
                {data.topRecipes.map((r) => (
                  <Bar key={r.slug} label={r.title} value={r.views} max={maxRecipeViews} />
                ))}
                {data.topRecipes.length === 0 && <p className="text-sm text-ink-faint">No data yet.</p>}
              </div>
            </section>
            <section className="rounded-sm border border-(--line) bg-cream-soft p-6">
              <h2 className="font-display text-xl text-ink">Most scanned spices</h2>
              <div className="mt-5 space-y-3">
                {data.topSpices.map((s) => (
                  <Bar key={s.spice} label={spiceBySlug(s.spice)?.name ?? s.spice} value={s.count} max={maxSpice} />
                ))}
                {data.topSpices.length === 0 && <p className="text-sm text-ink-faint">No data yet.</p>}
              </div>
            </section>
            <section className="rounded-sm border border-(--line) bg-cream-soft p-6">
              <h2 className="font-display text-xl text-ink">Devices</h2>
              <div className="mt-5 space-y-3">
                {data.devices.map((d) => (
                  <Bar key={d.device} label={d.device} value={d.count} max={maxDevice} />
                ))}
                {data.devices.length === 0 && <p className="text-sm text-ink-faint">No data yet.</p>}
              </div>
            </section>
            <section className="rounded-sm border border-(--line) bg-cream-soft p-6">
              <h2 className="font-display text-xl text-ink">Locations</h2>
              <div className="mt-5 space-y-3">
                {data.countries.map((c) => (
                  <Bar key={c.country} label={c.country} value={c.count} max={maxCountry} />
                ))}
                {data.countries.length === 0 && <p className="text-sm text-ink-faint">No data yet.</p>}
              </div>
            </section>
          </div>
        </>
      )}
    </AdminShell>
  );
}
