import type { Metadata } from "next";
import Link from "next/link";
import { serverGet } from "@/lib/serverApi";
import { PublicStats } from "@/types";

export const metadata: Metadata = { title: "À propos" };

// Chiffres lus en direct dans la base : la page suit l'évolution du catalogue et des inscriptions.
export const dynamic = "force-dynamic";

const formatCount = (n: number) => n.toLocaleString("fr-FR").replace(/ /g, " ");

export default async function AboutPage() {
  const stats = await serverGet<PublicStats>("/stats");

  const cards = stats
    ? [
        { value: formatCount(stats.products), label: "Produits disponibles" },
        { value: formatCount(stats.clients), label: "Clients inscrits" },
        stats.reviews.count >= 5
          ? { value: `${String(stats.reviews.average).replace(".", ",")}/5`, label: `Note moyenne (${stats.reviews.count} avis)` }
          : { value: formatCount(stats.categories), label: "Catégories de produits" },
      ]
    : [];

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge bg-green-pale text-green-main">À propos</span>
        <h1 className="mt-4 text-4xl font-extrabold text-blue-deep">KamalPharMédis, votre partenaire santé</h1>
        <p className="mt-4 text-gray-500">
          KamalPharMédis accompagne les particuliers, les professionnels de santé et les établissements médicaux du
          Sénégal dans l&apos;achat de matériel et de consommables médicaux fiables.
        </p>
      </div>

      {cards.length > 0 && (
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="card p-6 text-center">
              <p className="text-3xl font-extrabold text-blue-deep">{card.value}</p>
              <p className="mt-1 text-sm text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mx-auto mt-14 max-w-3xl space-y-4 text-gray-600">
        <p>
          Notre mission est simple : rendre le matériel médical et les produits de santé accessibles à tous, où que
          vous soyez au Sénégal, avec une livraison rapide et un service de qualité.
        </p>
        <p>
          Nous sélectionnons nos produits auprès de fournisseurs de matériel médical reconnus et restons disponibles
          par téléphone et WhatsApp pour vous conseiller sur le bon produit et son utilisation.
        </p>
      </div>

      <div className="mt-14 text-center">
        <Link href="/catalogue" className="btn-primary inline-flex">Découvrir le catalogue</Link>
      </div>
    </div>
  );
}
