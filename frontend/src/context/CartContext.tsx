"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken } from "@/lib/api";
import { Cart } from "@/types";
import { useAuth } from "@/context/AuthContext";

const EMPTY_CART: Cart = {
  items: [],
  count: 0,
  subtotal: 0,
  shipping_fee: 0,
  total: 0,
  free_shipping_threshold: 50000,
};

interface CartContextValue {
  cart: Cart;
  loading: boolean;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || !getToken()) {
      setCart(EMPTY_CART);
      return;
    }

    setLoading(true);
    try {
      const data = await api.get<Cart>("/cart");
      setCart(data);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      const data = await api.post<Cart>("/cart", { product_id: productId, quantity });
      setCart(data);
    },
    []
  );

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    const data = await api.put<Cart>(`/cart/${itemId}`, { quantity });
    setCart(data);
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    const data = await api.delete<Cart>(`/cart/${itemId}`);
    setCart(data);
  }, []);

  const clear = useCallback(async () => {
    const data = await api.delete<Cart>("/cart");
    setCart(data);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({ cart, loading, addItem, updateItem, removeItem, clear, refresh }),
    [cart, loading, addItem, updateItem, removeItem, clear, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un <CartProvider>.");
  return ctx;
}
