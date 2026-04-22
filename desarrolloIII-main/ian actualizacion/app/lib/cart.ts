"use client";

import { useEffect, useState, useCallback } from "react";
import { Cart, CartItem } from "@/domain/entities/Cart";

const STORAGE_KEY = "univalle_cart";
const EVENT_NAME = "cart:updated";

function loadCart(): Cart {
  if (typeof window === "undefined") return new Cart();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Cart();
    const items: CartItem[] = JSON.parse(raw);
    return new Cart(items);
  } catch {
    return new Cart();
  }
}

function persist(cart: Cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useCart() {
  const [cart, setCart] = useState<Cart>(new Cart());

  useEffect(() => {
    setCart(loadCart());
    const handler = () => setCart(loadCart());
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      const c = loadCart();
      c.add(item, quantity);
      persist(c);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    const c = loadCart();
    c.remove(productId);
    persist(c);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const c = loadCart();
    c.updateQuantity(productId, quantity);
    persist(c);
  }, []);

  const clear = useCallback(() => {
    const c = new Cart();
    persist(c);
  }, []);

  return {
    items: cart.items,
    totalItems: cart.totalItems,
    subtotal: cart.subtotal,
    isEmpty: cart.isEmpty(),
    addItem,
    removeItem,
    updateQuantity,
    clear,
  };
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
