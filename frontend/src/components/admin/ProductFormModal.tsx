"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Category, Product } from "@/types";

interface Props {
  categories: Category[];
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_FORM = {
  category_id: "",
  name: "",
  sku: "",
  short_description: "",
  description: "",
  price: "",
  old_price: "",
  stock: "",
  is_featured: false,
  is_active: true,
};

export default function ProductFormModal({ categories, product, onClose, onSaved }: Props) {
  const [form, setForm] = useState(
    product
      ? {
          category_id: String(product.category_id),
          name: product.name,
          sku: product.sku,
          short_description: product.short_description ?? "",
          description: product.description ?? "",
          price: String(product.price),
          old_price: product.old_price ? String(product.old_price) : "",
          stock: String(product.stock),
          is_featured: product.is_featured,
          is_active: product.is_active,
        }
      : EMPTY_FORM
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleRemoveImage(index: number) {
    if (!product || !confirm("Supprimer cette photo ?")) return;
    setError(null);
    try {
      await api.delete(`/products/${product.id}/images`, { json: { index } });
      setImages((current) => current.filter((_, i) => i !== index));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de supprimer la photo.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      category_id: Number(form.category_id),
      name: form.name,
      sku: form.sku || undefined,
      short_description: form.short_description || null,
      description: form.description || null,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      stock: Number(form.stock),
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    try {
      const saved = product
        ? await api.put<Product>(`/products/${product.id}`, payload)
        : await api.post<Product>("/products", payload);

      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/products/${saved.id}/images`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${window.localStorage.getItem("kpm_token")}`,
            },
            body: formData,
          }
        );
        if (!response.ok) {
          throw new ApiError(`La photo « ${file.name} » n'a pas pu être envoyée (image de 4 Mo maximum).`, response.status);
        }
      }

      onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = err.errors ? Object.values(err.errors)[0]?.[0] : null;
        setError(firstError || err.message);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl2 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-deep">{product ? "Modifier le produit" : "Nouveau produit"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nom du produit</label>
              <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Catégorie</label>
              <select required className="input-field" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Sélectionner...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">SKU (optionnel, généré automatiquement sinon)</label>
            <input className="input-field" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description courte</label>
            <input className="input-field" maxLength={255} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description complète</label>
            <textarea rows={4} className="input-field resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Prix (FCFA)</label>
              <input
                required
                type="text"
                inputMode="numeric"
                placeholder="Ex : 45000"
                className="input-field"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ancien prix (optionnel)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex : 55000"
                className="input-field"
                value={form.old_price}
                onChange={(e) => setForm({ ...form, old_price: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
              <input
                required
                type="text"
                inputMode="numeric"
                placeholder="Ex : 20"
                className="input-field"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Photos du produit</label>

            {images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {images.map((url, index) => (
                  <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200 bg-blue-frost">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-contain p-1" />
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-blue-main/80 py-0.5 text-center text-[9px] font-semibold text-white">
                        Principale
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      aria-label="Supprimer cette photo"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] text-status-danger shadow-soft hover:bg-status-danger hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
              className="input-field"
              onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Vous pouvez choisir plusieurs photos (4 Mo maximum chacune). La première photo est celle affichée dans le catalogue.
            </p>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              Produit vedette
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Actif (visible sur le site)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Enregistrement..." : product ? "Enregistrer les modifications" : "Créer le produit"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
