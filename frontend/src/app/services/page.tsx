import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Nos services" };

const SERVICES = [
  {
    icon: "🩺",
    iconBg: "bg-category-green-bg",
    title: "Matériel médical",
    href: "/catalogue",
    description: "Tensiomètres, glucomètres, matériel de diagnostic, mobilier médical et équipements d'urgence.",
    tag: "Équipements",
    tagClass: "bg-category-green-bg text-category-green-text",
  },
  {
    icon: "🧤",
    iconBg: "bg-category-blue-bg",
    title: "Consommables médicaux",
    href: "/catalogue",
    description: "Gants, seringues, compresses, pansements, perfuseurs et produits de protection et d'hygiène.",
    tag: "Consommables",
    tagClass: "bg-category-blue-bg text-category-blue-text",
  },
  {
    icon: "🚚",
    iconBg: "bg-category-green-bg",
    title: "Livraison",
    href: "/conditions-generales-de-vente",
    description: "Livraison à Dakar et partout au Sénégal, pour les particuliers comme pour les établissements de santé.",
    tag: "Logistique",
    tagClass: "bg-category-green-bg text-category-green-text",
  },
  {
    icon: "💬",
    iconBg: "bg-category-blue-bg",
    title: "Conseil sur les produits",
    href: "/contact",
    description: "Notre équipe vous aide par téléphone et WhatsApp à choisir le produit adapté à votre besoin.",
    tag: "Conseil",
    tagClass: "bg-category-blue-bg text-category-blue-text",
  },
  {
    icon: "🤝",
    iconBg: "bg-category-green-bg",
    title: "Devis pour professionnels",
    href: "/devis",
    description: "Cliniques, cabinets, pharmacies, hôpitaux : devis personnalisé pour vos commandes en volume.",
    tag: "Professionnels",
    tagClass: "bg-category-green-bg text-category-green-text",
  },
  {
    icon: "💊",
    iconBg: "bg-category-blue-bg",
    title: "Médicaments et produits de santé",
    description: "Bientôt disponibles sur KamalPharMédis, dès l'obtention de notre agrément.",
    tag: "Bientôt",
    tagClass: "bg-category-blue-bg text-category-blue-text",
  },
];

const TRUST = [
  { icon: "✅", label: "Matériel de qualité" },
  { icon: "🚚", label: "Livraison à Dakar et partout au Sénégal" },
  { icon: "💬", label: "Conseils par WhatsApp" },
  { icon: "💵", label: "Paiement à la livraison" },
  { icon: "↩️", label: "Retour 7 jours" },
];

type Service = (typeof SERVICES)[number] & { href?: string };

function ServiceCard({ service }: { service: Service }) {
  const content = (
    <>
      <span className={`flex h-[58px] w-[58px] items-center justify-center rounded-2xl text-2xl ${service.iconBg}`}>
        {service.icon}
      </span>
      <h3 className="mt-4 text-[15px] font-bold text-blue-deep">{service.title}</h3>
      <p className="mt-3 text-xs leading-relaxed text-gray-500">{service.description}</p>
      <div className="mt-6 flex items-center justify-between">
        <span className={`badge ${service.tagClass}`}>{service.tag}</span>
        {service.href && <span className="text-sm font-semibold text-blue-main">→</span>}
      </div>
    </>
  );

  if (!service.href) {
    return <div className="rounded-[22px] bg-white p-6 shadow-soft">{content}</div>;
  }
  return (
    <Link href={service.href} className="block rounded-[22px] bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      {content}
    </Link>
  );
}

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
            <ServiceCard key={service.title} service={service} />
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
