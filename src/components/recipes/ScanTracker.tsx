"use client";

import { useEffect } from "react";

/** Fire-and-forget view/scan analytics beacon. */
export function ScanTracker({ recipeSlug, spiceSlug }: { recipeSlug?: string; spiceSlug?: string }) {
  useEffect(() => {
    const payload = JSON.stringify({
      recipeSlug,
      spiceSlug,
      referer: document.referrer || undefined,
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", body: payload, keepalive: true }).catch(() => {});
      }
    } catch {
      // analytics must never break the page
    }
  }, [recipeSlug, spiceSlug]);
  return null;
}
