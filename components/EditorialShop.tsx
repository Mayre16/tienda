"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Download, Gift, Newspaper } from "lucide-react";
import { DigitalBooksSection } from "@/components/DigitalBooksSection";
import { DIGITAL_BOOK_COUNT } from "@/lib/digital-books";
import {
  EDITORIAL_CATEGORY_HASH,
  type ShopCategory,
} from "@/lib/editorial-content";
import {
  catalogViewOptions,
  categoryFromEditorialHash,
  navigateEditorialSection,
} from "@/lib/editorial-navigation";

const EditorialCatalog = dynamic(
  () =>
    import("@/components/EditorialCatalog").then((m) => ({
      default: m.EditorialCatalog,
    })),
  {
    loading: () => (
      <p className="py-10 text-center text-sm text-na-muted">
        Cargando catálogo…
      </p>
    ),
  },
);

const RevistasSection = dynamic(
  () =>
    import("@/components/RevistasSection").then((m) => ({
      default: m.RevistasSection,
    })),
  {
    loading: () => (
      <p className="py-10 text-center text-sm text-na-muted">
        Cargando revistas…
      </p>
    ),
  },
);

const RegalosSection = dynamic(
  () =>
    import("@/components/RegalosSection").then((m) => ({
      default: m.RegalosSection,
    })),
  {
    loading: () => (
      <p className="py-10 text-center text-sm text-na-muted">
        Cargando regalos…
      </p>
    ),
  },
);

type MainCategory = "libros" | "revistas" | "regalos";
type LibrosFormat = "impresos" | "digitales";

const MAIN_TABS: { id: MainCategory; label: string; hash: string }[] = [
  { id: "libros", label: "Libros", hash: "catalogo-impresos" },
  { id: "revistas", label: "Revistas", hash: "catalogo-revistas" },
  { id: "regalos", label: "Regalos", hash: "catalogo-regalos" },
];

const LIBROS_TABS: { id: LibrosFormat; label: string; hash: string }[] = [
  { id: "impresos", label: "Impresos", hash: "catalogo-impresos" },
  { id: "digitales", label: "Digitales", hash: "catalogo-digitales" },
];

function resolveView(parsedHash: string): {
  main: MainCategory;
  librosFormat: LibrosFormat;
} {
  const category = categoryFromEditorialHash(parsedHash);
  if (category === "digitales") {
    return { main: "libros", librosFormat: "digitales" };
  }
  if (category === "impresos") {
    return { main: "libros", librosFormat: "impresos" };
  }
  if (category === "revistas") {
    return { main: "revistas", librosFormat: "impresos" };
  }
  if (category === "regalos") {
    return { main: "regalos", librosFormat: "impresos" };
  }
  return { main: "libros", librosFormat: "impresos" };
}

type EditorialShopProps = {
  section: string;
};

export function EditorialShop({ section }: EditorialShopProps) {
  const parsedSection = section.replace(/^#/, "");
  const viewOptions = catalogViewOptions(parsedSection);
  const initial = resolveView(parsedSection);
  const [mainCategory, setMainCategory] = useState<MainCategory>(initial.main);
  const [librosFormat, setLibrosFormat] = useState<LibrosFormat>(
    initial.librosFormat,
  );

  useEffect(() => {
    const next = resolveView(parsedSection);
    setMainCategory(next.main);
    setLibrosFormat(next.librosFormat);
  }, [parsedSection]);

  const selectMain = useCallback(
    (tab: (typeof MAIN_TABS)[number]) => {
      setMainCategory(tab.id);
      if (tab.id === "libros") {
        const formatHash =
          librosFormat === "digitales"
            ? "catalogo-digitales"
            : "catalogo-impresos";
        navigateEditorialSection(formatHash);
        return;
      }
      navigateEditorialSection(tab.hash);
    },
    [librosFormat],
  );

  const selectLibrosFormat = useCallback(
    (tab: (typeof LIBROS_TABS)[number]) => {
      setMainCategory("libros");
      setLibrosFormat(tab.id);
      navigateEditorialSection(tab.hash);
    },
    [],
  );

  const activeContentHash =
    mainCategory === "libros"
      ? EDITORIAL_CATEGORY_HASH[librosFormat]
      : EDITORIAL_CATEGORY_HASH[mainCategory as ShopCategory];

  return (
    <div
      className="editorial-catalog mx-auto max-w-6xl scroll-mt-[var(--editorial-header-offset,7.5rem)] px-4 pb-10 pt-2 sm:px-6"
      id="catalogo"
    >
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-editorialDark">
        Catálogo
      </p>
      <h2 className="mt-2 text-2xl font-black text-na-ink sm:text-3xl">
        Explorar la tienda
      </h2>

      <nav
        className="mt-5 flex gap-2 overflow-x-auto pb-1"
        aria-label="Categorías del catálogo"
      >
        {MAIN_TABS.map((tab) => {
          const active = mainCategory === tab.id;
          const Icon =
            tab.id === "libros"
              ? BookOpen
              : tab.id === "revistas"
                ? Newspaper
                : Gift;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectMain(tab)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-na-editorial text-white shadow-md shadow-na-editorial/25"
                  : "bg-white text-na-muted ring-1 ring-na-editorial/15 hover:ring-na-editorial/35"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {mainCategory === "libros" ? (
        <nav
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          aria-label="Formato de libros"
        >
          {LIBROS_TABS.map((tab) => {
            const active = librosFormat === tab.id;
            const Icon = tab.id === "impresos" ? BookOpen : Download;
            const hint =
              tab.id === "digitales"
                ? `${DIGITAL_BOOK_COUNT} títulos`
                : undefined;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectLibrosFormat(tab)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-na-editorialDark text-white shadow-sm"
                    : "bg-white text-na-muted ring-1 ring-na-editorial/12 hover:ring-na-editorial/30"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {tab.label}
                {hint && !active ? (
                  <span className="text-[10px] font-normal opacity-70">
                    {hint}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      ) : null}

      <div id={activeContentHash} className="mt-5 scroll-mt-24">
        {mainCategory === "libros" && librosFormat === "impresos" ? (
          <EditorialCatalog embedded initialArea={viewOptions.bookArea} />
        ) : null}
        {mainCategory === "libros" && librosFormat === "digitales" ? (
          <DigitalBooksSection />
        ) : null}
        {mainCategory === "revistas" ? <RevistasSection /> : null}
        {mainCategory === "regalos" ? (
          <RegalosSection initialFilter={viewOptions.regaloFilter ?? "all"} />
        ) : null}
      </div>
    </div>
  );
}
