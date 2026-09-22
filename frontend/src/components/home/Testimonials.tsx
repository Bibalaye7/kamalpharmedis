const TESTIMONIALS = [
  {
    initial: "A",
    name: "Aminata Diallo",
    role: "Infirmière, Hôpital Principal",
    text: "J'utilise KamalPharMédis pour mon matériel. Les prix sont imbattables et la livraison toujours rapide !",
  },
  {
    initial: "I",
    name: "Ibrahima Sarr",
    role: "Diabétique, Dakar",
    text: "Mon glucomètre est arrivé parfait le lendemain. Le service client a même appelé pour vérifier. Excellent !",
  },
  {
    initial: "C",
    name: "Clinique du Peuple",
    role: "Établissement de santé",
    text: "Nous commandons régulièrement. Produits certifiés, prix corrects et service professionnel. Partenaire fiable.",
  },
  {
    initial: "F",
    name: "Fatou Ndiaye",
    role: "Maman de famille, Pikine",
    text: "Super site ! J'ai trouvé les vitamines pour mes enfants et reçu ma commande en 24h. Je recommande vivement !",
  },
];

export default function Testimonials() {
  return (
    <section className="section bg-white !py-14">
      <p className="text-[28px] font-bold text-blue-deep">Ce que disent nos clients</p>
      <p className="mt-1 text-[13px] text-gray-500">Plus de 10 000 familles nous font confiance</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((testimonial) => (
          <div key={testimonial.name} className="relative overflow-hidden rounded-[20px] bg-white p-5 pl-6 shadow-soft">
            <div className="absolute left-0 top-5 h-[180px] w-1.5 rounded-full bg-blue-main" />
            <p className="text-[38px] font-extrabold leading-none text-blue-mist">&ldquo;</p>
            <p className="-mt-2 text-xs leading-relaxed text-gray-800">{testimonial.text}</p>
            <hr className="mt-5 border-gray-100" />
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white">
                {testimonial.initial}
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900">{testimonial.name}</p>
                <p className="text-[10px] text-gray-500">{testimonial.role}</p>
              </div>
              <span className="text-[11px] text-amber-400">⭐⭐⭐⭐⭐</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
