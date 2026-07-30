"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { preferWebpAssetUrl } from "@/lib/media-assets";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { assetUrl } from "@/lib/asset-url";
import { type RegaloItem } from "@/lib/editorial-extras";
import { useEditorialConfig } from "@/lib/editorial-config";
import { useEditorialMemorion } from "@/lib/cms/hooks";
import type { CmsEditorialRegalo } from "@/lib/cms/types";
import { EditorialEditPencil } from "@/components/cms/CmsEditFields";
import { useEditorialCmsEdit } from "@/components/cms/EditorialCmsEditContext";
import { regaloToCartItem, formatCartMoney } from "@/lib/cart";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { RegaloDetailDialog } from "@/components/RegaloDetailDialog";
import {
  navigateEditorialHash,
  regaloFilterToHash,
} from "@/lib/editorial-navigation";
import { WHATSAPP_URL } from "@/lib/site-config";

function resolveRegaloImage(url: string): string {
  if (!url) return url;
  const resolved = resolveCmsMediaUrl(url) ?? url;
  if (resolved.startsWith("http") || resolved.startsWith("data:")) {
    return preferWebpAssetUrl(resolved);
  }
  return preferWebpAssetUrl(assetUrl(resolved));
}

function buildRegaloWhatsApp(item: RegaloItem): string {
  const lines = [
    "Hola, me interesa este artículo de Editorial Logos:",
    "",
    item.title,
    item.quote ? `"${item.quote}"` : "",
    item.author ? `— ${item.author}` : "",
  ].filter(Boolean);
  return `${WHATSAPP_URL}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function cmsRegaloToItem(item: CmsEditorialRegalo): RegaloItem {
  return {
    id: item.id,
    category: (item.category ?? "papeleria") as RegaloItem["category"],
    title: item.title ?? "",
    description: item.description ?? "",
    quote: item.quote,
    author: item.author,
    imageUrl: item.imageUrl ?? "",
    detailImageUrl: item.detailImageUrl,
    backImageUrl: item.backImageUrl,
    price: item.price ?? undefined,
    currency: item.currency,
    priceNote: item.priceNote,
    sample: item.sample,
  };
}

function RegaloCardImage({
  item,
  showBack,
  imageBoxClass,
  imagePad,
  imageSizes,
}: {
  item: RegaloItem;
  showBack: boolean;
  imageBoxClass: string;
  imagePad: string;
  imageSizes: string;
}) {
  const isLibreta = item.category === "libretas";
  return (
    <div className={`${imageBoxClass} [perspective:1400px]`}>
      {item.backImageUrl ? (
        <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)]">
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <Image
              src={resolveRegaloImage(item.imageUrl)}
              alt={item.title}
              fill
              className={imagePad}
              sizes={imageSizes}
              unoptimized
            />
          </div>
          <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
            {showBack ? (
              <Image
                src={resolveRegaloImage(item.backImageUrl)}
                alt={`${item.title} — reverso`}
                fill
                className={imagePad}
                sizes={imageSizes}
                unoptimized
                loading="lazy"
              />
            ) : null}
          </div>
        </div>
      ) : (
        <Image
          src={resolveRegaloImage(item.imageUrl)}
          alt={item.title}
          fill
          className={imagePad}
          sizes={imageSizes}
          unoptimized
        />
      )}
      {item.sample ? (
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-na-editorial/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Ejemplo
        </span>
      ) : null}
      {item.backImageUrl ? (
        <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-na-editorialDark shadow-sm transition-opacity duration-300 group-hover:opacity-0">
          Pasa el cursor ↻
        </span>
      ) : null}
    </div>
  );
}

function RegaloCard({
  item,
  onEdit,
}: {
  item: RegaloItem;
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const isSeparador = item.category === "separadores";
  const isLibreta = item.category === "libretas";
  const isPapeleria = item.category === "papeleria";
  const isResaltador = item.id === "resaltador-ideas";
  const isLapiceros = item.id === "lapiceros-virtudes";
  const imageBoxClass = isSeparador
    ? "relative aspect-[5/12] bg-neutral-50"
    : isLibreta
      ? "relative aspect-[779/922] bg-neutral-50"
      : item.category === "camisetas"
        ? "relative aspect-square"
        : isPapeleria
          ? "relative h-32 bg-neutral-50 sm:h-36"
          : isLapiceros
            ? "relative aspect-[3/2] bg-neutral-100"
            : isResaltador
              ? "relative aspect-square bg-transparent"
              : "relative aspect-[3/4]";
  const imagePad = isSeparador
    ? "object-contain object-center p-2"
    : isLibreta
      ? item.id === "libreta-escribir"
        ? "object-contain object-center p-0.5 pl-2"
        : "object-contain object-center p-0.5"
      : isLapiceros
        ? "object-contain object-center p-2"
        : isResaltador
          ? "object-contain object-center p-2"
          : "object-contain p-2";
  const imageSizes = isSeparador
    ? "(max-width: 768px) 45vw, 180px"
    : "(max-width: 768px) 50vw, 25vw";

  const titleText = isSeparador
    ? item.title.replace(/^Separador · /, "")
    : item.title;

  function openDetail() {
    setOpen(true);
  }

  if (isSeparador) {
    return (
      <>
        <div className="relative">
          {onEdit ? (
            <EditorialEditPencil label={`Editar ${item.title}`} onClick={onEdit} />
          ) : null}
        <button
          type="button"
          onClick={openDetail}
          onMouseEnter={() => setShowBack(true)}
          onFocus={() => setShowBack(true)}
          className="group w-full overflow-hidden rounded-2xl border border-na-editorial/10 bg-white text-left shadow-na-soft transition hover:-translate-y-0.5 hover:border-na-editorial/25 hover:shadow-na-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-editorial"
        >
          <RegaloCardImage
            item={item}
            showBack={showBack}
            imageBoxClass={imageBoxClass}
            imagePad={imagePad}
            imageSizes={imageSizes}
          />
          <div className="space-y-1 p-3">
            <h4 className="line-clamp-2 text-xs font-bold leading-snug text-na-ink">
              {titleText}
            </h4>
            {item.price != null && item.price > 0 ? (
              <p className="text-[11px] font-semibold text-na-editorialDark">
                {formatCartMoney(item.price, item.currency ?? "DOP")}
              </p>
            ) : item.priceNote ? (
              <p className="text-[11px] font-semibold text-na-editorialDark">
                {item.priceNote}
              </p>
            ) : null}
            <p className="pt-1 text-[11px] font-semibold text-na-editorial">
              Ver detalle →
            </p>
          </div>
        </button>
        </div>
        <RegaloDetailDialog
          item={item}
          open={open}
          onClose={() => setOpen(false)}
          resolveImage={resolveRegaloImage}
          whatsAppHref={buildRegaloWhatsApp(item)}
        />
      </>
    );
  }

  return (
    <>
      <article className="relative group overflow-hidden rounded-2xl border border-na-editorial/10 bg-white shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card">
        {onEdit ? (
          <EditorialEditPencil label={`Editar ${item.title}`} onClick={onEdit} />
        ) : null}
        <button
          type="button"
          onClick={openDetail}
          onMouseEnter={() => item.backImageUrl && setShowBack(true)}
          onFocus={() => item.backImageUrl && setShowBack(true)}
          className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-editorial"
        >
          <RegaloCardImage
            item={item}
            showBack={showBack}
            imageBoxClass={imageBoxClass}
            imagePad={imagePad}
            imageSizes={imageSizes}
          />
        </button>
        <div className="px-3 pb-3 pt-2">
          <button
            type="button"
            onClick={openDetail}
            className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-editorial"
          >
            <h4 className="text-sm font-bold leading-snug text-na-ink">{titleText}</h4>
          </button>
          {item.price != null && item.price > 0 ? (
            <p className="mt-1 text-[11px] font-semibold text-na-editorialDark">
              {formatCartMoney(item.price, item.currency ?? "DOP")}
            </p>
          ) : item.priceNote ? (
            <p className="mt-1 text-[11px] font-semibold text-na-editorialDark">
              {item.priceNote}
            </p>
          ) : null}
          <button
            type="button"
            onClick={openDetail}
            className="mt-1 text-[11px] font-semibold text-na-editorial hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-editorial"
          >
            Ver detalle →
          </button>
          <div className="mt-2 space-y-1.5">
            <AddToCartButton
              item={regaloToCartItem(item)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-na-editorial px-3 py-1.5 text-xs font-bold text-white transition hover:bg-na-editorialDark"
            />
            <a
              href={buildRegaloWhatsApp(item)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-na-heket/30 bg-na-heket/5 px-3 py-1.5 text-xs font-bold text-na-heket transition hover:bg-na-heket hover:text-white"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </article>
      <RegaloDetailDialog
        item={item}
        open={open}
        onClose={() => setOpen(false)}
        resolveImage={resolveRegaloImage}
        whatsAppHref={buildRegaloWhatsApp(item)}
      />
    </>
  );
}

function MemorionBlock({
  item,
  onEdit,
}: {
  item: RegaloItem;
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article
        id="regalo-memorion"
        className="relative overflow-hidden rounded-2xl border border-na-editorial/10 bg-white shadow-na-soft sm:flex sm:max-w-2xl"
      >
        {onEdit ? (
          <EditorialEditPencil label="Editar Memorion" onClick={onEdit} />
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative aspect-[3/4] w-full shrink-0 bg-white text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-editorial sm:w-56 md:w-64"
        >
          <Image
            src={resolveRegaloImage(item.imageUrl)}
            alt="Memorion — juego de cartas de Editorial Nueva Acrópolis"
            fill
            className="object-contain p-3"
            sizes="(max-width: 640px) 100vw, 256px"
            unoptimized
          />
        </button>
        <div className="flex flex-col justify-center bg-gradient-to-br from-na-heket/5 to-na-editorial/5 p-5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-editorial"
          >
            <h3 className="font-bold text-na-ink">{item.title}</h3>
          </button>
          <p className="mt-2 text-sm leading-relaxed text-na-muted">
            {item.description}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-2 w-fit text-sm font-semibold text-na-editorial hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-na-editorial"
          >
            Ver detalle →
          </button>
          <a
            href={buildRegaloWhatsApp(item)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-na-editorial px-4 py-2 text-sm font-bold text-white transition hover:bg-na-editorialDark"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Consultar Memorion
          </a>
        </div>
      </article>
      <RegaloDetailDialog
        item={item}
        open={open}
        onClose={() => setOpen(false)}
        resolveImage={resolveRegaloImage}
        whatsAppHref={buildRegaloWhatsApp(item)}
      />
    </>
  );
}

type RegalosSectionProps = {
  /** Filtro inicial desde el hash (`all`, id de categoría o `memorion`). */
  initialFilter?: string;
};

export function RegalosSection({ initialFilter = "all" }: RegalosSectionProps) {
  const { regaloCategories, regalos } = useEditorialConfig();
  const memorionCms = useEditorialMemorion();
  const memorion = cmsRegaloToItem(memorionCms);
  const edit = useEditorialCmsEdit();
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  const filterPills = useMemo(
    () => [
      { id: "all", label: "Todos" },
      ...regaloCategories.map((c) => ({ id: c.id, label: c.label })),
      { id: "memorion", label: "Memorion" },
    ],
    [regaloCategories],
  );

  const visibleCategories = regaloCategories.filter((cat) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "memorion") return false;
    return cat.id === activeFilter;
  });

  const showMemorion = activeFilter === "all" || activeFilter === "memorion";

  const generalWhatsapp = `${WHATSAPP_URL}?text=${encodeURIComponent(
    "Hola, me interesa información sobre regalos y separadores de Editorial Logos.",
  )}`;

  function selectFilter(id: string) {
    setActiveFilter(id);
    navigateEditorialHash(regaloFilterToHash(id), { scroll: false });
  }

  return (
    <section id="regalos" className="scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-3xl text-sm leading-relaxed text-na-muted">
          Separadores, regalos filosóficos, libretas, camisetas, Editio y
          Memorion en un solo catálogo. Use los filtros para explorar por
          categoría.
        </p>
        {edit?.ready ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-na-editorial/25 px-3 py-1 text-xs font-semibold text-na-editorial"
              onClick={() => edit.setSelectedId("regalos:categories")}
            >
              Categorías
            </button>
            <button
              type="button"
              className="rounded-full border border-na-editorial/25 px-3 py-1 text-xs font-semibold text-na-editorial"
              onClick={() => edit.setSelectedId("regalos:manage")}
            >
              Productos
            </button>
          </div>
        ) : null}
      </div>

      <nav
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Filtrar regalos por categoría"
      >
        {filterPills.map((pill) => {
          const active = activeFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => selectFilter(pill.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-na-editorial text-white shadow-md shadow-na-editorial/25"
                  : "bg-white text-na-muted ring-1 ring-na-editorial/15 hover:ring-na-editorial/35"
              }`}
              aria-pressed={active}
            >
              {pill.label}
            </button>
          );
        })}
      </nav>

      {activeFilter !== "memorion" ? (
        <div className="mt-10 space-y-12">
          {visibleCategories.map((cat) => {
            const items = regalos.filter((item) => item.category === cat.id);
            if (items.length === 0 && !edit?.ready) return null;
            const gridClass =
              cat.id === "separadores"
                ? "mt-5 grid items-start gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
                : "mt-5 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
            return (
              <div key={cat.id} id={`regalo-${cat.id}`}>
                <h3 className="text-xl font-bold text-na-ink">{cat.label}</h3>
                <p className="mt-1 text-sm text-na-muted">{cat.description}</p>
                {items.length === 0 ? (
                  <p className="mt-4 text-sm text-na-muted">
                    Sin productos en esta categoría.
                    {edit?.ready ? (
                      <>
                        {" "}
                        <button
                          type="button"
                          className="font-semibold text-na-editorial"
                          onClick={() =>
                            edit.setSelectedId(`regalos:add:${cat.id}`)
                          }
                        >
                          Añadir producto
                        </button>
                      </>
                    ) : null}
                  </p>
                ) : (
                  <div className={gridClass}>
                    {items.map((item) => (
                      <RegaloCard
                        key={item.id}
                        item={item}
                        onEdit={
                          edit?.ready
                            ? () => edit.setSelectedId(`regalo:${item.id}`)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {showMemorion ? (
        <div className={activeFilter === "memorion" ? "mt-6" : "mt-10"}>
          <MemorionBlock
            item={memorion}
            onEdit={
              edit?.ready ? () => edit.setSelectedId("regalo:memorion") : undefined
            }
          />
        </div>
      ) : null}

      <div className="mt-8">
        <a
          href={generalWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-na-editorial px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-editorialDark"
        >
          Consultar todos los regalos por WhatsApp
        </a>
      </div>
    </section>
  );
}
