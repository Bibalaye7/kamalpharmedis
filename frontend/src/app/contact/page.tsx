"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";

const INFO_ITEMS = [
  { icon: "📍", label: "Adresse", value: "Ouest-Foire, Cité DIOR WARÉ N°14, Dakar (Sénégal)" },
  { icon: "📞", label: "Téléphone", value: "+221 75 661 62 62 / +221 70 464 12 81" },
  { icon: "✉️", label: "Email", value: "KamalPharMédis@gmail.com" },
  { icon: "💬", label: "WhatsApp", value: "+221 70 464 12 81" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", lastName: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await api.post(
        "/contact",
        {
          name: `${form.name} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          subject: form.subject || "Message depuis le site",
          message: form.message,
        },
        { auth: false }
      );
      setStatus("success");
      setForm({ name: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setStatus("idle");
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <div>
      <div className="bg-[#F0F5FF] py-16">
        <div className="container-page text-center">
          <p className="text-[10px] font-bold tracking-wide text-green-main">CONTACT</p>
          <h1 className="mt-2 text-[34px] font-bold text-blue-deep">Parlons de vos besoins</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
            Notre équipe est disponible pour vous conseiller.
          </p>
        </div>
      </div>

      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-[22px] bg-white p-7 shadow-soft lg:col-span-2">
            <h2 className="text-[17px] font-bold text-blue-deep">Informations de contact</h2>
            <div className="mt-6 space-y-6">
              {INFO_ITEMS.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-mist text-xl">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500">{item.label}</p>
                    <p className="text-[13px] font-medium text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-blue-frost p-4">
              <p className="text-[13px] font-bold text-blue-deep">🕐 Horaires d&apos;ouverture</p>
              <p className="mt-2 text-xs text-gray-500">Lun – Ven : 8h00 – 20h00</p>
              <p className="mt-1 text-xs text-gray-500">Samedi : 9h00 – 18h00 · Dimanche : Fermé</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-[22px] bg-white p-7 shadow-soft lg:col-span-3">
            <h2 className="text-[17px] font-bold text-blue-deep">Envoyez-nous un message</h2>

            {status === "success" && (
              <p className="rounded-lg bg-green-pale px-4 py-3 text-sm text-green-main">
                Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement.
              </p>
            )}
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-800">Prénom *</label>
                <input required placeholder="Votre prénom" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-800">Nom *</label>
                <input required placeholder="Votre nom" className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-800">Email *</label>
              <input required type="email" placeholder="votre@email.com" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-800">Téléphone</label>
              <input placeholder="+221 XX XXX XX XX" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-800">Objet</label>
              <input placeholder="Sujet de votre message" className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-800">Message *</label>
              <textarea required rows={4} placeholder="Décrivez votre besoin..." className="input-field resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>

            <button type="submit" disabled={status === "loading"} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-main text-sm font-semibold text-white shadow-lifted">
              {status === "loading" ? "Envoi en cours..." : "Envoyer le message 🚀"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
