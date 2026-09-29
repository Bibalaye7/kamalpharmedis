"use client";

import { FormEvent, useState } from "react";
import { api, ApiError, formatDate, formatPrice } from "@/lib/api";
import { PaymentConfig } from "@/lib/payment";
import { Order } from "@/types";

/** Instructions de transfert Wave / Orange Money + déclaration de l'identifiant de transaction. */
export default function ManualPaymentBox({ order, config, onUpdated }: { order: Order; config: PaymentConfig; onUpdated: (order: Order) => void }) {
  const [reference, setReference] = useState("");
  const [editing, setEditing] = useState(!order.payment_reference);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const updated = await api.post<Order>(`/orders/${order.id}/payment-proof`, { payment_reference: reference });
      onUpdated(updated);
      setEditing(false);
      setReference("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Envoi impossible, réessayez.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 space-y-3 text-sm">
      <div className="rounded-xl bg-blue-frost p-4 text-gray-700">
        <p className="font-semibold text-blue-deep">Payer par transfert</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[13px]">
          <li>
            Envoyez <strong>{formatPrice(order.total)}</strong> à <strong>{config.manual.account_name}</strong> :
            <ul className="mt-1 space-y-0.5">
              <li>🌊 Wave : <strong className="whitespace-nowrap">{config.manual.wave}</strong></li>
              <li>🟠 Orange Money : <strong className="whitespace-nowrap">{config.manual.orange_money}</strong></li>
            </ul>
          </li>
          <li>Indiquez la référence <strong>{order.reference}</strong> dans le motif si possible.</li>
          <li>Saisissez ci-dessous l&apos;identifiant de la transaction reçu par SMS.</li>
        </ol>
      </div>

      {order.payment_reference && !editing ? (
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800">
          <p className="font-semibold">⏳ Paiement déclaré, en cours de vérification</p>
          <p className="mt-1 text-[13px]">
            Transaction <strong>{order.payment_reference}</strong>
            {order.payment_declared_at ? ` · le ${formatDate(order.payment_declared_at)}` : ""}
          </p>
          <button onClick={() => setEditing(true)} className="mt-2 text-xs font-semibold text-blue-main hover:underline">
            Corriger l&apos;identifiant
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <label htmlFor="payment-reference" className="block text-xs font-semibold text-gray-700">
            Identifiant de la transaction
          </label>
          <input
            id="payment-reference"
            className="input-field"
            placeholder="Ex : MP240928.1234.A56789"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
            minLength={4}
            maxLength={60}
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? "Envoi..." : "J'ai payé, envoyer"}
          </button>
        </form>
      )}
    </div>
  );
}
