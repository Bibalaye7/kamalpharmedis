import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";

const STATS = [
  { value: "500+", label: "Produits disponibles" },
  { value: "10 000+", label: "Clients satisfaits" },
  { value: "98%", label: "Taux de satisfaction" },
  { value: "48h", label: "Livraison moyenne" },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-blue-deep py-8">
      <div className="pointer-events-none absolute right-1/4 -top-40 h-96 w-96 animate-drift-slow rounded-full bg-white/5" />
      <div className="container-page relative grid grid-cols-2 divide-x divide-[#4059A6] lg:grid-cols-4">
        {STATS.map((stat, i) => (
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
