"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MessageCircle, X } from "lucide-react";
import type { RegaloItem } from "@/lib/editorial-extras";
import { regaloToCartItem, formatCartMoney } from "@/lib/cart";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type RegaloDetailDialogProps = {
  item: RegaloItem;
  open: boolean;
  onClose: () => void;
  resolveImage: (url: string) => string;
  whatsAppHref: string;
};

function detailImageLayout(item: RegaloItem) {
  if (item.category === "separadores") {
    return {
      box: "relative mx-auto aspect-[5/12] w-[14rem] shrink-0 overflow-hidden rounded-xl bg-neutral-50 shadow-lg sm:w-[16rem] md:w-[18rem]",
      imageClass: "object-contain p-1",
      sizes: "(max-width: 640px) 224px, 288px",
    };
  }
  if (item.id === "resaltador-ideas") {
    return {
      box: "relative mx-auto aspect-[3/4] w-[calc(14rem+10px)] shrink-0 overflow-hidden rounded-xl bg-transparent shadow-lg sm:w-[calc(18rem+10px)] lg:w-[calc(20rem+10px)]",
      imageClass: "object-contain object-center p-3 sm:p-4",
      sizes: "(max-width: 640px) 234px, 330px",
    };
  }
  if (item.id === "memorion") {
    return {
      box: "relative mx-auto aspect-[3/4] w-[14rem] shrink-0 overflow-hidden rounded-xl bg-white shadow-lg sm:w-[16rem] md:w-[18rem]",
      imageClass: "object-contain p-4",
      sizes: "(max-width: 640px) 224px, 288px",
    };
  }
  if (item.id === "lapiceros-virtudes") {
    return {
      box: "relative mx-auto aspect-[3/2] w-full max-w-[32rem] overflow-hidden rounded-xl bg-neutral-100 shadow-lg",
      imageClass: "object-contain object-center p-2 sm:p-3",
      sizes: "(max-width: 640px) 100vw, 512px",
    };
  }
  if (item.category === "libretas") {
    return {
      box: "relative mx-auto aspect-[779/922] w-[14rem] shrink-0 overflow-hidden rounded-xl bg-neutral-50 shadow-lg sm:w-[16rem] md:w-[17rem]",
      imageClass: "object-contain object-center p-0.5",
      sizes: "(max-width: 640px) 224px, 272px",
    };
  }
  if (item.category === "camisetas") {
    return {
      box: "relative mx-auto aspect-square w-[16rem] shrink-0 overflow-hidden rounded-xl bg-neutral-50 shadow-lg sm:w-[20rem] md:w-[24rem]",
      imageClass: "object-contain object-center p-2",
      sizes: "(max-width: 640px) 256px, 384px",
    };
  }
  return {
    box: "relative mx-auto aspect-[3/4] w-[14rem] shrink-0 overflow-hidden rounded-xl bg-white shadow-lg sm:w-72 lg:w-80",
    imageClass: "object-contain p-3",
    sizes: "(max-width: 640px) 224px, 320px",
  };
}

function pickDetailImage(item: RegaloItem, showBack: boolean): string {
  if (showBack && item.backImageUrl?.trim()) return item.backImageUrl.trim();
  return item.detailImageUrl?.trim() || item.imageUrl?.trim() || "";
}

export function RegaloDetailDialog({
  item,
  open,
  onClose,
  resolveImage,
  whatsAppHref,
}: RegaloDetailDialogProps) {
  const [showBack, setShowBack] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const layout = detailImageLayout(item);

  useEffect(() => {
    if (!open) return;
    setShowBack(false);
    setImageFailed(false);
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const isSeparador = item.category === "separadores";
  const preferredImage = pickDetailImage(item, showBack);
  const fallbackImage = item.imageUrl?.trim() || "";
  const imageSrc = resolveImage(
    imageFailed && preferredImage !== fallbackImage
      ? fallbackImage
      : preferredImage,
  );
  const imageAlt =
    showBack && item.backImageUrl
      ? `${item.title} — reverso`
      : item.title;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="regalo-detail-title"
      onClick={onClose}
    >
      <div
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-na-editorial/15 bg-white shadow-2xl ${
          isSeparador ? "max-w-xl sm:max-w-2xl" : "max-w-4xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-na-muted transition hover:bg-na-editorial/10 hover:text-na-ink"
          aria-label="Cerrar detalle"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-na-editorial">
            Detalle del producto
          </p>

          <div
            className={`mt-4 flex flex-col gap-6 sm:flex-row ${
              isSeparador ? "sm:items-start sm:gap-6" : "sm:gap-8"
            }`}
          >
            <div
              className={`flex w-full shrink-0 flex-col items-center sm:items-start ${
                item.id === "lapiceros-virtudes" ? "sm:max-w-[32rem]" : "sm:w-auto"
              }`}
            >
              {imageSrc ? (
              <div className={layout.box}>
                {item.sample ? (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-na-editorial/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Ejemplo
                  </span>
                ) : null}
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className={layout.imageClass}
                  sizes={layout.sizes}
                  unoptimized
                  priority
                  onError={() => {
                    if (!imageFailed && fallbackImage && preferredImage !== fallbackImage) {
                      setImageFailed(true);
                    }
                  }}
                />
              </div>
              ) : null}
              {item.backImageUrl ? (
                <div className="mt-4 flex justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setShowBack(false)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      !showBack
                        ? "bg-na-editorial text-white"
                        : "bg-white text-na-muted ring-1 ring-na-editorial/20"
                    }`}
                  >
                    Frente
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBack(true)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      showBack
                        ? "bg-na-editorial text-white"
                        : "bg-white text-na-muted ring-1 ring-na-editorial/20"
                    }`}
                  >
                    Reverso
                  </button>
                </div>
              ) : null}
            </div>

            <div
              className={`min-w-0 flex-1 sm:py-1 ${
                isSeparador ? "sm:max-w-[15rem]" : ""
              }`}
            >
              <h3
                id="regalo-detail-title"
                className={`pr-10 font-bold text-na-ink ${
                  isSeparador
                    ? "text-lg leading-snug sm:text-xl"
                    : "text-xl sm:text-2xl"
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`mt-3 leading-relaxed text-na-muted ${
                  isSeparador ? "text-sm" : "text-sm sm:text-base"
                }`}
              >
                {item.description}
              </p>

              {item.quote ? (
                <blockquote
                  className={`mt-4 rounded-xl border border-na-heket/20 bg-na-heket/[0.04] px-4 py-3 text-sm italic leading-relaxed text-na-ink ${
                    isSeparador ? "max-w-none" : ""
                  }`}
                >
                  «{item.quote}»
                  {item.author ? (
                    <footer className="mt-2 not-italic text-xs font-semibold text-na-muted">
                      — {item.author}
                    </footer>
                  ) : null}
                </blockquote>
              ) : null}

              {item.price != null && item.price > 0 ? (
                <p className="mt-4 text-lg font-bold text-na-editorialDark">
                  {formatCartMoney(item.price, item.currency ?? "DOP")}
                </p>
              ) : item.priceNote ? (
                <p className="mt-4 text-lg font-bold text-na-editorialDark">
                  {item.priceNote}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <AddToCartButton
                  item={regaloToCartItem(item)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-na-editorial px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-editorialDark sm:min-w-[10rem]"
                />
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-na-heket/30 bg-na-heket/5 px-5 py-2.5 text-sm font-bold text-na-heket transition hover:bg-na-heket hover:text-white sm:min-w-[10rem]"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
