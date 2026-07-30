"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { useCartHydration, useCartOpen } from "@/lib/cart-store";

export { cartItemKey } from "@/lib/cart";

const EditorialCartDrawer = dynamic(
  () =>
    import("@/components/cart/EditorialCartDrawer").then((m) => ({
      default: m.EditorialCartDrawer,
    })),
  { ssr: false },
);

/** Monta el panel del carrito solo tras la primera apertura. */
function CartDrawerHost() {
  const open = useCartOpen();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;
  return <EditorialCartDrawer />;
}

/** Hidrata el carrito desde localStorage; el panel se carga bajo demanda. */
export function EditorialCartProvider({ children }: { children: ReactNode }) {
  useCartHydration();
  return (
    <>
      {children}
      <CartDrawerHost />
    </>
  );
}
