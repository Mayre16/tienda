"use client";

import { EditorialDondeEstamosSection } from "@/components/EditorialDondeEstamosSection";
import { EditorialHomeCatalogExplore } from "@/components/EditorialHomeCatalogExplore";
import { EditorialHomeProductShelves } from "@/components/EditorialHomeProductShelves";
import { EditorialWelcomeHero } from "@/components/EditorialWelcomeHero";

export function EditorialHomeHub() {
  return (
    <>
      <EditorialWelcomeHero />
      <EditorialHomeProductShelves />
      <EditorialHomeCatalogExplore />
      <EditorialDondeEstamosSection />
    </>
  );
}
