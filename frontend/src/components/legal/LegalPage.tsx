import Link from "next/link";
import { LEGAL } from "@/lib/legal";

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/conditions-generales-de-vente", label: "Conditions générales de vente" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
];

/** Gabarit commun des pages légales : titre, date de mise à jour, liens entre les pages. */
export default function LegalPage({ title, current, children }: { title: string; current: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-[#F0F5FF] py-12">
        <div className="container-page text-center">
          <p className="text-[10px] font-bold tracking-wide text-green-main">INFORMATIONS LÉGALES</p>
          <h1 className="mt-2 text-3xl font-bold text-blue-deep sm:text-[34px]">{title}</h1>
          <p className="mt-3 text-xs text-gray-500">Dernière mise à jour : {LEGAL.updatedAt}</p>
        </div>
      </div>

      <div className="container-page py-10">
        <nav className="mx-auto mb-8 flex max-w-3xl flex-wrap justify-center gap-2" aria-label="Pages légales">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                l.href === current ? "bg-blue-main text-white" : "border border-gray-300 text-gray-600 hover:border-blue-main"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <article className="legal-content mx-auto max-w-3xl rounded-[24px] bg-white p-6 shadow-soft sm:p-10">{children}</article>
      </div>
    </div>
  );
}

/** Valeur légale pas encore fournie : bien visible pour être complétée avant la mise en ligne. */
export function ToComplete({ value, label }: { value: string | null; label: string }) {
  if (value) return <>{value}</>;
  return <mark className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">{label} : à compléter</mark>;
}
