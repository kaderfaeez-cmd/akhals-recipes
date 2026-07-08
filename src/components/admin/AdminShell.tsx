"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BookOpen, BarChart3, Image as ImageIcon, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Recipes", icon: BookOpen },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="flex w-16 flex-col items-center border-r border-(--line) bg-charcoal py-6 md:w-56 md:items-stretch md:px-4">
        <Link href="/" className="font-display px-1 text-center text-lg text-cream md:text-left">
          <span className="hidden md:inline">Akhals</span>
          <span className="md:hidden">A</span>
        </Link>
        <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Admin">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/recipes") : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-sm px-3 py-3 text-sm transition-colors ${
                  active ? "bg-cream/10 text-saffron-bright" : "text-cream/60 hover:text-cream"
                }`}
              >
                <Icon size={17} strokeWidth={1.75} aria-hidden />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 rounded-sm px-3 py-3 text-sm text-cream/60 transition-colors hover:text-spice"
        >
          <LogOut size={17} strokeWidth={1.75} aria-hidden />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </aside>
      <div className="flex-1 overflow-x-hidden p-5 md:p-10">{children}</div>
    </div>
  );
}
