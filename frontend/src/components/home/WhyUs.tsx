import Reveal from "@/components/ui/Reveal";

const REASONS = [
  { icon: "🏆", title: "Matériel de qualité", description: "Sélectionné auprès de fournisseurs reconnus." },
  { icon: "🚀", title: "Livraison rapide", description: "24-48h à Dakar · 3 à 5 jours ailleurs." },
  { icon: "💬", title: "Conseils WhatsApp", description: "Une question ? Écrivez-nous ou appelez-nous." },
  { icon: "💵", title: "Paiement à la livraison", description: "Espèces, Wave ou Orange Money au livreur." },
  { icon: "↩️", title: "Retour 7 jours", description: "Produit non ouvert · défaut signalé sous 48h." },
];

export default function WhyUs() {
  return (
    <section className="relative overflow-hidden bg-blue-deep py-16">
      <div className="pointer-events-none absolute -left-48 -top-48 h-[600px] w-[600px] animate-drift-slow rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -right-24 top-16 hidden h-96 w-96 rounded-full bg-white/5 lg:block" />

      <div className="container-page relative">
        <Reveal>
          <p className="text-[30px] font-bold text-white">Pourquoi choisir KamalPharMédis ?</p>
          <p className="mt-2 text-[13px] text-[#A6C7FF]">Particuliers, professionnels et établissements de santé.</p>
        </Reveal>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {REASONS.map((reason, i) => (
            <Reveal key={reason.title} delay={i * 90} className="group rounded-[20px] bg-[#293D8A] p-4 shadow-lifted transition duration-300 hover:-translate-y-1.5 hover:bg-[#30469a]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#406BD1] text-xl transition group-hover:scale-110 group-hover:animate-wiggle">
                {reason.icon}
              </span>
              <h3 className="mt-4 text-[13px] font-bold text-white">{reason.title}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-[#B8CCFF]">{reason.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
