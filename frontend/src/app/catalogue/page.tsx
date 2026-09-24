"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Category, PaginatedResponse, Product } from "@/types";
import ProductCard from "@/components/catalog/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";

const SORT_OPTIONS = [
  { value: "", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name", label: "Nom (A-Z)" },
];

function CataloguePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const urlSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const lastPushedSearch = useRef(urlSearch);

  const activeCategory = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const updateParams = useCallback(
    (updates: Record<string, string | null>, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!("page" in updates)) params.delete("page");
      const url = `/catalogue?${params.toString()}`;
      if (replace) router.replace(url);
      else router.push(url);
    },
    [router, searchParams]
  );

  // Le champ suit l'URL quand elle change ailleurs (retour arrière, lien du footer...),
  // sauf pour les changements que la frappe vient elle-même de provoquer.
  useEffect(() => {
    if (urlSearch !== lastPushedSearch.current) {
      lastPushedSearch.current = urlSearch;
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  // Recherche en direct : les résultats se mettent à jour dès que la frappe s'arrête.
  useEffect(() => {
    const term = search.trim();
    if (term === urlSearch) return;
    const timer = setTimeout(() => {
      lastPushedSearch.current = term;
      updateParams({ search: term || null }, true);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, urlSearch, updateParams]);

  useEffect(() => {
    api.get<{ data: Category[] }>("/categories", { auth: false }).then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (sort) params.set("sort", sort);
    if (urlSearch) params.set("search", urlSearch);
    params.set("page", String(page));
    params.set("per_page", "9");

    api
      .get<PaginatedResponse<Product>>(`/products?${params.toString()}`, { auth: false })
      .then((res) => {
        if (!cancelled) setProducts(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, sort, page, urlSearch]);

  return (
    <div>
      <div className="bg-[#F0F5FF] py-14">
        <div className="container-page text-center">
          <p className="text-[10px] font-bold tracking-wide text-green-main">CATALOGUE</p>
          <h1 className="mt-2 text-[34px] font-bold text-blue-deep">Nos produits</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
            Gamme complète de produits médicaux et de santé de qualité.
          </p>
        </div>
      </div>

      <div className="border-y border-[#E5EDFA] bg-white py-3.5">
        <div className="container-page flex flex-wrap items-center gap-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const term = search.trim();
              lastPushedSearch.current = term;
              updateParams({ search: term || null });
            }}
            className="w-full sm:w-auto sm:flex-1"
          >
            <div className="relative">
              <input
                type="text"
                enterKeyHint="search"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Rechercher un produit..."
                aria-label="Rechercher un produit"
                className="input-field !rounded-full pr-10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Effacer la recherche"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500 hover:bg-gray-200"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          <button
            onClick={() => updateParams({ category: null })}
            className={`flex h-9 items-center rounded-full px-4 text-xs font-medium transition ${
              !activeCategory ? "bg-blue-main text-white" : "border border-gray-300 text-gray-600 hover:border-blue-main"
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateParams({ category: category.slug })}
              className={`flex h-9 items-center rounded-full px-4 text-xs font-medium transition ${
                activeCategory === category.slug ? "bg-blue-main text-white" : "border border-gray-300 text-gray-600 hover:border-blue-main"
              }`}
            >
              {category.name}
            </button>
          ))}

          <select value={sort} onChange={(e) => updateParams({ sort: e.target.value || null })} className="input-field ml-auto w-auto !rounded-full">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="container-page py-10">
        {!products ? (
          <PageSpinner />
        ) : products.data.length > 0 ? (
          <div className={`transition-opacity ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
            <p className="mb-5 text-sm text-gray-500">
              {products.total} produit(s) trouvé(s){urlSearch ? ` pour « ${urlSearch} »` : ""}
            </p>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {products.data.map((product, i) => (
                <ProductCard key={product.id} product={product} colorIndex={i} />
              ))}
            </div>

            {products.last_page > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: products.last_page }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParams({ page: String(i + 1) })}
                    className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                      page === i + 1 ? "bg-blue-main text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="Aucun produit trouvé"
            description={
              urlSearch
                ? `Aucun résultat pour « ${urlSearch} ». Vérifiez l'orthographe, essayez un autre mot-clé ou une autre catégorie.`
                : "Essayez une autre catégorie ou un autre mot-clé."
            }
          />
        )}
      </div>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <CataloguePageInner />
    </Suspense>
  );
}
