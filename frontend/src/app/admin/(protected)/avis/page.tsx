"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatDate } from "@/lib/api";
import { PaginatedResponse } from "@/types";
import { PageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import StarRating from "@/components/ui/StarRating";

interface AdminReview {
  id: number;
  rating: number;
  comment: string | null;
  is_visible: boolean;
  created_at: string;
  product: { id: number; name: string; slug: string } | null;
  user: { id: number; name: string; email: string } | null;
}

const FILTERS = [
  { value: "", label: "Tous" },
  { value: "visible", label: "Visibles" },
  { value: "hidden", label: "Masqués" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<PaginatedResponse<AdminReview> | null>(null);
  const [visibility, setVisibility] = useState("");
  const [page, setPage] = useState(1);

  function load() {
    const params = new URLSearchParams({ page: String(page), per_page: "10" });
    if (visibility) params.set("visibility", visibility);
    api.get<PaginatedResponse<AdminReview>>(`/admin/reviews?${params.toString()}`).then(setReviews);
  }

  useEffect(load, [page, visibility]);

  async function toggle(review: AdminReview) {
    await api.patch(`/admin/reviews/${review.id}`, { is_visible: !review.is_visible });
    load();
  }

  async function remove(review: AdminReview) {
    if (!confirm("Supprimer définitivement cet avis ?")) return;
    await api.delete(`/admin/reviews/${review.id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-blue-deep">Avis clients</h1>
      <p className="mt-1 text-sm text-gray-500">
        Avis laissés par les clients ayant reçu le produit. Masquez un avis inapproprié (il n&apos;est plus affiché ni
        compté dans la note) ou supprimez-le.
      </p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setVisibility(f.value); setPage(1); }}
            className={`flex h-9 items-center rounded-full px-4 text-xs font-medium transition ${
              visibility === f.value ? "bg-blue-main text-white" : "border border-gray-300 bg-white text-gray-600 hover:border-blue-main"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {!reviews ? (
          <PageSpinner />
        ) : reviews.data.length === 0 ? (
          <EmptyState title="Aucun avis" description="Les avis des clients apparaîtront ici après leurs premières livraisons." />
        ) : (
          <ul className="space-y-3">
            {reviews.data.map((r) => (
              <li key={r.id} className={`rounded-[18px] bg-white p-5 shadow-soft ${r.is_visible ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating value={r.rating} size="sm" />
                      {!r.is_visible && <span className="badge bg-gray-100 text-gray-600">Masqué</span>}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-gray-900">
                      {r.product ? (
                        <Link href={`/produits/${r.product.slug}#avis`} target="_blank" className="hover:text-blue-main hover:underline">
                          {r.product.name}
                        </Link>
                      ) : (
                        "Produit supprimé"
                      )}
                    </p>
                    <p className="break-all text-xs text-gray-500">
                      {r.user?.name ?? "—"} · {r.user?.email ?? ""} · {formatDate(r.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => toggle(r)}
                      className="flex h-9 items-center rounded-[9px] bg-blue-mist px-3 text-xs font-semibold text-blue-main"
                    >
                      {r.is_visible ? "Masquer" : "Réafficher"}
                    </button>
                    <button
                      onClick={() => remove(r)}
                      aria-label="Supprimer"
                      className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#FFE5E5] text-status-danger"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {r.comment && <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {reviews && reviews.last_page > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: reviews.last_page }).map((_, i) => (
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
    </div>
  );
}
