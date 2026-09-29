"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/compte", label: "Tableau de bord", icon: "📊" },
  { href: "/compte/commandes", label: "Mes commandes", icon: "📦" },
  { href: "/compte/devis", label: "Mes devis", icon: "🧾" },
  { href: "/compte/favoris", label: "Mes favoris", icon: "❤️" },
  { href: "/compte/profil", label: "Mon profil", icon: "👤" },
  { href: "/compte/adresses", label: "Mes adresses", icon: "📍" },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile / tablette : barre compacte, le contenu démarre tout de suite sous le menu */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-main text-base font-bold text-white">
            {user?.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-blue-deep">{user?.name}</p>
            <p className="truncate text-[11px] text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-status-danger/30 bg-status-danger/10 px-3.5 text-xs font-semibold text-status-danger active:bg-status-danger active:text-white"
          >
            <span aria-hidden>🚪</span> Déconnexion
          </button>
        </div>
        <nav aria-label="Espace client" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition ${
                  active ? "bg-blue-main text-white shadow-lifted" : "border border-blue-soft bg-white text-gray-600"
                }`}
              >
                <span aria-hidden>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

    <aside className="hidden rounded-[18px] border border-blue-soft bg-blue-frost p-5 lg:sticky lg:top-24 lg:block">
      <div className="flex flex-col items-center border-b border-[#EEF2FB] pb-4 text-center">
        <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-blue-main text-2xl font-bold text-white">
          {user?.name.charAt(0).toUpperCase()}
        </span>
        <p className="mt-3 text-[15px] font-bold text-blue-deep">{user?.name}</p>
        <p className="mt-1 text-[11px] text-gray-500">
          Membre depuis {user?.created_at ? new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(user.created_at)) : "récemment"}
        </p>
        <span className="badge mt-3 bg-green-pale text-green-dark">✓ Compte vérifié</span>
      </div>

      <nav className="mt-4 space-y-1.5">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                active ? "bg-blue-main text-white shadow-lifted" : "text-gray-500 hover:bg-white"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <hr className="my-4 border-[#EEF2FB]" />
      <button
        onClick={() => logout()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-status-danger/30 bg-status-danger/10 py-2.5 text-[13px] font-semibold text-status-danger transition hover:bg-status-danger hover:text-white"
      >
        <span className="text-base">🚪</span>
        Se déconnecter
      </button>
    </aside>
    </>
  );
}
