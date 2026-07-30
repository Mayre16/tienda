import {
  NaBrandLockupGroup,
  type NaBrandLockupSize,
} from "@/components/NaBrandLockupGroup";
import { BRAND_LOCKUPS, type BrandLockupId } from "@/lib/brand-assets";

const CONFIG = {
  footer: {
    lockup: "oinadom" satisfies BrandLockupId,
  },
  section: {
    lockup: "na" satisfies BrandLockupId,
    size: "quienesSomos" satisfies NaBrandLockupSize,
    render: "raster" as const,
    maxWidthClass: "max-w-[min(92vw,10.5rem)]",
  },
  content: {
    lockup: "na" satisfies BrandLockupId,
    size: "quienesSomos" satisfies NaBrandLockupSize,
    render: "raster" as const,
    maxWidthClass: "max-w-[min(92vw,10.5rem)]",
  },
} as const;

type EditorialNaSectionLogoProps = {
  /** footer → oinadom raster (logo-oinadom.webp, un solo archivo) · section/content → na. */
  size?: keyof typeof CONFIG;
  variant?: "color" | "white";
  align?: "left" | "center";
};

/** Lockup NA en Editorial — raster aprobado (descriptor integrado en la imagen). */
export function EditorialNaSectionLogo({
  size = "section",
  variant = "color",
  align = "center",
}: EditorialNaSectionLogoProps) {
  if (size === "footer") {
    const asset = BRAND_LOCKUPS.oinadom;
    const src = variant === "white" ? asset.webpWhite : asset.webp;
    return (
      <img
        src={src}
        alt={asset.alt}
        className="editorial-footer__oinadom-img"
        decoding="async"
      />
    );
  }

  const config = CONFIG[size];

  return (
    <NaBrandLockupGroup
      lockup={config.lockup}
      size={config.size}
      variant={variant}
      align={align === "center" ? "center" : "start"}
      render={"render" in config ? config.render : undefined}
      maxWidthClass={"maxWidthClass" in config ? config.maxWidthClass : undefined}
    />
  );
}
