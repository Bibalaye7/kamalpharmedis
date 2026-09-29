"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatPrice, formatDate } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS, ORDER_STATUS_STYLES } from "@/lib/orderStatus";
import { PageSpinner } from "@/components/ui/Spinner";
import { paymentMethodLabel } from "@/lib/payment";

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  function load() {
    api.get<Order>(`/admin/orders/${id}`).then(setOrder);
  }

  useEffect(load, [id]);

  if (!order) return <PageSpinner />;

  async function handleStatusChange(status: OrderStatus) {
    setUpdating(true);
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      load();
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } finally {
      setUpdating(false);
    }
  }

  async function handlePaymentToggle() {
    if (!order) return;
    setUpdating(true);
    try {
      await api.patch(`/admin/orders/${id}/status`, { payment_status: order.payment_status === "paid" ? "unpaid" : "paid" });
      load();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <Link href="/admin/commandes" className="text-sm text-blue-main hover:underline">← Retour aux commandes</Link>

      <div className="mt-3 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-[18px] bg-white p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-blue-deep">{order.reference} · Détail</p>
            <span className={`badge ${ORDER_STATUS_STYLES[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
          </div>
          <p className="mt-3 text-sm font-bold text-gray-900">{order.user?.name}</p>
          <p className="text-xs text-gray-500">{order.shipping_phone} · {formatDate(order.created_at)}</p>

          <hr className="my-4 border-gray-100" />
          <p className="text-xs font-bold text-gray-900">Produits commandés</p>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-blue-frost p-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{item.product_name} ×{item.quantity}</p>
                  <p className="text-xs text-gray-500">{formatPrice(item.unit_price)} / unité</p>
                </div>
                <p className="font-bold text-blue-deep">{formatPrice(item.total)}</p>
              </div>
            ))}
          </div>

          <hr className="my-4 border-gray-100" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600"><span>Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Livraison</span><span>{order.shipping_fee === 0 ? "Gratuite" : formatPrice(order.shipping_fee)}</span></div>
            <div className="flex justify-between text-base font-bold text-blue-deep"><span>TOTAL</span><span>{formatPrice(order.total)}</span></div>
          </div>

          <hr className="my-4 border-gray-100" />
          <p className="text-xs font-bold text-gray-900">Livraison</p>
          <p className="mt-2 text-sm text-gray-600">{order.shipping_address}, {order.shipping_city}</p>
          {order.notes && <p className="mt-2 rounded-lg bg-blue-frost p-3 text-xs text-gray-500">{order.notes}</p>}
        </div>

        <div className="space-y-5">
          {savedMessage && (
            <div className="rounded-2xl bg-green-pale p-3.5 text-center text-sm font-semibold text-green-dark shadow-soft">
              ✅ Statut mis à jour avec succès !
            </div>
          )}

          <div className="rounded-[18px] bg-white p-5 shadow-soft">
            <p className="text-sm font-bold text-gray-900">Changer le statut</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ORDER_STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  disabled={updating || order.status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`rounded-[10px] border px-3 py-2 text-xs font-semibold transition ${
                    order.status === s ? "border-blue-main bg-blue-main text-white" : "border-gray-200 text-gray-600 hover:border-blue-main"
                  }`}
                >
                  {ORDER_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] bg-white p-5 shadow-soft">
            <p className="text-sm font-bold text-gray-900">Paiement</p>
            <p className="mt-2 text-sm text-gray-600">{paymentMethodLabel(order.payment_method)}</p>
            <p className="mt-1 text-sm text-gray-600">
              Statut : <span className="font-medium">{order.payment_status === "paid" ? "Payé" : "Non payé"}</span>
            </p>
            {order.payment_reference && (
              <div className={`mt-3 rounded-xl p-3 text-sm ${order.payment_status === "paid" ? "bg-green-pale text-green-dark" : "bg-amber-50 text-amber-800"}`}>
                <p className="font-semibold">{order.payment_status === "paid" ? "Transfert vérifié" : "⏳ Transfert déclaré par le client"}</p>
                <p className="mt-0.5 text-[13px]">
                  Transaction <strong className="break-all">{order.payment_reference}</strong>
                  {order.payment_declared_at ? ` · le ${formatDate(order.payment_declared_at)}` : ""}
                </p>
                {order.payment_status !== "paid" && (
                  <p className="mt-1 text-xs">Vérifiez sur votre téléphone Wave / Orange Money la réception de {formatPrice(order.total)}, puis marquez la commande payée.</p>
                )}
              </div>
            )}
            <button onClick={handlePaymentToggle} disabled={updating} className="mt-3 w-full rounded-[13px] bg-blue-frost py-2.5 text-sm font-semibold text-blue-main">
              Marquer comme {order.payment_status === "paid" ? "non payé" : "payé"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
