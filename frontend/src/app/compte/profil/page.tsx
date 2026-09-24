"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

const NOTIFICATION_PREFS = [
  { key: "orders", label: "Nouvelles commandes et livraisons", default: true },
  { key: "promotions", label: "Promotions et réductions exclusives", default: true },
  { key: "stock", label: "Alertes stock produits favoris", default: true },
  { key: "newsletter", label: "Newsletter hebdomadaire", default: false },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-[22px] w-10 shrink-0 rounded-full transition ${checked ? "bg-blue-main" : "bg-gray-300"}`}
      aria-label="Basculer"
    >
      <span className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition ${checked ? "left-[20px]" : "left-0.5"}`} />
    </button>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      const [first, ...rest] = user.name.split(" ");
      setFirstName(first);
      setLastName(rest.join(" "));
    }
    try {
      const saved = JSON.parse(localStorage.getItem("kpm_notif_prefs") || "{}");
      setPrefs({ ...Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.key, p.default])), ...saved });
    } catch {
      setPrefs(Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.key, p.default])));
    }
  }, [user]);

  function updatePref(key: string, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      localStorage.setItem("kpm_notif_prefs", JSON.stringify(next));
    } catch {
      // stockage local indisponible : préférence non persistée, sans impact fonctionnel
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await api.put("/auth/profile", { name: `${firstName} ${lastName}`.trim(), email, phone });
      await refreshUser();
      setMessage("Profil mis à jour avec succès.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  async function handlePasswordSubmit() {
    setError(null);
    setMessage(null);
    if (!passwordForm.current_password || !passwordForm.password) {
      setError("Renseignez votre mot de passe actuel et le nouveau.");
      return;
    }
    try {
      await api.put("/auth/password", { ...passwordForm, password_confirmation: passwordForm.password });
      setPasswordForm({ current_password: "", password: "" });
      setMessage("Mot de passe mis à jour avec succès.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-blue-deep">Mon profil</h1>

      {message && <p className="rounded-lg bg-green-pale px-4 py-3 text-sm text-green-dark">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleProfileSubmit} className="rounded-[20px] bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-main text-4xl font-bold text-white">
                {user?.name.charAt(0).toUpperCase()}
              </span>
              <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-green-main text-sm text-white ring-2 ring-white">
                📷
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-deep">{user?.name}</p>
              <span className="badge mt-1.5 bg-green-pale text-green-dark">✓ Compte vérifié</span>
            </div>
          </div>
          <button type="submit" className="flex h-10 items-center gap-2 rounded-full bg-blue-main px-5 text-[13px] font-semibold text-white shadow-lifted">
            ✏️ Modifier
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Prénom</label>
            <input className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Nom</label>
            <input className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Email</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Téléphone</label>
            <input className="input-field" value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      </form>

      <div className="rounded-[20px] bg-white p-6 shadow-soft">
        <p className="text-lg font-bold text-blue-deep">Sécurité du compte</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Mot de passe actuel</label>
            <input
              type="password"
              className="input-field"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Nouveau mot de passe</label>
            <input
              type="password"
              minLength={8}
              className="input-field"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
            />
          </div>
        </div>
        <button onClick={handlePasswordSubmit} className="mt-4 flex h-10 items-center rounded-full bg-blue-main px-6 text-[13px] font-semibold text-white shadow-lifted">
          Mettre à jour
        </button>
      </div>

      <div className="rounded-[20px] bg-white p-6 shadow-soft">
        <p className="text-lg font-bold text-blue-deep">Préférences de notifications</p>
        <div className="mt-4 divide-y divide-gray-100">
          {NOTIFICATION_PREFS.map((pref) => (
            <div key={pref.key} className="flex items-center justify-between py-3">
              <p className="text-sm text-gray-900">{pref.label}</p>
              <Toggle checked={prefs[pref.key] ?? pref.default} onChange={(v) => updatePref(pref.key, v)} />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => alert("Pour supprimer votre compte, contactez notre support à kamalpharmedis@gmail.com.")}
        className="flex h-10 items-center rounded-full border border-status-danger bg-[#FFE5E5] px-5 text-xs text-status-danger"
      >
        Supprimer mon compte
      </button>
    </div>
  );
}
