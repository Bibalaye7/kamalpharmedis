"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, formatPrice } from "@/lib/api";
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

// Comparaison sans accents ni majuscules : « catheter » trouve « Cathéters ».
const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Tous les produits visibles (nom, photo, prix) pour les suggestions de la barre de recherche.
async function fetchAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  for (let page = 1; ; page++) {
    const res = await api.get<PaginatedResponse<Product>>(`/products?sort=name&per_page=100&page=${page}`, { auth: false });
    all.push(...res.data);
    if (page >= res.last_page) return all;
  }
}

function CataloguePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const urlSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const lastPushedSearch = useRef(urlSearch);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

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
    fetchAllProducts().then(setAllProducts).catch(() => setAllProducts([]));
  }, []);

  // Noms proposés sous la barre : tous les produits, filtrés par chaque mot tapé.
  const suggestions = useMemo(() => {
    const words = normalize(search.trim()).split(/\s+/).filter(Boolean);
    return allProducts.filter((p) => {
      const name = normalize(p.name);
      return words.every((w) => name.includes(w));
    });
  }, [allProducts, search]);

  useEffect(() => setHighlight(-1), [search]);

  const goToProduct = (product: Product) => {
    setSuggestOpen(false);
    router.push(`/produits/${product.slug}`);
  };

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
        <div className="container-page">
          {/* Ligne 1 : recherche (pleine largeur) + tri */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (suggestOpen && highlight >= 0 && suggestions[highlight]) {
                goToProduct(suggestions[highlight]);
                return;
              }
              const term = search.trim();
              lastPushedSearch.current = term;
              setSuggestOpen(false);
              updateParams({ search: term || null });
            }}
            className="w-full min-w-0 sm:flex-1"
          >
            <div className="relative">
              <input
                type="text"
                enterKeyHint="search"
                autoComplete="off"
                role="combobox"
                aria-expanded={suggestOpen}
                aria-controls="suggestions-produits"
                aria-autocomplete="list"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                onBlur={() => setSuggestOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSuggestOpen(false);
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    setSuggestOpen(true);
                    const step = e.key === "ArrowDown" ? 1 : -1;
                    setHighlight((h) => Math.max(-1, Math.min(suggestions.length - 1, h + step)));
                  }
                }}
                placeholder="Rechercher un produit (gants, seringue, lit...)"
                aria-label="Rechercher un produit"
                className="input-field h-11 w-full !rounded-full pl-11 pr-10"
              />
              {suggestOpen && allProducts.length > 0 && (
                <div
                  id="suggestions-produits"
                  role="listbox"
                  // mousedown bloqué : le champ garde le focus le temps du clic sur une suggestion
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[#E5EDFA] bg-white shadow-lg"
                >
                  <p className="border-b border-[#E5EDFA] px-4 py-2 text-[11px] font-semibold text-gray-500">
                    {suggestions.length > 0
                      ? `${suggestions.length} produit(s)${search.trim() ? ` pour « ${search.trim()} »` : " au catalogue"}`
                      : `Aucun nom de produit ne contient « ${search.trim()} »`}
                  </p>
                  <ul className="max-h-80 overflow-y-auto py-1">
                    {suggestions.map((p, i) => (
                      <li key={p.id} role="option" aria-selected={i === highlight}>
                        <Link
                          href={`/produits/${p.slug}`}
                          onClick={() => setSuggestOpen(false)}
                          onMouseEnter={() => setHighlight(i)}
                          className={`flex items-center gap-3 px-4 py-2 ${i === highlight ? "bg-[#F0F5FF]" : ""}`}
                        >
                          {p.image ? (
                            <Image src={p.image} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-md border border-gray-100 object-contain" />
                          ) : (
                            <span className="h-9 w-9 shrink-0 rounded-md bg-gray-100" />
                          )}
                          <span className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug text-blue-deep">{p.name}</span>
                          <span className="shrink-0 text-xs font-semibold text-green-main">{formatPrice(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">🔍</span>
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

          <select value={sort} onChange={(e) => updateParams({ sort: e.target.value || null })} aria-label="Trier les produits" className="input-field h-11 w-full !rounded-full sm:w-56">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          </div>

          {/* Ligne 2 : catégories */}
          <div className="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <button
            onClick={() => updateParams({ category: null })}
            className={`flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-xs font-medium transition ${
              !activeCategory ? "bg-blue-main text-white" : "border border-gray-300 text-gray-600 hover:border-blue-main"
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateParams({ category: category.slug })}
              className={`flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-xs font-medium transition ${
                activeCategory === category.slug ? "bg-blue-main text-white" : "border border-gray-300 text-gray-600 hover:border-blue-main"
              }`}
            >
              {category.name}
            </button>
          ))}
          </div>
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
