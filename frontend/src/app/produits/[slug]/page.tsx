"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, formatPrice, ApiError } from "@/lib/api";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { PageSpinner } from "@/components/ui/Spinner";
import DeliveryEstimate from "@/components/ui/DeliveryEstimate";
import StarRating from "@/components/ui/StarRating";
import ProductReviews from "@/components/catalog/ProductReviews";

const FEATURES = [
  { icon: "🚚", label: "Livraison rapide" },
  { icon: "✅", label: "Certifié CE" },
  { icon: "↩️", label: "Retour 30j" },
  { icon: "🔒", label: "Paiement sécurisé" },
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get<Product>(`/products/${slug}`, { auth: false })
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageSpinner />;
  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-lg text-gray-500">Produit introuvable.</p>
        <Link href="/catalogue" className="btn-primary mt-6 inline-flex">Retour au catalogue</Link>
      </div>
    );
  }

  async function handleAdd() {
    if (!user) {
      router.push("/connexion?redirect=/catalogue");
      return;
    }
    await addItem(product!.id, quantity);
    setMessage("Produit ajouté au panier !");
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleWishlist() {
    if (!user) {
      router.push("/connexion?redirect=/catalogue");
      return;
    }
    try {
      await api.post("/wishlist", { product_id: product!.id });
      setWishlisted(true);
    } catch (e) {
      if (e instanceof ApiError) setMessage(e.message);
    }
  }

  const images = product.images.length > 0 ? product.images : [null];
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round(100 - (product.price / product.old_price) * 100)
      : null;

  const specs = [
    { label: "SKU", value: product.sku },
    { label: "Catégorie", value: product.category?.name ?? "—" },
    { label: "Stock", value: `${product.stock} unité(s)` },
    { label: "Statut", value: product.is_active ? "Disponible" : "Indisponible" },
  ];

  return (
    <div className="container-page py-8">
      <p className="text-[13px] text-gray-500">
        <Link href="/" className="hover:text-blue-main">Accueil</Link> / <Link href="/catalogue" className="hover:text-blue-main">Produits</Link> / {product.name}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Galerie */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-[24px] bg-white shadow-soft">
            {images[activeImage] ? (
              <Image src={images[activeImage] as string} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[140px]">💊</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 ${
                    activeImage === i ? "border-blue-main bg-blue-mist" : "border-transparent bg-blue-frost"
                  }`}
                >
                  {img ? <Image src={img} alt="" fill className="object-cover" /> : null}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          <h1 className="text-[25px] font-bold text-blue-deep">{product.name}</h1>
          <p className="mt-2 text-[13px] text-gray-500">{product.category?.name} · {product.sku}</p>
          {(product.reviews_count ?? 0) > 0 && (
            <a href="#avis" className="mt-2 inline-flex items-center gap-2 text-[13px] text-gray-600 hover:text-blue-main">
              <StarRating value={product.reviews_avg_rating ?? 0} size="sm" />
              <span>
                {(product.reviews_avg_rating ?? 0).toFixed(1).replace(".", ",")} · {product.reviews_count} avis
              </span>
            </a>
          )}

          <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-blue-mist p-4">
            <span className="text-[26px] font-bold text-blue-deep">{formatPrice(product.price)}</span>
            {product.old_price && product.old_price > product.price && (
              <span className="ml-auto badge bg-green-pale text-green-dark">✅ En stock</span>
            )}
            {!product.old_price && <span className="ml-auto badge bg-green-pale text-green-dark">✅ En stock</span>}
          </div>
          {discount && product.old_price && (
            <p className="mt-2 text-sm text-gray-400 line-through">{formatPrice(product.old_price)}</p>
          )}

          <DeliveryEstimate className="mt-3" />

          {product.short_description && (
            <>
              <p className="mt-6 text-[15px] font-bold text-blue-deep">Description</p>
              <p className="mt-2 text-[13px] leading-relaxed text-gray-600">{product.short_description}</p>
            </>
          )}

          <p className="mt-6 text-[15px] font-bold text-blue-deep">Caractéristiques</p>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {specs.map((spec, i) => (
              <div key={spec.label} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs ${i % 2 === 0 ? "bg-blue-frost" : "bg-white"}`}>
                <span className="font-semibold text-gray-500">{spec.label}</span>
                <span className="font-medium text-gray-900">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex h-[52px] items-center rounded-2xl border border-gray-300 bg-blue-frost">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-full w-11 text-lg font-bold text-gray-500">−</button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="h-full w-11 text-lg font-bold text-blue-main">+</button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="flex h-[52px] flex-1 min-w-[200px] items-center justify-center gap-2 rounded-full bg-blue-main text-[15px] font-semibold text-white shadow-lifted disabled:opacity-40"
            >
              🛒 Ajouter au panier
            </button>
            <button
              onClick={handleWishlist}
              className={`flex h-[52px] items-center gap-2 rounded-2xl border border-gray-300 bg-blue-frost px-5 text-[13px] ${wishlisted ? "text-red-500" : "text-gray-500"}`}
            >
              ♡ Favoris
            </button>
          </div>

          <Link
            href={`/devis?produit=${product.id}`}
            className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-blue-main/40 bg-blue-frost px-4 py-3 text-[13px] text-blue-deep transition hover:border-blue-main"
          >
            <span>🏥 <strong>Professionnel de santé ?</strong> Demandez un devis pour de grandes quantités</span>
            <span className="shrink-0 font-semibold text-blue-main">Devis →</span>
          </Link>

          {message && <p className="mt-4 rounded-lg bg-green-pale px-4 py-2 text-sm text-green-main">{message}</p>}

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-2 rounded-xl bg-blue-frost px-3 py-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-[11px] font-medium text-gray-500">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} productSlug={product.slug} />

      {product.related && product.related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-blue-deep">Produits similaires</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {product.related.map((p) => (
              <Link key={p.id} href={`/produits/${p.slug}`} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-soft transition hover:-translate-y-0.5">
                <div className="relative flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-xl bg-blue-mist">
                  {p.image ? <Image src={p.image} alt={p.name} fill className="rounded-xl object-cover" /> : <span className="text-3xl">💊</span>}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-blue-deep">{p.name}</p>
                  <p className="mt-1 text-xs font-semibold text-blue-main">{formatPrice(p.price)}</p>
                </div>
                <span className="badge bg-blue-mist text-blue-main">Voir →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
