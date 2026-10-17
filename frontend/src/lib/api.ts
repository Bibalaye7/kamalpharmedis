"use client";

// Client API léger pour l'API Laravel (JWT via Bearer token, stocké côté client).
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const TOKEN_KEY = "kpm_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  data?: Record<string, unknown> | null;

  constructor(message: string, status: number, errors?: Record<string, string[]>, data?: Record<string, unknown> | null) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  json?: unknown;
}

/** Émis quand la session ne peut pas être renouvelée : l'AuthContext déconnecte et les pages protégées renvoient à la connexion. */
export const SESSION_EXPIRED_EVENT = "kpm:session-expired";

// Un seul renouvellement à la fois, partagé par les requêtes qui reçoivent un 401 en même temps.
let refreshing: Promise<string | null> | null = null;

function refreshToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return Promise.resolve(null);
  refreshing ??= fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  })
    .then(async (res) => (res.ok ? ((await res.json()) as { access_token?: string }).access_token ?? null : null))
    .catch(() => null)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function request<T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const { auth = true, json, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (json !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    // Jeton expiré (durée de 60 min) : renouvellement silencieux puis nouvel essai de la requête.
    if (response.status === 401 && auth && finalHeaders.Authorization && !/^\/auth\/(login|register|refresh|logout)/.test(path)) {
      const fresh = retried ? null : await refreshToken();
      if (fresh) {
        setToken(fresh);
        return request<T>(path, options, true);
      }
      setToken(null);
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    } else if (response.status === 401) {
      setToken(null);
    }
    throw new ApiError(data?.message || "Une erreur est survenue.", response.status, data?.errors, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", json }),
  put: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", json }),
  patch: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", json }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-SN", { maximumFractionDigits: 0 }).format(value) + " FCFA";
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(value)
  );
}
