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

      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-[18px] py-4">
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

      <div className="m-[18px] rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-main text-sm font-bold text-white">
            {user?.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{user?.name}</p>
            <p className="truncate text-[11px] text-[#A9BBE8]">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5484D] py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#CC3D42] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
