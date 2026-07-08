"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Step {
  title: string;
  body: string;
}

/**
 * Full-screen mobile cooking mode:
 * - requests a screen wake lock so the phone stays on at the stove
 * - one step at a time, huge tap targets, progress dots
 */
export function CookingMode({ title, steps }: { title: string; steps: Step[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const acquireWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLock.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // Wake lock is best-effort; cooking mode still works without it.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    acquireWakeLock();
    // Re-acquire when the user tabs back (locks auto-release on hide).
    const onVisible = () => {
      if (document.visibilityState === "visible") acquireWakeLock();
    };
    document.addEventListener("visibilitychange", onVisible);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      document.body.style.overflow = "";
      wakeLock.current?.release().catch(() => {});
      wakeLock.current = null;
    };
  }, [open, acquireWakeLock]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, steps.length]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        className="no-print eyebrow inline-flex items-center gap-2 border border-spice bg-spice px-5 py-3.5 text-cream transition-colors hover:bg-transparent hover:text-spice"
      >
        <ChefHat size={16} aria-hidden />
        Cooking mode
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col bg-charcoal text-cream"
            role="dialog"
            aria-modal="true"
            aria-label={`Cooking mode — ${title}`}
          >
            <header className="flex items-center justify-between px-5 pb-4 pt-5">
              <div>
                <p className="eyebrow text-saffron-bright">Cooking mode</p>
                <p className="font-display mt-1 text-lg leading-tight">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Exit cooking mode"
                className="rounded-full border border-cream/25 p-3 transition-colors hover:border-saffron-bright hover:text-saffron-bright"
              >
                <X size={20} aria-hidden />
              </button>
            </header>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 px-5" aria-hidden>
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-saffron-bright" : i < index ? "w-3 bg-cream/50" : "w-3 bg-cream/15"
                  }`}
                />
              ))}
            </div>

            <div className="flex flex-1 items-center overflow-y-auto px-6 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto w-full max-w-xl"
                >
                  <p className="eyebrow text-cream/50">
                    Step {index + 1} of {steps.length}
                  </p>
                  <h2 className="font-display mt-3 text-3xl leading-tight text-saffron-bright md:text-4xl">
                    {steps[index].title}
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-cream/90 md:text-xl">
                    {steps[index].body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <footer className="grid grid-cols-2 gap-3 px-5 pb-8">
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                disabled={index === 0}
                className="flex items-center justify-center gap-2 rounded-sm border border-cream/25 py-5 text-sm uppercase tracking-[0.2em] transition-colors enabled:hover:border-cream disabled:opacity-30"
              >
                <ChevronLeft size={18} aria-hidden />
                Back
              </button>
              {index < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))}
                  className="flex items-center justify-center gap-2 rounded-sm bg-saffron-bright py-5 text-sm font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-saffron"
                >
                  Next step
                  <ChevronRight size={18} aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-sm bg-spice py-5 text-sm font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-spice-deep"
                >
                  Done — enjoy!
                </button>
              )}
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
