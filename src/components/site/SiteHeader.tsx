"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/recipes", label: "Recipes" },
  { href: "/#collections", label: "Collections" },
  { href: "/#story", label: "Our Craft" },
];

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const onDark = dark && !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-cream/95 shadow-[0_1px_0_0_var(--line)] backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-8">
        <Link
          href="/"
          className={`font-display text-lg tracking-wide md:text-xl ${
            onDark ? "text-cream" : "text-ink"
          }`}
        >
          Akhals
          <span className={`ml-2 eyebrow align-middle ${onDark ? "text-saffron-bright" : "text-cinnamon"}`}>
            Spice &amp; More
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`eyebrow transition-colors ${
                onDark
                  ? "text-cream/80 hover:text-saffron-bright"
                  : "text-ink-soft hover:text-spice"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/recipes"
            className={`eyebrow border px-4 py-2.5 transition-colors ${
              onDark
                ? "border-cream/40 text-cream hover:border-saffron-bright hover:text-saffron-bright"
                : "border-ink/30 text-ink hover:border-spice hover:text-spice"
            }`}
          >
            Start Cooking
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className={`md:hidden ${onDark ? "text-cream" : "text-ink"}`}
        >
          <span className="block h-px w-6 bg-current" />
          <span className={`mt-1.5 block h-px bg-current transition-all ${open ? "w-6" : "w-4"}`} />
        </button>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-(--line) bg-cream px-5 pb-6 pt-4 md:hidden"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-3 font-display text-2xl text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
