import { SITE_URL, STORE_API_URL, STORE_CHECKOUT_PATH } from "@/lib/site-config";
import type { CartCustomer, CartItem } from "@/lib/cart";

export type AzulCheckoutResponse = {
  ok: boolean;
  orderNumber?: string;
  paymentUrl?: string;
  fields?: Record<string, string>;
  error?: string;
  message?: string;
};

export async function createAzulCheckout(
  items: CartItem[],
  customer: CartCustomer,
): Promise<AzulCheckoutResponse> {
  const res = await fetch(
    `${STORE_API_URL.replace(/\/$/, "")}${STORE_CHECKOUT_PATH}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          kind: item.kind,
          id: item.id,
          title: item.title,
          subtitle: item.subtitle ?? "",
          price: item.price,
          currency: item.currency,
          quantity: item.quantity,
        })),
        customer,
        returnBase: SITE_URL,
      }),
    },
  );

  const data = (await res.json()) as AzulCheckoutResponse;
  if (!res.ok && !data.error) {
    return { ok: false, error: `Error ${res.status}` };
  }
  return data;
}

/** Envía el formulario oculto hacia la pasarela Azul. */
export function submitAzulPayment(
  paymentUrl: string,
  fields: Record<string, string>,
): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;
  form.acceptCharset = "UTF-8";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
