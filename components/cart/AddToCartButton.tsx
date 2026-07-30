"use client";

import { ShoppingCart } from "lucide-react";
import { useCartActions } from "@/lib/cart-store";
import type { CartItem } from "@/lib/cart";

export function AddToCartButton({
  item,
  className = "",
  compact = false,
  onAdded,
}: {
  item: CartItem | null;
  className?: string;
  compact?: boolean;
  onAdded?: () => void;
}) {
  const { addItem } = useCartActions();

  if (!item) {
    return (
      <p className={`text-xs text-na-muted ${className}`.trim()}>
        Consulte disponibilidad por WhatsApp.
      </p>
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
      className={
        className ||
        `inline-flex items-center justify-center gap-2 rounded-full bg-na-editorial px-4 py-2 text-sm font-bold text-white transition hover:bg-na-editorialDark ${
          compact ? "px-3 py-1.5 text-xs" : ""
        }`
      }
    >
      <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
      Añadir al carrito
    </button>
  );
}
