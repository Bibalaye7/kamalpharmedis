"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError, formatPrice, formatDate } from "@/lib/api";
import { Order } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/orderStatus";
import { PageSpinner } from "@/components/ui/Spinner";
import ManualPaymentBox from "@/components/account/ManualPaymentBox";
import { getPaymentConfig, PaymentConfig, paymentMethodLabel } from "@/lib/payment";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<Order>(`/orders/${id}`).then(setOrder);
  }

  useEffect(load, [id]);

  useEffect(() => {
    getPaymentConfig().then(setPaymentConfig).catch(() => {});
  }, []);

  // Retour depuis PayDunya : on vérifie le vrai statut auprès du serveur (jamais l'URL seule).
  useEffect(() => {
    if (searchParams.get("paiement") === "retour") {
      api.get<{ payment_status: string }>(`/orders/${id}/pay/status`).finally(load);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!order) return <PageSpinner />;

  async function handlePay() {
    setPaying(true);
    setError(null);
    try {
      const { payment_url } = await api.post<{ payment_url: string }>(`/orders/${id}/pay`);
      window.location.href = payment_url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Le paiement en ligne n'est pas disponible pour le moment.");
      setPaying(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Confirmer l'annulation de cette commande ?")) return;
    setCancelling(true);
    setError(null);
    try {
      await api.post(`/orders/${id}/cancel`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'annuler la commande.");
    } finally {
      setCancelling(false);
    }
  }

  const canCancel = ["pending", "confirmed"].includes(order.status);
  const awaitingPayment = order.payment_status !== "paid" && order.status !== "cancelled";
  const canPayOnline = awaitingPayment && paymentConfig?.online && ["mobile_money", "card"].includes(order.payment_method);
  const canPayManually = awaitingPayment && paymentConfig && !paymentConfig.online && order.payment_method === "mobile_money";

  return (
    <div>
      {searchParams.get("success") && (
        <div className="mb-6 rounded-lg bg-green-pale px-4 py-3 text-sm text-green-main">
          🎉 Votre commande a été enregistrée avec succès !
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-deep">Commande {order.reference}</h1>
          <p className="text-sm text-gray-500">Passée le {formatDate(order.created_at)}</p>
        </div>
        <span className={`badge ${ORDER_STATUS_STYLES[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-gray-900">Articles</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-gray-500">{formatPrice(item.unit_price)} × {item.quantity}</p>
                  {order.status === "delivered" &&
                    (item.product?.slug ? (
                      <Link href={`/produits/${item.product.slug}#avis`} className="mt-1 inline-block text-xs font-semibold text-blue-main hover:underline">
                        ⭐ Donner mon avis
                      </Link>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">Produit retiré du catalogue : avis indisponible</p>
                    ))}
                </div>
                <p className="font-semibold text-blue-deep">{formatPrice(item.total)}</p>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600"><span>Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Livraison</span><span>{order.shipping_fee === 0 ? "Gratuite" : formatPrice(order.shipping_fee)}</span></div>
            <div className="flex justify-between text-lg font-bold text-blue-deep"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900">Livraison</h2>
            <p className="mt-2 text-sm text-gray-600">{order.shipping_name}</p>
            <p className="text-sm text-gray-600">{order.shipping_address}, {order.shipping_city}</p>
            <p className="text-sm text-gray-600">{order.shipping_phone}</p>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900">Paiement</h2>
            <p className="mt-2 text-sm text-gray-600">{paymentMethodLabel(order.payment_method)}</p>
            <p className="mt-1 text-sm text-gray-600">
              Statut :{" "}
              <span className={`font-medium ${order.payment_status === "paid" ? "text-green-main" : "text-status-danger"}`}>
                {order.payment_status === "paid" ? "✅ Payé" : "Non payé"}
              </span>
            </p>
            {canPayOnline && (
              <button onClick={handlePay} disabled={paying} className="btn-primary mt-4 w-full">
                {paying ? "Redirection..." : "Payer maintenant"}
              </button>
            )}
            {canPayManually && paymentConfig && <ManualPaymentBox order={order} config={paymentConfig} onUpdated={(o) => setOrder({ ...order, ...o })} />}
            {awaitingPayment && order.payment_method === "cash_on_delivery" && (
              <p className="mt-3 text-xs text-gray-500">Vous réglez en espèces ou par Wave / Orange Money au livreur.</p>
            )}
          </div>
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling} className="btn-secondary w-full !border-red-400 !text-red-500 hover:!bg-red-500 hover:!text-white">
              {cancelling ? "Annulation..." : "Annuler la commande"}
            </button>
          )}
          <Link href="/compte/commandes" className="block text-center text-sm text-blue-main hover:underline">
            ← Retour à mes commandes
          </Link>
        </div>
      </div>
    </div>
  );
}
