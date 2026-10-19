import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { PublicStats } from "@/types";

const formatCount = (n: number) => n.toLocaleString("fr-FR").replace(/ /g, " ");

/** Chiffres réels du site : ils augmentent tout seuls avec le catalogue et les inscriptions. */
export default function Stats({ stats }: { stats: PublicStats | null }) {
  if (!stats) return null;

  const items = [
    { value: formatCount(stats.products), label: "Produits disponibles" },
    { value: formatCount(stats.clients), label: "Clients inscrits" },
    // Note moyenne affichée seulement quand assez d'avis réels existent
    stats.reviews.count >= 5
      ? { value: `${String(stats.reviews.average).replace(".", ",")}/5`, label: `Note moyenne (${stats.reviews.count} avis)` }
      : { value: formatCount(stats.categories), label: "Catégories de produits" },
    { value: "🚚", label: "Livraison à Dakar et partout au Sénégal" },
  ];

  return (
    <section className="relative overflow-hidden bg-blue-deep py-8">
      <div className="pointer-events-none absolute right-1/4 -top-40 h-96 w-96 animate-drift-slow rounded-full bg-white/5" />
      <div className="container-page relative grid grid-cols-2 gap-y-6 divide-x divide-[#4059A6] lg:grid-cols-4">
        {items.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 100} className="px-4 text-center lg:text-left lg:px-8">
            <p className="text-3xl font-extrabold text-white sm:text-4xl">
              <CountUp value={stat.value} />
            </p>
            <p className="mt-2 text-xs text-[#A6C7FF]">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
