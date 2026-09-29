"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatPrice, formatDate, ApiError } from "@/lib/api";
import { Order, PaginatedResponse } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/orderStatus";
import { PageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";

const TABS = [
  { key: "all", label: "Toutes" },
  { key: "ongoing", label: "En cours" },
  { key: "delivered", label: "Livrées" },
  { key: "cancelled", label: "Annulées" },
] as const;

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [reordering, setReordering] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<PaginatedResponse<Order>>("/orders?per_page=50").then((res) => setOrders(res.data));
  }, []);

  if (orders === null) return <PageSpinner />;

  const filtered = orders.filter((o) => {
    if (tab === "all") return true;
    if (tab === "delivered") return o.status === "delivered";
    if (tab === "cancelled") return o.status === "cancelled";
    return !["delivered", "cancelled"].includes(o.status);
  });

  const counts = {
    all: orders.length,
    ongoing: orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  async function handleReorder(order: Order) {
    setReordering(order.id);
    setError(null);
    try {
      const items = order.items.filter((i) => i.product_id).map((i) => ({ product_id: i.product_id as number, quantity: i.quantity }));
      await api.post("/orders", {
        shipping_name: order.shipping_name,
        shipping_phone: order.shipping_phone,
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        payment_method: order.payment_method,
        items,
      });
      router.push("/compte/commandes");
      router.refresh();
      const res = await api.get<PaginatedResponse<Order>>("/orders?per_page=50");
      setOrders(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de recommander : un produit n'est peut-être plus disponible.");
    } finally {
      setReordering(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-deep">Mes commandes</h1>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex h-9 items-center rounded-full px-4 text-xs font-medium transition ${
              tab === t.key ? "bg-blue-main text-white" : "border border-gray-300 bg-white text-gray-600"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5">
        {filtered.length === 0 ? (
          <EmptyState title="Aucune commande" description="Vos commandes apparaîtront ici." actionLabel="Voir le catalogue" actionHref="/catalogue" />
        ) : (
          <>
            {/* Ordinateur / tablette : tableau */}
            <div className="hidden overflow-x-auto rounded-[18px] bg-white shadow-soft md:block">
              <table className="w-full text-sm">
                <thead className="bg-blue-frost text-left text-[11px] font-bold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3.5">Commande</th>
                    <th className="px-4 py-3.5">Produits</th>
                    <th className="px-4 py-3.5">Total</th>
                    <th className="px-4 py-3.5">Statut</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, i) => (
                    <tr key={order.id} className={i % 2 === 1 ? "bg-blue-frost" : "bg-white"}>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <p className="font-semibold text-blue-main">{order.reference}</p>
                        <p className="text-[11px] text-gray-500">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-gray-900">{order.items[0]?.product_name}{order.items.length > 1 ? ` (+${order.items.length - 1})` : ""}</p>
                        <p className="text-[10px] text-gray-500">{order.items.length} article(s)</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-bold text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`badge whitespace-nowrap ${ORDER_STATUS_STYLES[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                        <Link href={`/compte/commandes/${order.id}`} className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-blue-mist px-4 text-xs font-semibold text-blue-main transition hover:bg-blue-main hover:text-white">
                          Voir détail
                        </Link>
                        {order.status === "delivered" && (
                          <button
                            onClick={() => handleReorder(order)}
                            disabled={reordering === order.id}
                            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-green-pale px-4 text-xs font-semibold text-green-dark transition hover:bg-green-main hover:text-white disabled:opacity-50"
                          >
                            {reordering === order.id ? "..." : "Réacheter"}
                          </button>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Téléphone : cartes */}
            <ul className="space-y-3 md:hidden">
              {filtered.map((order) => (
                <li key={order.id} className="rounded-[18px] bg-white p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-blue-main">{order.reference}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`badge shrink-0 whitespace-nowrap ${ORDER_STATUS_STYLES[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-900">
                    {order.items[0]?.product_name}{order.items.length > 1 ? ` (+${order.items.length - 1})` : ""}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-base font-bold text-gray-900">{formatPrice(order.total)}</p>
                    <div className="flex gap-2">
                        <Link href={`/compte/commandes/${order.id}`} className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-blue-mist px-4 text-xs font-semibold text-blue-main transition hover:bg-blue-main hover:text-white">
                          Voir détail
                        </Link>
                        {order.status === "delivered" && (
                          <button
                            onClick={() => handleReorder(order)}
                            disabled={reordering === order.id}
                            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-green-pale px-4 text-xs font-semibold text-green-dark transition hover:bg-green-main hover:text-white disabled:opacity-50"
                          >
                            {reordering === order.id ? "..." : "Réacheter"}
                          </button>
                        )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
