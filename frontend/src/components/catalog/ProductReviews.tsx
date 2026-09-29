"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, formatDate } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PaginatedResponse, ProductReview, ReviewSummary } from "@/types";
import StarRating, { StarInput } from "@/components/ui/StarRating";

interface ReviewsResponse {
  reviews: PaginatedResponse<ProductReview>;
  summary: ReviewSummary;
}

export default function ProductReviews({ productId, productSlug }: { productId: number; productSlug: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const [mine, setMine] = useState<ProductReview | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(() => {
    api
      .get<ReviewsResponse>(`/products/${productId}/reviews?page=${page}&per_page=5`, { auth: false })
      .then(setData)
      .catch(() => setData(null));
  }, [productId, page]);

  useEffect(load, [load]);

  const loadMine = useCallback(() => {
    if (!user) {
      setCanReview(false);
      setMine(null);
      return;
    }
    api
      .get<{ can_review: boolean; review: ProductReview | null }>(`/products/${productId}/reviews/mine`)
      .then((res) => {
        setCanReview(res.can_review);
        setMine(res.review);
        if (res.review) {
          setRating(res.review.rating);
          setComment(res.review.comment ?? "");
        }
      })
      .catch(() => setCanReview(false));
  }, [user, productId]);

  useEffect(loadMine, [loadMine]);

  // Arrivée par un lien « …#avis » : la section n'existe qu'après le chargement du produit,
  // le navigateur ne peut donc pas y défiler tout seul.
  useEffect(() => {
    if (data && window.location.hash === "#avis") {
      document.getElementById("avis")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setMessage({ type: "error", text: "Choisissez une note de 1 à 5 étoiles." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment: comment.trim() || null });
      setMessage({ type: "ok", text: "Merci pour votre avis !" });
      setEditing(false);
      setPage(1);
      load();
      loadMine();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Impossible d'enregistrer votre avis." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer votre avis ?")) return;
    await api.delete(`/products/${productId}/reviews`);
    setMine(null);
    setRating(0);
    setComment("");
    setMessage(null);
    load();
    loadMine();
  }

  const summary = data?.summary;
  const reviews = data?.reviews;
  const showForm = canReview && (!mine || editing);

  return (
    <section id="avis" className="mt-14 scroll-mt-24">
      <h2 className="text-xl font-bold text-blue-deep">Avis clients</h2>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Résumé */}
        <div className="rounded-[20px] bg-white p-6 shadow-soft">
          {summary && summary.count > 0 ? (
            <>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-blue-deep">{summary.average.toString().replace(".", ",")}</span>
                <span className="mb-1 text-sm text-gray-500">/ 5</span>
              </div>
              <div className="mt-2"><StarRating value={summary.average} size="lg" /></div>
              <p className="mt-2 text-sm text-gray-500">{summary.count} avis vérifié{summary.count > 1 ? "s" : ""}</p>
              <div className="mt-5 space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const count = summary.distribution[n] ?? 0;
                  const pct = summary.count ? Math.round((count / summary.count) * 100) : 0;
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-6 shrink-0">{n} ★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 shrink-0 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Aucun avis pour le moment. Soyez le premier à partager votre expérience après réception !</p>
          )}

          <div className="mt-6 border-t border-gray-100 pt-5 text-sm">
            {!user && (
              <p className="text-gray-500">
                <Link href={`/connexion?redirect=/produits/${productSlug}`} className="font-semibold text-blue-main">Connectez-vous</Link>{" "}
                pour donner votre avis après réception de votre commande.
              </p>
            )}
            {user && !canReview && !mine && (
              <p className="text-gray-500">🔒 Seuls les clients ayant <strong>reçu</strong> ce produit peuvent laisser un avis.</p>
            )}
            {user && mine && !editing && (
              <div>
                <p className="font-semibold text-gray-900">Votre avis</p>
                <div className="mt-1"><StarRating value={mine.rating} size="sm" /></div>
                {mine.comment && <p className="mt-2 text-gray-600">{mine.comment}</p>}
                <div className="mt-3 flex gap-4">
                  <button onClick={() => setEditing(true)} className="font-semibold text-blue-main">Modifier</button>
                  <button onClick={handleDelete} className="font-semibold text-status-danger">Supprimer</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire + liste */}
        <div className="space-y-5 lg:col-span-2">
          {message && (
            <p className={`rounded-lg px-4 py-3 text-sm ${message.type === "ok" ? "bg-green-pale text-green-dark" : "bg-red-50 text-red-600"}`}>
              {message.text}
            </p>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="rounded-[20px] bg-white p-6 shadow-soft">
              <p className="font-semibold text-gray-900">{mine ? "Modifier votre avis" : "Donnez votre avis"}</p>
              <p className="mt-1 text-xs text-gray-500">Vous avez reçu ce produit : votre avis sera marqué « Achat vérifié ».</p>
              <div className="mt-4"><StarInput value={rating} onChange={setRating} /></div>
              <textarea
                rows={4}
                maxLength={1000}
                className="input-field mt-4 resize-none"
                placeholder="Qualité, conformité, emballage, livraison... (facultatif)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p className="mt-1 text-right text-[11px] text-gray-400">{comment.length}/1000</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Envoi..." : mine ? "Enregistrer" : "Publier mon avis"}
                </button>
                {editing && (
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Annuler</button>
                )}
              </div>
            </form>
          )}

          {reviews && reviews.data.length > 0 ? (
            <>
              <ul className="space-y-4">
                {reviews.data.map((r) => (
                  <li key={r.id} className="rounded-[20px] bg-white p-5 shadow-soft">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white">
                          {r.author.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{r.author}</p>
                          <p className="text-[11px] text-green-main">✓ Achat vérifié</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StarRating value={r.rating} size="sm" />
                        <p className="mt-1 text-[11px] text-gray-400">{formatDate(r.created_at)}</p>
                      </div>
                    </div>
                    {r.comment && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{r.comment}</p>}
                  </li>
                ))}
              </ul>
              {reviews.last_page > 1 && (
                <div className="flex justify-center gap-2">
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
            </>
          ) : (
            !showForm && summary && summary.count === 0 && (
              <div className="rounded-[20px] border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                ⭐ Les avis des clients qui ont reçu ce produit apparaîtront ici.
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
