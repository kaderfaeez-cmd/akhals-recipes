"use client";

import { useState } from "react";
import { Printer, Share2, Check } from "lucide-react";

export function ShareActions({ title, description }: { title: string; description: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: description, url });
        return;
      }
    } catch {
      // user cancelled native share — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; nothing sensible left to do
    }
  };

  return (
    <div className="no-print flex items-center gap-3">
      <button
        type="button"
        onClick={share}
        className="eyebrow inline-flex items-center gap-2 border border-ink/30 px-5 py-3.5 text-ink transition-colors hover:border-spice hover:text-spice"
      >
        {copied ? <Check size={16} aria-hidden /> : <Share2 size={16} aria-hidden />}
        {copied ? "Link copied" : "Share"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="eyebrow inline-flex items-center gap-2 border border-ink/30 px-5 py-3.5 text-ink transition-colors hover:border-spice hover:text-spice"
      >
        <Printer size={16} aria-hidden />
        Print
      </button>
    </div>
  );
}
