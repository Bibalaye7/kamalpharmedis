import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "À propos" };

export default function AboutPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge bg-green-pale text-green-main">À propos</span>
        <h1 className="mt-4 text-4xl font-extrabold text-blue-deep">KamalPharMédis, votre partenaire santé</h1>
        <p className="mt-4 text-gray-500">
          Depuis notre lancement, KamalPharMédis accompagne les particuliers, professionnels de santé et
          établissements médicaux du Sénégal dans l&apos;accès à du matériel médical fiable et des produits de santé
          certifiés.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="card p-6 text-center">
          <p className="text-3xl font-extrabold text-blue-deep">500+</p>
          <p className="mt-1 text-sm text-gray-500">Produits disponibles</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-3xl font-extrabold text-blue-deep">10 000+</p>
          <p className="mt-1 text-sm text-gray-500">Clients satisfaits</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-3xl font-extrabold text-blue-deep">98%</p>
          <p className="mt-1 text-sm text-gray-500">Taux de satisfaction</p>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-3xl space-y-4 text-gray-600">
        <p>
          Notre mission est simple : rendre le matériel médical et les produits de santé accessibles à tous, où que
          vous soyez au Sénégal, avec une livraison rapide et un service de qualité.
        </p>
        <p>
          Chaque produit vendu sur KamalPharMédis est vérifié par notre équipe de pharmaciens et professionnels de
          santé, garantissant conformité et fiabilité.
        </p>
      </div>

      <div className="mt-14 text-center">
        <Link href="/catalogue" className="btn-primary inline-flex">Découvrir le catalogue</Link>
      </div>
    </div>
  );
}
