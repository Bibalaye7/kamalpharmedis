"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Address } from "@/types";
import { PageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

const EMPTY_FORM = { label: "Domicile", full_name: "", phone: "", line1: "", line2: "", city: "", region: "", is_default: false };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get<{ data: Address[] }>("/addresses").then((res) => setAddresses(res.data));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/addresses", form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'ajouter cette adresse.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette adresse ?")) return;
    await api.delete(`/addresses/${id}`);
    load();
  }

  async function handleSetDefault(id: number) {
    await api.put(`/addresses/${id}`, { is_default: true });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-blue-deep">Mes adresses</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary !px-5 !py-2 text-sm">
          {showForm ? "Annuler" : "+ Ajouter une adresse"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input required placeholder="Libellé (ex: Domicile)" className="input-field" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <input required placeholder="Nom complet" className="input-field" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <input required placeholder="Téléphone" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input required placeholder="Adresse (rue, quartier)" className="input-field" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          <input placeholder="Complément d'adresse (optionnel)" className="input-field" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input required placeholder="Ville" className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input placeholder="Région (optionnel)" className="input-field" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
            Définir comme adresse par défaut
          </label>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Enregistrement..." : "Enregistrer l'adresse"}
          </button>
        </form>
      )}

      <div className="mt-6">
        {addresses === null ? (
          <PageSpinner />
        ) : addresses.length === 0 ? (
          <EmptyState title="Aucune adresse enregistrée" description="Ajoutez une adresse pour passer vos commandes." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div key={address.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{address.label}</p>
                    <p className="text-sm text-gray-500">{address.full_name}</p>
                  </div>
                  {address.is_default && <span className="badge bg-green-pale text-green-main">Par défaut</span>}
                </div>
                <p className="mt-3 text-sm text-gray-600">{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
                <p className="text-sm text-gray-600">{address.city}, {address.country}</p>
                <p className="text-sm text-gray-600">{address.phone}</p>
                <div className="mt-4 flex gap-3 text-sm">
                  {!address.is_default && (
                    <button onClick={() => handleSetDefault(address.id)} className="font-medium text-blue-main hover:underline">
                      Définir par défaut
                    </button>
                  )}
                  <button onClick={() => handleDelete(address.id)} className="font-medium text-red-500 hover:underline">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
