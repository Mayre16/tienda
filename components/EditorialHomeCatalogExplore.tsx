"use client";

import Link from "next/link";
import { ArrowRight, BookMarked } from "lucide-react";
import { useEditorialHomeCards } from "@/lib/cms/hooks";
import { EditorialEditPencil } from "@/components/cms/CmsEditFields";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";
import { EDITORIAL_HOME_SECONDARY_LINKS } from "@/lib/editorial-home-cards";
import { sectionToPath } from "@/lib/editorial-navigation";
import { BIBLIOTECA_URL } from "@/lib/site-config";

export function EditorialHomeCatalogExplore() {
  const homeCards = useEditorialHomeCards();
  const edit = useEditorialCmsEdit();

  return (
    <section
      id="explorar-catalogos"
      className="scroll-mt-[var(--editorial-header-offset,7rem)] bg-white py-14 sm:py-16"
      aria-labelledby="editorial-catalogos-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-editorialDark">
          Catálogo
        </p>
        <h2
          id="editorial-catalogos-title"
          className="mt-3 text-balance text-3xl font-black text-na-ink sm:text-4xl"
        >
          Explora los catálogos
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-na-muted sm:text-base">
          Libros impresos y digitales, revistas y regalos filosóficos — elige
          una categoría para ver disponibilidad, precios y opciones de compra.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {homeCards.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.id} className="relative">
                {edit?.ready ? (
                  <EditorialEditPencil
                    label={`Editar ${card.title}`}
                    onClick={() => edit.setSelectedId(`homeCard:${card.id}`)}
                  />
                ) : null}
                <Link
                  href={sectionToPath(card.hash)}
                  className={`group flex h-full w-full flex-col rounded-2xl border p-5 text-left shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card ${card.accent}`}
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-na-editorial text-white shadow-md shadow-na-editorial/20">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-black text-na-ink">
                    {card.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">
                    {card.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-na-editorialDark transition group-hover:gap-2">
                    Ver catálogo
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {EDITORIAL_HOME_SECONDARY_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={sectionToPath(link.hash)}
                className="flex items-start gap-3 rounded-2xl border border-na-editorial/15 bg-white p-4 text-left shadow-na-soft transition hover:border-na-editorial/30"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-na-helios/30 text-na-ink">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-bold text-na-ink">
                    {link.label}
                  </span>
                  <span className="mt-1 block text-xs text-na-muted">
                    {link.note}
                  </span>
                </span>
              </Link>
            );
          })}
          <a
            href={`${BIBLIOTECA_URL}/reader`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-2xl border border-na-heket/20 bg-na-heket/[0.04] p-4 text-left shadow-na-soft transition hover:border-na-heket/35"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-na-heket text-white">
              <BookMarked className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-bold text-na-ink">
                Mi perfil de lectura
              </span>
              <span className="mt-1 block text-xs text-na-muted">
                Inicia sesión en Biblioteca para tus libros digitales ↗
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
