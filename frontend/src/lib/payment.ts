import { api } from "@/lib/api";

export interface PaymentConfig {
  /** Paiement en ligne PayDunya actif (sinon : transfert Wave / Orange Money manuel). */
  online: boolean;
  methods: string[];
  manual: { account_name: string; wave: string; orange_money: string };
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: "💵 Paiement à la livraison",
  mobile_money: "📱 Wave / Orange Money",
  card: "💳 Carte bancaire",
  bank_transfer: "🏦 Virement bancaire",
};

export const paymentMethodLabel = (method: string) => PAYMENT_METHOD_LABELS[method] ?? method;

let cached: Promise<PaymentConfig> | null = null;

export function getPaymentConfig(): Promise<PaymentConfig> {
  cached ??= api.get<PaymentConfig>("/payments/config").catch((err) => {
    cached = null;
    throw err;
  });
  return cached;
}
