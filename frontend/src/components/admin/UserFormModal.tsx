"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Role, User } from "@/types";

interface Props {
  roles: { id: number; name: Role; label: string }[];
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserFormModal({ roles, user, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    password: "",
    role: user?.role_name ?? "client",
    is_active: user?.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (user) {
        const payload: Record<string, unknown> = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/users/${user.id}`, payload);
      } else {
        await api.post("/admin/users", form);
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = err.errors ? Object.values(err.errors)[0]?.[0] : null;
        setError(firstError || err.message);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl2 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-deep">{user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Nom complet" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Téléphone" className="input-field" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input
            type="password"
            placeholder={user ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
            required={!user}
            minLength={8}
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>{r.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Compte actif
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Enregistrement..." : user ? "Enregistrer" : "Créer"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
