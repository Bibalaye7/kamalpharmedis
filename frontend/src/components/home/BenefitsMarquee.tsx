const BENEFITS = [
  "🚚 Livraison à Dakar et partout au Sénégal",
  "📱 Wave & Orange Money au livreur",
  "💵 Paiement à la livraison",
  "✅ Matériel médical de qualité",
  "🏥 Devis pour les professionnels de santé",
  "💬 Conseils sur WhatsApp",
];

/** Bande d'avantages qui défile en continu sous le haut de page (se met en pause au survol). */
export default function BenefitsMarquee() {
  return (
    <div className="group relative overflow-hidden border-y border-white/10 bg-green-main py-3 text-white">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center whitespace-nowrap px-6 text-[13px] font-semibold">
                {benefit}
                <span className="ml-12 h-1.5 w-1.5 rounded-full bg-white/50" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
