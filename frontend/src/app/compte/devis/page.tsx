"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatDate, formatPrice } from "@/lib/api";
import { QuoteRequest } from "@/types";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_STYLES, companyTypeLabel } from "@/lib/quoteStatus";
import { PageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

export default function MyQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[] | null>(null);

  useEffect(() => {
    api.get<{ data: QuoteRequest[] }>("/quotes").then((res) => setQuotes(res.data));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-blue-deep">Mes devis</h1>
        <Link href="/devis" className="btn-primary">+ Nouvelle demande</Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">Suivez vos demandes de devis professionnels.</p>

      <div className="mt-5">
        {!quotes ? (
          <PageSpinner />
        ) : quotes.length === 0 ? (
          <EmptyState
            title="Aucune demande de devis"
            description="Vous êtes une clinique, une pharmacie ou un cabinet ? Demandez un devis pour vos commandes en volume."
            actionLabel="Demander un devis"
            actionHref="/devis"
          />
        ) : (
          <ul className="space-y-4">
            {quotes.map((q) => (
              <li key={q.id} className="rounded-[18px] bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-blue-main">{q.reference}</p>
                    <p className="text-xs text-gray-500">
                      {q.company_name} · {companyTypeLabel(q.company_type)} · {formatDate(q.created_at)}
                    </p>
                  </div>
                  <span className={`badge whitespace-nowrap ${QUOTE_STATUS_STYLES[q.status]}`}>{QUOTE_STATUS_LABELS[q.status]}</span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                  {q.items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3">
                      <span>{i.product_name}</span>
                      <span className="shrink-0 font-medium">× {i.quantity}</span>
                    </li>
                  ))}
                </ul>
                {q.quoted_total !== null && (
                  <p className="mt-3 rounded-lg bg-green-pale px-3 py-2 text-sm text-green-dark">
                    Montant proposé : <strong>{formatPrice(q.quoted_total)}</strong>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
