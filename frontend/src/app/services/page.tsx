import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Nos services" };

const SERVICES = [
  {
    icon: "💊",
    iconBg: "bg-category-blue-bg",
    title: "Vente de médicaments",
    description: "Promotion et distribution de médicaments de qualité, approuvés et certifiés.",
    tag: "Pharmacie",
    tagClass: "bg-category-blue-bg text-category-blue-text",
  },
  {
    icon: "🩺",
    iconBg: "bg-category-green-bg",
    title: "Matériel médical",
    description: "Tensiomètres, glucomètres, stéthoscopes et dispositifs de soins professionnels.",
    tag: "Équipements",
    tagClass: "bg-category-green-bg text-category-green-text",
  },
  {
    icon: "🌿",
    iconBg: "bg-category-blue-bg",
    title: "Produits naturels",
    description: "Compléments alimentaires, vitamines et produits bien-être certifiés.",
    tag: "Bien-être",
    tagClass: "bg-category-blue-bg text-category-blue-text",
  },
  {
    icon: "🚚",
    iconBg: "bg-category-green-bg",
    title: "Livraison & distribution",
    description: "Service fiable pour cliniques, hôpitaux et particuliers partout au Sénégal.",
    tag: "Logistique",
    tagClass: "bg-category-green-bg text-category-green-text",
  },
  {
    icon: "📋",
    iconBg: "bg-category-blue-bg",
    title: "Conseil médical",
    description: "Notre équipe vous conseille sur les produits adaptés à vos besoins.",
    tag: "Conseil",
    tagClass: "bg-category-blue-bg text-category-blue-text",
  },
  {
    icon: "🤝",
    iconBg: "bg-category-green-bg",
    title: "Partenariats B2B",
    description: "Approvisionnements réguliers pour pharmacies et professionnels de santé.",
    tag: "B2B",
    tagClass: "bg-category-green-bg text-category-green-text",
  },
];

const TRUST = [
  { icon: "🏆", label: "Certifiés" },
  { icon: "🚀", label: "Livraison 24h" },
  { icon: "💬", label: "Support 7j/7" },
  { icon: "🔒", label: "Sécurisé" },
  { icon: "↩️", label: "Retour 30j" },
];

export default function ServicesPage() {
  return (
    <div>
      <div className="bg-[#F0F5FF] py-16">
        <div className="container-page text-center">
          <p className="text-[10px] font-bold tracking-wide text-green-main">NOS SERVICES</p>
          <h1 className="mt-2 text-[34px] font-bold text-blue-deep">Ce que nous offrons</h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-gray-500">
            Des solutions complètes pour professionnels et particuliers.
          </p>
        </div>
      </div>

      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div key={service.title} className="rounded-[22px] bg-white p-6 shadow-soft">
              <span className={`flex h-[58px] w-[58px] items-center justify-center rounded-2xl text-2xl ${service.iconBg}`}>
                {service.icon}
              </span>
              <h3 className="mt-4 text-[15px] font-bold text-blue-deep">{service.title}</h3>
              <p className="mt-3 text-xs leading-relaxed text-gray-500">{service.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className={`badge ${service.tagClass}`}>{service.tag}</span>
                <span className="text-sm font-semibold text-blue-main">→</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[20px] bg-blue-mist p-6">
          <p className="text-lg font-bold text-blue-deep">Pourquoi choisir KamalPharMédis ?</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {TRUST.map((t) => (
              <span key={t.label} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-deep">
                <span>{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-[20px] bg-blue-deep p-6 sm:flex-row">
          <p className="max-w-xl text-sm text-[#CCE0FF]">
            Prêt à commander ? Créez votre compte et accédez à tous nos produits dès maintenant.
          </p>
          <Link href="/inscription" className="flex h-11 shrink-0 items-center rounded-full bg-[#E5ED8F] px-6 text-sm font-bold text-gray-900">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
