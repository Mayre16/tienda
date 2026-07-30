"use client";

import Image from "next/image";
import { assetUrl } from "@/lib/asset-url";

/** Bust caché del navegador tras corregir la S truncada en el PNG. */
const LOGO_ASSET_VERSION = "20260728s";

/** Identificador horizontal Editorial (footer y uso general). */
export const EDITORIAL_SUBMARCA_LOGO = {
  src: `/brand/identificadores/editorial-identificador.webp?v=${LOGO_ASSET_VERSION}`,
  fallback: `/brand/identificadores/editorial-identificador.png?v=${LOGO_ASSET_VERSION}`,
  alt: "Librería Editorial Logos — Nueva Acrópolis",
  width: 2404,
  height: 414,
} as const;

/** Identificador integrado para header (banner recortado en editorial-logos.png). */
export const EDITORIAL_HEADER_SUBMARCA_LOGO = {
  src: `/brand/identificadores/editorial-identificador-header.webp?v=${LOGO_ASSET_VERSION}`,
  fallback: `/brand/identificadores/editorial-identificador-header.png?v=${LOGO_ASSET_VERSION}`,
  alt: EDITORIAL_SUBMARCA_LOGO.alt,
  width: 2404,
  height: 414,
} as const;

export const EDITORIAL_MARK_ASPECT =
  EDITORIAL_SUBMARCA_LOGO.width / EDITORIAL_SUBMARCA_LOGO.height;

export const EDITORIAL_HEADER_MARK_ASPECT =
  EDITORIAL_HEADER_SUBMARCA_LOGO.width / EDITORIAL_HEADER_SUBMARCA_LOGO.height;

const MD_HEIGHT_REM = 3.25;
const SM_HEIGHT_REM = 2.35;
const MD_WIDTH_REM = EDITORIAL_MARK_ASPECT * MD_HEIGHT_REM;
const SM_WIDTH_REM = EDITORIAL_MARK_ASPECT * SM_HEIGHT_REM;

const EDITORIAL_MARK_STYLE_MD = {
  height: `${MD_HEIGHT_REM}rem`,
  width: `${MD_WIDTH_REM}rem`,
  minHeight: `${MD_HEIGHT_REM}rem`,
  minWidth: `${MD_WIDTH_REM}rem`,
  maxHeight: `${MD_HEIGHT_REM}rem`,
  maxWidth: `${MD_WIDTH_REM}rem`,
} as const;

const EDITORIAL_MARK_STYLE_SM = {
  height: `${SM_HEIGHT_REM}rem`,
  width: `${SM_WIDTH_REM}rem`,
  minHeight: `${SM_HEIGHT_REM}rem`,
  minWidth: `${SM_WIDTH_REM}rem`,
  maxHeight: `${SM_HEIGHT_REM}rem`,
  maxWidth: `${SM_WIDTH_REM}rem`,
} as const;

type EditorialBrandMarkProps = {
  className?: string;
  priority?: boolean;
  /** sm = compacto · md = default · lg = header integrado */
  size?: "sm" | "md" | "lg";
};

/** Identificador horizontal Editorial Logos. */
export function EditorialBrandMark({
  className = "",
  priority = false,
  size = "md",
}: EditorialBrandMarkProps) {
  const logo =
    size === "lg" ? EDITORIAL_HEADER_SUBMARCA_LOGO : EDITORIAL_SUBMARCA_LOGO;

  const sizeClass =
    size === "lg"
      ? "editorial-brand-mark--lg"
      : size === "sm"
        ? "editorial-brand-mark--sm"
        : "editorial-brand-mark--md";

  const style =
    size === "lg"
      ? undefined
      : size === "sm"
        ? EDITORIAL_MARK_STYLE_SM
        : EDITORIAL_MARK_STYLE_MD;

  return (
    <Image
      src={assetUrl(logo.src)}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      priority={priority}
      unoptimized
      className={`editorial-brand-mark block shrink-0 ${
        size === "lg" ? "h-full w-full" : "object-contain object-left"
      } ${sizeClass} ${className}`.trim()}
      style={style}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        const fallback =
          size === "lg"
            ? EDITORIAL_HEADER_SUBMARCA_LOGO.fallback
            : EDITORIAL_SUBMARCA_LOGO.fallback;
        if (!img.src.includes(fallback.split("/").pop()!)) {
          img.src = assetUrl(fallback);
        }
      }}
    />
  );
}
