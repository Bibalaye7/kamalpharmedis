"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatPrice, formatDate } from "@/lib/api";
import { Order, OrderStatus, PaginatedResponse } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS, ORDER_STATUS_STYLES } from "@/lib/orderStatus";
import { PageSpinner } from "@/components/ui/Spinner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<PaginatedResponse<Order> | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  function load() {
    const params = new URLSearchParams({ page: String(page), per_page: "10" });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    api.get<PaginatedResponse<Order>>(`/admin/orders?${params.toString()}`).then(setOrders);
  }

  useEffect(load, [status, search, page]);

  useEffect(() => {
    // Récupère les compteurs par statut pour les onglets (une seule requête large)
    api.get<PaginatedResponse<Order>>("/admin/orders?per_page=100").then((res) => {
      const c: Record<string, number> = {};
      res.data.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
      setCounts(c);
    });
  }, []);

  const tabs: { value: OrderStatus | ""; label: string }[] = [
    { value: "", label: "Toutes" },
    { value: "pending", label: `En attente (${counts.pending ?? 0})` },
    { value: "confirmed", label: `Confirmées (${counts.confirmed ?? 0})` },
    { value: "delivered", label: `Livrées (${counts.delivered ?? 0})` },
    { value: "cancelled", label: `Annulées (${counts.cancelled ?? 0})` },
  ];

  return (
    <div>
      <input
        placeholder="🔍 Rechercher (référence, client...)"
        className="input-field max-w-sm"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="mt-4 flex flex-wrap gap-2.5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`flex h-9 items-center rounded-full px-4 text-xs font-medium transition ${
              status === tab.value ? "bg-blue-main text-white" : "border border-gray-300 bg-white text-gray-600 hover:border-blue-main"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <select value={status} onChange={(e) => { setStatus(e.target.value as OrderStatus | ""); setPage(1); }} className="input-field ml-auto w-auto !rounded-full">
          <option value="">Tous les statuts</option>
          {ORDER_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[18px] bg-white shadow-soft">
        {!orders ? (
          <PageSpinner />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-blue-frost text-left text-[11px] font-bold uppercase text-gray-500">
              <tr>
                <th className="px-2 py-3.5 sm:px-5">ID</th>
                <th className="hidden px-5 py-3.5 md:table-cell">Client</th>
                <th className="hidden px-5 py-3.5 lg:table-cell">Produits</th>
                <th className="px-2 py-3.5 sm:px-5">Total</th>
                <th className="hidden px-5 py-3.5 md:table-cell">Date</th>
                <th className="px-2 py-3.5 sm:px-5">Statut</th>
                <th className="px-2 py-3.5 text-right sm:px-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.map((order, i) => (
                <tr key={order.id} className={i % 2 === 1 ? "bg-blue-frost" : "bg-white"}>
                  <td className="px-2 py-3.5 sm:px-5">
                    <p className="text-xs font-semibold text-blue-main sm:text-sm">{order.reference}</p>
                    <p className="mt-0.5 truncate text-[11px] text-gray-500 md:hidden">{order.user?.name}</p>
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-main text-[11px] font-bold text-white">
                        {order.user?.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold text-gray-900">{order.user?.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-gray-500 lg:table-cell">
                    {order.items[0]?.product_name}
                    {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3.5 text-xs font-bold text-gray-900 sm:px-5 sm:text-sm">{formatPrice(order.total)}</td>
                  <td className="hidden px-5 py-3.5 text-gray-500 md:table-cell">{formatDate(order.created_at)}</td>
                  <td className="px-2 py-3.5 sm:px-5">
                    <span className={`badge ${ORDER_STATUS_STYLES[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                  </td>
                  <td className="px-2 py-3.5 text-right sm:px-5">
                    <Link href={`/admin/commandes/${order.id}`} className="badge bg-blue-mist text-blue-main">Voir</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {orders && orders.last_page > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: orders.last_page }).map((_, i) => (
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
