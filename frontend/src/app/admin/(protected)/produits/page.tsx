"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api, formatPrice } from "@/lib/api";
import { Category, PaginatedResponse, Product } from "@/types";
import { PageSpinner } from "@/components/ui/Spinner";
import ProductFormModal from "@/components/admin/ProductFormModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [modalProduct, setModalProduct] = useState<Product | null | "new">(null);
  const [page, setPage] = useState(1);

  function load() {
    const params = new URLSearchParams({ page: String(page), per_page: "10" });
    if (search) params.set("search", search);
    api.get<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`).then(setProducts);
  }

  useEffect(() => {
    api.get<{ data: Category[] }>("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(load, [page, search]);

  async function handleDelete(product: Product) {
    if (!confirm(`Supprimer « ${product.name} » ?`)) return;
    await api.delete(`/products/${product.id}`);
    load();
  }

  async function handleToggleActive(product: Product) {
    await api.put(`/products/${product.id}`, { is_active: !product.is_active });
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="🔍 Rechercher un produit..."
          className="input-field max-w-[300px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <button onClick={() => setModalProduct("new")} className="ml-auto flex h-11 items-center gap-2 rounded-2xl bg-blue-main px-5 text-[13px] font-semibold text-white shadow-lifted">
          ➕ Ajouter produit
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[18px] bg-white shadow-soft">
        {!products ? (
          <PageSpinner />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-blue-frost text-left text-[11px] font-bold uppercase text-gray-500">
              <tr>
                <th className="px-2 py-3.5 sm:px-5">Produit</th>
                <th className="hidden px-5 py-3.5 md:table-cell">Catégorie</th>
                <th className="px-2 py-3.5 sm:px-5">Prix</th>
                <th className="hidden px-5 py-3.5 sm:table-cell">Stock</th>
                <th className="hidden px-5 py-3.5 sm:table-cell">Actif</th>
                <th className="px-2 py-3.5 text-right sm:px-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.data.map((product, i) => (
                <tr key={product.id} className={i % 2 === 1 ? "bg-blue-frost" : "bg-white"}>
                  <td className="px-2 py-3 sm:px-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[10px] bg-blue-mist">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-base">💊</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[13px] font-semibold text-gray-900 sm:text-sm">{product.name}</p>
                        <p className="text-[10px] text-gray-500">
                          <span className="hidden sm:inline">{product.sku}</span>
                          <span className="sm:hidden">Stock : {product.stock}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell">
                    <span className="badge bg-blue-mist text-blue-main">{product.category?.name}</span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-xs font-semibold text-gray-900 sm:px-5 sm:text-sm">{formatPrice(product.price)}</td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <span className={product.stock <= 10 ? "font-semibold text-status-danger" : "font-semibold text-gray-900"}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`relative h-[22px] w-10 rounded-full transition ${product.is_active ? "bg-blue-main" : "bg-gray-300"}`}
                      aria-label="Basculer actif"
                    >
                      <span className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition ${product.is_active ? "left-[20px]" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-right sm:px-5">
                    <button onClick={() => setModalProduct(product)} aria-label="Modifier" className="mr-1.5 inline-flex h-9 w-9 sm:mr-2 items-center justify-center rounded-[9px] bg-blue-mist text-blue-main">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(product)} aria-label="Supprimer" className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#FFE5E5] text-status-danger">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {products && products.last_page > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: products.last_page }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-full text-sm font-semibold ${page === i + 1 ? "bg-blue-main text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {modalProduct && (
        <ProductFormModal
          categories={categories}
          product={modalProduct === "new" ? null : modalProduct}
          onClose={() => { setModalProduct(null); load(); }}
          onSaved={() => { setModalProduct(null); load(); }}
        />
      )}
    </div>
  );
}
