"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { UploadCloud, Check, Copy } from "lucide-react";

interface Uploaded {
  url: string;
  variants: { width: number; url: string }[];
}

export default function MediaPage() {
  const [items, setItems] = useState<Uploaded[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const body = await res.json();
        if (body.ok) setItems((prev) => [{ url: body.url, variants: body.variants }, ...prev]);
        else setError(body.error ?? "Upload failed");
      } catch {
        setError("Upload failed");
      }
    }
    setBusy(false);
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 1500);
  };

  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-ink">Media library</h1>
      <p className="mt-1 text-sm text-ink-faint">
        Images are compressed to WebP and resized to 480 / 960 / 1600 px automatically.
      </p>

      <label className="mt-8 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-(--line-strong) bg-cream-soft p-12 text-center transition-colors hover:border-cinnamon">
        <UploadCloud size={28} strokeWidth={1.5} className="text-cinnamon" aria-hidden />
        <span className="text-sm text-ink-soft">{busy ? "Processing…" : "Click or drop images to upload"}</span>
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="sr-only"
          onChange={(e) => upload(e.target.files)}
        />
      </label>

      {error && <p role="alert" className="mt-4 text-sm text-spice">{error}</p>}

      {items.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.url} className="overflow-hidden rounded-sm border border-(--line) bg-cream-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="flex items-center justify-between gap-2 p-3">
                <span className="truncate text-xs text-ink-faint">{item.url}</span>
                <button
                  type="button"
                  onClick={() => copy(item.url)}
                  className="shrink-0 rounded-sm border border-(--line) p-2 text-ink-soft hover:border-cinnamon hover:text-cinnamon"
                  aria-label="Copy URL"
                >
                  {copiedUrl === item.url ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
