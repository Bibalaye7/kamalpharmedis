"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const KEY = "kpm_pages_visitees";

function visitedCount(): number {
  try {
    return Number(sessionStorage.getItem(KEY) ?? "0");
  } catch {
    return 0;
  }
}

/** À appeler dans le gabarit (layout) : compte les pages parcourues dans l'onglet. */
export function useTrackNavigation() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, String(visitedCount() + 1));
    } catch {
      // stockage indisponible (navigation privée stricte) : le bouton utilisera la page parente
    }
  }, [pathname]);
}

/** Page « parente » utilisée quand il n'y a pas d'historique (lien ouvert directement, nouvel onglet...). */
function parentPath(pathname: string): string {
  if (pathname.startsWith("/produits/")) return "/catalogue";
  if (pathname === "/panier/commande") return "/panier";
  if (pathname.startsWith("/admin/")) {
    const parts = pathname.split("/").filter(Boolean);
    return parts.length > 2 ? `/${parts.slice(0, 2).join("/")}` : "/admin";
  }
  const parts = pathname.split("/").filter(Boolean);
  return parts.length > 1 ? `/${parts.slice(0, -1).join("/")}` : "/";
}

export default function BackButton({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  function goBack() {
    // Au moins une page du site a été vue avant celle-ci dans cet onglet : retour réel.
    if (visitedCount() > 1 && window.history.length > 1) {
      router.back();
    } else {
      router.push(parentPath(pathname));
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Retour à la page précédente"
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-600 transition hover:border-blue-main hover:text-blue-main ${className}`}
    >
      <span aria-hidden>←</span>
      <span className={compact ? "hidden sm:inline" : ""}>Retour</span>
    </button>
  );
}
