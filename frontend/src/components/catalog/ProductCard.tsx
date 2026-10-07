"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/types";
import StarRating from "@/components/ui/StarRating";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const TOP_COLORS = [
  "bg-category-green-bg",
  "bg-category-blue-bg",
  "bg-category-orange-bg",
  "bg-category-red-bg",
  "bg-category-cyan-bg",
  "bg-category-purple-bg",
];

export default function ProductCard({ product, colorIndex = 0 }: { product: Product; colorIndex?: number }) {
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
  const topColor = TOP_COLORS[colorIndex % TOP_COLORS.length];

  // Seule la rupture est signalée sur la photo ; la disponibilité est indiquée sous le prix
  const stockBadge =
    product.stock === 0 ? { label: "Rupture de stock", className: "bg-[#FFE5E5] text-status-danger" } : null;
  const badge = discount
    ? { label: `-${discount}%`, className: "bg-green-main text-white" }
    : product.is_featured
      ? { label: "Populaire", className: "bg-blue-mist text-blue-main" }
      : null;

  async function handleAdd() {
    if (!user) {
      router.push(`/connexion?redirect=/catalogue`);
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/connexion?redirect=/catalogue`);
      return;
    }
    await api.post("/wishlist", { product_id: product.id });
    setWishlisted(true);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lifted">
      <Link href={`/produits/${product.slug}`} className={`relative flex aspect-square w-full items-center justify-center ${product.image ? "bg-white" : topColor}`}>
        {product.image ? (
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
        ) : (
          <span className="text-5xl">💊</span>
        )}
        {stockBadge && <span className={`badge absolute left-3.5 top-2.5 shadow-soft ${stockBadge.className}`}>{stockBadge.label}</span>}
        {badge && <span className={`badge absolute right-3.5 top-2.5 shadow-soft ${badge.className}`}>{badge.label}</span>}
        <button
          onClick={handleWishlist}
          aria-label="Ajouter aux favoris"
          className={`absolute bottom-3 right-3.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-white shadow-soft ${wishlisted ? "text-red-500" : "text-gray-500"}`}
        >
          {wishlisted ? "♥" : "♡"}
        </button>
      </Link>

      <div className="p-3.5">
        <p className="text-[10px] font-semibold text-gray-500">{product.category?.name}</p>
        <Link href={`/produits/${product.slug}`} className="mt-1.5 line-clamp-1 block text-sm font-bold text-blue-deep hover:underline">
          {product.name}
        </Link>

        {(product.reviews_count ?? 0) > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <StarRating value={product.reviews_avg_rating ?? 0} size="sm" />
            <span className="text-[10px] text-gray-500">({product.reviews_count})</span>
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-blue-deep">{formatPrice(product.price)}</span>
          {product.old_price && product.old_price > product.price && (
            <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.old_price)}</span>
          )}
        </div>

        <p className={`mt-1.5 text-[10px] ${lowStock ? "text-status-danger" : "text-green-dark"}`}>
          {product.stock === 0 ? "Rupture de stock" : lowStock ? `Stock limité (${product.stock})` : `En stock (${product.stock})`}
        </p>

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-main text-[11px] font-semibold text-white shadow-lifted disabled:opacity-40"
          >
            🛒 Ajouter
          </button>
          <Link
            href={`/produits/${product.slug}`}
            className="flex h-9 flex-1 items-center justify-center rounded-lg bg-blue-frost text-[11px] text-blue-main"
          >
            Voir détails →
          </Link>
        </div>
      </div>
    </div>
  );
}
