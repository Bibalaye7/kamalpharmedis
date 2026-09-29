"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Reveal from "@/components/ui/Reveal";

export default function CTA() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/inscription${email ? `?email=${encodeURIComponent(email)}` : ""}`);
  }

  return (
    <section className="relative overflow-hidden bg-blue-mist py-16">
      <div className="pointer-events-none absolute -left-24 -top-24 h-[500px] w-[500px] animate-drift rounded-full bg-white/40" />

      <Reveal className="container-page relative">
        <p className="max-w-2xl text-[34px] font-extrabold leading-tight text-blue-deep">
          Rejoignez 10 000+ clients satisfaits
        </p>
        <p className="mt-3 max-w-2xl text-[15px] text-gray-600">
          Créez votre compte gratuitement et commandez vos produits de santé dès aujourd&apos;hui.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email..."
            className="h-[52px] flex-1 rounded-full bg-white px-5 text-sm text-gray-700 shadow-soft outline-none"
          />
          <button
            type="submit"
            className="group relative flex h-[52px] items-center justify-center overflow-hidden rounded-full bg-blue-main px-7 text-sm font-bold text-white shadow-lifted transition hover:-translate-y-0.5 hover:bg-blue-deep"
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-white/25" aria-hidden />
            <span className="relative">Créer mon compte <span className="inline-block transition group-hover:translate-x-1">→</span></span>
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          ✓ Gratuit &nbsp;·&nbsp; ✓ Sans engagement &nbsp;·&nbsp; ✓ 10% de réduction à l&apos;inscription
        </p>
      </Reveal>
    </section>
  );
}
