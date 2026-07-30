"use client";

import { useEditorialConfig } from "@/lib/editorial-config";

/** Bienvenida compacta bajo el header (sin hero grande). */
export function EditorialPageIntro() {
  const { welcome } = useEditorialConfig();

  return (
    <section
      className="mx-auto max-w-6xl px-4 pt-4 pb-2 sm:px-6 sm:pt-5"
      aria-labelledby="editorial-welcome-title"
    >
      <h1
        id="editorial-welcome-title"
        className="text-balance text-2xl font-black text-na-ink sm:text-3xl"
      >
        {welcome.title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-na-muted sm:text-base">
        {welcome.lede}
      </p>
    </section>
  );
}
