"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Produits" },
  { href: "/services", label: "Services" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const accountHref = user?.role_name === "admin" || user?.role_name === "manager" ? "/admin" : "/compte";

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-blue-soft bg-white">
      <div className="container-page flex h-[68px] items-center justify-between gap-4">
        <Logo withBaseline />

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-[7px] text-[13px] font-semibold transition ${
                  active ? "text-blue-main" : "text-gray-500 hover:text-blue-main"
                }`}
              >
                {link.label}
                {active && <span className="absolute -bottom-px left-0 h-[2px] w-full rounded-full bg-blue-main" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/panier"
            className="relative flex h-[42px] w-[44px] items-center justify-center rounded-full bg-blue-mist text-lg text-gray-900 transition hover:bg-blue-main/20"
          >
            🛒
            {cart.count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-status-danger text-[9px] font-bold text-white">
                {cart.count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden sm:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-blue-mist px-3 py-2 text-sm font-medium text-blue-deep hover:bg-blue-main/10"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-main text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(" ")[0]}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-100 bg-white py-2 shadow-card">
                  <Link href={accountHref} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    {user.role_name === "client" ? "Mon espace" : "Panel admin"}
                  </Link>
                  {user.role_name === "client" && (
                    <Link href="/compte/commandes" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mes commandes
                    </Link>
                  )}
                  <div className="mt-1 border-t border-gray-100 px-2 pt-2">
                    <button
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      🚪 Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2.5 sm:flex">
              <Link
                href="/connexion"
                className="flex h-10 items-center rounded-full border-2 border-blue-main px-5 text-[13px] font-semibold text-blue-main transition hover:bg-blue-mist"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="flex h-10 items-center rounded-full bg-blue-main px-5 text-[12px] font-semibold text-white shadow-lifted transition hover:bg-blue-deep"
              >
                Créer un compte
              </Link>
            </div>
          )}

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700">
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            {user ? (
              <>
                <Link href={accountHref} onClick={() => setOpen(false)} className="text-sm font-medium text-blue-main">
                  {user.role_name === "client" ? "Mon espace" : "Panel admin"}
                </Link>
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  🚪 Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/connexion" onClick={() => setOpen(false)} className="text-sm font-medium text-blue-main">
                  Connexion
                </Link>
                <Link href="/inscription" onClick={() => setOpen(false)} className="text-sm font-medium text-green-main">
                  Créer un compte
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
