import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://akhalsrecipes.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Akhals Spice & More — Recipes",
    template: "%s · Akhals Spice & More",
  },
  description:
    "Premium South African recipes crafted for every Akhals spice blend. Scan, cook, and bring the flavours of Durban and the Cape to your table.",
  openGraph: {
    siteName: "Akhals Spice & More",
    type: "website",
    locale: "en_ZA",
    images: [{ url: "/img/hero-spices.png", width: 2304, height: 1296 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
