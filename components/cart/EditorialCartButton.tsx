"use client";

import { ShoppingCart } from "lucide-react";
import { useCartCount, useCartOpen, setCartOpen } from "@/lib/cart-store";

export function EditorialCartButton({
  showLabel = false,
  className = "",
  onNavigate,
}: {
  showLabel?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  const count = useCartCount();
  const open = useCartOpen();

  return (
    <button
      type="button"
      className={`editorial-site-header__icon-btn editorial-site-header__cart-btn ${className}`.trim()}
      aria-label={
        open
          ? "Cerrar carrito"
          : count > 0
            ? `Abrir carrito (${count} artículos)`
            : "Abrir carrito de compras"
      }
      aria-expanded={open}
      onClick={() => {
        setCartOpen(!open);
        onNavigate?.();
      }}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden />
      {showLabel ? <span className="text-sm font-bold">Carrito</span> : null}
      {count > 0 ? (
        <span className="editorial-site-header__cart-badge">{count}</span>
      ) : null}
    </button>
  );
}
