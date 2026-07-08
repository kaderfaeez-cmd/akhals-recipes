"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SpiceField = dynamic(() => import("./SpiceField").then((m) => m.SpiceField), {
  ssr: false,
});

/**
 * 300vh cinematic scroll track.
 * A sticky viewport holds the generated hero photograph (photoreal base layer)
 * with the R3F spice field floating above it. GSAP ScrollTrigger scrubs a
 * 0..1 progress value that choreographs the 3D convergence, and staggers the
 * three typography phases:
 *   1. brand statement over the explosion
 *   2. "spice becomes supper" as spices converge into the dish
 *   3. hand-off into the featured recipes below
 */
export function CinematicHero({
  dishImage,
  dishTitle,
  dishHref,
}: {
  dishImage: string;
  dishTitle: string;
  dishHref: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [webgl, setWebgl] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Feature-detect once; fall back to the still photograph.
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!gl) {
        setWebgl(false);
      } else {
        // Software rasterisers (SwiftShader, llvmpipe) can't hold 60fps on a
        // full-screen scene — those get the photographic hero instead.
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer = info
          ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
          : "";
        setWebgl(!/swiftshader|llvmpipe|software/i.test(renderer));
      }
    } catch {
      setWebgl(false);
    }
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!trackRef.current || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const smooth = (e0: number, e1: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
      return t * t * (3 - 2 * t);
    };
    const el = trackRef.current;
    const phase1 = el.querySelector<HTMLElement>("[data-hero-phase='1']");
    const phase2 = el.querySelector<HTMLElement>("[data-hero-phase='2']");

    const apply = (p: number) => {
      progressRef.current = p;
      if (phase1) {
        const o = 1 - smooth(0.06, 0.28, p);
        phase1.style.opacity = String(o);
        phase1.style.transform = `translateY(${-70 * smooth(0.06, 0.28, p)}px)`;
        phase1.style.pointerEvents = o > 0.4 ? "auto" : "none";
      }
      if (phase2) {
        const oIn = smooth(0.34, 0.52, p);
        const oOut = smooth(0.74, 0.95, p);
        const o = oIn * (1 - oOut);
        phase2.style.opacity = String(o);
        phase2.style.transform = `translateY(${-50 * oOut}px) scale(${0.94 + 0.06 * oIn})`;
        phase2.style.pointerEvents = o > 0.4 ? "auto" : "none";
      }
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => apply(self.progress),
    });
    apply(0);
    return () => st.kill();
  }, [reduced]);

  const showCanvas = webgl && !reduced;

  return (
    <div ref={trackRef} className="relative h-[300vh] bg-charcoal" id="top">
      <div className="sticky top-0 h-screen overflow-hidden" style={{ position: "sticky" }} data-hero-viewport>
        {/* Photoreal base plate */}
        <div className="absolute inset-0">
          <Image
            src="/img/hero-spices.png"
            alt="Whole spices — cinnamon, star anise, cardamom and chilli — suspended mid-air in dramatic light"
            fill
            priority
            fetchPriority="high"
            className="object-cover opacity-80"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/20 to-charcoal" />

        {/* Live 3D layer */}
        {showCanvas && <SpiceField progressRef={progressRef} />}

        {/* Phase 1 — brand statement */}
        <div
          data-hero-phase="1"
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <p className="eyebrow text-saffron-bright">Akhals Spice &amp; More</p>
          <h1 className="font-display mt-6 max-w-4xl text-5xl leading-[1.04] text-cream md:text-7xl lg:text-8xl">
            Every packet
            <br />
            <em className="text-saffron-bright">tells a story.</em>
          </h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-cream/70 md:text-base">
            You scanned the code. Now let the spice do the talking — recipes
            crafted for every Akhals blend, from Durban curry pots to Cape
            coals.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/recipes"
              className="eyebrow border border-saffron-bright bg-saffron-bright px-6 py-3.5 text-charcoal transition-colors hover:bg-transparent hover:text-saffron-bright"
            >
              Find your recipe
            </Link>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/50">
            <span className="eyebrow">Scroll</span>
            <span className="mx-auto mt-2 block h-8 w-px animate-pulse bg-cream/40" />
          </div>
        </div>

        {/* Phase 2 — spices become supper */}
        <div
          data-hero-phase="2"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0"
        >
          <p className="eyebrow text-saffron-bright">From the packet to the pot</p>
          <h2 className="font-display mt-5 max-w-3xl text-4xl leading-tight text-cream md:text-6xl">
            Spice becomes supper.
          </h2>
          <Link
            href={dishHref}
            className="group relative mt-10 block h-56 w-72 overflow-hidden rounded-sm shadow-2xl shadow-black/60 md:h-72 md:w-96"
          >
            <Image
              src={dishImage}
              alt={dishTitle}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 288px, 384px"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left">
              <span className="eyebrow text-saffron-bright">Tonight, perhaps</span>
              <span className="font-display mt-1 block text-xl text-cream">{dishTitle}</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
