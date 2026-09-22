"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, formatPrice, formatDate } from "@/lib/api";
import { AdminStats } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/orderStatus";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";

const STAT_CARDS = [
  { key: "revenue", label: "Chiffre d'affaires", icon: "💰", bg: "bg-blue-mist", format: true },
  { key: "orders", label: "Commandes totales", icon: "📦", bg: "bg-green-pale", format: false },
  { key: "products", label: "Produits catalogue", icon: "🏷️", bg: "bg-[#FFF2E0]", format: false },
  { key: "clients", label: "Clients actifs", icon: "👥", bg: "bg-[#F2E8FF]", format: false },
] as const;

const QUICK_ACTIONS = [
  { icon: "➕", bg: "bg-blue-mist", label: "Ajouter produit", href: "/admin/produits" },
  { icon: "📋", bg: "bg-green-pale", label: "Voir commandes", href: "/admin/commandes" },
  { icon: "👥", bg: "bg-[#FFF2E0]", label: "Gérer clients", href: "/admin/utilisateurs" },
  { icon: "📊", bg: "bg-[#F2E8FF]", label: "Statistiques", href: "/admin" },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.get<AdminStats>("/admin/stats").then(setStats);
  }, []);

  if (!stats) return <PageSpinner />;

  const maxRevenue = Math.max(...stats.monthly.map((m) => m.revenue), 1);

  return (
    <div className="space-y-5">
      <div className="rounded-[18px] bg-blue-main p-6 text-white shadow-lifted">
        <p className="text-xl font-bold">Bonjour, {user?.name.split(" ")[0]} 👋</p>
        <p className="mt-1 text-[13px] text-[#CCE0FF]">Aperçu des activités KamalPharMédis aujourd&apos;hui.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="rounded-2xl bg-white p-4 shadow-soft">
            <span className={`flex h-12 w-12 items-center justify-center rounded-[13px] text-xl ${card.bg}`}>{card.icon}</span>
            <p className="mt-3 text-xl font-bold text-gray-900">
              {card.format ? formatPrice(stats.totals[card.key]) : stats.totals[card.key]}
            </p>
            <p className="mt-1 text-[11px] text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="rounded-[18px] bg-white p-5 shadow-soft lg:col-span-3">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-blue-deep">Commandes récentes</p>
            <Link href="/admin/commandes" className="text-xs font-semibold text-blue-main hover:underline">Voir tout →</Link>
          </div>
          <div className="mt-4 space-y-2">
            {stats.recent_orders.map((order, i) => (
              <button
                key={order.id}
                onClick={() => router.push(`/admin/commandes/${order.id}`)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition hover:bg-blue-frost ${i % 2 === 1 ? "bg-blue-frost" : "bg-white"}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-main text-xs font-bold text-white">
                  {order.user?.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{order.user?.name}</p>
                  <p className="text-[10px] text-gray-500">{order.reference}</p>
                </div>
                <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                <span className={`badge ${ORDER_STATUS_STYLES[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] bg-white p-5 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-blue-deep">Produits populaires</p>
            <Link href="/admin/produits" className="text-xs font-semibold text-blue-main hover:underline">Gérer →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {stats.top_products.length === 0 && <p className="text-sm text-gray-400">Aucune vente pour le moment.</p>}
            {stats.top_products.map((p, i) => (
              <div key={p.product_id ?? i} className="flex items-center gap-2.5 text-sm">
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-blue-mist text-[10px] font-bold text-blue-main">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-800">{p.product_name}</p>
                  <p className="text-[10px] text-gray-400">{p.sold} vendu(s)</p>
                </div>
                <p className="text-xs font-bold text-blue-deep">{formatPrice(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[18px] bg-white p-5 shadow-soft">
        <p className="text-sm font-bold text-blue-deep">Chiffre d&apos;affaires mensuel (FCFA)</p>
        <div className="mt-6 flex h-28 items-end gap-2">
          {stats.monthly.map((m, i) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-20 w-full items-end">
                <div
                  className={`w-full rounded ${i === stats.monthly.length - 1 ? "bg-blue-main" : "bg-blue-mist"}`}
                  style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 6)}%` }}
                  title={formatPrice(m.revenue)}
                />
              </div>
              <span className="text-[9px] text-gray-500">{m.label.charAt(0).toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] bg-white p-5 shadow-soft">
        <p className="text-sm font-bold text-blue-deep">Actions rapides</p>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} href={action.href} className="flex items-center gap-3 rounded-2xl bg-blue-frost p-3.5 transition hover:bg-blue-mist">
              <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-[11px] text-lg ${action.bg}`}>
                {action.icon}
              </span>
              <span className="text-[13px] font-semibold text-gray-900">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {stats.totals.low_stock > 0 && (
        <div className="rounded-[18px] bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 text-sm font-bold text-status-danger">⚠️ Stock faible</p>
          <div className="mt-3 divide-y divide-gray-100">
            {stats.low_stock_products.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <p className="font-medium text-gray-900">{p.name}</p>
                <span className="badge bg-[#FFE5E5] text-status-danger">{p.stock} restant(s)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
