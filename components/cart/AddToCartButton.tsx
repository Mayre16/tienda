"use client";

import { ShoppingCart } from "lucide-react";
import { useCartActions } from "@/lib/cart-store";
import type { CartItem } from "@/lib/cart";

export function AddToCartButton({
  item,
  className = "",
  compact = false,
  iconOnly = false,
  hideWhenUnavailable = false,
  onAdded,
}: {
  item: CartItem | null;
  className?: string;
  compact?: boolean;
  /** Solo icono de carrito (sin texto). */
  iconOnly?: boolean;
  /** No mostrar nada si no se puede añadir (p. ej. agotado). */
  hideWhenUnavailable?: boolean;
  onAdded?: () => void;
}) {
  const { addItem } = useCartActions();

  if (!item) {
    if (hideWhenUnavailable) return null;
    const fullWidth = className.includes("w-full");
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-na-editorial font-black uppercase tracking-wide text-white shadow-sm ${
          fullWidth ? "w-full" : ""
        } ${compact ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-sm"}`}
        aria-label="Agotado"
      >
        Agotado
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        addItem(item);
        onAdded?.();
      }}
      aria-label="Añadir al carrito"
      title="Añadir al carrito"
      className={
        className ||
        (iconOnly
          ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-na-editorial text-white transition hover:bg-na-editorialDark"
          : `inline-flex items-center justify-center gap-2 rounded-full bg-na-editorial px-4 py-2 text-sm font-bold text-white transition hover:bg-na-editorialDark ${
              compact ? "px-3 py-1.5 text-xs" : ""
            }`)
      }
    >
      <ShoppingCart
        className={iconOnly ? "h-4 w-4" : "h-4 w-4 shrink-0"}
        aria-hidden
      />
      {iconOnly ? null : "Añadir al carrito"}
    </button>
  );
}
