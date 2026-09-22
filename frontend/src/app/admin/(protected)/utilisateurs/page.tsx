"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import { api } from "@/lib/api";
import { PaginatedResponse, Role, User } from "@/types";
import { PageSpinner } from "@/components/ui/Spinner";
import UserFormModal from "@/components/admin/UserFormModal";
import { useAuth } from "@/context/AuthContext";

const ROLE_BADGE: Record<Role, { icon: string; label: string; className: string }> = {
  admin: { icon: "🔑", label: "Admin", className: "bg-blue-mist text-blue-main" },
  manager: { icon: "👤", label: "Manager", className: "bg-green-pale text-green-dark" },
  client: { icon: "👤", label: "Client", className: "bg-[#FFF5E0] text-[#F57C00]" },
};

type AdminUser = User & { orders_count: number; total_spent: number | null };

function UsersContent() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<PaginatedResponse<AdminUser> | null>(null);
  const [roles, setRoles] = useState<{ id: number; name: Role; label: string }[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalUser, setModalUser] = useState<User | null | "new">(null);

  function load() {
    const params = new URLSearchParams({ page: String(page), per_page: "10" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    api.get<PaginatedResponse<AdminUser>>(`/admin/users?${params.toString()}`).then(setUsers);
  }

  useEffect(() => {
    api.get<{ data: typeof roles }>("/admin/roles").then((res) => setRoles(res.data));
  }, []);

  useEffect(load, [search, roleFilter, page]);

  async function handleDelete(user: User) {
    if (!confirm(`Supprimer ${user.name} ?`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible.");
    }
  }

  const roleCounts = {
    admin: users?.data.filter((u) => u.role_name === "admin").length ?? 0,
    manager: users?.data.filter((u) => u.role_name === "manager").length ?? 0,
    client: users?.data.filter((u) => u.role_name === "client").length ?? 0,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input placeholder="🔍 Rechercher utilisateur..." className="input-field max-w-[300px]" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <button onClick={() => setModalUser("new")} className="flex h-11 items-center gap-2 rounded-2xl bg-blue-main px-5 text-[13px] font-semibold text-white shadow-lifted">
          ➕ Ajouter utilisateur
        </button>

        <div className="ml-auto flex gap-2.5">
          <button onClick={() => { setRoleFilter("admin"); setPage(1); }} className="flex h-11 items-center gap-2 rounded-2xl bg-blue-mist px-4 text-blue-main">
            <span className="text-lg font-bold">{roleCounts.admin}</span>
            <span className="text-[10px]">Admins</span>
          </button>
          <button onClick={() => { setRoleFilter("manager"); setPage(1); }} className="flex h-11 items-center gap-2 rounded-2xl bg-green-pale px-4 text-green-dark">
            <span className="text-lg font-bold">{roleCounts.manager}</span>
            <span className="text-[10px]">Managers</span>
          </button>
          <button onClick={() => { setRoleFilter("client"); setPage(1); }} className="flex h-11 items-center gap-2 rounded-2xl bg-[#FFF5E0] px-4 text-[#F57C00]">
            <span className="text-lg font-bold">{roleCounts.client}</span>
            <span className="text-[10px]">Clients</span>
          </button>
          {roleFilter && (
            <button onClick={() => { setRoleFilter(""); setPage(1); }} className="flex h-11 items-center rounded-2xl border border-gray-300 px-3 text-xs text-gray-500">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[18px] bg-white shadow-soft">
        {!users ? (
          <PageSpinner />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-blue-frost text-left text-[11px] font-bold uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Utilisateur</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Téléphone</th>
                <th className="px-5 py-3.5">Rôle</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.data.map((u, i) => (
                <tr key={u.id} className={i % 2 === 1 ? "bg-blue-frost" : "bg-white"}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-main text-sm font-bold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <p className="font-semibold text-gray-900">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3 text-gray-500">{u.phone ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${ROLE_BADGE[u.role_name].className}`}>{ROLE_BADGE[u.role_name].icon} {ROLE_BADGE[u.role_name].label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${u.is_active ? "bg-green-pale text-green-dark" : "bg-[#FFE5E5] text-status-danger"}`}>
                      {u.is_active ? "✅ Actif" : "❌ Inactif"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setModalUser(u)} className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-[9px] bg-blue-mist text-blue-main">
                      ✏️
                    </button>
                    {u.id !== currentUser?.id && (
                      <button onClick={() => handleDelete(u)} className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#FFE5E5] text-status-danger">
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {users && users.last_page > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: users.last_page }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`h-9 w-9 rounded-full text-sm font-semibold ${page === i + 1 ? "bg-blue-main text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {modalUser && (
        <UserFormModal
          roles={roles}
          user={modalUser === "new" ? null : modalUser}
          onClose={() => setModalUser(null)}
          onSaved={() => { setModalUser(null); load(); }}
        />
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <UsersContent />
    </RequireAuth>
  );
}
