"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email }, { auth: false });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-blue-frost px-4 py-16">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-2xl">
        {sent ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-pale text-3xl">📧</span>
            <h1 className="mt-5 text-xl font-bold text-blue-deep">Vérifiez votre boîte email</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, un lien de réinitialisation vient de
              lui être envoyé. Le lien expire dans 60 minutes.
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-mist text-3xl">🔒</span>
            <h1 className="mt-5 text-xl font-bold text-blue-deep">Mot de passe oublié ?</h1>
            <p className="mt-3 text-sm text-gray-600">
              Indiquez votre adresse email : nous vous envoyons un lien pour créer un nouveau mot de passe.
            </p>

            {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">Email</label>
                <input
                  required
                  type="email"
                  className="input-field"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex h-[50px] w-full items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white shadow-lifted"
              >
                {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
          </>
        )}

        <Link href="/connexion" className="mt-6 inline-block text-sm font-semibold text-blue-main">← Retour à la connexion</Link>
      </div>
    </div>
  );
}
