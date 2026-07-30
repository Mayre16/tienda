"use client";

type LeaveSiteDialogProps = {
  open: boolean;
  destinationLabel: string;
  destinationUrl: string;
  onCancel: () => void;
};

export function LeaveSiteDialog({
  open,
  destinationLabel,
  destinationUrl,
  onCancel,
}: LeaveSiteDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-na-editorial/15 bg-white p-6 shadow-na-card"
        role="dialog"
        aria-labelledby="leave-site-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="leave-site-title"
          className="text-lg font-bold text-na-ink"
        >
          Estás saliendo de este sitio
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-na-muted">
          Vas a abrir <strong className="text-na-ink">{destinationLabel}</strong>{" "}
          en una pestaña nueva. Librería Editorial Logos forma parte de Nueva Acrópolis
          República Dominicana; el enlace te lleva a un sitio externo.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-na-editorial/20 px-5 py-2.5 text-sm font-semibold text-na-muted transition hover:border-na-editorial/40"
          >
            Cancelar
          </button>
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCancel}
            className="inline-flex justify-center rounded-full bg-na-editorial px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-editorialDark"
          >
            Continuar
          </a>
        </div>
      </div>
    </div>
  );
}
