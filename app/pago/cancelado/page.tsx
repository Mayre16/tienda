import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function PagoCanceladoPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <AlertCircle className="mx-auto h-14 w-14 text-na-amon" aria-hidden />
      <h1 className="mt-4 text-2xl font-black text-na-ink">Pago cancelado</h1>
      <p className="mt-3 text-sm leading-relaxed text-na-muted">
        Canceló el proceso de pago. Los artículos siguen disponibles en el
        catálogo cuando desee continuar.
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
