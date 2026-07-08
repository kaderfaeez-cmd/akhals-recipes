"use client";

import { useCallback, useEffect, useState } from "react";

/** Minimal fetch hook — GET JSON with manual reload. */
export default function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetch(url)
      .then(async (r) => {
        const body = (await r.json()) as T;
        if (!cancelled) setData(body);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the server.");
      });
    return () => {
      cancelled = true;
    };
  }, [url, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, reload };
}
