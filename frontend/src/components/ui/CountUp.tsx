"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Anime un chiffre de 0 à sa valeur quand il devient visible.
 * `value` garde son format d'affichage : "10 000+", "98%", "48h"...
 */
export default function CountUp({ value, duration = 1600 }: { value: string; duration?: number }) {
  const match = value.match(/^([^\d]*)([\d\s]+)(.*)$/);
  const target = match ? Number(match[2].replace(/\s/g, "")) : NaN;
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || Number.isNaN(target) || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    setCurrent(0);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        setCurrent(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  if (!match || current === null) return <span ref={ref}>{value}</span>;

  return (
    <span ref={ref} className="tabular-nums">
      {match[1]}
      {current.toLocaleString("fr-FR").replace(/ | /g, " ")}
      {match[3]}
    </span>
  );
}
