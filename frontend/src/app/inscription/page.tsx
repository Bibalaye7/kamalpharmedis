"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

const BENEFITS = [
  { icon: "🎁", label: "10% sur votre 1ère commande" },
  { icon: "📦", label: "Livraison offerte dès 50 000 FCFA" },
  { icon: "🔔", label: "Alertes prix et nouveautés" },
  { icon: "📋", label: "Suivi commandes en temps réel" },
  { icon: "❤️", label: "Liste de favoris personnalisée" },
  { icon: "🎯", label: "Recommandations personnalisées" },
];

function passwordStrength(password: string): { percent: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { percent: 10, label: "Trop court", color: "bg-status-danger" },
    { percent: 35, label: "Faible", color: "bg-status-danger" },
    { percent: 60, label: "Correct", color: "bg-[#F57C00]" },
    { percent: 80, label: "Bon", color: "bg-green-main" },
    { percent: 100, label: "Excellent", color: "bg-green-main" },
  ];
  return levels[Math.min(score, password.length === 0 ? 0 : score)] ?? levels[0];
}

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: searchParams.get("email") ?? "",
    phone: "",
    password: "",
    passwordConfirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [emailSent, setEmailSent] = useState(true);

  const strength = passwordStrength(form.password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) {
      setError("Veuillez accepter les conditions et la politique de confidentialité.");
      return;
    }
    if (form.password !== form.passwordConfirmation) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await register({
        name: `${form.name} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      });
      if (result.access_token) {
        router.push(searchParams.get("redirect") || "/compte");
        return;
      }
      setEmailSent(result.email_sent !== false);
      setRegistered(true);
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

  return (
    <div className="grid min-h-[calc(100vh-68px)] grid-cols-1 bg-white lg:grid-cols-[560px_1fr]">
      <div className="relative hidden overflow-hidden bg-blue-deep p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -left-40 -top-24 h-[420px] w-[420px] rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-16 right-[-60px] h-56 w-56 rounded-full bg-green-main/10" />

        <h1 className="relative text-4xl font-extrabold leading-tight text-white">
          Rejoignez la
          <br />
          communauté
          <br />
          KamalPharMédis
        </h1>
        <p className="relative mt-6 max-w-md text-sm text-[#B8CCFF]">
          Commandez en quelques clics et suivez vos livraisons depuis votre espace.
        </p>
        <div className="relative mt-3 h-[3px] w-20 rounded-full bg-green-main" />

        <div className="relative mt-8 space-y-3">
          {BENEFITS.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-2xl bg-[#293D8A] p-3 shadow-lifted">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#406BD1] text-base">{b.icon}</span>
              <p className="text-[13px] font-semibold text-white">{b.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center bg-blue-frost p-6 lg:p-12">
        <div className="w-full max-w-[600px] rounded-[28px] bg-white p-8 shadow-2xl sm:p-10">
          {registered ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-mist text-3xl">📧</span>
              <h1 className="mt-5 text-xl font-bold text-blue-deep">Vérifiez votre boîte email</h1>
              {emailSent ? (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Nous avons envoyé un lien de confirmation à <strong>{form.email}</strong>. Cliquez dessus pour activer
                  votre compte et accéder à votre espace client.
                </p>
              ) : (
                <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
                  Votre compte est créé, mais nous n&apos;avons pas pu envoyer l&apos;email de confirmation à{" "}
                  <strong>{form.email}</strong> pour le moment. Réessayez avec le bouton ci-dessous, ou contactez-nous.
                </p>
              )}
              <ResendVerification email={form.email} />
              <Link href="/connexion" className="mt-6 inline-block text-sm font-semibold text-blue-main">← Retour à la connexion</Link>
            </div>
          ) : (
            <>
          <h1 className="text-2xl font-bold text-blue-deep">Créer votre compte</h1>
          <p className="mt-1 text-[13px] text-gray-500">Accédez à votre espace d&apos;achat personnel.</p>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">Prénom *</label>
                <input required className="input-field" placeholder="Votre prénom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-900">Nom *</label>
                <input required className="input-field" placeholder="Votre nom de famille" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-900">Email *</label>
              <input required type="email" className="input-field" placeholder="votre@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-900">Téléphone *</label>
              <input required className="input-field" placeholder="+221 XX XXX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-900">Mot de passe *</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  autoComplete="new-password"
                  className="input-field pr-12"
                  placeholder="Minimum 8 caractères"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-frost"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {form.password.length > 0 && (
                <>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-mist">
                    <div className={`h-1.5 rounded-full transition-all ${strength.color}`} style={{ width: `${strength.percent}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500">Force : {strength.label}</p>
                </>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-900">Confirmer le mot de passe *</label>
              <input
                required
                type={showPassword ? "text" : "password"}
                minLength={8}
                autoComplete="new-password"
                className="input-field"
                placeholder="Saisissez à nouveau le mot de passe"
                value={form.passwordConfirmation}
                onChange={(e) => setForm({ ...form, passwordConfirmation: e.target.value })}
              />
              {form.passwordConfirmation.length > 0 && (
                <p className={`mt-1 text-[10px] ${form.password === form.passwordConfirmation ? "text-green-dark" : "text-status-danger"}`}>
                  {form.password === form.passwordConfirmation ? "✓ Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
                </p>
              )}
            </div>

            <label className="flex items-start gap-2.5 text-xs text-gray-600">
              <input type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
              J&apos;accepte les Conditions et la Politique de confidentialité
            </label>

            <button type="submit" disabled={loading} className="flex h-[50px] w-full items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white shadow-lifted">
              {loading ? "Création..." : "Créer mon compte gratuitement →"}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-gray-500">
              En créant un compte, vous acceptez nos{" "}
              <Link href="/conditions-generales-de-vente" className="font-semibold text-blue-main underline">conditions de vente</Link> et notre{" "}
              <Link href="/confidentialite" className="font-semibold text-blue-main underline">politique de confidentialité</Link>.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ? <Link href="/connexion" className="font-semibold text-blue-main">Se connecter →</Link>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResendVerification({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleResend() {
    setStatus("sending");
    try {
      await api.post("/auth/resend-verification", { email }, { auth: false });
    } finally {
      setStatus("sent");
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleResend}
        disabled={status !== "idle"}
        className="text-sm font-semibold text-blue-main disabled:text-gray-400"
      >
        {status === "sent" ? "✓ Email renvoyé" : status === "sending" ? "Envoi..." : "Vous n'avez rien reçu ? Renvoyer l'email"}
      </button>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
