"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/api";
import EmptyState from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import DeliveryEstimate from "@/components/ui/DeliveryEstimate";

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) return <PageSpinner />;

  if (!user) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Connectez-vous pour voir votre panier"
          description="Votre panier est associé à votre compte KamalPharMédis."
          actionLabel="Se connecter"
          actionHref="/connexion?redirect=/panier"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold text-blue-deep">Mon panier</h1>

      {loading ? (
        <PageSpinner />
      ) : cart.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Votre panier est vide"
            description="Parcourez notre catalogue pour trouver vos produits de santé."
            actionLabel="Voir le catalogue"
            actionHref="/catalogue"
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div key={item.id} className="card flex items-center gap-4 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-green-pale/40">
                  {item.product.image ? (
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">💊</div>
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/produits/${item.product.slug}`} className="font-semibold text-gray-900 hover:text-blue-main">
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex items-center rounded-full border border-gray-300">
                  <button
                    onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                    className="flex h-9 w-9 items-center justify-center text-gray-600"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item.id, Math.min(item.product.stock, item.quantity + 1))}
                    className="flex h-9 w-9 items-center justify-center text-gray-600"
                  >
                    +
                  </button>
                </div>
                <p className="w-24 text-right font-semibold text-blue-deep">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="card h-fit p-6">
            <h2 className="font-semibold text-gray-900">Récapitulatif</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>{cart.shipping_fee === 0 ? "Gratuite" : formatPrice(cart.shipping_fee)}</span>
              </div>
              {cart.shipping_fee > 0 && (
                <p className="text-xs text-green-main">
                  Plus que {formatPrice(cart.free_shipping_threshold - cart.subtotal)} pour la livraison gratuite !
                </p>
              )}
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold text-blue-deep">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
            <DeliveryEstimate className="mt-3 rounded-lg bg-blue-frost px-3 py-2.5" />
            <button onClick={() => router.push("/panier/commande")} className="btn-primary mt-4 w-full">
              Passer la commande
            </button>
            <Link href="/catalogue" className="mt-3 block text-center text-sm text-blue-main hover:underline">
              Continuer mes achats
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
