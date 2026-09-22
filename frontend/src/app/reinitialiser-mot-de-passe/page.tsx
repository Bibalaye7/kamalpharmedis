"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !email) {
      setError("Lien de réinitialisation incomplet.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post(
        "/auth/reset-password",
        { token, email, password, password_confirmation: passwordConfirmation },
        { auth: false }
      );
      setDone(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = err.errors ? Object.values(err.errors)[0]?.[0] : null;
        setError(firstError || err.message);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-blue-frost px-4 py-16">
        <div className="w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-2xl">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE5E5] text-3xl">✕</span>
          <h1 className="mt-5 text-xl font-bold text-blue-deep">Lien invalide</h1>
          <p className="mt-3 text-sm text-gray-600">Ce lien de réinitialisation est incomplet ou invalide.</p>
          <Link href="/mot-de-passe-oublie" className="mt-6 inline-block text-sm font-semibold text-blue-main">
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-blue-frost px-4 py-16">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-2xl">
        {done ? (
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-pale text-3xl">✅</span>
            <h1 className="mt-5 text-xl font-bold text-blue-deep">Mot de passe réinitialisé !</h1>
            <p className="mt-3 text-sm text-gray-600">Redirection vers la connexion...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-mist text-3xl">🔑</span>
              <h1 className="mt-5 text-xl font-bold text-blue-deep">Nouveau mot de passe</h1>
              <p className="mt-2 text-sm text-gray-600">Pour {email}</p>
            </div>

            {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">Nouveau mot de passe</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  placeholder="Minimum 8 caractères"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">Confirmer le mot de passe</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  className="input-field"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex h-[50px] w-full items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white shadow-lifted"
              >
                {loading ? "Enregistrement..." : "Réinitialiser mon mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
