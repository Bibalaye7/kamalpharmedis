import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { PublicStats } from "@/types";

/** Vrais avis laissés sur le site par des clients ayant reçu le produit (aucun avis inventé). */
export default function Testimonials({ testimonials }: { testimonials: PublicStats["testimonials"] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="section bg-white !py-14">
      <Reveal>
        <p className="text-[28px] font-bold text-blue-deep">Ce que disent nos clients</p>
        <p className="mt-1 text-[13px] text-gray-500">Avis laissés sur le site par des clients ayant reçu leur commande</p>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial, i) => (
          <Reveal key={`${testimonial.author}-${i}`} delay={i * 110} className="relative overflow-hidden rounded-[20px] bg-white p-5 pl-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lifted">
            <div className="absolute left-0 top-5 h-[180px] w-1.5 rounded-full bg-blue-main" />
            <p className="text-[38px] font-extrabold leading-none text-blue-mist">&ldquo;</p>
            <p className="-mt-2 text-xs leading-relaxed text-gray-800">{testimonial.comment}</p>
            <hr className="mt-5 border-gray-100" />
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white">
                {testimonial.author.charAt(0).toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900">{testimonial.author}</p>
                {testimonial.product.slug && (
                  <Link href={`/produits/${testimonial.product.slug}`} className="line-clamp-1 text-[10px] text-blue-main hover:underline">
                    {testimonial.product.name}
                  </Link>
                )}
              </div>
              <span className="text-[11px] text-amber-400" aria-label={`${testimonial.rating} étoiles sur 5`}>{"⭐".repeat(testimonial.rating)}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
