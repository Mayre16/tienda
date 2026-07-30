"use client";

import { EditorialDondeEstamosSection } from "@/components/EditorialDondeEstamosSection";
import { EditorialHomeCatalogExplore } from "@/components/EditorialHomeCatalogExplore";
import { EditorialWelcomeHero } from "@/components/EditorialWelcomeHero";

export function EditorialHomeHub() {
  return (
    <>
      <EditorialWelcomeHero />
      <EditorialHomeCatalogExplore />
      <EditorialDondeEstamosSection />
    </>
  );
}
