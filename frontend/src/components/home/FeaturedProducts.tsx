"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import StarRating from "@/components/ui/StarRating";
import Reveal from "@/components/ui/Reveal";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const TOP_COLORS = ["bg-category-blue-bg", "bg-category-cyan-bg", "bg-category-orange-bg", "bg-category-green-bg"];

function FeaturedCard({ product, colorClass }: { product: Product; colorClass: string }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round(100 - (product.price / product.old_price) * 100)
      : null;
  const lowStock = product.stock > 0 && product.stock <= 10;
  const stockPercent = Math.min(100, Math.round((product.stock / 30) * 100));

  const badge = discount
    ? { label: `-${discount}%`, className: "bg-green-main text-white" }
    : lowStock
      ? { label: "Stock limité", className: "bg-[#FFE5E5] text-status-danger" }
      : product.is_featured
        ? { label: "Populaire", className: "bg-blue-mist text-blue-main" }
        : null;

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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[22px] bg-white shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lifted">
      <Link href={`/produits/${product.slug}`} className={`relative flex aspect-square w-full items-center justify-center ${product.image ? "bg-white" : colorClass}`}>
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <span className="text-7xl">💊</span>
        )}
        {badge && <span className={`badge absolute left-3 top-2.5 ${badge.className}`}>{badge.label}</span>}
      </Link>
      <button
        onClick={handleWishlist}
        aria-label="Ajouter aux favoris"
        className={`absolute right-3.5 top-3 flex h-8 w-8 items-center justify-center rounded-2xl bg-white shadow-soft ${wishlisted ? "text-red-500" : "text-gray-500"}`}
      >
        {wishlisted ? "♥" : "♡"}
      </button>

      <div className="p-3.5">
        <p className="text-[10px] font-semibold text-gray-500">{product.category?.name}</p>
        <Link href={`/produits/${product.slug}`} className="mt-1 line-clamp-1 block text-sm font-bold text-blue-deep hover:underline">
          {product.name}
        </Link>

        {(product.reviews_count ?? 0) > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <StarRating value={product.reviews_avg_rating ?? 0} size="sm" />
            <span className="text-[10px] text-gray-500">({product.reviews_count})</span>
          </div>
        )}

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-lg font-bold text-blue-deep">{formatPrice(product.price)}</span>
          {product.old_price && product.old_price > product.price && (
            <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.old_price)}</span>
          )}
        </div>

        <div className="mt-3 h-1 w-full rounded-full bg-blue-mist">
          <div
            className={`h-1 rounded-full ${lowStock ? "bg-status-danger" : "bg-blue-main"}`}
            style={{ width: `${Math.max(stockPercent, 8)}%` }}
          />
        </div>
        <p className={`mt-1.5 text-[10px] ${lowStock ? "text-status-danger" : "text-green-dark"}`}>
          {product.stock === 0 ? "Rupture de stock" : lowStock ? `Stock limité : ${product.stock}u` : `En stock (${product.stock}u)`}
        </p>

        <button
          onClick={handleAdd}
          disabled={adding || product.stock === 0}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[22px] bg-blue-main text-[13px] font-semibold text-white shadow-lifted transition hover:bg-blue-deep disabled:opacity-40"
        >
          🛒 Ajouter au panier
        </button>
        <Link
          href={`/produits/${product.slug}`}
          className="mt-2 block rounded-[10px] bg-blue-frost px-3 py-2 text-center text-[11px] text-blue-main"
        >
          Voir les détails →
        </Link>
      </div>
    </div>
  );
}

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="section bg-blue-frost !py-14">
      <Reveal className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[30px] font-bold text-blue-deep">Nos produits phares</p>
          <p className="mt-1 text-[13px] text-gray-500">Les plus commandés par nos clients</p>
        </div>
        <Link href="/catalogue" className="rounded-full border border-gray-300 bg-white px-5 py-2 text-xs text-gray-500 hover:border-blue-main hover:text-blue-main">
          Voir tout →
        </Link>
      </Reveal>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={(i % 4) * 90}>
            <FeaturedCard product={product} colorClass={TOP_COLORS[i % TOP_COLORS.length]} />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/catalogue"
          className="inline-flex h-12 items-center rounded-full border-2 border-blue-main bg-white px-8 text-sm font-semibold text-blue-main transition hover:bg-blue-mist"
        >
          Voir tout le catalogue
        </Link>
      </div>
    </section>
  );
}
