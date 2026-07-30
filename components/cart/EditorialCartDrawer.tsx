"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CreditCard, Loader2, Minus, Plus, Trash2, X } from "lucide-react";
import {
  useCartActions,
  useCartItemsState,
  useCartOpen,
  setCartOpen,
} from "@/lib/cart-store";
import {
  formatCartMoney,
  type CartCustomer,
} from "@/lib/cart";
import { preferWebpAssetUrl } from "@/lib/media-assets";
import { createAzulCheckout, submitAzulPayment } from "@/lib/checkout";
import { STORE_API_URL } from "@/lib/site-config";

function resolveCartImage(url?: string): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/uploads/")) {
    const resolved = url.startsWith("/uploads/bookstore_covers/")
      ? preferWebpAssetUrl(url)
      : url;
    return `${STORE_API_URL.replace(/\/$/, "")}${resolved}`;
  }
  return preferWebpAssetUrl(url);
}

/** Cierra el carrito al cambiar de ruta y bloquea scroll del body mientras está abierto. */
function useCartDrawerEffects(open: boolean) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    setCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);
}

function EditorialCartDrawerPanel() {
  const { items, subtotal } = useCartItemsState();
  const { removeItem, setQuantity, clearCart } = useCartActions();
  const [customer, setCustomer] = useState<CartCustomer>({
    name: "",
    email: "",
    phone: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const currency = items[0]?.currency ?? "DOP";

  async function handlePay() {
    setError("");
    if (items.length === 0) {
      setError("El carrito está vacío.");
      return;
    }
    if (!customer.name.trim() || !customer.email.trim()) {
      setError("Indique su nombre y correo electrónico.");
      return;
    }
    setBusy(true);
    try {
      const result = await createAzulCheckout(items, {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      });
      if (!result.ok || !result.paymentUrl || !result.fields) {
        setError(
          result.error ||
            result.message ||
            "No se pudo iniciar el pago. Verifique la configuración de Azul.",
        );
        return;
      }
      clearCart();
      submitAzulPayment(result.paymentUrl, result.fields);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      className="fixed bottom-0 right-0 top-[var(--editorial-header-offset,7rem)] z-[70] flex w-full max-w-md flex-col border-l border-na-editorial/10 bg-white shadow-2xl"
      aria-label="Carrito de compras"
    >
        <div className="flex items-center justify-between border-b border-na-editorial/10 px-5 py-4">
          <h2 className="text-lg font-black text-na-ink">Carrito</h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="rounded-full p-2 text-na-muted hover:bg-na-editorial/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-na-muted">
              Aún no hay artículos. Explore el catálogo y use «Añadir al
              carrito» en libros impresos y regalos con precio.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const img = resolveCartImage(item.imageUrl);
                return (
                  <li
                    key={item.key}
                    className="flex gap-3 rounded-xl border border-na-editorial/10 p-3"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {img ? (
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-contain p-0.5"
                          sizes="48px"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-na-ink line-clamp-2">
                        {item.title}
                      </p>
                      {item.subtitle ? (
                        <p className="text-xs text-na-muted line-clamp-1">
                          {item.subtitle}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm font-bold text-na-editorialDark">
                        {formatCartMoney(item.price, item.currency)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-na-editorial/20 p-1"
                          aria-label="Quitar uno"
                          onClick={() =>
                            setQuantity(item.key, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="rounded-full border border-na-editorial/20 p-1"
                          aria-label="Añadir uno"
                          onClick={() =>
                            setQuantity(item.key, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-red-600"
                          aria-label="Eliminar"
                          onClick={() => removeItem(item.key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-na-editorial/10 px-5 py-4">
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="font-semibold text-na-ink">Nombre</span>
              <input
                type="text"
                value={customer.name}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, name: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-na-editorial/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-na-ink">Correo</span>
              <input
                type="email"
                value={customer.email}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, email: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-na-editorial/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-na-ink">Teléfono</span>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, phone: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-na-editorial/20 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-na-muted">Total</span>
            <span className="text-xl font-black text-na-editorialDark">
              {formatCartMoney(subtotal, currency)}
            </span>
          </div>

          {error ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={busy || items.length === 0}
            onClick={() => void handlePay()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-na-editorial px-5 py-3 text-sm font-bold text-white shadow-md shadow-na-editorial/25 transition hover:bg-na-editorialDark disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="h-4 w-4" aria-hidden />
            )}
            Pagar con Azul
          </button>
          <p className="mt-2 text-center text-[11px] text-na-muted">
            Pago seguro con tarjeta vía pasarela Azul (Banco Popular).
          </p>
        </div>
    </aside>
  );
}

export function EditorialCartDrawer() {
  const open = useCartOpen();
  useCartDrawerEffects(open);
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="fixed inset-0 top-[var(--editorial-header-offset,7rem)] z-[60] bg-black/20"
        onClick={() => setCartOpen(false)}
      />
      <EditorialCartDrawerPanel />
    </>
  );
}
