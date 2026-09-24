"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError, getToken, setToken } from "@/lib/api";
import { User } from "@/types";

export interface AuthResponse {
  access_token: string;
  user: User;
}

interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  message?: string;
  email_sent?: boolean;
  access_token?: string;
  user?: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  applySession: (data: AuthResponse) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { user } = await api.get<{ user: User }>("/auth/me");
      setUser(user);
    } catch (error) {
      if (error instanceof ApiError) setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<AuthResponse>("/auth/login", { email, password }, { auth: false });
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await api.post<RegisterResponse>("/auth/register", payload, { auth: false });
    // Confirmation d'email désactivée côté serveur : l'inscription connecte directement le client.
    if (data.access_token && data.user) {
      setToken(data.access_token);
      setUser(data.user);
    }
    return data;
  }, []);

  const applySession = useCallback((data: AuthResponse) => {
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // le token est peut-être déjà invalide, on nettoie quand même
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      applySession,
      logout,
      refreshUser: loadUser,
      isAdmin: user?.role_name === "admin",
      isManager: user?.role_name === "manager",
      isStaff: user?.role_name === "admin" || user?.role_name === "manager",
    }),
    [user, loading, login, register, applySession, logout, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>.");
  return ctx;
}
