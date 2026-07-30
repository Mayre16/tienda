import { type StoreBook, resolveStoreBookCover } from "@/lib/bookstore";
import { isBookCheckoutEligible } from "@/lib/bookstore-merge";
import type { RegaloItem } from "@/lib/editorial-extras";
import { preferWebpAssetUrl } from "@/lib/media-assets";

export type CartItemKind = "book" | "regalo";

export type CartItem = {
  key: string;
  kind: CartItemKind;
  id: string | number;
  title: string;
  subtitle?: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  stock?: number;
};

export type CartCustomer = {
  name: string;
  email: string;
  phone: string;
};

const STORAGE_KEY = "editorial-logos-cart-v1";

export function cartItemKey(kind: CartItemKind, id: string | number): string {
  return `${kind}:${id}`;
}

export function bookToCartItem(book: StoreBook, quantity = 1): CartItem | null {
  if (!isBookCheckoutEligible(book) || book.price == null) return null;
  return {
    key: cartItemKey("book", book.id),
    kind: "book",
    id: book.id,
    title: book.title,
    subtitle: book.author || undefined,
    price: book.price,
    currency: book.currency || "DOP",
    quantity: Math.min(quantity, Math.max(book.stock, 1)),
    imageUrl: resolveStoreBookCover(book) || undefined,
    stock: book.stock,
  };
}

export function regaloToCartItem(
  item: RegaloItem,
  quantity = 1,
): CartItem | null {
  if (item.price == null || item.price <= 0) return null;
  return {
    key: cartItemKey("regalo", item.id),
    kind: "regalo",
    id: item.id,
    title: item.title,
    subtitle: item.author || undefined,
    price: item.price,
    currency: item.currency ?? "DOP",
    quantity,
    imageUrl: item.imageUrl ? preferWebpAssetUrl(item.imageUrl) : undefined,
  };
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CartItem;
  return (
    (item.kind === "book" || item.kind === "regalo") &&
    typeof item.key === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0
  );
}

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function formatCartMoney(amount: number, currency = "DOP"): string {
  try {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
