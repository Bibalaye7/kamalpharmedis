"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, formatDate, formatPrice } from "@/lib/api";
import { PaginatedResponse, QuoteRequest, QuoteStatus } from "@/types";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_STYLES, companyTypeLabel } from "@/lib/quoteStatus";
import { PageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

type QuotesResponse = PaginatedResponse<QuoteRequest> & { counts: Record<QuoteStatus, number> };

const TABS: (QuoteStatus | "")[] = ["", "new", "in_progress", "sent", "accepted", "rejected"];

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuotesResponse | null>(null);
  const [status, setStatus] = useState<QuoteStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<QuoteRequest | null>(null);
  const [edit, setEdit] = useState({ status: "new" as QuoteStatus, quoted_total: "", admin_notes: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    const params = new URLSearchParams({ page: String(page), per_page: "10" });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    api.get<QuotesResponse>(`/admin/quotes?${params.toString()}`).then(setQuotes);
  }

  useEffect(load, [page, status, search]);

  async function open(q: QuoteRequest) {
    const full = await api.get<QuoteRequest>(`/admin/quotes/${q.id}`);
    setSelected(full);
    setMessage(null);
    setEdit({
      status: full.status,
      quoted_total: full.quoted_total !== null ? String(full.quoted_total) : "",
      admin_notes: full.admin_notes ?? "",
    });
    if (window.innerWidth < 1024) setTimeout(() => document.getElementById("detail-devis")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await api.patch<QuoteRequest>(`/admin/quotes/${selected.id}`, {
        status: edit.status,
        quoted_total: edit.quoted_total ? Number(edit.quoted_total) : null,
        admin_notes: edit.admin_notes || null,
      });
      setSelected(updated);
      setMessage("Devis mis à jour.");
      load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  const estimated = selected?.items.reduce((sum, i) => sum + (i.product ? i.product.price * i.quantity : 0), 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-blue-deep">Demandes de devis</h1>
      <p className="mt-1 text-sm text-gray-500">Demandes des professionnels (cliniques, pharmacies, hôpitaux, cabinets...).</p>

      <input
        placeholder="🔍 Rechercher (référence, établissement, contact...)"
        className="input-field mt-4 max-w-md"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t || "all"}
            onClick={() => { setStatus(t); setPage(1); }}
            className={`flex h-9 items-center rounded-full px-4 text-xs font-medium transition ${
              status === t ? "bg-blue-main text-white" : "border border-gray-300 bg-white text-gray-600 hover:border-blue-main"
            }`}
          >
            {t ? `${QUOTE_STATUS_LABELS[t]} (${quotes?.counts?.[t] ?? 0})` : "Toutes"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="overflow-hidden rounded-[18px] bg-white shadow-soft">
          {!quotes ? (
            <PageSpinner />
          ) : quotes.data.length === 0 ? (
            <EmptyState title="Aucune demande de devis" description="Les demandes envoyées depuis la page « Devis pro » apparaîtront ici." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {quotes.data.map((q) => (
                <li key={q.id}>
                  <button
                    onClick={() => open(q)}
                    className={`flex w-full flex-col items-start gap-1 px-5 py-3.5 text-left transition hover:bg-blue-frost ${selected?.id === q.id ? "bg-blue-frost" : ""}`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className={`text-sm ${q.status === "new" ? "font-bold text-blue-deep" : "font-medium text-gray-800"}`}>{q.company_name}</span>
                      <span className={`badge shrink-0 whitespace-nowrap ${QUOTE_STATUS_STYLES[q.status]}`}>{QUOTE_STATUS_LABELS[q.status]}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {q.reference} · {companyTypeLabel(q.company_type)} · {q.items_count} produit(s)
                    </span>
                    <span className="text-[10px] text-gray-400">{formatDate(q.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div id="detail-devis" className="scroll-mt-20 rounded-[18px] bg-white p-6 shadow-soft">
          {!selected ? (
            <p className="text-sm text-gray-400">Sélectionnez une demande pour la traiter.</p>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-bold text-blue-deep">{selected.company_name}</p>
                  <p className="text-xs text-gray-500">
                    {selected.reference} · {companyTypeLabel(selected.company_type)}
                    {selected.ninea ? ` · NINEA ${selected.ninea}` : ""}
                  </p>
                </div>
                <span className={`badge ${QUOTE_STATUS_STYLES[selected.status]}`}>{QUOTE_STATUS_LABELS[selected.status]}</span>
              </div>

              <div className="mt-4 rounded-xl bg-blue-frost p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">{selected.contact_name}</p>
                <p>
                  <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Votre devis ${selected.reference} — KamalPharMédis`)}`} className="text-blue-main hover:underline">
                    {selected.email}
                  </a>{" "}
                  ·{" "}
                  <a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="text-blue-main hover:underline">{selected.phone}</a>
                </p>
                <p>{selected.city}{selected.needed_by ? ` · souhaité avant le ${formatDate(selected.needed_by)}` : ""}</p>
                {selected.user && <p className="mt-1 text-xs text-gray-500">Compte client : {selected.user.name}</p>}
              </div>

              <h3 className="mt-5 text-sm font-bold text-gray-900">Produits demandés</h3>
              <ul className="mt-2 divide-y divide-gray-100 text-sm">
                {selected.items.map((i) => (
                  <li key={i.id} className="flex items-start justify-between gap-3 py-2">
                    <div>
                      {i.product ? (
                        <Link href={`/produits/${i.product.slug}`} target="_blank" className="font-medium text-gray-900 hover:text-blue-main hover:underline">
                          {i.product_name}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900">{i.product_name} <span className="badge bg-amber-50 text-amber-700">hors catalogue</span></span>
                      )}
                      {i.product && (
                        <p className="text-[11px] text-gray-500">
                          {formatPrice(i.product.price)} l&apos;unité · stock {i.product.stock}
                          {i.product.stock < i.quantity ? " ⚠️ insuffisant" : ""}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-semibold">× {i.quantity}</span>
                  </li>
                ))}
              </ul>
              {estimated > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Total au prix public (produits du catalogue) : <strong>{formatPrice(estimated)}</strong>
                </p>
              )}
              {selected.message && (
                <p className="mt-4 whitespace-pre-line rounded-xl border border-gray-100 p-3 text-sm text-gray-700">{selected.message}</p>
              )}

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Statut</label>
                    <select className="input-field" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as QuoteStatus })}>
                      {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((s) => (
                        <option key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Montant proposé (FCFA)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input-field"
                      placeholder="Ex : 250000"
                      value={edit.quoted_total}
                      onChange={(e) => setEdit({ ...edit, quoted_total: e.target.value.replace(/[^0-9]/g, "") })}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Notes internes (non visibles par le client)</label>
                  <textarea rows={3} className="input-field resize-none" value={edit.admin_notes} onChange={(e) => setEdit({ ...edit, admin_notes: e.target.value })} />
                </div>
                {message && <p className="rounded-lg bg-green-pale px-3 py-2 text-sm text-green-dark">{message}</p>}
                <button onClick={save} disabled={saving} className="btn-primary w-full">
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {quotes && quotes.last_page > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: quotes.last_page }).map((_, i) => (
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
