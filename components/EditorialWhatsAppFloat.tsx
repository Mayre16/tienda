"use client";

import { MessageCircle } from "lucide-react";
import { STORE_WHATSAPP_NUMBER } from "@/lib/site-config";

const MESSAGE =
  "Hola, me interesa consultar disponibilidad de libros y productos de Editorial Logos.";

export function EditorialWhatsAppFloat() {
  const href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6"
      aria-label="Consultar por WhatsApp"
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Consultar por WhatsApp</span>
    </a>
  );
}
