import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-charcoal text-cream/70">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-3xl text-cream md:text-4xl">Akhals</p>
            <p className="eyebrow mt-2 text-saffron-bright">Spice &amp; More</p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed">
              Every packet carries a recipe. Scan the QR code on your Akhals
              spice and cook something worth remembering.
            </p>
          </div>
          <nav className="flex gap-10 text-sm" aria-label="Footer">
            <div className="flex flex-col gap-3">
              <span className="eyebrow text-cream/40">Cook</span>
              <Link className="hover:text-saffron-bright" href="/recipes">All recipes</Link>
              <Link className="hover:text-saffron-bright" href="/#collections">Collections</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="eyebrow text-cream/40">Akhals</span>
              <Link className="hover:text-saffron-bright" href="/#story">Our craft</Link>
              <Link className="hover:text-saffron-bright" href="/admin">Admin</Link>
            </div>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-cream/10 pt-6 text-xs text-cream/40 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Akhals Spice &amp; More. Made in South Africa.</p>
          <p>akhalsrecipes.co.za</p>
        </div>
      </div>
    </footer>
  );
}
