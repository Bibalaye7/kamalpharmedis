"use client";

import { useEffect, useState } from "react";
import { api, formatDate } from "@/lib/api";
import { ContactMessage, PaginatedResponse } from "@/types";
import { PageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<PaginatedResponse<ContactMessage> | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  function load() {
    api.get<PaginatedResponse<ContactMessage>>(`/admin/contact-messages?page=${page}&per_page=10`).then(setMessages);
  }

  useEffect(load, [page]);

  async function openMessage(message: ContactMessage) {
    const full = await api.get<ContactMessage>(`/admin/contact-messages/${message.id}`);
    setSelected(full);
    load();
  }

  async function handleDelete(id: number) {
    await api.delete(`/admin/contact-messages/${id}`);
    setSelected(null);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-blue-deep">Messages de contact</h1>
      <p className="mt-1 text-sm text-gray-500">Messages envoyés depuis le formulaire de contact du site.</p>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="overflow-hidden rounded-[18px] bg-white shadow-soft">
          {!messages ? (
            <PageSpinner />
          ) : messages.data.length === 0 ? (
            <EmptyState title="Aucun message" description="Les messages envoyés depuis le formulaire de contact apparaîtront ici." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {messages.data.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => openMessage(m)}
                    className={`flex w-full flex-col items-start gap-1 px-5 py-3.5 text-left transition hover:bg-blue-frost ${
                      selected?.id === m.id ? "bg-blue-frost" : ""
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className={`text-sm ${m.is_read ? "font-medium text-gray-700" : "font-bold text-blue-deep"}`}>
                        {m.name}
                      </span>
                      {!m.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-status-danger" />}
                    </div>
                    <span className="line-clamp-1 text-xs text-gray-500">{m.subject}</span>
                    <span className="text-[10px] text-gray-400">{formatDate(m.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[18px] bg-white p-6 shadow-soft">
          {!selected ? (
            <p className="text-sm text-gray-400">Sélectionnez un message pour le lire.</p>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-blue-deep">{selected.subject}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {selected.name} · <a href={`mailto:${selected.email}`} className="text-blue-main">{selected.email}</a>
                  </p>
                  {selected.phone && <p className="text-sm text-gray-500">📞 {selected.phone}</p>}
                </div>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  Supprimer
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">{formatDate(selected.created_at)}</p>
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-700">{selected.message}</p>
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                className="mt-6 inline-flex h-11 items-center rounded-full bg-blue-main px-5 text-sm font-semibold text-white shadow-lifted transition hover:bg-blue-deep"
              >
                Répondre par email
              </a>
            </div>
          )}
        </div>
      </div>

      {messages && messages.last_page > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: messages.last_page }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-full text-sm font-semibold ${page === i + 1 ? "bg-blue-main text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
