"use client";

import { useEffect, useState } from "react";

/** Fait défiler une liste de mots à la même place (titre de la page d'accueil). */
export default function RotatingWord({ words, interval = 2600, className = "" }: { words: string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={`inline-block ${className}`} aria-live="off">
      <span key={index} className="inline-block animate-word-in">
        {words[index]}
      </span>
    </span>
  );
}
