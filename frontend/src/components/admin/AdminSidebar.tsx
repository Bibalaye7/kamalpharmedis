"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: "📊", roles: ["admin", "manager"] },
  { href: "/admin/produits", label: "Produits", icon: "📦", roles: ["admin", "manager"] },
  { href: "/admin/commandes", label: "Commandes", icon: "📋", roles: ["admin", "manager"] },
  { href: "/admin/devis", label: "Demandes de devis", icon: "🧾", roles: ["admin", "manager"] },
  { href: "/admin/messages", label: "Messages de contact", icon: "✉️", roles: ["admin", "manager"] },
  { href: "/admin/avis", label: "Avis clients", icon: "⭐", roles: ["admin", "manager"] },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "👥", roles: ["admin"] },
  { href: "/admin/profil", label: "Mon profil", icon: "👤", roles: ["admin", "manager"] },
];

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-gradient-to-b from-blue-deep to-[#122B6E]">
      <div className="flex items-center gap-2.5 px-[18px] pt-5">
        <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-white shadow-soft">
          <Image src="/brand/logo-icon.png" alt="KamalPharMédis" width={38} height={38} className="h-[38px] w-[38px]" />
        </span>
        <div>
          <p className="text-[13px] font-bold text-white">KamalPharMédis</p>
          <p className="text-[10px] font-semibold text-[#7FD88A]">{user?.role_name === "admin" ? "Administrateur" : "Gestionnaire"}</p>
        </div>
      </div>

      <hr className="mx-[18px] mt-4 border-white/15" />

      <nav className="flex-1 space-y-1.5 px-[18px] py-4">
        {LINKS.filter((link) => user && link.roles.includes(user.role_name)).map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-[13px] px-3.5 py-3 text-[13px] font-medium transition ${
                active ? "bg-green-main text-white shadow-soft" : "text-[#C9D6F5] hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-[13px] px-3.5 py-3 text-[13px] font-medium text-[#C9D6F5] hover:bg-white/10 hover:text-white"
        >
          <span className="text-lg">🌐</span>
          Voir le site
        </Link>
      </nav>

      <hr className="mx-[18px] border-white/15" />
      <div className="flex items-center gap-2.5 px-[18px] pt-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-main text-sm font-bold text-white">
          {user?.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
          <p className="truncate text-[9px] text-[#A9BBE8]">{user?.email}</p>
        </div>
      </div>
      <div className="px-[18px] py-4">
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-[13px] border border-white/20 bg-white/10 py-2.5 text-[13px] font-semibold text-white transition hover:border-status-danger hover:bg-status-danger"
        >
          <span className="text-base">🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
