import { cn } from "@/lib/utils/cn";

import type { BrandLockupId, BrandLogoVariant } from "@/lib/brand-assets";

import { brandLogoHeightClass } from "@/lib/brand-clear-space";

import { BrandLogo } from "@/components/BrandLogo";



export const NA_BRAND_LOCKUP_SIZES = {

  headerFilial: brandLogoHeightClass.headerFilial,

  hero: brandLogoHeightClass.hero,

  footer: brandLogoHeightClass.footer,

  footerOinadom: brandLogoHeightClass.footerOinadom,

  footerSubmarca: brandLogoHeightClass.footerSubmarca,

  footerInstitutional: brandLogoHeightClass.footerInstitutional,

  sectionStacked: brandLogoHeightClass.sectionStacked,

  quienesSomos: brandLogoHeightClass.quienesSomos,

  contenidoHub: brandLogoHeightClass.contenidoHub,

  contentDigital: brandLogoHeightClass.contentDigital,

  internationalBand: brandLogoHeightClass.internationalBand,

  pageHero: brandLogoHeightClass.pageHero,

  pageHeroTrilogo: brandLogoHeightClass.pageHeroTrilogo,

  diplomadoHero: brandLogoHeightClass.diplomadoHero,

} as const;



export type NaBrandLockupSize = keyof typeof NA_BRAND_LOCKUP_SIZES;



type NaBrandLockupGroupProps = {

  lockup: BrandLockupId;

  size?: NaBrandLockupSize;

  variant?: BrandLogoVariant;

  align?: "start" | "center";

  descriptorProminence?: "default" | "hero";

  className?: string;

  maxWidthClass?: string;

  priority?: boolean;

  render?: "auto" | "hybrid" | "raster";

  descriptorClassName?: string;

};



export function NaBrandLockupGroup({

  lockup,

  size = "sectionStacked",

  variant = "color",

  align = "center",

  descriptorProminence = "default",

  className,

  maxWidthClass,

  priority,

  render,

  descriptorClassName,

}: NaBrandLockupGroupProps) {

  return (

    <BrandLogo

      lockup={lockup}

      variant={variant}

      align={align}

      descriptorProminence={descriptorProminence}

      priority={priority}

      render={render}

      className={cn(NA_BRAND_LOCKUP_SIZES[size], className)}

      maxWidthClass={maxWidthClass}

      descriptorClassName={descriptorClassName}

    />

  );

}

