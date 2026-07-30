"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type CartItem,
  cartSubtotal,
  loadCartFromStorage,
  saveCartToStorage,
} from "@/lib/cart";

const EMPTY_CART_ITEMS: CartItem[] = [];

let items: CartItem[] = EMPTY_CART_ITEMS;
let open = false;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function normalizeItems(next: CartItem[]) {
  return next.length > 0 ? next : EMPTY_CART_ITEMS;
}

export function getCartOpenSnapshot() {
  return open;
}

function getItemsSnapshot() {
  return items;
}

function getCountSnapshot() {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function getSubtotalSnapshot() {
  return cartSubtotal(items);
}

function persistItems() {
  if (!hydrated || typeof window === "undefined") return;
  saveCartToStorage(items);
}

export function hydrateCartFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  const loaded = normalizeItems(loadCartFromStorage());
  hydrated = true;
  if (loaded === items) return;
  items = loaded;
  emit();
}

export function setCartOpen(next: boolean) {
  if (open === next) return;
  open = next;
  emit();
}

export function addCartItem(item: CartItem) {
  const idx = items.findIndex((entry) => entry.key === item.key);
  if (idx === -1) {
    items = [...items, item];
  } else {
    const next = [...items];
    const mergedQty = next[idx].quantity + item.quantity;
    const maxQty =
      next[idx].stock != null
        ? Math.min(mergedQty, next[idx].stock!)
        : mergedQty;
    next[idx] = { ...next[idx], quantity: Math.max(1, maxQty) };
    items = next;
  }
  persistItems();
  open = true;
  emit();
}

export function removeCartItem(key: string) {
  const next = items.filter((item) => item.key !== key);
  if (next.length === items.length) return;
  items = normalizeItems(next);
  persistItems();
  emit();
}

export function setCartItemQuantity(key: string, quantity: number) {
  const next = items
    .map((item) => {
      if (item.key !== key) return item;
      const maxQty =
        item.stock != null ? Math.min(quantity, item.stock) : quantity;
      return { ...item, quantity: Math.max(1, maxQty) };
    })
    .filter((item) => item.quantity > 0);
  items = normalizeItems(next);
  persistItems();
  emit();
}

export function clearCartItems() {
  if (items.length === 0) return;
  items = EMPTY_CART_ITEMS;
  persistItems();
  emit();
}

function useCartStoreValue<T>(read: () => T, initial: T): T {
  const readRef = useRef(read);
  readRef.current = read;
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const sync = () => {
      setValue((prev) => {
        const next = readRef.current();
        return Object.is(prev, next) ? prev : next;
      });
    };
    sync();
    return subscribe(sync);
  }, []);

  return value;
}

export function useCartOpen() {
  return useCartStoreValue(getCartOpenSnapshot, false);
}

export function useCartCount() {
  return useCartStoreValue(getCountSnapshot, 0);
}

export function useCartItemsState() {
  const itemsSnapshot = useCartStoreValue(getItemsSnapshot, EMPTY_CART_ITEMS);
  const subtotal = useCartStoreValue(getSubtotalSnapshot, 0);
  return { items: itemsSnapshot, subtotal };
}

export function useCartActions() {
  return useMemo(
    () => ({
      addItem: addCartItem,
      removeItem: removeCartItem,
      setQuantity: setCartItemQuantity,
      clearCart: clearCartItems,
      setOpen: setCartOpen,
    }),
    [],
  );
}

export function useCartHydration() {
  useEffect(() => {
    hydrateCartFromStorage();
  }, []);
}
