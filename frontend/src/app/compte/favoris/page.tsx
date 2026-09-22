"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Product } from "@/types";
import ProductCard from "@/components/catalog/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[] | null>(null);

  function load() {
    api.get<{ data: Product[] }>("/wishlist").then((res) => setProducts(res.data));
  }

  useEffect(load, []);

  async function handleRemove(productId: number) {
    await api.delete(`/wishlist/${productId}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-blue-deep">Mes favoris</h1>

      <div className="mt-6">
        {products === null ? (
          <PageSpinner />
        ) : products.length === 0 ? (
          <EmptyState title="Aucun favori pour le moment" description="Ajoutez des produits à vos favoris depuis le catalogue." actionLabel="Voir le catalogue" actionHref="/catalogue" />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <button
                  onClick={() => handleRemove(product.id)}
                  aria-label="Retirer des favoris"
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-soft"
                >
                  ✕
                </button>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
