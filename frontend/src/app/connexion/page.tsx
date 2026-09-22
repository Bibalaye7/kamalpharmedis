"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

const BENEFITS = [
  { icon: "🎁", label: "10% de réduction membre" },
  { icon: "📦", label: "Suivi commandes temps réel" },
  { icon: "❤️", label: "Vos favoris synchronisés" },
  { icon: "🔔", label: "Alertes prix exclusives" },
];

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailUnverified, setEmailUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailUnverified(false);
    try {
      const user = await login(email, password);
      const redirect = searchParams.get("redirect");
      if (user.role_name === "admin" || user.role_name === "manager") {
        router.push("/admin");
      } else {
        router.push(redirect || "/compte");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setEmailUnverified(Boolean(err.data?.email_unverified));
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setResendStatus("sending");
    try {
      await api.post("/auth/resend-verification", { email }, { auth: false });
    } finally {
      setResendStatus("sent");
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-68px)] grid-cols-1 bg-blue-frost lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-blue-deep p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -left-40 -top-24 h-[400px] w-[400px] rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-16 right-[-50px] h-56 w-56 rounded-full bg-green-main/10" />

        <h1 className="relative text-[42px] font-extrabold leading-tight text-white">
          Votre santé,
          <br />
          nos soins.
        </h1>
        <p className="relative mt-6 max-w-md text-[15px] text-[#B8CCFF]">
          Connectez-vous et profitez de vos avantages membres KamalPharMédis.
        </p>

        <div className="relative mt-12 space-y-4">
          {BENEFITS.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-2xl bg-[#293D8A] p-3 shadow-lifted">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#406BD1] text-base">{b.icon}</span>
              <p className="text-[13px] font-semibold text-white">{b.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[500px] rounded-[28px] bg-white p-8 shadow-2xl sm:p-10">
          <div className="text-center">
            <Image src="/brand/logo-icon.png" alt="KamalPharMédis" width={80} height={80} className="mx-auto h-20 w-20" />
            <h1 className="mt-5 text-2xl font-bold text-blue-deep">Bon retour !</h1>
            <p className="mt-2 text-[13px] text-gray-500">Connectez-vous à votre compte KamalPharMédis</p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              <p>{error}</p>
              {emailUnverified && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendStatus !== "idle"}
                  className="mt-2 font-semibold text-blue-main disabled:text-gray-400"
                >
                  {resendStatus === "sent" ? "✓ Email de confirmation renvoyé" : resendStatus === "sending" ? "Envoi..." : "Renvoyer l'email de confirmation"}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-900">Email</label>
              <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-900">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-frost">
                  👁
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/mot-de-passe-oublie" className="text-xs font-medium text-blue-main">Mot de passe oublié ?</Link>
            </div>

            <button type="submit" disabled={loading} className="flex h-[50px] w-full items-center justify-center rounded-full bg-blue-main text-base font-semibold text-white shadow-lifted">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <hr className="my-6 border-gray-100" />
          <p className="text-center text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-semibold text-blue-main">Créer un compte</Link>
          </p>
          <p className="mt-4 text-center text-xs text-gray-400">
            Vous êtes admin ou gestionnaire ?{" "}
            <Link href="/admin/connexion" className="font-semibold text-blue-main">Portail administrateur</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
