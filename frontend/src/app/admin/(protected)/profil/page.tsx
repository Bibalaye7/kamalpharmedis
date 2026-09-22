"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

export default function AdminProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await api.put("/auth/profile", { name, email, phone });
      await refreshUser();
      setMessage("Profil mis à jour avec succès.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passwordForm.current_password || !passwordForm.password) return;
    try {
      await api.put("/auth/password", passwordForm);
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      setMessage("Mot de passe modifié avec succès.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
      <div className="rounded-[20px] bg-white shadow-soft lg:col-span-3">
        <div className="relative overflow-hidden rounded-t-[20px] bg-blue-deep px-8 py-6">
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-main text-4xl font-bold text-white ring-4 ring-white/20">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-xl font-bold text-white">{user?.name}</p>
              <p className="text-[13px] text-[#D1E0FF]">
                {user?.role_name === "admin" ? "Administrateur" : "Gestionnaire"} · {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {message && <p className="mb-4 rounded-lg bg-green-pale px-4 py-3 text-sm text-green-dark">{message}</p>}
          {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <form onSubmit={handleProfileSubmit}>
            <p className="text-base font-bold text-blue-deep">Informations personnelles</p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Nom complet</label>
                <input required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Email</label>
                <input required type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Téléphone</label>
                <input className="input-field sm:max-w-[380px]" value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            <p className="text-base font-bold text-blue-deep">Sécurité</p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Confirmer le mot de passe</label>
                <input
                  type="password"
                  className="input-field"
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Nouveau mot de passe</label>
                <input
                  type="password"
                  placeholder="Minimum 8 caractères"
                  className="input-field"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-blue-main text-sm font-semibold text-white shadow-lifted">
                💾 Sauvegarder les modifications
              </button>
              <button
                type="button"
                onClick={handlePasswordSubmit}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] border border-blue-main bg-blue-mist text-sm font-semibold text-blue-main"
              >
                🔒 Changer le mot de passe
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] border border-status-danger bg-[#FFE5E5] text-sm font-semibold text-status-danger"
              >
                🚪 Se déconnecter
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-[20px] bg-white p-5 shadow-soft">
        <p className="text-sm font-bold text-blue-deep">Mon rôle</p>
        <div className="mt-3 rounded-2xl bg-blue-frost p-4">
          <p className="text-xs font-semibold text-gray-500">Statut du compte</p>
          <p className="mt-1 text-sm font-bold text-gray-900">
            {user?.role_name === "admin" ? "🔑 Administrateur — accès complet" : "👤 Gestionnaire — produits & commandes"}
          </p>
        </div>
        <div className="mt-3 rounded-2xl bg-blue-frost p-4">
          <p className="text-xs font-semibold text-gray-500">Membre depuis</p>
          <p className="mt-1 text-sm font-bold text-gray-900">
            {user?.created_at ? new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(user.created_at)) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
