"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const FEATURES = [
  { icon: "📊", label: "Tableau de bord temps réel" },
  { icon: "📦", label: "Gestion catalogue produits" },
  { icon: "📋", label: "Suivi des commandes clients" },
  { icon: "👥", label: "Administration utilisateurs" },
];

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role_name === "client") {
        setError("Ce portail est réservé aux administrateurs et gestionnaires.");
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-blue-frost lg:grid-cols-2">
      {/* Panneau gauche */}
      <div className="relative hidden overflow-hidden bg-blue-deep p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -left-48 -top-32 h-[500px] w-[500px] rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-[-100px] right-16 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <Image src="/brand/logo-icon.png" alt="KamalPharMédis" width={56} height={56} className="h-14 w-14" />
          <div>
            <p className="text-lg font-bold text-white">KamalPharMédis</p>
            <p className="text-xs text-[#A6BFFF]">Portail Administrateur</p>
          </div>
        </div>

        <h1 className="relative mt-14 text-[44px] font-extrabold leading-[1.15] text-white">
          Gérez votre
          <br />
          <span className="text-[#80D98C]">entreprise santé</span>
          <br />
          en toute simplicité.
        </h1>

        <div className="relative mt-16 space-y-6">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-4">
              <span className="flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-[#334D9E] text-2xl">{f.icon}</span>
              <p className="text-[15px] font-medium text-[#D1E0FF]">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit : formulaire */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[492px] rounded-[28px] bg-white p-8 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Image src="/brand/logo-icon.png" alt="KamalPharMédis" width={78} height={78} className="h-[78px] w-[78px]" />
            <h2 className="mt-5 text-[22px] font-bold text-blue-deep">Connexion Admin</h2>
            <p className="mt-1 text-[13px] text-gray-500">Accédez à votre espace de gestion</p>
          </div>

          <div className="mt-6 rounded-xl bg-blue-mist p-3.5 text-[11px]">
            <p className="font-medium text-blue-main">💡 admin@kamalpharmedis.com / Admin@2025</p>
            <p className="mt-1 text-gray-500">manager@kamalpharmedis.com / Admin@2025</p>
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-900">Email</label>
              <input
                type="email"
                required
                placeholder="votre@email.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-900">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="input-field pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-frost"
                >
                  👁
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-blue-main">Mot de passe oublié ?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-blue-main text-base font-semibold text-white shadow-lifted"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 flex justify-center gap-2.5">
            <span className="badge bg-blue-mist text-blue-main">🔑 Admin</span>
            <span className="badge bg-green-pale text-green-dark">👤 Manager</span>
          </div>

          <Link href="/" className="mt-6 block text-center text-sm text-gray-500 hover:text-blue-main">
            ← Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
