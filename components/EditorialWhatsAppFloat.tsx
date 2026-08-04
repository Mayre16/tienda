"use client";

import { MessageCircle, Pencil } from "lucide-react";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";
import { useCmsEditorEmbedded } from "@/hooks/useCmsEditorEmbedded";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { useEditorialDonde } from "@/lib/cms/hooks";
import { editorialWhatsAppUrl } from "@/lib/editorial-locations";

const FLOAT_EDIT_ID = "whatsapp-float";

export function EditorialWhatsAppFloat() {
  const embedded = useCmsEditorEmbedded();
  const editMode = useCmsEditMode();
  const edit = useEditorialCmsEdit();
  const { contact } = useEditorialDonde();

  const editing = !!edit?.ready;
  const inEditorChrome = embedded || !!editMode;

  // Dentro del iframe del CMS: no mostrar el botón verde de WhatsApp.
  if (inEditorChrome && !editing) {
    return null;
  }

  if (editing) {
    return (
      <button
        type="button"
        onClick={() => edit.setSelectedId(FLOAT_EDIT_ID)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-lg transition hover:border-na-heket/40 hover:bg-slate-50 sm:bottom-6 sm:right-6"
        aria-label="Editar botón flotante de WhatsApp"
      >
        <Pencil className="h-4 w-4 shrink-0 text-na-heket" aria-hidden />
        <span className="hidden sm:inline">Editar WhatsApp</span>
      </button>
    );
  }

  const href = editorialWhatsAppUrl(
    contact.floatWhatsappMessage,
    contact.whatsappNumber,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6"
      aria-label={contact.floatWhatsappLabel || "Consultar por WhatsApp"}
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">{contact.floatWhatsappLabel}</span>
    </a>
  );
}
