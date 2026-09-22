"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const TRUST_BADGES = [
  { icon: "🛡️", label: "Certifiés CE" },
  { icon: "🚀", label: "Livraison 24h" },
  { icon: "🔄", label: "Retour 30j" },
  { icon: "💳", label: "Paiement sécurisé" },
];

function FeaturedCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  async function handleAdd() {
    if (!user) {
      router.push("/connexion?redirect=/catalogue");
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!user) {
      router.push("/connexion?redirect=/catalogue");
      return;
    }
    await api.post("/wishlist", { product_id: product.id });
    setWishlisted(true);
  }

  return (
    <div className="relative overflow-hidden rounded-[26px] bg-white shadow-2xl">
      <Link href={`/produits/${product.slug}`} className="relative flex h-[190px] items-center justify-center bg-green-pale">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain p-8" />
        ) : (
          <span className="text-7xl">🩺</span>
        )}
        {product.is_featured && <span className="badge absolute right-3 top-3 bg-blue-main text-white">⭐ Populaire</span>}
      </Link>
      <button
        onClick={handleWishlist}
        className={`absolute right-4 top-[172px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white shadow-soft ${wishlisted ? "text-red-500" : "text-gray-500"}`}
        aria-label="Ajouter aux favoris"
      >
        ♡
      </button>
      <div className="p-4 pt-6">
        <p className="text-[10px] font-semibold text-gray-500">{product.category?.name}</p>
        <Link href={`/produits/${product.slug}`} className="mt-1 block text-base font-bold text-blue-deep hover:underline">
          {product.name}
        </Link>
        {product.short_description && <p className="mt-1 line-clamp-1 text-xs text-gray-500">{product.short_description}</p>}

        <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-mist px-3.5 py-3">
          <span className="text-lg font-bold text-blue-deep">{formatPrice(product.price)}</span>
          <span className={`badge ${product.stock > 0 ? "bg-green-pale text-green-dark" : "bg-[#FFE5E5] text-status-danger"}`}>
            {product.stock > 0 ? "✅ En stock" : "Rupture"}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding || product.stock === 0}
          className="mt-3 flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-blue-main text-[13px] font-semibold text-white shadow-lifted disabled:opacity-40"
        >
          {adding ? "Ajout..." : "🛒 Ajouter au panier"}
        </button>

        <div className="mt-2.5 flex gap-2">
          <Link
            href={`/produits/${product.slug}`}
            className="flex-1 rounded-lg bg-blue-frost px-3 py-2 text-center text-[11px] text-blue-main"
          >
            Voir les détails →
          </Link>
          <button
            onClick={handleWishlist}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-[11px] ${wishlisted ? "bg-red-100 text-red-500" : "bg-green-pale text-green-dark"}`}
          >
            {wishlisted ? "♥ Ajouté" : "♡ Ajouter aux favoris"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ featuredProduct }: { featuredProduct?: Product | null }) {
  return (
    <section className="relative overflow-hidden bg-blue-deep">
      {/* Bulles décoratives, fidèles à la maquette Figma */}
      <div className="pointer-events-none absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -right-16 top-32 hidden h-64 w-64 rounded-full bg-green-main/10 lg:block" />
      <div className="pointer-events-none absolute right-1/3 -top-16 hidden h-40 w-40 rounded-full bg-white/5 lg:block" />

      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-in">
          <span className="inline-flex items-center rounded-full bg-[#334DA6] px-4 py-2 text-xs font-medium text-[#CCE0FF]">
            🌿 Votre santé, notre priorité — Dakar, Sénégal
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-[54px]">
            Achetez vos produits
            <br />
            <span className="text-[#99D9A6]">médicaux en ligne</span>
          </h1>

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#B8CCFF]">
            Médicaments certifiés, matériel médical et produits de santé livrés rapidement partout au Sénégal.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/catalogue"
              className="flex h-[52px] items-center gap-2 rounded-full bg-[#E5ED8F] px-6 text-sm font-bold text-gray-900 shadow-lifted transition hover:brightness-95"
            >
              🛒 Commander maintenant
            </Link>
            <Link
              href="/catalogue"
              className="flex h-[52px] items-center gap-2 rounded-full border-2 border-[#99BFFF] bg-[#4066D9] px-6 text-sm font-semibold text-white transition hover:bg-[#3557b8]"
            >
              Voir le catalogue
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-2.5">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge.label}
                className="flex h-10 items-center gap-2 rounded-full bg-[#33478C] px-4 text-xs font-medium text-[#CCE0FF]"
              >
                <span>{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Carte produit flottante : un vrai produit vedette, entièrement cliquable */}
        {featuredProduct && (
          <div className="relative mx-auto hidden max-w-[374px] lg:block">
            <FeaturedCard product={featuredProduct} />

            {/* Toast social proof (décoratif) */}
            <div className="absolute -bottom-6 -left-8 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-soft">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-green-main text-sm font-bold text-white">
                ✓
              </span>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-gray-900">Un client vient de commander</p>
                <p className="text-[10px] text-gray-500">{featuredProduct.name} · à l&apos;instant</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
