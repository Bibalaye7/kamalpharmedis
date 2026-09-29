"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError, formatPrice } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PaginatedResponse, Product, QuoteRequest } from "@/types";
import { COMPANY_TYPES } from "@/lib/quoteStatus";

interface Line {
  key: number;
  product_id: number | null; // null = produit hors catalogue
  product_name: string;
  quantity: string;
}

const ADVANTAGES = [
  { icon: "💰", title: "Tarifs dégressifs", text: "Prix adaptés aux volumes des établissements de santé." },
  { icon: "🚚", title: "Livraison planifiée", text: "Livraisons programmées selon vos besoins de réapprovisionnement." },
  { icon: "🧾", title: "Facture pro", text: "Devis et factures au nom de votre structure (NINEA)." },
  { icon: "🤝", title: "Interlocuteur dédié", text: "Un conseiller suit votre demande de A à Z." },
];

let nextKey = 1;
const emptyLine = (): Line => ({ key: nextKey++, product_id: null, product_name: "", quantity: "" });

function QuoteForm() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [form, setForm] = useState({
    company_name: "",
    company_type: "clinique",
    ninea: "",
    contact_name: "",
    email: "",
    phone: "",
    city: "",
    needed_by: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    api.get<PaginatedResponse<Product>>("/products?per_page=100&sort=name", { auth: false }).then((res) => {
      setProducts(res.data);
      const pre = Number(searchParams.get("produit"));
      if (pre && res.data.some((p) => p.id === pre)) {
        setLines([{ key: nextKey++, product_id: pre, product_name: "", quantity: "10" }]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client connecté : on pré-remplit ses coordonnées.
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        contact_name: f.contact_name || user.name,
        email: f.email || user.email,
        phone: f.phone || user.phone || "",
      }));
    }
  }, [user]);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  function updateLine(key: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrors({});

    const items = lines
      .filter((l) => (l.product_id || l.product_name.trim()) && Number(l.quantity) > 0)
      .map((l) => ({
        product_id: l.product_id,
        product_name: l.product_id ? undefined : l.product_name.trim(),
        quantity: Number(l.quantity),
      }));

    if (items.length === 0) {
      setError("Ajoutez au moins un produit avec une quantité.");
      return;
    }

    setSending(true);
    try {
      const res = await api.post<{ message: string; quote: QuoteRequest }>("/quotes", {
        ...form,
        ninea: form.ninea || null,
        needed_by: form.needed_by || null,
        message: form.message || null,
        items,
      });
      setSent(res.quote);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors ?? {});
        setError(err.errors ? Object.values(err.errors)[0]?.[0] ?? err.message : err.message);
      } else {
        setError("Impossible d'envoyer la demande. Réessayez.");
      }
    } finally {
      setSending(false);
    }
  }

  const fieldError = (name: string) =>
    errors[name]?.[0] ? <p className="mt-1 text-xs text-status-danger">{errors[name][0]}</p> : null;

  if (sent) {
    return (
      <div className="container-page py-14">
        <div className="mx-auto max-w-xl rounded-[24px] bg-white p-8 text-center shadow-soft">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-pale text-3xl">✅</span>
          <h1 className="mt-5 text-2xl font-bold text-blue-deep">Demande envoyée !</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Votre demande de devis <strong>{sent.reference}</strong> pour <strong>{sent.company_name}</strong> a bien été
            reçue. Notre équipe vous répond sous <strong>24 à 48h ouvrées</strong> à {sent.email} ou au {sent.phone}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {user ? (
              <Link href="/compte/devis" className="btn-primary">Suivre mes devis</Link>
            ) : (
              <Link href="/inscription" className="btn-primary">Créer un compte pour suivre mes devis</Link>
            )}
            <Link href="/catalogue" className="btn-secondary">Retour au catalogue</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#F0F5FF] py-12">
        <div className="container-page text-center">
          <p className="text-[10px] font-bold tracking-wide text-green-main">ESPACE PROFESSIONNEL</p>
          <h1 className="mt-2 text-[30px] font-bold text-blue-deep sm:text-[34px]">Demande de devis</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
            Cliniques, pharmacies, hôpitaux, cabinets : recevez un devis personnalisé pour vos commandes en volume.
          </p>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ADVANTAGES.map((a) => (
            <div key={a.title} className="rounded-[18px] bg-white p-4 shadow-soft">
              <span className="text-2xl">{a.icon}</span>
              <p className="mt-2 text-sm font-bold text-blue-deep">{a.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{a.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            {/* Produits */}
            <div className="rounded-[20px] bg-white p-6 shadow-soft">
              <h2 className="font-bold text-blue-deep">1. Produits souhaités</h2>
              <p className="mt-1 text-xs text-gray-500">Choisissez dans le catalogue, ou décrivez un produit que nous ne proposons pas encore.</p>
              <div className="mt-4 space-y-3">
                {lines.map((line, index) => {
                  const product = line.product_id ? productById.get(line.product_id) : null;
                  return (
                    <div key={line.key} className="rounded-xl border border-gray-200 p-3">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          aria-label={`Produit ${index + 1}`}
                          className="input-field sm:flex-1"
                          value={line.product_id ?? "autre"}
                          onChange={(e) =>
                            updateLine(line.key, {
                              product_id: e.target.value === "autre" ? null : Number(e.target.value),
                              product_name: "",
                            })
                          }
                        >
                          <option value="autre">— Produit hors catalogue —</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          inputMode="numeric"
                          aria-label={`Quantité ${index + 1}`}
                          placeholder="Quantité"
                          className="input-field sm:w-32"
                          value={line.quantity}
                          onChange={(e) => updateLine(line.key, { quantity: e.target.value.replace(/[^0-9]/g, "") })}
                        />
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))}
                            aria-label="Retirer ce produit"
                            className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-xl bg-[#FFE5E5] text-status-danger sm:self-auto"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {!line.product_id && (
                        <input
                          type="text"
                          placeholder="Nom et caractéristiques du produit (ex. gants nitrile taille M, boîte de 100)"
                          className="input-field mt-2"
                          value={line.product_name}
                          onChange={(e) => updateLine(line.key, { product_name: e.target.value })}
                        />
                      )}
                      {product && (
                        <p className="mt-2 text-[11px] text-gray-500">
                          Prix unitaire public : {formatPrice(product.price)} — le devis tiendra compte des quantités.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {lines.length < 50 && (
                <button
                  type="button"
                  onClick={() => setLines((ls) => [...ls, emptyLine()])}
                  className="mt-3 text-sm font-semibold text-blue-main hover:underline"
                >
                  + Ajouter un produit
                </button>
              )}
            </div>

            <div className="rounded-[20px] bg-white p-6 shadow-soft">
              <h2 className="font-bold text-blue-deep">2. Précisions (facultatif)</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Date de livraison souhaitée</label>
                  <input
                    type="date"
                    className="input-field"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.needed_by}
                    onChange={(e) => setForm({ ...form, needed_by: e.target.value })}
                  />
                  {fieldError("needed_by")}
                </div>
              </div>
              <label className="mb-1.5 mt-4 block text-xs font-semibold text-gray-900">Message</label>
              <textarea
                rows={4}
                maxLength={3000}
                className="input-field resize-none"
                placeholder="Fréquence de commande, contraintes de livraison, marques souhaitées..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-[20px] bg-white p-6 shadow-soft lg:sticky lg:top-24">
              <h2 className="font-bold text-blue-deep">3. Votre établissement</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Nom de l&apos;établissement *</label>
                  <input required className="input-field" placeholder="Clinique ..., Pharmacie ..." value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                  {fieldError("company_name")}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-900">Type *</label>
                    <select className="input-field" value={form.company_type} onChange={(e) => setForm({ ...form, company_type: e.target.value })}>
                      {COMPANY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-900">NINEA (facultatif)</label>
                    <input className="input-field" value={form.ninea} onChange={(e) => setForm({ ...form, ninea: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Nom du contact *</label>
                  <input required className="input-field" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                  {fieldError("contact_name")}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-900">Email *</label>
                  <input required type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {fieldError("email")}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-900">Téléphone *</label>
                    <input required className="input-field" placeholder="+221 ..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    {fieldError("phone")}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-900">Ville *</label>
                    <input required className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    {fieldError("city")}
                  </div>
                </div>
              </div>

              {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={sending} className="btn-primary mt-6 w-full">
                {sending ? "Envoi..." : "Envoyer ma demande de devis"}
              </button>
              <p className="mt-3 text-center text-[11px] text-gray-500">Réponse sous 24 à 48h ouvrées · Sans engagement</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense>
      <QuoteForm />
    </Suspense>
  );
}
