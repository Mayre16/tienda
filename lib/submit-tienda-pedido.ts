import { cmsApiBase, cmsEditorOrigin } from "@/lib/cms/api-client";
import type { CartCustomer, CartItem } from "@/lib/cart";
import { preferWebpAssetUrl } from "@/lib/media-assets";
import { SITE_URL, STORE_API_URL } from "@/lib/site-config";
import { trackFormSubmit } from "@/lib/site-analytics";
import { turnstileEnabled } from "@/lib/turnstile-config";

export type TiendaPedidoResult =
  | { ok: true; dev?: boolean; message?: string }
  | { ok: false; error: string };

function absoluteCartImage(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/uploads/bookstore_covers/")) {
    return `${SITE_URL}${preferWebpAssetUrl(url)}`;
  }
  if (url.startsWith("/uploads/")) {
    return `${cmsEditorOrigin()}${url}`;
  }
  if (url.startsWith("/")) {
    return `${SITE_URL}${preferWebpAssetUrl(url)}`;
  }
  return preferWebpAssetUrl(url);
}

export async function submitTiendaPedido(opts: {
  customer: CartCustomer;
  items: CartItem[];
  note?: string;
  turnstileToken?: string;
}): Promise<TiendaPedidoResult> {
  const name = opts.customer.name.trim();
  const email = opts.customer.email.trim();
  const phone = opts.customer.phone.trim();
  if (!name || !email) {
    return { ok: false, error: "Indique su nombre y correo electrónico." };
  }
  if (!phone) {
    return { ok: false, error: "Indique teléfono o WhatsApp." };
  }
  if (opts.items.length === 0) {
    return { ok: false, error: "El carrito está vacío." };
  }
  if (turnstileEnabled() && !opts.turnstileToken?.trim()) {
    return {
      ok: false,
      error: "Complete la verificación «No soy un robot».",
    };
  }

  const payload = {
    name,
    email,
    phone,
    note: (opts.note ?? "").trim(),
    siteUrl: SITE_URL,
    storeApiUrl: STORE_API_URL,
    website: "",
    turnstileToken: opts.turnstileToken ?? "",
    items: opts.items.map((item) => ({
      kind: item.kind,
      id: item.id,
      title: item.title,
      subtitle: item.subtitle ?? "",
      description: item.description ?? "",
      quantity: item.quantity,
      price: item.price,
      currency: item.currency || "DOP",
      imageUrl: absoluteCartImage(item.imageUrl) ?? "",
    })),
  };

  try {
    const res = await fetch(`${cmsApiBase()}/forms/tienda-pedido`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      dev?: boolean;
      message?: string;
      error?: string;
    };
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error:
          data.error ??
          "No se pudo enviar el pedido. Inténtelo de nuevo en unos minutos.",
      };
    }
    trackFormSubmit("editorial", "tienda_pedido");
    return {
      ok: true,
      dev: data.dev === true,
      message: data.message,
    };
  } catch {
    return {
      ok: false,
      error:
        "No se pudo conectar con el servidor. Compruebe su conexión e inténtelo de nuevo.",
    };
  }
}
