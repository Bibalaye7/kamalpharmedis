"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, formatPrice, formatDate } from "@/lib/api";
import { Address, Order, PaginatedResponse, Product } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/orderStatus";
import { PageSpinner } from "@/components/ui/Spinner";

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [wishlist, setWishlist] = useState<Product[] | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);

  useEffect(() => {
    api.get<PaginatedResponse<Order>>("/orders?per_page=3").then((res) => setOrders(res.data));
    api.get<{ data: Product[] }>("/wishlist").then((res) => setWishlist(res.data));
    api.get<{ data: Address[] }>("/addresses").then((res) => setAddresses(res.data));
    api.get<PaginatedResponse<Product>>("/products?per_page=4&sort=name").then((res) => setRecommended(res.data));
  }, []);

  const totalSpent = orders?.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0) ?? 0;

  const stats = [
    { icon: "📦", bg: "bg-blue-mist", value: orders === null ? "—" : String(orders.length), label: "Commandes récentes" },
    { icon: "❤️", bg: "bg-green-pale", value: wishlist === null ? "—" : String(wishlist.length), label: "Produits en favoris" },
    { icon: "💰", bg: "bg-[#FFF2E0]", value: formatPrice(totalSpent), label: "Total dépensé" },
    { icon: "📍", bg: "bg-[#F2E8FF]", value: addresses === null ? "—" : String(addresses.length), label: "Adresses enregistrées" },
  ];

  return (
    <div>
      <div className="rounded-[18px] bg-blue-main p-6 text-white shadow-lifted">
        <p className="text-xl font-bold">Bonjour, {user?.name.split(" ")[0]} 👋</p>
        <p className="mt-1 text-[13px] text-[#CCE0FF]">Bienvenue dans votre espace personnel KamalPharMédis.</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-soft">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${stat.bg}`}>{stat.icon}</span>
            <p className="mt-3 text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-[11px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="rounded-[18px] bg-white p-5 shadow-soft lg:col-span-3">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-blue-deep">Mes commandes récentes</p>
            <Link href="/compte/commandes" className="text-xs font-semibold text-blue-main hover:underline">Voir tout →</Link>
          </div>

          {orders === null ? (
            <PageSpinner />
          ) : orders.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">Vous n&apos;avez pas encore passé de commande.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {orders.map((order, i) => (
                <Link
                  key={order.id}
                  href={`/compte/commandes/${order.id}`}
                  className={`flex items-center gap-3 rounded-xl p-3 text-sm transition hover:bg-blue-frost ${i % 2 === 1 ? "bg-blue-frost" : "bg-white"}`}
                >
                  <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white">
                    {order.reference.charAt(4)}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{order.items[0]?.product_name ?? order.reference}</p>
                    <p className="text-[10px] text-gray-500">{order.reference} · {formatDate(order.created_at)}</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                  <span className={`badge ${ORDER_STATUS_STYLES[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[18px] bg-white p-5 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-blue-deep">Mes produits favoris</p>
            <Link href="/compte/favoris" className="text-xs font-semibold text-blue-main hover:underline">
              Voir tout {wishlist ? `(${wishlist.length})` : ""} →
            </Link>
          </div>

          {wishlist === null ? (
            <PageSpinner />
          ) : wishlist.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">Aucun favori pour le moment.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {wishlist.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center gap-3 rounded-xl p-2">
                  <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg bg-blue-mist">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill className="rounded-lg object-contain p-1.5" />
                    ) : (
                      <span className="text-xl">💊</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs font-bold text-blue-main">{formatPrice(product.price)}</p>
                  </div>
                  <Link href={`/produits/${product.slug}`} className="rounded-lg bg-blue-mist px-3 py-1.5 text-[11px] font-semibold text-blue-main">
                    🛒 Acheter
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="mt-5 rounded-[18px] bg-white p-5 shadow-soft">
          <p className="text-base font-bold text-blue-deep">Recommandé pour vous</p>
          <p className="text-xs text-gray-500">Basé sur nos produits populaires</p>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {recommended.map((product) => (
              <div key={product.id} className="flex items-center gap-3 rounded-2xl bg-blue-frost p-3">
                <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-blue-mist">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="rounded-full object-contain p-1.5" />
                  ) : (
                    <span className="text-xl">💊</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-deep">{product.name}</p>
                  <span className="badge mt-1 bg-blue-mist text-blue-main">{product.category?.name}</span>
                  <p className="mt-1.5 flex items-center justify-between text-[13px] font-bold text-blue-deep">
                    {formatPrice(product.price)}
                    <Link href={`/produits/${product.slug}`} className="rounded-lg bg-blue-main px-3 py-1.5 text-[11px] font-semibold text-white">
                      🛒
                    </Link>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
