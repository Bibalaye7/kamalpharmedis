import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Boutique",
    links: [
      { label: "Tous les produits", href: "/catalogue" },
      { label: "Aiguilles & prélèvement", href: "/catalogue?category=aiguilles-prelevement" },
      { label: "Pansements & bandes", href: "/catalogue?category=pansements-bandes" },
      { label: "Protection & hygiène", href: "/catalogue?category=protection-hygiene" },
      { label: "Urgence & réanimation", href: "/catalogue?category=urgence-reanimation" },
    ],
  },
  {
    title: "Mon compte",
    links: [
      { label: "Créer un compte", href: "/inscription" },
      { label: "Se connecter", href: "/connexion" },
      { label: "Mes commandes", href: "/compte/commandes" },
      { label: "Mon profil", href: "/compte/profil" },
      { label: "Mes favoris", href: "/compte/favoris" },
    ],
  },
  {
    title: "Informations",
    links: [
      { label: "À propos de nous", href: "/a-propos" },
      { label: "Nos services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-[600px] w-[600px] rounded-full bg-white/5" />

      <div className="container-page relative grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/brand/logo-icon.png" alt="KamalPharMédis" width={52} height={52} className="h-[52px] w-[52px]" />
            <div>
              <p className="text-base font-bold text-white">KamalPharMédis</p>
              <p className="text-[10px] text-[#8CA6D9]">Santé & Bien-être</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#8CA6D9]">
            Votre boutique médicale en ligne au Sénégal.
          </p>
          <div className="mt-4 flex gap-2.5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-blue-main text-xs font-bold">f</span>
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#126EB5] text-xs font-bold">in</span>
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-green-main text-xs font-bold">wa</span>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold text-white">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[11px] text-[#8CA6D9] hover:text-green-main">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs font-bold text-white">Contact</p>
          <ul className="mt-4 space-y-2.5 text-[11px] text-[#8CA6D9]">
            <li>KamalPharMédis@gmail.com</li>
            <li>+221 75 661 62 62</li>
            <li>+221 70 464 12 81</li>
            <li>Ouest-Foire, Cité DIOR WARÉ N°14, Dakar</li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-[#334266]">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-[11px] text-[#6680B2] sm:flex-row">
          <p>© {new Date().getFullYear()} KamalPharMédis · Tous droits réservés</p>
          <div className="flex gap-5">
            <span>Conditions</span>
            <span>Confidentialité</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
