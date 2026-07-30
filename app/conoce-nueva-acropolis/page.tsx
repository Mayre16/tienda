import type { Metadata } from "next";
import { EditorialQuienesSomosSection } from "@/components/EditorialQuienesSomosSection";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Editorial Logos es la librería y línea de publicaciones de Nueva Acrópolis en República Dominicana. Conoce quiénes somos y qué es Nueva Acrópolis.",
};

export default function ConoceNuevaAcropolisPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <EditorialQuienesSomosSection />
    </div>
  );
}
