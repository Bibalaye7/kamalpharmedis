import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyUs from "@/components/home/WhyUs";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import { serverGet } from "@/lib/serverApi";
import { Category, PaginatedResponse, Product } from "@/types";

// Le backend n'est pas joignable pendant `docker build` (réseau Compose non actif à ce stade) :
// on force le rendu à la requête pour éviter de figer une page d'accueil sans données.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categoriesRes, productsRes] = await Promise.all([
    serverGet<{ data: Category[] }>("/categories"),
    serverGet<PaginatedResponse<Product>>("/products?featured=1&per_page=8"),
  ]);

  const featuredProduct = productsRes?.data?.[0] ?? null;

  return (
    <>
      <Hero featuredProduct={featuredProduct} />
      <Stats />
      <Categories categories={categoriesRes?.data ?? []} />
      <FeaturedProducts products={productsRes?.data ?? []} />
      <WhyUs />
      <Testimonials />
      <CTA />
    </>
  );
}
