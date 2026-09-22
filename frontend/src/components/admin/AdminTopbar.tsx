"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const TITLES: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/produits": "Produits",
  "/admin/commandes": "Commandes",
  "/admin/utilisateurs": "Utilisateurs",
  "/admin/profil": "Mon profil",
};

export default function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const title =
    TITLES[pathname] ?? (pathname.startsWith("/admin/commandes/") ? "Détail de la commande" : "KamalPharMédis");

  return (
    <div className="flex h-[62px] items-center justify-between border-b border-blue-soft bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-xl text-gray-900 lg:hidden" aria-label="Ouvrir le menu">
          ☰
        </button>
        <p className="text-base font-bold text-blue-deep sm:text-[19px]">{title}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="badge hidden bg-blue-mist text-blue-main sm:inline-flex">
          🔑 {user?.role_name === "admin" ? "Admin" : "Manager"}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white">
          {user?.name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
