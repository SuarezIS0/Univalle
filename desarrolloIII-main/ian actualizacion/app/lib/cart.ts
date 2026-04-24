"use client";

import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export class Cart {
  constructor(public items: CartItem[] = []) {}

  add(item: Omit<CartItem, "quantity">, quantity = 1) {
    const existing = this.items.find((i) => i.productId === item.productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ ...item, quantity });
    }
  }

  remove(productId: string) {
    this.items = this.items.filter((i) => i.productId !== productId);
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.items.find((i) => i.productId === productId);
    if (!item) return;
    if (quantity <= 0) {
      this.remove(productId);
    } else {
      item.quantity = quantity;
    }
  }

  clear() {
    this.items = [];
  }

  get totalItems(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

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

async function pruneArchivedItems() {
  if (typeof window === "undefined") return false;
  const c = loadCart();
  if (c.isEmpty()) return false;
  const checks = await Promise.all(
    c.items.map(async (item) => {
      try {
        const res = await fetch(`/api/products/${item.productId}`, {
          cache: "no-store",
        });
        return { productId: item.productId, gone: res.status === 410 };
      } catch {
        return { productId: item.productId, gone: false };
      }
    })
  );
  const removed = checks.filter((r) => r.gone);
  if (removed.length === 0) return false;
  for (const r of removed) c.remove(r.productId);
  persist(c);
  return true;
}

export function useCart() {
  const [cart, setCart] = useState<Cart>(new Cart());

  useEffect(() => {
    setCart(loadCart());
    pruneArchivedItems();
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
