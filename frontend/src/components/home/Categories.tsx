import Link from "next/link";
import { Category } from "@/types";
import Reveal from "@/components/ui/Reveal";

const ICONS: Record<string, string> = {
  stethoscope: "🩺",
  pill: "💊",
  leaf: "🌿",
  cross: "🩹",
  shield: "😷",
  syringe: "💉",
  flask: "🧪",
  heart: "🫀",
  tag: "🏷️",
};

// Palette pastel de la maquette Figma, appliquée en cycle aux catégories du catalogue
const COLOR_CYCLE = [
  { bg: "bg-category-blue-bg", text: "text-category-blue-text" },
  { bg: "bg-category-green-bg", text: "text-category-green-text" },
  { bg: "bg-category-purple-bg", text: "text-category-purple-text" },
  { bg: "bg-category-orange-bg", text: "text-category-orange-text" },
  { bg: "bg-category-red-bg", text: "text-category-red-text" },
  { bg: "bg-category-cyan-bg", text: "text-category-cyan-text" },
];

export default function Categories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="section bg-white !py-14">
      <Reveal>
        <p className="text-[26px] font-bold text-blue-deep">Parcourir par catégorie</p>
        <p className="mt-1 text-[13px] text-gray-500">Trouvez rapidement ce dont vous avez besoin</p>
      </Reveal>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category, i) => {
          const color = COLOR_CYCLE[i % COLOR_CYCLE.length];
          return (
            <Reveal key={category.id} delay={(i % 6) * 80}>
              <Link
                href={`/catalogue?category=${category.slug}`}
                className={`group flex h-full flex-col rounded-[18px] p-4 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lifted ${color.bg}`}
              >
                <span className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-white text-2xl shadow-soft transition group-hover:scale-110 group-hover:animate-wiggle">
                  {ICONS[category.icon ?? ""] ?? "🏥"}
                </span>
                <span className={`mt-4 text-[13px] font-bold ${color.text}`}>{category.name}</span>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-[10px] ${color.text}`}>
                    {typeof category.products_count === "number" ? `${category.products_count} produits` : ""}
                  </span>
                  <span className={`text-sm font-semibold ${color.text} transition group-hover:translate-x-1`}>→</span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
