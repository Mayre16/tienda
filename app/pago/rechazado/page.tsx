import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PagoRechazadoPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <XCircle className="mx-auto h-14 w-14 text-red-600" aria-hidden />
      <h1 className="mt-4 text-2xl font-black text-na-ink">Pago no completado</h1>
      <p className="mt-3 text-sm leading-relaxed text-na-muted">
        La transacción fue rechazada. Puede intentar de nuevo o contactarnos por
        WhatsApp.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-na-editorial px-6 py-3 text-sm font-bold text-white"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
