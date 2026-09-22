"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: "📊", roles: ["admin", "manager"] },
  { href: "/admin/produits", label: "Produits", icon: "📦", roles: ["admin", "manager"] },
  { href: "/admin/commandes", label: "Commandes", icon: "📋", roles: ["admin", "manager"] },
  { href: "/admin/messages", label: "Messages de contact", icon: "✉️", roles: ["admin", "manager"] },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "👥", roles: ["admin"] },
  { href: "/admin/profil", label: "Mon profil", icon: "👤", roles: ["admin", "manager"] },
];

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-ink">
      <div className="flex items-center gap-2.5 px-[18px] pt-5">
        <Image src="/brand/logo-icon.png" alt="KamalPharMédis" width={42} height={42} className="h-[42px] w-[42px]" />
        <div>
          <p className="text-[13px] font-bold text-white">KamalPharMédis</p>
          <p className="text-[10px] text-[#808CA6]">{user?.role_name === "admin" ? "Administrateur" : "Gestionnaire"}</p>
        </div>
      </div>

      <hr className="mx-[18px] mt-4 border-[#2E384D]" />

      <nav className="flex-1 space-y-1.5 px-[18px] py-4">
        {LINKS.filter((link) => user && link.roles.includes(user.role_name)).map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-[13px] px-3.5 py-3 text-[13px] font-medium transition ${
                active ? "bg-blue-main text-white" : "text-[#9EABC2] hover:bg-white/5 hover:text-white"
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
          className="flex items-center gap-3 rounded-[13px] px-3.5 py-3 text-[13px] font-medium text-[#9EABC2] hover:bg-white/5 hover:text-white"
        >
          <span className="text-lg">🌐</span>
          Voir le site
        </Link>
      </nav>

      <hr className="mx-[18px] border-[#2E384D]" />
      <div className="flex items-center gap-2.5 px-[18px] pt-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white">
          {user?.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
          <p className="truncate text-[9px] text-[#738099]">{user?.email}</p>
        </div>
      </div>
      <div className="px-[18px] py-4">
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-[13px] border border-status-danger/30 bg-status-danger/10 py-2.5 text-[13px] font-semibold text-status-danger transition hover:bg-status-danger hover:text-white"
        >
          <span className="text-base">🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
