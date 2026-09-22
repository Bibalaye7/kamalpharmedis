"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import { useCart } from "@/context/CartContext";
import { api, ApiError, formatPrice } from "@/lib/api";
import { Address, Order } from "@/types";
import EmptyState from "@/components/ui/EmptyState";

const PAYMENT_METHODS = [
  { value: "cash_on_delivery", label: "Paiement à la livraison" },
  { value: "mobile_money", label: "Mobile Money (Orange Money, Wave...)" },
  { value: "card", label: "Carte bancaire" },
  { value: "bank_transfer", label: "Virement bancaire" },
];

function CheckoutContent() {
  const { cart, refresh } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<{ data: Address[] }>("/addresses").then((res) => {
      setAddresses(res.data);
      const defaultAddress = res.data.find((a) => a.is_default) ?? res.data[0];
      if (defaultAddress) setAddressId(defaultAddress.id);
    });
  }, []);

  if (cart.items.length === 0) {
    return (
      <div className="container-page py-20">
        <EmptyState title="Votre panier est vide" actionLabel="Voir le catalogue" actionHref="/catalogue" />
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Ajoutez une adresse de livraison"
          description="Vous devez enregistrer une adresse avant de valider votre commande."
          actionLabel="Ajouter une adresse"
          actionHref="/compte/adresses"
        />
      </div>
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const order = await api.post<Order>("/orders", {
        address_id: addressId,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });
      await refresh();
      router.push(`/compte/commandes/${order.id}?success=1`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de valider la commande.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold text-blue-deep">Finaliser ma commande</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900">Adresse de livraison</h2>
            <div className="mt-4 space-y-3">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                    addressId === address.id ? "border-blue-main bg-blue-main/5" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === address.id}
                    onChange={() => setAddressId(address.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{address.label} — {address.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}
                    </p>
                    <p className="text-sm text-gray-500">{address.phone}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900">Méthode de paiement</h2>
            <div className="mt-4 space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                    paymentMethod === method.value ? "border-blue-main bg-blue-main/5" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                  />
                  <span className="text-sm font-medium text-gray-800">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900">Notes (optionnel)</h2>
            <textarea
              rows={3}
              className="input-field mt-3 resize-none"
              placeholder="Précisions pour la livraison..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="card h-fit p-6">
          <h2 className="font-semibold text-gray-900">Récapitulatif</h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.product.name} × {item.quantity}</span>
                <span>{formatPrice(item.product.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <hr className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>{cart.shipping_fee === 0 ? "Gratuite" : formatPrice(cart.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-blue-deep">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <button onClick={handleSubmit} disabled={loading || !addressId} className="btn-primary mt-6 w-full">
            {loading ? "Validation..." : "Confirmer la commande"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth roles={["client"]}>
      <CheckoutContent />
    </RequireAuth>
  );
}
