import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PagoAprobadoPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-14 w-14 text-na-heket" aria-hidden />
      <h1 className="mt-4 text-2xl font-black text-na-ink">Pago recibido</h1>
      <p className="mt-3 text-sm leading-relaxed text-na-muted">
        Gracias por su compra en Editorial Logos. Recibirá confirmación por
        correo y nos pondremos en contacto para la entrega.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-na-editorial px-6 py-3 text-sm font-bold text-white"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
